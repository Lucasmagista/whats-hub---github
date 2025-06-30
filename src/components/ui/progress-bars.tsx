import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

// ============== ANIMATED PROGRESS BAR ==============
interface AnimatedProgressProps {
  value: number;
  max?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  color = 'primary',
  size = 'md',
  showValue = false,
  animated = true,
  striped = false,
  className
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  const percentage = Math.min((displayValue / max) * 100, 100);

  const colorClasses = {
    primary: 'bg-gradient-to-r from-primary to-primary/80',
    secondary: 'bg-gradient-to-r from-secondary to-secondary/80',
    success: 'bg-gradient-to-r from-green-500 to-green-400',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-400',
    danger: 'bg-gradient-to-r from-red-500 to-red-400'
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  };

  return (
    <div className={cn("w-full space-y-2", className)}>      <div className={cn(
        "relative overflow-hidden rounded-full bg-muted/30",
        sizeClasses[size]
      )}>
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-out",
            colorClasses[color],
            striped && "bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]",
            animated && striped && "animate-progress-stripes"
          )}
          data-width={percentage}
        />
        {showValue && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center text-xs font-medium",
            percentage > 50 ? "text-white" : "text-foreground"
          )}>
            {Math.round(displayValue)}{max === 100 ? '%' : `/${max}`}
          </div>
        )}
      </div>
    </div>
  );
};

// ============== CIRCULAR PROGRESS ==============
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  showValue = true,
  animated = true,
  className
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((displayValue / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-primary',
    secondary: 'stroke-secondary',
    success: 'stroke-green-500',
    warning: 'stroke-amber-500',
    danger: 'stroke-red-500'
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
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
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            colorClasses[color],
            animated && "transition-all duration-1000 ease-out"
          )}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold">
            {Math.round(displayValue)}{max === 100 ? '%' : `/${max}`}
          </span>
        </div>
      )}
    </div>
  );
};

// ============== SLA PROGRESS BAR ==============
interface SLAProgressProps {
  timeRemaining: number; // em segundos
  totalTime: number; // em segundos
  urgent?: boolean;
  className?: string;
}

export const SLAProgress: React.FC<SLAProgressProps> = ({
  timeRemaining,
  totalTime,
  urgent = false,
  className
}) => {
  const percentage = Math.max((timeRemaining / totalTime) * 100, 0);
  
  const getColor = () => {
    if (urgent || percentage < 20) return 'danger';
    if (percentage < 50) return 'warning';
    return 'success';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">SLA</span>
        <span className={cn(
          "font-medium",
          urgent ? "text-red-500" : 
          percentage < 50 ? "text-amber-500" : "text-green-500"
        )}>
          {formatTime(timeRemaining)}
        </span>
      </div>
      <AnimatedProgress
        value={percentage}
        color={getColor()}
        size="sm"
        striped={urgent}
        animated
      />
    </div>
  );
};

// ============== MULTI STEP PROGRESS ==============
interface MultiStepProgressProps {
  steps: string[];
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

export const MultiStepProgress: React.FC<MultiStepProgressProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
              index < currentStep || completedSteps.includes(index)
                ? "bg-primary text-primary-foreground"
                : index === currentStep
                ? "bg-primary/20 text-primary border-2 border-primary"
                : "bg-muted text-muted-foreground"
            )}>
              {completedSteps.includes(index) ? '✓' : index + 1}
            </div>
            <span className={cn(
              "text-xs mt-2 text-center",
              index <= currentStep ? "text-foreground" : "text-muted-foreground"
            )}>
              {step}
            </span>
          </div>
        ))}
      </div>
      <AnimatedProgress
        value={(currentStep / (steps.length - 1)) * 100}
        color="primary"
        size="sm"
        animated
      />
    </div>
  );
};

// ============== LOADING PROGRESS ==============
interface LoadingProgressProps {
  message?: string;
  progress?: number;
  className?: string;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  message = "Carregando...",
  progress,
  className
}) => {
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  useEffect(() => {
    if (progress === undefined) {
      // Simular progresso automático
      const timer = setInterval(() => {
        setSimulatedProgress(prev => {
          if (prev >= 100) return 0; // Reset para loop
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(timer);
    }
  }, [progress]);

  const displayProgress = progress !== undefined ? progress : simulatedProgress;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <AnimatedProgress
        value={displayProgress}
        color="primary"
        size="md"
        showValue
        animated
        striped
      />
    </div>
  );
};
