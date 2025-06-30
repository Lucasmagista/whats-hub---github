// Interface unificada para provedores de email
import { MailerSendSendParams, MailerSendEmailResponse } from './mailerSendTypes';

export type EmailTemplateParams = Omit<MailerSendSendParams, 'html'> & { templateName: string; variables: Record<string, string> };

export type UnifiedEmailParams = MailerSendSendParams | EmailTemplateParams;

export interface UnifiedEmailService {
  sendNotification(notification: UnifiedEmailParams): Promise<MailerSendEmailResponse>;
  sendReport(report: UnifiedEmailParams): Promise<MailerSendEmailResponse>;
  sendSystemAlert(alert: UnifiedEmailParams): Promise<MailerSendEmailResponse>;

  // Métodos avançados (MailerSend only)
  scheduleEmail?(email: MailerSendSendParams, sendAt: Date): Promise<MailerSendEmailResponse>;
  sendBulkEmails?(emails: MailerSendSendParams[]): Promise<MailerSendEmailResponse[]>;
  validateEmail?(email: string): Promise<{ valid: boolean; reason?: string }>;
}
