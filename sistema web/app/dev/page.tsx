"use client"

import React from 'react'
import { DeveloperTools } from '@/components/developer-tools'
import ErrorBoundary from '@/components/error-boundary'
import { ErrorFallback } from '@/components/error-fallback'

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Ferramentas de Desenvolvimento</h1>
          <p className="text-muted-foreground">
            Ambiente de testes e monitoramento da aplicação
          </p>
        </div>
        
        <ErrorBoundary fallback={ErrorFallback}>
          <DeveloperTools />
        </ErrorBoundary>
      </div>
    </div>
  )
}
