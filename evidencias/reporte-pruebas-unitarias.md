# 🧪 Reporte de Pruebas Unitarias de Código (Unit Tests)
## Proyecto: Pro-Funcional — Sistema de Gestión Kinésico-Deportiva

**Fecha de ejecución:** 29 de Octubre de 2026  
**Motor de Pruebas:** Node.js Native Test Runner (`node:test` y `node:assert/strict`) con soporte de TypeScript  
**Comando de ejecución:** `npm run test:unit` (o bien `node --experimental-strip-types --test tests/unit/*.test.mjs`)  
**Entorno de ejecución:** Windows (x64) | Node v25.9.0  
**Tiempo total de ejecución:** ~708 ms  

---

### 📊 Resumen Ejecutivo de Resultados

| Métrica | Valor | Estado |
| :--- | :---: | :---: |
| **Suites de Prueba Ejecutadas** | **8** | ✅ 100% Exitosas |
| **Casos de Prueba Unitarios (Unit Tests)** | **48** | ✅ 48 Aprobados / 0 Fallidos |
| **Tasa de Éxito Global** | **100%** | 🎯 Cumplimiento Total |
| **Dependencia de Servidor Activo** | **Ninguna (0)** | ⚡ Pruebas aisladas en memoria |

---

### 📂 Detalle de Suites y Cobertura de Código

#### 1. `tests/unit/01-backend-dates.test.mjs` — Lógica de Fechas y Zona Horaria Backend (`backend/src/common/dates.ts`)
- **7 Pruebas Unitarias**:
  1. Constantes operacionales del centro: `GYM_TIME_ZONE = 'America/Santiago'`, `BOOKING_NOTICE_HOURS = 3`, `CONFIRMATION_WINDOW_MINUTES = 90`.
  2. `today()`: Retorno estricto en formato ISO `YYYY-MM-DD` con huso horario chileno (UTC-3 / UTC-4).
  3. `addDays()`: Suma y resta de días con transiciones de fin de mes y cambio de año (ej: 31 dic a 1 ene, 28 feb a 1 mar).
  4. `weekDate()`: Cálculo de lunes y domingo de la semana con offsets relativos.
  5. `appointmentTime()`: Conversión de fecha y hora local a timestamp epoch UTC exacto.
  6. `appointmentTime()`: Validación defensiva y retorno `NaN` ante horas inválidas (>23), minutos inválidos (>59) o strings corruptos.
  7. `formatDate()`: Formateo `es-CL` y manejo de nulos retornando fallback `"Sin registro"`.

#### 2. `tests/unit/02-frontend-dates-plan.test.mjs` — Ciclos de Membresía y Confirmación Frontend (`src/app/data/dates.ts`)
- **7 Pruebas Unitarias**:
  1. `getMinutesUntilClass()`: Cálculo de minutos para formatos simples (`HH:mm`) y rangos (`18:00 - 19:00`).
  2. `getMinutesUntilClass()`: Retorno de `NaN` ante entradas malformadas.
  3. `isWithinConfirmationWindow()`: Validación de ventana operativa de confirmación (desde 90 min antes hasta 30 min tras inicio).
  4. `calculatePlanCycle()`: Ciclo regular de 30 días y periodo de gracia de 5 días.
  5. `calculatePlanCycle()`: Detección de periodo de gracia activo cuando el plan venció hace ≤ 5 días.
  6. `calculatePlanCycle()`: Detección de mora y expiración total cuando han transcurrido > 5 días desde la fecha límite.
  7. `calculatePlanCycle()`: Respeto y precedencia de fecha de facturación personalizada (`customBillingStr`).

#### 3. `tests/unit/03-clinical-domain.test.mjs` — Dominio Clínico Kinésico (`backend/src/clinical/clinical.service.ts` y DTOs)
- **6 Pruebas Unitarias**:
  1. Validación de evaluación kinésica completa con campos válidos.
  2. Escala de dolor EVA: Aceptación de rango [1, 10] y rechazo de casos límite (EVA = 15, EVA = 0, EVA decimal).
  3. Grados ROM articular: Aceptación de rango [0, 360] y rechazo de ángulos negativos o > 360°.
  4. Integridad de ficha SOAP: Exigencia de campos no vacíos (Subjective, Objective, Assessment, Plan).
  5. `formatPatientHistoryForCharts()`: Transformación de registros de BD a series temporales de Recharts en orden cronológico inverso (`Sesión 1`, `Sesión 2`...).
  6. `applyEvaluationCareUpdate()`: Invocación de regla de seguridad médica que invalida la rutina activa a estado `draft` (borrador) y purga `approvedAt`/`approvedBy` al ingresar una nueva evaluación.

#### 4. `tests/unit/04-booking-policies.test.mjs` — Políticas de Cancelación, Reagendamiento y Aforo (`backend/src/bookings/booking-transactions.ts`)
- **7 Pruebas Unitarias**:
  1. Cancelación con anticipación ≥ 3 horas: Reembolso automático y devolución de sesión al saldo del paquete.
  2. Cancelación con anticipación < 3 horas: Liberación del cupo pero retención de la sesión sin reembolso por incumplimiento de política.
  3. Rechazo de cancelación de citas en tiempo pasado.
  4. Rechazo de reagendamiento con menos de 3 horas de aviso previo.
  5. Bloqueo de reagendamiento a fechas que superan la vigencia máxima del paquete (`expiresAt`).
  6. Control de aforo estricto en Box Kinésico (`capacity = 1`).
  7. Detección y bloqueo de doble reserva del mismo paciente en el mismo horario.

#### 5. `tests/unit/05-payments-checkout.test.mjs` — Pasarela Mercado Pago Orders API (`backend/src/payments/payments.service.ts`)
- **6 Pruebas Unitarias**:
  1. Mapeo de débito bancario chileno: Conversión de `visa`/`master` a `debvisa`/`debmaster` y restricción obligatoria a 1 cuota.
  2. Mapeo de débito Mastercard a `debmaster`.
  3. Tarjetas prepago (`prepaid_card` como MACH/Tenpo): Omisión absoluta de la propiedad `installments` para cumplimiento de Orders API.
  4. Tarjetas de crédito tradicionales: Preservación de cuotas seleccionadas por el usuario.
  5. Moneda nacional CLP: Redondeo estricto a números enteros (`Math.round`) sin centavos ni decimales flotantes.
  6. Normalización de correo electrónico del pagador a minúsculas.

#### 6. `tests/unit/06-membership-auth.test.mjs` — Membresías, Autenticación y Seguridad (`backend/src/auth/auth.service.ts`)
- **6 Pruebas Unitarias**:
  1. Configuración de planes: BASIC (4 ses, $29.000), STANDARD (8 ses, $59.000), PREMIUM (12 ses, $99.000).
  2. Asignación de plan STANDARD por defecto en ausencia de parámetro.
  3. Rechazo de planes inexistentes.
  4. Cálculo de vigencia de paquete a 30 días exactos.
  5. `sanitizeUserOutput()`: Sanitización y purga del hash de contraseña antes de responder al cliente.
  6. Algoritmo de seguridad bcrypt: Generación de hash con factor de trabajo (salt cost = 10) y validación de contraseñas correctas/incorrectas.

#### 7. `tests/unit/07-calendar-whatsapp.test.mjs` — Utilidades de Integración Externa (`src/app/utils/calendarExport.ts` & `whatsapp.ts`)
- **5 Pruebas Unitarias**:
  1. `parseEventDates()`: Desglose de fecha/hora y adición de duración en minutos.
  2. `parseEventDates()`: Duración por defecto de 60 minutos.
  3. `getGoogleCalendarUrl()`: Generación de URL con formato iCal UTC (`YYYYMMDDTHHmmssZ/YYYYMMDDTHHmmssZ`), título, descripción y ubicación.
  4. `getWhatsAppUrl()`: Construcción de URI con número de recepción oficial (`56912345678`) y mensaje por defecto.
  5. `getWhatsAppUrl()`: Soporte para mensajes personalizados con codificación URI segura (`encodeURIComponent`).

#### 8. `tests/unit/08-offline-queue.test.mjs` — Sincronización Offline First (`src/app/data/offlineQueue.ts`)
- **4 Pruebas Unitarias**:
  1. `enqueueMutation()`: Encolamiento de mutaciones con timestamp y UUID seguro.
  2. `removeMutation()`: Eliminación puntual de mutaciones procesadas.
  3. `processOfflineQueue()`: Ejecución secuencial FIFO y limpieza de cola tras éxito.
  4. `processOfflineQueue()`: Detención en cadena ante falla HTTP para salvaguardar el orden de dependencias transaccionales.

---

### 🚀 Cómo Ejecutar Estas Pruebas

Para correr todas las pruebas unitarias en cualquier momento sin necesidad de encender la base de datos ni levantar el backend en el puerto 3001:

```bash
npm run test:unit
```

O directamente mediante Node.js:
```bash
node --experimental-strip-types --test tests/unit/*.test.mjs
```

