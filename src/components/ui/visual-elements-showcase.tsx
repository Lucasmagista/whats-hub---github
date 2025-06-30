import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LoadingDots, LoadingSpinner, TypingIndicator, LoadingOverlay } from '@/components/ui/loading-animations';
import { AnimatedProgress, CircularProgress, SLAProgress, LoadingProgress } from '@/components/ui/progress-bars';
import { NotificationBadge, StatusBadge, PriorityBadge, LiveBadge, MetricBadge } from '@/components/ui/notification-badges';
import { AvatarWithInitials, AvatarGroup, BotAvatar, CustomerAvatar, AgentAvatar } from '@/components/ui/avatar-components';
import { GlassContainer, AnimatedGradient, HolographicCard, NeonBorder, GradientText } from '@/components/ui/glass-effects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Clock, TrendingUp, Bot, Phone, Mail, Settings } from 'lucide-react';

interface VisualElementsShowcaseProps {
  className?: string;
}

export const VisualElementsShowcase: React.FC<VisualElementsShowcaseProps> = ({ className }) => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    conversations: 47,
    activeUsers: 23,
    responseTime: 85,
    satisfaction: 94
  });

  // Simular dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        conversations: prev.conversations + Math.floor(Math.random() * 3),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 5) - 2),
        responseTime: Math.max(60, Math.min(100, prev.responseTime + Math.floor(Math.random() * 10) - 5)),
        satisfaction: Math.max(80, Math.min(100, prev.satisfaction + Math.floor(Math.random() * 4) - 2))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const simulatedUsers = [
    { name: 'Ana Silva', status: 'online' as const },
    { name: 'João Santos', status: 'away' as const },
    { name: 'Maria Oliveira', status: 'busy' as const },
    { name: 'Pedro Costa', status: 'offline' as const },
    { name: 'Clara Rocha', status: 'online' as const }
  ];

  return (
    <div className={cn("space-y-8 p-6", className)}>
      {/* Loading Overlay */}
      <LoadingOverlay isVisible={loading} message="Carregando elementos visuais..." />

      {/* Header com Gradient Text */}
      <div className="text-center space-y-4">
        <GradientText from="primary" to="secondary" className="text-4xl font-bold">
          Elementos Visuais da Dashboard
        </GradientText>
        <p className="text-muted-foreground">
          Demonstração dos componentes puramente visuais implementados
        </p>
      </div>

      {/* Grid de Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Conversations Card */}
        <GlassContainer variant="medium" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <NotificationBadge count={3} size="sm">
                <MessageCircle className="w-6 h-6 text-primary" />
              </NotificationBadge>
              <h3 className="font-semibold">Conversas</h3>
            </div>
            <StatusBadge status="online" />
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold">{metrics.conversations}</div>
            <AnimatedProgress value={metrics.conversations} max={100} color="primary" size="sm" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Meta: 50</span>
              <span>{metrics.conversations}/50</span>
            </div>
          </div>
        </GlassContainer>

        {/* Users Card */}
        <HolographicCard>
          <Card className="border-0 bg-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-6 h-6 text-blue-500" />
                <LiveBadge />
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{metrics.activeUsers}</div>
                <p className="text-sm text-muted-foreground">Usuários Online</p>
                <AvatarGroup users={simulatedUsers.slice(0, 3)} max={3} size="sm" />
              </div>
            </CardContent>
          </Card>
        </HolographicCard>

        {/* Response Time Card */}
        <NeonBorder color="warning" intensity="medium">
          <Card className="border-0 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-6 h-6 text-amber-500" />
                <PriorityBadge priority="medium" variant="dot" />
              </div>
              <div className="space-y-4">
                <div className="text-3xl font-bold">{metrics.responseTime}%</div>
                <CircularProgress 
                  value={metrics.responseTime} 
                  size={80} 
                  color="warning"
                  strokeWidth={6}
                />
                <p className="text-sm text-muted-foreground text-center">
                  Tempo de Resposta
                </p>
              </div>
            </CardContent>
          </Card>
        </NeonBorder>

        {/* Satisfaction Card */}
        <AnimatedGradient className="rounded-xl p-1">
          <Card className="border-0 bg-background/90 backdrop-blur-sm h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <MetricBadge 
                  label="Trend" 
                  value="+2.3%" 
                  trend="up"
                  size="sm" 
                />
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{metrics.satisfaction}%</div>
                <AnimatedProgress 
                  value={metrics.satisfaction} 
                  color="success" 
                  size="md" 
                  showValue 
                  striped 
                />
                <p className="text-sm text-muted-foreground">
                  Satisfação dos Clientes
                </p>
              </div>
            </CardContent>
          </Card>
        </AnimatedGradient>
      </div>

      {/* Seção de Avatares e Status */}
      <GlassContainer variant="light" className="p-6">
        <h3 className="text-xl font-semibold mb-6">Usuários e Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Agentes */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">AGENTES</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AgentAvatar 
                  agentName="Carlos Silva" 
                  role="Supervisor"
                  status="online" 
                  workload={75}
                />
                <div>
                  <p className="font-medium">Carlos Silva</p>
                  <p className="text-xs text-muted-foreground">Supervisor</p>
                </div>
                <NotificationBadge count={5} size="sm" variant="warning" />
              </div>
              
              <div className="flex items-center gap-3">
                <AgentAvatar 
                  agentName="Ana Costa" 
                  role="Atendente"
                  status="busy" 
                  workload={92}
                />
                <div>
                  <p className="font-medium">Ana Costa</p>
                  <p className="text-xs text-muted-foreground">Atendente</p>
                </div>
                <NotificationBadge count={12} size="sm" variant="destructive" />
              </div>
            </div>
          </div>

          {/* Clientes */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">CLIENTES ATIVOS</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CustomerAvatar 
                  customerName="João Santos" 
                  phoneNumber="+55 11 99999-9999"
                  priority="high"
                />
                <div className="flex-1">
                  <p className="font-medium">João Santos</p>
                  <p className="text-xs text-muted-foreground">Último acesso: agora</p>
                </div>
                <TypingIndicator className="scale-75" />
              </div>
              
              <div className="flex items-center gap-3">
                <CustomerAvatar 
                  customerName="Maria Oliveira" 
                  phoneNumber="+55 11 88888-8888"
                  priority="urgent"
                />
                <div className="flex-1">
                  <p className="font-medium">Maria Oliveira</p>
                  <p className="text-xs text-muted-foreground">Último acesso: 2min</p>
                </div>
                <PriorityBadge priority="urgent" size="sm" />
              </div>
            </div>
          </div>

          {/* Bots */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">BOTS ATIVOS</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <BotAvatar 
                  botName="Atendimento Bot" 
                  isOnline 
                  isTyping
                />
                <div className="flex-1">
                  <p className="font-medium">Atendimento Bot</p>
                  <p className="text-xs text-muted-foreground">Processando 8 conversas</p>
                </div>
                <LoadingDots size="sm" color="primary" />
              </div>
              
              <div className="flex items-center gap-3">
                <BotAvatar 
                  botName="FAQ Bot" 
                  isOnline={false}
                />
                <div className="flex-1">
                  <p className="font-medium">FAQ Bot</p>
                  <p className="text-xs text-muted-foreground">Offline para manutenção</p>
                </div>
                <StatusBadge status="offline" showText />
              </div>
            </div>
          </div>
        </div>
      </GlassContainer>

      {/* Seção de SLA e Progresso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassContainer variant="medium" className="p-6">
          <h3 className="text-lg font-semibold mb-4">SLA e Métricas de Tempo</h3>
          <div className="space-y-6">
            <SLAProgress 
              timeRemaining={2340} 
              totalTime={3600} 
              urgent={false}
            />
            <SLAProgress 
              timeRemaining={180} 
              totalTime={1800} 
              urgent={true}
            />
            <SLAProgress 
              timeRemaining={900} 
              totalTime={1200} 
              urgent={false}
            />
          </div>
        </GlassContainer>

        <GlassContainer variant="medium" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sistema de Carregamento</h3>
          <div className="space-y-6">
            <LoadingProgress 
              message="Sincronizando conversas..." 
              progress={67}
            />
            <LoadingProgress 
              message="Processando dados em tempo real..."
            />
            <div className="flex items-center justify-center gap-4">
              <LoadingSpinner size="lg" color="primary" />
              <LoadingDots size="lg" color="secondary" />
            </div>
          </div>
        </GlassContainer>
      </div>

      {/* Controles */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={() => setLoading(true)}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
        >
          <LoadingSpinner size="sm" className="mr-2" />
          Simular Loading
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => setLoading(false)}
        >
          Parar Loading
        </Button>
      </div>
    </div>
  );
};
