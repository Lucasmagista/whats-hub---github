"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Ticket,
  Search,
  Filter,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  MessageSquare,
  Calendar,
} from "lucide-react"

interface TicketData {
  id: string
  subject: string
  customer: {
    name: string
    phone: string
    avatar?: string
  }
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  messagesCount: number
}

export default function TicketsPage() {
  const [tickets] = useState<TicketData[]>([
    {
      id: "1",
      subject: "Problema com pedido #1234",
      customer: { name: "João Silva", phone: "+55 11 99999-9999" },
      status: "open",
      priority: "high",
      assignedTo: "Maria Santos",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      messagesCount: 5,
    },
    {
      id: "2",
      subject: "Dúvida sobre produto",
      customer: { name: "Ana Costa", phone: "+55 11 88888-8888" },
      status: "in-progress",
      priority: "medium",
      assignedTo: "Carlos Lima",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000),
      messagesCount: 3,
    },
    {
      id: "3",
      subject: "Solicitação de reembolso",
      customer: { name: "Pedro Oliveira", phone: "+55 11 77777-7777" },
      status: "resolved",
      priority: "low",
      assignedTo: "Maria Santos",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      messagesCount: 8,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const getStatusBadge = (status: string) => {
    const variants = {
      open: { variant: "destructive" as const, label: "Aberto" },
      "in-progress": { variant: "secondary" as const, label: "Em Andamento" },
      resolved: { variant: "default" as const, label: "Resolvido" },
      closed: { variant: "outline" as const, label: "Fechado" },
    }
    const config = variants[status as keyof typeof variants]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: { color: "bg-green-100 text-green-800", label: "Baixa" },
      medium: { color: "bg-yellow-100 text-yellow-800", label: "Média" },
      high: { color: "bg-orange-100 text-orange-800", label: "Alta" },
      urgent: { color: "bg-red-100 text-red-800", label: "Urgente" },
    }
    const config = variants[priority as keyof typeof variants]
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tickets de Atendimento</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer">Cliente</Label>
                <Input id="customer" placeholder="Nome ou telefone do cliente" />
              </div>
              <div>
                <Label htmlFor="subject">Assunto</Label>
                <Input id="subject" placeholder="Descreva o problema" />
              </div>
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" placeholder="Detalhes do problema" />
              </div>
              <Button className="w-full">Criar Ticket</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-600">Abertos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-gray-600">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">45</p>
                <p className="text-sm text-gray-600">Resolvidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">65</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in-progress">Em Andamento</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0">{getStatusIcon(ticket.status)}</div>

                <Avatar className="w-10 h-10">
                  <AvatarImage src={ticket.customer.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</h3>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{ticket.customer.name}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{ticket.messagesCount} mensagens</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-gray-500">Atribuído a</p>
                  <p className="text-sm font-medium">{ticket.assignedTo || "Não atribuído"}</p>
                </div>

                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
