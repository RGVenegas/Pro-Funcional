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

## 🚀 Guía de Instalación y Ejecución paso a paso

---

### Paso 1: Instalación de Dependencias 📦 *(Solo se ejecuta la primera vez)*

Ejecuta estos comandos únicamente la primera vez que descargues o clones el proyecto en una máquina nueva:

```bash
# 1. Instalar dependencias del Frontend (Carpeta principal)
npm install

# 2. Instalar dependencias del Backend
cd backend
npm install
cd ..
```

---

### Paso 2: Ejecución del Programa Frontend (PC & App Web) 💻

Para iniciar la interfaz de usuario (Programa PC Staff y App Móvil Web):

```bash
# Iniciar servidor de desarrollo Vite
npm run dev
```

> **Acceso Local:** Abre tu navegador en **http://localhost:5173**

---

### Paso 3: Ejecución del Servidor Backend API (NestJS & Supabase) ⚙️

Si deseas ejecutar el servidor API backend para la sincronización y persistencia con PostgreSQL / Supabase:

```bash
# 1. Ingresar a la carpeta backend
cd backend

# 2. Iniciar el servidor NestJS en modo desarrollo
npm run start:dev
```

> **Acceso API:** El servidor API correrá localmente en **http://localhost:3000** con documentación Swagger interactiva disponible en **http://localhost:3000/api**.

---

### Paso 4: Conexión desde Dispositivos Móviles (Celulares / iPhones / Tablets) 📱

La aplicación cuenta con una interfaz **Mobile-First 100% Responsiva**. Puedes probar la experiencia desde tu teléfono celular de 2 formas:

#### Opción A: Desde un Celular Real (Vía Red Wi-Fi Local)

1. Asegúrate de iniciar la aplicación con `npm run dev` en tu PC. (El archivo `vite.config.ts` ya está configurado con `host: true` para escuchar peticiones en la red).
2. Vite te mostrará la IP local de tu máquina en la terminal (Ejemplo: `Network: http://192.168.0.4:5173`).
3. En tu celular (conectado a la **misma red Wi-Fi** que tu PC), abre Chrome o Safari e ingresa a esa dirección (ej. `http://192.168.0.4:5173`).

#### Opción B: Modo Celular en el Navegador de la PC (Emulación Rápida)

1. Abre **http://localhost:5173** en Chrome o Edge.
2. Presiona **`F12`** (o Clic Derecho $\rightarrow$ *Inspeccionar*).
3. Presiona **`Ctrl + Shift + M`** (icono de celular/tablet en DevTools).
4. Selecciona un dispositivo como **iPhone 14/15 Pro** o **Samsung Galaxy**.

---

### Paso 5: Compilación para Producción 🏗️ *(Opcional)*

Si necesitas generar los archivos optimizados para despliegue en servidor final:

```bash
# Compilar Frontend (Genera carpeta /dist)
npm run build

# Compilar Backend NestJS (Genera carpeta backend/dist)
cd backend
npm run build
```

---

## 🔐 Credenciales de Acceso y Demostración

El sistema cuenta con validación estricta de credenciales y perfiles preconfigurados con historiales clínicos y paquetes:

| Perfil                                              | Correo de Acceso              | Contraseña Válida                  | Paquete / Rol                       |
| :-------------------------------------------------- | :---------------------------- | :----------------------------------- | :---------------------------------- |
| **Paciente (Nuevo Registro / Demostración)** | `pablito.loncon@gmail.com`  | `password123` *(o `12345678`)* | Pack Recuperación Activa (8 ses)   |
| **Paciente (LCA / Readaptación)**            | `camila.gonzalez@gmail.com` | `password123` *(o `12345678`)* | Pack Recuperación Activa (8 ses)   |
| **Paciente (Tendinopatía / Funcional)**      | `juan.perez@gmail.com`      | `password123` *(o `12345678`)* | Pack Readaptación Total (12 ses)   |
| **Paciente (Hombro doloroso)**                | `matias.rojas@gmail.com`    | `password123` *(o `12345678`)* | Pack Básico Kinesiológico (4 ses) |
| **Personal (Kinesiólogo / Admin / Coach)**   | `admin@profuncional.cl`     | `admin1234`                        | Programa PC Staff                   |

---

## ⚡ Arquitectura de Persistencia de 3 Capas (Dualidad Online / Offline)

Para garantizar la disponibilidad ininterrumpida tanto en entornos sin conexión como al estar sincronizado con Supabase, el sistema opera bajo una **estrategia de combinación de 3 capas**:

1. **Capa Base Demo (Fallback)**: Garantiza que todos los miembros iniciales, bloques de Lunes a Domingo e historiales kinesiológicos estén disponibles por defecto.
2. **Capa de Almacenamiento Local (`localStorage`)**: Guarda instantáneamente los nuevos registros de usuarios, reservas creadas, evaluaciones clínicas SOAP escritas y cambios de asistencia en el dispositivo.
3. **Capa Servidor Backend (NestJS + Supabase PostgreSQL)**: Sincroniza datos en tiempo real mediante fusionadores (`Map` por email/ID) que enriquecen los registros sin sobrescribir ni eliminar miembros creados localmente o bloques horarios de la agenda.

### 🔄 Detección y Demostración Automática Online / Offline

* **Sondeo Inteligente en Tiempo Real (2 segundos)**: El sistema verifica continuamente la disponibilidad de la API Backend.
* **Modo Servidor Encendido (`npm run start:dev`)**: Muestra brevemente una animación de verificación (*"Evaluando conexión con Supabase..."*), confirma en verde (*"Conexión exitosa con Supabase — Todos los datos están al día"*) y se oculta automáticamente a los 4 segundos para dejar la interfaz limpia.
* **Modo Servidor Apagado (Demostración)**: Si se detiene la ejecución del backend, el sistema activa automáticamente en máximo 2 segundos el banner de advertencia (*"Se perdió la conexión con Supabase — Operando en Modo Offline"*), demostrando la tolerancia a fallos ante evaluadores sin detener la experiencia de usuario.

---

## 🗺️ Módulos e Historias de Usuario Implementadas (Sprint 1 & Sprint 2)

### 💻 Programa PC (Staff / Kinesiólogos / Entrenadores / Admin)

- **HU-01 · Configuración de Disponibilidad Horaria**: Modal interactivo para definir bloques horarios (Día, Hora inicio/fin, Título, Profesional, Tipo de atención y Capacidad máxima de cupos) publicados en tiempo real de Lunes a Domingo.
- **HU-02 · Agenda de Citas y Marcado de Asistencia**: Visualización diaria de boxes kinésicos y clases funcionales con marcado de **"Asistió"** o **"No-Show"** (Inasistencia) y visualización en tiempo real de alumnos inscritos por bloque.
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

---

---

## ☁️ Arquitectura de Nube en AWS, IaC y CI/CD

Toda la infraestructura y despliegues para poner a ProFuncional en producción en AWS están preparados mediante código modular e Infraestructura como Código (IaC):

### 🏗️ 1. Estructura de Infraestructura (IaC con Terraform)
Ubicación: `terraform/`
- **VPC & Redes (`vpc.tf`)**: VPC con Subredes Públicas (ALB y NAT Gateway) y Subredes Privadas Aisladas para ECS y RDS.
- **Seguridad & Aislamiento (`security_groups.tf`)**: SG del ALB permite 80/443; SG de ECS Fargate permite tráfico únicamente desde el ALB; SG de RDS permite puerto `5432` únicamente desde el backend ECS.
- **Application Load Balancer (`alb.tf`)**: Reenvío y balanceo de carga con Health Check en `/api/v1/health`.
- **Backend ECS Fargate & CloudWatch (`ecs.tf`)**: Cluster Fargate ejecutando contenedores Docker de NestJS en subredes privadas con logs centralizados en CloudWatch.
- **Base de Datos RDS PostgreSQL (`rds.tf`)**: Instancia de PostgreSQL gestionada en subredes privadas con cifrado en reposo, backups automáticos de 7+ días y PITR.
- **Gestión de Secretos (`secrets.tf`)**: AWS Secrets Manager cifrado con clave KMS e IAM Execution Role con política de menor privilegio (`secretsmanager:GetSecretValue`).
- **Hosting Frontend (`s3_cloudfront.tf`)**: Bucket S3 privado + Amazon CloudFront CDN con Origin Access Control (OAC).

---

### 📋 2. Guía Paso a Paso para Configuración y Despliegue

#### Paso 1: Configurar las Credenciales de AWS en GitHub (Para Despliegue Automático CI/CD)
1. Entra a tu repositorio en **GitHub** desde el navegador.
2. Haz clic en **`Settings`** (Configuración en la barra superior).
3. En el menú lateral izquierdo, selecciona **`Secrets and variables`** $\rightarrow$ **`Actions`**.
4. Presiona el botón verde **`New repository secret`** para agregar cada una de estas variables:

| Nombre del Secreto | Descripción / Ejemplo |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Tu clave de acceso pública de AWS (ej. `AKIAIOSFODNN7EXAMPLE`) |
| `AWS_SECRET_ACCESS_KEY` | Tu clave secreta de AWS (ej. `wJalrXUtnFEMI/K7MDENG/...`) |
| `AWS_REGION` | Región de AWS a utilizar (ej. `us-east-1`) |
| `ECR_REPOSITORY` | Nombre del repositorio ECR (ej. `profuncional-backend`) |
| `ECS_CLUSTER` | Nombre del cluster ECS (ej. `profuncional-prod-cluster`) |
| `ECS_SERVICE` | Nombre del servicio ECS (ej. `profuncional-prod-service`) |
| `S3_BUCKET` | Nombre del bucket S3 de hosting (ej. `profuncional-prod-frontend-hosting`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID de la distribución CloudFront CDN |

#### Paso 2: Crear la Infraestructura en AWS con Terraform (Una sola vez)
Una vez que tengas tus credenciales de AWS:
1. Abre tu terminal y ve a la carpeta `terraform`:
   ```bash
   cd terraform
   ```
2. Crea el archivo de variables copiando la plantilla:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
3. Edita `terraform.tfvars` ingresando tus contraseñas y claves de producción.
4. Inicializa y aplica la infraestructura:
   ```bash
   terraform init
   terraform plan
   terraform apply -auto-approve
   ```

#### Paso 3: Configurar Variables Locales (Desarrollo en tu PC)
1. En la carpeta raíz del proyecto, copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. En la carpeta `backend/`, copia `.env.example` a `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. ¡Listo! Al realizar un `git push` a la rama `main`, GitHub Actions compilará, probará y desplegará automáticamente Frontend y Backend en AWS.



