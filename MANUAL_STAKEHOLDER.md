# 📋 Manual de Usuario - ProFuncional

## Bienvenida

¡Bienvenido a **ProFuncional**! Este es un ecosistema digital integral para la gestión de un centro de kinesiología y entrenamiento funcional.

---

## 🌐 Acceso a la Aplicación

La aplicación está disponible en:

**URL Pública:**
```
http://ec2-54-161-120-184.compute-1.amazonaws.com
```

---

## 🔐 Credenciales de Acceso

### Perfil Administrador
- **Correo:** `admin@profuncional.cl`
- **Contraseña:** `admin1234`
- **Rol:** Administrador / Kinesiólogo
- **Acceso:** Programa de escritorio (Panel de control)

### Perfiles de Pacientes (Demo)

### Usuario Pablo Loncon
- **Correo:** `pablito.loncon@gmail.com`
- **Contraseña:** `password123`
- **Rol:** Paciente / Usuario
- **Acceso:** Agendamiento

### Usuario Camila Gonzales
- **Correo:** `camila.gonzalez@gmail.com`
- **Contraseña:** `password123`
- **Rol:** Paciente / Usuario
- **Acceso:** Agendamiento
---

## 📱 Funcionalidades Principales

### Para Administradores / Kinesiólogos

1. **Panel de Control (Dashboard)**
   - Métricas de ocupación
   - Indicadores de no-show
   - Saldos de paquetes
   - Gráficos de desempeño

2. **Gestión de Miembros**
   - Visualizar lista de pacientes
   - Editar información personal
   - Ver histórico de sesiones
   - Consultar restricciones médicas

3. **Configuración de Agenda**
   - Definir bloques horarios
   - Asignar capacidades por hora
   - Gestionar instructores
   - Configurar tipos de sesión (Kinesiología, Funcional)

4. **Parrilla Diaria**
   - Ver citas del día
   - Marcar asistencia ("Asistió" / "No-Show")
   - Confirmar pagos

5. **Fichas Clínicas Evolutivas (SOAP)**
   - Registrar evaluaciones
   - Escala de dolor EVA (1-10)
   - Rango de movilidad ROM (grados °)
   - Notas SOAP (Subjetivo, Objetivo, Evaluación, Plan)
   - Alertas de restricciones médicas

6. **Dashboard de Riesgo**
   - Análisis de pacientes con alto porcentaje de no-show
   - Alertas de ausentismo

---

### Para Pacientes

1. **Inicio (Home)**
   - Resumen del plan actual
   - Próxima cita
   - Saldo de sesiones
   - Notificaciones

2. **Agendamiento Autónomo**
   - Catálogo de bloques disponibles
   - Filtrar por tipo (Kinesiología, Funcional)
   - Reservar en 1 clic
   - Confirmación inmediata

3. **Gestión de Citas**
   - **Reagendamiento:** Sin costo, a nuevos bloques disponibles
   - **Cancelación (Regla 24h):**
     - Si cancelas **≥ 24 horas antes:** +1 sesión gratis (reembolso)
     - Si cancelas **< 24 horas antes:** Pérdida de sesión (sin reembolso)

4. **Gráficos de Evolución**
   - Visualizar descenso de dolor EVA
   - Gráficas de ganancia de movilidad ROM
   - Tendencias a lo largo del tiempo

5. **Tarjeta Digital**
   - Información de membresía
   - QR de acceso
   - Saldo actual

6. **Recordatorios In-App**
   - Confirmación de asistencia previa
   - Alertas de próximas citas
   - Notificaciones push

---

## 🚀 Cómo Probar la Aplicación

### Paso 1: Acceder como Administrador

1. Abre el navegador
2. Ve a: `http://ec2-54-161-120-184.compute-1.amazonaws.com`
3. Inicia sesión con:
   - Correo: `admin@profuncional.cl`
   - Contraseña: `admin1234`

### Paso 2: Explorar el Dashboard
- Revisa las métricas
- Observa el gráfico de no-show
- Consulta la lista de miembros

### Paso 3: Ver un Paciente
1. Ve a "Miembros"
2. Haz clic en uno (ej: Pablito)
3. Revisa su perfil, restricciones, y sesiones

### Paso 4: Consultar Ficha Clínica
1. En el detalle del paciente
2. Abre la sección "Ficha Clínica"
3. Observa las notas SOAP, dolor EVA, movilidad ROM

### Paso 5: Acceder como Paciente

1. Abre una nueva pestaña de incógnito / privada
2. Ve a: `http://ec2-54-161-120-184.compute-1.amazonaws.com`
3. Inicia sesión con:
   - Correo: `pablito.loncon@gmail.com`
   - Contraseña: `password123`

### Paso 6: Probar Agendamiento
1. Ve a "Agendar Cita"
2. Selecciona un bloque disponible
3. Confirma la reserva

### Paso 7: Probar Cancelación
1. Ve a "Mi Calendario"
2. Busca una cita próxima
3. Cancélala (verás el mensaje de la regla 24h)
4. Reagéndate en otro bloque

### Paso 8: Ver Gráficos
1. Ve a "Mi Evolución" o "Entrenamiento"
2. Observa las gráficas de dolor y movilidad

---

## 📊 Funcionalidades Demostrables

| Funcionalidad | Usuario | Pasos | Resultado Esperado |
|---------------|---------|-------|-------------------|
| Login Admin | admin@profuncional.cl | Ingresar credenciales | Acceder a panel de control |
| Ver Dashboard | Admin | Ir a Inicio | Métricas visibles |
| Ver Miembros | Admin | Ir a Miembros | Lista de pacientes |
| Ver Ficha SOAP | Admin | Seleccionar paciente > Ficha Clínica | Nota SOAP con EVA y ROM |
| Agendar | Paciente (pablito) | Ir a Agendar > Seleccionar hora | Cita reservada |
| Cancelar 24h+ | Paciente | Cancelar cita futura | Reembolso automático (+1 sesión) |
| Cancelar <24h | Paciente | Cancelar cita próxima | Pérdida de sesión |
| Ver Gráficos | Paciente | Ir a Mi Evolución | Gráficas de dolor y movilidad |
| Tarjeta Digital | Paciente | Ir a Mi Tarjeta | Información de membresía con QR |

---

**Versión:** 1.0.0  
**Fecha:** Octubre 8, 2026  
**Estado:** ✅ En Producción

---

¡Gracias por probar ProFuncional! 🚀