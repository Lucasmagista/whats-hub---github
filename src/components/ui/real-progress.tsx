import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { metricsService } from '@/services/metricsService';
import { dataStore } from '@/store/dataStore';

interface RealProgressBarProps {
  type: 'satisfaction' | 'uptime' | 'queue-health' | 'response-time' | 'bot-efficiency';
  className?: string;
  showLabel?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

interface RealCircularProgressProps {
  type: 'satisfaction' | 'uptime' | 'performance' | 'tickets-resolved';
  className?: string;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
}

const RealProgressBar: React.FC<RealProgressBarProps> = ({
  type,
  className,
  showLabel = true,
  showPercentage = true,
  size = 'md',
  animated = true
}) => {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('bg-primary');

  useEffect(() => {
    const updateProgress = () => {
      const metrics = metricsService.calculateRealTimeMetrics();
      
      switch (type) {
        case 'satisfaction':
          setProgress(metrics.satisfaction);
          setLabel('Satisfação dos Clientes');
          setColor(metrics.satisfaction > 80 ? 'bg-green-500' : 
                  metrics.satisfaction > 60 ? 'bg-amber-500' : 'bg-red-500');
          break;
          
        case 'uptime':
          setProgress(metrics.uptime);
          setLabel('Uptime do Sistema');
          setColor(metrics.uptime > 95 ? 'bg-green-500' : 
                  metrics.uptime > 90 ? 'bg-amber-500' : 'bg-red-500');
          break;
          
        case 'queue-health':
          const queueHealth = Math.max(0, 100 - (metrics.pendingQueueItems * 2));
          setProgress(queueHealth);
          setLabel('Saúde da Fila');
          setColor(queueHealth > 80 ? 'bg-green-500' : 
                  queueHealth > 60 ? 'bg-amber-500' : 'bg-red-500');
          break;
          
        case 'response-time':
          const responseScore = Math.max(0, 100 - metrics.responseTime);
          setProgress(responseScore);
          setLabel('Velocidade de Resposta');
          setColor(responseScore > 70 ? 'bg-green-500' : 
                  responseScore > 40 ? 'bg-amber-500' : 'bg-red-500');
          break;
          
        case 'bot-efficiency':
          const efficiency = metrics.totalBots > 0 ? 
            (metrics.activeBots / metrics.totalBots) * 100 : 0;
          setProgress(efficiency);
          setLabel('Eficiência dos Bots');
          setColor(efficiency > 90 ? 'bg-green-500' : 
                  efficiency > 70 ? 'bg-amber-500' : 'bg-red-500');
          break;
      }
    };

    updateProgress();
    const removeListener = metricsService.addMetricsListener(updateProgress);
    const interval = setInterval(updateProgress, 10000);

    return () => {
      removeListener();
      clearInterval(interval);
    };
  }, [type]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-2';
      case 'lg': return 'h-6';
      default: return 'h-4';
    }
  };

  const getProgressClass = () => {
    if (progress <= 5) return 'progress-bar-5';
    if (progress <= 10) return 'progress-bar-10';
    if (progress <= 15) return 'progress-bar-15';
    if (progress <= 20) return 'progress-bar-20';
    if (progress <= 25) return 'progress-bar-25';
    if (progress <= 30) return 'progress-bar-30';
    if (progress <= 35) return 'progress-bar-35';
    if (progress <= 40) return 'progress-bar-40';
    if (progress <= 45) return 'progress-bar-45';
    if (progress <= 50) return 'progress-bar-50';
    if (progress <= 55) return 'progress-bar-55';
    if (progress <= 60) return 'progress-bar-60';
    if (progress <= 65) return 'progress-bar-65';
    if (progress <= 70) return 'progress-bar-70';
    if (progress <= 75) return 'progress-bar-75';
    if (progress <= 80) return 'progress-bar-80';
    if (progress <= 85) return 'progress-bar-85';
    if (progress <= 90) return 'progress-bar-90';
    if (progress <= 95) return 'progress-bar-95';
    return 'progress-bar-100';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {showPercentage && (
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className={cn(
        'w-full rounded-full bg-muted/30 overflow-hidden',
        getSizeClasses()
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            color,
            getProgressClass(),
            animated && 'animate-pulse'
          )}          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${Math.round(progress)}%`}
        />
      </div>
    </div>
  );
};

const RealCircularProgress: React.FC<RealCircularProgressProps> = ({
  type,
  className,
  size = 120,
  strokeWidth = 8,
  showValue = true
}) => {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#22c55e');

  useEffect(() => {
    const updateProgress = () => {
      const metrics = metricsService.calculateRealTimeMetrics();
      
      switch (type) {
        case 'satisfaction':
          setProgress(metrics.satisfaction);
          setLabel('Satisfação');
          setColor(metrics.satisfaction > 80 ? '#22c55e' : 
                  metrics.satisfaction > 60 ? '#f59e0b' : '#ef4444');
          break;
          
        case 'uptime':
          setProgress(metrics.uptime);
          setLabel('Uptime');
          setColor(metrics.uptime > 95 ? '#22c55e' : 
                  metrics.uptime > 90 ? '#f59e0b' : '#ef4444');
          break;
          
        case 'performance':
          const performance = (metrics.satisfaction + metrics.uptime) / 2;
          setProgress(performance);
          setLabel('Performance');
          setColor(performance > 80 ? '#22c55e' : 
                  performance > 60 ? '#f59e0b' : '#ef4444');
          break;
          
        case 'tickets-resolved':
          const resolvedPercentage = metrics.totalTickets > 0 ? 
            ((metrics.totalTickets - metrics.openTickets) / metrics.totalTickets) * 100 : 100;
          setProgress(resolvedPercentage);
          setLabel('Tickets Resolvidos');
          setColor(resolvedPercentage > 80 ? '#22c55e' : 
                  resolvedPercentage > 60 ? '#f59e0b' : '#ef4444');
          break;
      }
    };

    updateProgress();
    const removeListener = metricsService.addMetricsListener(updateProgress);
    const interval = setInterval(updateProgress, 15000);

    return () => {
      removeListener();
      clearInterval(interval);
    };
  }, [type]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/30"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {Math.round(progress)}%
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            {label}
          </span>
        </div>
      )}
    </div>
  );
};

export { RealProgressBar, RealCircularProgress };
