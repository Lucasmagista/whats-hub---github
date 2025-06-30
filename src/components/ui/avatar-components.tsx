import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ============== AVATAR WITH INITIALS ==============
interface AvatarWithInitialsProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
  fallbackClassName?: string;
}

export const AvatarWithInitials: React.FC<AvatarWithInitialsProps> = ({
  name,
  src,
  size = 'md',
  status,
  className,
  fallbackClassName
}) => {
  // Gera iniciais do nome
  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Gera cor baseada no nome
  const getAvatarColor = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'bg-gradient-to-br from-red-400 to-red-600',
      'bg-gradient-to-br from-teal-400 to-teal-600',
      'bg-gradient-to-br from-orange-400 to-orange-600',
      'bg-gradient-to-br from-cyan-400 to-cyan-600'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const statusConfig = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-amber-500',
    busy: 'bg-red-500'
  };

  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={src} alt={name} />
        <AvatarFallback 
          className={cn(
            "text-white font-semibold",
            colorClass,
            fallbackClassName
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {status && (
        <div 
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
            statusConfig[status],
            size === 'sm' && "w-2 h-2",
            size === 'xl' && "w-4 h-4"
          )}
        />
      )}
    </div>
  );
};

// ============== AVATAR GROUP ==============
interface AvatarGroupProps {
  users: Array<{
    name: string;
    src?: string;
    status?: 'online' | 'offline' | 'away' | 'busy';
  }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 3,
  size = 'md',
  className
}) => {
  const visibleUsers = users.slice(0, max);
  const extraCount = users.length - max;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visibleUsers.map((user, index) => (
        <AvatarWithInitials
          key={index}
          name={user.name}
          src={user.src}
          status={user.status}
          size={size}
          className="border-2 border-background"
        />
      ))}
      
      {extraCount > 0 && (
        <Avatar className={cn(sizeClasses[size], "border-2 border-background")}>
          <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
            +{extraCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

// ============== BOT AVATAR ==============
interface BotAvatarProps {
  botName: string;
  isOnline?: boolean;
  isTyping?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BotAvatar: React.FC<BotAvatarProps> = ({
  botName,
  isOnline = false,
  isTyping = false,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
          🤖
        </AvatarFallback>
      </Avatar>
      
      {/* Status indicator */}
      <div 
        className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
          isOnline ? "bg-green-500" : "bg-gray-400",
          size === 'sm' && "w-2 h-2",
          size === 'lg' && "w-4 h-4"
        )}
      />
      
      {/* Typing indicator */}
      {isTyping && (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};

// ============== CUSTOMER AVATAR ==============
interface CustomerAvatarProps {
  customerName: string;
  phoneNumber?: string;
  src?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CustomerAvatar: React.FC<CustomerAvatarProps> = ({
  customerName,
  phoneNumber,
  src,
  priority,
  size = 'md',
  className
}) => {
  const priorityColors = {
    low: 'ring-green-400',
    medium: 'ring-blue-400',
    high: 'ring-amber-400',
    urgent: 'ring-red-400'
  };

  const ringClass = priority ? `ring-2 ${priorityColors[priority]}` : '';

  return (
    <div className="relative group">
      <AvatarWithInitials
        name={customerName}
        src={src}
        size={size}
        className={cn(ringClass, className)}
      />
      
      {/* Tooltip com informações */}
      {phoneNumber && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {phoneNumber}
        </div>
      )}
    </div>
  );
};

// ============== AGENT AVATAR ==============
interface AgentAvatarProps {
  agentName: string;
  role?: string;
  src?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  workload?: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  agentName,
  role,
  src,
  status = 'offline',
  workload = 0,
  size = 'md',
  className
}) => {
  const getWorkloadColor = (workload: number) => {
    if (workload >= 80) return 'ring-red-400';
    if (workload >= 60) return 'ring-amber-400';
    if (workload >= 40) return 'ring-blue-400';
    return 'ring-green-400';
  };

  const workloadRing = workload > 0 ? `ring-2 ${getWorkloadColor(workload)}` : '';

  return (
    <div className="relative group">
      <AvatarWithInitials
        name={agentName}
        src={src}
        status={status}
        size={size}
        className={cn(workloadRing, className)}
      />
      
      {/* Workload indicator */}
      {workload > 0 && (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-background rounded-full flex items-center justify-center border">
          <span className="text-[8px] font-bold">{workload}</span>
        </div>
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        <div className="font-medium">{agentName}</div>
        {role && <div className="text-muted-foreground">{role}</div>}
        {workload > 0 && <div>Carga: {workload}%</div>}
      </div>
    </div>
  );
};

// ============== COMPANY AVATAR ==============
interface CompanyAvatarProps {
  companyName: string;
  logo?: string;
  verified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CompanyAvatar: React.FC<CompanyAvatarProps> = ({
  companyName,
  logo,
  verified = false,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  // Gera iniciais da empresa
  const getCompanyInitials = (name: string): string => {
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
  };

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={logo} alt={companyName} />
        <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white font-bold">
          {getCompanyInitials(companyName)}
        </AvatarFallback>
      </Avatar>
      
      {verified && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
};
