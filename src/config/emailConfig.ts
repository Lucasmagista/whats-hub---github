// Configuração de Email para Relatórios
// 
// Para configurar o envio de relatórios por email, utilize apenas MailerSend:
// 1. Crie uma conta no MailerSend (https://www.mailersend.com/)
// 2. Configure um domínio e verifique sua propriedade
// 3. Crie um template de email
// 4. Atualize as configurações abaixo

export interface MailerSendSettings {
  apiToken: string;
  domain: string;
  fromEmail: string;
  fromName: string;
}

export const MAILERSEND_CONFIG: MailerSendSettings = {
  apiToken: import.meta.env.VITE_MAILERSEND_API_TOKEN ?? '',
  domain: import.meta.env.VITE_MAILERSEND_DOMAIN ?? '',
  fromEmail: import.meta.env.VITE_MAILERSEND_FROM_EMAIL ?? '',
  fromName: import.meta.env.VITE_MAILERSEND_FROM_NAME ?? 'WhatsHub Pro',
};

export function getMailerSendConfig(): MailerSendSettings {
  return MAILERSEND_CONFIG;
}

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  reportsEndpoint: '/reports',
  reportsWithAttachmentsEndpoint: '/reports/with-attachments'
};

export const EMAIL_TEMPLATE_REFERENCE = `
Olá,

Um novo relatório de problema foi enviado através do WhatsHub Dashboard:

**Informações do Relatório:**
- ID: {{report_id}}
- Tipo: {{report_type}}
- Prioridade: {{priority}}
- Título: {{title}}

**Descrição:**
{{description}}

**Passos para Reproduzir:**
{{steps_to_reproduce}}

**Frequência:** {{frequency}}
**Impacto:** {{impact}}
**Tags:** {{tags}}

**Informações do Usuário:**
- Nome: {{user_name}}
- Email: {{user_email}}
- Telefone: {{user_phone}}
- Empresa: {{user_company}}
- Experiência: {{user_experience}}

**Satisfação:** {{satisfaction}}
**Melhorias Sugeridas:** {{improvements}}
**Deseja Contato:** {{contact_preference}}

**Informações do Sistema:**
{{system_info}}

**Anexos:** {{attachments_count}} arquivo(s)

**Enviado em:** {{submitted_at}}
**Estimativa de Resolução:** {{estimated_resolution}}

---
Enviado automaticamente pelo WhatsHub Dashboard
`;
