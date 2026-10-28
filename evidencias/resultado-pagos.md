# 💳 Evidencia Verificable de Pasarela de Pagos Mercado Pago — Hito 3 UNAB

* **Fecha y Hora:** `2026-10-28T00:28:23.791Z`
* **Servidor Objetivo:** `http://localhost:3001/api` (NestJS + Mercado Pago Orders API)
* **Historias de Usuario:** HU-20 a HU-26 (Checkout API & Webhooks)
* **Total de Pruebas:** 3 | **Aprobadas:** 3 | **Fallidas:** 0 (**100.0% Éxito**)

## Tabla de Casos de Pasarela de Pagos

| ID | HU | Caso de Prueba | Esperado | Obtenido | Latencia | Estado |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **PAY-01** | HU-25 | Recepción asíncrona de Webhook IPN de Mercado Pago | HTTP 200 / 201 | HTTP 201 | 23 ms | ✅ APROBADA |
| **PAY-02** | HU-21 | Validación de Seguridad: Rechazo de pago con datos vacíos o sin token | HTTP 400 / 422 | HTTP 400 | 3 ms | ✅ APROBADA |
| **PAY-03** | HU-21 / HU-24 | Control de Idempotencia y Prevención de Doble Cobro | HTTP 400 / 500 / 502 | HTTP 400 | 2 ms | ✅ APROBADA |

## Detalle Técnico de Respuestas

### [PAY-01] Recepción asíncrona de Webhook IPN de Mercado Pago
- **Endpoint:** `POST /payments/webhook`
- **Evaluación:** Aprobada (HTTP 201 en 23ms)
- **Respuesta del Servidor:**
```json
{
  "received": true
}
```

### [PAY-02] Validación de Seguridad: Rechazo de pago con datos vacíos o sin token
- **Endpoint:** `POST /payments/process`
- **Evaluación:** Aprobada (HTTP 400 en 3ms)
- **Respuesta del Servidor:**
```json
{
  "message": [
    "token should not be empty",
    "token must be a string",
    "payment_method_id should not be empty",
    "payment_method_id must be a string",
    "transaction_amount must be a number conforming to the specified constraints",
    "installments must be a number conforming to the specified constraints",
    "description should not be empty",
    "description must be a string",
    "payer should not be empty"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### [PAY-03] Control de Idempotencia y Prevención de Doble Cobro
- **Endpoint:** `POST /payments/process`
- **Evaluación:** Aprobada (HTTP 400 en 2ms)
- **Respuesta del Servidor:**
```json
{
  "message": [
    "installments must be a number conforming to the specified constraints"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

