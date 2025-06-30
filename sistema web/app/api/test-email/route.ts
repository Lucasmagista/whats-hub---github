import { NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"

export async function GET() {
  try {
    console.log('🧪 Testando EmailJS...')
    
    // Verificar variáveis de ambiente
    const config = {
      service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      public_key: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    }
    
    console.log('📋 Configuração atual:', config)
    
    if (!config.service_id || !config.template_id || !config.public_key) {
      return NextResponse.json({
        error: "Variáveis de ambiente não configuradas",
        config: config
      }, { status: 400 })
    }
    
    // Teste de envio
    const result = await EmailService.sendVerificationEmail({
      name: 'Teste Usuario',
      email: 'lucasmagistav@gmail.com',
      verificationCode: '123456'
    })
    
    return NextResponse.json({
      success: true,
      config: config,
      emailResult: result
    })
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
