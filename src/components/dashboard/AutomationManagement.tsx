import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Badge
} from '@/components/ui/badge';
import {
  Switch
} from '@/components/ui/switch';
import {
  Textarea
} from '@/components/ui/textarea';
import {
  Separator
} from '@/components/ui/separator';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  TestTube,
  Zap,
  Workflow,
  Activity,
  Globe,
  Key,
  Clock,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Edit,
  Eye,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

import AutomationService, { 
  AutomationConfig, 
  AutomationPlatform, 
  TriggerEvent,
  AutomationCondition,
  ExecutionResult,
  AutomationStats
} from '@/services/automationService';

const AutomationManagement: React.FC = () => {
  const [automationService] = useState(() => new AutomationService());
  const [automations, setAutomations] = useState<AutomationConfig[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationConfig | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Form state para criar/editar automação
  const [formData, setFormData] = useState<Partial<AutomationConfig>>({
    name: '',
    description: '',
    platform: 'n8n',
    isActive: true,
    triggers: [],
    webhookUrl: '',
    authentication: {
      type: 'none'
    },
    headers: {},
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 5000,
    transformData: false,
    conditions: []
  });

  const platforms = [
    { id: 'n8n', name: 'n8n', icon: '🔄', color: 'bg-purple-500' },
    { id: 'zapier', name: 'Zapier', icon: '⚡', color: 'bg-orange-500' },
    { id: 'power-automate', name: 'Power Automate', icon: '🔵', color: 'bg-blue-500' },
    { id: 'make', name: 'Make.com', icon: '🔧', color: 'bg-green-500' },
    { id: 'pipedream', name: 'Pipedream', icon: '🌊', color: 'bg-cyan-500' },
    { id: 'workato', name: 'Workato', icon: '🏢', color: 'bg-indigo-500' },
    { id: 'custom-webhook', name: 'Webhook Customizado', icon: '🔗', color: 'bg-gray-500' }
  ];

  const triggerEvents: { id: TriggerEvent; name: string; description: string }[] = [
    { id: 'message.received', name: 'Mensagem Recebida', description: 'Quando uma nova mensagem é recebida' },
    { id: 'message.sent', name: 'Mensagem Enviada', description: 'Quando uma mensagem é enviada' },
    { id: 'ticket.created', name: 'Ticket Criado', description: 'Quando um novo ticket é criado' },
    { id: 'ticket.updated', name: 'Ticket Atualizado', description: 'Quando um ticket é atualizado' },
    { id: 'ticket.closed', name: 'Ticket Fechado', description: 'Quando um ticket é fechado' },
    { id: 'user.joined', name: 'Usuário Ingressou', description: 'Quando um usuário entra no chat' },
    { id: 'user.left', name: 'Usuário Saiu', description: 'Quando um usuário sai do chat' },
    { id: 'bot.started', name: 'Bot Iniciado', description: 'Quando o bot é iniciado' },
    { id: 'bot.stopped', name: 'Bot Parado', description: 'Quando o bot é parado' },
    { id: 'payment.received', name: 'Pagamento Recebido', description: 'Quando um pagamento é recebido' },
    { id: 'order.created', name: 'Pedido Criado', description: 'Quando um pedido é criado' },
    { id: 'custom.event', name: 'Evento Customizado', description: 'Evento personalizado definido pelo usuário' }
  ];

  const authTypes = [
    { id: 'none', name: 'Nenhuma' },
    { id: 'api-key', name: 'API Key' },
    { id: 'bearer', name: 'Bearer Token' },
    { id: 'basic', name: 'Basic Auth' },
    { id: 'oauth', name: 'OAuth' },
    { id: 'custom', name: 'Customizada' }
  ];

  useEffect(() => {
    loadAutomations();
    loadStats();
  }, []);

  const loadAutomations = () => {
    const allAutomations = automationService.getAllAutomations();
    setAutomations(allAutomations);
  };

  const loadStats = () => {
    const automationStats = automationService.getStats();
    setStats(automationStats);
  };

  const handleCreateAutomation = async () => {
    try {
      setLoading(true);
      await automationService.registerAutomation(formData as Omit<AutomationConfig, 'id' | 'createdAt' | 'updatedAt'>);
      loadAutomations();
      loadStats();
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar automação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAutomation = async () => {
    if (!selectedAutomation?.id) return;

    try {
      setLoading(true);
      await automationService.updateAutomation(selectedAutomation.id, formData);
      loadAutomations();
      loadStats();
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao atualizar automação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    try {
      await automationService.removeAutomation(automationId);
      loadAutomations();
      loadStats();
    } catch (error) {
      console.error('Erro ao deletar automação:', error);
    }
  };

  const handleToggleAutomation = async (automation: AutomationConfig) => {
    try {
      await automationService.updateAutomation(automation.id!, { 
        isActive: !automation.isActive 
      });
      loadAutomations();
    } catch (error) {
      console.error('Erro ao alternar automação:', error);
    }
  };

  const handleTestAutomation = async (automation: AutomationConfig) => {
    try {
      setLoading(true);
      const isConnected = await automationService.testConnection(automation);
      setTestResult({ success: isConnected, message: 'Conexão testada com sucesso!' });
      setIsTestModalOpen(true);
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro no teste' 
      });
      setIsTestModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      platform: 'n8n',
      isActive: true,
      triggers: [],
      webhookUrl: '',
      authentication: { type: 'none' },
      headers: {},
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 5000,
      transformData: false,
      conditions: []
    });
    setSelectedAutomation(null);
  };

  const openEditModal = (automation: AutomationConfig) => {
    setSelectedAutomation(automation);
    setFormData(automation);
    setIsEditModalOpen(true);
  };

  const getPlatformInfo = (platformId: AutomationPlatform) => {
    return platforms.find(p => p.id === platformId) || platforms[0];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Automações</h1>
          <p className="text-gray-400 mt-1">
            Gerencie integrações com n8n, Zapier e outras plataformas de automação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Automação
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-effect border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total de Automações</p>
                  <p className="text-2xl font-bold text-white">{automations.length}</p>
                </div>
                <Workflow className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Execuções Hoje</p>
                  <p className="text-2xl font-bold text-white">{stats.totalExecutions}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-white">{stats.successRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Tempo Médio</p>
                  <p className="text-2xl font-bold text-white">{stats.averageResponseTime}ms</p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-effect border-0 bg-gray-800/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20">
            <Eye className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="automations" className="data-[state=active]:bg-purple-500/20">
            <Settings className="w-4 h-4 mr-2" />
            Automações
          </TabsTrigger>
          <TabsTrigger value="platforms" className="data-[state=active]:bg-purple-500/20">
            <Globe className="w-4 h-4 mr-2" />
            Plataformas
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-purple-500/20">
            <BarChart3 className="w-4 h-4 mr-2" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Distribution */}
            <Card className="glass-effect border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Distribuição por Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platforms.map(platform => {
                    const count = automations.filter(a => a.platform === platform.id).length;
                    const percentage = automations.length > 0 ? (count / automations.length) * 100 : 0;
                    
                    return (
                      <div key={platform.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${platform.color} mr-3`} />
                          <span className="text-gray-300">{platform.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">{count}</span>                          <div className="w-16 h-2 bg-gray-700 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${platform.color} transition-all duration-300`}
                              data-percentage={percentage}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-effect border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.dailyExecutions?.slice(-5).map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300">
                        {new Date(day.date).toLocaleDateString('pt-BR')}
                      </span>
                      <Badge variant="secondary">{day.count} execuções</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {automations.map(automation => {
              const platform = getPlatformInfo(automation.platform);
              
              return (
                <Card key={automation.id} className="glass-effect border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center text-2xl`}>
                          {platform.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{automation.name}</h3>
                          <p className="text-gray-400 text-sm">{automation.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {platform.name}
                            </Badge>
                            <Badge 
                              variant={automation.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {automation.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {automation.triggers.length} triggers
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestAutomation(automation)}
                          disabled={loading}
                        >
                          <TestTube className="w-4 h-4" />
                        </Button>
                        
                        <Switch
                          checked={automation.isActive}
                          onCheckedChange={() => handleToggleAutomation(automation)}
                        />
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(automation)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAutomation(automation.id!)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {automations.length === 0 && (
              <Card className="glass-effect border-0">
                <CardContent className="p-12 text-center">
                  <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhuma automação configurada
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Comece criando sua primeira automação para integrar com plataformas externas
                  </p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Automação
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map(platform => {
              const automationCount = automations.filter(a => a.platform === platform.id).length;
              const activeCount = automations.filter(a => a.platform === platform.id && a.isActive).length;
              
              return (
                <Card key={platform.id} className="glass-effect border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center text-2xl`}>
                        {platform.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {automationCount} automações • {activeCount} ativas
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total</span>
                        <span className="text-white">{automationCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Ativas</span>
                        <span className="text-green-400">{activeCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Inativas</span>
                        <span className="text-red-400">{automationCount - activeCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle className="text-white">Logs de Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.dailyExecutions?.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div>
                      <span className="text-white font-medium">
                        {new Date(day.date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <Badge variant="secondary">{day.count} execuções</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Automation Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-0">
          <DialogHeader>
            <DialogTitle className="text-white">
              {isEditModalOpen ? 'Editar Automação' : 'Nova Automação'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure uma nova integração com plataformas de automação
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nome da Automação</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Notificar CRM sobre novos tickets"
                  className="glass-effect border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform" className="text-white">Plataforma</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value: AutomationPlatform) => 
                    setFormData(prev => ({ ...prev, platform: value }))
                  }
                >
                  <SelectTrigger className="glass-effect border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-gray-600">
                    {platforms.map(platform => (
                      <SelectItem key={platform.id} value={platform.id}>
                        <div className="flex items-center">
                          <span className="mr-2">{platform.icon}</span>
                          {platform.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o que esta automação faz..."
                className="glass-effect border-gray-600 text-white"
              />
            </div>

            {/* Webhook Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Configuração do Webhook</h3>
              
              <div className="space-y-2">
                <Label htmlFor="webhookUrl" className="text-white">URL do Webhook</Label>
                <Input
                  id="webhookUrl"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://hooks.n8n.cloud/webhook/..."
                  className="glass-effect border-gray-600 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authType" className="text-white">Tipo de Autenticação</Label>
                  <Select
                    value={formData.authentication?.type}
                    onValueChange={(value) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        authentication: { ...prev.authentication!, type: value as any }
                      }))
                    }
                  >
                    <SelectTrigger className="glass-effect border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-effect border-gray-600">
                      {authTypes.map(auth => (
                        <SelectItem key={auth.id} value={auth.id}>
                          {auth.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout" className="text-white">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={formData.timeout}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                    className="glass-effect border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Triggers */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Eventos Disparadores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {triggerEvents.map(trigger => (                  <div key={trigger.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={trigger.id}
                      checked={formData.triggers?.includes(trigger.id)}
                      onChange={(e) => {
                        const triggers = formData.triggers || [];
                        if (e.target.checked) {
                          setFormData(prev => ({ 
                            ...prev, 
                            triggers: [...triggers, trigger.id] 
                          }));
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            triggers: triggers.filter(t => t !== trigger.id) 
                          }));
                        }
                      }}
                      className="rounded border-gray-600"
                      title={trigger.description}
                      aria-label={trigger.name}
                    />
                    <Label htmlFor={trigger.id} className="text-white text-sm">
                      {trigger.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Configurações Avançadas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retryAttempts" className="text-white">Tentativas de Retry</Label>
                  <Input
                    id="retryAttempts"
                    type="number"
                    value={formData.retryAttempts}
                    onChange={(e) => setFormData(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
                    className="glass-effect border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retryDelay" className="text-white">Delay entre Retries (ms)</Label>
                  <Input
                    id="retryDelay"
                    type="number"
                    value={formData.retryDelay}
                    onChange={(e) => setFormData(prev => ({ ...prev, retryDelay: parseInt(e.target.value) }))}
                    className="glass-effect border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive" className="text-white">Ativar automação imediatamente</Label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={isEditModalOpen ? handleUpdateAutomation : handleCreateAutomation}
                disabled={loading || !formData.name || !formData.webhookUrl}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isEditModalOpen ? 'Atualizar' : 'Criar'} Automação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Result Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="glass-card border-0">
          <DialogHeader>
            <DialogTitle className="text-white">Resultado do Teste</DialogTitle>
          </DialogHeader>
          
          {testResult && (
            <Alert className={testResult.success ? "border-green-500" : "border-red-500"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className="text-white">
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => setIsTestModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutomationManagement;
