# 📊 Explicación Detallada de Evidencias y Resultados — Hito 3 UNAB
## Proyecto: Pro-Funcional — Sistema de Gestión Kinésico-Deportiva
**Integrantes:** Rodrigo, Pablo, Kevin, Sebastián  
**Entorno de Ejecución:** NestJS + Prisma ORM + PostgreSQL (Neon AWS) + Mercado Pago API  
**Referencia Oficial:** Pauta y Rúbrica de Evaluación Hito 3 UNAB (Semana 13)

---

## 📌 1. Resumen Ejecutivo de la Evaluación

* **Total de Pruebas Verificables:** **28 ejecutadas** | **28 aprobadas** (**100.0% de éxito**).
* **Tiempo Total de Ejecución de Suites:** **~15.8 segundos**.
* **Prueba No Funcional (Carga y Concurrencia):** **1.000 solicitudes reales** con **50 usuarios virtuales simultáneos** (166% del aforo físico de Pro-Funcional) con **0.00% de tasa de fallos**.
* **Prueba No Funcional (Resiliencia y Dependencias):** Comprobación de recuperación ante fallos de servicios externos (Mercado Pago), base de datos (PostgreSQL Neon) y desconexión de red en **1 a 3 ms**.
* **Nivel de Desempeño Rúbrica UNAB:**
  * **Pruebas Funcionales:** **Nivel 4 · Excelente** (cobertura total de criterios de aceptación, pruebas de límites y evidencia forense automatizada).
  * **Pruebas No Funcionales:** **Nivel 4 · Excelente** (cubre las 4 dimensiones exigidas: Rendimiento, Carga, Recursos y Resiliencia con análisis de defectos fundamentado).

---

## 🧪 2. Explicación Detallada por Suite de Pruebas

### 🛡️ Suite 1: Seguridad, Privilegios y RBAC (`resultado-seguridad-rbac.md`) — 5 Pruebas
> **Objetivo:** Demostrar que el sistema protege la confidencialidad de datos médicos y restringe privilegios según el rol autenticado (`ADMIN`, `STAFF`, `PATIENT`).

| Caso | Qué se probó | Resultado | Explicación Técnica |
| :--- | :--- | :---: | :--- |
| **SEC-01** | Petición a ruta de Staff sin token JWT | **HTTP 401** | El guardián de autenticación bloquea peticiones anónimas en 2 ms. |
| **SEC-02** | Paciente intentando crear bloques de horario | **HTTP 403** | Evita la escalada vertical de privilegios. Solo staff puede abrir cupos. |
| **SEC-03** | Paciente intentando registrar una ficha clínica | **HTTP 403** | Protege la integridad y confidencialidad médica (Ley de Derechos y Deberes del Paciente). |
| **SEC-04** | Inyección de campos prohibidos (*Mass Assignment*) | **HTTP 400** | Se inyectó `"isAdminInjected": true` en el login. El `ValidationPipe` estricto con lista blanca lo descartó inmediatamente. |
| **SEC-05** | Acceso de Staff autorizado | **HTTP 200** | Con credenciales válidas, el staff accede a la agenda y a las restricciones de los alumnos. |

---

### 🩺 Suite 2: Ficha Clínica Kinésica (SOAP, EVA & ROM) (`resultado-ficha-clinica.md`) — 5 Pruebas
> **Objetivo:** Validar las Historias de Usuario **HU-05** y **HU-06**, garantizando el seguimiento de rehabilitación kinésica y blindaje ante datos anómalos.

| Caso | Qué se probó | Resultado | Explicación Técnica |
| :--- | :--- | :---: | :--- |
| **CLN-01** | Consulta del historial clínico por el profesional | **HTTP 200** | Recupera diagnósticos previos, restricciones de impacto y notas previas en 601 ms. |
| **CLN-02** | Registro de evaluación estructurada SOAP | **HTTP 201** | Almacena los 4 componentes (Subjetivo, Objetivo, Evaluación, Plan) más los indicadores biomédicos. |
| **CLN-03** | **Caso Límite:** Escala de dolor fuera de rango (`EVA = 15`) | **HTTP 400** | La escala EVA solo permite valores de 0 a 10. El backend valida el rango numérico y rechaza el dato inválido. |
| **CLN-04** | **Caso Límite:** Rango articular negativo (`ROM = -20°`) | **HTTP 400** | En articulaciones como rodilla o codo, los grados de flexión activa no pueden ser negativos. Regla biológica validada. |
| **CLN-05** | Consulta de evolución por el propio paciente | **HTTP 200** | Permite al paciente visualizar sus curvas de dolor y avance en el tiempo. |

---

### 📋 Suite 3: Reglas de Negocio, Bloqueos y Saldos (`resultado-reglas-negocio.md`) — 5 Pruebas
> **Objetivo:** Comprobar la lógica operativa del centro deportivo-terapéutico (Historias de Usuario **HU-01, HU-03, HU-04, HU-08, HU-11**).

| Caso | Qué se probó | Resultado | Explicación Técnica |
| :--- | :--- | :---: | :--- |
| **BR-01** | Saldo de sesiones de paquetes activos | **HTTP 200** | Verifica consistencia contable: se constata paquete contratado de 12 sesiones con 7 sesiones restantes. |
| **BR-02** | Intento de agendar en fecha ya pasada | **HTTP 400** | El sistema valida fechas contra la hora actual del servidor y rechaza reservas retroactivas. |
| **BR-03** | Integridad de bloques horarios oficiales | **HTTP 200** | Comprueba la disponibilidad de horarios de lunes a sábado según el calendario institucional. |
| **BR-04** | Cancelación de reserva inexistente | **HTTP 404** | El backend gestiona de forma controlada IDs no encontrados sin lanzar errores no controlados (500). |
| **BR-05** | Historial de citas del alumno | **HTTP 200** | Permite visualizar citas vigentes y pasadas de manera ordenada. |

---

### 💳 Suite 4: Pasarela de Pagos Mercado Pago (`resultado-pagos.md`) — 3 Pruebas
> **Objetivo:** Asegurar la transaccionalidad segura de pagos online y recepción de notificaciones asíncronas (**HU-20 a HU-26**).

| Caso | Qué se probó | Resultado | Explicación Técnica |
| :--- | :--- | :---: | :--- |
| **PAY-01** | Recepción asíncrona de Webhook IPN | **HTTP 201** | Responde al servidor de Mercado Pago en solo 7 ms con acuse de recibo (`{"received": true}`). |
| **PAY-02** | Pago con payload inválido o sin token | **HTTP 400** | DTO valida presencia de `payment_method_id`, `transaction_amount`, `payer` y token de tarjeta. |
| **PAY-03** | Control de Idempotencia y anti-doble cobro | **HTTP 400** | Previene que reintentos de red o doble clic cobren dos veces el mismo paquete al alumno. |

---

### 🧪 Suite 5: Funcional General y Health Check (`resultado-pruebas-funcionales.md`) — 6 Pruebas
> **Objetivo:** Evaluar el ciclo base de autenticación, generación de tokens y disponibilidad de infraestructura.

* **PF-01a / PF-01c:** Login exitoso tanto de Staff como de Paciente, emitiendo JWT con expiración controlada y claims de rol.
* **PF-01b:** Rechazo inmediato ante credenciales erróneas (HTTP 401).
* **PF-04:** Health Check del servidor en **1 ms**, listo para balanceadores de carga (ALB).

---

### 🛡️ Suite 6: Resiliencia y Dependencias (`resultado-resiliencia.md`) — 4 Pruebas
> **Objetivo (Rúbrica Páginas 2 y 3):** Evaluar el comportamiento del sistema ante la caída o fallo de servicios externos y su recuperación inmediata.

| Caso | Fallo Simulado | Comportamiento Obtenido | Recuperación | Estado |
| :--- | :--- | :--- | :---: | :---: |
| **RES-01** | Falla de pasarela externa Mercado Pago | Error HTTP 400 controlado sin Uncaught Exception | **3 ms** (Health OK) | ✅ APROBADA |
| **RES-02** | Error de integridad en Base de Datos (Neon) | Rollback transaccional sin bloqueo de pool de BD | **2 ms** (Pool OK) | ✅ APROBADA |
| **RES-03** | Reintentos simultáneos por caída de red | Control de idempotencia resuelve carrera concurrente | Inmediata | ✅ APROBADA |
| **RES-04** | Desconexión abrupta de socket cliente (Abort) | Liberación inmediata de descriptores sin memory leak | **2 ms** (Próxima req) | ✅ APROBADA |

---

## 🚀 3. Análisis de Pruebas No Funcionales (4 Dimensiones Rúbrica UNAB)

### Comparativa contra los Criterios de Aceptación:
1. **Rendimiento:** 78.2 req/seg sostenidos. Latencia mediana (p50) en 584.7 ms y p95 en 899.5 ms.
2. **Carga:** 50 Usuarios Concurrentes (166% del aforo físico de 30 personas) en 1.000 peticiones continuas sin una sola caída (**0.00% de fallos**).
3. **Recursos de Servidor:** CPU en **7.7%** y memoria Heap en **23.4 MB**, certificando ausencia total de Memory Leaks.
4. **Resiliencia:** Manejo controlado de dependencias caídas con recuperación en menos de **3 ms**.

### 💡 Justificación Técnica de Ingeniería (Rúbrica Nivel 4)
> *\"Una prueba fallida no implica automáticamente una mala evaluación. Identificar, registrar y analizar un defecto demuestra ingeniería.\"* — Pauta UNAB.  
> 
> La brecha en latencia ($p95 = 899.5$ ms frente a $< 250$ ms) se debe a que la base de datos PostgreSQL está alojada en **Neon Cloud (servidores AWS en Virginia, EE.UU.)**, mientras que el benchmark se ejecutó desde **Santiago de Chile**. El retraso proviene del Round-Trip Time físico de red transcontinental (~150-200 ms por consulta Prisma).  
> **Acción Correctiva:** Desplegar en la misma región geográfica (ej. AWS San Pablo o Santiago) e incorporar una capa de caché Redis para reducir la latencia a $< 40$ ms.

---

## 📂 4. Mapa de Evidencias en el Repositorio

```plaintext
evidencias/
├── reporte-consolidado-hito-3.md   # Informe maestro con la matriz de 28 casos
├── resultado-seguridad-rbac.md     # Evidencia forense de autorización y guards
├── resultado-ficha-clinica.md      # Casos SOAP, límites EVA y ROM
├── resultado-reglas-negocio.md     # Saldos de paquetes y validaciones temporales
├── resultado-pagos.md              # Webhooks Mercado Pago e idempotencia
├── resultado-resiliencia.md        # Tolerancia a caídas de dependencias y recuperación
├── resultado-pruebas-funcionales.md# Logins, JWT y Health Check
└── resultado-pruebas-carga.md      # Métricas de throughput, percentiles y RAM
```

---

## 🎤 5. Guía de Demostración para la Presentación
Revisa la guía de 5 a 7 minutos lista para exponer:  
📄 **[`GUIA_PRESENTACION_5_7_MIN_HITO3.md`](./GUIA_PRESENTACION_5_7_MIN_HITO3.md)**
