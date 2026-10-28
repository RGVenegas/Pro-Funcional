# 🧪 Guía Rápida de Comandos de Pruebas — Hito 3 UNAB
## Proyecto: Pro-Funcional — Sistema de Gestión Kinésico-Deportiva

Esta guía contiene los comandos exactos para que cualquier integrante del equipo (**Rodrigo, Pablo, Kevin, Sebastián**) pueda ejecutar y verificar las pruebas del Hito 3 en su máquina.

---

### ⚠️ Requisito Previo (Tener el Backend Levantado)

Antes de ejecutar cualquier prueba, abre una terminal y levanta el backend:

```bash
cd backend
npm run start:dev
```
*(Espera a que la consola confirme que el servidor está corriendo en `http://localhost:3001/api`).*

---

### 🚀 Comandos Directos: `node scripts/run-...`

Abre **otra terminal** en la carpeta principal del proyecto (`Pro-Funcional`) y ejecuta cualquiera de los siguientes comandos según lo que desees probar:

#### 1. 🌟 Correr TODO Junto (Orquestador Maestro)
Ejecuta las 6 suites en cascada (28 pruebas verificables) y genera el informe consolidado maestro en ~15 segundos:
```bash
node scripts/run-all-tests.mjs
# o bien: npm run test:all
```

---

#### 2. 🧪 Pruebas Funcionales Generales
Evalúa autenticación Staff y Paciente, emisión de token JWT, consulta de bloques de agenda, RBAC y Health Check del sistema:
```bash
node scripts/run-functional-tests.mjs
# o bien: npm run test:functional
```

---

#### 3. 🛡️ Pruebas de Seguridad y Privilegios RBAC
Evalúa que un paciente NO pueda acceder a rutas de Staff (HTTP 403), protección contra inyección de campos (*Mass Assignment*) y confidencialidad médica:
```bash
node scripts/run-security-rbac-tests.mjs
# o bien: npm run test:security
```

---

#### 4. 🩺 Pruebas de Ficha Clínica Kinésica (SOAP, EVA & ROM)
Evalúa el registro de notas SOAP por parte del kinesiólogo, casos límite de dolor fuera de escala (ej: EVA = 15 o ROM = -20°) y consulta de avance del paciente:
```bash
node scripts/run-clinical-tests.mjs
# o bien: npm run test:clinical
```

---

#### 5. 📋 Pruebas de Reglas de Negocio, Cancelaciones y Saldos
Evalúa la consulta de sesiones restantes del paquete activo, bloqueo de agendamiento en fechas pasadas y coherencia de horarios oficiales:
```bash
node scripts/run-business-rules-tests.mjs
# o bien: npm run test:business
```

---

#### 6. 💳 Pruebas de Pasarela de Pagos (Mercado Pago)
Evalúa la recepción asíncrona de Webhooks IPN transaccionales, validación de datos de pago y control de idempotencia (`X-Idempotency-Key`):
```bash
node scripts/run-payments-tests.mjs
# o bien: npm run test:payments
```

---

#### 7. 🛡️ Pruebas No Funcionales de Resiliencia y Dependencias (Rúbrica Hito 3)
Evalúa la tolerancia a fallos ante caída de dependencias externas (Mercado Pago), integridad referencial en BD (Rollback en Neon), concurrencia de red y desconexión abrupta de sockets con recuperación en < 50 ms:
```bash
node scripts/run-resilience-tests.mjs
# o bien: npm run test:resilience
```

---

#### 8. 🚀 Pruebas No Funcionales de Carga, Rendimiento y Hardware
Lanza 1.000 solicitudes reales con 50 usuarios virtuales concurrentes (166% del aforo del gimnasio), midiendo Throughput, percentil 95 ($p95$), CPU y memoria RAM:
```bash
node scripts/run-load-tests.mjs
# o bien: npm run test:load
```

---

### 💡 Atajos Alternativos con `npm run`

También puedes usar estos atajos equivalentes configurados en el `package.json`:

| Comando `node scripts/...` | Atajo `npm run ...` | Dimensión / Tipo |
| :--- | :--- | :--- |
| `node scripts/run-all-tests.mjs` | `npm run test:all` | **Orquestador Maestro (28 pruebas)** |
| `node scripts/run-functional-tests.mjs` | `npm run test:functional` | Funcional General |
| `node scripts/run-security-rbac-tests.mjs` | `npm run test:security` | Seguridad y RBAC |
| `node scripts/run-clinical-tests.mjs` | `npm run test:clinical` | Ficha Kinésica SOAP / Límites |
| `node scripts/run-business-rules-tests.mjs` | `npm run test:business` | Reglas de Negocio y Saldos |
| `node scripts/run-payments-tests.mjs` | `npm run test:payments` | Pasarela Mercado Pago |
| `node scripts/run-resilience-tests.mjs` | `npm run test:resilience` | **No Funcional: Resiliencia y Fallos** |
| `node scripts/run-load-tests.mjs` | `npm run test:load` | **No Funcional: Carga y Rendimiento** |

---

### 📂 ¿Dónde se guardan los resultados automáticamente?

Cada vez que se ejecuta cualquiera de estos comandos, los resultados y evidencias forenses se guardan automáticamente en la carpeta raíz:

📁 **[`evidencias/`](./evidencias/)**
* `evidencias/reporte-consolidado-hito-3.md` *(Informe maestro global consolidado)*
* `evidencias/resultado-pruebas-funcionales.md` y `.json`
* `evidencias/resultado-seguridad-rbac.md` y `.json`
* `evidencias/resultado-ficha-clinica.md` y `.json`
* `evidencias/resultado-reglas-negocio.md` y `.json`
* `evidencias/resultado-pagos.md` y `.json`
* `evidencias/resultado-resiliencia.md` y `.json`
* `evidencias/resultado-pruebas-carga.md` y `.json`

---

### 🎤 Guía de Demostración para la Presentación
Revisa la guía paso a paso de 5 a 7 minutos para exponer la demostración ante el profesor:  
📄 **[`GUIA_PRESENTACION_5_7_MIN_HITO3.md`](./GUIA_PRESENTACION_5_7_MIN_HITO3.md)**
