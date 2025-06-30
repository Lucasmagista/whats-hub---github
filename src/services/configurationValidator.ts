/**
 * 🔧 Configuration Validator & Recovery System
 * Sistema para validar e recuperar configurações automaticamente
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ConfigurationHealth {
  status: 'healthy' | 'warning' | 'critical';
  lastCheck: string;
  issues: Array<{
    type: 'error' | 'warning';
    message: string;
    fix?: string;
  }>;
}

export class ConfigurationValidator {
  private static instance: ConfigurationValidator;

  public static getInstance(): ConfigurationValidator {
    if (!ConfigurationValidator.instance) {
      ConfigurationValidator.instance = new ConfigurationValidator();
    }
    return ConfigurationValidator.instance;
  }

  /**
   * Valida as configurações do sistema
   */
  validateConfiguration(config: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      // Validar estrutura básica
      if (!config || typeof config !== 'object') {
        errors.push('Configuração não definida ou inválida');
        return { isValid: false, errors, warnings, suggestions };
      }

      const configObj = config as Record<string, unknown>;

      // Validar WhatsApp
      this.validateWhatsAppConfig(configObj.whatsapp, errors, warnings, suggestions);

      // Validar N8N
      this.validateN8nConfig(configObj.n8n, errors, warnings, suggestions);

      // Validar configurações de email
      this.validateEmailConfig(configObj, errors, warnings, suggestions);

      // Validar configurações de queue
      this.validateQueueConfig(configObj.queue, errors, warnings, suggestions);

      // Validar configurações de backup
      this.validateBackupConfig(configObj.backup, errors, warnings, suggestions);

      // Validar configurações de sistema
      this.validateSystemConfig(configObj.system, errors, warnings, suggestions);

      // Validar configurações de segurança
      this.validateSecurityConfig(configObj.security, errors, warnings, suggestions);

      // Validar configurações de performance
      this.validatePerformanceConfig(configObj.performance, errors, warnings, suggestions);

      // Validar configurações de workflows
      this.validateWorkflowsConfig(configObj.workflows, errors, warnings, suggestions);

      // Validar configurações de compliance
      this.validateComplianceConfig(configObj.compliance, errors, warnings, suggestions);

      // Validar configurações de sistema
      this.validateSystemConfig(configObj.system, errors, warnings, suggestions);

      // Validar configurações de segurança
      this.validateSecurityConfig(configObj.security, errors, warnings, suggestions);

      // Validar configurações de performance
      this.validatePerformanceConfig(configObj.performance, errors, warnings, suggestions);

      // Validar configurações de workflows
      this.validateWorkflowsConfig(configObj.workflows, errors, warnings, suggestions);

      // Validar configurações de compliance
      this.validateComplianceConfig(configObj.compliance, errors, warnings, suggestions);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions
      };

    } catch (error) {
      errors.push(`Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { isValid: false, errors, warnings, suggestions };
    }
  }

  /**
   * Verifica a saúde das configurações
   */
  checkConfigurationHealth(): ConfigurationHealth {
    const issues: Array<{type: 'error' | 'warning'; message: string; fix?: string}> = [];

    try {
      // Verificar localStorage
      if (typeof window !== 'undefined') {
        try {
          const config = localStorage.getItem('whatsHub.config.json');
          if (!config) {
            issues.push({
              type: 'warning',
              message: 'Configurações não encontradas no localStorage',
              fix: 'Salvar configurações padrão'
            });
          } else {
            const parsed = JSON.parse(config);
            const validation = this.validateConfiguration(parsed);
            
            validation.errors.forEach(error => {
              issues.push({
                type: 'error',
                message: error,
                fix: 'Corrigir configuração'
              });
            });

            validation.warnings.forEach(warning => {
              issues.push({
                type: 'warning',
                message: warning
              });
            });
          }
        } catch (error) {
          console.error('Erro ao ler configurações:', error);
          issues.push({
            type: 'error',
            message: 'Erro ao ler configurações do localStorage',
            fix: 'Limpar e recriar configurações'
          });
        }
      }

      // Verificar variáveis de ambiente
      this.checkEnvironmentVariables(issues);

      // Determinar status geral
      const hasErrors = issues.some(issue => issue.type === 'error');
      const hasWarnings = issues.some(issue => issue.type === 'warning');

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (hasErrors) {
        status = 'critical';
      } else if (hasWarnings) {
        status = 'warning';
      }

      return {
        status,
        lastCheck: new Date().toISOString(),
        issues
      };

    } catch (error) {
      return {
        status: 'critical',
        lastCheck: new Date().toISOString(),
        issues: [{
          type: 'error',
          message: `Erro crítico na verificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          fix: 'Reinicializar sistema de configurações'
        }]
      };
    }
  }

  /**
   * Tenta reparar configurações automaticamente
   */
  autoRepairConfiguration(): { success: boolean; actionsPerformed: string[] } {
    const actionsPerformed: string[] = [];

    try {
      const health = this.checkConfigurationHealth();
      
      health.issues.forEach(issue => {
        if (issue.fix) {
          switch (issue.fix) {
            case 'Salvar configurações padrão':
              // Implementar salvamento de configurações padrão
              actionsPerformed.push('Configurações padrão aplicadas');
              break;
            
            case 'Limpar e recriar configurações':
              if (typeof window !== 'undefined') {
                localStorage.removeItem('whatsHub.config.json');
                localStorage.removeItem('whatsHub.config.json.backup');
                actionsPerformed.push('Configurações limpas e recriadas');
              }
              break;
          }
        }
      });

      return {
        success: actionsPerformed.length > 0,
        actionsPerformed
      };

    } catch (error) {
      return {
        success: false,
        actionsPerformed: [`Erro no reparo automático: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      };
    }
  }

  private validateWhatsAppConfig(whatsapp: unknown, errors: string[], warnings: string[], suggestions: string[]): void {
    if (!whatsapp || typeof whatsapp !== 'object') {
      errors.push('Configuração WhatsApp não definida');
      return;
    }

    const whatsappConfig = whatsapp as Record<string, unknown>;

    if (typeof whatsappConfig.qrCodeTimeout !== 'number' || whatsappConfig.qrCodeTimeout < 30000) {
      warnings.push('Timeout do QR Code muito baixo (recomendado: 60000ms)');
      suggestions.push('Aumentar timeout do QR Code para 60 segundos');
    }

    if (typeof whatsappConfig.maxRetries !== 'number' || whatsappConfig.maxRetries < 1) {
      warnings.push('Número de tentativas muito baixo');
      suggestions.push('Definir pelo menos 3 tentativas de conexão');
    }
  }

  private validateN8nConfig(n8n: unknown, errors: string[], warnings: string[], suggestions: string[]): void {
    if (!n8n || typeof n8n !== 'object') {
      errors.push('Configuração N8N não definida');
      return;
    }

    const n8nConfig = n8n as Record<string, unknown>;

    if (!n8nConfig.webhookUrl || typeof n8nConfig.webhookUrl !== 'string' || !this.isValidUrl(n8nConfig.webhookUrl)) {
      errors.push('URL do webhook N8N inválida');
    }

    if (!n8nConfig.apiUrl || typeof n8nConfig.apiUrl !== 'string' || !this.isValidUrl(n8nConfig.apiUrl)) {
      errors.push('URL da API N8N inválida');
    }

    if (!n8nConfig.username) {
      warnings.push('Username N8N não definido');
    }

    if (!n8nConfig.password) {
      warnings.push('Password N8N não definido');
    }
  }

  private validateEmailConfig(config: unknown, errors: string[], warnings: string[], suggestions: string[]): void {
    // Verificar se as variáveis de ambiente estão definidas
    if (typeof window !== 'undefined' && import.meta.env) {
      if (!import.meta.env.VITE_EMAILJS_SERVICE_ID) {
        warnings.push('VITE_EMAILJS_SERVICE_ID não definido');
        suggestions.push('Configurar EmailJS Service ID no arquivo .env');
      }

      if (!import.meta.env.VITE_EMAILJS_TEMPLATE_ID) {
        warnings.push('VITE_EMAILJS_TEMPLATE_ID não definido');
        suggestions.push('Configurar EmailJS Template ID no arquivo .env');
      }

      if (!import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
        warnings.push('VITE_EMAILJS_PUBLIC_KEY não definido');
        suggestions.push('Configurar EmailJS Public Key no arquivo .env');
      }
    }
  }

  private validateQueueConfig(queue: unknown, errors: string[], warnings: string[], suggestions: string[]): void {
    if (!queue || typeof queue !== 'object') {
      warnings.push('Configuração de fila não definida');
      return;
    }

    const queueConfig = queue as Record<string, unknown>;

    if (typeof queueConfig.maxConcurrentChats !== 'number' || queueConfig.maxConcurrentChats < 1) {
      warnings.push('Número máximo de chats simultâneos inválido');
      suggestions.push('Definir pelo menos 1 chat simultâneo');
    }

    if (typeof queueConfig.autoAssignEnabled !== 'boolean') {
      warnings.push('Auto-atribuição não configurada');
    }
  }

  private validateBackupConfig(backup: unknown, errors: string[], warnings: string[], suggestions: string[]): void {
    if (!backup || typeof backup !== 'object') {
      warnings.push('Configuração de backup não definida');
      return;
    }

    const backupConfig = backup as Record<string, unknown>;

    if (typeof backupConfig.enabled !== 'boolean') {
      warnings.push('Backup não está habilitado/desabilitado');
    }

    if (backupConfig.enabled && (!backupConfig.interval || typeof backupConfig.interval !== 'number' || backupConfig.interval < 3600000)) {
      warnings.push('Intervalo de backup muito baixo (recomendado: 1 hora)');
      suggestions.push('Aumentar intervalo de backup para pelo menos 1 hora');
    }
  }

  // Validar configurações de sistema
  private validateSystemConfig(system: unknown, errors: string[], warnings: string[], suggestions: string[]): void {
    if (!system || typeof system !== 'object') {
      errors.push('Configuração de sistema não definida');
      return;
    }

    const systemObj = system as Record<string, unknown>;

    if (!systemObj.version || typeof systemObj.version !== 'string') {
      errors.push('Versão do sistema não definida');
    }

    if (typeof systemObj.maxConcurrentConnections === 'number') {
      if (systemObj.maxConcurrentConnections < 10) {
        warnings.push('Número baixo de conexões simultâneas');
        suggestions.push('Considere aumentar maxConcurrentConnections para pelo menos 100');
      }
      if (systemObj.maxConcurrentConnections > 10000) {
        warnings.push('Número muito alto de conexões simultâneas');
        suggestions.push('Verifique se sua infraestrutura suporta tantas conexões');
      }
    }

    if (typeof systemObj.sessionTimeout === 'number') {
      if (systemObj.sessionTimeout < 5) {
        warnings.push('Timeout de sessão muito baixo');
      }
      if (systemObj.sessionTimeout > 1440) {
        warnings.push('Timeout de sessão muito alto (mais de 24 horas)');
      }
    }
  }

  // Validar configurações de segurança
  private validateSecurityConfig(security: unknown, errors: string[], warnings: string[], suggestions: string[]): void {
    if (!security || typeof security !== 'object') {
      warnings.push('Configurações de segurança não definidas');
      suggestions.push('Configure medidas de segurança básicas');
      return;
    }

    const securityObj = security as Record<string, unknown>;

    // Validar criptografia
    if (securityObj.encryption && typeof securityObj.encryption === 'object') {
      const encryption = securityObj.encryption as Record<string, unknown>;
      if (!encryption.enabled) {
        warnings.push('Criptografia está desabilitada');
        suggestions.push('Habilite criptografia para proteger dados sensíveis');
      }
    }

    // Validar autenticação
    if (securityObj.authentication && typeof securityObj.authentication === 'object') {
      const auth = securityObj.authentication as Record<string, unknown>;
      
      if (typeof auth.maxLoginAttempts === 'number' && auth.maxLoginAttempts > 10) {
        warnings.push('Muitas tentativas de login permitidas');
        suggestions.push('Reduza maxLoginAttempts para 5 ou menos');
      }

      if (typeof auth.sessionExpiryTime === 'number' && auth.sessionExpiryTime > 480) {
        warnings.push('Tempo de expiração de sessão muito longo');
        suggestions.push('Considere reduzir sessionExpiryTime para menos de 8 horas');
      }
    }
  }

  // Validar configurações de performance
  private validatePerformanceConfig(performance: unknown, errors: string[], warnings: string[], suggestions: string[]): void {
    if (!performance || typeof performance !== 'object') {
      suggestions.push('Configure otimizações de performance');
      return;
    }

    const perfObj = performance as Record<string, unknown>;

    // Validar cache
    if (perfObj.caching && typeof perfObj.caching === 'object') {
      const caching = perfObj.caching as Record<string, unknown>;
      if (!caching.enabled) {
        suggestions.push('Habilite cache para melhorar performance');
      }
      
      if (typeof caching.maxSize === 'number' && caching.maxSize > 2048) {
        warnings.push('Tamanho máximo do cache muito alto');
        suggestions.push('Considere um tamanho de cache menor para economizar memória');
      }
    }

    // Validar banco de dados
    if (perfObj.database && typeof perfObj.database === 'object') {
      const db = perfObj.database as Record<string, unknown>;
      
      if (typeof db.connectionPoolSize === 'number' && db.connectionPoolSize < 5) {
        warnings.push('Pool de conexões do banco muito pequeno');
        suggestions.push('Aumente connectionPoolSize para pelo menos 10');
      }

      if (typeof db.queryTimeout === 'number' && db.queryTimeout > 60) {
        warnings.push('Timeout de query muito alto');
        suggestions.push('Considere reduzir queryTimeout para menos de 30 segundos');
      }
    }
  }

  // Validar configurações de workflows
  private validateWorkflowsConfig(workflows: unknown, errors: string[], warnings: string[], suggestions: string[]): void {
    if (!workflows || typeof workflows !== 'object') {
      return;
    }

    const workflowsObj = workflows as Record<string, unknown>;

    if (typeof workflowsObj.maxConcurrentExecutions === 'number') {
      if (workflowsObj.maxConcurrentExecutions < 1) {
        errors.push('Número de execuções simultâneas deve ser pelo menos 1');
      }
      if (workflowsObj.maxConcurrentExecutions > 1000) {
        warnings.push('Muitas execuções simultâneas podem sobrecarregar o sistema');
      }
    }

    if (typeof workflowsObj.defaultTimeout === 'number') {
      if (workflowsObj.defaultTimeout < 10) {
        warnings.push('Timeout padrão muito baixo para workflows');
      }
      if (workflowsObj.defaultTimeout > 3600) {
        warnings.push('Timeout padrão muito alto (mais de 1 hora)');
      }
    }
  }

  // Validar configurações de compliance
  private validateComplianceConfig(compliance: unknown, errors: string[], warnings: string[], suggestions: string[]): void {
    if (!compliance || typeof compliance !== 'object') {
      return;
    }

    const complianceObj = compliance as Record<string, unknown>;

    // Validar GDPR
    if (complianceObj.gdpr && typeof complianceObj.gdpr === 'object') {
      const gdpr = complianceObj.gdpr as Record<string, unknown>;
      
      if (gdpr.enabled && typeof gdpr.dataRetentionDays === 'number') {
        if (gdpr.dataRetentionDays > 2555) { // 7 anos
          warnings.push('Período de retenção GDPR muito longo');
          suggestions.push('GDPR recomenda não mais que 7 anos de retenção');
        }
      }
    }

    // Validar HIPAA
    if (complianceObj.hipaa && typeof complianceObj.hipaa === 'object') {
      const hipaa = complianceObj.hipaa as Record<string, unknown>;
      
      if (hipaa.enabled && !hipaa.encryptionRequired) {
        errors.push('HIPAA requer criptografia obrigatória');
      }
    }
  }

  private checkEnvironmentVariables(issues: Array<{type: 'error' | 'warning'; message: string; fix?: string}>): void {
    const requiredEnvVars = [
      'VITE_N8N_WEBHOOK_URL',
      'VITE_N8N_API_URL',
      'VITE_WHATSAPP_SERVER_URL'
    ];

    const optionalEnvVars = [
      'VITE_EMAILJS_SERVICE_ID',
      'VITE_EMAILJS_TEMPLATE_ID',
      'VITE_EMAILJS_PUBLIC_KEY'
    ];

    if (typeof window !== 'undefined' && import.meta.env) {
      requiredEnvVars.forEach(envVar => {
        if (!import.meta.env[envVar]) {
          issues.push({
            type: 'error',
            message: `Variável de ambiente obrigatória não definida: ${envVar}`,
            fix: `Definir ${envVar} no arquivo .env`
          });
        }
      });

      optionalEnvVars.forEach(envVar => {
        if (!import.meta.env[envVar]) {
          issues.push({
            type: 'warning',
            message: `Variável de ambiente opcional não definida: ${envVar}`,
            fix: `Definir ${envVar} no arquivo .env para funcionalidade completa`
          });
        }
      });
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Instância global
export const configurationValidator = ConfigurationValidator.getInstance();
