/**
 * Sistema de Monitoramento e Alertas
 * Monitora saúde do sistema, performance e eventos críticos
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class SystemMonitor extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            memoryThreshold: config.memoryThreshold || 80, // % de uso de memória
            cpuThreshold: config.cpuThreshold || 80, // % de uso de CPU
            diskThreshold: config.diskThreshold || 90, // % de uso de disco
            responseTimeThreshold: config.responseTimeThreshold || 5000, // ms
            errorRateThreshold: config.errorRateThreshold || 10, // % de erro
            monitorInterval: config.monitorInterval || 60000, // 1 minuto
            logFile: config.logFile || './logs/system-monitor.log',
            alertsEnabled: config.alertsEnabled !== false
        };
        
        this.metrics = {
            startTime: Date.now(),
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                averageResponseTime: 0
            },
            system: {
                memory: 0,
                cpu: 0,
                disk: 0,
                uptime: 0
            },
            whatsapp: {
                connected: false,
                lastHeartbeat: null,
                messagesReceived: 0,
                messagesSent: 0,
                qrCodeGenerated: 0
            },
            supportQueue: {
                totalInQueue: 0,
                activeChats: 0,
                averageWaitTime: 0,
                totalChatsToday: 0
            },
            alerts: []
        };
        
        this.responseTimes = [];
        this.maxResponseTimes = 100; // Manter últimos 100 tempos de resposta
        
        this.ensureLogDirectory();
        this.startMonitoring();
    }
    
    ensureLogDirectory() {
        const logDir = path.dirname(this.config.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }
    
    startMonitoring() {
        setInterval(() => {
            this.collectSystemMetrics();
            this.checkThresholds();
            this.logMetrics();
        }, this.config.monitorInterval);
        
        console.log(`📊 Monitor do sistema iniciado (intervalo: ${this.config.monitorInterval / 1000}s)`);
    }
    
    collectSystemMetrics() {
        // Métricas de memória
        const memUsage = process.memoryUsage();
        this.metrics.system.memory = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
        
        // Uptime
        this.metrics.system.uptime = Date.now() - this.metrics.startTime;
        
        // Tempo de resposta médio
        if (this.responseTimes.length > 0) {
            const sum = this.responseTimes.reduce((a, b) => a + b, 0);
            this.metrics.requests.averageResponseTime = Math.round(sum / this.responseTimes.length);
        }
        
        // Taxa de erro
        if (this.metrics.requests.total > 0) {
            this.metrics.errorRate = Math.round((this.metrics.requests.failed / this.metrics.requests.total) * 100);
        }
    }
    
    recordRequest(responseTime, success = true) {
        this.metrics.requests.total++;
        
        if (success) {
            this.metrics.requests.successful++;
        } else {
            this.metrics.requests.failed++;
        }
        
        // Adicionar tempo de resposta
        this.responseTimes.push(responseTime);
        if (this.responseTimes.length > this.maxResponseTimes) {
            this.responseTimes.shift();
        }
        
        // Verificar limiar de tempo de resposta
        if (responseTime > this.config.responseTimeThreshold) {
            this.createAlert('SLOW_RESPONSE', `Resposta lenta detectada: ${responseTime}ms`, 'warning');
        }
    }
    
    recordWhatsAppEvent(event, data = {}) {
        switch (event) {
            case 'connected':
                this.metrics.whatsapp.connected = true;
                this.metrics.whatsapp.lastHeartbeat = Date.now();
                this.createAlert('WHATSAPP_CONNECTED', 'WhatsApp conectado com sucesso', 'info');
                break;
                
            case 'disconnected':
                this.metrics.whatsapp.connected = false;
                this.createAlert('WHATSAPP_DISCONNECTED', 'WhatsApp desconectado', 'error');
                break;
                
            case 'qr_generated':
                this.metrics.whatsapp.qrCodeGenerated++;
                this.createAlert('QR_CODE_GENERATED', 'Novo QR Code gerado', 'info');
                break;
                
            case 'message_received':
                this.metrics.whatsapp.messagesReceived++;
                this.metrics.whatsapp.lastHeartbeat = Date.now();
                break;
                
            case 'message_sent':
                this.metrics.whatsapp.messagesSent++;
                break;
        }
    }
    
    updateSupportQueueMetrics(queueData) {
        this.metrics.supportQueue = {
            totalInQueue: queueData.queueLength || 0,
            activeChats: queueData.activeChats || 0,
            averageWaitTime: queueData.averageWaitTime || 0,
            totalChatsToday: queueData.totalChatsToday || 0
        };
    }
    
    checkThresholds() {
        // Verificar memória
        if (this.metrics.system.memory > this.config.memoryThreshold) {
            this.createAlert('HIGH_MEMORY', `Uso de memória alto: ${this.metrics.system.memory}%`, 'warning');
        }
        
        // Verificar taxa de erro
        if (this.metrics.errorRate > this.config.errorRateThreshold) {
            this.createAlert('HIGH_ERROR_RATE', `Taxa de erro alta: ${this.metrics.errorRate}%`, 'error');
        }
        
        // Verificar se WhatsApp está conectado
        if (!this.metrics.whatsapp.connected) {
            this.createAlert('WHATSAPP_NOT_CONNECTED', 'WhatsApp não está conectado', 'error');
        }
        
        // Verificar último heartbeat do WhatsApp
        if (this.metrics.whatsapp.lastHeartbeat) {
            const timeSinceHeartbeat = Date.now() - this.metrics.whatsapp.lastHeartbeat;
            if (timeSinceHeartbeat > 5 * 60 * 1000) { // 5 minutos
                this.createAlert('WHATSAPP_INACTIVE', 'WhatsApp inativo há mais de 5 minutos', 'warning');
            }
        }
    }
    
    createAlert(type, message, severity = 'info') {
        const alert = {
            id: Date.now().toString(),
            type: type,
            message: message,
            severity: severity,
            timestamp: new Date().toISOString(),
            acknowledged: false
        };
        
        this.metrics.alerts.unshift(alert);
        
        // Manter apenas os últimos 50 alertas
        if (this.metrics.alerts.length > 50) {
            this.metrics.alerts = this.metrics.alerts.slice(0, 50);
        }
        
        // Emitir evento
        this.emit('alert', alert);
        
        // Log do alerta
        const logEntry = `[${alert.timestamp}] ${alert.severity.toUpperCase()}: ${alert.type} - ${alert.message}`;
        console.log(`🚨 ${logEntry}`);
        
        if (this.config.alertsEnabled) {
            this.logToFile(logEntry);
        }
        
        return alert;
    }
    
    acknowledgeAlert(alertId) {
        const alert = this.metrics.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = new Date().toISOString();
            return true;
        }
        return false;
    }
    
    getActiveAlerts() {
        return this.metrics.alerts.filter(alert => !alert.acknowledged);
    }
    
    getSystemHealth() {
        const activeAlerts = this.getActiveAlerts();
        const criticalAlerts = activeAlerts.filter(a => a.severity === 'error').length;
        const warningAlerts = activeAlerts.filter(a => a.severity === 'warning').length;
        
        let healthStatus = 'healthy';
        if (criticalAlerts > 0) {
            healthStatus = 'critical';
        } else if (warningAlerts > 0) {
            healthStatus = 'warning';
        }
        
        return {
            status: healthStatus,
            score: this.calculateHealthScore(),
            uptime: this.metrics.system.uptime,
            uptimeFormatted: this.formatUptime(this.metrics.system.uptime),
            alerts: {
                total: activeAlerts.length,
                critical: criticalAlerts,
                warning: warningAlerts,
                info: activeAlerts.filter(a => a.severity === 'info').length
            },
            lastCheck: new Date().toISOString()
        };
    }
    
    calculateHealthScore() {
        let score = 100;
        
        // Deduzir pontos por problemas
        const activeAlerts = this.getActiveAlerts();
        score -= activeAlerts.filter(a => a.severity === 'error').length * 20;
        score -= activeAlerts.filter(a => a.severity === 'warning').length * 10;
        score -= activeAlerts.filter(a => a.severity === 'info').length * 5;
        
        // Deduzir por métricas ruins
        if (this.metrics.system.memory > this.config.memoryThreshold) {
            score -= 15;
        }
        
        if (this.metrics.errorRate > this.config.errorRateThreshold) {
            score -= 25;
        }
        
        if (!this.metrics.whatsapp.connected) {
            score -= 30;
        }
        
        return Math.max(0, score);
    }
    
    formatUptime(uptime) {
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else {
            return `${minutes}m ${seconds % 60}s`;
        }
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            health: this.getSystemHealth(),
            timestamp: new Date().toISOString()
        };
    }
    
    logMetrics() {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp: timestamp,
            memory: this.metrics.system.memory,
            uptime: this.metrics.system.uptime,
            requests: this.metrics.requests,
            whatsapp: this.metrics.whatsapp,
            health: this.getSystemHealth()
        };
        
        this.logToFile(JSON.stringify(logEntry));
    }
    
    logToFile(message) {
        try {
            const timestamp = new Date().toISOString();
            const logLine = `${timestamp} - ${message}\n`;
            fs.appendFileSync(this.config.logFile, logLine);
        } catch (error) {
            console.error('❌ Erro ao escrever log:', error);
        }
    }
    
    generateReport() {
        const health = this.getSystemHealth();
        const metrics = this.getMetrics();
        
        return {
            reportId: Date.now().toString(),
            generatedAt: new Date().toISOString(),
            systemHealth: health,
            performance: {
                averageResponseTime: metrics.requests.averageResponseTime,
                totalRequests: metrics.requests.total,
                successRate: Math.round((metrics.requests.successful / metrics.requests.total) * 100) || 0,
                errorRate: metrics.errorRate || 0
            },
            whatsapp: {
                isConnected: metrics.whatsapp.connected,
                messagesReceived: metrics.whatsapp.messagesReceived,
                messagesSent: metrics.whatsapp.messagesSent,
                lastActivity: metrics.whatsapp.lastHeartbeat
            },
            supportQueue: metrics.supportQueue,
            alerts: {
                total: metrics.alerts.length,
                active: this.getActiveAlerts().length,
                recent: metrics.alerts.slice(0, 10)
            }
        };
    }
}

module.exports = SystemMonitor;
