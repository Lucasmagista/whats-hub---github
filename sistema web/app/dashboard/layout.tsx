"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Loading component
function DashboardLayoutSkeleton() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="h-16 border-b border-gray-200 p-6">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="p-3 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}

// Error component
function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-screen bg-gray-50 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle>Erro de Autenticação</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Não foi possível verificar sua sessão. Por favor, faça login novamente.
          </p>
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
          >
            Tentar Novamente
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("🔒 Usuário não autenticado, redirecionando para login...")
      toast.error("Sessão expirada. Faça login novamente.")
      router.push("/login")
    }
  }, [status, router])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  // Loading state
  if (status === "loading") {
    return <DashboardLayoutSkeleton />
  }

  // Error state
  if (status === "unauthenticated" || !session) {
    return <DashboardError onRetry={handleRetry} />
  }

  // Authenticated state
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
