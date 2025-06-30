// scripts/test-smtp.js
const nodemailer = require('nodemailer')
require('dotenv').config()

async function testSMTP() {
  console.log('🔍 Testando configuração SMTP...\n')
  
  // Verificar variáveis de ambiente
  const requiredVars = ['SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL']
  const missing = requiredVars.filter(v => !process.env[v])
  
  if (missing.length > 0) {
    console.error('❌ Variáveis obrigatórias não configuradas:', missing.join(', '))
    return
  }
  
  console.log('📋 Configurações atuais:')
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`)
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`)
  console.log(`   SMTP_USER: ${process.env.SMTP_USER}`)
  console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '****' + process.env.SMTP_PASS.slice(-4) : 'NÃO CONFIGURADO'}`)
  console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL}\n`)
  
  try {
    // Criar transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // true para porta 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    
    console.log('🔐 Verificando autenticação SMTP...')
    
    // Verificar conexão
    await transporter.verify()
    console.log('✅ Conexão SMTP estabelecida com sucesso!')
    
    // Enviar email de teste
    console.log('📧 Enviando email de teste...')
    
    const testEmail = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: process.env.SMTP_USER, // Enviar para você mesmo
      subject: '✅ Teste SMTP - WhatsApp Dashboard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #25d366;">🎉 SMTP Configurado com Sucesso!</h2>
          <p>Parabéns! Seu servidor SMTP está funcionando corretamente.</p>
          <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Detalhes do Teste:</h3>
            <ul>
              <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
              <li><strong>Servidor:</strong> ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</li>
              <li><strong>Usuário:</strong> ${process.env.SMTP_USER}</li>
            </ul>
          </div>
          <p style="color: #666;">
            Agora você pode usar o sistema de cadastro com verificação por email!
          </p>
        </div>
      `
    }
    
    const result = await transporter.sendMail(testEmail)
    console.log('✅ Email de teste enviado com sucesso!')
    console.log(`📧 Message ID: ${result.messageId}`)
    console.log('\n🎯 Próximos passos:')
    console.log('   1. Verifique sua caixa de entrada em:', process.env.SMTP_USER)
    console.log('   2. Se recebeu o email, a configuração está perfeita!')
    console.log('   3. Agora teste o cadastro em: http://localhost:3000/register')
    
  } catch (error) {
    console.error('❌ Erro na configuração SMTP:')
    console.error('   Código:', error.code || 'UNKNOWN')
    console.error('   Mensagem:', error.message)
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Solução para erro de autenticação:')
      console.log('   1. Acesse: https://myaccount.google.com/security')
      console.log('   2. Verifique se "Verificação em duas etapas" está ATIVA')
      console.log('   3. Vá em "Senhas de app"')
      console.log('   4. Crie uma nova senha de app para "Outro aplicativo"')
      console.log('   5. Cole a senha de 16 caracteres SEM ESPAÇOS no arquivo .env')
      console.log('   6. Exemplo: SMTP_PASS=abcdwfghijklmnop')
    }
  }
}

testSMTP().catch(console.error)
