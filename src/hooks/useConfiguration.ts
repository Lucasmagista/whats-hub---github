/**
 * 🎣 React Hook para Configurações
 * Hook personalizado para gerenciar e monitorar configurações
 */

import { useState, useEffect, useCallback } from 'react';
import { configurationManager, SystemConfiguration } from '@/services/configurationManager';
import { configurationValidator } from '@/services/configurationValidator';

export interface UseConfigurationReturn {
  config: SystemConfiguration | null;
  loading: boolean;
  error: string | null;
  health: {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    suggestions: string[];
  };
  updateConfig: (updates: Partial<SystemConfiguration>) => Promise<boolean>;
  resetToDefaults: () => void;
  exportConfig: () => string;
  importConfig: (configJson: string) => Promise<boolean>;
  validateConfig: () => { valid: boolean; errors: string[] };
  performDiagnostics: () => void;
  autoRepair: () => Promise<boolean>;
}

export function useConfiguration(): UseConfigurationReturn {
  const [config, setConfig] = useState<SystemConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    suggestions: string[];
  }>({
    status: 'healthy',
    issues: [],
    suggestions: []
  });

  const loadConfiguration = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      const currentConfig = configurationManager.getConfiguration();
      setConfig(currentConfig);

      // Verificar saúde das configurações será feito separadamente
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(() => {
    try {
      const configHealth = configurationValidator.checkConfigurationHealth();
      const validation = config ? configurationValidator.validateConfiguration(config) : { 
        isValid: false, 
        errors: ['Configuração não carregada'], 
        warnings: [], 
        suggestions: [] 
      };

      setHealth({
        status: configHealth.status,
        issues: [
          ...configHealth.issues.map(issue => issue.message),
          ...validation.errors
        ],
        suggestions: validation.suggestions
      });
    } catch (err) {
      console.error('Erro ao verificar saúde das configurações:', err);
      setHealth({
        status: 'critical',
        issues: ['Erro ao verificar configurações'],
        suggestions: ['Reiniciar aplicação']
      });
    }
  }, [config]);

  const updateConfig = useCallback(async (updates: Partial<SystemConfiguration>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Aplicar atualizações
      configurationManager.updateFullConfiguration(updates);
      
      // Recarregar configuração
      const updatedConfig = configurationManager.getConfiguration();
      setConfig(updatedConfig);

      // Verificar se as mudanças foram aplicadas
      const hasChanges = Object.keys(updates).some(key => {
        const configKey = key as keyof SystemConfiguration;
        return JSON.stringify(updatedConfig[configKey]) === JSON.stringify(updates[configKey]);
      });

      if (hasChanges) {
        // Aplicar às integrações
        await configurationManager.applyToIntegration();
        checkHealth();
        return true;
      } else {
        throw new Error('Configurações não foram aplicadas corretamente');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configurações';
      setError(errorMessage);
      console.error('Erro ao atualizar configurações:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [checkHealth]);

  const resetToDefaults = useCallback(() => {
    try {
      setLoading(true);
      configurationManager.resetToDefaults();
      loadConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao resetar configurações');
    } finally {
      setLoading(false);
    }
  }, [loadConfiguration]);

  const exportConfig = useCallback((): string => {
    return configurationManager.exportConfiguration();
  }, []);

  const importConfig = useCallback(async (configJson: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const result = configurationManager.importConfiguration(configJson);
      
      if (result.success) {
        loadConfiguration();
        return true;
      } else {
        throw new Error(result.error || 'Erro na importação');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar configurações');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadConfiguration]);

  const validateConfig = useCallback(() => {
    return configurationManager.validateConfiguration();
  }, []);

  const performDiagnostics = useCallback(() => {
    checkHealth();
  }, [checkHealth]);

  const autoRepair = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      const repair = configurationManager.performAutoRepair();
      
      if (repair.success) {
        loadConfiguration();
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no reparo automático');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadConfiguration]);

  // Configurar listener para mudanças
  useEffect(() => {
    const unsubscribe = configurationManager.onConfigurationChange((newConfig) => {
      setConfig(newConfig);
      checkHealth();
    });

    // Carregar configuração inicial
    loadConfiguration();

    return unsubscribe;
  }, [loadConfiguration, checkHealth]);

  // Verificar saúde periodicamente
  useEffect(() => {
    const interval = setInterval(checkHealth, 30000); // A cada 30 segundos
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    config,
    loading,
    error,
    health,
    updateConfig,
    resetToDefaults,
    exportConfig,
    importConfig,
    validateConfig,
    performDiagnostics,
    autoRepair
  };
}

/**
 * Hook simplificado para componentes que só precisam ler configurações
 */
export function useConfigurationRead() {
  const [config, setConfig] = useState<SystemConfiguration | null>(null);

  useEffect(() => {
    const currentConfig = configurationManager.getConfiguration();
    setConfig(currentConfig);

    const unsubscribe = configurationManager.onConfigurationChange(setConfig);
    return unsubscribe;
  }, []);

  return config;
}
