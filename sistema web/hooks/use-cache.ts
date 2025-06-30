"use client"

import { useCallback, useEffect, useRef, useState } from 'react'

interface CacheOptions {
  ttl?: number // Time to live em milliseconds
  maxSize?: number // Tamanho máximo do cache
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
}

interface CacheItem<T> {
  data: T
  timestamp: number
  hits: number
}

class CacheManager<T = unknown> {
  private cache = new Map<string, CacheItem<T>>()
  private options: Required<CacheOptions>
  private storageKey: string

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutos por padrão
      maxSize: options.maxSize || 100,
      storage: options.storage || 'memory'
    }
    this.storageKey = `app-cache-${Date.now()}`
    this.loadFromStorage()
  }

  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > this.options.ttl
  }

  private loadFromStorage(): void {
    if (this.options.storage === 'memory') return
    
    try {
      const storage = this.options.storage === 'localStorage' ? localStorage : sessionStorage
      const data = storage.getItem(this.storageKey)
      if (data) {
        const parsed = JSON.parse(data)
        Object.entries(parsed).forEach(([key, value]) => {
          this.cache.set(key, value as CacheItem<T>)
        })
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
    }
  }

  private saveToStorage(): void {
    if (this.options.storage === 'memory') return
    
    try {
      const storage = this.options.storage === 'localStorage' ? localStorage : sessionStorage
      const data = Object.fromEntries(this.cache.entries())
      storage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save cache to storage:', error)
    }
  }

  private cleanup(): void {
    const entries = Array.from(this.cache.entries())
    
    // Remove items expirados
    entries.forEach(([key, item]) => {
      if (this.isExpired(item)) {
        this.cache.delete(key)
      }
    })

    // Remove items menos utilizados se exceder o tamanho máximo
    if (this.cache.size > this.options.maxSize) {
      const sortedEntries = entries
        .filter(([, item]) => !this.isExpired(item))
        .sort(([, a], [, b]) => a.hits - b.hits)
      
      const itemsToRemove = sortedEntries.slice(0, this.cache.size - this.options.maxSize)
      itemsToRemove.forEach(([key]) => this.cache.delete(key))
    }

    this.saveToStorage()
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (this.isExpired(item)) {
      this.cache.delete(key)
      return null
    }

    // Incrementar contador de hits
    item.hits++
    this.cache.set(key, item)
    
    return item.data
  }

  set(key: string, data: T): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      hits: 0
    }
    
    this.cache.set(key, item)
    this.cleanup()
  }

  invalidate(key: string): void {
    this.cache.delete(key)
    this.saveToStorage()
  }

  clear(): void {
    this.cache.clear()
    if (this.options.storage !== 'memory') {
      try {
        const storage = this.options.storage === 'localStorage' ? localStorage : sessionStorage
        storage.removeItem(this.storageKey)
      } catch (error) {
        console.warn('Failed to clear cache storage:', error)
      }
    }
  }

  getStats() {
    const entries = Array.from(this.cache.values())
    return {
      size: this.cache.size,
      totalHits: entries.reduce((sum, item) => sum + item.hits, 0),
      expiredCount: entries.filter(item => this.isExpired(item)).length,
      oldestItem: Math.min(...entries.map(item => item.timestamp)),
      newestItem: Math.max(...entries.map(item => item.timestamp))
    }
  }
}

// Hook para cache de dados
export function useCache<T>(options?: CacheOptions) {
  const cacheRef = useRef<CacheManager<T>>()
  
  if (!cacheRef.current) {
    cacheRef.current = new CacheManager<T>(options)
  }

  const get = useCallback((key: string) => {
    return cacheRef.current?.get(key) || null
  }, [])

  const set = useCallback((key: string, data: T) => {
    cacheRef.current?.set(key, data)
  }, [])

  const invalidate = useCallback((key: string) => {
    cacheRef.current?.invalidate(key)
  }, [])

  const clear = useCallback(() => {
    cacheRef.current?.clear()
  }, [])

  const getStats = useCallback(() => {
    return cacheRef.current?.getStats()
  }, [])

  return { get, set, invalidate, clear, getStats }
}

// Hook para cache de requisições HTTP
export function useCachedFetch<T>(
  url: string | null,
  options?: RequestInit & { cacheOptions?: CacheOptions }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const { get, set } = useCache<T>(options?.cacheOptions)
  
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!url) return

    const cacheKey = `fetch-${url}-${JSON.stringify(options)}`
    
    // Tentar buscar do cache primeiro
    if (!forceRefresh) {
      const cached = get(cacheKey)
      if (cached) {
        setData(cached)
        return cached
      }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Salvar no cache
      set(cacheKey, result)
      setData(result)
      
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [url, options, get, set])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    refresh: () => fetchData(false)
  }
}

// Hook para debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook para throttle
export function useThrottle<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
) {
  const lastRan = useRef(Date.now())

  return useCallback(
    (...args: T) => {
      if (Date.now() - lastRan.current >= delay) {
        callback(...args)
        lastRan.current = Date.now()
      }
    },
    [callback, delay]
  )
}
