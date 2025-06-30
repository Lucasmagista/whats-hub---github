# Guia de Deploy

Este documento fornece instruções detalhadas para fazer o deploy do WhatsApp Bot Dashboard em diferentes plataformas.

## Pré-requisitos para Deploy

- Código fonte no GitHub/GitLab
- Variáveis de ambiente configuradas
- Banco de dados em produção (PostgreSQL recomendado)
- Certificados SSL (HTTPS obrigatório para OAuth)

## Deploy na Vercel (Recomendado)

A Vercel é a plataforma recomendada para deploy de aplicações Next.js.

### Passo 1: Preparação

1. Faça push do código para um repositório Git:
```bash
git add .
git commit -m "feat: prepare for deployment"
git push origin main
```

2. Certifique-se de que o arquivo `next.config.mjs` está configurado:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

### Passo 2: Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:

```env
# NextAuth.js
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=sua-chave-secreta-super-segura

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# OAuth (Google)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# OAuth (GitHub)
GITHUB_ID=seu-github-client-id
GITHUB_SECRET=seu-github-client-secret
```

5. Configure as build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

6. Clique em "Deploy"

### Passo 3: Configurar Banco de Dados

Para produção, use PostgreSQL. Recomendamos:

- **Neon** (gratuito): [neon.tech](https://neon.tech)
- **Supabase**: [supabase.com](https://supabase.com)
- **PlanetScale**: [planetscale.com](https://planetscale.com)

#### Configurando com Neon:

1. Crie uma conta no Neon
2. Crie um novo projeto
3. Copie a connection string
4. Atualize o schema para PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

5. Execute as migrações:
```bash
npx prisma migrate deploy
```

### Passo 4: Configurar OAuth

#### Google OAuth:
1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Adicione o domínio da Vercel nas URLs autorizadas:
   - `https://seu-dominio.vercel.app`
   - `https://seu-dominio.vercel.app/api/auth/callback/google`

#### GitHub OAuth:
1. Vá para [GitHub Developer Settings](https://github.com/settings/developers)
2. Atualize as URLs:
   - Homepage URL: `https://seu-dominio.vercel.app`
   - Authorization callback URL: `https://seu-dominio.vercel.app/api/auth/callback/github`

## Deploy no Netlify

### Passo 1: Configuração

1. Instale o adapter do Netlify:
```bash
npm install @netlify/plugin-nextjs
```

2. Crie o arquivo `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  external_node_modules = ["@prisma/client", "prisma"]
```

### Passo 2: Deploy

1. Faça push para o repositório
2. Conecte o repositório no Netlify
3. Configure as variáveis de ambiente
4. Deploy automático

## Deploy no Railway

Railway é uma boa opção com banco PostgreSQL integrado.

### Passo 1: Configuração

1. Crie uma conta no [Railway](https://railway.app)
2. Conecte seu repositório GitHub
3. Adicione um banco PostgreSQL
4. Configure as variáveis de ambiente

### Passo 2: Variáveis de Ambiente

```env
NEXTAUTH_URL=${{RAILWAY_STATIC_URL}}
NEXTAUTH_SECRET=sua-chave-secreta
DATABASE_URL=${{DATABASE_URL}}
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GITHUB_ID=seu-github-client-id
GITHUB_SECRET=seu-github-client-secret
```

## Deploy com Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/whatsapp_dashboard
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret-key
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=whatsapp_dashboard
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Deploy com Docker

```bash
# Build e run local
docker-compose up --build

# Deploy em produção
docker build -t whatsapp-dashboard .
docker run -p 3000:3000 whatsapp-dashboard
```

## Deploy na AWS

### Usando AWS Amplify

1. Conecte seu repositório no AWS Amplify
2. Configure as variáveis de ambiente
3. Configure o build:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npx prisma generate
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Usando EC2 + RDS

1. Configure uma instância EC2
2. Configure um banco RDS (PostgreSQL)
3. Instale Node.js e PM2:

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Clonar e configurar aplicação
git clone <repository-url>
cd dashboard
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# Iniciar com PM2
pm2 start npm --name "whatsapp-dashboard" -- start
pm2 startup
pm2 save
```

## Deploy no Google Cloud Platform

### Usando Cloud Run

1. Configure o gcloud CLI
2. Crie um arquivo `cloudbuild.yaml`:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/whatsapp-dashboard', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/whatsapp-dashboard']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'whatsapp-dashboard'
      - '--image'
      - 'gcr.io/$PROJECT_ID/whatsapp-dashboard'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
```

3. Deploy:
```bash
gcloud builds submit --config cloudbuild.yaml
```

## Configurações de Produção

### Variáveis de Ambiente Essenciais

```env
# App
NODE_ENV=production
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=chave-super-secreta-256-bits

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# OAuth
GOOGLE_CLIENT_ID=google-client-id
GOOGLE_CLIENT_SECRET=google-client-secret
GITHUB_ID=github-client-id
GITHUB_SECRET=github-client-secret

# Security
ENCRYPTION_KEY=chave-de-criptografia-32-chars

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# Monitoring (opcional)
SENTRY_DSN=sua-sentry-dsn
```

### Otimizações de Performance

1. **Configurar CDN** (Cloudflare recomendado)
2. **Habilitar compressão**:
```javascript
// next.config.mjs
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}
```

3. **Configurar cache headers**:
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### Monitoramento

#### Configurar Sentry

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

#### Health Check

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: 'Database connection failed' },
      { status: 500 }
    )
  }
}
```

## Checklist de Deploy

### Antes do Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] OAuth configurado para domínio de produção
- [ ] Banco de dados de produção configurado
- [ ] Migrações aplicadas
- [ ] Build local funcionando
- [ ] Testes passando

### Após o Deploy

- [ ] Aplicação acessível via HTTPS
- [ ] Login funcionando
- [ ] Banco de dados conectado
- [ ] APIs funcionando
- [ ] Logs sendo gerados
- [ ] Monitoramento ativo

### Segurança

- [ ] HTTPS configurado
- [ ] Headers de segurança configurados
- [ ] Rate limiting ativo
- [ ] Variáveis sensíveis não expostas
- [ ] Backup do banco configurado

## Rollback

### Vercel
```bash
vercel rollback <deployment-url>
```

### Docker
```bash
# Voltar para imagem anterior
docker tag whatsapp-dashboard:latest whatsapp-dashboard:backup
docker pull whatsapp-dashboard:previous
docker tag whatsapp-dashboard:previous whatsapp-dashboard:latest
docker-compose up -d
```

## Troubleshooting Comum

### Build Errors

**Erro: "Module not found"**
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

**Erro: "Prisma client not generated"**
```bash
npx prisma generate
```

### Runtime Errors

**Erro: "Database connection failed"**
- Verificar DATABASE_URL
- Testar conectividade do banco
- Verificar firewall/VPC settings

**Erro: "NextAuth configuration error"**
- Verificar NEXTAUTH_SECRET
- Confirmar NEXTAUTH_URL
- Validar OAuth credentials

### Performance Issues

- Verificar logs de aplicação
- Monitorar uso de CPU/memória
- Analisar queries do banco
- Verificar CDN/cache

## Suporte

Para problemas específicos de deploy:

1. Consulte os logs da plataforma
2. Verifique a documentação específica
3. Abra uma issue no repositório
4. Entre em contato com o suporte
