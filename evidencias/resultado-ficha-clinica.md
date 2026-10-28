# 🩺 Evidencia Verificable de Fichas Clínicas (SOAP, EVA & ROM) — Hito 3 UNAB

* **Fecha y Hora:** `2026-10-28T00:28:17.323Z`
* **Servidor Objetivo:** `http://localhost:3001/api` (NestJS + PostgreSQL Neon)
* **Historias de Usuario:** HU-05 (Ficha SOAP/EVA/ROM) & HU-06 (Curvas de Progreso)
* **Total de Pruebas:** 5 | **Aprobadas:** 5 | **Fallidas:** 0 (**100.0% Éxito**)

## Tabla de Casos Clínicos y Casos Límite

| ID | Caso de Prueba | Esperado | Obtenido | Latencia | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **CLN-01** | Kinesiólogo consulta historial clínico del paciente | HTTP 200 | HTTP 200 | 609 ms | ✅ APROBADA |
| **CLN-02** | Registro exitoso de Ficha Clínica SOAP (Datos válidos) | HTTP 200 / 201 | HTTP 201 | 1977 ms | ✅ APROBADA |
| **CLN-03** | Caso Límite: Intento de ingresar escala de dolor fuera de rango (EVA = 15) | HTTP 400 | HTTP 400 | 308 ms | ✅ APROBADA |
| **CLN-04** | Caso Límite: Intento de ingresar Rango Articular negativo (ROM = -20°) | HTTP 400 | HTTP 400 | 299 ms | ✅ APROBADA |
| **CLN-05** | Paciente consulta su propio avance clínico (Curvas de progreso HU-06) | HTTP 200 | HTTP 200 | 451 ms | ✅ APROBADA |

## Detalle Técnico de Respuestas Médicas

### [CLN-01] Kinesiólogo consulta historial clínico del paciente
- **Endpoint:** `GET /clinical/history/c60a1817-d2ec-41ee-8b4c-8155d9cc7023`
- **Evaluación:** Aprobada (HTTP 200 en 609ms)
- **Payload / Registro Almacenado:**
```json
{
  "history": [
    {
      "id": "f468f50e-69d9-4aca-9b5c-2a6836284cd6",
      "patientId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
      "professionalId": "33c9c3cd-6ec9-4308-b363-c1fc602e21b9",
      "professionalName": "Klgo. Andrés Morales",
      "date": "2026-10-28T00:01:50.661Z",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "subjective": "Paciente refiere menor dolor matutino (EVA 4/10).",
      "objective": "Flexión de rodilla a 115° sin signos de derrame.",
      "assessment": "Evolución satisfactoria de tendinopatía rotuliana.",
      "plan": "Inicio de sentadillas excéntricas en polea cónica.",
      "physicalRestrictions": "Evitar impacto alto en salto / Cuidado en aterrizaje",
      "createdAt": "2026-10-28T00:01:50.661Z",
      "updatedAt": "2026-10-28T00:01:50.661Z"
    },
    {
      "id": "90e2b9a7-a769-4162-b14e-451bf9d50aeb",
      "patientId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
      "professionalId": "33c9c3cd-6ec9-4308-b363-c1fc602e21b9",
      "professionalName": "Klgo. Andrés Morales",
      "date": "2026-10-27T23:58:08.756Z",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "subjective": "Paciente refiere menor dolor matutino (EVA 4/10).",
      "objective": "Flexión de rodilla a 115° sin signos de derrame.",
      "assessment": "Evolución satisfactoria de tendinopatía rotuliana.",
      "plan": "Inicio de sentadillas excéntricas en polea cónica.",
      "physicalRestrictions": "Evitar impacto alto en salto / Cuidado en aterrizaje",
      "createdAt": "2026-10-27T23:58:08.756Z",
      "updatedAt": "2026-10-27T23:58:08.756Z"
    },
    {
      "id": "aad55537-20d2-4880-9c4a-038c5c3b604f",
      "patientId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
      "professionalId": "33c9c3cd-6ec9-4308-b363-c1fc602e21b9",
      "professionalName": "Klgo. Andrés Morales",
      "date": "2026-10-27T23:56:39.279Z",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "subjective": "Paciente refiere menor dolor matutino (EVA 4/10).",
      "objective": "Flexión de rodilla a 115° sin signos de derrame.",
      "assessment": "Evolución satisfactoria de tendinopatía rotuliana.",
      "plan": "Inicio de sentadillas excéntricas en polea cónica.",
      "physicalRestrictions": "Evitar impacto alto en salto / Cuidado en aterrizaje",
      "createdAt": "2026-10-27T23:56:39.279Z",
      "updatedAt": "2026-10-27T23:56:39.279Z"
    },
    {
      "id": "9ac0abae-5fd8-423f-9685-cec13c7e5584",
      "patientId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
      "professionalId": null,
      "professionalName": "Klgo. Andrés Morales",
      "date": "2026-10-23T18:28:10.771Z",
      "evaPain": 7,
      "romDegrees": 90,
      "jointOrArea": "Rodilla derecha",
      "subjective": "Paciente refiere dolor punzante en cara anterior de rodilla al subir escaleras.",
      "objective": "Edema leve peri-rotuliano. ROM flexión 90°, extensión completa.",
      "assessment": "Tendinopatía rotuliana en fase subaguda.",
      "plan": "Crioterapia, electroanalgesia, descarga miofascial y ejercicios isométricos.",
      "physicalRestrictions": "Evitar sentadillas profundas >90°",
      "createdAt": "2026-10-23T18:28:10.771Z",
      "updatedAt": "2026-10-23T18:28:10.771Z"
    },
    {
      "id": "c87b10ed-aeed-4489-8883-390d2049cfc5",
      "patientId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
      "professionalId": null,
      "professionalName": "Klgo. Andrés Morales",
      "date": "2026-10-23T18:28:10.771Z",
      "evaPain": 3,
      "romDegrees": 130,
      "jointOrArea": "Rodilla derecha",
      "subjective": "Paciente asintomático en AVD. Buena sensación de fuerza y estabilidad.",
      "objective": "ROM flexión 130° sin dolor. Test de salto bipodal simétrico.",
      "assessment": "Fase de reintegro funcional al gimnasio.",
      "plan": "Derivación a entrenamiento funcional adaptado sin carga extrema.",
      "physicalRestrictions": "Evitar impacto alto en salto / Cuidado en aterrizaje",
      "createdAt": "2026-10-23T18:28:10.771Z",
      "updatedAt": "2026-10-23T18:28:10.771Z"
    }
  ],
  "chartData": [
    {
      "session": "Sesión 1",
      "date": "23-oct",
      "evaPain": 3,
      "romDegrees": 130,
      "jointOrArea": "Rodilla derecha",
      "note": "Fase de reintegro funcional al gimnasio."
    },
    {
      "session": "Sesión 2",
      "date": "23-oct",
      "evaPain": 7,
      "romDegrees": 90,
      "jointOrArea": "Rodilla derecha",
      "note": "Tendinopatía rotuliana en fase subaguda."
    },
    {
      "session": "Sesión 3",
      "date": "27-oct",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "note": "Evolución satisfactoria de tendinopatía rotuliana."
    },
    {
      "session": "Sesión 4",
      "date": "27-oct",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "note": "Evolución satisfactoria de tendinopatía rotuliana."
    },
    {
      "session": "Sesión 5",
      "date": "27-oct",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "note": "Evolución satisfactoria de tendinopatía rotuliana."
    }
  ]
}
```

### [CLN-02] Registro exitoso de Ficha Clínica SOAP (Datos válidos)
- **Endpoint:** `POST /clinical/evaluations/c60a1817-d2ec-41ee-8b4c-8155d9cc7023`
- **Evaluación:** Aprobada (HTTP 201 en 1977ms)
- **Payload / Registro Almacenado:**
```json
{
  "id": "4d1c4334-a6da-473c-b00a-8ae72eea0a27",
  "patientId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
  "professionalId": "33c9c3cd-6ec9-4308-b363-c1fc602e21b9",
  "professionalName": "Klgo. Andrés Morales",
  "date": "2026-10-28T00:28:15.041Z",
  "evaPain": 4,
  "romDegrees": 115,
  "jointOrArea": "Rodilla derecha",
  "subjective": "Paciente refiere menor dolor matutino (EVA 4/10).",
  "objective": "Flexión de rodilla a 115° sin signos de derrame.",
  "assessment": "Evolución satisfactoria de tendinopatía rotuliana.",
  "plan": "Inicio de sentadillas excéntricas en polea cónica.",
  "physicalRestrictions": "Evitar impacto alto en salto / Cuidado en aterrizaje",
  "createdAt": "2026-10-28T00:28:15.041Z",
  "updatedAt": "2026-10-28T00:28:15.041Z"
}
```

### [CLN-03] Caso Límite: Intento de ingresar escala de dolor fuera de rango (EVA = 15)
- **Endpoint:** `POST /clinical/evaluations/c60a1817-d2ec-41ee-8b4c-8155d9cc7023`
- **Evaluación:** Aprobada (HTTP 400 en 308ms)
- **Payload / Registro Almacenado:**
```json
{
  "message": [
    "El valor de EVA debe ser entre 1 y 10"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### [CLN-04] Caso Límite: Intento de ingresar Rango Articular negativo (ROM = -20°)
- **Endpoint:** `POST /clinical/evaluations/c60a1817-d2ec-41ee-8b4c-8155d9cc7023`
- **Evaluación:** Aprobada (HTTP 400 en 299ms)
- **Payload / Registro Almacenado:**
```json
{
  "message": [
    "Los grados ROM deben ser mayores o iguales a 0"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### [CLN-05] Paciente consulta su propio avance clínico (Curvas de progreso HU-06)
- **Endpoint:** `GET /clinical/my-history`
- **Evaluación:** Aprobada (HTTP 200 en 451ms)
- **Payload / Registro Almacenado:**
```json
{
  "history": [
    {
      "id": "4d1c4334-a6da-473c-b00a-8ae72eea0a27",
      "patientId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
      "professionalId": "33c9c3cd-6ec9-4308-b363-c1fc602e21b9",
      "professionalName": "Klgo. Andrés Morales",
      "date": "2026-10-28T00:28:15.041Z",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "subjective": "Paciente refiere menor dolor matutino (EVA 4/10).",
      "objective": "Flexión de rodilla a 115° sin signos de derrame.",
      "assessment": "Evolución satisfactoria de tendinopatía rotuliana.",
      "plan": "Inicio de sentadillas excéntricas en polea cónica.",
      "physicalRestrictions": "Evitar impacto alto en salto / Cuidado en aterrizaje",
      "createdAt": "2026-10-28T00:28:15.041Z",
      "updatedAt": "2026-10-28T00:28:15.041Z"
    },
    {
      "id": "f468f50e-69d9-4aca-9b5c-2a6836284cd6",
      "patientId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
      "professionalId": "33c9c3cd-6ec9-4308-b363-c1fc602e21b9",
      "professionalName": "Klgo. Andrés Morales",
      "date": "2026-10-28T00:01:50.661Z",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "subjective": "Paciente refiere menor dolor matutino (EVA 4/10).",
      "objective": "Flexión de rodilla a 115° sin signos de derrame.",
      "assessment": "Evolución satisfactoria de tendinopatía rotuliana.",
      "plan": "Inicio de sentadillas excéntricas en polea cónica.",
      "physicalRestrictions": "Evitar impacto alto en salto / Cuidado en aterrizaje",
      "createdAt": "2026-10-28T00:01:50.661Z",
      "updatedAt": "2026-10-28T00:01:50.661Z"
    },
    {
      "id": "90e2b9a7-a769-4162-b14e-451bf9d50aeb",
      "patientId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
      "professionalId": "33c9c3cd-6ec9-4308-b363-c1fc602e21b9",
      "professionalName": "Klgo. Andrés Morales",
      "date": "2026-10-27T23:58:08.756Z",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "subjective": "Paciente refiere menor dolor matutino (EVA 4/10).",
      "objective": "Flexión de rodilla a 115° sin signos de derrame.",
      "assessment": "Evolución satisfactoria de tendinopatía rotuliana.",
      "plan": "Inicio de sentadillas excéntricas en polea cónica.",
      "physicalRestrictions": "Evitar impacto alto en salto / Cuidado en aterrizaje",
      "createdAt": "2026-10-27T23:58:08.756Z",
      "updatedAt": "2026-10-27T23:58:08.756Z"
    },
    {
      "id": "aad55537-20d2-4880-9c4a-038c5c3b604f",
      "patientId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
      "professionalId": "33c9c3cd-6ec9-4308-b363-c1fc602e21b9",
      "professionalName": "Klgo. Andrés Morales",
      "date": "2026-10-27T23:56:39.279Z",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "subjective": "Paciente refiere menor dolor matutino (EVA 4/10).",
      "objective": "Flexión de rodilla a 115° sin signos de derrame.",
      "assessment": "Evolución satisfactoria de tendinopatía rotuliana.",
      "plan": "Inicio de sentadillas excéntricas en polea cónica.",
      "physicalRestrictions": "Evitar impacto alto en salto / Cuidado en aterrizaje",
      "createdAt": "2026-10-27T23:56:39.279Z",
      "updatedAt": "2026-10-27T23:56:39.279Z"
    },
    {
      "id": "9ac0abae-5fd8-423f-9685-cec13c7e5584",
      "patientId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
      "professionalId": null,
      "professionalName": "Klgo. Andrés Morales",
      "date": "2026-10-23T18:28:10.771Z",
      "evaPain": 7,
      "romDegrees": 90,
      "jointOrArea": "Rodilla derecha",
      "subjective": "Paciente refiere dolor punzante en cara anterior de rodilla al subir escaleras.",
      "objective": "Edema leve peri-rotuliano. ROM flexión 90°, extensión completa.",
      "assessment": "Tendinopatía rotuliana en fase subaguda.",
      "plan": "Crioterapia, electroanalgesia, descarga miofascial y ejercicios isométricos.",
      "physicalRestrictions": "Evitar sentadillas profundas >90°",
      "createdAt": "2026-10-23T18:28:10.771Z",
      "updatedAt": "2026-10-23T18:28:10.771Z"
    },
    {
      "id": "c87b10ed-aeed-4489-8883-390d2049cfc5",
      "patientId": "c60a1817-d2ec-41ee-8b4c-8155d9cc7023",
      "professionalId": null,
      "professionalName": "Klgo. Andrés Morales",
      "date": "2026-10-23T18:28:10.771Z",
      "evaPain": 3,
      "romDegrees": 130,
      "jointOrArea": "Rodilla derecha",
      "subjective": "Paciente asintomático en AVD. Buena sensación de fuerza y estabilidad.",
      "objective": "ROM flexión 130° sin dolor. Test de salto bipodal simétrico.",
      "assessment": "Fase de reintegro funcional al gimnasio.",
      "plan": "Derivación a entrenamiento funcional adaptado sin carga extrema.",
      "physicalRestrictions": "Evitar impacto alto en salto / Cuidado en aterrizaje",
      "createdAt": "2026-10-23T18:28:10.771Z",
      "updatedAt": "2026-10-23T18:28:10.771Z"
    }
  ],
  "chartData": [
    {
      "session": "Sesión 1",
      "date": "23-oct",
      "evaPain": 3,
      "romDegrees": 130,
      "jointOrArea": "Rodilla derecha",
      "note": "Fase de reintegro funcional al gimnasio."
    },
    {
      "session": "Sesión 2",
      "date": "23-oct",
      "evaPain": 7,
      "romDegrees": 90,
      "jointOrArea": "Rodilla derecha",
      "note": "Tendinopatía rotuliana en fase subaguda."
    },
    {
      "session": "Sesión 3",
      "date": "27-oct",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "note": "Evolución satisfactoria de tendinopatía rotuliana."
    },
    {
      "session": "Sesión 4",
      "date": "27-oct",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "note": "Evolución satisfactoria de tendinopatía rotuliana."
    },
    {
      "session": "Sesión 5",
      "date": "27-oct",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "note": "Evolución satisfactoria de tendinopatía rotuliana."
    },
    {
      "session": "Sesión 6",
      "date": "27-oct",
      "evaPain": 4,
      "romDegrees": 115,
      "jointOrArea": "Rodilla derecha",
      "note": "Evolución satisfactoria de tendinopatía rotuliana."
    }
  ]
}
```

