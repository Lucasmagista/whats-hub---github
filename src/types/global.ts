// Global types for the application
export interface Bot {
  id: string;
  name: string;
  description?: string;
  apiKey: string;
  webhookUrl?: string;
  status: 'online' | 'offline' | 'connecting' | 'error';
  createdAt: string;
  lastActivity?: string;
  settings: {
    autoReply: boolean;
    workingHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    maxConcurrentChats: number;
    welcomeMessage: string;
    fallbackMessage: string;
    // Configurações para desenvolvimento local
    environment?: 'development' | 'production';
    localPath?: string;
    startMode?: 'npm' | 'yarn' | 'bun' | 'node' | 'python' | 'custom';
    port?: number;
    customCommand?: string;
    autoStart?: boolean;
  };
}

export interface Chat {
  id: string;
  contact: string;
  contactPhone: string;
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
  notes?: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'bot' | 'agent';
  type: 'text' | 'image' | 'file' | 'audio';
  status?: 'sent' | 'delivered' | 'read';
  chatId: string;
}

export interface QueueItem {
  id: string;
  customer: string;
  customerPhone: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  botId: string;
  waitTime: string;
  status: 'waiting' | 'processing' | 'escalated' | 'completed';
  category: string;
  slaTime?: string;
  assignedTo?: string;
  createdAt: string;
}

export interface TicketData {
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
  chatId?: string;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'crm' | 'email';
  enabled: boolean;
  config: Record<string, unknown>;
}

// Tipos corrigidos e padronizados
export interface EmailTemplateSettings {
  serviceId: string;
  publicKey: string;
  recipientEmail: string;
  templates: {
    report: string;
    notification: string;
    alert: string;
    emailVerification: string;
    passwordReset: string;
    uniqueCode: string;
    loginAlert: string;
    accountLocked: string;
    twoFactorAuth: string;
    welcome: string;
    onboarding: string;
    trialExpiring: string;
    subscriptionConfirm: string;
    maintenance: string;
    systemUpdate: string;
    backupComplete: string;
    newsletter: string;
    promotion: string;
    support: string;
    survey: string;
    invoice: string;
    receipt: string;
    contract: string;
  };
}

// Extensão de TicketData corrigida
declare global {
  interface TicketData {
    status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
    createdAt: string; 
    lastUpdate: string; 
    category: string;
    assignedTo?: string;
    estimatedResolution?: string;
    tags?: string[];
  }
}
