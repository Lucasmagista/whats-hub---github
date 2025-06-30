/**
 * Gerenciador de Configurações Avançado
 * Sistema para gerenciar configurações dinâmicas do bot
 */

const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor(configFile = './config.json') {
        this.configFile = configFile;
        this.defaultConfig = {
            // Configurações do Bot
            bot: {
                name: 'Inaugura Lar Bot',
                version: '2.0.0',
                timezone: 'America/Sao_Paulo',
                language: 'pt-BR',
                sessionTimeout: 30 * 60 * 1000, // 30 minutos
                maxConcurrentUsers: 1000,
                enableDebugMode: false
            },
            
            // Configurações do WhatsApp
            whatsapp: {
                puppeteerHeadless: true,
                puppeteerNoSandbox: true,
                sessionPath: './.wwebjs_auth',
                qrCodeTimeout: 60000, // 60 segundos
                retryDelay: 5000, // 5 segundos
                maxRetries: 3,
                enableGroupMessages: false,
                autoMarkAsRead: true
            },
            
            // Configurações do Servidor
            server: {
                port: 3001,
                host: 'localhost',
                cors: {
                    enabled: true,
                    origins: ['*']
                },
                rateLimit: {
                    enabled: true,
                    maxRequests: 100,
                    windowMs: 60000 // 1 minuto
                },
                bodyLimit: '50mb',
                enableCompression: true
            },
            
            // Configurações da Fila de Atendimento
            supportQueue: {
                enabled: true,
                maxQueueSize: 50,
                defaultPriority: 'normal',
                estimatedWaitTime: 10, // minutos
                autoAssignment: false,
                workingHours: {
                    enabled: false,
                    start: '09:00',
                    end: '18:00',
                    timezone: 'America/Sao_Paulo',
                    workDays: [1, 2, 3, 4, 5] // Segunda a Sexta
                },
                maxActiveChatsPerAttendant: 3,
                idleTimeout: 30 * 60 * 1000, // 30 minutos
                transferEnabled: true
            },
            
            // Configurações de Backup
            backup: {
                enabled: true,
                interval: 30 * 60 * 1000, // 30 minutos
                maxBackups: 10,
                directory: './backups',
                includeUploads: true,
                compression: false
            },
            
            // Configurações de Monitoramento
            monitoring: {
                enabled: true,
                interval: 60000, // 1 minuto
                memoryThreshold: 80, // %
                cpuThreshold: 80, // %
                diskThreshold: 90, // %
                responseTimeThreshold: 5000, // ms
                errorRateThreshold: 10, // %
                alertsEnabled: true,
                webhookUrl: null // URL para enviar alertas
            },
            
            // Configurações de Log
            logging: {
                enabled: true,
                level: 'info', // debug, info, warn, error
                directory: './logs',
                maxFileSize: '10mb',
                maxFiles: 5,
                enableConsole: true,
                enableFile: true
            },
            
            // Configurações de Segurança
            security: {
                enableApiAuth: false,
                apiKey: null,
                allowedIPs: [],
                enableEncryption: false,
                encryptionKey: null,
                sessionEncryption: true
            },
            
            // Configurações de Integração
            integrations: {
                n8n: {
                    enabled: true,
                    webhookUrl: null,
                    timeout: 10000,
                    retries: 3,
                    includeUserData: true,
                    includeMediaInfo: true
                },
                webhook: {
                    enabled: false,
                    url: null,
                    secret: null,
                    events: ['message', 'queue_join', 'queue_leave', 'chat_start', 'chat_end']
                }
            },
            
            // Configurações de Performance
            performance: {
                cacheEnabled: true,
                cacheSize: 1000,
                cacheTTL: 5 * 60 * 1000, // 5 minutos
                enableGzip: true,
                maxPayloadSize: '100mb',
                connectionTimeout: 30000,
                keepAliveTimeout: 5000
            },
            
            // Configurações de UI/UX
            ui: {
                theme: 'light',
                language: 'pt-BR',
                dateFormat: 'DD/MM/YYYY HH:mm:ss',
                timezone: 'America/Sao_Paulo',
                enableAnimations: true,
                autoRefresh: true,
                refreshInterval: 10000 // 10 segundos
            },
            
            // Configurações de Notificações
            notifications: {
                email: {
                    enabled: false,
                    smtp: {
                        host: null,
                        port: 587,
                        secure: false,
                        user: null,
                        password: null
                    },
                    recipients: [],
                    events: ['system_error', 'queue_full', 'whatsapp_disconnected']
                },
                slack: {
                    enabled: false,
                    webhookUrl: null,
                    channel: '#alerts',
                    events: ['system_error', 'queue_full', 'whatsapp_disconnected']
                }
            }
        };
        
        this.config = this.loadConfig();
        this.watchers = [];
    }
    
    loadConfig() {
        try {
            if (fs.existsSync(this.configFile)) {
                const fileContent = fs.readFileSync(this.configFile, 'utf8');
                const loadedConfig = JSON.parse(fileContent);
                
                // Merge com configurações padrão
                const config = this.deepMerge(this.defaultConfig, loadedConfig);
                
                console.log(`⚙️ Configurações carregadas de: ${this.configFile}`);
                return config;
            } else {
                console.log('⚙️ Arquivo de configuração não encontrado, usando configurações padrão');
                this.saveConfig(this.defaultConfig);
                return { ...this.defaultConfig };
            }
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            console.log('⚙️ Usando configurações padrão');
            return { ...this.defaultConfig };
        }
    }
    
    saveConfig(config = null) {
        try {
            const configToSave = config || this.config;
            const configDir = path.dirname(this.configFile);
            
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            
            fs.writeFileSync(this.configFile, JSON.stringify(configToSave, null, 2));
            console.log(`💾 Configurações salvas em: ${this.configFile}`);
            
            // Notificar watchers
            this.notifyWatchers('config_saved', configToSave);
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            return false;
        }
    }
    
    get(path, defaultValue = null) {
        try {
            const keys = path.split('.');
            let value = this.config;
            
            for (const key of keys) {
                if (value && typeof value === 'object' && key in value) {
                    value = value[key];
                } else {
                    return defaultValue;
                }
            }
            
            return value;
        } catch (error) {
            console.error(`❌ Erro ao obter configuração '${path}':`, error);
            return defaultValue;
        }
    }
    
    set(path, value, save = true) {
        try {
            const keys = path.split('.');
            let current = this.config;
            
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!(key in current) || typeof current[key] !== 'object') {
                    current[key] = {};
                }
                current = current[key];
            }
            
            const lastKey = keys[keys.length - 1];
            const oldValue = current[lastKey];
            current[lastKey] = value;
            
            if (save) {
                this.saveConfig();
            }
            
            // Notificar watchers
            this.notifyWatchers('config_changed', { path, oldValue, newValue: value });
            
            console.log(`⚙️ Configuração atualizada: ${path} = ${JSON.stringify(value)}`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao definir configuração '${path}':`, error);
            return false;
        }
    }
    
    has(path) {
        return this.get(path) !== null;
    }
    
    reset(path = null) {
        try {
            if (path) {
                const defaultValue = this.get(path, null, this.defaultConfig);
                this.set(path, defaultValue);
            } else {
                this.config = { ...this.defaultConfig };
                this.saveConfig();
            }
            
            console.log(`🔄 Configuração resetada: ${path || 'todas'}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao resetar configuração:', error);
            return false;
        }
    }
    
    validate() {
        const errors = [];
        
        // Validar configurações obrigatórias
        const requiredPaths = [
            'server.port',
            'bot.name',
            'whatsapp.sessionPath'
        ];
        
        requiredPaths.forEach(path => {
            if (!this.has(path)) {
                errors.push(`Configuração obrigatória ausente: ${path}`);
            }
        });
        
        // Validar tipos
        const typeValidations = {
            'server.port': 'number',
            'bot.sessionTimeout': 'number',
            'supportQueue.enabled': 'boolean',
            'monitoring.enabled': 'boolean'
        };
        
        Object.entries(typeValidations).forEach(([path, expectedType]) => {
            const value = this.get(path);
            if (value !== null && typeof value !== expectedType) {
                errors.push(`Tipo inválido para ${path}: esperado ${expectedType}, recebido ${typeof value}`);
            }
        });
        
        // Validar ranges
        const port = this.get('server.port');
        if (port && (port < 1 || port > 65535)) {
            errors.push('Porta do servidor deve estar entre 1 e 65535');
        }
        
        if (errors.length > 0) {
            console.error('❌ Erros de validação na configuração:');
            errors.forEach(error => console.error(`  - ${error}`));
            return false;
        }
        
        console.log('✅ Configuração validada com sucesso');
        return true;
    }
    
    watch(callback) {
        this.watchers.push(callback);
        return () => {
            const index = this.watchers.indexOf(callback);
            if (index > -1) {
                this.watchers.splice(index, 1);
            }
        };
    }
    
    notifyWatchers(event, data) {
        this.watchers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('❌ Erro ao notificar watcher:', error);
            }
        });
    }
    
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    export(format = 'json') {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            if (format === 'json') {
                const exportData = {
                    exportedAt: new Date().toISOString(),
                    version: this.config.bot.version,
                    config: this.config
                };
                
                const filename = `config-export-${timestamp}.json`;
                fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
                
                return { success: true, filename };
            }
            
            throw new Error(`Formato de exportação não suportado: ${format}`);
        } catch (error) {
            console.error('❌ Erro ao exportar configuração:', error);
            return { success: false, error: error.message };
        }
    }
    
    import(filename) {
        try {
            if (!fs.existsSync(filename)) {
                throw new Error(`Arquivo não encontrado: ${filename}`);
            }
            
            const fileContent = fs.readFileSync(filename, 'utf8');
            const importData = JSON.parse(fileContent);
            
            if (importData.config) {
                this.config = this.deepMerge(this.defaultConfig, importData.config);
                this.saveConfig();
                
                console.log(`📥 Configuração importada de: ${filename}`);
                return { success: true };
            } else {
                throw new Error('Formato de arquivo inválido');
            }
        } catch (error) {
            console.error('❌ Erro ao importar configuração:', error);
            return { success: false, error: error.message };
        }
    }
    
    getAll() {
        return { ...this.config };
    }
    
    getDefaults() {
        return { ...this.defaultConfig };
    }
    
    isDevelopment() {
        return this.get('bot.enableDebugMode', false) || process.env.NODE_ENV === 'development';
    }
    
    isProduction() {
        return !this.isDevelopment();
    }
}

module.exports = ConfigManager;
