import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const verifyEmailSchema = z.object({
  email: z.string().email("Email inválido"),
  code: z.string().min(6, "Código deve ter 6 dígitos").max(6, "Código deve ter 6 dígitos"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validationResult = verifyEmailSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Dados inválidos", 
          details: validationResult.error.errors 
        }, 
        { status: 400 }
      )
    }

    const { email, code } = validationResult.data

    // Buscar o token de verificação
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { 
        identifier: email,
        token: code,
        expires: {
          gte: new Date() // Token ainda válido
        }
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Código inválido ou expirado" }, 
        { status: 400 }
      )
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" }, 
        { status: 404 }
      )
    }

    // Verificar o email e ativar a conta
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        isActive: true
      }
    })

    // Remover o token usado
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: code
        }
      }
    })

    // Log do evento de segurança
    await prisma.securityEvent.create({
      data: {
        type: "EMAIL_VERIFIED",
        severity: "INFO",
        description: `Email verificado com sucesso: ${email}`,
        userId: user.id,
        metadata: { 
          verificationMethod: "email_code",
          userAgent: request.headers.get("user-agent") ?? "unknown"
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "✅ Email verificado com sucesso! Sua conta está ativa.",
      redirectTo: "/login?message=email-verified&redirect=dashboard"
    })

  } catch (error) {
    console.error("Erro na verificação de email:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}
