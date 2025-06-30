export class AIProcessor {
  static async analyzeSentiment(text: string): Promise<number> {
    // In production, this would call an AI service like OpenAI, AWS Comprehend, etc.
    // For demo purposes, we'll use a simple keyword-based approach

    const positiveWords = ["good", "great", "excellent", "amazing", "love", "perfect", "wonderful", "fantastic"]
    const negativeWords = ["bad", "terrible", "awful", "hate", "horrible", "worst", "disappointed", "angry"]

    const words = text.toLowerCase().split(/\s+/)
    let score = 0

    words.forEach((word) => {
      if (positiveWords.includes(word)) score += 0.1
      if (negativeWords.includes(word)) score -= 0.1
    })

    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, score))
  }

  static async detectLanguage(text: string): Promise<string> {
    // Simple language detection based on common words
    const portugueseWords = ["o", "a", "de", "que", "e", "do", "da", "em", "um", "para", "é", "com", "não", "uma", "os"]
    const englishWords = [
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "i",
      "it",
      "for",
      "not",
      "on",
      "with",
    ]
    const spanishWords = ["el", "la", "de", "que", "y", "a", "en", "un", "es", "se", "no", "te", "lo", "le", "da"]

    const words = text.toLowerCase().split(/\s+/)

    let ptScore = 0,
      enScore = 0,
      esScore = 0

    words.forEach((word) => {
      if (portugueseWords.includes(word)) ptScore++
      if (englishWords.includes(word)) enScore++
      if (spanishWords.includes(word)) esScore++
    })

    if (ptScore > enScore && ptScore > esScore) return "pt-BR"
    if (esScore > enScore && esScore > ptScore) return "es-ES"
    return "en-US"
  }

  static async extractEntities(text: string): Promise<Array<{ type: string; value: string; confidence: number }>> {
    const entities: Array<{ type: string; value: string; confidence: number }> = []

    // Email extraction
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const emails = text.match(emailRegex)
    if (emails) {
      emails.forEach((email) => {
        entities.push({ type: "EMAIL", value: email, confidence: 0.95 })
      })
    }

    // Phone extraction
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?$$?\d{3}$$?[-.\s]?\d{3}[-.\s]?\d{4}/g
    const phones = text.match(phoneRegex)
    if (phones) {
      phones.forEach((phone) => {
        entities.push({ type: "PHONE", value: phone, confidence: 0.9 })
      })
    }

    // URL extraction
    const urlRegex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g
    const urls = text.match(urlRegex)
    if (urls) {
      urls.forEach((url) => {
        entities.push({ type: "URL", value: url, confidence: 0.98 })
      })
    }

    return entities
  }

  static async generateResponse(context: string, userMessage: string): Promise<string> {
    // In production, this would use GPT-4, Claude, or similar
    // For demo, we'll use simple pattern matching

    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("olá") || lowerMessage.includes("oi")) {
      return "Olá! Como posso ajudá-lo hoje?"
    }

    if (lowerMessage.includes("pedido") || lowerMessage.includes("order")) {
      return "Vou verificar o status do seu pedido. Pode me informar o número do pedido?"
    }

    if (lowerMessage.includes("problema") || lowerMessage.includes("issue")) {
      return "Entendo que você está enfrentando um problema. Pode me dar mais detalhes para que eu possa ajudá-lo melhor?"
    }

    if (lowerMessage.includes("obrigado") || lowerMessage.includes("thanks")) {
      return "De nada! Fico feliz em ajudar. Há mais alguma coisa que posso fazer por você?"
    }

    return "Obrigado pela sua mensagem. Um de nossos agentes entrará em contato em breve."
  }

  static async classifyIntent(text: string): Promise<{ intent: string; confidence: number }> {
    const lowerText = text.toLowerCase()

    const intents = [
      { name: "greeting", keywords: ["olá", "oi", "hello", "hi"], confidence: 0.9 },
      { name: "order_inquiry", keywords: ["pedido", "order", "compra", "purchase"], confidence: 0.85 },
      { name: "support", keywords: ["problema", "issue", "help", "ajuda"], confidence: 0.8 },
      { name: "complaint", keywords: ["reclamação", "complaint", "insatisfeito"], confidence: 0.75 },
      { name: "compliment", keywords: ["obrigado", "thanks", "excelente", "ótimo"], confidence: 0.7 },
      { name: "goodbye", keywords: ["tchau", "bye", "até logo"], confidence: 0.9 },
    ]

    for (const intent of intents) {
      for (const keyword of intent.keywords) {
        if (lowerText.includes(keyword)) {
          return { intent: intent.name, confidence: intent.confidence }
        }
      }
    }

    return { intent: "unknown", confidence: 0.1 }
  }

  static async summarizeConversation(messages: Array<{ content: string; direction: string }>): Promise<string> {
    // Simple summarization - in production would use AI
    const customerMessages = messages.filter((m) => m.direction === "INBOUND")
    const agentMessages = messages.filter((m) => m.direction === "OUTBOUND")

    if (messages.length === 0) return "Nenhuma conversa encontrada."

    const summary = `Conversa com ${customerMessages.length} mensagens do cliente e ${agentMessages.length} respostas do agente. `

    // Extract key topics
    const allText = messages
      .map((m) => m.content)
      .join(" ")
      .toLowerCase()
    const topics = []

    if (allText.includes("pedido") || allText.includes("order")) topics.push("pedido")
    if (allText.includes("problema") || allText.includes("issue")) topics.push("problema")
    if (allText.includes("pagamento") || allText.includes("payment")) topics.push("pagamento")
    if (allText.includes("entrega") || allText.includes("delivery")) topics.push("entrega")

    if (topics.length > 0) {
      return summary + `Principais tópicos: ${topics.join(", ")}.`
    }

    return summary + "Conversa geral de atendimento."
  }
}
