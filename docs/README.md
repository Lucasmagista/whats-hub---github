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
- 🎨 [`DASHBOARD_MELHORADA.MD`](docs/DASHBOARD_MELHORADA.MD)
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

## 📄 Licença

<div align="center">

Este projeto está licenciado sob a **Licença MIT**.

Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

**✅ Você pode:**
- ✨ Usar comercialmente
- 🔄 Modificar o código
- 📦 Distribuir
- 🔒 Uso privado

**❌ Limitações:**
- 🛡️ Sem garantia
- 🚫 Sem responsabilidade

</div>

---

<div align="center">

## 👥 Colaboradores

<table>
<tr>
<td align="center">
<img src="https://github.com/lovable.png" width="100px;" alt="Lovable"/><br>
<strong>Lovable</strong><br>
<sub>Criador Principal</sub>
</td>
<td align="center">
<img src="https://github.com/github.png" width="100px;" alt="Você"/><br>
<strong>Você?</strong><br>
<sub>Próximo Colaborador</sub>
</td>
</tr>
</table>

**🌟 Hall da Fama dos Contribuidores**

[![Contribuidores](https://contrib.rocks/image?repo=seu-usuario/whats-hub)](https://github.com/seu-usuario/whats-hub/graphs/contributors)

---

## 💝 Agradecimentos

Feito com ❤️ por [Lovable](https://lovable.dev) e nossa incrível comunidade.

**Tecnologias que tornaram este projeto possível:**
- ⚛️ [React](https://reactjs.org/) - A biblioteca que mudou tudo
- 📘 [TypeScript](https://www.typescriptlang.org/) - JavaScript que escala
- 🎨 [Tailwind CSS](https://tailwindcss.com/) - CSS utilitário
- ⚡ [Vite](https://vitejs.dev/) - Build tool do futuro

---

<div align="center">
<img src="https://img.shields.io/github/stars/seu-usuario/whats-hub?style=social" alt="GitHub stars">
<img src="https://img.shields.io/github/forks/seu-usuario/whats-hub?style=social" alt="GitHub forks">
<img src="https://img.shields.io/github/watchers/seu-usuario/whats-hub?style=social" alt="GitHub watchers">
</div>

**⭐ Se este projeto foi útil para você, considere deixar uma estrela!**

**🚀 Transforme seu atendimento hoje mesmo!**

</div>
