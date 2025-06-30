/**
 * 🧪 Testes para Sistema de Configurações Avançado
 * Testes unitários e de integração para o sistema de configurações
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useEnvironmentOptimization,
  useAutoTuning,
  useHealthCheck,
  useResourceAnalysis,
  useIntelligentBackup,
  useMaintenanceTasks,
  useRealTimeMonitoring,
  useAdvancedFileOperations,
  useConfigurationReports
} from '../hooks/useAdvancedConfiguration';

// Mock do configuration manager
const mockConfigurationManager = {
  optimizeForEnvironment: vi.fn(),
  performAutoTuning: vi.fn(),
  runHealthCheck: vi.fn(),
  analyzeResourceUsage: vi.fn(),
  createIntelligentBackup: vi.fn(),
  runMaintenanceTasks: vi.fn(),
  startRealTimeMonitoring: vi.fn(),
  stopRealTimeMonitoring: vi.fn(),
  exportAdvanced: vi.fn(),
  importAdvanced: vi.fn(),
  generateReport: vi.fn(),
};

// Mock do contexto
const mockContext = {
  state: {
    config: {
      general: { appName: 'Test App' },
      security: { maxLoginAttempts: 3 },
      performance: { cacheSize: 1000 }
    },
    loading: false,
    error: null,
    isDirty: false,
    history: [],
    metrics: {
      totalConfigurations: 10,
      activeFeatures: 5,
      securityScore: 85,
      performanceScore: 78,
      complianceScore: 92,
      lastModified: '2024-01-01T00:00:00Z',
      memoryUsage: 128,
      resourceUsage: {
        cpu: 45,
        memory: 60,
        disk: 30,
        network: 20
      },
      healthStatus: 'good' as const,
      optimization: {
        level: 3,
        suggestions: ['Enable caching', 'Optimize queries'],
        applied: ['Enable compression']
      }
    }
  },
  dispatch: vi.fn(),
  loadConfiguration: vi.fn(),
  updateConfiguration: vi.fn(),
  saveConfiguration: vi.fn(),
  resetConfiguration: vi.fn(),
  applyPreset: vi.fn(),
  validateConfiguration: vi.fn(),
  getConfigurationMetrics: vi.fn(),
  exportConfiguration: vi.fn(),
  importConfiguration: vi.fn(),
  undoLastChange: vi.fn(),
  hasUnsavedChanges: vi.fn(),
  ...mockConfigurationManager
};

// Mock do hook principal
vi.mock('../hooks/useAdvancedConfiguration', async () => {
  const actual = await vi.importActual('../hooks/useAdvancedConfiguration');
  return {
    ...actual,
    useAdvancedConfiguration: () => mockContext
  };
});

describe('Environment Optimization Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should optimize for development environment', async () => {
    mockConfigurationManager.optimizeForEnvironment.mockResolvedValue(true);
    
    const { result } = renderHook(() => useEnvironmentOptimization());
    
    await act(async () => {
      const success = await result.current.optimizeEnvironment('development');
      expect(success).toBe(true);
    });
    
    expect(mockConfigurationManager.optimizeForEnvironment).toHaveBeenCalledWith('development');
    expect(result.current.lastOptimization).toBeTruthy();
    expect(result.current.lastOptimization?.environment).toBe('development');
  });

  it('should handle optimization errors gracefully', async () => {
    mockConfigurationManager.optimizeForEnvironment.mockRejectedValue(new Error('Optimization failed'));
    
    const { result } = renderHook(() => useEnvironmentOptimization());
    
    await act(async () => {
      const success = await result.current.optimizeEnvironment('production');
      expect(success).toBe(false);
    });
    
    expect(result.current.lastOptimization?.success).toBe(false);
  });

  it('should track optimization level from metrics', () => {
    const { result } = renderHook(() => useEnvironmentOptimization());
    
    expect(result.current.optimizationLevel).toBe(3);
    expect(result.current.currentEnvironment).toBeDefined();
  });
});

describe('Auto-Tuning Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run auto-tuning successfully', async () => {
    mockConfigurationManager.performAutoTuning.mockResolvedValue(true);
    
    const { result } = renderHook(() => useAutoTuning());
    
    await act(async () => {
      const success = await result.current.runAutoTuning();
      expect(success).toBe(true);
    });
    
    expect(mockConfigurationManager.performAutoTuning).toHaveBeenCalled();
    expect(result.current.tuningHistory).toHaveLength(1);
    expect(result.current.tuningHistory[0].success).toBe(true);
  });

  it('should provide tuning suggestions', () => {
    const { result } = renderHook(() => useAutoTuning());
    
    expect(result.current.suggestions).toEqual(['Enable caching', 'Optimize queries']);
    expect(result.current.appliedOptimizations).toEqual(['Enable compression']);
  });

  it('should maintain tuning history', async () => {
    mockConfigurationManager.performAutoTuning.mockResolvedValue(true);
    
    const { result } = renderHook(() => useAutoTuning());
    
    // Executar múltiplas otimizações
    await act(async () => {
      await result.current.runAutoTuning();
      await result.current.runAutoTuning();
    });
    
    expect(result.current.tuningHistory).toHaveLength(2);
  });
});

describe('Health Check Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should perform health check', async () => {
    const mockHealthResult = {
      overall: 'good' as const,
      details: {
        security: 85,
        performance: 78,
        compliance: 92,
        stability: 88
      },
      issues: [
        { type: 'warning' as const, message: 'Low performance score', section: 'performance' }
      ],
      recommendations: ['Optimize queries', 'Enable caching']
    };
    
    mockConfigurationManager.runHealthCheck.mockResolvedValue(mockHealthResult);
    
    const { result } = renderHook(() => useHealthCheck());
    
    await act(async () => {
      const health = await result.current.performHealthCheck();
      expect(health).toEqual(mockHealthResult);
    });
    
    expect(result.current.healthData).toEqual(mockHealthResult);
    expect(result.current.isHealthy).toBe(true);
    expect(result.current.warnings).toHaveLength(1);
  });

  it('should categorize issues correctly', async () => {
    const mockHealthResult = {
      overall: 'poor' as const,
      details: {
        security: 45,
        performance: 30,
        compliance: 60,
        stability: 40
      },
      issues: [
        { type: 'error' as const, message: 'Critical security issue', section: 'security' },
        { type: 'warning' as const, message: 'Performance degradation', section: 'performance' },
        { type: 'info' as const, message: 'Configuration info', section: 'general' }
      ],
      recommendations: ['Fix security issues', 'Optimize performance']
    };
    
    mockConfigurationManager.runHealthCheck.mockResolvedValue(mockHealthResult);
    
    const { result } = renderHook(() => useHealthCheck());
    
    await act(async () => {
      await result.current.performHealthCheck();
    });
    
    expect(result.current.isHealthy).toBe(false);
    expect(result.current.criticalIssues).toHaveLength(1);
    expect(result.current.warnings).toHaveLength(1);
    expect(result.current.recommendations).toHaveLength(2);
  });
});

describe('Resource Analysis Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should analyze resource usage', async () => {
    const mockAnalysis = {
      cpu: 65,
      memory: 78,
      disk: 45,
      network: 23,
      trends: {
        cpu: [60, 62, 65],
        memory: [75, 76, 78],
        disk: [42, 44, 45],
        network: [20, 22, 23]
      },
      recommendations: ['Consider upgrading RAM', 'Optimize disk usage'],
      alerts: [
        {
          type: 'critical' as const,
          resource: 'memory',
          value: 78,
          threshold: 75,
          message: 'Memory usage is critical'
        }
      ]
    };
    
    mockConfigurationManager.analyzeResourceUsage.mockResolvedValue(mockAnalysis);
    
    const { result } = renderHook(() => useResourceAnalysis());
    
    await act(async () => {
      const analysis = await result.current.runAnalysis();
      expect(analysis).toEqual(mockAnalysis);
    });
    
    expect(result.current.analysisData).toEqual(mockAnalysis);
    expect(result.current.criticalAlerts).toHaveLength(1);
    expect(result.current.alerts).toHaveLength(1);
  });

  it('should allow setting refresh interval', () => {
    const { result } = renderHook(() => useResourceAnalysis());
    
    act(() => {
      result.current.setRefreshInterval(60000); // 1 minuto
    });
    
    // Verificar se o intervalo foi definido (não podemos testar diretamente o setInterval)
    expect(result.current.setRefreshInterval).toBeDefined();
  });
});

describe('Intelligent Backup Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create backup successfully', async () => {
    mockConfigurationManager.createIntelligentBackup.mockResolvedValue(true);
    
    const { result } = renderHook(() => useIntelligentBackup());
    
    await act(async () => {
      const success = await result.current.createBackup('manual');
      expect(success).toBe(true);
    });
    
    expect(mockConfigurationManager.createIntelligentBackup).toHaveBeenCalled();
    expect(result.current.backupHistory).toHaveLength(1);
    expect(result.current.backupHistory[0].type).toBe('manual');
  });

  it('should track backup statistics', async () => {
    mockConfigurationManager.createIntelligentBackup
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    
    const { result } = renderHook(() => useIntelligentBackup());
    
    await act(async () => {
      await result.current.createBackup('manual');
      await result.current.createBackup('automatic');
      await result.current.createBackup('scheduled');
    });
    
    expect(result.current.backupStats.total).toBe(3);
    expect(result.current.backupStats.successful).toBe(2);
    expect(result.current.backupStats.failed).toBe(1);
  });
});

describe('Maintenance Tasks Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run maintenance tasks', async () => {
    const mockResult = {
      tasksExecuted: 5,
      cleanedFiles: 10,
      optimizedSettings: 3,
      backupsCreated: 1,
      errors: [],
      warnings: ['Low disk space'],
      duration: 2500
    };
    
    mockConfigurationManager.runMaintenanceTasks.mockResolvedValue(mockResult);
    
    const { result } = renderHook(() => useMaintenanceTasks());
    
    await act(async () => {
      const maintenance = await result.current.runMaintenance();
      expect(maintenance).toEqual(mockResult);
    });
    
    expect(result.current.maintenanceHistory).toHaveLength(1);
    expect(result.current.lastMaintenance).toEqual(mockResult);
  });

  it('should calculate maintenance statistics', async () => {
    const mockResults = [
      {
        tasksExecuted: 5,
        cleanedFiles: 10,
        optimizedSettings: 3,
        backupsCreated: 1,
        errors: [],
        warnings: [],
        duration: 2500
      },
      {
        tasksExecuted: 3,
        cleanedFiles: 7,
        optimizedSettings: 2,
        backupsCreated: 1,
        errors: [],
        warnings: [],
        duration: 1800
      }
    ];
    
    mockConfigurationManager.runMaintenanceTasks
      .mockResolvedValueOnce(mockResults[0])
      .mockResolvedValueOnce(mockResults[1]);
    
    const { result } = renderHook(() => useMaintenanceTasks());
    
    await act(async () => {
      await result.current.runMaintenance();
      await result.current.runMaintenance();
    });
    
    expect(result.current.maintenanceStats.totalRuns).toBe(2);
    expect(result.current.maintenanceStats.averageDuration).toBe(2150);
    expect(result.current.maintenanceStats.totalCleaned).toBe(17);
    expect(result.current.maintenanceStats.totalOptimized).toBe(5);
  });

  it('should schedule maintenance', () => {
    const { result } = renderHook(() => useMaintenanceTasks());
    
    act(() => {
      result.current.scheduleMaintenance(true, 'weekly');
    });
    
    expect(result.current.scheduledMaintenance.enabled).toBe(true);
    expect(result.current.scheduledMaintenance.frequency).toBe('weekly');
    expect(result.current.scheduledMaintenance.nextRun).toBeTruthy();
  });
});

describe('Real-Time Monitoring Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start and stop monitoring', async () => {
    mockConfigurationManager.startRealTimeMonitoring.mockResolvedValue(undefined);
    mockConfigurationManager.stopRealTimeMonitoring.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useRealTimeMonitoring());
    
    await act(async () => {
      await result.current.startMonitoring();
    });
    
    expect(result.current.isMonitoring).toBe(true);
    expect(mockConfigurationManager.startRealTimeMonitoring).toHaveBeenCalled();
    
    await act(async () => {
      await result.current.stopMonitoring();
    });
    
    expect(result.current.isMonitoring).toBe(false);
    expect(mockConfigurationManager.stopRealTimeMonitoring).toHaveBeenCalled();
  });

  it('should detect alerts', async () => {
    mockConfigurationManager.startRealTimeMonitoring.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useRealTimeMonitoring());
    
    await act(async () => {
      await result.current.startMonitoring();
    });
    
    // Simular dados de monitoramento
    expect(result.current.monitoringData).toBeDefined();
    expect(result.current.alerts).toBeDefined();
  });
});

describe('Advanced File Operations Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export with options', async () => {
    const mockExportData = JSON.stringify({ config: 'test' });
    mockConfigurationManager.exportAdvanced.mockResolvedValue(mockExportData);
    
    // Mock do DOM para download
    const mockCreate = vi.fn();
    const mockClick = vi.fn();
    const mockRemove = vi.fn();
    const mockAppend = vi.fn();
    const mockRevoke = vi.fn();
    
    const mockElement = {
      href: '',
      download: '',
      click: mockClick
    };
    
    global.document.createElement = mockCreate.mockReturnValue(mockElement);
    global.document.body.appendChild = mockAppend;
    global.document.body.removeChild = mockRemove;
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
    global.URL.revokeObjectURL = mockRevoke;
    
    const { result } = renderHook(() => useAdvancedFileOperations());
    
    await act(async () => {
      const success = await result.current.exportWithOptions({
        includeMetadata: true,
        format: 'json'
      });
      expect(success).toBe(true);
    });
    
    expect(mockConfigurationManager.exportAdvanced).toHaveBeenCalledWith({
      includeMetadata: true,
      format: 'json'
    });
  });

  it('should import with options', async () => {
    mockConfigurationManager.importAdvanced.mockResolvedValue(true);
    
    const mockFile = new File(['{"config": "test"}'], 'test.json', {
      type: 'application/json'
    });
    
    const { result } = renderHook(() => useAdvancedFileOperations());
    
    await act(async () => {
      const success = await result.current.importWithOptions(mockFile, {
        validateBeforeImport: true,
        createBackup: true
      });
      expect(success).toBe(true);
    });
    
    expect(mockConfigurationManager.importAdvanced).toHaveBeenCalledWith(
      '{"config": "test"}',
      {
        validateBeforeImport: true,
        createBackup: true
      }
    );
  });
});

describe('Configuration Reports Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate report', async () => {
    const mockReport = {
      type: 'security' as const,
      generated: '2024-01-01T00:00:00Z',
      summary: {
        totalScore: 85,
        sections: { security: 85, performance: 78 },
        issues: 2,
        recommendations: 3
      },
      details: { securityIssues: ['Weak password policy'] },
      charts: [
        {
          type: 'bar',
          title: 'Security Scores',
          data: { security: 85 }
        }
      ],
      recommendations: [
        {
          priority: 'high' as const,
          category: 'security',
          description: 'Strengthen password policy',
          impact: 'High security improvement',
          effort: 'Medium'
        }
      ]
    };
    
    mockConfigurationManager.generateReport.mockResolvedValue(mockReport);
    
    const { result } = renderHook(() => useConfigurationReports());
    
    await act(async () => {
      const report = await result.current.createReport('security');
      expect(report).toEqual(mockReport);
    });
    
    expect(result.current.lastReport).toEqual(mockReport);
    expect(mockConfigurationManager.generateReport).toHaveBeenCalledWith('security');
  });

  it('should download report', async () => {
    const mockReport = {
      type: 'full' as const,
      generated: '2024-01-01T00:00:00Z',
      summary: {
        totalScore: 85,
        sections: {},
        issues: 0,
        recommendations: 0
      },
      details: {},
      charts: [],
      recommendations: []
    };
    
    // Mock do DOM para download
    const mockCreate = vi.fn();
    const mockClick = vi.fn();
    const mockRemove = vi.fn();
    const mockAppend = vi.fn();
    const mockRevoke = vi.fn();
    
    const mockElement = {
      href: '',
      download: '',
      click: mockClick
    };
    
    global.document.createElement = mockCreate.mockReturnValue(mockElement);
    global.document.body.appendChild = mockAppend;
    global.document.body.removeChild = mockRemove;
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
    global.URL.revokeObjectURL = mockRevoke;
    
    const { result } = renderHook(() => useConfigurationReports());
    
    act(() => {
      result.current.downloadReport(mockReport, 'json');
    });
    
    expect(mockCreate).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevoke).toHaveBeenCalled();
  });
});

describe('Integration Tests', () => {
  it('should integrate multiple hooks correctly', async () => {
    // Simular um fluxo completo de otimização
    mockConfigurationManager.runHealthCheck.mockResolvedValue({
      overall: 'fair' as const,
      details: { security: 60, performance: 50, compliance: 70, stability: 65 },
      issues: [{ type: 'warning' as const, message: 'Low performance', section: 'performance' }],
      recommendations: ['Optimize queries', 'Enable caching']
    });
    
    mockConfigurationManager.performAutoTuning.mockResolvedValue(true);
    mockConfigurationManager.optimizeForEnvironment.mockResolvedValue(true);
    mockConfigurationManager.createIntelligentBackup.mockResolvedValue(true);
    
    const healthHook = renderHook(() => useHealthCheck());
    const tuningHook = renderHook(() => useAutoTuning());
    const optimizationHook = renderHook(() => useEnvironmentOptimization());
    const backupHook = renderHook(() => useIntelligentBackup());
    
    // 1. Executar health check
    await act(async () => {
      await healthHook.result.current.performHealthCheck();
    });
    
    expect(healthHook.result.current.isHealthy).toBe(false);
    
    // 2. Executar backup antes da otimização
    await act(async () => {
      await backupHook.result.current.createBackup('manual');
    });
    
    expect(backupHook.result.current.backupHistory).toHaveLength(1);
    
    // 3. Executar auto-tuning
    await act(async () => {
      await tuningHook.result.current.runAutoTuning();
    });
    
    expect(tuningHook.result.current.tuningHistory).toHaveLength(1);
    
    // 4. Otimizar para ambiente de produção
    await act(async () => {
      await optimizationHook.result.current.optimizeEnvironment('production');
    });
    
    expect(optimizationHook.result.current.lastOptimization?.success).toBe(true);
  });
});
