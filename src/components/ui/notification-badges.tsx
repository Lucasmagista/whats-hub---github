import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// ============== NOTIFICATION BADGE ==============
interface NotificationBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  variant = 'destructive',
  size = 'md',
  dot = false,
  pulse = false,
  className,
  children
}) => {
  if (count <= 0 && !dot) return children || null;

  const displayCount = count > max ? `${max}+` : count.toString();

  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const sizeClasses = {
    sm: dot ? 'w-2 h-2' : 'min-w-[16px] h-4 text-[10px] px-1',
    md: dot ? 'w-3 h-3' : 'min-w-[20px] h-5 text-xs px-1.5',
    lg: dot ? 'w-4 h-4' : 'min-w-[24px] h-6 text-sm px-2'
  };

  const badge = (
    <div
      className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center rounded-full font-medium border-2 border-background",
        variantClasses[variant],
        sizeClasses[size],
        pulse && "animate-pulse",
        className
      )}
    >
      {!dot && displayCount}
    </div>
  );

  if (!children) {
    return badge;
  }

  return (
    <div className="relative inline-flex">
      {children}
      {badge}
    </div>
  );
};

// ============== STATUS BADGE ==============
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'connecting';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showText = false,
  pulse = false,
  className
}) => {
  const statusConfig = {
    online: {
      color: 'bg-green-500',
      text: 'Online',
      textColor: 'text-green-600'
    },
    offline: {
      color: 'bg-gray-400',
      text: 'Offline',
      textColor: 'text-gray-500'
    },
    away: {
      color: 'bg-amber-500',
      text: 'Ausente',
      textColor: 'text-amber-600'
    },
    busy: {
      color: 'bg-red-500',
      text: 'Ocupado',
      textColor: 'text-red-600'
    },
    connecting: {
      color: 'bg-blue-500',
      text: 'Conectando',
      textColor: 'text-blue-600'
    }
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const config = statusConfig[status];

  if (showText) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "rounded-full border-2 border-background",
          config.color,
          sizeClasses[size],
          pulse && status === 'connecting' && "animate-pulse"
        )} />
        <span className={cn("text-xs font-medium", config.textColor)}>
          {config.text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full border-2 border-background",
        config.color,
        sizeClasses[size],
        pulse && status === 'connecting' && "animate-pulse",
        className
      )}
    />
  );
};

// ============== PRIORITY BADGE ==============
interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'dot';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  variant = 'default',
  className
}) => {
  const priorityConfig = {
    low: {
      color: 'bg-green-100 text-green-800 border-green-200',
      outlineColor: 'border-green-500 text-green-600',
      dotColor: 'bg-green-500',
      text: 'Baixa'
    },
    medium: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      outlineColor: 'border-blue-500 text-blue-600',
      dotColor: 'bg-blue-500',
      text: 'Média'
    },
    high: {
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      outlineColor: 'border-amber-500 text-amber-600',
      dotColor: 'bg-amber-500',
      text: 'Alta'
    },
    urgent: {
      color: 'bg-red-100 text-red-800 border-red-200',
      outlineColor: 'border-red-500 text-red-600',
      dotColor: 'bg-red-500',
      text: 'Urgente'
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1'
  };

  const config = priorityConfig[priority];

  if (variant === 'dot') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "w-2 h-2 rounded-full",
          config.dotColor,
          priority === 'urgent' && "animate-pulse"
        )} />
        <span className="text-xs text-muted-foreground">{config.text}</span>
      </div>
    );
  }

  return (
    <Badge
      variant={variant === 'outline' ? 'outline' : 'secondary'}
      className={cn(
        "font-medium border",
        variant === 'outline' ? config.outlineColor : config.color,
        sizeClasses[size],
        priority === 'urgent' && variant === 'default' && "animate-pulse",
        className
      )}
    >
      {config.text}
    </Badge>
  );
};

// ============== CATEGORY BADGE ==============
interface CategoryBadgeProps {
  category: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  color,
  size = 'md',
  removable = false,
  onRemove,
  className
}) => {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1'
  };

  const getColorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const colorClass = color || getColorFromString(category);

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium border inline-flex items-center gap-1",
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      <span>{category}</span>
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      )}
    </Badge>
  );
};

// ============== METRIC BADGE ==============
interface MetricBadgeProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  label,
  value,
  trend,
  trendValue,
  size = 'md',
  className
}) => {
  const trendConfig = {
    up: { color: 'text-green-600', icon: '↗' },
    down: { color: 'text-red-600', icon: '↘' },
    neutral: { color: 'text-gray-600', icon: '→' }
  };

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  return (
    <div className={cn(
      "bg-card border rounded-lg text-center",
      sizeClasses[size],
      className
    )}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="font-semibold text-lg">{value}</div>
      {trend && trendValue && (
        <div className={cn(
          "flex items-center justify-center gap-1 text-xs mt-1",
          trendConfig[trend].color
        )}>
          <span>{trendConfig[trend].icon}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

// ============== LIVE BADGE ==============
export const LiveBadge: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium border border-red-200",
      className
    )}>
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      AO VIVO
    </div>
  );
};
