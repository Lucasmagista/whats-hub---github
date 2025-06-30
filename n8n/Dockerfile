# WhatsApp Web.js + n8n Server Docker Image
FROM node:18-alpine

# Instalar dependências do sistema necessárias para Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Configurar Puppeteer para usar o Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S whatsapp -u 1001 -G nodejs

# Dar permissões ao usuário
RUN chown -R whatsapp:nodejs /app
USER whatsapp

# Expor porta
EXPOSE 3001

# Verificação de saúde
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Comando para iniciar o servidor
CMD ["npm", "start"]
