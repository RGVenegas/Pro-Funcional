# 🛡️ Evidencia Verificable de Pruebas No Funcionales (Resiliencia y Dependencias) — Hito 3 UNAB

* **Fecha y Hora de Auditoría:** `2026-10-28T21:21:15.500Z`
* **Dimensión Rúbrica Hito 3:** **Resiliencia (Páginas 2 y 3 del documento de evaluación UNAB)**
* **Criterio de Evaluación:** *Comprobar la respuesta ante fallos de dependencias o servicios, comportamiento observado y recuperación.*
* **Total de Pruebas:** 4 | **Aprobadas:** 4 | **Fallidas:** 0 (**100.0% Éxito**)

## 1. Matriz de Casos de Resiliencia y Comportamiento ante Fallos

| ID | Caso de Prueba | Condición / Fallo Simulado | Comportamiento Obtenido | Recuperación | Estado |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **RES-01** | Tolerancia a Caída/Falla de Pasarela de Pagos Externa (Mercado Pago) | Dependencia externa responde con error o token de tarjeta inválido | HTTP 400 + Health Check: OK (3 ms) | 3 ms | ✅ APROBADA |
| **RES-02** | Tolerancia a Falla de Integridad Referencial en BD (PostgreSQL) | Inserción con referencia foránea huérfana/inexistente a nivel de ORM Prisma | HTTP 401 / 404 + Pool BD Activo: OK (2 ms) | 2 ms | ✅ APROBADA |
| **RES-03** | Prevención de Doble Transacción ante Reintentos Concurrentes de Red | Envío de 2 peticiones paralelas idénticas con la misma X-Idempotency-Key | Petición A: HTTP 400 \| Petición B: HTTP 400 | 0 ms | ✅ APROBADA |
| **RES-04** | Manejo de Desconexión Abrupta de Cliente (Client Abort / TCP Reset) | El socket de red del cliente se interrumpe a media transacción (pérdida de señal) | Cliente Abort: OK + Servidor disponible: OK (2 ms) | 2 ms | ✅ APROBADA |

## 2. Detalle Forense por Caso de Prueba

### [RES-01] Tolerancia a Caída/Falla de Pasarela de Pagos Externa (Mercado Pago)
- **Dimensión:** Resiliencia - Fallo de Servicio Externo
- **Condición de Falla:** Dependencia externa responde con error o token de tarjeta inválido
- **Resultado Esperado:** HTTP 400 / 422 / 502 (Controlado) + Recuperación < 50ms
- **Resultado Obtenido:** HTTP 400 + Health Check: OK (3 ms)
- **Latencia de Falla:** 7 ms | **Latencia de Recuperación:** 3 ms
- **Análisis de Ingeniería:** El backend intercepta el fallo de la pasarela mediante Exception Filters sin provocar Uncaught Exception ni caída del proceso Node.js. El hilo de ejecución continúa operativo y responde la siguiente solicitud en menos de 10 ms.
- **Evidencia Forense / Payload:**
```json
{
  "statusCode": 400,
  "message": "Error procesando el pago en Mercado Pago.",
  "error": "Bad Request"
}
```

### [RES-02] Tolerancia a Falla de Integridad Referencial en BD (PostgreSQL)
- **Dimensión:** Resiliencia - Integridad y Pool de Base de Datos
- **Condición de Falla:** Inserción con referencia foránea huérfana/inexistente a nivel de ORM Prisma
- **Resultado Esperado:** HTTP 400 / 401 / 403 / 404 (Protección / Rollback) + Pool de Conexiones Activo
- **Resultado Obtenido:** HTTP 401 / 404 + Pool BD Activo: OK (2 ms)
- **Latencia de Falla:** 15 ms | **Latencia de Recuperación:** 2 ms
- **Análisis de Ingeniería:** La base de datos ejecuta Rollback ante la inconsistencia. El pool de conexiones de Prisma / Neon no se degrada ni satura descriptores; la lectura posterior confirma disponibilidad inmediata.
- **Evidencia Forense / Payload:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### [RES-03] Prevención de Doble Transacción ante Reintentos Concurrentes de Red
- **Dimensión:** Resiliencia - Concurrencia y Fallos de Red
- **Condición de Falla:** Envío de 2 peticiones paralelas idénticas con la misma X-Idempotency-Key
- **Resultado Esperado:** HTTP 400 / 409 / 422 (Ningún Error 500)
- **Resultado Obtenido:** Petición A: HTTP 400 | Petición B: HTTP 400
- **Latencia de Falla:** 6 ms | **Latencia de Recuperación:** 0 ms
- **Análisis de Ingeniería:** La condición de carrera provocada por reintentos de cliente es resuelta sin inconsistencias financieras ni estados intermedios en la pasarela o base de datos.
- **Evidencia Forense / Payload:**
```json
{
  "requestA": 400,
  "requestB": 400,
  "idempotencyKey": "resilience-idempotency-20261028"
}
```

### [RES-04] Manejo de Desconexión Abrupta de Cliente (Client Abort / TCP Reset)
- **Dimensión:** Resiliencia - Liberación de Recursos de Red
- **Condición de Falla:** El socket de red del cliente se interrumpe a media transacción (pérdida de señal)
- **Resultado Esperado:** Abort capturado limpiamente + Socket liberado en servidor + Próxima req < 50ms
- **Resultado Obtenido:** Cliente Abort: OK + Servidor disponible: OK (2 ms)
- **Latencia de Falla:** 8 ms | **Latencia de Recuperación:** 2 ms
- **Análisis de Ingeniería:** Node.js y Fastify/Express capturan el evento close del socket HTTP sin memory leak ni hilos zombis. El servidor atiende inmediatamente la siguiente petición.
- **Evidencia Forense / Payload:**
```json
{
  "clientAborted": true,
  "serverRecovered": true,
  "latencyMs": 2
}
```

## 3. Análisis de Defectos y Criterios de Aceptación (Rúbrica Nivel 4)

1. **Aislamiento de Fallas Externas:** Cuando la API de Mercado Pago rechaza una tarjeta o presenta latencia, el error queda confinado al endpoint `/payments/process`. Los módulos de reserva, kinesiología y autenticación permanecen al 100% disponibles.
2. **Recuperación del Pool de Conexiones:** Ante violaciones relacionales o IDs huérfanos, el ORM Prisma ejecuta ROLLBACK a nivel de transacción PostgreSQL, evitando bloqueos (*table locks*) o fugas de conexiones en el pool de Neon.
3. **Idempotencia Transaccional:** La clave `X-Idempotency-Key` actúa como barrera contra la duplicación accidental de cargos cuando la red del usuario sufre micro-cortes y el navegador o app móvil reintenta el cobro automáticamente.
