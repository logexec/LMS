# frontend/Dockerfile
# —————— Stage 1: Build ——————
FROM node:18-alpine AS builder
WORKDIR /app

# Instala deps
COPY package.json package-lock.json ./
RUN npm ci

# Copia el resto y genera el build
COPY . .
RUN npm run build

# —————— Stage 2: Run ——————
FROM node:18-alpine AS runner
WORKDIR /app

# Sólo copiamos lo necesario para correr
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
