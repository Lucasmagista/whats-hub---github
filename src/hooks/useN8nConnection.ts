/**
 * 🔗 useN8nConnection Hook - FASE 1 INTEGRAÇÃO BASE
 * Hook personalizado para gerenciar conexão completa com N8N + WhatsApp
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { n8nApiService, SystemStatus, SupportQueue, LogEntry, whatsHubIntegration } from '../services/n8nApiService';
import { whatsappService, WhatsAppConnection } from '../services/whatsappService';

export interface N8nConnectionState {
  // Status da conexão
  connected: boolean;
  connecting: boolean;
  error: string | null;
  
  // Status dos sistemas integrados
  systemStatus: SystemStatus | null;
  whatsappConnection: WhatsAppConnection | null;
  supportQueue: SupportQueue | null;
  
  // QR Code
  qrCode: string | null;
  qrExpired: boolean;
  
  // Logs em tempo real
  recentLogs: LogEntry[];
  
  // Métricas
  uptime: number;
  lastSync: Date | null;
  
  // WebSocket
  websocketConnected: boolean;
  realTimeUpdates: boolean;
  
  // Saúde da integração
  integrationHealth: 'healthy' | 'warning' | 'critical' | 'unknown';
}

export interface N8nConnectionActions {
  // Conexão
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  
  // QR Code
  generateQR: () => Promise<void>;
  refreshQR: () => Promise<void>;
  
  // Status
  refreshStatus: () => Promise<any>;
  getSystemHealth: () => Promise<any>;
  
  // Utilitários
  retry: () => Promise<void>;
  clearError: () => void;
}

export const useN8nConnection = () => {
  const [state, setState] = useState<N8nConnectionState>({
    connected: false,
    connecting: false,
    error: null,
    systemStatus: null,
    whatsappConnection: null,
    supportQueue: null,
    qrCode: null,
    qrExpired: false,
    recentLogs: [],
    uptime: 0,
    lastSync: null,
    websocketConnected: false,
    realTimeUpdates: false,
    integrationHealth: 'unknown'
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const statusIntervalRef = useRef<NodeJS.Timeout>();
  const qrTimeoutRef = useRef<NodeJS.Timeout>();
  const isUnmountedRef = useRef(false);

  // =============================
  // CONEXÃO PRINCIPAL (FASE 1.1)
  // =============================

  useEffect(() => {
    initializeConnection();
    setupEventListeners();
    startStatusPolling();

    return () => {
      cleanup();
    };
  }, []);

  // =============================
  // INICIALIZAÇÃO
  // =============================

  const initializeConnection = useCallback(async () => {
    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      // Verificar status do sistema
      await refreshStatus();
      
      // Verificar conexão WhatsApp
      const whatsappStatus = await whatsappService.getConnectionStatus();
      
      setState(prev => ({
        ...prev,
        connected: whatsappStatus.connected,
        whatsappConnection: whatsappStatus,
        connecting: false,
        lastSync: new Date()
      }));

      if (!whatsappStatus.connected) {
        await generateQR();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  }, []);

  const setupEventListeners = useCallback(() => {
    // Eventos do WhatsApp Service
    whatsappService.on('connection', (status: WhatsAppConnection) => {
      setState(prev => ({
        ...prev,
        connected: status.connected,
        whatsappConnection: status,
        qrCode: status.qrCode || prev.qrCode,
        error: status.connected ? null : prev.error
      }));
    });

    whatsappService.on('qr', (data: { qr: string }) => {
      setState(prev => ({
        ...prev,
        qrCode: data.qr,
        qrExpired: false
      }));
      
      // QR expira em 60 segundos
      if (qrTimeoutRef.current) {
        clearTimeout(qrTimeoutRef.current);
      }
      qrTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, qrExpired: true }));
      }, 60000);
    });

    whatsappService.on('ready', () => {
      setState(prev => ({
        ...prev,
        connected: true,
        qrCode: null,
        qrExpired: false,
        error: null,
        lastSync: new Date()
      }));
    });

    whatsappService.on('disconnected', () => {
      setState(prev => ({
        ...prev,
        connected: false,
        error: 'WhatsApp desconectado'
      }));
    });
  }, []);

  const startStatusPolling = useCallback(() => {
    // Atualizar status a cada 30 segundos
    statusIntervalRef.current = setInterval(async () => {
      if (state.connected) {
        try {
          await refreshStatus();
        } catch (error) {
          // Silent fail para polling
        }
      }
    }, 30000);
  }, [state.connected]);

  // =============================
  // AÇÕES DE CONEXÃO
  // =============================

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      await initializeConnection();
    } catch (error) {
      setState(prev => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error.message : 'Erro na conexão'
      }));
      throw error;
    }
  }, [initializeConnection]);

  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      connected: false,
      connecting: false,
      qrCode: null,
      qrExpired: false
    }));
    
    cleanup();
  }, []);

  const reconnect = useCallback(async () => {
    disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await connect();
  }, [connect, disconnect]);

  // =============================
  // QR CODE
  // =============================

  const generateQR = useCallback(async () => {
    try {
      const qrData = await whatsappService.getQRCode();
      setState(prev => ({
        ...prev,
        qrCode: qrData.qr,
        qrExpired: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao gerar QR Code'
      }));
      throw error;
    }
  }, []);

  const refreshQR = useCallback(async () => {
    setState(prev => ({ ...prev, qrCode: null, qrExpired: false }));
    await generateQR();
  }, [generateQR]);

  // =============================
  // STATUS E MÉTRICAS
  // =============================

  const refreshStatus = useCallback(async () => {
    try {
      const [systemStatus, whatsappStatus] = await Promise.all([
        n8nApiService.getSystemStatus(),
        whatsappService.getConnectionStatus()
      ]);

      setState(prev => ({
        ...prev,
        systemStatus,
        whatsappConnection: whatsappStatus,
        connected: whatsappStatus.connected,
        uptime: systemStatus.server.uptime,
        lastSync: new Date(),
        error: null
      }));

      return { systemStatus, whatsappStatus };
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }, []);

  const getSystemHealth = useCallback(async () => {
    try {
      return await n8nApiService.getHealth();
    } catch (error) {
      console.error('Erro ao obter saúde do sistema:', error);
      throw error;
    }
  }, []);

  // =============================
  // UTILITÁRIOS
  // =============================

  const retry = useCallback(async () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setState(prev => ({ ...prev, error: null }));
    
    retryTimeoutRef.current = setTimeout(async () => {
      try {
        await connect();
      } catch (error) {
        console.error('Erro na tentativa de reconexão:', error);
      }
    }, 2000);
  }, [connect]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // =============================
  // CLEANUP
  // =============================

  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
    }
    if (qrTimeoutRef.current) {
      clearTimeout(qrTimeoutRef.current);
    }
  }, []);

  // =============================
  // RETURN
  // =============================

  const actions: N8nConnectionActions = {
    connect,
    disconnect,
    reconnect,
    generateQR,
    refreshQR,
    refreshStatus,
    getSystemHealth,
    retry,
    clearError
  };

  return {
    // Estado
    ...state,
    
    // Ações
    ...actions,
    
    // Status computados
    isOnline: state.connected && !state.error,
    needsQR: !state.connected && !state.qrCode && !state.qrExpired,
    canReconnect: !state.connecting,
    
    // Métricas computadas
    healthScore: state.systemStatus ? (
      (state.systemStatus.whatsapp.connected ? 25 : 0) +
      (state.systemStatus.database.connected ? 25 : 0) +
      (state.systemStatus.n8n.connected ? 25 : 0) +
      (state.systemStatus.server.uptime > 0 ? 25 : 0)
    ) : 0
  };
};
