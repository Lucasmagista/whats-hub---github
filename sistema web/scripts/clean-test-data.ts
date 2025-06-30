import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearTestData() {
  try {
    console.log('🧹 Limpando dados de teste...')
    
    // Limpar tokens de verificação expirados
    const expiredTokens = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })
    console.log(`🗑️ Removidos ${expiredTokens.count} tokens expirados`)
    
    // Limpar usuários não verificados há mais de 1 hora
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: null,
        isActive: false,
        createdAt: {
          lt: new Date(Date.now() - 60 * 60 * 1000) // 1 hora atrás
        }
      }
    })
    
    for (const user of unverifiedUsers) {
      // Remover accounts relacionadas
      await prisma.account.deleteMany({
        where: { userId: user.id }
      })
      
      // Remover tokens relacionados
      await prisma.verificationToken.deleteMany({
        where: { identifier: user.email }
      })
      
      // Remover usuário
      await prisma.user.delete({
        where: { id: user.id }
      })
      
      console.log(`🗑️ Removido usuário não verificado: ${user.email}`)
    }
    
    console.log('✅ Limpeza concluída!')
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearTestData()
