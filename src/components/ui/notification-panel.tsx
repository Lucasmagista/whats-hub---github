import React, { useState, useEffect } from 'react';
import { Bell, Check, X, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { notificationService, type RealNotification } from '@/services/notificationService';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  className?: string;
  maxHeight?: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  className,
  maxHeight = '400px'
}) => {
  const [notifications, setNotifications] = useState<RealNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Carregar notificações iniciais
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());
    setSoundEnabled(notificationService.isSoundEnabled());

    // Configurar listener
    const removeListener = notificationService.addListener((newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(notificationService.getUnreadCount());
    });

    return removeListener;
  }, []);

  const getNotificationIcon = (type: RealNotification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: RealNotification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      default:
        return 'border-blue-500/30 bg-blue-500/5';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleRemove = (id: string) => {
    notificationService.removeNotification(id);
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    notificationService.clearAll();
  };

  const handleToggleSound = () => {
    const newSoundState = !soundEnabled;
    notificationService.setSoundEnabled(newSoundState);
    setSoundEnabled(newSoundState);
  };

  const handleAction = (notification: RealNotification) => {
    if (notification.actionUrl) {
      // Em um app real, você faria navegação aqui
      console.log('Navegar para:', notification.actionUrl);
    }
    handleMarkAsRead(notification.id);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações            {unreadCount > 0 && (
              <Badge className="min-w-[20px] h-5 rounded-full text-xs bg-red-500 text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleSound}
              className="h-8 w-8 p-0"
              title={soundEnabled ? 'Desabilitar som' : 'Habilitar som'}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            {notifications.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="text-xs"
                >
                  Marcar todas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs"
                >
                  Limpar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma notificação</p>
            <p className="text-xs opacity-75">Você está em dia!</p>
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }} className="px-4">
            <div className="space-y-2 pb-4">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={cn(
                      'p-3 rounded-lg border transition-all duration-200 hover:shadow-md',
                      getNotificationColor(notification.type),
                      !notification.read && 'bg-opacity-20',
                      notification.persistent && 'border-l-4'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-lg mt-0.5 flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={cn(
                              'text-sm font-medium truncate',
                              !notification.read && 'font-semibold'
                            )}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(notification.timestamp)}
                            </span>
                            <div className="flex items-center gap-1">
                              {notification.actionText && notification.actionUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction(notification)}
                                  className="h-6 px-2 text-xs"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  {notification.actionText}
                                </Button>
                              )}
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                  title="Marcar como lida"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemove(notification.id)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                                title="Remover"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;
