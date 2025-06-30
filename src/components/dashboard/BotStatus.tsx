import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Settings, Activity, Zap, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import VisuallyHidden from '@/components/ui/VisuallyHidden';
import { dataStore } from '@/store/dataStore';
import { botApiService } from '@/services/botApi';
import { botSocketService } from '@/services/botSocketService';
import { Bot } from '@/types/global';
import { useToast } from '@/hooks/use-toast';

const BotStatusModal: React.FC<{ 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onOpenQRModal?: (bot: Bot) => void;
  onOpenLogsModal?: (bot: Bot) => void;
}> = ({ open, onOpenChange, onOpenQRModal, onOpenLogsModal }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="stable-modal-content max-w-md w-full p-0 overflow-hidden glass-card border-0">
      <VisuallyHidden>
        <DialogTitle>Status dos Bots</DialogTitle>
        <DialogDescription>Modal com informações de status e controle dos bots do sistema.</DialogDescription>
      </VisuallyHidden>
      <BotStatusContent onOpenQRModal={onOpenQRModal} onOpenLogsModal={onOpenLogsModal} />
    </DialogContent>
  </Dialog>
);

const BotStatusContent = ({ onOpenQRModal, onOpenLogsModal }: {
  onOpenQRModal?: (bot: Bot) => void;
  onOpenLogsModal?: (bot: Bot) => void;
}) => {
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBots();

    // Integração WebSocket: escuta atualizações de status dos bots
    const handleStatusUpdate = (data: { botId: string; status: Bot['status']; lastActivity?: string }) => {
      setBots(prevBots =>
        prevBots.map(bot =>
          bot.id === data.botId
            ? { ...bot, status: data.status, lastActivity: data.lastActivity || bot.lastActivity }
            : bot
        )
      );
    };
    const handleBotsList = (data: Bot[]) => {
      setBots(data);
    };
    botSocketService.on('botStatusUpdate', handleStatusUpdate);
    botSocketService.on('botListUpdate', handleBotsList);
    return () => {
      // Limpa listeners ao desmontar
      // @ts-ignore
      botSocketService.socket?.off?.('botStatusUpdate', handleStatusUpdate);
      // @ts-ignore
      botSocketService.socket?.off?.('botListUpdate', handleBotsList);
    };
  }, []);

  const loadBots = () => {
    const storedBots = dataStore.getBots();
    setBots(storedBots);
  };

  const updateBotStatus = async (botId: string, newStatus: Bot['status']) => {
    setBots(prevBots =>
      prevBots.map(bot =>
        bot.id === botId ? { 
          ...bot, 
          status: newStatus,
          lastActivity: newStatus === 'online' ? 'Agora' : bot.lastActivity
        } : bot
      )
    );

    // Update in dataStore
    dataStore.updateBot(botId, { 
      status: newStatus,
      lastActivity: newStatus === 'online' ? new Date().toISOString() : undefined
    });
  };

  const handleBotToggle = async (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    if (!bot || loading) return;

    setLoading(true);

    // 🚨 DEBUG: Log completo do bot
    console.log('🔄 Iniciando bot:', {
      id: bot.id,
      name: bot.name,
      environment: bot.settings?.environment || 'production',
      localPath: bot.settings?.localPath,
      startMode: bot.settings?.startMode,
      apiKey: bot.apiKey ? `${bot.apiKey.substring(0, 10)}...` : 'Não configurada',
      webhookUrl: bot.webhookUrl || 'Não configurado'
    });

    try {
      if (bot.status === 'online') {
        // Parar bot
        const result = await botApiService.stopBot(bot.id);
        if (result.success) {
          await updateBotStatus(bot.id, 'offline');
          toast({
            title: 'Bot parado',
            description: result.message || 'O bot foi parado com sucesso.',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Erro ao parar bot',
            description: result.message || 'Não foi possível parar o bot.',
            variant: 'destructive',
          });
        }
      } else {
        // Iniciar bot
        const result = await botApiService.startBot(bot);
        if (result.success) {
          await updateBotStatus(bot.id, 'online');
          toast({
            title: 'Bot iniciado',
            description: result.message || 'O bot foi iniciado com sucesso.',
            variant: 'default',
          });
          // Abrir modal de logs automaticamente ao iniciar
          if (onOpenLogsModal) onOpenLogsModal(bot);
          // Se houver QR code, abrir modal de QR code
          if (result.data && (result.data as any).qrCode && onOpenQRModal) {
            onOpenQRModal(bot);
          }
        } else {
          await updateBotStatus(bot.id, 'error');
          toast({
            title: 'Erro ao iniciar bot',
            description: result.message || 'Não foi possível iniciar o bot.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('🚨 Erro crítico no toggle do bot:', error);
      await updateBotStatus(botId, 'error');
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro crítico',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'online': 
        return { 
          color: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30',
          icon: <Zap className="h-3 w-3" />,
          glow: 'shadow-green-500/20'
        };
      case 'offline': 
        return { 
          color: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
          icon: <Square className="h-3 w-3" />,
          glow: 'shadow-red-500/20'
        };
      case 'connecting': 
        return { 
          color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30',
          icon: <Activity className="h-3 w-3" />,
          glow: 'shadow-amber-500/20'
        };
      case 'error': 
        return { 
          color: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30',
          icon: <AlertTriangle className="h-3 w-3" />,
          glow: 'shadow-red-600/20'
        };
      default: 
        return { 
          color: 'bg-muted text-muted-foreground',
          icon: <Square className="h-3 w-3" />,
          glow: ''
        };
    }
  };

  const formatLastActivity = (lastActivity?: string) => {
    if (!lastActivity) return 'Nunca';
    
    try {
      const date = new Date(lastActivity);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Agora';
      if (diffMinutes < 60) return `${diffMinutes} min atrás`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`;
      return `${Math.floor(diffMinutes / 1440)}d atrás`;
    } catch {
      return lastActivity;
    }
  };

  return (
      <Card className="h-full glass-card border-0 overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50 glass-effect flex flex-col gap-2">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 glass-card rounded-xl flex items-center justify-center modern-button">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <span className="gradient-text text-base">Gerenciador Bots</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {bots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum bot configurado</p>
              <p className="text-xs opacity-70">Adicione bots nas configurações</p>
            </div>
          ) : (
            bots.map((bot, index) => {
              const statusConfig = getStatusConfig(bot.status);
              return (
                <div 
                  key={bot.id} 
                  className="glass-effect rounded-xl p-3 flex items-center justify-between gap-2 chat-item-hover bounce-in bot-animation-delay-0 min-h-[70px]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm truncate">{bot.name}</h3>
                      <Badge className={`${statusConfig.color} text-xs px-2 py-0.5 flex items-center gap-1 modern-button`}>
                        {statusConfig.icon}
                        <span className="capitalize">{bot.status}</span>
                      </Badge>
                    </div>
                    {bot.description && (
                      <p className="text-xs text-muted-foreground mb-1 truncate">{bot.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground truncate">
                      Última atividade: <span className="text-primary">{formatLastActivity(bot.lastActivity)}</span>
                    </p>
                    <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden mt-1">
                      {(() => {
                        let progressBarClass = '';
                        if (bot.status === 'online') {
                          progressBarClass = 'w-full bg-gradient-to-r from-green-500 to-green-400';
                        } else if (bot.status === 'connecting') {
                          progressBarClass = 'w-3/4 bg-gradient-to-r from-amber-500 to-orange-400';
                        } else if (bot.status === 'error') {
                          progressBarClass = 'w-1/4 bg-gradient-to-r from-red-600 to-red-500';
                        } else {
                          progressBarClass = 'w-0 bg-red-500';
                        }
                        return (
                          <div 
                            className={`h-full transition-all duration-1000 ${progressBarClass}`}
                          />
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant={bot.status === 'online' ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => handleBotToggle(bot.id)}
                      disabled={bot.status === 'connecting' || loading}
                      className="modern-button rounded-xl shadow-lg h-7 px-3 text-xs"
                    >
                      {bot.status === 'online' ? (
                        <>
                          <Square className="h-3 w-3 mr-1" />
                          Parar
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Iniciar
                        </>
                      )}
                    </Button>
                    
                    {/* Botão QR Code */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenQRModal?.(bot)}
                      className="modern-button rounded-xl shadow-lg h-7 px-2 text-xs"
                      title="Ver QR Code"
                    >
                      📱
                    </Button>
                    
                    {/* Botão Logs */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenLogsModal?.(bot)}
                      className="modern-button rounded-xl shadow-lg h-7 px-2 text-xs"
                      title="Ver Logs em Tempo Real"
                    >
                      📋
                    </Button>
                  </div>
                </div>
              );
            })        )}
        </CardContent>
      </Card>
  );
};

export { BotStatusModal, BotStatusContent };