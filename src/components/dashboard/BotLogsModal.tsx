import React, { useState, useEffect, useRef } from 'react';
import { DraggableModal } from '@/components/ui/draggable-modal';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Terminal, 
  Copy, 
  Download, 
  Pause, 
  Play, 
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { botApiService } from '@/services/botApi';

interface LogEntry {
  id: string;
  timestamp: Date | string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source?: string;
  botId?: string;
  metadata?: {
    sessionId?: string;
    processId?: number;
    memory?: string;
    [key: string]: unknown;
  };
}

interface BotLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  botName: string;
  botId: string;
  onQRCodeDetected?: (qrCode: string) => void;
  isEmbedded?: boolean;
}

export const BotLogsModal: React.FC<BotLogsModalProps> = ({
  isOpen,
  onClose,
  botName,
  botId,
  onQRCodeDetected,
  isEmbedded = false
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isScrolling] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<{ disconnect: () => void } | null>(null);

  // Mensagem de ausência de logs após timeout
  const [noLogsTimeout, setNoLogsTimeout] = useState(false);
  useEffect(() => {
    if (!isOpen) {
      setNoLogsTimeout(false);
      return;
    }
    if (logs.length === 0 && !isLoading) {
      const timeout = setTimeout(() => setNoLogsTimeout(true), 5000);
      return () => clearTimeout(timeout);
    } else {
      setNoLogsTimeout(false);
    }
  }, [isOpen, logs, isLoading]);

  // 📋 Carregar logs iniciais e conectar stream em tempo real
  useEffect(() => {
    if (!isOpen || isPaused) {
      // Desconectar stream se modal foi fechado ou pausado
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
        setIsConnected(false);
      }
      return;
    }    const initializeLogs = async () => {
      setIsLoading(true);
      
      try {
        console.log(`📋 Carregando logs para bot: ${botId}`);
        
        // 1. Carregar logs históricos
        const result = await botApiService.getBotLogs(botId, undefined, 50);
        
        if (result.success && result.data) {
          const logsData = result.data as { logs: LogEntry[] };
          const processedLogs = logsData.logs.map((log) => ({
            ...log,
            timestamp: typeof log.timestamp === 'string' ? new Date(log.timestamp) : log.timestamp
          }));
          
          setLogs(processedLogs);
          console.log(`✅ ${processedLogs.length} logs carregados para bot ${botId}`);
        } else {
          console.warn(`⚠️ Falha ao carregar logs: ${result.message}`);
          toast({
            title: "⚠️ Aviso",
            description: `Não foi possível carregar logs históricos: ${result.message}`,
            variant: "destructive",
          });
        }

        // 2. Conectar stream de logs em tempo real
        console.log(`📺 Conectando stream de logs para bot: ${botId}`);
        const stream = await botApiService.streamBotLogs(botId, (newLog) => {
          const processedLog = {
            ...newLog,
            timestamp: typeof newLog.timestamp === 'string' ? new Date(newLog.timestamp) : newLog.timestamp
          };
          
          setLogs(prev => {
            // Evitar logs duplicados
            const exists = prev.some(log => log.id === processedLog.id);
            if (exists) return prev;
            
            // Adicionar novo log e manter apenas os últimos 100
            const updated = [...prev, processedLog].slice(-100);
            return updated.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          });

          // Detectar QR Code nos logs
          if (processedLog.message.includes('QR Code gerado:') && onQRCodeDetected) {
            const qrMatch = processedLog.message.match(/data:image\/[^,]+,([A-Za-z0-9+/=]+)/);
            if (qrMatch) {
              onQRCodeDetected(processedLog.message.split('QR Code gerado: ')[1]);
            }
          }
        });

        if (stream) {
          streamRef.current = stream;
          setIsConnected(true);
          console.log(`✅ Stream conectado para bot: ${botId}`);
          
          toast({
            title: "📺 Logs em tempo real",
            description: `Conectado aos logs do bot ${botName}`,
          });
        } else {
          console.error(`❌ Falha ao conectar stream para bot: ${botId}`);
          setIsConnected(false);
          toast({
            title: "❌ Erro de conexão",
            description: "Não foi possível conectar ao stream de logs",
            variant: "destructive",
          });
        }

      } catch (error) {
        console.error('❌ Erro ao inicializar logs:', error);
        toast({
          title: "❌ Erro",
          description: "Falha ao conectar aos logs do bot",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeLogs();

    // Cleanup ao desmontar componente
    return () => {
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
        setIsConnected(false);
      }
    };
  }, [isOpen, isPaused, botId, botName, onQRCodeDetected]);
  // Auto scroll para o final
  useEffect(() => {
    if (isScrolling && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isScrolling]);

  // 🎛️ Pausar/Retomar stream
  const togglePause = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    
    if (newPausedState) {
      // Pausar - desconectar stream
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
        setIsConnected(false);
      }
      toast({
        title: "⏸️ Stream pausado",
        description: "Logs em tempo real foram pausados",
      });
    } else {
      // Retomar - não precisa fazer nada, o useEffect vai reconectar
      toast({
        title: "▶️ Stream retomado",
        description: "Reconectando aos logs em tempo real...",
      });
    }
  };

  // 🔄 Recarregar logs manualmente
  const reloadLogs = async () => {
    setIsLoading(true);
    try {
      const result = await botApiService.getBotLogs(botId, undefined, 50);
      
      if (result.success && result.data) {
        const logsData = result.data as { logs: LogEntry[] };
        const processedLogs = logsData.logs.map((log) => ({
          ...log,
          timestamp: typeof log.timestamp === 'string' ? new Date(log.timestamp) : log.timestamp
        }));
        
        setLogs(processedLogs);
        toast({
          title: "🔄 Logs recarregados",
          description: `${processedLogs.length} logs carregados`,
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Falha ao recarregar logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };
  const copyAllLogs = () => {
    const logsText = logs.map(log => {
      const timestamp = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp);
      return `[${timestamp.toLocaleTimeString()}] ${log.source}: ${log.message}`;
    }).join('\n');
    
    navigator.clipboard.writeText(logsText);
    toast({
      title: "📋 Logs copiados",
      description: "Todos os logs foram copiados para a área de transferência",
    });
  };

  const downloadLogs = () => {
    const logsText = logs.map(log => {
      const timestamp = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp);
      return `[${timestamp.toLocaleString()}] ${log.level.toUpperCase()} ${log.source}: ${log.message}`;
    }).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${botName}_logs_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    setLogs([]);
    toast({
      title: "🗑️ Logs limpos",
      description: "Histórico de logs foi removido",
    });
  };
  // Conteúdo do modal
  const modalContent = (
    <>      {/* Controles */}
      <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs px-1 py-0">
            {logs.length}
          </Badge>
          <Badge 
            variant={isPaused ? "secondary" : "default"} 
            className="text-xs px-1 py-0"
          >
            {isPaused ? "Pausado" : "Ativo"}
          </Badge>
          <Badge 
            variant={isConnected ? "default" : "secondary"} 
            className={`text-xs px-1 py-0 flex items-center gap-1 ${
              isConnected ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
            }`}
          >
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? "Online" : "Offline"}
          </Badge>
          {isLoading && (
            <Badge variant="outline" className="text-xs px-1 py-0 animate-pulse">
              Carregando...
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePause}
            className="h-6 w-6 p-0"
            disabled={isLoading}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={reloadLogs}
            className="h-6 w-6 p-0"
            disabled={isLoading}
          >
            <Terminal className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllLogs}
            className="h-6 w-6 p-0"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadLogs}
            className="h-6 w-6 p-0"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearLogs}
            className="h-6 w-6 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>      {/* Área de Logs */}
      <ScrollArea className="flex-1 px-4 py-3" ref={scrollAreaRef}>
        <div className="space-y-1 font-mono text-xs">
          {logs.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum log disponível</p>
              <p className="text-xs mt-1">Aguardando logs do bot...</p>
              {noLogsTimeout && (
                <div className="mt-3 text-xs text-red-500 font-semibold">
                  Nenhum log recebido. Certifique-se de que o bot está realmente rodando.<br/>
                  Se acabou de iniciar, aguarde alguns segundos.<br/>
                  <span className="text-blue-700">Dica: O QR Code só aparece se o bot emitir o log de conexão!</span>
                </div>
              )}
            </div>
          ) : (
            logs.map((log) => {
              const timestamp = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp);
              return (
                <div 
                  key={log.id} 
                  className="flex items-start gap-2 p-1.5 rounded border-l-2 border-l-gray-200 bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(log.level)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-xs text-gray-500">
                        {timestamp.toLocaleTimeString()}
                      </span>
                      {log.source && (
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                          {log.source}
                        </Badge>
                      )}
                      {log.metadata?.processId && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          PID: {log.metadata.processId}
                        </Badge>
                      )}
                    </div>
                    
                    <div className={`${getLogColor(log.level)} break-words text-xs leading-tight`}>
                      {log.message}
                    </div>
                    
                    {log.metadata?.memory && (
                      <div className="text-xs text-gray-400 mt-1">
                        Memória: {log.metadata.memory}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>
      </ScrollArea>      {/* Status da conexão */}
      <div className="px-4 py-2 border-t bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>Status: {isPaused ? "Pausado" : isConnected ? "Conectado" : "Desconectado"}</span>
            <div className={`w-2 h-2 rounded-full ${
              isPaused ? "bg-yellow-400" : isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
            }`} />
          </div>
          <div className="flex items-center gap-2">
            <span>Bot: {botId.substring(0, 8)}...</span>
            {logs.length > 0 && (
              <span>
                Último: {(() => {
                  const lastLog = logs[logs.length - 1];
                  const timestamp = lastLog.timestamp instanceof Date ? lastLog.timestamp : new Date(lastLog.timestamp);
                  return timestamp.toLocaleTimeString();
                })()}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Se for modo embutido, retornar apenas o conteúdo
  if (isEmbedded) {
    return (
      <div className="h-full glass-card border-0 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Terminal className="w-4 h-4" />
            <span className="gradient-text">Logs - {botName}</span>
          </div>
        </div>
        {modalContent}
      </div>
    );
  }
  // Modo modal normal
  return (    <DraggableModal 
      isOpen={isOpen} 
      onClose={onClose}
      title={`Logs - ${botName}`}
      size="lg"
      defaultPosition={{ x: -350, y: -25 }}
    >
      <div className="h-full flex flex-col">
        {modalContent}
      </div>
    </DraggableModal>
  );
};
