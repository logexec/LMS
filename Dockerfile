# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos primero los archivos de configuración para aprovechar cache
COPY package*.json ./

# Instalamos las dependencias usando npm ci para mejor predictibilidad
RUN npm ci --legacy-peer-deps --prefer-offline

# Copiamos el resto de la aplicación
COPY . .

# Usamos un argumento para configurar la API
ARG NEXT_PUBLIC_API_URL=https://api.lms.logex.com.ec/api
RUN echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" > .env.production

# Construimos la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

# Copiamos únicamente lo necesario desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.env.production ./.env.production

# Variables de ambiente
ENV NODE_ENV=production
ENV PORT=8080

# Limpiamos cache de npm para reducir tamaño
RUN npm cache clean --force

EXPOSE 8080

CMD ["npm", "run", "start"]