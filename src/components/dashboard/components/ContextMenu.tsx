import React from 'react';
import { Archive, Star } from 'lucide-react';
import { VolumeOffIcon, TrashIcon, XIcon, HeartIcon } from '../icons/ChatIcons';

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

interface ContextMenuProps {
  chat: Chat;
  x: number;
  y: number;
  onClose: () => void;
  onArchive: (chatId: string) => void;
  onMute: (duration: string) => void;
  onDelete: (chatId: string) => void;
  onClear: (chatId: string) => void;
  onPin: (chatId: string, isPinned: boolean) => void;
  onFavorite: (chatId: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  chat,
  x,
  y,
  onClose,
  onArchive,
  onMute,
  onDelete,
  onClear,
  onPin,
  onFavorite
}) => {
  const menuStyle = {
    '--menu-x': `${Math.max(8, Math.min(x, window.innerWidth - 240))}px`,
    '--menu-y': `${Math.max(8, Math.min(y, window.innerHeight - 220))}px`,
  } as React.CSSProperties;

  return (
    <div
      className="custom-context-menu context-menu-positioned"
      style={menuStyle}
      onClick={onClose}
    >
      <button 
        className="context-menu-item archive" 
        onClick={(e) => { 
          e.stopPropagation(); 
          onArchive(chat.id); 
          onClose(); 
        }}
      >
        <Archive className="h-4 w-4" /> Arquivar
      </button>
        <button 
        className="context-menu-item mute" 
        onClick={(e) => { 
          e.stopPropagation(); 
          onMute('8h'); // Default mute duration
        }}
      >
        <VolumeOffIcon className="h-4 w-4" /> 
        Silenciar
      </button>
      
      <button 
        className="context-menu-item delete" 
        onClick={(e) => { 
          e.stopPropagation(); 
          onDelete(chat.id); 
        }}
      >
        <TrashIcon className="h-4 w-4" /> 
        Apagar
      </button>
      
      <button 
        className="context-menu-item clear" 
        onClick={(e) => { 
          e.stopPropagation(); 
          onClear(chat.id); 
        }}
      >
        <XIcon className="h-4 w-4" /> 
        Limpar Conversa
      </button>
      
      <button 
        className="context-menu-item pin" 
        onClick={(e) => { 
          e.stopPropagation(); 
          onPin(chat.id, !chat.isPinned); 
        }}
      >
        <Star className="h-4 w-4" /> 
        {chat.isPinned ? 'Desafixar' : 'Fixar'}
      </button>
      
      <button 
        className="context-menu-item favorite" 
        onClick={(e) => { 
          e.stopPropagation(); 
          onFavorite(chat.id); 
        }}
      >
        <HeartIcon className="h-4 w-4" /> 
        {chat.isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
      </button>
    </div>
  );
};

export default ContextMenu;
