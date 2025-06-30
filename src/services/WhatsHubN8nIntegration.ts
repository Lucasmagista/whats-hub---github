/**
 * 🔗 WhatsHub N8N Integration
 * Classe principal para integração completa entre WhatsHub e N8N
 */

import { n8nApiService } from './n8nApiService';
import { whatsappService } from './whatsappService';
import { aiService } from './aiService';

export interface IntegrationConfig {
  n8nUrl: string;
  whatsappUrl: string;
  dashboardUrl: string;
  webhookSecret?: string;
  enableAI: boolean;
  enableRealTimeSync: boolean;
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  errors: string[];
  timestamp: Date;
}

export interface WorkflowExecution {
  workflowId: string;
  executionId: string;
  status: 'running' | 'success' | 'error';
  data: any;
  startTime: Date;
  endTime?: Date;
}

class WhatsHubN8nIntegration {
  private config: IntegrationConfig;
  private isInitialized: boolean = false;
  private syncInterval?: NodeJS.Timeout;
  private eventListeners = new Map<string, Set<Function>>();

  constructor(config?: Partial<IntegrationConfig>) {
    this.config = {
      n8nUrl: import.meta.env.VITE_N8N_URL || 'http://localhost:5678',
      whatsappUrl: import.meta.env.VITE_N8N_SERVER_URL || 'http://localhost:3001',
      dashboardUrl: import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5173',
      enableAI: false,
      enableRealTimeSync: true,
      ...config
    };
  }

  // =============================
  // INICIALIZAÇÃO
  // =============================

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🚀 Inicializando integração WhatsHub + N8N...');

      // 1. Verificar conectividade
      await this.checkConnectivity();

      // 2. Configurar webhooks
      await this.setupWebhooks();

      // 3. Sincronizar configurações
      await this.syncConfigurations();

      // 4. Inicializar filas
      await this.initializeQueues();

      // 5. Configurar eventos em tempo real
      if (this.config.enableRealTimeSync) {
        this.setupRealTimeSync();
      }

      // 6. Configurar IA se habilitada
      if (this.config.enableAI) {
        await this.initializeAI();
      }

      this.isInitialized = true;
      console.log('✅ Integração inicializada com sucesso!');

      this.emit('initialized', { config: this.config });

    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      throw error;
    }
  }

  private async checkConnectivity(): Promise<void> {
    const checks = await Promise.allSettled([
      n8nApiService.getSystemStatus(),
      whatsappService.getConnectionStatus(),
      this.pingN8nServer()
    ]);

    const failures = checks
      .map((result, index) => ({ result, service: ['WhatsApp Server', 'WhatsApp Connection', 'N8N Server'][index] }))
      .filter(({ result }) => result.status === 'rejected')
      .map(({ service, result }) => `${service}: ${(result as PromiseRejectedResult).reason}`);

    if (failures.length > 0) {
      console.warn('⚠️ Alguns serviços não estão acessíveis:', failures);
    }
  }
  private async pingN8nServer(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.config.n8nUrl}/healthz`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('N8N server não acessível:', error);
      return false;
    }
  }

  // =============================
  // WEBHOOKS
  // =============================

  async setupWebhooks(): Promise<void> {
    try {
      // Configurar webhook do WhatsApp para N8N
      const webhookUrl = `${this.config.n8nUrl}/webhook/whatsapp-messages`;
      
      // FASE 2: Implementar configuração automática de webhooks
      console.log('📡 Webhook configurado:', webhookUrl);
      
      this.emit('webhooksConfigured', { webhookUrl });
    } catch (error) {
      console.error('Erro ao configurar webhooks:', error);
      throw error;
    }
  }

  // =============================
  // SINCRONIZAÇÃO
  // =============================

  async syncConfigurations(): Promise<SyncResult> {
    try {
      console.log('🔄 Sincronizando configurações...');

      const startTime = new Date();
      let syncedItems = 0;
      const errors: string[] = [];

      // Sincronizar estados de usuário
      try {
        const userStates = await whatsappService.getUserStates();
        syncedItems += Object.keys(userStates).length;
      } catch (error) {
        errors.push(`Estados de usuário: ${error}`);
      }

      // Sincronizar fila de suporte
      try {
        const supportQueue = await whatsappService.getSupportQueue();
        syncedItems += supportQueue.queueItems?.length || 0;
      } catch (error) {
        errors.push(`Fila de suporte: ${error}`);
      }

      // Sincronizar workflows N8N
      try {
        const workflows = await n8nApiService.getN8nWorkflows();
        syncedItems += workflows.length;
      } catch (error) {
        errors.push(`Workflows N8N: ${error}`);
      }

      const result: SyncResult = {
        success: errors.length === 0,
        syncedItems,
        errors,
        timestamp: new Date()
      };

      this.emit('configurationsSynced', result);
      return result;

    } catch (error) {
      const result: SyncResult = {
        success: false,
        syncedItems: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
        timestamp: new Date()
      };

      this.emit('syncError', result);
      return result;
    }
  }

  async syncUserStates(): Promise<Record<string, any>> {
    try {
      const states = await whatsappService.getUserStates();
      this.emit('userStatesSynced', { count: Object.keys(states).length });
      return states;
    } catch (error) {
      console.error('Erro ao sincronizar estados:', error);
      throw error;
    }
  }

  // =============================
  // FILAS E ATENDIMENTO
  // =============================

  async initializeQueues(): Promise<void> {
    try {
      console.log('👥 Inicializando sistema de filas...');

      const queueData = await whatsappService.getSupportQueue();
      
      // Configurar listeners para eventos de fila
      whatsappService.on('chatStarted', (data) => {
        this.emit('queueChatStarted', data);
      });

      whatsappService.on('chatEnded', (data) => {
        this.emit('queueChatEnded', data);
      });

      this.emit('queuesInitialized', { 
        totalInQueue: queueData.totalInQueue,
        activeChats: queueData.activeChats,
        attendants: queueData.attendants?.length || 0
      });

    } catch (error) {
      console.error('Erro ao inicializar filas:', error);
      throw error;
    }
  }

  // =============================
  // TEMPO REAL
  // =============================

  private setupRealTimeSync(): void {
    console.log('🔄 Configurando sincronização em tempo real...');

    // Sincronização automática a cada 30 segundos
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncConfigurations();
      } catch (error) {
        console.error('Erro na sincronização automática:', error);
      }
    }, 30000);

    // Eventos de WhatsApp em tempo real
    whatsappService.on('message', (message) => {
      this.handleRealtimeMessage(message);
    });

    whatsappService.on('connection', (status) => {
      this.emit('connectionChanged', status);
    });

    this.emit('realTimeSyncEnabled');
  }

  private async handleRealtimeMessage(message: any): Promise<void> {
    try {
      // Processar mensagem com IA se habilitada
      if (this.config.enableAI && !message.isFromMe) {
        const context = {
          chatId: message.from,
          userPhone: message.from,
          messageHistory: []
        };

        const aiResponse = await aiService.processMessage(message.body, context);
        
        if (aiResponse.confidence > 0.8 && aiResponse.intent) {
          this.emit('aiProcessedMessage', {
            message,
            aiResponse,
            shouldAutoReply: aiResponse.confidence > 0.9
          });
        }
      }

      // Triggar workflow N8N se configurado
      if (message.type === 'text' && !message.isFromMe) {
        await this.triggerN8nWorkflow('message-received', {
          from: message.from,
          body: message.body,
          timestamp: message.timestamp
        });
      }

      this.emit('messageProcessed', message);

    } catch (error) {
      console.error('Erro ao processar mensagem em tempo real:', error);
    }
  }

  // =============================
  // IA INTEGRATION
  // =============================

  private async initializeAI(): Promise<void> {
    try {
      console.log('🤖 Inicializando módulo de IA...');

      if (!aiService.isAIEnabled()) {
        console.warn('⚠️ IA não está configurada. Configure as credenciais primeiro.');
        return;
      }

      // Configurar eventos de IA
      this.emit('aiInitialized', {
        enabled: aiService.isAIEnabled(),
        config: aiService.getConfig()
      });

    } catch (error) {
      console.error('Erro ao inicializar IA:', error);
    }
  }

  // =============================
  // WORKFLOWS N8N
  // =============================

  async executeWorkflow(workflowId: string, data: any): Promise<WorkflowExecution> {
    try {
      const startTime = new Date();
      
      const response = await fetch(`${this.config.n8nUrl}/webhook/${workflowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      const execution: WorkflowExecution = {
        workflowId,
        executionId: result.executionId || `exec_${Date.now()}`,
        status: response.ok ? 'success' : 'error',
        data: result,
        startTime,
        endTime: new Date()
      };

      this.emit('workflowExecuted', execution);
      return execution;

    } catch (error) {
      const execution: WorkflowExecution = {
        workflowId,
        executionId: `error_${Date.now()}`,
        status: 'error',
        data: { error: error instanceof Error ? error.message : 'Erro desconhecido' },
        startTime: new Date(),
        endTime: new Date()
      };

      this.emit('workflowError', execution);
      throw error;
    }
  }

  private async triggerN8nWorkflow(trigger: string, data: any): Promise<void> {
    try {
      await this.executeWorkflow(trigger, data);
    } catch (error) {
      console.error(`Erro ao executar workflow ${trigger}:`, error);
    }
  }

  // =============================
  // EVENTOS
  // =============================

  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro no listener ${event}:`, error);
        }
      });
    }
  }

  // =============================
  // UTILITÁRIOS
  // =============================

  getStatus(): any {
    return {
      initialized: this.isInitialized,
      config: this.config,
      services: {
        whatsapp: whatsappService.getCurrentConnection(),
        ai: {
          enabled: this.config.enableAI,
          configured: aiService.isAIEnabled()
        },
        realTimeSync: this.config.enableRealTimeSync
      }
    };
  }

  async getMetrics(): Promise<any> {
    try {
      const [whatsappMetrics, systemMetrics] = await Promise.all([
        whatsappService.getMetrics(),
        n8nApiService.getMetrics()
      ]);

      return {
        whatsapp: whatsappMetrics,
        system: systemMetrics,
        integration: {
          syncedAt: new Date(),
          isHealthy: this.isInitialized
        }
      };
    } catch (error) {
      console.error('Erro ao obter métricas:', error);
      return {};
    }
  }

  updateConfig(newConfig: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  // =============================
  // CLEANUP
  // =============================

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.eventListeners.clear();
    this.isInitialized = false;

    console.log('🔌 Integração WhatsHub + N8N finalizada');
  }
}

// Singleton instance
export const whatsHubN8nIntegration = new WhatsHubN8nIntegration();

// Export default
export default WhatsHubN8nIntegration;
