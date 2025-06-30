"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Send, Eye, Copy, FileText, Users, Calendar, TrendingUp } from "lucide-react"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
  isActive: boolean
  createdAt: Date
  usageCount: number
}

interface EmailCampaign {
  id: string
  name: string
  templateId: string
  recipients: number
  sent: number
  opened: number
  clicked: number
  status: "draft" | "sending" | "sent" | "paused"
  scheduledAt?: Date
}

export default function EmailsPage() {
  const [templates] = useState<EmailTemplate[]>([
    {
      id: "1",
      name: "Boas-vindas",
      subject: "Bem-vindo ao nosso serviço, {{name}}!",
      content: `Olá {{name}},

Seja bem-vindo ao nosso serviço! Estamos muito felizes em tê-lo conosco.

Seu número de telefone {{phone}} foi registrado com sucesso.

Atenciosamente,
Equipe de Suporte`,
      variables: ["name", "phone"],
      isActive: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      usageCount: 45,
    },
    {
      id: "2",
      name: "Confirmação de Pedido",
      subject: "Pedido #{{orderNumber}} confirmado",
      content: `Olá {{customerName}},

Seu pedido #{{orderNumber}} foi confirmado com sucesso!

Valor total: R$ {{totalAmount}}
Data de entrega prevista: {{deliveryDate}}

Obrigado pela preferência!`,
      variables: ["customerName", "orderNumber", "totalAmount", "deliveryDate"],
      isActive: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      usageCount: 128,
    },
    {
      id: "3",
      name: "Lembrete de Pagamento",
      subject: "Lembrete: Fatura vence em {{daysUntilDue}} dias",
      content: `Olá {{customerName}},

Este é um lembrete de que sua fatura no valor de R$ {{amount}} vence em {{daysUntilDue}} dias.

Data de vencimento: {{dueDate}}

Para evitar juros, realize o pagamento até a data de vencimento.`,
      variables: ["customerName", "amount", "daysUntilDue", "dueDate"],
      isActive: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      usageCount: 23,
    },
  ])

  const [campaigns] = useState<EmailCampaign[]>([
    {
      id: "1",
      name: "Campanha de Boas-vindas Q4",
      templateId: "1",
      recipients: 150,
      sent: 150,
      opened: 89,
      clicked: 23,
      status: "sent",
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      name: "Promoção Black Friday",
      templateId: "2",
      recipients: 500,
      sent: 320,
      opened: 0,
      clicked: 0,
      status: "sending",
    },
  ])

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: "secondary" as const, label: "Rascunho" },
      sending: { variant: "default" as const, label: "Enviando" },
      sent: { variant: "outline" as const, label: "Enviado" },
      paused: { variant: "destructive" as const, label: "Pausado" },
    }
    const config = variants[status as keyof typeof variants]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Templates de E-mail</h1>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Campanha</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaignName">Nome da Campanha</Label>
                  <Input id="campaignName" placeholder="Ex: Promoção de Natal" />
                </div>
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recipients">Lista de Destinatários</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a lista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os clientes</SelectItem>
                      <SelectItem value="active">Clientes ativos</SelectItem>
                      <SelectItem value="new">Novos clientes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Criar Campanha</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="templateName">Nome do Template</Label>
                    <Input id="templateName" placeholder="Ex: Boas-vindas" />
                  </div>
                  <div>
                    <Label htmlFor="templateSubject">Assunto</Label>
                    <Input id="templateSubject" placeholder="Ex: Bem-vindo, {{name}}!" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="templateContent">Conteúdo</Label>
                  <Textarea
                    id="templateContent"
                    rows={8}
                    placeholder="Digite o conteúdo do e-mail. Use {{variavel}} para campos dinâmicos."
                  />
                </div>
                <div>
                  <Label htmlFor="variables">Variáveis Disponíveis</Label>
                  <Input id="variables" placeholder="name, phone, email (separadas por vírgula)" />
                </div>
                <Button className="w-full">Criar Template</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{templates.length}</p>
                <p className="text-sm text-gray-600">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-gray-600">E-mails Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">68%</p>
                <p className="text-sm text-gray-600">Taxa de Abertura</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">12%</p>
                <p className="text-sm text-gray-600">Taxa de Clique</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Templates de E-mail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-medium">{template.name}</h3>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{template.usageCount} usos</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span>Variáveis: {template.variables.join(", ")}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setIsPreviewOpen(true)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-medium">{campaign.name}</h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Destinatários</p>
                      <p className="font-medium">{campaign.recipients}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Enviados</p>
                      <p className="font-medium">{campaign.sent}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Abertos</p>
                      <p className="font-medium">
                        {campaign.opened} ({campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}
                        %)
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cliques</p>
                      <p className="font-medium">
                        {campaign.clicked} (
                        {campaign.sent > 0 ? Math.round((campaign.clicked / campaign.sent) * 100) : 0}
                        %)
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  Ver Relatório
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Assunto</Label>
                <div className="p-3 bg-gray-50 rounded border">{selectedTemplate.subject}</div>
              </div>
              <div>
                <Label>Conteúdo</Label>
                <div className="p-4 bg-gray-50 rounded border whitespace-pre-wrap">{selectedTemplate.content}</div>
              </div>
              <div>
                <Label>Variáveis Disponíveis</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="outline">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
