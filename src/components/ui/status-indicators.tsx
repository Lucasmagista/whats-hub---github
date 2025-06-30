import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { dataStore } from '@/store/dataStore';
import { Bot } from '@/types/global';

interface BotStatusIndicatorProps {
  botId?: string;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dot' | 'badge' | 'full';
}

interface SystemStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

const BotStatusIndicator: React.FC<BotStatusIndicatorProps> = ({
  botId,
  className,
  showText = false,
  size = 'md',
  variant = 'dot'
}) => {
  const [status, setStatus] = useState<Bot['status']>('offline');
  const [botName, setBotName] = useState<string>('');

  useEffect(() => {
    const updateStatus = () => {
      if (botId) {
        const bots = dataStore.getBots();
        const bot = bots.find(b => b.id === botId);
        if (bot) {
          setStatus(bot.status);
          setBotName(bot.name);
        }
      }
    };

    updateStatus();

    // Atualizar a cada 5 segundos
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, [botId]);

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500 text-green-500 border-green-500';
      case 'connecting':
        return 'bg-amber-500 text-amber-500 border-amber-500';
      case 'error':
        return 'bg-red-500 text-red-500 border-red-500';
      default:
        return 'bg-gray-400 text-gray-400 border-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'connecting':
        return 'Conectando';
      case 'error':
        return 'Erro';
      default:
        return 'Offline';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return variant === 'dot' ? 'w-2 h-2' : 'w-4 h-4 text-xs';
      case 'lg':
        return variant === 'dot' ? 'w-4 h-4' : 'w-6 h-6 text-sm';
      default:
        return variant === 'dot' ? 'w-3 h-3' : 'w-5 h-5 text-xs';
    }
  };

  const getPulseClass = () => {
    return status === 'connecting' ? 'animate-pulse' : 
           status === 'online' ? 'animate-pulse duration-1000' : '';
  };

  if (variant === 'dot') {
    return (
      <div
        className={cn(
          'rounded-full border-2 border-white dark:border-gray-800',
          getSizeClasses(),
          getStatusColor(),
          getPulseClass(),
          className
        )}
        title={showText ? `${botName}: ${getStatusText()}` : getStatusText()}
      />
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm border',
          getStatusColor(),
          className
        )}
      >
        <div className={cn('rounded-full', getSizeClasses(), getPulseClass())} />
        {showText && <span>{getStatusText()}</span>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 backdrop-blur-sm border',
        getStatusColor(),
        className
      )}
    >
      <div className={cn('rounded-full', getSizeClasses(), getPulseClass())} />
      <div className="text-sm">
        {showText && botName && <span className="font-medium">{botName}: </span>}
        <span>{getStatusText()}</span>
      </div>
    </div>
  );
};

const SystemStatusIndicator: React.FC<SystemStatusIndicatorProps> = ({
  className,
  showDetails = false
}) => {
  const [systemStatus, setSystemStatus] = useState({
    totalBots: 0,
    onlineBots: 0,
    offlineBots: 0,
    errorBots: 0,
    connectingBots: 0
  });

  useEffect(() => {
    const updateSystemStatus = () => {
      const bots = dataStore.getBots();
      const status = {
        totalBots: bots.length,
        onlineBots: bots.filter(b => b.status === 'online').length,
        offlineBots: bots.filter(b => b.status === 'offline').length,
        errorBots: bots.filter(b => b.status === 'error').length,
        connectingBots: bots.filter(b => b.status === 'connecting').length
      };
      setSystemStatus(status);
    };

    updateSystemStatus();

    // Atualizar a cada 5 segundos
    const interval = setInterval(updateSystemStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSystemStatusColor = () => {
    if (systemStatus.errorBots > 0) return 'border-red-500 bg-red-500/10';
    if (systemStatus.connectingBots > 0) return 'border-amber-500 bg-amber-500/10';
    if (systemStatus.onlineBots === systemStatus.totalBots && systemStatus.totalBots > 0) {
      return 'border-green-500 bg-green-500/10';
    }
    return 'border-gray-400 bg-gray-400/10';
  };

  const getSystemStatusText = () => {
    if (systemStatus.totalBots === 0) return 'Nenhum bot configurado';
    if (systemStatus.errorBots > 0) return 'Sistema com erros';
    if (systemStatus.connectingBots > 0) return 'Sistema conectando';
    if (systemStatus.onlineBots === systemStatus.totalBots) return 'Todos os bots online';
    return `${systemStatus.onlineBots}/${systemStatus.totalBots} bots online`;
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2 rounded-lg border backdrop-blur-sm',
        getSystemStatusColor(),
        className
      )}
    >
      <div className="flex items-center gap-1">
        <BotStatusIndicator size="sm" variant="dot" />
        <span className="text-sm font-medium">{getSystemStatusText()}</span>
      </div>
      
      {showDetails && systemStatus.totalBots > 0 && (
        <div className="flex items-center gap-3 text-xs">
          {systemStatus.onlineBots > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>{systemStatus.onlineBots}</span>
            </div>
          )}
          {systemStatus.connectingBots > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{systemStatus.connectingBots}</span>
            </div>
          )}
          {systemStatus.errorBots > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>{systemStatus.errorBots}</span>
            </div>
          )}
          {systemStatus.offlineBots > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span>{systemStatus.offlineBots}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { BotStatusIndicator, SystemStatusIndicator };
