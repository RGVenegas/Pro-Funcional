# ProFuncional - Plataforma de Gestión de Entrenamiento Funcional

Aplicación web integral para la gestión de gimnasios y centros de entrenamiento funcional (**ProFuncional**), con paneles independientes para miembros y personal administrativo.

---

## 🛠️ Tecnologías y Stack

- **Frontend**: React 18 + TypeScript
- **Bundler & Tooling**: Vite 6
- **Estilos**: Tailwind CSS v4 + Radix UI + Lucide Icons
- **Gráficos & Animaciones**: Recharts + Motion (Framer Motion)
- **Utilidades**: Canvas Confetti, Sonner, QRCode.react, Date-fns, React Hook Form
- **Almacenamiento**: Persistencia reactiva en `localStorage` con eventos en vivo

---

## 🚀 Ejecución del Proyecto

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor de desarrollo
```bash
npm run dev
```

> **Nota:** Abre la URL indicada por Vite (normalmente [http://localhost:5173](http://localhost:5173)).

### 3. Compilar para producción
```bash
npm run build
```

---

## 🔐 Credenciales de Acceso y Demostración

El sistema cuenta con validación estricta de credenciales y mensajes de error ante contraseñas incorrectas o correos no registrados.

| Perfil | Correo de Acceso | Contraseña Válida | Vista / Rol |
| :--- | :--- | :--- | :--- |
| **Miembro (Premium)** | `juan.perez@gmail.com` | `password123` *(o `12345678`)* | Panel de Miembro |
| **Miembro (Standard)** | `camila.gonzalez@gmail.com` | `password123` *(o `12345678`)* | Panel de Miembro |
| **Miembro (Basic - Vencido)** | `matias.rojas@gmail.com` | `password123` *(o `12345678`)* | Panel de Miembro |
| **Personal / Admin** | `admin@profuncional.cl` *(o cualquier correo)* | `admin1234` | Panel Administrativo |

> **Registro de Nuevos Miembros:**  
> Puedes registrar un nuevo usuario desde la pestaña **"Registrarme"**. Al completar los dos pasos (datos y selección de membresía/clases), la cuenta se guardará en la base de datos local y podrás iniciar sesión con la contraseña que hayas definido.

---

## 📱 Funcionalidades Principales

### 👤 Panel de Miembro (Usuario)
- **Inicio (Home)**: Resumen personalizado, próxima clase programada con acceso directo y métricas de entrenamientos semanales y racha.
- **Mi Membresía (Planes)**: Consulta de beneficios, días restantes de vigencia, botón de renovación directa y selector interactivo para cambiar de plan (Basic, Standard, Premium) con actualización en tiempo real.
- **Calendario & Reservas**: Visualización del horario semanal de clases (HIIT, Yoga, CrossFit, Spinning, etc.), reserva y cancelación de cupos.
- **Historial de Entrenamiento**: Gráficos de actividad semanal, registro cronológico de sesiones y control de racha.
- **Tarjeta Digital (QR)**: Credencial digital con código QR dinámico (`PROFUNCIONAL:ID`) para acceso por torniquete o tótem, con opciones de guardar o compartir.
- **Perfil**: Datos personales y estado de la cuenta.

### 🛡️ Panel de Personal (Administración)
- **Dashboard / Resumen**: Indicadores clave (KPIs) de miembros totales, ingresos mensuales en CLP, membresías activas y porcentaje de ocupación de clases, junto a gráficos de crecimiento y actividad reciente en vivo.
- **Gestión de Miembros**: Búsqueda en tiempo real, filtros por estado (Activos, Vencidos, Todos), visualización de saldos/deudas en CLP.
- **Detalle de Miembro**: Ficha clínica con historial de asistencia, cálculo automático de racha, historial de pagos, notas privadas del administrador y acciones directas para **Renovar** o **Suspender/Reactivar**.
- **Gestión de Horarios**: Administración de clases en modo fijo o flexible, control de aforos y centro de notificaciones de cancelaciones.

