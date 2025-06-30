# Guia de Desenvolvimento

Este guia contém informações essenciais para desenvolvedores que desejam contribuir ou modificar o WhatsApp Bot Dashboard.

## Configuração do Ambiente de Desenvolvimento

### Ferramentas Recomendadas

- **VS Code** com as seguintes extensões:
  - TypeScript
  - Prisma
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Auto Rename Tag
  - Bracket Pair Colorizer

### Configuração do Editor

Crie um arquivo `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## Estrutura do Projeto

### Convenções de Nomenclatura

- **Componentes**: PascalCase (`MyComponent.tsx`)
- **Hooks**: camelCase começando com "use" (`useMyHook.ts`)
- **Utilitários**: camelCase (`myUtility.ts`)
- **Tipos**: PascalCase (`MyType.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`MY_CONSTANT`)

### Organização de Arquivos

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Grupo de rotas de autenticação
│   ├── dashboard/         # Rotas do dashboard
│   └── api/               # API Routes
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── dashboard/        # Componentes específicos
│   └── forms/            # Componentes de formulário
├── hooks/                # Custom hooks
├── lib/                  # Utilitários e configurações
├── types/                # Definições de tipos
└── styles/               # Estilos globais
```

## Stack Tecnológica

### Frontend
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Biblioteca de componentes
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de esquemas

### Backend
- **Next.js API Routes**: Backend serverless
- **Prisma**: ORM para banco de dados
- **NextAuth.js**: Autenticação
- **SQLite/PostgreSQL**: Banco de dados

### Ferramentas
- **ESLint**: Linting de código
- **Prettier**: Formatação de código
- **TypeScript**: Verificação de tipos

## Padrões de Código

### Componentes React

```tsx
// components/MyComponent.tsx
import { FC } from 'react'
import { cn } from '@/lib/utils'

interface MyComponentProps {
  title: string
  isActive?: boolean
  className?: string
  children?: React.ReactNode
}

export const MyComponent: FC<MyComponentProps> = ({
  title,
  isActive = false,
  className,
  children
}) => {
  return (
    <div className={cn('base-classes', isActive && 'active-classes', className)}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

### Custom Hooks

```tsx
// hooks/useMyData.ts
import { useState, useEffect } from 'react'

interface MyData {
  id: string
  name: string
}

export function useMyData(id: string) {
  const [data, setData] = useState<MyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/data/${id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { data, loading, error }
}
```

### API Routes

```tsx
// app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().regex(/^\+\d{10,15}$/, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const customers = await prisma.customer.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ customers })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCustomerSchema.parse(body)

    const customer = await prisma.customer.create({
      data: validatedData
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 422 }
      )
    }

    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Tipos TypeScript

```tsx
// types/customer.ts
export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  status: CustomerStatus
  tags: string
  notes?: string
  lastMessage?: Date
  totalMessages: number
  satisfaction?: number
  language: string
  timezone: string
  createdAt: Date
  updatedAt: Date
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}

export interface CreateCustomerData {
  name: string
  phone: string
  email?: string
  tags?: string
  notes?: string
}
```

## Banco de Dados

### Prisma Schema

Ao modificar o schema Prisma:

1. Faça as alterações no arquivo `prisma/schema.prisma`
2. Gere uma migração: `npx prisma migrate dev --name description`
3. Gere o cliente: `npx prisma generate`

### Exemplo de Migração

```prisma
// Adicionando um novo campo
model Customer {
  id          String   @id @default(cuid())
  name        String
  phone       String   @unique
  // Novo campo
  birthDate   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Estilização

### Tailwind CSS

Use classes utilitárias do Tailwind:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h3 className="text-lg font-semibold text-gray-900">Título</h3>
  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
    Ação
  </button>
</div>
```

### Componentes Personalizados

Use a função `cn` para combinar classes:

```tsx
import { cn } from '@/lib/utils'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
}
```

## Estado Global

### Zustand (Recomendado)

```tsx
// stores/useCustomerStore.ts
import { create } from 'zustand'
import { Customer } from '@/types/customer'

interface CustomerStore {
  customers: Customer[]
  selectedCustomer: Customer | null
  loading: boolean
  setCustomers: (customers: Customer[]) => void
  setSelectedCustomer: (customer: Customer | null) => void
  setLoading: (loading: boolean) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
  removeCustomer: (id: string) => void
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  loading: false,
  setCustomers: (customers) => set({ customers }),
  setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
  setLoading: (loading) => set({ loading }),
  addCustomer: (customer) =>
    set((state) => ({ customers: [...state.customers, customer] })),
  updateCustomer: (id, data) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),
  removeCustomer: (id) =>
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    })),
}))
```

## Formulários

### React Hook Form + Zod

```tsx
// components/forms/CustomerForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().regex(/^\+\d{10,15}$/, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
})

type CustomerFormData = z.infer<typeof customerSchema>

export function CustomerForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema)
  })

  const onSubmit = async (data: CustomerFormData) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error('Failed to create customer')
      
      // Handle success
    } catch (error) {
      // Handle error
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name">Nome</label>
        <input
          {...register('name')}
          className="w-full p-2 border rounded"
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
```

## Testes

### Configuração do Jest

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

### Exemplo de Teste

```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Performance

### Otimizações Recomendadas

1. **Lazy Loading de Componentes**:
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>
})
```

2. **Memoização**:
```tsx
import { memo, useMemo, useCallback } from 'react'

const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item))
  }, [data])

  const handleClick = useCallback((id) => {
    // Handle click
  }, [])

  return <div>{/* Component JSX */}</div>
})
```

3. **Otimização de Imagens**:
```tsx
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority={false}
  placeholder="blur"
/>
```

## Debugging

### Configuração do VS Code

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Ferramentas Úteis

- **React Developer Tools**: Extensão do Chrome/Firefox
- **Prisma Studio**: `npx prisma studio`
- **Next.js DevTools**: Informações de build e performance

## Contribuição

### Workflow Git

1. Crie uma branch a partir da `main`:
```bash
git checkout -b feature/nova-funcionalidade
```

2. Faça commits pequenos e descritivos:
```bash
git commit -m "feat: adiciona validação de email no form de cliente"
```

3. Push e abra um Pull Request:
```bash
git push origin feature/nova-funcionalidade
```

### Convenções de Commit

Use o padrão Conventional Commits:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

## Scripts Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia o servidor de produção
npm run lint         # Executa o linter
npm run type-check   # Verifica tipos TypeScript

# Banco de dados
npx prisma studio    # Interface visual do banco
npx prisma migrate dev # Aplica migrações
npx prisma generate  # Gera o cliente Prisma
npx prisma db push   # Sincroniza schema com DB (desenvolvimento)

# Utilitários
npm run clean        # Limpa arquivos de build
npm run analyze      # Analisa o bundle
```

## Recursos Adicionais

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [NextAuth.js Documentation](https://next-auth.js.org)
