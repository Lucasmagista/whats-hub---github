# EMAIL_SETUP

## Guia Rápido de Configuração de E-mail (MailerSend)

Este documento mostra como configurar rapidamente o envio de e-mails no Whats Hub usando MailerSend.

### 1. Variáveis de Ambiente
Adicione ao seu arquivo `.env`:
```env
VITE_MAILERSEND_API_TOKEN=seu_api_token
VITE_MAILERSEND_DOMAIN=seu_dominio.com
VITE_MAILERSEND_FROM_EMAIL=noreply@seu_dominio.com
VITE_MAILERSEND_FROM_NAME="WhatsHub Pro"
```

### 2. Configuração do Projeto
- Edite `src/config/emailConfig.ts` para ajustar remetente, domínio e templates.
- Teste o envio pelo dashboard ou rodando um teste manual.

### 3. Testando o Envio
- Use o painel do dashboard para enviar um e-mail de teste.
- Verifique os logs para garantir que o envio foi realizado.

---
Para detalhes avançados, consulte `COMO_USAR_SISTEMA_EMAIL.md` e `GUIA COMPLETO MAILERSEND`.
