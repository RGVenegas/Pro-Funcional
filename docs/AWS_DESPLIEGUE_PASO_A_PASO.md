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

> **Nota de Arquitectura Actual:**  
> La base de datos principal de ProFuncional se encuentra alojada en **Neon Cloud PostgreSQL (AWS us-east-2)** con connection pooling de alta concurrencia.  
> Por tanto, **NO es necesario instalar ni ejecutar PostgreSQL dentro de la instancia EC2**, lo cual ahorra valiosa memoria RAM y CPU en instancias `t2.micro` o `t3.micro`. El backend se conecta directamente a Neon mediante SSL seguro.
>
> *(Opcional)* Si por contingencia académica o de red deseas ejecutar una base de datos local en la misma EC2, puedes instalarla con:
> ```bash
> sudo apt install -y postgresql postgresql-contrib
> sudo -u postgres psql -c "CREATE DATABASE profuncional;"
> sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;"
> ```

---

## 4. Clonación del Repositorio y Variables de Entorno

Clona el repositorio en el directorio home (`/home/ubuntu/`):

```bash
cd ~
git clone https://github.com/RGVenegas/Pro-Funcional.git
cd Pro-Funcional
```

### A. Configuración del archivo `.env` del Backend:
Crea o edita el archivo `backend/.env`:

```bash
cd ~/Pro-Funcional/backend
nano .env
```

Ingresa la configuración actualizada (conectada a Neon PostgreSQL y pasarela Mercado Pago):

```env
# Puerto del servidor
PORT=3001
NODE_ENV=production

# Base de Datos PostgreSQL (Neon Cloud en AWS us-east-2 con Connection Pooling)
DATABASE_URL="postgresql://neondb_owner:npg_30oaUfGvenQd@ep-royal-leaf-b57dul4v-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_30oaUfGvenQd@ep-royal-leaf-b57dul4v.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Seguridad y Autenticación JWT
JWT_SECRET="pro-funcional-secret-key-2026"

# Integración Pasarela Mercado Pago
MP_ACCESS_TOKEN="APP_USR-7927538972553829-102314-8176823578ad9dc95e0107da81d187bd-3786162905"
MP_WEBHOOK_SECRET="bc812a5c2953ca4a1ac9cadb4f1142ed488a7b7ad8828ddb8f7d2e8a3fcaa8d9"
```

### B. Configuración del archivo `.env` del Frontend:
Crea o edita el archivo `.env` en la raíz del proyecto (`~/Pro-Funcional/.env`):

```bash
cd ~/Pro-Funcional
nano .env
```

Ingresa el siguiente contenido:

```env
# En producción servido por Nginx se usa /api como proxy inverso
VITE_API_URL=/api

# Clave pública de Mercado Pago (Checkout Bricks en el navegador)
VITE_MP_PUBLIC_KEY=APP_USR-94b0da71-7536-48d0-979f-764848198412
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

Cuando actualices tu servidor en AWS para reflejar los últimos cambios del repositorio (`main`) o cambios de base de datos / variables `.env`, puedes ejecutar el siguiente bloque de comandos:

```bash
# 1. Posicionarse en la raíz y descargar los últimos cambios
cd ~/Pro-Funcional
git pull origin main

# 2. Actualizar Frontend (React + Vite)
npm install
npm run build
sudo cp -r dist/* /var/www/profuncional/
sudo systemctl restart nginx

# 3. Actualizar Backend (NestJS + Prisma + Neon DB)
cd ~/Pro-Funcional/backend
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart backend || pm2 start dist/main.js --name "backend"
pm2 save

# 4. Verificar salud del servicio
curl http://localhost:3001/v1/health
pm2 status
```

---

### 📝 Resumen de Puertos y Servicios
| Servicio | Puerto Local | Exposición | Descripción |
| :--- | :--- | :--- | :--- |
| **Nginx Web Server** | `80` (HTTP) | Pública (`0.0.0.0/0`) | Sirve el frontend estático SPA y proxy inverso hacia `/api` |
| **NestJS Backend API** | `3001` | Interna (`localhost`) | API REST gestionada en segundo plano por PM2 |
| **PostgreSQL Database** | `5432` / SSL | Nube AWS us-east-2 | Neon Cloud PostgreSQL con Pooler de conexiones |

---
*Documento actualizado en Noviembre de 2026 para el proyecto ProFuncional.*
