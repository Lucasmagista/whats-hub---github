"use client"

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, Wifi } from 'lucide-react'

interface ClientWrapperProps {
  children: React.ReactNode
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    // Detectar erros de chunk de forma global
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      let error: Error

      if ('error' in event) {
        error = event.error
      } else if ('reason' in event) {
        error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      } else {
        return
      }

      // Verificar se é um erro de chunk
      const isChunkError = 
        error.name === 'ChunkLoadError' ||
        error.message.includes('Loading chunk') ||
        error.message.includes('ChunkLoadError') ||
        (error.message.includes('timeout') && error.message.includes('static/chunks'))

      if (isChunkError) {
        console.warn('Chunk loading error detected globally:', error)
        setShowUpdatePrompt(true)
      }
    }

    window.addEventListener('error', handleChunkError)
    window.addEventListener('unhandledrejection', handleChunkError)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('error', handleChunkError)
      window.removeEventListener('unhandledrejection', handleChunkError)
    }
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4">
          <Alert className="border-yellow-200 bg-yellow-50">
            <Wifi className="h-4 w-4" />
            <AlertDescription>
              Você está offline. Algumas funcionalidades podem não funcionar corretamente.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {showUpdatePrompt && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4">
          <Alert className="border-blue-200 bg-blue-50">
            <RefreshCw className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Uma nova versão está disponível. Recarregue a página para atualizar.</span>
              <Button 
                size="sm" 
                onClick={handleRefresh}
                className="ml-4"
              >
                Recarregar
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className={`${!isOnline || showUpdatePrompt ? 'pt-16' : ''}`}>
        {children}
      </div>
    </>
  )
}
