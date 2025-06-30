/**
 * 🎯 EXEMPLOS PRÁTICOS - Sistema de Configurações Avançado
 * Demonstrações de como usar todos os recursos implementados
 */

import React from 'react';
import { ConfigurationProvider } from '@/contexts/ConfigurationContext';
import { 
  useAdvancedConfiguration,
  useConfigurationSection,
  useConfigurationMonitoring,
  useConfigurationValidation,
  useConfigurationPresets,
  useConfigurationAnalytics
} from '@/hooks/useAdvancedConfiguration';
import { configurationManager } from '@/services/configurationManager';

// ===============================================
// EXEMPLO 1: DASHBOARD BÁSICO COM MÉTRICAS
// ===============================================

export const BasicDashboardExample: React.FC = () => {
  const { state, saveConfiguration } = useAdvancedConfiguration();
  const { metrics, healthStatus } = useConfigurationAnalytics();
  const { isValid, errors, warnings } = useConfigurationValidation();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Dashboard de Configurações</h2>
      
      {/* Status Geral */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Status do Sistema</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="block text-sm text-gray-600">Health Status</span>
            <span className={`font-bold ${healthStatus === 'excellent' ? 'text-green-600' : 'text-yellow-600'}`}>
              {healthStatus.toUpperCase()}
            </span>
          </div>
          <div>
            <span className="block text-sm text-gray-600">Configuração Válida</span>
            <span className={isValid ? 'text-green-600' : 'text-red-600'}>
              {isValid ? 'SIM' : 'NÃO'}
            </span>
          </div>
          <div>
            <span className="block text-sm text-gray-600">Alterações Pendentes</span>
            <span className={state.isDirty ? 'text-orange-600' : 'text-green-600'}>
              {state.isDirty ? 'SIM' : 'NÃO'}
            </span>
          </div>
        </div>
      </div>

      {/* Métricas */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800">Segurança</h4>
            <div className="text-2xl font-bold text-blue-600">{metrics.securityScore}/100</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800">Performance</h4>
            <div className="text-2xl font-bold text-green-600">{metrics.performanceScore}/100</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800">Compliance</h4>
            <div className="text-2xl font-bold text-purple-600">{metrics.complianceScore}/100</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800">Features Ativas</h4>
            <div className="text-2xl font-bold text-gray-600">{metrics.activeFeatures}</div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">Erros de Configuração</h4>
          {errors.map((error, index) => (
            <div key={index} className="text-red-700">• {error}</div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Avisos</h4>
          {warnings.map((warning, index) => (
            <div key={index} className="text-yellow-700">• {warning}</div>
          ))}
        </div>
      )}

      <button
        onClick={() => saveConfiguration()}
        disabled={!state.isDirty}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Salvar Configurações
      </button>
    </div>
  );
};

// ===============================================
// EXEMPLO 2: CONFIGURAÇÃO DE SEGURANÇA
// ===============================================

export const SecurityConfigExample: React.FC = () => {
  const { data: security, update: updateSecurity } = useConfigurationSection('security');
  
  const handleSecurityChange = async (field: string, value: any) => {
    await updateSecurity({
      ...security,
      [field]: value
    });
  };

  if (!security) return <div>Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Configurações de Segurança</h2>
      
      {/* Criptografia */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Criptografia</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={security.encryption.enabled}
              onChange={(e) => handleSecurityChange('encryption', {
                ...security.encryption,
                enabled: e.target.checked
              })}
              className="mr-2"
            />
            Habilitar criptografia
          </label>
          
          <div>
            <label className="block text-sm font-medium mb-1">Algoritmo</label>
            <select
              value={security.encryption.algorithm}
              onChange={(e) => handleSecurityChange('encryption', {
                ...security.encryption,
                algorithm: e.target.value
              })}
              className="border rounded px-3 py-2"
            >
              <option value="AES-256-GCM">AES-256-GCM</option>
              <option value="ChaCha20-Poly1305">ChaCha20-Poly1305</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Rotação de chaves (dias): {security.encryption.keyRotationInterval}
            </label>
            <input
              type="range"
              min="7"
              max="365"
              value={security.encryption.keyRotationInterval}
              onChange={(e) => handleSecurityChange('encryption', {
                ...security.encryption,
                keyRotationInterval: parseInt(e.target.value)
              })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Autenticação */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Autenticação</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={security.authentication.multiFactorAuth}
              onChange={(e) => handleSecurityChange('authentication', {
                ...security.authentication,
                multiFactorAuth: e.target.checked
              })}
              className="mr-2"
            />
            Autenticação multi-fator
          </label>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Timeout de sessão (minutos)
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              value={security.authentication.sessionExpiryTime}
              onChange={(e) => handleSecurityChange('authentication', {
                ...security.authentication,
                sessionExpiryTime: parseInt(e.target.value)
              })}
              className="border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Máximo de tentativas de login
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={security.authentication.maxLoginAttempts}
              onChange={(e) => handleSecurityChange('authentication', {
                ...security.authentication,
                maxLoginAttempts: parseInt(e.target.value)
              })}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// EXEMPLO 3: APLICAÇÃO DE PRESETS
// ===============================================

export const PresetsExample: React.FC = () => {
  const { applyPreset, availablePresets } = useConfigurationPresets();
  const { state } = useAdvancedConfiguration();
  
  const handleApplyPreset = async (presetKey: string) => {
    const success = await applyPreset(presetKey);
    if (success) {
      alert(`Preset '${presetKey}' aplicado com sucesso!`);
    } else {
      alert('Erro ao aplicar preset');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Configurações Predefinidas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(availablePresets).map(([key, preset]) => (
          <div key={key} className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">{preset.name}</h3>
            <p className="text-gray-600 mb-3">{preset.description}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-sm ${
                preset.category === 'security' ? 'bg-red-100 text-red-800' :
                preset.category === 'performance' ? 'bg-green-100 text-green-800' :
                preset.category === 'development' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {preset.category}
              </span>
              <button
                onClick={() => handleApplyPreset(key)}
                disabled={state.loading}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Aplicar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===============================================
// EXEMPLO 4: MONITORAMENTO EM TEMPO REAL
// ===============================================

export const MonitoringExample: React.FC = () => {
  const { metrics, isDirty, history, lastChange } = useConfigurationMonitoring();
  
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Monitoramento em Tempo Real</h2>
      
      {/* Status Atual */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-3">Status Atual</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Alterações Pendentes</span>
            <div className={`text-lg font-semibold ${isDirty ? 'text-orange-600' : 'text-green-600'}`}>
              {isDirty ? 'SIM' : 'NÃO'}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Uso de Memória</span>
            <div className="text-lg font-semibold">
              {metrics ? (metrics.memoryUsage / 1024).toFixed(2) : 0} KB
            </div>
          </div>
        </div>
      </div>

      {/* Última Alteração */}
      {lastChange && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Última Alteração</h3>
          <div className="text-blue-700">
            <div><strong>Ação:</strong> {lastChange.action}</div>
            <div><strong>Horário:</strong> {lastChange.timestamp.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Histórico */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-3">Histórico Recente</h3>
        {history.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.slice(-10).reverse().map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{item.action}</span>
                <span className="text-xs text-gray-500">
                  {item.timestamp.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">
            Nenhuma alteração registrada
          </div>
        )}
      </div>
    </div>
  );
};

// ===============================================
// EXEMPLO 5: OPERAÇÕES PROGRAMÁTICAS
// ===============================================

export const ProgrammaticExample: React.FC = () => {
  const [results, setResults] = React.useState<any>(null);
  
  const runExamples = async () => {
    const examples = {
      metrics: configurationManager.getConfigurationMetrics(),
      report: configurationManager.generateConfigurationReport(),
      presets: configurationManager.getPresetConfigurations(),
      validation: configurationManager.validateConfiguration()
    };
    
    setResults(examples);
  };

  React.useEffect(() => {
    runExamples();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Operações Programáticas</h2>
      
      <div className="space-y-4">
        <button
          onClick={runExamples}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Executar Análises
        </button>

        {results && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Resultados:</h3>
            <pre className="text-sm overflow-auto max-h-96 bg-white p-4 rounded border">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Exemplos de código */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-3">Exemplos de Código</h3>
        <div className="space-y-4">
          
          <div>
            <h4 className="font-medium mb-2">1. Aplicar Preset de Alta Segurança</h4>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              configurationManager.applyPresetConfiguration('high-security');
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">2. Obter Métricas em Tempo Real</h4>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              const metrics = configurationManager.getConfigurationMetrics();
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">3. Gerar Relatório de Saúde</h4>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              const report = configurationManager.generateConfigurationReport();
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">4. Comparar Configurações</h4>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              const comparison = configurationManager.compareConfigurations(otherConfig);
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// EXEMPLO 6: APLICAÇÃO COMPLETA
// ===============================================

export const CompleteExample: React.FC = () => {
  return (
    <ConfigurationProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <BasicDashboardExample />
          <SecurityConfigExample />
          <PresetsExample />
          <MonitoringExample />
          <ProgrammaticExample />
        </div>
      </div>
    </ConfigurationProvider>
  );
};

// ===============================================
// UTILITÁRIOS E HELPERS
// ===============================================

export const ConfigurationUtils = {
  // Exportar configuração atual
  exportCurrentConfig: () => {
    const config = configurationManager.exportConfiguration();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Importar configuração de arquivo
  importConfigFromFile: (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const result = configurationManager.importConfiguration(content);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  // Resetar para configurações padrão
  resetToDefaults: () => {
    const confirmation = window.confirm(
      'Tem certeza que deseja resetar todas as configurações para o padrão? Esta ação não pode ser desfeita.'
    );
    if (confirmation) {
      configurationManager.resetToDefaults();
      window.location.reload(); // Recarregar para aplicar mudanças
    }
  },

  // Verificar saúde do sistema
  checkSystemHealth: () => {
    const metrics = configurationManager.getConfigurationMetrics();
    const report = configurationManager.generateConfigurationReport();
    
    return {
      overallHealth: report.healthStatus,
      securityScore: metrics.securityScore,
      performanceScore: metrics.performanceScore,
      complianceScore: metrics.complianceScore,
      recommendations: report.recommendations,
      warnings: report.warnings
    };
  }
};

export default CompleteExample;
