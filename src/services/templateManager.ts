/**
 * 📋 Template Manager - FASE 2 FUNCIONALIDADES AVANÇADAS
 * Sistema de templates e workflows para N8N + WhatsApp
 */

import { whatsHubIntegration } from './whatsHubIntegration';

export interface MessageTemplate {
  id: string;
  name: string;
  category: 'greeting' | 'support' | 'sales' | 'closing' | 'custom';
  message: string;
  variables: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean';
    required: boolean;
    defaultValue?: any;
  }>;
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
    value: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'customer_service' | 'sales' | 'marketing' | 'automation';
  n8nWorkflow: any; // JSON do workflow N8N
  triggers: Array<{
    type: 'message' | 'time' | 'webhook' | 'manual';
    config: Record<string, any>;
  }>;
  steps: Array<{
    id: string;
    type: 'message' | 'condition' | 'action' | 'delay';
    config: Record<string, any>;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: 'keyword' | 'time' | 'event' | 'condition';
    value: string;
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
  actions: Array<{
    type: 'send_message' | 'add_to_queue' | 'assign_attendant' | 'execute_workflow';
    config: Record<string, any>;
  }>;
  isActive: boolean;
  priority: number;
  createdAt: Date;
}

class TemplateManager {
  private templates: Map<string, MessageTemplate> = new Map();
  private workflows: Map<string, WorkflowTemplate> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private storageKey = 'whatsHub_templates';

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultTemplates();
  }

  // =============================
  // TEMPLATES DE MENSAGEM
  // =============================

  private initializeDefaultTemplates(): void {
    const defaultTemplates: MessageTemplate[] = [
      {
        id: 'greeting_default',
        name: 'Saudação Padrão',
        category: 'greeting',
        message: 'Olá {{customerName}}! Bem-vindo à Inaugura Lar. Como posso ajudá-lo hoje?',
        variables: [
          { name: 'customerName', type: 'text', required: false, defaultValue: 'cliente' }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      },
      {
        id: 'support_queue',
        name: 'Entrada na Fila',
        category: 'support',
        message: 'Obrigado por entrar em contato! Você está na posição {{queuePosition}} da fila. Tempo estimado de espera: {{estimatedTime}} minutos.',
        variables: [
          { name: 'queuePosition', type: 'number', required: true },
          { name: 'estimatedTime', type: 'number', required: true }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      },
      {
        id: 'business_hours',
        name: 'Fora do Horário',
        category: 'support',
        message: 'No momento estamos fora do horário de atendimento. Nosso funcionamento é de {{startTime}} às {{endTime}}, de segunda a sexta. Retornaremos sua mensagem no próximo dia útil.',
        variables: [
          { name: 'startTime', type: 'text', required: true, defaultValue: '08:00' },
          { name: 'endTime', type: 'text', required: true, defaultValue: '18:00' }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      },
      {
        id: 'sales_inquiry',
        name: 'Consulta de Vendas',
        category: 'sales',
        message: 'Vou te ajudar com informações sobre {{productType}}. Nossa equipe comercial entrará em contato em breve para passar todos os detalhes e preços.',
        variables: [
          { name: 'productType', type: 'text', required: true, defaultValue: 'nossos produtos' }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      },
      {
        id: 'closing_satisfied',
        name: 'Encerramento Satisfeito',
        category: 'closing',
        message: 'Fico feliz em ter ajudado você! Se precisar de mais alguma coisa, estarei sempre aqui. Tenha um ótimo dia! 😊',
        variables: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      }
    ];

    defaultTemplates.forEach(template => {
      if (!this.templates.has(template.id)) {
        this.templates.set(template.id, template);
      }
    });

    this.saveToStorage();
  }

  createTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): string {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTemplate: MessageTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };

    this.templates.set(id, newTemplate);
    this.saveToStorage();
    return id;
  }

  getTemplate(id: string): MessageTemplate | null {
    return this.templates.get(id) || null;
  }

  getAllTemplates(): MessageTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: MessageTemplate['category']): MessageTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  updateTemplate(id: string, updates: Partial<MessageTemplate>): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    const updated = {
      ...template,
      ...updates,
      id,
      updatedAt: new Date()
    };

    this.templates.set(id, updated);
    this.saveToStorage();
    return true;
  }

  deleteTemplate(id: string): boolean {
    const deleted = this.templates.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // =============================
  // PROCESSAMENTO DE TEMPLATES
  // =============================

  processTemplate(templateId: string, variables: Record<string, any> = {}): string | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    let message = template.message;

    // Substituir variáveis
    template.variables.forEach(variable => {
      const value = variables[variable.name] || variable.defaultValue || '';
      const placeholder = `{{${variable.name}}}`;
      message = message.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });

    // Incrementar contador de uso
    template.usageCount++;
    this.templates.set(templateId, template);
    this.saveToStorage();

    return message;
  }

  findMatchingTemplate(message: string, context: Record<string, any> = {}): MessageTemplate | null {
    const templates = Array.from(this.templates.values())
      .filter(t => t.isActive && t.conditions)
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

    for (const template of templates) {
      if (this.evaluateConditions(template.conditions || [], message, context)) {
        return template;
      }
    }

    return null;
  }

  private evaluateConditions(conditions: any[], message: string, context: Record<string, any>): boolean {
    return conditions.every(condition => {
      const { field, operator, value } = condition;
      let fieldValue: string;

      if (field === 'message') {
        fieldValue = message.toLowerCase();
      } else {
        fieldValue = (context[field] || '').toString().toLowerCase();
      }

      const conditionValue = value.toLowerCase();

      switch (operator) {
        case 'equals':
          return fieldValue === conditionValue;
        case 'contains':
          return fieldValue.includes(conditionValue);
        case 'startsWith':
          return fieldValue.startsWith(conditionValue);
        case 'endsWith':
          return fieldValue.endsWith(conditionValue);
        default:
          return false;
      }
    });
  }

  // =============================
  // WORKFLOWS N8N
  // =============================

  createWorkflow(workflow: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newWorkflow: WorkflowTemplate = {
      ...workflow,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.set(id, newWorkflow);
    this.saveToStorage();
    return id;
  }

  getWorkflow(id: string): WorkflowTemplate | null {
    return this.workflows.get(id) || null;
  }

  getAllWorkflows(): WorkflowTemplate[] {
    return Array.from(this.workflows.values());
  }

  async deployWorkflowToN8n(workflowId: string): Promise<{ success: boolean; n8nWorkflowId?: string; error?: string }> {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) {
      return { success: false, error: 'Workflow não encontrado' };
    }

    try {
      // FASE 2: Implementar deploy real para N8N
      const result = await whatsHubIntegration.executeWorkflow('deploy-workflow', {
        workflow: workflow.n8nWorkflow,
        name: workflow.name,
        description: workflow.description
      });

      return {
        success: true,
        n8nWorkflowId: result.id
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao fazer deploy: ${error}`
      };
    }
  }

  // =============================
  // REGRAS DE AUTOMAÇÃO
  // =============================

  createAutomationRule(rule: Omit<AutomationRule, 'id' | 'createdAt'>): string {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRule: AutomationRule = {
      ...rule,
      id,
      createdAt: new Date()
    };

    this.automationRules.set(id, newRule);
    this.saveToStorage();
    return id;
  }

  getAllAutomationRules(): AutomationRule[] {
    return Array.from(this.automationRules.values())
      .filter(rule => rule.isActive)
      .sort((a, b) => b.priority - a.priority);
  }

  async executeMatchingRules(message: string, context: Record<string, any>): Promise<void> {
    const rules = this.getAllAutomationRules();

    for (const rule of rules) {
      if (this.evaluateRuleTrigger(rule.trigger, message, context)) {
        await this.executeRuleActions(rule.actions, context);
      }
    }
  }

  private evaluateRuleTrigger(trigger: AutomationRule['trigger'], message: string, context: Record<string, any>): boolean {
    const { type, value, conditions } = trigger;

    switch (type) {
      case 'keyword':
        return message.toLowerCase().includes(value.toLowerCase());
      case 'condition':
        return this.evaluateConditions(conditions, message, context);
      default:
        return false;
    }
  }

  private async executeRuleActions(actions: AutomationRule['actions'], context: Record<string, any>): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'send_message':
            // Implementar envio de mensagem
            console.log('Enviando mensagem automática:', action.config);
            break;
          case 'add_to_queue':
            // Implementar adição à fila
            console.log('Adicionando à fila:', action.config);
            break;
          case 'execute_workflow':
            // Implementar execução de workflow
            await whatsHubIntegration.executeWorkflow(action.config.workflowId, context);
            break;
        }
      } catch (error) {
        console.error('Erro ao executar ação de automação:', error);
      }
    }
  }

  // =============================
  // STORAGE
  // =============================

  private saveToStorage(): void {
    try {
      const data = {
        templates: Object.fromEntries(this.templates),
        workflows: Object.fromEntries(this.workflows),
        automationRules: Object.fromEntries(this.automationRules)
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar templates:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        if (data.templates) {
          this.templates = new Map(Object.entries(data.templates));
        }
        
        if (data.workflows) {
          this.workflows = new Map(Object.entries(data.workflows));
        }
        
        if (data.automationRules) {
          this.automationRules = new Map(Object.entries(data.automationRules));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  }

  // =============================
  // EXPORTAR/IMPORTAR
  // =============================

  exportTemplates(): string {
    return JSON.stringify({
      templates: Object.fromEntries(this.templates),
      workflows: Object.fromEntries(this.workflows),
      automationRules: Object.fromEntries(this.automationRules),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  importTemplates(data: string): { success: boolean; imported: number; error?: string } {
    try {
      const parsed = JSON.parse(data);
      let imported = 0;

      if (parsed.templates) {
        Object.values(parsed.templates).forEach((template: any) => {
          const id = this.createTemplate(template);
          if (id) imported++;
        });
      }

      if (parsed.workflows) {
        Object.values(parsed.workflows).forEach((workflow: any) => {
          const id = this.createWorkflow(workflow);
          if (id) imported++;
        });
      }

      if (parsed.automationRules) {
        Object.values(parsed.automationRules).forEach((rule: any) => {
          const id = this.createAutomationRule(rule);
          if (id) imported++;
        });
      }

      return { success: true, imported };
    } catch (error) {
      return { 
        success: false, 
        imported: 0, 
        error: `Erro ao importar: ${error}` 
      };
    }
  }

  // =============================
  // ESTATÍSTICAS
  // =============================

  getStats() {
    const templates = Array.from(this.templates.values());
    const workflows = Array.from(this.workflows.values());
    const rules = Array.from(this.automationRules.values());

    return {
      templates: {
        total: templates.length,
        active: templates.filter(t => t.isActive).length,
        byCategory: templates.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        mostUsed: templates
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, 5)
          .map(t => ({ id: t.id, name: t.name, usageCount: t.usageCount }))
      },
      workflows: {
        total: workflows.length,
        active: workflows.filter(w => w.isActive).length,
        byCategory: workflows.reduce((acc, w) => {
          acc[w.category] = (acc[w.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      automationRules: {
        total: rules.length,
        active: rules.filter(r => r.isActive).length
      }
    };
  }
}

// Singleton instance
export const templateManager = new TemplateManager();

// Export default
export default templateManager;
