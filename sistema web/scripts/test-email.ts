import { EmailService } from '../lib/email-service'

async function testEmailService() {
  try {
    console.log('🧪 Testando MailerSend EmailService...')
    
    // Teste 1: Verificar configuração
    console.log('1️⃣ Verificando configuração...')
    EmailService.validateConfig()
    console.log('✅ Configuração válida!')
    
    // Teste 2: Enviar email de teste
    console.log('2️⃣ Enviando email de verificação...')
    const result = await EmailService.sendVerificationEmail({
      name: 'Teste Usuario',
      email: 'lucasmagistav@gmail.com', // Use seu email real aqui
      verificationCode: '123456'
    })
    
    if (result.success) {
      console.log('✅ Email enviado com sucesso!')
      console.log('📧 Message ID:', result.messageId)
      console.log('🔧 Provider:', result.provider)
    } else {
      console.log('❌ Falha no envio:', result.error)
      console.log('📝 Detalhes:', result.details)
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testEmailService()
