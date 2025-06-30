const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Verificar se já existe um usuário
    const existingUser = await prisma.user.findFirst()
    
    if (existingUser) {
      console.log('✅ Usuário já existe na base de dados:')
      console.log(`   - Email: ${existingUser.email}`)
      console.log(`   - Nome: ${existingUser.name}`)
      console.log(`   - Role: ${existingUser.role}`)
      console.log(`   - Email verificado: ${existingUser.emailVerified ? 'Sim' : 'Não'}`)
      console.log(`   - Ativo: ${existingUser.isActive ? 'Sim' : 'Não'}`)
      
      // Verificar se existe conta para este usuário
      const account = await prisma.account.findFirst({
        where: {
          userId: existingUser.id,
          provider: 'credentials'
        }
      })
      
      if (account) {
        console.log('✅ Conta de credenciais existe para este usuário')
      } else {
        console.log('❌ Não existe conta de credenciais para este usuário')
        console.log('   Criando conta de credenciais...')
        
        const hashedPassword = await bcrypt.hash('123456', 12)
        
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: existingUser.id,
            refresh_token: hashedPassword
          }
        })
        
        console.log('✅ Conta de credenciais criada com senha: 123456')
      }
      
      return
    }

    console.log('🔄 Criando usuário de teste...')
    
    // Hash da senha de teste
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: 'Admin Teste',
        email: 'admin@teste.com',
        role: 'ADMIN',
        emailVerified: new Date(),
        isActive: true,
      }
    })
    
    // Criar conta de credenciais
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: user.id,
        refresh_token: hashedPassword
      }
    })
    
    console.log('✅ Usuário de teste criado com sucesso!')
    console.log('   - Email: admin@teste.com')
    console.log('   - Senha: 123456')
    console.log('   - Role: ADMIN')
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
