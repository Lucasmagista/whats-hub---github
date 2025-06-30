// Serviço principal de envio de emails via MailerSend
import { MailerSend, EmailParams, Recipient } from 'mailersend';
import { Sender } from 'mailersend';
import { MailerSendConfig } from '@/config/mailerSendConfig';
import { MailerSendAnalytics, MailerSendEmailResponse, MailerSendSendParams } from '@/types/mailerSendTypes';

class MailerSendService {
  private mailerSend: MailerSend;
  private config: MailerSendConfig;

  constructor(config: MailerSendConfig) {
    this.config = config;
    this.mailerSend = new MailerSend({ apiKey: config.apiToken });
  }

  async sendEmail(params: MailerSendSendParams): Promise<MailerSendEmailResponse> {
    const emailParams = new EmailParams();
    emailParams.setFrom(new Sender(params.fromEmail, params.fromName));
    emailParams.setTo([new Recipient(params.toEmail, params.toName)]);
    emailParams.setSubject(params.subject);
    emailParams.setHtml(params.html);
    if (params.replyTo) emailParams.setReplyTo(new Recipient(params.replyTo));
    if (params.templateId) emailParams.setTemplateId(params.templateId);
    // Adicione outros campos conforme necessário
    try {
      const response = await this.mailerSend.email.send(emailParams);
      return { success: true, data: response };
    } catch (error: unknown) {
      let errorMsg = 'Erro ao enviar email';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMsg = String((error as { message?: string }).message);
      }
      return { success: false, error: errorMsg };
    }
  }

  // ================= ANALYTICS SIMULADO =====================
  private analytics = {
    sentEmails: 0,
    templatesUsed: new Set<string>(),
    campaignsSent: 0,
  };

  // Chame este método após cada envio real de email
  trackEmailSent(templateId?: string) {
    this.analytics.sentEmails++;
    if (templateId) this.analytics.templatesUsed.add(templateId);
  }

  // Chame este método após cada envio real de campanha
  trackCampaignSent() {
    this.analytics.campaignsSent++;
  }

  getAnalytics() {
    return {
      sentEmails: this.analytics.sentEmails,
      templates: this.analytics.templatesUsed.size,
      campaigns: this.analytics.campaignsSent,
    };
  }

  // Métodos avançados e analytics podem ser implementados aqui
}

export default MailerSendService;
