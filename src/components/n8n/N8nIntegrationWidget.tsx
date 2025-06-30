/**
 * 📊 N8N Integration Widget - FASE 1
 * Widget de resumo da integração para exibir no dashboard principal
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Activity, 
  Zap, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { whatsHubIntegration } from '@/services/whatsHubIntegration';

interface IntegrationSummary {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  whatsappConnected: boolean;
  n8nConnected: boolean;
  queueLength: number;
  activeChats: number;
  todayMessages: number;
  uptime: string;
}

interface N8nIntegrationWidgetProps {
  onViewDetails?: () => void;
  compact?: boolean;
}

export const N8nIntegrationWidget: React.FC<N8nIntegrationWidgetProps> = ({
  onViewDetails,
  compact = false
}) => {
  const [summary, setSummary] = useState<IntegrationSummary>({
    status: 'unknown',
    whatsappConnected: false,
    n8nConnected: false,
    queueLength: 0,
    activeChats: 0,
    todayMessages: 0,
    uptime: '0m'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
    const interval = setInterval(loadSummary, 30000); // Atualizar a cada 30s
    
    return () => clearInterval(interval);
  }, []);

  const loadSummary = async () => {
    try {
      const status = await whatsHubIntegration.getIntegratedStatus();
      
      setSummary({
        status: status.overall,
        whatsappConnected: status.systems?.whatsapp?.connected || false,
        n8nConnected: status.systems?.n8n?.connected || false,
        queueLength: status.queue?.totalInQueue || 0,
        activeChats: status.queue?.activeChats || 0,
        todayMessages: status.systems?.whatsapp?.messagesReceived || 0,
        uptime: formatUptime(status.systems?.server?.uptime || 0)
      });
    } catch (error) {
      console.error('Erro ao carregar resumo da integração:', error);
      setSummary(prev => ({ ...prev, status: 'critical' }));
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Integração N8N</h3>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(summary.status)} text-xs`}>
                    {summary.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {summary.activeChats} chats ativos
                  </span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={onViewDetails}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Integração N8N + WhatsApp
          </div>
          <Badge className={`${getStatusColor(summary.status)} flex items-center gap-1`}>
            {getStatusIcon(summary.status)}
            {summary.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <Activity className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Carregando status...</p>
          </div>
        ) : (
          <>
            {/* Status dos Sistemas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <MessageSquare className="h-4 w-4" />
                <div>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${summary.whatsappConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">
                      {summary.whatsappConnected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Zap className="h-4 w-4" />
                <div>
                  <p className="text-xs text-muted-foreground">N8N</p>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${summary.n8nConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">
                      {summary.n8nConnected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="text-center p-2 rounded-lg bg-blue-50 border">
                <Users className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                <p className="text-lg font-bold text-blue-700">{summary.activeChats}</p>
                <p className="text-xs text-blue-600">Chats Ativos</p>
              </div>

              <div className="text-center p-2 rounded-lg bg-orange-50 border">
                <Clock className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                <p className="text-lg font-bold text-orange-700">{summary.queueLength}</p>
                <p className="text-xs text-orange-600">Na Fila</p>
              </div>

              <div className="text-center p-2 rounded-lg bg-green-50 border">
                <MessageSquare className="h-4 w-4 mx-auto mb-1 text-green-600" />
                <p className="text-lg font-bold text-green-700">{summary.todayMessages}</p>
                <p className="text-xs text-green-600">Msg Hoje</p>
              </div>

              <div className="text-center p-2 rounded-lg bg-purple-50 border">
                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                <p className="text-lg font-bold text-purple-700">{summary.uptime}</p>
                <p className="text-xs text-purple-600">Uptime</p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={onViewDetails} className="flex-1">
                <Activity className="h-4 w-4 mr-2" />
                Ver Dashboard
              </Button>
              <Button size="sm" variant="outline" onClick={loadSummary}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default N8nIntegrationWidget;
