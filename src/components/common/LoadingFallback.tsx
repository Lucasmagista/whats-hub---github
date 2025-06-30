// src/components/common/LoadingFallback.tsx
// Componente de fallback para loading states

import React from 'react';
import { LoadingSpinner } from '@/components/ui/loading-animations';
import { cn } from '@/lib/utils';

interface LoadingFallbackProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Carregando...',
  className,
  size = 'md',
  fullScreen = false
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size={size} />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 gap-4",
      className
    )}>
      <LoadingSpinner size={size} />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
};

// Componente de erro
interface ErrorFallbackProps {
  error?: Error | string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  className
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Algo deu errado';

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 gap-4",
      className
    )}>
      <div className="text-destructive">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground">Erro</h3>
        <p className="text-muted-foreground text-sm mt-1">{errorMessage}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
};