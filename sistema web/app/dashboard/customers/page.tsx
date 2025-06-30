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
  Users,
  Search,
  Filter,
  Plus,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  BlocksIcon as Block,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
  status: "active" | "inactive" | "blocked"
  tags: string[]
  totalMessages: number
  lastMessage: Date
  createdAt: Date
  notes?: string
}

export default function CustomersPage() {
  const [customers] = useState<Customer[]>([
    {
      id: "1",
      name: "João Silva",
      phone: "+55 11 99999-9999",
      email: "joao@email.com",
      status: "active",
      tags: ["VIP", "Premium"],
      totalMessages: 45,
      lastMessage: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      notes: "Cliente muito satisfeito com o atendimento",
    },
    {
      id: "2",
      name: "Maria Santos",
      phone: "+55 11 88888-8888",
      email: "maria@email.com",
      status: "active",
      tags: ["Novo"],
      totalMessages: 12,
      lastMessage: new Date(Date.now() - 1 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      name: "Pedro Costa",
      phone: "+55 11 77777-7777",
      status: "inactive",
      tags: ["Antigo"],
      totalMessages: 128,
      lastMessage: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      notes: "Cliente inativo há mais de 2 semanas",
    },
    {
      id: "4",
      name: "Ana Oliveira",
      phone: "+55 11 66666-6666",
      email: "ana@email.com",
      status: "blocked",
      tags: ["Problema"],
      totalMessages: 8,
      lastMessage: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      notes: "Cliente bloqueado por comportamento inadequado",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tagFilter, setTagFilter] = useState("all")

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "default" as const, label: "Ativo" },
      inactive: { variant: "secondary" as const, label: "Inativo" },
      blocked: { variant: "destructive" as const, label: "Bloqueado" },
    }
    const config = variants[status as keyof typeof variants]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTagColor = (tag: string) => {
    const colors = {
      VIP: "bg-purple-100 text-purple-800",
      Premium: "bg-gold-100 text-gold-800",
      Novo: "bg-green-100 text-green-800",
      Antigo: "bg-gray-100 text-gray-800",
      Problema: "bg-red-100 text-red-800",
    }
    return colors[tag as keyof typeof colors] || "bg-blue-100 text-blue-800"
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter
    const matchesTag = tagFilter === "all" || customer.tags.includes(tagFilter)
    return matchesSearch && matchesStatus && matchesTag
  })

  const allTags = Array.from(new Set(customers.flatMap((c) => c.tags)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Clientes</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Nome</Label>
                <Input id="customerName" placeholder="Nome completo" />
              </div>
              <div>
                <Label htmlFor="customerPhone">Telefone</Label>
                <Input id="customerPhone" placeholder="+55 11 99999-9999" />
              </div>
              <div>
                <Label htmlFor="customerEmail">E-mail (opcional)</Label>
                <Input id="customerEmail" type="email" placeholder="email@exemplo.com" />
              </div>
              <div>
                <Label htmlFor="customerTags">Tags</Label>
                <Input id="customerTags" placeholder="VIP, Premium (separadas por vírgula)" />
              </div>
              <div>
                <Label htmlFor="customerNotes">Observações</Label>
                <Textarea id="customerNotes" placeholder="Observações sobre o cliente" />
              </div>
              <Button className="w-full">Adicionar Cliente</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{customers.length}</p>
                <p className="text-sm text-gray-600">Total de Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{customers.filter((c) => c.status === "active").length}</p>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{customers.reduce((acc, c) => acc + c.totalMessages, 0)}</p>
                <p className="text-sm text-gray-600">Total de Mensagens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {
                    customers.filter((c) => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                      .length
                  }
                </p>
                <p className="text-sm text-gray-600">Novos (30 dias)</p>
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
                  placeholder="Buscar por nome, telefone ou e-mail..."
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
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>

                  <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                    {getStatusBadge(customer.status)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>{customer.phone}</span>
                    </span>
                    {customer.email && (
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{customer.email}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{customer.totalMessages} mensagens</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {customer.tags.map((tag) => (
                      <span key={tag} className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  {customer.notes && <p className="text-sm text-gray-500 mt-2 truncate">{customer.notes}</p>}
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-gray-500">Última mensagem</p>
                  <p className="text-sm font-medium">{new Date(customer.lastMessage).toLocaleDateString("pt-BR")}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(customer.lastMessage).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Block className="w-4 h-4 mr-2" />
                      {customer.status === "blocked" ? "Desbloquear" : "Bloquear"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
