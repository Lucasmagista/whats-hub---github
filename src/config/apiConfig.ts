// Configuração da API do WhatsApp
export const API_CONFIG = {
  // URLs da API por ambiente
  DEVELOPMENT: {
    BASE_URL: 'http://localhost:3001/api', // URL local para desenvolvimento
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
  },
  
  PRODUCTION: {
    BASE_URL: '/api', // URL relativa para produção
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 5
  },
  
  // Configurações específicas para desenvolvimento local
  LOCAL_DEVELOPMENT: {
    SIMULATE_API: true, // Simular respostas da API quando não disponível
    AUTO_FALLBACK: true, // Fallback automático para simulação em caso de erro
    LOG_REQUESTS: true, // Log detalhado das requisições
    MOCK_SUCCESS_RATE: 0.9 // Taxa de sucesso para simulações (90%)
  }
};

// Função para detectar o ambiente
export const getEnvironment = (): 'development' | 'production' => {
  if (typeof window === 'undefined') {
    return 'development';
  }
  
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.port === '5128' // Porta do Vite dev server
    ? 'development' 
    : 'production';
};

// Função para obter a configuração atual
export const getCurrentConfig = () => {
  const env = getEnvironment();
  return env === 'development' ? API_CONFIG.DEVELOPMENT : API_CONFIG.PRODUCTION;
};

// Status da API
export interface ApiStatus {
  isAvailable: boolean;
  lastCheck: Date;
  environment: 'development' | 'production';
  baseUrl: string;
  simulationMode: boolean;
}
