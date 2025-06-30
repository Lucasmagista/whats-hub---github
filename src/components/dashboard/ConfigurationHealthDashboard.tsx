/**
 * 🏥 Configuration Health Dashboard
 * Componente para monitorar e diagnosticar configurações
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useConfiguration } from '@/hooks/useConfiguration';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Download,
  Upload,
  Wrench,
  Activity
} from 'lucide-react';

export const ConfigurationHealthDashboard: React.FC = () => {
  const {
    health,
    loading,
    error,
    performDiagnostics,
    autoRepair,
    exportConfig,
    importConfig,
    validateConfig
  } = useConfiguration();

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleExport = () => {
    try {
      const configData = exportConfig();
      const blob = new Blob([configData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whatsHub-config-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar configurações:', err);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const configJson = e.target?.result as string;
          const success = await importConfig(configJson);
          if (success) {
            console.log('Configurações importadas com sucesso');
          }
        } catch (err) {
          console.error('Erro ao importar configurações:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAutoRepair = async () => {
    try {
      const success = await autoRepair();
      if (success) {
        console.log('Reparo automático executado com sucesso');
      }
    } catch (err) {
      console.error('Erro no reparo automático:', err);
    }
  };

  const handleValidation = () => {
    const validation = validateConfig();
    console.log('Resultado da validação:', validation);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Verificando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Status das Configurações
          </CardTitle>
          <CardDescription>
            Monitoramento em tempo real da saúde das configurações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor()}>
              {health.status === 'healthy' && 'Saudável'}
              {health.status === 'warning' && 'Atenção'}
              {health.status === 'critical' && 'Crítico'}
            </Badge>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={performDiagnostics}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleValidation}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Validar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problemas Detectados */}
      {health.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Problemas Detectados ({health.issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {health.issues.map((issue, index) => (
                <Alert key={`issue-${issue.slice(0, 20)}-${index}`}>
                  <AlertDescription>{issue}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sugestões */}
      {health.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Sugestões de Melhoria ({health.suggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.suggestions.map((suggestion, index) => (
                <div key={`suggestion-${suggestion.slice(0, 20)}-${index}`} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações de Manutenção */}
      <Card>
        <CardHeader>
          <CardTitle>Ferramentas de Manutenção</CardTitle>
          <CardDescription>
            Opções para backup, restauração e reparo das configurações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Configurações
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => document.getElementById('import-config')?.click()}
            >
              <Upload className="h-4 w-4" />
              Importar Configurações
            </Button>
            
            <Button
              variant="outline"
              onClick={handleAutoRepair}
              disabled={loading || health.status === 'healthy'}
              className="flex items-center gap-2"
            >
              <Wrench className="h-4 w-4" />
              Reparo Automático
            </Button>
            
            <Button
              variant="outline"
              onClick={performDiagnostics}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Executar Diagnóstico
            </Button>
          </div>
          
          <input
            id="import-config"
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            aria-label="Importar arquivo de configuração"
            title="Selecionar arquivo de configuração JSON"
          />
        </CardContent>
      </Card>

      {/* Erros */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
