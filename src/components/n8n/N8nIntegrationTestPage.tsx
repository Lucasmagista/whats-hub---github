/**
 * 🧪 N8N Integration Test Page - FASE 1
 * Página para testar e demonstrar a integração N8N + WhatsApp
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Zap, 
  Bot, 
  Database,
  Server,
  Wifi,
  RefreshCw,
  Play,
  TestTube,
  Activity
} from 'lucide-react';
import { whatsHubIntegration, getIntegrationStatus, testConnectivity } from '@/services/whatsHubIntegration';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const N8nIntegrationTestPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<any>(null);

  // Executar testes de conectividade
  const runConnectivityTests = async () => {
    setIsLoading(true);
    const results: TestResult[] = [];

    try {
      // Teste 1: Conectividade N8N
      try {
        const n8nTest = await testConnectivity();
        results.push({
          name: 'Conectividade N8N',
          status: n8nTest ? 'success' : 'error',
          message: n8nTest ? 'N8N acessível' : 'N8N inacessível',
          details: { connected: n8nTest }
        });
      } catch (error) {
        results.push({
          name: 'Conectividade N8N',
          status: 'error',
          message: `Erro: ${error}`,
          details: { error }
        });
      }

      // Teste 2: Status da integração
      try {
        const status = await getIntegrationStatus();
        setIntegrationStatus(status);
        results.push({
          name: 'Status da Integração',
          status: status.overall === 'healthy' ? 'success' : status.overall === 'warning' ? 'warning' : 'error',
          message: `Status: ${status.overall}`,
          details: status
        });
      } catch (error) {
        results.push({
          name: 'Status da Integração',
          status: 'error',
          message: `Erro ao obter status: ${error}`,
          details: { error }
        });
      }

      // Teste 3: Variáveis de ambiente
      try {
        const env = await whatsHubIntegration.getEnvironmentInfo();
        results.push({
          name: 'Variáveis de Ambiente',
          status: 'success',
          message: 'Configurações carregadas',
          details: env
        });
      } catch (error) {
        results.push({
          name: 'Variáveis de Ambiente',
          status: 'error',
          message: `Erro: ${error}`,
          details: { error }
        });
      }

      // Teste 4: Conectar sistemas
      try {
        const connections = await whatsHubIntegration.connectSystems();
        const connected = Object.values(connections).filter(Boolean).length;
        const total = Object.keys(connections).length;
        
        results.push({
          name: 'Conexão de Sistemas',
          status: connected === total ? 'success' : connected > 0 ? 'warning' : 'error',
          message: `${connected}/${total} sistemas conectados`,
          details: connections
        });
      } catch (error) {
        results.push({
          name: 'Conexão de Sistemas',
          status: 'error',
          message: `Erro: ${error}`,
          details: { error }
        });
      }

    } catch (error) {
      results.push({
        name: 'Teste Geral',
        status: 'error',
        message: `Erro geral: ${error}`,
        details: { error }
      });
    } finally {
      setTestResults(results);
      setIsLoading(false);
    }
  };

  // Executar teste de workflow
  const testWorkflow = async () => {
    try {
      const result = await whatsHubIntegration.executeWorkflow('test-workflow', {
        message: 'Teste da integração WhatsHub + N8N',
        timestamp: new Date().toISOString()
      });
      
      console.log('Resultado do teste de workflow:', result);
      alert('Workflow executado com sucesso! Verifique o console para detalhes.');
    } catch (error) {
      console.error('Erro no teste de workflow:', error);
      alert(`Erro no workflow: ${error}`);
    }
  };

  // Executar sincronização
  const testSync = async () => {
    try {
      await whatsHubIntegration.syncConfigurations();
      alert('Sincronização executada com sucesso!');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      alert(`Erro na sincronização: ${error}`);
    }
  };

  useEffect(() => {
    runConnectivityTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <RefreshCw className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TestTube className="h-8 w-8 text-blue-600" />
          Teste de Integração N8N + WhatsApp
        </h1>
        <p className="text-muted-foreground mt-2">
          Página de testes para validar a integração da FASE 1
        </p>
      </div>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">Testes de Conectividade</TabsTrigger>
          <TabsTrigger value="status">Status da Integração</TabsTrigger>
          <TabsTrigger value="actions">Ações de Teste</TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Resultados dos Testes
              </CardTitle>
              <Button 
                onClick={runConnectivityTests}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Executar Testes
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${getStatusColor(result.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h3 className="font-semibold">{result.name}</h3>
                          <p className="text-sm opacity-80">{result.message}</p>
                        </div>
                      </div>                      <Badge variant={result.status === 'success' ? 'default' : 'secondary'}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                    {result.details && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium">
                          Detalhes técnicos
                        </summary>
                        <pre className="mt-2 p-2 bg-black/10 rounded text-xs overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status dos Sistemas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {integrationStatus ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-5 w-5" />
                      <span className="font-semibold">WhatsApp</span>
                    </div>
                    <Badge className={integrationStatus.systems?.whatsapp?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {integrationStatus.systems?.whatsapp?.connected ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5" />
                      <span className="font-semibold">N8N</span>
                    </div>
                    <Badge className={integrationStatus.systems?.n8n?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {integrationStatus.systems?.n8n?.connected ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5" />
                      <span className="font-semibold">Database</span>
                    </div>
                    <Badge className={integrationStatus.systems?.database?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {integrationStatus.systems?.database?.connected ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="h-5 w-5" />
                      <span className="font-semibold">Server</span>
                    </div>
                    <Badge className={integrationStatus.systems?.server?.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {integrationStatus.systems?.server?.status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Carregando status da integração...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Ações de Teste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={testWorkflow} className="h-20 flex flex-col gap-2">
                  <Zap className="h-6 w-6" />
                  Testar Workflow
                  <span className="text-xs opacity-70">Executar workflow de teste</span>
                </Button>

                <Button onClick={testSync} variant="outline" className="h-20 flex flex-col gap-2">
                  <RefreshCw className="h-6 w-6" />
                  Sincronizar
                  <span className="text-xs opacity-70">Sincronizar configurações</span>
                </Button>

                <Button onClick={runConnectivityTests} variant="secondary" className="h-20 flex flex-col gap-2">
                  <TestTube className="h-6 w-6" />
                  Re-executar Testes
                  <span className="text-xs opacity-70">Executar todos os testes</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default N8nIntegrationTestPage;
