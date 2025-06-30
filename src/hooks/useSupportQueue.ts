/**
 * 👥 useSupportQueue Hook - FASE 1 INTEGRAÇÃO
 * Hook completo para gerenciar fila de atendimento humano integrado ao n8n
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { n8nApiService, SupportQueue, Attendant, QueueItem } from '../services/n8nApiService';
import { whatsappService } from '../services/whatsappService';

export interface SupportQueueState {
  // Dados da fila
  queue: SupportQueue | null;
  loading: boolean;
  error: string | null;
  
  // Atendentes
  attendants: Attendant[];
  currentAttendant: Attendant | null;
  
  // Filas
  queueItems: QueueItem[];
  activeChats: any[];
  
  // Estatísticas em tempo real
  totalInQueue: number;
  averageWaitTime: number;
  satisfactionScore: number;
  
  // Estado do usuário atual
  isAttendant: boolean;
  attendantStatus: 'available' | 'busy' | 'offline';
  
  // Configurações FASE 1
  autoAssignEnabled: boolean;
  realTimeUpdates: boolean;
  notificationsEnabled: boolean;
  maxConcurrentChats: number;
  
  // Métricas pessoais
  myActiveChats: number;
  myTotalChatsToday: number;
  myAvgResponseTime: number;
  myPerformanceScore: number;
  
  // Conexão
  connected: boolean;
  lastUpdate: Date | null;
}

export interface SupportQueueActions {
  // Atendente
  registerAsAttendant: (attendantData: Omit<Attendant, 'id' | 'lastActivity'>) => Promise<string>;
  updateAttendantStatus: (status: Attendant['status']) => Promise<void>;
  setCurrentAttendant: (attendant: Attendant) => void;
  
  // Chat
  startChat: (queueItemId: string) => Promise<void>;
  endChat: (chatId: string) => Promise<void>;
  transferChat: (chatId: string, targetAttendantId: string) => Promise<void>;  sendMessage: (chatId: string, message: string) => Promise<void>;
  
  // Fila
  refreshQueue: () => Promise<any>;
  autoAssignNext: () => Promise<any>;
  prioritizeQueueItem: (queueItemId: string, priority: QueueItem['priority']) => Promise<void>;
  
  // FASE 1 - Novos métodos
  getChatHistory: (chatId: string) => Promise<any[]>;
  bulkAssignChats: (attendantId: string, maxChats: number) => Promise<void>;
  pauseAttendance: () => Promise<void>;
  resumeAttendance: () => Promise<void>;
  
  // Configurações
  setAutoAssign: (enabled: boolean) => void;
  setRealTimeUpdates: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setMaxConcurrentChats: (max: number) => void;
  
  // Utilitários
  getQueueMetrics: () => Promise<any>;
  clearError: () => void;
}

export const useSupportQueue = () => {
  const [state, setState] = useState<SupportQueueState>({
    queue: null,
    loading: false,
    error: null,
    attendants: [],
    currentAttendant: null,
    queueItems: [],
    activeChats: [],
    totalInQueue: 0,
    averageWaitTime: 0,
    satisfactionScore: 0,
    isAttendant: false,
    attendantStatus: 'offline',
    autoAssignEnabled: false,
    realTimeUpdates: true,
    notificationsEnabled: true,
    maxConcurrentChats: 5,
    myActiveChats: 0,
    myTotalChatsToday: 0,
    myAvgResponseTime: 0,
    myPerformanceScore: 0,
    connected: false,
    lastUpdate: null
  });

  const pollIntervalRef = useRef<NodeJS.Timeout>();
  const autoRefreshRef = useRef<NodeJS.Timeout>();

  // =============================
  // EFEITOS INICIAIS
  // =============================

  useEffect(() => {
    initializeQueue();
    setupEventListeners();
    startPolling();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    // Atualizar status quando currentAttendant muda
    if (state.currentAttendant) {
      setState(prev => ({
        ...prev,
        isAttendant: true,
        attendantStatus: state.currentAttendant?.status || 'offline'
      }));
    }
  }, [state.currentAttendant]);

  // =============================
  // INICIALIZAÇÃO
  // =============================

  const initializeQueue = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await refreshQueue();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar fila'
      }));
    }
  }, []);

  const setupEventListeners = useCallback(() => {
    // Eventos do WhatsApp Service para atualizações em tempo real
    whatsappService.on('message', (message: any) => {
      // Atualizar fila quando nova mensagem chegar
      if (message.chatId && !message.isFromMe) {
        refreshQueue();
      }
    });

    whatsappService.on('chatStarted', (data: { chatId: string; attendantId: string }) => {
      refreshQueue();
    });

    whatsappService.on('chatEnded', (data: { chatId: string }) => {
      refreshQueue();
    });
  }, []);

  const startPolling = useCallback(() => {
    // Atualizar fila a cada 15 segundos
    pollIntervalRef.current = setInterval(() => {
      if (state.isAttendant && state.attendantStatus !== 'offline') {
        refreshQueue();
      }
    }, 15000);

    // Auto-refresh mais frequente se for atendente ativo
    autoRefreshRef.current = setInterval(() => {
      if (state.isAttendant && state.attendantStatus === 'available') {
        refreshQueue();
      }
    }, 5000);
  }, [state.isAttendant, state.attendantStatus]);

  // =============================
  // AÇÕES DE ATENDENTE
  // =============================

  const registerAsAttendant = useCallback(async (attendantData: Omit<Attendant, 'id' | 'lastActivity'>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await n8nApiService.registerAttendant(attendantData);
      
      // Buscar dados completos do atendente
      await refreshQueue();
      
      const newAttendant = state.attendants.find(a => a.id === result.id);
      if (newAttendant) {
        setState(prev => ({
          ...prev,
          currentAttendant: newAttendant,
          isAttendant: true,
          attendantStatus: newAttendant.status,
          loading: false
        }));
      }

      return result.id;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao registrar atendente'
      }));
      throw error;
    }
  }, [state.attendants]);

  const updateAttendantStatus = useCallback(async (status: Attendant['status']) => {
    if (!state.currentAttendant) {
      throw new Error('Nenhum atendente ativo');
    }

    try {
      await n8nApiService.updateAttendantStatus(state.currentAttendant.id, status);
      
      setState(prev => ({
        ...prev,
        currentAttendant: prev.currentAttendant ? {
          ...prev.currentAttendant,
          status
        } : null,
        attendantStatus: status
      }));

      await refreshQueue();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao atualizar status'
      }));
      throw error;
    }
  }, [state.currentAttendant]);

  const setCurrentAttendant = useCallback((attendant: Attendant) => {
    setState(prev => ({
      ...prev,
      currentAttendant: attendant,
      isAttendant: true,
      attendantStatus: attendant.status
    }));
  }, []);

  // =============================
  // AÇÕES DE CHAT
  // =============================

  const startChat = useCallback(async (queueItemId: string) => {
    if (!state.currentAttendant) {
      throw new Error('Nenhum atendente ativo');
    }

    const queueItem = state.queueItems.find(item => item.id === queueItemId);
    if (!queueItem) {
      throw new Error('Item da fila não encontrado');
    }

    try {
      await n8nApiService.startChat(queueItem.chatId, state.currentAttendant.id);
      await refreshQueue();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao iniciar chat'
      }));
      throw error;
    }
  }, [state.currentAttendant, state.queueItems]);

  const endChat = useCallback(async (chatId: string) => {
    try {
      await n8nApiService.endChat(chatId);
      await refreshQueue();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao finalizar chat'
      }));
      throw error;
    }
  }, []);

  const transferChat = useCallback(async (chatId: string, targetAttendantId: string) => {
    try {
      await n8nApiService.transferChat(chatId, targetAttendantId);
      await refreshQueue();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao transferir chat'
      }));
      throw error;
    }
  }, []);

  const sendMessage = useCallback(async (chatId: string, message: string) => {
    if (!state.currentAttendant) {
      throw new Error('Nenhum atendente ativo');
    }

    try {
      await n8nApiService.sendMessage(chatId, message, state.currentAttendant.id);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao enviar mensagem'
      }));
      throw error;
    }
  }, [state.currentAttendant]);

  // =============================
  // AÇÕES DE FILA
  // =============================

  const refreshQueue = useCallback(async () => {
    try {
      const queueData = await n8nApiService.getSupportQueue();
      
      setState(prev => ({
        ...prev,
        queue: queueData,
        attendants: queueData.attendants,
        queueItems: queueData.queueItems,
        totalInQueue: queueData.totalInQueue,
        averageWaitTime: queueData.metrics.averageWaitTime,
        satisfactionScore: queueData.metrics.satisfactionScore,
        loading: false,
        error: null
      }));

      return queueData;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar fila'
      }));
      throw error;
    }
  }, []);

  const autoAssignNext = useCallback(async () => {
    if (state.queueItems.length === 0) {
      return;
    }

    const nextItem = state.queueItems
      .sort((a, b) => {
        // Prioridade: urgent > high > normal
        const priorityOrder = { urgent: 3, high: 2, normal: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        // Se prioridade igual, por tempo de espera
        return b.waitTime - a.waitTime;
      })[0];

    try {
      const result = await n8nApiService.autoAssignChat(nextItem.chatId);
      await refreshQueue();
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro na atribuição automática'
      }));
      throw error;
    }
  }, [state.queueItems]);

  const prioritizeQueueItem = useCallback(async (queueItemId: string, priority: QueueItem['priority']) => {
    // Atualização local otimista
    setState(prev => ({
      ...prev,
      queueItems: prev.queueItems.map(item =>
        item.id === queueItemId ? { ...item, priority } : item
      )
    }));

    try {
      // FASE 2: Implementar endpoint para atualizar prioridade
      // await n8nApiService.updateQueueItemPriority(queueItemId, priority);
      await refreshQueue();
    } catch (error) {
      // Reverter mudança otimista em caso de erro
      await refreshQueue();
      throw error;
    }
  }, []);

  // =============================
  // UTILITÁRIOS
  // =============================

  const getChatHistory = useCallback(async (chatId: string) => {
    try {
      return await n8nApiService.getChatHistory(chatId);
    } catch (error) {
      console.error('Erro ao obter histórico do chat:', error);
      return [];
    }
  }, []);

  const getQueueMetrics = useCallback(async () => {
    try {
      return await n8nApiService.getMetrics();
    } catch (error) {
      console.error('Erro ao obter métricas:', error);
      return {};
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // =============================
  // CLEANUP
  // =============================

  const cleanup = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
    }
  }, []);

  // =============================
  // AÇÕES COMPUTADAS
  // =============================

  const actions: SupportQueueActions = {
    registerAsAttendant,
    updateAttendantStatus,
    setCurrentAttendant,
    startChat,
    endChat,
    transferChat,
    sendMessage,
    refreshQueue,
    autoAssignNext,
    prioritizeQueueItem,
    getChatHistory,
    getQueueMetrics,
    clearError
  };

  // =============================
  // RETURN
  // =============================

  return {
    // Estado
    ...state,
    
    // Ações
    ...actions,
    
    // Status computados
    canAcceptChats: state.isAttendant && 
                    state.attendantStatus === 'available' && 
                    (state.currentAttendant?.activeChats || 0) < (state.currentAttendant?.maxChats || 3),
    
    hasWaitingCustomers: state.queueItems.length > 0,
    
    nextCustomer: state.queueItems
      .sort((a, b) => {
        const priorityOrder = { urgent: 3, high: 2, normal: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.waitTime - a.waitTime;
      })[0] || null,
    
    // Métricas computadas
    attendantUtilization: state.attendants.length > 0 
      ? state.attendants.filter(a => a.status === 'busy').length / state.attendants.length * 100 
      : 0,
    
    urgentItemsCount: state.queueItems.filter(item => item.priority === 'urgent').length,
    
    averageResponseTime: state.queue?.metrics.responseTime || 0
  };
};
