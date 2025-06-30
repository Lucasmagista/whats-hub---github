import { metricsService } from './metricsService';
import { dataStore } from '@/store/dataStore';

export interface RealNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  persistent: boolean;
  actionUrl?: string;
  actionText?: string;
}

class NotificationService {
  private notifications: RealNotification[] = [];
  private listeners: Array<(notifications: RealNotification[]) => void> = [];
  private soundEnabled = true;
  private lastChecks: Record<string, any> = {};

  constructor() {
    // Verificar notificações a cada 30 segundos
    setInterval(() => {
      this.checkForNewNotifications();
    }, 30000);

    // Verificação inicial
    setTimeout(() => {
      this.checkForNewNotifications();
    }, 2000);
  }

  // Verificar por novas notificações baseadas nos dados reais
  private checkForNewNotifications(): void {
    try {
      this.checkBotStatusChanges();
      this.checkQueueOverload();
      this.checkTicketThresholds();
      this.checkResponseTime();
      this.checkSystemHealth();
    } catch (error) {
      console.error('Erro ao verificar notificações:', error);
    }
  }

  // Verificar mudanças de status dos bots
  private checkBotStatusChanges(): void {
    const bots = dataStore.getBots();
    const currentBotStatus = bots.reduce((acc, bot) => {
      acc[bot.id] = bot.status;
      return acc;
    }, {} as Record<string, string>);

    if (this.lastChecks.botStatus) {
      for (const botId in currentBotStatus) {
        const oldStatus = this.lastChecks.botStatus[botId];
        const newStatus = currentBotStatus[botId];
        
        if (oldStatus && oldStatus !== newStatus) {
          const bot = bots.find(b => b.id === botId);
          if (bot) {
            this.addNotification({
              title: 'Status do Bot Alterado',
              message: `${bot.name} está agora ${this.getStatusText(newStatus)}`,
              type: newStatus === 'online' ? 'success' : newStatus === 'error' ? 'error' : 'warning',
              persistent: newStatus === 'error'
            });
          }
        }
      }
    }

    this.lastChecks.botStatus = currentBotStatus;
  }

  // Verificar sobrecarga na fila
  private checkQueueOverload(): void {
    const queueItems = dataStore.getQueueItems();
    const pendingItems = queueItems.filter(item => 
      item.status === 'waiting' || item.status === 'processing'
    ).length;

    if (pendingItems > 20 && (!this.lastChecks.queueWarning || Date.now() - this.lastChecks.queueWarning > 300000)) {
      this.addNotification({
        title: 'Fila Sobrecarregada',
        message: `${pendingItems} mensagens aguardando processamento`,
        type: 'warning',
        persistent: true,
        actionText: 'Ver Fila',
        actionUrl: '/queue'
      });
      this.lastChecks.queueWarning = Date.now();
    }
  }

  // Verificar limites de tickets
  private checkTicketThresholds(): void {
    const tickets = dataStore.getTickets();
    const openTickets = tickets.filter(ticket => 
      ticket.status === 'open' || ticket.status === 'in-progress'
    );
    
    const urgentTickets = openTickets.filter(ticket => ticket.priority === 'urgent').length;
    const highTickets = openTickets.filter(ticket => ticket.priority === 'high').length;

    if (urgentTickets > 0 && (!this.lastChecks.urgentTickets || this.lastChecks.urgentTickets < urgentTickets)) {
      this.addNotification({
        title: 'Tickets Urgentes',
        message: `${urgentTickets} ticket(s) urgente(s) aguardando atendimento`,
        type: 'error',
        persistent: true,
        actionText: 'Ver Tickets',
        actionUrl: '/tickets'
      });
    }

    if (openTickets.length > 15 && (!this.lastChecks.ticketOverload || Date.now() - this.lastChecks.ticketOverload > 600000)) {
      this.addNotification({
        title: 'Muitos Tickets Abertos',
        message: `${openTickets.length} tickets em aberto. Considere escalar a equipe.`,
        type: 'warning',
        persistent: false
      });
      this.lastChecks.ticketOverload = Date.now();
    }

    this.lastChecks.urgentTickets = urgentTickets;
  }

  // Verificar tempo de resposta
  private checkResponseTime(): void {
    const metrics = metricsService.calculateRealTimeMetrics();
    
    if (metrics.responseTime > 120 && (!this.lastChecks.slowResponse || Date.now() - this.lastChecks.slowResponse > 300000)) {
      this.addNotification({
        title: 'Tempo de Resposta Alto',
        message: `Tempo médio de resposta: ${metrics.responseTime}s (meta: <60s)`,
        type: 'warning',
        persistent: false
      });
      this.lastChecks.slowResponse = Date.now();
    }
  }

  // Verificar saúde geral do sistema
  private checkSystemHealth(): void {
    const metrics = metricsService.calculateRealTimeMetrics();
    
    if (metrics.uptime < 95 && (!this.lastChecks.lowUptime || Date.now() - this.lastChecks.lowUptime > 900000)) {
      this.addNotification({
        title: 'Uptime Baixo',
        message: `Sistema com ${metrics.uptime}% de uptime. Verifique os bots.`,
        type: 'error',
        persistent: true
      });
      this.lastChecks.lowUptime = Date.now();
    }

    if (metrics.satisfaction < 60 && (!this.lastChecks.lowSatisfaction || Date.now() - this.lastChecks.lowSatisfaction > 1800000)) {
      this.addNotification({
        title: 'Satisfação Baixa',
        message: `Score de satisfação: ${metrics.satisfaction}% (meta: >80%)`,
        type: 'warning',
        persistent: false
      });
      this.lastChecks.lowSatisfaction = Date.now();
    }
  }

  // Adicionar nova notificação
  addNotification(notification: Omit<RealNotification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: RealNotification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);

    // Limitar a 50 notificações
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.notifyListeners();

    // Tocar som se habilitado e for importante
    if (this.soundEnabled && (notification.type === 'error' || notification.persistent)) {
      this.playNotificationSound();
    }

    // Auto-remover notificações não persistentes após 10 segundos
    if (!notification.persistent) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, 10000);
    }
  }

  // Marcar notificação como lida
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Marcar todas como lidas
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  // Remover notificação
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Limpar todas as notificações
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Obter todas as notificações
  getNotifications(): RealNotification[] {
    return [...this.notifications];
  }

  // Obter notificações não lidas
  getUnreadNotifications(): RealNotification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Obter contagem de não lidas
  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  // Adicionar listener
  addListener(callback: (notifications: RealNotification[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notificar listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Gerar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Obter texto do status
  private getStatusText(status: string): string {
    switch (status) {
      case 'online': return 'online';
      case 'offline': return 'offline';
      case 'connecting': return 'conectando';
      case 'error': return 'com erro';
      default: return status;
    }
  }

  // Tocar som de notificação
  private playNotificationSound(): void {
    try {
      // Criar um beep simples usando AudioContext
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Falhar silenciosamente se não conseguir reproduzir som
    }
  }

  // Configurar som
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  // Verificar se som está habilitado
  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Forçar verificação de notificações
  forceCheck(): void {
    this.checkForNewNotifications();
  }
}

// Singleton instance
export const notificationService = new NotificationService();
