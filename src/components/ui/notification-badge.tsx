import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { metricsService } from '@/services/metricsService';

interface NotificationBadgeProps {
  type: 'conversations' | 'tickets' | 'queue' | 'alerts';
  className?: string;
  showPulse?: boolean;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  type,
  className,
  showPulse = true,
  variant = 'default'
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      const counts = metricsService.getNotificationCounts();
      const newCount = counts[type];
      setCount(newCount);
      setIsVisible(newCount > 0);
    };

    // Atualizar imediatamente
    updateCount();

    // Configurar listener para mudanças
    const removeListener = metricsService.addMetricsListener(updateCount);

    // Atualizar a cada 10 segundos
    const interval = setInterval(updateCount, 10000);

    return () => {
      removeListener();
      clearInterval(interval);
    };
  }, [type]);

  if (!isVisible || count === 0) {
    return null;
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500/90 text-white border-green-600/50 hover:bg-green-600/90';
      case 'warning':
        return 'bg-amber-500/90 text-white border-amber-600/50 hover:bg-amber-600/90';
      case 'destructive':
        return 'bg-red-500/90 text-white border-red-600/50 hover:bg-red-600/90';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground border-secondary/50 hover:bg-secondary/80';
      case 'outline':
        return 'bg-transparent text-foreground border-border hover:bg-accent';
      default:
        return 'bg-primary text-primary-foreground border-primary/50 hover:bg-primary/80';
    }
  };

  const formatCount = (num: number): string => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}k`;
    }
    if (num >= 100) {
      return '99+';
    }
    return num.toString();
  };

  const getPulseClass = () => {
    if (!showPulse) return '';
    
    switch (type) {
      case 'alerts':
        return count > 5 ? 'animate-pulse' : '';
      case 'tickets':
        return count > 10 ? 'animate-pulse' : '';
      case 'queue':
        return count > 20 ? 'animate-pulse' : '';
      default:
        return '';
    }
  };

  return (
    <Badge
      className={cn(
        'min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full flex items-center justify-center',
        'transition-all duration-200 ease-in-out',
        'shadow-md',
        getVariantClasses(),
        getPulseClass(),
        className
      )}
      title={`${count} ${type === 'conversations' ? 'conversas ativas' : 
                    type === 'tickets' ? 'tickets abertos' : 
                    type === 'queue' ? 'itens na fila' : 
                    'alertas ativos'}`}
    >
      {formatCount(count)}
    </Badge>
  );
};

export default NotificationBadge;
