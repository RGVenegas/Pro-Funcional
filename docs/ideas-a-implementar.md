# 💡 Propuestas de Ideas e Implementaciones Futuras — ProFuncional

Este documento consolida las propuestas arquitectónicas y de desarrollo pendientes de revisión y aprobación por el equipo para las siguientes fases del proyecto **ProFuncional**.

---

## 📄 Idea 1: Arquitectura Offline-First y Sincronización Automática (Sync Queue)

### 🎯 Objetivo
Garantizar que la aplicación continúe funcionando con total normalidad y sin pérdida de datos ante cortes de internet o fallas temporales de conexión con la base de datos en la nube (**Supabase**).

### 🛠️ Detalles del Funcionamiento
1. **Modo Normal (Online):** 
   - Las operaciones (usuarios, reservas, fichas clínicas) se envían directamente al Backend (NestJS) y se persisten en tiempo real en Supabase.
2. **Modo Offline (Sin Conexión):**
   - La aplicación no arroja errores ni se bloquea.
   - Las acciones se guardan en el almacenamiento local del dispositivo (**IndexedDB**).
   - Se registra una **Cola de Transacciones Pendientes (Sync Queue)** ordenada cronológicamente (creación de perfil, asignación de paquetes, agendamiento/reagendamiento, fichas clínicas).
3. **Sincronización Automática (Push a Supabase):**
   - Al restablecer la conexión a internet, un servicio en segundo plano envía las transacciones pendientes en lote (*batch*) a Supabase.

### 🔒 Integridad de Datos
- **Atomicidad (Todo o Nada):** Si una transacción falla a la mitad, Supabase realiza un *Rollback* automático.
- **Sin duplicados (UUIDs + UPSERT):** Los registros se identifican por UUIDs únicos universales generados en el cliente. Si una instrucción ya existía en la nube, se ejecuta un *UPSERT* (*Update or Insert*) en lugar de clonar el dato.

---

## 📄 Idea 2: Aplicación Móvil Nativa (iOS & Android) Exclusiva para Pacientes

### 🎯 Objetivo
Empaquetar y distribuir la aplicación responsiva en las tiendas **App Store (Apple iOS)** y **Google Play Store (Android)** como una aplicación nativa descargable, orientada **exclusivamente a Pacientes y Alumnos**.

### 👥 Separación de Alcance por Perfiles y Dispositivos
- **Programa de Escritorio (PC):** Uso exclusivo para **Staff, Kinesiólogos, Coaches y Administradores** (gestión de bloques, parrilla de citas, marcado de asistencia, formulación de notas SOAP kinésicas en pantalla grande).
- **App Móvil (Celulares iOS & Android):** Uso exclusivo para **Pacientes y Alumnos**:
  - Registro e inicio de sesión autónomo.
  - Consulta de catálogo de clases, boxes kinésicos y saldo de paquetes.
  - Agendamiento, reagendamiento y cancelación con regla de 24 horas.
  - Visualización de la evolución física con gráficos interactivos (Dolor EVA 1-10 y Movilidad ROM °).
  - Credencial digital QR in-app.
  - Banner interactivo de confirmación de asistencia.
  *Nota: Si un usuario con rol de Administrador o Kinesiólogo intenta iniciar sesión en la App Móvil, se le indicará amigablemente que las herramientas administrativas se gestionan desde el programa de escritorio PC.*

### ⚙️ Proceso de Compilación Nativa con Capacitor
Al estar el frontend desarrollado en **React 18 + Vite**, se empaquetará nativamente con **Capacitor (Ionic)**:

```bash
# 1. Inicialización de herramientas nativas
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init ProFuncional com.profuncional.app

# 2. Generación de ejecutable Android (.aab / .apk para Google Play Store)
npx cap add android
npx cap open android   # Compilación en Android Studio

# 3. Generación de ejecutable iOS (.ipa para Apple App Store)
npx cap add ios
npx cap open ios       # Compilación en Xcode (macOS)
```

---

## 📋 Estado del Documento y de las Implementaciones

* **Idea 1 — Arquitectura Offline-First y Sincronización Automática:**
  - **Estado:** ✅ **IMPLEMENTADO EN EL CÓDIGO** — *Pendiente de revisión y pruebas finales por parte del equipo.*
  - **Archivos creados/modificados:** `src/app/data/offlineQueue.ts`, `src/app/data/api.ts`, `src/app/data/operations.ts`, `src/app/components/OfflineStatusBanner.tsx`, `src/app/App.tsx`.

* **Idea 2 — Aplicación Móvil Nativa (iOS & Android) con Capacitor:**
  - **Estado:** 💡 *Propuesta técnica documentada — Pendiente de compilación para tiendas.*

