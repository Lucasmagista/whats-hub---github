"use client"

import { useState, useEffect, useCallback } from "react"
import type { BotStatus } from "@/types"

const DEFAULT_STATUS: BotStatus = {
  isRunning: false,
  isConnected: false,
  messagesCount: 0,
  uptime: 0,
}

export function useBotStatus() {
  const [status, setStatus] = useState<BotStatus>(DEFAULT_STATUS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch("/api/bot/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setStatus(data ?? DEFAULT_STATUS)
    } catch (error) {
      console.error("Failed to fetch bot status:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
      setStatus(DEFAULT_STATUS) // Set fallback status
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchStatus()
    
    // Set up interval for updates
    const interval = setInterval(fetchStatus, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [fetchStatus])

  const startBot = useCallback(async () => {
    try {
      const response = await fetch("/api/bot/start", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to start bot: ${response.statusText}`)
      }
      
      const data = await response.json()
      setStatus((prev) => ({ ...prev, isRunning: true }))
      return data
    } catch (error) {
      console.error("Failed to start bot:", error)
      throw error
    }
  }, [])

  const stopBot = useCallback(async () => {
    try {
      const response = await fetch("/api/bot/stop", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to stop bot: ${response.statusText}`)
      }
      
      const data = await response.json()
      setStatus((prev) => ({ ...prev, isRunning: false, isConnected: false }))
      return data
    } catch (error) {
      console.error("Failed to stop bot:", error)
      throw error
    }
  }, [])

  return {
    status,
    loading,
    error,
    startBot,
    stopBot,
    refetch: fetchStatus,
  }
}
