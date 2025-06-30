# README

Bem-vindo ao Whats Hub!

Este projeto é um dashboard moderno para gerenciamento de bots WhatsApp, envio de e-mails, métricas e integrações.

## Principais funcionalidades
- Gerenciamento do bot (iniciar/parar, status, QR Code)
- Logs em tempo real com feedback visual
- Envio de e-mails com templates customizáveis
- Métricas e relatórios exportáveis
- Gerenciamento de tickets de atendimento
- Interface responsiva e acessível

## Como rodar o projeto
1. Instale as dependências:
   ```sh
   npm install
   # ou
   bun install
   ```
2. Configure as variáveis de ambiente no arquivo `.env` (veja exemplos em `EMAIL_SETUP.md`).
3. Rode o projeto:
   ```sh
   npm run dev
   # ou
   bun run dev
   ```
4. Acesse o dashboard em `http://localhost:5173` (ou porta configurada).

## Estrutura da documentação
- `DASHBOARD_ELEMENTOS.md`: Detalhes de cada elemento do dashboard
- `DASHBOARD_MELHORADA.MD`: Melhores práticas e exemplos avançados
- `SISTEMA_EMAIL_COMPLETO.md`: Guia do sistema de e-mail
- `EMAILJS_GUIA_COMPLETO.md`: Integração com EmailJS
- `PROJETO_COMPLETO.md`: Visão geral do projeto

## Contribuição
Pull requests são bem-vindos! Siga o padrão de código e adicione testes para novas funcionalidades.

## Suporte
Para dúvidas, consulte a pasta `docs` ou abra uma issue.

---
Desenvolvido por Lovable e colaboradores.
