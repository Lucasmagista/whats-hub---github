/**
 * Templates de Workflow Pré-configurados
 * Biblioteca completa de templates para diferentes casos de uso
 */

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'customer-service' | 'sales' | 'marketing' | 'support' | 'e-commerce' | 'hr' | 'finance' | 'operations';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  platforms: string[];
  tags: string[];
  preview?: string;
  triggers: TemplateTrigger[];
  actions: TemplateAction[];
  conditions?: TemplateCondition[];
  variables?: TemplateVariable[];
  documentation?: string;
  useCase: string;
  benefits: string[];
}

export interface TemplateTrigger {
  type: string;
  platform: string;
  config: any;
  description: string;
}

export interface TemplateAction {
  type: string;
  platform: string;
  config: any;
  description: string;
  dependsOn?: string[];
}

export interface TemplateCondition {
  field: string;
  operator: string;
  value: any;
  description: string;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: any;
  description: string;
  required: boolean;
}

export const workflowTemplates: WorkflowTemplate[] = [
  // Customer Service Templates
  {
    id: 'welcome-new-customer',
    name: 'Boas-vindas para Novos Clientes',
    description: 'Automatiza processo de boas-vindas quando um novo cliente inicia conversa',
    category: 'customer-service',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    platforms: ['whatsapp', 'hubspot', 'email'],
    tags: ['boas-vindas', 'cliente', 'automação'],
    useCase: 'Quando um novo cliente envia sua primeira mensagem, este workflow automaticamente envia uma mensagem de boas-vindas, cria um contato no CRM e notifica a equipe.',
    benefits: [
      'Resposta imediata aos clientes',
      'Criação automática de contatos no CRM',
      'Melhora a experiência do cliente',
      'Reduz trabalho manual da equipe'
    ],
    triggers: [
      {
        type: 'message.received',
        platform: 'whatsapp',
        config: {
          condition: 'first_time_user',
          keywords: ['oi', 'olá', 'hello', 'começar']
        },
        description: 'Disparado quando um novo usuário envia sua primeira mensagem'
      }
    ],
    actions: [
      {
        type: 'send_message',
        platform: 'whatsapp',
        config: {
          message: 'Olá! 👋 Bem-vindo(a) à {{company_name}}! Sou seu assistente virtual e estou aqui para ajudar. Como posso te auxiliar hoje?',
          delay: 1
        },
        description: 'Envia mensagem de boas-vindas personalizada'
      },
      {
        type: 'create_contact',
        platform: 'hubspot',
        config: {
          properties: {
            firstname: '{{user.name}}',
            phone: '{{user.phone}}',
            lifecyclestage: 'lead',
            source: 'whatsapp-bot'
          }
        },
        description: 'Cria contato no HubSpot com informações do usuário'
      },
      {
        type: 'send_notification',
        platform: 'slack',
        config: {
          channel: '#vendas',
          message: '🆕 Novo cliente: {{user.name}} ({{user.phone}}) iniciou conversa via WhatsApp'
        },
        description: 'Notifica equipe sobre novo cliente'
      }
    ],
    variables: [
      {
        name: 'company_name',
        type: 'string',
        defaultValue: 'Minha Empresa',
        description: 'Nome da empresa para personalização',
        required: true
      }
    ]
  },

  {
    id: 'ticket-escalation',
    name: 'Escalação Automática de Tickets',
    description: 'Escala tickets automaticamente baseado em prioridade e tempo de resposta',
    category: 'support',
    difficulty: 'intermediate',
    estimatedTime: '15 min',
    platforms: ['whatsapp', 'zendesk', 'slack', 'email'],
    tags: ['suporte', 'escalação', 'sla', 'prioridade'],
    useCase: 'Monitora tickets de suporte e automaticamente escala para gerentes quando SLA está próximo do vencimento ou quando a prioridade é alta.',
    benefits: [
      'Garante cumprimento de SLA',
      'Melhora satisfação do cliente',
      'Distribui carga de trabalho',
      'Reduz tickets perdidos'
    ],
    triggers: [
      {
        type: 'ticket.created',
        platform: 'system',
        config: {
          priority: ['high', 'urgent']
        },
        description: 'Disparado quando ticket de alta prioridade é criado'
      }
    ],
    actions: [
      {
        type: 'assign_agent',
        platform: 'zendesk',
        config: {
          rule: 'least_busy',
          group: 'senior_support'
        },
        description: 'Atribui automaticamente ao agente menos ocupado'
      },
      {
        type: 'set_sla',
        platform: 'system',
        config: {
          response_time: 30,
          resolution_time: 240
        },
        description: 'Define SLA baseado na prioridade'
      },
      {
        type: 'schedule_followup',
        platform: 'system',
        config: {
          delay: 25,
          action: 'escalate_to_manager'
        },
        description: 'Agenda escalação se não respondido em 25 minutos'
      }
    ],
    conditions: [
      {
        field: 'ticket.priority',
        operator: 'in',
        value: ['high', 'urgent'],
        description: 'Verifica se é ticket de alta prioridade'
      }
    ]
  },

  {
    id: 'lead-qualification',
    name: 'Qualificação Automática de Leads',
    description: 'Qualifica leads automaticamente baseado em respostas e comportamento',
    category: 'sales',
    difficulty: 'advanced',
    estimatedTime: '25 min',
    platforms: ['whatsapp', 'hubspot', 'openai', 'email'],
    tags: ['vendas', 'leads', 'qualificação', 'ia'],
    useCase: 'Utiliza IA para analisar mensagens de potenciais clientes, qualifica leads baseado em critérios definidos e distribui para vendedores apropriados.',
    benefits: [
      'Qualificação automática usando IA',
      'Distribuição inteligente de leads',
      'Melhora taxa de conversão',
      'Economiza tempo da equipe de vendas'
    ],
    triggers: [
      {
        type: 'message.received',
        platform: 'whatsapp',
        config: {
          keywords: ['produto', 'preço', 'comprar', 'orçamento', 'interesse']
        },
        description: 'Disparado quando mensagem contém palavras-chave de interesse comercial'
      }
    ],
    actions: [
      {
        type: 'analyze_intent',
        platform: 'openai',
        config: {
          model: 'gpt-4',
          prompt: 'Analise esta mensagem e determine o nível de interesse comercial (baixo/médio/alto): {{message.text}}',
          extract: ['intent_level', 'product_interest', 'budget_indication']
        },
        description: 'Usa IA para analisar intenção de compra'
      },
      {
        type: 'score_lead',
        platform: 'system',
        config: {
          criteria: {
            intent_level: 40,
            company_size: 30,
            budget: 30
          }
        },
        description: 'Calcula score do lead baseado em critérios'
      },
      {
        type: 'create_lead',
        platform: 'hubspot',
        config: {
          properties: {
            firstname: '{{user.name}}',
            phone: '{{user.phone}}',
            lead_score: '{{lead.score}}',
            lead_source: 'whatsapp-bot'
          }
        },
        description: 'Cria lead no CRM com score calculado'
      },
      {
        type: 'assign_salesperson',
        platform: 'system',
        config: {
          rule: 'round_robin',
          filter_by_score: 70
        },
        description: 'Atribui vendedor baseado no score do lead'
      }
    ],
    conditions: [
      {
        field: 'lead.score',
        operator: 'greater_than',
        value: 70,
        description: 'Apenas leads com score alto são atribuídos'
      }
    ]
  },

  {
    id: 'order-processing',
    name: 'Processamento Completo de Pedidos',
    description: 'Fluxo completo desde criação do pedido até entrega',
    category: 'e-commerce',
    difficulty: 'advanced',
    estimatedTime: '30 min',
    platforms: ['whatsapp', 'shopify', 'google-sheets', 'email', 'sms'],
    tags: ['e-commerce', 'pedidos', 'estoque', 'logística'],
    useCase: 'Automatiza todo o processo de pedidos, desde validação e cobrança até atualização de estoque e notificações de entrega.',
    benefits: [
      'Processamento automático de pedidos',
      'Controle de estoque em tempo real',
      'Notificações automáticas aos clientes',
      'Integração com sistemas de pagamento'
    ],
    triggers: [
      {
        type: 'order.created',
        platform: 'shopify',
        config: {
          status: 'pending'
        },
        description: 'Disparado quando novo pedido é criado'
      }
    ],
    actions: [
      {
        type: 'validate_order',
        platform: 'system',
        config: {
          checks: ['inventory', 'payment', 'shipping_address']
        },
        description: 'Valida disponibilidade e dados do pedido'
      },
      {
        type: 'update_inventory',
        platform: 'shopify',
        config: {
          action: 'decrease',
          items: '{{order.items}}'
        },
        description: 'Atualiza estoque dos produtos vendidos'
      },
      {
        type: 'log_order',
        platform: 'google-sheets',
        config: {
          spreadsheet_id: '{{sheets_id}}',
          sheet: 'Pedidos',
          data: {
            'Data': '{{order.date}}',
            'Cliente': '{{order.customer.name}}',
            'Total': '{{order.total}}',
            'Status': '{{order.status}}'
          }
        },
        description: 'Registra pedido na planilha de controle'
      },
      {
        type: 'send_confirmation',
        platform: 'whatsapp',
        config: {
          to: '{{order.customer.phone}}',
          message: '✅ Pedido #{{order.number}} confirmado! Total: R$ {{order.total}}. Previsão de entrega: {{delivery.estimate}}'
        },
        description: 'Envia confirmação via WhatsApp'
      },
      {
        type: 'create_invoice',
        platform: 'system',
        config: {
          template: 'standard',
          send_email: true
        },
        description: 'Gera e envia fatura por email'
      }
    ],
    variables: [
      {
        name: 'sheets_id',
        type: 'string',
        description: 'ID da planilha Google Sheets para logs',
        required: true
      }
    ]
  },

  {
    id: 'appointment-booking',
    name: 'Agendamento Automático',
    description: 'Sistema completo de agendamento com confirmações e lembretes',
    category: 'operations',
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    platforms: ['whatsapp', 'google-calendar', 'email', 'sms'],
    tags: ['agendamento', 'calendário', 'lembretes', 'confirmação'],
    useCase: 'Permite que clientes agendem compromissos via WhatsApp, verifica disponibilidade, cria eventos no calendário e envia lembretes automáticos.',
    benefits: [
      'Agendamento 24/7 sem intervenção humana',
      'Sincronização automática com calendário',
      'Lembretes automáticos reduzem no-shows',
      'Melhora experiência do cliente'
    ],
    triggers: [
      {
        type: 'message.received',
        platform: 'whatsapp',
        config: {
          keywords: ['agendar', 'marcar', 'consulta', 'reunião', 'horário']
        },
        description: 'Disparado quando cliente solicita agendamento'
      }
    ],
    actions: [
      {
        type: 'show_calendar',
        platform: 'whatsapp',
        config: {
          message: 'Vou ajudar você a agendar! Aqui estão os horários disponíveis:',
          calendar_type: 'interactive'
        },
        description: 'Mostra calendário interativo com horários disponíveis'
      },
      {
        type: 'check_availability',
        platform: 'google-calendar',
        config: {
          calendar_id: '{{calendar_id}}',
          duration: 60,
          working_hours: '09:00-18:00'
        },
        description: 'Verifica disponibilidade no Google Calendar'
      },
      {
        type: 'create_event',
        platform: 'google-calendar',
        config: {
          title: 'Reunião com {{customer.name}}',
          duration: 60,
          attendees: ['{{customer.email}}']
        },
        description: 'Cria evento no calendário'
      },
      {
        type: 'send_confirmation',
        platform: 'whatsapp',
        config: {
          message: '✅ Agendamento confirmado para {{appointment.date}} às {{appointment.time}}. Você receberá um lembrete 1 hora antes!'
        },
        description: 'Confirma agendamento para o cliente'
      },
      {
        type: 'schedule_reminder',
        platform: 'system',
        config: {
          when: 'before_1_hour',
          message: '⏰ Lembrete: Você tem um agendamento em 1 hora ({{appointment.time}}). Local: {{appointment.location}}'
        },
        description: 'Agenda lembrete automático'
      }
    ],
    variables: [
      {
        name: 'calendar_id',
        type: 'string',
        description: 'ID do calendário Google para agendamentos',
        required: true
      }
    ]
  },

  {
    id: 'feedback-collection',
    name: 'Coleta Automática de Feedback',
    description: 'Coleta feedback pós-atendimento e analisa satisfação',
    category: 'customer-service',
    difficulty: 'intermediate',
    estimatedTime: '15 min',
    platforms: ['whatsapp', 'google-forms', 'google-sheets', 'slack'],
    tags: ['feedback', 'satisfação', 'nps', 'análise'],
    useCase: 'Após finalizar um atendimento, automaticamente solicita feedback do cliente, coleta respostas e analisa dados de satisfação.',
    benefits: [
      'Coleta sistemática de feedback',
      'Análise automática de satisfação',
      'Identificação de pontos de melhoria',
      'Aumento da satisfação do cliente'
    ],
    triggers: [
      {
        type: 'ticket.closed',
        platform: 'system',
        config: {
          wait_time: 300
        },
        description: 'Disparado 5 minutos após fechamento do ticket'
      }
    ],
    actions: [
      {
        type: 'send_survey',
        platform: 'whatsapp',
        config: {
          message: 'Olá {{customer.name}}! Como foi seu atendimento hoje? Por favor, avalie de 1 a 5: \n\n1️⃣ Muito ruim\n2️⃣ Ruim\n3️⃣ Regular\n4️⃣ Bom\n5️⃣ Excelente'
        },
        description: 'Envia pesquisa de satisfação'
      },
      {
        type: 'collect_response',
        platform: 'system',
        config: {
          timeout: 3600,
          validation: 'numeric_1_to_5'
        },
        description: 'Coleta e valida resposta do cliente'
      },
      {
        type: 'log_feedback',
        platform: 'google-sheets',
        config: {
          spreadsheet_id: '{{feedback_sheet_id}}',
          sheet: 'Feedback',
          data: {
            'Data': '{{now}}',
            'Cliente': '{{customer.name}}',
            'Nota': '{{response.rating}}',
            'Ticket': '{{ticket.id}}',
            'Agente': '{{ticket.agent}}'
          }
        },
        description: 'Registra feedback na planilha'
      },
      {
        type: 'analyze_sentiment',
        platform: 'system',
        config: {
          threshold_alert: 3
        },
        description: 'Analisa satisfação e gera alertas se necessário'
      }
    ],
    conditions: [
      {
        field: 'response.rating',
        operator: 'less_than',
        value: 3,
        description: 'Dispara alerta para avaliações baixas'
      }
    ]
  },

  {
    id: 'abandoned-cart-recovery',
    name: 'Recuperação de Carrinho Abandonado',
    description: 'Recupera vendas de carrinhos abandonados com ofertas personalizadas',
    category: 'e-commerce',
    difficulty: 'intermediate',
    estimatedTime: '18 min',
    platforms: ['whatsapp', 'shopify', 'email', 'openai'],
    tags: ['e-commerce', 'carrinho', 'recuperação', 'vendas'],
    useCase: 'Detecta carrinhos abandonados e envia sequência de mensagens personalizadas para recuperar a venda, incluindo ofertas especiais.',
    benefits: [
      'Recupera vendas perdidas',
      'Aumenta taxa de conversão',
      'Mensagens personalizadas',
      'ROI elevado'
    ],
    triggers: [
      {
        type: 'cart.abandoned',
        platform: 'shopify',
        config: {
          timeout: 1800
        },
        description: 'Disparado quando carrinho fica inativo por 30 minutos'
      }
    ],
    actions: [
      {
        type: 'wait',
        platform: 'system',
        config: {
          duration: 3600
        },
        description: 'Aguarda 1 hora antes do primeiro contato'
      },
      {
        type: 'send_reminder',
        platform: 'whatsapp',
        config: {
          message: 'Oi {{customer.name}}! 😊 Vi que você estava interessado(a) em alguns produtos. Que tal finalizar sua compra? Seus itens ainda estão separados!'
        },
        description: 'Primeiro lembrete amigável'
      },
      {
        type: 'wait',
        platform: 'system',
        config: {
          duration: 86400
        },
        description: 'Aguarda 24 horas'
      },
      {
        type: 'send_discount',
        platform: 'whatsapp',
        config: {
          message: '🎁 Oferta especial para você! Use o cupom VOLTA10 e ganhe 10% de desconto na sua compra. Válido por 24h!'
        },
        description: 'Oferece desconto para incentivar compra'
      },
      {
        type: 'create_coupon',
        platform: 'shopify',
        config: {
          code: 'VOLTA10',
          discount: 10,
          type: 'percentage',
          expires_in: 86400
        },
        description: 'Cria cupom de desconto temporário'
      }
    ]
  },

  {
    id: 'employee-onboarding',
    name: 'Onboarding de Funcionários',
    description: 'Automatiza processo de integração de novos funcionários',
    category: 'hr',
    difficulty: 'intermediate',
    estimatedTime: '22 min',
    platforms: ['email', 'slack', 'google-drive', 'trello'],
    tags: ['rh', 'onboarding', 'funcionários', 'integração'],
    useCase: 'Automatiza todo o processo de onboarding de novos funcionários, desde criação de contas até treinamentos e acompanhamento.',
    benefits: [
      'Onboarding consistente e organizado',
      'Reduz tempo da equipe de RH',
      'Melhora experiência do novo funcionário',
      'Controle de progresso automatizado'
    ],
    triggers: [
      {
        type: 'employee.hired',
        platform: 'system',
        config: {
          source: 'hr_system'
        },
        description: 'Disparado quando novo funcionário é contratado'
      }
    ],
    actions: [
      {
        type: 'create_accounts',
        platform: 'system',
        config: {
          services: ['email', 'slack', 'drive'],
          permissions: 'based_on_role'
        },
        description: 'Cria contas em todos os sistemas necessários'
      },
      {
        type: 'send_welcome_kit',
        platform: 'email',
        config: {
          template: 'welcome_package',
          attachments: ['manual_funcionario.pdf', 'politicas.pdf']
        },
        description: 'Envia kit de boas-vindas por email'
      },
      {
        type: 'create_onboarding_board',
        platform: 'trello',
        config: {
          template: 'onboarding_checklist',
          assign_to: ['{{employee.manager}}', '{{employee.email}}']
        },
        description: 'Cria board de onboarding no Trello'
      },
      {
        type: 'schedule_meetings',
        platform: 'google-calendar',
        config: {
          meetings: [
            {
              title: 'Welcome Meeting',
              when: 'first_day_9am',
              duration: 60,
              attendees: ['{{employee.manager}}']
            },
            {
              title: 'Team Introduction',
              when: 'first_day_2pm',
              duration: 30,
              attendees: ['{{employee.team}}']
            }
          ]
        },
        description: 'Agenda reuniões de integração'
      },
      {
        type: 'notify_team',
        platform: 'slack',
        config: {
          channel: '#general',
          message: '🎉 Pessoal, vamos dar as boas-vindas ao(à) {{employee.name}} que está se juntando ao time de {{employee.department}}!'
        },
        description: 'Notifica equipe sobre novo membro'
      }
    ]
  },

  {
    id: 'invoice-processing',
    name: 'Processamento Automático de Faturas',
    description: 'Automatiza criação, envio e acompanhamento de faturas',
    category: 'finance',
    difficulty: 'advanced',
    estimatedTime: '25 min',
    platforms: ['email', 'google-sheets', 'whatsapp', 'webhook'],
    tags: ['financeiro', 'faturas', 'cobrança', 'pagamento'],
    useCase: 'Automatiza todo o ciclo de faturamento, desde geração até cobrança, incluindo lembretes automáticos e controle de inadimplência.',
    benefits: [
      'Reduz erro humano no faturamento',
      'Acelera processo de cobrança',
      'Melhora fluxo de caixa',
      'Controle automático de inadimplência'
    ],
    triggers: [
      {
        type: 'service.completed',
        platform: 'system',
        config: {
          auto_invoice: true
        },
        description: 'Disparado quando serviço é marcado como concluído'
      }
    ],
    actions: [
      {
        type: 'generate_invoice',
        platform: 'system',
        config: {
          template: 'standard',
          items: '{{service.items}}',
          due_date: '+30_days'
        },
        description: 'Gera fatura automaticamente'
      },
      {
        type: 'send_invoice',
        platform: 'email',
        config: {
          to: '{{client.email}}',
          subject: 'Fatura #{{invoice.number}} - {{company.name}}',
          template: 'invoice_email'
        },
        description: 'Envia fatura por email'
      },
      {
        type: 'log_invoice',
        platform: 'google-sheets',
        config: {
          spreadsheet_id: '{{finance_sheet_id}}',
          sheet: 'Faturas',
          data: {
            'Número': '{{invoice.number}}',
            'Cliente': '{{client.name}}',
            'Valor': '{{invoice.total}}',
            'Vencimento': '{{invoice.due_date}}',
            'Status': 'Enviada'
          }
        },
        description: 'Registra fatura na planilha de controle'
      },
      {
        type: 'schedule_reminders',
        platform: 'system',
        config: {
          reminders: [
            { when: '-7_days', type: 'email' },
            { when: '-3_days', type: 'whatsapp' },
            { when: '+1_day', type: 'phone_call' }
          ]
        },
        description: 'Agenda lembretes de vencimento'
      }
    ]
  }
];

// Função para filtrar templates por categoria
export const getTemplatesByCategory = (category: string): WorkflowTemplate[] => {
  return workflowTemplates.filter(template => template.category === category);
};

// Função para filtrar templates por plataforma
export const getTemplatesByPlatform = (platform: string): WorkflowTemplate[] => {
  return workflowTemplates.filter(template => 
    template.platforms.includes(platform)
  );
};

// Função para filtrar templates por dificuldade
export const getTemplatesByDifficulty = (difficulty: string): WorkflowTemplate[] => {
  return workflowTemplates.filter(template => template.difficulty === difficulty);
};

// Função para buscar templates
export const searchTemplates = (query: string): WorkflowTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return workflowTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    template.useCase.toLowerCase().includes(lowercaseQuery)
  );
};

// Função para converter template em workflow
export const convertTemplateToWorkflow = (template: WorkflowTemplate, customValues?: Record<string, any>) => {
  const workflow = {
    id: `workflow_${Date.now()}`,
    name: template.name,
    description: template.description,
    platform: template.platforms[0], // Usa primeira plataforma como padrão
    isActive: false,
    trigger: {
      type: template.triggers[0].type,
      config: template.triggers[0].config
    },
    steps: template.actions.map((action, index) => ({
      id: `step_${index + 1}`,
      name: action.description,
      type: 'action',
      platform: action.platform,
      config: action.config,
      connections: {
        onSuccess: index < template.actions.length - 1 ? `step_${index + 2}` : undefined
      }
    })),
    errorHandling: {
      retryPolicy: 'fixed',
      maxRetries: 3,
      onError: 'stop'
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      tags: template.tags,
      template_id: template.id
    }
  };

  // Aplicar valores customizados se fornecidos
  if (customValues) {
    workflow.steps = workflow.steps.map(step => ({
      ...step,
      config: replaceVariables(step.config, customValues)
    }));
  }

  return workflow;
};

// Função auxiliar para substituir variáveis
const replaceVariables = (config: any, values: Record<string, any>): any => {
  const configStr = JSON.stringify(config);
  const replacedStr = configStr.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return values[variable] || match;
  });
  return JSON.parse(replacedStr);
};

export default workflowTemplates;
