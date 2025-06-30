/**
 * 🎯 Advanced Support System - FASE 3 IA E AUTOMAÇÃO
 * Sistema de suporte avançado com IA, análise preditiva e automação
 */

import { aiService } from './aiService';

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  preferredLanguage: string;
  timezone: string;
  purchaseHistory: Array<{
    date: Date;
    product: string;
    value: number;
    category: string;
  }>;
  interactionHistory: Array<{
    date: Date;
    channel: string;
    type: 'complaint' | 'inquiry' | 'purchase' | 'support';
    resolved: boolean;
    satisfaction?: number;
  }>;
  preferences: {
    contactTime: string[];
    communicationStyle: 'formal' | 'casual' | 'technical';
    preferredChannel: string;
  };
  riskFactors: {
    churnProbability: number;
    satisfactionTrend: 'increasing' | 'stable' | 'decreasing';
    escalationRisk: number;
  };
}

export interface Intent {
  name: string;
  confidence: number;
  entities: Array<{
    entity: string;
    value: string;
    confidence: number;
  }>;
  sentiment: {
    polarity: number; // -1 to 1
    confidence: number;
    emotion: string;
  };
}

export interface SkillsAnalysis {
  requiredSkills: string[];
  complexity: 'low' | 'medium' | 'high' | 'expert';
  estimatedDuration: number;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  department: string;
}

export interface PredictiveInsight {
  type: 'churn_risk' | 'upsell_opportunity' | 'escalation_risk' | 'satisfaction_drop';
  probability: number;
  timeframe: string;
  factors: string[];
  recommendations: string[];
  confidence: number;
}

class AdvancedSupportSystem {
  private customerProfiles = new Map<string, CustomerProfile>();
  private conversationContext = new Map<string, Array<{ role: string; content: string; timestamp: Date }>>();
  private activeAnalysis = new Map<string, Intent>();

  // =============================
  // ANÁLISE DE INTENÇÕES E IA (FASE 3.1)
  // =============================

  async processMessage(message: string, chatId: string, context?: unknown): Promise<Intent> {
    try {
      // Usar o aiService existente para processar a mensagem
      const customerProfile = this.customerProfiles.get(chatId);
      const conversationHistory = this.getConversationHistory(chatId);
      
      await aiService.processMessage(message, {
        chatId,
        userPhone: customerProfile?.phone || '',
        messageHistory: conversationHistory.map(h => ({
          role: h.role as "user" | "assistant",
          content: h.content,
          timestamp: h.timestamp.getTime()
        })),
        userProfile: customerProfile ? {
          preferences: customerProfile.preferences,
          previousInteractions: customerProfile.interactionHistory.length,
          satisfaction: customerProfile.interactionHistory
            .filter(i => i.satisfaction !== undefined)
            .reduce((sum, i) => sum + (i.satisfaction || 0), 0) / 
            Math.max(customerProfile.interactionHistory.filter(i => i.satisfaction !== undefined).length, 1)
        } : undefined
      });

      // Análise de sentimento avançada
      const sentiment = await this.analyzeSentiment(message);
      
      // Extração de entidades
      const entities = await this.extractEntities(message);
      
      // Classificação de intenção
      const intent = await this.classifyIntent(message, context);

      const analysisResult: Intent = {
        name: intent.name,
        confidence: intent.confidence,
        entities,
        sentiment
      };

      // Armazenar análise para contexto futuro
      this.activeAnalysis.set(chatId, analysisResult);
      
      // Atualizar histórico de conversação
      this.updateConversationHistory(chatId, 'user', message);

      return analysisResult;
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      
      // Fallback para análise básica
      return {
        name: 'unknown',
        confidence: 0.5,
        entities: [],
        sentiment: {
          polarity: 0,
          confidence: 0.5,
          emotion: 'neutral'
        }
      };
    }
  }

  async generateResponse(intent: Intent, customerProfile?: CustomerProfile): Promise<string> {
    try {
      // Usar IA para gerar resposta contextual
      const context = {
        intent: intent.name,
        sentiment: intent.sentiment,
        entities: intent.entities,
        customerProfile,
        conversationHistory: customerProfile ? this.getConversationHistory(customerProfile.id) : []
      };

      return await aiService.generateResponse(intent.name, context);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return 'Desculpe, houve um problema. Um atendente humano irá ajudá-lo em breve.';
    }
  }

  // =============================
  // SKILLS-BASED ROUTING AVANÇADO (FASE 3.1)
  // =============================

  async skillsBasedRouting(customer: CustomerProfile, availableAgents: unknown[]): Promise<SkillsAnalysis> {
    const currentAnalysis = this.activeAnalysis.get(customer.id);
    
    // Analisar complexidade baseada em múltiplos fatores
    const complexity = this.assessComplexity(customer, currentAnalysis);
    
    // Determinar skills necessárias
    const requiredSkills = await this.determineRequiredSkills(customer, currentAnalysis);
    
    // Estimar duração baseada em histórico
    const estimatedDuration = this.estimateDuration(customer, complexity);
    
    // Calcular prioridade
    const priority = this.calculatePriority(customer, currentAnalysis);
    
    // Determinar departamento mais adequado
    const department = this.determineDepartment(requiredSkills, customer);

    return {
      requiredSkills,
      complexity,
      estimatedDuration,
      priority,
      department
    };
  }

  private assessComplexity(customer: CustomerProfile, analysis?: Intent): 'low' | 'medium' | 'high' | 'expert' {
    let complexityScore = 0;

    // Baseado no histórico de interações
    const unresolved = customer.interactionHistory.filter(i => !i.resolved).length;
    complexityScore += unresolved * 10;

    // Baseado no sentimento
    if (analysis?.sentiment?.polarity && analysis.sentiment.polarity < -0.5) {
      complexityScore += 20; // Cliente frustrado
    }

    // Baseado nas entidades detectadas
    const technicalTerms = analysis?.entities.filter(e => 
      ['product', 'technical', 'error', 'system'].includes(e.entity)
    ).length || 0;
    complexityScore += technicalTerms * 5;

    // Baseado no valor do cliente
    const totalPurchases = customer.purchaseHistory.reduce((sum, p) => sum + p.value, 0);
    if (totalPurchases > 10000) complexityScore += 15; // Cliente VIP

    if (complexityScore >= 50) return 'expert';
    if (complexityScore >= 30) return 'high';
    if (complexityScore >= 15) return 'medium';
    return 'low';
  }

  private async determineRequiredSkills(customer: CustomerProfile, analysis?: Intent): Promise<string[]> {
    const skills: string[] = ['atendimento_basico'];

    // Skills baseadas no histórico de compras
    const categories = [...new Set(customer.purchaseHistory.map(p => p.category))];
    skills.push(...categories.map(cat => `produto_${cat}`));

    // Skills baseadas na análise de intenção
    if (analysis) {
      if (analysis.name.includes('technical')) skills.push('suporte_tecnico');
      if (analysis.name.includes('billing')) skills.push('financeiro');
      if (analysis.name.includes('complaint')) skills.push('resolucao_conflitos');
      if (analysis.sentiment.polarity < -0.3) skills.push('atendimento_emocional');
    }

    // Skills baseadas no perfil do cliente
    if (customer.preferredLanguage !== 'pt-BR') {
      skills.push(`idioma_${customer.preferredLanguage}`);
    }

    const totalValue = customer.purchaseHistory.reduce((sum, p) => sum + p.value, 0);
    if (totalValue > 10000) skills.push('atendimento_vip');

    return [...new Set(skills)]; // Remove duplicadas
  }

  private estimateDuration(customer: CustomerProfile, complexity: string): number {
    const baseDuration = {
      'low': 5,
      'medium': 15,
      'high': 30,
      'expert': 60
    };

    let duration = baseDuration[complexity as keyof typeof baseDuration];

    // Ajustar baseado no histórico
    const avgPreviousDuration = customer.interactionHistory
      .filter(i => i.resolved)
      .reduce((sum, i, _, arr) => sum + (15 / arr.length), 0); // Simulação

    if (avgPreviousDuration > 0) {
      duration = (duration + avgPreviousDuration) / 2;
    }

    return Math.round(duration);
  }

  private calculatePriority(customer: CustomerProfile, analysis?: Intent): 'urgent' | 'high' | 'normal' | 'low' {
    let priorityScore = 0;

    // Urgência baseada no sentimento
    if (analysis?.sentiment?.polarity && analysis.sentiment.polarity < -0.7) priorityScore += 30;
    if (analysis?.sentiment?.emotion === 'anger') priorityScore += 25;

    // Baseado no valor do cliente
    const totalValue = customer.purchaseHistory.reduce((sum, p) => sum + p.value, 0);
    if (totalValue > 10000) priorityScore += 20;

    // Baseado no risco de churn
    priorityScore += customer.riskFactors.churnProbability * 20;

    // Baseado em palavras-chave urgentes
    if (analysis?.entities.some(e => ['urgente', 'emergency', 'critical'].includes(e.value.toLowerCase()))) {
      priorityScore += 40;
    }

    if (priorityScore >= 40) return 'urgent';
    if (priorityScore >= 25) return 'high';
    if (priorityScore >= 10) return 'normal';
    return 'low';
  }

  private determineDepartment(skills: string[], customer: CustomerProfile): string {
    // Lógica para determinar departamento baseada em skills e perfil
    if (skills.some(s => s.includes('tecnico'))) return 'suporte_tecnico';
    if (skills.some(s => s.includes('financeiro'))) return 'financeiro';
    if (skills.some(s => s.includes('vip'))) return 'atendimento_vip';
    if (skills.some(s => s.includes('produto'))) return 'vendas';
    
    return 'atendimento_geral';
  }

  // =============================
  // INSIGHTS PREDITIVOS (FASE 3.2)
  // =============================

  async predictiveInsights(chatHistory: unknown[]): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];

    // Simular análises preditivas baseadas em dados históricos
    try {
      // Análise de risco de churn
      const churnRisk = await this.analyzeChurnRisk(chatHistory);
      if (churnRisk.probability > 0.3) {
        insights.push(churnRisk);
      }

      // Oportunidades de upsell
      const upsellOpportunity = await this.analyzeUpsellOpportunity(chatHistory);
      if (upsellOpportunity.probability > 0.4) {
        insights.push(upsellOpportunity);
      }

      // Risco de escalação
      const escalationRisk = await this.analyzeEscalationRisk(chatHistory);
      if (escalationRisk.probability > 0.5) {
        insights.push(escalationRisk);
      }

      return insights;
    } catch (error) {
      console.error('Erro ao gerar insights preditivos:', error);
      return [];
    }
  }

  private async analyzeChurnRisk(chatHistory: unknown[]): Promise<PredictiveInsight> {
    // Simulação de análise de churn
    const riskFactors = [
      'Múltiplas reclamações sem resolução',
      'Diminuição na frequência de compras',
      'Sentimento negativo recorrente',
      'Solicitações de cancelamento'
    ];

    return {
      type: 'churn_risk',
      probability: 0.35,
      timeframe: '30 dias',
      factors: riskFactors.slice(0, 2),
      recommendations: [
        'Oferecer desconto ou benefício especial',
        'Agendar ligação de retenção',
        'Escalar para gerente de conta'
      ],
      confidence: 0.75
    };
  }

  private async analyzeUpsellOpportunity(chatHistory: unknown[]): Promise<PredictiveInsight> {
    return {
      type: 'upsell_opportunity',
      probability: 0.45,
      timeframe: '7 dias',
      factors: [
        'Cliente satisfeito com produto atual',
        'Histórico de compras crescente',
        'Interesse em categoria relacionada'
      ],
      recommendations: [
        'Apresentar produtos complementares',
        'Oferecer bundle com desconto',
        'Agendar demonstração de produto premium'
      ],
      confidence: 0.65
    };
  }

  private async analyzeEscalationRisk(chatHistory: unknown[]): Promise<PredictiveInsight> {
    return {
      type: 'escalation_risk',
      probability: 0.55,
      timeframe: 'Imediato',
      factors: [
        'Sentimento muito negativo',
        'Problema não resolvido em tentativas anteriores',
        'Cliente expressou frustração'
      ],
      recommendations: [
        'Escalar imediatamente para supervisor',
        'Oferecer compensação proativa',
        'Usar script de de-escalação'
      ],
      confidence: 0.85
    };
  }

  // =============================
  // PERFIL DE CLIENTE INTELIGENTE
  // =============================

  async buildCustomerProfile(chatId: string, phone: string, initialData?: unknown): Promise<CustomerProfile> {
    // Verificar se já existe perfil
    let profile = this.customerProfiles.get(chatId);
    
    if (!profile) {
      // Criar novo perfil baseado em dados disponíveis
      profile = {
        id: chatId,
        name: '',
        phone,
        preferredLanguage: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        purchaseHistory: [],
        interactionHistory: [],
        preferences: {
          contactTime: ['09:00-18:00'],
          communicationStyle: 'casual',
          preferredChannel: 'whatsapp'
        },
        riskFactors: {
          churnProbability: 0.1,
          satisfactionTrend: 'stable',
          escalationRisk: 0.1
        }
      };

      this.customerProfiles.set(chatId, profile);
    }

    // Enriquecer perfil com dados de integração (CRM, etc.)
    await this.enrichCustomerProfile(profile);
    
    return profile;
  }

  private async enrichCustomerProfile(profile: CustomerProfile): Promise<void> {
    try {
      // Simular enriquecimento de dados via CRM/APIs externas
      // Na implementação real, integraria com Salesforce, HubSpot, etc.
      
      // Atualizar histórico de compras (simulado)
      if (profile.purchaseHistory.length === 0) {
        profile.purchaseHistory = [
          {
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            product: 'Produto A',
            value: 299.99,
            category: 'eletronicos'
          }
        ];
      }

      // Calcular métricas de risco
      await this.updateRiskFactors(profile);
      
    } catch (error) {
      console.error('Erro ao enriquecer perfil do cliente:', error);
    }
  }

  private async updateRiskFactors(profile: CustomerProfile): Promise<void> {
    // Calcular probabilidade de churn baseada em fatores
    let churnScore = 0;
    
    // Baseado em interações não resolvidas
    const unresolvedCount = profile.interactionHistory.filter(i => !i.resolved).length;
    churnScore += unresolvedCount * 0.1;
    
    // Baseado em satisfação média
    const satisfactionScores = profile.interactionHistory
      .filter(i => i.satisfaction !== undefined)
      .map(i => i.satisfaction!);
    
    if (satisfactionScores.length > 0) {
      const avgSatisfaction = satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length;
      churnScore += (5 - avgSatisfaction) * 0.05;
    }
    
    profile.riskFactors.churnProbability = Math.min(churnScore, 1);
    
    // Determinar tendência de satisfação
    if (satisfactionScores.length >= 3) {
      const recent = satisfactionScores.slice(-3);
      const trend = recent[2] - recent[0];
      
      if (trend > 0.5) profile.riskFactors.satisfactionTrend = 'increasing';
      else if (trend < -0.5) profile.riskFactors.satisfactionTrend = 'decreasing';
      else profile.riskFactors.satisfactionTrend = 'stable';
    }
  }

  // =============================
  // ANÁLISE DE SENTIMENTO E ENTIDADES
  // =============================

  private async analyzeSentiment(message: string): Promise<Intent['sentiment']> {
    // Simulação de análise de sentimento
    // Na implementação real, usaria APIs como Google Cloud Natural Language, AWS Comprehend, etc.
    
    const negativeWords = ['ruim', 'péssimo', 'horrível', 'odeia', 'raiva', 'insatisfeito', 'problema'];
    const positiveWords = ['bom', 'excelente', 'maravilhoso', 'amo', 'feliz', 'satisfeito', 'ótimo'];
    
    const lowerMessage = message.toLowerCase();
    
    let score = 0;
    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) score -= 0.3;
    });
    
    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) score += 0.3;
    });
    
    // Normalizar entre -1 e 1
    score = Math.max(-1, Math.min(1, score));
    
    // Determinar emoção primária
    let emotion = 'neutral';
    if (score < -0.5) emotion = 'negative';
    if (score > 0.5) emotion = 'positive';
    if (lowerMessage.includes('raiva') || lowerMessage.includes('irritado')) emotion = 'anger';
    if (lowerMessage.includes('feliz') || lowerMessage.includes('alegre')) emotion = 'joy';
    
    return {
      polarity: score,
      confidence: Math.abs(score) > 0.3 ? 0.8 : 0.5,
      emotion
    };
  }

  private async extractEntities(message: string): Promise<Intent['entities']> {
    // Simulação de extração de entidades
    const entities: Intent['entities'] = [];
    
    // Detectar produtos
    const productMatches = message.match(/(produto|item|equipamento)\s+([A-Za-z0-9]+)/gi);
    if (productMatches) {
      productMatches.forEach(match => {
        entities.push({
          entity: 'product',
          value: match,
          confidence: 0.8
        });
      });
    }
    
    // Detectar valores monetários
    const moneyMatches = message.match(/R\$\s*\d+[.,]?\d*/g);
    if (moneyMatches) {
      moneyMatches.forEach(match => {
        entities.push({
          entity: 'money',
          value: match,
          confidence: 0.9
        });
      });
    }
    
    // Detectar datas
    const dateMatches = message.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g);
    if (dateMatches) {
      dateMatches.forEach(match => {
        entities.push({
          entity: 'date',
          value: match,
          confidence: 0.85
        });
      });
    }
    
    return entities;
  }

  private async classifyIntent(message: string, context?: unknown): Promise<{ name: string; confidence: number }> {
    // Simulação de classificação de intenção
    const lowerMessage = message.toLowerCase();
    
    // Mapeamento de intenções baseado em palavras-chave
    const intentPatterns = {
      'complaint': ['reclamação', 'problema', 'defeito', 'não funciona', 'ruim'],
      'inquiry': ['informação', 'dúvida', 'pergunta', 'como', 'quando', 'onde'],
      'purchase': ['comprar', 'preço', 'valor', 'orçamento', 'pedido'],
      'support': ['ajuda', 'suporte', 'auxílio', 'não consigo', 'erro'],
      'cancellation': ['cancelar', 'desistir', 'não quero', 'remove'],
      'praise': ['obrigado', 'excelente', 'parabéns', 'ótimo', 'adorei']
    };
    
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      for (const pattern of patterns) {
        if (lowerMessage.includes(pattern)) {
          return {
            name: intent,
            confidence: 0.75
          };
        }
      }
    }
    
    return {
      name: 'general',
      confidence: 0.5
    };
  }

  // =============================
  // GESTÃO DE CONTEXTO E HISTÓRICO
  // =============================

  private getConversationHistory(chatId: string): Array<{ role: string; content: string; timestamp: Date }> {
    return this.conversationContext.get(chatId) || [];
  }

  private updateConversationHistory(chatId: string, role: string, content: string): void {
    const history = this.getConversationHistory(chatId);
    history.push({
      role,
      content,
      timestamp: new Date()
    });

    // Manter apenas últimas 10 mensagens para performance
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }

    this.conversationContext.set(chatId, history);
  }

  // =============================
  // MÉTODOS PÚBLICOS
  // =============================

  getCustomerProfile(chatId: string): CustomerProfile | undefined {
    return this.customerProfiles.get(chatId);
  }

  getCurrentAnalysis(chatId: string): Intent | undefined {
    return this.activeAnalysis.get(chatId);
  }

  async getSystemMetrics(): Promise<{
    totalProfiles: number;
    activeAnalysis: number;
    avgSentiment: number;
    topIntents: Array<{ name: string; count: number }>;
  }> {
    const profiles = Array.from(this.customerProfiles.values());
    const analyses = Array.from(this.activeAnalysis.values());

    return {
      totalProfiles: profiles.length,
      activeAnalysis: analyses.length,
      avgSentiment: analyses.reduce((sum, a) => sum + a.sentiment.polarity, 0) / analyses.length || 0,
      topIntents: this.getTopIntents(analyses)
    };
  }

  private getTopIntents(analyses: Intent[]): Array<{ name: string; count: number }> {
    const intentCounts = new Map<string, number>();
    
    analyses.forEach(analysis => {
      const current = intentCounts.get(analysis.name) || 0;
      intentCounts.set(analysis.name, current + 1);
    });

    return Array.from(intentCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

// Singleton instance
export const advancedSupportSystem = new AdvancedSupportSystem();

// Export default
export default advancedSupportSystem;
