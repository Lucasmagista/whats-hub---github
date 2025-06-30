"use client"

import { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ChunkErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ChunkErrorFallback({ error, resetErrorBoundary }: ChunkErrorFallbackProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
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

  const isChunkLoadError = error.name === 'ChunkLoadError' || 
    error.message.includes('Loading chunk') || 
    error.message.includes('ChunkLoadError')

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    try {
      // Aguardar um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (isChunkLoadError) {
        // Para erros de chunk, recarregar a página é mais efetivo
        window.location.reload()
      } else {
        // Para outros erros, tentar resetar o erro boundary
        resetErrorBoundary()
      }
    } catch (retryError) {
      console.error('Erro ao tentar novamente:', retryError)
      setIsRetrying(false)
    }
  }

  const handleHardRefresh = () => {
    // Limpar cache e recarregar
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name)
        })
      })
    }
    window.location.href = window.location.href
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-semibold">
            {isChunkLoadError ? 'Erro de Carregamento' : 'Algo deu errado'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOnline && (
            <Alert>
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                Você está offline. Verifique sua conexão com a internet.
              </AlertDescription>
            </Alert>
          )}

          {isOnline && (
            <Alert>
              <Wifi className="h-4 w-4" />
              <AlertDescription>
                {isChunkLoadError 
                  ? 'Falha ao carregar recursos da aplicação. Isso pode ser devido a uma atualização recente.'
                  : 'Ocorreu um erro inesperado na aplicação.'
                }
              </AlertDescription>
            </Alert>
          )}

          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <strong>Erro:</strong> {error.message}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying || !isOnline}
              className="w-full"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Tentando novamente...' : 'Tentar Novamente'}
            </Button>

            {isChunkLoadError && (
              <Button 
                variant="outline" 
                onClick={handleHardRefresh}
                className="w-full"
              >
                Recarregar Página
              </Button>
            )}
          </div>

          {retryCount > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Tentativas: {retryCount}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
