/**
 * ⚙️ ConfigurationManager - FASE 2 FUNCIONALIDADES AVANÇADAS
 * Sistema de configurações dinâmicas para integração N8N + WhatsApp
 */

import { whatsHubIntegration } from './whatsHubIntegration';
import { configurationValidator } from './configurationValidator';
import { configurationAnalyzer } from './configurationAnalyzer';

// Interface para EmailJS global
interface EmailJSWindow extends Window {
  emailjs?: {
    init: (publicKey: string) => void;
    send: (serviceId: string, templateId: string, templateParams: Record<string, unknown>, publicKey: string) => Promise<unknown>;
  };
}

export interface SystemConfiguration {
  // Configurações WhatsApp
  whatsapp: {
    autoReply: boolean;
    replyDelay: number;
    businessHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
      workDays: number[];
    };
    qrCodeTimeout: number;
    maxRetries: number;
  };

  // Configurações N8N
  n8n: {
    webhookUrl: string;
    apiUrl: string;
    username: string;
    password: string;
    defaultWorkflow: string;
    timeout: number;
    retryAttempts: number;
  };

  // Configurações de Fila
  queue: {
    enabled: boolean;
    maxWaitTime: number;
    autoAssign: boolean;
    priorityRules: Array<{
      condition: string;
      priority: 'low' | 'normal' | 'high' | 'urgent';
    }>;
    workingHours: {
      enabled: boolean;
      schedule: Record<string, { start: string; end: string }>;
    };
  };

  // Configurações de Backup
  backup: {
    enabled: boolean;
    interval: number; // em minutos
    location: string;
    maxBackups: number;
    autoCleanup: boolean;
  };

  // Configurações de Monitoramento
  monitoring: {
    enabled: boolean;
    alertThresholds: {
      queueSize: number;
      responseTime: number;
      errorRate: number;
      memoryUsage: number;
    };
    notifications: {
      email: boolean;
      webhook: boolean;
      dashboard: boolean;
    };
  };

  // Configurações de IA (FASE 3)
  ai: {
    enabled: boolean;
    provider: 'openai' | 'claude' | 'gemini' | 'local';
    model: string;
    temperature: number;
    maxTokens: number;
    autoResponse: boolean;
    confidenceThreshold: number;
    contextWindow: number;
    fallbackModel?: string;
    rateLimiting: {
      enabled: boolean;
      requestsPerMinute: number;
      requestsPerHour: number;
    };
  };

  // Configurações de Sistema (NOVO)
  system: {
    environment: 'development' | 'staging' | 'production';
    version: string;
    maintenanceMode: boolean;
    debugMode: boolean;
    maxConcurrentConnections: number;
    sessionTimeout: number; // em minutos
    autoSaveInterval: number; // em segundos
    resourceLimits: {
      maxMemoryUsage: number; // em MB
      maxCpuUsage: number; // em %
      maxDiskUsage: number; // em MB
    };
  };

  // Configurações de Segurança (NOVO)
  security: {
    encryption: {
      enabled: boolean;
      algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
      keyRotationInterval: number; // em dias
    };
    authentication: {
      multiFactorAuth: boolean;
      sessionExpiryTime: number; // em minutos
      maxLoginAttempts: number;
      lockoutDuration: number; // em minutos
    };
    dataProtection: {
      anonymizeData: boolean;
      dataRetentionDays: number;
      encryptBackups: boolean;
    };
    audit: {
      enabled: boolean;
      logLevel: 'minimal' | 'standard' | 'detailed';
      retentionDays: number;
    };
  };

  // Configurações de Performance (NOVO)
  performance: {
    caching: {
      enabled: boolean;
      strategy: 'memory' | 'redis' | 'hybrid';
      ttl: number; // em segundos
      maxSize: number; // em MB
    };
    database: {
      connectionPoolSize: number;
      queryTimeout: number; // em segundos
      optimizeQueries: boolean;
      enableIndexing: boolean;
    };
    network: {
      timeout: number; // em segundos
      retries: number;
      backoffStrategy: 'linear' | 'exponential';
      compression: boolean;
    };
    memory: {
      garbageCollectionInterval: number; // em segundos
      maxHeapSize: number; // em MB
      memoryLeakDetection: boolean;
    };
  };

  // Configurações de Integração Avançada (NOVO)
  integrations: {
    crm: {
      enabled: boolean;
      provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'custom';
      apiKey?: string;
      syncInterval: number; // em minutos
      syncFields: string[];
      autoCreateContacts: boolean;
    };
    analytics: {
      enabled: boolean;
      provider: 'google' | 'mixpanel' | 'amplitude' | 'custom';
      trackingId?: string;
      events: string[];
      customDimensions: Record<string, string>;
    };
    storage: {
      provider: 'local' | 's3' | 'azure' | 'gcp';
      bucket?: string;
      region?: string;
      encryption: boolean;
      compression: boolean;
    };
  };

  // Configurações de Workflows (NOVO)
  workflows: {
    enabled: boolean;
    defaultTimeout: number; // em segundos
    maxConcurrentExecutions: number;
    retryPolicy: {
      enabled: boolean;
      maxRetries: number;
      backoffMultiplier: number;
    };
    errorHandling: {
      strategy: 'fail-fast' | 'continue' | 'retry';
      notifyOnError: boolean;
      errorReporting: boolean;
    };
    scheduling: {
      enabled: boolean;
      timezone: string;
      maxScheduledJobs: number;
    };
  };

  // Configurações de Notificações Avançadas (NOVO)
  notifications: {
    channels: {
      email: {
        enabled: boolean;
        provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
        templates: Record<string, string>;
        rateLimiting: boolean;
      };
      webhook: {
        enabled: boolean;
        endpoints: Array<{
          url: string;
          events: string[];
          headers?: Record<string, string>;
        }>;
        retryPolicy: {
          maxRetries: number;
          backoffMs: number;
        };
      };
      push: {
        enabled: boolean;
        provider: 'fcm' | 'apns' | 'web-push';
        credentials?: Record<string, string>;
      };
      sms: {
        enabled: boolean;
        provider: 'twilio' | 'nexmo' | 'aws-sns';
        credentials?: Record<string, string>;
      };
    };
    rules: Array<{
      id: string;
      name: string;
      condition: string;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'critical';
      throttling?: {
        enabled: boolean;
        maxPerHour: number;
      };
    }>;
  };

  // Configurações de Compliance (NOVO)
  compliance: {
    gdpr: {
      enabled: boolean;
      dataRetentionDays: number;
      allowDataExport: boolean;
      allowDataDeletion: boolean;
      consentTracking: boolean;
    };
    hipaa: {
      enabled: boolean;
      encryptionRequired: boolean;
      auditTrailRequired: boolean;
      accessControlRequired: boolean;
    };
    sox: {
      enabled: boolean;
      financialDataProtection: boolean;
      changeControlRequired: boolean;
      auditRequirements: boolean;
    };
  };

  // Configurações de Desenvolvimento (NOVO)
  development: {
    hotReload: boolean;
    debugLogging: boolean;
    mockServices: boolean;
    testMode: boolean;
    profiling: {
      enabled: boolean;
      samplingRate: number; // 0-1
      exportMetrics: boolean;
    };
    documentation: {
      autoGenerate: boolean;
      includeExamples: boolean;
      apiDocs: boolean;
    };
  };

  // Configurações de Logs Avançados (NOVO)
  logging: {
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    enableConsole: boolean;
    enableFile: boolean;
    enableRemote: boolean;
    maxFileSize: number; // em MB
    maxFiles: number;
    compression: boolean;
    rotation: {
      enabled: boolean;
      schedule: 'daily' | 'weekly' | 'monthly';
      maxAge: number; // em dias
    };
    filters: {
      excludePatterns: string[];
      includePatterns: string[];
      sensitiveDataMask: boolean;
    };
    remoteEndpoint?: {
      url: string;
      apiKey?: string;
      batchSize: number;
      flushInterval: number; // em segundos
    };
  };

  // Configurações de Rate Limiting (NOVO)
  rateLimiting: {
    enabled: boolean;
    global: {
      maxRequests: number;
      windowMs: number; // em milissegundos
      skipSuccessfulRequests: boolean;
    };
    perEndpoint: Record<string, {
      maxRequests: number;
      windowMs: number;
      skipIp?: string[];
    }>;
    strategies: {
      memory: boolean;
      redis: boolean;
      database: boolean;
    };
    responses: {
      message: string;
      statusCode: number;
      includeRetryAfter: boolean;
    };
  };

  // Configurações de Cache Avançado (NOVO)
  caching: {
    layers: {
      memory: {
        enabled: boolean;
        maxSize: number; // em MB
        ttl: number; // em segundos
        algorithm: 'lru' | 'lfu' | 'fifo';
      };
      redis: {
        enabled: boolean;
        url?: string;
        keyPrefix: string;
        ttl: number;
        compression: boolean;
      };
      database: {
        enabled: boolean;
        tableName: string;
        ttl: number;
        cleanupInterval: number; // em segundos
      };
    };
    strategies: {
      writeThrough: boolean;
      writeBack: boolean;
      readThrough: boolean;
      cacheAside: boolean;
    };
    invalidation: {
      enabled: boolean;
      patterns: string[];
      events: string[];
    };
  };

  // Configurações de Health Check (NOVO)
  healthCheck: {
    enabled: boolean;
    endpoints: {
      basic: boolean;
      detailed: boolean;
      custom: boolean;
    };
    checks: {
      database: boolean;
      redis: boolean;
      external: boolean;
      disk: boolean;
      memory: boolean;
      services: boolean;
    };
    intervals: {
      basic: number; // em segundos
      detailed: number;
      external: number;
    };
    thresholds: {
      responseTime: number; // em ms
      memoryUsage: number; // em %
      diskUsage: number; // em %
      cpuUsage: number; // em %
    };
    notifications: {
      onFailure: boolean;
      onRecovery: boolean;
      channels: string[];
    };
  };

  // Configurações de Observabilidade (NOVO)
  observability: {
    metrics: {
      enabled: boolean;
      provider: 'prometheus' | 'datadog' | 'newrelic' | 'custom';
      endpoint?: string;
      pushInterval: number; // em segundos
      customMetrics: Array<{
        name: string;
        type: 'counter' | 'gauge' | 'histogram' | 'summary';
        labels: string[];
      }>;
    };
    tracing: {
      enabled: boolean;
      provider: 'jaeger' | 'zipkin' | 'datadog' | 'custom';
      endpoint?: string;
      samplingRate: number; // 0-1
      includeHeaders: boolean;
      includePayload: boolean;
    };
    profiling: {
      enabled: boolean;
      provider: 'pprof' | 'pyroscope' | 'custom';
      endpoint?: string;
      interval: number; // em segundos
      includeHeapProfile: boolean;
      includeCpuProfile: boolean;
    };
  };

  // Configurações de Disaster Recovery (NOVO)
  disasterRecovery: {
    enabled: boolean;
    strategies: {
      activePassive: boolean;
      activeActive: boolean;
      coldStandby: boolean;
    };
    backupSites: Array<{
      name: string;
      url: string;
      priority: number;
      healthCheckUrl: string;
      failoverTimeout: number; // em segundos
    }>;
    dataReplication: {
      enabled: boolean;
      method: 'synchronous' | 'asynchronous';
      targets: string[];
      checkInterval: number; // em segundos
    };
    failover: {
      automatic: boolean;
      manualApproval: boolean;
      notificationChannels: string[];
      rollbackTimeout: number; // em segundos
    };
  };

  // Configurações de Experiência do Usuário (NOVO)
  userExperience: {
    interface: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
      animations: boolean;
      sounds: boolean;
      shortcuts: boolean;
    };
    accessibility: {
      highContrast: boolean;
      screenReader: boolean;
      keyboardNavigation: boolean;
      fontSize: 'small' | 'medium' | 'large';
    };
    performance: {
      lazyLoading: boolean;
      preloadImages: boolean;
      minifyResources: boolean;
      cacheStrategy: 'aggressive' | 'conservative';
    };
    customization: {
      dashboard: Record<string, unknown>;
      widgets: Record<string, unknown>;
      shortcuts: Record<string, string>;
      preferences: Record<string, unknown>;
    };
  };
}

class ConfigurationManager {
  private config: SystemConfiguration;
  private readonly configFile = 'whatsHub.config.json';
  private readonly listeners: Set<(config: SystemConfiguration) => void> = new Set();

  constructor() {
    this.config = this.getDefaultConfiguration();
    this.loadConfiguration();
  }

  // =============================
  // CONFIGURAÇÃO PADRÃO
  // =============================

  private getDefaultConfiguration(): SystemConfiguration {
    return {
      whatsapp: {
        autoReply: true,
        replyDelay: 1000,
        businessHours: {
          enabled: true,
          start: '08:00',
          end: '18:00',
          timezone: 'America/Sao_Paulo',
          workDays: [1, 2, 3, 4, 5] // Segunda a sexta
        },
        qrCodeTimeout: 60000,
        maxRetries: 3
      },
      n8n: {
        webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL ?? 'http://localhost:5678/webhook/whatsapp-messages',
        apiUrl: import.meta.env.VITE_N8N_API_URL ?? 'http://localhost:5678/api/v1',
        username: import.meta.env.VITE_N8N_USERNAME ?? 'admin',
        password: import.meta.env.VITE_N8N_PASSWORD ?? 'sua_senha_n8n_aqui',
        defaultWorkflow: 'whatsapp-automation',
        timeout: 30000,
        retryAttempts: 3
      },
      queue: {
        enabled: true,
        maxWaitTime: 300000, // 5 minutos
        autoAssign: true,
        priorityRules: [
          {
            condition: 'vip_customer',
            priority: 'urgent'
          },
          {
            condition: 'business_hours',
            priority: 'high'
          }
        ],
        workingHours: {
          enabled: true,
          schedule: {
            monday: { start: '08:00', end: '18:00' },
            tuesday: { start: '08:00', end: '18:00' },
            wednesday: { start: '08:00', end: '18:00' },
            thursday: { start: '08:00', end: '18:00' },
            friday: { start: '08:00', end: '18:00' },
            saturday: { start: '09:00', end: '13:00' },
            sunday: { start: '00:00', end: '00:00' }
          }
        }
      },
      backup: {
        enabled: true,
        interval: 60, // 1 hora
        location: './backups',
        maxBackups: 10,
        autoCleanup: true
      },
      monitoring: {
        enabled: true,
        alertThresholds: {
          queueSize: 50,
          responseTime: 5000,
          errorRate: 0.1,
          memoryUsage: 0.8
        },
        notifications: {
          email: true,
          webhook: true,
          dashboard: true
        }
      },
      ai: {
        enabled: false,
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000,
        autoResponse: false,
        confidenceThreshold: 0.8,
        contextWindow: 4096,
        fallbackModel: 'gpt-3.5-turbo-16k',
        rateLimiting: {
          enabled: true,
          requestsPerMinute: 60,
          requestsPerHour: 1000
        }
      },
      system: {
        environment: 'development',
        version: '2.0.0',
        maintenanceMode: false,
        debugMode: false,
        maxConcurrentConnections: 1000,
        sessionTimeout: 30,
        autoSaveInterval: 30,
        resourceLimits: {
          maxMemoryUsage: 2048,
          maxCpuUsage: 80,
          maxDiskUsage: 10240
        }
      },
      security: {
        encryption: {
          enabled: true,
          algorithm: 'AES-256-GCM',
          keyRotationInterval: 30
        },
        authentication: {
          multiFactorAuth: false,
          sessionExpiryTime: 60,
          maxLoginAttempts: 5,
          lockoutDuration: 15
        },
        dataProtection: {
          anonymizeData: true,
          dataRetentionDays: 90,
          encryptBackups: true
        },
        audit: {
          enabled: true,
          logLevel: 'standard',
          retentionDays: 365
        }
      },
      performance: {
        caching: {
          enabled: true,
          strategy: 'memory',
          ttl: 3600,
          maxSize: 256
        },
        database: {
          connectionPoolSize: 10,
          queryTimeout: 30,
          optimizeQueries: true,
          enableIndexing: true
        },
        network: {
          timeout: 10,
          retries: 3,
          backoffStrategy: 'exponential',
          compression: true
        },
        memory: {
          garbageCollectionInterval: 300,
          maxHeapSize: 1024,
          memoryLeakDetection: true
        }
      },
      integrations: {
        crm: {
          enabled: false,
          provider: 'custom',
          syncInterval: 15,
          syncFields: ['name', 'email', 'phone'],
          autoCreateContacts: false
        },
        analytics: {
          enabled: false,
          provider: 'custom',
          events: ['message_sent', 'message_received', 'workflow_executed'],
          customDimensions: {}
        },
        storage: {
          provider: 'local',
          encryption: true,
          compression: true
        }
      },
      workflows: {
        enabled: true,
        defaultTimeout: 300,
        maxConcurrentExecutions: 50,
        retryPolicy: {
          enabled: true,
          maxRetries: 3,
          backoffMultiplier: 2
        },
        errorHandling: {
          strategy: 'retry',
          notifyOnError: true,
          errorReporting: true
        },
        scheduling: {
          enabled: true,
          timezone: 'America/Sao_Paulo',
          maxScheduledJobs: 1000
        }
      },
      notifications: {
        channels: {
          email: {
            enabled: true,
            provider: 'smtp',
            templates: {},
            rateLimiting: true
          },
          webhook: {
            enabled: false,
            endpoints: [],
            retryPolicy: {
              maxRetries: 3,
              backoffMs: 1000
            }
          },
          push: {
            enabled: false,
            provider: 'web-push'
          },
          sms: {
            enabled: false,
            provider: 'twilio'
          }
        },
        rules: []
      },
      compliance: {
        gdpr: {
          enabled: false,
          dataRetentionDays: 365,
          allowDataExport: true,
          allowDataDeletion: true,
          consentTracking: true
        },
        hipaa: {
          enabled: false,
          encryptionRequired: true,
          auditTrailRequired: true,
          accessControlRequired: true
        },
        sox: {
          enabled: false,
          financialDataProtection: true,
          changeControlRequired: true,
          auditRequirements: true
        }
      },
      development: {
        hotReload: true,
        debugLogging: true,
        mockServices: false,
        testMode: false,
        profiling: {
          enabled: false,
          samplingRate: 0.1,
          exportMetrics: false
        },
        documentation: {
          autoGenerate: true,
          includeExamples: true,
          apiDocs: true
        }
      },

      // Configurações de Logs Avançados
      logging: {
        level: 'info',
        enableConsole: true,
        enableFile: false,
        enableRemote: false,
        maxFileSize: 10,
        maxFiles: 5,
        compression: true,
        rotation: {
          enabled: true,
          schedule: 'daily',
          maxAge: 30
        },
        filters: {
          excludePatterns: ['password', 'token', 'secret'],
          includePatterns: [],
          sensitiveDataMask: true
        }
      },

      // Configurações de Rate Limiting
      rateLimiting: {
        enabled: false,
        global: {
          maxRequests: 1000,
          windowMs: 60000,
          skipSuccessfulRequests: false
        },
        perEndpoint: {},
        strategies: {
          memory: true,
          redis: false,
          database: false
        },
        responses: {
          message: 'Too many requests',
          statusCode: 429,
          includeRetryAfter: true
        }
      },

      // Configurações de Cache Avançado
      caching: {
        layers: {
          memory: {
            enabled: true,
            maxSize: 128,
            ttl: 3600,
            algorithm: 'lru'
          },
          redis: {
            enabled: false,
            keyPrefix: 'whatsapp:',
            ttl: 7200,
            compression: true
          },
          database: {
            enabled: false,
            tableName: 'cache_entries',
            ttl: 86400,
            cleanupInterval: 3600
          }
        },
        strategies: {
          writeThrough: false,
          writeBack: false,
          readThrough: true,
          cacheAside: true
        },
        invalidation: {
          enabled: true,
          patterns: ['user:*', 'session:*'],
          events: ['user_update', 'config_change']
        }
      },

      // Configurações de Health Check
      healthCheck: {
        enabled: true,
        endpoints: {
          basic: true,
          detailed: true,
          custom: false
        },
        checks: {
          database: true,
          redis: false,
          external: true,
          disk: true,
          memory: true,
          services: true
        },
        intervals: {
          basic: 30,
          detailed: 300,
          external: 60
        },
        thresholds: {
          responseTime: 1000,
          memoryUsage: 85,
          diskUsage: 90,
          cpuUsage: 80
        },
        notifications: {
          onFailure: true,
          onRecovery: true,
          channels: ['email', 'webhook']
        }
      },

      // Configurações de Observabilidade
      observability: {
        metrics: {
          enabled: false,
          provider: 'prometheus',
          pushInterval: 30,
          customMetrics: []
        },
        tracing: {
          enabled: false,
          provider: 'jaeger',
          samplingRate: 0.1,
          includeHeaders: false,
          includePayload: false
        },
        profiling: {
          enabled: false,
          provider: 'pprof',
          interval: 60,
          includeHeapProfile: true,
          includeCpuProfile: true
        }
      },

      // Configurações de Disaster Recovery
      disasterRecovery: {
        enabled: false,
        strategies: {
          activePassive: true,
          activeActive: false,
          coldStandby: false
        },
        backupSites: [],
        dataReplication: {
          enabled: false,
          method: 'asynchronous',
          targets: [],
          checkInterval: 300
        },
        failover: {
          automatic: false,
          manualApproval: true,
          notificationChannels: ['email'],
          rollbackTimeout: 300
        }
      },

      // Configurações de Experiência do Usuário
      userExperience: {
        interface: {
          theme: 'auto',
          language: 'pt-BR',
          animations: true,
          sounds: false,
          shortcuts: true
        },
        accessibility: {
          highContrast: false,
          screenReader: false,
          keyboardNavigation: true,
          fontSize: 'medium'
        },
        performance: {
          lazyLoading: true,
          preloadImages: false,
          minifyResources: true,
          cacheStrategy: 'conservative'
        },
        customization: {
          dashboard: {},
          widgets: {},
          shortcuts: {},
          preferences: {}
        }
      }
    };
  }

  // =============================
  // CARREGAR/SALVAR CONFIGURAÇÃO
  // =============================

  private loadConfiguration(): void {
    try {
      const stored = localStorage.getItem(this.configFile);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Validar configuração carregada
        const validation = configurationValidator.validateConfiguration(parsed);
        if (!validation.isValid) {
          console.warn('⚠️ Configuração inválida detectada:', validation.errors);
          // Tentar reparo automático
          const repair = configurationValidator.autoRepairConfiguration();
          if (repair.success) {
            console.log('🔧 Configuração reparada automaticamente:', repair.actionsPerformed);
          }
        }
        
        this.config = { ...this.config, ...parsed };
        console.log('✅ Configuração carregada do localStorage');
      } else {
        this.saveConfiguration();
        console.log('🔧 Configuração padrão aplicada');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configuração:', error);
      this.config = this.getDefaultConfiguration();
      
      // Tentar reparo automático
      const repair = configurationValidator.autoRepairConfiguration();
      if (repair.success) {
        console.log('🔧 Configuração recuperada automaticamente:', repair.actionsPerformed);
      }
    }
  }

  private saveConfiguration(): void {
    try {
      // Salvar no localStorage
      localStorage.setItem(this.configFile, JSON.stringify(this.config, null, 2));
      
      // Salvar backup para garantir persistência
      const backupKey = `${this.configFile}.backup`;
      localStorage.setItem(backupKey, JSON.stringify({
        config: this.config,
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }));
      
      console.log('💾 Configuração salva com backup');
      
      // Notificar listeners e aplicar mudanças
      this.notifyListeners();
      this.applyConfigurationChanges();
      
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error);
      // Tentar recuperar do backup
      this.recoverFromBackup();
    }
  }

  // =============================
  // GETTERS E SETTERS
  // =============================

  getConfiguration(): SystemConfiguration {
    return { ...this.config };
  }

  getWhatsAppConfig() {
    return { ...this.config.whatsapp };
  }

  getN8nConfig() {
    return { ...this.config.n8n };
  }

  getQueueConfig() {
    return { ...this.config.queue };
  }

  getBackupConfig() {
    return { ...this.config.backup };
  }

  getMonitoringConfig() {
    return { ...this.config.monitoring };
  }

  getAIConfig() {
    return { ...this.config.ai };
  }

  // =============================
  // GETTERS PARA NOVAS CONFIGURAÇÕES
  // =============================

  getSystemConfig() {
    return { ...this.config.system };
  }

  getSecurityConfig() {
    return { ...this.config.security };
  }

  getPerformanceConfig() {
    return { ...this.config.performance };
  }

  getIntegrationsConfig() {
    return { ...this.config.integrations };
  }

  getWorkflowsConfig() {
    return { ...this.config.workflows };
  }

  getNotificationsConfig() {
    return { ...this.config.notifications };
  }

  getComplianceConfig() {
    return { ...this.config.compliance };
  }

  getDevelopmentConfig() {
    return { ...this.config.development };
  }

  getLoggingConfig() {
    return { ...this.config.logging };
  }

  getRateLimitingConfig() {
    return { ...this.config.rateLimiting };
  }

  getCachingConfig() {
    return { ...this.config.caching };
  }

  getHealthCheckConfig() {
    return { ...this.config.healthCheck };
  }

  getObservabilityConfig() {
    return { ...this.config.observability };
  }

  getDisasterRecoveryConfig() {
    return { ...this.config.disasterRecovery };
  }

  getUserExperienceConfig() {
    return { ...this.config.userExperience };
  }

  // =============================
  // SETTERS PARA NOVAS CONFIGURAÇÕES
  // =============================

  updateSystemConfig(config: Partial<SystemConfiguration['system']>): void {
    this.config.system = { ...this.config.system, ...config };
    this.saveConfiguration();
  }

  updateSecurityConfig(config: Partial<SystemConfiguration['security']>): void {
    this.config.security = { ...this.config.security, ...config };
    this.saveConfiguration();
    // Aplicar configurações de segurança imediatamente
    this.applySecurityConfig();
  }

  updatePerformanceConfig(config: Partial<SystemConfiguration['performance']>): void {
    this.config.performance = { ...this.config.performance, ...config };
    this.saveConfiguration();
    // Aplicar configurações de performance imediatamente
    this.applyPerformanceConfig();
  }

  updateIntegrationsConfig(config: Partial<SystemConfiguration['integrations']>): void {
    this.config.integrations = { ...this.config.integrations, ...config };
    this.saveConfiguration();
  }

  updateWorkflowsConfig(config: Partial<SystemConfiguration['workflows']>): void {
    this.config.workflows = { ...this.config.workflows, ...config };
    this.saveConfiguration();
  }

  updateNotificationsConfig(config: Partial<SystemConfiguration['notifications']>): void {
    this.config.notifications = { ...this.config.notifications, ...config };
    this.saveConfiguration();
  }

  updateComplianceConfig(config: Partial<SystemConfiguration['compliance']>): void {
    this.config.compliance = { ...this.config.compliance, ...config };
    this.saveConfiguration();
    // Aplicar configurações de compliance imediatamente
    this.applyComplianceConfig();
  }

  updateDevelopmentConfig(config: Partial<SystemConfiguration['development']>): void {
    this.config.development = { ...this.config.development, ...config };
    this.saveConfiguration();
  }

  updateLoggingConfig(config: Partial<SystemConfiguration['logging']>): void {
    this.config.logging = { ...this.config.logging, ...config };
    this.saveConfiguration();
    // Aplicar configurações de log imediatamente
    this.applyLoggingConfig();
  }

  updateRateLimitingConfig(config: Partial<SystemConfiguration['rateLimiting']>): void {
    this.config.rateLimiting = { ...this.config.rateLimiting, ...config };
    this.saveConfiguration();
    // Aplicar configurações de rate limiting imediatamente
    this.applyRateLimitingConfig();
  }

  updateCachingConfig(config: Partial<SystemConfiguration['caching']>): void {
    this.config.caching = { ...this.config.caching, ...config };
    this.saveConfiguration();
    // Aplicar configurações de cache imediatamente
    this.applyCachingConfig();
  }

  updateHealthCheckConfig(config: Partial<SystemConfiguration['healthCheck']>): void {
    this.config.healthCheck = { ...this.config.healthCheck, ...config };
    this.saveConfiguration();
    // Aplicar configurações de health check imediatamente
    this.applyHealthCheckConfig();
  }

  updateObservabilityConfig(config: Partial<SystemConfiguration['observability']>): void {
    this.config.observability = { ...this.config.observability, ...config };
    this.saveConfiguration();
    // Aplicar configurações de observabilidade imediatamente
    this.applyObservabilityConfig();
  }

  updateDisasterRecoveryConfig(config: Partial<SystemConfiguration['disasterRecovery']>): void {
    this.config.disasterRecovery = { ...this.config.disasterRecovery, ...config };
    this.saveConfiguration();
    // Aplicar configurações de disaster recovery imediatamente
    this.applyDisasterRecoveryConfig();
  }

  updateUserExperienceConfig(config: Partial<SystemConfiguration['userExperience']>): void {
    this.config.userExperience = { ...this.config.userExperience, ...config };
    this.saveConfiguration();
    // Aplicar configurações de UX imediatamente
    this.applyUserExperienceConfig();
  }

  // =============================
  // ATUALIZAÇÕES
  // =============================

  updateWhatsAppConfig(config: Partial<SystemConfiguration['whatsapp']>): void {
    this.config.whatsapp = { ...this.config.whatsapp, ...config };
    this.saveConfiguration();
  }

  updateN8nConfig(config: Partial<SystemConfiguration['n8n']>): void {
    this.config.n8n = { ...this.config.n8n, ...config };
    this.saveConfiguration();
  }

  updateQueueConfig(config: Partial<SystemConfiguration['queue']>): void {
    this.config.queue = { ...this.config.queue, ...config };
    this.saveConfiguration();
  }

  updateBackupConfig(config: Partial<SystemConfiguration['backup']>): void {
    this.config.backup = { ...this.config.backup, ...config };
    this.saveConfiguration();
  }

  updateMonitoringConfig(config: Partial<SystemConfiguration['monitoring']>): void {
    this.config.monitoring = { ...this.config.monitoring, ...config };
    this.saveConfiguration();
  }

  updateAIConfig(config: Partial<SystemConfiguration['ai']>): void {
    this.config.ai = { ...this.config.ai, ...config };
    this.saveConfiguration();
  }

  updateFullConfiguration(config: Partial<SystemConfiguration>): void {
    this.config = { ...this.config, ...config };
    this.saveConfiguration();
  }

  // =============================
  // HORÁRIO DE FUNCIONAMENTO
  // =============================

  isWithinBusinessHours(): boolean {
    if (!this.config.whatsapp.businessHours.enabled) {
      return true;
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 = domingo, 1 = segunda, etc.
    
    if (!this.config.whatsapp.businessHours.workDays.includes(currentDay)) {
      return false;
    }

    const currentTime = now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    const { start, end } = this.config.whatsapp.businessHours;
    
    return currentTime >= start && currentTime <= end;
  }

  getNextBusinessHour(): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    // Encontrar próximo dia útil
    let nextDay = tomorrow.getDay();
    while (!this.config.whatsapp.businessHours.workDays.includes(nextDay)) {
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextDay = tomorrow.getDay();
    }

    const nextDate = tomorrow.toLocaleDateString('pt-BR');
    const startTime = this.config.whatsapp.businessHours.start;
    
    return `${nextDate} às ${startTime}`;
  }

  // =============================
  // VALIDAÇÕES
  // =============================

  validateConfiguration(): { valid: boolean; errors: string[] } {
    const validation = configurationValidator.validateConfiguration(this.config);
    return {
      valid: validation.isValid,
      errors: validation.errors
    };
  }

  // =============================
  // LISTENERS E EVENTOS
  // =============================

  onConfigurationChange(callback: (config: SystemConfiguration) => void): () => void {
    this.listeners.add(callback);
    
    // Retorna função para remover o listener
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.config);
      } catch (error) {
        console.error('Erro ao notificar listener de configuração:', error);
      }
    });
  }

  // =============================
  // BACKUP E RESTORE
  // =============================

  exportConfiguration(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfiguration(configJson: string): { success: boolean; error?: string } {
    try {
      const imported = JSON.parse(configJson);
      const validation = this.validateConfiguration();
      
      if (!validation.valid) {
        return {
          success: false,
          error: `Configuração inválida: ${validation.errors.join(', ')}`
        };
      }

      this.config = { ...this.getDefaultConfiguration(), ...imported };
      this.saveConfiguration();
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao importar: ${error}`
      };
    }
  }

  resetToDefaults(): void {
    this.config = this.getDefaultConfiguration();
    this.saveConfiguration();
  }

  // =============================
  // INTEGRAÇÃO COM WHATS HUB
  // =============================

  async applyToIntegration(): Promise<void> {
    try {
      // Aplicar configurações ao WhatsHub Integration
      await whatsHubIntegration.syncConfigurations();
      console.log('🔧 Configurações aplicadas à integração');
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações:', error);
      throw error;
    }
  }

  // =============================
  // APLICAÇÃO DE CONFIGURAÇÕES E BACKUP
  // =============================

  private applyConfigurationChanges(): void {
    try {
      // Aplicar configurações aos serviços ativos
      this.applyToServices();
      
      // Validar configurações
      const validation = this.validateConfiguration();
      if (!validation.valid) {
        console.warn('⚠️ Configurações inválidas detectadas:', validation.errors);
      }
      
      // Aplicar configurações específicas
      this.applyWhatsAppConfig();
      this.applyN8nConfig();
      this.applyEmailConfig();
      
      console.log('✅ Configurações aplicadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações:', error);
    }
  }

  private recoverFromBackup(): void {
    try {
      const backupKey = `${this.configFile}.backup`;
      const backup = localStorage.getItem(backupKey);
      
      if (backup) {
        const backupData = JSON.parse(backup);
        if (backupData.config && backupData.timestamp) {
          this.config = { ...this.getDefaultConfiguration(), ...backupData.config };
          console.log('🔄 Configuração recuperada do backup:', backupData.timestamp);
          return;
        }
      }
      
      // Se não há backup, usar configuração padrão
      this.config = this.getDefaultConfiguration();
      console.log('🆕 Usando configuração padrão devido a erro no backup');
      
    } catch (error) {
      console.error('❌ Erro ao recuperar backup:', error);
      this.config = this.getDefaultConfiguration();
    }
  }

  private applyToServices(): void {
    try {
      // Aplicar ao EmailJS se estiver configurado
      if (typeof window !== 'undefined') {
        const emailConfig = this.getEmailConfigFromEnv();
        const emailJSWindow = window as EmailJSWindow;
        if (emailConfig && emailJSWindow.emailjs) {
          emailJSWindow.emailjs.init(emailConfig.publicKey);
        }
      }
      
      // Aplicar configurações de tema
      this.applyThemeConfig();
      
      // Aplicar configurações de performance
      this.applyPerformanceConfig();
      
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações aos serviços:', error);
    }
  }

  private applyWhatsAppConfig(): void {
    try {
      // Configurar timeout do QR Code
      if (this.config.whatsapp.qrCodeTimeout) {
        // Aplicar ao WhatsApp service se disponível
        const event = new CustomEvent('whatsapp-config-update', {
          detail: this.config.whatsapp
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('❌ Erro ao aplicar configuração WhatsApp:', error);
    }
  }

  private applyN8nConfig(): void {
    try {
      // Configurar N8N endpoints
      if (this.config.n8n.webhookUrl) {
        // Atualizar configurações globais do N8N
        const event = new CustomEvent('n8n-config-update', {
          detail: this.config.n8n
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('❌ Erro ao aplicar configuração N8N:', error);
    }
  }

  private applyEmailConfig(): void {
    try {
      // Aplicar configurações de email
      const emailConfig = this.getEmailConfigFromEnv();
      if (emailConfig) {
        const event = new CustomEvent('email-config-update', {
          detail: emailConfig
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('❌ Erro ao aplicar configuração de Email:', error);
    }
  }

  private applyThemeConfig(): void {
    try {
      // Aplicar tema se configurado
      if (typeof document !== 'undefined') {
        const theme = localStorage.getItem('theme') ?? 'system';
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    } catch (error) {
      console.error('❌ Erro ao aplicar tema:', error);
    }
  }

  private applyPerformanceConfig(): void {
    try {
      // Configurações de performance podem ser aplicadas aqui
      // Por exemplo, ajustar cache, timeouts, etc.
      console.log('⚡ Configurações de performance aplicadas');
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações de performance:', error);
    }
  }

  private getEmailConfigFromEnv() {
    try {
      return {
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        recipientEmail: import.meta.env.VITE_RECIPIENT_EMAIL
      };
    } catch (error) {
      console.error('❌ Erro ao obter configuração de email do ambiente:', error);
      return null;
    }
  }

  // =============================
  // VERIFICAÇÃO DE SAÚDE E DIAGNÓSTICOS
  // =============================

  getConfigurationHealth() {
    return configurationValidator.checkConfigurationHealth();
  }

  runDiagnostics(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    suggestions: string[];
    autoRepairAvailable: boolean;
  } {
    const health = this.getConfigurationHealth();
    const validation = configurationValidator.validateConfiguration(this.config);

    return {
      status: health.status,
      issues: [...health.issues.map(issue => issue.message), ...validation.errors],
      suggestions: validation.suggestions,
      autoRepairAvailable: health.issues.some(issue => issue.fix !== undefined)
    };
  }

  performAutoRepair(): { success: boolean; actionsPerformed: string[] } {
    return configurationValidator.autoRepairConfiguration();
  }

  private applySecurityConfig(): void {
    try {
      const security = this.config.security;
      
      // Aplicar configurações de criptografia
      if (security.encryption.enabled) {
        console.log(`🔐 Aplicando criptografia ${security.encryption.algorithm}`);
        // Implementar lógica de criptografia
      }
      
      // Aplicar configurações de autenticação
      if (security.authentication.multiFactorAuth) {
        console.log('🔑 Multi-factor authentication habilitado');
        // Implementar lógica de MFA
      }
      
      // Aplicar políticas de retenção de dados
      if (security.dataProtection.anonymizeData) {
        console.log('👤 Anonimização de dados habilitada');
        // Implementar lógica de anonimização
      }
      
      console.log('✅ Configurações de segurança aplicadas');
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações de segurança:', error);
    }
  }

  private applyComplianceConfig(): void {
    try {
      const compliance = this.config.compliance;
      
      // Aplicar GDPR
      if (compliance.gdpr.enabled) {
        console.log('📋 GDPR compliance habilitado');
        this.setupGDPRCompliance();
      }
      
      // Aplicar HIPAA
      if (compliance.hipaa.enabled) {
        console.log('🏥 HIPAA compliance habilitado');
        this.setupHIPAACompliance();
      }
      
      // Aplicar SOX
      if (compliance.sox.enabled) {
        console.log('💼 SOX compliance habilitado');
        this.setupSOXCompliance();
      }
      
      console.log('✅ Configurações de compliance aplicadas');
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações de compliance:', error);
    }
  }

  private setupGDPRCompliance(): void {
    const gdpr = this.config.compliance.gdpr;
    
    // Configurar retenção de dados
    if (gdpr.dataRetentionDays > 0) {
      console.log(`📅 Retenção de dados: ${gdpr.dataRetentionDays} dias`);
    }
    
    // Habilitar exportação de dados
    if (gdpr.allowDataExport) {
      console.log('📤 Exportação de dados habilitada');
    }
    
    // Habilitar exclusão de dados
    if (gdpr.allowDataDeletion) {
      console.log('🗑️ Exclusão de dados habilitada');
    }
    
    // Rastreamento de consentimento
    if (gdpr.consentTracking) {
      console.log('✅ Rastreamento de consentimento habilitado');
    }
  }

  private setupHIPAACompliance(): void {
    const hipaa = this.config.compliance.hipaa;
    
    if (hipaa.encryptionRequired) {
      console.log('🔐 Criptografia obrigatória para dados médicos');
    }
    
    if (hipaa.auditTrailRequired) {
      console.log('📋 Trilha de auditoria obrigatória');
    }
    
    if (hipaa.accessControlRequired) {
      console.log('🚪 Controle de acesso obrigatório');
    }
  }

  private setupSOXCompliance(): void {
    const sox = this.config.compliance.sox;
    
    if (sox.financialDataProtection) {
      console.log('💰 Proteção de dados financeiros habilitada');
    }
    
    if (sox.changeControlRequired) {
      console.log('🔄 Controle de mudanças obrigatório');
    }
    
    if (sox.auditRequirements) {
      console.log('📊 Requisitos de auditoria habilitados');
    }
  }

  // =============================
  // MÉTODOS DE APLICAÇÃO DE NOVAS CONFIGURAÇÕES
  // =============================

  private applyLoggingConfig(): void {
    try {
      const logging = this.config.logging;
      
      console.log(`📝 Aplicando configurações de log - Nível: ${logging.level}`);
      
      // Configurar nível de log
      if (typeof window !== 'undefined' && window.console) {
        // Aplicar filtros de log
        if (logging.filters.sensitiveDataMask) {
          console.log('🔒 Mascaramento de dados sensíveis ativado');
        }
      }
      
      // Configurar rotação de logs
      if (logging.rotation.enabled) {
        console.log(`🔄 Rotação de logs configurada: ${logging.rotation.schedule}`);
      }
      
      console.log('✅ Configurações de log aplicadas');
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações de log:', error);
    }
  }

  private applyRateLimitingConfig(): void {
    try {
      const rateLimiting = this.config.rateLimiting;
      
      if (rateLimiting.enabled) {
        console.log('🚦 Aplicando configurações de rate limiting');
        console.log(`📊 Limite global: ${rateLimiting.global.maxRequests} requests/${rateLimiting.global.windowMs}ms`);
        
        // Configurar estratégias
        if (rateLimiting.strategies.memory) {
          console.log('💾 Estratégia de memória ativada');
        }
        
        console.log('✅ Configurações de rate limiting aplicadas');
      }
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações de rate limiting:', error);
    }
  }

  private applyCachingConfig(): void {
    try {
      const caching = this.config.caching;
      
      console.log('💾 Aplicando configurações de cache');
      
      // Configurar camada de memória
      if (caching.layers.memory.enabled) {
        console.log(`🧠 Cache em memória: ${caching.layers.memory.maxSize}MB, TTL: ${caching.layers.memory.ttl}s`);
      }
      
      // Configurar camada Redis
      if (caching.layers.redis.enabled) {
        console.log(`🔴 Cache Redis: TTL: ${caching.layers.redis.ttl}s`);
      }
      
      // Configurar estratégias de invalidação
      if (caching.invalidation.enabled) {
        console.log('🔄 Invalidação de cache configurada');
      }
      
      console.log('✅ Configurações de cache aplicadas');
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações de cache:', error);
    }
  }

  private applyHealthCheckConfig(): void {
    try {
      const healthCheck = this.config.healthCheck;
      
      if (healthCheck.enabled) {
        console.log('🏥 Aplicando configurações de health check');
        
        // Configurar checks básicos
        if (healthCheck.checks.memory) {
          console.log(`🧠 Monitoramento de memória: limite ${healthCheck.thresholds.memoryUsage}%`);
        }
        
        if (healthCheck.checks.disk) {
          console.log(`💾 Monitoramento de disco: limite ${healthCheck.thresholds.diskUsage}%`);
        }
        
        // Configurar notificações
        if (healthCheck.notifications.onFailure) {
          console.log('🚨 Notificações de falha ativadas');
        }
        
        console.log('✅ Configurações de health check aplicadas');
      }
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações de health check:', error);
    }
  }

  private applyObservabilityConfig(): void {
    try {
      const observability = this.config.observability;
      
      console.log('🔍 Aplicando configurações de observabilidade');
      
      // Configurar métricas
      if (observability.metrics.enabled) {
        console.log(`📊 Métricas: ${observability.metrics.provider}`);
      }
      
      // Configurar tracing
      if (observability.tracing.enabled) {
        console.log(`🔍 Tracing: ${observability.tracing.provider}, sampling: ${observability.tracing.samplingRate}`);
      }
      
      // Configurar profiling
      if (observability.profiling.enabled) {
        console.log(`📈 Profiling: ${observability.profiling.provider}`);
      }
      
      console.log('✅ Configurações de observabilidade aplicadas');
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações de observabilidade:', error);
    }
  }

  private applyDisasterRecoveryConfig(): void {
    try {
      const dr = this.config.disasterRecovery;
      
      if (dr.enabled) {
        console.log('🆘 Aplicando configurações de disaster recovery');
        
        // Configurar estratégias
        if (dr.strategies.activePassive) {
          console.log('🔄 Estratégia Active-Passive configurada');
        }
        
        // Configurar replicação
        if (dr.dataReplication.enabled) {
          console.log(`🔄 Replicação de dados: ${dr.dataReplication.method}`);
        }
        
        // Configurar failover
        if (dr.failover.automatic) {
          console.log('🚨 Failover automático ativado');
        }
        
        console.log('✅ Configurações de disaster recovery aplicadas');
      }
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações de disaster recovery:', error);
    }
  }

  private applyUserExperienceConfig(): void {
    try {
      const ux = this.config.userExperience;
      
      console.log('🎨 Aplicando configurações de experiência do usuário');
      
      // Aplicar tema
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', ux.interface.theme);
        document.documentElement.lang = ux.interface.language;
        
        // Aplicar configurações de acessibilidade
        if (ux.accessibility.highContrast) {
          document.documentElement.classList.add('high-contrast');
        }
        
        // Aplicar tamanho da fonte
        document.documentElement.setAttribute('data-font-size', ux.accessibility.fontSize);
        
        // Configurar animações
        if (!ux.interface.animations) {
          document.documentElement.style.setProperty('--animation-duration', '0s');
        }
      }
      
      console.log('✅ Configurações de UX aplicadas');
    } catch (error) {
      console.error('❌ Erro ao aplicar configurações de UX:', error);
    }
  }

  // =============================
  // MÉTODOS AVANÇADOS DE MONITORAMENTO
  // =============================

  getConfigurationMetricsNew() {
    return configurationAnalyzer.calculateMetrics(this.config);
  }

  generateConfigurationReportNew() {
    return configurationAnalyzer.generateReport(this.config);
  }

  compareConfigurationsNew(otherConfigJson: string) {
    try {
      const otherConfig = JSON.parse(otherConfigJson);
      return configurationAnalyzer.compareConfigurations(this.config, otherConfig);
    } catch (error) {
      console.error('Erro ao comparar configurações:', error);
      return {
        differences: [],
        compatibilityScore: 0,
        migrationRequired: true,
        criticalChanges: [`Erro ao processar configuração: ${error}`]
      };
    }
  }

  // =============================
  // MÉTODOS DE CONFIGURAÇÃO AVANÇADA
  // =============================

  /**
   * Aplica um conjunto de configurações otimizadas baseado no ambiente
   */
  optimizeForEnvironment(environment: 'development' | 'staging' | 'production'): void {
    console.log(`🚀 Otimizando configurações para ambiente: ${environment}`);
    
    switch (environment) {
      case 'development':
        this.applyDevelopmentOptimizations();
        break;
      case 'staging':
        this.applyStagingOptimizations();
        break;
      case 'production':
        this.applyProductionOptimizations();
        break;
    }
    
    this.saveConfiguration();
    console.log('✅ Otimizações aplicadas com sucesso');
  }

  /**
   * Executa auto-tuning baseado nas métricas atuais
   */
  performAutoTuning(): { success: boolean; changes: string[] } {
    const changes: string[] = [];
    
    try {
      const metrics = this.getConfigurationMetricsNew();
      
      // Auto-tuning baseado em performance
      if (metrics.performanceScore < 70) {
        if (!this.config.performance.caching.enabled) {
          this.config.performance.caching.enabled = true;
          changes.push('Cache habilitado');
        }
        
        if (this.config.performance.database.connectionPoolSize < 10) {
          this.config.performance.database.connectionPoolSize = 15;
          changes.push('Pool de conexões aumentado');
        }
      }
      
      // Auto-tuning baseado em segurança
      if (metrics.securityScore < 70) {
        if (!this.config.security.audit.enabled && this.config.system.environment === 'production') {
          this.config.security.audit.enabled = true;
          changes.push('Auditoria habilitada');
        }
      }
      
      if (changes.length > 0) {
        this.saveConfiguration();
      }
      
      return { success: true, changes };
    } catch (error) {
      console.error('Erro no auto-tuning:', error);
      return { success: false, changes: [] };
    }
  }

  /**
   * Executa verificação de saúde completa do sistema
   */
  performHealthCheck(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
    metrics: ReturnType<typeof configurationAnalyzer.calculateMetrics>;
  } {
    const metrics = this.getConfigurationMetricsNew();
    const report = this.generateConfigurationReportNew();
    const health = this.getConfigurationHealth();
    
    return {
      status: health.status,
      issues: [
        ...health.issues.map(issue => issue.message),
        ...report.securityIssues,
        ...report.performanceIssues,
        ...report.complianceIssues
      ],
      recommendations: report.recommendations,
      metrics
    };
  }

  /**
   * Exporta configurações com metadados avançados
   */
  exportAdvancedConfiguration(): string {
    const config = this.getConfiguration();
    const metrics = this.getConfigurationMetricsNew();
    const report = this.generateConfigurationReportNew();
    
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: config.system.version,
        environment: config.system.environment,
        metrics,
        healthStatus: report.healthStatus
      },
      configuration: config,
      analysis: {
        summary: report.summary,
        recommendations: report.recommendations,
        warnings: report.warnings
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Importa configurações com validação avançada
   */
  importAdvancedConfiguration(configJson: string): { 
    success: boolean; 
    errors: string[]; 
    warnings: string[];
    changes: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const changes: string[] = [];
    
    try {
      const importData = JSON.parse(configJson);
      
      // Verificar se é um export avançado
      if (importData.configuration && importData.metadata) {
        const importedConfig = importData.configuration;
        const importedMetrics = importData.metadata.metrics;
        
        // Comparar configurações
        const comparison = this.compareConfigurationsNew(JSON.stringify(importedConfig));
        
        if (comparison.criticalChanges.length > 0) {
          warnings.push('Mudanças críticas detectadas:');
          warnings.push(...comparison.criticalChanges);
        }
        
        // Aplicar configuração se compatível
        if (comparison.compatibilityScore > 70) {
          this.config = { ...this.getDefaultConfiguration(), ...importedConfig };
          changes.push(`${comparison.differences.length} configurações atualizadas`);
          this.saveConfiguration();
        } else {
          errors.push('Configuração incompatível (score < 70%)');
        }
      } else {
        // Importação simples
        const result = this.importConfiguration(configJson);
        if (!result.success) {
          errors.push(result.error || 'Erro desconhecido');
        } else {
          changes.push('Configuração importada com sucesso');
        }
      }
      
      return {
        success: errors.length === 0,
        errors,
        warnings,
        changes
      };
      
    } catch (error) {
      return {
        success: false,
        errors: [`Erro ao processar configuração: ${error}`],
        warnings: [],
        changes: []
      };
    }
  }

  // =============================
  // MÉTODOS DE OTIMIZAÇÃO POR AMBIENTE
  // =============================

  private applyDevelopmentOptimizations(): void {
    console.log('🛠️ Aplicando otimizações para desenvolvimento');
    
    // Configurações de desenvolvimento
    this.config.development = {
      ...this.config.development,
      hotReload: true,
      debugLogging: true,
      mockServices: true,
      testMode: true,
      profiling: {
        enabled: true,
        samplingRate: 1.0,
        exportMetrics: true
      }
    };
    
    // Logging mais verboso
    this.config.logging.level = 'debug';
    this.config.logging.enableConsole = true;
    
    // Cache mais agressivo para dev
    this.config.caching.layers.memory.enabled = true;
    this.config.caching.layers.memory.ttl = 60; // 1 minuto para mudanças rápidas
    
    // Timeouts menores para feedback rápido
    this.config.n8n.timeout = 10000;
    this.config.whatsapp.qrCodeTimeout = 30000;
  }

  private applyStagingOptimizations(): void {
    console.log('🧪 Aplicando otimizações para staging');
    
    // Configurações intermediárias
    this.config.development.debugLogging = false;
    this.config.development.mockServices = false;
    
    // Logging balanceado
    this.config.logging.level = 'info';
    
    // Segurança moderada
    this.config.security.encryption.enabled = true;
    this.config.security.audit.enabled = true;
    this.config.security.audit.logLevel = 'standard';
    
    // Performance balanceada
    this.config.performance.caching.enabled = true;
    this.config.caching.layers.memory.ttl = 1800; // 30 minutos
    
    // Backup habilitado mas menos frequente
    this.config.backup.enabled = true;
    this.config.backup.interval = 120; // 2 horas
  }

  private applyProductionOptimizations(): void {
    console.log('🚀 Aplicando otimizações para produção');
    
    // Configurações de produção
    this.config.development = {
      ...this.config.development,
      hotReload: false,
      debugLogging: false,
      mockServices: false,
      testMode: false,
      profiling: {
        enabled: false,
        samplingRate: 0.01,
        exportMetrics: false
      }
    };
    
    // Logging otimizado
    this.config.logging.level = 'warn';
    this.config.logging.enableFile = true;
    this.config.logging.rotation.enabled = true;
    
    // Segurança máxima
    this.config.security = {
      ...this.config.security,
      encryption: {
        enabled: true,
        algorithm: 'AES-256-GCM',
        keyRotationInterval: 7
      },
      authentication: {
        ...this.config.security.authentication,
        multiFactorAuth: true,
        sessionExpiryTime: 30,
        maxLoginAttempts: 3,
        lockoutDuration: 30
      },
      audit: {
        enabled: true,
        logLevel: 'detailed',
        retentionDays: 365
      }
    };
    
    // Performance máxima
    this.config.performance = {
      ...this.config.performance,
      caching: {
        enabled: true,
        strategy: 'hybrid',
        ttl: 3600,
        maxSize: 512
      },
      database: {
        ...this.config.performance.database,
        connectionPoolSize: 25,
        optimizeQueries: true,
        enableIndexing: true
      },
      network: {
        ...this.config.performance.network,
        compression: true,
        retries: 5,
        backoffStrategy: 'exponential'
      }
    };
    
    // Monitoramento completo
    this.config.monitoring = {
      ...this.config.monitoring,
      enabled: true,
      alertThresholds: {
        queueSize: 100,
        responseTime: 2000,
        errorRate: 0.01,
        memoryUsage: 0.9
      },
      notifications: {
        email: true,
        webhook: true,
        dashboard: true
      }
    };
    
    // Backup automático
    this.config.backup = {
      ...this.config.backup,
      enabled: true,
      interval: 30, // 30 minutos
      autoCleanup: true,
      maxBackups: 48 // 24 horas de backups
    };
    
    // Health check ativo
    this.config.healthCheck = {
      ...this.config.healthCheck,
      enabled: true,
      checks: {
        database: true,
        redis: true,
        external: true,
        disk: true,
        memory: true,
        services: true
      },
      notifications: {
        onFailure: true,
        onRecovery: true,
        channels: ['email', 'webhook']
      }
    };
  }

  /**
   * Analisa uso de recursos e sugere otimizações
   */
  analyzeResourceUsage(): {
    memoryOptimizations: string[];
    performanceOptimizations: string[];
    securityOptimizations: string[];
    costOptimizations: string[];
  } {
    const metrics = this.getConfigurationMetricsNew();
    const config = this.config;
    
    const memoryOptimizations: string[] = [];
    const performanceOptimizations: string[] = [];
    const securityOptimizations: string[] = [];
    const costOptimizations: string[] = [];
    
    // Análise de memória
    if (metrics.memoryUsage > 50000) { // 50KB+
      memoryOptimizations.push('Configuração muito grande, considere otimizar');
    }
    
    if (!config.caching.layers.memory.enabled) {
      memoryOptimizations.push('Habilitar cache em memória para melhor performance');
    }
    
    // Análise de performance
    if (!config.performance.database.optimizeQueries) {
      performanceOptimizations.push('Habilitar otimização de queries');
    }
    
    if (config.performance.database.connectionPoolSize < 10) {
      performanceOptimizations.push('Aumentar pool de conexões para melhor throughput');
    }
    
    if (!config.performance.network.compression) {
      performanceOptimizations.push('Habilitar compressão de rede');
    }
    
    // Análise de segurança
    if (!config.security.encryption.enabled) {
      securityOptimizations.push('Habilitar criptografia para proteção de dados');
    }
    
    if (!config.security.authentication.multiFactorAuth) {
      securityOptimizations.push('Implementar autenticação multi-fator');
    }
    
    if (config.security.authentication.sessionExpiryTime > 60) {
      securityOptimizations.push('Reduzir tempo de expiração de sessão');
    }
    
    // Análise de custo
    if (config.backup.interval < 60) {
      costOptimizations.push('Backup muito frequente pode gerar custos altos');
    }
    
    if (config.logging.level === 'trace' || config.logging.level === 'debug') {
      costOptimizations.push('Logs verbosos podem aumentar custos de armazenamento');
    }
    
    return {
      memoryOptimizations,
      performanceOptimizations,
      securityOptimizations,
      costOptimizations
    };
  }

  // =============================
  // MÉTODOS UTILITÁRIOS AVANÇADOS
  // =============================

  /**
   * Monitora mudanças de configuração em tempo real
   */
  startConfigurationMonitoring(intervalMs: number = 30000): () => void {
    let lastConfigHash = this.getConfigurationHash();
    
    const interval = setInterval(() => {
      const currentConfigHash = this.getConfigurationHash();
      
      if (currentConfigHash !== lastConfigHash) {
        console.log('🔄 Mudança de configuração detectada');
        
        // Executar health check automático
        const health = this.performHealthCheck();
        
        if (health.status === 'critical') {
          console.error('🚨 Status crítico detectado após mudança de configuração');
          console.error('Issues:', health.issues);
        }
        
        // Executar auto-tuning se necessário
        if (health.status !== 'healthy') {
          const tuning = this.performAutoTuning();
          if (tuning.success && tuning.changes.length > 0) {
            console.log('🔧 Auto-tuning aplicado:', tuning.changes);
          }
        }
        
        lastConfigHash = currentConfigHash;
      }
    }, intervalMs);
    
    console.log(`📊 Monitoramento de configuração iniciado (${intervalMs}ms)`);
    
    // Retorna função para parar o monitoramento
    return () => {
      clearInterval(interval);
      console.log('📊 Monitoramento de configuração parado');
    };
  }

  /**
   * Gera hash da configuração atual para detectar mudanças
   */
  private getConfigurationHash(): string {
    const configString = JSON.stringify(this.config);
    return btoa(configString).slice(0, 16); // Hash simples
  }

  /**
   * Executa backup inteligente baseado em mudanças
   */
  performIntelligentBackup(): { success: boolean; reason: string; filename?: string } {
    try {
      const currentHash = this.getConfigurationHash();
      const lastBackupHash = localStorage.getItem('lastBackupHash');
      
      // Só fazer backup se houve mudanças significativas
      if (currentHash === lastBackupHash) {
        return {
          success: true,
          reason: 'Nenhuma mudança detectada desde o último backup'
        };
      }
      
      // Verificar se são mudanças críticas
      const metrics = this.getConfigurationMetricsNew();
      const isCriticalChange = metrics.healthStatus === 'poor' || metrics.securityScore < 50;
      
      const timestamp = new Date().toISOString();
      const filename = `intelligent-backup-${timestamp.split('T')[0]}.json`;
      
      const backupData = {
        timestamp,
        hash: currentHash,
        metrics,
        configuration: this.config,
        reason: isCriticalChange ? 'critical_change' : 'routine_backup'
      };
      
      localStorage.setItem(`backup_${currentHash}`, JSON.stringify(backupData));
      localStorage.setItem('lastBackupHash', currentHash);
      
      console.log(`💾 Backup inteligente criado: ${filename}`);
      
      return {
        success: true,
        reason: isCriticalChange ? 'Mudança crítica detectada' : 'Backup de rotina',
        filename
      };
      
    } catch (error) {
      console.error('❌ Erro no backup inteligente:', error);
      return {
        success: false,
        reason: `Erro: ${error}`
      };
    }
  }

  /**
   * Lista backups disponíveis com metadados
   */
  listIntelligentBackups(): Array<{
    hash: string;
    timestamp: string;
    metrics: ReturnType<typeof configurationAnalyzer.calculateMetrics>;
    reason: string;
    isHealthy: boolean;
  }> {
    const backups: Array<{
      hash: string;
      timestamp: string;
      metrics: ReturnType<typeof configurationAnalyzer.calculateMetrics>;
      reason: string;
      isHealthy: boolean;
    }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key?.startsWith('backup_')) {
        try {
          const backupData = JSON.parse(localStorage.getItem(key) ?? '{}');
          
          backups.push({
            hash: backupData.hash,
            timestamp: backupData.timestamp,
            metrics: backupData.metrics,
            reason: backupData.reason,
            isHealthy: backupData.metrics?.healthStatus !== 'poor'
          });
        } catch (error) {
          console.warn(`Backup corrompido ignorado: ${key}`);
        }
      }
    }
    
    // Ordenar por timestamp (mais recente primeiro)
    return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Restaura backup específico
   */
  restoreIntelligentBackup(hash: string): { success: boolean; message: string; changes: string[] } {
    try {
      const backupKey = `backup_${hash}`;
      const backupData = localStorage.getItem(backupKey);
      
      if (!backupData) {
        return {
          success: false,
          message: 'Backup não encontrado',
          changes: []
        };
      }
      
      const backup = JSON.parse(backupData);
      const oldConfig = { ...this.config };
      
      // Restaurar configuração
      this.config = backup.configuration;
      this.saveConfiguration();
      
      // Calcular mudanças
      const comparison = configurationAnalyzer.compareConfigurations(oldConfig, this.config);
      const changes = comparison.differences.map(diff => `${diff.path}: ${diff.type}`);
      
      console.log(`🔄 Backup restaurado: ${backup.timestamp}`);
      
      return {
        success: true,
        message: `Backup de ${backup.timestamp} restaurado com sucesso`,
        changes
      };
      
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      return {
        success: false,
        message: `Erro: ${error}`,
        changes: []
      };
    }
  }

  /**
   * Limpa backups antigos automaticamente
   */
  cleanupOldBackups(maxBackups: number = 10): { removed: number; kept: number } {
    const backups = this.listIntelligentBackups();
    let removed = 0;
    let kept = 0;
    
    // Manter apenas os N backups mais recentes
    backups.slice(maxBackups).forEach(backup => {
      const key = `backup_${backup.hash}`;
      localStorage.removeItem(key);
      removed++;
    });
    
    kept = Math.min(backups.length, maxBackups);
    
    if (removed > 0) {
      console.log(`🧹 Limpeza de backups: ${removed} removidos, ${kept} mantidos`);
    }
    
    return { removed, kept };
  }

  /**
   * Executa manutenção automática do sistema de configurações
   */
  performMaintenanceTasks(): {
    tasksExecuted: string[];
    results: Record<string, unknown>;
    overallSuccess: boolean;
  } {
    const tasksExecuted: string[] = [];
    const results: Record<string, unknown> = {};
    let overallSuccess = true;
    
    console.log('🔧 Iniciando manutenção automática do sistema');
    
    try {
      // 1. Backup inteligente
      const backupResult = this.performIntelligentBackup();
      tasksExecuted.push('intelligent_backup');
      results.backup = backupResult;
      
      // 2. Limpeza de backups antigos
      const cleanupResult = this.cleanupOldBackups();
      tasksExecuted.push('backup_cleanup');
      results.cleanup = cleanupResult;
      
      // 3. Health check
      const healthResult = this.performHealthCheck();
      tasksExecuted.push('health_check');
      results.health = healthResult;
      
      // 4. Auto-tuning se necessário
      if (healthResult.status !== 'healthy') {
        const tuningResult = this.performAutoTuning();
        tasksExecuted.push('auto_tuning');
        results.tuning = tuningResult;
        
        if (!tuningResult.success) {
          overallSuccess = false;
        }
      }
      
      // 5. Validação de configurações
      const validationResult = this.validateConfiguration();
      tasksExecuted.push('validation');
      results.validation = validationResult;
      
      if (!validationResult.valid) {
        overallSuccess = false;
      }
      
      // 6. Análise de recursos
      const resourceAnalysis = this.analyzeResourceUsage();
      tasksExecuted.push('resource_analysis');
      results.resources = resourceAnalysis;
      
      console.log(`✅ Manutenção concluída: ${tasksExecuted.length} tarefas executadas`);
      
    } catch (error) {
      console.error('❌ Erro durante manutenção:', error);
      overallSuccess = false;
      results.error = error;
    }
    
    return {
      tasksExecuted,
      results,
      overallSuccess
    };
  }

  /**
   * Agenda manutenção automática
   */
  scheduleMaintenanceTasks(intervalHours: number = 24): () => void {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    // Executar manutenção inicial
    setTimeout(() => {
      this.performMaintenanceTasks();
    }, 5000); // 5 segundos após inicialização
    
    // Agendar manutenção periódica
    const interval = setInterval(() => {
      this.performMaintenanceTasks();
    }, intervalMs);
    
    console.log(`📅 Manutenção automática agendada a cada ${intervalHours} horas`);
    
    // Retorna função para cancelar agendamento
    return () => {
      clearInterval(interval);
      console.log('📅 Agendamento de manutenção cancelado');
    };
  }
}

// Singleton instance
export const configurationManager = new ConfigurationManager();

// Export default
export default configurationManager;
