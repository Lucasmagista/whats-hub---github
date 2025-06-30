import { getCurrentConfig } from '@/config/apiConfig';

// Tipos para integrações
export interface IntegrationConfig {
  id: string;
  platformId: string;
  name: string;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  isActive: boolean;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  integrationIds: string[];
  nodes: any[];
  connections: any[];
  triggers: any[];
  isActive: boolean;
  executions: number;
  successRate: number;
  lastRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionLog {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'error' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  logs: string[];
  error?: string;
  input?: any;
  output?: any;
}

class IntegrationApiService {
  private baseUrl: string;

  constructor() {
    const config = getCurrentConfig();
    this.baseUrl = config.baseURL;
  }

  // Método genérico para fazer requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Integrations CRUD
  async getIntegrations(): Promise<{ success: boolean; data?: IntegrationConfig[]; message?: string }> {
    return this.request<IntegrationConfig[]>('/api/integrations');
  }

  async createIntegration(integration: Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: IntegrationConfig; message?: string }> {
    return this.request<IntegrationConfig>('/api/integrations', {
      method: 'POST',
      body: JSON.stringify({
        ...integration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
    });
  }

  async updateIntegration(id: string, updates: Partial<IntegrationConfig>): Promise<{ success: boolean; data?: IntegrationConfig; message?: string }> {
    return this.request<IntegrationConfig>(`/api/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...updates,
        updatedAt: new Date().toISOString()
      }),
    });
  }

  async deleteIntegration(id: string): Promise<{ success: boolean; message?: string }> {
    return this.request(`/api/integrations/${id}`, {
      method: 'DELETE',
    });
  }

  async testIntegrationConnection(id: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return this.request(`/api/integrations/${id}/test`, {
      method: 'POST',
    });
  }

  // Workflows CRUD
  async getWorkflows(): Promise<{ success: boolean; data?: WorkflowConfig[]; message?: string }> {
    return this.request<WorkflowConfig[]>('/api/workflows');
  }

  async createWorkflow(workflow: Omit<WorkflowConfig, 'id' | 'createdAt' | 'updatedAt' | 'executions' | 'successRate'>): Promise<{ success: boolean; data?: WorkflowConfig; message?: string }> {
    return this.request<WorkflowConfig>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify({
        ...workflow,
        executions: 0,
        successRate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
    });
  }

  async updateWorkflow(id: string, updates: Partial<WorkflowConfig>): Promise<{ success: boolean; data?: WorkflowConfig; message?: string }> {
    return this.request<WorkflowConfig>(`/api/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...updates,
        updatedAt: new Date().toISOString()
      }),
    });
  }

  async deleteWorkflow(id: string): Promise<{ success: boolean; message?: string }> {
    return this.request(`/api/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  async executeWorkflow(id: string, input?: any): Promise<{ success: boolean; data?: ExecutionLog; message?: string }> {
    return this.request<ExecutionLog>(`/api/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ input }),
    });
  }

  async getWorkflowExecutions(workflowId: string, limit = 50): Promise<{ success: boolean; data?: ExecutionLog[]; message?: string }> {
    return this.request<ExecutionLog[]>(`/api/workflows/${workflowId}/executions?limit=${limit}`);
  }

  // Metrics and Analytics
  async getIntegrationMetrics(integrationId?: string): Promise<{ success: boolean; data?: any; message?: string }> {
    const endpoint = integrationId 
      ? `/api/metrics/integrations/${integrationId}`
      : '/api/metrics/integrations';
    
    return this.request(endpoint);
  }

  async getWorkflowMetrics(workflowId?: string): Promise<{ success: boolean; data?: any; message?: string }> {
    const endpoint = workflowId 
      ? `/api/metrics/workflows/${workflowId}`
      : '/api/metrics/workflows';
    
    return this.request(endpoint);
  }

  // Templates
  async getWorkflowTemplates(): Promise<{ success: boolean; data?: any[]; message?: string }> {
    return this.request('/api/workflow-templates');
  }

  async createWorkflowFromTemplate(templateId: string, name: string, description?: string): Promise<{ success: boolean; data?: WorkflowConfig; message?: string }> {
    return this.request<WorkflowConfig>('/api/workflow-templates/create', {
      method: 'POST',
      body: JSON.stringify({
        templateId,
        name,
        description
      }),
    });
  }

  // Real-time updates
  async subscribeToWorkflowUpdates(workflowId: string, callback: (update: any) => void): Promise<() => void> {
    // Implementar WebSocket ou Server-Sent Events para updates em tempo real
    const eventSource = new EventSource(`${this.baseUrl}/api/workflows/${workflowId}/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        callback(update);
      } catch (error) {
        console.error('Error parsing workflow update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Workflow stream error:', error);
    };

    // Retorna função para cancelar a subscription
    return () => {
      eventSource.close();
    };
  }

  // Platform-specific operations
  async syncIntegration(integrationId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return this.request(`/api/integrations/${integrationId}/sync`, {
      method: 'POST',
    });
  }

  async getIntegrationLogs(integrationId: string, limit = 100): Promise<{ success: boolean; data?: any[]; message?: string }> {
    return this.request(`/api/integrations/${integrationId}/logs?limit=${limit}`);
  }

  // Backup and restore
  async exportWorkflow(workflowId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return this.request(`/api/workflows/${workflowId}/export`);
  }

  async importWorkflow(workflowData: any): Promise<{ success: boolean; data?: WorkflowConfig; message?: string }> {
    return this.request<WorkflowConfig>('/api/workflows/import', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  // Health checks
  async getSystemHealth(): Promise<{ success: boolean; data?: any; message?: string }> {
    return this.request('/api/health');
  }

  async getIntegrationHealth(integrationId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return this.request(`/api/integrations/${integrationId}/health`);
  }
}

// Singleton instance
export const integrationApiService = new IntegrationApiService();

// Local storage fallback para desenvolvimento
export class LocalIntegrationStorage {
  private static INTEGRATIONS_KEY = 'whats_hub_integrations';
  private static WORKFLOWS_KEY = 'whats_hub_workflows';
  private static EXECUTIONS_KEY = 'whats_hub_executions';

  static getIntegrations(): IntegrationConfig[] {
    try {
      const data = localStorage.getItem(this.INTEGRATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveIntegrations(integrations: IntegrationConfig[]): void {
    try {
      localStorage.setItem(this.INTEGRATIONS_KEY, JSON.stringify(integrations));
    } catch (error) {
      console.error('Error saving integrations to localStorage:', error);
    }
  }

  static getWorkflows(): WorkflowConfig[] {
    try {
      const data = localStorage.getItem(this.WORKFLOWS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveWorkflows(workflows: WorkflowConfig[]): void {
    try {
      localStorage.setItem(this.WORKFLOWS_KEY, JSON.stringify(workflows));
    } catch (error) {
      console.error('Error saving workflows to localStorage:', error);
    }
  }

  static getExecutions(): ExecutionLog[] {
    try {
      const data = localStorage.getItem(this.EXECUTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveExecutions(executions: ExecutionLog[]): void {
    try {
      localStorage.setItem(this.EXECUTIONS_KEY, JSON.stringify(executions));
    } catch (error) {
      console.error('Error saving executions to localStorage:', error);
    }
  }

  static addExecution(execution: ExecutionLog): void {
    const executions = this.getExecutions();
    executions.unshift(execution);
    
    // Manter apenas os últimos 1000 executions
    if (executions.length > 1000) {
      executions.splice(1000);
    }
    
    this.saveExecutions(executions);
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.INTEGRATIONS_KEY);
      localStorage.removeItem(this.WORKFLOWS_KEY);
      localStorage.removeItem(this.EXECUTIONS_KEY);
    } catch (error) {
      console.error('Error clearing integration storage:', error);
    }
  }
}
