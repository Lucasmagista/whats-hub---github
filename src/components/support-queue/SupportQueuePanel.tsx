/**
 * 👥 SupportQueuePanel - FASE 1 INTEGRAÇÃO
 * Componente para exibir e gerenciar fila de atendimento
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Phone,
  PhoneOff,
  UserCheck,
  UserX,
  Play,
  Pause,
  RotateCcw,
  Star,
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { SupportQueue, Attendant, QueueItem } from '@/services/n8nApiService';

interface SupportQueuePanelProps {
  queue: SupportQueue | null;
  currentAttendant?: Attendant | null;
  loading?: boolean;
  onStartChat?: (queueItemId: string) => void;
  onEndChat?: (chatId: string) => void;
  onTransferChat?: (chatId: string, attendantId: string) => void;
  onUpdateStatus?: (status: Attendant['status']) => void;
  onRegisterAttendant?: (data: any) => void;
  className?: string;
}

export const SupportQueuePanel: React.FC<SupportQueuePanelProps> = ({
  queue,
  currentAttendant,
  loading = false,
  onStartChat,
  onEndChat,
  onTransferChat,
  onUpdateStatus,
  onRegisterAttendant,
  className = ''
}) => {
  const [selectedTab, setSelectedTab] = useState('queue');

  // Função para renderizar prioridade
  const renderPriorityBadge = (priority: QueueItem['priority']) => {
    const config = {
      urgent: { color: 'bg-red-500', label: 'Urgente' },
      high: { color: 'bg-orange-500', label: 'Alta' },
      normal: { color: 'bg-blue-500', label: 'Normal' }
    };
    
    const { color, label } = config[priority];
    
    return (
      <Badge variant="secondary" className={`${color} text-white text-xs`}>
        {label}
      </Badge>
    );
  };

  // Função para renderizar status do atendente
  const renderAttendantStatus = (status: Attendant['status']) => {
    const config = {
      available: { icon: UserCheck, color: 'text-green-500', label: 'Disponível' },
      busy: { icon: MessageSquare, color: 'text-yellow-500', label: 'Ocupado' },
      offline: { icon: UserX, color: 'text-gray-400', label: 'Offline' }
    };
    
    const { icon: Icon, color, label } = config[status];
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="w-3 h-3" />
        <span className="text-xs">{label}</span>
      </div>
    );
  };

  // Função para calcular tempo de espera
  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 animate-pulse" />
            Fila de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!queue) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <UserX className="w-5 h-5" />
            Sistema de Atendimento Indisponível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os dados da fila de atendimento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Fila de Atendimento
          </div>
          <div className="flex items-center gap-2">
            {queue.workingHours && (
              <Badge variant={queue.workingHours.current ? 'default' : 'secondary'}>
                {queue.workingHours.current ? 'Horário Comercial' : 'Fora do Horário'}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="queue">
              Fila ({queue.totalInQueue})
            </TabsTrigger>
            <TabsTrigger value="attendants">
              Atendentes ({queue.attendants.length})
            </TabsTrigger>
            <TabsTrigger value="metrics">
              Métricas
            </TabsTrigger>
          </TabsList>

          {/* ABA FILA */}
          <TabsContent value="queue" className="space-y-4">
            {/* Resumo da Fila */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-500">{queue.totalInQueue}</div>
                <div className="text-xs text-muted-foreground">Na Fila</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-500">{queue.activeChats}</div>
                <div className="text-xs text-muted-foreground">Ativos</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-500">
                  {formatWaitTime(queue.metrics.averageWaitTime)}
                </div>
                <div className="text-xs text-muted-foreground">Tempo Médio</div>
              </div>
            </div>

            {/* Lista da Fila */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {queue.queueItems.length > 0 ? (
                  queue.queueItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{item.customerName}</span>
                            {renderPriorityBadge(item.priority)}
                          </div>
                          <div className="text-xs text-muted-foreground">{item.topic}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Aguardando</div>
                          <div className="text-sm font-medium">
                            {formatWaitTime(item.waitTime)}
                          </div>
                        </div>
                        
                        {currentAttendant && onStartChat && (
                          <Button
                            size="sm"
                            onClick={() => onStartChat(item.id)}
                            disabled={currentAttendant.status !== 'available'}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Atender
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                    <p>Nenhum cliente na fila</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ABA ATENDENTES */}
          <TabsContent value="attendants" className="space-y-4">
            {/* Controle do Atendente Atual */}
            {currentAttendant && (
              <div className="p-4 border border-border rounded-lg bg-muted/20">
                <h4 className="font-medium mb-3">Meu Status</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{currentAttendant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{currentAttendant.name}</div>
                      {renderAttendantStatus(currentAttendant.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {onUpdateStatus && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus('available')}
                          disabled={currentAttendant.status === 'available'}
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Disponível
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus('busy')}
                          disabled={currentAttendant.status === 'busy'}
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          Ocupado
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus('offline')}
                          disabled={currentAttendant.status === 'offline'}
                        >
                          <PhoneOff className="w-3 h-3 mr-1" />
                          Offline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-3 text-center">
                  <div>
                    <div className="text-lg font-bold">{currentAttendant.activeChats}</div>
                    <div className="text-xs text-muted-foreground">Chats Ativos</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{currentAttendant.performance.totalChats}</div>
                    <div className="text-xs text-muted-foreground">Total Hoje</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {currentAttendant.performance.satisfaction.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Satisfação</div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Atendentes */}
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {queue.attendants.map((attendant) => (
                  <div
                    key={attendant.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{attendant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{attendant.name}</div>
                        {renderAttendantStatus(attendant.status)}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm">
                        {attendant.activeChats}/{attendant.maxChats}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Chats Ativos
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ABA MÉTRICAS */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Performance
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tempo de Resposta</span>
                    <span className="text-sm font-medium">
                      {formatWaitTime(queue.metrics.responseTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Satisfação</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {queue.metrics.satisfactionScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Chats Hoje</span>
                    <span className="text-sm font-medium">{queue.metrics.totalChatsToday}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tempo Real
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Atendentes Online</span>
                    <span className="text-sm font-medium text-green-500">
                      {queue.attendants.filter(a => a.status !== 'offline').length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Disponíveis</span>
                    <span className="text-sm font-medium text-blue-500">
                      {queue.attendants.filter(a => a.status === 'available').length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ocupados</span>
                    <span className="text-sm font-medium text-yellow-500">
                      {queue.attendants.filter(a => a.status === 'busy').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SupportQueuePanel;
