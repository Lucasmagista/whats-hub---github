# Autenticação e Autorização

Este documento descreve como funciona o sistema de autenticação e autorização no WhatsApp Bot Dashboard.

## Visão Geral

O sistema utiliza **NextAuth.js** para autenticação com suporte a:
- Login com Google OAuth
- Login com GitHub OAuth
- Sistema de roles e permissões
- Proteção de rotas via middleware
- Sessões persistentes

## Configuração do NextAuth.js

### Arquivo de Configuração

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (token?.sub && session?.user) {
        session.user.id = token.sub

        // Buscar role e permissões do usuário
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, permissions: true, isActive: true },
        })

        if (user) {
          session.user.role = user.role
          session.user.permissions = user.permissions
          session.user.isActive = user.isActive
        }
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id

        // Atualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })
      }
      return token
    },
  },
}
```

### API Route

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

## Provedores de Autenticação

### Configuração OAuth

#### Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Vá para "APIs & Services" > "Credentials"
4. Crie credenciais OAuth 2.0
5. Configure as URLs autorizadas:

```
Authorized JavaScript origins:
http://localhost:3000
https://seu-dominio.com

Authorized redirect URIs:
http://localhost:3000/api/auth/callback/google
https://seu-dominio.com/api/auth/callback/google
```

#### GitHub OAuth

1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Preencha os campos:

```
Application name: WhatsApp Dashboard
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

### Variáveis de Ambiente

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-super-segura

# Google OAuth
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# GitHub OAuth
GITHUB_ID=seu-github-client-id
GITHUB_SECRET=seu-github-client-secret
```

## Sistema de Roles

### Definição de Roles

```typescript
// types/auth.ts
export enum UserRole {
  ADMIN = 'ADMIN',      // Acesso total
  MANAGER = 'MANAGER',  // Gerência de equipe
  AGENT = 'AGENT',      // Atendimento
  VIEWER = 'VIEWER',    // Apenas visualização
}
```

### Modelo de Usuário

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
```

## Sistema de Permissões

### Definição de Permissões

```typescript
// lib/permissions.ts
export const PERMISSIONS = {
  // Usuários
  'users.view': 'Visualizar usuários',
  'users.create': 'Criar usuários',
  'users.edit': 'Editar usuários',
  'users.delete': 'Excluir usuários',
  
  // Clientes
  'customers.view': 'Visualizar clientes',
  'customers.create': 'Criar clientes',
  'customers.edit': 'Editar clientes',
  'customers.delete': 'Excluir clientes',
  
  // Tickets
  'tickets.view': 'Visualizar tickets',
  'tickets.create': 'Criar tickets',
  'tickets.edit': 'Editar tickets',
  'tickets.assign': 'Atribuir tickets',
  'tickets.close': 'Fechar tickets',
  
  // Mensagens
  'messages.view': 'Visualizar mensagens',
  'messages.send': 'Enviar mensagens',
  'messages.delete': 'Excluir mensagens',
  
  // Bot
  'bot.control': 'Controlar bot',
  'bot.config': 'Configurar bot',
  
  // Analytics
  'analytics.view': 'Visualizar analytics',
  'analytics.export': 'Exportar relatórios',
  
  // Sistema
  'system.logs': 'Visualizar logs',
  'system.config': 'Configurar sistema',
} as const

export type Permission = keyof typeof PERMISSIONS

// Permissões por role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.keys(PERMISSIONS) as Permission[],
  [UserRole.MANAGER]: [
    'users.view',
    'customers.view', 'customers.create', 'customers.edit',
    'tickets.view', 'tickets.create', 'tickets.edit', 'tickets.assign', 'tickets.close',
    'messages.view', 'messages.send',
    'analytics.view', 'analytics.export',
    'system.logs',
  ],
  [UserRole.AGENT]: [
    'customers.view', 'customers.create', 'customers.edit',
    'tickets.view', 'tickets.create', 'tickets.edit',
    'messages.view', 'messages.send',
  ],
  [UserRole.VIEWER]: [
    'customers.view',
    'tickets.view',
    'messages.view',
    'analytics.view',
  ],
}
```

### Utilitários de Permissão

```typescript
// lib/permissions.ts
export function hasPermission(
  userPermissions: string | string[],
  requiredPermission: Permission
): boolean {
  const permissions = Array.isArray(userPermissions) 
    ? userPermissions 
    : userPermissions.split(',').filter(Boolean)
    
  return permissions.includes(requiredPermission)
}

export function hasAnyPermission(
  userPermissions: string | string[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some(permission => 
    hasPermission(userPermissions, permission)
  )
}

export function hasAllPermissions(
  userPermissions: string | string[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every(permission => 
    hasPermission(userPermissions, permission)
  )
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}
```

## Componente de Proteção

### RoleGuard

```typescript
// components/advanced/role-guard.tsx
import { useSession } from 'next-auth/react'
import { UserRole } from '@/types/auth'
import { hasPermission, hasAnyPermission } from '@/lib/permissions'

interface RoleGuardProps {
  children: ReactNode
  roles?: UserRole[]
  permissions?: string[]
  requireAll?: boolean
  fallback?: ReactNode
}

export function RoleGuard({ 
  children, 
  roles, 
  permissions, 
  requireAll = false, 
  fallback = null 
}: RoleGuardProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return fallback
  }

  const userRole = session.user.role as UserRole
  const userPermissions = session.user.permissions || ''

  // Verificar roles
  if (roles && !roles.includes(userRole)) {
    return fallback
  }

  // Verificar permissões
  if (permissions) {
    const hasRequiredPermissions = requireAll
      ? permissions.every(permission => hasPermission(userPermissions, permission))
      : permissions.some(permission => hasPermission(userPermissions, permission))

    if (!hasRequiredPermissions) {
      return fallback
    }
  }

  return <>{children}</>
}
```

### Uso do RoleGuard

```tsx
// Proteger por role
<RoleGuard roles={['ADMIN', 'MANAGER']}>
  <AdminPanel />
</RoleGuard>

// Proteger por permissão
<RoleGuard permissions={['users.create']}>
  <CreateUserButton />
</RoleGuard>

// Proteger com fallback
<RoleGuard 
  permissions={['tickets.edit']} 
  fallback={<div>Sem permissão para editar</div>}
>
  <EditTicketForm />
</RoleGuard>
```

## Middleware de Proteção

### Configuração do Middleware

```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Lógica adicional de middleware aqui
    console.log('Token:', req.nextauth.token)
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"]
}
```

### Middleware Customizado com Roles

```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Rotas que requerem ADMIN
    if (pathname.startsWith('/dashboard/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Rotas que requerem MANAGER ou ADMIN
    if (pathname.startsWith('/dashboard/management')) {
      if (!['ADMIN', 'MANAGER'].includes(token?.role)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)
```

## Hooks de Autenticação

### useAuth

```typescript
// hooks/useAuth.ts
import { useSession } from 'next-auth/react'
import { UserRole } from '@/types/auth'
import { hasPermission } from '@/lib/permissions'

export function useAuth() {
  const { data: session, status } = useSession()

  const user = session?.user
  const isAuthenticated = !!user
  const isLoading = status === 'loading'

  const hasRole = (role: UserRole) => {
    return user?.role === role
  }

  const hasPermissionCheck = (permission: string) => {
    return hasPermission(user?.permissions || '', permission)
  }

  const isAdmin = hasRole(UserRole.ADMIN)
  const isManager = hasRole(UserRole.MANAGER) || isAdmin
  const isAgent = hasRole(UserRole.AGENT) || isManager
  const isViewer = hasRole(UserRole.VIEWER) || isAgent

  return {
    user,
    isAuthenticated,
    isLoading,
    hasRole,
    hasPermission: hasPermissionCheck,
    isAdmin,
    isManager,
    isAgent,
    isViewer,
  }
}
```

### Uso do Hook

```tsx
import { useAuth } from '@/hooks/useAuth'

export function MyComponent() {
  const { user, isAuthenticated, hasPermission, isAdmin } = useAuth()

  if (!isAuthenticated) {
    return <div>Faça login para continuar</div>
  }

  return (
    <div>
      <h1>Olá, {user?.name}</h1>
      
      {isAdmin && (
        <AdminPanel />
      )}
      
      {hasPermission('tickets.create') && (
        <CreateTicketButton />
      )}
    </div>
  )
}
```

## Proteção de API Routes

### Utilitário de Autenticação

```typescript
// lib/auth-api.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function getAuthenticatedUser(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error('Não autenticado')
  }
  
  return session.user
}

export async function requirePermission(
  req: NextRequest, 
  permission: string
) {
  const user = await getAuthenticatedUser(req)
  
  if (!hasPermission(user.permissions || '', permission)) {
    throw new Error('Sem permissão')
  }
  
  return user
}

export async function requireRole(
  req: NextRequest, 
  roles: UserRole[]
) {
  const user = await getAuthenticatedUser(req)
  
  if (!roles.includes(user.role as UserRole)) {
    throw new Error('Role insuficiente')
  }
  
  return user
}
```

### Uso em API Routes

```typescript
// app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth-api'

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, 'customers.view')
    
    // Lógica da API
    const customers = await prisma.customer.findMany()
    
    return NextResponse.json({ customers })
  } catch (error) {
    if (error.message === 'Não autenticado') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (error.message === 'Sem permissão') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission(request, 'customers.create')
    
    const body = await request.json()
    const customer = await prisma.customer.create({ data: body })
    
    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    // Handle errors
  }
}
```

## Componentes de Login

### LoginForm

```tsx
// components/login-form.tsx
import { signIn, getSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const handleGitHubLogin = () => {
    signIn('github', { callbackUrl: '/dashboard' })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleGoogleLogin}
          variant="outline" 
          className="w-full"
        >
          Continuar com Google
        </Button>
        
        <Button 
          onClick={handleGitHubLogin}
          variant="outline" 
          className="w-full"
        >
          Continuar com GitHub
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Logout

```tsx
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <Button onClick={handleLogout} variant="outline">
      Sair
    </Button>
  )
}
```

## Gerenciamento de Sessão

### Verificar Sessão

```tsx
import { useSession } from 'next-auth/react'

export function SessionCheck() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Carregando...</div>
  }

  if (status === 'unauthenticated') {
    return <div>Não autenticado</div>
  }

  return (
    <div>
      <p>Logado como: {session?.user?.email}</p>
      <p>Role: {session?.user?.role}</p>
    </div>
  )
}
```

### Refresh de Sessão

```tsx
import { useSession } from 'next-auth/react'

export function useSessionRefresh() {
  const { data: session, update } = useSession()

  const refreshSession = async () => {
    await update()
  }

  return { session, refreshSession }
}
```

## Segurança

### Configurações Importantes

1. **NEXTAUTH_SECRET**: Chave secreta forte (32+ caracteres)
2. **HTTPS**: Obrigatório em produção
3. **Same-Site Cookies**: Configurar corretamente
4. **CSRF Protection**: Habilitado por padrão

### Headers de Segurança

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

## Troubleshooting

### Problemas Comuns

**Erro: "No secret provided"**
- Definir `NEXTAUTH_SECRET` no `.env.local`

**Erro: "OAuth configuration error"**
- Verificar credenciais OAuth
- Confirmar URLs de callback

**Erro: "Session expired"**
- Verificar configuração de sessão
- Implementar refresh de token

**Erro: "Unauthorized"**
- Verificar middleware
- Confirmar proteção de rotas

### Debug de Autenticação

```typescript
// Habilitar logs detalhados
export const authOptions = {
  debug: process.env.NODE_ENV === 'development',
  // ... resto da configuração
}
```

### Logs de Sessão

```typescript
// components/debug-session.tsx
import { useSession } from 'next-auth/react'

export function DebugSession() {
  const { data: session } = useSession()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <pre className="bg-gray-100 p-4 rounded text-xs">
      {JSON.stringify(session, null, 2)}
    </pre>
  )
}
```
