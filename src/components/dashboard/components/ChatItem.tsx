import React, { memo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { chatUtils, cssUtils, CHAT_CONSTANTS } from '../utils/chatUtils';

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

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  index: number;
  onSelect: (chat: Chat) => void;
  onContextMenu: (e: React.MouseEvent, chat: Chat) => void;
}

const ChatItem = memo<ChatItemProps>(({ 
  chat, 
  isSelected, 
  index, 
  onSelect, 
  onContextMenu 
}) => {
  const statusConfig = cssUtils.status[chat.status] || cssUtils.status.default;
  const priorityConfig = cssUtils.priority[chat.priority || 'low'] || cssUtils.priority.default;
  const avatarRing = cssUtils.avatar.ring[chat.status] || cssUtils.avatar.ring.default;
  const statusDot = cssUtils.avatar.dot[chat.status] || cssUtils.avatar.dot.default;

  const handleClick = () => onSelect(chat);
  const handleContextMenu = (e: React.MouseEvent) => onContextMenu(e, chat);

  return (
    <div
      className={chatUtils.getOptimizedClasses(chat, isSelected, index)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="flex items-start gap-2">
        {/* Avatar Section */}
        <div className="relative flex-shrink-0">
          <Avatar className={`h-8 w-8 ring-2 ${avatarRing} modern-button shadow-lg`}>
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-xs">
              {chatUtils.getContactInitials(chat.contact)}
            </AvatarFallback>
          </Avatar>
          {chat.status === 'active' && (
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-card shadow-lg">
              <div className="w-full h-full rounded-full bg-green-400 animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Chat Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <h3 className="font-bold truncate text-foreground text-xs">
                {chat.contact}
              </h3>
              {chat.priority === 'high' && (
                <Star className="h-2.5 w-2.5 text-amber-400 flex-shrink-0 fill-current" />
              )}
              {chat.hasMedia && (
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge className={`text-[9px] px-1.5 py-0.5 ${statusConfig} modern-button font-medium`}>
                {chat.status}
              </Badge>
              {chat.unreadCount > 0 && (
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-[9px] min-w-[16px] h-4 flex items-center justify-center rounded-full shadow-lg modern-button font-bold">
                  {chatUtils.formatUnreadCount(chat.unreadCount)}
                </Badge>
              )}
            </div>
          </div>

          {/* Message */}
          <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1 leading-relaxed">
            {chat.lastMessage}
          </p>

          {/* Tags */}
          {chat.tags && chat.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {chat.tags.slice(0, CHAT_CONSTANTS.MAX_VISIBLE_TAGS).map((tag, tagIndex) => (
                <Badge
                  key={tagIndex}
                  className={`text-[10px] px-2 py-0.5 ${priorityConfig.bg} ${priorityConfig.color} border ${priorityConfig.border} font-medium`}
                >
                  {tag}
                </Badge>
              ))}
              {chat.tags.length > CHAT_CONSTANTS.MAX_VISIBLE_TAGS && (
                <Badge className="text-[10px] px-2 py-0.5 bg-muted/50 text-muted-foreground">
                  +{chat.tags.length - CHAT_CONSTANTS.MAX_VISIBLE_TAGS}
                </Badge>
              )}
            </div>
          )}

          {/* Footer Row */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] flex items-center gap-1 font-medium">
              {chat.timestamp}
            </span>
            <div className="flex items-center gap-2">
              {chat.slaTime && (
                <Badge 
                  className={`text-[10px] px-2 py-0.5 border ${
                    chatUtils.shouldShowSLAWarning(chat) 
                      ? 'bg-red-500/20 text-red-400 border-red-400/20 animate-pulse' 
                      : 'bg-amber-500/20 text-amber-400 border-amber-400/20'
                  }`}
                >
                  SLA: {chat.slaTime}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 ${statusDot} rounded-full shadow-sm`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ChatItem.displayName = 'ChatItem';

export default ChatItem;
