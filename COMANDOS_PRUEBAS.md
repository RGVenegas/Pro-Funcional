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
Ejecuta las 5 suites en cascada (24 pruebas) y genera el informe consolidado final en 15 segundos:
```bash
node scripts/run-all-tests.mjs
```

---

#### 2. 🧪 Pruebas Funcionales Generales
Evalúa autenticación Staff y Paciente, emisión de token JWT, consulta de bloques de agenda, RBAC y Health Check del sistema:
```bash
node scripts/run-functional-tests.mjs
```

---

#### 3. 🛡️ Pruebas de Seguridad y Privilegios RBAC
Evalúa que un paciente NO pueda acceder a rutas de Staff (HTTP 403), protección contra inyección de campos (*Mass Assignment*) y confidencialidad médica:
```bash
node scripts/run-security-rbac-tests.mjs
```

---

#### 4. 🩺 Pruebas de Ficha Clínica Kinésica (SOAP, EVA & ROM)
Evalúa el registro de notas SOAP por parte del kinesiólogo, casos límite de dolor fuera de escala (ej: EVA = 15 o ROM = -20°) y consulta de avance del paciente:
```bash
node scripts/run-clinical-tests.mjs
```

---

#### 5. 📋 Pruebas de Reglas de Negocio, Cancelaciones y Saldos
Evalúa la consulta de sesiones restantes del paquete activo, bloqueo de agendamiento en fechas pasadas y coherencia de horarios oficiales:
```bash
node scripts/run-business-rules-tests.mjs
```

---

#### 6. 💳 Pruebas de Pasarela de Pagos (Mercado Pago)
Evalúa la recepción asíncrona de Webhooks IPN transaccionales, validación de datos de pago y control de idempotencia (`X-Idempotency-Key`):
```bash
node scripts/run-payments-tests.mjs
```

---

#### 7. 🚀 Prueba No Funcional (Carga, Rendimiento y Hardware)
Lanza 1.000 solicitudes reales con 50 usuarios virtuales concurrentes (166% del aforo del gimnasio), midiendo Throughput, percentil 95 ($p95$) y memoria RAM:
```bash
node scripts/run-load-tests.mjs
```

---

### 💡 Atajos Alternativos con `npm run`

También puedes usar estos atajos equivalentes configurados en el `package.json`:

| Comando `node scripts/...` | Atajo `npm run ...` |
| :--- | :--- |
| `node scripts/run-all-tests.mjs` | `npm run test:all` |
| `node scripts/run-functional-tests.mjs` | `npm run test:functional` |
| `node scripts/run-security-rbac-tests.mjs` | `npm run test:security` |
| `node scripts/run-clinical-tests.mjs` | `npm run test:clinical` |
| `node scripts/run-business-rules-tests.mjs` | `npm run test:business` |
| `node scripts/run-payments-tests.mjs` | `npm run test:payments` |
| `node scripts/run-load-tests.mjs` | `npm run test:load` |

---

### 📂 ¿Dónde se guardan los resultados automáticamente?

Cada vez que se ejecuta cualquiera de estos comandos, los resultados y evidencias forenses se guardan automáticamente en la carpeta raíz:

📁 **[`evidencias/`](./evidencias/)**
* `evidencias/reporte-consolidado-hito-3.md` *(Informe maestro global)*
* `evidencias/resultado-pruebas-funcionales.md` y `.json`
* `evidencias/resultado-seguridad-rbac.md` y `.json`
* `evidencias/resultado-ficha-clinica.md` y `.json`
* `evidencias/resultado-reglas-negocio.md` y `.json`
* `evidencias/resultado-pagos.md` y `.json`
* `evidencias/resultado-pruebas-carga.md` y `.json`
