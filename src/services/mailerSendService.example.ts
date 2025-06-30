import { mailerSendConfig } from '../config/mailerSendConfig';
import MailerSendService from './mailerSendService';

async function main() {
  const mailer = new MailerSendService(mailerSendConfig);
  const result = await mailer.sendEmailWithTemplate({
    toEmail: 'destinatario@exemplo.com',
    toName: 'Destinatário',
    subject: 'Alerta de Teste',
    fromEmail: mailerSendConfig.fromEmail,
    fromName: mailerSendConfig.fromName,
    templateName: 'alert-notification.html',
    variables: {
      user_name: 'Destinatário',
      alert_title: 'Teste de Alerta',
      alert_message: 'Este é um alerta de teste do sistema.',
      alert_datetime: new Date().toLocaleString('pt-BR'),
    },
  });
  console.log(result);
}

main().catch(console.error);
