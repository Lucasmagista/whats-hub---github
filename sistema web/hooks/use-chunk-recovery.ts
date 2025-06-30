"use client"

import { useEffect, useState } from 'react'

interface UseChunkErrorRecoveryOptions {
  onChunkError?: (error: Error) => void
  maxRetries?: number
  retryDelay?: number
}

export function useChunkErrorRecovery(options: UseChunkErrorRecoveryOptions = {}) {
  const { onChunkError, maxRetries = 3, retryDelay = 1000 } = options
  const [retryCount, setRetryCount] = useState(0)
  const [isRecovering, setIsRecovering] = useState(false)

  useEffect(() => {
    // Só executar no client-side
    if (typeof window === 'undefined') return

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
        console.warn('Chunk loading error detected:', error)
        onChunkError?.(error)
        
        if (retryCount < maxRetries) {
          setIsRecovering(true)
          setRetryCount(prev => prev + 1)
          
          setTimeout(() => {
            console.log(`Attempting chunk error recovery (attempt ${retryCount + 1}/${maxRetries})`)
            window.location.reload()
          }, retryDelay)
        } else {
          console.error(`Max retry attempts (${maxRetries}) reached for chunk loading`)
        }
      }
    }

    // Capturar erros não tratados
    window.addEventListener('error', handleChunkError)
    window.addEventListener('unhandledrejection', handleChunkError)

    return () => {
      window.removeEventListener('error', handleChunkError)
      window.removeEventListener('unhandledrejection', handleChunkError)
    }
  }, [onChunkError, maxRetries, retryDelay, retryCount])

  const forceRecovery = () => {
    if (typeof window === 'undefined') return
    
    setIsRecovering(true)
    
    // Limpar caches do service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister()
        })
      })
    }

    // Limpar cache do browser
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name)
        })
      }).then(() => {
        window.location.reload()
      })
    } else {
      window.location.reload()
    }
  }

  return {
    retryCount,
    isRecovering,
    forceRecovery,
  }
}

// Hook para detectar atualizações de deployment
export function useDeploymentUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Só executar no client-side
    if (typeof window === 'undefined') return

    let timeoutId: NodeJS.Timeout

    const checkForUpdates = async () => {
      try {
        // Verificar se há uma nova versão consultando um endpoint de versão
        const response = await fetch('/_next/static/chunks/webpack.js?' + Date.now(), {
          method: 'HEAD',
          cache: 'no-cache'
        })
        
        if (!response.ok && response.status !== 404) {
          // Se o webpack.js não pode ser carregado, pode indicar nova versão
          setUpdateAvailable(true)
        }
      } catch (error) {
        // Erro de rede pode indicar problemas de chunk
        console.warn('Update check failed:', error)
      }
    }

    // Verificar periodicamente por atualizações
    const startUpdateCheck = () => {
      timeoutId = setTimeout(() => {
        checkForUpdates()
        startUpdateCheck() // Recursivo
      }, 30000) // A cada 30 segundos
    }

    startUpdateCheck()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  const refreshApp = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return {
    updateAvailable,
    refreshApp,
  }
}
