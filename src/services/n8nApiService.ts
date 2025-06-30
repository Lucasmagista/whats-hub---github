/**
 * 🔗 N8N API Service - FASE 1 INTEGRAÇÃO BASE
 * Serviço completo para conectar o dashboard ao sistema n8n
 */

// Environment Variables
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/whatsapp-messages';
const POSTGRES_URL = import.meta.env.VITE_POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5432/whats_hub';
const WHATSAPP_SERVER_URL = import.meta.env.VITE_WHATSAPP_SERVER_URL || 'http://localhost:3001';
const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5173';

export interface SystemStatus {
  whatsapp: {
    connected: boolean;
    qrCodeNeeded: boolean;
    lastSeen: string;
    messagesReceived: number;
    messagesSent: number;
  };
  server: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    status: 'online' | 'offline' | 'error';
  };
  database: {
    connected: boolean;
    type: string;
    status: string;
  };
  n8n: {
    connected: boolean;
    workflows: number;
    executions: number;
    status: 'online' | 'offline' | 'error';
  };
  monitoring: {
    alerts: Alert[];
    lastCheck: string;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
}

export interface SupportQueue {
  totalInQueue: number;
  activeChats: number;
  attendants: Attendant[];
  queueItems: QueueItem[];
  metrics: QueueMetrics;
  workingHours: {
    enabled: boolean;
    current: boolean;
    nextOpen: string;
  };
}

export interface Attendant {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  skills: string[];
  activeChats: number;
  maxChats: number;
  lastActivity: string;
  performance: {
    avgResponseTime: number;
    satisfaction: number;
    totalChats: number;
  };
}

export interface QueueItem {
  id: string;
  chatId: string;
  customerName: string;
  priority: 'urgent' | 'high' | 'normal';
  waitTime: number;
  estimatedTime: number;
  topic: string;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface QueueMetrics {
  averageWaitTime: number;
  totalChatsToday: number;
  satisfactionScore: number;
  responseTime: number;
  activeAttendants: number;
  queueLength: number;
}

export interface UserState {
  chatId: string;
  step: string;
  data: Record<string, any>;
  lastInteraction: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: 'whatsapp' | 'n8n' | 'system' | 'support';
  message: string;
  data?: Record<string, any>;
}

class N8nApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = WHATSAPP_SERVER_URL;
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`N8N API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // =============================
  // FASE 1.1 - STATUS DO SISTEMA
  // =============================
  
  async getSystemStatus(): Promise<SystemStatus> {
    return this.makeRequest<SystemStatus>('/status');
  }

  async getHealth(): Promise<{ status: string; uptime: number; version: string }> {
    return this.makeRequest('/health');
  }

  // =============================
  // FASE 1.1 - FILA DE ATENDIMENTO
  // =============================
  
  async getSupportQueue(): Promise<SupportQueue> {
    return this.makeRequest<SupportQueue>('/api/support-queue');
  }

  async registerAttendant(attendant: Omit<Attendant, 'id' | 'lastActivity'>): Promise<{ id: string }> {
    return this.makeRequest<{ id: string }>('/api/support-queue/register-attendant', {
      method: 'POST',
      body: JSON.stringify(attendant),
    });
  }

  async updateAttendantStatus(attendantId: string, status: Attendant['status']): Promise<void> {
    await this.makeRequest('/api/support-queue/attendant-status', {
      method: 'PUT',
      body: JSON.stringify({ attendantId, status }),
    });
  }

  async startChat(chatId: string, attendantId: string): Promise<void> {
    await this.makeRequest('/api/support-queue/start-chat', {
      method: 'POST',
      body: JSON.stringify({ chatId, attendantId }),
    });
  }

  async endChat(chatId: string): Promise<void> {
    await this.makeRequest('/api/support-queue/end-chat', {
      method: 'POST',
      body: JSON.stringify({ chatId }),
    });
  }

  async transferChat(chatId: string, newAttendantId: string): Promise<void> {
    await this.makeRequest('/api/support-queue/transfer', {
      method: 'POST',
      body: JSON.stringify({ chatId, newAttendantId }),
    });
  }

  async sendMessage(chatId: string, message: string, attendantId: string): Promise<void> {
    await this.makeRequest('/api/support-queue/send-message', {
      method: 'POST',
      body: JSON.stringify({ chatId, message, attendantId }),
    });
  }

  async getChatHistory(chatId: string): Promise<any[]> {
    return this.makeRequest<any[]>(`/api/support-queue/chat-history/${chatId}`);
  }

  async autoAssignChat(chatId: string): Promise<{ attendantId: string }> {
    return this.makeRequest<{ attendantId: string }>('/api/support-queue/auto-assign', {
      method: 'POST',
      body: JSON.stringify({ chatId }),
    });
  }

  // =============================
  // ESTADOS DE USUÁRIO
  // =============================
  
  async getUserStates(): Promise<Record<string, UserState>> {
    return this.makeRequest<Record<string, UserState>>('/api/user-states');
  }

  async getUserState(phone: string): Promise<UserState | null> {
    try {
      return await this.makeRequest<UserState>(`/api/user-states/${phone}`);
    } catch (error) {
      return null;
    }
  }

  async resetUserState(phone: string): Promise<void> {
    await this.makeRequest(`/api/reset-user/${phone}`, {
      method: 'POST',
    });
  }

  async deleteUserState(phone: string): Promise<void> {
    await this.makeRequest(`/api/user-states/${phone}`, {
      method: 'DELETE',
    });
  }

  // =============================
  // MENSAGENS
  // =============================
  
  async sendTextMessage(chatId: string, message: string): Promise<void> {
    await this.makeRequest('/api/send-message', {
      method: 'POST',
      body: JSON.stringify({ chatId, message }),
    });
  }

  async sendMediaMessage(chatId: string, media: File, caption?: string): Promise<void> {
    const formData = new FormData();
    formData.append('media', media);
    formData.append('chatId', chatId);
    if (caption) formData.append('caption', caption);

    await fetch(`${this.baseUrl}/api/send-media`, {
      method: 'POST',
      body: formData,
    });
  }

  async downloadMedia(messageId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/download-media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId }),
    });

    if (!response.ok) {
      throw new Error('Failed to download media');
    }

    return response.blob();
  }

  // =============================
  // QR CODE E CONEXÃO
  // =============================
  
  async getQRCode(): Promise<{ qr: string; status: string }> {
    return this.makeRequest<{ qr: string; status: string }>('/qr');
  }

  async getConnectionStatus(): Promise<{ connected: boolean; user?: any }> {
    return this.makeRequest<{ connected: boolean; user?: any }>('/connection-status');
  }

  // =============================
  // CHAT INFO
  // =============================
  
  async getChatInfo(chatId: string): Promise<any> {
    return this.makeRequest(`/api/chat/${chatId}`);
  }

  // =============================
  // WEBHOOKS E N8N
  // =============================
  
  async triggerWebhook(webhookId: string, data: any): Promise<any> {
    return fetch(`http://localhost:5678/webhook/${webhookId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json());
  }

  async getN8nWorkflows(): Promise<any[]> {
    try {
      return await fetch('http://localhost:5678/api/v1/workflows', {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:password123'),
        },
      }).then(res => res.json());
    } catch (error) {
      console.warn('N8N not available:', error);
      return [];
    }
  }

  // =============================
  // MONITORAMENTO
  // =============================
  
  async getMetrics(): Promise<any> {
    return this.makeRequest('/api/metrics');
  }
  async getLogs(limit = 100): Promise<LogEntry[]> {
    return this.makeRequest(`/api/logs?limit=${limit}`);
  }

  // =============================
  // FASE 1.3 - WEBSOCKET E LOGS EM TEMPO REAL
  // =============================
  
  private websocket: WebSocket | null = null;
  private websocketListeners: Map<string, Function[]> = new Map();

  connectWebSocket(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
    this.websocket = new WebSocket(wsUrl);

    this.websocket.onopen = () => {
      console.log('✅ WebSocket conectado ao n8n');
      this.emit('websocket:connected');
    };

    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    };

    this.websocket.onclose = () => {
      console.log('🔌 WebSocket desconectado');
      this.emit('websocket:disconnected');
      
      // Tentar reconectar após 5 segundos
      setTimeout(() => this.connectWebSocket(), 5000);
    };

    this.websocket.onerror = (error) => {
      console.error('❌ Erro no WebSocket:', error);
      this.emit('websocket:error', error);
    };
  }

  disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  // Sistema de eventos para WebSocket
  on(event: string, callback: Function): void {
    if (!this.websocketListeners.has(event)) {
      this.websocketListeners.set(event, []);
    }
    this.websocketListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.websocketListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.websocketListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Métodos específicos para logs em tempo real
  subscribeToLogs(callback: (log: LogEntry) => void): () => void {
    this.on('log', callback);
    return () => this.off('log', callback);
  }

  subscribeToSystemEvents(callback: (event: any) => void): () => void {
    this.on('system:event', callback);
    return () => this.off('system:event', callback);
  }

  subscribeToSupportQueue(callback: (queue: SupportQueue) => void): () => void {
    this.on('support:queue:update', callback);
    return () => this.off('support:queue:update', callback);
  }

  subscribeToMessages(callback: (message: any) => void): () => void {
    this.on('message:received', callback);
    this.on('message:sent', callback);
    return () => {
      this.off('message:received', callback);
      this.off('message:sent', callback);
    };
  }
}

// =============================
// FASE 1 - INTEGRAÇÃO PRINCIPAL
// =============================

/**
 * Classe principal de integração WhatsHub + n8n
 * Implementa todos os recursos da FASE 1
 */
export class WhatsHubN8nIntegration {
  private n8nUrl = N8N_WEBHOOK_URL.replace('/webhook/whatsapp-messages', '');
  private whatsappUrl = WHATSAPP_SERVER_URL;
  private apiService: N8nApiService;

  constructor() {
    this.apiService = new N8nApiService();
  }

  // =============================
  // CONECTAR SISTEMAS (1.1)
  // =============================
  
  async connectSystems(): Promise<{
    whatsapp: boolean;
    n8n: boolean;
    database: boolean;
    websocket: boolean;
  }> {
    const results = {
      whatsapp: false,
      n8n: false,
      database: false,
      websocket: false
    };

    try {
      // Testar conexão WhatsApp
      const health = await this.apiService.getHealth();
      results.whatsapp = health.status === 'ok';
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
    }

    try {
      // Testar conexão n8n
      const workflows = await this.apiService.getN8nWorkflows();
      results.n8n = Array.isArray(workflows);
    } catch (error) {
      console.error('Erro ao conectar n8n:', error);
    }

    try {
      // Testar conexão database
      const status = await this.apiService.getSystemStatus();
      results.database = status.database.connected;
    } catch (error) {
      console.error('Erro ao conectar database:', error);
    }

    try {
      // Conectar WebSocket
      this.apiService.connectWebSocket();
      results.websocket = true;
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
    }

    return results;
  }

  async setupWebhooks(): Promise<void> {
    // Configurar webhooks n8n -> WhatsApp
    const webhookData = {
      url: `${this.whatsappUrl}/webhook/n8n`,
      events: ['message.received', 'message.sent', 'status.changed']
    };

    try {
      await fetch(`${this.n8nUrl}/api/v1/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:password123'),
        },
        body: JSON.stringify(webhookData),
      });
    } catch (error) {
      console.warn('Não foi possível configurar webhooks n8n:', error);
    }
  }

  async syncConfigurations(): Promise<void> {
    // Sincronizar configurações entre sistemas
    try {
      const systemStatus = await this.apiService.getSystemStatus();
      const n8nWorkflows = await this.apiService.getN8nWorkflows();
      
      console.log('✅ Configurações sincronizadas:', {
        systemStatus: systemStatus.server.status,
        workflows: n8nWorkflows.length
      });
    } catch (error) {
      console.error('Erro ao sincronizar configurações:', error);
    }
  }

  async initializeQueues(): Promise<void> {
    // Inicializar sistema de filas
    try {
      const queue = await this.apiService.getSupportQueue();
      console.log('✅ Sistema de filas inicializado:', {
        totalInQueue: queue.totalInQueue,
        activeChats: queue.activeChats,
        attendants: queue.attendants.length
      });
    } catch (error) {
      console.error('Erro ao inicializar filas:', error);
    }
  }

  // =============================
  // SINCRONIZAR ESTADOS (1.1)
  // =============================
  
  async syncUserStates(): Promise<Record<string, UserState>> {
    try {
      const states = await this.apiService.getUserStates();
      return this.processStates(states);
    } catch (error) {
      console.error('Erro ao sincronizar estados:', error);
      return {};
    }
  }

  private processStates(states: Record<string, UserState>): Record<string, UserState> {
    // Processar e normalizar estados
    const processedStates: Record<string, UserState> = {};
    
    for (const [chatId, state] of Object.entries(states)) {
      processedStates[chatId] = {
        ...state,
        chatId: chatId.replace('@c.us', ''), // Normalizar ID
        lastInteraction: state.lastInteraction || Date.now()
      };
    }
    
    return processedStates;
  }

  // =============================
  // GERENCIAR WORKFLOWS (1.1)
  // =============================
  
  async executeWorkflow(workflowId: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.n8nUrl}/webhook/${workflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Workflow execution failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro ao executar workflow ${workflowId}:`, error);
      throw error;
    }
  }

  async getWorkflowExecutions(workflowId: string, limit = 20): Promise<any[]> {
    try {
      const response = await fetch(`${this.n8nUrl}/api/v1/executions?workflowId=${workflowId}&limit=${limit}`, {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:password123'),
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get executions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter execuções do workflow:', error);
      return [];
    }
  }

  // =============================
  // MONITORAMENTO INTEGRADO (1.3)
  // =============================
  
  async getIntegratedStatus(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    systems: SystemStatus;
    queue: SupportQueue;
    recentLogs: LogEntry[];
  }> {
    try {
      const [systems, queue, logs] = await Promise.all([
        this.apiService.getSystemStatus(),
        this.apiService.getSupportQueue(),
        this.apiService.getLogs(10)
      ]);

      const overall = this.calculateOverallHealth(systems);

      return {
        overall,
        systems,
        queue,
        recentLogs: logs
      };
    } catch (error) {
      console.error('Erro ao obter status integrado:', error);
      throw error;
    }
  }

  private calculateOverallHealth(status: SystemStatus): 'healthy' | 'warning' | 'critical' {
    const criticalIssues = [
      !status.whatsapp.connected,
      !status.database.connected,
      status.server.status === 'error'
    ].filter(Boolean).length;

    const warningIssues = [
      status.server.memoryUsage > 80,
      status.server.cpuUsage > 80,
      status.monitoring.alerts.length > 5
    ].filter(Boolean).length;

    if (criticalIssues > 0) return 'critical';
    if (warningIssues > 0) return 'warning';
    return 'healthy';
  }

  // =============================
  // UTILITÁRIOS FASE 1
  // =============================
  
  getApiService(): N8nApiService {
    return this.apiService;
  }

  async testConnection(): Promise<boolean> {
    try {
      const health = await this.apiService.getHealth();
      return health.status === 'ok';
    } catch {
      return false;
    }
  }

  async getEnvironmentInfo(): Promise<{
    n8nUrl: string;
    whatsappUrl: string;
    dashboardUrl: string;
    postgresUrl: string;
  }> {
    return {
      n8nUrl: N8N_WEBHOOK_URL,
      whatsappUrl: WHATSAPP_SERVER_URL,
      dashboardUrl: DASHBOARD_URL,
      postgresUrl: POSTGRES_URL
    };
  }
}

// Singleton instances
export const n8nApiService = new N8nApiService();
export const whatsHubIntegration = new WhatsHubN8nIntegration();

// Export default
export default n8nApiService;
