/**
 * 🎯 Advanced Configuration Context
 * Contexto React avançado para gerenciamento de configurações
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import { SystemConfiguration, configurationManager } from '../services/configurationManager';
import { configurationValidator, ValidationResult } from '../services/configurationValidator';

// Tipos para o contexto
interface ConfigurationState {
  config: SystemConfiguration | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  history: Array<{
    config: SystemConfiguration;
    timestamp: Date;
    action: string;
  }>;
  metrics: {
    totalConfigurations: number;
    activeFeatures: number;
    securityScore: number;
    performanceScore: number;
    complianceScore: number;
    lastModified: string;
    memoryUsage: number;
  } | null;
}

type ConfigurationAction =
  | { type: 'LOAD_CONFIG'; payload: SystemConfiguration }
  | { type: 'UPDATE_CONFIG'; payload: { section: keyof SystemConfiguration; data: unknown; action?: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'RESET_CONFIG' }
  | { type: 'APPLY_PRESET'; payload: { preset: string; action: string } }
  | { type: 'UPDATE_METRICS'; payload: ConfigurationState['metrics'] }
  | { type: 'ADD_TO_HISTORY'; payload: { config: SystemConfiguration; action: string } };

interface ConfigurationContextType {
  state: ConfigurationState;
  dispatch: React.Dispatch<ConfigurationAction>;
  // Métodos de conveniência
  loadConfiguration: () => Promise<void>;
  updateConfiguration: (section: keyof SystemConfiguration, data: unknown, action?: string) => Promise<void>;
  saveConfiguration: () => Promise<boolean>;
  resetConfiguration: () => Promise<void>;
  applyPreset: (presetKey: string) => Promise<boolean>;
  validateConfiguration: () => { valid: boolean; errors: string[]; warnings: string[]; suggestions: string[] };
  getConfigurationMetrics: () => ConfigurationState['metrics'];
  exportConfiguration: () => string;
  importConfiguration: (configJson: string) => Promise<boolean>;
  undoLastChange: () => void;
  hasUnsavedChanges: () => boolean;
}

// Reducer para gerenciar o estado
function configurationReducer(state: ConfigurationState, action: ConfigurationAction): ConfigurationState {
  switch (action.type) {
    case 'LOAD_CONFIG':
      return {
        ...state,
        config: action.payload,
        loading: false,
        error: null,
        isDirty: false
      };
    
    case 'UPDATE_CONFIG':
      if (!state.config) return state;
      
      const updatedConfig = {
        ...state.config,
        [action.payload.section]: {
          ...state.config[action.payload.section],
          ...action.payload.data
        }
      };

      return {
        ...state,
        config: updatedConfig,
        isDirty: true,
        error: null
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    
    case 'RESET_CONFIG':
      return {
        ...state,
        config: configurationManager.getConfiguration(),
        isDirty: false,
        error: null
      };
    
    case 'APPLY_PRESET':
      return { ...state, isDirty: true };
    
    case 'UPDATE_METRICS':
      return { ...state, metrics: action.payload };
    
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        history: [
          ...state.history.slice(-9), // Manter apenas os últimos 10 itens
          {
            config: action.payload.config,
            timestamp: new Date(),
            action: action.payload.action
          }
        ]
      };
    
    default:
      return state;
  }
}

// Estado inicial
const initialState: ConfigurationState = {
  config: null,
  loading: true,
  error: null,
  isDirty: false,
  history: [],
  metrics: null
};

// Criar contexto
const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

// Provider do contexto
export function ConfigurationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(configurationReducer, initialState);

  // Carregar configuração inicial
  useEffect(() => {
    loadConfiguration();
  }, []);

  // Atualizar métricas periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = configurationManager.getConfigurationMetrics();
      dispatch({ type: 'UPDATE_METRICS', payload: metrics });
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Métodos do contexto
  const loadConfiguration = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const config = configurationManager.getConfiguration();
      dispatch({ type: 'LOAD_CONFIG', payload: config });
      
      // Carregar métricas iniciais
      const metrics = configurationManager.getConfigurationMetrics();
      dispatch({ type: 'UPDATE_METRICS', payload: metrics });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar configuração';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const updateConfiguration = async (
    section: keyof SystemConfiguration, 
    data: unknown, 
    action = 'Atualização de configuração'
  ): Promise<void> => {
    try {
      dispatch({ type: 'UPDATE_CONFIG', payload: { section, data, action } });
      
      // Adicionar ao histórico se configuração atual existe
      if (state.config) {
        dispatch({ 
          type: 'ADD_TO_HISTORY', 
          payload: { 
            config: state.config, 
            action 
          } 
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar configuração';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const saveConfiguration = async (): Promise<boolean> => {
    if (!state.config) return false;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Validar antes de salvar
      const validation = configurationValidator.validateConfiguration(state.config);
      if (!validation.isValid) {
        throw new Error(`Configuração inválida: ${validation.errors.join(', ')}`);
      }

      // Salvar configuração
      configurationManager.updateFullConfiguration(state.config);
      await configurationManager.applyToIntegration();
      
      dispatch({ type: 'SET_DIRTY', payload: false });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Atualizar métricas
      const metrics = configurationManager.getConfigurationMetrics();
      dispatch({ type: 'UPDATE_METRICS', payload: metrics });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar configuração';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  const resetConfiguration = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      configurationManager.resetToDefaults();
      await loadConfiguration();
      
      dispatch({ 
        type: 'ADD_TO_HISTORY', 
        payload: { 
          config: configurationManager.getConfiguration(), 
          action: 'Reset para configurações padrão' 
        } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao resetar configuração';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const applyPreset = async (presetKey: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const success = configurationManager.applyPresetConfiguration(presetKey);
      
      if (success) {
        await loadConfiguration();
        dispatch({ type: 'APPLY_PRESET', payload: { preset: presetKey, action: `Aplicar preset: ${presetKey}` } });
        
        if (state.config) {
          dispatch({ 
            type: 'ADD_TO_HISTORY', 
            payload: { 
              config: state.config, 
              action: `Aplicar preset: ${presetKey}` 
            } 
          });
        }
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao aplicar preset';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  const validateConfiguration = () => {
    if (!state.config) {
      return { valid: false, errors: ['Configuração não carregada'], warnings: [], suggestions: [] };
    }
    return configurationValidator.validateConfiguration(state.config);
  };

  const getConfigurationMetrics = () => {
    return configurationManager.getConfigurationMetrics();
  };

  const exportConfiguration = (): string => {
    return configurationManager.exportConfiguration();
  };

  const importConfiguration = async (configJson: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = configurationManager.importConfiguration(configJson);
      
      if (result.success) {
        await loadConfiguration();
        
        if (state.config) {
          dispatch({ 
            type: 'ADD_TO_HISTORY', 
            payload: { 
              config: state.config, 
              action: 'Importar configuração' 
            } 
          });
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Erro na importação' });
      }
      
      return result.success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao importar configuração';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  const undoLastChange = (): void => {
    if (state.history.length > 0) {
      const lastConfig = state.history[state.history.length - 1];
      dispatch({ type: 'LOAD_CONFIG', payload: lastConfig.config });
      dispatch({ type: 'SET_DIRTY', payload: true });
    }
  };

  const hasUnsavedChanges = (): boolean => {
    return state.isDirty;
  };

  const contextValue: ConfigurationContextType = {
    state,
    dispatch,
    loadConfiguration,
    updateConfiguration,
    saveConfiguration,
    resetConfiguration,
    applyPreset,
    validateConfiguration,
    getConfigurationMetrics,
    exportConfiguration,
    importConfiguration,
    undoLastChange,
    hasUnsavedChanges
  };

  return (
    <ConfigurationContext.Provider value={contextValue}>
      {children}
    </ConfigurationContext.Provider>
  );
}

// Hook para usar o contexto
export function useAdvancedConfiguration(): ConfigurationContextType {
  const context = useContext(ConfigurationContext);
  if (context === undefined) {
    throw new Error('useAdvancedConfiguration deve ser usado dentro de um ConfigurationProvider');
  }
  return context;
}

// Hook para seções específicas
export function useConfigurationSection<T extends keyof SystemConfiguration>(
  section: T
): {
  data: SystemConfiguration[T] | null;
  update: (data: Partial<SystemConfiguration[T]>) => Promise<void>;
  loading: boolean;
  error: string | null;
} {
  const { state, updateConfiguration } = useAdvancedConfiguration();
  
  return {
    data: state.config ? state.config[section] : null,
    update: (data: Partial<SystemConfiguration[T]>) => updateConfiguration(section, data),
    loading: state.loading,
    error: state.error
  };
}

// Hook para monitoramento em tempo real
export function useConfigurationMonitoring() {
  const { state } = useAdvancedConfiguration();
  
  return {
    metrics: state.metrics,
    isDirty: state.isDirty,
    history: state.history,
    lastChange: state.history.length > 0 ? state.history[state.history.length - 1] : null
  };
}

export default ConfigurationProvider;
