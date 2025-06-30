import { NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"

export async function GET(request: NextRequest) {
  try {
    // Teste de configuração
    const testResult = await EmailService.sendVerificationEmail({
      name: "Teste",
      email: "teste@email.com",
      verificationCode: "123456"
    })

    return NextResponse.json({
      success: true,
      config: {
        service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? "✓ Configurado" : "❌ Não configurado",
        template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ? "✓ Configurado" : "❌ Não configurado", 
        public_key: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? "✓ Configurado" : "❌ Não configurado",
      },
      emailTest: testResult
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      config: {
        service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? "✓ Configurado" : "❌ Não configurado",
        template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ? "✓ Configurado" : "❌ Não configurado", 
        public_key: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? "✓ Configurado" : "❌ Não configurado",
      }
    })
  }
}
