import { Bot } from '@/types/global';
import { getCurrentConfig, getEnvironment, API_CONFIG } from '@/config/apiConfig';

interface BotApiResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

interface TemplateParameters {
  [key: string]: string | number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source?: string;
  botId: string;
  metadata?: {
    sessionId?: string;
    processId?: number;
    memory?: string;
    [key: string]: unknown;
  };
}

interface LogsResponse {
  logs: LogEntry[];
  hasMore: boolean;
  lastTimestamp: string;
}

interface BotSettings {
  autoReply: boolean;
  messageDelay: number;
  workingHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  welcomeMessage?: string;
  awayMessage?: string;
  // Configurações para desenvolvimento local
  environment?: 'development' | 'production';
  localPath?: string;
  startMode?: 'npm' | 'yarn' | 'bun' | 'node' | 'python' | 'custom';
  port?: number;
  customCommand?: string;
  autoStart?: boolean;
  [key: string]: unknown;
}

interface WebhookPayload {
  event: string;
  data: unknown;
  timestamp: string;
}

export class BotApiService {
  private baseUrl: string;
  private timeout: number;
  private isDevelopment: boolean;
  private config: any;

  constructor(baseUrl?: string, timeout?: number) {
    // Usar configuração automática baseada no ambiente
    this.config = getCurrentConfig();
    this.isDevelopment = getEnvironment() === 'development';
    
    // Usar configuração fornecida ou padrão do ambiente
    this.baseUrl = baseUrl || this.config.BASE_URL;
    this.timeout = timeout || this.config.TIMEOUT;
    
    console.log(`🌐 BotApiService inicializado:`, {
      environment: this.isDevelopment ? 'development' : 'production',
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      simulateApi: this.isDevelopment && API_CONFIG.LOCAL_DEVELOPMENT.SIMULATE_API
    });
  }// Bot status management
  async startBot(bot: Bot): Promise<BotApiResponse> {
    try {
      // 🚨 VERIFICAR SE É DESENVOLVIMENTO LOCAL
      const isLocalDevelopment = this.isDevelopment || 
                                bot.settings?.environment === 'development' || 
                                bot.settings?.localPath;
      
      if (isLocalDevelopment) {
        console.log('🔧 Modo desenvolvimento detectado - simulando inicialização do bot:', {
          name: bot.name,
          localPath: bot.settings?.localPath,
          startMode: bot.settings?.startMode,
          port: bot.settings?.port,
          isDevelopment: this.isDevelopment
        });
        
        // Para desenvolvimento, sempre retornar sucesso sem fazer requisições HTTP
        if (bot.settings?.localPath && bot.settings?.startMode) {
          // Bot configurado para desenvolvimento local
          let command = '';
          switch (bot.settings.startMode) {
            case 'npm':
              command = 'npm start';
              break;
            case 'yarn':
              command = 'yarn start';
              break;
            case 'bun':
              command = 'bun start';
              break;
            case 'node':
              command = 'node index.js';
              break;
            case 'python':
              command = 'python main.py';
              break;
            case 'custom':
              command = bot.settings.customCommand || 'npm start';
              break;
            default:
              command = 'npm start';
          }

          return { 
            success: true, 
            message: `✅ Bot local configurado com sucesso!\n\n📍 Pasta: ${bot.settings.localPath}\n⚡ Comando: ${command}\n🔗 Porta: ${bot.settings.port || 'padrão'}\n\n🚀 Execute o comando manualmente na pasta do projeto para iniciar o bot.`,
            data: { 
              status: 'configured', 
              mode: 'local-development',
              path: bot.settings.localPath,
              command: command,
              port: bot.settings.port,
              manualStart: true
            } 
          };
        } else {
          // Bot sem configuração local - simular sucesso em desenvolvimento
          return { 
            success: true, 
            message: `✅ Bot "${bot.name}" iniciado em modo desenvolvimento (simulação)\n\n📋 Para configurar desenvolvimento local:\n1. Acesse as configurações do bot\n2. Configure o ambiente como 'development'\n3. Defina o caminho local do projeto\n4. Escolha o modo de execução`,
            data: { 
              status: 'simulated', 
              mode: 'development-simulation',
              botName: bot.name
            } 
          };
        }
      }
      
      // Para produção, fazer requisição HTTP normal
      console.log('🌐 Iniciando bot de produção via API:', bot.name);
      const response = await this.makeRequest('POST', `/bots/${bot.id}/start`, {
        apiKey: bot.apiKey,
        webhookUrl: bot.webhookUrl,
        settings: bot.settings
      });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🚨 Erro ao iniciar bot:', errorMessage);
      
      // Se estamos em desenvolvimento e há erro de conexão, simular sucesso
      if (this.isDevelopment && (
        errorMessage.includes('fetch') || 
        errorMessage.includes('NetworkError') || 
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('404')
      )) {
        return { 
          success: true, 
          message: `✅ Bot "${bot.name}" iniciado em modo desenvolvimento\n\n⚠️ API de produção não disponível (normal em desenvolvimento)\n\n💡 Dica: Configure o bot para desenvolvimento local nas configurações para melhor experiência.`,
          data: { 
            status: 'development-fallback', 
            mode: 'development-simulation',
            botName: bot.name,
            originalError: errorMessage
          } 
        };
      }
      
      return { 
        success: false, 
        message: `❌ Erro ao iniciar bot: ${errorMessage}\n\n💡 Em desenvolvimento, configure o ambiente como 'development' para evitar este erro.` 
      };
    }
  }
  async stopBot(botId: string): Promise<BotApiResponse> {
    try {
      // Em desenvolvimento, simular parada do bot
      if (this.isDevelopment) {
        console.log('🔧 Simulando parada do bot em desenvolvimento:', botId);
        return { 
          success: true, 
          message: '✅ Bot parado (simulação em desenvolvimento)',
          data: { status: 'stopped', mode: 'development-simulation' }
        };
      }
      
      const response = await this.makeRequest('POST', `/bots/${botId}/stop`);
      return response;
    } catch (error) {
      // Fallback para desenvolvimento
      if (this.isDevelopment) {
        return { 
          success: true, 
          message: '✅ Bot parado (modo desenvolvimento)',
          data: { status: 'stopped', mode: 'development-fallback' }
        };
      }
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getBotStatus(botId: string): Promise<BotApiResponse> {
    try {
      // Em desenvolvimento, simular status online
      if (this.isDevelopment) {
        console.log('🔧 Simulando status do bot em desenvolvimento:', botId);
        return { 
          success: true, 
          data: { 
            status: 'online', 
            mode: 'development-simulation',
            lastActivity: new Date().toISOString(),
            uptime: '00:00:00'
          }
        };
      }
      
      const response = await this.makeRequest('GET', `/bots/${botId}/status`);
      return response;
    } catch (error) {
      // Fallback para desenvolvimento
      if (this.isDevelopment) {
        return { 
          success: true, 
          data: { 
            status: 'online', 
            mode: 'development-fallback',
            lastActivity: new Date().toISOString()
          }
        };
      }
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Message sending
  async sendMessage(botId: string, to: string, message: string): Promise<BotApiResponse> {
    try {
      const response = await this.makeRequest('POST', `/bots/${botId}/send`, {
        to,
        message
      });
      return response;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Advanced messaging features
  async sendTemplateMessage(botId: string, to: string, templateId: string, parameters?: TemplateParameters): Promise<BotApiResponse> {
    try {
      const response = await this.makeRequest('POST', `/bots/${botId}/send/template`, {
        to,
        templateId,
        parameters
      });
      return response;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendMediaMessage(botId: string, to: string, mediaUrl: string, mediaType: 'image' | 'video' | 'audio' | 'document', caption?: string): Promise<BotApiResponse> {
    try {
      const response = await this.makeRequest('POST', `/bots/${botId}/send/media`, {
        to,
        mediaUrl,
        mediaType,
        caption
      });
      return response;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Chat and contact management
  async getChatHistory(botId: string, chatId: string, limit?: number, offset?: number): Promise<BotApiResponse> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      
      const response = await this.makeRequest('GET', `/bots/${botId}/chats/${chatId}/history?${params}`);
      return response;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getContactInfo(botId: string, phoneNumber: string): Promise<BotApiResponse> {
    try {
      const response = await this.makeRequest('GET', `/bots/${botId}/contacts/${phoneNumber}`);
      return response;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async blockContact(botId: string, phoneNumber: string): Promise<BotApiResponse> {
    try {
      const response = await this.makeRequest('POST', `/bots/${botId}/contacts/${phoneNumber}/block`);
      return response;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async unblockContact(botId: string, phoneNumber: string): Promise<BotApiResponse> {
    try {
      const response = await this.makeRequest('POST', `/bots/${botId}/contacts/${phoneNumber}/unblock`);
      return response;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Analytics and metrics
  async getBotMetrics(botId: string, startDate?: string, endDate?: string): Promise<BotApiResponse> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await this.makeRequest('GET', `/bots/${botId}/metrics?${params}`);
      return response;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }  // 📋 Real-time Bot Logs API
  async getBotLogs(botId: string, lastTimestamp?: string, limit: number = 50): Promise<BotApiResponse> {
    try {
      const params = new URLSearchParams();
      if (lastTimestamp) params.append('lastTimestamp', lastTimestamp);
      params.append('limit', limit.toString());
      
      console.log(`📋 Buscando logs do bot ${botId} via API real`);
      
      // Fazer requisição para o endpoint real
      const response = await this.makeRequest('GET', `/bots/${botId}/logs?${params}`);
      return response;
    } catch (error) {
      console.error(`❌ Erro ao buscar logs do bot ${botId}:`, error);
      return { success: false, message: error instanceof Error ? error.message : 'Erro ao obter logs' };
    }
  }
  // 📺 Stream de Logs em Tempo Real (Server-Sent Events)
  async streamBotLogs(botId: string, onLogReceived: (log: LogEntry) => void): Promise<{ disconnect: () => void } | null> {
    try {
      console.log(`📺 Conectando ao stream de logs real para bot ${botId}`);
      
      // Conectar ao Server-Sent Events do endpoint real
      const eventSource = new EventSource(`${this.baseUrl}/bots/${botId}/logs/stream`);
      
      eventSource.onmessage = (event) => {
        try {
          const log = JSON.parse(event.data) as LogEntry;
          console.log(`📥 Novo log recebido para bot ${botId}:`, log.message);
          onLogReceived(log);
        } catch (error) {
          console.error('❌ Erro ao processar log do stream:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('❌ Erro no stream de logs:', error);
      };

      eventSource.onopen = () => {
        console.log(`✅ Stream de logs conectado para bot ${botId}`);
      };
      
      return {
        disconnect: () => {
          eventSource.close();
          console.log(`📺 Stream de logs desconectado para bot ${botId}`);
        }
      };
      
    } catch (error) {
      console.error('❌ Erro ao iniciar stream de logs:', error);
      return null;
    }
  }
  // Environment and configuration management
  setApiBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }  // Health check
  async healthCheck(): Promise<BotApiResponse> {
    try {
      // Em desenvolvimento, sempre retornar como saudável
      if (this.isDevelopment) {
        console.log('🔧 Health check em modo desenvolvimento');
        return { 
          success: true, 
          message: 'API saudável (modo desenvolvimento)',
          data: { 
            status: 'healthy', 
            mode: 'development',
            timestamp: new Date().toISOString()
          }
        };
      }
      
      const response = await this.makeRequest('GET', '/health');
      return response;
    } catch (error) {
      // Fallback para desenvolvimento
      if (this.isDevelopment) {
        return { 
          success: true, 
          message: 'API em modo desenvolvimento (simulação)',
          data: { 
            status: 'development-mode', 
            mode: 'development-fallback'
          }
        };
      }
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  // Check API availability
  async checkApiAvailability(): Promise<boolean> {
    try {
      if (this.isDevelopment) {
        // Em desenvolvimento, considerar API sempre disponível (modo simulação)
        return true;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos para health check
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Local development utilities
  async validateLocalPath(localPath: string): Promise<BotApiResponse> {
    try {
      // Simulação de validação de caminho local
      // Em um ambiente real, você usaria Node.js fs para verificar se o diretório existe
      console.log(`🔍 Validando caminho local: ${localPath}`);
      
      if (!localPath || localPath.trim() === '') {
        return { success: false, message: 'Caminho não pode estar vazio' };
      }
      
      // Verificações básicas de formato de caminho
      const isValidPath = /^[a-zA-Z]:\\|^\/|^\.\/|^\.\.\//.test(localPath);
      if (!isValidPath) {
        return { success: false, message: 'Formato de caminho inválido' };
      }
      
      return { 
        success: true, 
        message: 'Caminho válido',
        data: { path: localPath, valid: true }
      };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Erro ao validar caminho' };
    }
  }

  async getLocalBotInfo(localPath: string): Promise<BotApiResponse> {
    try {
      console.log(`📋 Obtendo informações do bot local em: ${localPath}`);
      
      // Simulação de leitura de package.json ou arquivo de configuração
      // Em um ambiente real, você leria o arquivo package.json ou similar
      return {
        success: true,
        message: 'Informações do bot local obtidas',
        data: {
          path: localPath,
          hasPackageJson: true,
          hasNodeModules: true,
          recommendedStartMode: 'npm',
          availableScripts: ['start', 'dev', 'build']
        }
      };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Erro ao obter informações do bot local' };
    }
  }  private async makeRequest(method: string, endpoint: string, data?: Record<string, unknown>): Promise<BotApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`🌐 Fazendo requisição: ${method} ${this.baseUrl}${endpoint}`, {
        isDevelopment: this.isDevelopment,
        data: data ? 'Dados incluídos' : 'Sem dados'
      });
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        // Tentar obter mais detalhes do erro
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage += ` - ${errorData.message}`;
          }
        } catch {
          // Se não conseguir fazer parse do JSON, usar apenas o status
        }
        
        // Em desenvolvimento, tratar alguns erros como informativos
        if (this.isDevelopment && (response.status === 404 || response.status === 500)) {
          console.warn(`⚠️ API não disponível em desenvolvimento: ${errorMessage}`);
          throw new Error(`API_NOT_AVAILABLE: ${errorMessage}`);
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Requisição bem-sucedida:', result);
      return { success: true, data: result };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = `⏱️ Timeout da requisição (${this.timeout}ms). Verifique a conexão com a API.`;
        if (this.isDevelopment) {
          console.warn('⚠️ Timeout em desenvolvimento - isso é normal');
        }
        throw new Error(timeoutError);
      }
      
      // Erro de rede/conexão
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        const networkError = `🌐 Erro de conexão: Não foi possível conectar com ${this.baseUrl}${endpoint}. Verifique se a API está rodando.`;
        if (this.isDevelopment) {
          console.warn('⚠️ Erro de rede em desenvolvimento - isso é esperado se não houver API backend');
        }
        throw new Error(`NETWORK_ERROR: ${networkError}`);
      }
      
      console.error(`❌ Erro na requisição ${method} ${endpoint}:`, error);
      throw error;
    }
  }
}

export const botApiService = new BotApiService();
