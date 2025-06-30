import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { z } from "zod"
import { EmailService } from "@/lib/email-service"

// Função para gerar código de 6 dígitos
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validationResult = registerSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Dados inválidos", 
          details: validationResult.error.errors 
        }, 
        { status: 400 }
      )
    }

    const { name, email, password } = validationResult.data

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" }, 
        { status: 409 }
      )
    }

    // Hash da senha
    const hashedPassword = await hash(password, 12)    // Criar usuário (inicialmente inativo até verificação)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: "AGENT", // Default role
        isActive: false, // Inativo até verificar email
        emailVerified: null, // Não verificado ainda
      },
    })

    // Criar conta local (para armazenar senha)
    await prisma.account.create({
      data: {
        userId: user.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: user.id,
        // Store hashed password in refresh_token field temporarily
        refresh_token: hashedPassword,
      },
    })

    // Gerar código de verificação
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    // Salvar o token de verificação
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationCode,
        expires: expiresAt,
      },
    })    // Log do evento de segurança
    await prisma.securityEvent.create({
      data: {
        type: "USER_REGISTRATION",
        severity: "INFO",
        description: `Novo usuário registrado: ${email}`,
        userId: user.id,
        metadata: { 
          registrationMethod: "email",
          userAgent: request.headers.get("user-agent") || "unknown"
        },
      },
    })    // Enviar email de verificação (ao invés de boas-vindas)
    try {
      console.log('📧 Tentando enviar email de verificação para:', email)
      const emailResult = await EmailService.sendVerificationEmail({ 
        name, 
        email, 
        verificationCode 
      })
      
      if (!emailResult.success) {
        console.error('❌ Falha no envio do email:', emailResult.error)
        // Continue sem falhar - deixar o usuário tentar reenviar depois
      } else {
        console.log('✅ Email de verificação enviado com sucesso!')
      }
    } catch (emailError) {
      console.error("❌ Erro ao enviar email de verificação:", emailError)
      // Não falhar o cadastro se o email falhar - o usuário pode reenviar
    }

    return NextResponse.json({
      success: true,
      message: "Conta criada! Verifique seu email e digite o código de 6 dígitos para ativar sua conta.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        needsVerification: true,
      },
    })

  } catch (error) {
    console.error("Erro no registro:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}
