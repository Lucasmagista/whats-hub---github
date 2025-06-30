import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScreenLockScreenProps {
  userName: string;
  userPhoto: string;
  onUnlock: (password: string) => Promise<boolean>;
}

export const ScreenLockScreen: React.FC<ScreenLockScreenProps> = ({
  userName,
  userPhoto,
  onUnlock
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);

  // Atualizar horário a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Gerenciar bloqueio temporário após muitas tentativas
  useEffect(() => {
    if (blockTimeLeft > 0) {
      const timer = setTimeout(() => {
        setBlockTimeLeft(blockTimeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isBlocked && blockTimeLeft === 0) {
      setIsBlocked(false);
      setAttempts(0);
    }
  }, [blockTimeLeft, isBlocked]);

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

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUnlock = async () => {
    if (isBlocked) return;

    if (!password.trim()) {
      setError('Digite a senha');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await onUnlock(password);
      
      if (success) {
        setPassword('');
        setAttempts(0);
        setError('');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError('Senha incorreta');
        setPassword('');

        // Bloquear após 5 tentativas por 30 segundos
        if (newAttempts >= 5) {
          setIsBlocked(true);
          setBlockTimeLeft(30);
          setError('Muitas tentativas incorretas. Tente novamente em 30 segundos.');
        }
      }    } catch (err) {
      console.error('Erro ao verificar senha:', err);
      setError('Erro ao verificar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isBlocked) {
      handleUnlock();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900"></div>
      
      {/* Overlay com padrão */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjEiPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+CjwvZz4KPC9nPgo8L3N2Zz4=')]"></div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 w-full max-w-md mx-auto p-8">
        {/* Cabeçalho com data e hora */}
        <div className="text-center mb-8 text-white">
          <div className="text-4xl font-light mb-2">
            {formatTime(currentTime)}
          </div>
          <div className="text-lg text-gray-300 capitalize">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Card de desbloqueio */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Avatar e nome do usuário */}
          <div className="text-center mb-6">
            <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-white/20">
              <AvatarImage src={userPhoto} />
              <AvatarFallback className="text-2xl bg-gray-600 text-white">
                {getUserInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-semibold text-white mb-1">
              {userName}
            </h2>
            <p className="text-gray-300">Digite sua senha para continuar</p>
          </div>

          {/* Campo de senha */}
          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua senha"
                disabled={isBlocked || isLoading}
                className={cn(
                  'pl-10 pr-12 py-3 bg-white/10 border-white/20 text-white placeholder-gray-400',
                  'focus:bg-white/20 focus:border-white/40',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  error && 'border-red-400 focus:border-red-400'
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isBlocked || isLoading}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Indicador de tentativas */}
            {attempts > 0 && !isBlocked && (
              <div className="text-yellow-400 text-sm text-center">
                {attempts}/5 tentativas incorretas
              </div>
            )}

            {/* Contador de bloqueio */}
            {isBlocked && (
              <div className="text-red-400 text-sm text-center">
                Aguarde {blockTimeLeft} segundos
              </div>
            )}

            {/* Botão de desbloqueio */}            <Button
              onClick={handleUnlock}
              disabled={isBlocked || isLoading || !password.trim()}
              className={cn(
                'w-full py-3 bg-blue-600 hover:bg-blue-700 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-200'
              )}
            >
              {(() => {
                if (isLoading) {
                  return (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verificando...
                    </div>
                  );
                }
                if (isBlocked) {
                  return `Bloqueado (${blockTimeLeft}s)`;
                }
                return 'Desbloquear';
              })()}
            </Button>
          </div>

          {/* Informação adicional */}
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>WhatsHub está bloqueado</p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Sistema de bloqueio ativo</p>
        </div>
      </div>
    </div>
  );
};
