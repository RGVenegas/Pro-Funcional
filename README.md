# ProFuncional — Ecosistema de Gestión Kinésico-Deportiva

Ecosistema digital integral compuesto por un **Programa de Escritorio (PC)** para la administración, kinesiólogos y entrenadores del centro, y una **App Móvil (Web & Nativa iOS/Android)** para pacientes y alumnos. Conecta la kinesiología y la rehabilitación física con el entrenamiento funcional, gestionando citas, fichas clínicas evolutivas (metodología SOAP, dolor EVA 1-10, movilidad ROM °), políticas de cancelación de 24h, recordatorios de asistencia in-app, accesibilidad universal (WCAG 2.1 AA) y arquitectura en la nube sobre AWS.

---

## 🛠️ Arquitectura y Stack Tecnológico

### 💻 Frontend (Programa PC & App Móvil)

- **Framework & Lenguaje**: React 18 + TypeScript
- **Bundler & Tooling**: Vite 6
- **Estilos & Branding**: Tailwind CSS v4 (Identidad Verde Limón `#00E676` / `#00B4D8`) + Radix UI + Lucide Icons
- **Responsividad & Safe Areas**: Layout Mobile-First, Insets de Safe Area (`env(safe-area-inset-bottom/top)`), fuentes de 16px en inputs (evita auto-zoom en iOS Safari).
- **Accesibilidad (a11y)**: Targets táctiles amplios (≥44x44px), anillos de enfoque visual (`:focus-visible`), atributos ARIA (`role="dialog"`, `role="alert"`, `aria-label`).
- **Gráficos & Métricas**: Recharts (Curvas de dolor EVA y movilidad ROM °).
- **Empaquetado Nativo**: Capacitor (Ionic) preparado para generación de APK (Android) e IPA (iOS).

### ⚙️ Backend (API REST & Servidor)

- **Framework**: NestJS (Node.js / TypeScript)
- **Base de Datos & ORM**: PostgreSQL gestionado (AWS RDS / Supabase) con Prisma ORM.
- **Seguridad & Autenticación**: JWT Auth + AWS Secrets Manager / KMS + IAM Execution Role de menor privilegio.
- **Documentación API**: Swagger OpenAPI 3.0 interactivo.

### ☁️ Infraestructura & Nube (AWS & IaC)

- **Infraestructura como Código (IaC)**: Terraform (Módulos VPC, ALB, ECS Fargate, RDS PostgreSQL, Secrets Manager, S3, CloudFront).
- **Backend Serverless**: Cluster ECS Fargate (subredes privadas, health checks en `/api/v1/health`, CloudWatch Logs).
- **Frontend CDN**: AWS S3 Bucket + Amazon CloudFront CDN con invalidación de caché instantánea.
- **Pipelines CI/CD**: GitHub Actions automatizados en `.github/workflows/`.

---

## 📋 Módulos e Historias de Usuario Implementadas (HU-01 a HU-19)

### 💻 Programa PC (Staff / Kinesiólogos / Entrenadores / Administradores)

- **HU-01 · Configuración de Agenda & Bloques**: Definición interactiva de franjas horarias y capacidades por hora.
- **HU-02 · Parrilla Diaria y Marcado de Asistencia**: Gestión en tiempo real de citas con marcado de *"Asistió"* o *"No-Show"*.
- **HU-05 · Ficha Clínica Evolutiva (SOAP, EVA, ROM)**: Registro médico estructurado con notas SOAP, slider de dolor EVA (1-10) y movilidad articular ROM en grados (°).
- **HU-07 · Alertas de Restricciones Médicas**: Pautas clínicas kinésicas visibles automáticamente para entrenadores de gimnasio.
- **HU-10 · Dashboard de Métricas & No-Show**: Indicadores de ocupación, saldos de paquetes y porcentaje de ausentismo.

### 📱 App Móvil (Pacientes / Alumnos)

- **HU-03 / HU-03.b · Agendamiento Autónomo & Tema Verde Limón**: Catálogo de horas disponibles, reserva en 1 clic y branding institucional.
- **HU-04 / HU-04.b · Cancelación (Regla 24h) y Reagendamiento**:
  - Reagendamiento sin costo ni descuento de saldo a nuevos bloques disponibles.
  - Cancelación con **regla de 24 horas**: Reembolso automático (+1 sesión) si es $\ge 24\text{h}$, o liberación sin reembolso si es $< 24\text{h}$.
- **HU-06 · Gráficos de Evolución Kinésica**: Visualización interactiva del descenso del dolor y ganancia de movilidad.
- **HU-11 · Recordatorio In-App de Confirmación de Asistencia**: Banner interactivo de confirmación previa.

### ☁️ Infraestructura Nube, Accesibilidad & UX

- **HU-12 · Despliegue Backend en AWS**: Docker multi-stage, ECS Fargate, ALB y CloudWatch Logs.
- **HU-13 · Gestión Segura de Secretos**: AWS Secrets Manager, cifrado KMS e inyección en runtime.
- **HU-14 · Base de Datos Gestionada RDS PostgreSQL**: Subredes privadas, SG 5432, SSL mandatory y respaldos PITR.
- **HU-15 · CI/CD para Frontend y Backend**: Integración continua en GitHub Actions.
- **HU-16 · Spike de Arquitectura e Infraestructura**: Estudio comparativo de costos (100, 1K y 10K usuarios) ECS vs Lambda vs EC2 consolidado en [`docs/spike-infraestructura-costes.md`](<file:///d:/Codigos%20de%20prueba/Pro-Funcional/docs/spike-infraestructura-costes.md>).
- **HU-17 · Mobile-First & Breakpoints**: Safe Areas nativas (`safe-area-inset`), prevención de auto-zoom en iOS Safari (fuentes 16px) y cero desbordamiento horizontal.
- **HU-18 · Interacciones Táctiles y Accesibilidad (a11y)**: Targets táctiles ≥44x44px (`.touch-target-44`), focus rings visuales y semántica ARIA completa (`role="dialog"`, `role="alert"`).
- **HU-19 · Cuadrícula de Horarios Responsiva**: Conmutador táctil de vistas entre **"Vista Carrusel de Días"** (grid horizontal) y **"Vista Lista Compacta"** (stream vertical para smartphones de 360px).

---

---

## 🚀 Guía Rápida de Instalación y Ejecución de Comandos

> ⚠️ **REGLA IMPORTANTE:** El **Bloque 1** contiene los comandos de instalación y configuración inicial que se ejecutan **SOLO UNA VEZ** al clonar el proyecto por primera vez. Para el trabajo diario de desarrollo únicamente requieres el **Bloque 2**.

---

### 📌 Bloque 1: Configuración Inicial 📦 *(SE EJECUTA SOLO UNA VEZ)*

Ejecuta esta secuencia únicamente la primera vez que descargues o clones el proyecto en una máquina nueva:

```bash
# 1. Instalar dependencias de Frontend y Backend
npm install
cd backend && npm install && cd ..

# 2. Copiar archivos de variables de entorno de desarrollo (.env)
cp .env.example .env
cp backend/.env.example backend/.env

# 3. Generar el Cliente Prisma ORM para PostgreSQL
cd backend && npx prisma generate && cd ..
```

---

### 🚀 Bloque 2: Ejecución Diaria / Desarrollo Habitual 💻

Para iniciar la aplicación durante el desarrollo cotidiano:

#### 🖥️ Opción A: Iniciar Frontend (Programa PC & App Web Móvil)

```bash
npm run dev
```

- **Acceso Local PC**: **`http://localhost:5173`**
- **Acceso Celular (Misma red Wi-Fi)**: Ingresa la IP local mostrada en pantalla (Ej: `http://192.168.0.4:5173`).

#### ⚙️ Opción B: Iniciar API Backend NestJS (Persistencia real con PostgreSQL)

```bash
cd backend 
npm run start:dev
```

- **Servidor API REST**: **`http://localhost:3000`**
- **Documentación Swagger API**: **`http://localhost:3000/api`**

---

### 🛠️ Bloque 3: Comandos Avanzados y Operaciones Opcionales

Utiliza estos comandos únicamente cuando requieras compilar la app, generar ejecutables móviles nativos o desplegar infraestructura en AWS:

#### 🏗️ Compilación para Producción (Build)

```bash
# Compilar Frontend (Genera carpeta /dist)
npm run build

# Compilar Backend NestJS (Genera carpeta /backend/dist)
cd backend && npm run build && cd ..
```

#### 📱 Generación de App Móvil Nativa (APK Android / IPA iOS con Capacitor)

```bash
# 1. Instalar herramientas nativas (Solo la primera vez)
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init ProFuncional com.profuncional.app --web-dir dist

# 2. Compilar Frontend y sincronizar con proyectos nativos
npm run build
npx cap add android && npx cap copy android
npx cap open android   # Compila el ejecutable APK / AAB en Android Studio

npx cap add ios && npx cap copy ios
npx cap open ios       # Compila el ejecutable IPA en Xcode (macOS)
```

#### ☁️ Despliegue de Infraestructura AWS con Terraform

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # Edita tus credenciales AWS
terraform init && terraform plan && terraform apply -auto-approve
cd ..
```

#### 🔄 Workflows de CI/CD Automatizados en GitHub Actions

Al realizar un `git push` a `main`, GitHub Actions ejecuta los pipelines en `.github/workflows/`.

- **Secretos requeridos en GitHub Repository (`Settings -> Secrets and variables -> Actions`)**:
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`.

---

## 🔐 Credenciales de Prueba y Demostración

El sistema incluye perfiles preconfigurados para pruebas de evaluación:

| Perfil                                          | Correo de Acceso              | Contraseña Válida                  | Paquete / Rol                       |
| :---------------------------------------------- | :---------------------------- | :----------------------------------- | :---------------------------------- |
| **Paciente (Demostración Genérica)**    | `pablito.loncon@gmail.com`  | `password123` *(o `12345678`)* | Pack Recuperación Activa (8 ses)   |
| **Paciente (LCA / Readaptación)**        | `camila.gonzalez@gmail.com` | `password123` *(o `12345678`)* | Pack Recuperación Activa (8 ses)   |
| **Paciente (Tendinopatía / Funcional)**  | `juan.perez@gmail.com`      | `password123` *(o `12345678`)* | Pack Readaptación Total (12 ses)   |
| **Paciente (Hombro doloroso)**            | `matias.rojas@gmail.com`    | `password123` *(o `12345678`)* | Pack Básico Kinesiológico (4 ses) |
| **Personal Staff (Kinesiólogo / Admin)** | `admin@profuncional.cl`     | `admin1234`                        | Programa PC Staff                   |

---

## 📚 Documentación de Referencia en el Repositorio

- **Evidencias de Pruebas y Controles**: [`docs/HU-evidencias.md`](<file:///d:/Codigos%20de%20prueba/Pro-Funcional/docs/HU-evidencias.md>) y [`docs/sprint3.md`](<file:///d:/Codigos%20de%20prueba/Pro-Funcional/docs/sprint3.md>)
- **Spike Técnico de Infraestructura**: [`docs/spike-infraestructura-costes.md`](<file:///d:/Codigos%20de%20prueba/Pro-Funcional/docs/spike-infraestructura-costes.md>)
- **Propuestas de Arquitectura e Ideas Futuras**: [`docs/ideas-a-implementar.md`](<file:///d:/Codigos%20de%20prueba/Pro-Funcional/docs/ideas-a-implementar.md>)
