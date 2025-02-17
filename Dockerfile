# syntax=docker/dockerfile:1.4
##############################
# Etapa de Construcción
##############################
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar la cache
COPY package.json package-lock.json ./

# Instalamos las dependencias sin dependencias de desarrollo y usando turbo
RUN npm ci --legacy-peer-deps && npm install -g turbo

# Copiamos el resto de la aplicación
COPY . .

# Construimos la aplicación con turbo
RUN turbo build

##############################
# Etapa de Producción
##############################
FROM node:20-alpine

WORKDIR /app

# Copiamos los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Variables de ambiente
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "run", "start"]
