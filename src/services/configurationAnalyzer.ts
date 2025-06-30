/**
 * 📊 Configuration Analyzer - Sistema Avançado de Análise de Configurações
 * Separa a lógica de análise para reduzir complexidade do ConfigurationManager
 */

import { SystemConfiguration } from './configurationManager';

export interface ConfigurationMetrics {
  totalConfigurations: number;
  activeFeatures: number;
  securityScore: number;
  performanceScore: number;
  complianceScore: number;
  observabilityScore: number;
  userExperienceScore: number;
  lastModified: string;
  memoryUsage: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ConfigurationReport {
  summary: string;
  recommendations: string[];
  warnings: string[];
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  optimizationSuggestions: string[];
  securityIssues: string[];
  performanceIssues: string[];
  complianceIssues: string[];
}

export interface ConfigurationComparison {
  differences: Array<{
    path: string;
    current: unknown;
    other: unknown;
    type: 'added' | 'removed' | 'modified';
  }>;
  compatibilityScore: number;
  migrationRequired: boolean;
  criticalChanges: string[];
}

export class ConfigurationAnalyzer {
  private static instance: ConfigurationAnalyzer;

  public static getInstance(): ConfigurationAnalyzer {
    if (!ConfigurationAnalyzer.instance) {
      ConfigurationAnalyzer.instance = new ConfigurationAnalyzer();
    }
    return ConfigurationAnalyzer.instance;
  }

  /**
   * Calcula métricas detalhadas da configuração
   */
  calculateMetrics(config: SystemConfiguration): ConfigurationMetrics {
    const securityScore = this.calculateSecurityScore(config);
    const performanceScore = this.calculatePerformanceScore(config);
    const complianceScore = this.calculateComplianceScore(config);
    const observabilityScore = this.calculateObservabilityScore(config);
    const userExperienceScore = this.calculateUserExperienceScore(config);
    
    const activeFeatures = this.countActiveFeatures(config);
    const memoryUsage = this.estimateMemoryUsage(config);
    
    // Calcular status geral de saúde
    const avgScore = (securityScore + performanceScore + complianceScore + observabilityScore + userExperienceScore) / 5;
    const healthStatus = this.determineHealthStatus(avgScore);

    return {
      totalConfigurations: Object.keys(config).length,
      activeFeatures,
      securityScore,
      performanceScore,
      complianceScore,
      observabilityScore,
      userExperienceScore,
      lastModified: new Date().toISOString(),
      memoryUsage,
      healthStatus
    };
  }

  /**
   * Gera relatório detalhado da configuração
   */
  generateReport(config: SystemConfiguration): ConfigurationReport {
    const metrics = this.calculateMetrics(config);
    const recommendations: string[] = [];
    const warnings: string[] = [];
    const optimizationSuggestions: string[] = [];
    const securityIssues: string[] = [];
    const performanceIssues: string[] = [];
    const complianceIssues: string[] = [];

    // Análise de segurança
    this.analyzeSecurityIssues(config, securityIssues, recommendations);
    
    // Análise de performance
    this.analyzePerformanceIssues(config, performanceIssues, optimizationSuggestions);
    
    // Análise de compliance
    this.analyzeComplianceIssues(config, complianceIssues, recommendations);
    
    // Análise geral
    this.analyzeGeneralIssues(config, warnings, recommendations);

    const summary = this.generateSummary(metrics, recommendations.length, warnings.length);

    return {
      summary,
      recommendations,
      warnings,
      healthStatus: metrics.healthStatus,
      optimizationSuggestions,
      securityIssues,
      performanceIssues,
      complianceIssues
    };
  }

  /**
   * Compara duas configurações
   */
  compareConfigurations(current: SystemConfiguration, other: SystemConfiguration): ConfigurationComparison {
    const differences: ConfigurationComparison['differences'] = [];
    const criticalChanges: string[] = [];

    this.deepCompare(current, other, '', differences, criticalChanges);

    const totalPaths = this.countObjectPaths(current);
    const compatibilityScore = Math.max(0, (totalPaths - differences.length) / totalPaths * 100);
    
    const migrationRequired = this.checkMigrationRequired(differences);

    return {
      differences,
      compatibilityScore,
      migrationRequired,
      criticalChanges
    };
  }

  // =============================
  // MÉTODOS PRIVADOS DE CÁLCULO
  // =============================

  private calculateSecurityScore(config: SystemConfiguration): number {
    let score = 0;
    const security = config.security;

    if (security.encryption.enabled) score += 20;
    if (security.authentication.multiFactorAuth) score += 20;
    if (security.dataProtection.encryptBackups) score += 15;
    if (security.audit.enabled) score += 15;
    if (security.authentication.maxLoginAttempts <= 5) score += 10;
    if (security.authentication.sessionExpiryTime <= 60) score += 10;
    if (security.dataProtection.anonymizeData) score += 10;

    return Math.min(score, 100);
  }

  private calculatePerformanceScore(config: SystemConfiguration): number {
    let score = 0;
    const performance = config.performance;

    if (performance.caching.enabled) score += 25;
    if (performance.database.optimizeQueries) score += 20;
    if (performance.network.compression) score += 15;
    if (performance.memory.memoryLeakDetection) score += 15;
    if (performance.database.connectionPoolSize >= 10) score += 10;
    if (performance.network.retries >= 3) score += 10;
    if (performance.memory.garbageCollectionInterval <= 300) score += 5;

    return Math.min(score, 100);
  }

  private calculateComplianceScore(config: SystemConfiguration): number {
    let score = 0;
    const compliance = config.compliance;

    if (compliance.gdpr.enabled) score += 40;
    if (compliance.hipaa.enabled) score += 30;
    if (compliance.sox.enabled) score += 30;

    return Math.min(score, 100);
  }

  private calculateObservabilityScore(config: SystemConfiguration): number {
    let score = 0;
    const observability = config.observability;

    if (observability.metrics.enabled) score += 35;
    if (observability.tracing.enabled) score += 35;
    if (observability.profiling.enabled) score += 30;

    return Math.min(score, 100);
  }

  private calculateUserExperienceScore(config: SystemConfiguration): number {
    let score = 0;
    const ux = config.userExperience;

    if (ux.accessibility.keyboardNavigation) score += 25;
    if (ux.performance.lazyLoading) score += 25;
    if (ux.interface.animations) score += 20;
    if (ux.accessibility.screenReader) score += 15;
    if (ux.performance.cacheStrategy === 'aggressive') score += 15;

    return Math.min(score, 100);
  }

  private countActiveFeatures(config: SystemConfiguration): number {
    let count = 0;

    // WhatsApp features
    if (config.whatsapp.autoReply) count++;
    if (config.whatsapp.businessHours.enabled) count++;
    
    // N8N features
    if (config.n8n.webhookUrl) count++;
    
    // System features
    if (config.queue.enabled) count++;
    if (config.backup.enabled) count++;
    if (config.monitoring.enabled) count++;
    if (config.ai.enabled) count++;
    
    // New features
    if (config.logging.enableFile) count++;
    if (config.rateLimiting.enabled) count++;
    if (config.caching.layers.memory.enabled) count++;
    if (config.healthCheck.enabled) count++;
    if (config.observability.metrics.enabled) count++;
    if (config.disasterRecovery.enabled) count++;

    return count;
  }

  private estimateMemoryUsage(config: SystemConfiguration): number {
    const configString = JSON.stringify(config);
    return new Blob([configString]).size;
  }

  private determineHealthStatus(avgScore: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (avgScore >= 90) return 'excellent';
    if (avgScore >= 75) return 'good';
    if (avgScore >= 50) return 'fair';
    return 'poor';
  }

  private analyzeSecurityIssues(config: SystemConfiguration, issues: string[], recommendations: string[]): void {
    const security = config.security;

    if (!security.encryption.enabled) {
      issues.push('Criptografia desabilitada');
      recommendations.push('Habilitar criptografia para proteger dados sensíveis');
    }

    if (!security.authentication.multiFactorAuth) {
      issues.push('Autenticação multi-fator desabilitada');
      recommendations.push('Habilitar MFA para aumentar a segurança');
    }

    if (security.authentication.sessionExpiryTime > 120) {
      issues.push('Tempo de expiração de sessão muito alto');
      recommendations.push('Reduzir tempo de expiração para menos de 2 horas');
    }
  }

  private analyzePerformanceIssues(config: SystemConfiguration, issues: string[], suggestions: string[]): void {
    const performance = config.performance;

    if (!performance.caching.enabled) {
      issues.push('Cache desabilitado');
      suggestions.push('Habilitar cache para melhorar performance');
    }

    if (performance.database.connectionPoolSize < 10) {
      issues.push('Pool de conexões pequeno');
      suggestions.push('Aumentar pool de conexões para pelo menos 10');
    }

    if (!performance.network.compression) {
      issues.push('Compressão de rede desabilitada');
      suggestions.push('Habilitar compressão para reduzir tráfego');
    }
  }

  private analyzeComplianceIssues(config: SystemConfiguration, issues: string[], recommendations: string[]): void {
    const compliance = config.compliance;

    if (!compliance.gdpr.enabled && config.system.environment === 'production') {
      issues.push('GDPR não configurado em produção');
      recommendations.push('Configurar GDPR se processar dados de cidadãos europeus');
    }
  }

  private analyzeGeneralIssues(config: SystemConfiguration, warnings: string[], recommendations: string[]): void {
    if (!config.backup.enabled) {
      warnings.push('Sistema de backup desabilitado');
      recommendations.push('Habilitar backups automáticos');
    }

    if (!config.monitoring.enabled) {
      warnings.push('Monitoramento desabilitado');
      recommendations.push('Habilitar monitoramento para detectar problemas');
    }

    if (config.development.debugLogging && config.system.environment === 'production') {
      warnings.push('Logs de debug habilitados em produção');
      recommendations.push('Desabilitar logs de debug em produção');
    }
  }

  private generateSummary(metrics: ConfigurationMetrics, recommendationsCount: number, warningsCount: number): string {
    const parts = [
      `Sistema com ${metrics.activeFeatures} funcionalidades ativas`,
      `Score de segurança: ${metrics.securityScore}/100`,
      `Score de performance: ${metrics.performanceScore}/100`,
      `Status geral: ${metrics.healthStatus}`
    ];

    if (recommendationsCount > 0) {
      parts.push(`${recommendationsCount} recomendações disponíveis`);
    }

    if (warningsCount > 0) {
      parts.push(`${warningsCount} avisos encontrados`);
    }

    return parts.join(' • ');
  }

  private deepCompare(
    current: unknown, 
    other: unknown, 
    path: string, 
    differences: ConfigurationComparison['differences'],
    criticalChanges: string[]
  ): void {
    if (typeof current === 'object' && typeof other === 'object' && current !== null && other !== null) {
      const allKeys = new Set([...Object.keys(current), ...Object.keys(other)]);
      
      for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const currentValue = (current as Record<string, unknown>)[key];
        const otherValue = (other as Record<string, unknown>)[key];

        if (currentValue === undefined && otherValue !== undefined) {
          differences.push({
            path: currentPath,
            current: undefined,
            other: otherValue,
            type: 'added'
          });
        } else if (currentValue !== undefined && otherValue === undefined) {
          differences.push({
            path: currentPath,
            current: currentValue,
            other: undefined,
            type: 'removed'
          });
          
          // Marcar como mudança crítica se for uma configuração importante
          if (this.isCriticalPath(currentPath)) {
            criticalChanges.push(`Configuração crítica removida: ${currentPath}`);
          }
        } else if (JSON.stringify(currentValue) !== JSON.stringify(otherValue)) {
          if (typeof currentValue === 'object' && typeof otherValue === 'object') {
            this.deepCompare(currentValue, otherValue, currentPath, differences, criticalChanges);
          } else {
            differences.push({
              path: currentPath,
              current: currentValue,
              other: otherValue,
              type: 'modified'
            });
            
            if (this.isCriticalPath(currentPath)) {
              criticalChanges.push(`Configuração crítica modificada: ${currentPath}`);
            }
          }
        }
      }
    }
  }

  private isCriticalPath(path: string): boolean {
    const criticalPaths = [
      'security.encryption.enabled',
      'security.authentication.multiFactorAuth',
      'n8n.webhookUrl',
      'n8n.apiUrl',
      'system.maintenanceMode',
      'backup.enabled'
    ];
    
    return criticalPaths.some(criticalPath => path.includes(criticalPath));
  }

  private countObjectPaths(obj: unknown, path = ''): number {
    let count = 0;
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof (obj as Record<string, unknown>)[key] === 'object' && (obj as Record<string, unknown>)[key] !== null) {
          count += this.countObjectPaths((obj as Record<string, unknown>)[key], currentPath);
        } else {
          count++;
        }
      }
    } else {
      count = 1;
    }
    
    return count;
  }

  private checkMigrationRequired(differences: ConfigurationComparison['differences']): boolean {
    return differences.some(diff => 
      diff.type === 'removed' || 
      (diff.type === 'modified' && diff.path.includes('version')) ||
      this.isCriticalPath(diff.path)
    );
  }
}

// Singleton instance
export const configurationAnalyzer = ConfigurationAnalyzer.getInstance();

// Export default
export default configurationAnalyzer;
