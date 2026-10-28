# 📋 Evidencia Verificable de Pruebas Funcionales — Hito 3 UNAB

* **Fecha y Hora de Ejecución:** `2026-10-28T00:28:10.042Z`
* **Entorno:** Backend NestJS en vivo (`http://localhost:3001/api`) + PostgreSQL en Neon AWS
* **Total de Pruebas:** 6 | **Aprobadas:** 6 | **Fallidas:** 0 (**100.0% Éxito**)

## Tabla de Resultados por Caso de Prueba

| ID | Historia (HU) | Nombre de la Prueba | Esperado | Obtenido | Latencia | Estado |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **PF-01a** | HU-01 / HU-03 | Autenticación Staff con credenciales válidas | HTTP 200 / 201 | HTTP 201 | 2474 ms | ✅ APROBADA |
| **PF-01b** | HU-01 / HU-03 | Autenticación con password incorrecto (Caso inválido) | HTTP 401 | HTTP 401 | 372 ms | ✅ APROBADA |
| **PF-01c** | HU-03 | Autenticación de Paciente (Juan Pérez) | HTTP 200 / 201 | HTTP 201 | 376 ms | ✅ APROBADA |
| **PF-02** | HU-01 | Consulta de bloques horarios activos de agenda | HTTP 200 | HTTP 200 | 331 ms | ✅ APROBADA |
| **PF-03** | HU-03 / HU-08 | Protección de rutas de Staff ante token ausente (RBAC Guard) | HTTP 401 | HTTP 401 | 2 ms | ✅ APROBADA |
| **PF-04** | HU-05 / HU-06 | Health Check del Sistema (ALB / Disponibilidad) | HTTP 200 | HTTP 200 | 2 ms | ✅ APROBADA |

## Detalle Técnico de Respuestas (Evidencia Forense)

### [PF-01a] Autenticación Staff con credenciales válidas
- **Endpoint:** `POST /auth/login`
- **Resultado:** Aprobada (HTTP 201 en 2474ms)
- **Payload / Respuesta del Servidor:**
```json
{
  "user": {
    "care": {},
    "id": "0d0decae-e788-42af-b161-bd1de10eccfe",
    "email": "admin@profuncional.cl",
    "name": "Personal del Gimnasio (Admin/Staff)",
    "phone": "+56 9 9999 8888",
    "role": "ADMIN",
    "status": "ACTIVE",
    "balance": 0,
    "physicalRestrictions": null,
    "joinDate": "2026-10-23T18:28:10.311Z",
    "nextBilling": null,
    "createdAt": "2026-10-23T18:28:10.311Z",
    "updatedAt": "2026-10-23T18:28:10.311Z",
    "packages": []
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZDBkZWNhZS1lNzg4LTQyYWYtYjE2MS1iZDFkZTEwZWNjZmUiLCJlbWFpbCI6ImFkbWluQHByb2Z1bmNpb25hbC5jbCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MzE0NzI4OCwiZXhwIjoxNzkzNzUyMDg4fQ.UqMJ3eKiRj1MU0ZVWiJQ0E-DnF558yNWOQojUIvwQeg"
}
```

### [PF-01b] Autenticación con password incorrecto (Caso inválido)
- **Endpoint:** `POST /auth/login`
- **Resultado:** Aprobada (HTTP 401 en 372ms)
- **Payload / Respuesta del Servidor:**
```json
{
  "message": "Credenciales inválidas: contraseña incorrecta",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### [PF-01c] Autenticación de Paciente (Juan Pérez)
- **Endpoint:** `POST /auth/login`
- **Resultado:** Aprobada (HTTP 201 en 376ms)
- **Payload / Respuesta del Servidor:**
```json
{
  "user": {
    "care": {},
    "id": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
    "email": "juan.perez@gmail.com",
    "name": "Juan Perez",
    "phone": "+56 9 8765 4321",
    "role": "PATIENT",
    "status": "ACTIVE",
    "balance": 0,
    "physicalRestrictions": "Evitar impacto alto en salto / Cuidado en aterrizaje",
    "joinDate": "2026-10-23T18:28:10.771Z",
    "nextBilling": null,
    "createdAt": "2026-10-23T18:28:10.771Z",
    "updatedAt": "2026-10-28T00:01:51.116Z",
    "packages": [
      {
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
    ]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjNjBhMTgxNy1kMmVjLTQxZWUtOGI0Yy04MTU1ZDljYzcwMjMiLCJlbWFpbCI6Imp1YW4ucGVyZXpAZ21haWwuY29tIiwicm9sZSI6IlBBVElFTlQiLCJpYXQiOjE3OTMxNDcyODksImV4cCI6MTc5Mzc1MjA4OX0.sFM42xzsiP8bTrvEu_rFTbzVzLUrmuzrjtGL6kkL8QY"
}
```

### [PF-02] Consulta de bloques horarios activos de agenda
- **Endpoint:** `GET /schedule/blocks?onlyActive=true`
- **Resultado:** Aprobada (HTTP 200 en 331ms)
- **Payload / Respuesta del Servidor:**
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

### [PF-03] Protección de rutas de Staff ante token ausente (RBAC Guard)
- **Endpoint:** `GET /schedule/grid?date=2026-11-02`
- **Resultado:** Aprobada (HTTP 401 en 2ms)
- **Payload / Respuesta del Servidor:**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### [PF-04] Health Check del Sistema (ALB / Disponibilidad)
- **Endpoint:** `GET /v1/health`
- **Resultado:** Aprobada (HTTP 200 en 2ms)
- **Payload / Respuesta del Servidor:**
```json
{
  "status": "ok",
  "timestamp": "2026-10-28T00:28:10.040Z",
  "uptime": 2062.8795844,
  "service": "pro-funcional-backend",
  "environment": "development"
}
```

