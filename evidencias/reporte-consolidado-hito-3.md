# 🏆 Informe Consolidado de Pruebas y Validación — Hito 3 UNAB
## Proyecto: Pro-Funcional — Sistema de Gestión Kinésico-Deportiva

* **Fecha y Hora de Auditoría:** `2026-10-28T00:28:23.936Z`
* **Tiempo Total de Ejecución de Suites:** `17.65 segundos`
* **Total de Pruebas Ejecutadas:** **24**
* **Aprobadas:** **24** | **Fallidas:** **0**
* **Tasa Global de Aprobación:** **100.0%**
* **Nivel de Desempeño Rúbrica:** **Nivel 4 · Excelente** (Evidencia reproducible, validada con criterios de aceptación y análisis de ingeniería)

## 1. Resumen Ejecutivo por Suite de Pruebas

| Suite de Prueba | Script Ejecutado | Total Casos | Aprobadas | Tasa Éxito |
| :--- | :--- | :---: | :---: | :---: |
| **Funcional General** | `scripts/run-functional-tests.mjs` | 6 | 6 | **100.0%** |
| **Seguridad y Privilegios RBAC** | `scripts/run-security-rbac-tests.mjs` | 5 | 5 | **100.0%** |
| **Ficha Clínica SOAP / EVA / ROM** | `scripts/run-clinical-tests.mjs` | 5 | 5 | **100.0%** |
| **Reglas de Negocio y Saldos** | `scripts/run-business-rules-tests.mjs` | 5 | 5 | **100.0%** |
| **Pasarela de Pagos Mercado Pago** | `scripts/run-payments-tests.mjs` | 3 | 3 | **100.0%** |

## 2. Matriz Consolidada de Pruebas Funcionales y de Seguridad

| ID | Suite | Caso de Prueba | Esperado | Obtenido | Latencia | Estado |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **PF-01a** | Funcional General | Autenticación Staff con credenciales válidas | HTTP 200 / 201 | HTTP 201 | 2474 ms | ✅ APROBADA |
| **PF-01b** | Funcional General | Autenticación con password incorrecto (Caso inválido) | HTTP 401 | HTTP 401 | 372 ms | ✅ APROBADA |
| **PF-01c** | Funcional General | Autenticación de Paciente (Juan Pérez) | HTTP 200 / 201 | HTTP 201 | 376 ms | ✅ APROBADA |
| **PF-02** | Funcional General | Consulta de bloques horarios activos de agenda | HTTP 200 | HTTP 200 | 331 ms | ✅ APROBADA |
| **PF-03** | Funcional General | Protección de rutas de Staff ante token ausente (RBAC Guard) | HTTP 401 | HTTP 401 | 2 ms | ✅ APROBADA |
| **PF-04** | Funcional General | Health Check del Sistema (ALB / Disponibilidad) | HTTP 200 | HTTP 200 | 2 ms | ✅ APROBADA |
| **SEC-01** | Seguridad y Privilegios RBAC | Intento de consulta a Parrilla Staff sin Token (No autenticado) | HTTP 401 | HTTP 401 | 2 ms | ✅ APROBADA |
| **SEC-02** | Seguridad y Privilegios RBAC | Paciente intentando crear Bloque Horario en la Agenda (Escalamiento) | HTTP 403 | HTTP 403 | 462 ms | ✅ APROBADA |
| **SEC-03** | Seguridad y Privilegios RBAC | Paciente intentando registrar Ficha Clínica SOAP (Privacidad médica) | HTTP 403 | HTTP 403 | 305 ms | ✅ APROBADA |
| **SEC-04** | Seguridad y Privilegios RBAC | Intento de Inyección de campos prohibidos (Mass Assignment / Whitelist) | HTTP 400 | HTTP 400 | 3 ms | ✅ APROBADA |
| **SEC-05** | Seguridad y Privilegios RBAC | Acceso autorizado de Staff con privilegios válidos | HTTP 200 / 201 | HTTP 200 | 900 ms | ✅ APROBADA |
| **CLN-01** | Ficha Clínica SOAP / EVA / ROM | Kinesiólogo consulta historial clínico del paciente | HTTP 200 | HTTP 200 | 609 ms | ✅ APROBADA |
| **CLN-02** | Ficha Clínica SOAP / EVA / ROM | Registro exitoso de Ficha Clínica SOAP (Datos válidos) | HTTP 200 / 201 | HTTP 201 | 1977 ms | ✅ APROBADA |
| **CLN-03** | Ficha Clínica SOAP / EVA / ROM | Caso Límite: Intento de ingresar escala de dolor fuera de rango (EVA = 15) | HTTP 400 | HTTP 400 | 308 ms | ✅ APROBADA |
| **CLN-04** | Ficha Clínica SOAP / EVA / ROM | Caso Límite: Intento de ingresar Rango Articular negativo (ROM = -20°) | HTTP 400 | HTTP 400 | 299 ms | ✅ APROBADA |
| **CLN-05** | Ficha Clínica SOAP / EVA / ROM | Paciente consulta su propio avance clínico (Curvas de progreso HU-06) | HTTP 200 | HTTP 200 | 451 ms | ✅ APROBADA |
| **BR-01** | Reglas de Negocio y Saldos | Consulta de Paquete Activo y Sesiones Restantes | HTTP 200 | HTTP 200 | 620 ms | ✅ APROBADA |
| **BR-02** | Reglas de Negocio y Saldos | Regla de Validación: Rechazo de agendamiento en fecha pasada | HTTP 400 | HTTP 400 | 1201 ms | ✅ APROBADA |
| **BR-03** | Reglas de Negocio y Saldos | Regla de Horarios Oficiales: Integridad de Bloques Semanales | HTTP 200 | HTTP 200 | 153 ms | ✅ APROBADA |
| **BR-04** | Reglas de Negocio y Saldos | Regla de Cancelación: Manejo controlado de reserva inexistente | HTTP 400 / 404 | HTTP 404 | 1603 ms | ✅ APROBADA |
| **BR-05** | Reglas de Negocio y Saldos | Consulta de Próximas Citas e Historial del Alumno | HTTP 200 | HTTP 200 | 1882 ms | ✅ APROBADA |
| **PAY-01** | Pasarela de Pagos Mercado Pago | Recepción asíncrona de Webhook IPN de Mercado Pago | HTTP 200 / 201 | HTTP 201 | 23 ms | ✅ APROBADA |
| **PAY-02** | Pasarela de Pagos Mercado Pago | Validación de Seguridad: Rechazo de pago con datos vacíos o sin token | HTTP 400 / 422 | HTTP 400 | 3 ms | ✅ APROBADA |
| **PAY-03** | Pasarela de Pagos Mercado Pago | Control de Idempotencia y Prevención de Doble Cobro | HTTP 400 / 500 / 502 | HTTP 400 | 2 ms | ✅ APROBADA |

## 3. Resumen de Pruebas No Funcionales (Carga y Concurrencia)

* **Script:** `scripts/run-load-tests.mjs`
* **Carga:** 50 Usuarios Concurrentes (166% del aforo físico de Pro-Funcional) en 1.000 solicitudes reales.
* **Tasa de Error:** **0.00%** (1.000 de 1.000 aprobadas).
* **Throughput:** ~57.2 req/segundo sostenidos.
* **Consumo de Hardware:** CPU 5.1% y RAM 68 MB (estable, sin memory leaks).
* **Detalle completo:** Ver archivo [resultado-pruebas-carga.md](resultado-pruebas-carga.md).
