import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Clock,
  Star,
  Zap
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StableTooltip, StableTooltipContent, StableTooltipProvider, StableTooltipTrigger } from '@/components/ui/stable-tooltip';
import { metricsService, type MetricItem } from '@/services/metricsService';

interface MetricTargetProgressProps {
  metric: MetricItem;
  progress: number;
}

// Mapa de ícones para evitar problemas de tipagem
const iconMap = {
  MessageSquare,
  AlertTriangle: AlertTriangle,
  Clock,
  Activity,
  Zap,
  Star
};

// Componente auxiliar para exibir meta e progresso
const MetricTargetProgress = ({ metric, progress }: MetricTargetProgressProps) => {
  let progressColor = '';
  let bgColor = '';
  switch (metric.status) {
    case 'good': progressColor = 'bg-green-400'; bgColor = 'bg-green-50/60'; break;
    case 'warning': progressColor = 'bg-amber-400'; bgColor = 'bg-amber-50/60'; break;
    case 'critical': progressColor = 'bg-red-400'; bgColor = 'bg-red-50/60'; break;
    default: progressColor = 'bg-muted'; bgColor = 'bg-muted/30';
  }
  
  return (
    <div className={`space-y-2 ${bgColor} rounded-xl p-3 transition-all duration-500 shadow-inner`}> 
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        <span>Meta: <span className="font-semibold text-primary">{metric.target}%</span></span>
        <span>{typeof metric.value === 'string' ? metric.value : `${metric.value}%`}</span>
      </div>
      <div className="w-full h-3 rounded-full bg-muted/30 relative overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-3 rounded-full transition-all duration-700 ${progressColor} progress-bar-${progress}`}
          data-width={progress}
        />
      </div>
    </div>
  );
};

const RealTimeMetrics = ({ noCard = false, noPadding = false, inModal = false }: { noCard?: boolean; noPadding?: boolean; inModal?: boolean }) => {
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Detectar se está em um modal automaticamente se não especificado
  const isInModal = inModal || (typeof window !== 'undefined' && document.querySelector('.fixed-modal, .modal-content-stable'));
  
  // Escolher os componentes de tooltip apropriados
  const TooltipProviderComponent = isInModal ? StableTooltipProvider : TooltipProvider;
  const TooltipComponent = isInModal ? StableTooltip : Tooltip;
  const TooltipTriggerComponent = isInModal ? StableTooltipTrigger : TooltipTrigger;
  const TooltipContentComponent = isInModal ? StableTooltipContent : TooltipContent;

  // Buscar métricas reais do serviço
  useEffect(() => {
    const loadMetrics = () => {
      try {
        const formattedMetrics = metricsService.getFormattedMetrics();
        setMetrics(formattedMetrics);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
        setIsLoading(false);
      }
    };

    // Carregar métricas imediatamente
    loadMetrics();

    // Configurar listener para atualizações automáticas
    const removeListener = metricsService.addMetricsListener(() => {
      loadMetrics();
    });

    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);

    return () => {
      removeListener();
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-amber-400';
      case 'critical': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Activity;
  };
  // Função utilitária para calcular o progresso
  const getProgressValue = (metric: MetricItem) => {
    if (!metric.target) return 0;
    let valueNum = 0;
    if (typeof metric.value === 'string') {
      valueNum = parseInt(metric.value.replace('%', '').replace('s', '').split('/')[0]);
      if (isNaN(valueNum)) return 0;
      return Math.min((valueNum / metric.target) * 100, 100);
    } else {
      return Math.min((metric.value / metric.target) * 100, 100);
    }
  };

  // Funções para status geral baseadas em métricas reais
  const getSystemStatus = () => {
    if (metrics.length === 0) return 'Carregando';
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    
    if (criticalCount > 0) return 'Crítico';
    if (warningCount > 2) return 'Atenção';
    if (warningCount > 0) return 'Estável';
    return 'Operacional';
  };

  const getSystemStatusBadge = () => {
    const status = getSystemStatus();
    switch (status) {
      case 'Operacional': return 'bg-green-500/20 text-green-400';
      case 'Estável': return 'bg-blue-500/20 text-blue-400';
      case 'Atenção': return 'bg-amber-500/20 text-amber-400';
      case 'Crítico': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getUptime = () => {
    const realMetrics = metricsService.calculateRealTimeMetrics();
    return realMetrics.uptime;
  };

  const getUptimeColor = () => {
    const uptime = getUptime();
    if (uptime >= 99) return 'text-green-400';
    if (uptime >= 95) return 'text-amber-400';
    return 'text-red-400';
  };

  const getAverageResponseTime = () => {
    const realMetrics = metricsService.calculateRealTimeMetrics();
    return realMetrics.responseTime;
  };

  const getResponseTimeColor = () => {
    const responseTime = getAverageResponseTime();
    if (responseTime <= 30) return 'text-green-400';
    if (responseTime <= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getAlertsCount = () => {
    const notificationCounts = metricsService.getNotificationCounts();
    return notificationCounts.alerts;
  };

  const getAlertsColor = () => {
    const alerts = getAlertsCount();
    if (alerts === 0) return 'text-green-400';
    if (alerts <= 3) return 'text-amber-400';
    return 'text-red-400';
  };
  if (noCard) {
    return (
      <div className={noPadding ? '' : 'p-4'}>
        {isLoading ? (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 mx-auto mb-4 animate-spin opacity-30" />
            <h3 className="text-lg font-medium mb-2">Carregando métricas...</h3>
            <p className="text-sm text-muted-foreground">Coletando dados em tempo real</p>
          </div>
        ) : metrics.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Nenhuma métrica disponível</h3>
            <p className="text-sm">As métricas aparecerão aqui quando houver dados para processar.</p>
          </div>        ) : (
          <TooltipProviderComponent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric, index) => {
                const StatusIcon = getStatusIcon(metric.status);
                const MetricIcon = getIconComponent(metric.icon);
                const isPositive = metric.change >= 0;
                return (
                  <div 
                    key={metric.label}
                    className="p-5 glass-effect bg-muted/70 dark:bg-zinc-900/80 rounded-2xl shadow-lg hover:shadow-2xl border border-border/30 transition-all duration-300 hover:border-primary/30 flex flex-col justify-between min-h-[170px]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl glass-card flex items-center justify-center ${getStatusColor(metric.status)} shadow-sm`}>
                          <MetricIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-base font-semibold text-primary mb-1">{metric.label}</div>
                          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{metric.value}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(metric.status)}`} />
                        <TooltipComponent>
                          <TooltipTriggerComponent asChild>
                            <Badge 
                              variant="outline" 
                              className={`text-xs h-7 px-2 flex items-center gap-1 font-semibold ${getChangeColor(metric.change)} cursor-help border-0 bg-zinc-100/60 dark:bg-zinc-800/60 shadow-sm`}
                              tabIndex={0}
                            >
                              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {isPositive ? '+' : ''}{metric.change}%
                            </Badge>
                          </TooltipTriggerComponent>
                          <TooltipContentComponent side="top">
                            <p>{metric.description}</p>
                            <p className="text-xs opacity-75">
                              {isPositive ? 'Aumento' : 'Redução'} em relação ao período anterior
                            </p>
                          </TooltipContentComponent>
                        </TooltipComponent>
                      </div>
                    </div>
                    {metric.target && (
                      <MetricTargetProgress metric={metric} progress={getProgressValue(metric)} />
                    )}
                  </div>
                );
              })}
            </div>
          </TooltipProviderComponent>
        )}
      </div>
    );
  }

  return (
    <Card className="h-full glass-card border-0">
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 glass-card rounded-lg flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <span className="gradient-text">Métricas em Tempo Real</span>
          <Badge className="bg-green-500/20 text-green-400 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Ao Vivo
          </Badge>
        </CardTitle>
      </CardHeader>      <CardContent className="p-4">
        {isLoading ? (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 mx-auto mb-4 animate-spin opacity-30" />
            <h3 className="text-lg font-medium mb-2">Carregando métricas...</h3>
            <p className="text-sm text-muted-foreground">Coletando dados em tempo real</p>
          </div>
        ) : metrics.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Nenhuma métrica disponível</h3>
            <p className="text-sm">As métricas aparecerão aqui quando houver dados para processar.</p>
          </div>        ) : (
          <>
            <TooltipProviderComponent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((metric, index) => {
                  const StatusIcon = getStatusIcon(metric.status);
                  const MetricIcon = getIconComponent(metric.icon);
                  const isPositive = metric.change >= 0;
                  return (
                    <div 
                      key={metric.label}
                      className="p-5 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-lg hover:shadow-2xl border border-border/30 transition-all duration-300 hover:border-primary/30 flex flex-col justify-between min-h-[170px]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl glass-card flex items-center justify-center ${getStatusColor(metric.status)} shadow-sm`}>
                            <MetricIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-base font-semibold text-primary mb-1">{metric.label}</div>
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{metric.value}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-5 w-5 ${getStatusColor(metric.status)}`} />
                          <TooltipComponent>
                            <TooltipTriggerComponent asChild>
                              <Badge 
                                variant="outline" 
                                className={`text-xs h-7 px-2 flex items-center gap-1 font-semibold ${getChangeColor(metric.change)} cursor-help border-0 bg-zinc-100/60 dark:bg-zinc-800/60 shadow-sm`}
                                tabIndex={0}
                              >
                                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {isPositive ? '+' : ''}{metric.change}%
                              </Badge>
                            </TooltipTriggerComponent>
                            <TooltipContentComponent side="top">
                              <p>{metric.description}</p>
                              <p className="text-xs opacity-75">
                                {isPositive ? 'Aumento' : 'Redução'} em relação ao período anterior
                              </p>
                            </TooltipContentComponent>
                          </TooltipComponent>
                        </div>
                      </div>
                      {metric.target && (
                        <MetricTargetProgress metric={metric} progress={getProgressValue(metric)} />
                      )}
                    </div>
                  );
                })}
              </div>
            </TooltipProviderComponent>

            {/* Status Geral baseado em métricas reais */}
            <div className="mt-6 p-4 glass-effect rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Status Geral do Sistema</h4>
                <Badge className={`text-xs ${getSystemStatusBadge()}`}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {getSystemStatus()}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className={`text-lg font-bold ${getUptimeColor()}`}>{getUptime()}%</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </div>
                <div>
                  <div className={`text-lg font-bold ${getResponseTimeColor()}`}>{getAverageResponseTime()}s</div>
                  <div className="text-xs text-muted-foreground">Resp. Médio</div>
                </div>
                <div>
                  <div className={`text-lg font-bold ${getAlertsColor()}`}>{getAlertsCount()}</div>
                  <div className="text-xs text-muted-foreground">Alertas</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeMetrics;
