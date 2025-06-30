import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Eye, EyeOff, Lock, User, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/hooks/use-screen-lock';

interface LockScreenProps {
  userProfile: UserProfile;
  onUnlock: (password: string) => Promise<boolean>;
  isUnlocking?: boolean;
  error?: string;
  className?: string;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  userProfile,
  onUnlock,
  isUnlocking = false,
  error,
  className
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attempts, setAttempts] = useState(0);
  const [localError, setLocalError] = useState('');

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setLocalError('Digite sua senha');
      return;
    }

    setLocalError('');
    
    try {
      const success = await onUnlock(password);
      if (!success) {
        setAttempts(prev => prev + 1);
        setLocalError('Senha incorreta');
        setPassword('');
        
        // Aumentar delay após várias tentativas
        if (attempts >= 2) {
          setLocalError('Muitas tentativas. Aguarde 30 segundos...');
          setTimeout(() => {
            setLocalError('');
            setAttempts(0);
          }, 30000);
        }
      }    } catch {
      setLocalError('Erro ao desbloquear. Tente novamente.');
      setPassword('');
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const displayError = error || localError;

  return (
    <div className={cn(
      "fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
      className
    )}>
      {/* Background blur overlay */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-black/30" />
      
      {/* Main lock screen container */}
      <div className="relative z-10 w-full max-w-md mx-auto p-8">
        
        {/* Time and date display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-light text-white mb-2 tracking-wide">
            {formatTime(currentTime)}
          </div>
          <div className="text-lg text-white/70 capitalize">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* User profile section */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <Avatar className="w-24 h-24 border-4 border-white/20 shadow-2xl">              <AvatarImage 
                src={userProfile.photoUrl} 
                alt={userProfile.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-semibold">
                {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Lock icon overlay */}
            <div className="absolute -bottom-2 -right-2 bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-1">
            {userProfile.name}
          </h2>
          <p className="text-white/60 text-sm">
            Digite sua senha para desbloquear
          </p>
        </div>

        {/* Password input form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua senha"
              className="w-full h-14 px-4 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-blue-500/50 text-center text-lg"
              disabled={isUnlocking || (attempts >= 3)}
              autoFocus
            />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
              disabled={isUnlocking}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error message */}
          {displayError && (
            <div className="flex items-center gap-2 text-center text-red-400 text-sm bg-red-500/10 backdrop-blur-sm rounded-lg p-3 border border-red-500/20">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Unlock button */}
          <Button
            type="submit"
            disabled={isUnlocking || !password.trim() || (attempts >= 3)}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl border-0 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {isUnlocking ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Desbloqueando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span>Desbloquear</span>
              </div>
            )}
          </Button>
        </form>

        {/* Additional info */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
            <User className="w-3 h-3" />
            <span>WhatsApp Hub - Sistema Bloqueado</span>
          </div>
          
          {attempts > 0 && attempts < 3 && (
            <div className="mt-2 text-yellow-400 text-xs">
              Tentativas restantes: {3 - attempts}
            </div>
          )}
        </div>
      </div>      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse [animation-delay:4s]" />
      </div>
    </div>
  );
};
