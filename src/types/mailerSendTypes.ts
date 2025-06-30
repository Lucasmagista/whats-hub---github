// Tipos e interfaces para integração com MailerSend

export interface MailerSendSendParams {
  toEmail: string;
  toName?: string;
  subject: string;
  html: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  variables?: Record<string, any>;
  templateId?: string;
}

export interface MailerSendEmailResponse {
  success: boolean;
  messageId?: string;
  data?: any;
  error?: string;
}

export interface MailerSendAnalytics {
  messageId: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced';
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  webhookData?: any;
}
