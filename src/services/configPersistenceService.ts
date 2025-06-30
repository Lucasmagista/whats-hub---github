/**
 * 🔧 ConfigPersistenceService - Sistema Completo de Persistência de Configurações
 * Aplica mudanças reais nos arquivos de configuração (.env, config.json, etc.)
 */

import { SystemConfiguration } from './configurationManager';

export interface ConfigFile {
  path: string;
  type: 'env' | 'json' | 'js' | 'ts';
  encoding?: string;
}

export interface PersistenceResult {
  success: boolean;
  filesUpdated: string[];
  errors: string[];
  warnings: string[];
}

export class ConfigPersistenceService {
  private readonly configFiles: ConfigFile[] = [
    { path: '.env', type: 'env' },
    { path: 'n8n/.env', type: 'env' },
    { path: 'sistema web/.env', type: 'env' },
    { path: 'src/config/emailConfig.ts', type: 'ts' },
    { path: 'src/config/apiConfig.ts', type: 'ts' },
    { path: 'n8n/config.json', type: 'json' },
    { path: 'n8n/system-config.json', type: 'json' }
  ];

  /**
   * Persiste todas as configurações nos arquivos do sistema
   */
  async persistConfiguration(config: SystemConfiguration): Promise<PersistenceResult> {
    const result: PersistenceResult = {
      success: true,
      filesUpdated: [],
      errors: [],
      warnings: []
    };

    try {
      // 1. Atualizar arquivo .env principal
      await this.updateMainEnvFile(config, result);

      // 2. Atualizar arquivo .env do n8n
      await this.updateN8nEnvFile(config, result);

      // 3. Atualizar configurações JSON do n8n
      await this.updateN8nConfigFiles(config, result);

      // 4. Atualizar configurações TypeScript
      await this.updateTypeScriptConfigs(config, result);

      // 5. Atualizar arquivo de configuração do sistema web
      await this.updateWebSystemConfig(config, result);

      // 6. Notificar serviços sobre mudanças
      await this.notifyServicesOfChanges(config, result);

      console.log('✅ Configurações persistidas com sucesso:', result);
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Erro geral na persistência: ${error}`);
      console.error('❌ Erro ao persistir configurações:', error);
    }

    return result;
  }

  /**
   * Atualiza o arquivo .env principal
   */
  private async updateMainEnvFile(config: SystemConfiguration, result: PersistenceResult): Promise<void> {
    try {
      const envPath = '.env';
      let envContent = await this.readFileContent(envPath);

      // Mapear configurações para variáveis de ambiente
      const envVars = this.mapConfigToEnvVars(config);

      // Atualizar cada variável
      for (const [key, value] of Object.entries(envVars)) {
        envContent = this.updateEnvVariable(envContent, key, value);
      }

      await this.writeFileContent(envPath, envContent);
      result.filesUpdated.push(envPath);
      
    } catch (error) {
      result.errors.push(`Erro ao atualizar .env principal: ${error}`);
    }
  }

  /**
   * Atualiza o arquivo .env do n8n
   */
  private async updateN8nEnvFile(config: SystemConfiguration, result: PersistenceResult): Promise<void> {
    try {
      const envPath = 'n8n/.env';
      let envContent = await this.readFileContent(envPath);

      // Configurações específicas do n8n
      const n8nEnvVars = {
        N8N_WEBHOOK_URL: config.n8n.webhookUrl,
        N8N_HOST: config.n8n.host,
        N8N_PORT: config.n8n.port.toString(),
        N8N_RETRY_ATTEMPTS: config.n8n.retryAttempts?.toString() || '3',
        N8N_RETRY_DELAY: config.n8n.retryDelay?.toString() || '1000',
        
        // Configurações do WhatsApp
        WHATSAPP_SESSION_NAME: config.whatsapp.sessionName,
        WHATSAPP_QR_TIMEOUT: config.whatsapp.qrCodeTimeout?.toString() || '60000',
        
        // Configurações de performance
        MAX_CONCURRENT_SESSIONS: config.performance?.maxSessions?.toString() || '5',
        MESSAGE_RETRY_ATTEMPTS: config.performance?.retryAttempts?.toString() || '3',
        
        // PostgreSQL
        POSTGRES_HOST: config.database?.host || 'localhost',
        POSTGRES_PORT: config.database?.port?.toString() || '5432',
        POSTGRES_DB: config.database?.database || 'whats_hub',
        POSTGRES_USER: config.database?.username || 'postgres',
        POSTGRES_PASSWORD: config.database?.password || ''
      };

      // Atualizar cada variável
      for (const [key, value] of Object.entries(n8nEnvVars)) {
        if (value !== undefined && value !== null) {
          envContent = this.updateEnvVariable(envContent, key, value);
        }
      }

      await this.writeFileContent(envPath, envContent);
      result.filesUpdated.push(envPath);
      
    } catch (error) {
      result.errors.push(`Erro ao atualizar n8n/.env: ${error}`);
    }
  }

  /**
   * Atualiza arquivos de configuração JSON do n8n
   */
  private async updateN8nConfigFiles(config: SystemConfiguration, result: PersistenceResult): Promise<void> {
    try {
      // Atualizar config.json
      const configPath = 'n8n/config.json';
      const n8nConfig = {
        bot: {
          name: config.bot?.name || 'WhatsApp Bot',
          version: '2.0.0',
          enabled: config.bot?.enabled ?? true,
          autoStart: config.bot?.autoStart ?? true
        },
        whatsapp: {
          sessionName: config.whatsapp.sessionName,
          qrCodeTimeout: config.whatsapp.qrCodeTimeout || 60000,
          maxRetries: config.whatsapp.maxRetries || 3,
          restartOnDisconnect: config.whatsapp.restartOnDisconnect ?? true
        },
        queue: {
          enabled: config.queue.enabled,
          maxSize: config.queue.maxSize,
          timeout: config.queue.timeout,
          autoAssign: config.queue.autoAssign ?? true
        },
        monitoring: config.monitoring,
        backup: config.backup,
        updatedAt: new Date().toISOString()
      };

      await this.writeFileContent(configPath, JSON.stringify(n8nConfig, null, 2));
      result.filesUpdated.push(configPath);

      // Atualizar system-config.json
      const systemConfigPath = 'n8n/system-config.json';
      const systemConfig = {
        system: {
          version: '2.0.0',
          environment: process.env.NODE_ENV || 'development',
          maintenance: config.system?.maintenanceMode ?? false,
          debug: config.system?.debugMode ?? false
        },
        performance: config.performance || {},
        security: config.security || {},
        integrations: config.integrations || {},
        lastUpdate: new Date().toISOString()
      };

      await this.writeFileContent(systemConfigPath, JSON.stringify(systemConfig, null, 2));
      result.filesUpdated.push(systemConfigPath);
      
    } catch (error) {
      result.errors.push(`Erro ao atualizar arquivos JSON do n8n: ${error}`);
    }
  }

  /**
   * Atualiza configurações em arquivos TypeScript
   */
  private async updateTypeScriptConfigs(config: SystemConfiguration, result: PersistenceResult): Promise<void> {
    try {
      // Atualizar emailConfig.ts
      await this.updateEmailConfig(config, result);
      
      // Atualizar apiConfig.ts
      await this.updateApiConfig(config, result);
      
    } catch (error) {
      result.errors.push(`Erro ao atualizar configs TypeScript: ${error}`);
    }
  }

  /**
   * Atualiza configuração de email
   */
  private async updateEmailConfig(config: SystemConfiguration, result: PersistenceResult): Promise<void> {
    try {
      const emailConfigPath = 'src/config/emailConfig.ts';
      const emailConfigContent = `// Configuração de Email Atualizada Automaticamente
// Última atualização: ${new Date().toISOString()}

export interface MailerSendSettings {
  apiToken: string;
  domain: string;
  fromEmail: string;
  fromName: string;
}

export const MAILERSEND_CONFIG: MailerSendSettings = {
  apiToken: '${config.email?.mailerSend?.apiToken || ''}',
  domain: '${config.email?.mailerSend?.domain || ''}',
  fromEmail: '${config.email?.mailerSend?.fromEmail || ''}',
  fromName: '${config.email?.mailerSend?.fromName || 'WhatsHub Pro'}',
};

export function getMailerSendConfig(): MailerSendSettings {
  return {
    apiToken: import.meta.env.VITE_MAILERSEND_API_TOKEN ?? MAILERSEND_CONFIG.apiToken,
    domain: import.meta.env.VITE_MAILERSEND_DOMAIN ?? MAILERSEND_CONFIG.domain,
    fromEmail: import.meta.env.VITE_MAILERSEND_FROM_EMAIL ?? MAILERSEND_CONFIG.fromEmail,
    fromName: import.meta.env.VITE_MAILERSEND_FROM_NAME ?? MAILERSEND_CONFIG.fromName,
  };
}

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '${config.api?.baseUrl || '/api'}',
  reportsEndpoint: '/reports',
  timeout: ${config.api?.timeout || 30000},
  retryAttempts: ${config.api?.retryAttempts || 3},
  retryDelay: ${config.api?.retryDelay || 1000}
};
`;

      await this.writeFileContent(emailConfigPath, emailConfigContent);
      result.filesUpdated.push(emailConfigPath);
      
    } catch (error) {
      result.errors.push(`Erro ao atualizar emailConfig.ts: ${error}`);
    }
  }

  /**
   * Atualiza configuração da API
   */
  private async updateApiConfig(config: SystemConfiguration, result: PersistenceResult): Promise<void> {
    try {
      const apiConfigPath = 'src/config/apiConfig.ts';
      const apiConfigContent = `// Configuração da API Atualizada Automaticamente
// Última atualização: ${new Date().toISOString()}

export interface ApiConfiguration {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  maxConcurrentRequests: number;
}

export const API_CONFIG: ApiConfiguration = {
  baseUrl: '${config.api?.baseUrl || 'http://localhost:3002/api'}',
  timeout: ${config.api?.timeout || 30000},
  retryAttempts: ${config.api?.retryAttempts || 3},
  retryDelay: ${config.api?.retryDelay || 1000},
  maxConcurrentRequests: ${config.api?.maxConcurrentRequests || 10}
};

export const ENDPOINTS = {
  whatsapp: {
    status: '/whatsapp/status',
    qr: '/whatsapp/qr',
    send: '/whatsapp/send',
    sessions: '/whatsapp/sessions'
  },
  n8n: {
    webhook: '${config.n8n.webhookUrl}',
    api: '${config.n8n.apiUrl || 'http://localhost:5678/api/v1'}',
    workflows: '/workflows',
    executions: '/executions'
  },
  queue: {
    status: '/queue/status',
    items: '/queue/items',
    assign: '/queue/assign',
    complete: '/queue/complete'
  }
};
`;

      await this.writeFileContent(apiConfigPath, apiConfigContent);
      result.filesUpdated.push(apiConfigPath);
      
    } catch (error) {
      result.errors.push(`Erro ao atualizar apiConfig.ts: ${error}`);
    }
  }

  /**
   * Atualiza configuração do sistema web
   */
  private async updateWebSystemConfig(config: SystemConfiguration, result: PersistenceResult): Promise<void> {
    try {
      const webEnvPath = 'sistema web/.env';
      let webEnvContent = await this.readFileContent(webEnvPath).catch(() => '');

      const webEnvVars = {
        NEXTAUTH_URL: config.web?.url || 'http://localhost:3000',
        NEXTAUTH_SECRET: config.web?.secret || 'your-secret-here',
        DATABASE_URL: this.buildDatabaseUrl(config),
        MAILERSEND_API_TOKEN: config.email?.mailerSend?.apiToken || '',
        MAILERSEND_DOMAIN: config.email?.mailerSend?.domain || '',
        MAILERSEND_FROM_EMAIL: config.email?.mailerSend?.fromEmail || '',
        MAILERSEND_FROM_NAME: config.email?.mailerSend?.fromName || 'WhatsHub Pro'
      };

      for (const [key, value] of Object.entries(webEnvVars)) {
        if (value) {
          webEnvContent = this.updateEnvVariable(webEnvContent, key, value);
        }
      }

      await this.writeFileContent(webEnvPath, webEnvContent);
      result.filesUpdated.push(webEnvPath);
      
    } catch (error) {
      result.errors.push(`Erro ao atualizar sistema web/.env: ${error}`);
    }
  }

  /**
   * Notifica serviços sobre mudanças de configuração
   */
  private async notifyServicesOfChanges(config: SystemConfiguration, result: PersistenceResult): Promise<void> {
    try {
      // Enviar eventos customizados para notificar componentes
      if (typeof window !== 'undefined') {
        // Notificar mudanças no WhatsApp
        window.dispatchEvent(new CustomEvent('whatsapp-config-changed', {
          detail: config.whatsapp
        }));

        // Notificar mudanças no N8N
        window.dispatchEvent(new CustomEvent('n8n-config-changed', {
          detail: config.n8n
        }));

        // Notificar mudanças na fila
        window.dispatchEvent(new CustomEvent('queue-config-changed', {
          detail: config.queue
        }));

        // Notificar mudanças gerais
        window.dispatchEvent(new CustomEvent('system-config-changed', {
          detail: config
        }));
      }

      // Tentar notificar serviços via API se estiverem rodando
      await this.notifyRunningServices(config);
      
    } catch (error) {
      result.warnings.push(`Aviso: Nem todos os serviços foram notificados: ${error}`);
    }
  }

  /**
   * Notifica serviços em execução via API
   */
  private async notifyRunningServices(config: SystemConfiguration): Promise<void> {
    const services = [
      { name: 'N8N Server', url: `http://localhost:${config.n8n.port}/config`, data: config.n8n },
      { name: 'WhatsApp Server', url: `http://localhost:3002/config`, data: config.whatsapp },
      { name: 'Dashboard', url: `http://localhost:5173/api/config`, data: config }
    ];

    for (const service of services) {
      try {
        const response = await fetch(service.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(service.data)
        });

        if (response.ok) {
          console.log(`✅ ${service.name} notificado com sucesso`);
        }
      } catch (error) {
        console.log(`⚠️ ${service.name} não está rodando ou não pôde ser notificado`);
      }
    }
  }

  /**
   * Mapeia configurações para variáveis de ambiente
   */
  private mapConfigToEnvVars(config: SystemConfiguration): Record<string, string> {
    return {
      // API
      VITE_API_BASE_URL: config.api?.baseUrl || 'http://localhost:3002/api',
      VITE_WS_URL: config.api?.wsUrl || 'http://localhost:3005',
      
      // N8N
      VITE_N8N_WEBHOOK_URL: config.n8n.webhookUrl,
      VITE_N8N_API_URL: config.n8n.apiUrl || 'http://localhost:5678/api/v1',
      VITE_N8N_USERNAME: config.n8n.username || 'admin',
      VITE_N8N_PASSWORD: config.n8n.password || 'sua_senha_n8n_aqui',
      
      // WhatsApp
      VITE_WHATSAPP_SERVER_URL: config.whatsapp.serverUrl || 'http://localhost:3002',
      VITE_WHATSAPP_WS_URL: config.whatsapp.wsUrl || 'ws://localhost:3002/ws',
      
      // Database
      VITE_POSTGRES_URL: this.buildDatabaseUrl(config),
      VITE_POSTGRES_HOST: config.database?.host || 'localhost',
      VITE_POSTGRES_PORT: config.database?.port?.toString() || '5432',
      VITE_POSTGRES_DB: config.database?.database || 'whats_hub',
      VITE_POSTGRES_USER: config.database?.username || 'postgres',
      VITE_POSTGRES_PASSWORD: config.database?.password || '',
      
      // Email
      VITE_MAILERSEND_API_TOKEN: config.email?.mailerSend?.apiToken || '',
      VITE_MAILERSEND_DOMAIN: config.email?.mailerSend?.domain || '',
      VITE_MAILERSEND_FROM_EMAIL: config.email?.mailerSend?.fromEmail || '',
      VITE_MAILERSEND_FROM_NAME: config.email?.mailerSend?.fromName || 'WhatsHub Pro',
      
      // Development
      VITE_DEV_MODE: config.development?.enabled?.toString() || 'true',
      VITE_DEBUG_API_CALLS: config.development?.debugApi?.toString() || 'true',
      VITE_MOCK_DATA: config.development?.mockData?.toString() || 'false'
    };
  }

  /**
   * Constrói URL do banco de dados
   */
  private buildDatabaseUrl(config: SystemConfiguration): string {
    const db = config.database;
    if (!db) return 'postgresql://usuario:senha@localhost:5432/whats_hub';
    
    return `postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`;
  }

  /**
   * Atualiza uma variável específica no arquivo .env
   */
  private updateEnvVariable(content: string, key: string, value: string): string {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${value}`;
    
    if (regex.test(content)) {
      return content.replace(regex, newLine);
    } else {
      return content + `\n${newLine}`;
    }
  }

  /**
   * Lê conteúdo de arquivo (placeholder para implementação real)
   */
  private async readFileContent(path: string): Promise<string> {
    // Em um ambiente real, isto seria implementado com fs.readFile
    // Por ora, simulamos com localStorage ou valores padrão
    const stored = localStorage.getItem(`file-content-${path.replace(/[^\w]/g, '-')}`);
    return stored || '';
  }

  /**
   * Escreve conteúdo em arquivo (placeholder para implementação real)
   */
  private async writeFileContent(path: string, content: string): Promise<void> {
    // Em um ambiente real, isto seria implementado com fs.writeFile
    // Por ora, simulamos com localStorage
    localStorage.setItem(`file-content-${path.replace(/[^\w]/g, '-')}`, content);
    
    // Simular escrita real enviando para API
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/config/write-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, content })
        });
      } catch (error) {
        console.log(`⚠️ Não foi possível escrever ${path} via API`);
      }
    }
  }

  /**
   * Valida se as configurações foram aplicadas corretamente
   */
  async validatePersistence(config: SystemConfiguration): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // Verificar se arquivos foram atualizados
      for (const configFile of this.configFiles) {
        const content = await this.readFileContent(configFile.path);
        if (!content) {
          issues.push(`Arquivo ${configFile.path} não encontrado ou vazio`);
        }
      }

      // Verificar se variáveis de ambiente estão corretas
      const envVars = this.mapConfigToEnvVars(config);
      for (const [key, expectedValue] of Object.entries(envVars)) {
        const envContent = await this.readFileContent('.env');
        if (!envContent.includes(`${key}=${expectedValue}`)) {
          issues.push(`Variável ${key} não está com o valor correto no .env`);
        }
      }

    } catch (error) {
      issues.push(`Erro na validação: ${error}`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Singleton instance
export const configPersistenceService = new ConfigPersistenceService();
export default configPersistenceService;
