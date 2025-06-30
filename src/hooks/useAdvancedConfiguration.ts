/**
 * 🎣 Advanced Configuration Hooks
 * Hooks personalizados para gerenciamento avançado de configurações
 */

import { useContext, useState, useEffect, useCallback } from 'react';
import { SystemConfiguration } from '../services/configurationManager';

// Tipos para as funcionalidades avançadas
interface HealthCheckResult {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  details: {
    security: number;
    performance: number;
    compliance: number;
    stability: number;
  };
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    section: string;
  }>;
  recommendations: string[];
}

interface MaintenanceResult {
  tasksExecuted: number;
  cleanedFiles: number;
  optimizedSettings: number;
  backupsCreated: number;
  errors: string[];
  warnings: string[];
  duration: number;
}

interface ResourceUsageAnalysis {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  trends: {
    cpu: number[];
    memory: number[];
    disk: number[];
    network: number[];
  };
  recommendations: string[];
  alerts: Array<{
    type: 'warning' | 'critical';
    resource: string;
    value: number;
    threshold: number;
    message: string;
  }>;
}

interface ExportOptions {
  includeMetadata?: boolean;
  includeHistory?: boolean;
  includeSecrets?: boolean;
  format?: 'json' | 'yaml' | 'encrypted';
  compression?: boolean;
}

interface ImportOptions {
  validateBeforeImport?: boolean;
  createBackup?: boolean;
  mergeStrategy?: 'overwrite' | 'merge' | 'preserve';
  skipValidation?: boolean;
}

interface ConfigurationReport {
  type: 'security' | 'performance' | 'compliance' | 'full';
  generated: string;
  summary: {
    totalScore: number;
    sections: Record<string, number>;
    issues: number;
    recommendations: number;
  };
  details: Record<string, unknown>;
  charts: Array<{
    type: string;
    title: string;
    data: unknown;
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    impact: string;
    effort: string;
  }>;
}

// Tipo para ações do dispatcher
interface ConfigurationAction {
  type: string;
  payload?: unknown;
}

// Tipo para o contexto (referência externa)
interface ConfigurationContextType {
  state: {
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
      resourceUsage?: {
        cpu: number;
        memory: number;
        disk: number;
        network: number;
      };
      healthStatus?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
      optimization?: {
        level: number;
        suggestions: string[];
        applied: string[];
      };
    } | null;
  };
  dispatch: React.Dispatch<ConfigurationAction>;
  loadConfiguration: () => Promise<void>;
  updateConfiguration: (section: keyof SystemConfiguration, data: unknown, action?: string) => Promise<void>;
  saveConfiguration: () => Promise<boolean>;
  resetConfiguration: () => Promise<void>;
  applyPreset: (presetKey: string) => Promise<boolean>;
  validateConfiguration: () => { valid: boolean; errors: string[]; warnings: string[]; suggestions: string[] };
  getConfigurationMetrics: () => ConfigurationContextType['state']['metrics'];
  exportConfiguration: () => string;
  importConfiguration: (configJson: string) => Promise<boolean>;
  undoLastChange: () => void;
  hasUnsavedChanges: () => boolean;
  // Novos métodos avançados
  optimizeForEnvironment: (environment: 'development' | 'staging' | 'production') => Promise<boolean>;
  performAutoTuning: () => Promise<boolean>;
  runHealthCheck: () => Promise<HealthCheckResult>;
  createIntelligentBackup: () => Promise<boolean>;
  runMaintenanceTasks: () => Promise<MaintenanceResult>;
  startRealTimeMonitoring: () => Promise<void>;
  stopRealTimeMonitoring: () => Promise<void>;
  analyzeResourceUsage: () => Promise<ResourceUsageAnalysis>;
  exportAdvanced: (options?: ExportOptions) => Promise<string>;
  importAdvanced: (data: string, options?: ImportOptions) => Promise<boolean>;
  generateReport: (type?: ConfigurationReport['type']) => Promise<ConfigurationReport>;
}

// Contexto será importado dinamicamente
let ConfigurationContext: React.Context<ConfigurationContextType | undefined>;

// Hook principal para usar o contexto
export function useAdvancedConfiguration(): ConfigurationContextType {
  // Para desenvolvimento, assumimos que o contexto existe
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

// Hook para validação em tempo real
export function useConfigurationValidation() {
  const { validateConfiguration, state } = useAdvancedConfiguration();
  
  const validation = validateConfiguration();
  
  return {
    isValid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    suggestions: validation.suggestions,
    hasErrors: validation.errors.length > 0,
    hasWarnings: validation.warnings.length > 0,
    isLoading: state.loading
  };
}

// Hook para operações de arquivo
export function useConfigurationFiles() {
  const { exportConfiguration, importConfiguration, resetConfiguration } = useAdvancedConfiguration();
  
  const downloadConfiguration = () => {
    const config = exportConfiguration();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadConfiguration = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const success = await importConfiguration(content);
          resolve(success);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  return {
    exportConfiguration,
    importConfiguration,
    downloadConfiguration,
    uploadConfiguration,
    resetConfiguration
  };
}

// Hook para presets
export function useConfigurationPresets() {
  const { applyPreset } = useAdvancedConfiguration();
  
  const availablePresets = {
    'high-security': {
      name: 'Alta Segurança',
      description: 'Configuração com máxima segurança para ambientes críticos',
      category: 'security' as const
    },
    'high-performance': {
      name: 'Alta Performance',
      description: 'Configuração otimizada para máxima performance',
      category: 'performance' as const
    },
    'development': {
      name: 'Desenvolvimento',
      description: 'Configuração otimizada para desenvolvimento',
      category: 'development' as const
    },
    'production': {
      name: 'Produção',
      description: 'Configuração balanceada para ambiente de produção',
      category: 'production' as const
    }
  };

  return {
    availablePresets,
    applyPreset,
    presetCategories: ['security', 'performance', 'development', 'production'] as const
  };
}

// Hook para métricas e analytics
export function useConfigurationAnalytics() {
  const { state, getConfigurationMetrics } = useAdvancedConfiguration();
  
  const getHealthStatus = () => {
    if (!state.metrics) return 'unknown';
    
    const { securityScore, performanceScore, complianceScore } = state.metrics;
    const averageScore = (securityScore + performanceScore + complianceScore) / 3;
    
    if (averageScore >= 90) return 'excellent';
    if (averageScore >= 70) return 'good';
    if (averageScore >= 50) return 'fair';
    return 'poor';
  };

  const getRecommendations = () => {
    if (!state.metrics) return [];
    
    const recommendations: string[] = [];
    const { securityScore, performanceScore, complianceScore } = state.metrics;
    
    if (securityScore < 70) {
      recommendations.push('Considere melhorar as configurações de segurança');
    }
    if (performanceScore < 70) {
      recommendations.push('Otimize as configurações de performance');
    }
    if (complianceScore < 50) {
      recommendations.push('Revise as configurações de compliance');
    }
    
    return recommendations;
  };

  return {
    metrics: state.metrics,
    healthStatus: getHealthStatus(),
    recommendations: getRecommendations(),
    refreshMetrics: getConfigurationMetrics,
    history: state.history,
    isHealthy: getHealthStatus() === 'excellent' || getHealthStatus() === 'good'
  };
}

// Hook para operações em lote
export function useConfigurationBatch() {
  const { updateConfiguration, saveConfiguration, state } = useAdvancedConfiguration();
  
  const batchUpdate = async (updates: Array<{
    section: keyof SystemConfiguration;
    data: unknown;
    action?: string;
  }>) => {
    try {
      // Aplicar todas as atualizações
      for (const update of updates) {
        await updateConfiguration(update.section, update.data, update.action);
      }
      
      // Salvar uma vez no final
      return await saveConfiguration();
    } catch (error) {
      console.error('Erro em operação em lote:', error);
      return false;
    }
  };

  const bulkImport = async (configs: Record<string, unknown>) => {
    const updates: Array<{
      section: keyof SystemConfiguration;
      data: unknown;
      action?: string;
    }> = [];

    for (const [section, data] of Object.entries(configs)) {
      if (section in (state.config || {})) {
        updates.push({
          section: section as keyof SystemConfiguration,
          data,
          action: `Importação em lote: ${section}`
        });
      }
    }

    return await batchUpdate(updates);
  };

  return {
    batchUpdate,
    bulkImport,
    pendingChanges: state.isDirty,
    hasUnsavedChanges: state.isDirty
  };
}

// Hook para Environment Optimization
export function useEnvironmentOptimization() {
  const { optimizeForEnvironment, state } = useAdvancedConfiguration();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<{
    environment: string;
    timestamp: Date;
    success: boolean;
  } | null>(null);

  const optimizeEnvironment = useCallback(async (environment: 'development' | 'staging' | 'production') => {
    setIsOptimizing(true);
    try {
      const success = await optimizeForEnvironment(environment);
      setLastOptimization({
        environment,
        timestamp: new Date(),
        success
      });
      return success;
    } catch (error) {
      console.error('Erro ao otimizar ambiente:', error);
      setLastOptimization({
        environment,
        timestamp: new Date(),
        success: false
      });
      return false;
    } finally {
      setIsOptimizing(false);
    }
  }, [optimizeForEnvironment]);

  return {
    optimizeEnvironment,
    isOptimizing,
    lastOptimization,
    currentEnvironment: process.env.NODE_ENV || 'development',
    optimizationLevel: state.metrics?.optimization?.level || 0
  };
}

// Hook para Auto-Tuning
export function useAutoTuning() {
  const { performAutoTuning, state } = useAdvancedConfiguration();
  const [isTuning, setIsTuning] = useState(false);
  const [tuningHistory, setTuningHistory] = useState<Array<{
    timestamp: Date;
    success: boolean;
    changes: number;
    improvements: string[];
  }>>([]);

  const runAutoTuning = useCallback(async () => {
    setIsTuning(true);
    try {
      const success = await performAutoTuning();
      const newEntry = {
        timestamp: new Date(),
        success,
        changes: state.metrics?.optimization?.applied?.length || 0,
        improvements: state.metrics?.optimization?.applied || []
      };
      setTuningHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Manter apenas os últimos 10
      return success;
    } catch (error) {
      console.error('Erro no auto-tuning:', error);
      return false;
    } finally {
      setIsTuning(false);
    }
  }, [performAutoTuning, state.metrics]);

  return {
    runAutoTuning,
    isTuning,
    tuningHistory,
    suggestions: state.metrics?.optimization?.suggestions || [],
    appliedOptimizations: state.metrics?.optimization?.applied || []
  };
}

// Hook para Health Check
export function useHealthCheck() {
  const { runHealthCheck } = useAdvancedConfiguration();
  const [isChecking, setIsChecking] = useState(false);
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const performHealthCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await runHealthCheck();
      setHealthData(result);
      setLastCheck(new Date());
      return result;
    } catch (error) {
      console.error('Erro no health check:', error);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [runHealthCheck]);

  // Health check automático a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isChecking) {
        performHealthCheck();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [performHealthCheck, isChecking]);

  return {
    performHealthCheck,
    isChecking,
    healthData,
    lastCheck,
    isHealthy: healthData?.overall === 'excellent' || healthData?.overall === 'good',
    criticalIssues: healthData?.issues.filter(issue => issue.type === 'error') || [],
    warnings: healthData?.issues.filter(issue => issue.type === 'warning') || [],
    recommendations: healthData?.recommendations || []
  };
}

// Hook para Resource Usage Analysis
export function useResourceAnalysis() {
  const { analyzeResourceUsage } = useAdvancedConfiguration();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<ResourceUsageAnalysis | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 segundos

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeResourceUsage();
      setAnalysisData(result);
      return result;
    } catch (error) {
      console.error('Erro na análise de recursos:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeResourceUsage]);

  // Análise automática baseada no intervalo
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnalyzing) {
        runAnalysis();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [runAnalysis, isAnalyzing, refreshInterval]);

  return {
    runAnalysis,
    isAnalyzing,
    analysisData,
    alerts: analysisData?.alerts || [],
    criticalAlerts: analysisData?.alerts.filter(alert => alert.type === 'critical') || [],
    warningAlerts: analysisData?.alerts.filter(alert => alert.type === 'warning') || [],
    recommendations: analysisData?.recommendations || [],
    setRefreshInterval
  };
}

// Hook para Backup Inteligente
export function useIntelligentBackup() {
  const { createIntelligentBackup } = useAdvancedConfiguration();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupHistory, setBackupHistory] = useState<Array<{
    timestamp: Date;
    success: boolean;
    size: string;
    type: 'manual' | 'automatic' | 'scheduled';
  }>>([]);

  const createBackup = useCallback(async (type: 'manual' | 'automatic' | 'scheduled' = 'manual') => {
    setIsBackingUp(true);
    try {
      const success = await createIntelligentBackup();
      const newBackup = {
        timestamp: new Date(),
        success,
        size: '0 KB', // Placeholder - seria calculado no serviço real
        type
      };
      setBackupHistory(prev => [newBackup, ...prev.slice(0, 19)]); // Manter últimos 20
      return success;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      return false;
    } finally {
      setIsBackingUp(false);
    }
  }, [createIntelligentBackup]);

  // Backup automático a cada hora
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isBackingUp) {
        createBackup('automatic');
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [createBackup, isBackingUp]);

  return {
    createBackup,
    isBackingUp,
    backupHistory,
    lastBackup: backupHistory[0] || null,
    recentBackups: backupHistory.slice(0, 5),
    backupStats: {
      total: backupHistory.length,
      successful: backupHistory.filter(b => b.success).length,
      failed: backupHistory.filter(b => !b.success).length
    }
  };
}

// Hook para Maintenance Tasks
export function useMaintenanceTasks() {
  const { runMaintenanceTasks } = useAdvancedConfiguration();
  const [isRunning, setIsRunning] = useState(false);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceResult[]>([]);
  const [scheduledMaintenance, setScheduledMaintenance] = useState<{
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    nextRun: Date | null;
  }>({
    enabled: false,
    frequency: 'weekly',
    nextRun: null
  });

  const runMaintenance = useCallback(async () => {
    setIsRunning(true);
    try {
      const result = await runMaintenanceTasks();
      setMaintenanceHistory(prev => [result, ...prev.slice(0, 9)]); // Manter últimos 10
      return result;
    } catch (error) {
      console.error('Erro na manutenção:', error);
      return null;
    } finally {
      setIsRunning(false);
    }
  }, [runMaintenanceTasks]);

  const scheduleMaintenanceCall = useCallback((enabled: boolean, frequency: 'daily' | 'weekly' | 'monthly') => {
    let intervalMs: number;
    
    switch (frequency) {
      case 'daily':
        intervalMs = 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        intervalMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'monthly':
        intervalMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        intervalMs = 7 * 24 * 60 * 60 * 1000;
    }

    const nextRun = enabled ? new Date(Date.now() + intervalMs) : null;

    setScheduledMaintenance({
      enabled,
      frequency,
      nextRun
    });
  }, []);

  return {
    runMaintenance,
    isRunning,
    maintenanceHistory,
    lastMaintenance: maintenanceHistory[0] || null,
    scheduledMaintenance,
    scheduleMaintenance: scheduleMaintenanceCall,
    maintenanceStats: {
      totalRuns: maintenanceHistory.length,
      averageDuration: maintenanceHistory.length > 0 
        ? maintenanceHistory.reduce((acc, m) => acc + m.duration, 0) / maintenanceHistory.length 
        : 0,
      totalCleaned: maintenanceHistory.reduce((acc, m) => acc + m.cleanedFiles, 0),
      totalOptimized: maintenanceHistory.reduce((acc, m) => acc + m.optimizedSettings, 0)
    }
  };
}

// Hook para Real-Time Monitoring
export function useRealTimeMonitoring() {
  const { startRealTimeMonitoring, stopRealTimeMonitoring, state } = useAdvancedConfiguration();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringData, setMonitoringData] = useState<{
    configChanges: number;
    performanceAlerts: number;
    securityEvents: number;
    lastUpdate: Date;
  }>({
    configChanges: 0,
    performanceAlerts: 0,
    securityEvents: 0,
    lastUpdate: new Date()
  });

  const startMonitoring = useCallback(async () => {
    try {
      await startRealTimeMonitoring();
      setIsMonitoring(true);
    } catch (error) {
      console.error('Erro ao iniciar monitoramento:', error);
    }
  }, [startRealTimeMonitoring]);

  const stopMonitoring = useCallback(async () => {
    try {
      await stopRealTimeMonitoring();
      setIsMonitoring(false);
    } catch (error) {
      console.error('Erro ao parar monitoramento:', error);
    }
  }, [stopRealTimeMonitoring]);

  // Simular dados de monitoramento baseados no estado
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setMonitoringData(prev => ({
          configChanges: state.history.length,
          performanceAlerts: Math.floor(Math.random() * 3),
          securityEvents: Math.floor(Math.random() * 2),
          lastUpdate: new Date()
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring, state.history.length]);

  return {
    startMonitoring,
    stopMonitoring,
    isMonitoring,
    monitoringData,
    alerts: {
      hasAlerts: monitoringData.performanceAlerts > 0 || monitoringData.securityEvents > 0,
      performance: monitoringData.performanceAlerts,
      security: monitoringData.securityEvents
    }
  };
}

// Hook para Advanced Export/Import
export function useAdvancedFileOperations() {
  const { exportAdvanced, importAdvanced, exportConfiguration, importConfiguration } = useAdvancedConfiguration();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportWithOptions = useCallback(async (options: ExportOptions = {}) => {
    setIsExporting(true);
    try {
      const data = await exportAdvanced(options);
      const filename = `config-${new Date().toISOString().split('T')[0]}.${options.format || 'json'}`;
      
      const blob = new Blob([data], { 
        type: options.format === 'yaml' ? 'text/yaml' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Erro no export avançado:', error);
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [exportAdvanced]);

  const importWithOptions = useCallback(async (file: File, options: ImportOptions = {}) => {
    setIsImporting(true);
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsText(file);
      });

      const success = await importAdvanced(content, options);
      return success;
    } catch (error) {
      console.error('Erro no import avançado:', error);
      return false;
    } finally {
      setIsImporting(false);
    }
  }, [importAdvanced]);

  return {
    exportWithOptions,
    importWithOptions,
    exportSimple: exportConfiguration,
    importSimple: importConfiguration,
    isExporting,
    isImporting,
    exportFormats: ['json', 'yaml', 'encrypted'] as const,
    importStrategies: ['overwrite', 'merge', 'preserve'] as const
  };
}

// Hook para Configuration Reports
export function useConfigurationReports() {
  const { generateReport } = useAdvancedConfiguration();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastReport, setLastReport] = useState<ConfigurationReport | null>(null);

  const createReport = useCallback(async (type: ConfigurationReport['type'] = 'full') => {
    setIsGenerating(true);
    try {
      const report = await generateReport(type);
      setLastReport(report);
      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [generateReport]);

  const downloadReport = useCallback((report: ConfigurationReport, format: 'json' | 'pdf' | 'html' = 'json') => {
    const filename = `config-report-${report.type}-${new Date().toISOString().split('T')[0]}.${format}`;
    
    let content: string;
    let mimeType: string;
    
    if (format === 'json') {
      content = JSON.stringify(report, null, 2);
      mimeType = 'application/json';
    } else if (format === 'html') {
      content = generateHTMLReport(report);
      mimeType = 'text/html';
    } else {
      // PDF não implementado ainda, retorna JSON
      content = JSON.stringify(report, null, 2);
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    createReport,
    downloadReport,
    isGenerating,
    lastReport,
    reportTypes: ['security', 'performance', 'compliance', 'full'] as const,
    exportFormats: ['json', 'pdf', 'html'] as const
  };
}

// Função helper para gerar relatório HTML
function generateHTMLReport(report: ConfigurationReport): string {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Configuração - ${report.type}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .score { font-size: 2em; font-weight: bold; color: ${getScoreColor(report.summary.totalScore)}; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #007bff; }
        .recommendation { background: #f1f3f4; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .high { border-left: 4px solid #dc3545; }
        .medium { border-left: 4px solid #ffc107; }
        .low { border-left: 4px solid #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório de Configuração</h1>
        <p><strong>Tipo:</strong> ${report.type}</p>
        <p><strong>Gerado em:</strong> ${report.generated}</p>
        <div class="score">${report.summary.totalScore}/100</div>
    </div>
    
    <div class="section">
        <h2>Resumo</h2>
        <p><strong>Problemas encontrados:</strong> ${report.summary.issues}</p>
        <p><strong>Recomendações:</strong> ${report.summary.recommendations}</p>
    </div>
    
    <div class="section">
        <h2>Recomendações</h2>
        ${report.recommendations.map(rec => `
            <div class="recommendation ${rec.priority}">
                <h4>${rec.category} - ${rec.priority.toUpperCase()}</h4>
                <p>${rec.description}</p>
                <p><strong>Impacto:</strong> ${rec.impact}</p>
                <p><strong>Esforço:</strong> ${rec.effort}</p>
            </div>
        `).join('')}
    </div>
</body>
</html>
  `;
}
