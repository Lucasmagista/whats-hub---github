"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RealTimeChart } from "./real-time-chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, Users, MessageSquare, Clock, Target, Brain, Download } from "lucide-react"

interface AnalyticsData {
  overview: {
    totalCustomers: number
    activeCustomers: number
    totalMessages: number
    avgResponseTime: number
    satisfactionScore: number
    churnRate: number
  }
  trends: {
    customerGrowth: number
    messageVolume: number
    responseTimeImprovement: number
  }
  sentimentAnalysis: {
    positive: number
    neutral: number
    negative: number
    trend: number
  }
  channelPerformance: Array<{
    channel: string
    messages: number
    satisfaction: number
    responseTime: number
  }>
  predictiveInsights: {
    churnRisk: Array<{
      customerId: string
      customerName: string
      riskScore: number
      factors: string[]
    }>
    demandForecast: Array<{
      date: string
      predicted: number
      actual?: number
    }>
  }
  aiInsights: string[]
}

export function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [timeframe, setTimeframe] = useState("7d")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/analytics/advanced?timeframe=${timeframe}`)
        const analyticsData = await response.json()
        setData(analyticsData)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeframe])

  const exportReport = async () => {
    try {
      const response = await fetch(`/api/analytics/export?timeframe=${timeframe}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-report-${timeframe}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export report:", error)
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <div className="flex space-x-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const sentimentData = [
    { name: "Positive", value: data.sentimentAnalysis.positive, color: "#10b981" },
    { name: "Neutral", value: data.sentimentAnalysis.neutral, color: "#6b7280" },
    { name: "Negative", value: data.sentimentAnalysis.negative, color: "#ef4444" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <div className="flex space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{data.overview.totalCustomers.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {data.trends.customerGrowth > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${data.trends.customerGrowth > 0 ? "text-green-600" : "text-red-600"}`}>
                    {Math.abs(data.trends.customerGrowth)}%
                  </span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Message Volume</p>
                <p className="text-2xl font-bold">{data.overview.totalMessages.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {data.trends.messageVolume > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${data.trends.messageVolume > 0 ? "text-green-600" : "text-red-600"}`}>
                    {Math.abs(data.trends.messageVolume)}%
                  </span>
                </div>
              </div>
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">{data.overview.avgResponseTime}m</p>
                <div className="flex items-center mt-1">
                  {data.trends.responseTimeImprovement > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className="text-sm text-green-600">
                    {Math.abs(data.trends.responseTimeImprovement)}% faster
                  </span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
                <p className="text-2xl font-bold">{data.overview.satisfactionScore}/5.0</p>
                <Progress value={data.overview.satisfactionScore * 20} className="mt-2" />
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sentiment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="channels">Channel Performance</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Insights</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  {sentimentData.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">
                        {item.name}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.aiInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.channelPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="messages" fill="#3b82f6" name="Messages" />
                    <Bar dataKey="satisfaction" fill="#10b981" name="Satisfaction" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Churn Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.predictiveInsights.churnRisk.map((customer) => (
                    <div
                      key={customer.customerId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{customer.customerName}</p>
                        <div className="flex space-x-1 mt-1">
                          {customer.factors.map((factor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            customer.riskScore > 70
                              ? "text-red-600"
                              : customer.riskScore > 40
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {customer.riskScore}%
                        </p>
                        <p className="text-xs text-gray-500">Risk Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demand Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.predictiveInsights.demandForecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="predicted" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <RealTimeChart title="Messages per Minute" metric="messages_per_minute" color="#3b82f6" />
            <RealTimeChart title="Active Users" metric="active_users" color="#10b981" />
            <RealTimeChart title="Response Time (seconds)" metric="response_time" color="#f59e0b" />
            <RealTimeChart title="System Load" metric="system_load" color="#ef4444" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
