# Etapa base
FROM node:20

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos del frontend
COPY . .

RUN rm -rf package-lock.json node_modules && npm install --legacy-peer-deps

RUN npm install -g npm@latest

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Construir el proyecto
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start"]
