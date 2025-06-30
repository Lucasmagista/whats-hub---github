# EMAILJS GUIA COMPLETO

## Integração do Whats Hub com EmailJS

Este guia explica como integrar o Whats Hub ao EmailJS para envio de e-mails automáticos e personalizados.

### Passos para Integração
1. **Crie uma conta no EmailJS**
   - Acesse https://www.emailjs.com/ e registre-se.
2. **Configure um serviço de e-mail**
   - Adicione um provedor (Gmail, Outlook, etc) no painel do EmailJS.
3. **Crie um template de e-mail**
   - Personalize o template conforme sua necessidade.
4. **Adicione as credenciais no arquivo `.env`**
   - Exemplo:
     ```env
     VITE_EMAILJS_SERVICE_ID=seu_service_id
     VITE_EMAILJS_TEMPLATE_ID=seu_template_id
     VITE_EMAILJS_PUBLIC_KEY=sua_public_key
     ```
5. **Utilize o serviço em `src/services/emailService.ts`**
   - Exemplo de uso:
     ```ts
     import { sendEmail } from './emailService';
     sendEmail({
       to: 'usuario@exemplo.com',
       template: 'email-template-alert.html',
       variables: { nome: 'Lucas' }
     });
     ```

### Dicas Avançadas
- Utilize variáveis dinâmicas nos templates para personalização.
- Consulte a documentação oficial do EmailJS para recursos avançados.
- Monitore o status dos envios pelo painel do EmailJS.

---
Para troubleshooting, veja `EMAILJS_TROUBLESHOOTING.md`.
