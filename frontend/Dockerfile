# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app

# sólo copio package.json para instalar deps
COPY package.json package-lock.json ./
RUN npm ci

# luego el resto del código
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# FROM node:18-alpine AS deps
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci

# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
# RUN npm run build

# FROM node:18-alpine AS runner
# WORKDIR /app

# ENV NODE_ENV=production
# # Copia sólo lo necesario
# # COPY --from=builder /app/next.config.js ./
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json

# EXPOSE 3000
# CMD ["npm", "run", "start"]
