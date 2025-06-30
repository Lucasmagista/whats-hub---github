import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Send, 
  User, 
  MoreVertical, 
  MessageSquare, 
  Phone, 
  Video, 
  Smile, 
  Paperclip,
  Clock,
  Star,
  Tag,
  FileText,
  History,
  AlertCircle,
  CheckCircle,
  Zap,
  Bookmark,
  RefreshCw
} from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'bot' | 'agent';
  type: 'text' | 'image' | 'file';
  status?: 'sent' | 'delivered' | 'read';
}

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
  notes?: string;
}

interface ChatInterfaceProps {
  selectedChat: Chat | null;
}

function updateMessageStatus(messages: Message[], messageId: string, newStatus: Message['status']): Message[] {
  return messages.map(msg =>
    msg.id === messageId ? { ...msg, status: newStatus } : msg
  );
}

function createUserResponseMessage(): Message {
  return {
    id: (Date.now() + 1).toString(),
    content: 'Obrigado pela resposta rápida!',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sender: 'user',
    type: 'text',
    status: 'read'
  };
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedChat }) => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá, preciso de ajuda com meu pedido #12345. Ele ainda não foi entregue.',
      timestamp: '10:30',
      sender: 'user',
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      content: 'Olá! Entendo sua preocupação. Vou verificar o status do seu pedido imediatamente.',
      timestamp: '10:31',
      sender: 'agent',
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      content: 'Encontrei seu pedido! Ele saiu para entrega hoje pela manhã e deve chegar até às 18h.',
      timestamp: '10:32',
      sender: 'agent',
      type: 'text',
      status: 'delivered'
    },
    {
      id: '4',
      content: 'Perfeito! Muito obrigado pelo atendimento rápido. Vou aguardar.',
      timestamp: '10:33',
      sender: 'user',
      type: 'text',
      status: 'read'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('Cliente VIP - Sempre muito educado. Histórico de compras excelente.');
  const [selectedTags, setSelectedTags] = useState<string[]>(['urgente', 'entrega']);
  const [showTemplates, setShowTemplates] = useState(false);
  const [slaTimer, setSlaTimer] = useState(847); // segundos restantes para SLA
  const [showSidePanel, setShowSidePanel] = useState(!isMobile);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const availableTags = ['urgente', 'entrega', 'pagamento', 'técnico', 'devolução', 'vip', 'novo-cliente'];

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'agent',
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simular status de entrega
    setTimeout(() => {
      setMessages(prev => updateMessageStatus(prev, message.id, 'delivered'));
    }, 1000);

    // Simular resposta do cliente
    setTimeout(() => {
      const userResponse: Message = createUserResponseMessage();
      setMessages(prev => [...prev, userResponse]);
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatSlaTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSlaStatus = (seconds: number) => {
    if (seconds > 600) return { color: 'text-green-400', status: 'Dentro do SLA' };
    if (seconds > 300) return { color: 'text-amber-400', status: 'Atenção' };
    return { color: 'text-red-400', status: 'SLA em Risco' };
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'Ativo';
      case 'pending': return 'Pendente';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };
  
  const getMessageStatusClass = (status?: string) => {
    if (status === 'read') return 'text-blue-200';
    if (status === 'delivered') return 'text-green-200';
    return 'text-gray-300';
  };
  
  const getMessageStatusSymbol = (status?: string) => {
    if (status === 'read' || status === 'delivered') return '✓✓';
    return '✓';
  };

  // Timer do SLA
  useEffect(() => {
    const timer = setInterval(() => {
      setSlaTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => { 
    setShowSidePanel(!isMobile); 
  }, [isMobile]);

  if (!selectedChat) {
    return (
      <div className="h-full flex items-center justify-center text-center glass-card border-0">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto glass-effect rounded-2xl flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg gradient-text">Selecione uma conversa</h3>
            <p className="text-muted-foreground text-sm">Escolha uma conversa da lista para começar a atender</p>
          </div>
        </div>
      </div>
    );
  }
  const slaStatus = getSlaStatus(slaTimer);

  return (
    <div className={`h-full flex ${isMobile ? 'flex-col' : 'gap-3'} overflow-hidden`}>
      {/* Chat Principal */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        <Card className="h-full flex flex-col glass-card border-0 overflow-hidden">
          {/* Header do Chat */}
          <CardHeader className="border-b border-border/50 pb-2 glass-effect flex-shrink-0 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-sm">
                    {selectedChat.contact.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base gradient-text">{selectedChat.contact}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      let badgeClass = 'bg-slate-500/20 text-slate-400 border border-slate-400/20';
                      if (selectedChat.status === 'active') {
                        badgeClass = 'bg-green-500/20 text-green-400 border border-green-400/20';
                      } else if (selectedChat.status === 'pending') {
                        badgeClass = 'bg-amber-500/20 text-amber-400 border border-amber-400/20';
                      }
                      return (
                        <Badge className={`text-[10px] px-2 py-0.5 ${badgeClass}`}>
                          {getStatusText(selectedChat.status)}
                        </Badge>
                      );
                    })()}
                    
                    {selectedChat.status === 'active' && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-muted-foreground">Online</span>
                      </div>
                    )}
                    
                    <Badge className={`text-[10px] px-2 py-0.5 ${slaStatus.color} bg-current/10 border border-current/20`}>
                      <Clock className="h-2.5 w-2.5 mr-1" />
                      SLA: {formatSlaTime(slaTimer)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className={`rounded-full glass-effect w-8 h-8 ${showTemplates ? 'bg-primary/20' : ''}`}
                >
                  <Zap className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm" className="rounded-full glass-effect w-8 h-8">
                  <Phone className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm" className="rounded-full glass-effect w-8 h-8">
                  <Video className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm" className="rounded-full glass-effect w-8 h-8">
                  <Star className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm" className="rounded-full glass-effect w-8 h-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedTags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs glass-effect"
                  onClick={() => {/* Adicionar nova tag */}}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  Adicionar Tag
                </Button>
              </div>
            )}
          </CardHeader>

          {/* Área de Mensagens - CORRIGIDA */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Container de mensagens com scroll */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 whatsapp-chat-bg custom-scrollbar">
              {messages.map((message, index) => {
                let bubbleClass = '';
                if (message.sender === 'user') {
                  bubbleClass = 'bg-card border border-border/20 text-foreground mr-auto';
                } else if (message.sender === 'bot') {
                  bubbleClass = 'bg-accent/30 border border-accent/40 text-foreground mr-auto';
                } else {
                  bubbleClass = 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ml-auto';
                }
                return (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'} animate-fadeIn message-animation-delay-${index}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 break-words shadow-lg ${bubbleClass}`}>
                      {message.sender === 'bot' && (
                        <div className="text-xs opacity-70 mb-2 font-medium flex items-center gap-2">
                          🤖 <span>Resposta Automática</span>
                        </div>
                      )}
                      
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      
                      <div className={`text-xs mt-2 opacity-70 flex items-center gap-2 ${
                        message.sender === 'user' ? 'justify-start' : 'justify-end'
                      }`}>
                        <span>{message.timestamp}</span>
                        {message.sender === 'agent' && message.status && (() => {
                          let statusClass = '';
                          if (message.status === 'read') {
                            statusClass = 'text-blue-200';
                          } else if (message.status === 'delivered') {
                            statusClass = 'text-green-200';
                          } else {
                            statusClass = 'text-gray-300';
                          }
                          let statusSymbol = '✓';
                          if (message.status === 'read' || message.status === 'delivered') {
                            statusSymbol = '✓✓';
                          }
                          return (
                            <span className={statusClass}>
                              {statusSymbol}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-card border border-border/20 rounded-2xl px-4 py-3 max-w-[85%]">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animation-delay-100ms"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animation-delay-200ms"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Elemento para auto-scroll */}
              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Área de Input - FIXA NA PARTE INFERIOR */}
            <div className="flex-shrink-0 border-t border-border/30 p-3 bg-card/95 backdrop-blur-sm">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="sm" className="rounded-full glass-effect shrink-0 w-10 h-10">
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="resize-none min-h-[42px] max-h-20 rounded-xl border-2 border-border/50 glass-effect focus:border-primary/50 transition-all text-sm"
                    rows={1}
                  />
                </div>
                
                <Button variant="ghost" size="sm" className="rounded-full glass-effect shrink-0 w-10 h-10">
                  <Smile className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim()} 
                  className="shrink-0 rounded-full h-10 w-10 p-0 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Painel Lateral */}
      {showSidePanel && !isMobile && (
        <div className="w-80 space-y-3">
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SLA Status */}
              <div className="p-4 glass-effect rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Status do SLA</span>
                  <Badge className={`text-xs ${slaStatus.color} bg-current/10`}>
                    {slaStatus.status}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{formatSlaTime(slaTimer)}</div>
                <div className="text-xs text-muted-foreground">restantes para resposta</div>
              </div>

              {/* Notas do Cliente */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Bookmark className="h-3 w-3" />
                  Notas Internas
                </Label>
                <Textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Adicionar notas sobre o cliente..."
                  className="glass-effect border-border/50 text-xs resize-none h-24"
                />
              </div>

              {/* Tags Disponíveis */}
              <div className="space-y-2">
                <Label className="text-sm">Tags Disponíveis</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Histórico */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <History className="h-3 w-3" />
                  Histórico Recente
                </Label>
                <div className="space-y-2">
                  <div className="p-3 glass-effect rounded-lg text-xs">
                    <div className="font-medium text-foreground">Último pedido: #12345</div>
                    <div className="text-muted-foreground">R$ 299,90 - 15/06/2024</div>
                  </div>
                  <div className="p-3 glass-effect rounded-lg text-xs">
                    <div className="font-medium text-foreground">3 atendimentos este mês</div>
                    <div className="text-muted-foreground">Satisfação: 4.8/5</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botão Mobile para painel lateral */}
      {isMobile && (
        <Button
          className="fixed bottom-20 right-4 z-50 glass-card shadow-lg"
          onClick={() => setShowSidePanel(!showSidePanel)}
        >
          <FileText className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ChatInterface;
