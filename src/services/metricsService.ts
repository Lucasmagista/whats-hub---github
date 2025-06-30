import { dataStore } from '@/store/dataStore';
import { Bot, Chat, TicketData, QueueItem } from '@/types/global';

interface RealTimeMetrics {
  totalChats: number;
  activeChats: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  totalQueueItems: number;
  pendingQueueItems: number;
  totalBots: number;
  activeBots: number;
  responseTime: number;
  satisfaction: number;
  uptime: number;
  messagesPerHour: number;
  averageResolutionTime: number;
}

interface MetricItem {
  label: string;
  value: string | number;
  change: number;
  target?: number;
  status: 'good' | 'warning' | 'critical';
  icon: string;
  description: string;
}

class MetricsService {
  private lastMetrics: RealTimeMetrics | null = null;
  private listeners: Array<(metrics: RealTimeMetrics) => void> = [];

  constructor() {
    // Atualizar métricas a cada 10 segundos
    setInterval(() => {
      this.updateMetrics();
    }, 10000);
  }  // Calcular métricas reais baseadas nos dados do dataStore
  calculateRealTimeMetrics(): RealTimeMetrics {
    const chats = dataStore.getChats();
    const tickets = dataStore.getTickets();
    const queueItems = dataStore.getQueueItems();
    const bots = dataStore.getBots();
    
    // Para obter todas as mensagens, vamos usar uma abordagem diferente
    const allMessages: any[] = [];
    chats.forEach(chat => {
      const chatMessages = dataStore.getMessages(chat.id);
      allMessages.push(...chatMessages);
    });

    // Calcular contadores básicos
    const totalChats = chats.length;
    const activeChats = chats.filter(chat => 
      chat.status === 'active' || 
      (chat.timestamp && new Date(chat.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000) // últimas 24h
    ).length;

    const totalTickets = tickets.length;
    const openTickets = tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'in-progress').length;
    const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved').length;

    const totalQueueItems = queueItems.length;
    const pendingQueueItems = queueItems.filter(item => item.status === 'waiting' || item.status === 'processing').length;

    const totalBots = bots.length;
    const activeBots = bots.filter(bot => bot.status === 'online').length;    // Calcular métricas de performance
    const responseTime = this.calculateAverageResponseTime(allMessages);
    const satisfaction = this.calculateSatisfactionScore(tickets);
    const uptime = this.calculateUptime(bots);
    const messagesPerHour = this.calculateMessagesPerHour(allMessages);
    const averageResolutionTime = this.calculateAverageResolutionTime(tickets);

    return {
      totalChats,
      activeChats,
      totalTickets,
      openTickets,
      resolvedTickets,
      totalQueueItems,
      pendingQueueItems,
      totalBots,
      activeBots,
      responseTime,
      satisfaction,
      uptime,
      messagesPerHour,
      averageResolutionTime
    };
  }

  // Calcular tempo médio de resposta (em segundos)
  private calculateAverageResponseTime(messages: any[]): number {
    if (messages.length < 2) return 0;

    const recentMessages = messages.filter(msg => 
      new Date(msg.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    if (recentMessages.length < 2) return 0;

    let totalResponseTime = 0;
    let responseCount = 0;

    for (let i = 1; i < recentMessages.length; i++) {
      const currentMsg = recentMessages[i];
      const previousMsg = recentMessages[i - 1];

      // Se a mensagem atual é uma resposta (status diferente da anterior)
      if (currentMsg.sender !== previousMsg.sender) {
        const responseTime = new Date(currentMsg.timestamp).getTime() - new Date(previousMsg.timestamp).getTime();
        totalResponseTime += responseTime / 1000; // converter para segundos
        responseCount++;
      }
    }

    return responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;
  }
  // Calcular score de satisfação baseado nos tickets resolvidos
  private calculateSatisfactionScore(tickets: TicketData[]): number {
    const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved');
    if (resolvedTickets.length === 0) return 85; // valor padrão bom se não há dados

    // Simular scores de satisfação baseados em tempo de resolução
    let totalScore = 0;
    resolvedTickets.forEach(ticket => {
      const createdAt = new Date(ticket.createdAt).getTime();
      const resolvedAt = new Date(ticket.lastUpdate).getTime(); // usar lastUpdate como proxy para resolução
      const resolutionTime = (resolvedAt - createdAt) / (1000 * 60 * 60); // em horas

      // Score baseado em tempo de resolução
      let score = 5; // máximo
      if (resolutionTime > 48) score = 2; // mais de 48h = score baixo
      else if (resolutionTime > 24) score = 3; // 24-48h = score médio
      else if (resolutionTime > 8) score = 4; // 8-24h = score bom
      // menos de 8h = score máximo (5)

      totalScore += score;
    });

    return Math.round((totalScore / resolvedTickets.length) * 20); // converter para percentual
  }

  // Calcular uptime baseado no status dos bots
  private calculateUptime(bots: Bot[]): number {
    if (bots.length === 0) return 100;

    const activeBots = bots.filter(bot => bot.status === 'online').length;
    return Math.round((activeBots / bots.length) * 100);
  }

  // Calcular mensagens por hora
  private calculateMessagesPerHour(messages: any[]): number {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentMessages = messages.filter(msg => 
      new Date(msg.timestamp).getTime() > oneHourAgo
    );

    return recentMessages.length;
  }
  // Calcular tempo médio de resolução de tickets (em horas)
  private calculateAverageResolutionTime(tickets: TicketData[]): number {
    const resolvedTickets = tickets.filter(ticket => 
      ticket.status === 'resolved'
    );

    if (resolvedTickets.length === 0) return 0;

    let totalTime = 0;
    resolvedTickets.forEach(ticket => {
      const created = new Date(ticket.createdAt).getTime();
      const resolved = new Date(ticket.lastUpdate).getTime(); // usar lastUpdate como proxy
      totalTime += (resolved - created) / (1000 * 60 * 60); // converter para horas
    });

    return Math.round(totalTime / resolvedTickets.length);
  }

  // Gerar métricas formatadas para componentes
  getFormattedMetrics(): MetricItem[] {
    const metrics = this.calculateRealTimeMetrics();
    const previousMetrics = this.lastMetrics;

    return [
      {
        label: 'Conversas Ativas',
        value: metrics.activeChats,
        change: this.calculateChange(metrics.activeChats, previousMetrics?.activeChats),
        target: Math.max(metrics.totalChats, 10),
        status: metrics.activeChats > metrics.totalChats * 0.7 ? 'good' : 
                metrics.activeChats > metrics.totalChats * 0.4 ? 'warning' : 'critical',
        icon: 'MessageSquare',
        description: `${metrics.activeChats} de ${metrics.totalChats} conversas ativas nas últimas 24h`
      },
      {
        label: 'Tickets Abertos',
        value: metrics.openTickets,
        change: this.calculateChange(metrics.openTickets, previousMetrics?.openTickets),
        target: Math.max(metrics.totalTickets, 5),
        status: metrics.openTickets < metrics.totalTickets * 0.3 ? 'good' : 
                metrics.openTickets < metrics.totalTickets * 0.6 ? 'warning' : 'critical',
        icon: 'AlertCircle',
        description: `${metrics.openTickets} tickets aguardando resolução`
      },
      {
        label: 'Fila de Mensagens',
        value: metrics.pendingQueueItems,
        change: this.calculateChange(metrics.pendingQueueItems, previousMetrics?.pendingQueueItems),
        target: Math.max(metrics.totalQueueItems, 10),
        status: metrics.pendingQueueItems < 5 ? 'good' : 
                metrics.pendingQueueItems < 15 ? 'warning' : 'critical',
        icon: 'Clock',
        description: `${metrics.pendingQueueItems} mensagens na fila de processamento`
      },
      {
        label: 'Bots Online',
        value: `${metrics.activeBots}/${metrics.totalBots}`,
        change: this.calculateChange(metrics.activeBots, previousMetrics?.activeBots),
        target: metrics.totalBots,
        status: metrics.activeBots === metrics.totalBots ? 'good' : 
                metrics.activeBots > metrics.totalBots * 0.7 ? 'warning' : 'critical',
        icon: 'Activity',
        description: `${metrics.activeBots} de ${metrics.totalBots} bots operacionais`
      },
      {
        label: 'Tempo de Resposta',
        value: `${metrics.responseTime}s`,
        change: this.calculateChange(metrics.responseTime, previousMetrics?.responseTime, true),
        target: 30, // meta de 30 segundos
        status: metrics.responseTime < 30 ? 'good' : 
                metrics.responseTime < 60 ? 'warning' : 'critical',
        icon: 'Zap',
        description: `Tempo médio de resposta: ${metrics.responseTime} segundos`
      },
      {
        label: 'Satisfação',
        value: `${metrics.satisfaction}%`,
        change: this.calculateChange(metrics.satisfaction, previousMetrics?.satisfaction),
        target: 90,
        status: metrics.satisfaction > 80 ? 'good' : 
                metrics.satisfaction > 60 ? 'warning' : 'critical',
        icon: 'Star',
        description: `Score de satisfação baseado em ${this.getResolvedTicketsCount()} tickets resolvidos`
      }
    ];
  }

  // Calcular mudança percentual
  private calculateChange(current: number, previous?: number, inverse = false): number {
    if (!previous || previous === 0) return 0;
    
    let change = ((current - previous) / previous) * 100;
    
    // Para métricas onde menor é melhor (como tempo de resposta), inverter o sinal
    if (inverse) change = -change;
    
    return Math.round(change);
  }

  // Obter contagem de tickets resolvidos para descrição
  private getResolvedTicketsCount(): number {
    return dataStore.getTickets().filter(ticket => ticket.status === 'resolved').length;
  }

  // Atualizar métricas e notificar listeners
  private updateMetrics(): void {
    const currentMetrics = this.calculateRealTimeMetrics();
    this.lastMetrics = currentMetrics;
    
    this.listeners.forEach(listener => listener(currentMetrics));
  }

  // Adicionar listener para mudanças de métricas
  addMetricsListener(callback: (metrics: RealTimeMetrics) => void): () => void {
    this.listeners.push(callback);
    
    // Retornar função para remover listener
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Obter contadores para badges de notificação
  getNotificationCounts() {
    const metrics = this.calculateRealTimeMetrics();
    
    return {
      conversations: metrics.activeChats,
      tickets: metrics.openTickets,
      queue: metrics.pendingQueueItems,
      alerts: this.calculateAlertCount(metrics)
    };
  }

  // Calcular alertas baseados em thresholds
  private calculateAlertCount(metrics: RealTimeMetrics): number {
    let alerts = 0;
    
    // Alertas por condições críticas
    if (metrics.activeBots < metrics.totalBots) alerts++; // Bot offline
    if (metrics.openTickets > 10) alerts++; // Muitos tickets abertos
    if (metrics.pendingQueueItems > 20) alerts++; // Fila muito cheia
    if (metrics.responseTime > 120) alerts++; // Tempo de resposta alto
    if (metrics.satisfaction < 60) alerts++; // Satisfação baixa
    if (metrics.uptime < 95) alerts++; // Uptime baixo
    
    return alerts;
  }

  // Método para forçar atualização das métricas
  forceUpdate(): void {
    this.updateMetrics();
  }
}

// Singleton instance
export const metricsService = new MetricsService();

// Export types
export type { RealTimeMetrics, MetricItem };
