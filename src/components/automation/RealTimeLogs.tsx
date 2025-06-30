/**
 * 📋 RealTimeLogs - FASE 1 INTEGRAÇÃO
 * Componente para exibir logs em tempo real do sistema n8n + WhatsApp
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Play, 
  Pause,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  Clock,
  Server,
  Bot,
  MessageSquare,
  Users
} from 'lucide-react';
import { LogEntry } from '@/services/n8nApiService';

interface RealTimeLogsProps {
  logs: LogEntry[];
  loading?: boolean;
  autoScroll?: boolean;
  onClear?: () => void;
  onDownload?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isPaused?: boolean;
  className?: string;
}

export const RealTimeLogs: React.FC<RealTimeLogsProps> = ({
  logs,
  loading = false,
  autoScroll = true,
  onClear,
  onDownload,
  onPause,
  onResume,
  isPaused = false,
  className = ''
}) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isAutoScroll, setIsAutoScroll] = useState(autoScroll);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para o final quando novos logs chegarem
  useEffect(() => {
    if (isAutoScroll && bottomRef.current && !isPaused) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isAutoScroll, isPaused]);

  // Filtrar logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesSource = sourceFilter === 'all' || log.source === sourceFilter;
    const matchesTab = selectedTab === 'all' || log.source === selectedTab;
    
    return matchesSearch && matchesLevel && matchesSource && matchesTab;
  });

  // Contar logs por nível
  const logCounts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Contar logs por fonte
  const sourceCounts = logs.reduce((acc, log) => {
    acc[log.source] = (acc[log.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Renderizar ícone do nível
  const renderLevelIcon = (level: LogEntry['level']) => {
    const config = {
      debug: { icon: Info, color: 'text-gray-400' },
      info: { icon: Info, color: 'text-blue-500' },
      warn: { icon: AlertTriangle, color: 'text-yellow-500' },
      error: { icon: XCircle, color: 'text-red-500' }
    };
    
    const { icon: Icon, color } = config[level];
    return <Icon className={`w-4 h-4 ${color}`} />;
  };

  // Renderizar ícone da fonte
  const renderSourceIcon = (source: LogEntry['source']) => {
    const config = {
      whatsapp: { icon: MessageSquare, color: 'text-green-500' },
      n8n: { icon: Bot, color: 'text-purple-500' },
      system: { icon: Server, color: 'text-blue-500' },
      support: { icon: Users, color: 'text-orange-500' }
    };
    
    const { icon: Icon, color } = config[source];
    return <Icon className={`w-4 h-4 ${color}`} />;
  };

  // Renderizar badge do nível
  const renderLevelBadge = (level: LogEntry['level']) => {
    const config = {
      debug: 'bg-gray-100 text-gray-700',
      info: 'bg-blue-100 text-blue-700',
      warn: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700'
    };
    
    return (
      <Badge variant="secondary" className={`text-xs ${config[level]}`}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  // Formatar timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Logs em Tempo Real
            {isPaused && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                Pausado
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Controles */}
            {isPaused ? (
              <Button size="sm" variant="outline" onClick={onResume}>
                <Play className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={onPause}>
                <Pause className="w-4 h-4" />
              </Button>
            )}
            
            {onDownload && (
              <Button size="sm" variant="outline" onClick={onDownload}>
                <Download className="w-4 h-4" />
              </Button>
            )}
            
            {onClear && (
              <Button size="sm" variant="outline" onClick={onClear}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardTitle>
        
        {/* Filtros */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar nos logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="h-8 px-2 border border-border rounded text-sm bg-background"
          >
            <option value="all">Todos os níveis</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
          
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-8 px-2 border border-border rounded text-sm bg-background"
          >
            <option value="all">Todas as fontes</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="n8n">n8n</option>
            <option value="system">Sistema</option>
            <option value="support">Suporte</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              Todos ({logs.length})
            </TabsTrigger>
            <TabsTrigger value="whatsapp">
              WhatsApp ({sourceCounts.whatsapp || 0})
            </TabsTrigger>
            <TabsTrigger value="n8n">
              n8n ({sourceCounts.n8n || 0})
            </TabsTrigger>
            <TabsTrigger value="system">
              Sistema ({sourceCounts.system || 0})
            </TabsTrigger>
            <TabsTrigger value="support">
              Suporte ({sourceCounts.support || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-4">
            {/* Estatísticas */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-700">{logCounts.debug || 0}</div>
                <div className="text-xs text-gray-500">Debug</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-700">{logCounts.info || 0}</div>
                <div className="text-xs text-blue-500">Info</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="text-lg font-bold text-yellow-700">{logCounts.warn || 0}</div>
                <div className="text-xs text-yellow-500">Warning</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="text-lg font-bold text-red-700">{logCounts.error || 0}</div>
                <div className="text-xs text-red-500">Error</div>
              </div>
            </div>

            {/* Lista de Logs */}
            <ScrollArea ref={scrollAreaRef} className="h-[400px] border border-border rounded">
              <div className="p-2 space-y-1">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <div
                      key={`${log.id}-${index}`}
                      className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded text-sm border-l-2 border-transparent hover:border-primary/30 transition-all"
                    >
                      {/* Timestamp */}
                      <div className="w-20 flex-shrink-0 text-xs text-muted-foreground font-mono">
                        {formatTime(log.timestamp)}
                      </div>
                      
                      {/* Ícones */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {renderSourceIcon(log.source)}
                        {renderLevelIcon(log.level)}
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {renderLevelBadge(log.level)}
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                        </div>
                        
                        <div className="text-sm break-words">
                          {log.message}
                        </div>
                        
                        {/* Dados extras */}
                        {log.data && Object.keys(log.data).length > 0 && (
                          <div className="mt-1 p-2 bg-muted/30 rounded text-xs font-mono overflow-auto">
                            <pre>{JSON.stringify(log.data, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm || levelFilter !== 'all' || sourceFilter !== 'all' ? (
                      <div>
                        <Search className="w-8 h-8 mx-auto mb-2" />
                        <p>Nenhum log encontrado com os filtros aplicados</p>
                      </div>
                    ) : (
                      <div>
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p>Aguardando logs...</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Referência para auto-scroll */}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Controles de Scroll */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isAutoScroll}
                    onChange={(e) => setIsAutoScroll(e.target.checked)}
                    className="rounded"
                  />
                  Auto-scroll
                </label>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Mostrando {filteredLogs.length} de {logs.length} logs
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RealTimeLogs;
