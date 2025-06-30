import { useState, useEffect, useCallback } from 'react';
import AutomationService, { 
  AutomationConfig, 
  AutomationPlatform, 
  TriggerEvent,
  ExecutionResult,
  AutomationStats
} from '@/services/automationService';

export interface UseAutomationReturn {
  // State
  automations: AutomationConfig[];
  stats: AutomationStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  createAutomation: (config: Omit<AutomationConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateAutomation: (id: string, updates: Partial<AutomationConfig>) => Promise<void>;
  deleteAutomation: (id: string) => Promise<void>;
  toggleAutomation: (id: string) => Promise<void>;
  testAutomation: (id: string) => Promise<boolean>;
  triggerEvent: (event: TriggerEvent, data: any, context?: Record<string, any>) => Promise<ExecutionResult[]>;
  
  // Utility
  getAutomationsByPlatform: (platform: AutomationPlatform) => AutomationConfig[];
  getAutomation: (id: string) => AutomationConfig | undefined;
  exportAutomations: () => string;
  importAutomations: (data: string) => Promise<void>;
  
  // Refresh
  refresh: () => void;
}

export const useAutomation = (): UseAutomationReturn => {
  const [automationService] = useState(() => new AutomationService());
  const [automations, setAutomations] = useState<AutomationConfig[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allAutomations = automationService.getAllAutomations();
      const automationStats = automationService.getStats();
      
      setAutomations(allAutomations);
      setStats(automationStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [automationService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createAutomation = useCallback(async (config: Omit<AutomationConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const id = await automationService.registerAutomation(config);
      await loadData();
      
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar automação';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [automationService, loadData]);

  const updateAutomation = useCallback(async (id: string, updates: Partial<AutomationConfig>) => {
    try {
      setLoading(true);
      setError(null);
      
      await automationService.updateAutomation(id, updates);
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar automação';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [automationService, loadData]);

  const deleteAutomation = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await automationService.removeAutomation(id);
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar automação';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [automationService, loadData]);

  const toggleAutomation = useCallback(async (id: string) => {
    try {
      setError(null);
      
      const automation = automationService.getAutomation(id);
      if (!automation) {
        throw new Error('Automação não encontrada');
      }
      
      await automationService.updateAutomation(id, { 
        isActive: !automation.isActive 
      });
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alternar automação';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [automationService, loadData]);

  const testAutomation = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const automation = automationService.getAutomation(id);
      if (!automation) {
        throw new Error('Automação não encontrada');
      }
      
      const result = await automationService.testConnection(automation);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no teste de automação';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [automationService]);

  const triggerEvent = useCallback(async (event: TriggerEvent, data: any, context?: Record<string, any>) => {
    try {
      setError(null);
      
      const results = await automationService.triggerEvent(event, data, context);
      
      // Atualizar estatísticas após execução
      setTimeout(() => {
        const updatedStats = automationService.getStats();
        setStats(updatedStats);
      }, 1000);
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao disparar evento';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [automationService]);

  const getAutomationsByPlatform = useCallback((platform: AutomationPlatform) => {
    return automationService.getAutomationsByPlatform(platform);
  }, [automationService]);

  const getAutomation = useCallback((id: string) => {
    return automationService.getAutomation(id);
  }, [automationService]);

  const exportAutomations = useCallback(() => {
    const allAutomations = automationService.getAllAutomations();
    return JSON.stringify(allAutomations, null, 2);
  }, [automationService]);

  const importAutomations = useCallback(async (data: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const automationsToImport = JSON.parse(data) as AutomationConfig[];
      
      if (!Array.isArray(automationsToImport)) {
        throw new Error('Formato de dados inválido');
      }
      
      for (const automation of automationsToImport) {
        const { id, createdAt, updatedAt, ...config } = automation;
        await automationService.registerAutomation(config);
      }
      
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao importar automações';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [automationService, loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    // State
    automations,
    stats,
    loading,
    error,
    
    // Actions
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    testAutomation,
    triggerEvent,
    
    // Utility
    getAutomationsByPlatform,
    getAutomation,
    exportAutomations,
    importAutomations,
    
    // Refresh
    refresh
  };
};
