import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Plus, 
  TestTube,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { integrationApiService, LocalIntegrationStorage, IntegrationConfig } from '@/services/integrationApiService';
import { useToast } from '@/hooks/use-toast';

interface IntegrationPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: 'automation' | 'crm' | 'ai' | 'communication' | 'analytics';
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  isConfigured: boolean;
  lastSync?: string;
  activeWorkflows?: number;
}

const IntegrationPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('platforms');
  const [platforms, setPlatforms] = useState<IntegrationPlatform[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const loadAvailablePlatforms = useCallback(() => {
    const mockPlatforms: IntegrationPlatform[] = [
      {
        id: 'n8n',
        name: 'n8n',
        icon: '🔗',
        color: 'bg-purple-500',
        category: 'automation',
        status: 'disconnected',
        description: 'Automação de workflows self-hosted',
        isConfigured: false,
        activeWorkflows: 0
      },
      {
        id: 'zapier',
        name: 'Zapier',
        icon: '⚡',
        color: 'bg-orange-500',
        category: 'automation',
        status: 'disconnected',
        description: 'Automação entre aplicativos',
        isConfigured: false,
        activeWorkflows: 0
      },
      {
        id: 'make',
        name: 'Make.com',
        icon: '🔧',
        color: 'bg-blue-500',
        category: 'automation',
        status: 'disconnected',
        description: 'Plataforma de automação visual',
        isConfigured: false,
        activeWorkflows: 0
      },
      {
        id: 'hubspot',
        name: 'HubSpot',
        icon: '🎯',
        color: 'bg-orange-600',
        category: 'crm',
        status: 'disconnected',
        description: 'CRM e Marketing Automation',
        isConfigured: false,
        activeWorkflows: 0
      },
      {
        id: 'salesforce',
        name: 'Salesforce',
        icon: '☁️',
        color: 'bg-blue-600',
        category: 'crm',
        status: 'disconnected',
        description: 'CRM empresarial',
        isConfigured: false,
        activeWorkflows: 0
      },
      {
        id: 'openai',
        name: 'OpenAI',
        icon: '🤖',
        color: 'bg-green-500',
        category: 'ai',
        status: 'disconnected',
        description: 'IA e processamento de linguagem natural',
        isConfigured: false,
        activeWorkflows: 0
      }
    ];

    // Atualizar status das plataformas baseado nas integrações configuradas
    const updatedPlatforms = mockPlatforms.map(platform => {
      const integration = integrations.find(i => i.platformId === platform.id);
      return {
        ...platform,
        status: (integration?.isActive ? 'connected' : 'disconnected') as 'connected' | 'disconnected' | 'error',
        isConfigured: !!integration,
        lastSync: integration?.lastSync
      };
    });
    
    setPlatforms(updatedPlatforms);
  }, [integrations]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Tentar carregar do backend primeiro
      const response = await integrationApiService.getIntegrations();
      
      if (response.success && response.data) {
        setIntegrations(response.data);
      } else {
        console.warn('Fallback para localStorage:', response.message);
        // Fallback para localStorage
        const localIntegrations = LocalIntegrationStorage.getIntegrations();
        setIntegrations(localIntegrations);
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
      // Fallback para localStorage
      const localIntegrations = LocalIntegrationStorage.getIntegrations();
      setIntegrations(localIntegrations);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Atualizar plataformas quando integrações mudarem
  useEffect(() => {
    loadAvailablePlatforms();
  }, [integrations, loadAvailablePlatforms]);

  const handleTestConnection = async (platformId: string) => {
    setTestingConnection(platformId);
    try {
      const integration = integrations.find(i => i.platformId === platformId);
      
      if (!integration) {
        toast({
          title: "Erro",
          description: "Integração não encontrada. Configure primeiro.",
          variant: "destructive"
        });
        return;
      }

      const response = await integrationApiService.testIntegrationConnection(integration.id);
      
      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Conexão testada com sucesso!",
          variant: "default"
        });
        
        // Atualizar status da plataforma
        setPlatforms(prev => prev.map(p => 
          p.id === platformId 
            ? { ...p, status: 'connected' as const, lastSync: new Date().toISOString() }
            : p
        ));
      } else {
        toast({
          title: "Erro de Conexão",
          description: response.message ?? "Falha ao testar conexão",
          variant: "destructive"
        });
        
        setPlatforms(prev => prev.map(p => 
          p.id === platformId 
            ? { ...p, status: 'error' as const }
            : p
        ));
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Erro",
        description: "Falha ao testar conexão",
        variant: "destructive"
      });
      
      setPlatforms(prev => prev.map(p => 
        p.id === platformId 
          ? { ...p, status: 'error' as const }
          : p
      ));
    } finally {
      setTestingConnection(null);
    }
  };

  const handleConfigurePlatform = (platformId: string) => {
    console.log(`Configurando plataforma: ${platformId}`);
    toast({
      title: "Em desenvolvimento",
      description: "Modal de configuração será implementado em breve",
      variant: "default"
    });
    // Aqui seria aberto um modal de configuração
  };

  const handleSyncIntegration = async (platformId: string) => {
    try {
      const integration = integrations.find(i => i.platformId === platformId);
      
      if (!integration) {
        toast({
          title: "Erro",
          description: "Integração não encontrada",
          variant: "destructive"
        });
        return;
      }

      const response = await integrationApiService.syncIntegration(integration.id);
      
      if (response.success) {
        toast({
          title: "Sincronização concluída",
          description: "Dados sincronizados com sucesso",
          variant: "default"
        });
        
        // Atualizar timestamp da última sincronização
        setPlatforms(prev => prev.map(p => 
          p.id === platformId 
            ? { ...p, lastSync: new Date().toISOString() }
            : p
        ));
      } else {
        toast({
          title: "Erro de Sincronização",
          description: response.message ?? "Falha na sincronização",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error syncing integration:', error);
      toast({
        title: "Erro",
        description: "Falha na sincronização",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="outline" className="text-green-600 border-green-200">Conectado</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-200">Erro</Badge>;
      default:
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Desconectado</Badge>;
    }
  };

  const filteredPlatforms = platforms.filter(platform => {
    if (activeTab === 'platforms') return true;
    return platform.category === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando integrações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Integrações</h2>
        <p className="text-gray-600">Gerencie suas integrações com plataformas externas</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="platforms">Todas</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="communication">Comunicação</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlatforms.map((platform) => (
              <Card key={platform.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center text-white text-lg`}>
                        {platform.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <p className="text-sm text-gray-500">{platform.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(platform.status)}
                      {getStatusBadge(platform.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {platform.lastSync && (
                      <div className="text-xs text-gray-500">
                        Última sincronização: {new Date(platform.lastSync).toLocaleString()}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Workflows Ativos:</span>
                      <Badge variant="outline">{platform.activeWorkflows ?? 0}</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {platform.status === 'connected' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestConnection(platform.id)}
                            disabled={testingConnection === platform.id}
                          >
                            {testingConnection === platform.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                            Testar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSyncIntegration(platform.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                            Sincronizar
                          </Button>
                        </>
                      )}
                      
                      {!platform.isConfigured ? (
                        <Button
                          size="sm"
                          onClick={() => handleConfigurePlatform(platform.id)}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Conectar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfigurePlatform(platform.id)}
                          className="flex-1"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Configurar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredPlatforms.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma plataforma encontrada
          </h3>
          <p className="text-gray-600">
            Não há plataformas disponíveis nesta categoria.
          </p>
        </div>
      )}
    </div>
  );
};

export default IntegrationPage;
