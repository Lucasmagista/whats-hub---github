// src/utils/performanceMonitor.ts
// Sistema de monitoramento de performance

import React from 'react';

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export class PerformanceMonitor {
  private static metrics = new Map<string, PerformanceMetric>();
  private static completedMetrics: PerformanceMetric[] = [];

  static startTiming(name: string, metadata?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };
    
    this.metrics.set(name, metric);
  }

  static endTiming(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    this.completedMetrics.push({ ...metric });
    this.metrics.delete(name);

    // Manter apenas as últimas 50 métricas
    if (this.completedMetrics.length > 50) {
      this.completedMetrics.shift();
    }

    console.log(`⏱️ ${name}: ${metric.duration.toFixed(2)}ms`);
    return metric.duration;
  }

  static getMetrics(): PerformanceMetric[] {
    return [...this.completedMetrics];
  }

  static getAverageTime(name: string): number {
    const namedMetrics = this.completedMetrics.filter(m => m.name === name);
    if (namedMetrics.length === 0) return 0;
    
    const total = namedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / namedMetrics.length;
  }

  static clearMetrics(): void {
    this.metrics.clear();
    this.completedMetrics = [];
  }
}

// Wrapper para componentes React
export function withPerformanceTracking<T extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<T>,
  componentName?: string
): React.ComponentType<T> {
  const Component = (props: T) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'UnknownComponent';
    
    React.useEffect(() => {
      PerformanceMonitor.startTiming(`${name}_mount`);
      return () => {
        PerformanceMonitor.endTiming(`${name}_mount`);
      };
    }, [name]);

    return React.createElement(WrappedComponent, props);
  };

  Component.displayName = `withPerformanceTracking(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;
  return Component;
}