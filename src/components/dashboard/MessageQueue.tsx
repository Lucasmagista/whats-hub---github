import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { dataStore } from '@/store/dataStore';
import { 
  Clock, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Filter,
  User,
  MessageSquare,
  ArrowUpDown,
  Play,
  AlertTriangle,
  CheckCheck,
  Timer,
  Users,
  TrendingUp,
  Zap
} from 'lucide-react';

interface QueueItem {
  id: string;
  customer: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  botId: string;
  waitTime: string;
  status: 'waiting' | 'processing' | 'escalated' | 'completed';
  category: string;
  customerPhone?: string;
  slaTime?: string;
  assignedTo?: string;
  createdAt: string;
}

const parseMinutes = (value?: string) => {
  if (!value) return 0;
  return parseInt(value.replace(/[^0-9]/g, ''));
};

const formatWaitTime = (waitTime: string) => {
  // Try to extract the number and unit, fallback to original string if parsing fails
  const match = waitTime.match(/(\d+)\s*(min|h|minutos|horas)?/i);
  if (!match) return waitTime;
  const value = match[1];
  const unit = match[2]?.toLowerCase();
  if (unit === 'h' || unit === 'horas') {
    return `${value}h`;
  }
  return `${value}min`;
};

const MessageQueue = () => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority' | 'waitTime'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSLAOnly, setShowSLAOnly] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Carregar itens da fila do dataStore quando o componente for montado
  useEffect(() => {
    const loadQueueItems = () => {
      const storedItems = dataStore.getQueueItems();
      setQueueItems(storedItems);
    };

    loadQueueItems();
  }, []);

  const isOverSLA = React.useCallback((item: QueueItem) => {
    if (!item.slaTime) return false;
    const slaMinutes = parseMinutes(item.slaTime);
    const waitMinutes = parseMinutes(item.waitTime);
    return waitMinutes > slaMinutes;
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    return queueItems
      .filter(item => {
        const matchesSearch = 
          item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        const matchesSLA = !showSLAOnly || isOverSLA(item);
        return matchesSearch && matchesPriority && matchesStatus && matchesCategory && matchesSLA;
      })
      .sort((a, b) => {
        let aValue: number, bValue: number;
        switch (sortBy) {
          case 'priority': {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            aValue = priorityOrder[a.priority];
            bValue = priorityOrder[b.priority];
            break;
          }
          case 'waitTime':
            aValue = parseMinutes(a.waitTime);
            bValue = parseMinutes(b.waitTime);
            break;
          case 'timestamp':
          default:
            aValue = new Date(`2024-06-13 ${a.timestamp}`).getTime();
            bValue = new Date(`2024-06-13 ${b.timestamp}`).getTime();
            break;
        }
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
  }, [queueItems, searchTerm, priorityFilter, statusFilter, categoryFilter, sortBy, sortOrder, showSLAOnly, isOverSLA]);

  const getFilteredCount = (status: string) => {
    if (status === 'all') return queueItems.length;
    return queueItems.filter(item => item.status === status).length;
  };

  const getUniqueCategories = () => {
    return [...new Set(queueItems.map(item => item.category))];
  };

  const getOverSLACount = () => {
    return queueItems.filter(item => isOverSLA(item)).length;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Timer className="h-4 w-4" />;
      case 'processing': return <Play className="h-4 w-4" />;
      case 'escalated': return <AlertTriangle className="h-4 w-4" />;
      case 'completed': return <CheckCheck className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-600';
      case 'processing': return 'text-blue-600';
      case 'escalated': return 'text-red-600';
      case 'completed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Suporte': return '🛠️';
      case 'Financeiro': return '💳';
      case 'Feedback': return '💬';
      case 'Pedidos': return '📦';
      case 'Cancelamento': return '❌';
      case 'Vendas': return '💼';
      default: return '📋';
    }
  };

  const handleProcessMessage = (itemId: string) => {
    const updatedItem = dataStore.updateQueueItem(itemId, { 
      status: 'processing',
      assignedTo: 'Atendente Disponível'
    });
    if (updatedItem) {
      setQueueItems(items => 
        items.map(item => 
          item.id === itemId ? updatedItem : item
        )
      );
    }
  };

  const handleEscalateMessage = (itemId: string) => {
    const updatedItem = dataStore.updateQueueItem(itemId, { 
      status: 'escalated',
      priority: 'urgent'
    });
    if (updatedItem) {
      setQueueItems(items => 
        items.map(item => 
          item.id === itemId ? updatedItem : item
        )
      );
    }
  };

  const handleCompleteMessage = (itemId: string) => {
    const updatedItem = dataStore.updateQueueItem(itemId, { 
      status: 'completed'
    });
    if (updatedItem) {
      setQueueItems(items => 
        items.map(item => 
          item.id === itemId ? updatedItem : item
        )
      );
    }
  };

  const playNotificationSound = () => {
    if (soundEnabled && 'Audio' in window) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2a2+/AeiYGLIDP8dqONwgZaL');
        audio.volume = 0.3;
        audio.play().catch((playError) => {
          console.warn('Não foi possível reproduzir o som de notificação', playError);
        });
      } catch (error) {
        console.warn('Não foi possível reproduzir o som de notificação', error);
      }
    }
  };

  const handleBulkAction = (action: 'process' | 'escalate' | 'complete' | 'remove') => {
    if (selectedItems.length === 0) return;
    
    selectedItems.forEach(itemId => {
      switch (action) {
        case 'process':
          dataStore.updateQueueItem(itemId, { 
            status: 'processing',
            assignedTo: 'Atendente Disponível'
          });
          break;
        case 'escalate':
          dataStore.updateQueueItem(itemId, { 
            status: 'escalated',
            priority: 'urgent'
          });
          break;
        case 'complete':
          dataStore.updateQueueItem(itemId, { 
            status: 'completed'
          });
          break;
        case 'remove':
          dataStore.removeQueueItem(itemId);
          break;
      }
    });

    // Atualizar o estado local
    if (action === 'remove') {
      setQueueItems(items => items.filter(item => !selectedItems.includes(item.id)));
    } else {
      // Recarregar os dados atualizados do dataStore
      const updatedItems = dataStore.getQueueItems();
      setQueueItems(updatedItems);
    }
    
    setSelectedItems([]);
    if (soundEnabled) playNotificationSound();
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllFiltered = () => {
    const allFilteredIds = filteredAndSortedItems.map(item => item.id);
    setSelectedItems(selectedItems.length === allFilteredIds.length ? [] : allFilteredIds);
  };

  // Simulação de atualização em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueItems(items => 
        items.map(item => {
          if (item.status === 'waiting' || item.status === 'processing') {
            const currentWait = parseInt(item.waitTime);
            return { ...item, waitTime: `${currentWait + 1} min` };
          }
          return item;
        })
      );
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  // Função para remover mensagem
  const handleRemoveMessage = (itemId: string) => {
    const success = dataStore.removeQueueItem(itemId);
    if (success) {
      setQueueItems(items => items.filter(item => item.id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  return (
    <Card className="h-full min-h-[400px] bg-zinc-900 border border-zinc-800 shadow-lg ticket-manager-compact" style={{background: 'none'}}>
      <CardHeader className="pb-2 px-3 pt-3 card-header flex-shrink-0 bg-zinc-950 border-b border-zinc-800 rounded-t-lg">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
            <Bell className="h-4 w-4 text-purple-400" />
            Fila de Mensagens
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Estatísticas rápidas */}
            <div className="hidden lg:flex items-center gap-3 text-xs">
              <div className="text-center bg-purple-900/60 px-2 py-1 rounded border border-purple-700 stats-badge">
                <div className="text-lg font-bold text-purple-300">{queueItems.length}</div>
                <div className="text-[10px] text-zinc-400">Total</div>
              </div>
              <div className="text-center bg-yellow-900/60 px-2 py-1 rounded border border-yellow-700 stats-badge">
                <div className="text-lg font-bold text-yellow-300">{getFilteredCount('waiting')}</div>
                <div className="text-[10px] text-zinc-400">Aguardando</div>
              </div>
              <div className="text-center bg-blue-900/60 px-2 py-1 rounded border border-blue-700 stats-badge">
                <div className="text-lg font-bold text-blue-300">{getFilteredCount('processing')}</div>
                <div className="text-[10px] text-zinc-400">Processando</div>
              </div>
              <div className="text-center bg-red-900/60 px-2 py-1 rounded border border-red-700 stats-badge">
                <div className="text-lg font-bold text-red-300">{getFilteredCount('escalated')}</div>
                <div className="text-[10px] text-zinc-400">Escalados</div>
              </div>
            </div>
            {/* Status da fila */}
            {(() => {
              let badgeColor = '';
              if (queueItems.length > 5) {
                badgeColor = 'bg-red-600';
              } else if (queueItems.length > 2) {
                badgeColor = 'bg-yellow-600';
              } else {
                badgeColor = 'bg-green-600';
              }
              return (
                <Badge className={`${badgeColor} text-white text-xs shadow-md border border-zinc-800`}>
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  {queueItems.length} na fila
                </Badge>
              );
            })()}
          </div>
        </div>
        {/* Filtros e Busca */}
        <div className="bg-zinc-800 p-2 rounded-lg border border-zinc-700 filter-section">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-zinc-400" />
                <Input
                  placeholder="Buscar por cliente, mensagem ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-7 text-xs bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-400 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[100px] h-7 text-xs bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgent">🔴 Urgente</SelectItem>
                  <SelectItem value="high">🟠 Alta</SelectItem>
                  <SelectItem value="medium">🟡 Média</SelectItem>
                  <SelectItem value="low">🟢 Baixa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[100px] h-7 text-xs bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="waiting">⏳ Aguardando</SelectItem>
                  <SelectItem value="processing">▶️ Processando</SelectItem>
                  <SelectItem value="escalated">⚠️ Escalado</SelectItem>
                  <SelectItem value="completed">✅ Concluído</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[100px] h-7 text-xs bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectItem value="all">Todas</SelectItem>
                  {getUniqueCategories().map(category => (
                    <SelectItem key={category} value={category}>
                      {getCategoryIcon(category)} {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: 'timestamp' | 'priority' | 'waitTime') => setSortBy(value)}>
                <SelectTrigger className="w-[120px] h-7 text-xs bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectItem value="timestamp">📅 Horário</SelectItem>
                  <SelectItem value="priority">⚡ Prioridade</SelectItem>
                  <SelectItem value="waitTime">⏱️ Tempo Espera</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-7 px-2 text-xs bg-zinc-900 border-zinc-700 text-zinc-100 hover:bg-zinc-800"
                title={`Ordenação ${sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}`}
              >
                <ArrowUpDown className="h-3 w-3" />
              </Button>
              <Button
                variant={showSLAOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSLAOnly(!showSLAOnly)}
                className={`h-7 px-2 text-xs ${showSLAOnly ? 'bg-orange-600 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-100 hover:bg-zinc-800'}`}
                title="Mostrar apenas mensagens fora do SLA"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                SLA
              </Button>
            </div>
          </div>
          {/* Estatísticas dos filtros */}
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-zinc-700">
            <div className="text-sm text-zinc-200">
              <span className="font-medium">{filteredAndSortedItems.length}</span> mensagens encontradas
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-red-400">🚨 {getOverSLACount()} fora do SLA</span>
              <span className="text-purple-300">⏳ {filteredAndSortedItems.filter(item => item.status === 'waiting').length} aguardando</span>
              {showSLAOnly && (
                <span className="text-orange-400 font-medium">📊 Filtro SLA ativo</span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col card-content overflow-hidden bg-zinc-900 rounded-b-lg">
        <div className="px-3 pb-3 flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Ações em lote */}
          {selectedItems.length > 0 && (
            <div className="flex gap-2 mb-2">
              <Button size="sm" onClick={() => handleBulkAction('process')} variant="outline" className="text-xs bg-zinc-800 border-zinc-700 text-zinc-100">Processar Selecionados</Button>
              <Button size="sm" onClick={() => handleBulkAction('escalate')} variant="outline" className="text-xs bg-zinc-800 border-zinc-700 text-zinc-100">Escalar Selecionados</Button>
              <Button size="sm" onClick={() => handleBulkAction('complete')} variant="outline" className="text-xs bg-zinc-800 border-zinc-700 text-zinc-100">Concluir Selecionados</Button>
              <Button size="sm" onClick={() => handleBulkAction('remove')} variant="destructive" className="text-xs">Remover Selecionados</Button>
              <Button size="sm" onClick={selectAllFiltered} variant="ghost" className="text-xs bg-zinc-800 text-zinc-100">{selectedItems.length === filteredAndSortedItems.length ? 'Limpar Seleção' : 'Selecionar Todos'}</Button>
            </div>
          )}
          <ScrollArea className="flex-1 mt-2 scroll-area custom-scroll overflow-y-auto message-queue-scroll-area"
            style={{
              height: 'calc(100vh - 300px)',
              maxHeight: 'calc(100vh - 300px)',
              minHeight: '200px'
            }}
          >
            <div className="space-y-3">
              {filteredAndSortedItems.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 empty-state">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-base font-medium mb-2">Nenhuma mensagem na fila</p>
                  <p className="text-sm">
                    {queueItems.length === 0 
                      ? 'A fila está vazia. Novas mensagens aparecerão aqui automaticamente.'
                      : 'Todas as mensagens foram processadas ou não há mensagens que correspondam aos filtros'
                    }
                  </p>
                </div>
              ) : (
                filteredAndSortedItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`bg-zinc-950 border rounded-lg shadow-md hover:border-purple-500 hover:shadow-lg transition-all duration-200 message-card ticket-card-compact ${
                      isOverSLA(item) ? 'border-red-500 bg-red-950/60' : 'border-zinc-800'
                    } ${item.priority === 'urgent' ? 'priority-urgent' : ''}`}
                  >
                    <div className="p-3">
                      {/* Checkbox de seleção e Header */}
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          aria-label="Selecionar mensagem"
                          className="mt-1 accent-purple-500 bg-zinc-900 border-zinc-700"
                        />
                        <div className="flex-1">
                          {/* Header original */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              <Avatar className="h-8 w-8 customer-avatar">
                                <AvatarFallback className="bg-purple-900 text-purple-300 font-medium text-xs">
                                  {item.customer.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-zinc-100 text-sm truncate">
                                    {item.customer}
                                  </h3>
                                  <Badge className={`text-xs px-1.5 py-0.5 ${getPriorityColor(item.priority)}`}> 
                                    {getPriorityIcon(item.priority)} {item.priority.toUpperCase()}
                                  </Badge>
                                  {isOverSLA(item) && (
                                    <Badge className="bg-red-600 text-white text-xs px-1.5 py-0.5">
                                      SLA
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                  <span className="flex items-center gap-1">
                                    <User className="h-2.5 w-2.5" />
                                    {item.customerPhone}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 category-indicator">
                                    {getCategoryIcon(item.category)} {item.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs px-2 py-1 status-indicator ${item.status === 'processing' ? 'processing' : ''} ${getStatusBadgeColor(item.status)}`}> 
                                {getStatusIcon(item.status)}
                                {(() => {
                                  let statusLabel = '';
                                  if (item.status === 'waiting') {
                                    statusLabel = 'Aguardando';
                                  } else if (item.status === 'processing') {
                                    statusLabel = 'Processando';
                                  } else if (item.status === 'escalated') {
                                    statusLabel = 'Escalado';
                                  } else {
                                    statusLabel = 'Concluído';
                                  }
                                  return (
                                    <span className="ml-1 capitalize">
                                      {statusLabel}
                                    </span>
                                  );
                                })()}
                              </Badge>
                            </div>
                          </div>
                          {/* Mensagem */}
                          <div className="mb-3">
                            <div className="message-content">
                              <p className="text-xs text-zinc-200 bg-zinc-900 p-2 rounded border-l-2 border-purple-700 leading-relaxed">
                                {item.message.length > 150 
                                  ? `${item.message.substring(0, 150)}...` 
                                  : item.message}
                              </p>
                            </div>
                          </div>
                          {/* Informações adicionais */}
                          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {item.timestamp}
                              </span>
                              <span className="flex items-center gap-1">
                                {(() => {
                                  let timerClass = '';
                                  if (isOverSLA(item)) {
                                    timerClass = 'text-red-400 wait-time-critical';
                                  } else if (parseInt(item.waitTime) > 5) {
                                    timerClass = 'wait-time-warning';
                                  }
                                  return (
                                    <Timer className={`h-2.5 w-2.5 ${timerClass}`} />
                                  );
                                })()}
                                {(() => {
                                  let waitTimeClass = '';
                                  if (isOverSLA(item)) {
                                    waitTimeClass = 'wait-time-critical text-red-400';
                                  } else if (parseInt(item.waitTime) > 5) {
                                    waitTimeClass = 'wait-time-warning text-yellow-400';
                                  }
                                  return (
                                    <span className={waitTimeClass}>
                                      {formatWaitTime(item.waitTime)}
                                    </span>
                                  );
                                })()}
                              </span>
                              {item.slaTime && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-2.5 w-2.5" />
                                  SLA: {item.slaTime}
                                </span>
                              )}
                            </div>
                            {item.assignedTo && (
                              <span className="flex items-center gap-1">
                                <Users className="h-2.5 w-2.5" />
                                {item.assignedTo}
                              </span>
                            )}
                          </div>
                          {/* Ações */}
                          <div className="flex gap-2 pt-2 border-t border-zinc-700 message-actions">
                            {item.status === 'waiting' && (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleProcessMessage(item.id)}
                                        className="text-xs h-6 px-2 border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-200"
                                      >
                                        <Play className="h-2.5 w-2.5 mr-1" />
                                        Processar
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Iniciar processamento da mensagem
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleEscalateMessage(item.id)}
                                        className="text-xs h-6 px-2 border-red-200 text-red-700 hover:bg-red-50 transition-all duration-200"
                                      >
                                        <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                                        Escalar
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Escalar para nível superior
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}
                            {item.status === 'processing' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleCompleteMessage(item.id)}
                                      className="text-xs h-6 px-2 bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
                                    >
                                      <CheckCheck className="h-2.5 w-2.5 mr-1" />
                                      Concluir
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Marcar como concluído
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {item.status === 'escalated' && (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleProcessMessage(item.id)}
                                        className="text-xs h-6 px-2 border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-200"
                                      >
                                        <Play className="h-2.5 w-2.5 mr-1" />
                                        Retomar
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Retomar processamento
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleCompleteMessage(item.id)}
                                        className="text-xs h-6 px-2 bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
                                      >
                                        <CheckCheck className="h-2.5 w-2.5 mr-1" />
                                        Resolver
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Resolver questão escalada
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}
                            {item.status === 'completed' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleRemoveMessage(item.id)}
                                      className="text-xs h-6 px-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                                    >
                                      <CheckCircle className="h-2.5 w-2.5 mr-1" />
                                      Remover
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Remover da fila
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageQueue;
