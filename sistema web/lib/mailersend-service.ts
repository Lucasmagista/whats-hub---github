import { MailerSend, EmailParams, Sender, Recipient } from "mailersend"

// Configurações do MailerSend
const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY || ''
const MAILERSEND_FROM_EMAIL = process.env.MAILERSEND_FROM_EMAIL || process.env.FROM_EMAIL || 'noreply@seudominio.com'
const MAILERSEND_FROM_NAME = process.env.MAILERSEND_FROM_NAME || process.env.FROM_NAME || 'WhatsApp Dashboard'

// IDs dos templates MailerSend
const TEMPLATES = {
  VERIFICATION: process.env.MAILERSEND_TEMPLATE_VERIFICATION || '',
  WELCOME: process.env.MAILERSEND_TEMPLATE_WELCOME || '', 
  RESET: process.env.MAILERSEND_TEMPLATE_RESET || '',
  NOTIFICATION: process.env.MAILERSEND_TEMPLATE_NOTIFICATION || ''
}

// Inicializar MailerSend
const mailerSend = new MailerSend({
  apiKey: MAILERSEND_API_KEY,
})

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  provider?: string
  details?: unknown
}

export interface MailerSendEmailData {
  to_email: string
  to_name: string
  from_name?: string
  subject?: string
  message?: string
  verification_code?: string
  reset_token?: string
  reset_url?: string
  year?: string
  [key: string]: unknown
}

export class MailerSendService {
  
  // Validar configuração do MailerSend
  static validateConfig() {
    if (!MAILERSEND_API_KEY) {
      throw new Error('❌ MailerSend não configurado. Verifique a variável MAILERSEND_API_KEY no arquivo .env')
    }
    if (!MAILERSEND_FROM_EMAIL) {
      throw new Error('❌ Email do remetente não configurado. Verifique MAILERSEND_FROM_EMAIL no arquivo .env')
    }
  }

  // Função principal para enviar emails
  static async sendEmail(emailData: MailerSendEmailData, templateId?: string): Promise<EmailResult> {
    this.validateConfig()
    
    console.log('📧 Enviando email via MailerSend...')
    console.log(`📧 Para: ${emailData.to_email}`)

    try {
      const sentFrom = new Sender(MAILERSEND_FROM_EMAIL, emailData.from_name || MAILERSEND_FROM_NAME)
      const recipients = [new Recipient(emailData.to_email, emailData.to_name)]

      const emailParams = this.buildEmailParams(sentFrom, recipients, emailData, templateId)
      const result = await mailerSend.email.send(emailParams)
      
      console.log('✅ Email enviado com sucesso via MailerSend!')

      return {
        success: true,
        messageId: result.body?.message_id || 'success',
        provider: 'mailersend'
      }

    } catch (error: unknown) {
      console.error('❌ Erro no envio via MailerSend:', error)
      return this.handleEmailError(error)
    }
  }

  // Construir parâmetros do email
  private static buildEmailParams(sentFrom: Sender, recipients: Recipient[], emailData: MailerSendEmailData, templateId?: string): EmailParams {
    if (templateId && templateId.trim() !== '') {
      return new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setTemplateId(templateId)
        .setPersonalization([
          {
            email: emailData.to_email,
            data: {
              user_name: emailData.to_name,
              to_name: emailData.to_name,
              verification_code: emailData.verification_code || '',
              reset_url: emailData.reset_url || '',
              from_name: emailData.from_name || MAILERSEND_FROM_NAME,
              year: emailData.year || new Date().getFullYear().toString(),
              message: emailData.message || ''
            }
          }
        ])
    } else {
      return new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(emailData.subject || 'WhatsApp Dashboard')
        .setHtml(this.generateHTMLTemplate(emailData))
    }
  }

  // Tratar erros de email
  private static handleEmailError(error: unknown): EmailResult {
    let errorMessage = 'Erro desconhecido no envio de email'
    
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string }; status?: number } }
      if (apiError.response?.data?.message) {
        errorMessage = `MailerSend API Error: ${apiError.response.data.message}`
      }
      
      if (apiError.response?.status === 401) {
        errorMessage = 'Erro de autenticação MailerSend. Verifique sua API Key.'
      }
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage,
      details: error
    }
  }

  // Gerar template HTML personalizado (fallback)
  static generateHTMLTemplate(emailData: MailerSendEmailData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailData.subject || 'WhatsApp Dashboard'}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                    🚀 WhatsApp Dashboard
                </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #333; margin-top: 0; font-size: 24px;">
                    Olá, ${emailData.to_name}!
                </h2>
                
                ${emailData.verification_code ? `
                <div style="background-color: #f8f9ff; border: 2px solid #667eea; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
                    <h3 style="color: #667eea; margin: 0 0 15px 0;">🔐 Código de Verificação</h3>
                    <div style="font-size: 32px; font-weight: bold; color: #333; background: white; padding: 15px; border-radius: 5px; letter-spacing: 5px; border: 2px dashed #667eea;">
                        ${emailData.verification_code}
                    </div>
                    <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">
                        Digite este código para verificar sua conta. Expira em 10 minutos.
                    </p>
                </div>
                ` : ''}
                
                ${emailData.reset_url ? `
                <div style="background-color: #fff8f0; border: 2px solid #f59e0b; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
                    <h3 style="color: #f59e0b; margin: 0 0 15px 0;">🔑 Redefinir Senha</h3>
                    <a href="${emailData.reset_url}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                        Redefinir Minha Senha
                    </a>
                    <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">
                        Este link expira em 1 hora. Se você não solicitou, ignore este email.
                    </p>
                </div>
                ` : ''}
                
                <p style="color: #555; line-height: 1.6; margin: 20px 0;">
                    ${emailData.message || 'Obrigado por usar o WhatsApp Dashboard!'}
                </p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 25px 0;">
                    <p style="color: #666; font-size: 14px; margin: 0;">
                        <strong>💡 Dica:</strong> Se você não solicitou este email, pode ignorá-lo com segurança.
                    </p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #888; font-size: 12px; margin: 0;">
                    © ${emailData.year || new Date().getFullYear()} ${emailData.from_name || MAILERSEND_FROM_NAME}. Todos os direitos reservados.
                </p>
            </div>
        </div>
    </body>
    </html>
    `
  }

  // Email de verificação (código 6 dígitos)
  static async sendVerificationEmail(userData: { name: string; email: string; verificationCode: string }) {
    try {
      console.log('🔐 Preparando email de verificação para:', userData.email)
      
      const emailData: MailerSendEmailData = {
        to_email: userData.email,
        to_name: userData.name,
        from_name: MAILERSEND_FROM_NAME,
        subject: 'Código de Verificação - WhatsApp Dashboard',
        verification_code: userData.verificationCode,
        year: new Date().getFullYear().toString(),
        message: `Seu código de verificação é: ${userData.verificationCode}. Este código expira em 10 minutos.`,
      }

      const result = await this.sendEmail(emailData, TEMPLATES.VERIFICATION)
      if (result.success) {
        return { success: true, messageId: result.messageId }
      } else {
        return { success: false, error: result.error }
      }
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de verificação:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }

  // Email de boas-vindas
  static async sendWelcomeEmail(userData: { name: string; email: string }) {
    try {
      const emailData: MailerSendEmailData = {
        to_email: userData.email,
        to_name: userData.name,
        from_name: MAILERSEND_FROM_NAME,
        subject: 'Bem-vindo ao WhatsApp Dashboard!',
        message: `Olá ${userData.name}!\n\nSua conta foi criada com sucesso. Agora você pode fazer login e começar a usar o WhatsApp Dashboard.\n\nSe você não criou esta conta, por favor ignore este email.\n\nAtenciosamente,\nEquipe WhatsApp Dashboard`,
        year: new Date().getFullYear().toString()
      }

      const result = await this.sendEmail(emailData, TEMPLATES.WELCOME)
      return { success: true, messageId: result.messageId }
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de boas-vindas:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }

  // Email de reset de senha
  static async sendPasswordResetEmail(userData: { name: string; email: string; resetToken: string }) {
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${userData.resetToken}`

      const emailData: MailerSendEmailData = {
        to_email: userData.email,
        to_name: userData.name,
        from_name: MAILERSEND_FROM_NAME,
        subject: 'Redefinir Senha - WhatsApp Dashboard',
        reset_token: userData.resetToken,
        reset_url: resetUrl,
        message: `Olá ${userData.name}!\n\nVocê solicitou a redefinição de sua senha.\n\nClique no link abaixo para redefinir sua senha:\n${resetUrl}\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta redefinição, por favor ignore este email.\n\nAtenciosamente,\nEquipe WhatsApp Dashboard`,
        year: new Date().getFullYear().toString()
      }

      const result = await this.sendEmail(emailData, TEMPLATES.RESET)
      return { success: true, messageId: result.messageId }
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de reset de senha:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }

  // Email de notificação geral
  static async sendNotificationEmail(userData: { name: string; email: string; title: string; content: string }) {
    try {
      const emailData: MailerSendEmailData = {
        to_email: userData.email,
        to_name: userData.name,
        from_name: MAILERSEND_FROM_NAME,
        subject: userData.title,
        message: userData.content,
        year: new Date().getFullYear().toString()
      }

      const result = await this.sendEmail(emailData, TEMPLATES.NOTIFICATION)
      return { success: true, messageId: result.messageId }
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de notificação:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }

  // Testar configuração
  static async testConfiguration() {
    try {
      this.validateConfig()
      console.log('✅ Configuração MailerSend válida!')
      
      // Teste de envio básico
      const testResult = await this.sendVerificationEmail({
        name: 'Teste Usuario',
        email: MAILERSEND_FROM_EMAIL, // Enviar para o próprio email
        verificationCode: '123456'
      })
      
      return testResult
    } catch (error) {
      console.error('❌ Erro na configuração MailerSend:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }
}
