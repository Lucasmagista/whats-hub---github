# 🛡️ Segurança e Boas Práticas - Sistema WhatsApp Bot

## 🎯 Visão Geral

Este documento detalha as medidas de segurança implementadas e as boas práticas recomendadas para operação segura e eficiente do sistema de atendimento WhatsApp.

## 🔒 Segurança Implementada

### 🛡️ Proteção contra Ataques

#### Rate Limiting
```javascript
// Implementação de rate limiting
const rateLimit = {
    windowMs: 60000,        // 1 minuto
    max: 100,               // máximo 100 requisições por IP
    message: 'Muitas requisições. Tente novamente em 1 minuto.',
    standardHeaders: true,
    legacyHeaders: false
};

app.use('/api/', rateLimitMiddleware(rateLimit));
```

#### Sanitização de Entrada
```javascript
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
        .replace(/<script.*?>.*?<\/script>/gi, '')  // Remove scripts
        .replace(/[<>]/g, '')                       // Remove HTML tags
        .replace(/javascript:/gi, '')               // Remove javascript:
        .replace(/on\w+\s*=/gi, '')                // Remove event handlers
        .trim()
        .substring(0, 1000);                       // Limitar tamanho
}
```

#### Validação de Dados
```javascript
function validateChatId(chatId) {
    const chatIdRegex = /^\d{10,15}@c\.us$/;
    return chatIdRegex.test(chatId);
}

function validateAttendantId(attendantId) {
    const attendantRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return attendantRegex.test(attendantId);
}

function validateMessage(message) {
    if (typeof message !== 'string') return false;
    if (message.length > 4000) return false;
    if (message.trim().length === 0) return false;
    return true;
}
```

### 🔐 Autenticação e Autorização

#### Middleware de Autenticação
```javascript
function authenticateAPI(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const token = req.headers['authorization'];
    
    if (process.env.REQUIRE_API_KEY === 'true') {
        if (!apiKey || apiKey !== process.env.API_KEY) {
            return res.status(401).json({ error: 'API Key inválida' });
        }
    }
    
    if (process.env.REQUIRE_JWT === 'true') {
        if (!token || !validateJWT(token)) {
            return res.status(401).json({ error: 'Token inválido' });
        }
    }
    
    next();
}
```

#### Controle de Acesso por Função
```javascript
const roles = {
    'admin': ['all'],
    'supervisor': ['view_queue', 'manage_attendants', 'view_reports'],
    'attendant': ['view_own_chats', 'send_messages', 'update_status'],
    'viewer': ['view_queue', 'view_basic_stats']
};

function authorize(requiredPermission) {
    return (req, res, next) => {
        const userRole = req.user.role;
        const permissions = roles[userRole] || [];
        
        if (permissions.includes('all') || permissions.includes(requiredPermission)) {
            next();
        } else {
            res.status(403).json({ error: 'Acesso negado' });
        }
    };
}
```

### 📊 Logs de Auditoria

#### Sistema de Logging Avançado
```javascript
class AuditLogger {
    static log(event, details, userId = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            userId: userId,
            ip: details.ip || 'unknown',
            userAgent: details.userAgent || 'unknown'
        };
        
        // Salvar em arquivo
        fs.appendFileSync('./logs/audit.log', JSON.stringify(logEntry) + '\n');
        
        // Enviar para sistema externo se configurado
        if (process.env.EXTERNAL_LOG_URL) {
            this.sendToExternalSystem(logEntry);
        }
    }
    
    static async sendToExternalSystem(logEntry) {
        try {
            await axios.post(process.env.EXTERNAL_LOG_URL, logEntry);
        } catch (error) {
            console.error('Erro ao enviar log externo:', error);
        }
    }
}

// Uso do sistema de auditoria
AuditLogger.log('chat_started', {
    chatId: chatId,
    attendantId: attendantId,
    queuePosition: position,
    ip: req.ip,
    userAgent: req.get('User-Agent')
});
```

### 🔒 Criptografia de Dados Sensíveis

#### Criptografia de Mensagens
```javascript
const crypto = require('crypto');

class DataEncryption {
    static encrypt(text) {
        if (!process.env.ENCRYPTION_KEY) return text;
        
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipher(algorithm, key);
        cipher.setAAD(Buffer.from('WhatsAppBot', 'utf8'));
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }
    
    static decrypt(encryptedData) {
        if (!process.env.ENCRYPTION_KEY) return encryptedData;
        if (typeof encryptedData === 'string') return encryptedData;
        
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');
        
        const decipher = crypto.createDecipher(algorithm, key);
        decipher.setAAD(Buffer.from('WhatsAppBot', 'utf8'));
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}
```

## 🚀 Boas Práticas de Performance

### ⚡ Otimizações de Código

#### Cache Inteligente
```javascript
class CacheManager {
    static cache = new Map();
    static TTL = 5 * 60 * 1000; // 5 minutos
    
    static set(key, value, ttl = this.TTL) {
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
        
        // Limpeza automática
        setTimeout(() => {
            this.delete(key);
        }, ttl);
    }
    
    static get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    static delete(key) {
        this.cache.delete(key);
    }
    
    static clear() {
        this.cache.clear();
    }
}

// Uso do cache
function getQueueStatus() {
    const cached = CacheManager.get('queue_status');
    if (cached) return cached;
    
    const status = SupportQueue.getDetailedQueueStatus();
    CacheManager.set('queue_status', status, 30000); // 30 segundos
    
    return status;
}
```

#### Processamento Assíncrono
```javascript
class AsyncProcessor {
    static queue = [];
    static processing = false;
    
    static addTask(task) {
        this.queue.push(task);
        this.processQueue();
    }
    
    static async processQueue() {
        if (this.processing) return;
        this.processing = true;
        
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            try {
                await this.executeTask(task);
            } catch (error) {
                console.error('Erro ao processar task:', error);
                AuditLogger.log('task_error', { error: error.message, task });
            }
        }
        
        this.processing = false;
    }
    
    static async executeTask(task) {
        switch (task.type) {
            case 'send_notification':
                await this.sendNotification(task.data);
                break;
            case 'update_external_system':
                await this.updateExternalSystem(task.data);
                break;
            case 'generate_report':
                await this.generateReport(task.data);
                break;
        }
    }
}
```

### 📊 Monitoramento de Performance

#### Métricas de Sistema
```javascript
class PerformanceMonitor {
    static metrics = {
        startTime: Date.now(),
        requestCount: 0,
        errorCount: 0,
        averageResponseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0
    };
    
    static recordRequest(responseTime) {
        this.metrics.requestCount++;
        this.metrics.averageResponseTime = 
            (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + responseTime) 
            / this.metrics.requestCount;
    }
    
    static recordError() {
        this.metrics.errorCount++;
    }
    
    static updateSystemMetrics() {
        const memUsage = process.memoryUsage();
        this.metrics.memoryUsage = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
        
        // CPU usage (simplified)
        const cpuUsage = process.cpuUsage();
        this.metrics.cpuUsage = Math.round((cpuUsage.user + cpuUsage.system) / 1000); // ms
    }
    
    static getMetrics() {
        this.updateSystemMetrics();
        return {
            ...this.metrics,
            uptime: Date.now() - this.metrics.startTime,
            errorRate: this.metrics.errorCount / this.metrics.requestCount * 100
        };
    }
}

// Middleware para monitoramento
app.use((req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        PerformanceMonitor.recordRequest(responseTime);
        
        if (res.statusCode >= 400) {
            PerformanceMonitor.recordError();
        }
    });
    
    next();
});
```

## 🔧 Configurações de Produção

### 🌐 Variáveis de Ambiente Essenciais

```bash
# Configurações básicas
NODE_ENV=production
PORT=3001
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/whatsapp-messages

# Segurança
REQUIRE_API_KEY=true
API_KEY=your-super-secret-api-key-here
REQUIRE_JWT=true
JWT_SECRET=your-jwt-secret-key-here
ENCRYPTION_KEY=your-256-bit-encryption-key-in-hex

# Rate Limiting
ENABLE_RATE_LIMITING=true
MAX_REQUESTS_PER_MINUTE=60
MAX_REQUESTS_PER_HOUR=1000

# Timeouts e Limites
SESSION_TIMEOUT_MS=1800000
MAX_QUEUE_SIZE=100
MAX_CHATS_PER_ATTENDANT=3
MAX_MESSAGE_LENGTH=4000

# Logging
LOG_LEVEL=info
EXTERNAL_LOG_URL=https://your-logging-service.com/api/logs
ENABLE_AUDIT_LOGS=true

# Backup e Persistência
AUTO_BACKUP_INTERVAL=300000
BACKUP_RETENTION_DAYS=30
ENABLE_ENCRYPTION=true

# Notificações
SLACK_WEBHOOK_URL=https://hooks.slack.com/your-webhook
EMAIL_SERVICE_URL=https://your-email-service.com/api/send
ALERT_THRESHOLDS_QUEUE_SIZE=20
ALERT_THRESHOLDS_ERROR_RATE=5
```

### 🐳 Docker para Produção

```dockerfile
# Dockerfile otimizado para produção
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

# Criar usuário não-privilegiado
RUN addgroup -g 1001 -S nodejs
RUN adduser -S whatsapp -u 1001

# Instalar dependências do sistema
RUN apk add --no-cache curl

WORKDIR /app

# Copiar dependências
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=whatsapp:nodejs . .

# Criar diretórios necessários
RUN mkdir -p logs uploads backups && chown -R whatsapp:nodejs logs uploads backups

USER whatsapp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3001}/status || exit 1

EXPOSE 3001

CMD ["node", "whatsapp-webjs-server-complete.js"]
```

### ☁️ Docker Compose para Produção

```yaml
version: '3.8'

services:
  whatsapp-bot:
    build: .
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3001
      - REQUIRE_API_KEY=true
    ports:
      - "3001:3001"
    volumes:
      - ./logs:/app/logs
      - ./backups:/app/backups
      - ./uploads:/app/uploads
      - whatsapp_auth:/app/.wwebjs_auth
    networks:
      - whatsapp_network
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - whatsapp-bot
    networks:
      - whatsapp_network

  redis:
    image: redis:alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - whatsapp_network

volumes:
  whatsapp_auth:
  redis_data:

networks:
  whatsapp_network:
    driver: bridge
```

## 🚨 Alertas e Monitoramento

### 📢 Sistema de Alertas

```javascript
class AlertManager {
    static thresholds = {
        queueSize: parseInt(process.env.ALERT_THRESHOLD_QUEUE_SIZE) || 20,
        errorRate: parseFloat(process.env.ALERT_THRESHOLD_ERROR_RATE) || 5,
        responseTime: parseInt(process.env.ALERT_THRESHOLD_RESPONSE_TIME) || 5000,
        memoryUsage: parseInt(process.env.ALERT_THRESHOLD_MEMORY) || 80
    };
    
    static async checkAlerts() {
        const metrics = PerformanceMonitor.getMetrics();
        const queueStatus = SupportQueue.getDetailedQueueStatus();
        
        // Verificar fila grande
        if (queueStatus.queueLength > this.thresholds.queueSize) {
            await this.sendAlert('HIGH_QUEUE_SIZE', {
                current: queueStatus.queueLength,
                threshold: this.thresholds.queueSize,
                averageWaitTime: queueStatus.averageWaitTimeMinutes
            });
        }
        
        // Verificar taxa de erro alta
        if (metrics.errorRate > this.thresholds.errorRate) {
            await this.sendAlert('HIGH_ERROR_RATE', {
                current: metrics.errorRate,
                threshold: this.thresholds.errorRate,
                totalErrors: metrics.errorCount
            });
        }
        
        // Verificar uso de memória
        if (metrics.memoryUsage > this.thresholds.memoryUsage) {
            await this.sendAlert('HIGH_MEMORY_USAGE', {
                current: metrics.memoryUsage,
                threshold: this.thresholds.memoryUsage
            });
        }
    }
    
    static async sendAlert(type, data) {
        const alert = {
            type: type,
            timestamp: new Date().toISOString(),
            data: data,
            severity: this.getSeverity(type)
        };
        
        // Log do alerta
        AuditLogger.log('alert_triggered', alert);
        
        // Enviar para Slack
        if (process.env.SLACK_WEBHOOK_URL) {
            await this.sendSlackAlert(alert);
        }
        
        // Enviar email
        if (process.env.EMAIL_SERVICE_URL) {
            await this.sendEmailAlert(alert);
        }
    }
    
    static getSeverity(type) {
        const severityMap = {
            'HIGH_QUEUE_SIZE': 'warning',
            'HIGH_ERROR_RATE': 'critical',
            'HIGH_MEMORY_USAGE': 'warning',
            'SYSTEM_DOWN': 'critical'
        };
        
        return severityMap[type] || 'info';
    }
    
    static async sendSlackAlert(alert) {
        const emoji = alert.severity === 'critical' ? '🚨' : '⚠️';
        const message = {
            text: `${emoji} WhatsApp Bot Alert`,
            attachments: [{
                color: alert.severity === 'critical' ? 'danger' : 'warning',
                fields: [
                    { title: 'Type', value: alert.type, short: true },
                    { title: 'Severity', value: alert.severity, short: true },
                    { title: 'Data', value: JSON.stringify(alert.data, null, 2), short: false }
                ],
                ts: Math.floor(Date.now() / 1000)
            }]
        };
        
        try {
            await axios.post(process.env.SLACK_WEBHOOK_URL, message);
        } catch (error) {
            console.error('Erro ao enviar alerta Slack:', error);
        }
    }
}

// Verificar alertas a cada 2 minutos
setInterval(() => {
    AlertManager.checkAlerts();
}, 2 * 60 * 1000);
```

### 📊 Integração com Prometheus/Grafana

```javascript
const client = require('prom-client');

// Registrar métricas Prometheus
const register = new client.Registry();

const queueSizeGauge = new client.Gauge({
    name: 'whatsapp_queue_size',
    help: 'Current number of clients in queue'
});

const activeChatGauge = new client.Gauge({
    name: 'whatsapp_active_chats',
    help: 'Number of active chats with attendants'
});

const attendantStatusGauge = new client.Gauge({
    name: 'whatsapp_attendant_status',
    help: 'Attendant status by ID',
    labelNames: ['attendant_id', 'status']
});

const messageCounter = new client.Counter({
    name: 'whatsapp_messages_total',
    help: 'Total number of messages processed',
    labelNames: ['type', 'direction']
});

const responseTimeHistogram = new client.Histogram({
    name: 'whatsapp_response_time_seconds',
    help: 'Response time histogram',
    buckets: [0.1, 0.5, 1, 2, 5, 10]
});

register.registerMetric(queueSizeGauge);
register.registerMetric(activeChatGauge);
register.registerMetric(attendantStatusGauge);
register.registerMetric(messageCounter);
register.registerMetric(responseTimeHistogram);

// Endpoint para métricas
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Atualizar métricas periodicamente
setInterval(() => {
    const queueStatus = SupportQueue.getDetailedQueueStatus();
    
    queueSizeGauge.set(queueStatus.queueLength);
    activeChatGauge.set(queueStatus.activeChats);
    
    // Atualizar status dos atendentes
    queueStatus.attendants.forEach(attendant => {
        attendantStatusGauge.set(
            { attendant_id: attendant.id, status: attendant.status }, 
            1
        );
    });
}, 5000);
```

## 📋 Checklist de Segurança

### ✅ Antes de Colocar em Produção

- [ ] **Autenticação configurada** - API keys e/ou JWT implementados
- [ ] **Rate limiting ativo** - Proteção contra spam e DoS
- [ ] **Logs de auditoria** - Rastreamento completo de ações
- [ ] **Criptografia habilitada** - Dados sensíveis protegidos
- [ ] **Backup automático** - Estados e configurações salvos
- [ ] **Monitoramento ativo** - Alertas para situações críticas
- [ ] **Variáveis de ambiente** - Credenciais fora do código
- [ ] **HTTPS configurado** - Comunicação segura
- [ ] **Firewall configurado** - Acesso restrito às portas necessárias
- [ ] **Usuário não-root** - Container/processo com privilégios mínimos
- [ ] **Health checks** - Monitoramento de disponibilidade
- [ ] **Disaster recovery** - Plano de recuperação de falhas

### ✅ Manutenção Periódica

- [ ] **Atualizar dependências** - npm audit e update mensais
- [ ] **Revisar logs** - Análise semanal de logs de auditoria
- [ ] **Verificar métricas** - Análise mensal de performance
- [ ] **Testar backups** - Verificação trimestral de recuperação
- [ ] **Renovar certificados** - SSL/TLS antes do vencimento
- [ ] **Revisar acessos** - Auditoria semestral de permissões
- [ ] **Atualizar documentação** - Manter procedimentos atualizados

---

## 📞 Contatos de Emergência

### 🆘 Suporte 24/7
- **Telefone**: +55 11 99999-9999
- **Email**: suporte-urgente@empresa.com
- **Slack**: #whatsapp-bot-emergency

### 👨‍💻 Equipe Técnica
- **Desenvolvedor Principal**: dev-lead@empresa.com
- **DevOps**: devops@empresa.com
- **Segurança**: security@empresa.com

---

**🔒 Sistema Seguro e Confiável**  
*Desenvolvido seguindo as melhores práticas de segurança da indústria*
