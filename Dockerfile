FROM node:22-alpine

WORKDIR /app

# Copia arquivos de dependência e a pasta do prisma (para o postinstall: prisma generate)
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências (dispara o postinstall: prisma generate)
RUN npm ci

# Copia o restante do código da aplicação
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
