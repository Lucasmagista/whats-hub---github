import emailjs from '@emailjs/browser'
import nodemailer from 'nodemailer'

// Verificar se estamos no ambiente do navegador
const isBrowser = typeof window !== 'undefined'

// Configurações do EmailJS (para client-side)
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || ''
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || ''
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''

// Configurações do Nodemailer (para server-side)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER
const FROM_NAME = process.env.FROM_NAME || 'WhatsApp Dashboard'

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

export class EmailService {
  static async initialize() {
    if (EMAILJS_PUBLIC_KEY && isBrowser) {
      emailjs.init(EMAILJS_PUBLIC_KEY)
    }
  }
  // Criar transporter do Nodemailer para server-side
  private static createTransporter() {
    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('❌ Configurações SMTP não encontradas. Configure SMTP_USER e SMTP_PASS no arquivo .env')
    }

    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true para 465, false para outras portas
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  }

  // Validar configuração do EmailJS (client-side)
  static validateEmailJSConfig() {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      throw new Error('❌ EmailJS não configurado. Verifique as variáveis de ambiente.')
    }
  }

  // Validar configuração SMTP (server-side)
  static validateSMTPConfig() {
    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('❌ SMTP não configurado. Verifique as variáveis SMTP_USER e SMTP_PASS no arquivo .env')
    }
  }  // Função para enviar email via Nodemailer (server-side)
  static async sendEmailViaSMTP(emailData: EmailData) {
    this.validateSMTPConfig()
    
    console.log('📧 Enviando email via SMTP...')
    console.log(`📧 Para: ${emailData.to_email}`)
    console.log(`📧 Assunto: ${emailData.subject}`)

    try {
      const transporter = this.createTransporter()

      // Testar conexão antes de enviar
      console.log('🔐 Verificando autenticação SMTP...')
      await transporter.verify()
      console.log('✅ Autenticação SMTP bem-sucedida!')

      // Template HTML para email de verificação
      const htmlTemplate = `
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

      const mailOptions = {
        from: `${emailData.from_name || FROM_NAME} <${FROM_EMAIL}>`,
        to: emailData.to_email,
        subject: emailData.subject || 'WhatsApp Dashboard',
        html: htmlTemplate,
      }

      console.log('📤 Enviando email via SMTP...')
      const result = await transporter.sendMail(mailOptions)
      
      console.log('✅ Email enviado com sucesso via SMTP!')
      console.log(`📧 Message ID: ${result.messageId}`)

      return {
        success: true,
        messageId: result.messageId,
        provider: 'smtp'
      }

    } catch (error: any) {
      console.error('❌ Erro detalhado no envio de email via SMTP:', error)
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro desconhecido no envio de email'
      
      if (error.code === 'EAUTH') {
        errorMessage = 'Erro de autenticação SMTP. Verifique suas credenciais Gmail.'
        console.log('\n🔧 SOLUÇÃO PARA ERRO DE AUTENTICAÇÃO:')
        console.log('1. Acesse: https://myaccount.google.com/security')
        console.log('2. Ative "Verificação em duas etapas" se não estiver ativo')
        console.log('3. Vá em "Senhas de app" > "Selecionar app" > "Outro"')
        console.log('4. Digite: "WhatsApp Dashboard"')
        console.log('5. Copie a senha de 16 caracteres SEM ESPAÇOS')
        console.log('6. Cole no arquivo .env na variável SMTP_PASS')
        console.log('7. Exemplo: SMTP_PASS=abcdwfghijklmnop')
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Servidor SMTP não encontrado. Verifique a configuração SMTP_HOST.'
      } else if (error.code === 'ECONNECTION') {
        errorMessage = 'Não foi possível conectar ao servidor SMTP. Verifique sua conexão.'
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Timeout na conexão SMTP. Tente novamente.'
      }

      return {
        success: false,
        error: errorMessage,
        details: error.message,
        code: error.code
      }
    }
  }
  static async sendWelcomeEmail(userData: { name: string; email: string }) {
    try {
      const emailData: EmailData = {
        to_email: userData.email,
        to_name: userData.name,
        from_name: FROM_NAME,
        subject: 'Bem-vindo ao WhatsApp Dashboard!',
        message: `Olá ${userData.name}!\n\nSua conta foi criada com sucesso. Agora você pode fazer login e começar a usar o WhatsApp Dashboard.\n\nSe você não criou esta conta, por favor ignore este email.\n\nAtenciosamente,\nEquipe WhatsApp Dashboard`,
        year: new Date().getFullYear().toString()
      }

      let result
      if (isBrowser) {
        // Client-side - usar EmailJS
        this.validateEmailJSConfig()
        await this.initialize()
        result = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          emailData
        )
        return { success: true, messageId: result.text }
      } else {
        // Server-side - usar SMTP
        result = await this.sendEmailViaSMTP(emailData)
        return { success: true, messageId: result.messageId }
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email de boas-vindas:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }  static async sendVerificationEmail(userData: { name: string; email: string; verificationCode: string }) {
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

      // Sempre usar SMTP server-side para maior confiabilidade
      const result = await this.sendEmailViaSMTP(emailData)
      return { success: true, messageId: result.messageId }
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de verificação:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }
  static async sendPasswordResetEmail(userData: { name: string; email: string; resetToken: string }) {
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

      if (isBrowser) {
        // Client-side - usar EmailJS
        this.validateEmailJSConfig()
        await this.initialize()
        const result = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          emailData
        )
        return { success: true, messageId: result.text }
      } else {
        // Server-side - usar SMTP
        const result = await this.sendEmailViaSMTP(emailData)
        return { success: true, messageId: result.messageId }
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email de reset de senha:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }

  static async sendNotificationEmail(userData: { name: string; email: string; title: string; content: string }) {
    try {
      const emailData: EmailData = {
        to_email: userData.email,
        to_name: userData.name,
        from_name: FROM_NAME,
        subject: userData.title,
        message: userData.content,
        year: new Date().getFullYear().toString()
      }

      if (isBrowser) {
        // Client-side - usar EmailJS
        this.validateEmailJSConfig()
        await this.initialize()
        const result = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          emailData
        )
        return { success: true, messageId: result.text }
      } else {
        // Server-side - usar SMTP
        const result = await this.sendEmailViaSMTP(emailData)
        return { success: true, messageId: result.messageId }
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email de notificação:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }
}
