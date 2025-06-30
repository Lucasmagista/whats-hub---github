import { Bot, Chat, Message, QueueItem, TicketData } from '@/types/global';

interface QuickReplyTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usageCount: number;
  lastUsed: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

class DataStore {
  private bots: Bot[] = [];
  private chats: Chat[] = [];
  private messages: Message[] = [];
  private queueItems: QueueItem[] = [];
  private tickets: TicketData[] = [];
  private quickReplyTemplates: QuickReplyTemplate[] = [];

  // Bot Management
  getBots(): Bot[] {
    return Array.isArray(this.bots) ? [...this.bots] : [];
  }

  addBot(bot: Omit<Bot, 'id' | 'createdAt' | 'status'>): Bot {
    const newBot: Bot = {
      ...bot,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      status: 'offline'
    };
    this.bots.push(newBot);
    this.saveToStorage();
    return newBot;
  }

  updateBot(id: string, updates: Partial<Bot>): Bot | null {
    const index = this.bots.findIndex(bot => bot.id === id);
    if (index === -1) return null;
    
    this.bots[index] = { ...this.bots[index], ...updates };
    this.saveToStorage();
    return this.bots[index];
  }

  deleteBot(id: string): boolean {
    const index = this.bots.findIndex(bot => bot.id === id);
    if (index === -1) return false;
    
    this.bots.splice(index, 1);
    // Also remove associated chats
    this.chats = this.chats.filter(chat => chat.botId !== id);
    this.saveToStorage();
    return true;
  }

  // Chat Management
  getChats(botId?: string): Chat[] {
    if (botId) {
      return this.chats.filter(chat => chat.botId === botId);
    }
    return Array.isArray(this.chats) ? [...this.chats] : [];
  }

  addChat(chat: Omit<Chat, 'id'>): Chat {
    const newChat: Chat = {
      ...chat,
      id: this.generateId()
    };
    this.chats.push(newChat);
    this.saveToStorage();
    return newChat;
  }

  updateChat(id: string, updates: Partial<Chat>): Chat | null {
    const index = this.chats.findIndex(chat => chat.id === id);
    if (index === -1) return null;
    
    this.chats[index] = { ...this.chats[index], ...updates };
    this.saveToStorage();
    return this.chats[index];
  }

  deleteChat(id: string): boolean {
    const index = this.chats.findIndex(chat => chat.id === id);
    if (index === -1) return false;
    
    this.chats.splice(index, 1);
    // Also remove associated messages
    this.messages = this.messages.filter(message => message.chatId !== id);
    this.saveToStorage();
    return true;
  }

  // Message Management
  getMessages(chatId: string): Message[] {
    return this.messages.filter(message => message.chatId === chatId);
  }

  addMessage(message: Omit<Message, 'id'>): Message {
    const newMessage: Message = {
      ...message,
      id: this.generateId()
    };
    this.messages.push(newMessage);
    
    // Update chat last message
    const chat = this.chats.find(c => c.id === message.chatId);
    if (chat) {
      this.updateChat(chat.id, {
        lastMessage: message.content,
        timestamp: message.timestamp,
        unreadCount: message.sender === 'user' ? chat.unreadCount + 1 : 0
      });
    }
    
    this.saveToStorage();
    return newMessage;
  }

  updateMessage(id: string, updates: Partial<Message>): Message | null {
    const index = this.messages.findIndex(message => message.id === id);
    if (index === -1) return null;
    
    this.messages[index] = { ...this.messages[index], ...updates };
    this.saveToStorage();
    return this.messages[index];
  }

  // Queue Management
  getQueueItems(botId?: string): QueueItem[] {
    if (botId) {
      return this.queueItems.filter(item => item.botId === botId);
    }
    return Array.isArray(this.queueItems) ? [...this.queueItems] : [];
  }

  addQueueItem(item: Omit<QueueItem, 'id'>): QueueItem {
    const newItem: QueueItem = {
      ...item,
      id: this.generateId()
    };
    this.queueItems.push(newItem);
    this.saveToStorage();
    return newItem;
  }

  updateQueueItem(id: string, updates: Partial<QueueItem>): QueueItem | null {
    const index = this.queueItems.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    this.queueItems[index] = { ...this.queueItems[index], ...updates };
    this.saveToStorage();
    return this.queueItems[index];
  }

  removeQueueItem(id: string): boolean {
    const index = this.queueItems.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.queueItems.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Ticket Management
  getTickets(): TicketData[] {
    return Array.isArray(this.tickets) ? [...this.tickets] : [];
  }

  addTicket(ticket: Omit<TicketData, 'id' | 'createdAt' | 'lastUpdate'>): TicketData {
    const newTicket: TicketData = {
      ...ticket,
      id: `TKT-${String(this.tickets.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };
    this.tickets.push(newTicket);
    this.saveToStorage();
    return newTicket;
  }

  updateTicket(id: string, updates: Partial<TicketData>): TicketData | null {
    const index = this.tickets.findIndex(ticket => ticket.id === id);
    if (index === -1) return null;
    
    this.tickets[index] = {
      ...this.tickets[index],
      ...updates,
      lastUpdate: new Date().toISOString()
    };
    this.saveToStorage();
    return this.tickets[index];
  }

  deleteTicket(id: string): boolean {
    const index = this.tickets.findIndex(ticket => ticket.id === id);
    if (index === -1) return false;
    
    this.tickets.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // QuickReplyTemplate Management
  getQuickReplyTemplates(): QuickReplyTemplate[] {
    return Array.isArray(this.quickReplyTemplates) ? [...this.quickReplyTemplates] : [];
  }

  addQuickReplyTemplate(template: Omit<QuickReplyTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed' | 'isFavorite'>): QuickReplyTemplate {
    const newTemplate: QuickReplyTemplate = {
      ...template,
      id: `tpl-${String(this.quickReplyTemplates.length + 1).padStart(3, '0')}`,
      usageCount: 0,
      lastUsed: '',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.quickReplyTemplates.push(newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  updateQuickReplyTemplate(id: string, updates: Partial<QuickReplyTemplate>): QuickReplyTemplate | null {
    const index = this.quickReplyTemplates.findIndex(template => template.id === id);
    if (index === -1) return null;
    
    this.quickReplyTemplates[index] = {
      ...this.quickReplyTemplates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage();
    return this.quickReplyTemplates[index];
  }

  deleteQuickReplyTemplate(id: string): boolean {
    const index = this.quickReplyTemplates.findIndex(template => template.id === id);
    if (index === -1) return false;
    
    this.quickReplyTemplates.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  useQuickReplyTemplate(id: string): QuickReplyTemplate | null {
    const template = this.quickReplyTemplates.find(t => t.id === id);
    if (!template) return null;
    
    return this.updateQuickReplyTemplate(id, {
      usageCount: template.usageCount + 1,
      lastUsed: new Date().toISOString()
    });
  }

  toggleQuickReplyTemplateFavorite(id: string): QuickReplyTemplate | null {
    const template = this.quickReplyTemplates.find(t => t.id === id);
    if (!template) return null;
    
    return this.updateQuickReplyTemplate(id, {
      isFavorite: !template.isFavorite
    });
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('whatsapp-dashboard-data', JSON.stringify({
        bots: this.bots,
        chats: this.chats,
        messages: this.messages,
        queueItems: this.queueItems,
        tickets: this.tickets,
        quickReplyTemplates: this.quickReplyTemplates
      }));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }

  loadFromStorage(): void {
    try {
      const data = localStorage.getItem('whatsapp-dashboard-data');
      if (data) {
        const parsed = JSON.parse(data);
        this.bots = parsed.bots ?? [];
        this.chats = parsed.chats ?? [];
        this.messages = parsed.messages ?? [];
        this.queueItems = parsed.queueItems ?? [];
        this.tickets = parsed.tickets ?? [];
        this.quickReplyTemplates = parsed.quickReplyTemplates ?? [];
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  }

  clearAllData(): void {
    this.bots = [];
    this.chats = [];
    this.messages = [];
    this.queueItems = [];
    this.tickets = [];
    this.quickReplyTemplates = [];
    this.saveToStorage();
  }
}

// Singleton instance
export const dataStore = new DataStore();

// Load data on initialization
dataStore.loadFromStorage();

// Export the interface for use in other files
export type { QuickReplyTemplate };
