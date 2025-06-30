"use client"

import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChunkErrorFallback } from "./chunk-error-fallback"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }> }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("ErrorBoundary - Error caught:", error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    
    // Log específico para diferentes tipos de erro
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.error("ChunkLoadError detected - this might be due to a deployment update")
    } else if (error.message.includes('call') || error.message.includes('Cannot read properties of undefined')) {
      console.error("Call error detected - likely related to undefined function calls or component errors")
      console.error("Specific error:", error.message)
      console.error("Stack trace:", error.stack)
    } else if (error.message.includes('reading \'call\'')) {
      console.error("Lazy loading error detected - component reference is undefined")
      console.error("This usually happens when a lazy component fails to load properly")
    }
    
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      const resetErrorBoundary = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
        
        // Para ChunkLoadError ou call errors, recarregar a página é mais efetivo
        if (this.state.error?.name === 'ChunkLoadError' || 
            this.state.error?.message.includes('Loading chunk') ||
            this.state.error?.message.includes('call') ||
            this.state.error?.message.includes('Cannot read properties of undefined')) {
          window.location.reload()
        }
      }

      // Usar fallback específico para ChunkLoadError e call errors
      if (this.state.error?.name === 'ChunkLoadError' || 
          this.state.error?.message.includes('Loading chunk') ||
          this.state.error?.message.includes('call') ||
          this.state.error?.message.includes('Cannot read properties of undefined')) {
        return <ChunkErrorFallback error={this.state.error} resetErrorBoundary={resetErrorBoundary} />
      }

      // Usar fallback customizado se fornecido
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetErrorBoundary={resetErrorBoundary} />
      }

      // Fallback padrão para outros erros
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Ocorreu um erro ao carregar a aplicação. Isso pode ser devido a um problema temporário.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-left text-xs text-muted-foreground bg-muted p-3 rounded">
                  <strong>Erro:</strong> {this.state.error.message}
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary>Stack Trace</summary>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              {this.state.error?.message && process.env.NODE_ENV !== 'development' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <p className="text-sm text-red-800 dark:text-red-400 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <Button 
                onClick={resetErrorBoundary}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
