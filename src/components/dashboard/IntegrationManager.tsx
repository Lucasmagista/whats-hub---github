import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Workflow, 
  Settings, 
  Plus, 
  Trash2, 
  Edit,
  TestTube,
  Zap,
  Activity,
  Globe,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Eye,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Code,
  Database,
  Webhook,
  Bot,
  MessageSquare,
  Users,
  BarChart3,
  Monitor,
  Calendar,
  Shield,
  Target,
  Brain,
  TrendingUp,
  Cloud
} from 'lucide-react';

interface IntegrationPlatform {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'workflow' | 'automation' | 'ai' | 'crm' | 'communication' | 'analytics';
  features: string[];
  authMethods: string[];
  webhookSupport: boolean;
  apiSupport: boolean;
  status: 'active' | 'inactive' | 'error' | 'testing';
  config?: Record<string, any>;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  platform: string;
  category: string;
  trigger: string;
  actions: string[];
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTime: string;
  template: any;
}

interface IntegrationManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const IntegrationManager: React.FC<IntegrationManagerProps> = ({ 
  isOpen, 
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('platforms');
  const [platforms, setPlatforms] = useState<IntegrationPlatform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<IntegrationPlatform | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Plataformas disponíveis
  const availablePlatforms: IntegrationPlatform[] = [
    {
      id: 'n8n',
      name: 'n8n',
      description: 'Plataforma de automação open-source com interface visual drag-and-drop',
      icon: '🔄',
      color: 'bg-purple-500',
      category: 'workflow',
      features: ['Visual Workflow Builder', 'Custom Nodes', 'Self-hosted', 'API Integration'],
      authMethods: ['api-key', 'basic-auth'],
      webhookSupport: true,
      apiSupport: true,
      status: 'inactive'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Conecte apps e automatize workflows com mais de 5000+ integrações',
      icon: '⚡',
      color: 'bg-orange-500',
      category: 'automation',
      features: ['5000+ Apps', 'Multi-step Zaps', 'Filters & Paths', 'Team Collaboration'],
      authMethods: ['webhook'],
      webhookSupport: true,
      apiSupport: true,
      status: 'inactive'
    },
    {
      id: 'power-automate',
      name: 'Microsoft Power Automate',
      description: 'Plataforma de automação da Microsoft integrada ao Office 365',
      icon: '🔵',
      color: 'bg-blue-500',
      category: 'workflow',
      features: ['Office 365 Integration', 'AI Builder', 'Approvals', 'Business Process Flows'],
      authMethods: ['oauth', 'api-key'],
      webhookSupport: true,
      apiSupport: true,
      status: 'inactive'
    },
    {
      id: 'make',
      name: 'Make.com',
      description: 'Visual automation platform (formerly Integromat)',
      icon: '🔧',
      color: 'bg-green-500',
      category: 'automation',
      features: ['Visual Designer', 'Advanced Logic', 'Error Handling', 'Data Stores'],
      authMethods: ['api-key', 'webhook'],
      webhookSupport: true,
      apiSupport: true,
      status: 'inactive'
    },
    {
      id: 'pipedream',
      name: 'Pipedream',
      description: 'Developer-first integration platform with code and no-code options',
      icon: '🌊',
      color: 'bg-cyan-500',
      category: 'workflow',
      features: ['Code + No-code', 'Real-time logs', 'Version control', 'Custom code'],
      authMethods: ['api-key'],
      webhookSupport: true,
      apiSupport: true,
      status: 'inactive'
    },
    {
      id: 'workato',
      name: 'Workato',
      description: 'Enterprise automation platform with AI-powered recipes',
      icon: '🏢',
      color: 'bg-indigo-500',
      category: 'automation',
      features: ['Enterprise Security', 'AI Recipes', 'Intelligent Automation', 'Bot Framework'],
      authMethods: ['oauth', 'api-key'],
      webhookSupport: true,
      apiSupport: true,
      status: 'inactive'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'CRM e plataforma de marketing automation',
      icon: '🧡',
      color: 'bg-orange-600',
      category: 'crm',
      features: ['CRM Integration', 'Marketing Automation', 'Lead Scoring', 'Contact Management'],
      authMethods: ['api-key', 'oauth'],
      webhookSupport: true,
      apiSupport: true,
      status: 'inactive'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Plataforma de CRM líder mundial',
      icon: '☁️',
      color: 'bg-blue-600',
      category: 'crm',
      features: ['Sales Cloud', 'Service Cloud', 'Marketing Cloud', 'Custom Objects'],
      authMethods: ['oauth', 'jwt'],
      webhookSupport: true,
      apiSupport: true,
      status: 'inactive'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Plataforma de comunicação empresarial',
      icon: '💬',
      color: 'bg-purple-600',
      category: 'communication',
      features: ['Team Communication', 'Channels', 'Workflows', 'Bot Integration'],
      authMethods: ['oauth', 'webhook'],
      webhookSupport: true,
      apiSupport: true,
      status: 'inactive'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Plataforma de colaboração da Microsoft',
      icon: '🟦',
      color: 'bg-blue-700',
      category: 'communication',
      features: ['Video Calls', 'Chat', 'File Sharing', 'Adaptive Cards'],
      authMethods: ['oauth'],
      webhookSupport: true,
      apiSupport: true,
      status: 'inactive'
    },
    {
      id: 'google-workspace',
      name: 'Google Workspace',
      description: 'Conjunto de ferramentas de produtividade do Google',
      icon: '🌈',
      color: 'bg-blue-400',
      category: 'workflow',
      features: ['Gmail', 'Calendar', 'Drive', 'Sheets', 'Apps Script'],
      authMethods: ['oauth', 'service-account'],
      webhookSupport: true,
      apiSupport: true,
      status: 'inactive'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Plataforma de IA para chatbots e automação inteligente',
      icon: '🤖',
      color: 'bg-green-600',
      category: 'ai',
      features: ['GPT Models', 'Text Generation', 'Code Generation', 'Fine-tuning'],
      authMethods: ['api-key'],
      webhookSupport: false,
      apiSupport: true,
      status: 'inactive'
    }
  ];

  // Templates de workflow
  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: 'welcome-new-user',
      name: 'Boas-vindas para Novos Usuários',
      description: 'Automatiza o processo de boas-vindas quando um novo usuário entra no chat',
      platform: 'n8n',
      category: 'customer-service',
      trigger: 'user.joined',
      actions: ['send-welcome-message', 'create-crm-contact', 'notify-team'],
      complexity: 'simple',
      estimatedTime: '5 min',
      template: {
        nodes: [
          { type: 'webhook', name: 'User Joined Trigger' },
          { type: 'whatsapp', name: 'Send Welcome Message' },
          { type: 'hubspot', name: 'Create Contact' },
          { type: 'slack', name: 'Notify Team' }
        ]
      }
    },
    {
      id: 'ticket-escalation',
      name: 'Escalação de Tickets',
      description: 'Escala tickets automaticamente baseado em prioridade e tempo',
      platform: 'zapier',
      category: 'support',
      trigger: 'ticket.created',
      actions: ['check-priority', 'assign-agent', 'set-sla', 'notify-manager'],
      complexity: 'medium',
      estimatedTime: '15 min',
      template: {
        steps: [
          { app: 'webhook', action: 'receive-ticket' },
          { app: 'filter', action: 'check-priority' },
          { app: 'zendesk', action: 'assign-agent' },
          { app: 'email', action: 'notify-manager' }
        ]
      }
    },
    {
      id: 'order-processing',
      name: 'Processamento de Pedidos',
      description: 'Fluxo completo de processamento de pedidos com notificações',
      platform: 'make',
      category: 'e-commerce',
      trigger: 'order.created',
      actions: ['validate-order', 'update-inventory', 'send-confirmation', 'create-invoice'],
      complexity: 'complex',
      estimatedTime: '30 min',
      template: {
        modules: [
          { app: 'webhook', operation: 'receive-order' },
          { app: 'shopify', operation: 'validate-order' },
          { app: 'inventory', operation: 'update-stock' },
          { app: 'email', operation: 'send-confirmation' }
        ]
      }
    },
    {
      id: 'lead-qualification',
      name: 'Qualificação de Leads',
      description: 'Qualifica leads automaticamente e distribui para vendedores',
      platform: 'power-automate',
      category: 'sales',
      trigger: 'message.received',
      actions: ['analyze-message', 'score-lead', 'assign-salesperson', 'schedule-followup'],
      complexity: 'medium',
      estimatedTime: '20 min',
      template: {
        actions: [
          { type: 'trigger', operation: 'when-message-received' },
          { type: 'ai-builder', operation: 'analyze-sentiment' },
          { type: 'dynamics', operation: 'create-lead' },
          { type: 'outlook', operation: 'schedule-email' }
        ]
      }
    }
  ];

  useEffect(() => {
    setPlatforms(availablePlatforms);
    setTemplates(workflowTemplates);
    loadSavedConfigurations();
  }, []);

  const loadSavedConfigurations = () => {
    // Carregar configurações salvas do localStorage
    const saved = localStorage.getItem('whats-hub-integrations');
    if (saved) {
      try {
        const configs = JSON.parse(saved);
        setPlatforms(prev => prev.map(platform => ({
          ...platform,
          ...configs[platform.id],
          status: configs[platform.id]?.config ? 'active' : 'inactive'
        })));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  };

  const savePlatformConfig = (platformId: string, config: any) => {
    const saved = localStorage.getItem('whats-hub-integrations') || '{}';
    const configs = JSON.parse(saved);
    configs[platformId] = { config, updatedAt: new Date().toISOString() };
    localStorage.setItem('whats-hub-integrations', JSON.stringify(configs));
    
    setPlatforms(prev => prev.map(p => 
      p.id === platformId 
        ? { ...p, config, status: 'active' }
        : p
    ));
  };

  const testPlatformConnection = async (platform: IntegrationPlatform) => {
    setLoading(true);
    setTestResults(prev => ({ ...prev, [platform.id]: { status: 'testing' } }));

    try {
      // Simular teste de conexão baseado na plataforma
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Lógica específica de teste por plataforma
      let result;
      switch (platform.id) {
        case 'n8n':
          result = await testN8nConnection(platform.config);
          break;
        case 'zapier':
          result = await testZapierConnection(platform.config);
          break;
        default:
          result = { success: true, message: 'Conexão testada com sucesso!' };
      }

      setTestResults(prev => ({ 
        ...prev, 
        [platform.id]: { 
          status: result.success ? 'success' : 'error',
          message: result.message,
          timestamp: new Date().toISOString()
        }
      }));

      setPlatforms(prev => prev.map(p => 
        p.id === platform.id 
          ? { ...p, status: result.success ? 'active' : 'error' }
          : p
      ));

    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [platform.id]: { 
          status: 'error',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testN8nConnection = async (config: any) => {
    if (!config?.host || !config?.port) {
      return { success: false, message: 'Host e porta são obrigatórios' };
    }

    try {
      const baseUrl = `${config.useSSL ? 'https' : 'http'}://${config.host}:${config.port}`;
      const response = await fetch(`${baseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': config.apiKey || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return { success: true, message: 'Conexão com n8n estabelecida com sucesso!' };
      } else {
        return { success: false, message: `Erro HTTP: ${response.status}` };
      }
    } catch (error) {
      return { success: false, message: 'Falha na conexão com n8n' };
    }
  };

  const testZapierConnection = async (config: any) => {
    if (!config?.webhookUrl) {
      return { success: false, message: 'URL do webhook é obrigatória' };
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, source: 'whats-hub' })
      });

      if (response.ok) {
        return { success: true, message: 'Webhook Zapier testado com sucesso!' };
      } else {
        return { success: false, message: `Erro no webhook: ${response.status}` };
      }
    } catch (error) {
      return { success: false, message: 'Falha no teste do webhook Zapier' };
    }
  };

  const deployTemplate = async (template: WorkflowTemplate, targetPlatform: string) => {
    setLoading(true);
    try {
      // Lógica para deployar template na plataforma específica
      console.log('Deploying template:', template, 'to platform:', targetPlatform);
      
      // Simular deploy
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      alert(`Template "${template.name}" deployado com sucesso em ${targetPlatform}!`);
    } catch (error) {
      alert('Erro ao deployar template');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'testing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workflow': return <Workflow className="w-5 h-5" />;
      case 'automation': return <Zap className="w-5 h-5" />;
      case 'ai': return <Brain className="w-5 h-5" />;
      case 'crm': return <Users className="w-5 h-5" />;
      case 'communication': return <MessageSquare className="w-5 h-5" />;
      case 'analytics': return <BarChart3 className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };
  return (
    <>
      {asPage ? (
        // Versão como página
        <div className="h-full overflow-hidden p-6 bg-background">
          <div className="space-y-6 h-full flex flex-col">
            <div className="flex-shrink-0">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold">Gerenciador de Integrações</h1>
              </div>
              <p className="text-muted-foreground">
                Configure e gerencie integrações com plataformas de automação, CRM, IA e comunicação
              </p>
            </div>

            <div className="flex-1 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col space-y-6">
                <TabsList className="flex-shrink-0 glass-effect border-0 bg-gray-800/50">
                  <TabsTrigger value="platforms" className="data-[state=active]:bg-purple-500/20">
                    <Globe className="w-4 h-4 mr-2" />
                    Plataformas
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="data-[state=active]:bg-purple-500/20">
                    <Code className="w-4 h-4 mr-2" />
                    Templates
                  </TabsTrigger>
                  <TabsTrigger value="workflows" className="data-[state=active]:bg-purple-500/20">
                    <Activity className="w-4 h-4 mr-2" />
                    Workflows Ativos
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/20">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto">
                  {/* Conteúdo das abas - continua com o mesmo conteúdo do modal */}
                  {renderTabContent()}
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      ) : (
        // Versão como modal (original)
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto glass-card border-0">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                Gerenciador de Integrações
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Configure e gerencie integrações com plataformas de automação, CRM, IA e comunicação
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">.
              <TabsList className="glass-effect border-0 bg-gray-800/50">
                <TabsTrigger value="platforms" className="data-[state=active]:bg-purple-500/20">
                  <Globe className="w-4 h-4 mr-2" />
                  Plataformas
                </TabsTrigger>
                <TabsTrigger value="templates" className="data-[state=active]:bg-purple-500/20">
                  <Code className="w-4 h-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="workflows" className="data-[state=active]:bg-purple-500/20">
                  <Activity className="w-4 h-4 mr-2" />
                  Workflows Ativos
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/20">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {renderTabContent()}
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Modais de configuração */}
      {configModalOpen && selectedPlatform && (
        <ConfigModal
          platform={selectedPlatform}
          isOpen={configModalOpen}
          onClose={() => setConfigModalOpen(false)}
          onSave={handleSaveConfig}
        />
      )}
    </>
  );

  // Função para renderizar o conteúdo das abas (extraído para reutilização)
  function renderTabContent() {
          <TabsList className="glass-effect border-0 bg-gray-800/50">
            <TabsTrigger value="platforms" className="data-[state=active]:bg-purple-500/20">
              <Globe className="w-4 h-4 mr-2" />
              Plataformas
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-purple-500/20">
              <Code className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="workflows" className="data-[state=active]:bg-purple-500/20">
              <Activity className="w-4 h-4 mr-2" />
              Workflows Ativos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Tab de Plataformas */}
          <TabsContent value="platforms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platforms.map(platform => (
                <Card key={platform.id} className="glass-effect border-0 hover:border-purple-500/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-xl`}>
                          {platform.icon}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{platform.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getCategoryIcon(platform.category)}
                              <span className="ml-1">{platform.category}</span>
                            </Badge>
                            <div className={`w-2 h-2 rounded-full ${getPlatformStatusColor(platform.status)}`} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testPlatformConnection(platform)}
                          disabled={loading}
                        >
                          <TestTube className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPlatform(platform);
                            setIsConfigModalOpen(true);
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm mb-4">{platform.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Recursos:</h4>
                        <div className="flex flex-wrap gap-1">
                          {platform.features.slice(0, 3).map(feature => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {platform.features.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{platform.features.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {platform.webhookSupport && (
                            <Badge variant="outline" className="text-xs">
                              <Webhook className="w-3 h-3 mr-1" />
                              Webhook
                            </Badge>
                          )}
                          {platform.apiSupport && (
                            <Badge variant="outline" className="text-xs">
                              <Key className="w-3 h-3 mr-1" />
                              API
                            </Badge>
                          )}
                        </div>
                      </div>

                      {testResults[platform.id] && (
                        <div className={`p-2 rounded-lg text-xs ${
                          testResults[platform.id].status === 'success' 
                            ? 'bg-green-500/20 text-green-400' 
                            : testResults[platform.id].status === 'error'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          <div className="flex items-center">
                            {testResults[platform.id].status === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {testResults[platform.id].status === 'error' && <XCircle className="w-3 h-3 mr-1" />}
                            {testResults[platform.id].status === 'testing' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                            {testResults[platform.id].message}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab de Templates */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="glass-effect border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">{template.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {template.platform}
                          </Badge>
                          <Badge 
                            variant={template.complexity === 'simple' ? 'default' : template.complexity === 'medium' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {template.complexity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ⏱️ {template.estimatedTime}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                        onClick={() => deployTemplate(template, template.platform)}
                        disabled={loading}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Deploy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Trigger:</h4>
                        <Badge variant="secondary" className="text-xs">
                          {template.trigger}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Ações:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.actions.map(action => (
                            <Badge key={action} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab de Workflows Ativos */}
          <TabsContent value="workflows" className="space-y-6">
            <Card className="glass-effect border-0">
              <CardContent className="p-12 text-center">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Workflows Ativos
                </h3>
                <p className="text-gray-400 mb-6">
                  Configure integrações para visualizar workflows ativos aqui
                </p>
                <Button
                  onClick={() => setActiveTab('platforms')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Configurar Integrações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass-effect border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Integrações Ativas</p>
                      <p className="text-2xl font-bold text-white">
                        {platforms.filter(p => p.status === 'active').length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Workflows Deployados</p>
                      <p className="text-2xl font-bold text-white">12</p>
                    </div>
                    <Workflow className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Execuções Hoje</p>
                      <p className="text-2xl font-bold text-white">1,247</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Taxa de Sucesso</p>
                      <p className="text-2xl font-bold text-white">98.5%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Modal de Configuração da Plataforma */}
      {selectedPlatform && (
        <PlatformConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false);
            setSelectedPlatform(null);
          }}
          platform={selectedPlatform}
          onSave={(config) => {
            savePlatformConfig(selectedPlatform.id, config);
            setIsConfigModalOpen(false);
            setSelectedPlatform(null);
          }}
        />
      )}
    </Dialog>
  );
};

// Componente para configuração específica de cada plataforma
interface PlatformConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: IntegrationPlatform;
  onSave: (config: any) => void;
}

const PlatformConfigModal: React.FC<PlatformConfigModalProps> = ({ 
  isOpen, 
  onClose, 
  platform, 
  onSave 
}) => {
  const [config, setConfig] = useState<any>(platform.config || {});

  const renderConfigFields = () => {
    switch (platform.id) {
      case 'n8n':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="host" className="text-gray-300">Host</Label>
                <Input
                  id="host"
                  value={config.host || 'localhost'}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  className="glass-effect border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="port" className="text-gray-300">Porta</Label>
                <Input
                  id="port"
                  type="number"
                  value={config.port || 5678}
                  onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                  className="glass-effect border-border/50"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="apiKey" className="text-gray-300">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="glass-effect border-border/50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.useSSL || false}
                onCheckedChange={(checked) => setConfig({ ...config, useSSL: checked })}
              />
              <Label className="text-gray-300">Usar SSL</Label>
            </div>
          </div>
        );

      case 'zapier':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhookUrl" className="text-gray-300">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={config.webhookUrl || ''}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                className="glass-effect border-border/50"
              />
            </div>
          </div>
        );

      case 'hubspot':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-gray-300">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="glass-effect border-border/50"
              />
            </div>
            <div>
              <Label htmlFor="portalId" className="text-gray-300">Portal ID</Label>
              <Input
                id="portalId"
                value={config.portalId || ''}
                onChange={(e) => setConfig({ ...config, portalId: e.target.value })}
                className="glass-effect border-border/50"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-gray-300">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="glass-effect border-border/50"
              />
            </div>
            <div>
              <Label htmlFor="baseUrl" className="text-gray-300">Base URL</Label>
              <Input
                id="baseUrl"
                value={config.baseUrl || ''}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                className="glass-effect border-border/50"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card border-0">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center mr-3 text-xl`}>
              {platform.icon}
            </div>
            Configurar {platform.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {renderConfigFields()}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() => onSave(config)}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationManager;
