"use client"

import React, { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle } from 'lucide-react'

interface LazyComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  name?: string
}

// Fallback padrão para componentes lazy
export function LazyLoadingSkeleton({ title, description }: { title?: string; description?: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <CardTitle className="text-sm">{title || 'Carregando...'}</CardTitle>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  )
}

// Fallback de erro para componentes lazy
export function LazyErrorFallback({ error, retry }: { error?: string; retry?: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {error || 'Erro ao carregar componente'}
        {retry && (
          <button 
            onClick={retry}
            className="ml-2 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        )}
      </AlertDescription>
    </Alert>
  )
}

// Wrapper para componentes lazy com tratamento de erros
export function LazyComponent({ 
  children, 
  fallback, 
  errorFallback, 
  name = 'Componente' 
}: LazyComponentProps) {
  const [error, setError] = React.useState<Error | null>(null)
  const [retryCount, setRetryCount] = React.useState(0)

  const handleRetry = React.useCallback(() => {
    setError(null)
    setRetryCount(prev => prev + 1)
  }, [])

  const defaultFallback = fallback || <LazyLoadingSkeleton title={`Carregando ${name}`} />
  const defaultErrorFallback = errorFallback || (
    <LazyErrorFallback 
      error={error?.message || `Erro ao carregar ${name}`}
      retry={handleRetry}
    />
  )

  if (error) {
    return defaultErrorFallback
  }

  return (
    <Suspense 
      fallback={
        <div key={retryCount}>
          {defaultFallback}
        </div>
      }
    >
      <div key={retryCount}>
        {children}
      </div>
    </Suspense>
  )
}

// Componente para lazy loading com intersection observer
interface LazyOnViewProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
  threshold?: number
}

export function LazyOnView({ 
  children, 
  fallback = <LazyLoadingSkeleton />, 
  rootMargin = '50px',
  threshold = 0.1
}: LazyOnViewProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
        }
      },
      { rootMargin, threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin, threshold, hasLoaded])

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  )
}
