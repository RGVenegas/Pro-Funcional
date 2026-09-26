## Tablero Sprint 3 — HUs HU-12 a HU-19

Pega esta tabla en Notion o úsala desde el repo para tu tablero.

| Tarea / Historia de Usuario | Asignado (Persona) | Fecha | Horas Invertidas | Criterio de Aceptación (DoD) | Estado |
|---|---|---:|---:|---|---|
| HU-12 · Desplegar backend en AWS | Kevin Soto | 24/09/2026 | 32 h | Backend accesible vía Load Balancer; health checks verdes; logs en CloudWatch; despliegue reproducible en staging. | Not started |
| HU-13 · Gestión segura de secretos | Pablo Loncón | 24/09/2026 | 12 h | Secrets Manager o Parameter Store configurado; JWT y DATABASE_URL fuera del repo; app lee secretos en runtime. | Not started |
| HU-14 · Base de datos gestionada en AWS (RDS/Aurora + Prisma) | Rodrigo Venegas | 24/09/2026 | 20 h | Prisma conecta a RDS; migraciones aplicadas; backups automáticos y snapshots configurados. | Not started |
| HU-15 · CI/CD para frontend & backend (GitHub Actions) | Kevin Soto | 24/09/2026 | 20 h | Workflows en GitHub Actions: build/test; backend publica imagen a ECR y despliega; frontend publica a S3/CloudFront. | Not started |
| HU-16 · Spike — Infraestructura y costes (ECS vs Lambda vs EC2) | Sebastián López | 24/09/2026 | 8 h | Documento de decisión con estimación de costes y propuesta de arquitectura aprobado por el equipo. | Not started |
| HU-17 · Mobile‑first — ajustes de diseño y breakpoints | Pablo Loncón | 24/09/2026 | 20 h | Layout optimizado para 360×800; tipografías y paddings ajustados; Lighthouse móvil mejorado (meta >=90). | Not started |
| HU-18 · Interacciones táctiles y accesibilidad (a11y) | Kevin Soto | 24/09/2026 | 12 h | Targets táctiles >=44px; focus states visibles; roles ARIA en componentes clave; navegación por teclado verificada. | Not started |
| HU-19 · Ajuste responsivo de la cuadrícula de horarios | Rodrigo Venegas | 24/09/2026 | 32 h | Grid responsivo con vista compacta móvil, scroll horizontal por día o vista lista; reservas sin solapamientos; capacidad visible. | Not started |

**Notas:**
- Las HUs de performance, offline y monitorización (HU-20, HU-21, HU-22) quedaron para Sprint 4.
- Si querés que cree Issues en GitHub por cada HU y te devuelva los links, lo hago ahora.
