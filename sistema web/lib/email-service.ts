import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

// Configurações do MailerSend
const MAILERSEND_API_TOKEN = process.env.MAILERSEND_API_TOKEN || ''
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.MAILERSEND_FROM_EMAIL || 'noreply@yourdomain.com'
const FROM_NAME = process.env.FROM_NAME || 'WhatsApp Dashboard'

// Inicializar MailerSend
const mailerSend = new MailerSend({
  apiKey: MAILERSEND_API_TOKEN,
})

const sentFrom = new Sender(FROM_EMAIL, FROM_NAME)

export interface EmailData {
  to_email: string
  to_name: string
  from_name?: string
  subject?: string
  message?: string
  verification_code?: string
  reset_token?: string
  year?: string
  [key: string]: unknown
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
  details?: string
  code?: string
  provider?: string
}

export class EmailService {
  // Validar configuração do MailerSend
  static validateConfig() {
    if (!MAILERSEND_API_TOKEN) {
      throw new Error('❌ MailerSend não configurado. Verifique a variável MAILERSEND_API_TOKEN no arquivo .env')
    }
    if (!FROM_EMAIL) {
      throw new Error('❌ Email de origem não configurado. Verifique a variável FROM_EMAIL no arquivo .env')
    }
  }

  // Função principal para enviar email via MailerSend
  static async sendEmailViaMailerSend(emailData: EmailData): Promise<EmailResponse> {
    this.validateConfig()
    
    console.log('📧 Enviando email via MailerSend...')
    console.log(`📧 Para: ${emailData.to_email}`)
    console.log(`📧 Assunto: ${emailData.subject}`)

    try {
      const recipients = [
        new Recipient(emailData.to_email, emailData.to_name)
      ]

      // Template HTML para email
      const htmlTemplate = this.generateEmailTemplate(emailData)

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(emailData.subject || 'WhatsApp Dashboard')
        .setHtml(htmlTemplate)
        .setText(emailData.message || 'Mensagem do WhatsApp Dashboard')

      console.log('📤 Enviando email via MailerSend...')
      const response = await mailerSend.email.send(emailParams)
      
      console.log('✅ Email enviado com sucesso via MailerSend!')
      console.log(`📧 Response:`, response)

      return {
        success: true,
        messageId: response.body?.message_id || 'mailersend-' + Date.now(),
        provider: 'mailersend'
      }

    } catch (error: unknown) {
      console.error('❌ Erro detalhado no envio de email via MailerSend:', error)
      
      let errorMessage = 'Erro desconhecido no envio de email'
      let errorCode = 'UNKNOWN'
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        if (error.message.includes('API key')) {
          errorMessage = 'Erro de autenticação MailerSend. Verifique sua API key.'
          errorCode = 'AUTH_ERROR'
          console.log('\n🔧 SOLUÇÃO PARA ERRO DE AUTENTICAÇÃO:')
          console.log('1. Acesse: https://app.mailersend.com/settings/tokens')
          console.log('2. Crie uma nova API key ou verifique a existente')
          console.log('3. Adicione ao arquivo .env: MAILERSEND_API_TOKEN=sua_api_key')
          console.log('4. Verifique o domínio configurado no MailerSend')
        } else if (error.message.includes('domain')) {
          errorMessage = 'Domínio não verificado no MailerSend. Verifique a configuração do domínio.'
          errorCode = 'DOMAIN_ERROR'
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Limite de envio atingido. Tente novamente mais tarde.'
          errorCode = 'RATE_LIMIT'
        }
      }

      return {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        code: errorCode,
        provider: 'mailersend'
      }
    }
  }

  // Gerar template HTML personalizado
  static generateEmailTemplate(emailData: EmailData): string {
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
                    🚀 ${emailData.from_name || FROM_NAME}
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
                
                ${emailData.reset_token ? `
                <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
                    <h3 style="color: #856404; margin: 0 0 15px 0;">🔑 Redefinir Senha</h3>
                    <p style="color: #666; margin: 15px 0;">
                        Clique no botão abaixo para redefinir sua senha:
                    </p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${emailData.reset_token}" 
                       style="display: inline-block; background-color: #ffc107; color: #212529; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0;">
                        Redefinir Senha
                    </a>
                    <p style="color: #666; margin: 15px 0 0 0; font-size: 14px;">
                        Este link expira em 1 hora.
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
                    © ${emailData.year || new Date().getFullYear()} ${emailData.from_name || FROM_NAME}. Todos os direitos reservados.
                </p>
            </div>
        </div>
    </body>
    </html>
    `
  }

  // Método de compatibilidade com o EmailService antigo
  static async sendEmailViaSMTP(emailData: EmailData): Promise<EmailResponse> {
    console.log('🔄 Redirecionando para MailerSend (compatibilidade SMTP)...')
    return this.sendEmailViaMailerSend(emailData)
  }

  // Enviar email de verificação
  static async sendVerificationEmail(userData: { name: string; email: string; verificationCode: string }): Promise<EmailResponse> {
    try {
      console.log('🔐 Preparando email de verificação para:', userData.email)
      
      const emailData: EmailData = {
        to_email: userData.email,
        to_name: userData.name,
        from_name: FROM_NAME,
        subject: 'Código de Verificação - WhatsApp Dashboard',
        verification_code: userData.verificationCode,
        year: new Date().getFullYear().toString(),
        message: `Seu código de verificação é: ${userData.verificationCode}. Este código expira em 10 minutos.`,
      }

      const result = await this.sendEmailViaMailerSend(emailData)
      return result
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de verificação:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        provider: 'mailersend'
      }
    }
  }

  // Enviar email de boas-vindas
  static async sendWelcomeEmail(userData: { name: string; email: string }): Promise<EmailResponse> {
    try {
      const emailData: EmailData = {
        to_email: userData.email,
        to_name: userData.name,
        from_name: FROM_NAME,
        subject: 'Bem-vindo ao WhatsApp Dashboard!',
        message: `Olá ${userData.name}!\n\nSua conta foi criada com sucesso. Agora você pode fazer login e começar a usar o WhatsApp Dashboard.\n\nSe você não criou esta conta, por favor ignore este email.\n\nAtenciosamente,\nEquipe WhatsApp Dashboard`,
        year: new Date().getFullYear().toString()
      }

      const result = await this.sendEmailViaMailerSend(emailData)
      return result
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de boas-vindas:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        provider: 'mailersend'
      }
    }
  }

  // Enviar email de redefinição de senha
  static async sendPasswordResetEmail(userData: { name: string; email: string; resetToken: string }): Promise<EmailResponse> {
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${userData.resetToken}`

      const emailData: EmailData = {
        to_email: userData.email,
        to_name: userData.name,
        from_name: FROM_NAME,
        subject: 'Redefinir Senha - WhatsApp Dashboard',
        reset_token: userData.resetToken,
        message: `Olá ${userData.name}!\n\nVocê solicitou a redefinição de sua senha.\n\nClique no link abaixo para redefinir sua senha:\n${resetUrl}\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta redefinição, por favor ignore este email.\n\nAtenciosamente,\nEquipe WhatsApp Dashboard`,
        year: new Date().getFullYear().toString()
      }

      const result = await this.sendEmailViaMailerSend(emailData)
      return result
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de reset de senha:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        provider: 'mailersend'
      }
    }
  }

  // Enviar email de notificação
  static async sendNotificationEmail(userData: { name: string; email: string; title: string; content: string }): Promise<EmailResponse> {
    try {
      const emailData: EmailData = {
        to_email: userData.email,
        to_name: userData.name,
        from_name: FROM_NAME,
        subject: userData.title,
        message: userData.content,
        year: new Date().getFullYear().toString()
      }

      const result = await this.sendEmailViaMailerSend(emailData)
      return result
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de notificação:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        provider: 'mailersend'
      }
    }
  }

  // Métodos de compatibilidade com versões anteriores
  static async initialize() {
    console.log('✅ MailerSend EmailService inicializado')
    this.validateConfig()
  }

  static validateEmailJSConfig() {
    console.log('⚠️ EmailJS foi removido, usando MailerSend')
    this.validateConfig()
  }

  static validateSMTPConfig() {
    console.log('⚠️ SMTP foi removido, usando MailerSend')
    this.validateConfig()
  }
}
