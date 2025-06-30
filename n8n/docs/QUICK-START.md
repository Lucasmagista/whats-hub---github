# 🚀 Instalação Rápida - Sistema Completo

## Pré-requisitos
- Node.js 16+ 
- npm ou yarn

## Instalação Local

1. **Clone ou baixe os arquivos**
2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. **Inicie o servidor:**
   ```bash
   # Servidor completo com atendimento humano
   node whatsapp-webjs-server-complete.js
   
   # OU servidor básico
   npm start
   ```

5. **Acesse os recursos:**
   - 📱 **QR Code**: http://localhost:3001/qr
   - 🖥️ **Dashboard Geral**: http://localhost:3001/dashboard  
   - 👨‍💼 **Dashboard Atendimento**: http://localhost:3001/support-dashboard
   - 📊 **Status API**: http://localhost:3001/status

## Instalação com Docker

1. **Docker Compose (Recomendado):**
   ```bash
   docker-compose up -d
   ```

2. **Docker simples:**
   ```bash
   npm run docker-build
   npm run docker-run
   ```

## Configuração n8n

1. Acesse: http://localhost:5678
2. Importe os templates JSON
3. Configure o webhook URL

## ⚡ Teste Rápido do Sistema

### 1. Verificar Status
```bash
curl http://localhost:3001/status
```

### 2. Registrar Atendente
```bash
curl -X POST http://localhost:3001/api/support-queue/register-attendant \
  -H "Content-Type: application/json" \
  -d '{
    "attendantId": "teste001",
    "attendantName": "Atendente Teste",
    "skills": ["suporte"]
  }'
```

### 3. Verificar Fila
```bash
curl http://localhost:3001/api/support-queue
```

## 🎯 Funcionalidades Principais

### 🤖 Bot Automático
- Saudação e coleta de nome
- Menu de opções inteligente
- Fluxo de problemas com produto
- Pesquisa de satisfação

### 👥 Atendimento Humano
- Fila com priorização
- Dashboard de monitoramento
- APIs REST completas
- Métricas em tempo real

### 📊 Dashboards
- **Geral**: Visão geral do sistema
- **Atendimento**: Gestão de fila e atendentes
- **Tempo Real**: Atualizações automáticas

## Scripts Disponíveis

- `npm start` - Inicia o servidor básico
- `npm run dev` - Modo desenvolvimento
- `npm run complete` - Servidor completo com atendimento
- `npm run docker-build` - Build Docker
- `npm run docker-run` - Run Docker

## Estrutura do Projeto

```
📦 whatsapp-webjs-n8n/
├── 📜 whatsapp-webjs-server-complete.js  # Servidor principal completo
├── � whatsapp-webjs-server.js           # Servidor básico
├── �📦 package.json                       # Dependências
├── 🐳 Dockerfile                         # Container Docker
├── 🐳 docker-compose.yml                 # Orquestração
├── 📋 template*.json                     # Templates n8n
├── 📖 README*.md                         # Documentação
├── 📖 GUIA-ATENDIMENTO-HUMANO.md        # Guia específico
├── 📖 SEGURANCA-BOAS-PRATICAS.md        # Segurança
├── ⚙️ .env.example                       # Configurações
├── 🚫 .gitignore                         # Git ignore
└── 💾 install.sh                         # Script instalação
```

## 🔧 Configurações Essenciais

### Variáveis de Ambiente (.env)
```bash
# Básico
PORT=3001
N8N_WEBHOOK_URL=http://localhost:5678/webhook/whatsapp-messages

# Atendimento Humano
SESSION_TIMEOUT_MS=1800000
MAX_CHATS_PER_ATTENDANT=3

# Segurança (Opcional)
REQUIRE_API_KEY=false
ENABLE_RATE_LIMITING=true
```

## 🆘 Solução Rápida de Problemas

### ❌ QR Code não aparece
```bash
# Limpar sessão e reiniciar
rm -rf .wwebjs_auth/
node whatsapp-webjs-server-complete.js
```

### ❌ Dashboard não carrega
```bash
# Verificar se servidor está rodando
curl http://localhost:3001/status
```

### ❌ Fila não funciona
```bash
# Verificar logs
tail -f logs/server.log

# Reiniciar processamento
curl -X POST http://localhost:3001/api/support-queue/restart
```

Agora seu projeto está completo! 🎉

### 📚 Próximos Passos

1. 📖 Leia o **GUIA-ATENDIMENTO-HUMANO.md** para detalhes completos
2. 🔒 Consulte **SEGURANCA-BOAS-PRATICAS.md** antes da produção  
3. 👥 Treine sua equipe com os dashboards
4. 📊 Configure alertas e monitoramento
5. 🚀 Personalize conforme suas necessidades
