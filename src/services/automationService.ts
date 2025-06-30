/**
 * Comprehensive Automation Service
 * Integração completa com n8n, Zapier, Microsoft Power Automate, Make.com e outras plataformas
 */

import axios, { AxiosInstance } from 'axios';

// Tipos de plataformas suportadas
export type AutomationPlatform = 
  | 'n8n' 
  | 'zapier' 
  | 'power-automate' 
  | 'make' 
  | 'integromat' 
  | 'pipedream' 
  | 'automate-io'
  | 'workato'
  | 'tray-io'
  | 'custom-webhook';

// Tipos de eventos que podem disparar automações
export type TriggerEvent = 
  | 'message.received'
  | 'message.sent'
  | 'ticket.created'
  | 'ticket.updated'
  | 'ticket.closed'
  | 'user.joined'
  | 'user.left'
  | 'bot.started'
  | 'bot.stopped'
  | 'payment.received'
  | 'order.created'
  | 'custom.event';

// Interface para configuração de automação
export interface AutomationConfig {
  id?: string;
  name: string;
  description?: string;
  platform: AutomationPlatform;
  isActive: boolean;
  triggers: TriggerEvent[];
  webhookUrl: string;
  authentication: {
    type: 'none' | 'api-key' | 'oauth' | 'basic' | 'bearer' | 'custom';
    credentials?: Record<string, string>;
  };
  headers?: Record<string, string>;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  transformData?: boolean;
  dataMapping?: Record<string, string>;
  conditions?: AutomationCondition[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para condições de automação
export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'regex';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

// Interface para resultado de execução
export interface ExecutionResult {
  success: boolean;
  executionId: string;
  platform: AutomationPlatform;
  timestamp: string;
  duration: number;
  statusCode?: number;
  response?: any;
  error?: string;
  retryCount: number;
}

// Interface para estatísticas
export interface AutomationStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageResponseTime: number;
  successRate: number;
  lastExecution?: string;
  mostUsedPlatform: AutomationPlatform;
  dailyExecutions: Array<{ date: string; count: number }>;
}

class AutomationService {
  private automations: Map<string, AutomationConfig> = new Map();
  private executionHistory: ExecutionResult[] = [];
  private retryQueue: Array<{ config: AutomationConfig; event: TriggerEvent; data: any; attempt: number }> = [];
  private maxHistorySize = 1000;

  // Configurações específicas por plataforma
  private platformConfigs = {
    'n8n': {
      name: 'n8n',
      defaultPort: 5678,
      apiPath: '/api/v1',
      supportedAuth: ['none', 'api-key', 'basic'],
      webhookPath: '/webhook',
      executionPath: '/executions',
      workflowPath: '/workflows'
    },
    'zapier': {
      name: 'Zapier',
      baseUrl: 'https://hooks.zapier.com',
      supportedAuth: ['none'],
      webhookPath: '/hooks',
      rateLimit: 100 // requests per minute
    },
    'power-automate': {
      name: 'Microsoft Power Automate',
      baseUrl: 'https://prod-XX.westus.logic.azure.com',
      supportedAuth: ['oauth', 'api-key'],
      webhookPath: '/workflows',
      timeout: 30000
    },
    'make': {
      name: 'Make (formerly Integromat)',
      baseUrl: 'https://hook.integromat.com',
      supportedAuth: ['none', 'api-key'],
      webhookPath: '/webhook',
      maxPayloadSize: 1024 * 1024 // 1MB
    },
    'pipedream': {
      name: 'Pipedream',
      baseUrl: 'https://api.pipedream.com',
      supportedAuth: ['api-key'],
      webhookPath: '/v1/sources',
      apiVersion: 'v1'
    },
    'workato': {
      name: 'Workato',
      baseUrl: 'https://www.workato.com/webhooks',
      supportedAuth: ['none', 'api-key'],
      webhookPath: '/rest',
      enterprise: true
    }
  };

  constructor() {
    this.loadAutomations();
    this.startRetryProcessor();
  }

  /**
   * Registra uma nova automação
   */
  async registerAutomation(config: Omit<AutomationConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const automationId = this.generateId();
    const automation: AutomationConfig = {
      ...config,
      id: automationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validar configuração
    this.validateAutomationConfig(automation);

    // Testar conectividade se solicitado
    if (automation.platform !== 'custom-webhook') {
      await this.testConnection(automation);
    }

    this.automations.set(automationId, automation);
    await this.saveAutomations();

    console.log(`🔗 Automação registrada: ${automation.name} (${automation.platform})`);
    return automationId;
  }

  /**
   * Atualiza uma automação existente
   */
  async updateAutomation(automationId: string, updates: Partial<AutomationConfig>): Promise<void> {
    const existing = this.automations.get(automationId);
    if (!existing) {
      throw new Error(`Automação ${automationId} não encontrada`);
    }

    const updated: AutomationConfig = {
      ...existing,
      ...updates,
      id: automationId,
      updatedAt: new Date().toISOString()
    };

    this.validateAutomationConfig(updated);
    this.automations.set(automationId, updated);
    await this.saveAutomations();

    console.log(`🔄 Automação atualizada: ${automationId}`);
  }

  /**
   * Remove uma automação
   */
  async removeAutomation(automationId: string): Promise<void> {
    if (!this.automations.has(automationId)) {
      throw new Error(`Automação ${automationId} não encontrada`);
    }

    this.automations.delete(automationId);
    await this.saveAutomations();

    console.log(`🗑️ Automação removida: ${automationId}`);
  }

  /**
   * Dispara automações baseadas em um evento
   */
  async triggerEvent(event: TriggerEvent, data: any, context?: Record<string, any>): Promise<ExecutionResult[]> {
    const applicableAutomations = Array.from(this.automations.values())
      .filter(automation => 
        automation.isActive && 
        automation.triggers.includes(event)
      );

    if (applicableAutomations.length === 0) {
      console.log(`📡 Nenhuma automação ativa para evento: ${event}`);
      return [];
    }

    const results: ExecutionResult[] = [];

    for (const automation of applicableAutomations) {
      try {
        // Verificar condições se existirem
        if (automation.conditions && !this.evaluateConditions(automation.conditions, data, context)) {
          console.log(`⏭️ Condições não atendidas para automação: ${automation.name}`);
          continue;
        }

        const result = await this.executeAutomation(automation, event, data, context);
        results.push(result);

      } catch (error) {
        const errorResult: ExecutionResult = {
          success: false,
          executionId: this.generateId(),
          platform: automation.platform,
          timestamp: new Date().toISOString(),
          duration: 0,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          retryCount: 0
        };

        results.push(errorResult);

        // Adicionar à fila de retry se apropriado
        if (this.shouldRetry(error, automation)) {
          this.retryQueue.push({
            config: automation,
            event,
            data,
            attempt: 1
          });
        }
      }
    }

    return results;
  }

  /**
   * Executa uma automação específica
   */
  private async executeAutomation(
    automation: AutomationConfig, 
    event: TriggerEvent, 
    data: any, 
    context?: Record<string, any>
  ): Promise<ExecutionResult> {
    const executionId = this.generateId();
    const startTime = Date.now();

    console.log(`🚀 Executando automação: ${automation.name} (${automation.platform})`);

    try {
      // Preparar payload
      const payload = this.preparePayload(automation, event, data, context);

      // Preparar headers
      const headers = this.prepareHeaders(automation);

      // Criar cliente HTTP
      const client = this.createHttpClient(automation);

      // Executar webhook
      const response = await client.post(automation.webhookUrl, payload, {
        headers,
        timeout: automation.timeout,
        validateStatus: (status) => status >= 200 && status < 400
      });

      const duration = Date.now() - startTime;

      const result: ExecutionResult = {
        success: true,
        executionId,
        platform: automation.platform,
        timestamp: new Date().toISOString(),
        duration,
        statusCode: response.status,
        response: response.data,
        retryCount: 0
      };

      this.addToHistory(result);
      console.log(`✅ Automação executada com sucesso: ${automation.name} (${duration}ms)`);

      return result;

    } catch (error: any) {
      const duration = Date.now() - startTime;

      const result: ExecutionResult = {
        success: false,
        executionId,
        platform: automation.platform,
        timestamp: new Date().toISOString(),
        duration,
        statusCode: error.response?.status || 0,
        error: error.message,
        retryCount: 0
      };

      this.addToHistory(result);
      console.error(`❌ Falha na automação: ${automation.name} - ${error.message}`);

      throw error;
    }
  }

  /**
   * Prepara o payload baseado na plataforma e configurações
   */
  private preparePayload(automation: AutomationConfig, event: TriggerEvent, data: any, context?: Record<string, any>): any {
    let payload: any = {
      event,
      timestamp: new Date().toISOString(),
      data,
      context,
      source: 'whats-hub-bot'
    };

    // Transformações específicas por plataforma
    switch (automation.platform) {
      case 'n8n':
        payload = {
          ...payload,
          webhook_id: automation.id,
          n8n_source: 'whats-hub'
        };
        break;

      case 'zapier':
        // Zapier prefere dados flatten
        payload = this.flattenObject(payload);
        break;

      case 'power-automate':
        payload = {
          ...payload,
          schema_version: '1.0',
          trigger_type: 'webhook'
        };
        break;

      case 'make':
        payload = {
          ...payload,
          scenario_source: 'whats-hub'
        };
        break;

      case 'pipedream':
        payload = {
          ...payload,
          source: {
            name: 'whats-hub',
            version: '1.0'
          }
        };
        break;
    }

    // Aplicar mapeamento de dados se configurado
    if (automation.dataMapping) {
      payload = this.applyDataMapping(payload, automation.dataMapping);
    }

    return payload;
  }

  /**
   * Prepara headers HTTP baseado na configuração de autenticação
   */
  private prepareHeaders(automation: AutomationConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'WhatsHub-Bot/1.0',
      'X-Automation-Platform': automation.platform,
      'X-Source': 'whats-hub'
    };

    // Adicionar headers customizados
    if (automation.headers) {
      Object.assign(headers, automation.headers);
    }

    // Configurar autenticação
    switch (automation.authentication.type) {
      case 'api-key':
        if (automation.authentication.credentials?.apiKey) {
          headers['X-API-Key'] = automation.authentication.credentials.apiKey;
        }
        break;

      case 'bearer':
        if (automation.authentication.credentials?.token) {
          headers['Authorization'] = `Bearer ${automation.authentication.credentials.token}`;
        }
        break;

      case 'basic':
        if (automation.authentication.credentials?.username && automation.authentication.credentials?.password) {
          const credentials = Buffer.from(
            `${automation.authentication.credentials.username}:${automation.authentication.credentials.password}`
          ).toString('base64');
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;

      case 'custom':
        if (automation.authentication.credentials) {
          Object.assign(headers, automation.authentication.credentials);
        }
        break;
    }

    return headers;
  }

  /**
   * Cria cliente HTTP configurado para a plataforma
   */
  private createHttpClient(automation: AutomationConfig): AxiosInstance {
    const config = this.platformConfigs[automation.platform];
    
    return axios.create({
      timeout: automation.timeout,
      maxRedirects: 3,
      headers: {
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Avalia condições de automação
   */
  private evaluateConditions(conditions: AutomationCondition[], data: any, context?: Record<string, any>): boolean {
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      const result = this.evaluateCondition(condition, data, context);

      if (i === 0) {
        // Primeira condição
        if (!result) return false;
      } else {
        const logicalOp = conditions[i - 1].logicalOperator || 'AND';
        if (logicalOp === 'AND' && !result) {
          return false;
        } else if (logicalOp === 'OR' && result) {
          return true;
        }
      }
    }

    return true;
  }

  /**
   * Avalia uma condição específica
   */
  private evaluateCondition(condition: AutomationCondition, data: any, context?: Record<string, any>): boolean {
    const value = this.getNestedValue(data, condition.field) ?? this.getNestedValue(context, condition.field);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'not_contains':
        return !String(value).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'starts_with':
        return String(value).toLowerCase().startsWith(String(condition.value).toLowerCase());
      case 'ends_with':
        return String(value).toLowerCase().endsWith(String(condition.value).toLowerCase());
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'regex':
        return new RegExp(condition.value, 'i').test(String(value));
      default:
        return false;
    }
  }

  /**
   * Testa conectividade com a plataforma
   */
  async testConnection(automation: AutomationConfig): Promise<boolean> {
    try {
      const client = this.createHttpClient(automation);
      const headers = this.prepareHeaders(automation);

      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'whats-hub-connection-test'
      };

      const response = await client.post(automation.webhookUrl, testPayload, {
        headers,
        timeout: 10000
      });

      console.log(`✅ Teste de conexão bem-sucedido: ${automation.platform}`);
      return true;

    } catch (error: any) {
      console.error(`❌ Falha no teste de conexão: ${automation.platform} - ${error.message}`);
      throw new Error(`Falha na conexão com ${automation.platform}: ${error.message}`);
    }
  }

  /**
   * Obtém automações ativas por plataforma
   */
  getAutomationsByPlatform(platform: AutomationPlatform): AutomationConfig[] {
    return Array.from(this.automations.values())
      .filter(automation => automation.platform === platform);
  }

  /**
   * Obtém todas as automações
   */
  getAllAutomations(): AutomationConfig[] {
    return Array.from(this.automations.values());
  }

  /**
   * Obtém automação por ID
   */
  getAutomation(automationId: string): AutomationConfig | undefined {
    return this.automations.get(automationId);
  }

  /**
   * Obtém estatísticas de automações
   */
  getStats(): AutomationStats {
    const executions = this.executionHistory;
    const successful = executions.filter(e => e.success).length;
    const failed = executions.filter(e => !e.success).length;
    
    const responseTimes = executions
      .filter(e => e.success)
      .map(e => e.duration);
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    // Contar execuções por plataforma
    const platformCounts = executions.reduce((acc, exec) => {
      acc[exec.platform] = (acc[exec.platform] || 0) + 1;
      return acc;
    }, {} as Record<AutomationPlatform, number>);

    const mostUsedPlatform = Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as AutomationPlatform || 'n8n';

    // Execuções diárias (últimos 7 dias)
    const dailyExecutions = this.getDailyExecutions();

    return {
      totalExecutions: executions.length,
      successfulExecutions: successful,
      failedExecutions: failed,
      averageResponseTime: Math.round(avgResponseTime),
      successRate: executions.length > 0 ? (successful / executions.length) * 100 : 0,
      lastExecution: executions[executions.length - 1]?.timestamp,
      mostUsedPlatform,
      dailyExecutions
    };
  }

  /**
   * Obtém plataformas suportadas
   */
  getSupportedPlatforms(): Array<{ id: AutomationPlatform; name: string; config: any }> {
    return Object.entries(this.platformConfigs).map(([id, config]) => ({
      id: id as AutomationPlatform,
      name: config.name,
      config
    }));
  }

  // Métodos auxiliares privados
  private validateAutomationConfig(config: AutomationConfig): void {
    if (!config.name) {
      throw new Error('Nome da automação é obrigatório');
    }

    if (!config.webhookUrl) {
      throw new Error('URL do webhook é obrigatória');
    }

    if (!this.isValidUrl(config.webhookUrl)) {
      throw new Error('URL do webhook inválida');
    }

    if (!config.triggers || config.triggers.length === 0) {
      throw new Error('Pelo menos um trigger deve ser especificado');
    }

    if (config.timeout < 1000 || config.timeout > 300000) {
      throw new Error('Timeout deve estar entre 1s e 5min');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private generateId(): string {
    return `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private flattenObject(obj: any, prefix = ''): any {
    const flattened: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}_${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }

  private applyDataMapping(data: any, mapping: Record<string, string>): any {
    const mapped: any = {};
    
    for (const [targetKey, sourceKey] of Object.entries(mapping)) {
      mapped[targetKey] = this.getNestedValue(data, sourceKey);
    }
    
    return mapped;
  }

  private shouldRetry(error: any, automation: AutomationConfig): boolean {
    // Não tentar novamente para erros 4xx (exceto 408, 429)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return [408, 429].includes(error.response.status);
    }

    return true; // Tentar novamente para 5xx, timeouts, etc.
  }

  private addToHistory(result: ExecutionResult): void {
    this.executionHistory.push(result);
    
    // Limitar tamanho do histórico
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-this.maxHistorySize);
    }
  }

  private getDailyExecutions(): Array<{ date: string; count: number }> {
    const today = new Date();
    const dailyStats: Array<{ date: string; count: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const count = this.executionHistory.filter(exec => 
        exec.timestamp.startsWith(dateStr)
      ).length;

      dailyStats.push({ date: dateStr, count });
    }

    return dailyStats;
  }

  private startRetryProcessor(): void {
    setInterval(() => {
      if (this.retryQueue.length > 0) {
        this.processRetryQueue();
      }
    }, 30000); // Processar a cada 30 segundos
  }

  private async processRetryQueue(): Promise<void> {
    const retryItems = this.retryQueue.splice(0, 5); // Processar até 5 por vez

    for (const item of retryItems) {
      try {
        if (item.attempt <= item.config.retryAttempts) {
          console.log(`🔄 Tentativa ${item.attempt} para automação: ${item.config.name}`);
          
          await new Promise(resolve => setTimeout(resolve, item.config.retryDelay * item.attempt));
          
          await this.executeAutomation(item.config, item.event, item.data);
          
        } else {
          console.log(`🚫 Máximo de tentativas atingido para automação: ${item.config.name}`);
        }
      } catch (error) {
        if (item.attempt < item.config.retryAttempts) {
          // Adicionar de volta à fila com tentativa incrementada
          this.retryQueue.push({
            ...item,
            attempt: item.attempt + 1
          });
        }
      }
    }
  }

  private async loadAutomations(): Promise<void> {
    try {
      const saved = localStorage.getItem('whats-hub-automations');
      if (saved) {
        const automations = JSON.parse(saved);
        for (const [id, config] of Object.entries(automations)) {
          this.automations.set(id, config as AutomationConfig);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar automações:', error);
    }
  }

  private async saveAutomations(): Promise<void> {
    try {
      const automationsObj = Object.fromEntries(this.automations);
      localStorage.setItem('whats-hub-automations', JSON.stringify(automationsObj));
    } catch (error) {
      console.error('Erro ao salvar automações:', error);
    }
  }
}

export default AutomationService;
