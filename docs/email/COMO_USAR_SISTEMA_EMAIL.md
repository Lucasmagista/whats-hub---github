# COMO USAR O SISTEMA DE EMAIL

## Introdução
Este documento explica como configurar, personalizar e utilizar o sistema de envio de e-mails do Whats Hub.

### 1. Configuração Inicial
- Defina as variáveis de ambiente no arquivo `.env` (veja exemplos em `EMAIL_SETUP.md`).
- Configure o arquivo `src/config/emailConfig.ts` com as opções desejadas.

### 2. Utilização dos Templates
- Os templates HTML estão disponíveis na pasta `docs`.
- Edite os templates conforme a identidade visual do seu negócio.
- Exemplos de templates: alerta, confirmação, notificação, segurança, simples, boas-vindas.

### 3. Envio de E-mails
- Utilize o serviço de e-mail em `src/services/emailService.ts`.
- Chame a função de envio passando o template e os dados do destinatário.
- Exemplo:
  ```ts
  sendEmail({
    to: 'usuario@exemplo.com',
    template: 'email-template-alert.html',
    variables: { nome: 'Lucas' }
  })
  ```

### 4. Dúvidas e Suporte
- Consulte o arquivo `EMAILJS_GUIA_COMPLETO.md` para integração com EmailJS.
- Veja logs de envio no dashboard para troubleshooting.

---
Para detalhes avançados, veja também `SISTEMA_EMAIL_COMPLETO.md`.
