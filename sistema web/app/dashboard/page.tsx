"use client"

import React, { Suspense, useState, useEffect } from 'react'
import ErrorBoundary from '@/components/error-boundary'
import { ErrorFallback } from '@/components/error-fallback'
import { LazyLoadingSkeleton } from '@/components/lazy-loading'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Activity, Users, MessageCircle, TrendingUp, Bot, Wifi, WifiOff } from 'lucide-react'

// Componente de fallback para loading
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((id) => (
          <Card key={`skeleton-card-${id}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente de status de saúde da aplicação
function AppHealthIndicator() {
  const [mounted, setMounted] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  
  useEffect(() => {
    setMounted(true)
    
    // Verificar status online/offline
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }
    
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
      
      return () => {
        window.removeEventListener('online', updateOnlineStatus)
        window.removeEventListener('offline', updateOnlineStatus)
      }
    }
  }, [])
  
  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
        <span className="text-muted-foreground">Status:</span>
        <Badge variant="secondary">Carregando...</Badge>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-muted-foreground">Status:</span>
      <Badge variant={isOnline ? 'default' : 'destructive'}>
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
      {isOnline ? (
        <Wifi className="h-3 w-3 text-green-500" />
      ) : (
        <WifiOff className="h-3 w-3 text-red-500" />
      )}
    </div>
  )
}

// Componente de estatísticas básicas com monitoramento
function DashboardStats() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <LazyLoadingSkeleton title="Carregando estatísticas" />
  }
  
  // Dados mock para demonstração - em produção viriam de APIs
  const stats = {
    totalMessages: 1234,
    activeUsers: 89,
    botStatus: 'online',
    growthRate: 12.5
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Mensagens Totais"
          value={stats.totalMessages.toLocaleString()}
          change="+20.1% em relação ao mês passado"
          changeType="positive"
          icon={MessageCircle}
        />
        
        <StatsCard
          title="Usuários Ativos"
          value={stats.activeUsers.toString()}
          change="+180.1% em relação ao mês passado"
          changeType="positive"
          icon={Users}
        />
        
        <StatsCard
          title="Status do Bot"
          value={stats.botStatus === 'online' ? 'Online' : 'Offline'}
          change="Funcionando normalmente"
          changeType={stats.botStatus === 'online' ? 'positive' : 'negative'}
          icon={Bot}
        />
        
        <StatsCard
          title="Taxa de Crescimento"
          value={`${stats.growthRate}%`}
          change="+19% em relação ao mês passado"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>
    </div>
  )
}

// Componente de métricas de performance
function PerformanceMetrics() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <LazyLoadingSkeleton title="Carregando métricas" />
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Métricas de Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Tempo de Carregamento:</span>
          <span>~500ms</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Uso de Memória:</span>
          <span>25.2MB</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Conexão:</span>
          <span className="capitalize">4g</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Erros:</span>
          <span>0</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente principal do dashboard
function DashboardContent() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do seu bot do WhatsApp e estatísticas de uso.
          </p>
        </div>
        <AppHealthIndicator />
      </div>
      
      <div className="space-y-4">
        <ErrorBoundary fallback={ErrorFallback}>
          <Suspense fallback={<LazyLoadingSkeleton title="Carregando estatísticas" />}>
            <DashboardStats />
          </Suspense>
        </ErrorBoundary>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Visão Geral</CardTitle>
              <CardDescription>
                Resumo das atividades recentes do seu bot.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Gráficos e relatórios serão exibidos aqui</p>
                  <p className="text-sm mt-2">Em desenvolvimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Mensagens recentes</p>
                    <p className="text-xs mt-1">Em desenvolvimento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Suspense fallback={<LazyLoadingSkeleton title="Carregando métricas" />}>
              <PerformanceMetrics />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

// Página principal do dashboard com tratamento de erros
export default function DashboardPage() {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  )
}
