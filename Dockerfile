# Usamos Node.js 20 en Alpine Linux
FROM node:20-alpine AS builder

# Definir el directorio de trabajo
WORKDIR /app

# Copiar solo los archivos necesarios para instalar dependencias
COPY package.json package-lock.json ./

# Instalar dependencias sin dependencias de desarrollo
RUN npm ci --legacy-peer-deps

# Copiar el código de la aplicación después de instalar dependencias
COPY . .

# Construir la aplicación
RUN npm run build

##############################
# Imagen final para producción
##############################
FROM node:20-alpine

WORKDIR /app

# Copiar archivos desde la etapa de compilación
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PORT=8080

# Exponer puerto 8080 para Cloud Run
EXPOSE 8080

# Iniciar la aplicación
CMD ["npm", "run", "start"]
