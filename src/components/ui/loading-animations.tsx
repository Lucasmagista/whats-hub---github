import React from 'react';
import { cn } from '@/lib/utils';

// ============== LOADING DOTS ==============
interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'muted';
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  size = 'md', 
  color = 'primary',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2', 
    lg: 'w-3 h-3'
  };

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary', 
    muted: 'bg-muted-foreground'
  };

  return (    <div className={cn("flex items-center justify-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-loading-dots",
            sizeClasses[size],
            colorClasses[color],
            i === 0 ? "animation-delay-0" : 
            i === 1 ? "animation-delay-160" : "animation-delay-320"
          )}
        />
      ))}
    </div>
  );
};

// ============== LOADING SPINNER ==============
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'muted';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  color = 'primary',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    muted: 'border-muted-foreground'
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-t-transparent",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
};

// ============== PULSE LOADER ==============
interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'muted';
  className?: string;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({ 
  size = 'md',
  color = 'primary',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'bg-primary/20',
    secondary: 'bg-secondary/20',
    muted: 'bg-muted/20'
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div
        className={cn(
          "absolute rounded-full animate-ping",
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      <div
        className={cn(
          "relative rounded-full",
          size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8',
          color === 'primary' ? 'bg-primary' : 
          color === 'secondary' ? 'bg-secondary' : 'bg-muted-foreground'
        )}
      />
    </div>
  );
};

// ============== SKELETON LOADER ==============
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className,
  variant = 'rectangular'
}) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-muted/50 via-muted/80 to-muted/50 bg-[length:200%_100%] skeleton-shimmer";
  
  const variantClasses = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  };

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    />
  );
};

// ============== TYPING INDICATOR ==============
export const TypingIndicator: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-1 p-3 bg-muted/30 rounded-2xl w-fit", className)}>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 bg-muted-foreground rounded-full animate-bounce",
              i === 0 ? "bounce-delay-0" : 
              i === 1 ? "bounce-delay-100" : "bounce-delay-200"
            )}
          />
        ))}
      </div>
    </div>
  );
};

// ============== FOLDER LOADING ==============
export const FolderLoadingAnimation: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative">
        <div className="w-16 h-12 border-2 border-primary/30 rounded-t-lg relative">
          <div className="absolute -top-1 left-2 w-4 h-2 bg-primary/30 rounded-t-sm" />
          <div className="absolute inset-2 space-y-1">
            <Skeleton className="h-1 w-full" />
            <Skeleton className="h-1 w-3/4" />
            <Skeleton className="h-1 w-1/2" />
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
        </div>
      </div>
      <LoadingDots size="sm" />
    </div>
  );
};

// ============== GLOBAL LOADING OVERLAY ==============
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible,
  message = "Carregando...",
  className 
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center",
      className
    )}>
      <div className="glass-card p-8 rounded-3xl flex flex-col items-center gap-4 max-w-xs">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground text-center">{message}</p>
      </div>
    </div>
  );
};
