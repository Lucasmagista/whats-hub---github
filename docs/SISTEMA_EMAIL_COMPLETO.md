# SISTEMA EMAIL COMPLETO

## Visão Geral
O sistema de e-mail do Whats Hub permite o envio automático e manual de notificações, alertas e relatórios para usuários e administradores usando MailerSend.

### Templates Disponíveis
- Alerta (`email-template-alert.html`)
- Confirmação (`email-template-confirmation.html`)
- Notificação (`email-template-notification.html`)
- Segurança (`email-template-security.html`)
- Simples (`email-template-simples.html`)
- Boas-vindas (`email-template-welcome.html`)

### Configuração de Envio
- Variáveis de ambiente no `.env` para MailerSend
- Configuração em `src/config/emailConfig.ts`
- Teste de envio pelo dashboard

### Integração com MailerSend
- Guia completo em `GUIA COMPLETO MAILERSEND`
- Suporte a múltiplos templates e destinatários

### Logs de Envio
- Histórico de e-mails enviados disponível no dashboard
- Logs detalhados para auditoria e troubleshooting

### Boas Práticas
- Sempre testar o envio após alterações
- Manter templates atualizados e revisados
- Garantir que os campos obrigatórios estejam preenchidos

---
Para dúvidas, consulte também `COMO_USAR_SISTEMA_EMAIL.md`.
