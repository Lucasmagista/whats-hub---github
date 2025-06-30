# Componentes - Documentação

Este documento descreve todos os componentes disponíveis no projeto, suas props, uso e exemplos práticos.

## Estrutura de Componentes

```
components/
├── ui/                 # Componentes base (shadcn/ui)
├── dashboard/          # Componentes específicos do dashboard
├── advanced/           # Componentes avançados
├── forms/              # Componentes de formulário
└── providers/          # Provedores de contexto
```

## Componentes Base (UI)

### Button

Componente de botão personalizável com variantes e tamanhos.

```tsx
import { Button } from '@/components/ui/button'

// Uso básico
<Button>Clique aqui</Button>

// Com variantes
<Button variant="secondary">Secundário</Button>
<Button variant="destructive">Excluir</Button>
<Button variant="outline">Contorno</Button>
<Button variant="ghost">Fantasma</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="lg">Grande</Button>

// Estado carregando
<Button loading>Carregando...</Button>

// Desabilitado
<Button disabled>Desabilitado</Button>
```

**Props:**
- `variant`: "default" | "secondary" | "destructive" | "outline" | "ghost"
- `size`: "sm" | "md" | "lg"
- `loading`: boolean
- `disabled`: boolean

### Input

Campo de entrada de texto customizável.

```tsx
import { Input } from '@/components/ui/input'

// Uso básico
<Input placeholder="Digite seu nome" />

// Com label
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="seu@email.com" />
</div>

// Com erro
<Input error="Este campo é obrigatório" />

// Diferentes tipos
<Input type="password" placeholder="Senha" />
<Input type="number" placeholder="Idade" />
<Input type="tel" placeholder="Telefone" />
```

**Props:**
- `type`: "text" | "email" | "password" | "number" | "tel" | etc.
- `placeholder`: string
- `error`: string
- `disabled`: boolean

### Card

Container para agrupar conteúdo relacionado.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Conteúdo do card aqui.</p>
  </CardContent>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>
```

### Dialog

Modal/Dialog para exibir conteúdo sobreposto.

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmar ação</DialogTitle>
      <DialogDescription>
        Esta ação não pode ser desfeita.
      </DialogDescription>
    </DialogHeader>
    <div className="flex justify-end space-x-2">
      <Button variant="outline">Cancelar</Button>
      <Button variant="destructive">Confirmar</Button>
    </div>
  </DialogContent>
</Dialog>
```

### Table

Tabela responsiva para exibição de dados.

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>João Silva</TableCell>
      <TableCell>joao@example.com</TableCell>
      <TableCell>Ativo</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Badge

Componente para exibir etiquetas/status.

```tsx
import { Badge } from '@/components/ui/badge'

<Badge>Default</Badge>
<Badge variant="secondary">Secundário</Badge>
<Badge variant="destructive">Erro</Badge>
<Badge variant="outline">Contorno</Badge>
```

### Alert

Componente para exibir mensagens de alerta.

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Atenção!</AlertTitle>
  <AlertDescription>
    Verifique os dados antes de continuar.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertDescription>
    Erro ao processar a solicitação.
  </AlertDescription>
</Alert>
```

## Componentes do Dashboard

### StatsCard

Card para exibir estatísticas principais.

```tsx
import { StatsCard } from '@/components/dashboard/stats-card'
import { Users } from 'lucide-react'

<StatsCard
  title="Total de Clientes"
  value={1250}
  change="+12%"
  changeType="positive"
  icon={Users}
/>
```

**Props:**
- `title`: string - Título da métrica
- `value`: string | number - Valor principal
- `change`: string - Percentual de mudança
- `changeType`: "positive" | "negative" | "neutral"
- `icon`: LucideIcon - Ícone da métrica

### DashboardHeader

Cabeçalho do dashboard com navegação e perfil do usuário.

```tsx
import { DashboardHeader } from '@/components/dashboard/header'

<DashboardHeader />
```

### DashboardSidebar

Barra lateral com navegação principal.

```tsx
import { DashboardSidebar } from '@/components/dashboard/sidebar'

<DashboardSidebar />
```

## Componentes Avançados

### DataTable

Tabela avançada com paginação, filtros e ordenação.

```tsx
import { DataTable } from '@/components/advanced/data-table'
import { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("status") === "ACTIVE" ? "default" : "secondary"}>
        {row.getValue("status")}
      </Badge>
    ),
  },
]

<DataTable
  columns={columns}
  data={customers}
  searchKey="name"
  searchPlaceholder="Buscar clientes..."
/>
```

**Props:**
- `columns`: ColumnDef[] - Definição das colunas
- `data`: T[] - Dados da tabela
- `searchKey`: string - Campo para busca
- `searchPlaceholder`: string - Placeholder da busca

### RealTimeChart

Gráfico em tempo real para métricas.

```tsx
import { RealTimeChart } from '@/components/advanced/real-time-chart'

<RealTimeChart
  title="Mensagens por Minuto"
  metric="messages"
  color="#3b82f6"
  maxDataPoints={20}
  updateInterval={5000}
/>
```

**Props:**
- `title`: string - Título do gráfico
- `metric`: string - Métrica a ser exibida
- `color`: string - Cor do gráfico
- `maxDataPoints`: number - Máximo de pontos
- `updateInterval`: number - Intervalo de atualização (ms)

### NotificationCenter

Centro de notificações do sistema.

```tsx
import { NotificationCenter } from '@/components/advanced/notification-center'

<NotificationCenter />
```

### AuditTrail

Trilha de auditoria das ações do sistema.

```tsx
import { AuditTrail } from '@/components/advanced/audit-trail'

<AuditTrail />
```

### AdvancedAnalytics

Componente de analytics avançado com múltiplas métricas.

```tsx
import { AdvancedAnalytics } from '@/components/advanced/advanced-analytics'

<AdvancedAnalytics />
```

## Componentes de Formulário

### LoginForm

Formulário de login com validação.

```tsx
import { LoginForm } from '@/components/login-form'

<LoginForm />
```

### RegisterForm

Formulário de registro de usuário.

```tsx
import { RegisterForm } from '@/components/register-form'

<RegisterForm />
```

### ForgotPasswordForm

Formulário para recuperação de senha.

```tsx
import { ForgotPasswordForm } from '@/components/forgot-password-form'

<ForgotPasswordForm />
```

## Componentes de Formulário Customizados

### FormField

Wrapper para campos de formulário com validação.

```tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'

const form = useForm()

<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input placeholder="seu@email.com" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Select

Componente de seleção customizável.

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Selecione uma opção" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opção 1</SelectItem>
    <SelectItem value="option2">Opção 2</SelectItem>
    <SelectItem value="option3">Opção 3</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox

Componente de checkbox com label.

```tsx
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Aceito os termos e condições</Label>
</div>
```

### RadioGroup

Grupo de opções de seleção única.

```tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <Label htmlFor="option1">Opção 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="option2" />
    <Label htmlFor="option2">Opção 2</Label>
  </div>
</RadioGroup>
```

## Provedores de Contexto

### AuthProvider

Provedor de autenticação usando NextAuth.js.

```tsx
import { AuthProvider } from '@/components/providers/session-provider'

<AuthProvider>
  <App />
</AuthProvider>
```

### ThemeProvider

Provedor de tema (claro/escuro).

```tsx
import { ThemeProvider } from '@/components/theme-provider'

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <App />
</ThemeProvider>
```

## Componentes de Layout

### Container

Container responsivo para layout.

```tsx
<div className="container mx-auto px-4 py-8">
  <h1>Conteúdo da página</h1>
</div>
```

### Grid

Sistema de grid responsivo.

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Flex

Containers flexbox.

```tsx
<div className="flex items-center justify-between">
  <h2>Título</h2>
  <Button>Ação</Button>
</div>
```

## Componentes de Navegação

### Breadcrumb

Navegação hierárquica.

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Clientes</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Tabs

Navegação por abas.

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="reports">Relatórios</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    Conteúdo da visão geral
  </TabsContent>
  <TabsContent value="analytics">
    Conteúdo de analytics
  </TabsContent>
  <TabsContent value="reports">
    Conteúdo de relatórios
  </TabsContent>
</Tabs>
```

## Componentes de Feedback

### Toast

Notificações temporárias.

```tsx
import { useToast } from '@/components/ui/use-toast'

const { toast } = useToast()

// Uso
toast({
  title: "Sucesso!",
  description: "Operação realizada com sucesso.",
})

toast({
  variant: "destructive",
  title: "Erro!",
  description: "Ocorreu um erro ao processar a solicitação.",
})
```

### Loading

Indicadores de carregamento.

```tsx
import { Loader2 } from 'lucide-react'

// Spinner simples
<Loader2 className="h-4 w-4 animate-spin" />

// Com texto
<div className="flex items-center space-x-2">
  <Loader2 className="h-4 w-4 animate-spin" />
  <span>Carregando...</span>
</div>
```

### Skeleton

Placeholder para conteúdo carregando.

```tsx
import { Skeleton } from '@/components/ui/skeleton'

<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

## Componentes Customizados

### CustomerCard

Card para exibir informações do cliente.

```tsx
interface CustomerCardProps {
  customer: Customer
  onEdit?: (customer: Customer) => void
  onDelete?: (id: string) => void
}

<CustomerCard
  customer={customer}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### TicketStatus

Componente para exibir status do ticket.

```tsx
interface TicketStatusProps {
  status: TicketStatus
  priority: TicketPriority
}

<TicketStatus status="OPEN" priority="HIGH" />
```

### MessageBubble

Componente para exibir mensagens de chat.

```tsx
interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

<MessageBubble
  message={message}
  isOwn={message.direction === 'OUTBOUND'}
/>
```

## Hooks de Componentes

### useToast

Hook para exibir notificações.

```tsx
import { useToast } from '@/components/ui/use-toast'

const { toast } = useToast()

const handleSuccess = () => {
  toast({
    title: "Sucesso!",
    description: "Operação realizada com sucesso.",
  })
}
```

### useIsMobile

Hook para detectar dispositivos móveis.

```tsx
import { useIsMobile } from '@/components/ui/use-mobile'

const isMobile = useIsMobile()

return (
  <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
    {/* Conteúdo */}
  </div>
)
```

## Estilos e Temas

### Variáveis CSS

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 47.4% 11.2%;
  --radius: 0.5rem;
}
```

### Classes Utilitárias

```css
.container {
  @apply mx-auto px-4 sm:px-6 lg:px-8;
}

.card {
  @apply rounded-lg border bg-card text-card-foreground shadow-sm;
}

.button {
  @apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors;
}
```

## Exemplo de Uso Completo

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export function ExampleComponent() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Sucesso!",
        description: "Dados salvos com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Ocorreu um erro ao salvar os dados.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Exemplo de Formulário</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Digite seu nome" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="seu@email.com" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

## Melhores Práticas

1. **Composição**: Prefira composição sobre herança
2. **Props**: Use interfaces TypeScript para props
3. **Acessibilidade**: Sempre inclua labels e aria-labels
4. **Performance**: Use React.memo para componentes pesados
5. **Consistência**: Siga os padrões de design do projeto
6. **Reutilização**: Crie componentes genéricos e reutilizáveis
7. **Testes**: Escreva testes para componentes críticos
