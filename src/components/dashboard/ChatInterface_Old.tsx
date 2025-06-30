import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import QuickReplyTemplates from './QuickReplyTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import styles from './ChatInterface.module.css';
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import VisuallyHidden from '@/components/ui/VisuallyHidden';

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

  const availableTags = ['urgente', 'entrega', 'pagamento', 'técnico', 'devolução', 'vip', 'novo-cliente'];

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
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    // Simular bot typing
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleSelectTemplate = (content: string) => {
    setNewMessage(content);
    setShowTemplates(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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

  // Timer do SLA
  useEffect(() => {
    const timer = setInterval(() => {
      setSlaTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => { setShowSidePanel(!isMobile); }, [isMobile]);

  if (!selectedChat) {
    return null;
  }

  const slaStatus = getSlaStatus(slaTimer);

  // Extracted badge class for selectedChat.status
  let statusBadgeClass = '';
  if (selectedChat.status === 'active') {
    statusBadgeClass = 'bg-green-500/20 text-green-400';
  } else if (selectedChat.status === 'pending') {
    statusBadgeClass = 'bg-amber-500/20 text-amber-400';
  } else {
    statusBadgeClass = 'bg-slate-500/20 text-slate-400';
  }

  return (
    <div className={`h-full flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
      {/* Chat Principal */}
      <div className="flex-1 flex flex-col">
        <Card className="h-full flex flex-col glass-card border-0 overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-2 glass-effect min-h-[36px] p-3">
            <div className="flex items-center justify-between min-h-[28px]">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-xs">
                    {selectedChat.contact.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm gradient-text">{selectedChat.contact}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-[10px] px-2 py-0.5 ${statusBadgeClass}`}>
                      {selectedChat.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                    <Badge className={`text-[10px] px-2 py-0.5 ${slaStatus.color} bg-current/10`}>
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
                  className={`rounded-full glass-effect w-6 h-6 ${showTemplates ? 'bg-primary/20' : ''}`}
                >
                  <Zap className="h-3 w-3" />
                </Button>
                {[Phone, Video, Star, MoreVertical].map((Icon) => (
                  <Button 
                    key={Icon.displayName ?? Icon.name}
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full glass-effect w-6 h-6"
                  >
                    <Icon className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-primary/20"
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
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-3">
            <div className="flex-1 p-0 space-y-2 overflow-y-auto whatsapp-chat-bg">
              {messages.map((message, index) => {
                let messageBubbleClass = '';
                if (message.sender === 'user') {
                  messageBubbleClass = 'whatsapp-message-received';
                } else if (message.sender === 'bot') {
                  messageBubbleClass = 'glass-card mr-auto border border-accent/30 text-foreground';
                } else {
                  messageBubbleClass = 'whatsapp-message-sent';
                }
                return (
                  <div
                    key={message.id}
                    className={`flex bounce-in ${message.sender === 'user' ? 'justify-start' : 'justify-end'} animation-delay-${index}`}
                  >
                    <div className={`whatsapp-message-bubble smooth-transition max-w-[75%] ${messageBubbleClass}`}>
                      {message.sender === 'bot' && (
                        <div className="text-xs opacity-70 mb-2 font-medium flex items-center gap-2">
                          🤖 <span>Resposta Automática</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className={`text-xs mt-2 opacity-70 flex items-center gap-2 ${
                        message.sender === 'user' ? 'justify-start' : 'justify-end'
                      }`}>
                        <span>{message.timestamp}</span>
                        {message.sender === 'agent' && message.status && (
                          (() => {
                            let statusColor = '';
                            let statusIcon = '';
                            if (message.status === 'read') {
                              statusColor = 'text-blue-400';
                              statusIcon = '✓✓';
                            } else if (message.status === 'delivered') {
                              statusColor = 'text-green-400';
                              statusIcon = '✓✓';
                            } else {
                              statusColor = 'text-gray-400';
                              statusIcon = '✓';
                            }
                            return (
                              <span className={statusColor}>
                                {statusIcon}
                              </span>
                            );
                          })()
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="glass-card rounded-2xl px-6 py-4 mr-auto">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-end gap-2 mt-2">
              <Button variant="ghost" size="sm" className="rounded-full glass-effect shrink-0 w-8 h-8">
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="resize-none min-h-[36px] max-h-20 rounded-lg border-2 border-border/50 glass-effect focus:border-primary/50 smooth-transition text-sm"
                  rows={1}
                />
              </div>
              <Button variant="ghost" size="sm" className="rounded-full glass-effect shrink-0 w-8 h-8">
                <Smile className="h-4 w-4" />
              </Button>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="shrink-0 rounded-xl h-8 w-8 p-0 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl modern-button disabled:opacity-50">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Painel Lateral */}
      {isMobile ? (
        <>
          <button
            className="fixed bottom-4 right-4 z-50 bg-primary text-white rounded-full p-3 shadow-lg md:hidden"
            onClick={() => setShowSidePanel((v) => !v)}
          >
            {showSidePanel ? 'Fechar Detalhes' : 'Detalhes'}
          </button>
          {showSidePanel && (
            <div className="w-full max-w-full mt-2">
              <Card className="glass-card border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Informações do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* SLA Status */}
                  <div className="p-3 glass-effect rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Status do SLA</span>
                      <Badge className={`text-xs ${slaStatus.color} bg-current/10`}>
                        {slaStatus.status}
                      </Badge>
                    </div>
                    <div className="text-lg font-bold">{formatSlaTime(slaTimer)}</div>
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
                      className="glass-effect border-border/50 text-xs resize-none h-20"
                    />
                  </div>

                  {/* Tags Disponíveis */}
                  <div className="space-y-2">
                    <Label className="text-sm">Tags Disponíveis</Label>
                    <div className="flex flex-wrap gap-1">
                      {availableTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="text-xs cursor-pointer hover:bg-primary/20"
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
                      <div className="p-2 glass-effect rounded text-xs">
                        <div className="font-medium">Último pedido: #12345</div>
                        <div className="text-muted-foreground">R$ 299,90 - 15/06/2024</div>
                      </div>
                      <div className="p-2 glass-effect rounded text-xs">
                        <div className="font-medium">3 atendimentos este mês</div>
                        <div className="text-muted-foreground">Satisfação: 4.8/5</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      ) : (
        <div className="w-72 space-y-3">
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SLA Status */}
              <div className="p-3 glass-effect rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Status do SLA</span>
                  <Badge className={`text-xs ${slaStatus.color} bg-current/10`}>
                    {slaStatus.status}
                  </Badge>
                </div>
                <div className="text-lg font-bold">{formatSlaTime(slaTimer)}</div>
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
                  className="glass-effect border-border/50 text-xs resize-none h-20"
                />
              </div>

              {/* Tags Disponíveis */}
              <div className="space-y-2">
                <Label className="text-sm">Tags Disponíveis</Label>
                <div className="flex flex-wrap gap-1">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="text-xs cursor-pointer hover:bg-primary/20"
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
                  <div className="p-2 glass-effect rounded text-xs">
                    <div className="font-medium">Último pedido: #12345</div>
                    <div className="text-muted-foreground">R$ 299,90 - 15/06/2024</div>
                  </div>
                  <div className="p-2 glass-effect rounded text-xs">
                    <div className="font-medium">3 atendimentos este mês</div>
                    <div className="text-muted-foreground">Satisfação: 4.8/5</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
