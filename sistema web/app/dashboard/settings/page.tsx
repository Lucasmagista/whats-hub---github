"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Bot, Bell, Shield, Database, Mail, Smartphone, Globe, Users, Save } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Bot Settings
    botName: "WhatsBot Assistant",
    welcomeMessage: "Olá! Como posso ajudá-lo hoje?",
    autoReply: true,
    workingHours: {
      enabled: true,
      start: "09:00",
      end: "18:00",
    },

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    soundAlerts: false,

    // Security
    twoFactorAuth: false,
    sessionTimeout: "30",
    ipWhitelist: "",

    // Integration
    webhookUrl: "",
    apiKey: "sk-1234567890abcdef",

    // General
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
  })

  const handleSave = () => {
    // Here you would save settings to your backend
    console.log("Saving settings:", settings)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="bot" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="bot" className="flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span>Bot</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Geral</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>Configurações do Bot</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="botName">Nome do Bot</Label>
                  <Input
                    id="botName"
                    value={settings.botName}
                    onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => setSettings({ ...settings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
                <Textarea
                  id="welcomeMessage"
                  value={settings.welcomeMessage}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Resposta Automática</Label>
                  <p className="text-sm text-gray-600">Enviar mensagem automática quando receber uma nova conversa</p>
                </div>
                <Switch
                  checked={settings.autoReply}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoReply: checked })}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label>Horário de Funcionamento</Label>
                    <p className="text-sm text-gray-600">Definir horário de atendimento automático</p>
                  </div>
                  <Switch
                    checked={settings.workingHours.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        workingHours: { ...settings.workingHours, enabled: checked },
                      })
                    }
                  />
                </div>
                {settings.workingHours.enabled && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="startTime">Horário de Início</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={settings.workingHours.start}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            workingHours: { ...settings.workingHours, start: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">Horário de Término</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={settings.workingHours.end}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            workingHours: { ...settings.workingHours, end: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Configurações de Notificações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-gray-600">Receber alertas importantes por e-mail</p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-green-500" />
                  <div>
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-gray-600">Receber notificações no navegador</p>
                  </div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <div>
                    <Label>Alertas Sonoros</Label>
                    <p className="text-sm text-gray-600">Reproduzir som para novas mensagens</p>
                  </div>
                </div>
                <Switch
                  checked={settings.soundAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, soundAlerts: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Configurações de Segurança</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-gray-600">Adicionar uma camada extra de segurança</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
                <Select
                  value={settings.sessionTimeout}
                  onValueChange={(value) => setSettings({ ...settings, sessionTimeout: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ipWhitelist">Lista de IPs Permitidos</Label>
                <Textarea
                  id="ipWhitelist"
                  placeholder="192.168.1.1&#10;10.0.0.1&#10;..."
                  value={settings.ipWhitelist}
                  onChange={(e) => setSettings({ ...settings, ipWhitelist: e.target.value })}
                  rows={4}
                />
                <p className="text-sm text-gray-600 mt-1">Um IP por linha. Deixe vazio para permitir todos os IPs.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Integrações e APIs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="webhookUrl">URL do Webhook</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://sua-api.com/webhook"
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                />
                <p className="text-sm text-gray-600 mt-1">URL para receber eventos em tempo real</p>
              </div>

              <div>
                <Label htmlFor="apiKey">Chave da API</Label>
                <div className="flex space-x-2">
                  <Input
                    id="apiKey"
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  />
                  <Button variant="outline">Regenerar</Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">Use esta chave para acessar a API</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">WhatsApp Business API</h4>
                        <p className="text-sm text-gray-600">Conectado</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">SMTP E-mail</h4>
                        <p className="text-sm text-gray-600">Não configurado</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Gerenciamento de Usuários</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      A
                    </div>
                    <div>
                      <h4 className="font-medium">Admin User</h4>
                      <p className="text-sm text-gray-600">admin@empresa.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Admin</span>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      U
                    </div>
                    <div>
                      <h4 className="font-medium">User Agent</h4>
                      <p className="text-sm text-gray-600">agent@empresa.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Agente</span>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>

                <Button className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Adicionar Novo Usuário
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Configurações Gerais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateFormat">Formato de Data</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-medium mb-4">Ações do Sistema</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Backup do Sistema
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Limpar Cache
                  </Button>
                  <Button variant="destructive">
                    <Settings className="w-4 h-4 mr-2" />
                    Reset Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
