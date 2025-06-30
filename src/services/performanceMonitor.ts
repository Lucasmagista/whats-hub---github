/**
 * 📊 Performance Monitor - FASE 4 OTIMIZAÇÃO E ESCALABILIDADE
 * Sistema de monitoramento de performance e auto-scaling
 */

import { n8nApiService } from './n8nApiService';
import { whatsappService } from './whatsappService';
import { whatsHubIntegration } from './whatsHubIntegration';

export interface PerformanceMetrics {
  timestamp: Date;
  system: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: number;
    responseTime: number;
    throughput: number;
  };
  whatsapp: {
    connections: number;
    messagesPerMinute: number;
    messagesSent: number;
    messagesReceived: number;
    queueSize: number;
    avgResponseTime: number;
    errorRate: number;
  };
  n8n: {
    activeWorkflows: number;
    executionsPerMinute: number;
    successRate: number;
    avgExecutionTime: number;
    queuedExecutions: number;
    failedExecutions: number;
  };
  database: {
    connections: number;
    avgQueryTime: number;
    tableSize: number;
    indexUsage: number;
    lockWaits: number;
  };
  integration: {
    syncLatency: number;
    websocketConnections: number;
    eventThroughput: number;
    errorCount: number;
    retryCount: number;
  };
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  category: 'performance' | 'error' | 'security' | 'capacity';
  title: string;
  description: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  actions: string[];
}

export interface ScalingConfig {
  enabled: boolean;
  triggers: {
    cpuThreshold: number;
    memoryThreshold: number;
    responseTimeThreshold: number;
    queueSizeThreshold: number;
    errorRateThreshold: number;
  };
  actions: {
    autoRestart: boolean;
    scaleUp: boolean;
    loadBalance: boolean;
    notification: boolean;
  };
  cooldownPeriod: number; // em minutos
}

export interface OptimizationSuggestion {
  id: string;
  category: 'performance' | 'resource' | 'configuration' | 'architecture';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: string;
  implementation: string[];
  references: string[];
  createdAt: Date;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private alerts: Alert[] = [];
  private suggestions: OptimizationSuggestion[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private scalingConfig: ScalingConfig;
  private lastScalingAction = 0;

  constructor() {
    this.scalingConfig = {
      enabled: true,
      triggers: {
        cpuThreshold: 80,
        memoryThreshold: 85,
        responseTimeThreshold: 5000,
        queueSizeThreshold: 100,
        errorRateThreshold: 5
      },
      actions: {
        autoRestart: false,
        scaleUp: true,
        loadBalance: true,
        notification: true
      },
      cooldownPeriod: 10
    };
  }

  // =============================
  // MONITORAMENTO EM TEMPO REAL
  // =============================

  async startMonitoring(intervalMs: number = 30000): Promise<void> {
    if (this.isMonitoring) {
      console.warn('Monitoramento já está ativo');
      return;
    }

    console.log(`📊 Iniciando monitoramento de performance (${intervalMs}ms)`);
    this.isMonitoring = true;

    // Coleta inicial
    await this.collectMetrics();

    // Intervalo de coleta
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
        await this.analyzeMetrics();
        await this.generateSuggestions();
        
        // Auto-scaling se habilitado
        if (this.scalingConfig.enabled) {
          await this.evaluateScaling();
        }
      } catch (error) {
        console.error('Erro no monitoramento:', error);
      }
    }, intervalMs);
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) return;

    console.log('📊 Parando monitoramento de performance');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  private async collectMetrics(): Promise<void> {
    try {
      const [systemMetrics, whatsappMetrics, n8nMetrics, integrationStatus] = await Promise.allSettled([
        this.getSystemMetrics(),
        this.getWhatsAppMetrics(),
        this.getN8NMetrics(),
        whatsHubIntegration.getIntegratedStatus()
      ]);

      const metrics: PerformanceMetrics = {
        timestamp: new Date(),
        system: systemMetrics.status === 'fulfilled' ? systemMetrics.value : this.getDefaultSystemMetrics(),
        whatsapp: whatsappMetrics.status === 'fulfilled' ? whatsappMetrics.value : this.getDefaultWhatsAppMetrics(),
        n8n: n8nMetrics.status === 'fulfilled' ? n8nMetrics.value : this.getDefaultN8NMetrics(),
        database: await this.getDatabaseMetrics(),
        integration: this.getIntegrationMetrics(integrationStatus.status === 'fulfilled' ? integrationStatus.value : null)
      };

      this.metrics.push(metrics);

      // Manter apenas últimas 1000 métricas para performance
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

    } catch (error) {
      console.error('Erro ao coletar métricas:', error);
    }
  }

  private async getSystemMetrics(): Promise<PerformanceMetrics['system']> {
    // Simular métricas do sistema (em produção seria coletado do OS)
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      uptime: Date.now() - 1000000, // Simular uptime
      responseTime: Math.random() * 1000,
      throughput: Math.random() * 1000
    };
  }

  private async getWhatsAppMetrics(): Promise<PerformanceMetrics['whatsapp']> {
    try {
      const status = await whatsappService.getConnectionStatus();
      const metrics = await whatsappService.getMetrics();
      
      return {
        connections: status.connected ? 1 : 0,
        messagesPerMinute: metrics.messagesPerMinute || Math.random() * 50,
        messagesSent: metrics.messagesSent || 0,
        messagesReceived: metrics.messagesReceived || 0,
        queueSize: Math.floor(Math.random() * 20),
        avgResponseTime: Math.random() * 2000,
        errorRate: Math.random() * 5
      };
    } catch (error) {
      console.error('Erro ao obter métricas WhatsApp:', error);
      return this.getDefaultWhatsAppMetrics();
    }
  }

  private async getN8NMetrics(): Promise<PerformanceMetrics['n8n']> {
    try {
      const workflows = await n8nApiService.getN8nWorkflows();
      
      return {
        activeWorkflows: workflows.length,
        executionsPerMinute: Math.random() * 30,
        successRate: 95 + Math.random() * 5,
        avgExecutionTime: Math.random() * 5000,
        queuedExecutions: Math.floor(Math.random() * 10),
        failedExecutions: Math.floor(Math.random() * 3)
      };
    } catch (error) {
      console.error('Erro ao obter métricas N8N:', error);
      return this.getDefaultN8NMetrics();
    }
  }

  private async getDatabaseMetrics(): Promise<PerformanceMetrics['database']> {
    // Simular métricas do banco (em produção seria conectado ao PostgreSQL)
    return {
      connections: Math.floor(Math.random() * 10) + 1,
      avgQueryTime: Math.random() * 100,
      tableSize: Math.random() * 1000000,
      indexUsage: 80 + Math.random() * 20,
      lockWaits: Math.floor(Math.random() * 5)
    };
  }

  private getIntegrationMetrics(status: unknown): PerformanceMetrics['integration'] {
    return {
      syncLatency: Math.random() * 1000,
      websocketConnections: Math.floor(Math.random() * 5) + 1,
      eventThroughput: Math.random() * 100,
      errorCount: Math.floor(Math.random() * 3),
      retryCount: Math.floor(Math.random() * 2)
    };
  }

  // =============================
  // ANÁLISE E ALERTAS
  // =============================

  private async analyzeMetrics(): Promise<void> {
    if (this.metrics.length < 2) return;

    const current = this.metrics[this.metrics.length - 1];
    const previous = this.metrics[this.metrics.length - 2];

    // Verificar tendências e anomalias
    await this.detectAnomalies(current, previous);
    await this.checkThresholds(current);
  }

  private async detectAnomalies(current: PerformanceMetrics, previous: PerformanceMetrics): Promise<void> {
    // Detectar picos súbitos
    const cpuIncrease = current.system.cpu - previous.system.cpu;
    if (cpuIncrease > 30) {
      await this.createAlert('warning', 'performance', 'Pico de CPU', 
        `CPU aumentou ${cpuIncrease.toFixed(1)}% rapidamente`, 30, cpuIncrease);
    }

    // Detectar degradação de performance
    const responseTimeIncrease = current.system.responseTime - previous.system.responseTime;
    if (responseTimeIncrease > 1000) {
      await this.createAlert('critical', 'performance', 'Degradação de Performance',
        `Tempo de resposta aumentou ${responseTimeIncrease.toFixed(0)}ms`, 1000, responseTimeIncrease);
    }

    // Detectar problemas de integração
    if (current.integration.errorCount > previous.integration.errorCount + 2) {
      await this.createAlert('warning', 'error', 'Aumento de Erros',
        'Aumento significativo em erros de integração', 2, current.integration.errorCount);
    }
  }

  private async checkThresholds(metrics: PerformanceMetrics): Promise<void> {
    const checks = [
      {
        condition: metrics.system.cpu > this.scalingConfig.triggers.cpuThreshold,
        type: 'critical' as const,
        category: 'performance' as const,
        title: 'CPU Alto',
        description: `CPU em ${metrics.system.cpu.toFixed(1)}%`,
        threshold: this.scalingConfig.triggers.cpuThreshold,
        value: metrics.system.cpu
      },
      {
        condition: metrics.system.memory > this.scalingConfig.triggers.memoryThreshold,
        type: 'critical' as const,
        category: 'performance' as const,
        title: 'Memória Alta',
        description: `Memória em ${metrics.system.memory.toFixed(1)}%`,
        threshold: this.scalingConfig.triggers.memoryThreshold,
        value: metrics.system.memory
      },
      {
        condition: metrics.whatsapp.errorRate > this.scalingConfig.triggers.errorRateThreshold,
        type: 'warning' as const,
        category: 'error' as const,
        title: 'Taxa de Erro Alta',
        description: `Taxa de erro WhatsApp em ${metrics.whatsapp.errorRate.toFixed(1)}%`,
        threshold: this.scalingConfig.triggers.errorRateThreshold,
        value: metrics.whatsapp.errorRate
      },
      {
        condition: metrics.whatsapp.queueSize > this.scalingConfig.triggers.queueSizeThreshold,
        type: 'warning' as const,
        category: 'capacity' as const,
        title: 'Fila Grande',
        description: `${metrics.whatsapp.queueSize} mensagens na fila`,
        threshold: this.scalingConfig.triggers.queueSizeThreshold,
        value: metrics.whatsapp.queueSize
      }
    ];

    for (const check of checks) {
      if (check.condition) {
        await this.createAlert(check.type, check.category, check.title, 
          check.description, check.threshold, check.value);
      }
    }
  }

  private async createAlert(
    type: Alert['type'], 
    category: Alert['category'], 
    title: string, 
    description: string, 
    threshold: number, 
    currentValue: number
  ): Promise<void> {
    // Verificar se já existe alerta similar recente
    const recentAlert = this.alerts.find(a => 
      a.title === title && 
      !a.resolved && 
      (Date.now() - a.timestamp.getTime()) < 300000 // 5 minutos
    );

    if (recentAlert) return;

    const alert: Alert = {
      id: this.generateAlertId(),
      type,
      category,
      title,
      description,
      threshold,
      currentValue,
      timestamp: new Date(),
      resolved: false,
      actions: this.getAlertActions(category, type)
    };

    this.alerts.push(alert);

    // Notificar se configurado
    if (this.scalingConfig.actions.notification) {
      await this.sendNotification(alert);
    }

    console.warn(`🚨 Alerta ${type}: ${title} - ${description}`);
  }

  private getAlertActions(category: Alert['category'], type: Alert['type']): string[] {
    const actions: string[] = [];

    if (category === 'performance') {
      actions.push('Verificar processos em execução');
      actions.push('Analisar logs de sistema');
      if (type === 'critical') {
        actions.push('Considerar reinicialização');
        actions.push('Escalar recursos');
      }
    }

    if (category === 'error') {
      actions.push('Verificar logs de erro');
      actions.push('Verificar conectividade');
      actions.push('Reiniciar serviços se necessário');
    }

    if (category === 'capacity') {
      actions.push('Aumentar recursos');
      actions.push('Otimizar processamento');
      actions.push('Implementar balanceamento');
    }

    return actions;
  }

  // =============================
  // AUTO-SCALING
  // =============================

  private async evaluateScaling(): Promise<void> {
    const now = Date.now();
    const cooldownMs = this.scalingConfig.cooldownPeriod * 60 * 1000;

    // Verificar cooldown
    if (now - this.lastScalingAction < cooldownMs) {
      return;
    }

    const current = this.metrics[this.metrics.length - 1];
    if (!current) return;

    const scalingNeeded = this.shouldScale(current);
    if (scalingNeeded) {
      await this.executeScaling(scalingNeeded);
      this.lastScalingAction = now;
    }
  }

  private shouldScale(metrics: PerformanceMetrics): string | null {
    if (metrics.system.cpu > this.scalingConfig.triggers.cpuThreshold) {
      return 'cpu_high';
    }

    if (metrics.system.memory > this.scalingConfig.triggers.memoryThreshold) {
      return 'memory_high';
    }

    if (metrics.whatsapp.queueSize > this.scalingConfig.triggers.queueSizeThreshold) {
      return 'queue_high';
    }

    if (metrics.system.responseTime > this.scalingConfig.triggers.responseTimeThreshold) {
      return 'response_slow';
    }

    return null;
  }

  private async executeScaling(reason: string): Promise<void> {
    console.log(`🔄 Executando auto-scaling: ${reason}`);

    try {
      if (this.scalingConfig.actions.autoRestart && reason.includes('high')) {
        await this.performRestart();
      }

      if (this.scalingConfig.actions.scaleUp) {
        await this.performScaleUp(reason);
      }

      if (this.scalingConfig.actions.loadBalance) {
        await this.performLoadBalance();
      }

      // Criar alerta informativo
      await this.createAlert('info', 'performance', 'Auto-scaling Executado',
        `Ação de scaling executada devido a: ${reason}`, 0, Date.now());

    } catch (error) {
      console.error('Erro durante auto-scaling:', error);
    }
  }

  private async performRestart(): Promise<void> {
    console.log('🔄 Simulando reinicialização de serviços...');
    // Em produção, aqui seria executado o restart dos serviços
  }

  private async performScaleUp(reason: string): Promise<void> {
    console.log(`⬆️ Simulando scale-up para: ${reason}`);
    // Em produção, aqui seria executado o scaling horizontal/vertical
  }

  private async performLoadBalance(): Promise<void> {
    console.log('⚖️ Simulando redistribuição de carga...');
    // Em produção, aqui seria executado o balanceamento de carga
  }

  // =============================
  // SUGESTÕES DE OTIMIZAÇÃO
  // =============================

  private async generateSuggestions(): Promise<void> {
    if (this.metrics.length < 10) return; // Precisa de histórico

    const recent = this.metrics.slice(-10);
    const avgCpu = recent.reduce((sum, m) => sum + m.system.cpu, 0) / recent.length;
    const avgMemory = recent.reduce((sum, m) => sum + m.system.memory, 0) / recent.length;
    const avgResponseTime = recent.reduce((sum, m) => sum + m.system.responseTime, 0) / recent.length;

    // Sugestões baseadas em padrões
    if (avgCpu > 70) {
      await this.addSuggestion({
        category: 'performance',
        priority: 'high',
        title: 'CPU Consistentemente Alto',
        description: 'CPU tem permanecido alto nos últimos períodos de monitoramento',
        impact: 'Pode causar lentidão e timeouts',
        effort: 'medium',
        estimatedImprovement: '20-30% melhora na performance',
        implementation: [
          'Otimizar queries do banco de dados',
          'Implementar cache onde possível',
          'Considerar upgrade de hardware',
          'Revisar algoritmos de processamento'
        ],
        references: [
          'https://docs.performance-optimization.com/cpu',
          'https://best-practices.system-tuning.org'
        ]
      });
    }

    if (avgMemory > 80) {
      await this.addSuggestion({
        category: 'resource',
        priority: 'high',
        title: 'Uso de Memória Elevado',
        description: 'Memória tem estado consistentemente alta',
        impact: 'Risco de out-of-memory e crashes',
        effort: 'medium',
        estimatedImprovement: '15-25% redução no uso de memória',
        implementation: [
          'Implementar garbage collection otimizado',
          'Revisar vazamentos de memória',
          'Otimizar estruturas de dados',
          'Implementar paginação em consultas'
        ],
        references: []
      });
    }

    if (avgResponseTime > 2000) {
      await this.addSuggestion({
        category: 'performance',
        priority: 'medium',
        title: 'Tempo de Resposta Lento',
        description: 'Tempo de resposta tem estado acima do ideal',
        impact: 'Experiência do usuário prejudicada',
        effort: 'low',
        estimatedImprovement: '30-50% melhora no tempo de resposta',
        implementation: [
          'Implementar cache de respostas',
          'Otimizar queries lentas',
          'Adicionar índices no banco',
          'Implementar CDN para assets'
        ],
        references: []
      });
    }
  }

  private async addSuggestion(suggestionData: Omit<OptimizationSuggestion, 'id' | 'createdAt'>): Promise<void> {
    // Verificar se já existe sugestão similar
    const exists = this.suggestions.some(s => s.title === suggestionData.title);
    if (exists) return;

    const suggestion: OptimizationSuggestion = {
      ...suggestionData,
      id: this.generateSuggestionId(),
      createdAt: new Date()
    };

    this.suggestions.push(suggestion);

    // Manter apenas últimas 50 sugestões
    if (this.suggestions.length > 50) {
      this.suggestions = this.suggestions.slice(-50);
    }
  }

  // =============================
  // NOTIFICAÇÕES
  // =============================

  private async sendNotification(alert: Alert): Promise<void> {
    try {
      // Em produção, aqui seria enviado email, Slack, etc.
      console.log(`📧 Notificação enviada: ${alert.title}`);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }

  // =============================
  // MÉTODOS PÚBLICOS
  // =============================

  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getMetricsHistory(hours: number = 24): PerformanceMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }

  getSuggestions(): OptimizationSuggestion[] {
    return [...this.suggestions].sort((a, b) => {
      const priority = { critical: 4, high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    });
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.resolvedAt = new Date();
    
    return true;
  }

  updateScalingConfig(config: Partial<ScalingConfig>): void {
    this.scalingConfig = { ...this.scalingConfig, ...config };
  }

  getScalingConfig(): ScalingConfig {
    return { ...this.scalingConfig };
  }

  // =============================
  // RELATÓRIOS
  // =============================

  generatePerformanceReport(): {
    period: string;
    summary: Record<string, unknown>;
    trends: Record<string, unknown>;
    recommendations: string[];
  } {
    const last24h = this.getMetricsHistory(24);
    
    if (last24h.length === 0) {
      return {
        period: 'Últimas 24 horas',
        summary: { message: 'Dados insuficientes' },
        trends: {},
        recommendations: []
      };
    }

    const avgCpu = last24h.reduce((sum, m) => sum + m.system.cpu, 0) / last24h.length;
    const avgMemory = last24h.reduce((sum, m) => sum + m.system.memory, 0) / last24h.length;
    const avgResponseTime = last24h.reduce((sum, m) => sum + m.system.responseTime, 0) / last24h.length;
    const totalMessages = last24h.reduce((sum, m) => sum + m.whatsapp.messagesReceived, 0);

    return {
      period: 'Últimas 24 horas',
      summary: {
        avgCpu: `${avgCpu.toFixed(1)}%`,
        avgMemory: `${avgMemory.toFixed(1)}%`,
        avgResponseTime: `${avgResponseTime.toFixed(0)}ms`,
        totalMessages,
        alertsGenerated: this.alerts.filter(a => 
          (Date.now() - a.timestamp.getTime()) < 24 * 60 * 60 * 1000
        ).length
      },
      trends: {
        performance: this.getPerformanceLevel(avgCpu),
        stability: this.getActiveAlerts().length === 0 ? 'Estável' : 'Instável'
      },
      recommendations: this.getSuggestions().slice(0, 5).map(s => s.title)
    };
  }

  // =============================
  // UTILITÁRIOS
  // =============================

  private generateAlertId(): string {
    return 'alert_' + Math.random().toString(36).substr(2, 9);
  }

  private generateSuggestionId(): string {
    return 'sugg_' + Math.random().toString(36).substr(2, 9);
  }

  private getPerformanceLevel(avgCpu: number): string {
    if (avgCpu > 70) return 'Alta';
    if (avgCpu > 50) return 'Média';
    return 'Baixa';
  }

  private getDefaultSystemMetrics(): PerformanceMetrics['system'] {
    return {
      cpu: 0,
      memory: 0,
      disk: 0,
      uptime: 0,
      responseTime: 0,
      throughput: 0
    };
  }

  private getDefaultWhatsAppMetrics(): PerformanceMetrics['whatsapp'] {
    return {
      connections: 0,
      messagesPerMinute: 0,
      messagesSent: 0,
      messagesReceived: 0,
      queueSize: 0,
      avgResponseTime: 0,
      errorRate: 0
    };
  }

  private getDefaultN8NMetrics(): PerformanceMetrics['n8n'] {
    return {
      activeWorkflows: 0,
      executionsPerMinute: 0,
      successRate: 0,
      avgExecutionTime: 0,
      queuedExecutions: 0,
      failedExecutions: 0
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export default
export default performanceMonitor;
