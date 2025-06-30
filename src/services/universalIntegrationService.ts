/**
 * Serviço de Integração Universal
 * Suporte para múltiplas plataformas de automação e workflow
 */

interface IntegrationPlatform {
  id: string;
  name: string;
  baseUrl?: string;
  apiVersion?: string;
  authentication: {
    type: 'api-key' | 'oauth' | 'basic' | 'webhook' | 'jwt';
    config: Record<string, any>;
  };
  capabilities: {
    webhooks: boolean;
    polling: boolean;
    realTime: boolean;
    fileUpload: boolean;
    customFields: boolean;
  };
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  platform: string;
  trigger: any;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  data: any;
  result?: any;
  error?: string;
  retryCount: number;
  logs: ExecutionLog[];
}

interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

interface UniversalWorkflow {
  id: string;
  name: string;
  description: string;
  platform: string;
  isActive: boolean;
  trigger: {
    type: string;
    config: any;
  };
  steps: WorkflowStep[];
  errorHandling: {
    retryPolicy: 'none' | 'fixed' | 'exponential';
    maxRetries: number;
    onError: 'stop' | 'continue' | 'rollback';
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    tags: string[];
  };
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'loop' | 'parallel' | 'delay';
  platform?: string;
  config: any;
  onSuccess?: string; // ID do próximo step
  onFailure?: string; // ID do step de erro
  timeout?: number;
}

class UniversalIntegrationService {
  private platforms: Map<string, IntegrationPlatform> = new Map();
  private workflows: Map<string, UniversalWorkflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private webhookListeners: Map<string, Function> = new Map();

  constructor() {
    this.initializePlatforms();
    this.startExecutionMonitor();
  }

  /**
   * Inicializa configurações padrão das plataformas
   */
  private initializePlatforms() {
    // n8n
    this.platforms.set('n8n', {
      id: 'n8n',
      name: 'n8n',
      apiVersion: 'v1',
      authentication: { type: 'api-key', config: {} },
      capabilities: {
        webhooks: true,
        polling: true,
        realTime: true,
        fileUpload: true,
        customFields: true
      },
      rateLimit: { requestsPerMinute: 60, requestsPerHour: 3600 }
    });

    // Zapier
    this.platforms.set('zapier', {
      id: 'zapier',
      name: 'Zapier',
      baseUrl: 'https://hooks.zapier.com',
      authentication: { type: 'webhook', config: {} },
      capabilities: {
        webhooks: true,
        polling: false,
        realTime: true,
        fileUpload: false,
        customFields: false
      },
      rateLimit: { requestsPerMinute: 100, requestsPerHour: 6000 }
    });

    // Power Automate
    this.platforms.set('power-automate', {
      id: 'power-automate',
      name: 'Microsoft Power Automate',
      baseUrl: 'https://prod-XX.westus.logic.azure.com',
      authentication: { type: 'oauth', config: {} },
      capabilities: {
        webhooks: true,
        polling: true,
        realTime: true,
        fileUpload: true,
        customFields: true
      },
      rateLimit: { requestsPerMinute: 100, requestsPerHour: 6000 }
    });

    // Make.com
    this.platforms.set('make', {
      id: 'make',
      name: 'Make.com',
      baseUrl: 'https://hook.integromat.com',
      authentication: { type: 'api-key', config: {} },
      capabilities: {
        webhooks: true,
        polling: true,
        realTime: true,
        fileUpload: true,
        customFields: true
      },
      rateLimit: { requestsPerMinute: 60, requestsPerHour: 3600 }
    });

    // Pipedream
    this.platforms.set('pipedream', {
      id: 'pipedream',
      name: 'Pipedream',
      baseUrl: 'https://api.pipedream.com',
      apiVersion: 'v1',
      authentication: { type: 'api-key', config: {} },
      capabilities: {
        webhooks: true,
        polling: true,
        realTime: true,
        fileUpload: true,
        customFields: true
      },
      rateLimit: { requestsPerMinute: 100, requestsPerHour: 6000 }
    });

    // Workato
    this.platforms.set('workato', {
      id: 'workato',
      name: 'Workato',
      baseUrl: 'https://www.workato.com',
      authentication: { type: 'api-key', config: {} },
      capabilities: {
        webhooks: true,
        polling: true,
        realTime: true,
        fileUpload: true,
        customFields: true
      },
      rateLimit: { requestsPerMinute: 60, requestsPerHour: 3600 }
    });

    // Custom Platforms
    this.initializeCustomPlatforms();
  }

  /**
   * Inicializa plataformas customizadas
   */
  private initializeCustomPlatforms() {
    // HubSpot
    this.platforms.set('hubspot', {
      id: 'hubspot',
      name: 'HubSpot',
      baseUrl: 'https://api.hubapi.com',
      apiVersion: 'v3',
      authentication: { type: 'api-key', config: {} },
      capabilities: {
        webhooks: true,
        polling: true,
        realTime: false,
        fileUpload: false,
        customFields: true
      },
      rateLimit: { requestsPerMinute: 100, requestsPerHour: 40000 }
    });

    // Salesforce
    this.platforms.set('salesforce', {
      id: 'salesforce',
      name: 'Salesforce',
      baseUrl: 'https://login.salesforce.com',
      apiVersion: 'v60.0',
      authentication: { type: 'oauth', config: {} },
      capabilities: {
        webhooks: true,
        polling: true,
        realTime: true,
        fileUpload: true,
        customFields: true
      },
      rateLimit: { requestsPerMinute: 100, requestsPerHour: 6000 }
    });

    // Slack
    this.platforms.set('slack', {
      id: 'slack',
      name: 'Slack',
      baseUrl: 'https://slack.com/api',
      apiVersion: 'v1',
      authentication: { type: 'oauth', config: {} },
      capabilities: {
        webhooks: true,
        polling: false,
        realTime: true,
        fileUpload: true,
        customFields: false
      },
      rateLimit: { requestsPerMinute: 1, requestsPerHour: 3600 } // Tier 1
    });

    // Google Workspace
    this.platforms.set('google-workspace', {
      id: 'google-workspace',
      name: 'Google Workspace',
      baseUrl: 'https://www.googleapis.com',
      authentication: { type: 'oauth', config: {} },
      capabilities: {
        webhooks: true,
        polling: true,
        realTime: false,
        fileUpload: true,
        customFields: true
      },
      rateLimit: { requestsPerMinute: 100, requestsPerHour: 6000 }
    });

    // OpenAI
    this.platforms.set('openai', {
      id: 'openai',
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com',
      apiVersion: 'v1',
      authentication: { type: 'api-key', config: {} },
      capabilities: {
        webhooks: false,
        polling: false,
        realTime: false,
        fileUpload: true,
        customFields: false
      },
      rateLimit: { requestsPerMinute: 20, requestsPerHour: 1200 }
    });
  }

  /**
   * Configura uma plataforma
   */
  async configurePlatform(platformId: string, config: any): Promise<void> {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      throw new Error(`Plataforma ${platformId} não encontrada`);
    }

    // Validar configuração específica da plataforma
    await this.validatePlatformConfig(platformId, config);

    // Atualizar configuração
    platform.authentication.config = { ...platform.authentication.config, ...config };
    
    // Testar conexão
    await this.testPlatformConnection(platformId);

    console.log(`✅ Plataforma ${platform.name} configurada com sucesso`);
  }

  /**
   * Valida configuração específica da plataforma
   */
  private async validatePlatformConfig(platformId: string, config: any): Promise<void> {
    switch (platformId) {
      case 'n8n':
        if (!config.host || !config.port) {
          throw new Error('Host e porta são obrigatórios para n8n');
        }
        break;

      case 'zapier':
        if (!config.webhookUrl) {
          throw new Error('URL do webhook é obrigatória para Zapier');
        }
        break;

      case 'hubspot':
        if (!config.apiKey) {
          throw new Error('API Key é obrigatória para HubSpot');
        }
        break;

      case 'salesforce':
        if (!config.clientId || !config.clientSecret) {
          throw new Error('Client ID e Client Secret são obrigatórios para Salesforce');
        }
        break;

      case 'openai':
        if (!config.apiKey) {
          throw new Error('API Key é obrigatória para OpenAI');
        }
        break;
    }
  }

  /**
   * Testa conexão com uma plataforma
   */
  async testPlatformConnection(platformId: string): Promise<boolean> {
    const platform = this.platforms.get(platformId);
    if (!platform) {
      throw new Error(`Plataforma ${platformId} não encontrada`);
    }

    try {
      switch (platformId) {
        case 'n8n':
          return await this.testN8nConnection(platform);
        case 'zapier':
          return await this.testZapierConnection(platform);
        case 'hubspot':
          return await this.testHubSpotConnection(platform);
        case 'salesforce':
          return await this.testSalesforceConnection(platform);
        case 'slack':
          return await this.testSlackConnection(platform);
        case 'openai':
          return await this.testOpenAIConnection(platform);
        default:
          return await this.testGenericConnection(platform);
      }
    } catch (error) {
      console.error(`❌ Falha no teste de conexão ${platform.name}:`, error);
      return false;
    }
  }

  /**
   * Testes específicos de conexão por plataforma
   */
  private async testN8nConnection(platform: IntegrationPlatform): Promise<boolean> {
    const { host, port, apiKey, useSSL } = platform.authentication.config;
    const baseUrl = `${useSSL ? 'https' : 'http'}://${host}:${port}`;
    
    const response = await fetch(`${baseUrl}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  }

  private async testZapierConnection(platform: IntegrationPlatform): Promise<boolean> {
    const { webhookUrl } = platform.authentication.config;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true, source: 'whats-hub-integration-test' })
    });

    return response.ok;
  }

  private async testHubSpotConnection(platform: IntegrationPlatform): Promise<boolean> {
    const { apiKey } = platform.authentication.config;
    
    const response = await fetch(`${platform.baseUrl}/crm/v3/contacts?limit=1`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  }

  private async testSalesforceConnection(platform: IntegrationPlatform): Promise<boolean> {
    // Implementação específica para Salesforce OAuth
    const { accessToken } = platform.authentication.config;
    
    if (!accessToken) {
      throw new Error('Token de acesso não encontrado. Execute o fluxo OAuth primeiro.');
    }

    const response = await fetch(`${platform.baseUrl}/services/data/v60.0/sobjects/Account/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  }

  private async testSlackConnection(platform: IntegrationPlatform): Promise<boolean> {
    const { botToken } = platform.authentication.config;
    
    const response = await fetch(`${platform.baseUrl}/auth.test`, {
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  }

  private async testOpenAIConnection(platform: IntegrationPlatform): Promise<boolean> {
    const { apiKey } = platform.authentication.config;
    
    const response = await fetch(`${platform.baseUrl}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  }

  private async testGenericConnection(platform: IntegrationPlatform): Promise<boolean> {
    if (!platform.baseUrl) return false;
    
    const response = await fetch(platform.baseUrl);
    return response.ok;
  }

  /**
   * Cria um workflow universal
   */
  async createWorkflow(workflow: Omit<UniversalWorkflow, 'id' | 'metadata'>): Promise<string> {
    const id = this.generateId();
    const newWorkflow: UniversalWorkflow = {
      ...workflow,
      id,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        tags: workflow.metadata?.tags || []
      }
    };

    // Validar workflow
    await this.validateWorkflow(newWorkflow);

    // Salvar workflow
    this.workflows.set(id, newWorkflow);

    // Deploy na plataforma específica
    await this.deployWorkflow(newWorkflow);

    console.log(`✅ Workflow "${workflow.name}" criado com sucesso`);
    return id;
  }

  /**
   * Valida um workflow
   */
  private async validateWorkflow(workflow: UniversalWorkflow): Promise<void> {
    // Verificar se a plataforma existe
    if (!this.platforms.has(workflow.platform)) {
      throw new Error(`Plataforma ${workflow.platform} não encontrada`);
    }

    // Verificar steps
    if (!workflow.steps.length) {
      throw new Error('Workflow deve ter pelo menos um step');
    }

    // Verificar conexões entre steps
    const stepIds = new Set(workflow.steps.map(s => s.id));
    for (const step of workflow.steps) {
      if (step.onSuccess && !stepIds.has(step.onSuccess)) {
        throw new Error(`Step ${step.id} referencia step inexistente: ${step.onSuccess}`);
      }
      if (step.onFailure && !stepIds.has(step.onFailure)) {
        throw new Error(`Step ${step.id} referencia step inexistente: ${step.onFailure}`);
      }
    }
  }

  /**
   * Deploy do workflow na plataforma específica
   */
  private async deployWorkflow(workflow: UniversalWorkflow): Promise<void> {
    const platform = this.platforms.get(workflow.platform);
    if (!platform) {
      throw new Error(`Plataforma ${workflow.platform} não encontrada`);
    }

    switch (workflow.platform) {
      case 'n8n':
        await this.deployToN8n(workflow, platform);
        break;
      case 'zapier':
        await this.deployToZapier(workflow, platform);
        break;
      case 'power-automate':
        await this.deployToPowerAutomate(workflow, platform);
        break;
      case 'make':
        await this.deployToMake(workflow, platform);
        break;
      default:
        console.warn(`Deploy automático não implementado para ${workflow.platform}`);
    }
  }

  /**
   * Deploy específico para n8n
   */
  private async deployToN8n(workflow: UniversalWorkflow, platform: IntegrationPlatform): Promise<void> {
    const { host, port, apiKey, useSSL } = platform.authentication.config;
    const baseUrl = `${useSSL ? 'https' : 'http'}://${host}:${port}`;

    // Converter workflow universal para formato n8n
    const n8nWorkflow = {
      name: workflow.name,
      nodes: this.convertToN8nNodes(workflow),
      connections: this.generateN8nConnections(workflow),
      active: workflow.isActive,
      settings: {},
      tags: workflow.metadata.tags
    };

    const response = await fetch(`${baseUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(n8nWorkflow)
    });

    if (!response.ok) {
      throw new Error(`Falha ao deployar no n8n: ${response.statusText}`);
    }

    console.log(`✅ Workflow deployado no n8n`);
  }

  /**
   * Deploy específico para Zapier
   */
  private async deployToZapier(workflow: UniversalWorkflow, platform: IntegrationPlatform): Promise<void> {
    // Para Zapier, enviamos dados via webhook
    const { webhookUrl } = platform.authentication.config;

    const zapierData = {
      workflow_name: workflow.name,
      workflow_description: workflow.description,
      trigger: workflow.trigger,
      steps: workflow.steps,
      source: 'whats-hub'
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zapierData)
    });

    if (!response.ok) {
      throw new Error(`Falha ao deployar no Zapier: ${response.statusText}`);
    }

    console.log(`✅ Workflow enviado para Zapier`);
  }

  /**
   * Deploy específico para Power Automate
   */
  private async deployToPowerAutomate(workflow: UniversalWorkflow, platform: IntegrationPlatform): Promise<void> {
    // Implementação específica para Power Automate
    console.log(`📋 Deploy para Power Automate não implementado automaticamente`);
    console.log(`Use o template gerado para criar manualmente no Power Automate`);
  }

  /**
   * Deploy específico para Make.com
   */
  private async deployToMake(workflow: UniversalWorkflow, platform: IntegrationPlatform): Promise<void> {
    // Implementação específica para Make.com
    const { webhookUrl } = platform.authentication.config;

    const makeData = {
      scenario_name: workflow.name,
      description: workflow.description,
      modules: this.convertToMakeModules(workflow),
      source: 'whats-hub'
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makeData)
    });

    if (!response.ok) {
      throw new Error(`Falha ao deployar no Make.com: ${response.statusText}`);
    }

    console.log(`✅ Workflow enviado para Make.com`);
  }

  /**
   * Converte workflow universal para nós n8n
   */
  private convertToN8nNodes(workflow: UniversalWorkflow): any[] {
    const nodes = [];

    // Adicionar trigger
    nodes.push({
      id: 'trigger',
      name: 'Webhook Trigger',
      type: 'webhook',
      typeVersion: 1,
      position: [200, 200],
      parameters: {
        httpMethod: 'POST',
        path: workflow.trigger.config.path || workflow.name.toLowerCase().replace(/\s+/g, '-')
      }
    });

    // Converter steps
    workflow.steps.forEach((step, index) => {
      nodes.push({
        id: step.id,
        name: step.name,
        type: this.mapStepTypeToN8n(step.type),
        typeVersion: 1,
        position: [200 + (index + 1) * 300, 200],
        parameters: step.config
      });
    });

    return nodes;
  }

  /**
   * Gera conexões para n8n
   */
  private generateN8nConnections(workflow: UniversalWorkflow): any {
    const connections: any = {};

    // Conectar trigger ao primeiro step
    if (workflow.steps.length > 0) {
      connections['trigger'] = {
        main: [[{ node: workflow.steps[0].id, type: 'main', index: 0 }]]
      };
    }

    // Conectar steps
    workflow.steps.forEach(step => {
      if (step.onSuccess) {
        connections[step.id] = {
          main: [[{ node: step.onSuccess, type: 'main', index: 0 }]]
        };
      }
    });

    return connections;
  }

  /**
   * Converte workflow para módulos Make.com
   */
  private convertToMakeModules(workflow: UniversalWorkflow): any[] {
    const modules = [];

    // Trigger module
    modules.push({
      id: 1,
      module: 'webhook:webhook',
      version: 1,
      parameters: {
        webhook: workflow.trigger.config.webhook || 'whats-hub-trigger'
      }
    });

    // Steps modules
    workflow.steps.forEach((step, index) => {
      modules.push({
        id: index + 2,
        module: this.mapStepTypeToMake(step.type),
        version: 1,
        parameters: step.config
      });
    });

    return modules;
  }

  /**
   * Mapeia tipos de step para diferentes plataformas
   */
  private mapStepTypeToN8n(stepType: string): string {
    const mapping: Record<string, string> = {
      'action': 'webhook',
      'condition': 'if',
      'loop': 'loop',
      'parallel': 'merge',
      'delay': 'wait'
    };
    return mapping[stepType] || 'webhook';
  }

  private mapStepTypeToMake(stepType: string): string {
    const mapping: Record<string, string> = {
      'action': 'webhook:webhook',
      'condition': 'builtin:filter',
      'loop': 'builtin:repeater',
      'delay': 'builtin:sleep'
    };
    return mapping[stepType] || 'webhook:webhook';
  }

  /**
   * Executa um workflow
   */
  async executeWorkflow(workflowId: string, triggerData: any): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} não encontrado`);
    }

    if (!workflow.isActive) {
      throw new Error(`Workflow ${workflowId} está inativo`);
    }

    const executionId = this.generateId();
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      platform: workflow.platform,
      trigger: triggerData,
      status: 'pending',
      startTime: new Date(),
      data: triggerData,
      retryCount: 0,
      logs: []
    };

    this.executions.set(executionId, execution);

    // Executar de forma assíncrona
    this.runWorkflowExecution(execution, workflow).catch(error => {
      console.error('Erro na execução do workflow:', error);
    });

    return executionId;
  }

  /**
   * Executa um workflow completo
   */
  private async runWorkflowExecution(execution: WorkflowExecution, workflow: UniversalWorkflow): Promise<void> {
    try {
      execution.status = 'running';
      this.addExecutionLog(execution, 'info', `Iniciando execução do workflow ${workflow.name}`);

      let currentStepId = workflow.steps[0]?.id;
      let stepData = execution.data;

      while (currentStepId) {
        const step = workflow.steps.find(s => s.id === currentStepId);
        if (!step) break;

        this.addExecutionLog(execution, 'info', `Executando step: ${step.name}`);

        try {
          const stepResult = await this.executeStep(step, stepData, execution);
          stepData = { ...stepData, ...stepResult };

          // Determinar próximo step
          currentStepId = step.onSuccess;

        } catch (stepError) {
          this.addExecutionLog(execution, 'error', `Erro no step ${step.name}: ${stepError}`);

          if (step.onFailure) {
            currentStepId = step.onFailure;
          } else if (workflow.errorHandling.onError === 'continue') {
            currentStepId = step.onSuccess;
          } else {
            throw stepError;
          }
        }
      }

      execution.status = 'completed';
      execution.endTime = new Date();
      execution.result = stepData;
      this.addExecutionLog(execution, 'info', 'Workflow executado com sucesso');

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.error = error instanceof Error ? error.message : 'Erro desconhecido';
      this.addExecutionLog(execution, 'error', `Falha na execução: ${execution.error}`);

      // Tentar retry se configurado
      if (execution.retryCount < workflow.errorHandling.maxRetries) {
        execution.retryCount++;
        execution.status = 'pending';
        setTimeout(() => this.runWorkflowExecution(execution, workflow), 5000);
      }
    }
  }

  /**
   * Executa um step específico
   */
  private async executeStep(step: WorkflowStep, data: any, execution: WorkflowExecution): Promise<any> {
    switch (step.type) {
      case 'action':
        return await this.executeAction(step, data, execution);
      case 'condition':
        return await this.executeCondition(step, data, execution);
      case 'delay':
        return await this.executeDelay(step, data, execution);
      default:
        throw new Error(`Tipo de step não suportado: ${step.type}`);
    }
  }

  /**
   * Executa uma ação
   */
  private async executeAction(step: WorkflowStep, data: any, execution: WorkflowExecution): Promise<any> {
    if (step.platform) {
      const platform = this.platforms.get(step.platform);
      if (!platform) {
        throw new Error(`Plataforma ${step.platform} não encontrada`);
      }

      // Executar ação específica da plataforma
      return await this.executePlatformAction(platform, step, data);
    }

    // Ação genérica
    return { success: true, data };
  }

  /**
   * Executa ação específica da plataforma
   */
  private async executePlatformAction(platform: IntegrationPlatform, step: WorkflowStep, data: any): Promise<any> {
    switch (platform.id) {
      case 'hubspot':
        return await this.executeHubSpotAction(platform, step, data);
      case 'salesforce':
        return await this.executeSalesforceAction(platform, step, data);
      case 'slack':
        return await this.executeSlackAction(platform, step, data);
      case 'openai':
        return await this.executeOpenAIAction(platform, step, data);
      default:
        return await this.executeGenericAction(platform, step, data);
    }
  }

  /**
   * Ações específicas por plataforma
   */
  private async executeHubSpotAction(platform: IntegrationPlatform, step: WorkflowStep, data: any): Promise<any> {
    const { apiKey } = platform.authentication.config;
    const { action, objectType, properties } = step.config;

    let url = `${platform.baseUrl}/crm/v3/objects/${objectType}`;
    let method = 'POST';

    if (action === 'update') {
      method = 'PATCH';
      url += `/${step.config.objectId}`;
    } else if (action === 'get') {
      method = 'GET';
      url += `/${step.config.objectId}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify({ properties }) : undefined
    });

    if (!response.ok) {
      throw new Error(`Erro na ação HubSpot: ${response.statusText}`);
    }

    return await response.json();
  }

  private async executeSalesforceAction(platform: IntegrationPlatform, step: WorkflowStep, data: any): Promise<any> {
    const { accessToken } = platform.authentication.config;
    const { action, objectType, fields } = step.config;

    let url = `${platform.baseUrl}/services/data/v60.0/sobjects/${objectType}`;
    let method = 'POST';

    if (action === 'update') {
      method = 'PATCH';
      url += `/${step.config.objectId}`;
    } else if (action === 'query') {
      method = 'GET';
      url = `${platform.baseUrl}/services/data/v60.0/query?q=${encodeURIComponent(step.config.soql)}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify(fields) : undefined
    });

    if (!response.ok) {
      throw new Error(`Erro na ação Salesforce: ${response.statusText}`);
    }

    return await response.json();
  }

  private async executeSlackAction(platform: IntegrationPlatform, step: WorkflowStep, data: any): Promise<any> {
    const { botToken } = platform.authentication.config;
    const { action, channel, message } = step.config;

    const response = await fetch(`${platform.baseUrl}/chat.postMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel,
        text: message,
        ...step.config.options
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na ação Slack: ${response.statusText}`);
    }

    return await response.json();
  }

  private async executeOpenAIAction(platform: IntegrationPlatform, step: WorkflowStep, data: any): Promise<any> {
    const { apiKey } = platform.authentication.config;
    const { model, prompt, maxTokens } = step.config;

    const response = await fetch(`${platform.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens || 150
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na ação OpenAI: ${response.statusText}`);
    }

    return await response.json();
  }

  private async executeGenericAction(platform: IntegrationPlatform, step: WorkflowStep, data: any): Promise<any> {
    // Implementação genérica para plataformas não específicas
    return { success: true, platform: platform.id, step: step.name, data };
  }

  /**
   * Executa uma condição
   */
  private async executeCondition(step: WorkflowStep, data: any, execution: WorkflowExecution): Promise<any> {
    const { condition, value, operator } = step.config;
    
    let result = false;
    const dataValue = this.getValueFromData(data, condition);

    switch (operator) {
      case 'equals':
        result = dataValue === value;
        break;
      case 'contains':
        result = String(dataValue).includes(value);
        break;
      case 'greater_than':
        result = Number(dataValue) > Number(value);
        break;
      case 'less_than':
        result = Number(dataValue) < Number(value);
        break;
    }

    return { conditionResult: result, data };
  }

  /**
   * Executa um delay
   */
  private async executeDelay(step: WorkflowStep, data: any, execution: WorkflowExecution): Promise<any> {
    const { duration } = step.config;
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
    return data;
  }

  /**
   * Adiciona log de execução
   */
  private addExecutionLog(execution: WorkflowExecution, level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void {
    execution.logs.push({
      timestamp: new Date(),
      level,
      message,
      data
    });
  }

  /**
   * Monitor de execuções
   */
  private startExecutionMonitor(): void {
    setInterval(() => {
      this.cleanupOldExecutions();
    }, 60000); // Cleanup a cada minuto
  }

  /**
   * Limpa execuções antigas
   */
  private cleanupOldExecutions(): void {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas atrás
    
    for (const [id, execution] of this.executions.entries()) {
      if (execution.startTime < cutoffDate) {
        this.executions.delete(id);
      }
    }
  }

  /**
   * Utilitários
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private getValueFromData(data: any, path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], data);
  }

  /**
   * APIs públicas
   */
  
  // Obter plataformas disponíveis
  getAvailablePlatforms(): IntegrationPlatform[] {
    return Array.from(this.platforms.values());
  }

  // Obter workflows
  getWorkflows(): UniversalWorkflow[] {
    return Array.from(this.workflows.values());
  }

  // Obter execuções
  getExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }

  // Obter estatísticas
  getExecutionStats(): any {
    const executions = Array.from(this.executions.values());
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recent = executions.filter(e => e.startTime > last24h);
    const successful = recent.filter(e => e.status === 'completed').length;
    const failed = recent.filter(e => e.status === 'failed').length;

    return {
      total: executions.length,
      last24h: recent.length,
      successRate: recent.length > 0 ? (successful / recent.length) * 100 : 0,
      running: executions.filter(e => e.status === 'running').length,
      platforms: {
        active: Array.from(this.platforms.values()).filter(p => p.authentication.config.apiKey || p.authentication.config.webhookUrl).length,
        total: this.platforms.size
      }
    };
  }
}

export default UniversalIntegrationService;
export type { 
  IntegrationPlatform, 
  UniversalWorkflow, 
  WorkflowExecution, 
  WorkflowStep,
  ExecutionLog
};
