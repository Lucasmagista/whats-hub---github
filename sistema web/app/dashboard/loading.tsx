import React from "react"
import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Carregando dashboard...</p>
      </div>
    </div>
  )
}
