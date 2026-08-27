# ProFuncional — Sistema de Gestión Kinésico-Deportiva

Ecosistema digital compuesto por un **Programa de Escritorio/PC** para la administración, kinesiólogos y entrenadores del centro, y una **App Web Móvil (PWA)** para pacientes y alumnos. Conecta la kinesiología y la rehabilitación con el entrenamiento funcional, gestionando citas, fichas clínicas evolutivas (SOAP, EVA, ROM) y control de saldo de paquetes.

---

## 🛠️ Tecnologías y Stack

- **Frontend**: React 18 + TypeScript
- **Bundler & Tooling**: Vite 6
- **Estilos**: Tailwind CSS v4 + Radix UI + Lucide Icons
- **Gráficos & Métricas**: Recharts (Curvas de dolor EVA y ROM) + Motion (Framer Motion)
- **Utilidades**: QRCode.react, Sonner, Canvas Confetti, Date-fns, React Hook Form
- **Almacenamiento**: Persistencia reactiva en `localStorage` con emisión de eventos en tiempo real

---

## 🚀 Ejecución del Proyecto

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor de desarrollo
```bash
npm run dev
```

> **Nota:** Abre la URL indicada por Vite (normalmente [http://localhost:5173](http://localhost:5173)).

### 3. Compilar para producción
```bash
npm run build
```

---

## 🔐 Credenciales de Acceso y Demostración

El sistema cuenta con validación estricta de credenciales y perfiles preconfigurados con historiales clínicos y paquetes:

| Perfil | Correo de Acceso | Contraseña Válida | Paquete / Rol |
| :--- | :--- | :--- | :--- |
| **Paciente (LCA / Readaptación)** | `camila.gonzalez@gmail.com` | `password123` *(o `12345678`)* | Pack Recuperación Activa (8 ses) |
| **Paciente (Tendinopatía / Funcional)** | `juan.perez@gmail.com` | `password123` *(o `12345678`)* | Pack Readaptación Total (12 ses) |
| **Paciente (Hombro doloroso)** | `matias.rojas@gmail.com` | `password123` *(o `12345678`)* | Pack Básico Kinesiológico (4 ses) |
| **Personal (Kinesiólogo / Admin / Coach)** | `admin@profuncional.cl` | `admin1234` | Programa PC Staff |

---

## 🗺️ Módulos e Historias de Usuario Implementadas

### 💻 Programa PC (Staff / Kinesiólogos / Entrenadores / Admin)
- **HU-01 & HU-02 · Parrilla de Citas y Asistencia**: Visualización de boxes kinésicos y clases funcionales con botones para marcar **"Asistió"** o **"No-Show"** (Inasistencia).
- **HU-05 · Ficha Clínica Evolutiva (SOAP, EVA, ROM)**: Formulario interactivo con escala de dolor **EVA (1 a 10)**, movilidad articular **ROM en grados (°)**, notas **SOAP** (Subjetivo, Objetivo, Análisis, Plan) y prescripción de restricciones para el gimnasio.
- **HU-07 · Alertas de Restricciones para Entrenadores**: Identificación visible de restricciones médicas de alumnos inscritos en cada clase (ej. *"⚠️ Evitar flexión >90° por LCA"*).
- **HU-08 · Dashboard de Métricas y Control de Ausentismo**: Control de ocupación, balance de sesiones kinésicas y cálculo de **Tasa de No-Show (< 5%)**.

### 📱 App Web Móvil (Pacientes / Alumnos)
- **HU-03 · Agendamiento Autónomo (<30s)**: Reserva ágil de sesiones en box kinésico o clases funcionales con descuento automático de 1 sesión de saldo.
- **HU-04 · Cancelación, Reagendamiento y Control de Saldo**: Cancelación a tiempo con reintegro automático de la sesión a su paquete activo (packs de 4, 8 o 12 sesiones).
- **HU-06 · Gráficos de Evolución Física**: Curva interactiva de descenso del dolor en escala **EVA (1-10)** y aumento del rango de movimiento **ROM (grados °)** mediante gráficos Recharts.
- **Credencial Digital QR**: Pase digital dinámico con código QR (`PROFUNCIONAL:ID`) para acceso a torniquetes o recepción.

