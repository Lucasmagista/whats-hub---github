/**
 * 👥 Support Queue Integration - FASE 2 IMPLEMENTAÇÃO
 * Sistema de atendimento humano avançado integrado
 */

import { n8nApiService } from './n8nApiService';
import { whatsappService } from './whatsappService';
import { configurationManager } from './configurationManager';

export interface Attendant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  skills: string[];
  maxConcurrentChats: number;
  status: 'available' | 'busy' | 'away' | 'offline';
  currentChats: string[];
  totalChatsToday: number;
  avgResponseTime: number;
  satisfactionScore: number;
  loginTime?: Date;
  lastActivity?: Date;
}

export interface QueueConfig {
  maxWaitTime: number;
  priorityRules: Array<{
    condition: string;
    priority: 'urgent' | 'high' | 'normal';
  }>;
  autoAssignEnabled: boolean;
  businessHours: {
    enabled: boolean;
    schedule: Record<string, { start: string; end: string }>;
    timezone: string;
  };
  notifications: {
    newChat: boolean;
    queueThreshold: number;
    escalationTime: number;
  };
}

export interface WorkflowData {
  chatId: string;
  customerName?: string;
  [key: string]: unknown;
}

export interface ChatInfo {
  attendantId: string;
  startTime: Date;
  queueItem: unknown;
  messages: unknown[];
}

export interface AdvancedMetrics {
  queue: unknown;
  attendants: Array<{
    id: string;
    name: string;
    status: string;
    currentChats: number;
    totalChatsToday: number;
    avgResponseTime: number;
    satisfactionScore: number;
    efficiency: number;
  }>;
  metrics: {
    totalChatsToday: number;
    averageWaitTime: number;
    satisfactionScore: number;
    peakHours: Array<{ hour: number; count: number }>;
  };
  configuration: QueueConfig;
  businessHours: boolean;
  predictions: {
    expectedVolume: number;
    recommendedStaffing: number;
    busyPeriods: Array<{ hour: number; count: number }>;
  };
}

export interface SystemEventData {
  [key: string]: unknown;
}

class SupportQueueIntegration {
  private config: QueueConfig;
  private attendants = new Map<string, Attendant>();
  private activeChats = new Map<string, ChatInfo>();
  private queueMetrics = {
    totalChatsToday: 0,
    averageWaitTime: 0,
    satisfactionScore: 0,
    peakHours: [] as Array<{ hour: number; count: number }>
  };

  constructor() {
    this.config = {
      maxWaitTime: 1800000, // 30 minutos
      priorityRules: [
        { condition: 'urgent_keyword', priority: 'urgent' },
        { condition: 'vip_customer', priority: 'high' },
        { condition: 'default', priority: 'normal' }
      ],
      autoAssignEnabled: true,
      businessHours: {
        enabled: true,
        schedule: {
          monday: { start: '08:00', end: '18:00' },
          tuesday: { start: '08:00', end: '18:00' },
          wednesday: { start: '08:00', end: '18:00' },
          thursday: { start: '08:00', end: '18:00' },
          friday: { start: '08:00', end: '18:00' },
          saturday: { start: '09:00', end: '14:00' },
          sunday: { start: '10:00', end: '16:00' }
        },
        timezone: 'America/Sao_Paulo'
      },
      notifications: {
        newChat: true,
        queueThreshold: 10,
        escalationTime: 600000 // 10 minutos
      }
    };
  }

  // =============================
  // GESTÃO DE ATENDENTES
  // =============================

  async registerAttendant(attendantData: Omit<Attendant, 'id' | 'currentChats' | 'totalChatsToday' | 'avgResponseTime' | 'satisfactionScore'>): Promise<string> {
    const attendantId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const attendant: Attendant = {
      ...attendantData,
      id: attendantId,
      currentChats: [],
      totalChatsToday: 0,
      avgResponseTime: 0,
      satisfactionScore: 0,
      loginTime: new Date(),
      lastActivity: new Date()
    };

    this.attendants.set(attendantId, attendant);
    
    // Notificar sistema
    await this.notifySystemEvent('attendant_registered', {
      attendantId,
      name: attendant.name,
      skills: attendant.skills
    });

    return attendantId;
  }

  async updateAttendantStatus(attendantId: string, status: Attendant['status']): Promise<void> {
    const attendant = this.attendants.get(attendantId);
    if (!attendant) {
      throw new Error('Atendente não encontrado');
    }

    attendant.status = status;
    attendant.lastActivity = new Date();

    // Se ficar offline, realocar chats
    if (status === 'offline' && attendant.currentChats.length > 0) {
      await this.reallocateChats(attendantId);
    }

    await this.notifySystemEvent('attendant_status_changed', {
      attendantId,
      status,
      currentChats: attendant.currentChats.length
    });
  }

  // =============================
  // GESTÃO DE CHATS
  // =============================

  async startChat(queueItemId: string, attendantId?: string): Promise<void> {
    const queueData = await n8nApiService.getSupportQueue();
    const queueItem = queueData.queueItems.find((item: unknown) => (item as { id: string }).id === queueItemId);
    
    if (!queueItem) {
      throw new Error('Item da fila não encontrado');
    }

    // Auto-assign se não especificado
    if (!attendantId) {
      attendantId = await this.autoAssignAttendant();
    }

    const attendant = this.attendants.get(attendantId!);
    if (!attendant) {
      throw new Error('Atendente não encontrado');
    }

    // Verificar capacidade
    if (attendant.currentChats.length >= attendant.maxConcurrentChats) {
      throw new Error('Atendente com capacidade máxima atingida');
    }

    // Iniciar chat
    const chatId = queueItem.chatId;
    attendant.currentChats.push(chatId);
    attendant.status = 'busy';
    attendant.totalChatsToday++;

    this.activeChats.set(chatId, {
      attendantId,
      startTime: new Date(),
      queueItem,
      messages: []
    });

    // Notificar cliente e sistema
    await whatsappService.sendMessage(chatId, 
      `👨‍💼 *Conectado com ${attendant.name}*\n\nOlá! Sou ${attendant.name} e vou ajudá-lo hoje. Como posso ajudá-lo?`
    );

    await this.notifySystemEvent('chat_started', {
      chatId,
      attendantId,
      queueTime: queueItem ? (Date.now() - ((queueItem as { joinTime?: number }).joinTime || Date.now())) : 0
    });
  }

  async endChat(chatId: string, reason?: string): Promise<void> {
    const chat = this.activeChats.get(chatId);
    if (!chat) {
      throw new Error('Chat não encontrado');
    }

    const attendant = this.attendants.get(chat.attendantId);
    if (attendant) {
      // Remover da lista de chats ativos
      attendant.currentChats = attendant.currentChats.filter(id => id !== chatId);
      
      // Atualizar status se não tem mais chats
      if (attendant.currentChats.length === 0) {
        attendant.status = 'available';
      }
    }

    // Calcular métricas
    const duration = Date.now() - chat.startTime.getTime();
    
    // Solicitar avaliação
    await whatsappService.sendMessage(chatId,
      `✅ *Atendimento Finalizado*\n\nPor favor, avalie nosso atendimento:\n\n⭐ Digite uma nota de 1 a 5\n💬 Opcional: Deixe um comentário`
    );

    this.activeChats.delete(chatId);

    await this.notifySystemEvent('chat_ended', {
      chatId,
      attendantId: chat.attendantId,
      duration,
      reason
    });
  }

  async transferChat(chatId: string, fromAttendantId: string, toAttendantId: string, reason?: string): Promise<void> {
    const chat = this.activeChats.get(chatId);
    if (!chat) {
      throw new Error('Chat não encontrado');
    }

    const fromAttendant = this.attendants.get(fromAttendantId);
    const toAttendant = this.attendants.get(toAttendantId);

    if (!fromAttendant || !toAttendant) {
      throw new Error('Atendente não encontrado');
    }

    // Verificar capacidade do atendente destino
    if (toAttendant.currentChats.length >= toAttendant.maxConcurrentChats) {
      throw new Error('Atendente destino com capacidade máxima');
    }

    // Fazer transferência
    fromAttendant.currentChats = fromAttendant.currentChats.filter(id => id !== chatId);
    toAttendant.currentChats.push(chatId);
    toAttendant.status = 'busy';

    if (fromAttendant.currentChats.length === 0) {
      fromAttendant.status = 'available';
    }

    chat.attendantId = toAttendantId;

    // Notificar cliente
    const reasonText = reason ? `Motivo: ${reason}` : '';
    await whatsappService.sendMessage(chatId,
      `🔄 *Chat Transferido*\n\nSeu atendimento foi transferido para ${toAttendant.name}.\n${reasonText}`
    );

    await this.notifySystemEvent('chat_transferred', {
      chatId,
      fromAttendantId,
      toAttendantId,
      reason
    });
  }

  // =============================
  // AUTO-ASSIGN E INTELIGÊNCIA
  // =============================

  private async autoAssignAttendant(): Promise<string> {
    const availableAttendants = Array.from(this.attendants.values())
      .filter(att => 
        att.status === 'available' && 
        att.currentChats.length < att.maxConcurrentChats
      )
      .sort((a, b) => {
        // Priorizar por menor número de chats ativos
        if (a.currentChats.length !== b.currentChats.length) {
          return a.currentChats.length - b.currentChats.length;
        }
        // Depois por melhor satisfação
        return b.satisfactionScore - a.satisfactionScore;
      });

    if (availableAttendants.length === 0) {
      throw new Error('Nenhum atendente disponível');
    }

    return availableAttendants[0].id;
  }

  private async reallocateChats(offlineAttendantId: string): Promise<void> {
    const offlineAttendant = this.attendants.get(offlineAttendantId);
    if (!offlineAttendant) return;

    for (const chatId of offlineAttendant.currentChats) {
      try {
        const newAttendantId = await this.autoAssignAttendant();
        await this.transferChat(chatId, offlineAttendantId, newAttendantId, 'Atendente ficou offline');
      } catch (error) {
        // Se não conseguir realocar, retornar para fila
        console.error(`Erro ao realocar chat ${chatId}:`, error);
        await this.returnChatToQueue(chatId);
      }
    }
  }

  private async returnChatToQueue(chatId: string): Promise<void> {
    await whatsappService.sendMessage(chatId,
      `⏳ *Retornando à Fila*\n\nPedimos desculpas, você foi retornado à fila de atendimento devido a um problema técnico.\n\nUm novo atendente estará com você em breve.`
    );
  }

  // =============================
  // SKILLS-BASED ROUTING (FASE 2.1)
  // =============================

  async routeBySkills(chatId: string, requiredSkills: string[]): Promise<string> {
    const availableAttendants = Array.from(this.attendants.values())
      .filter(att => {
        // Verificar disponibilidade
        if (att.status !== 'available' || att.currentChats.length >= att.maxConcurrentChats) {
          return false;
        }
        
        // Verificar se tem as skills necessárias
        return requiredSkills.every(skill => att.skills.includes(skill));
      })
      .sort((a, b) => {
        // Priorizar por número de skills matching
        const aMatching = a.skills.filter(skill => requiredSkills.includes(skill)).length;
        const bMatching = b.skills.filter(skill => requiredSkills.includes(skill)).length;
        
        if (aMatching !== bMatching) {
          return bMatching - aMatching;
        }
        
        // Depois por carga de trabalho
        return a.currentChats.length - b.currentChats.length;
      });

    if (availableAttendants.length === 0) {
      // Fallback para auto-assign normal
      return await this.autoAssignAttendant();
    }

    return availableAttendants[0].id;
  }

  // =============================
  // CONFIGURAÇÕES DINÂMICAS (FASE 2.2)
  // =============================

  async updateConfiguration(newConfig: Partial<QueueConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    // Persistir configuração
    await configurationManager.updateQueueConfig(newConfig);
    
    await this.notifySystemEvent('config_updated', {
      updatedFields: Object.keys(newConfig),
      timestamp: new Date()
    });
  }

  getConfiguration(): QueueConfig {
    return { ...this.config };
  }

  // =============================
  // TEMPLATES E WORKFLOWS (FASE 2.3)
  // =============================

  async executeWorkflowTemplate(templateId: string, data: WorkflowData): Promise<void> {
    const workflows = {
      'welcome_vip': async (data: WorkflowData) => {
        await whatsappService.sendMessage(data.chatId,
          `🌟 *Cliente VIP*\n\nOlá ${data.customerName}!\n\nComo cliente VIP, você tem prioridade em nosso atendimento. Um especialista estará com você em instantes.`
        );
      },
      'escalation_manager': async (data: WorkflowData) => {
        await whatsappService.sendMessage(data.chatId,
          `⬆️ *Escalação para Gerência*\n\nSeu caso foi escalado para nossa gerência. Um gerente entrará em contato em até 15 minutos.`
        );
      },
      'survey_satisfaction': async (data: WorkflowData) => {
        await whatsappService.sendMessage(data.chatId,
          `📊 *Pesquisa de Satisfação*\n\nPor favor, avalie nosso atendimento:\n\n⭐ 1 - Muito Insatisfeito\n⭐ 2 - Insatisfeito\n⭐ 3 - Neutro\n⭐ 4 - Satisfeito\n⭐ 5 - Muito Satisfeito`
        );
      }
    };

    const workflow = workflows[templateId as keyof typeof workflows];
    if (workflow) {
      await workflow(data);
    }
  }

  // =============================
  // MÉTRICAS E ANALYTICS
  // =============================

  async getAdvancedMetrics(): Promise<AdvancedMetrics> {
    const attendantMetrics = Array.from(this.attendants.values()).map(att => ({
      id: att.id,
      name: att.name,
      status: att.status,
      currentChats: att.currentChats.length,
      totalChatsToday: att.totalChatsToday,
      avgResponseTime: att.avgResponseTime,
      satisfactionScore: att.satisfactionScore,
      efficiency: this.calculateEfficiency(att)
    }));

    return {
      queue: await n8nApiService.getSupportQueue(),
      attendants: attendantMetrics,
      metrics: this.queueMetrics,
      configuration: this.config,
      businessHours: this.isBusinessHours(),
      predictions: await this.generatePredictions()
    };
  }

  private calculateEfficiency(attendant: Attendant): number {
    if (attendant.totalChatsToday === 0) return 0;
    
    // Eficiência baseada em volume, velocidade e satisfação
    const volumeScore = Math.min(attendant.totalChatsToday / 20, 1); // Max 20 chats/dia
    const speedScore = Math.max(1 - (attendant.avgResponseTime / 300000), 0); // Max 5min response
    const satisfactionScore = attendant.satisfactionScore / 5;
    
    return (volumeScore * 0.3 + speedScore * 0.3 + satisfactionScore * 0.4) * 100;
  }

  private async generatePredictions(): Promise<{
    expectedVolume: number;
    recommendedStaffing: number;
    busyPeriods: Array<{ hour: number; count: number }>;
  }> {
    // Predições simples baseadas em dados históricos
    const currentHour = new Date().getHours();
    const peakHourData = this.queueMetrics.peakHours.find(h => h.hour === currentHour);
    
    return {
      expectedVolume: peakHourData?.count || 5,
      recommendedStaffing: Math.ceil((peakHourData?.count || 5) / 10),
      busyPeriods: this.queueMetrics.peakHours.filter(h => h.count > 10)
    };
  }

  private isBusinessHours(): boolean {
    if (!this.config.businessHours.enabled) return true;
    
    const now = new Date();
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5);
    
    const schedule = this.config.businessHours.schedule[dayName];
    if (!schedule) return false;
    
    return currentTime >= schedule.start && currentTime <= schedule.end;
  }

  // =============================
  // NOTIFICAÇÕES E EVENTOS
  // =============================

  private async notifySystemEvent(event: string, data: SystemEventData): Promise<void> {
    try {
      // Enviar para sistema de logs
      console.log(`[SupportQueue] ${event}:`, data);
      
      // Notificar dashboard via WebSocket se disponível
      if (typeof window !== 'undefined') {
        const windowWithSocket = window as unknown as { dashboardSocket?: { emit: (event: string, data: unknown) => void } };
        if (windowWithSocket.dashboardSocket) {
          windowWithSocket.dashboardSocket.emit('support_queue_event', {
            event,
            data,
            timestamp: new Date()
          });
        }
      }

      // Integrar com n8n workflows se configurado
      if (event === 'chat_started' || event === 'queue_threshold_exceeded') {
        // Note: executeWorkflow não existe ainda, implementar na próxima fase
        console.log('Workflow trigger:', event, data);
      }
    } catch (error) {
      console.error('Erro ao notificar evento:', error);
    }
  }

  // =============================
  // MÉTODOS PÚBLICOS
  // =============================

  getAttendants(): Attendant[] {
    return Array.from(this.attendants.values());
  }

  getActiveChats(): ChatInfo[] {
    return Array.from(this.activeChats.values());
  }

  getAttendant(attendantId: string): Attendant | undefined {
    return this.attendants.get(attendantId);
  }

  isAttendantAvailable(attendantId: string): boolean {
    const attendant = this.attendants.get(attendantId);
    return attendant?.status === 'available' && 
           attendant.currentChats.length < attendant.maxConcurrentChats;
  }
}

// Singleton instance
export const supportQueueIntegration = new SupportQueueIntegration();

// Export default
export default supportQueueIntegration;
