import React, { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  Zap, 
  Settings,
  ArrowRight,
  ArrowDown,
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Copy,
  Download,
  Upload
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'loop' | 'delay' | 'parallel';
  name: string;
  platform?: string;
  config: any;
  position: { x: number; y: number };
  connections: {
    onSuccess?: string;
    onFailure?: string;
    onTrue?: string;
    onFalse?: string;
  };
}

interface WorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workflow: any) => void;
  existingWorkflow?: any;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  existingWorkflow 
}) => {
  const [workflowName, setWorkflowName] = useState(existingWorkflow?.name || '');
  const [workflowDescription, setWorkflowDescription] = useState(existingWorkflow?.description || '');
  const [nodes, setNodes] = useState<WorkflowNode[]>(existingWorkflow?.nodes || []);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Tipos de nós disponíveis
  const nodeTypes = [
    {
      type: 'trigger',
      name: 'Trigger',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-yellow-500',
      description: 'Inicia o workflow'
    },
    {
      type: 'action',
      name: 'Ação',
      icon: <Play className="w-4 h-4" />,
      color: 'bg-blue-500',
      description: 'Executa uma ação'
    },
    {
      type: 'condition',
      name: 'Condição',
      icon: <GitBranch className="w-4 h-4" />,
      color: 'bg-purple-500',
      description: 'Decisão baseada em condição'
    },
    {
      type: 'delay',
      name: 'Delay',
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-orange-500',
      description: 'Aguarda um tempo específico'
    },
    {
      type: 'loop',
      name: 'Loop',
      icon: <Repeat className="w-4 h-4" />,
      color: 'bg-green-500',
      description: 'Repete ações'
    },
    {
      type: 'parallel',
      name: 'Paralelo',
      icon: <ArrowDown className="w-4 h-4" />,
      color: 'bg-cyan-500',
      description: 'Executa ações em paralelo'
    }
  ];

  // Plataformas disponíveis
  const platforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
    { id: 'hubspot', name: 'HubSpot', icon: '🧡' },
    { id: 'salesforce', name: 'Salesforce', icon: '☁️' },
    { id: 'slack', name: 'Slack', icon: '💬' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'sms', name: 'SMS', icon: '📱' },
    { id: 'webhook', name: 'Webhook', icon: '🔗' },
    { id: 'database', name: 'Database', icon: '🗄️' },
    { id: 'api', name: 'API', icon: '🔌' },
    { id: 'ai', name: 'IA/OpenAI', icon: '🤖' }
  ];

  // Triggers disponíveis
  const triggerTypes = [
    { id: 'message.received', name: 'Mensagem Recebida', platform: 'whatsapp' },
    { id: 'user.joined', name: 'Usuário Entrou', platform: 'whatsapp' },
    { id: 'ticket.created', name: 'Ticket Criado', platform: 'system' },
    { id: 'schedule', name: 'Agendamento', platform: 'system' },
    { id: 'webhook', name: 'Webhook', platform: 'api' },
    { id: 'form.submitted', name: 'Formulário Enviado', platform: 'web' }
  ];

  // Ações disponíveis por plataforma
  const actionsByPlatform = {
    whatsapp: [
      { id: 'send_message', name: 'Enviar Mensagem' },
      { id: 'send_media', name: 'Enviar Mídia' },
      { id: 'create_group', name: 'Criar Grupo' }
    ],
    hubspot: [
      { id: 'create_contact', name: 'Criar Contato' },
      { id: 'update_contact', name: 'Atualizar Contato' },
      { id: 'create_deal', name: 'Criar Negócio' }
    ],
    salesforce: [
      { id: 'create_lead', name: 'Criar Lead' },
      { id: 'update_opportunity', name: 'Atualizar Oportunidade' },
      { id: 'create_case', name: 'Criar Caso' }
    ],
    slack: [
      { id: 'send_message', name: 'Enviar Mensagem' },
      { id: 'create_channel', name: 'Criar Canal' },
      { id: 'invite_user', name: 'Convidar Usuário' }
    ],
    email: [
      { id: 'send_email', name: 'Enviar Email' },
      { id: 'send_template', name: 'Enviar Template' }
    ],
    ai: [
      { id: 'generate_text', name: 'Gerar Texto' },
      { id: 'analyze_sentiment', name: 'Analisar Sentimento' },
      { id: 'translate', name: 'Traduzir' }
    ]
  };

  // Adicionar novo nó
  const addNode = useCallback((type: string) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: type as WorkflowNode['type'],
      name: `${type} ${nodes.length + 1}`,
      config: {},
      position: { 
        x: 100 + (nodes.length * 200), 
        y: 100 + (Math.floor(nodes.length / 4) * 150) 
      },
      connections: {}
    };

    setNodes(prev => [...prev, newNode]);
  }, [nodes.length]);

  // Remover nó
  const removeNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    // Remover conexões que referenciam este nó
    setNodes(prev => prev.map(node => ({
      ...node,
      connections: Object.fromEntries(
        Object.entries(node.connections).filter(([_, targetId]) => targetId !== nodeId)
      )
    })));
  }, []);

  // Conectar nós
  const connectNodes = useCallback((sourceId: string, targetId: string, connectionType: string = 'onSuccess') => {
    setNodes(prev => prev.map(node => 
      node.id === sourceId 
        ? { ...node, connections: { ...node.connections, [connectionType]: targetId } }
        : node
    ));
  }, []);

  // Atualizar configuração do nó
  const updateNodeConfig = useCallback((nodeId: string, config: any) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, config: { ...node.config, ...config } }
        : node
    ));
  }, []);

  // Atualizar posição do nó
  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, position }
        : node
    ));
  }, []);

  // Salvar workflow
  const handleSave = () => {
    if (!workflowName.trim()) {
      alert('Nome do workflow é obrigatório');
      return;
    }

    const workflow = {
      name: workflowName,
      description: workflowDescription,
      nodes,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }
    };

    onSave(workflow);
    onClose();
  };

  // Obter ícone do tipo de nó
  const getNodeIcon = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType?.icon || <Settings className="w-4 h-4" />;
  };

  // Obter cor do tipo de nó
  const getNodeColor = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType?.color || 'bg-gray-500';
  };

  // Renderizar conexões entre nós
  const renderConnections = () => {
    return nodes.map(node => 
      Object.entries(node.connections).map(([connectionType, targetId]) => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (!targetNode) return null;

        const sourceX = node.position.x + 100; // Centro do nó
        const sourceY = node.position.y + 25;
        const targetX = targetNode.position.x;
        const targetY = targetNode.position.y + 25;

        return (          <svg
            key={`${node.id}-${targetId}-${connectionType}`}
            className="absolute pointer-events-none inset-0 w-full h-full z-[1]"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={connectionType === 'onFailure' || connectionType === 'onFalse' ? '#ef4444' : '#10b981'}
                />
              </marker>
            </defs>
            <path
              d={`M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${sourceY - 50} ${targetX} ${targetY}`}
              stroke={connectionType === 'onFailure' || connectionType === 'onFalse' ? '#ef4444' : '#10b981'}
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          </svg>
        );
      })
    ).flat().filter(Boolean);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden glass-card border-0">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
              <Code className="w-5 h-5 text-white" />
            </div>
            Workflow Builder
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 h-[80vh]">
          {/* Header com configurações básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflowName" className="text-gray-300">Nome do Workflow</Label>
              <Input
                id="workflowName"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="glass-effect border-border/50"
                placeholder="Digite o nome do workflow"
              />
            </div>
            <div>
              <Label htmlFor="workflowDescription" className="text-gray-300">Descrição</Label>
              <Input
                id="workflowDescription"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="glass-effect border-border/50"
                placeholder="Descrição opcional"
              />
            </div>
          </div>

          <div className="flex flex-1 space-x-4">
            {/* Sidebar com tipos de nós */}
            <div className="w-64 space-y-4">
              <Card className="glass-effect border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">Tipos de Nós</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {nodeTypes.map(nodeType => (
                    <Button
                      key={nodeType.type}
                      variant="outline"
                      size="sm"
                      onClick={() => addNode(nodeType.type)}
                      className="w-full justify-start glass-effect border-border/50 hover:bg-white/10"
                    >
                      <div className={`w-6 h-6 ${nodeType.color} rounded flex items-center justify-center mr-2`}>
                        {nodeType.icon}
                      </div>
                      {nodeType.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <Card className="glass-effect border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Nós:</span>
                    <span className="text-white">{nodes.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Conexões:</span>
                    <span className="text-white">
                      {nodes.reduce((acc, node) => acc + Object.keys(node.connections).length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Triggers:</span>
                    <span className="text-white">
                      {nodes.filter(node => node.type === 'trigger').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Canvas principal */}
            <div className="flex-1">
              <Card className="glass-effect border-0 h-full">
                <CardContent className="p-0 h-full relative">                  <div
                    ref={canvasRef}
                    className="w-full h-full relative overflow-auto bg-gray-900/20 min-h-[600px]"
                  >
                    {/* Grid de fundo */}                    <div className="absolute inset-0 opacity-10 grid-background" />

                    {/* Renderizar conexões */}
                    {renderConnections()}

                    {/* Renderizar nós */}
                    {nodes.map(node => (                      <div
                        key={node.id}
                        className="absolute cursor-move z-[2]"
                        style={{
                          left: `${node.position.x}px`,
                          top: `${node.position.y}px`
                        }}
                        onMouseDown={(e) => {
                          setIsDragging(true);
                          setDragOffset({
                            x: e.clientX - node.position.x,
                            y: e.clientY - node.position.y
                          });
                          setSelectedNode(node);
                        }}
                        onMouseMove={(e) => {
                          if (isDragging && selectedNode?.id === node.id) {
                            updateNodePosition(node.id, {
                              x: e.clientX - dragOffset.x,
                              y: e.clientY - dragOffset.y
                            });
                          }
                        }}
                        onMouseUp={() => setIsDragging(false)}
                      >
                        <Card className={`glass-effect border-0 w-48 ${
                          selectedNode?.id === node.id ? 'ring-2 ring-purple-500' : ''
                        }`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 ${getNodeColor(node.type)} rounded flex items-center justify-center`}>
                                  {getNodeIcon(node.type)}
                                </div>
                                <div>
                                  <h4 className="text-white text-sm font-medium">{node.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {node.type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNode(node);
                                    setIsNodeConfigOpen(true);
                                  }}
                                >
                                  <Settings className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNode(node.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {node.platform && (
                              <Badge variant="secondary" className="text-xs">
                                {platforms.find(p => p.id === node.platform)?.name}
                              </Badge>
                            )}
                            {Object.keys(node.connections).length > 0 && (
                              <div className="mt-2 text-xs text-gray-400">
                                {Object.keys(node.connections).length} conexão(ões)
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ))}

                    {/* Mensagem quando não há nós */}
                    {nodes.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Canvas Vazio
                          </h3>
                          <p className="text-gray-400 mb-4">
                            Adicione nós da sidebar para começar a construir seu workflow
                          </p>
                          <Button
                            onClick={() => addNode('trigger')}
                            className="bg-gradient-to-r from-purple-500 to-pink-500"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Trigger
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer com ações */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
                disabled={!workflowName.trim() || nodes.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Workflow
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Modal de configuração de nó */}
      {selectedNode && (
        <NodeConfigModal
          isOpen={isNodeConfigOpen}
          onClose={() => {
            setIsNodeConfigOpen(false);
            setSelectedNode(null);
          }}
          node={selectedNode}
          platforms={platforms}
          triggerTypes={triggerTypes}
          actionsByPlatform={actionsByPlatform}
          onSave={(config) => {
            updateNodeConfig(selectedNode.id, config);
            setIsNodeConfigOpen(false);
            setSelectedNode(null);
          }}
        />
      )}
    </Dialog>
  );
};

// Modal de configuração de nó
interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: WorkflowNode;
  platforms: any[];
  triggerTypes: any[];
  actionsByPlatform: any;
  onSave: (config: any) => void;
}

const NodeConfigModal: React.FC<NodeConfigModalProps> = ({
  isOpen,
  onClose,
  node,
  platforms,
  triggerTypes,
  actionsByPlatform,
  onSave
}) => {
  const [config, setConfig] = useState(node.config || {});
  const [selectedPlatform, setSelectedPlatform] = useState(node.platform || '');

  const renderConfigFields = () => {
    switch (node.type) {
      case 'trigger':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Tipo de Trigger</Label>
              <Select
                value={config.triggerType || ''}
                onValueChange={(value) => setConfig({ ...config, triggerType: value })}
              >
                <SelectTrigger className="glass-effect border-border/50">
                  <SelectValue placeholder="Selecione o trigger" />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map(trigger => (
                    <SelectItem key={trigger.id} value={trigger.id}>
                      {trigger.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {config.triggerType === 'schedule' && (
              <div>
                <Label className="text-gray-300">Cronograma</Label>
                <Input
                  value={config.schedule || ''}
                  onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
                  placeholder="0 9 * * 1-5 (9h às segundas-sextas)"
                  className="glass-effect border-border/50"
                />
              </div>
            )}
            {config.triggerType === 'webhook' && (
              <div>
                <Label className="text-gray-300">Path do Webhook</Label>
                <Input
                  value={config.webhookPath || ''}
                  onChange={(e) => setConfig({ ...config, webhookPath: e.target.value })}
                  placeholder="/webhook/meu-trigger"
                  className="glass-effect border-border/50"
                />
              </div>
            )}
          </div>
        );

      case 'action':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Plataforma</Label>
              <Select
                value={selectedPlatform}
                onValueChange={(value) => {
                  setSelectedPlatform(value);
                  setConfig({ ...config, platform: value, action: '' });
                }}
              >
                <SelectTrigger className="glass-effect border-border/50">
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map(platform => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.icon} {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPlatform && actionsByPlatform[selectedPlatform] && (
              <div>
                <Label className="text-gray-300">Ação</Label>
                <Select
                  value={config.action || ''}
                  onValueChange={(value) => setConfig({ ...config, action: value })}
                >
                  <SelectTrigger className="glass-effect border-border/50">
                    <SelectValue placeholder="Selecione a ação" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionsByPlatform[selectedPlatform].map((action: any) => (
                      <SelectItem key={action.id} value={action.id}>
                        {action.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {config.action === 'send_message' && (
              <div>
                <Label className="text-gray-300">Mensagem</Label>
                <Textarea
                  value={config.message || ''}
                  onChange={(e) => setConfig({ ...config, message: e.target.value })}
                  placeholder="Digite a mensagem..."
                  className="glass-effect border-border/50"
                />
              </div>
            )}

            {config.action === 'create_contact' && (
              <div className="space-y-2">
                <div>
                  <Label className="text-gray-300">Nome</Label>
                  <Input
                    value={config.contactName || ''}
                    onChange={(e) => setConfig({ ...config, contactName: e.target.value })}
                    placeholder="{{data.name}}"
                    className="glass-effect border-border/50"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <Input
                    value={config.contactEmail || ''}
                    onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                    placeholder="{{data.email}}"
                    className="glass-effect border-border/50"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Campo a Verificar</Label>
              <Input
                value={config.field || ''}
                onChange={(e) => setConfig({ ...config, field: e.target.value })}
                placeholder="data.message"
                className="glass-effect border-border/50"
              />
            </div>
            <div>
              <Label className="text-gray-300">Operador</Label>
              <Select
                value={config.operator || ''}
                onValueChange={(value) => setConfig({ ...config, operator: value })}
              >
                <SelectTrigger className="glass-effect border-border/50">
                  <SelectValue placeholder="Selecione o operador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Igual a</SelectItem>
                  <SelectItem value="contains">Contém</SelectItem>
                  <SelectItem value="starts_with">Inicia com</SelectItem>
                  <SelectItem value="greater_than">Maior que</SelectItem>
                  <SelectItem value="less_than">Menor que</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Valor</Label>
              <Input
                value={config.value || ''}
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                placeholder="valor para comparação"
                className="glass-effect border-border/50"
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Duração (segundos)</Label>
              <Input
                type="number"
                value={config.duration || ''}
                onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                placeholder="60"
                className="glass-effect border-border/50"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-400">
            Configuração específica para este tipo de nó ainda não implementada.
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card border-0">
        <DialogHeader>
          <DialogTitle className="text-white">
            Configurar {node.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-gray-300">Nome do Nó</Label>
            <Input
              value={config.name || node.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="glass-effect border-border/50"
            />
          </div>

          {renderConfigFields()}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() => onSave({ ...config, platform: selectedPlatform })}
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

export default WorkflowBuilder;
