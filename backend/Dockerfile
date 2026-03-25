# Imagem Base (Leve e Segura)
FROM node:18-alpine

# Criar e definir diretório de trabalho no container
WORKDIR /usr/src/app

# Copiar os arquivos de dependência primeiro para aproveitar cache do Docker
COPY package*.json ./

# Instalar pacotes de produção ignorando ferramentas de dev
RUN npm install --only=production

# Copiar o restante da aplicação
COPY . .

# Expor a porta dinâmica que o Cloud Run injetar (ou 8080 padrão)
ENV PORT 8080
EXPOSE 8080

# Comando de partida oficial Security-First
CMD ["node", "server.js"]
