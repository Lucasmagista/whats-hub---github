import { NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"

export async function GET() {
  try {
    console.log('🧪 Iniciando teste SMTP...')
    
    const result = await EmailService.sendEmailViaSMTP({
      to_email: process.env.SMTP_USER || '',
      to_name: 'Teste',
      subject: '🧪 Teste SMTP - WhatsApp Dashboard',
      message: 'Este é um email de teste para verificar se o SMTP está funcionando corretamente.',
      verification_code: '123456',
      from_name: 'WhatsApp Dashboard',
      year: new Date().getFullYear().toString()
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '✅ Email de teste enviado com sucesso!',
        details: {
          messageId: result.messageId,
          provider: result.provider,
          recipient: process.env.SMTP_USER
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        details: result.details,
        code: result.code
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Erro no teste SMTP:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno no teste SMTP',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({
        error: 'Email é obrigatório'
      }, { status: 400 })
    }

    console.log(`🧪 Testando SMTP para: ${email}`)
    
    const result = await EmailService.sendEmailViaSMTP({
      to_email: email,
      to_name: 'Usuário Teste',
      subject: '🧪 Teste SMTP Personalizado - WhatsApp Dashboard',
      message: 'Este é um teste personalizado do sistema de email SMTP.',
      verification_code: Math.floor(100000 + Math.random() * 900000).toString(),
      from_name: 'WhatsApp Dashboard',
      year: new Date().getFullYear().toString()
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `✅ Email de teste enviado para ${email}!`,
        details: {
          messageId: result.messageId,
          provider: result.provider
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        details: result.details
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Erro no teste SMTP personalizado:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno no teste SMTP',
      details: error.message
    }, { status: 500 })
  }
}
