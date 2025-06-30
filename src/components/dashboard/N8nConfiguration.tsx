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
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { 
  Settings, 
  Play, 
  Pause, 
  TestTube,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Code,
  Database,
  Workflow,
  Zap,
  Eye,
  Download,
  Upload
} from 'lucide-react';

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  nodes: N8nNode[];
  connections: Record<string, any>;
}

interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
}

interface N8nConnection {
  host: string;
  port: number;
  apiKey?: string;
  username?: string;
  password?: string;
  useSSL: boolean;
}

interface N8nConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tipo para bot local
interface LocalBot {
  id: string;
  name: string;
  path: string;
  status: 'running' | 'stopped' | 'error';
  log: string;
  qrCode?: string;
}

const N8nConfiguration: React.FC<N8nConfigurationProps> = ({ isOpen, onClose }) => {
  const [connection, setConnection] = useState<N8nConnection>({
    host: 'localhost',
    port: 5678,
    useSSL: false
  });
  // Gerenciamento de bots locais
  const [bots, setBots] = useState<LocalBot[]>(() => {
    // Carrega bots do localStorage
    try {
      const saved = localStorage.getItem('local-bots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedBot, setSelectedBot] = useState<LocalBot | null>(null);
  const [addingBot, setAddingBot] = useState(false);
  const [botFolder, setBotFolder] = useState('');
  const [botLogs, setBotLogs] = useState<string>('');
  const [showLogs, setShowLogs] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Adicionar bot local (simples, apenas salva path e nome)
  const handleAddBot = () => {
    if (!botFolder) return;
    const name = botFolder.split(/[\\/]/).pop() || 'Bot';
    const newBot: LocalBot = {
      id: Date.now().toString(),
      name,
      path: botFolder,
      status: 'stopped',
      log: '',
    };
    const updated = [...bots, newBot];
    setBots(updated);
    localStorage.setItem('local-bots', JSON.stringify(updated));
    setBotFolder('');
    setAddingBot(false);
  };

  // Remover bot
  const handleRemoveBot = (id: string) => {
    const updated = bots.filter(b => b.id !== id);
    setBots(updated);
    localStorage.setItem('local-bots', JSON.stringify(updated));
    if (selectedBot?.id === id) setSelectedBot(null);
  };

  // Selecionar pasta do bot (simulação, pois input type="file" directory não é suportado nativamente)
  // Em Electron ou ambiente desktop, usar API nativa. Aqui, apenas input texto.

  // Iniciar bot real via backend local
  const handleStartBot = async (bot: LocalBot) => {
    try {
      const res = await fetch(`http://localhost:3001/bot/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: bot.path })
      });
      if (res.ok) {
      const updated = bots.map(b => b.id === bot.id ? { ...b, status: 'running' as const } : b);
      setBots(updated);
      setSelectedBot({ ...bot, status: 'running' });
        setShowLogs(true);
      }
    } catch (err) {
      const updated = bots.map(b => b.id === bot.id ? { ...b, status: 'error' as const } : b);
      setBots(updated);
      setSelectedBot({ ...bot, status: 'error' });
    }
  };
  // Parar bot real via backend local
  const handleStopBot = async (bot: LocalBot) => {
    try {
      const res = await fetch(`http://localhost:3001/bot/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: bot.path })
      });
      if (res.ok) {
      const updated = bots.map(b => b.id === bot.id ? { ...b, status: 'stopped' as const } : b);
      setBots(updated);
      setSelectedBot({ ...bot, status: 'stopped' });
        setShowLogs(false);
      }
    } catch (err) {
      const updated = bots.map(b => b.id === bot.id ? { ...b, status: 'error' as const } : b);
      setBots(updated);
      setSelectedBot({ ...bot, status: 'error' });
    }
  };
  // Exibir logs reais (polling) - Corrigido para evitar race condition
  const [logPolling, setLogPolling] = useState<NodeJS.Timeout | null>(null);
  const [botLogs, setBotLogs] = useState<string>('');
  const handleShowLogs = (bot: LocalBot) => {
    setSelectedBot(bot);
    setShowLogs(true);
    setBotLogs('');
  };
  // Polling dos logs reais
  useEffect(() => {
    if (showLogs && selectedBot) {
      let isActive = true;
      const fetchLogs = async () => {
        try {
          const res = await fetch(`http://localhost:3001/bot/logs?path=${encodeURIComponent(selectedBot.path)}`);
          if (res.ok) {
            const data = await res.json();
            if (isActive) setBotLogs(data.log || '');
          }
        } catch {}
      };
      fetchLogs();
      const interval = setInterval(fetchLogs, 2000);
      setLogPolling(interval);
      return () => { isActive = false; clearInterval(interval); setLogPolling(null); };
    } else if (logPolling) {
      clearInterval(logPolling);
      setLogPolling(null);
    }
    // eslint-disable-next-line
  }, [showLogs, selectedBot]);
  // Exibir QR Code real
  const [qrCodeImg, setQrCodeImg] = useState<string | undefined>(undefined);
  const handleShowQr = async (bot: LocalBot) => {
    setSelectedBot(bot);
    setShowQr(true);
    setQrCodeImg(undefined);
    try {
      const res = await fetch(`http://localhost:3001/bot/qrcode?path=${encodeURIComponent(bot.path)}`);
      if (res.ok) {
        const data = await res.json();
        setQrCodeImg(data.qrCode || undefined);
      } else {
        setQrCodeImg(undefined);
      }
    } catch {
      setQrCodeImg(undefined);
    }
  };
  // Tela de gerenciamento de bots
  const renderBotManager = () => (
    <div className="space-y-6">
      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" /> Gerenciar Bots Locais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-4 items-center">
            <Button onClick={() => setAddingBot(true)} variant="outline">Adicionar Bot</Button>
          </div>
          {addingBot && (
            <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
              <Input
                placeholder="Caminho da pasta do bot (ex: C:\\bots\\meu-bot)"
                value={botFolder}
                onChange={e => setBotFolder(e.target.value)}
                className="w-full md:w-96"
              />
              <Button onClick={handleAddBot} className="bg-gradient-to-r from-purple-500 to-pink-500">Salvar</Button>
              <Button onClick={() => setAddingBot(false)} variant="outline">Cancelar</Button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="text-gray-300 border-b border-gray-700">
                  <th className="py-2 px-2">Nome</th>
                  <th className="py-2 px-2">Pasta</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {bots.map(bot => (
                  <tr key={bot.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                    <td className="py-2 px-2 text-white">{bot.name}</td>
                    <td className="py-2 px-2 text-gray-300">{bot.path}</td>
                    <td className="py-2 px-2">
                      {bot.status === 'running' ? (
                        <Badge variant="default" className="bg-green-600">Rodando</Badge>
                      ) : bot.status === 'error' ? (
                        <Badge variant="outline" className="bg-red-600/30 text-red-300">Erro</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-600/30 text-gray-300">Parado</Badge>
                      )}
                    </td>
                    <td className="py-2 px-2 flex gap-2">
                      {bot.status !== 'running' ? (
                        <Button size="sm" variant="outline" onClick={() => handleStartBot(bot)}>
                          <Play className="w-4 h-4" /> Iniciar
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleStopBot(bot)}>
                          <Pause className="w-4 h-4" /> Parar
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleShowLogs(bot)}>
                        <Eye className="w-4 h-4" /> Logs
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleShowQr(bot)}>
                        <TestTube className="w-4 h-4" /> QR Code
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRemoveBot(bot.id)}>
                        <XCircle className="w-4 h-4" /> Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de logs reais */}
      <Dialog open={showLogs} onOpenChange={() => { setShowLogs(false); setBotLogs(''); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-400" /> Logs do Bot
            </DialogTitle>
          </DialogHeader>
          <div className="bg-black text-green-300 font-mono rounded p-2 max-h-96 overflow-y-auto text-xs whitespace-pre-wrap">
            {botLogs || 'Sem logs.'}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de QR Code real */}
      <Dialog open={showQr} onOpenChange={(open) => { setShowQr(open); if (!open) setQrCodeImg(undefined); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <TestTube className="w-5 h-5 text-yellow-400" /> QR Code do Bot
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center min-h-[200px]">
            {qrCodeImg ? (
              <img src={qrCodeImg} alt="QR Code" className="w-48 h-48" />
            ) : (
              <span className="text-gray-400">QR Code não disponível.</span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
  const [n8nStatus, setN8nStatus] = useState<{
    online: boolean;
    version?: string;
    uptime?: string;
    lastResponseTime?: number;
    lastChecked?: string;
    error?: string;
  }>({ online: false });
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflow | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('connection');
  const [executions, setExecutions] = useState<any[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<any | null>(null);
  const [loadingExecutions, setLoadingExecutions] = useState(false);
  // Buscar histórico de execuções do n8n
  const loadExecutions = async () => {
    if (!isConnected) return;
    setLoadingExecutions(true);
    try {
      const baseUrl = `${connection.useSSL ? 'https' : 'http'}://${connection.host}:${connection.port}`;
      const response = await fetch(`${baseUrl}/api/v1/executions?limit=20`, {
        headers: {
          'X-N8N-API-KEY': connection.apiKey || '',
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setExecutions(data.data || []);
      }
    } catch (err) {
      console.error('Erro ao buscar execuções:', err);
    } finally {
      setLoadingExecutions(false);
    }
  };


  // Atualizar execuções ao conectar e polling automático
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isConnected && activeTab === 'executions') {
      loadExecutions();
      interval = setInterval(loadExecutions, 10000); // Atualiza a cada 10s
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [isConnected, activeTab, connection]);

  // Template workflows para diferentes cenários
  const workflowTemplates = [
    {
      id: 'ticket-created',
      name: 'Notificar Ticket Criado',
      description: 'Envia notificação quando um novo ticket é criado',
      trigger: 'ticket.created',
      nodes: [
        {
          type: 'webhook',
          name: 'Webhook Trigger',
          parameters: {
            httpMethod: 'POST',
            path: 'ticket-created'
          }
        },
        {
          type: 'slack',
          name: 'Notificar Slack',
          parameters: {
            channel: '#tickets',
            text: 'Novo ticket criado: {{$json["data"]["title"]}}'
          }
        }
      ]
    },
    {
      id: 'crm-sync',
      name: 'Sincronizar com CRM',
      description: 'Sincroniza dados de contatos com o CRM',
      trigger: 'user.joined',
      nodes: [
        {
          type: 'webhook',
          name: 'Webhook Trigger',
          parameters: {
            httpMethod: 'POST',
            path: 'user-joined'
          }
        },
        {
          type: 'hubspot',
          name: 'Criar Contato HubSpot',
          parameters: {
            operation: 'create',
            resource: 'contact'
          }
        }
      ]
    },
    {
      id: 'order-processing',
      name: 'Processar Pedido',
      description: 'Workflow completo para processamento de pedidos',
      trigger: 'order.created',
      nodes: [
        {
          type: 'webhook',
          name: 'Webhook Trigger',
          parameters: {
            httpMethod: 'POST',
            path: 'order-created'
          }
        },
        {
          type: 'email',
          name: 'Email Confirmação',
          parameters: {
            to: '{{$json["data"]["customer_email"]}}',
            subject: 'Pedido Confirmado'
          }
        },
        {
          type: 'googleSheets',
          name: 'Registrar Planilha',
          parameters: {
            operation: 'append',
            sheetId: 'orders-sheet'
          }
        }
      ]
    }
  ];

  // Conectar com n8n
  // Função para checar status do n8n
  const checkN8nStatus = async () => {
    const baseUrl = `${connection.useSSL ? 'https' : 'http'}://${connection.host}:${connection.port}`;
    const start = Date.now();
    try {
      setLoading(true);
      setError(null);
      // Endpoint de status (ajuste se necessário)
      const response = await fetch(`${baseUrl}/healthz`, {
        headers: {
          'X-N8N-API-KEY': connection.apiKey || '',
          'Content-Type': 'application/json'
        }
      });
      const responseTime = Date.now() - start;
      if (!response.ok) {
        throw new Error('Falha na conexão com n8n');
      }
      const health = await response.json();
      setN8nStatus({
        online: true,
        version: health.version || health?.data?.version,
        uptime: health.uptime || health?.data?.uptime,
        lastResponseTime: responseTime,
        lastChecked: new Date().toLocaleTimeString(),
      });
      setIsConnected(true);
      // Salvar configuração de conexão
      localStorage.setItem('n8n-connection', JSON.stringify(connection));
    } catch (err) {
      setN8nStatus({
        online: false,
        error: err instanceof Error ? err.message : 'Erro de conexão',
        lastChecked: new Date().toLocaleTimeString(),
      });
      setError(err instanceof Error ? err.message : 'Erro de conexão');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Substitui connectToN8n para também carregar workflows
  const connectToN8n = async () => {
    await checkN8nStatus();
    if (n8nStatus.online) {
      await loadWorkflows();
    }
  };

  // Carregar workflows do n8n
  const loadWorkflows = async () => {
    if (!isConnected) return;

    try {
      setLoading(true);
      const baseUrl = `${connection.useSSL ? 'https' : 'http'}://${connection.host}:${connection.port}`;
      
      const response = await fetch(`${baseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': connection.apiKey || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const workflowsData = await response.json();
        setWorkflows(workflowsData.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ativar/desativar workflow
  const toggleWorkflow = async (workflowId: string, active: boolean) => {
    try {
      const baseUrl = `${connection.useSSL ? 'https' : 'http'}://${connection.host}:${connection.port}`;
      
      const response = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}/${active ? 'activate' : 'deactivate'}`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': connection.apiKey || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadWorkflows();
      }
    } catch (err) {
      console.error('Erro ao alternar workflow:', err);
    }
  };

  // Executar workflow manualmente
  const executeWorkflow = async (workflowId: string) => {
    try {
      const baseUrl = `${connection.useSSL ? 'https' : 'http'}://${connection.host}:${connection.port}`;
      
      const response = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': connection.apiKey || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const execution = await response.json();
        console.log('Execução iniciada:', execution);
      }
    } catch (err) {
      console.error('Erro ao executar workflow:', err);
    }
  };

  // Criar workflow a partir de template
  const createWorkflowFromTemplate = async (template: any) => {
    try {
      setLoading(true);
      const baseUrl = `${connection.useSSL ? 'https' : 'http'}://${connection.host}:${connection.port}`;
      
      const workflowData = {
        name: template.name,
        nodes: template.nodes.map((node: any, index: number) => ({
          id: `node-${index}`,
          name: node.name,
          type: node.type,
          typeVersion: 1,
          position: [200 + (index * 300), 200],
          parameters: node.parameters
        })),
        connections: {},
        active: false,
        settings: {},
        tags: ['whats-hub-template']
      };

      const response = await fetch(`${baseUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': connection.apiKey || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowData)
      });

      if (response.ok) {
        await loadWorkflows();
      }
    } catch (err) {
      console.error('Erro ao criar workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar configuração salva
  useEffect(() => {
    const saved = localStorage.getItem('n8n-connection');
    if (saved) {
      setConnection(JSON.parse(saved));
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto glass-card border-0">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              🔄
            </div>
            Configuração n8n
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure e gerencie seus workflows n8n para automação avançada
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass-effect border-0 bg-gray-800/50">
            <TabsTrigger value="bot-manager" className="data-[state=active]:bg-yellow-500/20">
              <Zap className="w-4 h-4 mr-2" /> Gerenciar Bots
            </TabsTrigger>
          {/* Bot Manager Tab */}
          <TabsContent value="bot-manager" className="space-y-6">
            {renderBotManager()}
          </TabsContent>
            <TabsTrigger value="connection" className="data-[state=active]:bg-purple-500/20">
              <Globe className="w-4 h-4 mr-2" />
              Conexão
            </TabsTrigger>
            <TabsTrigger value="workflows" className="data-[state=active]:bg-purple-500/20">
              <Workflow className="w-4 h-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-purple-500/20">
              <Code className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="executions" className="data-[state=active]:bg-purple-500/20">
              <Database className="w-4 h-4 mr-2" />
              Execuções
            </TabsTrigger>
          </TabsList>

          {/* Connection Tab */}
          <TabsContent value="connection" className="space-y-6">
            <Card className="glass-effect border-0">
              <CardHeader>
                <CardTitle className="text-white">Configuração de Conexão</CardTitle>
              </CardHeader>
          <CardContent className="space-y-4">
            {/* Painel de status do n8n */}
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${n8nStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-white font-semibold">
                  Status: {n8nStatus.online ? 'Online' : 'Offline'}
                </span>
                {n8nStatus.lastChecked && (
                  <span className="text-xs text-gray-400 ml-2">Última verificação: {n8nStatus.lastChecked}</span>
                )}
              </div>
              {n8nStatus.online && (
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-300">
                  {n8nStatus.version && <span>Versão: <b>{n8nStatus.version}</b></span>}
                  {n8nStatus.uptime && <span>Uptime: <b>{n8nStatus.uptime}</b></span>}
                  {typeof n8nStatus.lastResponseTime === 'number' && <span>Tempo de resposta: <b>{n8nStatus.lastResponseTime}ms</b></span>}
                </div>
              )}
              {n8nStatus.error && (
                <div className="text-red-400 text-xs mt-1">{n8nStatus.error}</div>
              )}
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={checkN8nStatus} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Testar Status
                </Button>
              </div>
            </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host" className="text-white">Host</Label>
                    <Input
                      id="host"
                      value={connection.host}
                      onChange={(e) => setConnection(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="localhost ou IP do servidor"
                      className="glass-effect border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="port" className="text-white">Porta</Label>
                    <Input
                      id="port"
                      type="number"
                      value={connection.port}
                      onChange={(e) => setConnection(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                      className="glass-effect border-gray-600 text-white"
                    />
                  </div>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-white">API Key (opcional)</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={connection.apiKey || ''}
                    onChange={(e) => setConnection(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Deixe em branco se não usar autenticação por API Key"
                    className="glass-effect border-gray-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">Usuário (opcional)</Label>
                    <Input
                      id="username"
                      value={connection.username || ''}
                      onChange={(e) => setConnection(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Usuário para autenticação básica"
                      className="glass-effect border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Senha (opcional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={connection.password || ''}
                      onChange={(e) => setConnection(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Senha para autenticação básica"
                      className="glass-effect border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultWorkflow" className="text-white">Workflow Padrão (opcional)</Label>
                  <Input
                    id="defaultWorkflow"
                    value={localStorage.getItem('n8n-default-workflow') || ''}
                    onChange={e => localStorage.setItem('n8n-default-workflow', e.target.value)}
                    placeholder="Nome ou ID do workflow padrão"
                    className="glass-effect border-gray-600 text-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="useSSL"
                    checked={connection.useSSL}
                    onCheckedChange={(checked) => setConnection(prev => ({ ...prev, useSSL: checked }))}
                  />
                  <Label htmlFor="useSSL" className="text-white">Usar HTTPS/SSL</Label>
                </div>

                {error && (
                  <Alert className="border-red-500">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-white">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {isConnected && (
                  <Alert className="border-green-500">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-white">
                      Conectado com sucesso ao n8n!
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={connectToN8n}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4 mr-2" />
                    )}
                    {isConnected ? 'Reconectar' : 'Conectar'}
                  </Button>

                  {isConnected && (
                    <Button
                      onClick={loadWorkflows}
                      variant="outline"
                      disabled={loading}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar Workflows
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            {!isConnected ? (
              <Card className="glass-effect border-0">
                <CardContent className="p-12 text-center">
                  <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Conexão Necessária
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Configure a conexão com seu servidor n8n para visualizar workflows
                  </p>
                  <Button
                    onClick={() => setActiveTab('connection')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    Configurar Conexão
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {workflows.map(workflow => (
                  <Card key={workflow.id} className="glass-effect border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                            <Workflow className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge 
                                variant={workflow.active ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {workflow.active ? 'Ativo' : 'Inativo'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {workflow.nodes?.length || 0} nós
                              </Badge>
                              {workflow.tags?.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => executeWorkflow(workflow.id)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          
                          <Switch
                            checked={workflow.active}
                            onCheckedChange={(checked) => toggleWorkflow(workflow.id, checked)}
                          />
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedWorkflow(workflow)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {workflows.length === 0 && (
                  <Card className="glass-effect border-0">
                    <CardContent className="p-12 text-center">
                      <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Nenhum workflow encontrado
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Crie workflows no n8n ou use nossos templates prontos
                      </p>
                      <Button
                        onClick={() => setActiveTab('templates')}
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        Ver Templates
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workflowTemplates.map(template => (
                <Card key={template.id} className="glass-effect border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {template.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          {template.description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Trigger: {template.trigger}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <Label className="text-white text-sm">Nós incluídos:</Label>
                      <div className="space-y-1">
                        {template.nodes.map((node, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-300">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                            {node.name} ({node.type})
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => createWorkflowFromTemplate(template)}
                      disabled={!isConnected || loading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Criar Workflow
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions" className="space-y-6">
            <Card className="glass-effect border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-400" /> Histórico de Execuções
                  <Button size="sm" variant="outline" onClick={loadExecutions} disabled={loadingExecutions} className="ml-2">
                    <RefreshCw className={`w-4 h-4 mr-1 ${loadingExecutions ? 'animate-spin' : ''}`} /> Atualizar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingExecutions ? (
                  <p className="text-gray-400 text-center py-8">Carregando execuções...</p>
                ) : executions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Nenhuma execução encontrada.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-gray-200">
                      <thead>
                        <tr className="bg-gray-800/60">
                          <th className="p-2">Workflow</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Início</th>
                          <th className="p-2">Duração</th>
                          <th className="p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {executions.map(exec => (
                          <tr key={exec.id} className="border-b border-gray-700 hover:bg-gray-800/40">
                            <td className="p-2">{exec.workflowName || exec.workflowId}</td>
                            <td className="p-2">
                              {exec.finished ? (
                                <span className="text-green-400">Sucesso</span>
                              ) : exec.stoppedAt ? (
                                <span className="text-yellow-400">Parado</span>
                              ) : exec.error ? (
                                <span className="text-red-400">Erro</span>
                              ) : (
                                <span className="text-gray-400">Em andamento</span>
                              )}
                            </td>
                            <td className="p-2">{exec.startedAt ? new Date(exec.startedAt).toLocaleString() : '-'}</td>
                            <td className="p-2">{exec.stoppedAt && exec.startedAt ? `${((new Date(exec.stoppedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000).toFixed(1)}s` : '-'}</td>
                            <td className="p-2">
                              <Button size="sm" variant="outline" onClick={() => setSelectedExecution(exec)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Modal de detalhes da execução */}
            {selectedExecution && (
              <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-400" /> Detalhes da Execução
                    </DialogTitle>
                  </DialogHeader>
                  <div className="text-xs text-gray-300 space-y-2">
                    <div><b>ID:</b> {selectedExecution.id}</div>
                    <div><b>Workflow:</b> {selectedExecution.workflowName || selectedExecution.workflowId}</div>
                    <div><b>Status:</b> {selectedExecution.finished ? 'Sucesso' : selectedExecution.error ? 'Erro' : 'Em andamento'}</div>
                    <div><b>Início:</b> {selectedExecution.startedAt ? new Date(selectedExecution.startedAt).toLocaleString() : '-'}</div>
                    <div><b>Fim:</b> {selectedExecution.stoppedAt ? new Date(selectedExecution.stoppedAt).toLocaleString() : '-'}</div>
                    <div><b>Duração:</b> {selectedExecution.stoppedAt && selectedExecution.startedAt ? `${((new Date(selectedExecution.stoppedAt).getTime() - new Date(selectedExecution.startedAt).getTime()) / 1000).toFixed(1)}s` : '-'}</div>
                    {selectedExecution.error && (
                      <div className="text-red-400"><b>Erro:</b> {typeof selectedExecution.error === 'string' ? selectedExecution.error : JSON.stringify(selectedExecution.error)}</div>
                    )}
                    {selectedExecution.data && (
                      <div>
                        <b>Payload:</b>
                        <pre className="bg-gray-900 rounded p-2 mt-1 overflow-x-auto max-h-60">{JSON.stringify(selectedExecution.data, null, 2)}</pre>
                      </div>
                    )}
                    {selectedExecution.output && (
                      <div>
                        <b>Output:</b>
                        <pre className="bg-gray-900 rounded p-2 mt-1 overflow-x-auto max-h-60">{JSON.stringify(selectedExecution.output, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setSelectedExecution(null)} variant="outline">Fechar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default N8nConfiguration;
