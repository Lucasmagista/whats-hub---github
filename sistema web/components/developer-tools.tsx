"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppHealth } from '@/hooks/use-app-health'
import { useCache } from '@/hooks/use-cache'
import { 
  Settings, 
  RefreshCw, 
  Trash2, 
  Database, 
  Zap, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Monitor
} from 'lucide-react'

interface CacheStats {
  size: number
  totalHits: number
  expiredCount: number
  oldestItem: number
  newestItem: number
}

export function DeveloperTools() {
  const { health, clearErrorCount } = useAppHealth()
  const { clear: clearCache, getStats } = useCache()
  const [testMode, setTestMode] = useState(false)
  const [verboseLogging, setVerboseLogging] = useState(false)
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)

  const triggerError = () => {
    throw new Error('Erro de teste disparado pelo Developer Tools')
  }

  const triggerChunkError = () => {
    // Simula um erro de chunk
    const error = new Error('Loading chunk 123 failed')
    error.name = 'ChunkLoadError'
    throw error
  }

  const clearAllData = () => {
    clearCache()
    clearErrorCount()
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  }

  const refreshCacheStats = () => {
    const stats = getStats()
    setCacheStats(stats)
  }

  const testServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        console.log('Service Worker ready:', registration)
      } catch (error) {
        console.error('Service Worker test failed:', error)
      }
    }
  }

  const testNetworkSpeed = async () => {
    const startTime = performance.now()
    try {
      await fetch('/api/ping', { method: 'HEAD' })
      const endTime = performance.now()
      const latency = endTime - startTime
      console.log(`Network latency: ${latency.toFixed(2)}ms`)
    } catch (error) {
      console.error('Network speed test failed:', error)
    }
  }

  const getHealthStatusIcon = () => {
    switch (health.status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Monitor className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Ferramentas de Desenvolvimento</CardTitle>
        </div>
        <CardDescription>
          Ferramentas para monitoramento, debugging e testes da aplicação
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="health">Saúde</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="tests">Testes</TabsTrigger>
            <TabsTrigger value="settings">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Status da Aplicação</h3>
              <div className="flex items-center space-x-2">
                {getHealthStatusIcon()}
                <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                  {health.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{health.metrics.loadTime.toFixed(0)}ms</div>
                  <p className="text-xs text-muted-foreground">Tempo de Carregamento</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{health.metrics.memoryUsage.toFixed(1)}MB</div>
                  <p className="text-xs text-muted-foreground">Uso de Memória</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{health.metrics.errorCount}</div>
                  <p className="text-xs text-muted-foreground">Erros</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold capitalize">{health.metrics.connectionType}</div>
                  <p className="text-xs text-muted-foreground">Conexão</p>
                </CardContent>
              </Card>
            </div>

            {health.recommendations.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Recomendações:</p>
                    <ul className="text-sm list-disc list-inside">
                      {health.recommendations.map((rec) => (
                        <li key={rec.substring(0, 20)}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button onClick={clearErrorCount} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar Contadores
              </Button>
              <Button onClick={testNetworkSpeed} variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Testar Rede
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Gerenciamento de Cache</h3>
              <Button onClick={refreshCacheStats} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Stats
              </Button>
            </div>

            {cacheStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{cacheStats.size}</div>
                    <p className="text-xs text-muted-foreground">Items em Cache</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{cacheStats.totalHits}</div>
                    <p className="text-xs text-muted-foreground">Total de Hits</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{cacheStats.expiredCount}</div>
                    <p className="text-xs text-muted-foreground">Items Expirados</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {new Date(cacheStats.oldestItem).toLocaleTimeString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Item Mais Antigo</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex space-x-2">
              <Button onClick={clearCache} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Cache
              </Button>
              <Button onClick={refreshCacheStats} variant="outline" size="sm">
                <Database className="h-4 w-4 mr-2" />
                Ver Stats
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            <h3 className="text-lg font-semibold">Testes de Estresse</h3>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Estes testes podem causar erros intencionais para testar a robustez do sistema.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={triggerError} variant="destructive" size="sm">
                <XCircle className="h-4 w-4 mr-2" />
                Disparar Erro Genérico
              </Button>
              
              <Button onClick={triggerChunkError} variant="destructive" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Disparar Erro de Chunk
              </Button>
              
              <Button onClick={testServiceWorker} variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Testar Service Worker
              </Button>
              
              <Button onClick={clearAllData} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Todos os Dados
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h3 className="text-lg font-semibold">Configurações de Desenvolvimento</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="test-mode">Modo de Teste</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativa funcionalidades extras para desenvolvimento
                  </p>
                </div>
                <Switch
                  id="test-mode"
                  checked={testMode}
                  onCheckedChange={setTestMode}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="verbose-logging">Logging Detalhado</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibe logs detalhados no console
                  </p>
                </div>
                <Switch
                  id="verbose-logging"
                  checked={verboseLogging}
                  onCheckedChange={setVerboseLogging}
                />
              </div>
            </div>

            {testMode && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Modo de teste ativado. Funcionalidades extras estão disponíveis.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
