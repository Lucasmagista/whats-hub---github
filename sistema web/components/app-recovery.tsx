"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Home, Shield, Wifi, WifiOff } from 'lucide-react'

interface AppRecoveryProps {
  children: React.ReactNode
}

interface RecoveryState {
  hasError: boolean
  errorType: 'chunk' | 'network' | 'general' | null
  errorMessage: string
  retryCount: number
  isRecovering: boolean
}

const MAX_RETRY_COUNT = 3
const RECOVERY_DELAY = 1000

export function AppRecovery({ children }: AppRecoveryProps) {
  const [state, setState] = useState<RecoveryState>({
    hasError: false,
    errorType: null,
    errorMessage: '',
    retryCount: 0,
    isRecovering: false,
  })
  
  const [isOnline, setIsOnline] = useState(true)

  // Monitorar conexão de rede com verificação de window
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Sistema de recuperação automática
  const recoverApp = useCallback(async (errorType: RecoveryState['errorType']) => {
    if (typeof window === 'undefined') return

    setState(prev => ({ ...prev, isRecovering: true }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, RECOVERY_DELAY))
      
      switch (errorType) {
        case 'chunk':
          // Limpar cache e recarregar
          if ('caches' in window) {
            try {
              const cacheNames = await caches.keys()
              await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
              )
            } catch (error) {
              console.warn('Failed to clear caches:', error)
            }
          }
          window.location.reload()
          break
          
        case 'network':
          // Tentar recarregar após verificar conexão
          if (navigator.onLine) {
            window.location.reload()
          }
          break
          
        default:
          // Recuperação geral
          setState(prev => ({ 
            ...prev, 
            hasError: false, 
            errorType: null, 
            errorMessage: '',
            isRecovering: false 
          }))
      }
    } catch (error) {
      console.error('Recovery failed:', error)
      setState(prev => ({ ...prev, isRecovering: false }))
    }
  }, [])

  // Capturar erros globais com verificação de window
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleError = (event: ErrorEvent) => {
      const error = event.error
      const message = event.message || ''
      
      let errorType: RecoveryState['errorType'] = 'general'
      
      if (message.includes('Loading chunk') || 
          message.includes('ChunkLoadError') ||
          error?.name === 'ChunkLoadError') {
        errorType = 'chunk'
      } else if (!navigator.onLine) {
        errorType = 'network'
      }
      
      setState(prev => ({
        hasError: true,
        errorType,
        errorMessage: message || error?.message || 'Erro desconhecido',
        retryCount: prev.retryCount + 1,
        isRecovering: false,
      }))
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message = reason?.message || String(reason)
      
      let errorType: RecoveryState['errorType'] = 'general'
      
      if (message.includes('Loading chunk') ||
          message.includes('ChunkLoadError') ||
          reason?.name === 'ChunkLoadError') {
        errorType = 'chunk'
      } else if (!navigator.onLine) {
        errorType = 'network'
      }
      
      setState(prev => ({
        hasError: true,
        errorType,
        errorMessage: message,
        retryCount: prev.retryCount + 1,
        isRecovering: false,
      }))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // Auto-recovery para erros de chunk
  useEffect(() => {
    if (state.hasError && state.errorType === 'chunk' && 
        state.retryCount <= MAX_RETRY_COUNT && !state.isRecovering) {
      const timer = setTimeout(() => {
        recoverApp('chunk')
      }, RECOVERY_DELAY * state.retryCount)
      
      return () => clearTimeout(timer)
    }
  }, [state.hasError, state.errorType, state.retryCount, state.isRecovering, recoverApp])

  const handleManualRecovery = () => {
    recoverApp(state.errorType)
  }

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const handleClearStorage = () => {
    if (typeof window === 'undefined') return

    try {
      localStorage.clear()
      sessionStorage.clear()
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name))
        }).catch(error => {
          console.warn('Failed to clear caches:', error)
        })
      }
      window.location.reload()
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  if (state.hasError) {
    const getErrorIcon = () => {
      switch (state.errorType) {
        case 'chunk': return <Shield className="h-8 w-8 text-orange-500" />
        case 'network': return isOnline ? <Wifi className="h-8 w-8 text-green-500" /> : <WifiOff className="h-8 w-8 text-red-500" />
        default: return <AlertTriangle className="h-8 w-8 text-red-500" />
      }
    }

    const getErrorTitle = () => {
      switch (state.errorType) {
        case 'chunk': return 'Erro de Carregamento'
        case 'network': return 'Problema de Conexão'
        default: return 'Erro Inesperado'
      }
    }

    const getErrorDescription = () => {
      switch (state.errorType) {
        case 'chunk': 
          return 'Houve um problema ao carregar componentes da aplicação. Isso geralmente acontece após atualizações.'
        case 'network':
          return isOnline 
            ? 'Problemas de conectividade detectados. Verifique sua conexão.'
            : 'Você está offline. Verifique sua conexão com a internet.'
        default:
          return 'Ocorreu um erro inesperado na aplicação. Tente as opções de recuperação abaixo.'
      }
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getErrorIcon()}
            </div>
            <CardTitle className="text-xl">{getErrorTitle()}</CardTitle>
            <CardDescription>
              {getErrorDescription()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {!isOnline && (
              <Alert>
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  Conectividade offline detectada
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Button 
                onClick={handleManualRecovery}
                disabled={state.isRecovering}
                className="w-full"
                variant="default"
              >
                {state.isRecovering ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Recuperando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar Recuperar
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Ir para Início
              </Button>
              
              {state.retryCount > 2 && (
                <Button 
                  onClick={handleClearStorage}
                  variant="destructive"
                  className="w-full"
                  size="sm"
                >
                  Limpar Cache e Reiniciar
                </Button>
              )}
            </div>
            
            {state.retryCount > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                Tentativas: {state.retryCount}/{MAX_RETRY_COUNT}
              </div>
            )}
            
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Detalhes técnicos
              </summary>
              <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                <p><strong>Tipo:</strong> {state.errorType}</p>
                <p><strong>Mensagem:</strong> {state.errorMessage}</p>
                <p><strong>Online:</strong> {isOnline ? 'Sim' : 'Não'}</p>
                <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
