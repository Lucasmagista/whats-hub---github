"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  Users,
  MessageSquare,
  Clock,
  TrendingUp,
  Mail,
  CheckCircle,
} from "lucide-react"

interface Report {
  id: string
  name: string
  description: string
  type: "performance" | "customer" | "financial" | "operational"
  lastGenerated: Date
  status: "ready" | "generating" | "error"
  size: string
}

export default function ReportsPage() {
  const [reports] = useState<Report[]>([
    {
      id: "1",
      name: "Relatório de Performance Mensal",
      description: "Métricas de atendimento, tempo de resposta e satisfação do cliente",
      type: "performance",
      lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "ready",
      size: "2.4 MB",
    },
    {
      id: "2",
      name: "Análise de Clientes",
      description: "Segmentação de clientes, comportamento e histórico de interações",
      type: "customer",
      lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: "ready",
      size: "1.8 MB",
    },
    {
      id: "3",
      name: "Relatório Financeiro",
      description: "Receitas, custos operacionais e ROI do atendimento",
      type: "financial",
      lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: "ready",
      size: "956 KB",
    },
    {
      id: "4",
      name: "Operações e Tickets",
      description: "Volume de tickets, tempo de resolução e distribuição por categoria",
      type: "operational",
      lastGenerated: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: "generating",
      size: "-",
    },
  ])

  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedType, setSelectedType] = useState("all")

  const getStatusBadge = (status: string) => {
    const variants = {
      ready: { variant: "default" as const, label: "Pronto" },
      generating: { variant: "secondary" as const, label: "Gerando" },
      error: { variant: "destructive" as const, label: "Erro" },
    }
    const config = variants[status as keyof typeof variants]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance":
        return <BarChart3 className="w-5 h-5 text-blue-500" />
      case "customer":
        return <Users className="w-5 h-5 text-green-500" />
      case "financial":
        return <TrendingUp className="w-5 h-5 text-purple-500" />
      case "operational":
        return <CheckCircle className="w-5 h-5 text-orange-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const filteredReports = reports.filter((report) => selectedType === "all" || report.type === selectedType)

  const quickStats = {
    totalReports: reports.length,
    readyReports: reports.filter((r) => r.status === "ready").length,
    totalSize: "12.8 MB",
    lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios & Exportações</h1>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{quickStats.totalReports}</p>
                <p className="text-sm text-gray-600">Total de Relatórios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{quickStats.readyReports}</p>
                <p className="text-sm text-gray-600">Prontos para Download</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{quickStats.totalSize}</p>
                <p className="text-sm text-gray-600">Tamanho Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">6h</p>
                <p className="text-sm text-gray-600">Última Atualização</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatórios Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-24 flex-col space-y-2">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <span className="text-sm">Performance Diária</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col space-y-2">
              <Users className="w-8 h-8 text-green-500" />
              <span className="text-sm">Clientes Ativos</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col space-y-2">
              <MessageSquare className="w-8 h-8 text-purple-500" />
              <span className="text-sm">Mensagens por Hora</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col space-y-2">
              <CheckCircle className="w-8 h-8 text-orange-500" />
              <span className="text-sm">Tickets Resolvidos</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="customer">Clientes</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
                <SelectItem value="operational">Operacional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">{getTypeIcon(report.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Gerado em {new Date(report.lastGenerated).toLocaleDateString("pt-BR")}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>{report.size}</span>
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {report.status === "ready" && (
                    <>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar por E-mail
                      </Button>
                    </>
                  )}
                  {report.status === "generating" && (
                    <Button variant="outline" size="sm" disabled>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Regenerar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Agendados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="font-medium">Relatório Semanal de Performance</h4>
                  <p className="text-sm text-gray-600">Toda segunda-feira às 9:00</p>
                </div>
              </div>
              <Badge>Ativo</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Análise Mensal de Clientes</h4>
                  <p className="text-sm text-gray-600">Todo dia 1º do mês às 8:00</p>
                </div>
              </div>
              <Badge>Ativo</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <div>
                  <h4 className="font-medium">Relatório Financeiro Trimestral</h4>
                  <p className="text-sm text-gray-600">A cada 3 meses</p>
                </div>
              </div>
              <Badge variant="secondary">Pausado</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
