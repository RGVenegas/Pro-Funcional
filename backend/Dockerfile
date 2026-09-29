# ==========================================
# STAGE 1: Build Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar todas las dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# Copiar el código fuente completo
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Compilar la aplicación NestJS
RUN npm run build

# ==========================================
# STAGE 2: Production Image
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copiar package.json
COPY package*.json ./

# Instalar únicamente dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar archivos compilados y Prisma de la etapa anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Crear usuario no-root por seguridad
USER node

# Exponer el puerto de la aplicación
EXPOSE 3001

# Comando por defecto para iniciar el servidor
CMD ["node", "dist/main.js"]
