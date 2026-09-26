# 📋 Tablero de Historias de Usuario — Sprint 3

## 📊 Tablero General

| Name | Status | Person | Date | Horas Invertidas | Number | Select |
|---|---|---|:---:|:---:|:---:|:---:|
| **HU-12 · Desplegar backend en AWS** | `In progress` | Rodrigo Venegas, Kevin Soto | 25/09/2026 | 32 | 12 | Sprint 3 |
| **HU-13 · Gestión segura de secretos** | `In progress` | Kevin Soto | 25/09/2026 | 12 | 13 | Sprint 3 |
| **HU-14 · Base de datos gestionada en AWS (RDS/Aurora)** | `Not started` | Rodrigo Venegas | 25/09/2026 | 20 | 14 | Sprint 3 |
| **HU-15 · CI/CD para frontend y backend** | `Not started` | Kevin Soto, Pablo Loncón | 25/09/2026 | 20 | 15 | Sprint 3 |
| **HU-16 · Spike — Arquitectura infra y costes** | `Done` | Rodrigo Venegas | 25/09/2026 | 8 | 16 | Sprint 3 |
| **HU-17 · Mobile-first — ajustes de diseño y breakpoints** | `In progress` | Pablo Loncón, Sebastián López | 25/09/2026 | 20 | 17 | Sprint 3 |
| **HU-18 · Interacciones táctiles y accesibilidad (a11y)** | `Not started` | Sebastián López | 25/09/2026 | 12 | 18 | Sprint 3 |
| **HU-19 · Ajuste responsivo de la cuadrícula de horarios** | `Not started` | Pablo Loncón, Kevin Soto | 25/09/2026 | 32 | 19 | Sprint 3 |

---

## 🗂️ Detalle de Historias de Usuario (Contenido Interno por Tarjeta)

### 📌 HU-12 · Desplegar backend en AWS

#### 👤 Historia de Usuario
> **Como** Ingeniero DevOps / Desarrollador Backend,  
> **Quiero** provisionar una infraestructura automatizada y escalable en AWS (VPC, Subnets públicas/privadas, Security Groups, ALB, ECS Fargate y CloudWatch),  
> **Para** poner la API backend de ProFuncional en un entorno productivo de alta disponibilidad, accesible públicamente con balanceo de carga HTTPS.

#### ✅ Criterios de Aceptación
1. **VPC y Subredes:** VPC configurada con subredes públicas (ALB y NAT Gateway) y subredes privadas aisladas para las tareas ECS Fargate.
2. **Application Load Balancer (ALB):** ALB desplegado en subredes públicas con certificado SSL (AWS ACM) administrando tráfico HTTPS (puerto 443) con redirección desde HTTP (puerto 80).
3. **Security Groups:** Ingress del ALB accesible en 80/443; Ingress de tareas ECS limitado estrictamente al Security Group del ALB.
4. **Cluster ECS Fargate:** Cluster ECS configurado con Task Definitions que ejecutan la imagen Docker NestJS de forma Serverless.
5. **Logging CloudWatch:** Centralización de logs de aplicación `stdout`/`stderr` mediante el driver `awslogs` en AWS CloudWatch.
6. **Proceso Reproducible:** Infraestructura automatizada mediante código (IaC con Terraform/CDK) para entornos reproducibles.

#### 🔄 Flujo Principal
1. El equipo o pipeline aplica la infraestructura definida en código (IaC) en AWS.
2. La tarea de ECS Fargate inicializa el contenedor con la imagen Docker del backend NestJS en la subred privada.
3. El Application Load Balancer realiza el chequeo de salud en `/api/v1/health` hasta obtener un estado HTTP `200 OK`.
4. El ALB enruta las solicitudes HTTPS entrantes de los clientes hacia las tareas activas de ECS de manera balanceada.
5. Los eventos y registros del servidor se emiten de forma continua en AWS CloudWatch Logs.

---

### 📌 HU-13 · Gestión segura de secretos

#### 👤 Historia de Usuario
> **Como** Responsable de Seguridad / DevOps,  
> **Quiero** integrar AWS Secrets Manager para almacenar credenciales sensibles (JWT secrets, DB URL, claves de pasarela),  
> **Para** inyectarlas dinámicamente en tiempo de ejecución (runtime) sin exponer secretos en el repositorio ni scripts de despliegue.

#### ✅ Criterios de Aceptación
1. **Sin Secretos en Repo:** Cero credenciales, tokens JWT o cadenas de conexión a BD expuestas en el código fuente o archivos de configuración.
2. **Cifrado KMS:** Todos los secretos resguardados en AWS Secrets Manager cifrados mediante AWS KMS.
3. **Lectura en Runtime:** La Task Definition de ECS inyecta las variables de entorno (`DATABASE_URL`, `JWT_SECRET`) directamente desde Secrets Manager al arrancar el contenedor.
4. **Políticas IAM de Menor Privilegio:** IAM Execution Role de ECS con permisos acotados únicamente a `secretsmanager:GetSecretValue` para las claves autorizadas.

#### 🔄 Flujo Principal
1. Se almacenan las credenciales cifradas en AWS Secrets Manager (`profuncional/prod/config`).
2. Al iniciar la tarea en ECS Fargate, AWS resuelve los ARNs de los secretos mediante la rol de ejecución IAM.
3. Se inyectan las claves como variables de entorno seguras en la memoria del contenedor.
4. El backend NestJS inicializa sus servicios (Prisma ORM, autenticación JWT) consumiendo las variables de forma segura.

---

### 📌 HU-14 · Base de datos gestionada en AWS (RDS/Aurora)

#### 👤 Historia de Usuario
> **Como** Desarrollador Backend,  
> **Quiero** aprovisionar e integrar una base de datos PostgreSQL gestionada en AWS RDS (o Aurora),  
> **Para** contar con alta disponibilidad, backups automáticos y ejecutar migraciones seguras mediante Prisma ORM.

#### ✅ Criterios de Aceptación
1. **Aislamiento Privado:** Instancia RDS PostgreSQL alojada en subredes privadas (DB Subnet Group) sin dirección IP pública.
2. **Security Group Restringido:** Tráfico entrante en puerto `5432` limitado únicamente al Security Group de las tareas ECS del backend.
3. **Backups & PITR:** Backups automáticos diarios activados con ventana de retención (7+ días) y recuperación a un punto en el tiempo (*Point-In-Time Recovery*).
4. **Prisma SSL:** Datasource de Prisma en NestJS configurado con conexión cifrada (`sslmode=require`).
5. **Migraciones en Pipeline:** Ejecución transparente del comando `npx prisma migrate deploy` durante el flujo de despliegue.

#### 🔄 Flujo Principal
1. Se crea la instancia RDS PostgreSQL en las subredes privadas de la VPC.
2. Se inyecta la URI de conexión de RDS con SSL activado en Secrets Manager.
3. Durante la fase de release del pipeline, se ejecuta `prisma migrate deploy` actualizando el esquema.
4. El backend abre el pool de conexiones con RDS y procesa lecturas/escrituras en producción.

---

### 📌 HU-15 · CI/CD para frontend y backend

#### 👤 Historia de Usuario
> **Como** Desarrollador del equipo,  
> **Quiero** disponer de pipelines de CI/CD automatizados en GitHub Actions para Frontend y Backend,  
> **Para** compilar, probar y desplegar automáticamente cada cambio aceptado en `main` sin interrupciones del servicio.

#### ✅ Criterios de Aceptación
1. **Triggers Automáticos:** Pipelines activados automáticamente ante eventos `push` y `pull_request` en la rama `main`.
2. **Pipeline Backend:** Linter/TypeScript Check -> Tests Unitarios -> Build de imagen Docker -> Push a Amazon ECR -> Actualización del servicio ECS Fargate (Rolling Update sin downtime).
3. **Pipeline Frontend:** Linter -> Tests -> Compilación estática con Vite -> Sync a AWS S3 Bucket -> Invalidation de caché en Amazon CloudFront (`/*`).
4. **Seguridad en Actions:** Almacenamiento seguro de llaves AWS, IDs de distribución y variables de entorno en GitHub Actions Secrets.

#### 🔄 Flujo Principal
1. Un desarrollador aprueba y realiza el merge de un PR a la rama `main`.
2. GitHub Actions dispara en paralelo las tareas de compilación y prueba de Frontend y Backend.
3. **Backend:** Compila código, ejecuta tests, construye la imagen Docker, la sube a ECR y actualiza el servicio ECS Fargate.
4. **Frontend:** Genera los artefactos web estáticos (`dist`), los sube al bucket S3 y solicita la invalidación de la CDN CloudFront.
5. GitHub notifica el estado de despliegue exitoso al equipo.

---

### 📌 HU-16 · Spike — Arquitectura infra y costes

#### 👤 Historia de Usuario
> **Como** Líder Técnico / Arquitecto de Software,  
> **Quiero** elaborar un estudio comparativo técnico (ECS Fargate vs Lambda vs EC2) con estimaciones presupuestarias,  
> **Para** recomendar la opción de infraestructura más eficiente en costo y operación antes de su implementación.

#### ✅ Criterios de Aceptación
1. **Informe Comparativo:** Documento técnico detallado evaluando 3 opciones (ECS Fargate, AWS Lambda + API Gateway, EC2 Monolítico t3.micro/small).
2. **Matriz de Criterios:** Comparativa según costo mensual (tráfico bajo, medio, alto), latencia/cold starts, escalabilidad, soporte a pool de conexiones Prisma y esfuerzo de mantenimiento.
3. **Desglose de Costos:** Presupuesto estimado en USD para escenarios de 100, 1,000 y 10,000 usuarios activos mensuales.
4. **Recomendación Fundamentada:** Definición explícita de la arquitectura recomendada para el MVP y estrategia de escalamiento.

#### 🔄 Flujo Principal
1. Recopilar proyecciones de volumen de transacciones y tráfico del sistema ProFuncional.
2. Simular escenarios de costos de infraestructura utilizando AWS Pricing Calculator.
3. Analizar la factibilidad técnica y rendimiento de Prisma ORM en Serverless vs Contenedores.
4. Consolidar el documento final de Spike y validar la arquitectura elegida con el equipo.

---

### 📌 HU-17 · Mobile-first — ajustes de diseño y breakpoints

#### 👤 Historia de Usuario
> **Como** Alumno/Paciente utilizando la app en smartphone (360x800px),  
> **Quiero** una interfaz optimizada mobile-first con breakpoints fluidos, tamaños de fuente legibles y contenedores adaptados,  
> **Para** navegar intuitivamente, consultar mis datos y agendar clases sin desbordamientos de pantalla.

#### ✅ Criterios de Aceptación
1. **Estrategia Mobile-First:** Estilos base desarrollados para pantallas pequeñas (`<640px`) con reglas responsivas superiores (`sm:`, `md:`, `lg:`).
2. **Sin Overflow Horizontal:** Ausencia total de scroll horizontal accidental en la vista principal en teléfonos de 360px a 430px de ancho.
3. **Tipografía Legible:** Tamaño mínimo de fuente `16px` en inputs para prevenir el auto-zoom en iOS Safari.
4. **Espaciados Consistentes:** Márgenes contenedores fluidos (`px-4` / `16px` en móvil, `px-6`/`px-8` en tablet/escritorio).
5. **Safe Areas:** Integración con zonas seguras nativas (*Notch / Home Indicator*) en teléfonos modernos.

#### 🔄 Flujo Principal
1. El alumno abre la aplicación desde un celular (360x800px).
2. La interfaz distribuye verticalmente el menú, la tarjeta de próxima cita y el saldo disponible.
3. El alumno navega por las pantallas sin requerir zoom manual ni desplazamientos laterales.

---

### 📌 HU-18 · Interacciones táctiles y accesibilidad (a11y)

#### 👤 Historia de Usuario
> **Como** Paciente o Usuario asistido por lectores de pantalla,  
> **Quiero** contar con objetivos táctiles amplios (≥44x44px), interacción independiente de hover y etiquetas ARIA apropiadas,  
> **Para** operar la aplicación de forma ágil, sin toques erróneos y con total accesibilidad.

#### ✅ Criterios de Aceptación
1. **Target Táctil Mínimo (≥44px):** Botones, iconos interactivos y casillas de selección con área de toque mínima de 44x44px (`min-h-[44px] min-w-[44px]`).
2. **Sin Dependencia de Hover:** Ninguna acción crítica requiere pasar el cursor por encima (`:hover`).
3. **Focus State Visibles:** Indicador de foco visible (`focus-visible:ring-2 focus-visible:ring-emerald-400`) para navegación asistida o por teclado.
4. **Etiquetas ARIA:** Implementación de `aria-label`, `aria-expanded`, `aria-live` y `role="button"` en modales y calendarios.
5. **Contraste de Color:** Ratio de contraste de texto respecto al fondo mayor o igual a 4.5:1 (norma WCAG 2.1 AA).

#### 🔄 Flujo Principal
1. El usuario acciona un botón interactivo tocando la pantalla táctil de su teléfono.
2. El tamaño táctil amplio (≥44px) permite seleccionar la opción de inmediato sin presionar elementos vecinos.
3. Al utilizar lectores de pantalla (TalkBack/VoiceOver), la voz sintetizada lee la función de cada botón mediante sus etiquetas ARIA.

---

### 📌 HU-19 · Ajuste responsivo de la cuadrícula de horarios

#### 👤 Historia de Usuario
> **Como** Alumno/Paciente en la App Móvil,  
> **Quiero** una cuadrícula de horarios rediseñada para pantallas pequeñas (con carrusel horizontal por días o vista compacta en lista),  
> **Para** seleccionar y reservar mis clases kinésicas o entrenamientos fácilmente sin solapamientos.

#### ✅ Criterios de Aceptación
1. **Vistas Adaptativas:** Conmutador táctil entre "Vista Carrusel de Días" (scroll horizontal) y "Vista Lista Compacta".
2. **Indicadores de Ocupación:** Desglose visual del nivel de disponibilidad en cada bloque (`X/Y cupos libres`, tag `Agotado` en rojo, tag `Mi Reserva` en Verde Limón).
3. **Prevención Anti-Solapamiento:** Bloqueo automático si el usuario intenta reservar un bloque que se traslapa con otra cita activa o sin saldo en su paquete.
4. **Modal Táctil de Reserva:** Modal simplificado de confirmación con detalles de la cita y botón de confirmación táctil amplio (≥44px).

#### 🔄 Flujo Principal
1. El alumno accede a la sección "Reservar Clase / Hora Kinésica" en la app móvil.
2. Selecciona un día navegando por el carrusel de días de la semana.
3. Revisa la lista compacta de bloques horarios disponibles con su indicador de cupos.
4. Presiona el botón "Reservar", confirma en el modal táctil y el sistema descuenta 1 sesión actualizando el bloque a "Mi Reserva".
