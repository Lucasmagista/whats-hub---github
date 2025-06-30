// src/services/botSocketService.ts
// npm install socket.io-client
// npm install --save-dev @types/socket.io-client

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BOT_WS_URL || 'http://localhost:3005/dashboard';

class BotSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });
  }

  on<T = unknown>(event: string, callback: (data: T) => void) {
    this.socket.on(event, callback);
  }

  emit<T = unknown>(event: string, data?: T) {
    this.socket.emit(event, data);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export const botSocketService = new BotSocketService();
