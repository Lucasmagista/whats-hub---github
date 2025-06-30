# WhatsApp Bot Dashboard

Um dashboard moderno e completo para gerenciar seu bot do WhatsApp, construído com Next.js, TypeScript, Prisma e NextAuth.js.

## 🚀 Funcionalidades

- **Dashboard Completo**: Visualização de métricas em tempo real
- **Gerenciamento de Clientes**: CRUD completo de clientes com segmentação
- **Sistema de Tickets**: Suporte completo com SLA e escalação
- **Mensagens**: Interface para envio e recebimento de mensagens
- **Email Marketing**: Templates e campanhas de email
- **Analytics Avançado**: Análise de sentimento e métricas detalhadas
- **Sistema de Permissões**: Controle granular de acesso
- **Logs em Tempo Real**: Monitoramento completo do sistema
- **Autenticação**: Login com Google/GitHub via NextAuth.js

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Banco de Dados**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **ORM**: Prisma
- **Autenticação**: NextAuth.js
- **Gráficos**: Recharts
- **Tabelas**: @tanstack/react-table
- **Formulários**: React Hook Form + Zod
- **Componentes UI**: Radix UI

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm, yarn ou pnpm

### Configuração

1. Clone o repositório:
```bash
git clone <repository-url>
cd dashboard
```

2. Instale as dependências:
```bash
npm install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Configure o banco de dados:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Execute o projeto:
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`.

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL="file:./dev.db"

# OAuth (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### Estrutura do Banco de Dados

O projeto utiliza Prisma como ORM com os seguintes modelos principais:

- **User**: Usuários do sistema
- **Customer**: Clientes do WhatsApp
- **Ticket**: Sistema de suporte
- **Message**: Mensagens do WhatsApp
- **EmailTemplate**: Templates de email
- **EmailCampaign**: Campanhas de email
- **Log**: Logs do sistema

## 📁 Estrutura do Projeto

```
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API Routes
│   ├── dashboard/         # Páginas do dashboard
│   ├── login/             # Página de login
│   └── register/          # Página de registro
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── dashboard/        # Componentes específicos do dashboard
│   └── advanced/         # Componentes avançados
├── lib/                  # Utilitários e configurações
├── prisma/               # Schema e migrações do banco
├── types/                # Definições de tipos TypeScript
└── hooks/                # Custom hooks
```

## 🎯 Funcionalidades Principais

### Dashboard
- Métricas em tempo real
- Gráficos interativos
- Estatísticas de desempenho

### Gerenciamento de Clientes
- CRUD completo
- Segmentação avançada
- Histórico de interações

### Sistema de Tickets
- Criação e gestão de tickets
- Sistema de SLA
- Escalação automática
- Análise de satisfação

### Mensagens
- Interface de chat
- Envio em massa
- Templates de mensagem
- Análise de sentimento

### Email Marketing
- Templates personalizáveis
- Campanhas automatizadas
- A/B Testing
- Analytics de email

### Relatórios e Analytics
- Relatórios personalizados
- Análise de sentimento
- Métricas de desempenho
- Insights com IA

## 🔐 Sistema de Autenticação

O projeto utiliza NextAuth.js com suporte a:

- Login com Google
- Login com GitHub
- Sistema de roles e permissões
- Middleware de proteção de rotas

## 📊 Analytics e Monitoramento

- **Logs em Tempo Real**: Via WebSocket
- **Métricas de Performance**: Tempo de resposta, uptime
- **Análise de Sentimento**: IA para análise de mensagens
- **Trilha de Auditoria**: Rastreamento de ações dos usuários

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push para o GitHub
2. Conecte seu repositório no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático

### Docker

```bash
# Build da imagem
docker build -t whatsapp-dashboard .

# Execute o container
docker run -p 3000:3000 whatsapp-dashboard
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email: suporte@example.com

## 🎨 Screenshots

![Dashboard](docs/images/dashboard.png)
![Clientes](docs/images/customers.png)
![Tickets](docs/images/tickets.png)

---

Desenvolvido com ❤️ usando Next.js e TypeScript
