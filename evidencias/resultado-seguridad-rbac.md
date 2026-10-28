# 🛡️ Evidencia Verificable de Pruebas de Seguridad y RBAC — Hito 3 UNAB

* **Fecha y Hora:** `2026-10-28T00:28:12.687Z`
* **Servidor Objetivo:** `http://localhost:3001/api` (NestJS + Guards + Neon PostgreSQL)
* **Total de Pruebas:** 5 | **Aprobadas:** 5 | **Fallidas:** 0 (**100.0% Éxito**)

## Matriz de Casos de Seguridad y Privilegios

| ID | Caso de Prueba | Esperado | Obtenido | Latencia | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **SEC-01** | Intento de consulta a Parrilla Staff sin Token (No autenticado) | HTTP 401 | HTTP 401 | 2 ms | ✅ APROBADA |
| **SEC-02** | Paciente intentando crear Bloque Horario en la Agenda (Escalamiento) | HTTP 403 | HTTP 403 | 462 ms | ✅ APROBADA |
| **SEC-03** | Paciente intentando registrar Ficha Clínica SOAP (Privacidad médica) | HTTP 403 | HTTP 403 | 305 ms | ✅ APROBADA |
| **SEC-04** | Intento de Inyección de campos prohibidos (Mass Assignment / Whitelist) | HTTP 400 | HTTP 400 | 3 ms | ✅ APROBADA |
| **SEC-05** | Acceso autorizado de Staff con privilegios válidos | HTTP 200 / 201 | HTTP 200 | 900 ms | ✅ APROBADA |

## Detalle Forense de Respuestas HTTP

### [SEC-01] Intento de consulta a Parrilla Staff sin Token (No autenticado)
- **Endpoint:** `GET /schedule/grid?date=2026-11-02`
- **Evaluación:** Protección confirmada (HTTP 401)
- **Respuesta del Servidor:**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### [SEC-02] Paciente intentando crear Bloque Horario en la Agenda (Escalamiento)
- **Endpoint:** `POST /schedule/blocks`
- **Evaluación:** Protección confirmada (HTTP 403)
- **Respuesta del Servidor:**
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

### [SEC-03] Paciente intentando registrar Ficha Clínica SOAP (Privacidad médica)
- **Endpoint:** `POST /clinical/evaluations/c60a1817-d2ec-41ee-8b4c-8155d9cc7023`
- **Evaluación:** Protección confirmada (HTTP 403)
- **Respuesta del Servidor:**
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

### [SEC-04] Intento de Inyección de campos prohibidos (Mass Assignment / Whitelist)
- **Endpoint:** `POST /auth/login`
- **Evaluación:** Protección confirmada (HTTP 400)
- **Respuesta del Servidor:**
```json
{
  "message": [
    "property isAdminInjected should not exist",
    "property extraForbiddenField should not exist"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### [SEC-05] Acceso autorizado de Staff con privilegios válidos
- **Endpoint:** `GET /schedule/grid?date=2026-11-02`
- **Evaluación:** Protección confirmada (HTTP 200)
- **Respuesta del Servidor:**
```json
[
  {
    "id": "block-1",
    "title": "Box Clínico Kinesiología 1",
    "instructor": "Klgo. Andrés Morales",
    "time": "08:00 - 09:00",
    "type": "KINE_BOX",
    "capacity": 1,
    "bookedCount": 0,
    "students": []
  },
  {
    "id": "block-2",
    "title": "Entrenamiento Funcional HIIT",
    "instructor": "Prof. Mike R.",
    "time": "18:00 - 19:00",
    "type": "FUNCTIONAL",
    "capacity": 12,
    "bookedCount": 0,
    "students": []
  }
]
```

