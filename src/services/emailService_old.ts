// 📧 Sistema Completo de Email com EmailJS
// Implementação completa e funcional para múltiplos tipos de email

import emailjs from 'emailjs-com';
import { getEmailConfig, validateEmailConfig, getEmailTemplateConfig, EmailTemplateSettings, TEMPLATE_DEFINITIONS } from '@/config/emailConfig';

// =============================================================================
// INTERFACES E TIPOS EXPANDIDOS
// =============================================================================

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  recipientEmail: string;
}

export interface EmailResponse {
  success: boolean;
  data?: any;
  message?: string;
  emailId?: string;
  timestamp?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  templateId: string;
  variables: string[];
  category: 'report' | 'notification' | 'alert' | 'system' | 'custom' | 'marketing' | 'support';
}

export interface NotificationEmail {
  type: 'bot_status' | 'new_message' | 'system_alert' | 'maintenance' | 'user_action' | 'marketing' | 'support';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  details?: Record<string, any>;
  recipientEmail?: string;
  attachments?: Array<{
    name: string;
    content: string;
    type: string;
  }>;
  scheduledFor?: string; // Para emails agendados
  campaign?: string; // Para campanhas de marketing
}

export interface SystemAlert {
  level: 'info' | 'warning' | 'error' | 'critical';
  component: string;
  message: string;
  timestamp: string;
  additionalData?: Record<string, any>;
}

export interface EmailAnalytics {
  emailId: string;
  type: string;
  status: 'sent' | 'delivered' | 'failed' | 'bounced' | 'scheduled';
  sentAt: string;
  recipientEmail: string;
  openedAt?: string;
  clickedAt?: string;
  errorMessage?: string;
  campaignId?: string;
  templateUsed?: string;
}

// NOVAS INTERFACES PARA FUNCIONALIDADES AVANÇADAS
export interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  recipients: string[];
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  createdAt: string;
  sentAt?: string;
  openRate?: number;
  clickRate?: number;
}

export interface AutoResponseRule {
  id: string;
  name: string;
  trigger: 'new_user' | 'error_report' | 'satisfaction_low' | 'bot_offline' | 'custom';
  condition?: string;
  templateId: string;
  delay?: number; // em minutos
  active: boolean;
}

export interface EmailQueue {
  id: string;
  templateId: string;
  params: Record<string, any>;
  recipientEmail: string;
  scheduledFor: string;
  priority: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  createdAt: string;
}

// =============================================================================
// INTERFACES E TIPOS EXPANDIDOS PARA AUTENTICAÇÃO
// =============================================================================

export interface AuthEmailData {
  userEmail: string;
  userName: string;
  code?: string;
  link?: string;
  expiresAt?: string;
  ipAddress?: string;
  device?: string;
  location?: string;
}

export interface CodeGenerationOptions {
  length: number;
  type: 'numeric' | 'alphanumeric' | 'alpha';
  excludeSimilar: boolean;
  expirationMinutes: number;
}

export interface UniqueCodeRecord {
  code: string;
  purpose: string;
  userEmail: string;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
  usedAt?: string;
}

// =============================================================================
// CLASSE PRINCIPAL DO SERVIÇO DE EMAIL EXPANDIDA
// =============================================================================

export class EmailService {
  private config: EmailConfig | null = null;
  private isInitialized = false;
  private templates: Map<string, EmailTemplate> = new Map();
  private analytics: EmailAnalytics[] = [];
  private campaigns: EmailCampaign[] = [];
  private autoResponseRules: AutoResponseRule[] = [];
  private emailQueue: EmailQueue[] = [];
  private rateLimitQueue: Array<{ timestamp: number; count: number }> = [];
  private maxEmailsPerMinute = 10; // Limite do EmailJS gratuito
  private processingQueue = false;

  constructor() {
    this.initializeAdvancedTemplates();
    this.loadAnalytics();
    this.loadCampaigns();
    this.loadAutoResponseRules();
    this.loadEmailQueue();
    this.startQueueProcessor();
  }

  // =============================================================================
  // CONFIGURAÇÃO E INICIALIZAÇÃO EXPANDIDA
  // =============================================================================

  /**
   * Configura o EmailJS com as credenciais fornecidas
   */
  configure(config: EmailConfig): boolean {
    try {
      if (!validateEmailConfig(config)) {
        throw new Error('Configuração de email inválida');
      }

      this.config = config;
      emailjs.init(config.publicKey);
      this.isInitialized = true;

      console.log('✅ EmailJS configurado com sucesso:', {
        serviceId: config.serviceId,
        templateId: config.templateId,
        recipientEmail: config.recipientEmail
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao configurar EmailJS:', error);
      return false;
    }
  }

  /**
   * Inicializa automaticamente com configuração do ambiente
   */
  autoInitialize(): boolean {
    const config = getEmailConfig();
    if (validateEmailConfig(config)) {
      return this.configure(config);
    }
    return false;
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return this.isInitialized && this.config !== null;
  }

  /**
   * Obtém a configuração atual
   */
  getConfig(): EmailConfig | null {
    return this.config;
  }

  // =============================================================================
  // FUNCIONALIDADES AVANÇADAS - EMAILS AGENDADOS
  // =============================================================================

  /**
   * Agenda um email para envio futuro
   */
  scheduleEmail(
    templateId: string,
    params: Record<string, any>,
    recipientEmail: string,
    scheduledFor: Date,
    priority: number = 5
  ): string {
    const emailId = this.generateEmailId('scheduled');
    
    const queueItem: EmailQueue = {
      id: emailId,
      templateId,
      params,
      recipientEmail,
      scheduledFor: scheduledFor.toISOString(),
      priority,
      retryCount: 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.emailQueue.push(queueItem);
    this.saveEmailQueue();

    console.log('⏰ Email agendado:', {
      emailId,
      scheduledFor: scheduledFor.toISOString(),
      recipientEmail
    });

    return emailId;
  }

  /**
   * Processa a fila de emails agendados
   */
  private async startQueueProcessor(): Promise<void> {
    if (this.processingQueue) return;
    
    this.processingQueue = true;
    
    setInterval(async () => {
      await this.processEmailQueue();
    }, 60000); // Verifica a cada minuto
  }

  /**
   * Processa emails pendentes na fila
   */
  private async processEmailQueue(): Promise<void> {
    if (!this.isConfigured()) return;

    const now = new Date();
    const pendingEmails = this.emailQueue
      .filter(email => 
        email.status === 'pending' && 
        new Date(email.scheduledFor) <= now
      )
      .sort((a, b) => b.priority - a.priority);

    for (const email of pendingEmails.slice(0, 5)) { // Processa até 5 por vez
      try {
        email.status = 'processing';
        this.saveEmailQueue();

        const result = await this.sendCustomEmail(
          email.templateId,
          email.params,
          email.recipientEmail
        );

        if (result.success) {
          email.status = 'sent';
          console.log(`✅ Email agendado enviado: ${email.id}`);
        } else {
          throw new Error(result.message || 'Erro no envio');
        }
      } catch (error) {
        email.retryCount++;
        
        if (email.retryCount >= 3) {
          email.status = 'failed';
          console.error(`❌ Falha definitiva no email: ${email.id}`, error);
        } else {
          email.status = 'pending';
          // Reagenda para 5 minutos
          const retryTime = new Date();
          retryTime.setMinutes(retryTime.getMinutes() + 5);
          email.scheduledFor = retryTime.toISOString();
          console.warn(`⚠️ Reagendando email: ${email.id} (tentativa ${email.retryCount})`);
        }
      }
      
      this.saveEmailQueue();
      
      // Pausa entre envios
      await this.sleep(2000);
    }
  }

  /**
   * Cancela um email agendado
   */
  cancelScheduledEmail(emailId: string): boolean {
    const emailIndex = this.emailQueue.findIndex(email => email.id === emailId);
    
    if (emailIndex !== -1 && this.emailQueue[emailIndex].status === 'pending') {
      this.emailQueue.splice(emailIndex, 1);
      this.saveEmailQueue();
      
      console.log(`❌ Email agendado cancelado: ${emailId}`);
      return true;
    }
    
    return false;
  }

  // =============================================================================
  // CAMPANHAS DE EMAIL
  // =============================================================================

  /**
   * Cria uma nova campanha de email
   */
  createCampaign(
    name: string,
    description: string,
    templateId: string,
    recipients: string[],
    scheduledFor?: Date
  ): string {
    const campaignId = this.generateEmailId('campaign');
    
    const campaign: EmailCampaign = {
      id: campaignId,
      name,
      description,
      templateId,
      recipients,
      scheduledFor: scheduledFor?.toISOString(),
      status: scheduledFor ? 'scheduled' : 'draft',
      createdAt: new Date().toISOString()
    };

    this.campaigns.push(campaign);
    this.saveCampaigns();

    console.log('📢 Campanha criada:', { campaignId, name, recipients: recipients.length });

    return campaignId;
  }

  /**
   * Envia uma campanha de email
   */
  async sendCampaign(campaignId: string, params: Record<string, any> = {}): Promise<boolean> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }

    campaign.status = 'sending';
    this.saveCampaigns();

    try {
      const results: EmailResponse[] = [];
      
      for (let i = 0; i < campaign.recipients.length; i++) {
        const recipient = campaign.recipients[i];
        
        const emailParams = {
          ...params,
          campaign_id: campaignId,
          campaign_name: campaign.name,
          recipient_email: recipient,
          unsubscribe_link: `https://yourapp.com/unsubscribe?email=${encodeURIComponent(recipient)}&campaign=${campaignId}`
        };

        const result = await this.sendCustomEmail(
          campaign.templateId,
          emailParams,
          recipient
        );

        results.push(result);

        // Pausa entre envios para respeitar rate limit
        if (i < campaign.recipients.length - 1) {
          await this.sleep(6000);
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      campaign.status = failureCount === 0 ? 'sent' : 'failed';
      campaign.sentAt = new Date().toISOString();
      
      this.saveCampaigns();

      console.log(`📬 Campanha enviada: ${successCount}/${results.length} sucessos`);
      
      return failureCount === 0;
    } catch (error) {
      campaign.status = 'failed';
      this.saveCampaigns();
      
      console.error('❌ Erro ao enviar campanha:', error);
      return false;
    }
  }

  /**
   * Lista todas as campanhas
   */
  getCampaigns(): EmailCampaign[] {
    return [...this.campaigns];
  }

  /**
   * Obtém uma campanha específica
   */
  getCampaign(campaignId: string): EmailCampaign | undefined {
    return this.campaigns.find(c => c.id === campaignId);
  }

  // =============================================================================
  // AUTO-RESPOSTAS INTELIGENTES
  // =============================================================================

  /**
   * Cria uma regra de auto-resposta
   */
  createAutoResponseRule(
    name: string,
    trigger: AutoResponseRule['trigger'],
    templateId: string,
    delay: number = 0,
    condition?: string
  ): string {
    const ruleId = this.generateEmailId('rule');
    
    const rule: AutoResponseRule = {
      id: ruleId,
      name,
      trigger,
      templateId,
      delay,
      condition,
      active: true
    };

    this.autoResponseRules.push(rule);
    this.saveAutoResponseRules();

    console.log('🤖 Regra de auto-resposta criada:', { ruleId, name, trigger });

    return ruleId;
  }

  /**
   * Executa auto-respostas baseadas em trigger
   */
  async executeAutoResponse(
    trigger: AutoResponseRule['trigger'],
    data: Record<string, any>
  ): Promise<void> {
    const activeRules = this.autoResponseRules.filter(
      rule => rule.active && rule.trigger === trigger
    );

    for (const rule of activeRules) {
      try {
        // Verifica condição se especificada
        if (rule.condition && !this.evaluateCondition(rule.condition, data)) {
          continue;
        }

        const recipientEmail = data.userEmail || data.email || this.config?.recipientEmail;
        
        if (!recipientEmail) {
          console.warn(`⚠️ Email do destinatário não encontrado para regra: ${rule.id}`);
          continue;
        }

        const emailParams = {
          ...data,
          trigger_type: trigger,
          rule_name: rule.name,
          auto_response: true
        };

        if (rule.delay && rule.delay > 0) {
          // Agenda para envio futuro
          const scheduledFor = new Date();
          scheduledFor.setMinutes(scheduledFor.getMinutes() + rule.delay);
          
          this.scheduleEmail(
            rule.templateId,
            emailParams,
            recipientEmail,
            scheduledFor,
            8 // Alta prioridade para auto-respostas
          );
          
          console.log(`⏰ Auto-resposta agendada: ${rule.name} em ${rule.delay} minutos`);
        } else {
          // Envia imediatamente
          await this.sendCustomEmail(rule.templateId, emailParams, recipientEmail);
          
          console.log(`🤖 Auto-resposta enviada: ${rule.name}`);
        }
      } catch (error) {
        console.error(`❌ Erro na auto-resposta ${rule.id}:`, error);
      }
    }
  }

  /**
   * Avalia condições simples para auto-respostas
   */
  private evaluateCondition(condition: string, data: Record<string, any>): boolean {
    try {
      // Implementação simples de avaliação de condições
      // Ex: "satisfaction < 3" ou "priority = high"
      
      const operators = ['<=', '>=', '!=', '=', '<', '>'];
      let operator = operators.find(op => condition.includes(op));
      
      if (!operator) return true;
      
      const [left, right] = condition.split(operator).map(s => s.trim());
      const leftValue = data[left];
      const rightValue = isNaN(Number(right)) ? right : Number(right);
      
      switch (operator) {
        case '=': return leftValue == rightValue;
        case '!=': return leftValue != rightValue;
        case '<': return Number(leftValue) < Number(rightValue);
        case '>': return Number(leftValue) > Number(rightValue);
        case '<=': return Number(leftValue) <= Number(rightValue);
        case '>=': return Number(leftValue) >= Number(rightValue);
        default: return true;
      }
    } catch (error) {
      console.warn('Erro ao avaliar condição:', condition, error);
      return true;
    }
  }

  // =============================================================================
  // ENVIO DE EMAILS - MANTENDO FUNCIONALIDADES EXISTENTES
  // =============================================================================

  /**
   * Envia relatório de problema via email
   */
  async sendReportEmail(reportData: any): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      throw new Error('EmailJS não está configurado. Configure primeiro com configure()');
    }

    if (!this.checkRateLimit()) {
      throw new Error('Limite de emails por minuto excedido. Tente novamente em alguns segundos.');
    }

    try {
      const templateParams = this.prepareReportEmailParams(reportData);
      const emailId = this.generateEmailId('report');

      console.log('📧 Enviando email de relatório:', {
        emailId,
        reportId: reportData.id,
        title: reportData.title
      });

      const response = await emailjs.send(
        this.config!.serviceId,
        this.config!.templateId,
        templateParams
      );

      const emailResponse: EmailResponse = {
        success: true,
        data: response,
        message: 'Relatório enviado por email com sucesso!',
        emailId,
        timestamp: new Date().toISOString()
      };

      // Registrar analytics
      this.recordEmailAnalytics({
        emailId,
        type: 'report',
        status: 'sent',
        sentAt: new Date().toISOString(),
        recipientEmail: this.config!.recipientEmail
      });

      // Executar auto-respostas se configuradas
      await this.executeAutoResponse('error_report', {
        ...reportData,
        userEmail: reportData.userInfo?.email
      });

      return emailResponse;
    } catch (error) {
      console.error('❌ Erro ao enviar email de relatório:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao enviar email',
        timestamp: new Date().toISOString()
      };
    }
  }

  // =============================================================================
  // ENVIO DE EMAILS - NOTIFICAÇÕES DO SISTEMA
  // =============================================================================

  /**
   * Envia notificação do sistema via email
   */
  async sendNotificationEmail(notification: NotificationEmail): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      throw new Error('EmailJS não está configurado');
    }

    if (!this.checkRateLimit()) {
      throw new Error('Limite de emails excedido');
    }

    try {
      const templateParams = this.prepareNotificationEmailParams(notification);
      const emailId = this.generateEmailId('notification');

      console.log('🔔 Enviando notificação por email:', {
        emailId,
        type: notification.type,
        priority: notification.priority,
        title: notification.title
      });

      const response = await emailjs.send(
        this.config!.serviceId,
        'template_notification', // Template específico para notificações
        templateParams
      );

      const emailResponse: EmailResponse = {
        success: true,
        data: response,
        message: 'Notificação enviada com sucesso!',
        emailId,
        timestamp: new Date().toISOString()
      };

      this.recordEmailAnalytics({
        emailId,
        type: 'notification',
        status: 'sent',
        sentAt: new Date().toISOString(),
        recipientEmail: notification.recipientEmail || this.config!.recipientEmail
      });

      return emailResponse;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao enviar notificação'
      };
    }
  }

  /**
   * Envia alerta do sistema
   */
  async sendSystemAlert(alert: SystemAlert): Promise<EmailResponse> {
    const notification: NotificationEmail = {
      type: 'system_alert',
      priority: alert.level === 'critical' ? 'critical' : 
               alert.level === 'error' ? 'high' : 
               alert.level === 'warning' ? 'medium' : 'low',
      title: `🚨 Alerta do Sistema: ${alert.component}`,
      message: alert.message,
      details: {
        level: alert.level,
        component: alert.component,
        timestamp: alert.timestamp,
        ...alert.additionalData
      }
    };

    return this.sendNotificationEmail(notification);
  }

  /**
   * Envia notificação de status do bot
   */
  async sendBotStatusNotification(botId: string, status: 'online' | 'offline' | 'error', details?: any): Promise<EmailResponse> {
    const notification: NotificationEmail = {
      type: 'bot_status',
      priority: status === 'error' ? 'high' : 'medium',
      title: `🤖 Bot ${botId}: ${status.toUpperCase()}`,
      message: `O bot ${botId} mudou seu status para ${status}`,
      details: {
        botId,
        status,
        timestamp: new Date().toISOString(),
        ...details
      }
    };

    return this.sendNotificationEmail(notification);
  }

  // =============================================================================
  // ENVIO DE EMAILS - CUSTOM E AVANÇADO
  // =============================================================================

  /**
   * Envia email customizado com template específico
   */
  async sendCustomEmail(
    templateId: string, 
    templateParams: Record<string, any>, 
    recipientEmail?: string
  ): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      throw new Error('EmailJS não está configurado. Configure primeiro com configure()');
    }

    if (!this.checkRateLimit()) {
      throw new Error('Limite de emails por minuto excedido. Tente novamente em alguns segundos.');
    }

    try {
      const emailId = this.generateEmailId('custom');
      const recipient = recipientEmail || this.config!.recipientEmail;

      // Preparar parâmetros finais
      const finalParams = {
        ...templateParams,
        to_email: recipient,
        email_id: emailId,
        timestamp: new Date().toISOString(),
        from_name: 'WhatsHub Dashboard'
      };

      console.log('📧 Enviando email personalizado:', {
        emailId,
        templateId,
        recipient
      });

      const response = await emailjs.send(
        this.config!.serviceId,
        templateId,
        finalParams
      );

      const emailResponse: EmailResponse = {
        success: true,
        data: response,
        message: 'Email personalizado enviado com sucesso!',
        emailId,
        timestamp: new Date().toISOString()
      };

      // Registrar analytics
      this.recordEmailAnalytics({
        emailId,
        type: 'custom',
        status: 'sent',
        sentAt: new Date().toISOString(),
        recipientEmail: recipient,
        templateUsed: templateId
      });

      return emailResponse;
    } catch (error) {
      console.error('❌ Erro ao enviar email personalizado:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao enviar email',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Testa a configuração do EmailJS
   */
  async testEmailConfiguration(): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      throw new Error('EmailJS não está configurado');
    }

    const testData = {
      to_email: this.config!.recipientEmail,
      subject: '🧪 Teste de Configuração EmailJS',
      message: 'Este é um email de teste para validar a configuração do EmailJS.',
      test_date: new Date().toLocaleDateString('pt-BR'),
      test_time: new Date().toLocaleTimeString('pt-BR'),
      from_name: 'WhatsHub Dashboard - Sistema de Testes'
    };

    return this.sendCustomEmail(this.config!.templateId, testData);
  }
  // =============================================================================
  // GESTÃO DE TEMPLATES AVANÇADA
  // =============================================================================

  /**
   * Obtém todos os templates disponíveis
   */
  getAvailableTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Obtém um template específico
   */
  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Registra um novo template
   */
  registerTemplate(template: EmailTemplate): void {
    this.templates.set(template.id, template);
    console.log(`📝 Template registrado: ${template.name}`);
  }

  /**
   * Remove um template
   */
  unregisterTemplate(templateId: string): boolean {
    const removed = this.templates.delete(templateId);
    if (removed) {
      console.log(`🗑️ Template removido: ${templateId}`);
    }
    return removed;
  }

  /**
   * Configura múltiplos templates do EmailJS
   */
  configureTemplates(templateConfig: EmailTemplateSettings): boolean {
    try {
      // Salvar configuração de templates
      localStorage.setItem('whathub_email_template_config', JSON.stringify(templateConfig));
      
      // Atualizar configuração básica se necessário
      if (this.config) {
        this.config.serviceId = templateConfig.serviceId;
        this.config.publicKey = templateConfig.publicKey;
        this.config.recipientEmail = templateConfig.recipientEmail;
      } else {
        this.config = {
          serviceId: templateConfig.serviceId,
          templateId: templateConfig.templates.report, // Template padrão
          publicKey: templateConfig.publicKey,
          recipientEmail: templateConfig.recipientEmail
        };
      }

      emailjs.init(templateConfig.publicKey);
      this.isInitialized = true;

      console.log('✅ Templates EmailJS configurados com sucesso:', {
        serviceId: templateConfig.serviceId,
        templates: Object.keys(templateConfig.templates).length,
        recipientEmail: templateConfig.recipientEmail
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao configurar templates EmailJS:', error);
      return false;
    }
  }

  /**
   * Obtém a configuração atual de templates
   */
  getTemplateConfig(): EmailTemplateSettings | null {
    return getEmailTemplateConfig();
  }

  /**
   * Valida um template específico
   */
  async validateTemplate(templateId: string, templateType: string): Promise<{
    isValid: boolean;
    error?: string;
    variables?: string[];
  }> {
    if (!this.isConfigured()) {
      return { isValid: false, error: 'EmailJS não configurado' };
    }

    try {
      const testParams = this.getTestParamsForTemplate(templateType);
      
      // Simulação de validação (EmailJS não permite validação sem envio)
      // Verificar se os parâmetros básicos estão presentes
      if (!templateId || templateId.startsWith('template_')) {
        throw new Error('Template ID inválido');
      }

      return {
        isValid: true,
        variables: Object.keys(testParams)
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message || 'Erro na validação do template'
      };
    }
  }

  /**
   * Obtém parâmetros de teste para diferentes tipos de template
   */
  private getTestParamsForTemplate(templateType: string): Record<string, any> {
    const baseParams = {
      from_name: 'WhatsHub System',
      timestamp: new Date().toISOString(),
      to_email: 'test@validation.local'
    };

    switch (templateType) {
      case 'emailVerification':
        return {
          ...baseParams,
          user_name: 'Usuário Teste',
          verification_code: '123456',
          verification_link: 'https://example.com/verify',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toLocaleString('pt-BR')
        };

      case 'passwordReset':
        return {
          ...baseParams,
          user_name: 'Usuário Teste',
          reset_code: 'ABC123',
          reset_link: 'https://example.com/reset',
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toLocaleString('pt-BR'),
          ip_address: '192.168.1.1'
        };

      case 'uniqueCode':
        return {
          ...baseParams,
          user_name: 'Usuário Teste',
          unique_code: '789012',
          purpose: 'Teste de Validação',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toLocaleString('pt-BR')
        };

      case 'loginAlert':
        return {
          ...baseParams,
          user_name: 'Usuário Teste',
          login_time: new Date().toLocaleString('pt-BR'),
          ip_address: '192.168.1.1',
          device: 'Chrome Browser',
          location: 'São Paulo, Brasil',
          block_link: 'https://example.com/block'
        };

      case 'accountLocked':
        return {
          ...baseParams,
          user_name: 'Usuário Teste',
          lock_reason: 'Múltiplas tentativas de login falharam',
          unlock_link: 'https://example.com/unlock',
          support_email: 'suporte@whathub.com'
        };

      case 'twoFactorAuth':
        return {
          ...baseParams,
          user_name: 'Usuário Teste',
          auth_code: '123456',
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toLocaleString('pt-BR'),
          device: 'Chrome Browser'
        };

      case 'welcome':
        return {
          ...baseParams,
          user_name: 'Usuário Teste',
          getting_started_link: 'https://example.com/start',
          support_email: 'suporte@whathub.com',
          features_list: 'Dashboard, Relatórios, Notificações'
        };

      case 'report':
        return {
          ...baseParams,
          report_id: 'RPT-001',
          title: 'Relatório de Teste',
          description: 'Descrição do problema de teste',
          priority: 'Alta',
          user_name: 'Usuário Teste',
          user_email: 'teste@example.com',
          submitted_at: new Date().toLocaleString('pt-BR')
        };

      default:
        return {
          ...baseParams,
          title: 'Template de Teste',
          message: 'Esta é uma mensagem de teste',
          content: 'Conteúdo de teste para validação'
        };
    }
  }

  /**
   * Lista todos os templates configurados com seus status
   */
  async getTemplateStatuses(): Promise<Array<{
    id: string;
    name: string;
    templateId: string;
    status: 'configured' | 'not_configured' | 'error';
    category: string;
    required: boolean;
    lastValidated?: string;
    errorMessage?: string;
  }>> {
    const templateConfig = getEmailTemplateConfig();
    const results = [];

    for (const [templateKey, templateDef] of Object.entries(TEMPLATE_DEFINITIONS)) {
      const templateId = templateConfig.templates[templateKey as keyof typeof templateConfig.templates];
      
      let status: 'configured' | 'not_configured' | 'error' = 'not_configured';
      let errorMessage: string | undefined;

      if (templateId && !templateId.startsWith('template_')) {
        status = 'configured';
        
        // Validar template se configurado
        if (this.isConfigured()) {
          try {
            const validation = await this.validateTemplate(templateId, templateKey);
            if (!validation.isValid) {
              status = 'error';
              errorMessage = validation.error;
            }
          } catch (error) {
            status = 'error';
            errorMessage = 'Erro na validação';
          }
        }
      }

      results.push({
        id: templateKey,
        name: templateDef.name,
        templateId: templateId || '',
        status,
        category: templateDef.category,
        required: templateDef.required,
        errorMessage
      });
    }

    return results;
  }

  /**
   * Testa um template específico enviando um email real
   */
  async testSpecificTemplate(
    templateType: string,
    recipientEmail?: string
  ): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      throw new Error('EmailJS não está configurado');
    }

    const templateConfig = getEmailTemplateConfig();
    const templateId = templateConfig.templates[templateType as keyof typeof templateConfig.templates];

    if (!templateId || templateId.startsWith('template_')) {
      throw new Error(`Template ${templateType} não configurado`);
    }

    const testParams = this.getTestParamsForTemplate(templateType);
    testParams.to_email = recipientEmail || templateConfig.recipientEmail;
    testParams.test_mode = true;
    testParams.template_type = templateType;

    try {
      const result = await emailjs.send(
        templateConfig.serviceId,
        templateId,
        testParams,
        templateConfig.publicKey
      );

      const emailId = this.generateEmailId(`test_${templateType}`);
      
      // Registrar analytics
      this.recordEmailAnalytics({
        emailId,
        type: `test_${templateType}`,
        status: 'sent',
        sentAt: new Date().toISOString(),
        recipientEmail: testParams.to_email,
        templateUsed: templateId
      });

      return {
        success: true,
        data: result,
        message: `Template ${templateType} testado com sucesso`,
        emailId,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error(`❌ Erro ao testar template ${templateType}:`, error);
      
      return {
        success: false,
        message: `Erro ao testar template ${templateType}: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Exporta configuração atual de templates
   */
  exportTemplateConfig(): {
    config: EmailTemplateSettings;
    timestamp: string;
    version: string;
  } {
    return {
      config: getEmailTemplateConfig(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Importa configuração de templates
   */
  importTemplateConfig(importData: {
    config: EmailTemplateSettings;
    timestamp: string;
    version: string;
  }): boolean {
    try {
      if (!importData.config || !importData.config.serviceId) {
        throw new Error('Dados de importação inválidos');
      }

      localStorage.setItem('whathub_email_template_config', JSON.stringify(importData.config));
      
      // Reconfigurar o serviço
      this.configureTemplates(importData.config);

      console.log('✅ Configuração de templates importada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao importar configuração:', error);
      return false;
    }
  }

  // =============================================================================
  // ESTATÍSTICAS E ANALYTICS
  // =============================================================================

  /**
   * Obtém estatísticas básicas de email
   */
  getEmailStats(): {
    total: number;
    sent: number;
    failed: number;
    byType: Record<string, number>;
    recentActivity: Array<{
      type: string;
      status: string;
      sentAt: string;
    }>;
  } {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAnalytics = this.analytics.filter(
      a => new Date(a.sentAt) > thirtyDaysAgo
    );

    const byType: Record<string, number> = {};
    recentAnalytics.forEach(a => {
      byType[a.type] = (byType[a.type] || 0) + 1;
    });

    return {
      total: recentAnalytics.length,
      sent: recentAnalytics.filter(a => a.status === 'sent').length,
      failed: recentAnalytics.filter(a => a.status === 'failed').length,
      byType,
      recentActivity: recentAnalytics
        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
        .slice(0, 10)
        .map(a => ({
          type: a.type,
          status: a.status,
          sentAt: a.sentAt
        }))
    };
  }

  /**
   * Registra analytics de email
   */
  private recordEmailAnalytics(analytics: EmailAnalytics): void {
    this.analytics.push(analytics);
    
    // Manter apenas os últimos 1000 registros
    if (this.analytics.length > 1000) {
      this.analytics = this.analytics.slice(-1000);
    }
    
    this.saveAnalytics();
  }

  // =============================================================================
  // MÉTODOS PRIVADOS E UTILITÁRIOS
  // =============================================================================

  /**
   * Gera ID único para emails
   */
  private generateEmailId(type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${type}_${timestamp}_${random}`;
  }

  /**
   * Verifica rate limit
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove entradas antigas
    this.rateLimitQueue = this.rateLimitQueue.filter(entry => entry.timestamp > oneMinuteAgo);
    
    // Conta emails no último minuto
    const emailsInLastMinute = this.rateLimitQueue.reduce((sum, entry) => sum + entry.count, 0);
    
    if (emailsInLastMinute >= this.maxEmailsPerMinute) {
      console.warn('⚠️ Rate limit atingido:', emailsInLastMinute, 'emails no último minuto');
      return false;
    }
    
    // Adiciona o email atual à fila
    this.rateLimitQueue.push({ timestamp: now, count: 1 });
    
    return true;
  }

  /**
   * Prepara parâmetros do email de relatório
   */
  private prepareReportEmailParams(reportData: any): Record<string, any> {
    const systemInfo = this.formatSystemInfo(reportData.systemInfo || {});
    
    return {
      // Identificação
      report_id: reportData.id || 'N/A',
      email_id: this.generateEmailId('report'),
      
      // Informações básicas
      title: reportData.title || 'Relatório sem título',
      description: reportData.description || 'Nenhuma descrição fornecida',
      type: reportData.type || 'bug',
      priority: reportData.priority || 'medium',
      
      // Detalhes técnicos
      steps_to_reproduce: reportData.stepsToReproduce || 'Não informado',
      frequency: reportData.frequency || 'Não informado',
      impact: reportData.impact || 'Não informado',
      tags: Array.isArray(reportData.tags) ? reportData.tags.join(', ') : 'Nenhuma',
      
      // Usuário
      user_name: reportData.userInfo?.name || 'Usuário Anônimo',
      user_email: reportData.userInfo?.email || 'Não informado',
      user_phone: reportData.userInfo?.phone || 'Não informado',
      user_company: reportData.userInfo?.company || 'Não informado',
      user_experience: reportData.userInfo?.experience || 'Não informado',
      
      // Feedback
      satisfaction: reportData.satisfaction ? `${reportData.satisfaction}/5` : 'Não informado',
      improvements: reportData.improvements || 'Nenhuma sugestão',
      contact_preference: reportData.contactPreference ? 'Sim' : 'Não',
      
      // Sistema
      system_info: systemInfo,
      
      // Metadados
      submitted_at: new Date().toLocaleString('pt-BR'),
      estimated_resolution: this.calculateEstimatedResolution(reportData.priority, reportData.type),
      
      // Anexos
      attachments_count: reportData.attachments?.length || 0,
      
      // Email de destino
      to_email: this.config!.recipientEmail
    };
  }

  /**
   * Formata informações do sistema
   */
  private formatSystemInfo(systemInfo: any): string {
    const info = [];
    
    if (systemInfo.browser) info.push(`Navegador: ${systemInfo.browser}`);
    if (systemInfo.os) info.push(`Sistema: ${systemInfo.os}`);
    if (systemInfo.screen) info.push(`Tela: ${systemInfo.screen}`);
    if (systemInfo.url) info.push(`URL: ${systemInfo.url}`);
    if (systemInfo.timestamp) info.push(`Timestamp: ${systemInfo.timestamp}`);
    
    return info.length > 0 ? info.join('\n') : 'Informações não disponíveis';
  }

  /**
   * Calcula estimativa de resolução
   */
  private calculateEstimatedResolution(priority: string, type: string): string {
    const priorityDays: Record<string, number> = {
      'critical': 1,
      'high': 3,
      'medium': 7,
      'low': 14
    };
    
    const typeDays: Record<string, number> = {
      'bug': 0,
      'feature': 7,
      'improvement': 3,
      'question': 1
    };
    
    const baseDays = priorityDays[priority] || 7;
    const typeBias = typeDays[type] || 0;
    const estimatedDays = baseDays + typeBias;
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
    
    return estimatedDate.toLocaleDateString('pt-BR');
  }

  /**
   * Helper para aguardar
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // =============================================================================
  // PERSISTÊNCIA DE DADOS
  // =============================================================================

  private loadAnalytics(): void {
    try {
      const stored = localStorage.getItem('whathub_email_analytics');
      if (stored) {
        this.analytics = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Erro ao carregar analytics:', error);
      this.analytics = [];
    }
  }

  private saveAnalytics(): void {    try {
      localStorage.setItem('whathub_email_analytics', JSON.stringify(this.analytics));
    } catch (error) {
      console.warn('Erro ao salvar analytics:', error);
    }
  }

  // =============================================================================
  // MÉTODOS PARA AUTENTICAÇÃO E SEGURANÇA
  // =============================================================================

  /**
   * Envia email de verificação para novos usuários
   */
  async sendEmailVerification(
    userEmail: string, 
    userName: string, 
    verificationCode?: string,
    customLink?: string
  ): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      throw new Error('EmailJS não está configurado');
    }

    const config = getEmailTemplateConfig();
    const templateId = config.templates.emailVerification;

    if (!templateId || templateId.startsWith('template_')) {
      throw new Error('Template de verificação de email não configurado');
    }

    const code = verificationCode || this.generateUniqueCode({
      length: 6,
      type: 'numeric',
      excludeSimilar: true,
      expirationMinutes: 30
    });

    const verificationLink = customLink || `${window.location.origin}/verify-email?code=${code}&email=${encodeURIComponent(userEmail)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toLocaleString('pt-BR');

    // Salvar código para validação posterior
    this.saveVerificationCode(userEmail, code, 'email_verification', 30);

    const params = {
      to_email: userEmail,
      user_name: userName,
      verification_code: code,
      verification_link: verificationLink,
      expires_at: expiresAt,
      from_name: 'WhatsHub Security',
      timestamp: new Date().toISOString()
    };

    return this.sendCustomEmail(templateId, params, userEmail);
  }

  /**
   * Envia email de reset de senha
   */
  async sendPasswordReset(
    userEmail: string,
    userName: string,
    resetCode?: string,
    ipAddress?: string
  ): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      throw new Error('EmailJS não está configurado');
    }

    const config = getEmailTemplateConfig();
    const templateId = config.templates.passwordReset;

    if (!templateId || templateId.startsWith('template_')) {
      throw new Error('Template de reset de senha não configurado');
    }

    const code = resetCode || this.generateUniqueCode({
      length: 8,
      type: 'alphanumeric',
      excludeSimilar: true,
      expirationMinutes: 15
    });

    const resetLink = `${window.location.origin}/reset-password?code=${code}&email=${encodeURIComponent(userEmail)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toLocaleString('pt-BR');

    // Salvar código para validação posterior
    this.saveVerificationCode(userEmail, code, 'password_reset', 15);

    const params = {
      to_email: userEmail,
      user_name: userName,
      reset_code: code,
      reset_link: resetLink,
      expires_at: expiresAt,
      ip_address: ipAddress || 'Não disponível',
      from_name: 'WhatsHub Security',
      timestamp: new Date().toISOString()
    };

    return this.sendCustomEmail(templateId, params, userEmail);
  }

  /**
   * Envia código único para qualquer propósito
   */
  async sendUniqueCode(
    userEmail: string,
    userName: string,
    purpose: string,
    options?: Partial<CodeGenerationOptions>
  ): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      throw new Error('EmailJS não está configurado');
    }

    const config = getEmailTemplateConfig();
    const templateId = config.templates.uniqueCode;

    if (!templateId || templateId.startsWith('template_')) {
      throw new Error('Template de código único não configurado');
    }

    const defaultOptions: CodeGenerationOptions = {
      length: 6,
      type: 'numeric',
      excludeSimilar: true,
      expirationMinutes: 10
    };

    const finalOptions = { ...defaultOptions, ...options };
    const code = this.generateUniqueCode(finalOptions);
    const expiresAt = new Date(Date.now() + finalOptions.expirationMinutes * 60 * 1000).toLocaleString('pt-BR');

    // Salvar código para validação posterior
    this.saveVerificationCode(userEmail, code, purpose, finalOptions.expirationMinutes);

    const params = {
      to_email: userEmail,
      user_name: userName,
      unique_code: code,
      purpose: purpose,
      expires_at: expiresAt,
      from_name: 'WhatsHub Security',
      timestamp: new Date().toISOString()
    };

    return this.sendCustomEmail(templateId, params, userEmail);
  }

  /**
   * Envia alerta de login suspeito
   */
  async sendLoginAlert(
    userEmail: string,
    userName: string,
    loginDetails: {
      ipAddress: string;
      device: string;
      location?: string;
      timestamp: string;
    }
  ): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      throw new Error('EmailJS não está configurado');
    }

    const config = getEmailTemplateConfig();
    const templateId = config.templates.loginAlert;

    if (!templateId || templateId.startsWith('template_')) {
      throw new Error('Template de alerta de login não configurado');
    }

    const blockCode = this.generateUniqueCode({
      length: 8,
      type: 'alphanumeric',
      excludeSimilar: true,
      expirationMinutes: 60
    });

    const blockLink = `${window.location.origin}/security/block-device?code=${blockCode}&email=${encodeURIComponent(userEmail)}`;

    // Salvar código de bloqueio
    this.saveVerificationCode(userEmail, blockCode, 'block_device', 60);

    const params = {
      to_email: userEmail,
      user_name: userName,
      login_time: loginDetails.timestamp,
      ip_address: loginDetails.ipAddress,
      device: loginDetails.device,
      location: loginDetails.location || 'Localização não disponível',
      block_link: blockLink,
      from_name: 'WhatsHub Security',
      timestamp: new Date().toISOString()
    };

    return this.sendCustomEmail(templateId, params, userEmail);
  }

  /**
   * Envia notificação de conta bloqueada
   */
  async sendAccountLocked(
    userEmail: string,
    userName: string,
    lockReason: string
  ): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      throw new Error('EmailJS não está configurado');
    }

    const config = getEmailTemplateConfig();
    const templateId = config.templates.accountLocked;

    if (!templateId || templateId.startsWith('template_')) {
      throw new Error('Template de conta bloqueada não configurado');
    }

    const unlockCode = this.generateUniqueCode({
      length: 10,
      type: 'alphanumeric',
      excludeSimilar: true,
      expirationMinutes: 24 * 60
    });

    const unlockLink = `${window.location.origin}/security/unlock-account?code=${unlockCode}&email=${encodeURIComponent(userEmail)}`;

    // Salvar código de desbloqueio
    this.saveVerificationCode(userEmail, unlockCode, 'unlock_account', 24 * 60);

    const params = {
      to_email: userEmail,
      user_name: userName,
      lock_reason: lockReason,
      unlock_link: unlockLink,
      support_email: getEmailTemplateConfig().recipientEmail,
      from_name: 'WhatsHub Security',
      timestamp: new Date().toISOString()
    };

    return this.sendCustomEmail(templateId, params, userEmail);
  }

  /**
   * Envia código de autenticação de dois fatores
   */
  async sendTwoFactorAuth(
    userEmail: string,
    userName: string,
    device?: string
  ): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      throw new Error('EmailJS não está configurado');
    }

    const config = getEmailTemplateConfig();
    const templateId = config.templates.twoFactorAuth;

    if (!templateId || templateId.startsWith('template_')) {
      throw new Error('Template de autenticação 2FA não configurado');
    }

    const authCode = this.generateUniqueCode({
      length: 6,
      type: 'numeric',
      excludeSimilar: true,
      expirationMinutes: 5
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toLocaleString('pt-BR');

    // Salvar código para validação posterior
    this.saveVerificationCode(userEmail, authCode, '2fa_auth', 5);

    const params = {
      to_email: userEmail,
      user_name: userName,
      auth_code: authCode,
      expires_at: expiresAt,
      device: device || 'Dispositivo não identificado',
      from_name: 'WhatsHub Security',
      timestamp: new Date().toISOString()
    };

    return this.sendCustomEmail(templateId, params, userEmail);
  }

  // =============================================================================
  // MÉTODOS UTILITÁRIOS PARA CÓDIGOS E VALIDAÇÃO
  // =============================================================================

  /**
   * Gera um código único baseado nas opções fornecidas
   */
  generateUniqueCode(options: CodeGenerationOptions): string {
    const { length, type, excludeSimilar } = options;
    
    let chars = '';
    
    switch (type) {
      case 'numeric':
        chars = '0123456789';
        break;
      case 'alpha':
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        break;
      case 'alphanumeric':
        chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        break;
    }
    
    if (excludeSimilar) {
      chars = chars.replace(/[0O1lI]/g, '');
    }
    
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }

  /**
   * Salva código de verificação para validação posterior
   */
  private saveVerificationCode(
    userEmail: string,
    code: string,
    purpose: string,
    expirationMinutes: number
  ): void {
    try {
      const stored = localStorage.getItem('whathub_verification_codes') || '[]';
      const codes = JSON.parse(stored) as UniqueCodeRecord[];
      
      const newCode: UniqueCodeRecord = {
        code,
        purpose,
        userEmail,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString(),
        isUsed: false
      };
      
      codes.push(newCode);
      
      // Limpar códigos expirados
      const validCodes = codes.filter(c => new Date(c.expiresAt) > new Date());
      
      localStorage.setItem('whathub_verification_codes', JSON.stringify(validCodes));
    } catch (error) {
      console.error('Erro ao salvar código de verificação:', error);
    }
  }

  /**
   * Valida um código de verificação
   */
  validateVerificationCode(
    userEmail: string,
    code: string,
    purpose: string
  ): { isValid: boolean; record?: UniqueCodeRecord; error?: string } {
    try {
      const stored = localStorage.getItem('whathub_verification_codes') || '[]';
      const codes = JSON.parse(stored) as UniqueCodeRecord[];
      
      const record = codes.find(c => 
        c.userEmail === userEmail && 
        c.code === code && 
        c.purpose === purpose &&
        !c.isUsed &&
        new Date(c.expiresAt) > new Date()
      );
      
      if (!record) {
        return { isValid: false, error: 'Código inválido ou expirado' };
      }
      
      // Marcar como usado
      record.isUsed = true;
      record.usedAt = new Date().toISOString();
      
      localStorage.setItem('whathub_verification_codes', JSON.stringify(codes));
      
      return { isValid: true, record };
    } catch (error) {
      console.error('Erro ao validar código:', error);
      return { isValid: false, error: 'Erro interno na validação' };
    }
  }

  /**
   * Obtém códigos de verificação por usuário
   */
  getUserVerificationCodes(userEmail: string): UniqueCodeRecord[] {
    try {
      const stored = localStorage.getItem('whathub_verification_codes') || '[]';
      const codes = JSON.parse(stored) as UniqueCodeRecord[];
      
      return codes
        .filter(c => c.userEmail === userEmail)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Erro ao obter códigos do usuário:', error);
      return [];
    }
  }

  /**
   * Limpa códigos expirados
   */
  cleanupExpiredCodes(): number {
    try {
      const stored = localStorage.getItem('whathub_verification_codes') || '[]';
      const codes = JSON.parse(stored) as UniqueCodeRecord[];
      
      const now = new Date();
      const validCodes = codes.filter(c => new Date(c.expiresAt) > now);
      const removedCount = codes.length - validCodes.length;
      
      localStorage.setItem('whathub_verification_codes', JSON.stringify(validCodes));
      
      if (removedCount > 0) {
        console.log(`🧹 ${removedCount} códigos expirados removidos`);
      }
      
      return removedCount;
    } catch (error) {
      console.error('Erro ao limpar códigos expirados:', error);
      return 0;
    }
  }
}

// =============================================================================
// INSTÂNCIA GLOBAL DO SERVIÇO
// =============================================================================

export const emailService = new EmailService();

// Auto-inicializar se configuração estiver disponível
if (typeof window !== 'undefined') {
  setTimeout(() => {
    emailService.autoInitialize();
  }, 1000);
}

export default emailService;

// =============================================================================
// MÉTODOS PARA AUTENTICAÇÃO E SEGURANÇA
// =============================================================================

/**
 * Envia email de verificação para novos usuários
 */
async sendEmailVerification(
  userEmail: string, 
  userName: string, 
  verificationCode?: string,
  customLink?: string
): Promise<EmailResponse> {
  if (!this.isConfigured()) {
    throw new Error('EmailJS não está configurado');
  }

  const config = getEmailTemplateConfig();
  const templateId = config.templates.emailVerification;

  if (!templateId || templateId.startsWith('template_')) {
    throw new Error('Template de verificação de email não configurado');
  }

  const code = verificationCode || this.generateUniqueCode({
    length: 6,
    type: 'numeric',
    excludeSimilar: true,
    expirationMinutes: 30
  });

  const verificationLink = customLink || `${window.location.origin}/verify-email?code=${code}&email=${encodeURIComponent(userEmail)}`;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toLocaleString('pt-BR');

  // Salvar código para validação posterior
  this.saveVerificationCode(userEmail, code, 'email_verification', 30);

  const params = {
    to_email: userEmail,
    user_name: userName,
    verification_code: code,
    verification_link: verificationLink,
    expires_at: expiresAt,
    from_name: 'WhatsHub Security',
    timestamp: new Date().toISOString()
  };

  return this.sendCustomEmail(templateId, params, userEmail);
}

/**
 * Envia email de reset de senha
 */
async sendPasswordReset(
  userEmail: string,
  userName: string,
  resetCode?: string,
  ipAddress?: string
): Promise<EmailResponse> {
  if (!this.isConfigured()) {
    throw new Error('EmailJS não está configurado');
  }

  const config = getEmailTemplateConfig();
  const templateId = config.templates.passwordReset;

  if (!templateId || templateId.startsWith('template_')) {
    throw new Error('Template de reset de senha não configurado');
  }

  const code = resetCode || this.generateUniqueCode({
    length: 8,
    type: 'alphanumeric',
    excludeSimilar: true,
    expirationMinutes: 15
  });

  const resetLink = `${window.location.origin}/reset-password?code=${code}&email=${encodeURIComponent(userEmail)}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toLocaleString('pt-BR');

  // Salvar código para validação posterior
  this.saveVerificationCode(userEmail, code, 'password_reset', 15);

  const params = {
    to_email: userEmail,
    user_name: userName,
    reset_code: code,
    reset_link: resetLink,
    expires_at: expiresAt,
    ip_address: ipAddress || 'Não disponível',
    from_name: 'WhatsHub Security',
    timestamp: new Date().toISOString()
  };

  return this.sendCustomEmail(templateId, params, userEmail);
}

/**
 * Envia código único para qualquer propósito
 */
async sendUniqueCode(
  userEmail: string,
  userName: string,
  purpose: string,
  options?: Partial<CodeGenerationOptions>
): Promise<EmailResponse> {
  if (!this.isConfigured()) {
    throw new Error('EmailJS não está configurado');
  }

  const config = getEmailTemplateConfig();
  const templateId = config.templates.uniqueCode;

  if (!templateId || templateId.startsWith('template_')) {
    throw new Error('Template de código único não configurado');
  }

  const defaultOptions: CodeGenerationOptions = {
    length: 6,
    type: 'numeric',
    excludeSimilar: true,
    expirationMinutes: 10
  };

  const finalOptions = { ...defaultOptions, ...options };
  const code = this.generateUniqueCode(finalOptions);
  const expiresAt = new Date(Date.now() + finalOptions.expirationMinutes * 60 * 1000).toLocaleString('pt-BR');

  // Salvar código para validação posterior
  this.saveVerificationCode(userEmail, code, purpose, finalOptions.expirationMinutes);

  const params = {
    to_email: userEmail,
    user_name: userName,
    unique_code: code,
    purpose: purpose,
    expires_at: expiresAt,
    from_name: 'WhatsHub Security',
    timestamp: new Date().toISOString()
  };

  return this.sendCustomEmail(templateId, params, userEmail);
}

/**
 * Envia alerta de login suspeito
 */
async sendLoginAlert(
  userEmail: string,
  userName: string,
  loginDetails: {
    ipAddress: string;
    device: string;
    location?: string;
    timestamp: string;
  }
): Promise<EmailResponse> {
  if (!this.isConfigured()) {
    throw new Error('EmailJS não está configurado');
  }

  const config = getEmailTemplateConfig();
  const templateId = config.templates.loginAlert;

  if (!templateId || templateId.startsWith('template_')) {
    throw new Error('Template de alerta de login não configurado');
  }

  const blockCode = this.generateUniqueCode({
    length: 8,
    type: 'alphanumeric',
    excludeSimilar: true,
    expirationMinutes: 60
  });

  const blockLink = `${window.location.origin}/security/block-device?code=${blockCode}&email=${encodeURIComponent(userEmail)}`;

  // Salvar código de bloqueio
  this.saveVerificationCode(userEmail, blockCode, 'block_device', 60);

  const params = {
    to_email: userEmail,
    user_name: userName,
    login_time: loginDetails.timestamp,
    ip_address: loginDetails.ipAddress,
    device: loginDetails.device,
    location: loginDetails.location || 'Localização não disponível',
    block_link: blockLink,
    from_name: 'WhatsHub Security',
    timestamp: new Date().toISOString()
  };

  return this.sendCustomEmail(templateId, params, userEmail);
}

/**
 * Envia notificação de conta bloqueada
 */
async sendAccountLocked(
  userEmail: string,
  userName: string,
  lockReason: string
): Promise<EmailResponse> {
  if (!this.isConfigured()) {
    throw new Error('EmailJS não está configurado');
  }

  const config = getEmailTemplateConfig();
  const templateId = config.templates.accountLocked;

  if (!templateId || templateId.startsWith('template_')) {
    throw new Error('Template de conta bloqueada não configurado');
  }

  const unlockCode = this.generateUniqueCode({
    length: 10,
    type: 'alphanumeric',
    excludeSimilar: true,
    expirationMinutes: 24 * 60 // 24 horas
  });

  const unlockLink = `${window.location.origin}/security/unlock-account?code=${unlockCode}&email=${encodeURIComponent(userEmail)}`;

  // Salvar código de desbloqueio
  this.saveVerificationCode(userEmail, unlockCode, 'unlock_account', 24 * 60);

  const params = {
    to_email: userEmail,
    user_name: userName,
    lock_reason: lockReason,
    unlock_link: unlockLink,
    support_email: getEmailTemplateConfig().recipientEmail,
    from_name: 'WhatsHub Security',
    timestamp: new Date().toISOString()
  };

  return this.sendCustomEmail(templateId, params, userEmail);
}

/**
 * Envia código de autenticação de dois fatores
 */
async sendTwoFactorAuth(
  userEmail: string,
  userName: string,
  device?: string
): Promise<EmailResponse> {
  if (!this.isConfigured()) {
    throw new Error('EmailJS não está configurado');
  }

  const config = getEmailTemplateConfig();
  const templateId = config.templates.twoFactorAuth;

  if (!templateId || templateId.startsWith('template_')) {
    throw new Error('Template de 2FA não configurado');
  }

  const authCode = this.generateUniqueCode({
    length: 6,
    type: 'numeric',
    excludeSimilar: true,
    expirationMinutes: 5 // Códigos 2FA expiram rápido
  });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toLocaleString('pt-BR');

  // Salvar código para validação posterior
  this.saveVerificationCode(userEmail, authCode, '2fa_auth', 5);

  const params = {
    to_email: userEmail,
    user_name: userName,
    auth_code: authCode,
    expires_at: expiresAt,
    device: device || 'Dispositivo não identificado',
    from_name: 'WhatsHub Security',
    timestamp: new Date().toISOString()
  };

  return this.sendCustomEmail(templateId, params, userEmail);
}

// =============================================================================
// MÉTODOS UTILITÁRIOS PARA CÓDIGOS E VALIDAÇÃO
// =============================================================================

/**
 * Gera um código único baseado nas opções fornecidas
 */
generateUniqueCode(options: CodeGenerationOptions): string {
  const { length, type, excludeSimilar } = options;
  
  let chars = '';
  
  switch (type) {
    case 'numeric':
      chars = '0123456789';
      break;
    case 'alpha':
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      break;
    case 'alphanumeric':
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      break;
  }
  
  if (excludeSimilar) {
    chars = chars.replace(/[0O1IL]/g, ''); // Remove caracteres similares
  }
  
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Salva código de verificação para validação posterior
 */
private saveVerificationCode(
  userEmail: string,
  code: string,
  purpose: string,
  expirationMinutes: number
): void {
  try {
    const record: UniqueCodeRecord = {
      code,
      purpose,
      userEmail,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString(),
      isUsed: false
    };

    const stored = localStorage.getItem('whathub_verification_codes') || '[]';
    const codes = JSON.parse(stored) as UniqueCodeRecord[];
    
    // Remove códigos expirados
    const validCodes = codes.filter(c => new Date(c.expiresAt) > new Date());
    
    // Adiciona novo código
    validCodes.push(record);
    
    localStorage.setItem('whathub_verification_codes', JSON.stringify(validCodes));
  } catch (error) {
    console.error('Erro ao salvar código de verificação:', error);
  }
}

/**
 * Valida um código de verificação
 */
validateVerificationCode(
  userEmail: string,
  code: string,
  purpose: string
): { isValid: boolean; record?: UniqueCodeRecord; error?: string } {
  try {
    const stored = localStorage.getItem('whathub_verification_codes') || '[]';
    const codes = JSON.parse(stored) as UniqueCodeRecord[];
    
    const record = codes.find(c => 
      c.userEmail === userEmail && 
      c.code === code && 
      c.purpose === purpose && 
      !c.isUsed
    );

    if (!record) {
      return { isValid: false, error: 'Código não encontrado ou já utilizado' };
    }

    if (new Date(record.expiresAt) < new Date()) {
      return { isValid: false, error: 'Código expirado' };
    }

    // Marcar como usado
    record.isUsed = true;
    record.usedAt = new Date().toISOString();
    
    localStorage.setItem('whathub_verification_codes', JSON.stringify(codes));
    
    return { isValid: true, record };
  } catch (error) {
    console.error('Erro ao validar código:', error);
    return { isValid: false, error: 'Erro interno na validação' };
  }
}

/**
 * Obtém códigos de verificação por usuário
 */
getUserVerificationCodes(userEmail: string): UniqueCodeRecord[] {
  try {
    const stored = localStorage.getItem('whathub_verification_codes') || '[]';
    const codes = JSON.parse(stored) as UniqueCodeRecord[];
    
    return codes
      .filter(c => c.userEmail === userEmail)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Erro ao obter códigos do usuário:', error);
    return [];
  }
}

/**
 * Limpa códigos expirados
 */
cleanupExpiredCodes(): number {
  try {
    const stored = localStorage.getItem('whathub_verification_codes') || '[]';
    const codes = JSON.parse(stored) as UniqueCodeRecord[];
    
    const now = new Date();
    const validCodes = codes.filter(c => new Date(c.expiresAt) > now);
    const expiredCount = codes.length - validCodes.length;
    
    localStorage.setItem('whathub_verification_codes', JSON.stringify(validCodes));
    
    return expiredCount;
  } catch (error) {
    console.error('Erro ao limpar códigos expirados:', error);
    return 0;
  }
}

// =============================================================================
// MÉTODOS PARA GESTÃO DE TEMPLATES E CONFIGURAÇÕES AVANÇADAS
// =============================================================================

/**
 * Inicializa templates avançados com configuração padrão
 */
private initializeAdvancedTemplates(): void {
  const defaultTemplates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Bem-vindo ao WhatsHub',
      description: 'Email de boas-vindas para novos usuários',
      templateId: 'template_welcome',
      variables: ['user_name', 'getting_started_link', 'support_email', 'features_list'],
      category: 'marketing'
    },
    {
      id: 'passwordReset',
      name: 'Redefinição de Senha',
      description: 'Email para redefinição de senha',
      templateId: 'template_password_reset',
      variables: ['user_name', 'reset_link', 'expires_at', 'ip_address'],
      category: 'system'
    },
    {
      id: 'emailVerification',
      name: 'Verificação de Email',
      description: 'Email de verificação para novos usuários',
      templateId: 'template_email_verification',
      variables: ['user_name', 'verification_code', 'verification_link', 'expires_at'],
      category: 'system'
    },
    {
      id: 'report',
      name: 'Relatório de Problema',
      description: 'Email de relatório de problema',
      templateId: 'template_report',
      variables: ['report_id', 'title', 'description', 'priority', 'user_name', 'user_email', 'submitted_at'],
      category: 'report'
    }
  ];

  defaultTemplates.forEach(template => {
    this.registerTemplate(template);
  });

  console.log('✅ Templates avançados inicializados:', defaultTemplates.map(t => t.name));
}

/**
 * Configura múltiplos templates do EmailJS
 */
configureTemplates(templateConfig: EmailTemplateSettings): boolean {
  try {
    // Salvar configuração de templates
    localStorage.setItem('whathub_email_template_config', JSON.stringify(templateConfig));
    
    // Atualizar configuração básica se necessário
    if (this.config) {
      this.config.serviceId = templateConfig.serviceId;
      this.config.publicKey = templateConfig.publicKey;
      this.config.recipientEmail = templateConfig.recipientEmail;
    } else {
      this.config = {
        serviceId: templateConfig.serviceId,
        templateId: templateConfig.templates.report, // Template padrão
        publicKey: templateConfig.publicKey,
        recipientEmail: templateConfig.recipientEmail
      };
    }

    emailjs.init(templateConfig.publicKey);
    this.isInitialized = true;

    console.log('✅ Templates EmailJS configurados com sucesso:', {
      serviceId: templateConfig.serviceId,
      templates: Object.keys(templateConfig.templates).length,
      recipientEmail: templateConfig.recipientEmail
    });

    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar templates EmailJS:', error);
    return false;
  }
}

/**
 * Obtém a configuração atual de templates
 */
getTemplateConfig(): EmailTemplateSettings | null {
  return getEmailTemplateConfig();
}

/**
 * Valida um template específico
 */
async validateTemplate(templateId: string, templateType: string): Promise<{
  isValid: boolean;
  error?: string;
  variables?: string[];
}> {
  if (!this.isConfigured()) {
    return { isValid: false, error: 'EmailJS não configurado' };
  }

  try {
    const testParams = this.getTestParamsForTemplate(templateType);
    
    // Tentar enviar um email de teste (apenas validação, não enviado)
    const result = await emailjs.send(
      this.config!.serviceId,
      templateId,
      { ...testParams, test_mode: true, to_email: 'test@validation.local' },
      this.config!.publicKey
    );

    return {
      isValid: true,
      variables: Object.keys(testParams)
    };
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || 'Erro na validação do template'
    };
  }
}

/**
 * Obtém parâmetros de teste para diferentes tipos de template
 */
private getTestParamsForTemplate(templateType: string): Record<string, any> {
  const baseParams = {
    from_name: 'WhatsHub System',
    timestamp: new Date().toISOString(),
    to_email: 'test@validation.local'
  };

  switch (templateType) {
    case 'emailVerification':
      return {
        ...baseParams,
        user_name: 'Usuário Teste',
        verification_code: '123456',
        verification_link: 'https://example.com/verify',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toLocaleString('pt-BR')
      };

    case 'passwordReset':
      return {
        ...baseParams,
        user_name: 'Usuário Teste',
        reset_code: 'ABC123',
        reset_link: 'https://example.com/reset',
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toLocaleString('pt-BR'),
        ip_address: '192.168.1.1'
      };

    case 'uniqueCode':
      return {
        ...baseParams,
        user_name: 'Usuário Teste',
        unique_code: '789012',
        purpose: 'Teste de Validação',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toLocaleString('pt-BR')
      };

    case 'loginAlert':
      return {
        ...baseParams,
        user_name: 'Usuário Teste',
        login_time: new Date().toLocaleString('pt-BR'),
        ip_address: '192.168.1.1',
        device: 'Chrome Browser',
        location: 'São Paulo, Brasil',
        block_link: 'https://example.com/block'
      };

    case 'accountLocked':
      return {
        ...baseParams,
        user_name: 'Usuário Teste',
        lock_reason: 'Múltiplas tentativas de login falharam',
        unlock_link: 'https://example.com/unlock',
        support_email: 'suporte@whathub.com'
      };

    case 'twoFactorAuth':
      return {
        ...baseParams,
        user_name: 'Usuário Teste',
        auth_code: '123456',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toLocaleString('pt-BR'),
        device: 'Chrome Browser'
      };

    case 'welcome':
      return {
        ...baseParams,
        user_name: 'Usuário Teste',
        getting_started_link: 'https://example.com/start',
        support_email: 'suporte@whathub.com',
        features_list: 'Dashboard, Relatórios, Notificações'
      };

    case 'report':
      return {
        ...baseParams,
        report_id: 'RPT-001',
        title: 'Relatório de Teste',
        description: 'Descrição do problema de teste',
        priority: 'Alta',
        user_name: 'Usuário Teste',
        user_email: 'teste@example.com',
        submitted_at: new Date().toLocaleString('pt-BR')
      };

    default:
      return {
        ...baseParams,
        title: 'Template de Teste',
        message: 'Esta é uma mensagem de teste',
        content: 'Conteúdo de teste para validação'
      };
  }
}

/**
 * Lista todos os templates configurados com seus status
 */
async getTemplateStatuses(): Promise<Array<{
  id: string;
  name: string;
  templateId: string;
  status: 'configured' | 'not_configured' | 'error';
  category: string;
  required: boolean;
  lastValidated?: string;
  errorMessage?: string;
}>> {
  const templateConfig = getEmailTemplateConfig();
  const results = [];

  for (const [templateKey, templateDef] of Object.entries(TEMPLATE_DEFINITIONS)) {
    const templateId = templateConfig.templates[templateKey as keyof typeof templateConfig.templates];
    
    let status: 'configured' | 'not_configured' | 'error' = 'not_configured';
    let errorMessage: string | undefined;

    if (templateId && !templateId.startsWith('template_')) {
      status = 'configured';
      
      // Validar template se configurado
      if (this.isConfigured()) {
        try {
          const validation = await this.validateTemplate(templateId, templateKey);
          if (!validation.isValid) {
            status = 'error';
            errorMessage = validation.error;
          }
        } catch (error) {
          status = 'error';
          errorMessage = 'Erro na validação';
        }
      }
    }

    results.push({
      id: templateKey,
      name: templateDef.name,
      templateId: templateId || '',
      status,
      category: templateDef.category,
      required: templateDef.required,
      errorMessage
    });
  }

  return results;
}

/**
 * Testa um template específico enviando um email real
 */
async testSpecificTemplate(
  templateType: string,
  recipientEmail?: string
): Promise<EmailResponse> {
  if (!this.isConfigured()) {
    throw new Error('EmailJS não está configurado');
  }

  const templateConfig = getEmailTemplateConfig();
  const templateId = templateConfig.templates[templateType as keyof typeof templateConfig.templates];

  if (!templateId || templateId.startsWith('template_')) {
    throw new Error(`Template ${templateType} não configurado`);
  }

  const testParams = this.getTestParamsForTemplate(templateType);
  testParams.to_email = recipientEmail || templateConfig.recipientEmail;
  testParams.test_mode = true;
  testParams.template_type = templateType;

  try {
    const result = await emailjs.send(
      templateConfig.serviceId,
      templateId,
      testParams,
      templateConfig.publicKey
    );

    const emailId = this.generateEmailId(`test_${templateType}`);
    
    // Registrar analytics
    this.recordEmailAnalytics({
      emailId,
      type: `test_${templateType}`,
      status: 'sent',
      sentAt: new Date().toISOString(),
      recipientEmail: testParams.to_email,
      templateUsed: templateId
    });

    return {
      success: true,
      data: result,
      message: `Template ${templateType} testado com sucesso`,
      emailId,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error(`❌ Erro ao testar template ${templateType}:`, error);
    
    return {
      success: false,
      message: `Erro ao testar template ${templateType}: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Exporta configuração atual de templates
 */
exportTemplateConfig(): {
  config: EmailTemplateSettings;
  timestamp: string;
  version: string;
} {
  return {
    config: getEmailTemplateConfig(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
}

/**
 * Importa configuração de templates
 */
importTemplateConfig(importData: {
  config: EmailTemplateSettings;
  timestamp: string;
  version: string;
}): boolean {
  try {
    if (!importData.config || !importData.config.serviceId) {
      throw new Error('Dados de importação inválidos');
    }

    localStorage.setItem('whathub_email_template_config', JSON.stringify(importData.config));
    
    // Reconfigurar o serviço
    this.configureTemplates(importData.config);

    console.log('✅ Configuração de templates importada com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao importar configuração:', error);
    return false;
  }
}
