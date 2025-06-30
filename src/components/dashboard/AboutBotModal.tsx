import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Shield, TrendingUp, Users, Info, CheckCircle, ExternalLink, Bot, Sparkles } from 'lucide-react';
import '../ui/draggable-modal.css';

interface AboutBotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botName?: string;
  botDescription?: string;
  botStatus?: 'online' | 'offline' | 'connecting';
  botVersion?: string;
  integrations?: string[];
}

const statusMap = {
  online: { label: 'Online', color: 'bg-green-500/20 text-green-700' },
  offline: { label: 'Offline', color: 'bg-red-500/20 text-red-700' },
  connecting: { label: 'Conectando', color: 'bg-yellow-400/20 text-yellow-700' },
};

const AboutBotModal: React.FC<AboutBotModalProps> = ({
  open,
  onOpenChange,
  botName = 'Zap Bot',
  botDescription = 'Bot inteligente para atendimento automatizado no WhatsApp.',
  botStatus = 'online',
  botVersion = '1.0.0',
  integrations = ['WhatsApp', 'Telegram', 'CRM', 'API'],
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, offsetX: 0, offsetY: 0, dragging: false });

  // Simulação de uptime e última atualização
  const uptime = '5 dias, 3 horas';
  const lastUpdate = '10/06/2025 14:32';
  const statusDetails = {
    online: 'O bot está ativo e operando normalmente.',
    offline: 'O bot está desligado. Verifique as configurações.',
    connecting: 'O bot está tentando conectar. Aguarde alguns instantes.'
  };

  // Handlers para drag
  const onMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      setDrag({
        ...drag,
        dragging: true,
        offsetX: e.clientX - drag.x,
        offsetY: e.clientY - drag.y
      });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (drag.dragging) {
      setDrag({ 
        ...drag, 
        x: e.clientX - drag.offsetX, 
        y: e.clientY - drag.offsetY 
      });
    }
  };

  const onMouseUp = () => {
    setDrag({ ...drag, dragging: false });
  };

  // Atualizar posição do modal via CSS custom properties
  useEffect(() => {
    if (modalRef.current && (drag.x !== 0 || drag.y !== 0)) {
      modalRef.current.style.setProperty('--modal-top', `${drag.y}px`);
      modalRef.current.style.setProperty('--modal-left', `${drag.x}px`);
      modalRef.current.style.setProperty('--modal-transform', 'none');
    }
  }, [drag.x, drag.y]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[99999] bg-background/80 backdrop-blur-sm modal-backdrop" />
      
      {/* Modal Container */}
      <div 
        className="fixed inset-0 z-[99999] pointer-events-none"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <div
          ref={modalRef}
          className={`
            rounded-lg shadow-2xl bg-background border border-border 
            fixed-modal modal-content-stable overflow-hidden pointer-events-auto
            ${drag.x === 0 && drag.y === 0 ? 'modal-centered' : 'modal-dragged-custom'}
          `}
          data-dragged={drag.x !== 0 || drag.y !== 0}
        >
          {/* Drag Handle */}
          <div
            className="cursor-move p-3 border-b border-border bg-muted rounded-t-lg select-none drag-handle flex items-center justify-between"
            onMouseDown={onMouseDown}
          >
            <span className="font-semibold flex items-center gap-2" id="about-bot-title">
              <Bot className="w-4 h-4" />
              Sobre o Bot
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
            >
              ×
            </Button>
          </div>
          
          {/* Modal Content */}
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <Card className="border-0 bg-transparent shadow-none w-full">
              <CardHeader className="flex flex-col items-center gap-2 pb-2">
                <div className="relative w-20 h-20 mb-2">
                  <div className="w-20 h-20 glass-card rounded-3xl flex items-center justify-center modern-button shadow-2xl">
                    <Bot className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold gradient-text text-center">{botName}</CardTitle>
                <Badge className={`mt-1 ${statusMap[botStatus].color}`}>{statusMap[botStatus].label}</Badge>
                <span className="text-xs text-muted-foreground mt-1">{statusDetails[botStatus]}</span>
              </CardHeader>
              <CardContent className="space-y-4 text-center px-2 sm:px-6">
                <p className="text-muted-foreground text-base leading-relaxed">{botDescription}</p>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    <Badge className="bg-primary/10 text-primary flex items-center gap-1">
                      <Zap className="h-4 w-4" /> Automação
                    </Badge>
                    <Badge className="bg-blue-500/10 text-blue-500 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" /> Análise
                    </Badge>
                    <Badge className="bg-red-500/10 text-red-500 flex items-center gap-1">
                      <Shield className="h-4 w-4" /> Segurança
                    </Badge>
                    <Badge className="bg-purple-500/10 text-purple-500 flex items-center gap-1">
                      <Users className="h-4 w-4" /> Equipe
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    {integrations.map((item) => (
                      <Badge key={item} className="bg-muted/30 text-muted-foreground text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="flex flex-col items-center bg-muted/10 rounded-xl p-2">
                    <span className="text-xs text-muted-foreground">Uptime</span>
                    <span className="font-mono text-sm text-primary">{uptime}</span>
                  </div>
                  <div className="flex flex-col items-center bg-muted/10 rounded-xl p-2">
                    <span className="text-xs text-muted-foreground">Última atualização</span>
                    <span className="font-mono text-sm text-primary">{lastUpdate}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Versão do Bot: {botVersion}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2 justify-center">
                  <a 
                    href="https://bot-zap-site.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                  >
                    Site Oficial <ExternalLink className="h-3 w-3" />
                  </a>
                  <a 
                    href="https://wa.me/5517992785352" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/10 text-green-700 text-xs font-medium hover:bg-green-500/20 transition"
                  >
                    WhatsApp Suporte <ExternalLink className="h-3 w-3" />
                  </a>
                  <a 
                    href="mailto:lucas.magista1@gmail.com" 
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-700 text-xs font-medium hover:bg-blue-500/20 transition"
                  >
                    E-mail Suporte <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="mt-4 bg-muted/10 rounded-xl p-3 flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">Precisa de ajuda ou quer saber mais?</span>
                  <a 
                    href="mailto:lucas.magista1@gmail.com" 
                    className="text-primary font-medium underline text-sm hover:text-secondary transition"
                  >
                    lucas.magista1@gmail.com
                  </a>
                </div>
                <Button 
                  onClick={() => onOpenChange(false)} 
                  className="mt-4 w-full modern-button bg-gradient-to-r from-primary to-secondary text-white" 
                  aria-label="Fechar modal Sobre o Bot"
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Fechar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutBotModal;
