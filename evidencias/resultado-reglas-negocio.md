# 📋 Evidencia Verificable de Reglas de Negocio — Hito 3 UNAB

* **Fecha y Hora:** `2026-10-28T00:28:23.406Z`
* **Servidor Objetivo:** `http://localhost:3001/api` (NestJS + PostgreSQL Neon)
* **Total de Pruebas:** 5 | **Aprobadas:** 5 | **Fallidas:** 0 (**100.0% Éxito**)

## Tabla de Resultados de Reglas Operacionales

| ID | HU | Regla de Negocio | Esperado | Obtenido | Latencia | Estado |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **BR-01** | HU-04 / HU-08 | Consulta de Paquete Activo y Sesiones Restantes | HTTP 200 | HTTP 200 | 620 ms | ✅ APROBADA |
| **BR-02** | HU-03 | Regla de Validación: Rechazo de agendamiento en fecha pasada | HTTP 400 | HTTP 400 | 1201 ms | ✅ APROBADA |
| **BR-03** | HU-01 | Regla de Horarios Oficiales: Integridad de Bloques Semanales | HTTP 200 | HTTP 200 | 153 ms | ✅ APROBADA |
| **BR-04** | HU-04 | Regla de Cancelación: Manejo controlado de reserva inexistente | HTTP 400 / 404 | HTTP 404 | 1603 ms | ✅ APROBADA |
| **BR-05** | HU-03 / HU-11 | Consulta de Próximas Citas e Historial del Alumno | HTTP 200 | HTTP 200 | 1882 ms | ✅ APROBADA |

## Detalle Técnico de Respuestas

### [BR-01] Consulta de Paquete Activo y Sesiones Restantes
- **Endpoint:** `GET /packages/my`
- **Evaluación:** Aprobada (HTTP 200 en 620ms)
- **Respuesta del Servidor:**
```json
{
  "hasActivePackage": true,
  "id": "6a9e94f4-94e9-44b0-8faf-ea0462801eb3",
  "userId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
  "plan": "PREMIUM",
  "packName": "Pack Readaptación Total (12 ses)",
  "totalSessions": 12,
  "remainingSessions": 7,
  "price": 99000,
  "isActive": true,
  "expiresAt": null,
  "createdAt": "2026-10-23T18:28:10.771Z",
  "updatedAt": "2026-10-23T18:28:10.771Z"
}
```

### [BR-02] Regla de Validación: Rechazo de agendamiento en fecha pasada
- **Endpoint:** `POST /bookings`
- **Evaluación:** Aprobada (HTTP 400 en 1201ms)
- **Respuesta del Servidor:**
```json
{
  "message": "Selecciona una fecha futura correspondiente a este horario.",
  "error": "Bad Request",
  "statusCode": 400
}
```

### [BR-03] Regla de Horarios Oficiales: Integridad de Bloques Semanales
- **Endpoint:** `GET /schedule/blocks?onlyActive=true`
- **Evaluación:** Aprobada (HTTP 200 en 153ms)
- **Respuesta del Servidor:**
```json
[
  {
    "id": "block-9",
    "dayOfWeek": "Friday",
    "startTime": "08:00",
    "endTime": "09:00",
    "title": "Kinesiología Preventiva",
    "instructor": "Klga. Valeria Reyes",
    "type": "KINE_BOX",
    "capacity": 1,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:15.470Z",
    "updatedAt": "2026-10-23T18:28:15.470Z",
    "_count": {
      "bookings": 0
    }
  },
  {
    "id": "block-10",
    "dayOfWeek": "Friday",
    "startTime": "17:00",
    "endTime": "18:00",
    "title": "Readaptación Funcional Total",
    "instructor": "Prof. Carlos Vega",
    "type": "FUNCTIONAL",
    "capacity": 10,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:15.621Z",
    "updatedAt": "2026-10-23T18:28:15.621Z",
    "_count": {
      "bookings": 0
    }
  },
  {
    "id": "block-1",
    "dayOfWeek": "Monday",
    "startTime": "08:00",
    "endTime": "09:00",
    "title": "Box Clínico Kinesiología 1",
    "instructor": "Klgo. Andrés Morales",
    "type": "KINE_BOX",
    "capacity": 1,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:14.097Z",
    "updatedAt": "2026-10-23T18:28:14.097Z",
    "_count": {
      "bookings": 1
    }
  },
  {
    "id": "block-2",
    "dayOfWeek": "Monday",
    "startTime": "18:00",
    "endTime": "19:00",
    "title": "Entrenamiento Funcional HIIT",
    "instructor": "Prof. Mike R.",
    "type": "FUNCTIONAL",
    "capacity": 12,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:14.401Z",
    "updatedAt": "2026-10-23T18:28:14.401Z",
    "_count": {
      "bookings": 1
    }
  },
  {
    "id": "block-11",
    "dayOfWeek": "Saturday",
    "startTime": "09:00",
    "endTime": "10:00",
    "title": "Evaluación & Readaptación Sabatina",
    "instructor": "Klgo. Andrés Morales",
    "type": "KINE_BOX",
    "capacity": 1,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:15.782Z",
    "updatedAt": "2026-10-23T18:28:15.782Z",
    "_count": {
      "bookings": 0
    }
  },
  {
    "id": "block-12",
    "dayOfWeek": "Saturday",
    "startTime": "10:30",
    "endTime": "11:30",
    "title": "Entrenamiento Funcional Fin de Semana",
    "instructor": "Prof. Mike R.",
    "type": "FUNCTIONAL",
    "capacity": 10,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:15.933Z",
    "updatedAt": "2026-10-23T18:28:15.933Z",
    "_count": {
      "bookings": 0
    }
  },
  {
    "id": "block-13",
    "dayOfWeek": "Sunday",
    "startTime": "09:30",
    "endTime": "10:30",
    "title": "Box Kinésico Matinal Dominical",
    "instructor": "Klgo. Andrés Morales",
    "type": "KINE_BOX",
    "capacity": 1,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:16.085Z",
    "updatedAt": "2026-10-23T18:28:16.085Z",
    "_count": {
      "bookings": 0
    }
  },
  {
    "id": "block-14",
    "dayOfWeek": "Sunday",
    "startTime": "10:30",
    "endTime": "11:30",
    "title": "Movilidad & Recuperación Guiada",
    "instructor": "Prof. Mike R.",
    "type": "FUNCTIONAL",
    "capacity": 10,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:16.236Z",
    "updatedAt": "2026-10-23T18:28:16.236Z",
    "_count": {
      "bookings": 0
    }
  },
  {
    "id": "block-7",
    "dayOfWeek": "Thursday",
    "startTime": "10:00",
    "endTime": "11:00",
    "title": "Evaluación Kinésica & ROM",
    "instructor": "Klgo. Andrés Morales",
    "type": "KINE_BOX",
    "capacity": 1,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:15.167Z",
    "updatedAt": "2026-10-23T18:28:15.167Z",
    "_count": {
      "bookings": 0
    }
  },
  {
    "id": "block-8",
    "dayOfWeek": "Thursday",
    "startTime": "18:00",
    "endTime": "19:00",
    "title": "Entrenamiento Funcional Carga Progresiva",
    "instructor": "Prof. Mike R.",
    "type": "FUNCTIONAL",
    "capacity": 12,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:15.318Z",
    "updatedAt": "2026-10-23T18:28:15.318Z",
    "_count": {
      "bookings": 0
    }
  },
  {
    "id": "block-3",
    "dayOfWeek": "Tuesday",
    "startTime": "09:00",
    "endTime": "10:00",
    "title": "Kinesiología & Terapia Manual",
    "instructor": "Klga. Valeria Reyes",
    "type": "KINE_BOX",
    "capacity": 1,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:14.553Z",
    "updatedAt": "2026-10-23T18:28:14.553Z",
    "_count": {
      "bookings": 0
    }
  },
  {
    "id": "block-4",
    "dayOfWeek": "Tuesday",
    "startTime": "18:00",
    "endTime": "19:00",
    "title": "Entrenamiento Funcional y Core",
    "instructor": "Prof. Mike R.",
    "type": "FUNCTIONAL",
    "capacity": 12,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:14.705Z",
    "updatedAt": "2026-10-23T18:28:14.705Z",
    "_count": {
      "bookings": 0
    }
  },
  {
    "id": "block-5",
    "dayOfWeek": "Wednesday",
    "startTime": "09:00",
    "endTime": "10:00",
    "title": "Entrenamiento Funcional HIIT",
    "instructor": "Prof. Mike R.",
    "type": "FUNCTIONAL",
    "capacity": 12,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:14.856Z",
    "updatedAt": "2026-10-23T18:28:14.856Z",
    "_count": {
      "bookings": 0
    }
  },
  {
    "id": "block-6",
    "dayOfWeek": "Wednesday",
    "startTime": "18:00",
    "endTime": "19:00",
    "title": "Funcional & Control Motor",
    "instructor": "Prof. Carlos Vega",
    "type": "FUNCTIONAL",
    "capacity": 10,
    "isActive": true,
    "createdAt": "2026-10-23T18:28:15.007Z",
    "updatedAt": "2026-10-23T18:28:15.007Z",
    "_count": {
      "bookings": 0
    }
  }
]
```

### [BR-04] Regla de Cancelación: Manejo controlado de reserva inexistente
- **Endpoint:** `PATCH /bookings/non-existent-id-0000000000/cancel`
- **Evaluación:** Aprobada (HTTP 404 en 1603ms)
- **Respuesta del Servidor:**
```json
{
  "message": "Reserva no encontrada.",
  "error": "Not Found",
  "statusCode": 404
}
```

### [BR-05] Consulta de Próximas Citas e Historial del Alumno
- **Endpoint:** `GET /bookings/my`
- **Evaluación:** Aprobada (HTTP 200 en 1882ms)
- **Respuesta del Servidor:**
```json
[
  {
    "packageId": null,
    "confirmedAt": null,
    "id": "c6824710-222f-47bf-9fce-2d3dcae55b6b",
    "scheduleBlockId": "block-1",
    "userId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
    "bookingDate": "2026-10-26T18:28:16.836Z",
    "status": "RESERVED",
    "isRefunded": false,
    "cancelledAt": null,
    "createdAt": "2026-10-23T18:28:16.840Z",
    "updatedAt": "2026-10-23T18:28:16.840Z",
    "scheduleBlock": {
      "id": "block-1",
      "dayOfWeek": "Monday",
      "startTime": "08:00",
      "endTime": "09:00",
      "title": "Box Clínico Kinesiología 1",
      "instructor": "Klgo. Andrés Morales",
      "type": "KINE_BOX",
      "capacity": 1,
      "isActive": true,
      "createdAt": "2026-10-23T18:28:14.097Z",
      "updatedAt": "2026-10-23T18:28:14.097Z"
    }
  }
]
```

