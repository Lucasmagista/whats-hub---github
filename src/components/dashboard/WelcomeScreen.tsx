import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedProgress, CircularProgress } from '@/components/ui/progress-bars';
import { StatusBadge, MetricBadge, LiveBadge } from '@/components/ui/notification-badges';
import { AvatarWithInitials, AvatarGroup } from '@/components/ui/avatar-components';
import { GlassContainer, AnimatedGradient, GradientText, HolographicCard } from '@/components/ui/glass-effects';
import { LoadingDots } from '@/components/ui/loading-animations';
import {
  MessageSquare,
  Bot,
  Users,
  TrendingUp,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  Rocket,
  Shield,
  Heart,
  Gift,
  Sparkles
} from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { metricsService } from '@/services/metricsService';
import { BotStatusIndicator, SystemStatusIndicator } from '@/components/ui/status-indicators';
import RealNotificationBadge from '@/components/ui/notification-badge';

interface WelcomeScreenProps {
  onStartChat: () => void;
  onOpenSettings: () => void; // Keeping this here in case it's used elsewhere
  isModal?: boolean; // Nova prop para determinar se está sendo usado em modal
}

// Define reusable types for data structures for better clarity and type safety
type Feature = {
  icon: React.ElementType; // Use React.ElementType for Lucide icons
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

type QuickStat = {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
};

type RecentUpdate = {
  title: string;
  description: string;
  badge: string;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat, onOpenSettings, isModal = false }) => {
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    totalChats: 0,
    openTickets: 0,
    queuedMessages: 0,
    avgResponseTime: 0,
    activeBots: 0,
    totalBots: 0
  });

  // Atualizar métricas em tempo real
  useEffect(() => {
    const updateMetrics = () => {
      const chats = dataStore.getChats();
      const tickets = dataStore.getTickets();
      const queueItems = dataStore.getQueueItems();
      const bots = dataStore.getBots();
      const metrics = metricsService.calculateRealTimeMetrics();
      
      setRealTimeMetrics({
        totalChats: chats.length,
        openTickets: tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'in-progress').length,
        queuedMessages: queueItems.filter(item => item.status === 'waiting' || item.status === 'processing').length,
        avgResponseTime: metrics.responseTime,
        activeBots: bots.filter(bot => bot.status === 'online').length,
        totalBots: bots.length
      });
    };

    // Atualizar imediatamente
    updateMetrics();

    // Configurar listener para mudanças
    const removeListener = metricsService.addMetricsListener(updateMetrics);

    // Atualizar a cada 30 segundos
    const interval = setInterval(updateMetrics, 30000);

    return () => {
      removeListener();
      clearInterval(interval);
    };
  }, []);

  // Obter dados reais do dataStore
  const chats = dataStore.getChats();
  const tickets = dataStore.getTickets();
  const queueItems = dataStore.getQueueItems();
  
  // Calcular estatísticas reais
  const totalChats = realTimeMetrics.totalChats;
  const openTickets = realTimeMetrics.openTickets;
  const queuedMessages = realTimeMetrics.queuedMessages;
  const avgResponseTime = realTimeMetrics.avgResponseTime;
  
  // Obter dados reais dos bots em vez de usuários simulados
  const bots = dataStore.getBots();
  const realBotStatus = bots.slice(0, 4).map(bot => ({
    name: bot.name,
    status: bot.status,
    id: bot.id
  }));
  
  // Se não há bots suficientes, adicionar placeholders
  const displayBots = [...realBotStatus];
  while (displayBots.length < 4) {
    displayBots.push({
      name: `Bot ${displayBots.length + 1}`,
      status: 'offline' as const,
      id: `placeholder-${displayBots.length}`
    });
  }
  
  // Data for features section
  const features: Feature[] = [
    {
      icon: Bot,
      title: 'IA Avançada',
      description: 'Bot inteligente com processamento natural de linguagem',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      icon: MessageSquare,
      title: 'Múltiplos Canais',
      description: 'WhatsApp, Telegram, Facebook Messenger e mais',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      icon: TrendingUp,
      title: 'Analytics em Tempo Real',
      description: 'Métricas detalhadas e relatórios automatizados',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Criptografia end-to-end e conformidade LGPD',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    {
      icon: Zap,
      title: 'Automação Inteligente',
      description: 'Fluxos personalizados e respostas automáticas',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      icon: Users,
      title: 'Gestão de Equipe',
      description: 'Múltiplos operadores e permissões granulares',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  // Data for quick statistics dashboard - usando dados reais
  const quickStats: QuickStat[] = [
    { 
      label: 'Conversas Ativas', 
      value: totalChats > 0 ? totalChats.toString() : '0', 
      icon: MessageSquare, 
      color: 'text-primary' 
    },
    { 
      label: 'Tickets Abertos', 
      value: openTickets.toString(), 
      icon: Star, 
      color: 'text-amber-500' 
    },
    { 
      label: 'Tempo Resposta', 
      value: avgResponseTime > 0 ? `${avgResponseTime}s` : 'N/A', 
      icon: Clock, 
      color: 'text-green-500' 
    },
    { 
      label: 'Fila de Mensagens', 
      value: queuedMessages.toString(), 
      icon: Target, 
      color: 'text-blue-500' 
    }
  ];

  // Data for recent updates section - informações reais do sistema
  const recentUpdates: RecentUpdate[] = [
    { 
      title: realTimeMetrics.totalBots > 0 ? `${realTimeMetrics.activeBots}/${realTimeMetrics.totalBots} Bots Ativos` : 'Sistema Iniciado', 
      description: realTimeMetrics.totalBots > 0 ? 
        `${realTimeMetrics.activeBots} bots operacionais de ${realTimeMetrics.totalBots} configurados` : 
        'Dashboard pronto para uso', 
      badge: realTimeMetrics.activeBots === realTimeMetrics.totalBots && realTimeMetrics.totalBots > 0 ? 'Ativo' : 'Configurar' 
    },
    { 
      title: totalChats > 0 ? `${totalChats} Conversas` : 'WhatsApp Integration', 
      description: totalChats > 0 ? 
        `${totalChats} conversas registradas no sistema` : 
        'Configure o seu bot para começar', 
      badge: totalChats > 0 ? 'Ativo' : 'Configurar' 
    },
    { 
      title: openTickets > 0 ? `${openTickets} Tickets Pendentes` : 'Sistema de Tickets', 
      description: openTickets > 0 ? 
        `${openTickets} tickets aguardando atendimento` : 
        'Sistema de suporte ativo e funcionando', 
      badge: openTickets > 5 ? 'Atenção' : openTickets > 0 ? 'Normal' : 'OK' 
    }
  ];

  return (
    // Usar classes condicionais baseadas em se é modal ou não
    <main className={`${isModal ? 'w-full h-full' : 'w-screen h-screen min-h-screen min-w-screen'} overflow-y-auto ${isModal ? '' : 'bg-background'}`}>
      <div className={`max-w-6xl w-full mx-auto ${isModal ? 'px-4 py-4' : 'px-4 py-8'} ${isModal ? 'space-y-4' : 'space-y-6'}`}>
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className={`${isModal ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-16 h-16 sm:w-20 sm:h-20'} glass-card rounded-2xl flex items-center justify-center modern-button shadow-xl`}>
                <Bot className={`${isModal ? 'h-6 w-6 sm:h-8 sm:w-8' : 'h-8 w-8 sm:h-10 sm:w-10'} text-primary`} />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2 px-2">
            <h1 className={`${isModal ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-bold gradient-text`}>
              Bem-vindo a Dashboard da Inaugura Lar
            </h1>
            <p className={`${isModal ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'} text-muted-foreground max-w-2xl mx-auto leading-relaxed`}>
              A plataforma mais avançada para automação de atendimento no WhatsApp.
              Transforme seu atendimento com IA, analytics e integração total.
              <br />
              by{' '}
                <a
                href="https://lucasmagista.carrd.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:from-secondary hover:to-primary transition-colors duration-200 underline underline-offset-4 decoration-2"
                >
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                Japaxr
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </a>
            </p>
          </div>
          <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center ${isModal ? 'pt-1' : 'pt-2'}`}>
            <Button
              onClick={onStartChat}
              size={isModal ? "default" : "lg"}
              className={`bg-gradient-to-r from-primary to-secondary text-white modern-button ${isModal ? 'h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm' : 'h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base'} shadow-xl hover:shadow-2xl`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Iniciar Nova Conversa
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>

        {/* Quick Stats */}
        <section>
          <Card className="glass-card border-0 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Dashboard Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {quickStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-effect p-3 rounded-xl modern-button hover:scale-105 transition-all duration-300 relative"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      <div className="flex items-center gap-2">
                        {/* Badge de notificação real baseado no tipo */}
                        {stat.label === 'Conversas Ativas' && (
                          <RealNotificationBadge type="conversations" variant="success" className="scale-75" />
                        )}
                        {stat.label === 'Tickets Abertos' && (
                          <RealNotificationBadge type="tickets" variant="warning" className="scale-75" />
                        )}
                        {stat.label === 'Fila de Mensagens' && (
                          <RealNotificationBadge type="queue" variant="default" className="scale-75" />
                        )}
                        <Badge className="bg-primary/10 text-primary px-2 py-0.5 text-xs">Live</Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Features */}
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Recursos Principais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className={`flex items-start gap-3 p-3 glass-effect rounded-lg modern-button border ${feature.borderColor}`}
                  >
                    <div className={`w-8 h-8 ${feature.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className={`h-4 w-4 ${feature.color}`} />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status dos Bots - REAL */}
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Status dos Bots
                </div>
                <RealNotificationBadge type="alerts" variant="warning" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Status Geral do Sistema */}
                <SystemStatusIndicator showDetails className="w-full" />
                
                {/* Lista de Bots Individuais */}
                <div className="space-y-2">
                  {displayBots.map((bot) => (
                    <div
                      key={bot.id}
                      className="flex items-center justify-between p-2 glass-effect rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <BotStatusIndicator 
                          botId={bot.id.startsWith('placeholder') ? undefined : bot.id}
                          size="sm" 
                          variant="dot" 
                        />
                        <div>
                          <p className="text-sm font-medium">{bot.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {bot.status === 'online' ? 'Online' : 
                             bot.status === 'connecting' ? 'Conectando' : 
                             bot.status === 'error' ? 'Erro' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      {!bot.id.startsWith('placeholder') && (
                        <Badge 
                          className={`text-xs px-2 py-0.5 ${
                            bot.status === 'online' ? 'bg-green-500/20 text-green-400' : 
                            bot.status === 'error' ? 'bg-red-500/20 text-red-400' : 
                            'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {bot.status === 'online' ? 'Ativo' : 
                           bot.status === 'error' ? 'Erro' : 'Inativo'}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                
                {realTimeMetrics.totalBots === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum bot configurado</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={onOpenSettings}>
                      Configurar Bot
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Updates */}
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Atualizações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentUpdates.map((update) => (
                  <div
                    key={update.title}
                    className="flex items-start gap-3 p-3 glass-effect rounded-lg modern-button"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-foreground text-sm">{update.title}</h3>
                        <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-1.5 py-0.5 text-xs">
                          {update.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {update.description}
                      </p>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full glass-effect border-border/50 modern-button h-8 text-xs"
                >
                  Ver Todas as Atualizações
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section>
          <Card className="glass-card border-0 overflow-hidden bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center modern-button">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg sm:text-xl font-bold gradient-text">
                    Pronto para revolucionar seu atendimento?
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm">
                    Configure seu bot em poucos minutos e comece a automatizar conversas,
                    gerar leads e aumentar a satisfação dos seus clientes.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={onStartChat}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary text-white modern-button h-8 sm:h-10 px-4 sm:px-6 shadow-lg text-xs sm:text-sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Começar Agora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default WelcomeScreen;