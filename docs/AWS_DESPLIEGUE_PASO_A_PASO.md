# 🚀 Guía Detallada de Instalación y Configuración en AWS (EC2 + Nginx + PostgreSQL + PM2)

Esta guía documenta paso a paso el proceso completo para desplegar la aplicación **ProFuncional** (Frontend en React + Vite, Backend en NestJS + Prisma ORM y Base de Datos PostgreSQL) en una instancia **AWS EC2 Ubuntu**.

---

## 📋 Tabla de Contenidos
1. [Requisitos Previos en AWS](#1-requisitos-previos-en-aws)
2. [Instalación de Dependencias del Sistema](#2-instalación-de-dependencias-del-sistema)
3. [Configuración de la Base de Datos PostgreSQL](#3-configuración-de-la-base-de-datos-postgresql)
4. [Clonación del Repositorio y Variables de Entorno](#4-clonación-del-repositorio-y-variables-de-entorno)
5. [Despliegue y Configuración del Backend (NestJS + Prisma + PM2)](#5-despliegue-y-configuración-del-backend-nestjs--prisma--pm2)
6. [Construcción y Configuración del Frontend (React + Vite)](#6-construcción-y-configuración-del-frontend-react--vite)
7. [Configuración de Nginx (Servidor Web & Proxy Inverso)](#7-configuración-de-nginx-servidor-web--proxy-inverso)
8. [Script y Comandos de Actualización Rápida](#8-script-y-comandos-de-actualización-rápida)

---

## 1. Requisitos Previos en AWS

### A. Instancia EC2
- **Sistema Operativo:** Ubuntu 22.04 LTS o 24.04 LTS (x86_64).
- **Tipo de Instancia:** `t2.micro` o `t3.micro` (Elegible para capa gratuita).
- **Dirección IP:** Elastic IP (IP Pública fija, ej: `18.205.44.92`).

### B. Reglas de Grupo de Seguridad (Inbound Rules)
Asegúrate de habilitar los siguientes puertos en la consola de AWS (Security Groups):
- **SSH (Port 22):** Para conexión remota (0.0.0.0/0 o tu IP).
- **HTTP (Port 80):** Para acceso web general (0.0.0.0/0).
- **HTTPS (Port 443):** Para SSL/TLS (0.0.0.0/0).

---

## 2. Instalación de Dependencias del Sistema

Conéctate a la instancia mediante SSH:
```bash
ssh -i "tu-llave.pem" ubuntu@TU_IP_PUBLICA_EC2
```

Ejecuta la actualización del sistema e instala Node.js LTS (v20), PostgreSQL, Git y Nginx:

```bash
# 1. Actualizar repositorios del sistema
sudo apt update && sudo apt upgrade -y

# 2. Agregar repositorio oficial de Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 3. Instalar Node.js, Git, Nginx, PostgreSQL y herramientas auxiliares
sudo apt install -y nodejs git nginx postgresql postgresql-contrib lsof

# 4. Instalar PM2 globalmente para administrar procesos Node.js en segundo plano
sudo npm install -g pm2
```

Verifica las versiones instaladas:
```bash
node -v    # Debe ser v20.x.x
npm -v     # Debe ser 10.x.x
nginx -v   # Debe ser nginx/1.x.x
```

---

## 3. Configuración de la Base de Datos PostgreSQL

Accede a PostgreSQL para crear la base de datos y el usuario con permisos adecuados:

```bash
# Acceder a la consola de PostgreSQL
sudo -u postgres psql
```

Dentro del intérprete SQL de psql (`postgres=#`), ejecuta:

```sql
-- Crear la base de datos profuncional
CREATE DATABASE profuncional;

-- Crear o asegurar usuario postgres con contraseña
CREATE USER postgres WITH PASSWORD 'postgres';

-- Otorgar todos los privilegios sobre la base de datos
GRANT ALL PRIVILEGES ON DATABASE profuncional TO postgres;

-- (Opcional) Otorgar superusuario para permitir ejecución fluida de migraciones Prisma
ALTER USER postgres WITH SUPERUSER;

-- Salir de psql
\q
```

Verifica que el servicio de PostgreSQL esté activo:
```bash
sudo systemctl status postgresql
```

---

## 4. Clonación del Repositorio y Variables de Entorno

Clona el repositorio en el directorio home (`/home/ubuntu/`):

```bash
cd ~
git clone https://github.com/RGVenegas/Pro-Funcional.git
cd Pro-Funcional
```

### Configuración del archivo `.env` del Backend:
Crea o edita el archivo `backend/.env`:

```bash
cd ~/Pro-Funcional/backend
nano .env
```

Ingresa el siguiente contenido:

```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/profuncional?schema=public"
JWT_SECRET="profuncional_jwt_secret_key_2026_super_secure"
NODE_ENV=production
```

---

## 5. Despliegue y Configuración del Backend (NestJS + Prisma + PM2)

### A. Instalación de dependencias del Backend:
```bash
cd ~/Pro-Funcional/backend
npm install
```

### B. Sincronización de Schema y Carga Inicial de Datos (Seed):
```bash
# Sincronizar el esquema de Prisma con PostgreSQL
npx prisma db push

# Ejecutar el Seed para cargar datos iniciales (bloques horarios, usuarios y paquetes)
npx prisma db seed
```

### C. Compilar el Backend:
```bash
npm run build
```

### D. Iniciar el Backend con PM2:
```bash
# Iniciar el proceso compilado en dist/main.js
pm2 start dist/main.js --name "backend"

# Configurar PM2 para reiniciar automáticamente si el servidor se reinicia
pm2 save
pm2 startup
```

Para verificar el estado y los registros del backend:
```bash
pm2 status
pm2 logs backend
```

---

## 6. Construcción y Configuración del Frontend (React + Vite)

### A. Compilación del Frontend:
```bash
cd ~/Pro-Funcional
npm install
npm run build
```

Esto generará la carpeta `dist/` optimizada para producción.

### B. Ubicación del Root de Nginx (`/var/www/profuncional`):
```bash
# Crear directorio de destino para la aplicación web
sudo mkdir -p /var/www/profuncional

# Copiar los archivos compilados del frontend a la carpeta web
sudo cp -r dist/* /var/www/profuncional/

# Asignar permisos al usuario de Nginx (www-data)
sudo chown -R www-data:www-data /var/www/profuncional
sudo chmod -R 755 /var/www/profuncional
```

---

## 7. Configuración de Nginx (Servidor Web & Proxy Inverso)

Configura Nginx para servir el Frontend como SPA y redirigir las peticiones `/api` al backend en el puerto `3001`.

### A. Crear archivo de sitio Nginx:
```bash
sudo nano /etc/nginx/sites-available/profuncional
```

Ingresa la siguiente configuración completa:

```nginx
server {
    listen 80;
    server_name _; # Acepta peticiones por IP o por dominio configurado

    # Directorio raíz con el frontend compilado
    root /var/www/profuncional;
    index index.html;

    # Frontend Single Page Application (SPA) Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy Inverso hacia el Backend NestJS en puerto 3001
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### B. Habilitar la configuración y deshabilitar el sitio por defecto:
```bash
# Enlazar la configuración activa
sudo ln -sf /etc/nginx/sites-available/profuncional /etc/nginx/sites-enabled/

# Deshabilitar el sitio por defecto de Nginx
sudo rm -f /etc/nginx/sites-enabled/default

# Probar la sintaxis de la configuración
sudo nginx -t

# Reiniciar el servicio de Nginx
sudo systemctl restart nginx
```

---

## 8. Script y Comandos de Actualización Rápida

Cuando realices futuros cambios en el repositorio de GitHub (`main`), puedes actualizar tu servidor en AWS ejecutando el siguiente bloque de comandos:

```bash
cd ~/Pro-Funcional
git pull origin main

# --- Actualizar Frontend ---
npm install
npm run build
sudo cp -r dist/* /var/www/profuncional/
sudo systemctl restart nginx

# --- Actualizar Backend ---
cd ~/Pro-Funcional/backend
npm install
npx prisma db push
npm run build
pm2 restart backend
```

---

### 📝 Resumen de Puertos y Servicios
| Servicio | Puerto Local | Exposición | Descripción |
| :--- | :--- | :--- | :--- |
| **Nginx Web Server** | `80` | Pública | Sirve el frontend estático y proxy `/api` |
| **NestJS Backend** | `3001` | Interna (`localhost`) | Proceso gestionado por PM2 |
| **PostgreSQL Database** | `5432` | Interna (`localhost`) | Base de datos relacional `profuncional` |

---
*Documento generado el 8 de Octubre de 2026 para el proyecto ProFuncional.*
