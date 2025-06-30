# COMO USAR O SISTEMA DE EMAIL

## Introdução
Este documento explica como configurar, personalizar e utilizar o sistema de envio de e-mails do Whats Hub com MailerSend.

### 1. Configuração Inicial
- Defina as variáveis de ambiente MailerSend no arquivo `.env`:
  - VITE_MAILERSEND_API_TOKEN
  - VITE_MAILERSEND_DOMAIN
  - VITE_MAILERSEND_FROM_EMAIL
  - VITE_MAILERSEND_FROM_NAME
- Configure o arquivo `src/config/emailConfig.ts` com as opções desejadas.

### 2. Utilização dos Templates
- Os templates HTML estão disponíveis na pasta `docs` e `src/templates/mailersend/`.
- Edite os templates conforme a identidade visual do seu negócio.
- Exemplos de templates: alerta, confirmação, notificação, segurança, simples, boas-vindas.
- Use variáveis no padrão `{{variavel}}` para personalização dinâmica.

### 3. Envio de E-mails
- Utilize o serviço de e-mail em `src/services/mailerSendService.ts`.
- Chame a função de envio passando o template e os dados do destinatário.
- Exemplo:
  ```ts
  sendEmailWithTemplate({
    toEmail: 'usuario@exemplo.com',
    templateName: 'email-template-alert.html',
    variables: { user_name: 'Lucas', alert_title: 'Atenção', alert_message: 'Mensagem', alert_datetime: '...' }
  })
  ```

### 4. Dúvidas e Suporte
- Consulte o arquivo `SISTEMA_EMAIL_COMPLETO.md` para detalhes avançados.
- Veja logs de envio no dashboard para troubleshooting.

---
Para detalhes avançados, veja também `SISTEMA_EMAIL_COMPLETO.md`.
