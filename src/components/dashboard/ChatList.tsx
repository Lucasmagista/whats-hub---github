import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Search, Settings, Archive, MoreVertical, BarChart2, Star } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import MetricsModal from './MetricsModal';
import { VolumeOffIcon, TrashIcon, XIcon, HeartIcon } from './icons/ChatIcons';
import ContextMenu from './components/ContextMenu';
import { dataStore } from '@/store/dataStore';

interface Chat {
  id: string;
  contact: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  botId: string;
  status: 'active' | 'pending' | 'closed';
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  slaTime?: string;
  isPinned?: boolean; 
  hasMedia?: boolean;
  isFavorite?: boolean;
}

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
  onOpenSettings?: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onChatSelect, selectedChatId, onOpenSettings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [archivedChats, setArchivedChats] = useState<Chat[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);

  // Carregar chats do dataStore ao montar o componente
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = () => {
    const storedChats = dataStore.getChats();
    setChats(storedChats);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': 
        return { 
          color: 'bg-gradient-to-r from-primary to-green-400 text-white shadow-md',
          dot: 'bg-green-400',
          ring: 'ring-green-400/30'
        };
      case 'pending': 
        return { 
          color: 'bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-md',
          dot: 'bg-amber-400',
          ring: 'ring-amber-400/30'
        };
      case 'closed': 
        return { 
          color: 'bg-gradient-to-r from-slate-500 to-slate-400 text-white shadow-md',
          dot: 'bg-slate-400',
          ring: 'ring-slate-400/30'
        };
      default: 
        return { 
          color: 'bg-muted text-muted-foreground',
          dot: 'bg-muted',
          ring: 'ring-muted/30'
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high': return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
      case 'medium': return { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
      case 'low': return { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
      default: return { color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-muted/20' };
    }
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          chat.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || chat.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    // Pinned chats first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then by sort criteria
    if (sortBy === 'priority') {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
             (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    }
    
    return 0; // Default to original order for 'recent'
  });

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = timestamp.toLowerCase();
    
    if (time.includes('min')) {
      return 'text-green-400';
    } else if (time.includes('h') && parseInt(time) <= 2) {
      return 'text-amber-400';
    } else {
      return 'text-muted-foreground';
    }
  };

  const archiveChat = (chatId: string) => {
    const chatToArchive = chats.find((c) => c.id === chatId);
    if (chatToArchive) {
      setArchivedChats((prev) => [...prev, chatToArchive]);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
    }
  };

  const unarchiveChat = (chatId: string) => {
    const chatToRestore = archivedChats.find((c) => c.id === chatId);
    if (chatToRestore) {
      setArchivedChats((prev) => prev.filter((c) => c.id !== chatId));
      setChats((prev) => [chatToRestore, ...prev]);
    }
  };

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; chat: Chat | null }>({ x: 0, y: 0, chat: null });
  const [muteModal, setMuteModal] = useState<{ open: boolean; chat: Chat | null }>({ open: false, chat: null });

  const handleContextMenu = (e: React.MouseEvent, chat: Chat) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, chat });
  };

  const handleMute = (duration: string) => {
    // Implementar lógica de silenciar (ex: adicionar campo mutedUntil ao chat)
    if (contextMenu.chat) {
      // Aqui você pode implementar a lógica real de silenciar
      console.log(`Silenciando conversa ${contextMenu.chat.contact} por ${duration}`);
    }
    setMuteModal({ open: false, chat: null });
    setContextMenu({ x: 0, y: 0, chat: null });
  };

  const handleDelete = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setArchivedChats((prev) => prev.filter((c) => c.id !== chatId));
    setContextMenu({ x: 0, y: 0, chat: null });
  };

  const handleClear = (chatId: string) => {
    setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, lastMessage: '', unreadCount: 0 } : c));
    setContextMenu({ x: 0, y: 0, chat: null });
  };

  const handlePin = (chatId: string, value: boolean) => {
    setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, isPinned: value } : c));
    setContextMenu({ x: 0, y: 0, chat: null });
  };

  const handleFavorite = (chatId: string) => {
    setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, isFavorite: !c.isFavorite } : c));
    setContextMenu({ x: 0, y: 0, chat: null });
  };

  return (
      <Card className={`glass-card border-0 overflow-hidden w-full h-[calc(100vh-64px)] min-h-[400px]`}>
        <CardHeader className="pb-2 border-b border-border/50 glass-effect p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 glass-card rounded-lg flex items-center justify-center modern-button">
                  <MessageSquare className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <span className="gradient-text text-sm font-bold">Conversas</span>
                  <div className="text-[10px] text-muted-foreground font-normal">
                    {filteredChats.length} de {chats.length} conversas
                  </div>
                </div>
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg modern-button glass-effect h-6 w-6 p-0"
                  title={archivedChats.length > 0 ? "Ver Arquivadas" : "Arquivar Conversa"}
                  onClick={() => {
                    if (archivedChats.length > 0) setShowArchived(true);
                    else if (selectedChatId) archiveChat(selectedChatId);
                  }}
                  disabled={!selectedChatId && archivedChats.length === 0}
                >
                  <Archive className="h-3 w-3" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-lg modern-button glass-effect h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onOpenSettings}>
                      <Settings className="h-4 w-4 mr-2" /> Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setMetricsOpen(true)}>
                      <BarChart2 className="h-4 w-4 mr-2" /> Ver Métricas
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {/* Enhanced Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas, contatos ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 glass-effect border-border/50 h-7 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="glass-effect border-border/50 h-7 rounded-lg text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-border/50">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="glass-effect border-border/50 h-7 rounded-lg text-xs">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-border/50">
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="glass-effect border-border/50 h-7 rounded-lg text-xs">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-border/50">
                    <SelectItem value="recent">Recentes</SelectItem>
                    <SelectItem value="priority">Prioridade</SelectItem>
                    <SelectItem value="name">Nome</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            {filteredChats.map((chat, index) => {
              const statusConfig = getStatusConfig(chat.status);
              const priorityConfig = getPriorityConfig(chat.priority ?? 'low');
              const isSelected = selectedChatId === chat.id;
              return (
                <button
                  key={chat.id}
                  type="button"
                  onContextMenu={(e) => handleContextMenu(e, chat)}
                  className={`relative p-2 cursor-pointer chat-item-hover border-b border-border/10 last:border-b-0 smooth-transition bounce-in text-left w-full ${
                    isSelected ? 'glass-card border-l-4 border-l-primary shadow-xl bg-primary/5 scale-[1.01]' : ''
                  } ${chat.isPinned ? 'bg-accent/5' : ''} chat-animation-delay-${index}`}
                  onClick={() => onChatSelect(chat)}
                >
                  <div className="flex items-start gap-2">
                    <div className="relative flex-shrink-0">
                      <Avatar className={`h-8 w-8 ring-2 ${statusConfig.ring} modern-button shadow-lg`}>
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-xs">
                          {chat.contact.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {chat.status === 'active' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-card shadow-lg">
                          <div className="w-full h-full rounded-full bg-green-400 animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <h3 className="font-bold truncate text-foreground text-xs">{chat.contact}</h3>
                          {chat.priority === 'high' && <Star className="h-2.5 w-2.5 text-amber-400 flex-shrink-0 fill-current" />}
                          {chat.hasMedia && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge className={`text-[9px] px-1.5 py-0.5 ${statusConfig.color} modern-button font-medium`}>{chat.status}</Badge>
                          {chat.unreadCount > 0 && (
                            <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-[9px] min-w-[16px] h-4 flex items-center justify-center rounded-full shadow-lg modern-button font-bold">
                              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1 leading-relaxed">{chat.lastMessage}</p>
                      {chat.tags && chat.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {chat.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge
                              key={tag}
                              className={`text-[10px] px-2 py-0.5 ${priorityConfig.bg} ${priorityConfig.color} border ${priorityConfig.border} font-medium`}
                            >
                              {tag}
                            </Badge>
                          ))}
                          {chat.tags.length > 3 && (
                            <Badge className="text-[10px] px-2 py-0.5 bg-muted/50 text-muted-foreground">+{chat.tags.length - 3}</Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] flex items-center gap-1 font-medium">{chat.timestamp}</span>
                        <div className="flex items-center gap-2">
                          {chat.slaTime && (
                            <Badge className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 border border-amber-400/20">SLA: {chat.slaTime}</Badge>
                          )}
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 ${statusConfig.dot} rounded-full shadow-sm`}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredChats.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center mb-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-base text-foreground mb-1">Nenhuma conversa encontrada</h3>
                <p className="text-xs text-muted-foreground max-w-xs">Tente ajustar os filtros ou termo de busca para encontrar as conversas que você procura</p>
                <Button variant="outline" size="sm" className="mt-2 glass-effect h-7 px-3 text-xs" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPriorityFilter('all'); }}>Limpar Filtros</Button>
              </div>
            )}
          </div>
        </CardContent>
        {/* Modal de Métricas */}
        {metricsOpen && (
          <MetricsModal open={metricsOpen} onOpenChange={setMetricsOpen} />
        )}
        {/* Modal/Listagem de Conversas Arquivadas */}
        {showArchived && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button 
                className="absolute top-3 right-4 text-xl text-muted-foreground hover:text-primary transition-colors" 
                onClick={() => setShowArchived(false)}
              >
                &times;
              </button>
              <h2 className="font-bold text-2xl mb-6 flex items-center gap-3 gradient-text">
                <Archive className="h-6 w-6" /> Conversas Arquivadas
              </h2>
              {archivedChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Archive className="h-10 w-10 mb-2 opacity-60" />
                  <span className="font-medium text-lg">Nenhuma conversa arquivada.</span>
                  <span className="text-xs mt-1">Converse com seus clientes e arquive para organizar!</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {archivedChats.map((chat) => (
                    <div key={chat.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-all shadow-sm hover-scale-102">
                      <div>
                        <div className="font-semibold text-base text-foreground flex items-center gap-2">
                          {chat.contact}
                          {chat.priority === 'high' && <span className="ml-1 text-amber-400">★</span>}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{chat.lastMessage}</div>
                      </div>
                                            <Button 
                                              size="sm"
                                              variant="outline"
                                              className="ml-4"
                                              onClick={() => unarchiveChat(chat.id)}
                                            >
                                              Restaurar
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {/* Context Menu */}
                              {contextMenu.chat && (
                                <ContextMenu
                                  x={contextMenu.x}
                                  y={contextMenu.y}
                                  chat={contextMenu.chat}
                                  onClose={() => setContextMenu({ x: 0, y: 0, chat: null })}
                                  onMute={handleMute}
                                  onDelete={() => handleDelete(contextMenu.chat!.id)}
                                  onClear={() => handleClear(contextMenu.chat!.id)}
                                  onPin={(value) => handlePin(contextMenu.chat!.id, typeof value === 'boolean' ? value : value === 'true')}
                                  onFavorite={() => handleFavorite(contextMenu.chat!.id)}
                                  onArchive={() => archiveChat(contextMenu.chat!.id)}
                                />
                              )}
                            </Card>
                        );
                      };
                      
                      export default ChatList;
