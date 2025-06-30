# Guia de Instalação

Este guia irá te ajudar a configurar o WhatsApp Bot Dashboard do zero.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm**, **yarn** ou **pnpm** (gerenciador de pacotes)
- **Git** (para clonar o repositório)

### Verificando as versões

```bash
node --version  # deve ser 18.0.0 ou superior
npm --version   # deve ser 8.0.0 ou superior
git --version   # qualquer versão recente
```

## Passo 1: Clone do Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd dashboard
```

## Passo 2: Instalação das Dependências

Usando npm:
```bash
npm install
```

Usando pnpm (recomendado):
```bash
pnpm install
```

Usando yarn:
```bash
yarn install
```

## Passo 3: Configuração das Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```

2. Edite o arquivo `.env.local` com suas configurações:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=uma-chave-secreta-muito-segura

# Database URL
DATABASE_URL="file:./dev.db"

# OAuth Providers (Opcional)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GITHUB_ID=seu-github-client-id
GITHUB_SECRET=seu-github-client-secret
```

### Obtendo as Credenciais OAuth (Opcional)

#### Google OAuth
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configure as URLs autorizadas:
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth
1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Preencha os campos:
   - Application name: `WhatsApp Dashboard`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## Passo 4: Configuração do Banco de Dados

O projeto está configurado para usar SQLite em desenvolvimento. Para configurar:

1. Gere o cliente Prisma:
```bash
npx prisma generate
```

2. Execute as migrações:
```bash
npx prisma migrate dev --name init
```

3. (Opcional) Visualize o banco de dados:
```bash
npx prisma studio
```

## Passo 5: Executar o Projeto

```bash
npm run dev
# ou
pnpm dev
# ou
yarn dev
```

O projeto estará disponível em `http://localhost:3000`.

## Passo 6: Verificação da Instalação

1. Acesse `http://localhost:3000`
2. Você deve ver a página de login
3. Teste o login (se configurou OAuth) ou crie uma conta
4. Verifique se o dashboard carrega corretamente

## Solução de Problemas Comuns

### Erro: "Module not found"
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Prisma Client not generated"
```bash
npx prisma generate
```

### Erro: "Database connection failed"
- Verifique se a `DATABASE_URL` está correta no `.env.local`
- Execute `npx prisma migrate dev` novamente

### Erro: "NextAuth configuration error"
- Verifique se `NEXTAUTH_SECRET` está definido
- Certifique-se de que `NEXTAUTH_URL` está correto

### Porta 3000 já em uso
```bash
# Use uma porta diferente
npm run dev -- -p 3001
```

## Próximos Passos

Após a instalação bem-sucedida:

1. Leia a [Documentação da API](API.md)
2. Consulte o [Guia de Desenvolvimento](DEVELOPMENT.md)
3. Configure o [Sistema de Deploy](DEPLOYMENT.md)

## Scripts Disponíveis

- `npm run dev` - Executa em modo de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Executa a versão de produção
- `npm run lint` - Executa o linter
- `npx prisma studio` - Abre o Prisma Studio
- `npx prisma migrate dev` - Executa migrações
- `npx prisma generate` - Gera o cliente Prisma

## Estrutura de Pastas Após Instalação

```
dashboard/
├── .env.local              # Suas variáveis de ambiente
├── dev.db                  # Banco SQLite (desenvolvimento)
├── node_modules/           # Dependências
├── prisma/
│   └── migrations/         # Migrações do banco
├── .next/                  # Build do Next.js
└── ... (resto dos arquivos)
```

## Suporte

Se você encontrar problemas durante a instalação:

1. Verifique a seção de solução de problemas acima
2. Consulte as [Issues do GitHub](link-to-issues)
3. Entre em contato com a equipe de desenvolvimento
