# Dockerfile do Mapoteca (Modo Desenvolvimento)
FROM node:20-alpine
WORKDIR /app

# Apenas instala as dependências. O código será montado por um volume.
COPY package*.json ./
RUN npm install

# Comando para rodar em modo de desenvolvimento com hot-reload
CMD ["npm", "run", "start:dev"]