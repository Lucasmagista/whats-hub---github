/**
 * 🔗 N8N Status Panel
 * Componente para exibir status da integração N8N
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useN8nConnection } from '@/hooks/useN8nConnection';
import { 
  Activity, 
  Server, 
  Database, 
  Workflow, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export const N8nStatusPanel: React.FC = () => {
  const {
    connected,
    connecting,
    error,
    systemStatus,
    whatsappConnection,
    uptime,
    lastSync,
    healthScore,
    refreshStatus,
    retry,
    clearError
  } = useN8nConnection();
  const getStatusBadge = (isConnected: boolean, isLoading: boolean = false) => {
    if (isLoading) {
      return <Badge variant="secondary" className="animate-pulse">Conectando...</Badge>;
    }
    if (isConnected) {
      return <Badge variant="default" className="bg-green-500">Online</Badge>;
    }
    return <Badge variant="secondary" className="bg-red-500 text-white">Offline</Badge>;
  };

  const getStatusIcon = (isConnected: boolean, isLoading: boolean = false) => {
    if (isLoading) {
      return <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />;
    }
    if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const formatUptime = (uptimeMs: number) => {
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Status N8N Integration
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(connected, connecting)}
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshStatus}
              disabled={connecting}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${connecting ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Erro */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={retry}
                className="h-7 text-xs text-red-400 hover:text-red-300"
              >
                Tentar Novamente
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-7 text-xs text-red-400 hover:text-red-300"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Health Score */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Health Score</span>
            <span className={`text-lg font-bold ${
              healthScore >= 75 ? 'text-green-500' : 
              healthScore >= 50 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {healthScore}%
            </span>
          </div>          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                healthScore >= 75 ? 'bg-green-500' : 
                healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              data-width={`${healthScore}%`}
            />
          </div>
        </div>

        {/* System Status */}
        {systemStatus && (
          <div className="grid grid-cols-2 gap-3">
            {/* WhatsApp Status */}
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.whatsapp.connected)}
                  <span className="text-sm font-medium">WhatsApp</span>
                </div>
                {getStatusBadge(systemStatus.whatsapp.connected)}
              </div>
              {systemStatus.whatsapp.lastSeen && (
                <p className="text-xs text-gray-400">
                  Última atividade: {new Date(systemStatus.whatsapp.lastSeen).toLocaleString()}
                </p>
              )}
            </div>

            {/* Database Status */}
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.database.connected)}
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                {getStatusBadge(systemStatus.database.connected)}
              </div>
              <p className="text-xs text-gray-400">
                {systemStatus.database.type || 'PostgreSQL'}
              </p>
            </div>

            {/* Server Status */}
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">Server</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatUptime(uptime)}
                </Badge>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Mem: {systemStatus.server.memoryUsage}%</span>
                <span>CPU: {systemStatus.server.cpuUsage}%</span>
              </div>
            </div>

            {/* N8N Status */}
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.n8n.connected)}
                  <Workflow className="h-4 w-4" />
                  <span className="text-sm font-medium">N8N</span>
                </div>
                {getStatusBadge(systemStatus.n8n.connected)}
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{systemStatus.n8n.workflows} workflows</span>
                <span>{systemStatus.n8n.executions} exec.</span>
              </div>
            </div>
          </div>
        )}

        {/* Last Sync */}
        {lastSync && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-700">
            <Clock className="h-3 w-3" />
            <span>Última sincronização: {lastSync.toLocaleString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
