import { prisma } from "./prisma"

export class AnalyticsEngine {
  static async getCustomerSentiment(customerId: string): Promise<number> {
    const messages = await prisma.message.findMany({
      where: {
        customerId,
        direction: "INBOUND",
        sentiment: { not: null },
      },
      select: { sentiment: true },
      orderBy: { timestamp: "desc" },
      take: 50,
    })

    if (messages.length === 0) return 0

    const avgSentiment = messages.reduce((sum, msg) => sum + (msg.sentiment || 0), 0) / messages.length
    return Math.round(avgSentiment * 100) / 100
  }

  static async predictChurnRisk(customerId: string): Promise<number> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        messages: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
        tickets: {
          where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
        },
      },
    })

    if (!customer) return 0

    let riskScore = 0

    // Days since last message
    if (customer.lastMessage) {
      const daysSinceLastMessage = Math.floor((Date.now() - customer.lastMessage.getTime()) / (1000 * 60 * 60 * 24))
      riskScore += Math.min(daysSinceLastMessage * 2, 40)
    }

    // Open tickets
    riskScore += customer.tickets.length * 15

    // Sentiment trend
    const recentSentiments = customer.messages
      .filter((m) => m.sentiment !== null)
      .map((m) => m.sentiment!)
      .slice(0, 5)

    if (recentSentiments.length > 0) {
      const avgSentiment = recentSentiments.reduce((a, b) => a + b, 0) / recentSentiments.length
      if (avgSentiment < -0.3) riskScore += 25
      else if (avgSentiment < 0) riskScore += 10
    }

    return Math.min(Math.round(riskScore), 100)
  }

  static async getEngagementScore(customerId: string): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const metrics = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        messages: {
          where: { timestamp: { gte: thirtyDaysAgo } },
        },
        interactions: {
          where: { createdAt: { gte: thirtyDaysAgo } },
        },
      },
    })

    if (!metrics) return 0

    let score = 0

    // Message frequency
    score += Math.min(metrics.messages.length * 2, 40)

    // Interaction diversity
    const interactionTypes = new Set(metrics.interactions.map((i) => i.type))
    score += interactionTypes.size * 10

    // Response rate (simplified)
    const outboundMessages = metrics.messages.filter((m) => m.direction === "OUTBOUND").length
    const inboundMessages = metrics.messages.filter((m) => m.direction === "INBOUND").length

    if (outboundMessages > 0) {
      const responseRate = inboundMessages / outboundMessages
      score += Math.min(responseRate * 30, 30)
    }

    return Math.min(Math.round(score), 100)
  }

  static async generateInsights(timeframe: "day" | "week" | "month" = "week") {
    const now = new Date()
    const startDate = new Date()

    switch (timeframe) {
      case "day":
        startDate.setDate(now.getDate() - 1)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    const [messageStats, ticketStats, customerStats, sentimentStats] = await Promise.all([
      this.getMessageStats(startDate, now),
      this.getTicketStats(startDate, now),
      this.getCustomerStats(startDate, now),
      this.getSentimentStats(startDate, now),
    ])

    return {
      messages: messageStats,
      tickets: ticketStats,
      customers: customerStats,
      sentiment: sentimentStats,
      insights: this.generateTextualInsights({
        messages: messageStats,
        tickets: ticketStats,
        customers: customerStats,
        sentiment: sentimentStats,
      }),
    }
  }

  private static async getMessageStats(startDate: Date, endDate: Date) {
    const messages = await prisma.message.groupBy({
      by: ["direction"],
      where: {
        timestamp: { gte: startDate, lte: endDate },
      },
      _count: true,
    })

    const total = messages.reduce((sum, group) => sum + group._count, 0)
    const inbound = messages.find((g) => g.direction === "INBOUND")?._count || 0
    const outbound = messages.find((g) => g.direction === "OUTBOUND")?._count || 0

    return { total, inbound, outbound, responseRate: inbound > 0 ? outbound / inbound : 0 }
  }

  private static async getTicketStats(startDate: Date, endDate: Date) {
    const tickets = await prisma.ticket.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
    })

    const total = tickets.reduce((sum, group) => sum + group._count, 0)
    const resolved = tickets.find((t) => t.status === "RESOLVED")?._count || 0
    const open = tickets.find((t) => t.status === "OPEN")?._count || 0

    return { total, resolved, open, resolutionRate: total > 0 ? resolved / total : 0 }
  }

  private static async getCustomerStats(startDate: Date, endDate: Date) {
    const newCustomers = await prisma.customer.count({
      where: { createdAt: { gte: startDate, lte: endDate } },
    })

    const activeCustomers = await prisma.customer.count({
      where: {
        lastMessage: { gte: startDate, lte: endDate },
        status: "ACTIVE",
      },
    })

    return { new: newCustomers, active: activeCustomers }
  }

  private static async getSentimentStats(startDate: Date, endDate: Date) {
    const sentiments = await prisma.message.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate },
        sentiment: { not: null },
      },
      select: { sentiment: true },
    })

    if (sentiments.length === 0) {
      return { average: 0, positive: 0, negative: 0, neutral: 0 }
    }

    const average = sentiments.reduce((sum, s) => sum + s.sentiment!, 0) / sentiments.length
    const positive = sentiments.filter((s) => s.sentiment! > 0.1).length
    const negative = sentiments.filter((s) => s.sentiment! < -0.1).length
    const neutral = sentiments.length - positive - negative

    return { average, positive, negative, neutral }
  }

  private static generateTextualInsights(data: any): string[] {
    const insights: string[] = []

    // Message insights
    if (data.messages.responseRate > 1.2) {
      insights.push("High customer engagement detected - response rate is above average")
    } else if (data.messages.responseRate < 0.8) {
      insights.push("Low customer engagement - consider proactive outreach")
    }

    // Ticket insights
    if (data.tickets.resolutionRate > 0.8) {
      insights.push("Excellent ticket resolution rate - team is performing well")
    } else if (data.tickets.resolutionRate < 0.6) {
      insights.push("Ticket resolution rate needs improvement - consider additional training")
    }

    // Sentiment insights
    if (data.sentiment.average > 0.2) {
      insights.push("Overall customer sentiment is positive")
    } else if (data.sentiment.average < -0.2) {
      insights.push("Customer sentiment is concerning - review recent interactions")
    }

    return insights
  }
}
