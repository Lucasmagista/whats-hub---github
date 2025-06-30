# Documentação da API

Esta documentação descreve todas as rotas da API disponíveis no WhatsApp Bot Dashboard.

## Autenticação

Todas as rotas da API (exceto as de autenticação) requerem autenticação via NextAuth.js. O middleware automaticamente protege as rotas `/api/*` (exceto `/api/auth/*`).

## Base URL

```
http://localhost:3000/api
```

## Rotas de Autenticação

### NextAuth.js Routes

O projeto utiliza NextAuth.js para autenticação, que fornece as seguintes rotas automaticamente:

```
GET/POST /api/auth/signin      # Página de login
GET/POST /api/auth/signout     # Logout
GET/POST /api/auth/callback/*  # Callbacks OAuth
GET      /api/auth/session     # Sessão atual
GET      /api/auth/csrf        # CSRF token
GET      /api/auth/providers   # Provedores disponíveis
```

## Rotas do Bot

### GET /api/bot/status
Retorna o status atual do bot WhatsApp.

**Resposta:**
```json
{
  "isRunning": true,
  "isConnected": true,
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "lastActivity": "2024-01-15T10:30:00Z",
  "messagesCount": 1250,
  "uptime": 86400
}
```

### POST /api/bot/start
Inicia o bot WhatsApp.

**Resposta:**
```json
{
  "success": true,
  "message": "Bot iniciado com sucesso"
}
```

### POST /api/bot/stop
Para o bot WhatsApp.

**Resposta:**
```json
{
  "success": true,
  "message": "Bot parado com sucesso"
}
```

## Rotas de Logs

### GET /api/logs
Retorna os logs do sistema com paginação.

**Parâmetros Query:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 50)
- `level`: Filtro por nível (info, warning, error, success)
- `search`: Busca por texto no log

**Resposta:**
```json
{
  "logs": [
    {
      "id": "clx1234567890",
      "timestamp": "2024-01-15T10:30:00Z",
      "level": "info",
      "message": "Bot conectado com sucesso",
      "details": {
        "sessionId": "session_123",
        "userId": "user_456"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "totalPages": 25
  }
}
```

### DELETE /api/logs
Limpa todos os logs do sistema.

**Resposta:**
```json
{
  "success": true,
  "message": "Logs limpos com sucesso",
  "deletedCount": 1250
}
```

## Rotas de Clientes

### GET /api/customers
Lista todos os clientes com paginação e filtros.

**Parâmetros Query:**
- `page`: Número da página
- `limit`: Itens por página
- `search`: Busca por nome ou telefone
- `status`: Filtro por status (ACTIVE, INACTIVE, BLOCKED)
- `segment`: Filtro por segmento

**Resposta:**
```json
{
  "customers": [
    {
      "id": "clx1234567890",
      "name": "João Silva",
      "phone": "+5511999999999",
      "email": "joao@example.com",
      "status": "ACTIVE",
      "tags": "vip,cliente-premium",
      "lastMessage": "2024-01-15T10:30:00Z",
      "totalMessages": 45,
      "satisfaction": 4.5,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### POST /api/customers
Cria um novo cliente.

**Body:**
```json
{
  "name": "João Silva",
  "phone": "+5511999999999",
  "email": "joao@example.com",
  "tags": "vip,cliente-premium",
  "notes": "Cliente importante da empresa XYZ"
}
```

**Resposta:**
```json
{
  "success": true,
  "customer": {
    "id": "clx1234567890",
    "name": "João Silva",
    "phone": "+5511999999999",
    "email": "joao@example.com",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### GET /api/customers/[id]
Retorna detalhes de um cliente específico.

**Resposta:**
```json
{
  "id": "clx1234567890",
  "name": "João Silva",
  "phone": "+5511999999999",
  "email": "joao@example.com",
  "status": "ACTIVE",
  "tags": "vip,cliente-premium",
  "notes": "Cliente importante da empresa XYZ",
  "lastMessage": "2024-01-15T10:30:00Z",
  "totalMessages": 45,
  "satisfaction": 4.5,
  "language": "pt-BR",
  "timezone": "America/Sao_Paulo",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### PUT /api/customers/[id]
Atualiza um cliente existente.

**Body:**
```json
{
  "name": "João Silva Santos",
  "email": "joao.santos@example.com",
  "tags": "vip,cliente-premium,fidelizado",
  "notes": "Cliente VIP - empresa XYZ"
}
```

### DELETE /api/customers/[id]
Remove um cliente.

**Resposta:**
```json
{
  "success": true,
  "message": "Cliente removido com sucesso"
}
```

## Rotas de Tickets

### GET /api/tickets
Lista todos os tickets com filtros.

**Parâmetros Query:**
- `status`: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- `priority`: LOW, MEDIUM, HIGH, URGENT
- `assignedTo`: ID do usuário responsável

**Resposta:**
```json
{
  "tickets": [
    {
      "id": "clx1234567890",
      "title": "Problema com pedido",
      "description": "Cliente relatou problema no pedido #123",
      "status": "OPEN",
      "priority": "HIGH",
      "customerId": "customer_123",
      "assignedTo": "user_456",
      "createdAt": "2024-01-15T10:30:00Z",
      "customer": {
        "name": "João Silva",
        "phone": "+5511999999999"
      },
      "assignee": {
        "name": "Maria Operadora"
      }
    }
  ]
}
```

### POST /api/tickets
Cria um novo ticket.

**Body:**
```json
{
  "title": "Problema com produto",
  "description": "Descrição detalhada do problema",
  "priority": "HIGH",
  "customerId": "customer_123",
  "assignedTo": "user_456"
}
```

### GET /api/tickets/[id]
Retorna detalhes de um ticket específico.

### PUT /api/tickets/[id]
Atualiza um ticket existente.

### DELETE /api/tickets/[id]
Remove um ticket.

## Rotas de Mensagens

### GET /api/messages
Lista mensagens com filtros.

**Parâmetros Query:**
- `customerId`: ID do cliente
- `direction`: INBOUND, OUTBOUND
- `type`: TEXT, IMAGE, AUDIO, VIDEO, DOCUMENT

### POST /api/messages
Envia uma nova mensagem.

**Body:**
```json
{
  "customerId": "customer_123",
  "content": "Olá! Como posso ajudá-lo?",
  "type": "TEXT"
}
```

## Rotas de Templates de Email

### GET /api/email-templates
Lista todos os templates de email.

### POST /api/email-templates
Cria um novo template.

**Body:**
```json
{
  "name": "Boas-vindas",
  "subject": "Bem-vindo ao nosso serviço!",
  "content": "<h1>Olá {{name}}!</h1><p>Bem-vindo!</p>",
  "variables": "name,email",
  "category": "onboarding"
}
```

### GET /api/email-templates/[id]
Retorna um template específico.

### PUT /api/email-templates/[id]
Atualiza um template.

### DELETE /api/email-templates/[id]
Remove um template.

## Rotas de Campanhas

### GET /api/campaigns
Lista todas as campanhas de email.

### POST /api/campaigns
Cria uma nova campanha.

**Body:**
```json
{
  "name": "Campanha Janeiro 2024",
  "description": "Promoção de verão",
  "templateId": "template_123",
  "scheduledFor": "2024-01-20T09:00:00Z",
  "recipients": ["customer_1", "customer_2"]
}
```

## Rotas de Analytics

### GET /api/analytics/overview
Retorna métricas gerais do dashboard.

**Resposta:**
```json
{
  "totalCustomers": 1250,
  "activeCustomers": 890,
  "totalMessages": 15670,
  "avgResponseTime": 120,
  "satisfactionScore": 4.2,
  "churnRate": 0.05
}
```

### GET /api/analytics/messages
Estatísticas de mensagens por período.

**Parâmetros Query:**
- `startDate`: Data de início (ISO 8601)
- `endDate`: Data de fim (ISO 8601)
- `groupBy`: day, week, month

### GET /api/analytics/sentiment
Análise de sentimento das mensagens.

**Resposta:**
```json
{
  "positive": 65.5,
  "neutral": 25.0,
  "negative": 9.5,
  "trend": 2.3
}
```

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `422` - Dados inválidos
- `500` - Erro interno do servidor

## Tratamento de Erros

Todas as rotas retornam erros no formato:

```json
{
  "error": true,
  "message": "Descrição do erro",
  "details": {
    "field": "Campo específico com erro",
    "code": "VALIDATION_ERROR"
  }
}
```

## Rate Limiting

A API implementa rate limiting para prevenir abuso:
- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário autenticado

## WebSocket

Para logs em tempo real, conecte-se ao WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:3001/logs');
ws.onmessage = (event) => {
  const log = JSON.parse(event.data);
  console.log('Novo log:', log);
};
```

## Exemplos de Uso

### JavaScript/Fetch
```javascript
// Listar clientes
const response = await fetch('/api/customers', {
  headers: {
    'Authorization': `Bearer ${session.accessToken}`
  }
});
const data = await response.json();
```

### cURL
```bash
# Status do bot
curl -X GET http://localhost:3000/api/bot/status \
  -H "Cookie: next-auth.session-token=TOKEN"

# Criar cliente
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TOKEN" \
  -d '{"name":"João Silva","phone":"+5511999999999"}'
```
