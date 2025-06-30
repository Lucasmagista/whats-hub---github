# 🏠 Inaugura Lar Bot - Guia PostgreSQL

## 📋 Resumo

Seu bot **já está configurado para usar PostgreSQL** ao invés de MongoDB! ✅

O sistema funciona de forma híbrida:
- **PostgreSQL**: Banco principal (callbacks, estados dos usuários, mensagens)
- **Arquivos JSON**: Backup local automático
- **Fallback**: Se PostgreSQL não estiver disponível, usa arquivos locais

## 🚀 Instalação Rápida

### 1. Executar Script de Instalação
```bash
# Execute o script automatizado (Windows)
install-postgresql.bat

# Ou manualmente:
npm run setup-postgres
```

### 2. Configurar Variáveis de Ambiente
Edite o arquivo `.env`:
```bash
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=whats_hub
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua_senha_aqui

# Pool de Conexões
POSTGRES_MAX_CONNECTIONS=10
POSTGRES_IDLE_TIMEOUT=30000
POSTGRES_CONNECTION_TIMEOUT=5000
```

### 3. Inicializar Banco
```bash
# Criar tabelas e estrutura
npm run db:init

# Executar migração (se tiver dados antigos)
npm run migrate
```

### 4. Iniciar Bot
```bash
npm start
```

## 🗄️ Estrutura do Banco

### Tabelas Criadas

#### `callbacks`
- Armazena callbacks agendados
- Campos: id, chat_id, scheduled_time, message, status
- Índices otimizados para consultas rápidas

#### `user_states`
- Estados de conversação dos usuários
- Campos: chat_id, user_step, user_data, last_interaction
- Limpeza automática de estados antigos

#### `messages` (opcional)
- Histórico completo de mensagens
- Campos: message_id, chat_id, message_body, timestamp, media_data
- Para análise e auditoria

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Executar em modo desenvolvimento

# Banco de dados
npm run db:init          # Inicializar tabelas
npm run db:reset         # Resetar banco completo
npm run db:backup        # Fazer backup do banco
npm run migrate          # Migrar dados antigos

# Produção
npm start               # Executar bot em produção
```

## 📊 Monitoramento

### APIs Disponíveis
- `GET /api/callbacks` - Listar callbacks
- `GET /api/callbacks/statistics` - Estatísticas
- `GET /api/callbacks/health` - Health check
- `POST /api/callbacks/sync` - Sincronização manual

### Dashboard
- `http://localhost:3001/dashboard` - Dashboard principal
- `http://localhost:3001/support-dashboard` - Atendimento

## 🛠️ Recursos Implementados

### ✅ **PostgreSQL Nativo**
- Conexão com pool otimizado
- Queries preparadas para segurança
- Índices para performance
- Health check automático

### ✅ **Sistema Híbrido**
- PostgreSQL como principal
- Arquivos JSON como backup
- Fallback automático em caso de erro
- Sincronização automática

### ✅ **Estados Persistentes**
- Estados salvos no PostgreSQL
- Cache local para performance
- Limpeza automática de estados antigos
- Timeout de sessão configurável

### ✅ **Callbacks Robustos**
- Armazenamento persistente
- Execução agendada confiável
- Estatísticas e monitoramento
- API REST completa

### ✅ **Performance Otimizada**
- Pool de conexões configurável
- Índices otimizados
- Queries assíncronas
- Cache local inteligente

## 🐘 Comandos PostgreSQL Úteis

### Conectar ao Banco
```bash
psql -h localhost -U postgres -d whats_hub
```

### Consultas Úteis
```sql
-- Ver todos os callbacks
SELECT * FROM callbacks ORDER BY scheduled_time;

-- Estados dos usuários ativos
SELECT chat_id, user_step, last_interaction 
FROM user_states 
WHERE last_interaction > NOW() - INTERVAL '30 minutes';

-- Estatísticas do dia
SELECT 
    COUNT(*) as total_mensagens,
    COUNT(DISTINCT chat_id) as usuarios_unicos
FROM messages 
WHERE DATE(created_at) = CURRENT_DATE;

-- Limpeza manual de estados antigos
SELECT cleanup_old_user_states(30); -- 30 minutos
```

## 🔒 Backup e Segurança

### Backup Automático
```bash
# Backup completo
pg_dump -h localhost -U postgres whats_hub > backup_$(date +%Y%m%d).sql

# Backup apenas dados
pg_dump -h localhost -U postgres --data-only whats_hub > dados_$(date +%Y%m%d).sql
```

### Restaurar Backup
```bash
# Restaurar banco completo
psql -h localhost -U postgres -d whats_hub < backup_20241222.sql
```

## 🚨 Solução de Problemas

### Erro de Conexão PostgreSQL
1. Verificar se PostgreSQL está rodando
2. Confirmar credenciais no `.env`
3. Testar conexão: `psql -h localhost -U postgres`

### Bot Não Salva Estados
1. Verificar logs de erro do PostgreSQL
2. Sistema automaticamente usa arquivos JSON como fallback
3. Verificar permissões de escrita na pasta

### Performance Lenta
1. Aumentar `POSTGRES_MAX_CONNECTIONS`
2. Verificar índices com: `EXPLAIN ANALYZE SELECT...`
3. Monitorar uso de memória

## 📈 Benefícios vs MongoDB

### ✅ **Vantagens PostgreSQL**
- **ACID Compliance**: Transações confiáveis
- **Performance**: Consultas complexas otimizadas
- **Índices**: Sistema de índices avançado
- **JSON Support**: JSONB nativo para flexibilidade
- **Backup/Restore**: Ferramentas robustas
- **Community**: Comunidade ativa e documentação

### 📋 **Compatibilidade**
- **Zero Downtime**: Migração sem parar o bot
- **Fallback**: Sistema continua funcionando mesmo sem BD
- **API Compatível**: Todas as APIs funcionam igual
- **Performance**: Melhor performance que MongoDB

## 🏁 Conclusão

Seu sistema **já está totalmente configurado para PostgreSQL**! 

✅ **O que funciona:**
- Callbacks persistentes
- Estados dos usuários
- Histórico de mensagens
- Dashboard e APIs
- Backup automático
- Limpeza automática

✅ **Benefícios imediatos:**
- Maior confiabilidade
- Melhor performance
- Backup mais simples
- Consultas SQL poderosas
- Monitoramento avançado

🚀 **Para usar:** Apenas execute `npm start` e tudo funcionará perfeitamente com PostgreSQL!
