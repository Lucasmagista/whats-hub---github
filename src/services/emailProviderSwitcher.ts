import MailerSendService from './mailerSendService';
import { mailerSendConfig } from '../config/mailerSendConfig';
import { MailerSendSendParams, MailerSendEmailResponse } from '../types/mailerSendTypes';
import { EmailTemplateParams, UnifiedEmailParams } from '../types/unifiedEmailService';

export type EmailProvider = 'mailersend' | 'emailjs';

export class EmailProviderSwitcher {
  private provider: EmailProvider;
  private mailerSend: MailerSendService;
  // private emailJs: EmailJsService;

  constructor(provider: EmailProvider = 'mailersend') {
    this.provider = provider;
    this.mailerSend = new MailerSendService(mailerSendConfig);
    // this.emailJs = new EmailJsService(...);
  }

  setProvider(provider: EmailProvider) {
    this.provider = provider;
  }

  async sendNotification(params: UnifiedEmailParams): Promise<MailerSendEmailResponse> {
    if (this.provider === 'mailersend') {
      if ('templateName' in params && 'variables' in params) {
        return this.mailerSend.sendEmailWithTemplate(params);
      }
      return this.mailerSend.sendEmail(params);
    }
    throw new Error('Provider não implementado');
  }

  async sendReport(params: UnifiedEmailParams): Promise<MailerSendEmailResponse> {
    if (this.provider === 'mailersend') {
      if ('templateName' in params && 'variables' in params) {
        return this.mailerSend.sendEmailWithTemplate(params);
      }
      return this.mailerSend.sendEmail(params);
    }
    throw new Error('Provider não implementado');
  }

  async sendSystemAlert(params: UnifiedEmailParams): Promise<MailerSendEmailResponse> {
    if (this.provider === 'mailersend') {
      if ('templateName' in params && 'variables' in params) {
        return this.mailerSend.sendEmailWithTemplate(params);
      }
      return this.mailerSend.sendEmail(params);
    }
    throw new Error('Provider não implementado');
  }

  // Métodos avançados podem ser expandidos conforme necessário
}
