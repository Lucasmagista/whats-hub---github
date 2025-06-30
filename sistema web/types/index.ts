export interface BotStatus {
  isRunning: boolean
  isConnected: boolean
  qrCode?: string
  lastActivity?: Date
  messagesCount: number
  uptime: number
}

export interface LogEntry {
  id: string
  timestamp: Date
  level: "info" | "warning" | "error" | "success"
  message: string
  details?: any
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Ticket {
  id: string
  customerName: string
  customerPhone: string
  subject: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  messages: TicketMessage[]
}

export interface TicketMessage {
  id: string
  ticketId: string
  sender: "customer" | "agent"
  message: string
  timestamp: Date
}

export interface Metrics {
  totalMessages: number
  activeChats: number
  resolvedTickets: number
  responseTime: number
  customerSatisfaction: number
  dailyStats: DailyStats[]
}

export interface DailyStats {
  date: string
  messages: number
  tickets: number
  resolved: number
}
