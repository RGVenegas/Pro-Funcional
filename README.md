# ProFuncional — Ecosistema de Gestión Kinésico-Deportiva

Ecosistema digital integral compuesto por un **Programa de Escritorio (PC)** para la administración, kinesiólogos y entrenadores del centro, y una **App Móvil (Web & Nativa iOS/Android)** para pacientes y alumnos. Conecta la kinesiología y la rehabilitación física con el entrenamiento funcional, gestionando citas, fichas clínicas evolutivas (metodología SOAP, dolor EVA 1-10, movilidad ROM °), políticas de cancelación de 3h, recordatorios de asistencia in-app, accesibilidad universal (WCAG 2.1 AA) y arquitectura en la nube sobre AWS.

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
- **HU-04 / HU-04.b · Cancelación (Regla 3h) y Reagendamiento**:
  - Reagendamiento sin costo ni descuento de saldo a nuevos bloques disponibles (con $\ge 3\text{h}$ de anticipación).
  - Cancelación con **regla de 3 horas**: Reembolso automático (+1 sesión) si es $\ge 3\text{h}$, o liberación sin reembolso si es $< 3\text{h}$.
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

### 💳 Sprint 5 — Pasarela de Pagos Mercado Pago Checkout API (HU-20 a HU-26)

- **HU-20 · Checkout API On-Site (Payment Bricks)**: Modal nativo de pago embebido (`@mercadopago/sdk-react`) con selector interactivo de tarjetas sandbox y sin redirecciones externas.
- **HU-21 · Procesamiento Transaccional vía Orders API en Backend**: Cobro automatizado en NestJS con endpoint oficial `POST /v1/orders`, idempotencia garantizada (`X-Idempotency-Key`) y autenticación segura con Access Token.
- **HU-22 · Soporte Dinámico Multitarjeta (Crédito, Débito y Prepago)**: Mapeo automático de métodos a `debvisa` / `debmaster` fijando 1 cuota para débito/prepago y soporte de 1 a 12 cuotas para tarjetas de crédito.
- **HU-23 · Homologación y Simulación de Pruebas de Calidad**: Validación y mapeo amigable en español de escenarios oficiales de prueba (`APRO`, `OTHE`, `CONT`, `CALL`, `FUND`, `SECU`, etc.) alcanzando 98/100 de calidad técnica.
- **HU-24 · Perfilamiento de Seguridad y Device Fingerprinting**: Captura de `MP_DEVICE_SESSION_ID` con `security.js` y cabecera oficial `X-Meli-Session-Id` para prevención de fraude y certificación de SDK Frontend.
- **HU-25 · Sincronización de Webhooks y Notificaciones**: Endpoint de recepción `/api/payments/webhook` con firma criptográfica `MP_WEBHOOK_SECRET` y respuestas HTTP 200 OK.
- **HU-26 · Acreditación Automática de Sesiones y Auditoría en BD**: Creación inmediata de paquetes de sesiones en PostgreSQL (Neon) y registro de trazabilidad en `ActivityLog` tras aprobación de pago.

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

#### 📱 Guía Paso a Paso: Descarga Pública y Publicación en Google Play Store (Android) y Apple App Store (iPhone)

El proyecto cuenta con las plataformas nativas inicializadas en `/android` y `/ios` bajo el identificador oficial **`com.profuncional.app`**, además de soporte **PWA** y compilación automática en la nube mediante `.github/workflows/build-mobile-apk.yml`.

---

##### 🟢 Opción 1: Descarga Pública Inmediata y Gratuita (Sin pagar cuentas de tienda)

Cualquier persona puede instalar la aplicación hoy mismo en Android o iPhone siguiendo estos pasos:

1. **Subir cambios al repositorio (`main`) para disparar la compilación en la nube**:
   ```bash
   git add .
   git commit -m "build: actualizar instaladores móviles Android e iOS"
   git push origin main
   ```
2. **Publicación automática en GitHub Releases**:
   - Al hacer `git push`, el workflow **Build Mobile Android & iOS** compila automáticamente en la nube (sin requerir Android Studio ni Mac en tu PC) y publica los archivos en la sección **Releases (`latest`)** de tu repositorio GitHub.
3. **Cómo la descarga cualquier usuario en Android (`.APK` Directo)**:
   - Compartiendo el enlace público directo (no pide cuenta de GitHub):
     `https://github.com/RGVenegas/Pro-Funcional/releases/latest/download/ProFuncional-Android.apk`
   - O entrando a la web de ProFuncional y tocando **"Descargar APK"** o escaneando el **Código QR** en pantalla.
   - Al abrir el archivo `.apk` descargado en el teléfono, el usuario autoriza *"Instalar aplicaciones desconocidas"* y presiona **Instalar**.
4. **Cómo la instala cualquier usuario en iPhone / iOS (PWA Instalable)**:
   - Abre la URL web de ProFuncional desde **Safari** en el iPhone.
   - Toca el aviso emergente **"Instalar en iPhone"** (o el botón **Compartir** de Safari $\rightarrow$ **"Agregar a pantalla de inicio"**).
   - La app queda instalada en el inicio del iPhone con su ícono oficial, pantalla completa (sin barras de navegador) y soporte offline.

---

##### 🤖 Opción 2: Paso a Paso para Publicar en Google Play Store (Android)

Google Play exige subir un archivo **`.aab` (Android App Bundle)** firmado digitalmente. El proyecto ya lo genera automáticamente.

1. **Crear cuenta de desarrollador en Google Play Console**:
   - Ingresa a [Google Play Console](https://play.google.com/console) y registra tu cuenta de desarrollador (pago único de **\$25 USD**).
2. **(Opcional pero recomendado) Generar tu llave privada de firma (`Keystore`) permanente**:
   - Si deseas conservar tu propia llave para futuras actualizaciones en Play Store, ejecuta una sola vez:
     ```bash
     keytool -genkeypair -v -keystore profuncional-release.keystore -alias profuncional -keyalg RSA -keysize 2048 -validity 10000
     ```
   - En tu repositorio de GitHub ve a **Settings $\rightarrow$ Secrets and variables $\rightarrow$ Actions** y agrega:
     - `ANDROID_KEYSTORE_BASE64`: Contenido del archivo `.keystore` convertido a Base64.
     - `ANDROID_KEYSTORE_PASSWORD`: Contraseña de tu keystore.
     - `ANDROID_KEY_ALIAS`: `profuncional`
     - `ANDROID_KEY_PASSWORD`: Contraseña de la llave.
   - *(Si no configuras estos secretos, el workflow de GitHub Actions genera un keystore automáticamente para que la compilación nunca falle).*
3. **Obtener el archivo `ProFuncional-PlayStore.aab`**:
   - **Vía Nube (Recomendado)**: Ve a la pestaña **Releases** o **Actions** de tu repositorio en GitHub y descarga **`ProFuncional-PlayStore.aab`**.
   - **Vía PC Local (Con Android Studio + JDK 17)**:
     ```bash
     npm run mobile:sync
     npm run mobile:open
     ```
     En Android Studio ve a *Build $\rightarrow$ Generate Signed Bundle / APK $\rightarrow$ Android App Bundle (.aab)*.
4. **Subir a Google Play Console**:
   - En Play Console haz clic en **"Crear aplicación"** $\rightarrow$ Nombre: `ProFuncional`, Idioma: `Español (Chile / Latinoamérica)`, Tipo: `Aplicación`, Gratis/Pago: `Gratis`.
   - En el menú lateral ve a **Producción** (o *Prueba cerrada / interna*) $\rightarrow$ **Crear nueva versión**.
   - Sube el archivo **`ProFuncional-PlayStore.aab`**.
   - Completa la **Ficha de Play Store** (descripción, ícono de 512x512 en `public/icon-512.png`, capturas de pantalla, clasificación de contenido y política de privacidad) y presiona **Enviar a revisión**.

---

##### 🍎 Opción 3: Paso a Paso para Publicar en Apple App Store (iPhone / iPad)

Apple exige una cuenta en el **Apple Developer Program** y firmar el proyecto nativo `/ios` con certificados de Apple antes de enviarlo a **App Store Connect**.

1. **Inscribirse en el Apple Developer Program**:
   - Regístrate en [Apple Developer Program](https://developer.apple.com/programs/) (**\$99 USD anuales**).
2. **Sincronizar el proyecto nativo iOS**:
   - Todos los archivos nativos de Xcode, ícono de `1024x1024 px` sin canal alfa (`ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`), Splash Screens y configuración de cifrado (`ITSAppUsesNonExemptEncryption = false` en `Info.plist`) ya están generados en la carpeta `/ios`.
   - Si modificas el frontend o los íconos, sincroniza con:
     ```bash
     npm run mobile:build:ios
     # Si necesitas regenerar íconos de Android e iOS desde public/logo.png:
     powershell -ExecutionPolicy Bypass -File scripts/generate-android-assets.ps1
     ```
3. **Crear el registro de la App en App Store Connect**:
   - Entra a [App Store Connect](https://appstoreconnect.apple.com/) $\rightarrow$ **Mis Apps $\rightarrow$ (+ Nueva App)**.
   - Selecciona plataforma **iOS**, Nombre: `ProFuncional`, Idioma principal: `Spanish`, **Bundle ID**: `com.profuncional.app` y SKU: `PROFUNCIONAL-01`.
4. **Firmar y enviar la compilación a App Store Connect**:
   - **Opción A — Desde una Mac con Xcode**:
     1. Ejecuta `npm run mobile:open:ios` (abre `ios/App/App.xcodeproj` en Xcode).
     2. En Xcode selecciona el proyecto **App** $\rightarrow$ pestaña **Signing & Capabilities** $\rightarrow$ marca *Automatically manage signing* y elige tu **Team** de Apple Developer.
     3. En la barra superior elige como destino **Any iOS Device (arm64)** y ve al menú **Product $\rightarrow$ Archive**.
     4. Al finalizar el archivo, haz clic en **Distribute App $\rightarrow$ App Store Connect $\rightarrow$ Upload**.
   - **Opción B — Sin tener Mac física (Usando GitHub Actions `macos-14` o Codemagic)**:
     - El job `build-ios` en `.github/workflows/build-mobile-apk.yml` ya compila el proyecto en un servidor **macOS 14 con Xcode** en GitHub Actions y genera el artefacto `ProFuncional-iOS-AppStore-IPA`.
     - Puedes conectar tu repositorio a [Codemagic](https://codemagic.io/) (tiene capa gratuita con Mac) o agregar tu certificado `.p12` y *Provisioning Profile* de Apple en GitHub Actions para que suba el `.ipa` directamente a **TestFlight / App Store Connect** en cada push.
5. **Publicar en la tienda**:
   - Una vez procesado el build en **App Store Connect**, agrégalo a la versión `1.0`, adjunta las capturas de pantalla de iPhone y presiona **Submit for Review**.

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

## 🧪 Pruebas y Validación — Hito 3 UNAB

Para ejecutar las pruebas en vivo, primero levanta el backend (`cd backend && npm run start:dev`) y luego ejecuta cualquiera de los siguientes comandos desde la raíz del proyecto:

```bash
# 🌟 Ejecutar TODAS las suites juntas (Orquestador Maestro en 15s):
node scripts/run-all-tests.mjs

# 🧪 Pruebas Funcionales Generales (Logins, JWT, Health):
node scripts/run-functional-tests.mjs

# 🛡️ Pruebas de Seguridad y Privilegios RBAC (Guards, 403 Forbidden):
node scripts/run-security-rbac-tests.mjs

# 🩺 Pruebas de Ficha Clínica Kinésica (SOAP, dolor EVA 1-10 y ROM °):
node scripts/run-clinical-tests.mjs

# 📋 Pruebas de Reglas de Negocio, Cancelaciones 3h y Saldos:
node scripts/run-business-rules-tests.mjs

# 💳 Pruebas de Pasarela de Pagos Mercado Pago y Webhooks:
node scripts/run-payments-tests.mjs

# 🚀 Pruebas No Funcionales (Carga con 50 usuarios concurrentes):
node scripts/run-load-tests.mjs
```

> 📄 **Guía detallada:** Consulta [COMANDOS_PRUEBAS.md](file:///d:/Codigos%20de%20prueba/Pro-Funcional/COMANDOS_PRUEBAS.md).  
> 📂 **Evidencias generadas:** Se guardan automáticamente en [evidencias/](file:///d:/Codigos%20de%20prueba/Pro-Funcional/evidencias/).

---

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
