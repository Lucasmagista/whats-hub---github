/**
 * 📱 WhatsApp Service - FASE 1 INTEGRAÇÃO BASE
 * Serviço completo para gerenciar conexões e mensagens WhatsApp integrado ao n8n
 */

import { n8nApiService } from './n8nApiService';

export interface WhatsAppConnection {
  connected: boolean;
  user?: {
    id: string;
    name: string;
    phone: string;
  };
  qrCode?: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'qr-needed' | 'error';
  lastSeen?: string;
  messagesReceived?: number;
  messagesSent?: number;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  timestamp: number;
  isFromMe: boolean;
  contact?: {
    name: string;
    phone: string;
  };
  media?: {
    mimetype: string;
    data: string;
    filename?: string;
  };
  chat: {
    id: string;
    name?: string;
    isGroup: boolean;
  };
}

export interface ChatInfo {
  id: string;
  name: string;
  isGroup: boolean;
  participants?: number;
  lastMessage?: WhatsAppMessage;
  unreadCount: number;
  lastActivity?: string;
}

class WhatsAppService {
  private eventListeners = new Map<string, Set<Function>>();
  private connectionStatus: WhatsAppConnection = {
    connected: false,
    status: 'disconnected'
  };

  constructor() {
    this.initializeWebSocketConnection();
  }

  // =============================
  // WEBSOCKET CONNECTION
  // =============================

  private initializeWebSocketConnection() {
    // Se WebSocket estiver disponível, conectar
    if (typeof WebSocket !== 'undefined') {
      this.setupWebSocket();
    }
  }

  private setupWebSocket() {
    try {
      const ws = new WebSocket('ws://localhost:3001/ws');
      
      ws.onopen = () => {
        console.log('🔗 WebSocket conectado ao servidor WhatsApp');
        this.emit('connection', { connected: true });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado. Tentando reconectar...');
        setTimeout(() => this.setupWebSocket(), 5000);
      };

      ws.onerror = (error) => {
        console.error('❌ Erro WebSocket:', error);
      };
    } catch (error) {
      console.warn('WebSocket não disponível, usando polling');
      this.setupPolling();
    }
  }

  private setupPolling() {
    // Fallback para polling se WebSocket não estiver disponível
    setInterval(async () => {
      try {
        const status = await this.getConnectionStatus();
        if (status.connected !== this.connectionStatus.connected) {
          this.connectionStatus = status;
          this.emit('connection', status);
        }
      } catch (error) {
        // Silent fail for polling
      }
    }, 5000);
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'connection':
        this.connectionStatus = data.payload;
        this.emit('connection', data.payload);
        break;
      
      case 'message':
        this.emit('message', data.payload);
        break;
      
      case 'qr':
        this.connectionStatus.qrCode = data.payload.qr;
        this.connectionStatus.status = 'qr-needed';
        this.emit('qr', data.payload);
        break;
      
      case 'ready':
        this.connectionStatus.connected = true;
        this.connectionStatus.status = 'connected';
        this.connectionStatus.user = data.payload.user;
        this.emit('ready', data.payload);
        break;
      
      case 'disconnected':
        this.connectionStatus.connected = false;
        this.connectionStatus.status = 'disconnected';
        this.emit('disconnected', data.payload);
        break;
      
      case 'log':
        this.emit('log', data.payload);
        break;
      
      default:
        console.log('Mensagem WebSocket não reconhecida:', data);
    }
  }

  // =============================
  // EVENT SYSTEM
  // =============================

  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro no listener ${event}:`, error);
        }
      });
    }
  }

  // =============================
  // CONNECTION MANAGEMENT
  // =============================

  async getConnectionStatus(): Promise<WhatsAppConnection> {
    try {
      const status = await n8nApiService.getConnectionStatus();
      this.connectionStatus = {
        connected: status.connected,
        user: status.user,
        status: status.connected ? 'connected' : 'disconnected'
      };
      return this.connectionStatus;
    } catch (error) {
      console.error('Erro ao obter status da conexão:', error);
      return this.connectionStatus;
    }
  }

  async getQRCode(): Promise<{ qr: string; status: string }> {
    try {
      const result = await n8nApiService.getQRCode();
      this.connectionStatus.qrCode = result.qr;
      this.connectionStatus.status = 'qr-needed';
      return result;
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      throw error;
    }
  }

  getCurrentConnection(): WhatsAppConnection {
    return { ...this.connectionStatus };
  }

  // =============================
  // MESSAGE OPERATIONS
  // =============================

  async sendMessage(chatId: string, message: string): Promise<void> {
    try {
      await n8nApiService.sendTextMessage(chatId, message);
      
      // Emitir evento de mensagem enviada
      this.emit('message', {
        id: `sent_${Date.now()}`,
        from: this.connectionStatus.user?.phone || 'me',
        to: chatId,
        body: message,
        type: 'text',
        timestamp: Date.now(),
        isFromMe: true
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async sendMedia(chatId: string, media: File, caption?: string): Promise<void> {
    try {
      await n8nApiService.sendMediaMessage(chatId, media, caption);
      
      // Emitir evento de mídia enviada
      this.emit('message', {
        id: `media_${Date.now()}`,
        from: this.connectionStatus.user?.phone || 'me',
        to: chatId,
        body: caption || '[Mídia]',
        type: this.getMediaType(media.type),
        timestamp: Date.now(),
        isFromMe: true,
        media: {
          mimetype: media.type,
          filename: media.name,
          data: 'sent'
        }
      });
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      throw error;
    }
  }

  async downloadMedia(messageId: string): Promise<Blob> {
    try {
      return await n8nApiService.downloadMedia(messageId);
    } catch (error) {
      console.error('Erro ao baixar mídia:', error);
      throw error;
    }
  }

  private getMediaType(mimeType: string): 'image' | 'audio' | 'video' | 'document' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  }

  // =============================
  // CHAT OPERATIONS
  // =============================

  async getChatInfo(chatId: string): Promise<ChatInfo> {
    try {
      const info = await n8nApiService.getChatInfo(chatId);
      return {
        id: chatId,
        name: info.name || chatId,
        isGroup: info.isGroup || false,
        participants: info.participants?.length || 0,
        unreadCount: info.unreadCount || 0,
        lastMessage: info.lastMessage
      };
    } catch (error) {
      console.error('Erro ao obter info do chat:', error);
      return {
        id: chatId,
        name: chatId,
        isGroup: false,
        unreadCount: 0
      };
    }
  }

  // =============================
  // USER STATE OPERATIONS
  // =============================

  async getUserStates(): Promise<Record<string, any>> {
    try {
      return await n8nApiService.getUserStates();
    } catch (error) {
      console.error('Erro ao obter estados dos usuários:', error);
      return {};
    }
  }

  async getUserState(phone: string): Promise<any> {
    try {
      return await n8nApiService.getUserState(phone);
    } catch (error) {
      console.error(`Erro ao obter estado do usuário ${phone}:`, error);
      return null;
    }
  }

  async resetUserState(phone: string): Promise<void> {
    try {
      await n8nApiService.resetUserState(phone);
      this.emit('userStateReset', { phone });
    } catch (error) {
      console.error(`Erro ao resetar estado do usuário ${phone}:`, error);
      throw error;
    }
  }

  // =============================
  // SUPPORT QUEUE INTEGRATION
  // =============================

  async getSupportQueue() {
    try {
      return await n8nApiService.getSupportQueue();
    } catch (error) {
      console.error('Erro ao obter fila de suporte:', error);
      return {
        totalInQueue: 0,
        activeChats: 0,
        attendants: [],
        queueItems: [],
        metrics: {
          averageWaitTime: 0,
          totalChatsToday: 0,
          satisfactionScore: 0,
          responseTime: 0
        }
      };
    }
  }

  async registerAttendant(attendant: any) {
    try {
      return await n8nApiService.registerAttendant(attendant);
    } catch (error) {
      console.error('Erro ao registrar atendente:', error);
      throw error;
    }
  }

  async startChat(chatId: string, attendantId: string) {
    try {
      await n8nApiService.startChat(chatId, attendantId);
      this.emit('chatStarted', { chatId, attendantId });
    } catch (error) {
      console.error('Erro ao iniciar chat:', error);
      throw error;
    }
  }

  async endChat(chatId: string) {
    try {
      await n8nApiService.endChat(chatId);
      this.emit('chatEnded', { chatId });
    } catch (error) {
      console.error('Erro ao finalizar chat:', error);
      throw error;
    }
  }

  // =============================
  // METRICS AND MONITORING
  // =============================

  async getMetrics() {
    try {
      return await n8nApiService.getMetrics();
    } catch (error) {
      console.error('Erro ao obter métricas:', error);
      return {};
    }
  }

  async getLogs(limit = 100) {
    try {
      return await n8nApiService.getLogs(limit);
    } catch (error) {
      console.error('Erro ao obter logs:', error);
      return [];
    }
  }

  // =============================
  // CLEANUP
  // =============================

  destroy() {
    this.eventListeners.clear();
  }
}

// Singleton instance
export const whatsappService = new WhatsAppService();

// Export default
export default whatsappService;
