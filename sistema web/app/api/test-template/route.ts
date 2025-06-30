import { NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"

export async function GET() {
  try {
    console.log('🧪 Testando Template EmailJS Aprimorado...')
    
    // Verificar variáveis de ambiente
    const config = {
      service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      public_key: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    }
    
    console.log('📋 Configuração atual:', config)
    
    if (!config.service_id || !config.template_id || !config.public_key) {
      return NextResponse.json({
        error: "❌ Variáveis de ambiente não configuradas",
        config: config,
        required: [
          "NEXT_PUBLIC_EMAILJS_SERVICE_ID",
          "NEXT_PUBLIC_EMAILJS_TEMPLATE_ID", 
          "NEXT_PUBLIC_EMAILJS_PUBLIC_KEY"
        ],
        instructions: "Configure essas variáveis no arquivo .env"
      }, { status: 400 })
    }
    
    // Teste de envio com template aprimorado
    console.log('📧 Enviando email de teste com template aprimorado...')
    const result = await EmailService.sendVerificationEmail({
      name: 'Teste Template',
      email: 'lucasmagistav@gmail.com', // Usando o email do .env
      verificationCode: '123456'
    })
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "✅ Email enviado com sucesso!",
        config: config,
        emailResult: result,
        instructions: [
          "1. Verifique sua caixa de entrada em lucasmagistav@gmail.com",
          "2. Se não encontrar, verifique a pasta de spam",
          "3. O email deve ter o design aprimorado com fundo escuro",
          "4. O código deve aparecer destacado: 123456"
        ]
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        config: config,
        troubleshooting: [
          "1. Verifique se o Service ID está correto no EmailJS",
          "2. Confirme se o Template ID existe e está ativo",
          "3. Verifique se a Public Key está correta",
          "4. Teste com outro email para descartar problemas de spam"
        ]
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name } = body
    
    if (!email || !name) {
      return NextResponse.json({
        error: "Email e nome são obrigatórios"
      }, { status: 400 })
    }
    
    console.log(`📧 Enviando email de teste para: ${email}`)
    const result = await EmailService.sendVerificationEmail({
      name: name,
      email: email,
      verificationCode: Math.floor(100000 + Math.random() * 900000).toString()
    })
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 
        `✅ Email enviado para ${email}! Verifique sua caixa de entrada.` : 
        `❌ Erro: ${result.error}`,
      result: result
    })
    
  } catch (error) {
    console.error('❌ Erro no teste POST:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
