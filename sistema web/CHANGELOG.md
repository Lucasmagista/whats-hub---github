# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Nova funcionalidade de exportação de relatórios
- Suporte a templates personalizados de email
- Integração com webhook para notificações

### Changed
- Melhorias na performance das consultas ao banco
- Interface redesenhada para melhor UX

### Fixed
- Correção no bug de paginação da tabela de clientes
- Problema de timeout em uploads de arquivos

## [1.2.0] - 2024-12-20

### Added
- **Sistema de Tickets**: Sistema completo de suporte com SLA
  - Criação, edição e atribuição de tickets
  - Sistema de prioridades (LOW, MEDIUM, HIGH, URGENT)
  - Escalação automática baseada em SLA
  - Análise de satisfação do cliente
- **Analytics Avançado**: 
  - Análise de sentimento das mensagens
  - Métricas de performance em tempo real
  - Gráficos interativos com Recharts
- **Sistema de Permissões**: 
  - Roles definidos (ADMIN, MANAGER, AGENT, VIEWER)
  - Controle granular de permissões
  - Middleware de proteção de rotas
- **Logs em Tempo Real**: 
  - Sistema de logs com diferentes níveis
  - WebSocket para logs em tempo real
  - Interface de visualização de logs

### Changed
- **Migração para SQLite**: Alterado de PostgreSQL para SQLite em desenvolvimento
- **Melhoria na autenticação**: 
  - Atualizado NextAuth.js para versão mais recente
  - Melhor tratamento de sessões
- **Interface modernizada**: 
  - Novo design system baseado em shadcn/ui
  - Melhor responsividade mobile
  - Animações e transições suaves

### Fixed
- Correção no erro 404 da página inicial
- Problema de renderização do SessionProvider
- Conflitos de tipos TypeScript

### Security
- Headers de segurança implementados
- Validação de input aprimorada
- Rate limiting nas APIs

## [1.1.0] - 2024-11-15

### Added
- **Email Marketing**: 
  - Templates de email personalizáveis
  - Sistema de campanhas de email
  - A/B Testing para templates
  - Analytics de email (abertura, cliques)
- **Gerenciamento de Clientes**: 
  - CRUD completo de clientes
  - Sistema de tags e segmentação
  - Histórico de interações
  - Análise de satisfação
- **Dashboard Interativo**: 
  - Métricas principais em tempo real
  - Gráficos de performance
  - Cards de estatísticas

### Changed
- Migração completa para Next.js 14 App Router
- Atualização do Prisma para versão mais recente
- Melhoria na estrutura de componentes

### Fixed
- Problema de cache do navegador
- Erro de hydration no SSR
- Inconsistências no banco de dados

### Deprecated
- API routes antigas do Pages Router

## [1.0.0] - 2024-10-01

### Added
- **Autenticação Completa**:
  - Login com Google OAuth
  - Login com GitHub OAuth
  - Sistema de sessões persistentes
  - Middleware de proteção de rotas
- **Bot WhatsApp**:
  - Integração básica com WhatsApp Web
  - Controle de start/stop do bot
  - Monitoramento de status
  - QR Code para conexão
- **Interface Base**:
  - Design system com Tailwind CSS
  - Componentes reutilizáveis
  - Layout responsivo
  - Tema claro/escuro
- **Banco de Dados**:
  - Schema Prisma completo
  - Migrações automáticas
  - Seed de dados inicial

### Changed
- Estrutura do projeto organizada
- Documentação completa

### Security
- Implementação de CSRF protection
- Validação de inputs
- Headers de segurança

## [0.3.0] - 2024-09-15

### Added
- Sistema básico de mensagens
- Interface de chat primitiva
- Configurações básicas do bot

### Changed
- Migração para TypeScript
- Melhorias na estrutura de pastas

### Fixed
- Problemas de conexão com o banco
- Erros de compilação

## [0.2.0] - 2024-09-01

### Added
- Autenticação básica
- Dashboard inicial
- Integração com Prisma

### Changed
- Atualização para Next.js 14
- Novo sistema de build

### Fixed
- Problemas de performance
- Memory leaks

## [0.1.0] - 2024-08-15

### Added
- Configuração inicial do projeto
- Estrutura base Next.js
- Configuração do ambiente de desenvolvimento
- Primeiros componentes UI

---

## Legendas

- `Added` para novas funcionalidades
- `Changed` para mudanças em funcionalidades existentes
- `Deprecated` para funcionalidades que serão removidas
- `Removed` para funcionalidades removidas
- `Fixed` para correções de bugs
- `Security` para correções de vulnerabilidades

## Links de Comparação

- [Unreleased](https://github.com/seu-usuario/dashboard/compare/v1.2.0...HEAD)
- [1.2.0](https://github.com/seu-usuario/dashboard/compare/v1.1.0...v1.2.0)
- [1.1.0](https://github.com/seu-usuario/dashboard/compare/v1.0.0...v1.1.0)
- [1.0.0](https://github.com/seu-usuario/dashboard/compare/v0.3.0...v1.0.0)
- [0.3.0](https://github.com/seu-usuario/dashboard/compare/v0.2.0...v0.3.0)
- [0.2.0](https://github.com/seu-usuario/dashboard/compare/v0.1.0...v0.2.0)
- [0.1.0](https://github.com/seu-usuario/dashboard/releases/tag/v0.1.0)
