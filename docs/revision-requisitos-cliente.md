# Revisión de requisitos del cliente — ProFuncional

Fecha: 10 de septiembre de 2026. Alcance: revisión del código y definición funcional. No se modificaron la aplicación ni su estética. Los comportamientos descritos como actuales se identificaron por lectura del código; no se ejecutó la aplicación ni se comprobó un despliegue.

**Objetivo del producto**

Mantener la cercanía entre el kinesiólogo y sus alumnos mediante seguimiento individual, entrenamiento adaptado y comunicación continua, además de gestionar clases y pagos. La instalación debe iniciar ese acompañamiento. La expresión «no desconectarse» se interpreta principalmente como mantener el vínculo humano; la continuidad de sesión y la sincronización son necesidades técnicas complementarias.

**Lo que existe y lo que falta**

| Necesidad del cliente | Estado observado | Cambio requerido |
| --- | --- | --- |
| Ficha clínica individual | Hay evaluaciones con dolor EVA, movilidad ROM, zona corporal, notas SOAP y restricciones. | Completar antecedentes relevantes, objetivos y profesional responsable; vincular la ficha con la rutina y mostrar la evolución real de cada alumno. |
| Rutina adaptada | Hay restricciones en texto, pero no un modelo de rutinas, ejercicios ni versiones aprobadas. | Crear rutinas individuales a partir de pautas del profesional y de la rutina base del profesor, con revisión y aprobación del kinesiólogo. |
| Recordatorios de pagos | Existen saldo, paquetes y fechas de cobro; no se encontró envío programado. | Registrar obligaciones y pagos reales; avisar según vencimiento y detener recordatorios al registrar el pago. Separar deuda monetaria, vencimiento del paquete y saldo de sesiones. |
| Recordatorios de clases | Hay calendario y avisos locales de cancelación al personal. | Enviar recordatorios de reservas reales, permitir confirmar intención de asistir y actualizar los avisos al cancelar o reagendar. |
| Plazo para reagendar | Existe reagendamiento, sin comprobación del plazo en las funciones revisadas. | Definir y aplicar una anticipación mínima que permita ocupar el cupo liberado. |
| Condiciones de cancelación | La interfaz anuncia 24 horas, pero devuelve siempre la sesión. El servidor tiene otra implementación que sí evalúa el plazo. | Unificar la política y sus excepciones; aplicarla en el servidor y mostrar la consecuencia antes de cancelar. |
| Premios y tiendas | No se encontraron modelos ni flujos de recompensas. | Contabilizar asistencias efectivas y habilitar beneficios de comercios con umbrales, condiciones y canjes verificables. |
| Cercanía y preferencias | Hay notas internas en memoria, sin conversación persistente ni seguimiento asignado. | Guardar preferencias, actividades que desagradan, comentarios del alumno y tareas de seguimiento del profesional. |
| Uso instalado y entre dispositivos | La interfaz usa almacenamiento local; existe un backend separado. No se encontraron manifiesto, service worker ni integración push. | Conectar la interfaz al servidor y definir instalación, continuidad de acceso y entrega de notificaciones. |

**Problemas concretos que deben resolverse primero**

- `src/app/data/gymStore.ts:782`: `isEligibleForRefund = true` reintegra la sesión incluso fuera del plazo anunciado. Reagendar tampoco comprueba anticipación mínima.
- `src/app/components/user/UserCalendar.tsx`: el calendario parte del 20 de enero de 2025. Los cupos se calculan con alumnos asociados al bloque semanal, sin distinguir cada fecha; una reserva puede afectar la disponibilidad de otras semanas.
- `src/app/components/user/TrainingTracking.tsx:17`: evolución, sesiones, restricciones y métricas están escritas como datos de ejemplo, sin recibir la identidad del alumno.
- `src/app/components/user/UserHome.tsx:23`: la próxima sesión muestra «Hoy a las 18:00» como dato fijo. No debe utilizarse como origen de recordatorios.
- `src/app/components/admin/MemberDetail.tsx:17`: las notas de seguimiento se mantienen en estado del componente, por lo que no constituyen un historial persistente.
- `src/app/components/auth/Login.tsx`: el acceso de demostración acepta contraseñas comunes y el acceso de personal no valida una cuenta real del servidor. La interfaz no diferencia kinesiólogo, profesor y administrador.
- `backend/src/clinical/clinical.controller.ts:31`: la consulta por identificador exige autenticación, pero no comprueba que el historial pertenezca al solicitante o que este tenga acceso profesional autorizado. Además, el detalle de miembros permite al rol profesor obtener registros clínicos completos. Hay que definir y aplicar accesos según responsabilidad.
- No se encontraron llamadas HTTP al backend en `src`. Los cambios locales no se comparten entre el celular del alumno y el computador del profesional.

**Requisitos funcionales propuestos y criterios de aceptación**

1. **Ficha y seguimiento individual.** Cada alumno debe tener identidad única, profesional responsable, objetivos, antecedentes pertinentes, restricciones, evaluaciones fechadas y preferencias. Distinguir lo informado por el alumno de lo evaluado por el especialista. Mostrar dolor y movilidad por zona corporal y fecha, sin inventar valores cuando falten registros. Aceptación: dos alumnos ven historias diferentes; el profesor recibe la pauta de entrenamiento autorizada; un alumno no puede consultar la ficha de otro.

2. **Rutina individual con aprobación profesional.** Guardar rutina base, ejercicios, dosificación indicada por el profesional, alternativas autorizadas y vínculo con la evaluación vigente. Flujo: borrador → revisión → aprobación → asignación → seguimiento. Si cambian las restricciones, la rutina afectada debe volver a revisión. Aceptación: el alumno recibe únicamente la versión aprobada para él y queda registrado quién la aprobó y cuándo. Si faltan antecedentes o alternativas autorizadas, el sistema solicita revisión en lugar de inventar una adaptación.

   En el ejemplo del alumno con problemas de rodilla, el kinesiólogo registra su evaluación y sus límites; el profesor propone una rutina base; el programa prepara un borrador usando las alternativas autorizadas y marca lo pendiente. El kinesiólogo ajusta y aprueba. El alumno recibe su pauta y puede comunicar molestias. No se define una prescripción clínica automática a partir de la frase «problemas de rodilla».

3. **Acompañamiento continuo.** Ofrecer bienvenida del profesional responsable, canal de respuesta y consulta breve posterior a la clase sobre experiencia y molestias. Guardar actividades que le gustan o desagradan, separadas de las contraindicaciones clínicas. Proponer una lista de alumnos pendientes de contacto por ausencia, comentario sin responder o revisión pendiente. Aceptación: el comentario llega al profesional asignado y se conserva su respuesta y el estado del seguimiento. Los intervalos de contacto quedan por acordar.

4. **Clases y confirmación.** Programar avisos vinculados a una reserva, con fecha, hora y profesional reales. «Confirmo que asistiré» registra intención, mientras que «Asistió» corresponde a la asistencia registrada por el personal. Aceptación: confirmar no consume otra sesión ni entrega premios; cancelar o reagendar invalida avisos anteriores; los reintentos de envío no duplican mensajes.

5. **Cancelación, reagendamiento y cupos.** Configurar anticipación mínima, consecuencia por cancelación tardía e inasistencia y excepciones autorizadas. Las 24 horas son un antecedente del código, no una decisión confirmada del cliente. Propuesta: cancelación a tiempo devuelve la sesión; cancelación tardía libera el cupo sin devolución; inasistencia consume la sesión ya descontada, sin un segundo cargo; reagendamiento dentro del plazo cambia la reserva sin alterar saldo. Fuera del plazo, cualquier excepción requiere motivo y responsable. Aceptación: verificar límites exactos, reservas pasadas, titularidad, duplicados y reservas simultáneas por fecha en horario de Chile. Si falla el nuevo cupo, la reserva original se conserva. Una lista de espera con oferta de cupo por tiempo limitado es una ampliación opcional.

6. **Pagos y renovaciones.** Mantener cobros, vencimientos, pagos y estado de conciliación. La frecuencia y el canal de recordatorios serán configurables. Aceptación: solo se recuerda una obligación pendiente; registrar el pago detiene los avisos; un paquete con pocas sesiones se presenta como aviso de renovación y no como deuda. Una pasarela de pago no está implícita en este requisito.

7. **Premios por clases realizadas y convenios.** Usar asistencias verificadas como fuente del progreso. Configurar cuántas clases habilitan cada premio; mostrar beneficio, comercio, vigencia, disponibilidad y condiciones. Registrar canje único y consumo del beneficio. Aceptación: reservas, confirmaciones de intención e inasistencias no generan premios; corregir asistencia ajusta el progreso sin duplicarlo; un cupón no puede canjearse dos veces. Los comercios reciben solo la información necesaria para validar el beneficio. No se presuponen convenios existentes ni una cantidad de premios acordada.

8. **Sincronización y notificaciones.** Utilizar el backend como fuente compartida de reservas, fichas, rutinas y seguimiento. Implementar entrega programada, preferencias de contacto, reintentos y registro de estado. Aceptación: el alumno y el personal consultan el mismo estado desde dispositivos diferentes; se prueba entrega con la app cerrada en los dispositivos elegidos. No mostrar diagnósticos ni detalles clínicos en notificaciones de pantalla bloqueada. No presentar una reserva sin conexión como confirmada antes de validarla en el servidor.

**Integración en la app sin rediseño**

Conservar colores, tipografías, fondos, espaciados, navegación y componentes existentes. Primero corregir datos y comportamiento dentro de las pantallas actuales. Las funciones nuevas necesitarán contenido o controles funcionales; su ubicación debe respetar la composición actual y revisarse antes de implementarse.

| Pantalla existente | Integración funcional propuesta |
| --- | --- |
| Inicio del alumno | Próxima reserva real, avisos pertinentes y seguimiento del profesional. |
| Calendario | Confirmación de intención, plazos visibles y cupos por fecha. |
| Mi evolución | Datos clínicos propios, rutina aprobada y comentarios posteriores a la sesión. |
| Mi perfil | Preferencias y canal de contacto elegido. |
| Plan | Vencimientos, pagos y consulta de beneficios. |
| Ficha del alumno en administración | Antecedentes, preferencias, seguimiento persistente y aprobación de rutina. |
| Horarios y dashboard | Confirmaciones, asistencia real y pendientes de contacto. |

**Orden de implementación propuesto**

1. Conectar autenticación y datos al backend, resolver permisos clínicos, fechas, cupos y reglas de cancelación; eliminar datos ficticios de las pantallas operativas.
2. Completar ficha individual, rutinas aprobadas y seguimiento del profesional. Este es el núcleo de la cercanía que solicita el cliente.
3. Incorporar recordatorios de clases y pagos, confirmación de intención e instalación con notificaciones según los dispositivos elegidos.
4. Incorporar premios y comercios cuando estén definidos los convenios y las reglas de canje.

**Decisiones pendientes del cliente**

- Horas mínimas para cancelar y reagendar; consecuencias y excepciones por inasistencia.
- Canal y frecuencia de avisos: dentro de la app, push, correo u otro canal acordado.
- Profesional responsable y plazo esperado de respuesta a los alumnos.
- Datos de salud que necesita registrar el especialista y quién puede consultarlos.
- Alcance del generador de rutinas: plantillas y alternativas aprobadas, o asistencia adicional; siempre con validación profesional antes de asignar.
- Número de asistencias por premio, acumulación, vencimiento, disponibilidad y comercios participantes.
- Dispositivos en los que se instalará la app y condiciones de continuidad de acceso.

Estas decisiones son parámetros de negocio pendientes, no impedimentos para preparar la integración técnica. Esta revisión no implementa ni da por aprobadas las propuestas.
