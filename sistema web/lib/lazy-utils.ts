import React, { lazy } from 'react'
import { LazyComponent, LazyLoadingSkeleton } from '@/components/lazy-loading'

// HOC para criar componentes lazy com tratamento robusto
export function createLazyComponent<T extends React.ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  name: string,
  fallback?: React.ReactNode
) {
  const LazyLoadedComponent = lazy(async () => {
    try {
      const module = await importFn()
      return module
    } catch (error) {
      console.error(`Failed to load ${name}:`, error)
      
      // Retry logic for chunk errors
      if (error instanceof Error && 
          (error.message.includes('Loading chunk') || 
           error.message.includes('ChunkLoadError'))) {
        
        // Wait and retry once
        await new Promise(resolve => setTimeout(resolve, 1000))
        try {
          return await importFn()
        } catch (retryError) {
          console.error(`Retry failed for ${name}:`, retryError)
          throw retryError
        }
      }
      
      throw error
    }
  })

  return function LazyComponentWrapper(props: React.ComponentProps<T>) {
    return (
      <LazyComponent 
        name={name} 
        fallback={fallback || <LazyLoadingSkeleton title={`Carregando ${name}`} />}
      >
        <LazyLoadedComponent {...props} />
      </LazyComponent>
    )
  }
}

// Hook para preload de componentes
export function useLazyPreload(importFn: () => Promise<unknown>, shouldPreload: boolean) {
  React.useEffect(() => {
    if (shouldPreload) {
      const timer = setTimeout(() => {
        importFn().catch(error => {
          console.warn('Preload failed:', error)
        })
      }, 100) // Small delay to avoid blocking initial render
      
      return () => clearTimeout(timer)
    }
  }, [importFn, shouldPreload])
}
