# GUIA COMPLETO MAILERSEND

## Integração do Whats Hub com MailerSend

Este guia explica como integrar o Whats Hub ao MailerSend para envio de e-mails automáticos e personalizados.

### Passos para Integração
1. **Crie uma conta no MailerSend**
   - Acesse https://www.mailersend.com/ e registre-se.
2. **Configure um domínio e remetente**
   - Adicione e valide seu domínio no painel do MailerSend.
   - Configure o remetente (from) e personalize o nome.
3. **Crie um template de e-mail**
   - Use o editor visual do MailerSend ou importe um template HTML da pasta `src/templates/mailersend/`.
   - Utilize variáveis no padrão `{{variavel}}`.
4. **Adicione as credenciais no arquivo `.env`**
   - Exemplo:
     ```env
     VITE_MAILERSEND_API_TOKEN=seu_api_token
     VITE_MAILERSEND_DOMAIN=seu_dominio.com
     VITE_MAILERSEND_FROM_EMAIL=noreply@seu_dominio.com
     VITE_MAILERSEND_FROM_NAME="WhatsHub Pro"
     ```
5. **Utilize o serviço em `src/services/mailerSendService.ts`**
   - Exemplo de uso:
     ```ts
     import MailerSendService from './mailerSendService';
     mailer.sendEmailWithTemplate({
       toEmail: 'usuario@exemplo.com',
       templateName: 'email-template-alert.html',
       variables: { user_name: 'Lucas', alert_title: 'Atenção', alert_message: 'Mensagem', alert_datetime: '...' }
     });
     ```

### Dicas Avançadas
- Utilize variáveis dinâmicas nos templates para personalização.
- Consulte a documentação oficial do MailerSend para recursos avançados.
- Monitore o status dos envios e eventos pelo painel do MailerSend.

---
Para troubleshooting, veja `SISTEMA_EMAIL_COMPLETO.md`.
