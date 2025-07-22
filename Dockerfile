# Dockerfile Multi-Stage para o Mapoteca App (VERSÃO FINAL E CORRETA)

# --- ESTÁGIO 1: BUILDER ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# --- ESTÁGIO 2: PRODUÇÃO ---
FROM node:20-alpine
WORKDIR /app

# Copia os arquivos de dependência (package.json) para a imagem final
COPY --from=builder /app/package*.json ./

# Copia a pasta node_modules e a pasta dist do estágio de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/main"]