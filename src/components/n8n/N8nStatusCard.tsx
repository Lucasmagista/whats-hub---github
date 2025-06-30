/**
 * 📊 N8nStatusCard - FASE 1 INTEGRAÇÃO
 * Componente para exibir status integrado do sistema n8n + WhatsApp
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  Wifi, 
  WifiOff,
  Database,
  Server,
  Bot,
  RefreshCw,
  TrendingUp,
  Clock
} from 'lucide-react';
import { SystemStatus } from '@/services/n8nApiService';

interface N8nStatusCardProps {
  systemStatus: SystemStatus | null;
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const N8nStatusCard: React.FC<N8nStatusCardProps> = ({
  systemStatus,
  loading = false,
  onRefresh,
  className = ''
}) => {
  // Calcular saúde geral do sistema
  const calculateOverallHealth = (): 'healthy' | 'warning' | 'critical' => {
    if (!systemStatus) return 'critical';
    
    const criticalIssues = [
      !systemStatus.whatsapp.connected,
      !systemStatus.database.connected,
      systemStatus.server.status === 'error'
    ].filter(Boolean).length;

    const warningIssues = [
      systemStatus.server.memoryUsage > 80,
      systemStatus.server.cpuUsage > 80,
      systemStatus.monitoring.alerts.length > 5
    ].filter(Boolean).length;

    if (criticalIssues > 0) return 'critical';
    if (warningIssues > 0) return 'warning';
    return 'healthy';
  };

  const overallHealth = calculateOverallHealth();

  // Função para renderizar status com ícone
  const renderStatusBadge = (connected: boolean, label: string) => {
    return (
      <Badge variant={connected ? 'default' : 'secondary'} className={`flex items-center gap-1 ${
        connected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        {connected ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <XCircle className="w-3 h-3" />
        )}
        {label}
      </Badge>
    );
  };

  // Função para renderizar métricas de performance
  const renderMetric = (value: number, label: string, unit: string, threshold = 80) => {
    const isWarning = value > threshold;
    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isWarning ? 'text-yellow-500' : 'text-foreground'}`}>
            {value}{unit}
          </span>
          {isWarning && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 animate-pulse" />
            Status do Sistema
            <RefreshCw className="w-4 h-4 ml-auto animate-spin" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!systemStatus) {
    return (
      <Card className={`border-destructive ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <XCircle className="w-5 h-5" />
            Sistema Desconectado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Não foi possível conectar ao sistema n8n. Verifique se o servidor está executando.
          </p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} ${
      overallHealth === 'critical' ? 'border-destructive' :
      overallHealth === 'warning' ? 'border-yellow-500' :
      'border-green-500'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            overallHealth === 'healthy' ? 'bg-green-500' :
            overallHealth === 'warning' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}>
            {overallHealth === 'healthy' ? (
              <CheckCircle className="w-3 h-3 text-white" />
            ) : overallHealth === 'warning' ? (
              <AlertTriangle className="w-3 h-3 text-white" />
            ) : (
              <XCircle className="w-3 h-3 text-white" />
            )}
          </div>
          Status Integrado
          {onRefresh && (
            <Button onClick={onRefresh} variant="ghost" size="sm" className="ml-auto">
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status dos Serviços */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Server className="w-4 h-4" />
            Serviços
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {renderStatusBadge(systemStatus.whatsapp.connected, 'WhatsApp')}
            {renderStatusBadge(systemStatus.database.connected, 'Database')}
            {renderStatusBadge(systemStatus.n8n.connected, 'n8n')}
            {renderStatusBadge(systemStatus.server.status === 'online', 'Servidor')}
          </div>
        </div>

        {/* Métricas de Performance */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </h4>
          <div className="space-y-1">
            {renderMetric(systemStatus.server.memoryUsage, 'Memória', '%')}
            {renderMetric(systemStatus.server.cpuUsage, 'CPU', '%')}
            {renderMetric(Math.floor(systemStatus.server.uptime / 1000 / 60), 'Uptime', ' min', 999999)}
          </div>
        </div>

        {/* WhatsApp Status Detalhado */}
        {systemStatus.whatsapp.connected && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Bot className="w-4 h-4" />
              WhatsApp
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Recebidas</span>
                <span className="font-medium">{systemStatus.whatsapp.messagesReceived}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Enviadas</span>
                <span className="font-medium">{systemStatus.whatsapp.messagesSent}</span>
              </div>
            </div>
          </div>
        )}

        {/* n8n Status */}
        {systemStatus.n8n.connected && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              n8n
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Workflows</span>
                <span className="font-medium">{systemStatus.n8n.workflows}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Execuções</span>
                <span className="font-medium">{systemStatus.n8n.executions}</span>
              </div>
            </div>
          </div>
        )}

        {/* Alertas */}
        {systemStatus.monitoring.alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-4 h-4" />
              Alertas ({systemStatus.monitoring.alerts.length})
            </h4>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {systemStatus.monitoring.alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {alert.type}
                    </Badge>
                    <span className="text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1">{alert.message}</p>
                </div>
              ))}
              {systemStatus.monitoring.alerts.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{systemStatus.monitoring.alerts.length - 3} alertas adicionais
                </p>
              )}
            </div>
          </div>
        )}

        {/* Última Verificação */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Última verificação
            </div>
            <span>{systemStatus.monitoring.lastCheck}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default N8nStatusCard;
