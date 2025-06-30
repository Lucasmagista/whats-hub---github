<div align="center">

# 🚀 Whats Hub

**Dashboard moderno para gerenciamento de bots WhatsApp**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/seu-usuario/whats-hub/graphs/commit-activity)

[🔗 Demo](http://localhost:5173) • [📚 Documentação](docs/) • [🐛 Issues](../../issues) • [💬 Suporte](../../discussions) • [📋 Changelog](CHANGELOG.md)

*Transforme seu atendimento WhatsApp com uma solução completa e moderna*

</div>

---

## 📖 Sobre o Projeto

O **Whats Hub** é uma solução completa para gerenciamento de bots WhatsApp, desenvolvida com as mais modernas tecnologias web. Oferece uma interface intuitiva para controlar múltiplos bots, gerenciar atendimentos, analisar métricas e automatizar processos de comunicação.

### 🎯 **Público-Alvo**
- 👥 **Empresas** que precisam automatizar atendimento
- 🏪 **E-commerces** com alto volume de mensagens
- 💼 **Freelancers** oferecendo serviços de automação
- 🏢 **Agências** gerenciando múltiplos clientes

---

## ✨ Principais Funcionalidades

<table>
<tr>
<td width="50%">

### 🤖 **Bot WhatsApp Avançado**
- ✅ Iniciar/parar múltiplos bots
- 📊 Monitoramento em tempo real
- 📱 QR Code para conexão rápida
- 🔄 Reconexão automática inteligente
- 🎯 Respostas automáticas personalizadas
- 📋 Histórico completo de conversas
- 🔒 Controle de sessões seguro

</td>
<td width="50%">

### 📧 **Sistema de E-mail Profissional**
- 📝 Editor de templates WYSIWYG
- 📤 Envio em massa programado
- 📊 Analytics de abertura e cliques
- 🔗 Integração EmailJS/SendGrid
- 🎨 Templates responsivos
- 📋 Listas de contatos segmentadas
- 🔄 Automação de campanhas

</td>
</tr>
<tr>
<td width="50%">

### 📈 **Analytics Avançado**
- 📊 Dashboard com métricas em tempo real
- 📋 Relatórios exportáveis (PDF/Excel)
- 📉 Gráficos interativos personalizáveis
- 🎯 KPIs customizáveis
- 📅 Relatórios agendados
- 🔍 Filtros avançados de dados
- 💹 Análise de conversão

</td>
<td width="50%">

### 🎫 **Sistema de Atendimento**
- 🎫 Tickets com priorização
- 👥 CRM integrado de clientes
- 📝 Logs detalhados de interações
- 🔔 Notificações push em tempo real
- ⏱️ SLA e métricas de atendimento
- 🏷️ Tags e categorização
- 🤝 Transferência entre atendentes

</td>
</tr>
<tr>
<td width="50%">

### 🔧 **Automação Inteligente**
- 🤖 Chatbots com IA integrada
- 🔄 Workflows personalizáveis
- ⏰ Agendamento de mensagens
- 🎯 Segmentação de audiência
- 📋 Formulários dinâmicos
- 🔗 Integração com APIs externas
- 🎪 Gatilhos comportamentais

</td>
<td width="50%">

### 🛡️ **Segurança & Conformidade**
- 🔐 Autenticação multi-fator
- 🛡️ Criptografia end-to-end
- 📋 Auditoria completa de ações
- 🔒 Controle de permissões
- 📊 Backup automático
- 🌐 Conformidade LGPD/GDPR
- 🔄 Versionamento de dados

</td>
</tr>
</table>

---

## 🚀 Início Rápido

### 📋 Pré-requisitos

<table>
<tr>
<td><strong>Obrigatórios</strong></td>
<td><strong>Opcionais</strong></td>
</tr>
<tr>
<td>

- **Node.js** 18+ ou **Bun**
- **npm** ou **yarn** ou **pnpm**
- **Git** para versionamento

</td>
<td>

- **Docker** para containerização
- **PostgreSQL** para produção
- **Redis** para cache
- **PM2** para deploy

</td>
</tr>
</table>

### 🛠️ Instalação

<details>
<summary><strong>📦 Instalação Padrão</strong></summary>

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/whats-hub.git
cd whats-hub

# Instale as dependências
npm install
# ou com Bun (mais rápido)
bun install
# ou com Yarn
yarn install
```

</details>

<details>
<summary><strong>🐳 Instalação com Docker</strong></summary>

```bash
# Clone e execute com Docker
git clone https://github.com/seu-usuario/whats-hub.git
cd whats-hub

# Construa e execute os containers
docker-compose up -d

# Acesse: http://localhost:5173
```

</details>

### ⚙️ Configuração Detalhada

<details>
<summary><strong>🔧 Configuração de Ambiente</strong></summary>

1. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

2. **Edite o arquivo `.env`** com suas configurações:
   ```env
   # Configurações da Aplicação
   VITE_API_URL=http://localhost:3000
   VITE_APP_NAME=Whats Hub
   VITE_APP_VERSION=1.0.0
   
   # EmailJS Configuration
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   
   # Database (Opcional)
   DATABASE_URL=postgresql://user:password@localhost:5432/whatshub
   
   # Redis (Opcional)
   REDIS_URL=redis://localhost:6379
   
   # Segurança
   JWT_SECRET=your-super-secret-key
   ENCRYPTION_KEY=your-encryption-key
   ```

</details>

<details>
<summary><strong>🔑 Configuração de APIs</strong></summary>

3. **Configure as integrações:**
   
   **EmailJS:**
   - Crie conta em [EmailJS](https://www.emailjs.com/)
   - Configure um serviço de email
   - Obtenha as chaves necessárias
   
   **WhatsApp Business API (Opcional):**
   - Configure webhook do WhatsApp
   - Obtenha token de acesso
   - Configure verificação de webhook

</details>

### 🏃‍♂️ Executando a Aplicação

```bash
# Modo de desenvolvimento
npm run dev          # Com hot-reload
bun run dev         # Mais rápido com Bun
yarn dev            # Com Yarn

# Build de produção
npm run build       # Otimizado para produção
npm run preview     # Preview do build

# Com Docker
docker-compose up   # Ambiente completo

# Acesse: http://localhost:5173
```

---

## 📁 Arquitetura do Projeto

<details>
<summary><strong>🏗️ Estrutura Detalhada</strong></summary>

```
whats-hub/
├── 📂 src/
│   ├── 📂 components/          # Componentes React reutilizáveis
│   │   ├── 📂 ui/             # Componentes de UI base
│   │   ├── 📂 forms/          # Formulários específicos
│   │   ├── 📂 charts/         # Componentes de gráficos
│   │   └── 📂 modals/         # Modais da aplicação
│   ├── 📂 pages/              # Páginas da aplicação
│   │   ├── 📂 dashboard/      # Dashboard principal
│   │   ├── 📂 bots/           # Gerenciamento de bots
│   │   ├── 📂 analytics/      # Página de analytics
│   │   └── 📂 settings/       # Configurações
│   ├── 📂 services/           # Camada de serviços
│   │   ├── 📂 api/            # Chamadas para APIs
│   │   ├── 📂 whatsapp/       # Integração WhatsApp
│   │   └── 📂 email/          # Serviços de email
│   ├── 📂 hooks/              # Custom Hooks React
│   ├── 📂 utils/              # Funções utilitárias
│   ├── 📂 types/              # Definições TypeScript
│   ├── 📂 store/              # Estado global (Zustand)
│   └── 📂 constants/          # Constantes da aplicação
├── 📂 docs/                   # Documentação completa
├── 📂 public/                 # Arquivos públicos estáticos
├── 📂 tests/                  # Suíte de testes
│   ├── 📂 unit/              # Testes unitários
│   ├── 📂 integration/       # Testes de integração
│   └── 📂 e2e/               # Testes end-to-end
├── 📂 scripts/               # Scripts de automação
├── 📂 docker/                # Configurações Docker
└── 📂 .github/               # GitHub Actions e templates
```

</details>

<details>
<summary><strong>🛠️ Stack Tecnológica</strong></summary>

**Frontend:**
- ⚛️ **React 18** - Biblioteca principal
- 📘 **TypeScript** - Tipagem estática
- 🎨 **Tailwind CSS** - Estilização utilitária
- 🔄 **Zustand** - Gerenciamento de estado
- 📊 **Recharts** - Gráficos e visualizações
- 🌐 **React Router** - Roteamento

**Backend/Integrações:**
- 🟢 **Node.js** - Runtime JavaScript
- 📧 **EmailJS** - Serviço de email
- 📱 **WhatsApp Web.js** - Integração WhatsApp
- 🗄️ **SQLite/PostgreSQL** - Banco de dados

**Ferramentas:**
- ⚡ **Vite** - Build tool moderna
- 🧪 **Vitest** - Testes unitários
- 🎭 **Playwright** - Testes E2E
- 📦 **Docker** - Containerização

</details>

---

## 📚 Documentação Completa

<table>
<tr>
<th>📊 Dashboard & UI</th>
<th>🔧 Configuração & Setup</th>
</tr>
<tr>
<td>

- 📊 [`DASHBOARD_ELEMENTOS.md`](docs/DASHBOARD_ELEMENTOS.md)
- 🎨 [`DASHBOARD_MELHORADA.md`](docs/DASHBOARD_MELHORADA.md)
- 🖼️ [`UI_COMPONENTS.md`](docs/UI_COMPONENTS.md)
- 🎯 [`UX_GUIDELINES.md`](docs/UX_GUIDELINES.md)

</td>
<td>

- ⚙️ [`INSTALLATION_GUIDE.md`](docs/INSTALLATION_GUIDE.md)
- 🔧 [`CONFIGURATION.md`](docs/CONFIGURATION.md)
- 🐳 [`DOCKER_SETUP.md`](docs/DOCKER_SETUP.md)
- 🚀 [`DEPLOYMENT.md`](docs/DEPLOYMENT.md)

</td>
</tr>
<tr>
<th>📧 Email & WhatsApp</th>
<th>🏗️ Desenvolvimento</th>
</tr>
<tr>
<td>

- 📧 [`SISTEMA_EMAIL_COMPLETO.md`](docs/SISTEMA_EMAIL_COMPLETO.md)
- 🔗 [`EMAILJS_GUIA_COMPLETO.md`](docs/EMAILJS_GUIA_COMPLETO.md)
- 📱 [`WHATSAPP_INTEGRATION.md`](docs/WHATSAPP_INTEGRATION.md)
- 🤖 [`BOT_CONFIGURATION.md`](docs/BOT_CONFIGURATION.md)

</td>
<td>

- 🏗️ [`PROJETO_COMPLETO.md`](docs/PROJETO_COMPLETO.md)
- 👨‍💻 [`CONTRIBUTING.md`](CONTRIBUTING.md)
- 📝 [`API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)
- 🧪 [`TESTING_GUIDE.md`](docs/TESTING_GUIDE.md)

</td>
</tr>
</table>

---

## 🤝 Contribuindo

<div align="center">

**🎉 Contribuições são sempre bem-vindas!**

*Junte-se à nossa comunidade de desenvolvedores*

</div>

### 🚀 Como Contribuir

<details>
<summary><strong>📝 Guia Passo a Passo</strong></summary>

1. **🍴 Fork** o projeto
2. **📋 Clone** seu fork
   ```bash
   git clone https://github.com/seu-usuario/whats-hub.git
   ```
3. **🌿 Crie** uma branch para sua feature
   ```bash
   git checkout -b feature/minha-nova-feature
   ```
4. **💻 Desenvolva** sua feature
5. **✅ Teste** suas mudanças
   ```bash
   npm run test
   ```
6. **📝 Commit** com mensagem semântica
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```
7. **🚀 Push** para sua branch
   ```bash
   git push origin feature/minha-nova-feature
   ```
8. **🔄 Abra** um Pull Request

</details>

### 📋 Tipos de Contribuição

<table>
<tr>
<td>🐛 <strong>Bug Fixes</strong></td>
<td>Correção de bugs e problemas</td>
</tr>
<tr>
<td>✨ <strong>Features</strong></td>
<td>Novas funcionalidades</td>
</tr>
<tr>
<td>📚 <strong>Documentação</strong></td>
<td>Melhorias na documentação</td>
</tr>
<tr>
<td>🎨 <strong>UI/UX</strong></td>
<td>Melhorias de interface</td>
</tr>
<tr>
<td>⚡ <strong>Performance</strong></td>
<td>Otimizações de performance</td>
</tr>
<tr>
<td>🧪 <strong>Testes</strong></td>
<td>Adição de testes</td>
</tr>
</table>

### 📝 Diretrizes de Desenvolvimento

- ✅ **Código**: Siga o padrão ESLint/Prettier
- ✅ **Commits**: Use convenção semântica
- ✅ **Testes**: Mantenha cobertura > 80%
- ✅ **Docs**: Documente APIs e componentes
- ✅ **Types**: Use TypeScript rigorosamente
- ✅ **Acessibilidade**: Siga padrões WCAG

---

## 🔧 Scripts e Comandos

<details>
<summary><strong>📋 Lista Completa de Scripts</strong></summary>

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run dev:host         # Servidor acessível na rede
npm run dev:debug        # Modo debug ativado

# Build e Deploy
npm run build            # Build de produção
npm run build:analyze    # Análise do bundle
npm run preview          # Preview do build
npm run deploy           # Deploy automático

# Testes
npm run test             # Testes unitários
npm run test:watch       # Testes em modo watch
npm run test:coverage    # Cobertura de testes
npm run test:e2e         # Testes end-to-end

# Qualidade de Código
npm run lint             # ESLint check
npm run lint:fix         # Corrige problemas ESLint
npm run format           # Formata código com Prettier
npm run type-check       # Verificação TypeScript

# Database
npm run db:migrate       # Executa migrações
npm run db:seed          # Popula banco com dados
npm run db:reset         # Reseta banco de dados

# Utilitários
npm run clean            # Limpa cache e builds
npm run update-deps      # Atualiza dependências
npm run security-check   # Auditoria de segurança
```

</details>

---

## 📊 Roadmap

<details>
<summary><strong>🗺️ Planejamento de Desenvolvimento</strong></summary>

### 🎯 **Versão 1.1** (Em Desenvolvimento)
- [ ] 🔐 Sistema de autenticação avançado
- [ ] 👥 Gestão de equipes e permissões
- [ ] 📱 App mobile (React Native)
- [ ] 🌐 Internacionalização (i18n)

### 🚀 **Versão 1.2** (Planejado)
- [ ] 🤖 Integração com ChatGPT/IA
- [ ] 📊 Dashboard customizável
- [ ] 🔄 Webhooks e integrações
- [ ] 💰 Sistema de cobrança

### 🌟 **Versão 2.0** (Futuro)
- [ ] 🏢 Versão Enterprise
- [ ] ☁️ SaaS completo
- [ ] 📈 Analytics avançado com ML
- [ ] 🌍 Multi-tenancy

</details>

---

## 🆘 Suporte e Comunidade

<div align="center">

<table>
<tr>
<td align="center">
<strong>📚 Documentação</strong><br>
<a href="docs/">Guias Completos</a>
</td>
<td align="center">
<strong>🐛 Issues</strong><br>
<a href="../../issues">Reportar Bugs</a>
</td>
<td align="center">
<strong>💬 Discussões</strong><br>
<a href="../../discussions">Fórum da Comunidade</a>
</td>
<td align="center">
<strong>📧 Email</strong><br>
<a href="mailto:support@whatshub.com">Suporte Direto</a>
</td>
</tr>
</table>

**🕐 Tempo de Resposta**
- 🟢 **Issues críticos**: < 24h
- 🟡 **Bugs gerais**: < 48h  
- 🔵 **Features**: < 7 dias

</div>

---

## 📄 Licença & Direitos

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

**✅ Você pode:**
- 💼 **Uso comercial**: Utilize em projetos comerciais com algumas restrições
- 🔄 **Modificar**: Adapte e personalize conforme suas necessidades
- 📦 **Distribuir**: Compartilhe com sua equipe ou comunidade
- 🔒 **Uso privado**: Mantenha suas modificações privadas
- 🏗️ **Criar derivados**: Desenvolva projetos baseados neste código
- 📋 **Incluir em produtos**: Integre em suas soluções comerciais

**❌ Limitações:**
- 🛡️ **Sem garantia**: Software fornecido "como está", sem garantias
- 🚫 **Sem responsabilidade**: Autores não são responsáveis por problemas
- 📝 **Créditos obrigatórios**: Mantenha os créditos originais nos arquivos
- ⚖️ **Conformidade legal**: Respeite leis locais de software

**🤝 Boas Práticas:**
- 🌟 **Contribua de volta**: Compartilhe melhorias com a comunidade
- 🐛 **Reporte problemas**: Ajude a melhorar o projeto
- 📚 **Documente mudanças**: Mantenha histórico de modificações
- 🔄 **Mantenha atualizado**: Acompanhe as atualizações do projeto original

**⚖️ Resumo Legal:**
Este projeto está licenciado sob a licença MIT, uma das mais permissivas do mundo open source. Isso significa máxima liberdade para uso, com mínimas restrições. Você pode usar este código em qualquer projeto, incluindo produtos comerciais, desde que mantenha o aviso de copyright original.

</div>

---

<div align="center">

## 👥 Colaboradores

<table>
<tr>
<td align="center">
<img src="https://avatars.githubusercontent.com/u/71129813?v=4" width="100px;" alt="Lucas"/><br>
<strong>Lucas Magista</strong><br>
<sub>Criador Principal</sub>
</td>
</tr>
</table>

**🌟 Hall da Fama dos Contribuidores**

</div>

---

<div align="center">

## 💝 Agradecimentos & Apoio

<br>

**Feito com ❤️ e muito ☕ por [Japaxr](https://lucasmagista.carrd.co/)**

*Transformando ideias em soluções reais para a comunidade*

<br>

### 🌟 Apoie o Projeto

<table align="center">
<tr>
<td align="center">
<a href="https://github.com/Lucasmagista/whats-hub---github/stargazers">
<img src="https://img.shields.io/github/stars/seu-usuario/whats-hub?style=for-the-badge&logo=github&logoColor=white&color=yellow" alt="GitHub stars">
</a>
<br><sub>⭐ <strong>Star no GitHub</strong></sub>
</td>
<td align="center">
<a href="https://github.com/Lucasmagista/whats-hub---github/network/members">
<img src="https://img.shields.io/github/forks/seu-usuario/whats-hub?style=for-the-badge&logo=github&logoColor=white&color=blue" alt="GitHub forks">
</a>
<br><sub>🍴 <strong>Fork o Projeto</strong></sub>
</td>
<td align="center">
<a href="https://github.com/Lucasmagista/whats-hub---github/issues">
<img src="https://img.shields.io/github/issues/seu-usuario/whats-hub?style=for-the-badge&logo=github&logoColor=white&color=red" alt="GitHub issues">
</a>
<br><sub>🐛 <strong>Reporte Issues</strong></sub>
</td>
<td align="center">
<a href="https://github.com/Lucasmagista/whats-hub---github/pulls">
<img src="https://img.shields.io/github/issues-pr/seu-usuario/whats-hub?style=for-the-badge&logo=github&logoColor=white&color=green" alt="GitHub PRs">
</a>
<br><sub>🔄 <strong>Contribua</strong></sub>
</td>
</tr>
</table>

<br>

### 🏆 Tecnologias que Tornaram Tudo Possível

<table align="center">
<tr>
<td align="center" width="20%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="60" height="60" alt="React"/>
<br><strong>React 18</strong>
<br><sub>🚀 A biblioteca que revolucionou o frontend</sub>
</td>
<td align="center" width="20%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="60" height="60" alt="TypeScript"/>
<br><strong>TypeScript</strong>
<br><sub>🛡️ JavaScript que escala com segurança</sub>
</td>
<td align="center" width="20%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" width="60" height="60" alt="Tailwind CSS"/>
<br><strong>Tailwind CSS</strong>
<br><sub>🎨 CSS utilitário que acelera o desenvolvimento</sub>
</td>
<td align="center" width="20%">
<img src="https://vitejs.dev/logo.svg" width="60" height="60" alt="Vite"/>
<br><strong>Vite</strong>
<br><sub>⚡ Build tool ultra-rápida</sub>
</td>
<td align="center" width="20%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="60" height="60" alt="Node.js"/>
<br><strong>Node.js</strong>
<br><sub>🌐 Runtime JavaScript poderoso</sub>
</td>
</tr>
</table>

<br>

### 🎯 Ferramentas que Fazem a Diferença

<table align="center">
<tr>
<td align="center" width="16.66%">
<img src="https://zustand-demo.pmnd.rs/logo.svg" width="48" height="48" alt="Zustand"/>
<br><strong>Zustand</strong>
<br><sub>Estado global simples</sub>
</td>
<td align="center" width="16.66%">
<img src="https://recharts.org/statics/logo.svg" width="48" height="48" alt="Recharts"/>
<br><strong>Recharts</strong>
<br><sub>Gráficos interativos</sub>
</td>
<td align="center" width="16.66%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" width="48" height="48" alt="Docker"/>
<br><strong>Docker</strong>
<br><sub>Containerização</sub>
</td>
<td align="center" width="16.66%">
<img src="https://vitest.dev/logo.svg" width="48" height="48" alt="Vitest"/>
<br><strong>Vitest</strong>
<br><sub>Testes modernos</sub>
</td>
<td align="center" width="16.66%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" width="48" height="48" alt="Git"/>
<br><strong>Git</strong>
<br><sub>Controle de versão</sub>
</td>
<td align="center" width="16.66%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" width="48" height="48" alt="VS Code"/>
<br><strong>VS Code</strong>
<br><sub>Editor favorito</sub>
</td>
</tr>
</table>

<br>

### 🌍 Comunidade e Inspiração

<table align="center">
<tr>
<td align="center">
<img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" width="48" height="48" alt="GitHub"/>
<br><strong>GitHub</strong>
<br><sub>🏠 Nossa casa</sub>
</td>
<td align="center">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/stackoverflow/stackoverflow-original.svg" width="48" height="48" alt="Stack Overflow"/>
<br><strong>Stack Overflow</strong>
<br><sub>🤔 Solucionando dúvidas</sub>
</td>
<td align="center">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" width="48" height="48" alt="npm"/>
<br><strong>npm</strong>
<br><sub>📦 Ecossistema incrível</sub>
</td>
<td align="center">
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/opensource/opensource-original.svg" width="48" height="48" alt="Open Source"/>
<br><strong>Open Source</strong>
<br><sub>💝 Espírito colaborativo</sub>
</td>
</tr>
</table>

<br>

### 💖 Formas de Apoiar

<table align="center">
<tr>
<td align="center" width="25%">
<strong>⭐ Star o Projeto</strong>
<br><sub>Ajuda na visibilidade</sub>
</td>
<td align="center" width="25%">
<strong>🐛 Reporte Bugs</strong>
<br><sub>Melhore a qualidade</sub>
</td>
<td align="center" width="25%">
<strong>💡 Sugira Features</strong>
<br><sub>Compartilhe ideias</sub>
</td>
<td align="center" width="25%">
<strong>🔄 Contribua</strong>
<br><sub>Faça parte da equipe</sub>
</td>
</tr>
<tr>
<td align="center" width="25%">
<strong>📢 Divulgue</strong>
<br><sub>Espalhe a palavra</sub>
</td>
<td align="center" width="25%">
<strong>📝 Documente</strong>
<br><sub>Ajude outros devs</sub>
</td>
<td align="center" width="25%">
<strong>🧪 Teste</strong>
<br><sub>Garanta a qualidade</sub>
</td>
<td align="center" width="25%">
<strong>☕ Café Virtual</strong>
<br><sub>Apoio financeiro</sub>
</td>
</tr>
</table>

<br>

### 🎉 Agradecimentos Especiais

<blockquote>
<p align="center">
<em>"Este projeto não seria possível sem a incrível comunidade open source.<br>
Cada linha de código, cada feedback, cada estrela ⭐ faz a diferença.<br>
Obrigado por fazer parte desta jornada!"</em>
</p>
</blockquote>

<table align="center">
<tr>
<td align="center">
<strong>👥 Aos Contribuidores</strong>
<br><sub>Que dedicam tempo e talento</sub>
</td>
<td align="center">
<strong>🐛 Aos Testadores</strong>
<br><sub>Que encontram e reportam problemas</sub>
</td>
<td align="center">
<strong>💡 Aos Idealizadores</strong>
<br><sub>Que sugerem melhorias</sub>
</td>
</tr>
<tr>
<td align="center">
<strong>📚 Aos Documentadores</strong>
<br><sub>Que compartilham conhecimento</sub>
</td>
<td align="center">
<strong>🌟 Aos Early Adopters</strong>
<br><sub>Que acreditaram no projeto</sub>
</td>
<td align="center">
<strong>❤️ À Comunidade</strong>
<br><sub>Que torna tudo possível</sub>
</td>
</tr>
</table>

<br>

---

<div align="center">
<strong>🚀 "O futuro é construído por quem ousa começar hoje" 🚀</strong>
<br><br>
<sub>© 2024 Whats Hub - Transformando comunicação, uma mensagem por vez.</sub>
</div>

</div>
