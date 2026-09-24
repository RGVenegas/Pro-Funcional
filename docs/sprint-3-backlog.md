## Sprint 3 — Backlog (AWS, móvil, cuadrícula de horarios)

Tabla lista para pegar en Notion o usar desde el repo:

| Tarea / Historia de Usuario | Asignado (Persona) | Fecha | Horas Invertidas | Criterio de Aceptación (DoD) | Estado |
|---|---|---:|---:|---|---|
| HU-12: Desplegar backend en AWS | Kevin Soto | 24/09/2026 | 32 h | Backend accesible vía Load Balancer; logs en CloudWatch; despliegue reproducible. | Not started |
| HU-13: Gestión segura de secretos | Pablo Loncón | 24/09/2026 | 12 h | No hay secretos en el repo; la app lee secretos en runtime. | Not started |
| HU-14: Base de datos gestionada en AWS (RDS/Aurora) | Rodrigo Venegas | 24/09/2026 | 20 h | Migraciones Prisma funcionan en RDS; backups automáticos activos. | Not started |
| HU-15: CI/CD para frontend & backend | Kevin Soto | 24/09/2026 | 20 h | Push a `main` dispara pipeline; artefactos publicados (frontend y backend). | Not started |
| HU-16: Spike — Infraestructura y costes | Sebastián López | 24/09/2026 | 8 h | Documento con recomendación y estimación de coste aprobado por el equipo. | Not started |
| HU-17: Mobile‑first — ajustes de diseño y breakpoints | Pablo Loncón | 24/09/2026 | 20 h | UI legible en 360×800; Lighthouse móvil básico >= 90. | Not started |
| HU-18: Interacciones táctiles y accesibilidad (a11y) | Kevin Soto | 24/09/2026 | 12 h | Targets táctiles ≥44px; navegación por teclado y roles ARIA aplicados. | Not started |
| HU-19: Ajuste responsivo de la cuadrícula de horarios | Rodrigo Venegas | 24/09/2026 | 32 h | Vista compacta móvil + scroll horizontal por día; reservar/visualizar sin solapamientos; capacidad visible. | Not started |
| HU-23: Pruebas E2E y matrix móvil (Cypress) | Kevin Soto | 24/09/2026 | 20 h | Flujos críticos (login, reserva, contacto) cubiertos por E2E y pasando en CI. | Not started |
| HU-24: Hardening y seguridad básica | Sebastián López | 24/09/2026 | 12 h | HTTPS forzado, cabeceras de seguridad, CORS y rate-limiting básicos. | Not started |

### Notas
- Las HUs de performance, offline y monitorización (HU-20, HU-21, HU-22) se dejaron para Sprint 4.
- Si querés, puedo crear Issues automáticos en GitHub con estas HUs y devolverte los links para pegarlos en Notion.
