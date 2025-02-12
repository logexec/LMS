# Etapa de construcción
FROM node:20-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración primero
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto de los archivos
COPY . .

# Crear .env.production con las variables que necesitamos
RUN echo "NEXT_PUBLIC_API_URL=https://api.lms.logex.com.ec/api" > .env.production

# URL directa de cloud run temporalmente hasta que se propague el DNS
# RUN echo "NEXT_PUBLIC_API_URL=https://api.lms-backend-898493889976.us-east1.run.app/api" > .env.production


# Construir el proyecto
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

# Copiar desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env.production ./.env.production

# Configurar variables de ambiente
ENV NODE_ENV=production
ENV PORT=8080

# Exponer puerto
EXPOSE 8080

# Comando de inicio
CMD ["npm", "run", "start"]