# Etapa de dependencias
FROM node:20-alpine AS deps
WORKDIR /app

# Solo copiamos los archivos necesarios para la instalación
COPY package*.json ./
# Instalamos dependencias con cache limpio
RUN npm ci --legacy-peer-deps --only=production

# Etapa de construcción
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos las dependencias de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Configuramos la API y construimos
ARG NEXT_PUBLIC_API_URL=https://api.lms.logex.com.ec/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

# Etapa de producción
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Solo copiamos los archivos necesarios para producción
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Optimizamos la imagen
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app && \
    npm prune --production

USER nextjs

EXPOSE 8080

CMD ["npm", "run", "start"]