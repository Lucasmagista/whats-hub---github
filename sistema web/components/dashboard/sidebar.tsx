"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bot,
  BarChart3,
  Mail,
  Ticket,
  FileText,
  Settings,
  LogOut,
  Home,
  Activity,
  Users,
  MessageSquare,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { useState } from "react"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Bot Management", href: "/dashboard/bot", icon: Bot },
  { name: "Logs", href: "/dashboard/logs", icon: Activity },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
  { name: "Email Templates", href: "/dashboard/emails", icon: Mail },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      await signOut({ 
        callbackUrl: "/login",
        redirect: true 
      })
      toast.success("Logout realizado com sucesso!")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast.error("Erro ao fazer logout. Tente novamente.")
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            ChatSphere
          </span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1" role="navigation" aria-label="Menu principal">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon || AlertCircle
            
            return (
              <Link key={item.name} href={item.href} className="block">
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10 transition-all duration-200",
                    isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100 border-r-2 border-blue-500"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Sair da conta"
        >
          <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
          <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
        </Button>
      </div>
    </div>
  )
}
