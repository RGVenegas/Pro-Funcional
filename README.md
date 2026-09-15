# ProFuncional — Sistema de Gestión Kinésico-Deportiva

Ecosistema digital compuesto por un **Programa de Escritorio/PC** para la administración, kinesiólogos y entrenadores del centro, y una **App Móvil Nativa (iOS & Android)** para pacientes y alumnos. Conecta la kinesiología y la rehabilitación con el entrenamiento funcional, gestionando citas, fichas clínicas evolutivas (SOAP, EVA, ROM), reglas de 24h de límite de tiempo, avisos de asistencia in-app y control de saldo de paquetes.

---

## 🛠️ Arquitectura y Tecnologías

### 💻 Frontend (Programa PC & App Móvil)
- **Framework & Lenguaje**: React 18 + TypeScript
- **Bundler & Tooling**: Vite 6
- **Estilos & Branding**: Tailwind CSS v4 (Identidad Verde Limón `#00E676` / `#00B4D8`) + Radix UI + Lucide Icons
- **Gráficos & Métricas**: Recharts (Curvas de dolor EVA 1-10 y movilidad ROM °) + Motion (Framer Motion)
- **Componentes**: React Hook Form, Date-fns, Sonner, QRCode.react, Canvas Confetti

### ⚙️ Backend (API REST & Servidor)
- **Framework**: NestJS (Node.js / TypeScript)
- **Base de Datos & Auth**: PostgreSQL administrado vía **Supabase** (Supabase Auth / Prisma ORM)
- **Pasarela de Pagos**: Webpay Plus (Transbank) / MercadoPago API
- **Arquitectura de Negocio**: Transacciones serializadas anti-concurrencia para reserva y descuento unificado de sesiones.

---

## 🚀 Guía de Instalación y Ejecución

### 1. Iniciar la Aplicación Frontend (Programa PC & App Móvil UI)

```bash
# 1. Instalar dependencias del frontend
npm install

# 2. Iniciar servidor de desarrollo (Vite)
npm run dev

# 3. Compilar bundle de producción
npm run build
```

---

### 2. Iniciar el Servidor Backend API (NestJS)

```bash
# 1. Ingresar a la carpeta backend
cd backend

# 2. Instalar dependencias del backend
npm install

# 3. Iniciar el servidor NestJS en desarrollo
npx nest start --watch

# 4. Compilar producción NestJS
npx nest build
```

> **Nota:** El servidor API NestJS correrá localmente en **http://localhost:3000** con documentación Swagger interactiva disponible en **http://localhost:3000/api**.

---

### 3. Cómo Probar la App Móvil (Vista Celular)

La aplicación cuenta con una interfaz **Mobile-First 100% Responsiva**. Puedes probar la experiencia móvil de 2 formas:

#### Opción A: Modo Celular en el Navegador PC (Emulación Rápida)
1. Abre **http://localhost:5173** en Chrome o Edge.
2. Presiona **`F12`** (o Clic Derecho $\rightarrow$ *Inspeccionar*).
3. Presiona **`Ctrl + Shift + M`** (o haz clic en el icono de celular/tablet en las Herramientas de Desarrollador).
4. Selecciona un dispositivo como **iPhone 14/15 Pro** o **Samsung Galaxy**.

#### Opción B: Probar desde un Celular Real (Vía Red Wi-Fi Local)
1. En la terminal del proyecto, inicia Vite permitiendo conexiones en la red local:
   ```bash
   npm run dev -- --host
   ```
2. Vite te entregará la IP local de tu computador (ejemplo: `Network: http://192.168.1.15:5173`).
3. En tu teléfono celular (conectado al mismo Wi-Fi que tu PC), abre Chrome o Safari e ingresa a esa dirección URL.

---

## 🔐 Credenciales de Acceso y Demostración

El sistema cuenta con validación estricta de credenciales y perfiles preconfigurados con historiales clínicos y paquetes:

| Perfil                                            | Correo de Acceso              | Contraseña Válida                  | Paquete / Rol                       |
| :------------------------------------------------ | :---------------------------- | :----------------------------------- | :---------------------------------- |
| **Paciente (Nuevo Registro / Demostración)**      | `pablito.loncon@gmail.com`   | `password123` *(o `12345678`)* | Pack Recuperación Activa (8 ses)   |
| **Paciente (LCA / Readaptación)**          | `camila.gonzalez@gmail.com` | `password123` *(o `12345678`)* | Pack Recuperación Activa (8 ses)   |
| **Paciente (Tendinopatía / Funcional)**    | `juan.perez@gmail.com`      | `password123` *(o `12345678`)* | Pack Readaptación Total (12 ses)   |
| **Paciente (Hombro doloroso)**              | `matias.rojas@gmail.com`    | `password123` *(o `12345678`)* | Pack Básico Kinesiológico (4 ses) |
| **Personal (Kinesiólogo / Admin / Coach)** | `admin@profuncional.cl`     | `admin1234`                        | Programa PC Staff                   |

---

## ⚡ Arquitectura de Persistencia de 3 Capas (Dualidad Online / Offline)

Para garantizar la disponibilidad ininterrumpida tanto en entornos sin conexión como al estar sincronizado con Supabase, el sistema opera bajo una **estrategia de combinación de 3 capas**:

1. **Capa Base Demo (Fallback)**: Garantiza que todos los miembros iniciales, bloques de Lunes a Domingo e historiales kinesiológicos estén disponibles por defecto.
2. **Capa de Almacenamiento Local (`localStorage`)**: Guarda instantáneamente los nuevos registros de usuarios, reservas creadas, evaluaciones clínicas SOAP escritas y cambios de asistencia en el dispositivo.
3. **Capa Servidor Backend (NestJS + Supabase PostgreSQL)**: Sincroniza datos en tiempo real mediante fusionadores (`Map` por email/ID) que enriquecen los registros sin sobrescribir ni eliminar miembros creados localmente o bloques horarios de la parrilla.

---

## 🗺️ Módulos e Historias de Usuario Implementadas (Sprint 1 & Sprint 2)

### 💻 Programa PC (Staff / Kinesiólogos / Entrenadores / Admin)

- **HU-01 · Configuración de Disponibilidad Horaria**: Modal interactivo para definir bloques horarios (Día, Hora inicio/fin, Título, Profesional, Tipo de atención y Capacidad máxima de cupos) publicados en tiempo real de Lunes a Domingo.
- **HU-02 · Parrilla de Citas y Marcado de Asistencia**: Visualización diaria de boxes kinésicos y clases funcionales con marcado de **"Asistió"** o **"No-Show"** (Inasistencia) y visualización en tiempo real de alumnos inscritos por bloque.
- **HU-05 · Ficha Clínica Evolutiva (SOAP, EVA, ROM)**: Formulario de atención kinésica con notas **SOAP** (Subjetivo, Objetivo, Análisis, Plan Terapéutico), slider cuantitativo de dolor en escala **EVA (1 a 10)**, movilidad articular **ROM en grados (°)** y botón de **Eliminación de evaluaciones SOAP** registradas por error.
- **HU-07 · Alertas de Restricciones para Entrenadores**: Pautas médicas de kinesiólogos desplegadas automáticamente en el panel de los entrenadores (ej. *"⚠️ Evitar flexión >90° por LCA"*).
- **HU-10 · Dashboard de Métricas y Control de Ausentismo**: Control de ocupación, balance de sesiones kinésicas y cálculo de **Tasa de No-Show**.

### 📱 App Móvil Nativa (Pacientes / Alumnos)

- **HU-03 / HU-03.b · Agendamiento Autónomo & Branding Verde Limón**: Interfaz intuitiva con identidad visual Verde Limón para consultar catálogo de horas, reservar en 1 clic y verificar el saldo de paquetes.
- **HU-04 / HU-04.b · Cancelación (Regla 24h), Reagendamiento y Saldo**:
  - Reagendamiento a otro bloque disponible sin costo ni alteración de saldo.
  - Cancelación con **regla de 24 horas**: Reembolso automático de +1 sesión al paquete si la solicitud es con $\ge 24\text{h}$, o liberación del cupo sin reembolso si la cancelación es tardía ($< 24\text{h}$).
- **HU-06 · Gráficos de Evolución Física**: Curvas interactivas de descenso del dolor en escala **EVA (1-10)** e incremento del rango de movimiento **ROM (grados °)** mediante gráficos Recharts.
- **HU-11 · Recordatorio In-App de Confirmación de Asistencia**: Banner interactivo en la vista principal (*"¿Vas a asistir a la sesión de hoy?"*) que permite al paciente confirmar de forma activa su asistencia antes de la clase.
- **Credencial Digital QR**: Pase digital dinámico con código QR (`PROFUNCIONAL:ID`) para acceso a torniquetes o recepción.
