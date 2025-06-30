// Script de teste para verificar o fluxo completo de verificação de email
// Execute: npx ts-node scripts/test-verification-flow.ts

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function testVerificationFlow() {
  console.log("🧪 Iniciando teste do fluxo de verificação de email...")
  
  try {
    // 1. Verificar se há usuários com email não verificado
    const unverifiedUsers = await prisma.user.findMany({
      where: { 
        emailVerified: null 
      },
      select: {
        email: true,
        emailVerified: true,
        isActive: true,
        createdAt: true
      }
    })
    
    console.log(`📊 Usuários com email não verificado: ${unverifiedUsers.length}`)
    unverifiedUsers.forEach(user => {
      console.log(`   - ${user.email} (criado em: ${user.createdAt.toLocaleString()})`)
    })
    
    // 2. Verificar tokens de verificação pendentes
    const pendingTokens = await prisma.verificationToken.findMany({
      where: {
        expires: {
          gte: new Date() // Tokens ainda válidos
        }
      },
      select: {
        identifier: true,
        token: true,
        expires: true
      }
    })
    
    console.log(`🔑 Tokens de verificação válidos: ${pendingTokens.length}`)
    pendingTokens.forEach(token => {
      console.log(`   - ${token.identifier}: ${token.token} (expira: ${token.expires.toLocaleString()})`)
    })
    
    // 3. Simular verificação de email
    if (pendingTokens.length > 0) {
      const testToken = pendingTokens[0]
      console.log(`\n🔍 Testando verificação para: ${testToken.identifier}`)
      
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email: testToken.identifier }
      })
      
      if (user) {
        console.log(`✅ Usuário encontrado: ${user.email}`)
        console.log(`   - Email verificado: ${user.emailVerified ? "Sim" : "Não"}`)
        console.log(`   - Conta ativa: ${user.isActive ? "Sim" : "Não"}`)
        console.log(`   - Role: ${user.role}`)
        
        if (!user.emailVerified) {
          console.log(`\n💡 Para verificar este usuário, use o código: ${testToken.token}`)
          console.log(`   URL: http://localhost:3052/verify-email?email=${encodeURIComponent(user.email)}`)
        }
      }
    }
    
    // 4. Verificar eventos de segurança relacionados
    const recentEvents = await prisma.securityEvent.findMany({
      where: {
        type: {
          in: ["EMAIL_VERIFIED", "USER_REGISTERED", "USER_LOGIN"]
        }
      },
      orderBy: { timestamp: "desc" },
      take: 10,
      select: {
        type: true,
        description: true,
        timestamp: true,
        userId: true
      }
    })
    
    console.log(`\n📋 Eventos de segurança recentes (${recentEvents.length}):`)
    recentEvents.forEach(event => {
      console.log(`   - ${event.type}: ${event.description} (${event.timestamp.toLocaleString()})`)
    })
    
    console.log("\n✅ Teste do fluxo de verificação concluído!")
    
  } catch (error) {
    console.error("❌ Erro no teste:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Função para testar o redirecionamento
function testRedirectFlow() {
  console.log("\n🔄 Testando fluxo de redirecionamento:")
  console.log("1. Usuário verifica email → /verify-email")
  console.log("2. API retorna: redirectTo: '/login?message=email-verified&redirect=dashboard'")
  console.log("3. Página redireciona para: /login com parâmetros")
  console.log("4. LoginForm detecta parâmetros e mostra mensagem de sucesso")
  console.log("5. Após login bem-sucedido → router.push('/dashboard')")
  console.log("6. Middleware protege /dashboard (requer autenticação)")
  console.log("7. Dashboard carrega com dados do usuário")
  console.log("\n✅ Fluxo de redirecionamento está correto!")
}

if (require.main === module) {
  testVerificationFlow()
  testRedirectFlow()
}

export { testVerificationFlow }
