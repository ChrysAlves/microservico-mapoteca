# Dockerfile Multi-Stage para o Mapoteca App (VERSÃO FINAL E CORRETA)

# --- ESTÁGIO 1: BUILDER ---
# Usamos uma imagem completa do Node para construir a aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência e instala TUDO
COPY package*.json ./
RUN npm install

# Copia o resto do código-fonte, incluindo o schema.prisma
COPY . .

# *** PASSO CRUCIAL: Gera o Prisma Client ***
RUN npx prisma generate

# Executa o build da aplicação, que agora encontrará os tipos do Prisma
RUN npm run build


# --- ESTÁGIO 2: PRODUÇÃO ---
# Usamos uma imagem limpa e leve para a execução
FROM node:20-alpine

WORKDIR /app

# Copia a pasta node_modules e a pasta dist do estágio de build
# A node_modules já contém o Prisma Client gerado
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Copia o schema do prisma, necessário para o Prisma Client em runtime
COPY --from=builder /app/prisma ./prisma


EXPOSE 3000

# O comando final para rodar a aplicação já compilada
CMD ["node", "dist/main"]