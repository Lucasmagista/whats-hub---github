import { useCallback, useMemo } from 'react';
import type { Chat } from '../ChatList';

export const useChatOptimizations = () => {
  // Memoized status configuration
  const getStatusConfig = useCallback((status: string) => {
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
  }, []);

  // Memoized priority configuration
  const getPriorityConfig = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
      case 'medium': return { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
      case 'low': return { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
      default: return { color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-muted/20' };
    }
  }, []);

  // Optimized chat filtering and sorting
  const getFilteredAndSortedChats = useCallback((
    chats: Chat[], 
    searchTerm: string, 
    statusFilter: string, 
    priorityFilter: string, 
    sortBy: string
  ) => {
    return chats.filter(chat => {
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
  }, []);

  // Optimized context menu positioning
  const getContextMenuPosition = useCallback((x: number, y: number) => {
    return {
      top: Math.max(8, Math.min(y, window.innerHeight - 220)),
      left: Math.max(8, Math.min(x, window.innerWidth - 240)),
    };
  }, []);

  // Optimized time color calculation
  const getTimeColor = useCallback((timestamp: string) => {
    const time = timestamp.toLowerCase();
    
    if (time.includes('min')) {
      return 'text-green-400';
    } else if (time.includes('h') && parseInt(time) <= 2) {
      return 'text-amber-400';
    } else {
      return 'text-muted-foreground';
    }
  }, []);

  return {
    getStatusConfig,
    getPriorityConfig,
    getFilteredAndSortedChats,
    getContextMenuPosition,
    getTimeColor,
  };
};
