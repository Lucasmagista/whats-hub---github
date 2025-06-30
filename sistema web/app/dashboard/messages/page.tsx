"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  ImageIcon,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreHorizontal,
  Check,
  CheckCheck,
} from "lucide-react"

interface Message {
  id: string
  customerId: string
  customerName: string
  customerAvatar?: string
  content: string
  type: "text" | "image" | "audio" | "video" | "document"
  direction: "inbound" | "outbound"
  status: "sent" | "delivered" | "read"
  timestamp: Date
}

interface Chat {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  customerAvatar?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isOnline: boolean
}

export default function MessagesPage() {
  const [chats] = useState<Chat[]>([
    {
      id: "1",
      customerId: "1",
      customerName: "João Silva",
      customerPhone: "+55 11 99999-9999",
      lastMessage: "Obrigado pelo atendimento!",
      lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: "2",
      customerId: "2",
      customerName: "Maria Santos",
      customerPhone: "+55 11 88888-8888",
      lastMessage: "Quando meu pedido será entregue?",
      lastMessageTime: new Date(Date.now() - 15 * 60 * 1000),
      unreadCount: 2,
      isOnline: false,
    },
    {
      id: "3",
      customerId: "3",
      customerName: "Pedro Costa",
      customerPhone: "+55 11 77777-7777",
      lastMessage: "Preciso de ajuda com o produto",
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 1,
      isOnline: true,
    },
  ])

  const [messages] = useState<Message[]>([
    {
      id: "1",
      customerId: "1",
      customerName: "João Silva",
      content: "Olá, preciso de ajuda com meu pedido",
      type: "text",
      direction: "inbound",
      status: "read",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: "2",
      customerId: "1",
      customerName: "João Silva",
      content: "Olá João! Como posso ajudá-lo hoje?",
      type: "text",
      direction: "outbound",
      status: "read",
      timestamp: new Date(Date.now() - 28 * 60 * 1000),
    },
    {
      id: "3",
      customerId: "1",
      customerName: "João Silva",
      content: "Meu pedido #1234 ainda não chegou",
      type: "text",
      direction: "inbound",
      status: "read",
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
    },
    {
      id: "4",
      customerId: "1",
      customerName: "João Silva",
      content: "Deixe-me verificar o status do seu pedido. Um momento, por favor.",
      type: "text",
      direction: "outbound",
      status: "read",
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
    },
    {
      id: "5",
      customerId: "1",
      customerName: "João Silva",
      content: "Seu pedido está a caminho e deve chegar hoje até às 18h.",
      type: "text",
      direction: "outbound",
      status: "read",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: "6",
      customerId: "1",
      customerName: "João Silva",
      content: "Obrigado pelo atendimento!",
      type: "text",
      direction: "inbound",
      status: "read",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
  ])

  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const filteredChats = chats.filter(
    (chat) =>
      chat.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || chat.customerPhone.includes(searchTerm),
  )

  const chatMessages = messages.filter((msg) => msg.customerId === selectedChat?.customerId)

  const sendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", newMessage, "to", selectedChat.customerName)
      setNewMessage("")
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversas</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova Conversa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Número do WhatsApp</label>
                    <Input placeholder="+55 11 99999-9999" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mensagem inicial</label>
                    <Textarea placeholder="Digite sua mensagem..." />
                  </div>
                  <Button className="w-full">Iniciar Conversa</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedChat?.id === chat.id ? "bg-blue-50 border-blue-200" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chat.customerAvatar || "/placeholder.svg"} />
                    <AvatarFallback>{chat.customerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{chat.customerName}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(chat.lastMessageTime).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <Badge className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedChat.customerAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{selectedChat.customerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {selectedChat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedChat.customerName}</h3>
                    <p className="text-sm text-gray-600">{selectedChat.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === "outbound" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.direction === "outbound" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div
                      className={`flex items-center justify-end space-x-1 mt-1 ${
                        message.direction === "outbound" ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      <span className="text-xs">
                        {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.direction === "outbound" && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
              <p className="text-gray-600">Escolha uma conversa da lista para começar a enviar mensagens</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
