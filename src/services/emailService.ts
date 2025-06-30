// 📧 Sistema Completo de Email com MailerSend
// Implementação simplificada e funcional

import MailerSendService from './mailerSendService';
import { getMailerSendConfig } from '@/config/emailConfig';
import { MailerSendSendParams } from '@/types/mailerSendTypes';

// =============================================================================
// INTERFACES E TIPOS
// =============================================================================

export interface EmailConfig {
  apiToken: string;
  domain: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailResponse {
  success: boolean;
  data?: unknown;
  message?: string;
  emailId?: string;
  timestamp?: string;
}

export interface ScheduledEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  sendAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  template: string;
  recipients: string[];
  sent: boolean;
  createdAt: Date;
  sentAt?: Date;
}

// =============================================================================
// CLASSE PRINCIPAL DO SERVIÇO DE EMAIL
// =============================================================================

export class EmailService {
  private readonly mailerSendService: MailerSendService;

  constructor() {
    this.mailerSendService = new MailerSendService(getMailerSendConfig());
  }

  isConfigured(): boolean {
    const config = getMailerSendConfig();
    return !!(config.apiToken && config.domain && config.fromEmail && config.fromName);
  }

  // =============================================================================
  // ENVIO DE EMAILS
  // =============================================================================

  async sendReportEmail(params: MailerSendSendParams): Promise<EmailResponse> {
    return this._sendEmailAndTrack(params);
  }

  async sendNotificationEmail(params: MailerSendSendParams): Promise<EmailResponse> {
    return this._sendEmailAndTrack(params);
  }

  async sendWelcomeEmail(params: MailerSendSendParams): Promise<EmailResponse> {
    return this._sendEmailAndTrack(params);
  }

  async sendSecurityNotification(params: MailerSendSendParams): Promise<EmailResponse> {
    return this._sendEmailAndTrack(params);
  }

  private async _sendEmailAndTrack(params: MailerSendSendParams): Promise<EmailResponse> {
    const res = await this.mailerSendService.sendEmail(params);
    if (res.success) this.mailerSendService.trackEmailSent(params.templateId);
    return res;
  }

  // AGENDAMENTO DE EMAILS (em memória, simulado)
  private readonly scheduledEmails: ScheduledEmail[] = [];

  scheduleEmail(template: string, params: { to_email: string, subject: string, message: string, scheduled_time: string }, to: string, sendAt: Date): string {
    const id = 'sched-' + Date.now();
    this.scheduledEmails.push({
      id,
      to: params.to_email,
      subject: params.subject,
      html: params.message,
      sendAt
    });
    setTimeout(async () => {
      const res = await this.mailerSendService.sendEmail({
        toEmail: params.to_email,
        subject: params.subject,
        html: params.message,
        fromEmail: getMailerSendConfig().fromEmail,
        fromName: getMailerSendConfig().fromName,
        templateId: template
      });
      if (res.success) this.mailerSendService.trackEmailSent(template);
    }, Math.max(0, sendAt.getTime() - Date.now()));
    return id;
  }

  getScheduledEmails() {
    return this.scheduledEmails;
  }

  // CAMPANHAS DE EMAIL (implementação básica em memória)
  private readonly campaigns: Campaign[] = [];

  createCampaign(name: string, description: string, template: string, recipients: string[]): string {
    const id = 'camp-' + Date.now();
    this.campaigns.push({ id, name, description, template, recipients, sent: false, createdAt: new Date() });
    return id;
  }

  async sendCampaign(campaignId: string, variables: Record<string, string>): Promise<boolean> {
    const campaign = this.campaigns.find((c) => c.id === campaignId);
    if (!campaign) return false;
    for (const email of campaign.recipients) {
      const res = await this.mailerSendService.sendEmail({
        toEmail: email,
        subject: variables.newsletter_title || campaign.name,
        html: variables.newsletter_content || campaign.description,
        fromEmail: getMailerSendConfig().fromEmail,
        fromName: getMailerSendConfig().fromName,
        templateId: campaign.template
      });
      if (res.success) this.mailerSendService.trackEmailSent(campaign.template);
    }
    campaign.sent = true;
    campaign.sentAt = new Date();
    this.mailerSendService.trackCampaignSent();
    return true;
  }

  getCampaigns() {
    return this.campaigns;
  }

  async executeAutoResponse(...args: unknown[]): Promise<boolean> {
    return false;
  }
  async testEmailConfiguration() {
    return { success: false, message: 'Funcionalidade em breve.' };
  }

  getAnalytics() {
    return this.mailerSendService.getAnalytics();
  }
}

// =============================================================================
// INSTÂNCIA GLOBAL DO SERVIÇO
// =============================================================================

export const emailService = new EmailService();

export default emailService;
