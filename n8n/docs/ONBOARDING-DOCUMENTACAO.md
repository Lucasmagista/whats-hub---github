# Onboarding e Documentação do Projeto WhatsApp Bot + Catálogo

## Objetivo
Facilitar o onboarding de novos desenvolvedores, parceiros e operadores, com instruções claras e design moderno.

---

## 1. Visão Geral
- Bot WhatsApp integrado ao catálogo Next.js/Tailwind
- Fluxo de compra robusto, atendimento humano, segurança e governança

---

## 2. Primeiros Passos
### Pré-requisitos
- Node.js 18+
- PostgreSQL 13+
- WhatsApp Web.js
- Next.js, Tailwind CSS

### Instalação
```sh
git clone <repo>
cd n8n
npm install
```

### Configuração
- Edite `.env` conforme exemplos
- Configure variáveis de integração (WhatsApp, catálogo, banco, etc)

---

## 3. Executando o Projeto
```sh
npm run dev # Backend bot
cd catalog && npm run dev # Frontend catálogo
```

---

## 4. Fluxos Principais
- Compra via WhatsApp (multi-produto, multimídia, feedback)
- Recuperação de carrinho
- Atendimento humano inteligente
- Segurança, logging, backup

---

## 5. Dicas de Design
- Use componentes visuais do Tailwind para o frontend
- Cards, banners e feedbacks visuais no WhatsApp
- Sempre forneça fallback textual para multimídia

---

## 6. Troubleshooting
- Erros de cidade: verifique `CITY_ALLOWED` no `.env` e normalização de acentos
- Falha de mídia: cheque permissões da pasta `media/`
- Backup: rode manualmente `node scripts/db-backup.js`

---

## 7. Contato e Suporte
- dev@inauguralar.com
- [Documentação técnica detalhada](./README-WhatsApp-WebJS.md)

---

## 8. Atualizações
- Consulte `ROADMAP-IMPLEMENTACAO.md` e `CORRECOES-REALIZADAS.md` para novidades

---

> _Bem-vindo ao time!_
