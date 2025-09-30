# Dockerfile para IT25I0032 - Sistema de Mediciones
# Usa Node.js con Alpine para imagen ligera

# ===============================
# Stage 1: Dependencias
# ===============================
FROM node:20-alpine AS deps

# Instalar dependencias necesarias para compilación
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de configuración de paquetes
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci

# ===============================
# Stage 2: Builder
# ===============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Construir la aplicación
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DOCKER_BUILD=true

RUN npm run build

# ===============================
# Stage 3: Runner (Producción)
# ===============================
FROM node:20-alpine AS runner

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Instalar dependencias de runtime
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copiar build de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar archivos de Prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/generated ./generated

# Crear directorio para la base de datos SQLite
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Variables de entorno para SQLite (se pueden sobreescribir)
ENV DATABASE_URL="file:/app/data/mediciones.db"

# Comando para iniciar la aplicación
# Primero ejecuta migraciones, luego inicia el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
