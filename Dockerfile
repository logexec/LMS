# Etapa de dependencias
FROM node:20-alpine AS deps
WORKDIR /app

# Copiamos los archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./

# Instalamos dependencias
RUN npm ci --legacy-peer-deps

# Etapa de construcción
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos las dependencias y archivos de configuración
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/tsconfig.json ./
COPY --from=deps /app/next.config.js ./

# Copiamos el código fuente
COPY . .

# Configuramos la API y construimos
ARG NEXT_PUBLIC_API_URL=https://api.lms.logex.com.ec/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Construimos la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copiamos los archivos necesarios
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

CMD ["npm", "run", "start"]