"use client"

import { useState, useEffect, useCallback } from "react"
import type { LogEntry } from "@/types"

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch("/api/logs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setLogs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch logs:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
      setLogs([]) // Set empty array as fallback
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()

    // Skip WebSocket for now to avoid connection issues
    
    return () => {
      // No cleanup needed without WebSocket
    }
  }, [fetchLogs])

  const clearLogs = useCallback(async () => {
    try {
      const response = await fetch("/api/logs", { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to clear logs: ${response.statusText}`)
      }
      
      setLogs([])
    } catch (error) {
      console.error("Failed to clear logs:", error)
      throw error
    }
  }, [])

  return {
    logs,
    loading,
    error,
    clearLogs,
    refetch: fetchLogs,
  }
}
