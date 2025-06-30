"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  Download,
  Calendar,
  Activity,
} from "lucide-react"

export default function AnalyticsPage() {
  const metrics = {
    totalMessages: 15420,
    messageGrowth: 12.5,
    activeUsers: 1247,
    userGrowth: 8.3,
    avgResponseTime: 2.3,
    responseImprovement: -15.2,
    resolutionRate: 94.2,
    resolutionGrowth: 3.1,
  }

  const dailyStats = [
    { date: "2024-01-01", messages: 450, users: 89, tickets: 12 },
    { date: "2024-01-02", messages: 523, users: 95, tickets: 15 },
    { date: "2024-01-03", messages: 612, users: 102, tickets: 18 },
    { date: "2024-01-04", messages: 489, users: 87, tickets: 11 },
    { date: "2024-01-05", messages: 678, users: 118, tickets: 22 },
    { date: "2024-01-06", messages: 734, users: 125, tickets: 19 },
    { date: "2024-01-07", messages: 567, users: 98, tickets: 14 },
  ]

  const topCustomers = [
    { name: "João Silva", messages: 45, lastActive: "2 horas atrás" },
    { name: "Maria Santos", messages: 38, lastActive: "1 hora atrás" },
    { name: "Pedro Costa", messages: 32, lastActive: "30 min atrás" },
    { name: "Ana Oliveira", messages: 28, lastActive: "4 horas atrás" },
    { name: "Carlos Lima", messages: 25, lastActive: "1 dia atrás" },
  ]

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )
  }

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? "text-green-600" : "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Relatórios</h1>
        <div className="flex items-center space-x-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Mensagens</p>
                <p className="text-2xl font-bold">{metrics.totalMessages.toLocaleString()}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(metrics.messageGrowth)}
              <span className={`text-sm ml-1 ${getGrowthColor(metrics.messageGrowth)}`}>
                {Math.abs(metrics.messageGrowth)}% vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(metrics.userGrowth)}
              <span className={`text-sm ml-1 ${getGrowthColor(metrics.userGrowth)}`}>
                {Math.abs(metrics.userGrowth)}% vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio de Resposta</p>
                <p className="text-2xl font-bold">{metrics.avgResponseTime}m</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(metrics.responseImprovement)}
              <span className={`text-sm ml-1 ${getGrowthColor(metrics.responseImprovement)}`}>
                {Math.abs(metrics.responseImprovement)}% melhoria
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Resolução</p>
                <p className="text-2xl font-bold">{metrics.resolutionRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(metrics.resolutionGrowth)}
              <span className={`text-sm ml-1 ${getGrowthColor(metrics.resolutionGrowth)}`}>
                {Math.abs(metrics.resolutionGrowth)}% vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Atividade Diária</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyStats.map((day, index) => (
                <div key={day.date} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(day.messages / 800) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12">{day.messages}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{day.users} usuários</span>
                      <span>{day.tickets} tickets</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Clientes Mais Ativos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.name} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.lastActive}</p>
                  </div>
                  <Badge variant="outline">{customer.messages} msgs</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Métricas de Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">2.4k</p>
              <p className="text-sm text-gray-600">Mensagens/dia</p>
              <p className="text-xs text-green-600 mt-1">↑ 15% vs ontem</p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">1.8m</p>
              <p className="text-sm text-gray-600">Tempo médio primeira resposta</p>
              <p className="text-xs text-green-600 mt-1">↓ 12% vs semana passada</p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">96%</p>
              <p className="text-sm text-gray-600">Satisfação do cliente</p>
              <p className="text-xs text-green-600 mt-1">↑ 2% vs mês passado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="w-6 h-6" />
              <span className="text-sm">Relatório Completo</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Métricas de Performance</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Relatório Mensal</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
