# 🚀 Presentación del Sprint 2 — ProFuncional

---

## 📌 Contexto del Producto (Retroalimentación Sprint 1)

### ¿Qué es ProFuncional?
**ProFuncional** es un ecosistema digital de gestión kinésico-deportiva diseñado para mantener un acompañamiento continuo e individualizado entre el centro kinésico/gimnasio funcional y sus alumnos/pacientes.

Conecta dos entornos principales:
1. **Programa de Escritorio (PC)**: Destinado al **Staff, Kinesiólogos, Coaches y Administradores**. Permite gestionar la disponibilidad horaria, visualizar la agenda diaria de citas (boxes kinésicos y clases), registrar fichas clínicas evolutivas (notas SOAP, dolor EVA 1-10, movilidad ROM °), emitir alertas de restricciones para los profesores y analizar la tasa de ausentismo (No-Show).
2. **App Móvil Nativa (iOS & Android)**: Destinada exclusivamente a **Pacientes y Alumnos**. Permite el agendamiento autónomo de sesiones, reagendamiento y cancelación con regla de 24 horas, confirmación in-app de asistencia, visualización de gráficos de progreso físico y uso de credencial digital QR.

---

### 📋 Tablero de Historias de Usuario (Notion)
* **Enlace al tablero:** `https://notion.so/profuncional/tablero-sprint-2` *(remplazar con enlace real)*
* **Espacio de trabajo:** Notion — Sprint 2 ProFuncional
* **Vista general de columnas:** `Por hacer (Backlog)` ➔ `En progreso` ➔ `En revisión / QA` ➔ `Completado (Done)`

---

## 🎯 1. Objetivo del Sprint 2

> *"Conectar la interfaz con el servidor backend (NestJS/Supabase), consolidar la ficha clínica evolutiva con rutinas aprobadas por profesionales, e implementar la arquitectura Offline-First con sincronización automática para garantizar la continuidad operativa."*

---

## 📦 2. Alcance del Sprint (Tareas Seleccionadas del Backlog)

| ID | Historia de Usuario / Tarea | Descripción Corta | Estado |
| :--- | :--- | :--- | :---: |
| **HU-02** | Agenda diaria de citas y control de asistencia | Vista en grilla/tabla diaria para boxes kinésicos y clases con marcado de *"Asistió"* / *"Inasistencia"*. | `Completado` |
| **HU-05** | Ficha clínica evolutiva (SOAP, EVA, ROM) | Formulario de atención kinésica individual con registro de subjetivo, objetivo, análisis, plan, dolor EVA (1-10) y movilidad ROM (°). | `Completado` |
| **HU-07** | Alertas de restricciones médicas para entrenadores | Visualización automática en el perfil del alumno de las contraindicaciones emitidas por el kinesiólogo (ej: *"Evitar flexión >90° por LCA"*). | `Completado` |
| **HU-08** | Arquitectura Offline-First y cola de sincronización | Servicio en segundo plano (`SyncQueue`) que almacena operaciones localmente cuando no hay internet y las sincroniza en lote al reconectar. | `Completado` |
| **HU-11** | Recordatorio In-App de confirmación de asistencia | Banner interactivo en la vista principal del alumno para confirmar activamente la asistencia antes de la sesión. | `Completado` |
| **HU-12** | Rutinas individuales con aprobación profesional | Flujo de creación de rutina base por el profesor, revisión/ajuste por el kinesiólogo y entrega al alumno de la versión aprobada. | `En progreso` |

---

## 👥 3. Responsables

* **Desarrollador Frontend (React/TypeScript)**:
  * Implementación de grilla diaria de citas (`HU-02`), componentes de ficha clínica (`HU-05`) y banner de asistencia (`HU-11`).
* **Desarrollador Backend (NestJS/Supabase)**:
  * Endpoints REST de reservas, historial clínico y autenticación con roles (`HU-05`, `HU-12`).
* **Arquitecto de Software / Frontend Lead**:
  * Diseño de arquitectura *Offline-First* (`offlineQueue.ts`), manejo de estados y sincronización en lote (`HU-08`).
* **Kinesiólogo Lead / Product Owner**:
  * Definición de criterios médicos para fichas SOAP, escalamiento de restricciones y flujo de aprobación de rutinas (`HU-07`, `HU-12`).

---

## ⏱️ 4. Estimación (Horas Estimadas por Tarea)

| Tarea / Historia de Usuario | Horas Estimadas | Horas Reales |
| :--- | :---: | :---: |
| **HU-02**: Agenda diaria de citas y control de asistencia | 12 h | 10 h |
| **HU-05**: Ficha clínica evolutiva y métricas (SOAP, EVA, ROM) | 16 h | 18 h |
| **HU-07**: Alertas de restricciones médicas para entrenadores | 8 h | 6 h |
| **HU-08**: Arquitectura Offline-First y cola `SyncQueue` | 20 h | 22 h |
| **HU-11**: Banner de confirmación in-app de asistencia | 6 h | 5 h |
| **HU-12**: Integración de rutinas adaptadas y aprobación | 14 h | 12 h |
| **Integración & Pruebas generales del Sprint** | 10 h | 10 h |
| **TOTAL SPRINT 2** | **86 hrs** | **83 hrs** |

---

## ⚠️ 5. Riesgos, Bloqueos y Dependencias Esperadas

1. **Riesgo 1: Pérdida o duplicación de transacciones en modo offline.**
   * *Mitigación:* Identificación de registros mediante UUIDs generados en el cliente e instrucciones *UPSERT* en Supabase para evitar duplicados.
2. **Riesgo 2: Discrepancia en las reglas de cancelación tardía (<24h) entre interfaz y backend.**
   * *Mitigación:* Centralización de la validación de tiempo límite en las transacciones del servidor backend NestJS.
3. **Dependencia 1: Definición comercial de convenios y premios por asistencia.**
   * *Estado:* Pendiente de cierre por parte del cliente antes de avanzar en el módulo de recompensas.

---

## ✅ 6. Criterios de Aceptación

Para considerar el **Sprint 2** como **Aceptado / Terminado (Done)**, se deben cumplir los siguientes criterios:

* [x] **Agenda diaria:** El personal puede filtrar la lista de citas por fecha y box, y marcar *"Asistió"* o *"No-Show"* afectando el saldo de sesiones.
* [x] **Ficha clínica:** El kinesiólogo puede registrar notas SOAP y sliders de EVA/ROM, los cuales se reflejan en el gráfico de evolución del alumno.
* [x] **Alertas visible:** Al abrir la ficha de un alumno, el profesor puede visualizar las restricciones médicas vigentes.
* [x] **Offline-First:** Desconectar la red permite registrar reservas/asistencias; al reconectar, el `OfflineStatusBanner` muestra la sincronización exitosa sin pérdida de datos.
* [x] **Confirmación In-App:** El alumno ve un aviso en su inicio para confirmar asistencia a la sesión del día sin consumir otra sesión.
* [x] **Compilación y Build:** El proyecto compila limpiamente (`npm run build`) sin errores de TypeScript ni de empaquetado.

---
