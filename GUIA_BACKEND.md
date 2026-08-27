# Guía de Implementación Backend — ProFuncional (Sprint 1)

Documento técnico para el compañero encargado del desarrollo del **Backend de Autenticación**.

---

## 🌐 Configuración Base

- **URL Base por defecto:** `http://localhost:3001/api/auth`
- **Formato de datos:** `JSON` (`Content-Type: application/json`)
- **Variable de entorno en frontend (opcional):** `VITE_API_URL=http://localhost:3001/api/auth`

---

## 📡 Endpoints Requeridos para el Login

### 1. Iniciar Sesión (Login)
* **Método:** `POST`
* **Ruta:** `/api/auth/login`
* **Request Body (JSON):**
```json
{
  "email": "camila.gonzalez@gmail.com",
  "password": "password123",
  "role": "member" // o "staff"
}
```

* **Respuesta Exitosa (`200 OK`):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user", // "user" para paciente, "admin" para staff/kinesiólogo/coach
  "user": {
    "id": "1",
    "name": "Camila Gonzalez",
    "email": "camila.gonzalez@gmail.com",
    "plan": "Standard",
    "selectedClasses": ["Kinesiología Box 1", "Readaptación Funcional"]
  }
}
```

* **Respuestas de Error (`401 Unauthorized` / `404 Not Found`):**
```json
{
  "success": false,
  "message": "Error: Clave incorrecta. Verifica tu contraseña e inténtalo nuevamente."
}
```
*(O si el usuario no existe: `{ "message": "Error: El correo ingresado no se encuentra registrado." }`)*.

---

### 2. Registro de Nuevo Paciente
* **Método:** `POST`
* **Ruta:** `/api/auth/register`
* **Request Body (JSON):**
```json
{
  "name": "Carlos Muñoz",
  "email": "carlos.munoz@gmail.com",
  "password": "password123",
  "plan": "Standard",
  "selectedClasses": ["Kinesiología Box 1", "Entrenamiento HIIT"]
}
```

* **Respuesta Exitosa (`201 Created` / `200 OK`):**
```json
{
  "success": true,
  "token": "token-jwt-nuevo-usuario",
  "user": {
    "id": "member-12345",
    "name": "Carlos Muñoz",
    "email": "carlos.munoz@gmail.com",
    "plan": "Standard",
    "selectedClasses": ["Kinesiología Box 1", "Entrenamiento HIIT"]
  }
}
```

---

## 💻 Plantilla Mínima de Servidor (Node.js + Express)

Tu compañero puede crear un archivo `server.js` en una carpeta `/server` con este ejemplo rápido:

```javascript
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Base de datos de prueba
const users = [
  { id: '1', name: 'Camila Gonzalez', email: 'camila.gonzalez@gmail.com', password: 'password123', role: 'user', plan: 'Standard' },
  { id: '2', name: 'Juan Perez', email: 'juan.perez@gmail.com', password: 'password123', role: 'user', plan: 'Premium' },
  { id: '3', name: 'Admin Kinesiólogo', email: 'admin@profuncional.cl', password: 'admin1234', role: 'admin', plan: 'Premium' },
];

// Endpoint Login
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(404).json({ success: false, message: 'Error: El correo ingresado no está registrado.' });
  }

  if (user.password !== password) {
    return res.status(401).json({ success: false, message: 'Error: Clave incorrecta. Inténtalo de nuevo.' });
  }

  return res.json({
    success: true,
    token: 'jwt-token-demo-12345',
    role: user.role,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      selectedClasses: ['Kinesiología Box 1'],
    },
  });
});

app.listen(3001, () => {
  console.log('✅ Servidor Backend corriendo en http://localhost:3001');
});
```

---

## ⚡ Comportamiento Automático del Frontend

El archivo `src/app/services/authService.ts` ya está preparado para:
1. Intentar comunicarse con `http://localhost:3001/api/auth/login`.
2. Si el servidor backend está encendido, procesará la respuesta del servidor en vivo.
3. Si el servidor backend aún está apagado, usará el validador local de respaldo para que la interfaz nunca se caiga.
