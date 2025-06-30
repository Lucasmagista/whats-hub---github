// Configuração centralizada do MailerSend
export interface MailerSendConfig {
  apiToken: string;
  domain: string;
  fromEmail: string;
  fromName: string;
}

export const mailerSendConfig: MailerSendConfig = {
  apiToken: import.meta.env.VITE_MAILERSEND_API_TOKEN || '',
  domain: import.meta.env.VITE_MAILERSEND_DOMAIN || '',
  fromEmail: import.meta.env.VITE_MAILERSEND_FROM_EMAIL || '',
  fromName: import.meta.env.VITE_MAILERSEND_FROM_NAME || 'WhatsHub Pro',
};
