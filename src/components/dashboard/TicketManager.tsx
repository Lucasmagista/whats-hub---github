import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import VisuallyHidden from '@/components/ui/VisuallyHidden';
import { dataStore } from '@/store/dataStore';
import { 
  Ticket, 
  User, 
  Clock, 
  CheckCircle, 
  Plus, 
  Search, 
  Eye,
  AlertCircle,
  MessageSquare,
  Calendar,
  Tag,
  ArrowUpDown,
  Trash2
} from 'lucide-react';

// Reutilizando as interfaces e helpers de TicketManager para tipagem
interface TicketData {
  id: string;
  title: string;
  description?: string;
  customer: string;
  customerPhone?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
  createdAt: string; 
  lastUpdate: string; 
  category: string;
  assignedTo?: string;
  estimatedResolution?: string;
  tags?: string[];
}

interface NewTicketForm {
  title: string;
  description: string;
  customer: string;
  customerPhone: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string;
}

interface TicketCardProps {
  ticket: TicketData;
  onStatusChange: (id: string, newStatus: TicketData['status']) => void;
  onDeleteTicket: (id: string) => void;
  onViewDetails: (ticket: TicketData) => void;
}

// Helpers para cores e ícones (reutilizados ou centralizados)
const getPriorityColor = (priority: TicketData['priority']) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-red-50 text-red-700 border-red-200';
    case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'low': return 'bg-green-50 text-green-700 border-green-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusColor = (status: TicketData['status']) => {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getPriorityIcon = (priority: TicketData['priority']) => {
  switch (priority) {
    case 'urgent': return <AlertCircle className="h-3 w-3 text-red-600" />;
    case 'high': return <AlertCircle className="h-3 w-3 text-red-500" />;
    default: return null;
  }
};

// Helper para formatar a data de exibição
const formatDateForDisplay = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Agora mesmo';
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};


const TicketManager = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'lastUpdate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [newTicketForm, setNewTicketForm] = useState<NewTicketForm>({
    title: '',
    description: '',
    customer: '',
    customerPhone: '',
    priority: 'medium',
    category: '',
    tags: ''
  });

  const categories = ['Entrega', 'Financeiro', 'Suporte', 'Técnico', 'Produto', 'Geral'];

  // Carregar tickets do dataStore quando o componente for montado
  useEffect(() => {
    const loadTickets = () => {
      const storedTickets = dataStore.getTickets();
      setTickets(storedTickets);
    };

    loadTickets();
  }, []);

  const handleStatusChange = (ticketId: string, newStatus: TicketData['status']) => {
    const updatedTicket = dataStore.updateTicket(ticketId, { status: newStatus });
    if (updatedTicket) {
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? updatedTicket : ticket
      ));
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    const success = dataStore.deleteTicket(ticketId);
    if (success) {
      setTickets(tickets.filter(ticket => ticket.id !== ticketId));
    }
  };

  const handleCreateTicket = () => {
    const newTicket = dataStore.addTicket({
      title: newTicketForm.title,
      description: newTicketForm.description,
      customer: newTicketForm.customer,
      customerPhone: newTicketForm.customerPhone,
      priority: newTicketForm.priority,
      status: 'open',
      category: newTicketForm.category,
      tags: newTicketForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
    
    setTickets([newTicket, ...tickets]);
    setNewTicketForm({
      title: '',
      description: '',
      customer: '',
      customerPhone: '',
      priority: 'medium',
      category: '',
      tags: ''
    });
    setIsNewTicketOpen(false);
  };

  const filteredAndSortedTickets = useMemo(() => {
    const filtered = tickets.filter(ticket => {
      const matchesSearch = 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
      
      return matchesSearch && matchesPriority && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        }
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'lastUpdate':
          aValue = new Date(a.lastUpdate).getTime();
          bValue = new Date(b.lastUpdate).getTime();
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [tickets, searchTerm, priorityFilter, categoryFilter, sortBy, sortOrder]);

  const filterTickets = (status: string) => {
    if (status === 'all') return filteredAndSortedTickets;
    return filteredAndSortedTickets.filter(ticket => ticket.status === status);
  };

  const TicketCard: React.FC<TicketCardProps> = ({ ticket, onStatusChange, onDeleteTicket, onViewDetails }) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg hover:border-green-400 hover:shadow-sm transition-all duration-200 cursor-pointer ticket-card-compact">
        <div className="p-2">
          {/* Header com prioridade e status */}
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              {getPriorityIcon(ticket.priority)}
              <div className="flex items-center gap-1">
                <Badge 
                  className={`text-xs px-1.5 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}
                >
                  {ticket.priority.toUpperCase()}
                </Badge>
                {ticket.tags?.slice(0, 1).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5 rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {(() => {
                let statusLabel = '';
                if (ticket.status === 'in-progress') statusLabel = 'EM ANDAMENTO';
                else if (ticket.status === 'pending') statusLabel = 'PENDENTE';
                else if (ticket.status === 'resolved') statusLabel = 'RESOLVIDO';
                else if (ticket.status === 'closed') statusLabel = 'FECHADO';
                else statusLabel = 'ABERTO';
                return (
                  <Badge 
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getStatusColor(ticket.status)}`}
                  >
                    {statusLabel}
                  </Badge>
                );
              })()}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(ticket);
                }}
                className="h-5 w-5 p-0 hover:bg-gray-100"
              >
                <Eye className="h-2.5 w-2.5 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="space-y-1">
            <h3 className="font-medium text-gray-900 text-sm leading-tight">
              {ticket.title}
            </h3>
            
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <User className="h-2.5 w-2.5" />
                <span className="font-medium">{ticket.customer}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <span>ID: {ticket.id}</span>
                <span>•</span>
                <span>{ticket.category}</span>
              </div>
            </div>

            {ticket.description && (
              <p className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded border-l-2 border-gray-300 italic ticket-description">
                {ticket.description.length > 40 
                  ? `${ticket.description.substring(0, 40)}...` 
                  : ticket.description}
              </p>
            )}
          </div>

          {/* Footer com datas e ações */}
          <div className="mt-1.5 pt-1.5 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDateForDisplay(ticket.createdAt)}
                </span>
                {ticket.estimatedResolution && (
                  <span className="flex items-center gap-0.5 text-orange-600 bg-orange-50 px-1 py-0.5 rounded">
                    <Calendar className="h-2.5 w-2.5" />
                    {ticket.estimatedResolution}
                  </span>
                )}
              </div>
              
              <div className="flex gap-0.5">
                {/* Ações dinâmicas baseadas no status */}
                {ticket.status === 'open' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(ticket.id, 'in-progress');
                    }}
                    className="text-xs h-6 px-1.5 border-green-200 text-green-700 hover:bg-green-50"
                  >
                    Iniciar
                  </Button>
                )}
                
                {ticket.status === 'in-progress' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(ticket.id, 'resolved');
                    }}
                    className="text-xs h-6 px-1.5 border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                    Resolver
                  </Button>
                )}
                
                {ticket.status === 'pending' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(ticket.id, 'in-progress');
                    }}
                    className="text-xs h-6 px-1.5 border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    Retomar
                  </Button>
                )}
                
                {ticket.status === 'resolved' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(ticket.id, 'closed');
                    }}
                    className="text-xs h-6 px-1.5 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Fechar
                  </Button>
                )}
                
                {ticket.status === 'closed' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(ticket.id, 'open');
                    }}
                    className="text-xs h-6 px-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Reabrir
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Tem certeza que deseja excluir este ticket?')) {
                      onDeleteTicket(ticket.id);
                    }
                  }}
                  className="text-xs h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full shadow-sm ticket-manager-compact border-0 bg-background">
      <CardHeader className="pb-2 px-3 pt-3 card-header flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Ticket className="h-4 w-4 text-blue-600" />
            Gerenciamento de Tickets
          </CardTitle>
          
          <div className="flex items-center gap-3">
            {/* Estatísticas rápidas - mais compactas */}
            <div className="hidden lg:flex items-center gap-3 text-xs">
              <div className="text-center bg-red-50 px-2 py-1 rounded border">
                <div className="text-lg font-bold text-red-600">{filterTickets('open').length}</div>
                <div className="text-[10px] text-gray-500">Abertos</div>
              </div>
              <div className="text-center bg-purple-50 px-2 py-1 rounded border">
                <div className="text-lg font-bold text-purple-600">{filterTickets('in-progress').length}</div>
                <div className="text-[10px] text-gray-500">Andamento</div>
              </div>
              <div className="text-center bg-green-50 px-2 py-1 rounded border">
                <div className="text-lg font-bold text-green-600">{filterTickets('resolved').length}</div>
                <div className="text-[10px] text-gray-500">Resolvidos</div>
              </div>
            </div>
            
            {/* Ações rápidas */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setPriorityFilter('all');
                  setCategoryFilter('all');
                  setSortBy('createdAt');
                  setSortOrder('desc');
                }}
                className="text-xs h-7 px-2 border-gray-200 hover:bg-gray-50"
                title="Limpar filtros"
              >
                🔄
              </Button>

              <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-white h-7 px-2 text-xs">
                    <Plus className="h-3 w-3" />
                    Novo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <VisuallyHidden>
                    <DialogTitle>Novo Ticket</DialogTitle>
                    <DialogDescription>Formulário para criar um novo ticket de atendimento.</DialogDescription>
                  </VisuallyHidden>
                  <div className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h3 className="font-medium text-gray-900 mb-4">📝 Informações Básicas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-sm font-medium">Título do Problema *</Label>
                          <Input
                            id="title"
                            value={newTicketForm.title}
                            onChange={(e) => setNewTicketForm({...newTicketForm, title: e.target.value})}
                            placeholder="Ex: Cliente não recebeu o produto"
                            className="border-gray-200 focus:border-green-400 focus:ring-green-400"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm font-medium">Categoria *</Label>
                          <Select
                            value={newTicketForm.category}
                            onValueChange={(value) => setNewTicketForm({...newTicketForm, category: value})}
                          >
                            <SelectTrigger className="border-gray-200 focus:border-green-400">
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Entrega">📦 Entrega</SelectItem>
                              <SelectItem value="Financeiro">💰 Financeiro</SelectItem>
                              <SelectItem value="Suporte">🛠️ Suporte</SelectItem>
                              <SelectItem value="Técnico">⚙️ Técnico</SelectItem>
                              <SelectItem value="Produto">📱 Produto</SelectItem>
                              <SelectItem value="Geral">📋 Geral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="priority" className="text-sm font-medium">Prioridade</Label>
                          <Select
                            value={newTicketForm.priority}
                            onValueChange={(value: TicketData['priority']) => setNewTicketForm({...newTicketForm, priority: value})}
                          >
                            <SelectTrigger className="border-gray-200 focus:border-green-400">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">🟢 Baixa</SelectItem>
                              <SelectItem value="medium">🟡 Média</SelectItem>
                              <SelectItem value="high">🟠 Alta</SelectItem>
                              <SelectItem value="urgent">🔴 Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                          <Input
                            id="tags"
                            value={newTicketForm.tags}
                            onChange={(e) => setNewTicketForm({...newTicketForm, tags: e.target.value})}
                            placeholder="Ex: urgente, entrega, produto"
                            className="border-gray-200 focus:border-green-400 focus:ring-green-400"
                          />
                          <p className="text-xs text-gray-500">Separe as tags com vírgulas</p>
                        </div>
                      </div>
                    </div>

                    {/* Informações do Cliente */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-medium text-gray-900 mb-4">👤 Informações do Cliente</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer" className="text-sm font-medium">Nome do Cliente *</Label>
                          <Input
                            id="customer"
                            value={newTicketForm.customer}
                            onChange={(e) => setNewTicketForm({...newTicketForm, customer: e.target.value})}
                            placeholder="Ex: João Silva"
                            className="border-gray-200 focus:border-green-400 focus:ring-green-400 bg-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="customerPhone" className="text-sm font-medium">Telefone/WhatsApp</Label>
                          <Input
                            id="customerPhone"
                            value={newTicketForm.customerPhone}
                            onChange={(e) => setNewTicketForm({...newTicketForm, customerPhone: e.target.value})}
                            placeholder="+55 11 99999-9999"
                            className="border-gray-200 focus:border-green-400 focus:ring-green-400 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Descrição Detalhada */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">📄 Descrição Detalhada</Label>
                      <Textarea
                        id="description"
                        value={newTicketForm.description}
                        onChange={(e) => setNewTicketForm({...newTicketForm, description: e.target.value})}
                        placeholder="Descreva o problema em detalhes. Inclua informações como quando aconteceu, o que o cliente tentou fazer, mensagens de erro, etc."
                        rows={5}
                        className="border-gray-200 focus:border-green-400 focus:ring-green-400"
                      />
                      <p className="text-xs text-gray-500">
                        Quanto mais detalhes, melhor será o atendimento ao cliente
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsNewTicketOpen(false)}
                      className="border-gray-300"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateTicket}
                      disabled={!newTicketForm.title || !newTicketForm.customer || !newTicketForm.category}
                      className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Ticket
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        {/* Filtros e Busca - Compactos */}
        <div className="bg-gray-50 p-2 rounded-lg border">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  placeholder="Buscar por título, cliente, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-7 text-xs bg-white border-gray-200 focus:border-green-400 focus:ring-green-400"
                />
              </div>
            </div>
            
            <div className="flex gap-1 flex-wrap">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[100px] h-7 text-xs bg-white border-gray-200">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgent">🔴 Urgente</SelectItem>
                  <SelectItem value="high">🟠 Alta</SelectItem>
                  <SelectItem value="medium">🟡 Média</SelectItem>
                  <SelectItem value="low">🟢 Baixa</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[100px] h-7 text-xs bg-white border-gray-200">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: 'createdAt' | 'priority' | 'lastUpdate') => setSortBy(value)}>
                <SelectTrigger className="w-[120px] h-7 text-xs bg-white border-gray-200">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">📅 Data Criação</SelectItem>
                  <SelectItem value="lastUpdate">🔄 Última Atualização</SelectItem>
                  <SelectItem value="priority">⚡ Prioridade</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-7 px-2 text-xs bg-white border-gray-200 hover:bg-gray-50"
                title={`Ordenação ${sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}`}
              >
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Estatísticas rápidas */}
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredAndSortedTickets.length}</span> tickets encontrados
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-red-600">🔴 {filterTickets('open').length + filterTickets('pending').length} urgentes</span>
              <span className="text-purple-600">⏳ {filterTickets('in-progress').length} em andamento</span>
              <span className="text-green-600">✅ {filterTickets('resolved').length} resolvidos</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col card-content overflow-hidden">
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          <div className="px-3 pt-2 flex-shrink-0">
            <TabsList className="grid w-full grid-cols-6 bg-gray-100 p-1 rounded-lg h-8">
              <TabsTrigger 
                value="all" 
                className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm py-1 h-6"
              >
                Todos ({filteredAndSortedTickets.length})
              </TabsTrigger>
              <TabsTrigger 
                value="open"
                className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm py-1 h-6"
              >
                🔵 Abertos ({filterTickets('open').length})
              </TabsTrigger>
              <TabsTrigger 
                value="in-progress"
                className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm py-1 h-6"
              >
                🟣 Andamento ({filterTickets('in-progress').length})
              </TabsTrigger>
              <TabsTrigger 
                value="pending"
                className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm py-1 h-6"
              >
                🟠 Pendentes ({filterTickets('pending').length})
              </TabsTrigger>
              <TabsTrigger 
                value="resolved"
                className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm py-1 h-6"
              >
                🟢 Resolvidos ({filterTickets('resolved').length})
              </TabsTrigger>
              <TabsTrigger 
                value="closed"
                className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm py-1 h-6"
              >
                ⚫ Fechados ({filterTickets('closed').length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="px-3 pb-3 flex-1 flex flex-col min-h-0 overflow-hidden">
            <ScrollArea className="flex-1 mt-2 scroll-area custom-scroll overflow-y-auto"
              style={{
                height: 'calc(100vh - 300px)',
                maxHeight: 'calc(100vh - 300px)',
                minHeight: '200px'
              }}
            >
              <TabsContent value="all" className="space-y-2 mt-0 h-full">
                {filteredAndSortedTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-base font-medium mb-2">Nenhum ticket encontrado</p>
                    <p className="text-sm">
                      {tickets.length === 0 
                        ? 'Crie seu primeiro ticket usando o botão "Novo" acima'
                        : 'Tente ajustar os filtros ou criar um novo ticket'
                      }
                    </p>
                  </div>
                ) : (
                  filteredAndSortedTickets.map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket}
                      onStatusChange={handleStatusChange}
                      onDeleteTicket={handleDeleteTicket}
                      onViewDetails={(ticket) => {
                        setSelectedTicket(ticket);
                        setIsDetailsOpen(true);
                      }}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="open" className="space-y-2 mt-0 h-full">
                {filterTickets('open').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-3">🎉</div>
                    <p className="text-base font-medium">Nenhum ticket aberto!</p>
                    <p className="text-sm">Todos os tickets estão sendo atendidos</p>
                  </div>
                ) : (
                  filterTickets('open').map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket}
                      onStatusChange={handleStatusChange}
                      onDeleteTicket={handleDeleteTicket}
                      onViewDetails={(ticket) => {
                        setSelectedTicket(ticket);
                        setIsDetailsOpen(true);
                      }}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="in-progress" className="space-y-2 mt-0 h-full">
                {filterTickets('in-progress').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-3">💤</div>
                    <p className="text-base font-medium">Nenhum ticket em andamento</p>
                    <p className="text-sm">Comece a trabalhar em um ticket aberto</p>
                  </div>
                ) : (
                  filterTickets('in-progress').map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket}
                      onStatusChange={handleStatusChange}
                      onDeleteTicket={handleDeleteTicket}
                      onViewDetails={(ticket) => {
                        setSelectedTicket(ticket);
                        setIsDetailsOpen(true);
                      }}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="pending" className="space-y-2 mt-0 h-full">
                {filterTickets('pending').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-3">✨</div>
                    <p className="text-base font-medium">Nenhum ticket pendente</p>
                    <p className="text-sm">Ótimo! Nada esperando por atenção</p>
                  </div>
                ) : (
                  filterTickets('pending').map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket}
                      onStatusChange={handleStatusChange}
                      onDeleteTicket={handleDeleteTicket}
                      onViewDetails={(ticket) => {
                        setSelectedTicket(ticket);
                        setIsDetailsOpen(true);
                      }}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="resolved" className="space-y-2 mt-0 h-full">
                {filterTickets('resolved').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-3">🏁</div>
                    <p className="text-base font-medium">Nenhum ticket resolvido</p>
                    <p className="text-sm">Resolva alguns tickets para vê-los aqui</p>
                  </div>
                ) : (
                  filterTickets('resolved').map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket}
                      onStatusChange={handleStatusChange}
                      onDeleteTicket={handleDeleteTicket}
                      onViewDetails={(ticket) => {
                        setSelectedTicket(ticket);
                        setIsDetailsOpen(true);
                      }}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="closed" className="space-y-2 mt-0 h-full">
                {filterTickets('closed').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-3">📂</div>
                    <p className="text-base font-medium">Nenhum ticket fechado</p>
                    <p className="text-sm">Tickets finalizados aparecerão aqui</p>
                  </div>
                ) : (
                  filterTickets('closed').map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket}
                      onStatusChange={handleStatusChange}
                      onDeleteTicket={handleDeleteTicket}
                      onViewDetails={(ticket) => {
                        setSelectedTicket(ticket);
                        setIsDetailsOpen(true);
                      }}
                    />
                  ))
                )}
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </CardContent>

      {/* Modal de Detalhes do Ticket */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <VisuallyHidden>
            <DialogTitle>Detalhes do Ticket</DialogTitle>
            <DialogDescription>Modal com informações detalhadas do ticket selecionado.</DialogDescription>
          </VisuallyHidden>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-6 w-6 text-blue-600" />
                <span>Detalhes do Ticket</span>
              </div>
              {selectedTicket && (() => {
                let statusLabel = '';
                if (selectedTicket.status === 'in-progress') statusLabel = 'EM ANDAMENTO';
                else if (selectedTicket.status === 'pending') statusLabel = 'PENDENTE';
                else if (selectedTicket.status === 'resolved') statusLabel = 'RESOLVIDO';
                else if (selectedTicket.status === 'closed') statusLabel = 'FECHADO';
                else statusLabel = 'ABERTO';
                return (
                  <Badge className={getStatusColor(selectedTicket.status)} variant="outline">
                    {statusLabel}
                  </Badge>
                );
              })()}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6">
              {/* Header do Ticket */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      {getPriorityIcon(selectedTicket.priority)}
                      {selectedTicket.title}
                    </h2>
                    <div className="flex gap-2">
                      <Badge className={`text-xs ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority.toUpperCase()}
                      </Badge>
                      {selectedTicket.tags && selectedTicket.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium text-gray-700">
                      ID: {selectedTicket.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedTicket.category}
                    </div>
                  </div>
                </div>
                
                {selectedTicket.description && (
                  <div className="bg-white p-4 rounded border-l-4 border-blue-300">
                    <h4 className="font-medium text-gray-900 mb-2">Descrição:</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedTicket.description}</p>
                  </div>
                )}
              </div>

              {/* Informações do Cliente e Atribuição */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Informações do Cliente</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Nome:</span>
                        <span className="ml-2 text-gray-900">{selectedTicket.customer}</span>
                      </div>
                    </div>
                    
                    {selectedTicket.customerPhone && (
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="font-medium text-gray-700">Telefone:</span>
                          <span className="ml-2 text-blue-600 font-mono">{selectedTicket.customerPhone}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Categoria:</span>
                        <span className="ml-2 text-gray-900">{selectedTicket.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Informações do Ticket</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Criado em:</span>
                        <span className="ml-2 text-gray-900">{formatDateForDisplay(selectedTicket.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Última atualização:</span>
                        <span className="ml-2 text-gray-900">{formatDateForDisplay(selectedTicket.lastUpdate)}</span>
                      </div>
                    </div>
                    
                    {selectedTicket?.assignedTo && selectedTicket.assignedTo.length > 0 && (
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <span className="font-medium text-gray-700">Atribuído a:</span>
                          <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {selectedTicket.assignedTo}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {selectedTicket.estimatedResolution && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <div>
                          <span className="font-medium text-gray-700">Previsão de resolução:</span>
                          <span className="ml-2 text-orange-600 font-medium">{selectedTicket.estimatedResolution}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Ações do Ticket */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-4">Ações do Ticket</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedTicket.status === 'open' && (
                    <>
                      <Button 
                        onClick={() => {
                          handleStatusChange(selectedTicket.id, 'in-progress');
                          setIsDetailsOpen(false);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        🚀 Iniciar Trabalho
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          handleStatusChange(selectedTicket.id, 'pending');
                          setIsDetailsOpen(false);
                        }}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        ⏸️ Marcar como Pendente
                      </Button>
                    </>
                  )}
                  
                  {selectedTicket.status === 'in-progress' && (
                    <>
                      <Button 
                        onClick={() => {
                          handleStatusChange(selectedTicket.id, 'resolved');
                          setIsDetailsOpen(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        ✅ Resolver Ticket
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          handleStatusChange(selectedTicket.id, 'pending');
                          setIsDetailsOpen(false);
                        }}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        ⏸️ Pausar Trabalho
                      </Button>
                    </>
                  )}
                  
                  {selectedTicket.status === 'pending' && (
                    <Button 
                      onClick={() => {
                        handleStatusChange(selectedTicket.id, 'in-progress');
                        setIsDetailsOpen(false);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      ▶️ Retomar Trabalho
                    </Button>
                  )}
                  
                  {selectedTicket.status === 'resolved' && (
                    <>
                      <Button 
                        onClick={() => {
                          handleStatusChange(selectedTicket.id, 'closed');
                          setIsDetailsOpen(false);
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                      >
                        🔒 Fechar Ticket
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          handleStatusChange(selectedTicket.id, 'open');
                          setIsDetailsOpen(false);
                        }}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        🔄 Reabrir Ticket
                      </Button>
                    </>
                  )}
                  
                  {selectedTicket.status === 'closed' && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        handleStatusChange(selectedTicket.id, 'open');
                        setIsDetailsOpen(false);
                      }}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      🔄 Reabrir Ticket
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.')) {
                        handleDeleteTicket(selectedTicket.id);
                        setIsDetailsOpen(false);
                      }
                    }}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    🗑️ Excluir Ticket
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TicketManager;