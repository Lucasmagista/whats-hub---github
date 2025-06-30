// 🔔 Serviço de Notificações do Dashboard via EmailJS
// Sistema completo de notificações por email para eventos do WhatsHub

import { emailService, NotificationEmail, SystemAlert } from './emailService';

// =============================================================================
// INTERFACES ESPECÍFICAS DO DASHBOARD
// =============================================================================

export interface DashboardEvent {
  type: 'bot_connected' | 'bot_disconnected' | 'new_message' | 'error_occurred' | 
        'maintenance_started' | 'maintenance_ended' | 'user_login' | 'security_alert' |
        'performance_warning' | 'storage_warning' | 'api_limit_reached';
  botId?: string;
  userId?: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  queueSize: number;
  timestamp: string;
}

export interface BotStatus {
  botId: string;
  name: string;
  status: 'online' | 'offline' | 'connecting' | 'error' | 'maintenance';
  lastSeen: string;
  messageCount: number;
  errorCount: number;
  uptime: number;
}

// =============================================================================
// CLASSE PRINCIPAL DE NOTIFICAÇÕES
// =============================================================================

export class DashboardNotificationService {
  private notificationHistory: DashboardEvent[] = [];
  private performanceHistory: PerformanceMetrics[] = [];
  private botStatusHistory: Map<string, BotStatus[]> = new Map();
  private alertThresholds = {
    cpuUsage: 80,
    memoryUsage: 85,
    responseTime: 5000,
    errorRate: 5,
    queueSize: 100
  };

  constructor() {
    this.loadNotificationHistory();
    this.setupPerformanceMonitoring();
  }

  // =============================================================================
  // NOTIFICAÇÕES DE EVENTOS DO BOT
  // =============================================================================

  /**
   * Notifica sobre conexão de bot
   */
  async notifyBotConnected(botId: string, botName: string): Promise<boolean> {
    const event: DashboardEvent = {
      type: 'bot_connected',
      botId,
      message: `Bot ${botName} (${botId}) conectado com sucesso`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      details: {
        botName,
        connectionTime: new Date().toISOString()
      }
    };

    return this.sendEventNotification(event);
  }

  /**
   * Notifica sobre desconexão de bot
   */
  async notifyBotDisconnected(botId: string, botName: string, reason?: string): Promise<boolean> {
    const event: DashboardEvent = {
      type: 'bot_disconnected',
      botId,
      message: `Bot ${botName} (${botId}) foi desconectado${reason ? `: ${reason}` : ''}`,
      timestamp: new Date().toISOString(),
      severity: reason ? 'warning' : 'info',
      details: {
        botName,
        reason,
        disconnectionTime: new Date().toISOString()
      }
    };

    return this.sendEventNotification(event);
  }

  /**
   * Notifica sobre nova mensagem recebida
   */
  async notifyNewMessage(botId: string, from: string, messagePreview: string): Promise<boolean> {
    const event: DashboardEvent = {
      type: 'new_message',
      botId,
      message: `Nova mensagem recebida de ${from}: ${messagePreview.substring(0, 50)}...`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      details: {
        from,
        messagePreview,
        receivedAt: new Date().toISOString()
      }
    };

    return this.sendEventNotification(event);
  }

  /**
   * Notifica sobre erro crítico
   */
  async notifyError(component: string, error: Error, botId?: string): Promise<boolean> {
    const event: DashboardEvent = {
      type: 'error_occurred',
      botId,
      message: `Erro em ${component}: ${error.message}`,
      timestamp: new Date().toISOString(),
      severity: 'error',
      details: {
        component,
        errorMessage: error.message,
        errorStack: error.stack,
        occurredAt: new Date().toISOString()
      }
    };

    return this.sendEventNotification(event);
  }

  // =============================================================================
  // NOTIFICAÇÕES DE SISTEMA E MANUTENÇÃO
  // =============================================================================

  /**
   * Notifica início de manutenção
   */
  async notifyMaintenanceStarted(duration: string, reason: string): Promise<boolean> {
    const event: DashboardEvent = {
      type: 'maintenance_started',
      message: `Manutenção iniciada: ${reason}. Duração estimada: ${duration}`,
      timestamp: new Date().toISOString(),
      severity: 'warning',
      details: {
        duration,
        reason,
        startedAt: new Date().toISOString()
      }
    };

    return this.sendEventNotification(event);
  }

  /**
   * Notifica fim de manutenção
   */
  async notifyMaintenanceEnded(actualDuration: string): Promise<boolean> {
    const event: DashboardEvent = {
      type: 'maintenance_ended',
      message: `Manutenção concluída. Duração: ${actualDuration}. Sistema operacional novamente.`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      details: {
        actualDuration,
        endedAt: new Date().toISOString()
      }
    };

    return this.sendEventNotification(event);
  }

  /**
   * Notifica login de usuário
   */
  async notifyUserLogin(userId: string, userAgent: string, ipAddress?: string): Promise<boolean> {
    const event: DashboardEvent = {
      type: 'user_login',
      userId,
      message: `Usuário ${userId} fez login no sistema`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      details: {
        userAgent,
        ipAddress,
        loginTime: new Date().toISOString()
      }
    };

    return this.sendEventNotification(event);
  }

  /**
   * Notifica alerta de segurança
   */
  async notifySecurityAlert(alertType: string, description: string, severity: 'warning' | 'critical' = 'warning'): Promise<boolean> {
    const event: DashboardEvent = {
      type: 'security_alert',
      message: `Alerta de segurança: ${alertType} - ${description}`,
      timestamp: new Date().toISOString(),
      severity,
      details: {
        alertType,
        description,
        detectedAt: new Date().toISOString()
      }
    };

    return this.sendEventNotification(event);
  }

  // =============================================================================
  // MONITORAMENTO DE PERFORMANCE
  // =============================================================================

  /**
   * Registra métricas de performance e envia alertas se necessário
   */
  async recordPerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
    this.performanceHistory.push(metrics);
    
    // Manter apenas os últimos 100 registros
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }

    // Verificar alertas
    await this.checkPerformanceAlerts(metrics);
    
    this.savePerformanceHistory();
  }

  /**
   * Verifica se métricas estão fora dos limites e envia alertas
   */
  private async checkPerformanceAlerts(metrics: PerformanceMetrics): Promise<void> {
    const alerts: string[] = [];

    if (metrics.cpuUsage > this.alertThresholds.cpuUsage) {
      alerts.push(`CPU usage: ${metrics.cpuUsage}% (limite: ${this.alertThresholds.cpuUsage}%)`);
    }

    if (metrics.memoryUsage > this.alertThresholds.memoryUsage) {
      alerts.push(`Memory usage: ${metrics.memoryUsage}% (limite: ${this.alertThresholds.memoryUsage}%)`);
    }

    if (metrics.responseTime > this.alertThresholds.responseTime) {
      alerts.push(`Response time: ${metrics.responseTime}ms (limite: ${this.alertThresholds.responseTime}ms)`);
    }

    if (metrics.errorRate > this.alertThresholds.errorRate) {
      alerts.push(`Error rate: ${metrics.errorRate}% (limite: ${this.alertThresholds.errorRate}%)`);
    }

    if (metrics.queueSize > this.alertThresholds.queueSize) {
      alerts.push(`Queue size: ${metrics.queueSize} (limite: ${this.alertThresholds.queueSize})`);
    }

    if (alerts.length > 0) {
      await this.notifyPerformanceWarning(alerts, metrics);
    }
  }

  /**
   * Envia alerta de performance
   */
  private async notifyPerformanceWarning(alerts: string[], metrics: PerformanceMetrics): Promise<boolean> {
    const event: DashboardEvent = {
      type: 'performance_warning',
      message: `Alertas de performance detectados: ${alerts.join(', ')}`,
      timestamp: new Date().toISOString(),
      severity: 'warning',
      details: {
        alerts,
        metrics,
        detectedAt: new Date().toISOString()
      }
    };

    return this.sendEventNotification(event);
  }

  // =============================================================================
  // GERENCIAMENTO DE STATUS DOS BOTS
  // =============================================================================

  /**
   * Atualiza status de um bot
   */
  updateBotStatus(botStatus: BotStatus): void {
    const botHistory = this.botStatusHistory.get(botStatus.botId) || [];
    botHistory.push(botStatus);

    // Manter apenas os últimos 50 registros por bot
    if (botHistory.length > 50) {
      botHistory.shift();
    }

    this.botStatusHistory.set(botStatus.botId, botHistory);
    this.saveBotStatusHistory();
  }

  /**
   * Obtém status atual de todos os bots
   */
  getAllBotStatuses(): Map<string, BotStatus> {
    const currentStatuses = new Map<string, BotStatus>();
    
    for (const [botId, history] of this.botStatusHistory) {
      if (history.length > 0) {
        currentStatuses.set(botId, history[history.length - 1]);
      }
    }

    return currentStatuses;
  }

  /**
   * Obtém histórico de um bot específico
   */
  getBotHistory(botId: string): BotStatus[] {
    return this.botStatusHistory.get(botId) || [];
  }

  // =============================================================================
  // RELATÓRIOS E ESTATÍSTICAS
  // =============================================================================

  /**
   * Gera relatório diário de atividades
   */
  async sendDailyReport(): Promise<boolean> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayEvents = this.notificationHistory.filter(event => 
      new Date(event.timestamp) > yesterday
    );

    const stats = {
      totalEvents: todayEvents.length,
      botConnections: todayEvents.filter(e => e.type === 'bot_connected').length,
      botDisconnections: todayEvents.filter(e => e.type === 'bot_disconnected').length,
      newMessages: todayEvents.filter(e => e.type === 'new_message').length,
      errors: todayEvents.filter(e => e.type === 'error_occurred').length,
      userLogins: todayEvents.filter(e => e.type === 'user_login').length,
      securityAlerts: todayEvents.filter(e => e.type === 'security_alert').length
    };

    const notification: NotificationEmail = {
      type: 'system_alert',
      priority: 'medium',
      title: `📊 Relatório Diário - ${today.toLocaleDateString('pt-BR')}`,
      message: `Relatório de atividades do WhatsHub Dashboard`,
      details: {
        date: today.toLocaleDateString('pt-BR'),
        stats,
        recentEvents: todayEvents.slice(-10) // Últimos 10 eventos
      }
    };

    try {
      const result = await emailService.sendNotificationEmail(notification);
      return result.success;
    } catch (error) {
      console.error('Erro ao enviar relatório diário:', error);
      return false;
    }
  }

  /**
   * Gera relatório semanal de performance
   */
  async sendWeeklyPerformanceReport(): Promise<boolean> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weekMetrics = this.performanceHistory.filter(metric => 
      new Date(metric.timestamp) > oneWeekAgo
    );

    if (weekMetrics.length === 0) {
      return false;
    }

    const avgMetrics = {
      cpuUsage: weekMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / weekMetrics.length,
      memoryUsage: weekMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / weekMetrics.length,
      responseTime: weekMetrics.reduce((sum, m) => sum + m.responseTime, 0) / weekMetrics.length,
      errorRate: weekMetrics.reduce((sum, m) => sum + m.errorRate, 0) / weekMetrics.length,
      activeConnections: weekMetrics.reduce((sum, m) => sum + m.activeConnections, 0) / weekMetrics.length
    };

    const maxMetrics = {
      cpuUsage: Math.max(...weekMetrics.map(m => m.cpuUsage)),
      memoryUsage: Math.max(...weekMetrics.map(m => m.memoryUsage)),
      responseTime: Math.max(...weekMetrics.map(m => m.responseTime)),
      errorRate: Math.max(...weekMetrics.map(m => m.errorRate))
    };

    const notification: NotificationEmail = {
      type: 'system_alert',
      priority: 'low',
      title: `📈 Relatório Semanal de Performance`,
      message: `Análise de performance da última semana`,
      details: {
        period: `${oneWeekAgo.toLocaleDateString('pt-BR')} - ${new Date().toLocaleDateString('pt-BR')}`,
        averageMetrics: avgMetrics,
        maximumMetrics: maxMetrics,
        totalMeasurements: weekMetrics.length
      }
    };

    try {
      const result = await emailService.sendNotificationEmail(notification);
      return result.success;
    } catch (error) {
      console.error('Erro ao enviar relatório semanal:', error);
      return false;
    }
  }

  // =============================================================================
  // CONFIGURAÇÃO E UTILITÁRIOS
  // =============================================================================

  /**
   * Configura limites de alerta de performance
   */
  setAlertThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    console.log('Limites de alerta atualizados:', this.alertThresholds);
  }

  /**
   * Obtém estatísticas gerais
   */
  getNotificationStats(): {
    totalNotifications: number;
    notificationsByType: Record<string, number>;
    notificationsBySeverity: Record<string, number>;
    recentNotifications: DashboardEvent[];
  } {
    const totalNotifications = this.notificationHistory.length;
    
    const notificationsByType = this.notificationHistory.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const notificationsBySeverity = this.notificationHistory.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentNotifications = this.notificationHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    return {
      totalNotifications,
      notificationsByType,
      notificationsBySeverity,
      recentNotifications
    };
  }

  /**
   * Limpa histórico antigo
   */
  cleanOldHistory(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Limpar notificações antigas
    const oldNotificationCount = this.notificationHistory.length;
    this.notificationHistory = this.notificationHistory.filter(
      event => new Date(event.timestamp) > thirtyDaysAgo
    );

    // Limpar métricas antigas
    const oldMetricsCount = this.performanceHistory.length;
    this.performanceHistory = this.performanceHistory.filter(
      metric => new Date(metric.timestamp) > thirtyDaysAgo
    );

    // Limpar histórico de bots antigo
    for (const [botId, history] of this.botStatusHistory) {
      const filteredHistory = history.filter(
        status => new Date(status.lastSeen) > thirtyDaysAgo
      );
      
      if (filteredHistory.length === 0) {
        this.botStatusHistory.delete(botId);
      } else {
        this.botStatusHistory.set(botId, filteredHistory);
      }
    }

    this.saveNotificationHistory();
    this.savePerformanceHistory();
    this.saveBotStatusHistory();

    console.log(`🧹 Limpeza realizada:`, {
      notificationsRemoved: oldNotificationCount - this.notificationHistory.length,
      metricsRemoved: oldMetricsCount - this.performanceHistory.length
    });
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  private async sendEventNotification(event: DashboardEvent): Promise<boolean> {
    try {
      this.notificationHistory.push(event);
      this.saveNotificationHistory();

      // Só enviar por email se for warning ou error
      if (event.severity === 'warning' || event.severity === 'error' || event.severity === 'critical') {
        const notification: NotificationEmail = {
          type: 'system_alert',
          priority: event.severity === 'critical' ? 'critical' : 
                   event.severity === 'error' ? 'high' : 'medium',
          title: `🔔 ${event.type.replace('_', ' ').toUpperCase()}: ${event.message}`,
          message: event.message,
          details: event.details
        };

        const result = await emailService.sendNotificationEmail(notification);
        return result.success;
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação de evento:', error);
      return false;
    }
  }

  private setupPerformanceMonitoring(): void {
    // Simular coleta de métricas de performance a cada 5 minutos
    setInterval(() => {
      const metrics: PerformanceMetrics = {
        cpuUsage: Math.random() * 100,
        memoryUsage: 50 + Math.random() * 40,
        responseTime: 100 + Math.random() * 1000,
        errorRate: Math.random() * 10,
        activeConnections: Math.floor(Math.random() * 200),
        queueSize: Math.floor(Math.random() * 50),
        timestamp: new Date().toISOString()
      };

      this.recordPerformanceMetrics(metrics);
    }, 5 * 60 * 1000); // 5 minutos
  }

  private loadNotificationHistory(): void {
    try {
      const stored = localStorage.getItem('whathub_notification_history');
      if (stored) {
        this.notificationHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Erro ao carregar histórico de notificações:', error);
    }
  }

  private saveNotificationHistory(): void {
    try {
      localStorage.setItem('whathub_notification_history', JSON.stringify(this.notificationHistory));
    } catch (error) {
      console.warn('Erro ao salvar histórico de notificações:', error);
    }
  }

  private savePerformanceHistory(): void {
    try {
      localStorage.setItem('whathub_performance_history', JSON.stringify(this.performanceHistory));
    } catch (error) {
      console.warn('Erro ao salvar histórico de performance:', error);
    }
  }

  private saveBotStatusHistory(): void {
    try {
      const historyArray = Array.from(this.botStatusHistory.entries());
      localStorage.setItem('whathub_bot_status_history', JSON.stringify(historyArray));
    } catch (error) {
      console.warn('Erro ao salvar histórico de status dos bots:', error);
    }
  }
}

// =============================================================================
// INSTÂNCIA GLOBAL E CONFIGURAÇÃO DE TAREFAS AUTOMÁTICAS
// =============================================================================

export const dashboardNotificationService = new DashboardNotificationService();

// Configurar relatórios automáticos se o email estiver configurado
if (typeof window !== 'undefined' && typeof emailService.isConfigured === 'function' && emailService.isConfigured()) {
  // Relatório diário às 9:00
  const scheduleDaily = () => {
    const now = new Date();
    const tomorrow9AM = new Date(now);
    tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
    tomorrow9AM.setHours(9, 0, 0, 0);
    
    const msUntil9AM = tomorrow9AM.getTime() - now.getTime();
    
    setTimeout(() => {
      dashboardNotificationService.sendDailyReport();
      // Reagendar para o próximo dia
      setInterval(() => {
        dashboardNotificationService.sendDailyReport();
      }, 24 * 60 * 60 * 1000);
    }, msUntil9AM);
  };

  // Relatório semanal aos domingos às 10:00
  const scheduleWeekly = () => {
    const now = new Date();
    const nextSunday10AM = new Date(now);
    const daysUntilSunday = (7 - now.getDay()) % 7;
    nextSunday10AM.setDate(nextSunday10AM.getDate() + daysUntilSunday);
    nextSunday10AM.setHours(10, 0, 0, 0);
    
    const msUntilSunday = nextSunday10AM.getTime() - now.getTime();
    
    setTimeout(() => {
      dashboardNotificationService.sendWeeklyPerformanceReport();
      // Reagendar para a próxima semana
      setInterval(() => {
        dashboardNotificationService.sendWeeklyPerformanceReport();
      }, 7 * 24 * 60 * 60 * 1000);
    }, msUntilSunday);
  };

  // Iniciar agendamentos
  scheduleDaily();
  scheduleWeekly();

  // Limpeza automática de dados antigos (mensalmente)
  setInterval(() => {
    dashboardNotificationService.cleanOldHistory();
  }, 30 * 24 * 60 * 60 * 1000); // 30 dias
}

export default dashboardNotificationService;
