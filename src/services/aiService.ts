/**
 * 🤖 AI Service - Integração com IA (OpenAI/Claude)
 * Preparado para FASE 3 - Implementação completa de IA
 */

export interface AIResponse {
  text: string;
  confidence: number;
  intent?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  entities?: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  suggestions?: string[];
}

export interface MessageContext {
  chatId: string;
  userPhone: string;
  userName?: string;
  messageHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  userProfile?: {
    preferences: Record<string, any>;
    previousInteractions: number;
    satisfaction: number;
  };
}

export interface AIConfig {
  provider: 'openai' | 'claude' | 'local' | 'custom';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

class AIService {
  private config: AIConfig;
  private isEnabled: boolean = false;

  constructor() {
    this.config = {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 500,
      systemPrompt: `Você é um assistente de atendimento ao cliente especializado em WhatsApp. 
      Seja educado, útil e conciso. Responda sempre em português brasileiro.
      Se não souber algo, direcione para um atendente humano.`
    };

    this.loadConfig();
  }

  // =============================
  // CONFIGURAÇÃO
  // =============================

  private loadConfig() {
    try {
      const savedConfig = localStorage.getItem('whats-hub-ai-config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        this.config = { ...this.config, ...parsed };
        this.isEnabled = !!this.config.apiKey;
      }
    } catch (error) {
      console.warn('Erro ao carregar configuração de IA:', error);
    }
  }

  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.isEnabled = !!this.config.apiKey;
    
    try {
      localStorage.setItem('whats-hub-ai-config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Erro ao salvar configuração de IA:', error);
    }
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }

  isAIEnabled(): boolean {
    return this.isEnabled && !!this.config.apiKey;
  }

  // =============================
  // PROCESSAMENTO DE MENSAGENS
  // =============================

  async processMessage(message: string, context: MessageContext): Promise<AIResponse> {
    if (!this.isAIEnabled()) {
      return this.getFallbackResponse(message);
    }

    try {
      // FASE 3: Implementar integração real com IA
      // Por enquanto, retorna resposta simulada
      return await this.simulateAIResponse(message, context);
    } catch (error) {
      console.error('Erro no processamento de IA:', error);
      return this.getFallbackResponse(message);
    }
  }

  private async simulateAIResponse(message: string, context: MessageContext): Promise<AIResponse> {
    // Simulação para demonstração - FASE 3 substituirá por IA real
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula latência

    const intent = this.detectIntent(message);
    const sentiment = this.analyzeSentiment(message);

    let responseText = '';
    
    switch (intent) {
      case 'greeting':
        responseText = `Olá${context.userName ? ` ${context.userName}` : ''}! Como posso ajudá-lo hoje?`;
        break;
      case 'support':
        responseText = 'Entendo que você precisa de suporte. Vou conectá-lo com um atendente humano em breve.';
        break;
      case 'information':
        responseText = 'Posso ajudá-lo com informações. Pode me dizer especificamente o que gostaria de saber?';
        break;
      case 'complaint':
        responseText = 'Lamento pelo inconveniente. Vou priorizar seu atendimento e conectá-lo com um especialista.';
        break;
      default:
        responseText = 'Entendi sua mensagem. Deixe-me verificar como posso ajudá-lo melhor.';
    }

    return {
      text: responseText,
      confidence: 0.85,
      intent,
      sentiment,
      suggestions: this.generateSuggestions(intent)
    };
  }

  private getFallbackResponse(message: string): AIResponse {
    return {
      text: 'Obrigado por sua mensagem. Um atendente humano entrará em contato em breve.',
      confidence: 1.0,
      intent: 'fallback',
      sentiment: 'neutral'
    };
  }

  // =============================
  // ANÁLISE DE INTENÇÃO E SENTIMENTO
  // =============================

  private detectIntent(message: string): string {
    const msg = message.toLowerCase().trim();
    
    // Palavras-chave para detecção de intenção
    if (/^(oi|olá|bom dia|boa tarde|boa noite|e aí)/.test(msg)) {
      return 'greeting';
    }
    
    if (/(problema|erro|ajuda|suporte|não funciona|bug)/.test(msg)) {
      return 'support';
    }
    
    if (/(informação|info|como|onde|quando|qual|preço|valor)/.test(msg)) {
      return 'information';
    }
    
    if (/(reclamação|reclamo|insatisfeito|ruim|péssimo|horrível)/.test(msg)) {
      return 'complaint';
    }
    
    return 'general';
  }

  private analyzeSentiment(message: string): 'positive' | 'negative' | 'neutral' {
    const msg = message.toLowerCase();
    
    const positiveWords = ['bom', 'ótimo', 'excelente', 'perfeito', 'obrigado', 'grato'];
    const negativeWords = ['ruim', 'péssimo', 'horrível', 'problema', 'erro', 'insatisfeito'];
    
    const positiveCount = positiveWords.filter(word => msg.includes(word)).length;
    const negativeCount = negativeWords.filter(word => msg.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private generateSuggestions(intent: string): string[] {
    const suggestions: Record<string, string[]> = {
      greeting: [
        'Como posso ajudá-lo?',
        'Precisa de alguma informação?',
        'Gostaria de falar com um atendente?'
      ],
      support: [
        'Conectar com atendente técnico',
        'Ver FAQ',
        'Reportar problema'
      ],
      information: [
        'Consultar catálogo',
        'Ver preços',
        'Falar com vendas'
      ],
      complaint: [
        'Falar com supervisor',
        'Abrir reclamação formal',
        'Ver política de garantia'
      ]
    };

    return suggestions[intent] || ['Falar com atendente humano'];
  }

  // =============================
  // GERAÇÃO DE RESPOSTAS INTELIGENTES
  // =============================

  async generateResponse(intent: string, userProfile?: any): Promise<string> {
    if (!this.isAIEnabled()) {
      return this.getTemplateResponse(intent);
    }

    try {
      // FASE 3: Implementar geração real com IA
      return await this.simulateResponseGeneration(intent, userProfile);
    } catch (error) {
      console.error('Erro na geração de resposta:', error);
      return this.getTemplateResponse(intent);
    }
  }

  private async simulateResponseGeneration(intent: string, userProfile?: any): Promise<string> {
    // Simulação - FASE 3 implementará IA real
    await new Promise(resolve => setTimeout(resolve, 800));

    const responses: Record<string, string[]> = {
      greeting: [
        'Olá! É um prazer falar com você.',
        'Oi! Como posso tornar seu dia melhor?',
        'Olá! Estou aqui para ajudá-lo.'
      ],
      support: [
        'Vou conectá-lo com nossa equipe técnica especializada.',
        'Entendo sua necessidade de suporte. Aguarde um momento.',
        'Nossa equipe técnica está pronta para ajudá-lo.'
      ],
      information: [
        'Ficarei feliz em fornecer as informações que precisa.',
        'Tenho várias informações que podem interessá-lo.',
        'Que tipo de informação você gostaria de conhecer?'
      ]
    };

    const options = responses[intent] || ['Como posso ajudá-lo?'];
    return options[Math.floor(Math.random() * options.length)];
  }

  private getTemplateResponse(intent: string): string {
    const templates: Record<string, string> = {
      greeting: 'Olá! Como posso ajudá-lo hoje?',
      support: 'Vou conectá-lo com nossa equipe de suporte.',
      information: 'Que informação você gostaria de obter?',
      complaint: 'Lamento pelo inconveniente. Vou priorizar seu atendimento.',
      general: 'Obrigado por entrar em contato. Como posso ajudá-lo?'
    };

    return templates[intent] || templates.general;
  }

  // =============================
  // ANÁLISE AVANÇADA (FASE 3)
  // =============================

  async analyzeConversation(messages: Array<{ role: string; content: string }>): Promise<{
    summary: string;
    sentiment: string;
    topics: string[];
    satisfaction: number;
    nextActions: string[];
  }> {
    // FASE 3: Implementar análise real
    return {
      summary: 'Conversa sobre suporte técnico',
      sentiment: 'neutral',
      topics: ['suporte', 'técnico'],
      satisfaction: 7,
      nextActions: ['Acompanhar resolução', 'Solicitar feedback']
    };
  }

  async suggestResponses(context: MessageContext): Promise<string[]> {
    // FASE 3: Implementar sugestões inteligentes
    return [
      'Entendi sua solicitação. Como posso ajudá-lo?',
      'Vou verificar isso para você.',
      'Deixe-me conectá-lo com um especialista.'
    ];
  }

  // =============================
  // MÉTRICAS E MONITORAMENTO
  // =============================

  getUsageStats() {
    // FASE 3: Implementar métricas reais
    return {
      totalRequests: 0,
      successRate: 100,
      averageResponseTime: 800,
      topIntents: ['greeting', 'support', 'information'],
      sentimentDistribution: {
        positive: 40,
        neutral: 45,
        negative: 15
      }
    };
  }

  // =============================
  // TREINAMENTO E MELHORIA (FASE 3)
  // =============================

  async trainModel(conversations: Array<any>): Promise<void> {
    // FASE 3: Implementar treinamento de modelo
    console.log('Treinamento de modelo será implementado na Fase 3');
  }

  async improveResponses(feedback: Array<{ response: string; rating: number }>): Promise<void> {
    // FASE 3: Implementar melhoria baseada em feedback
    console.log('Melhoria de respostas será implementada na Fase 3');
  }
}

// Singleton instance
export const aiService = new AIService();

// Export default
export default aiService;
