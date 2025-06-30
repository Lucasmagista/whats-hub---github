import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { EmailService } from "@/lib/email-service"
import { z } from "zod"

const resendCodeSchema = z.object({
  email: z.string().email("Email inválido"),
})

// Função para gerar código de 6 dígitos
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validationResult = resendCodeSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Dados inválidos", 
          details: validationResult.error.errors 
        }, 
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" }, 
        { status: 404 }
      )
    }

    // Verificar se o email já foi verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Este email já foi verificado" }, 
        { status: 400 }
      )
    }

    // Remover tokens anteriores para este email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    // Gerar novo código de verificação
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    // Salvar o token no banco
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationCode,
        expires: expiresAt,
      },
    })

    // Enviar email de verificação
    try {
      await EmailService.sendVerificationEmail({ 
        name: user.name || "Usuário", 
        email: user.email, 
        verificationCode 
      })
    } catch (emailError) {
      console.error("Erro ao enviar email de verificação:", emailError)
      return NextResponse.json(
        { error: "Erro ao enviar email de verificação" }, 
        { status: 500 }
      )
    }

    // Log do evento de segurança
    await prisma.securityEvent.create({
      data: {
        type: "VERIFICATION_CODE_RESENT",
        severity: "INFO",
        description: `Código de verificação reenviado para: ${email}`,
        userId: user.id,
        metadata: { 
          method: "email_resend",
          userAgent: request.headers.get("user-agent") || "unknown"
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Código de verificação reenviado! Verifique seu email.",
    })

  } catch (error) {
    console.error("Erro ao reenviar código:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}
