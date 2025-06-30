// scripts/view-users.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function viewUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('📊 Contas Criadas no Sistema:')
    console.log('━'.repeat(60))
    
    if (users.length === 0) {
      console.log('❌ Nenhuma conta encontrada')
      return
    }

    users.forEach((user, index) => {
      console.log(`\n👤 Usuário ${index + 1}:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Nome: ${user.name || 'Não informado'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Verificado: ${user.emailVerified ? '✅' : '❌'}`)
      console.log(`   Papel: ${user.role}`)
      console.log(`   Ativo: ${user.isActive ? '✅' : '❌'}`)
      console.log(`   Criado em: ${user.createdAt.toLocaleString('pt-BR')}`)
      console.log(`   Último login: ${user.lastLogin?.toLocaleString('pt-BR') || 'Nunca'}`)
    })

    console.log(`\n📈 Total de contas: ${users.length}`)
    
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error)
  } finally {
    await prisma.$disconnect()
  }
}

viewUsers()
