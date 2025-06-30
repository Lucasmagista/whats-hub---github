import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  Zap, 
  Settings,
  ArrowRight,
  GitBranch,
  Clock,
  Bot,
  MessageSquare,
  Users,
  Database,
  Globe,
  Code,
  Filter,
  Repeat,
  CheckCircle,
  Edit,
  Copy,
  Download,
  Upload,
  Loader2
} from 'lucide-react';
import { integrationApiService, LocalIntegrationStorage, WorkflowConfig } from '@/services/integrationApiService';
import { toast } from '@/components/ui/use-toast';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'loop' | 'delay';
  name: string;
  platform?: string;
  config: any;
  position: { x: number; y: number };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  isActive: boolean;
  lastRun?: string;
  runsCount: number;
  successRate: number;
}

const WorkflowBuilderPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const response = await integrationApiService.getWorkflows();
      
      if (response.success && response.data) {
        // Converter WorkflowConfig para Workflow (interface local)
        const convertedWorkflows: Workflow[] = response.data.map(w => ({
          id: w.id,
          name: w.name,
          description: w.description,
          nodes: w.nodes,
          isActive: w.isActive,
          lastRun: w.lastRun,
          runsCount: w.executions,
          successRate: w.successRate
        }));
        setWorkflows(convertedWorkflows);
      } else {
        // Fallback para localStorage
        const localWorkflows = LocalIntegrationStorage.getWorkflows();
        const convertedWorkflows: Workflow[] = localWorkflows.map(w => ({
          id: w.id,
          name: w.name,
          description: w.description,
          nodes: w.nodes,
          isActive: w.isActive,
          lastRun: w.lastRun,
          runsCount: w.executions,
          successRate: w.successRate
        }));
        setWorkflows(convertedWorkflows);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      // Fallback para localStorage
      const localWorkflows = LocalIntegrationStorage.getWorkflows();
      const convertedWorkflows: Workflow[] = localWorkflows.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        nodes: w.nodes,
        isActive: w.isActive,
        lastRun: w.lastRun,
        runsCount: w.executions,
        successRate: w.successRate
      }));
      setWorkflows(convertedWorkflows);
    } finally {
      setLoading(false);
    }
  };

  // Templates de workflow
  const workflowTemplates = [
    {
      id: 'customer-support',
      name: 'Atendimento ao Cliente',
      description: 'Workflow para automatizar respostas de atendimento',
      icon: MessageSquare,
      category: 'Atendimento',
      nodes: [
        { type: 'trigger', name: 'Nova mensagem recebida' },
        { type: 'condition', name: 'É uma pergunta frequente?' },
        { type: 'action', name: 'Enviar resposta automática' }
      ]
    },
    {
      id: 'lead-qualification',
      name: 'Qualificação de Leads',
      description: 'Automatize a qualificação e distribuição de leads',
      icon: Users,
      category: 'Vendas',
      nodes: [
        { type: 'trigger', name: 'Novo contato recebido' },
        { type: 'action', name: 'Analisar dados do contato' },
        { type: 'condition', name: 'Lead qualificado?' },
        { type: 'action', name: 'Notificar vendedor' }
      ]
    },
    {
      id: 'data-backup',
      name: 'Backup de Dados',
      description: 'Automatize backups regulares dos dados',
      icon: Database,
      category: 'Operações',
      nodes: [
        { type: 'trigger', name: 'Agendamento diário' },
        { type: 'action', name: 'Exportar dados' },
        { type: 'action', name: 'Enviar para cloud storage' }
      ]
    }
  ];
  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) return;

    setSaving(true);
    try {
      const workflowData = {
        name: newWorkflowName,
        description: newWorkflowDescription,
        integrationIds: [],
        nodes: [],
        connections: [],
        triggers: [],
        isActive: false
      };

      const response = await integrationApiService.createWorkflow(workflowData);
      
      if (response.success && response.data) {
        const newWorkflow: Workflow = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
          nodes: response.data.nodes,
          isActive: response.data.isActive,
          lastRun: response.data.lastRun,
          runsCount: response.data.executions,
          successRate: response.data.successRate
        };

        setWorkflows(prev => [...prev, newWorkflow]);
        setSelectedWorkflow(newWorkflow);
        
        toast({
          title: "Sucesso",
          description: "Workflow criado com sucesso!",
          variant: "default"
        });
      } else {
        // Fallback para localStorage
        const newWorkflow: Workflow = {
          id: `workflow-${Date.now()}`,
          name: newWorkflowName,
          description: newWorkflowDescription,
          nodes: [],
          isActive: false,
          runsCount: 0,
          successRate: 0
        };

        setWorkflows(prev => [...prev, newWorkflow]);
        setSelectedWorkflow(newWorkflow);
        
        // Salvar no localStorage
        const workflowConfig: WorkflowConfig = {
          id: newWorkflow.id,
          name: newWorkflow.name,
          description: newWorkflow.description,
          integrationIds: [],
          nodes: [],
          connections: [],
          triggers: [],
          isActive: false,
          executions: 0,
          successRate: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const localWorkflows = LocalIntegrationStorage.getWorkflows();
        LocalIntegrationStorage.saveWorkflows([...localWorkflows, workflowConfig]);
      }
      
      setNewWorkflowName('');
      setNewWorkflowDescription('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar workflow",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFromTemplate = (templateId: string) => {
    const template = workflowTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: template.name,
      description: template.description,
      nodes: template.nodes.map((node, index) => ({
        id: `node-${index}`,
        type: node.type as any,
        name: node.name,
        config: {},
        position: { x: index * 200, y: 100 }
      })),
      isActive: false,
      runsCount: 0,
      successRate: 0
    };

    setWorkflows(prev => [...prev, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
  };
  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      const response = await integrationApiService.deleteWorkflow(workflowId);
      
      if (response.success) {
        setWorkflows(prev => prev.filter(w => w.id !== workflowId));
        if (selectedWorkflow?.id === workflowId) {
          setSelectedWorkflow(null);
        }
        
        toast({
          title: "Sucesso",
          description: "Workflow removido com sucesso!",
          variant: "default"
        });
      } else {
        // Fallback para localStorage
        const localWorkflows = LocalIntegrationStorage.getWorkflows();
        const filteredWorkflows = localWorkflows.filter(w => w.id !== workflowId);
        LocalIntegrationStorage.saveWorkflows(filteredWorkflows);
        
        setWorkflows(prev => prev.filter(w => w.id !== workflowId));
        if (selectedWorkflow?.id === workflowId) {
          setSelectedWorkflow(null);
        }
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover workflow",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (workflowId: string) => {
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) return;

      const updates = { isActive: !workflow.isActive };
      const response = await integrationApiService.updateWorkflow(workflowId, updates);
      
      if (response.success) {
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId 
            ? { ...w, isActive: !w.isActive }
            : w
        ));
        
        toast({
          title: "Sucesso",
          description: `Workflow ${!workflow.isActive ? 'ativado' : 'pausado'} com sucesso!`,
          variant: "default"
        });
      } else {
        // Fallback para localStorage
        const localWorkflows = LocalIntegrationStorage.getWorkflows();
        const updatedWorkflows = localWorkflows.map(w => 
          w.id === workflowId 
            ? { ...w, isActive: !w.isActive, updatedAt: new Date().toISOString() }
            : w
        );
        LocalIntegrationStorage.saveWorkflows(updatedWorkflows);
        
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId 
            ? { ...w, isActive: !w.isActive }
            : w
        ));
      }
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do workflow",
        variant: "destructive"
      });
    }
  };

  const handleSaveWorkflow = async () => {
    if (!selectedWorkflow) return;

    setSaving(true);
    try {
      const updates = {
        name: selectedWorkflow.name,
        description: selectedWorkflow.description,
        nodes: selectedWorkflow.nodes
      };
      
      const response = await integrationApiService.updateWorkflow(selectedWorkflow.id, updates);
      
      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Workflow salvo com sucesso!",
          variant: "default"
        });
      } else {
        // Fallback para localStorage
        const localWorkflows = LocalIntegrationStorage.getWorkflows();
        const updatedWorkflows = localWorkflows.map(w => 
          w.id === selectedWorkflow.id 
            ? { 
                ...w, 
                name: selectedWorkflow.name,
                description: selectedWorkflow.description,
                nodes: selectedWorkflow.nodes,
                updatedAt: new Date().toISOString()
              }
            : w
        );
        LocalIntegrationStorage.saveWorkflows(updatedWorkflows);
        
        toast({
          title: "Sucesso",
          description: "Workflow salvo localmente!",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar workflow",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Zap className="w-4 h-4" />;
      case 'action': return <Play className="w-4 h-4" />;
      case 'condition': return <GitBranch className="w-4 h-4" />;
      case 'loop': return <Repeat className="w-4 h-4" />;
      case 'delay': return <Clock className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'trigger': return 'bg-green-500';
      case 'action': return 'bg-blue-500';
      case 'condition': return 'bg-yellow-500';
      case 'loop': return 'bg-purple-500';
      case 'delay': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="h-full overflow-hidden p-6 bg-background">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Carregando Workflows</h3>
            <p className="text-muted-foreground">Aguarde enquanto carregamos seus workflows...</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedWorkflow) {
    return (
      <div className="h-full overflow-hidden p-6 bg-background">
        <div className="space-y-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedWorkflow(null)}
                  className="mr-4"
                >
                  ← Voltar
                </Button>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <GitBranch className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{selectedWorkflow.name}</h1>
                    <p className="text-muted-foreground">{selectedWorkflow.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={selectedWorkflow.isActive ? "default" : "secondary"}>
                  {selectedWorkflow.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => handleToggleActive(selectedWorkflow.id)}
                >
                  {selectedWorkflow.isActive ? 'Pausar' : 'Ativar'}
                </Button>                <Button onClick={handleSaveWorkflow} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          {/* Workflow Canvas */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 relative">
              {selectedWorkflow.nodes.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <GitBranch className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Canvas de Workflow</h3>
                    <p className="text-muted-foreground mb-6">
                      Arraste e solte componentes para construir seu workflow
                    </p>
                    <div className="flex space-x-2 justify-center">
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Trigger
                      </Button>
                      <Button variant="outline" size="sm">
                        <Code className="w-4 h-4 mr-2" />
                        Ver Código
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex flex-wrap gap-4">
                    {selectedWorkflow.nodes.map((node, index) => (
                      <div key={node.id} className="flex items-center">
                        <Card className="w-48">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 ${getNodeColor(node.type)} rounded flex items-center justify-center text-white`}>
                                  {getNodeIcon(node.type)}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {node.type}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm font-medium">{node.name}</p>
                          </CardContent>
                        </Card>
                        {index < selectedWorkflow.nodes.length - 1 && (
                          <ArrowRight className="w-6 h-6 text-muted-foreground mx-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Node Palette */}
          <div className="flex-shrink-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Componentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Zap className="w-4 h-4 mr-2" />
                    Trigger
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Ação
                  </Button>
                  <Button variant="outline" size="sm">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Condição
                  </Button>
                  <Button variant="outline" size="sm">
                    <Repeat className="w-4 h-4 mr-2" />
                    Loop
                  </Button>
                  <Button variant="outline" size="sm">
                    <Clock className="w-4 h-4 mr-2" />
                    Delay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden p-6 bg-background">
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Construtor de Workflows</h1>
                <p className="text-muted-foreground">
                  Crie e gerencie workflows de automação visuais
                </p>
              </div>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Workflow
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Templates */}
          {workflows.length === 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Templates de Workflow</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflowTemplates.map(template => {
                  const IconComponent = template.icon;
                  return (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => handleCreateFromTemplate(template.id)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Fluxo:</Label>
                          <div className="flex items-center space-x-1 text-xs">
                            {template.nodes.map((node, index) => (
                              <React.Fragment key={index}>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                  {node.name}
                                </span>
                                {index < template.nodes.length - 1 && (
                                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lista de Workflows */}
          {workflows.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Meus Workflows</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map(workflow => (
                  <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <GitBranch className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{workflow.name}</CardTitle>
                            <Badge variant={workflow.isActive ? "default" : "secondary"}>
                              {workflow.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {workflow.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs font-medium">Execuções:</Label>
                          <p className="font-medium">{workflow.runsCount}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Taxa de Sucesso:</Label>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="font-medium">{workflow.successRate}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWorkflow(workflow)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(workflow.id)}
                          className="flex-1"
                        >
                          {workflow.isActive ? 'Pausar' : 'Ativar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Criação */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Novo Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Workflow</Label>
                  <Input
                    id="name"
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    placeholder="Digite o nome do workflow"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newWorkflowDescription}
                    onChange={(e) => setNewWorkflowDescription(e.target.value)}
                    placeholder="Descreva o que este workflow faz"
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>                  <Button
                    onClick={handleCreateWorkflow}
                    className="flex-1"
                    disabled={!newWorkflowName.trim() || saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Criar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowBuilderPage;
