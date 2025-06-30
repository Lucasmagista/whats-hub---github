# EMAIL_SETUP

## Guia Rápido de Configuração de E-mail

Este documento mostra como configurar rapidamente o envio de e-mails no Whats Hub.

### 1. Variáveis de Ambiente
Adicione ao seu arquivo `.env`:
```env
VITE_EMAILJS_SERVICE_ID=seu_service_id
VITE_EMAILJS_TEMPLATE_ID=seu_template_id
VITE_EMAILJS_PUBLIC_KEY=sua_public_key
VITE_RECIPIENT_EMAIL=seu@email.com
```

### 2. Configuração do Projeto
- Edite `src/config/emailConfig.ts` para ajustar remetente, destinatário e templates.
- Teste o envio pelo dashboard ou rodando um teste manual.

### 3. Testando o Envio
- Use o painel do dashboard para enviar um e-mail de teste.
- Verifique os logs para garantir que o envio foi realizado.

---
Para detalhes avançados, consulte `COMO_USAR_SISTEMA_EMAIL.md` e `EMAILJS_GUIA_COMPLETO.md`.
