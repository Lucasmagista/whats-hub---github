# Banco de Dados - Documentação

Este documento descreve a estrutura do banco de dados, modelos, relacionamentos e como trabalhar com o Prisma ORM no projeto.

## Visão Geral

O projeto utiliza **Prisma** como ORM com suporte para:
- **SQLite** (desenvolvimento)
- **PostgreSQL** (produção)

## Schema Principal

### Modelos de Autenticação

#### User
Representa os usuários do sistema (administradores, agentes, etc.)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(AGENT)
  permissions   String    @default("")
  isActive      Boolean   @default(true)
  lastLogin     DateTime?
  preferences   Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserRole {
  ADMIN
  MANAGER
  AGENT
  VIEWER
}
```

#### Account & Session
Modelos do NextAuth.js para gerenciar autenticação.

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Modelos de Negócio

#### Customer
Representa os clientes/contatos do WhatsApp.

```prisma
model Customer {
  id              String            @id @default(cuid())
  name            String
  phone           String            @unique
  email           String?
  avatar          String?
  status          CustomerStatus    @default(ACTIVE)
  tags            String            @default("")
  notes           String?
  lastMessage     DateTime?
  totalMessages   Int               @default(0)
  satisfaction    Float?
  language        String            @default("pt-BR")
  timezone        String            @default("America/Sao_Paulo")
  metadata        Json?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

enum CustomerStatus {
  ACTIVE
  INACTIVE
  BLOCKED
}
```

#### Ticket
Sistema de tickets de suporte.

```prisma
model Ticket {
  id              String         @id @default(cuid())
  title           String
  description     String
  status          TicketStatus   @default(OPEN)
  priority        TicketPriority @default(MEDIUM)
  customerId      String
  assignedTo      String?
  teamId          String?
  createdBy       String
  slaDeadline     DateTime?
  resolvedAt      DateTime?
  closedAt        DateTime?
  escalatedAt     DateTime?
  escalationLevel Int            @default(0)
  satisfaction    Float?
  tags            String         @default("")
  metadata        Json?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_CUSTOMER
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

#### Message
Mensagens do WhatsApp.

```prisma
model Message {
  id          String        @id @default(cuid())
  customerId  String
  content     String
  type        MessageType   @default(TEXT)
  direction   Direction
  status      MessageStatus @default(SENT)
  timestamp   DateTime      @default(now())
  metadata    Json?
  sentiment   Float?
  language    String?
  isEncrypted Boolean       @default(false)
  threadId    String?
}

enum MessageType {
  TEXT
  IMAGE
  AUDIO
  VIDEO
  DOCUMENT
  LOCATION
  CONTACT
}

enum Direction {
  INBOUND
  OUTBOUND
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
  FAILED
}
```

### Modelos de Email Marketing

#### EmailTemplate
Templates para campanhas de email.

```prisma
model EmailTemplate {
  id          String   @id @default(cuid())
  name        String
  subject     String
  content     String
  variables   String   @default("")
  isActive    Boolean  @default(true)
  version     Int      @default(1)
  category    String?
  tags        String   @default("")
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### EmailCampaign
Campanhas de email marketing.

```prisma
model EmailCampaign {
  id           String            @id @default(cuid())
  name         String
  description  String?
  templateId   String?
  status       CampaignStatus    @default(DRAFT)
  scheduledFor DateTime?
  sentAt       DateTime?
  createdBy    String
  totalSent    Int               @default(0)
  totalOpened  Int               @default(0)
  totalClicked Int               @default(0)
  metadata     Json?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  CANCELLED
}
```

### Modelos de Sistema

#### Log
Logs do sistema para auditoria e debugging.

```prisma
model Log {
  id        String   @id @default(cuid())
  level     LogLevel
  message   String
  details   Json?
  source    String?
  userId    String?
  sessionId String?
  ipAddress String?
  userAgent String?
  timestamp DateTime @default(now())

  @@index([level, timestamp])
  @@index([source, timestamp])
}

enum LogLevel {
  DEBUG
  INFO
  WARNING
  ERROR
}
```

#### BotConfig
Configurações do bot WhatsApp.

```prisma
model BotConfig {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  category  String?
  isSecret  Boolean  @default(false)
  updatedAt DateTime @updatedAt
}
```

## Relacionamentos

### Principais Relacionamentos

1. **User → Tickets**: Um usuário pode ter muitos tickets atribuídos
2. **Customer → Messages**: Um cliente pode ter muitas mensagens
3. **Customer → Tickets**: Um cliente pode ter muitos tickets
4. **EmailTemplate → EmailCampaign**: Um template pode ser usado em muitas campanhas
5. **User → EmailCampaign**: Um usuário pode criar muitas campanhas

### Diagrama de Relacionamentos

```
User (1) ←→ (N) Ticket
User (1) ←→ (N) EmailCampaign
Customer (1) ←→ (N) Message
Customer (1) ←→ (N) Ticket
EmailTemplate (1) ←→ (N) EmailCampaign
```

## Comandos Prisma

### Desenvolvimento

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar e aplicar migração
npx prisma migrate dev --name nome-da-migracao

# Reset do banco (desenvolvimento)
npx prisma migrate reset

# Visualizar banco de dados
npx prisma studio

# Sincronizar schema sem migração (desenvolvimento)
npx prisma db push
```

### Produção

```bash
# Aplicar migrações em produção
npx prisma migrate deploy

# Gerar cliente para produção
npx prisma generate
```

## Queries Comuns

### Clientes

```typescript
// Buscar clientes ativos com paginação
const customers = await prisma.customer.findMany({
  where: {
    status: 'ACTIVE'
  },
  orderBy: {
    createdAt: 'desc'
  },
  skip: (page - 1) * limit,
  take: limit,
})

// Buscar cliente com suas mensagens
const customerWithMessages = await prisma.customer.findUnique({
  where: { id: customerId },
  include: {
    messages: {
      orderBy: { timestamp: 'desc' },
      take: 50
    }
  }
})

// Contar clientes por status
const customerStats = await prisma.customer.groupBy({
  by: ['status'],
  _count: {
    id: true
  }
})
```

### Tickets

```typescript
// Tickets em aberto por prioridade
const openTickets = await prisma.ticket.findMany({
  where: {
    status: 'OPEN'
  },
  orderBy: {
    priority: 'desc',
    createdAt: 'asc'
  },
  include: {
    customer: {
      select: {
        name: true,
        phone: true
      }
    },
    assignee: {
      select: {
        name: true,
        email: true
      }
    }
  }
})

// Tickets por usuário e período
const ticketsByUser = await prisma.ticket.groupBy({
  by: ['assignedTo'],
  where: {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  },
  _count: {
    id: true
  },
  _avg: {
    satisfaction: true
  }
})
```

### Mensagens

```typescript
// Mensagens por período
const messageStats = await prisma.message.groupBy({
  by: ['direction', 'type'],
  where: {
    timestamp: {
      gte: startDate,
      lte: endDate
    }
  },
  _count: {
    id: true
  }
})

// Últimas mensagens por cliente
const recentMessages = await prisma.message.findMany({
  distinct: ['customerId'],
  orderBy: {
    timestamp: 'desc'
  },
  include: {
    customer: {
      select: {
        name: true,
        phone: true
      }
    }
  }
})
```

### Analytics

```typescript
// Métricas do dashboard
const dashboardMetrics = await prisma.$transaction([
  prisma.customer.count({ where: { status: 'ACTIVE' } }),
  prisma.ticket.count({ where: { status: 'OPEN' } }),
  prisma.message.count({
    where: {
      timestamp: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24h
      }
    }
  }),
  prisma.ticket.aggregate({
    _avg: {
      satisfaction: true
    },
    where: {
      satisfaction: {
        not: null
      }
    }
  })
])
```

## Migrações

### Criando uma Migração

```bash
# Modificar o schema.prisma
# Depois executar:
npx prisma migrate dev --name adicionar-campo-user-avatar
```

### Exemplo de Migração SQL

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'AGENT',
    "permissions" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "preferences" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

## Seeds

### Arquivo de Seed

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Criar usuário admin
  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@example.com',
      role: 'ADMIN',
      permissions: 'all',
      isActive: true,
    },
  })

  // Criar clientes de exemplo
  await prisma.customer.createMany({
    data: [
      {
        name: 'João Silva',
        phone: '+5511999999999',
        email: 'joao@example.com',
        status: 'ACTIVE',
      },
      {
        name: 'Maria Santos',
        phone: '+5511888888888',
        email: 'maria@example.com',
        status: 'ACTIVE',
      },
    ],
  })

  // Criar configurações do bot
  await prisma.botConfig.createMany({
    data: [
      {
        key: 'welcome_message',
        value: 'Olá! Como posso ajudá-lo?',
        category: 'messages',
      },
      {
        key: 'business_hours',
        value: '{"start": "09:00", "end": "18:00"}',
        category: 'schedule',
      },
    ],
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Executar Seeds

```bash
npx prisma db seed
```

## Backup e Restore

### PostgreSQL

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### SQLite

```bash
# Backup
cp dev.db backup.db

# Restore
cp backup.db dev.db
```

## Performance

### Índices Importantes

```prisma
model Customer {
  // ... campos
  @@index([status, createdAt])
  @@index([phone])
}

model Message {
  // ... campos
  @@index([customerId, timestamp])
  @@index([direction, type])
}

model Ticket {
  // ... campos
  @@index([status, priority])
  @@index([assignedTo, createdAt])
}
```

### Query Optimization

```typescript
// ✅ Bom - usar select para campos específicos
const customers = await prisma.customer.findMany({
  select: {
    id: true,
    name: true,
    phone: true,
    status: true,
  },
})

// ✅ Bom - usar include seletivamente
const ticket = await prisma.ticket.findUnique({
  where: { id },
  include: {
    customer: {
      select: {
        name: true,
        phone: true,
      },
    },
  },
})

// ❌ Evitar - buscar todos os campos
const allCustomers = await prisma.customer.findMany() // Pode ser lento
```

## Monitoramento

### Logging de Queries

```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
})
```

### Métricas Úteis

```typescript
// Tempo de resposta das queries
const startTime = Date.now()
const result = await prisma.customer.findMany()
const queryTime = Date.now() - startTime
console.log(`Query executada em ${queryTime}ms`)

// Contagem de conexões ativas
const connections = await prisma.$queryRaw`
  SELECT count(*) as active_connections 
  FROM pg_stat_activity 
  WHERE state = 'active';
`
```

## Troubleshooting

### Problemas Comuns

**Erro: "Prisma Client not found"**
```bash
npx prisma generate
```

**Erro: "Migration failed"**
```bash
npx prisma migrate reset
npx prisma migrate dev
```

**Erro: "Connection refused"**
- Verificar DATABASE_URL
- Verificar se o banco está rodando
- Verificar credenciais

**Erro: "Table doesn't exist"**
```bash
npx prisma migrate deploy
```

### Debug Mode

```bash
# Executar com logs detalhados
DEBUG=prisma:* npm run dev
```

## Referências

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
