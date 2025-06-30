"use client"

import { useEffect, useState, useCallback } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  connectionType: string
  isOnline: boolean
  errorCount: number
  lastError: string | null
  timestamp: number
}

interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical'
  metrics: PerformanceMetrics
  recommendations: string[]
}

export function useAppHealth() {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'healthy',
    metrics: {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      connectionType: 'unknown',
      isOnline: true,
      errorCount: 0,
      lastError: null,
      timestamp: Date.now()
    },
    recommendations: []
  })

  const collectMetrics = useCallback((): PerformanceMetrics => {
    const performance = window.performance
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const memory = (performance as any).memory as { usedJSHeapSize: number } | undefined

    // Type-safe connection info
    interface NetworkInformation {
      effectiveType?: string;
    }
    
    interface NavigatorWithConnection extends Navigator {
      connection?: NetworkInformation;
    }
    
    const connection = (navigator as NavigatorWithConnection).connection

    return {
      loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      renderTime: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
      memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0, // MB
      connectionType: connection?.effectiveType || 'unknown',
      isOnline: navigator.onLine,
      errorCount: parseInt(sessionStorage.getItem('app-error-count') || '0'),
      lastError: sessionStorage.getItem('app-last-error'),
      timestamp: Date.now()
    }
  }, [])

  const analyzeHealth = useCallback((metrics: PerformanceMetrics): HealthStatus => {
    const recommendations: string[] = []
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'

    // Analisar tempo de carregamento
    if (metrics.loadTime > 3000) {
      status = 'warning'
      recommendations.push('Tempo de carregamento elevado detectado')
    }
    if (metrics.loadTime > 5000) {
      status = 'critical'
      recommendations.push('Tempo de carregamento crítico - considere otimizações')
    }

    // Analisar uso de memória
    if (metrics.memoryUsage > 50) {
      status = status === 'critical' ? 'critical' : 'warning'
      recommendations.push('Alto uso de memória detectado')
    }
    if (metrics.memoryUsage > 100) {
      status = 'critical'
      recommendations.push('Uso crítico de memória - possível vazamento')
    }

    // Analisar conexão
    if (!metrics.isOnline) {
      status = 'critical'
      recommendations.push('Aplicação está offline')
    } else if (metrics.connectionType === 'slow-2g' || metrics.connectionType === '2g') {
      status = status === 'critical' ? 'critical' : 'warning'
      recommendations.push('Conexão lenta detectada')
    }

    // Analisar erros
    if (metrics.errorCount > 5) {
      status = 'warning'
      recommendations.push('Múltiplos erros detectados')
    }
    if (metrics.errorCount > 10) {
      status = 'critical'
      recommendations.push('Alto número de erros - aplicação instável')
    }

    return {
      status,
      metrics,
      recommendations
    }
  }, [])

  const updateHealth = useCallback(() => {
    const metrics = collectMetrics()
    const healthStatus = analyzeHealth(metrics)
    setHealth(healthStatus)
  }, [collectMetrics, analyzeHealth])

  const reportError = useCallback((error: string) => {
    const currentCount = parseInt(sessionStorage.getItem('app-error-count') || '0')
    sessionStorage.setItem('app-error-count', (currentCount + 1).toString())
    sessionStorage.setItem('app-last-error', error)
    updateHealth()
  }, [updateHealth])

  const clearErrorCount = useCallback(() => {
    sessionStorage.removeItem('app-error-count')
    sessionStorage.removeItem('app-last-error')
    updateHealth()
  }, [updateHealth])

  useEffect(() => {
    // Coletar métricas iniciais
    updateHealth()

    // Atualizar métricas periodicamente
    const interval = setInterval(updateHealth, 30000) // 30 segundos

    // Monitorar mudanças de conectividade
    const handleOnline = () => updateHealth()
    const handleOffline = () => updateHealth()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Monitorar erros globais
    const handleError = (event: ErrorEvent) => {
      reportError(event.message || 'Unknown error')
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(event.reason?.message || String(event.reason))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [updateHealth, reportError])

  return {
    health,
    updateHealth,
    reportError,
    clearErrorCount
  }
}

// Hook para monitoramento de componentes específicos
export function useComponentHealth(componentName: string) {
  const [renderCount, setRenderCount] = useState(0)
  const [lastRenderTime, setLastRenderTime] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    const startTime = performance.now()
    setRenderCount(prev => prev + 1)
    
    return () => {
      const endTime = performance.now()
      setLastRenderTime(endTime - startTime)
    }
  }, []) // Empty dependency array to avoid infinite loop

  const reportComponentError = useCallback((error: string) => {
    setErrors(prev => [...prev.slice(-4), `${new Date().toISOString()}: ${error}`])
  }, [])

  return {
    componentName,
    renderCount,
    lastRenderTime,
    errors,
    reportComponentError
  }
}
