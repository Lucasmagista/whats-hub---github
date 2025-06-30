import type { Chat } from '../ChatList';

/**
 * Utility functions for chat operations
 */
export const chatUtils = {
  /**
   * Generate initials from contact name
   */
  getContactInitials: (contact: string): string => {
    return contact.split(' ').map(n => n[0]).join('').toUpperCase();
  },

  /**
   * Format unread count display
   */
  formatUnreadCount: (count: number): string => {
    return count > 99 ? '99+' : count.toString();
  },

  /**
   * Check if chat should show SLA warning
   */
  shouldShowSLAWarning: (chat: Chat): boolean => {
    if (!chat.slaTime || chat.status === 'closed') return false;
    
    const slaMinutes = parseInt(chat.slaTime.replace(/[^\d]/g, ''));
    return slaMinutes <= 5; // Show warning if SLA is 5 minutes or less
  },

  /**
   * Get chat urgency level
   */
  getChatUrgency: (chat: Chat): 'low' | 'medium' | 'high' => {
    if (chat.priority === 'high' || chatUtils.shouldShowSLAWarning(chat)) {
      return 'high';
    }
    if (chat.unreadCount > 5 || chat.priority === 'medium') {
      return 'medium';
    }
    return 'low';
  },

  /**
   * Check if chat is recently active
   */
  isRecentlyActive: (timestamp: string): boolean => {
    const time = timestamp.toLowerCase();
    return time.includes('min') || (time.includes('h') && parseInt(time) <= 1);
  },

  /**
   * Generate animation delay class
   */
  getAnimationDelay: (index: number): string => {
    const delay = Math.min(index * 50, 500); // Max 500ms delay
    return `animation-delay-${delay}ms`;
  },

  /**
   * Sanitize search term
   */
  sanitizeSearchTerm: (term: string): string => {
    return term.trim().toLowerCase().replace(/[^\w\s]/gi, '');
  },

  /**
   * Check if chat matches search criteria
   */
  matchesSearch: (chat: Chat, searchTerm: string): boolean => {
    const sanitizedTerm = chatUtils.sanitizeSearchTerm(searchTerm);
    if (!sanitizedTerm) return true;

    const searchableText = [
      chat.contact,
      chat.lastMessage,
      ...(chat.tags || [])
    ].join(' ').toLowerCase();

    return searchableText.includes(sanitizedTerm);
  },

  /**
   * Get performance optimized classes
   */
  getOptimizedClasses: (chat: Chat, isSelected: boolean, index: number): string => {
    const baseClasses = [
      'relative p-2 cursor-pointer chat-item-hover',
      'border-b border-border/10 last:border-b-0',
      'smooth-transition gpu-accelerated optimize-rendering'
    ];

    if (isSelected) {
      baseClasses.push(
        'glass-card border-l-4 border-l-primary',
        'shadow-xl bg-primary/5 scale-[1.01]'
      );
    }

    if (chat.isPinned) {
      baseClasses.push('bg-accent/5');
    }

    // Add staggered animation
    if (index < 10) { // Only animate first 10 items for performance
      baseClasses.push('bounce-in', `animation-delay-${index * 100}ms`);
    }

    return baseClasses.join(' ');
  }
};

/**
 * Constants for better maintainability
 */
export const CHAT_CONSTANTS = {
  MAX_VISIBLE_TAGS: 3,
  CONTEXT_MENU_WIDTH: 240,
  CONTEXT_MENU_HEIGHT: 220,
  SCROLL_THRESHOLD: 100,
  ANIMATION_DURATION: 200,
  SLA_WARNING_THRESHOLD: 5, // minutes
  MAX_ANIMATED_ITEMS: 10,
} as const;

/**
 * CSS class utilities
 */
export const cssUtils = {
  status: {
    active: 'bg-gradient-to-r from-primary to-green-400 text-white shadow-md',
    pending: 'bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-md',
    closed: 'bg-gradient-to-r from-slate-500 to-slate-400 text-white shadow-md',
    default: 'bg-muted text-muted-foreground'
  },
  
  priority: {
    high: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    medium: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    low: { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    default: { color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-muted/20' }
  },

  avatar: {
    ring: {
      active: 'ring-green-400/30',
      pending: 'ring-amber-400/30', 
      closed: 'ring-slate-400/30',
      default: 'ring-muted/30'
    },
    dot: {
      active: 'bg-green-400',
      pending: 'bg-amber-400',
      closed: 'bg-slate-400', 
      default: 'bg-muted'
    }
  }
} as const;
