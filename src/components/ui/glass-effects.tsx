import React from 'react';
import { cn } from '@/lib/utils';

// ============== GLASS CONTAINER ==============
interface GlassContainerProps {
  children: React.ReactNode;
  variant?: 'light' | 'medium' | 'heavy' | 'frosted';
  className?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  gradient?: boolean;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  variant = 'medium',
  className,
  blur = 'md',
  gradient = false
}) => {
  const variantClasses = {
    light: 'bg-white/10 border-white/20',
    medium: 'bg-white/20 border-white/30',
    heavy: 'bg-white/30 border-white/40',
    frosted: 'bg-white/40 border-white/50'
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  return (
    <div
      className={cn(
        'border rounded-xl shadow-xl',
        variantClasses[variant],
        blurClasses[blur],
        gradient && 'bg-gradient-to-br from-white/30 via-white/20 to-white/10',
        className
      )}
    >
      {children}
    </div>
  );
};

// ============== GRADIENT CONTAINER ==============
interface GradientContainerProps {
  children: React.ReactNode;
  direction?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl';
  from: string;
  via?: string;
  to: string;
  className?: string;
}

export const GradientContainer: React.FC<GradientContainerProps> = ({
  children,
  direction = 'to-br',
  from,
  via,
  to,
  className
}) => {
  const gradientClass = via 
    ? `bg-gradient-${direction} from-${from} via-${via} to-${to}`
    : `bg-gradient-${direction} from-${from} to-${to}`;

  return (
    <div className={cn(gradientClass, className)}>
      {children}
    </div>
  );
};

// ============== ANIMATED GRADIENT ==============
interface AnimatedGradientProps {
  children: React.ReactNode;
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

export const AnimatedGradient: React.FC<AnimatedGradientProps> = ({
  children,
  className,
  speed = 'normal'
}) => {
  const speedClasses = {
    slow: 'animate-gradient-slow',
    normal: 'animate-gradient',
    fast: 'animate-gradient-fast'
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_200%]',
        speedClasses[speed],
        className
      )}
    >
      {children}
    </div>
  );
};

// ============== HOLOGRAPHIC EFFECT ==============
interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'strong';
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  className,
  intensity = 'medium'
}) => {
  const intensityClasses = {
    light: 'before:opacity-30',
    medium: 'before:opacity-50',
    strong: 'before:opacity-70'
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
        intensityClasses[intensity],
        className
      )}
    >
      {children}
    </div>
  );
};

// ============== MESH GRADIENT ==============
interface MeshGradientProps {
  children?: React.ReactNode;
  className?: string;
  colors?: string[];
  animated?: boolean;
}

export const MeshGradient: React.FC<MeshGradientProps> = ({
  children,
  className,
  colors = ['primary', 'secondary', 'accent'],
  animated = true
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20',
        animated && 'animate-mesh-gradient',
        className
      )}
    >
      {/* Mesh overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-primary/40 to-transparent rounded-full blur-xl animate-float" />
        <div className="absolute top-1/3 right-0 w-40 h-40 bg-gradient-radial from-secondary/40 to-transparent rounded-full blur-xl animate-float-delayed" />
        <div className="absolute bottom-0 left-1/3 w-36 h-36 bg-gradient-radial from-accent/40 to-transparent rounded-full blur-xl animate-float-slow" />
      </div>
      {children}
    </div>
  );
};

// ============== NEON BORDER ==============
interface NeonBorderProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  intensity?: 'light' | 'medium' | 'strong';
  animated?: boolean;
  className?: string;
}

export const NeonBorder: React.FC<NeonBorderProps> = ({
  children,
  color = 'primary',
  intensity = 'medium',
  animated = false,
  className
}) => {
  const colorClasses = {
    primary: 'shadow-primary/50 border-primary/50',
    secondary: 'shadow-secondary/50 border-secondary/50',
    success: 'shadow-green-500/50 border-green-500/50',
    warning: 'shadow-amber-500/50 border-amber-500/50',
    danger: 'shadow-red-500/50 border-red-500/50'
  };

  const intensityClasses = {
    light: 'shadow-md',
    medium: 'shadow-lg',
    strong: 'shadow-2xl'
  };

  return (
    <div
      className={cn(
        'border rounded-xl',
        colorClasses[color],
        intensityClasses[intensity],
        animated && 'animate-neon-pulse',
        className
      )}
    >
      {children}
    </div>
  );
};

// ============== AURORA BACKGROUND ==============
interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Aurora effect */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-400/30 via-purple-500/30 to-pink-500/30 animate-aurora-1" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-green-400/30 via-blue-500/30 to-purple-500/30 animate-aurora-2" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400/30 via-red-500/30 to-pink-500/30 animate-aurora-3" />
      </div>
      {children}
    </div>
  );
};

// ============== FROSTED GLASS MODAL ==============
interface FrostedGlassModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

export const FrostedGlassModal: React.FC<FrostedGlassModalProps> = ({
  children,
  isOpen,
  onClose,
  className
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <GlassContainer
        variant="frosted"
        blur="xl"
        className={cn('relative max-w-lg w-full m-4 p-6', className)}
      >
        {children}
      </GlassContainer>
    </div>
  );
};

// ============== GLASS NAVIGATION ==============
interface GlassNavProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export const GlassNav: React.FC<GlassNavProps> = ({
  children,
  className,
  sticky = true
}) => {
  return (
    <nav
      className={cn(
        'backdrop-blur-md bg-white/10 border-b border-white/20',
        sticky && 'sticky top-0 z-40',
        className
      )}
    >
      {children}
    </nav>
  );
};

// ============== GRADIENT TEXT ==============
interface GradientTextProps {
  children: React.ReactNode;
  from?: string;
  to?: string;
  via?: string;
  className?: string;
  animated?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  from = 'primary',
  to = 'secondary',
  via,
  className,
  animated = false
}) => {
  const gradientClass = via
    ? `bg-gradient-to-r from-${from} via-${via} to-${to}`
    : `bg-gradient-to-r from-${from} to-${to}`;

  return (
    <span
      className={cn(
        'bg-clip-text text-transparent',
        gradientClass,
        animated && 'animate-gradient-text',
        className
      )}
    >
      {children}
    </span>
  );
};

// ============== RIPPLE EFFECT ==============
interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  className,
  color = 'primary'
}) => {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

  const addRipple = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onClick={addRipple}
    >
      {children}      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className={cn(
            'absolute rounded-full animate-ripple pointer-events-none w-[30px] h-[30px]',
            `bg-${color}/30`
          )}
          data-x={ripple.x - 15}
          data-y={ripple.y - 15}
        />
      ))}
    </div>
  );
};
