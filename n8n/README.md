# 🏠 Inaugura Lar - Bot WhatsApp Avançado

Sistema completo de atendimento automatizado para WhatsApp baseado no fluxo do bot-zap.js, implementado com WhatsApp Web.js + n8n.

## 🌟 Funcionalidades Implementadas

### 🔄 **Fluxos de Conversa Completos**
- ✅ **Saudação Inicial**: Coleta nome completo com validação
- ✅ **Menu Principal**: 3 opções de atendimento com mapeamento inteligente de palavras-chave
- ✅ **Problema com Produto**: Fluxo completo em 4 etapas (NF → Foto Produto → Foto Embalagem → Foto Etiquetas → Comentários)
- ✅ **Sistema de Fila**: Atendimento humano com priorização e múltiplos atendentes
- ✅ **Chat Humano Ativo**: Interação em tempo real com atendentes especializados
- ✅ **Pesquisa de Satisfação**: Avaliação 1-5 + feedback textual

### 👥 **Sistema de Atendimento Humano Avançado**
- 🎯 **Fila Inteligente**: Priorização (Urgente/Alta/Normal) e tempo estimado
- 👨‍💼 **Múltiplos Atendentes**: Suporte simultâneo com distribuição automática
- 📊 **Dashboard em Tempo Real**: Monitoramento de fila, chats ativos e métricas
- 🔄 **Auto-Assign**: Distribuição automática baseada em disponibilidade
- 📈 **Analytics Completo**: Métricas de tempo de espera, satisfação e performance
- 🔌 **APIs REST**: Controle total via endpoints especializados

### 🧠 **Recursos Avançados**
- 🔄 **Persistência de Estado**: Estados salvos em arquivo JSON, sobrevivem a reinicializações
- ⏰ **Timeout de Sessão**: Expiração automática após 30 minutos de inatividade
- 🎯 **Mapeamento Inteligente**: Reconhece variações de palavras-chave (\"problema\", \"defeito\", \"1\" → mesmo fluxo)
- 📷 **Suporte a Mídia**: Upload e processamento de fotos
- 🛡️ **Validação Robusta**: Verificação de entrada em cada etapa
- 📊 **Logs Detalhados**: Rastreamento completo de interações
- 🔧 **API Completa**: Endpoints para gerenciamento e monitoramento

## 📦 Arquivos do Projeto

```
📁 whatsapp-webjs-n8n/
├── 🚀 whatsapp-webjs-server-advanced.js    # Servidor principal avançado
├── 📋 template-inaugura-lar-bot.json       # Template n8n otimizado
├── 📦 package.json                         # Dependências npm
├── 🐳 Dockerfile                           # Container Docker
├── 🐳 docker-compose.yml                   # Orquestração completa
├── ⚙️ .env.example                         # Configurações
├── 🚫 .gitignore                           # Git ignore
├── 📖 README-INAUGURA-LAR.md               # Este arquivo
└── 💾 install.sh                           # Script instalação
```

## 🚀 Instalação Rápida

### Método 1: Instalação Local

1. **Pré-requisitos:**
   ```bash
   node -v  # Versão 16+ necessária
   npm -v   # npm instalado
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Configurar variáveis:**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env conforme necessário
   ```

4. **Iniciar servidor:**
   ```bash
   # Servidor avançado com persistência
   node whatsapp-webjs-server-advanced.js
   
   # OU servidor simples
   node whatsapp-webjs-server.js
   ```

5. **Escanear QR Code:**
   - Acesse: http://localhost:3001/qr
   - Escaneie com WhatsApp

### Método 2: Docker

```bash
# Iniciar com Docker Compose (inclui n8n)
docker-compose up -d

# OU apenas o servidor WhatsApp
docker build -t inaugura-lar-bot .
docker run -p 3001:3001 inaugura-lar-bot
```

## 🔧 Configuração n8n

1. **Acessar n8n:**
   - URL: http://localhost:5678
   - Usuário: admin
   - Senha: password123

2. **Importar template:**
   - Importar: `template-inaugura-lar-bot.json`
   - Ativar workflow

3. **Configurar webhook:**
   - URL: `http://localhost:3001` (servidor WhatsApp)
   - Webhook n8n: `http://localhost:5678/webhook/whatsapp-messages`

## 📋 Mapeamento de Palavras-chave

### 🛠️ Problema com Produto
- `\"1\"`, `\"problema\"`, `\"defeito\"`, `\"quebrado\"`, `\"suporte\"`

### 🧾 Nota Fiscal  
- `\"2\"`, `\"nota fiscal\"`, `\"nota\"`, `\"fatura\"`, `\"nf\"`

### 👨‍💼 Atendente Humano
- `\"3\"`, `\"atendente\"`, `\"humano\"`, `\"pessoa\"`, `\"falar\"`

### 🔄 Comandos Especiais
- `\"oi\"` → Reinicia conversa
- `\"não\"` → Sem comentários adicionais

## 🔄 Fluxo Completo de Conversa

```
1. 👋 SAUDAÇÃO
   ├─ Solicita nome completo
   ├─ Valida formato (min. 2 palavras)
   └─ Avança para menu

2. 📋 MENU PRINCIPAL
   ├─ 🛠️ Problema com produto
   ├─ 🧾 Nota Fiscal (em desenvolvimento)
   └─ 👨‍💼 Falar com atendente

3. 🛠️ PROBLEMA COM PRODUTO
   ├─ 📄 Solicita nota fiscal/pedido
   ├─ 📷 Solicita foto do produto
   ├─ 📦 Solicita foto da embalagem  
   ├─ 🏷️ Solicita foto das etiquetas
   ├─ 💬 Solicita comentários (opcional)
   └─ ✅ Finaliza e agenda pesquisa

4. 📊 PESQUISA DE SATISFAÇÃO
   ├─ ⭐ Avaliação 1-5
   ├─ 💬 Feedback textual
   └─ 🏁 Finaliza sessão
```

## 🖥️ Endpoints da API

### Status e Monitoramento
- `GET /` - Painel de controle web
- `GET /status` - Status do sistema + estatísticas
- `GET /qr` - QR Code para conectar WhatsApp

### Mensagens
- `POST /api/send-message` - Enviar mensagem de texto
- `POST /api/send-media` - Enviar mídia (foto, vídeo, doc)
- `POST /api/download-media` - Baixar mídia recebida

### Gerenciamento de Estado
- `GET /api/user-states` - Listar todos os estados
- `GET /api/user-states/:phone` - Estado específico do usuário
- `DELETE /api/user-states/:phone` - Remover estado do usuário
- `POST /api/reset-user/:phone` - Reiniciar sessão do usuário

### Informações de Chat
- `GET /api/chat/:chatId` - Detalhes do chat

## 🔌 APIs REST para Atendimento Humano

### 📍 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/support-queue` | Status detalhado da fila e estatísticas |
| POST | `/api/support-queue/register-attendant` | Registrar novo atendente |
| PUT | `/api/support-queue/attendant-status` | Atualizar status do atendente |
| POST | `/api/support-queue/start-chat` | Iniciar atendimento |
| POST | `/api/support-queue/end-chat` | Finalizar atendimento |
| POST | `/api/support-queue/send-message` | Enviar mensagem do atendente |
| POST | `/api/support-queue/transfer` | Transferir chat entre atendentes |
| GET | `/api/support-queue/chat-history/:chatId` | Histórico do chat |
| POST | `/api/support-queue/auto-assign` | Auto-atribuição de atendente |

### 🎯 Exemplos de Uso

#### Registrar Atendente
```bash
curl -X POST http://localhost:3001/api/support-queue/register-attendant \
  -H "Content-Type: application/json" \
  -d '{
    "attendantId": "maria001",
    "attendantName": "Maria Santos",
    "skills": ["vendas", "suporte técnico"]
  }'
```

#### Iniciar Atendimento
```bash
curl -X POST http://localhost:3001/api/support-queue/start-chat \
  -H "Content-Type: application/json" \
  -d '{
    "attendantId": "maria001",
    "attendantName": "Maria Santos"
  }'
```

#### Enviar Mensagem
```bash
curl -X POST http://localhost:3001/api/support-queue/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "5511999999999@c.us",
    "message": "Olá! Como posso ajudá-lo?",
    "attendantId": "maria001"
  }'
```

#### Status da Fila
```bash
curl http://localhost:3001/api/support-queue | jq
```

## 🖥️ Dashboards de Monitoramento

### 📊 Dashboard Principal
**URL**: `http://localhost:3001/dashboard`

**Recursos:**
- 📈 Status do WhatsApp (conectado/desconectado)
- 👥 Contadores de usuários ativos/totais
- 📨 Log de mensagens em tempo real
- 🔄 Atualização automática a cada 10 segundos

### 👨‍💼 Dashboard de Atendimento
**URL**: `http://localhost:3001/support-dashboard`

**Recursos:**
- 🔴 **Fila de Atendimento**: Lista completa com posições, prioridades e tempo de espera
- 🟢 **Chats Ativos**: Atendimentos em andamento com duração e atendente responsável
- 👥 **Gestão de Atendentes**: Status da equipe (disponível/ocupado/ausente)
- 📊 **Métricas em Tempo Real**: 
  - Tamanho da fila
  - Número de chats ativos
  - Atendentes disponíveis
  - Tempo médio de espera
  - Satisfação do cliente
- 🎯 **Estatísticas do Dia**:
  - Total de atendimentos
  - Tempo médio de resolução
  - Taxa de abandono
  - Distribuição por atendente

### 📱 Responsividade
Ambos dashboards são otimizados para:
- 💻 **Desktop**: Experiência completa com todas as funcionalidades
- 📱 **Mobile**: Interface adaptada para smartphones
- 🖥️ **TV/Monitor**: Modo painel para monitoramento em telas grandes

## 📈 Métricas e KPIs

### 🎯 Indicadores Principais

1. **Tempo de Primeira Resposta (FRT)**
   - Meta: < 2 minutos
   - Calculado: Tempo entre entrada na fila e primeiro atendimento

2. **Tempo Médio de Atendimento (AHT)**
   - Meta: 15-20 minutos
   - Calculado: Duração total do chat ativo

3. **Satisfação do Cliente (CSAT)**
   - Meta: > 4.0/5.0
   - Calculado: Média das avaliações recebidas

4. **Taxa de Abandono da Fila**
   - Meta: < 10%
   - Calculado: % de clientes que saem antes do atendimento

5. **Utilização de Atendentes**
   - Meta: 70-85%
   - Calculado: % do tempo ocupado vs. disponível

### 📊 Exemplo de Resposta da API de Status

```json
{
  "queueLength": 3,
  "activeChats": 5,
  "availableAttendants": 2,
  "totalAttendants": 4,
  "averageWaitTimeMinutes": 8,
  "statistics": {
    "totalChatsToday": 45,
    "averageWaitTimeMinutes": 12,
    "averageChatDurationMinutes": 15,
    "customerSatisfaction": 4.2,
    "uptime": 480
  },
  "queue": [
    {
      "position": 1,
      "chatId": "5511999999999@c.us",
      "userName": "Maria Silva",
      "priority": "high",
      "topic": "suporte técnico",
      "waitingTimeMinutes": 15,
      "estimatedDuration": 10,
      "timestamp": "2024-01-15T14:30:00Z"
    }
  ],
  "activeChatsDetails": [
    {
      "chatId": "5511888888888@c.us",
      "attendantId": "agent001",
      "attendantName": "João Santos",
      "userName": "Pedro Lima",
      "durationMinutes": 8,
      "messageCount": 12
    }
  ],
  "attendants": [
    {
      "id": "agent001",
      "name": "João Santos",
      "status": "available",
      "skills": ["vendas", "suporte"],
      "activeChats": 2,
      "maxChats": 3,
      "totalChatsToday": 8,
      "onlineTimeMinutes": 240
    }
  ]
}
```

## 💾 Estrutura de Estado do Usuário

```json
{
  \"step\": \"current_step\",
  \"data\": {
    \"name\": \"Nome Completo do Usuário\",
    \"firstName\": \"Primeiro\",
    \"invoice\": \"NF12345 ou path/para/imagem\",
    \"productPhoto\": \"path/para/foto_produto\",
    \"boxPhoto\": \"path/para/foto_embalagem\", 
    \"labelPhoto\": \"path/para/foto_etiquetas\",
    \"comments\": \"Comentários do usuário\",
    \"rating\": 5,
    \"feedback\": \"Feedback da pesquisa\"
  },
  \"lastInteraction\": 1703123456789,
  \"sessionId\": \"session_5511999998888_1703123456789\"
}
```

## 🔧 Passos Disponíveis

- `awaiting_name` - Aguardando nome do usuário
- `awaiting_main_option` - Aguardando seleção do menu
- `product_issue_nf` - Aguardando nota fiscal
- `product_issue_photo` - Aguardando foto do produto
- `product_issue_box_photo` - Aguardando foto da embalagem
- `product_issue_label_photo` - Aguardando foto das etiquetas
- `product_issue_comments` - Aguardando comentários
- `awaiting_satisfaction_rating` - Aguardando avaliação
- `awaiting_satisfaction_feedback` - Aguardando feedback
- `transfer_to_human` - Transferido para atendente
- `conversation_completed` - Conversa finalizada

## 📊 Logs e Monitoramento

### Logs Gerados Automaticamente
```bash
[2025-06-20T12:00:00.000Z] Usuário 5511999998888 - Passo: awaiting_name
[TICKET CRIADO] 5511999998888: { \"name\": \"João Silva\", \"invoice\": \"NF123\", ... }
[PESQUISA CONCLUÍDA] 5511999998888: { \"rating\": 5, \"feedback\": \"Excelente!\" }
```

### Estatísticas Disponíveis
- Total de usuários cadastrados
- Usuários ativos (últimas 30 min)
- Distribuição por etapa do fluxo
- Taxa de conclusão de pesquisas
- Tempo médio de atendimento

## ⚙️ Configurações Avançadas

### Variáveis de Ambiente (.env)
```bash
# Servidor
PORT=3001

# n8n Integration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/whatsapp-messages

# Timeouts e Limites
SESSION_TIMEOUT_MS=1800000  # 30 minutos
HTTP_TIMEOUT=10000          # 10 segundos

# Arquivos
STATE_FILE_PATH=./userStates.json
UPLOAD_FOLDER=./uploads/

# Puppeteer
PUPPETEER_HEADLESS=true
PUPPETEER_NO_SANDBOX=true
```

### Personalização de Mensagens
As mensagens estão organizadas no arquivo do servidor e podem ser facilmente editadas:

```javascript
const messages = {
    welcome: '🏠 *Inaugura Lar - Atendimento Especializado* 🏠\\n\\n...',
    invalidName: '⚠️ Por favor, informe seu *nome completo*...',
    // ... outras mensagens
};
```

## 🛡️ Segurança e Boas Práticas

### Produção
- ✅ Use HTTPS para webhooks
- ✅ Configure autenticação para APIs
- ✅ Monitore logs de erro
- ✅ Backup regular dos estados
- ✅ Rate limiting para APIs

### Desenvolvimento
- ✅ Use ambiente isolado
- ✅ Teste com número dedicado
- ✅ Monitore uso de recursos
- ✅ Valide entrada de usuários

## 🔄 Backup e Recuperação

### Backup Automático
```bash
# Estados dos usuários são salvos automaticamente a cada 5 minutos
# Arquivo: userStates.json

# Backup manual
cp userStates.json userStates.backup.json
```

### Recuperação
```bash
# Restaurar estados
cp userStates.backup.json userStates.json
# Reiniciar servidor
```

## 📈 Métricas e Analytics

### Dados Coletados
- ✅ Tempo de resposta por etapa
- ✅ Taxa de abandono por fluxo  
- ✅ Avaliações de satisfação
- ✅ Tipos de problemas mais comuns
- ✅ Horários de maior demanda

### Relatórios Disponíveis
- Dashboard em tempo real (GET /)
- Exportação de dados (API)
- Logs estruturados (JSON)

## 🆘 Solução de Problemas

### Problemas Comuns

1. **QR Code não aparece**
   - Verificar se o servidor está rodando
   - Acessar http://localhost:3001/qr
   - Verificar logs do console

2. **WhatsApp desconecta**
   - Verificar estabilidade da internet
   - Reiniciar o servidor
   - Reescanear QR Code

3. **Estados não persistem**
   - Verificar permissões do arquivo userStates.json
   - Verificar espaço em disco
   - Verificar logs de erro

4. **n8n não recebe mensagens**
   - Verificar URL do webhook
   - Verificar se n8n está rodando
   - Testar conexão manual

### Logs de Debug
```bash
# Ativar logs detalhados
DEBUG=* node whatsapp-webjs-server-advanced.js

# Verificar estado específico
curl http://localhost:3001/api/user-states/5511999998888

# Testar envio de mensagem
curl -X POST http://localhost:3001/api/send-message \\
  -H \"Content-Type: application/json\" \\
  -d '{\"chatId\":\"5511999998888@c.us\",\"message\":\"Teste\"}'
```

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature
3. Teste completamente
4. Envie um Pull Request

## 📄 Licença

MIT License - Use livremente para seus projetos.

---

**🏠 Inaugura Lar Bot v2.0** - Sistema profissional de atendimento WhatsApp com inteligência de fluxo e persistência de estado.

Para suporte técnico ou dúvidas, consulte os logs do sistema ou abra uma issue no repositório.
