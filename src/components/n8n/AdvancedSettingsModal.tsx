/**
 * ⚙️ AdvancedSettingsModal - FASE 2 FUNCIONALIDADES AVANÇADAS
 * Modal de configurações avançadas para integração N8N + WhatsApp
 */

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  MessageSquare, 
  Bot, 
  Clock, 
  Shield, 
  BarChart3, 
  Download, 
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Zap,
  Database
} from 'lucide-react';
import { configurationManager, SystemConfiguration } from '@/services/configurationManager';
import { useConfiguration } from '@/hooks/useConfiguration';
import { ConfigurationHealthDashboard } from '@/components/dashboard/ConfigurationHealthDashboard';
import { toast } from '@/hooks/use-toast';

interface AdvancedSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  open,
  onOpenChange
}) => {
  const [config, setConfig] = useState<SystemConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [importData, setImportData] = useState('');

  useEffect(() => {
    if (open) {
      loadConfiguration();
    }
  }, [open]);

  const loadConfiguration = () => {
    try {
      const currentConfig = configurationManager.getConfiguration();
      setConfig(currentConfig);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    }
  };

  const saveConfiguration = async () => {
    if (!config) return;

    setLoading(true);
    try {
      // Primeiro salvar as configurações
      configurationManager.updateFullConfiguration(config);
      
      // Aguardar um pouco para garantir que foi salvo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Aplicar às integrações
      await configurationManager.applyToIntegration();
      
      // Verificar se foi realmente salvo
      const savedConfig = configurationManager.getConfiguration();
      const isConfigSaved = JSON.stringify(savedConfig) === JSON.stringify(config);
      
      if (isConfigSaved) {
        toast({
          title: "✅ Sucesso",
          description: "Configurações salvas e aplicadas com sucesso!",
          variant: "default"
        });
        
        // Forçar atualização da interface
        loadConfiguration();
        onOpenChange(false);
      } else {
        throw new Error('Configurações não foram salvas corretamente');
      }
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "❌ Erro",
        description: `Erro ao salvar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    configurationManager.resetToDefaults();
    loadConfiguration();
    toast({
      title: "Configurações Restauradas",
      description: "Todas as configurações foram restauradas para os valores padrão",
      variant: "default"
    });
  };

  const exportConfiguration = () => {
    const exported = configurationManager.exportConfiguration();
    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsHub-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configurações Exportadas",
      description: "Arquivo de configuração baixado com sucesso",
      variant: "default"
    });
  };

  const importConfiguration = () => {
    if (!importData) {
      toast({
        title: "Erro",
        description: "Cole os dados de configuração no campo de importação",
        variant: "destructive"
      });
      return;
    }

    const result = configurationManager.importConfiguration(importData);
    
    if (result.success) {
      loadConfiguration();
      setImportData('');
      toast({
        title: "Configurações Importadas",
        description: "Configurações importadas com sucesso",
        variant: "default"
      });
    } else {
      toast({
        title: "Erro na Importação",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const updateConfig = (section: keyof SystemConfiguration, field: string, value: unknown) => {
    if (!config) return;

    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    });
  };

  const updateNestedConfig = (section: keyof SystemConfiguration, parent: string, field: string, value: unknown) => {
    if (!config) return;

    const sectionValue = config[section] as Record<string, unknown>;
    const parentValue = sectionValue[parent] as Record<string, unknown>;

    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [parent]: {
          ...parentValue,
          [field]: value
        }
      }
    });
  };

  if (!config) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Avançadas da Integração
          </DialogTitle>
          <DialogDescription>
            Configure todos os aspectos da integração N8N + WhatsApp
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="whatsapp" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="n8n" className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              N8N
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Fila
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Backup
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Diagnósticos
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-1">
              <Upload className="h-3 w-3" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* WhatsApp Settings */}
          <TabsContent value="whatsapp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Configurações WhatsApp
                </CardTitle>
                <CardDescription>
                  Configure o comportamento do WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoReply">Resposta Automática</Label>
                    <p className="text-sm text-muted-foreground">Enviar mensagens automáticas</p>
                  </div>
                  <Switch 
                    id="autoReply"
                    checked={config.whatsapp.autoReply}
                    onCheckedChange={(value) => updateConfig('whatsapp', 'autoReply', value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replyDelay">Delay de Resposta (ms)</Label>
                  <Input
                    id="replyDelay"
                    type="number"
                    value={config.whatsapp.replyDelay}
                    onChange={(e) => updateConfig('whatsapp', 'replyDelay', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Horário Comercial</Label>
                    <Switch 
                      checked={config.whatsapp.businessHours.enabled}
                      onCheckedChange={(value) => updateNestedConfig('whatsapp', 'businessHours', 'enabled', value)}
                    />
                  </div>

                  {config.whatsapp.businessHours.enabled && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-blue-200">
                      <div>
                        <Label htmlFor="startTime">Hora de Início</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={config.whatsapp.businessHours.start}
                          onChange={(e) => updateNestedConfig('whatsapp', 'businessHours', 'start', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">Hora de Fim</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={config.whatsapp.businessHours.end}
                          onChange={(e) => updateNestedConfig('whatsapp', 'businessHours', 'end', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* N8N Settings */}
          <TabsContent value="n8n" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Configurações N8N
                </CardTitle>
                <CardDescription>
                  Configure a conexão com o N8N
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">URL do Webhook</Label>
                  <Input
                    id="webhookUrl"
                    value={config.n8n.webhookUrl}
                    onChange={(e) => updateConfig('n8n', 'webhookUrl', e.target.value)}
                    placeholder="http://localhost:5678/webhook/whatsapp-messages"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiUrl">URL da API</Label>
                  <Input
                    id="apiUrl"
                    value={config.n8n.apiUrl}
                    onChange={(e) => updateConfig('n8n', 'apiUrl', e.target.value)}
                    placeholder="http://localhost:5678/api/v1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="n8nUsername">Usuário</Label>
                    <Input
                      id="n8nUsername"
                      value={config.n8n.username}
                      onChange={(e) => updateConfig('n8n', 'username', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="n8nPassword">Senha</Label>
                    <Input
                      id="n8nPassword"
                      type="password"
                      value={config.n8n.password}
                      onChange={(e) => updateConfig('n8n', 'password', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={config.n8n.timeout}
                    onChange={(e) => updateConfig('n8n', 'timeout', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Queue Settings */}
          <TabsContent value="queue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Configurações da Fila
                </CardTitle>
                <CardDescription>
                  Configure o sistema de fila de atendimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="queueEnabled">Sistema de Fila</Label>
                    <p className="text-sm text-muted-foreground">Ativar fila de atendimento</p>
                  </div>
                  <Switch 
                    id="queueEnabled"
                    checked={config.queue.enabled}
                    onCheckedChange={(value) => updateConfig('queue', 'enabled', value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxWaitTime">Tempo Máximo de Espera (minutos)</Label>
                  <Input
                    id="maxWaitTime"
                    type="number"
                    value={config.queue.maxWaitTime}
                    onChange={(e) => updateConfig('queue', 'maxWaitTime', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoAssign">Auto-atribuição</Label>
                    <p className="text-sm text-muted-foreground">Atribuir automaticamente para atendentes</p>
                  </div>
                  <Switch 
                    id="autoAssign"
                    checked={config.queue.autoAssign}
                    onCheckedChange={(value) => updateConfig('queue', 'autoAssign', value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Settings */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Configurações de Backup
                </CardTitle>
                <CardDescription>
                  Configure backups automáticos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="backupEnabled">Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">Fazer backup automaticamente</p>
                  </div>
                  <Switch 
                    id="backupEnabled"
                    checked={config.backup.enabled}
                    onCheckedChange={(value) => updateConfig('backup', 'enabled', value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupInterval">Intervalo (minutos)</Label>
                  <Input
                    id="backupInterval"
                    type="number"
                    value={config.backup.interval}
                    onChange={(e) => updateConfig('backup', 'interval', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxBackups">Máximo de Backups</Label>
                  <Input
                    id="maxBackups"
                    type="number"
                    value={config.backup.maxBackups}
                    onChange={(e) => updateConfig('backup', 'maxBackups', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Settings */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Configurações de Monitoramento
                </CardTitle>
                <CardDescription>
                  Configure alertas e thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monitoringEnabled">Monitoramento</Label>
                    <p className="text-sm text-muted-foreground">Ativar sistema de monitoramento</p>
                  </div>
                  <Switch 
                    id="monitoringEnabled"
                    checked={config.monitoring.enabled}
                    onCheckedChange={(value) => updateConfig('monitoring', 'enabled', value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="queueSizeThreshold">Tamanho da Fila</Label>
                    <Input
                      id="queueSizeThreshold"
                      type="number"
                      value={config.monitoring.alertThresholds.queueSize}
                      onChange={(e) => updateNestedConfig('monitoring', 'alertThresholds', 'queueSize', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responseTimeThreshold">Tempo de Resposta (ms)</Label>
                    <Input
                      id="responseTimeThreshold"
                      type="number"
                      value={config.monitoring.alertThresholds.responseTime}
                      onChange={(e) => updateNestedConfig('monitoring', 'alertThresholds', 'responseTime', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diagnósticos */}
          <TabsContent value="diagnostics" className="space-y-6">
            <ConfigurationHealthDashboard />
          </TabsContent>

          {/* Export/Import */}
          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Configurações
                  </CardTitle>
                  <CardDescription>
                    Faça backup das suas configurações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={exportConfiguration} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Importar Configurações
                  </CardTitle>
                  <CardDescription>
                    Restaure configurações de um backup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Cole aqui o JSON das configurações..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={6}
                  />
                  <Button 
                    onClick={importConfiguration} 
                    className="w-full"
                    disabled={!importData}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Restaurar Padrões
                </CardTitle>
                <CardDescription>
                  Restaurar todas as configurações para os valores padrão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={resetToDefaults} 
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restaurar Configurações Padrão
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={saveConfiguration} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSettingsModal;
