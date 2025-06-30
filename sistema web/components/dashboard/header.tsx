"use client"

import { Bell, Search, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession, signOut } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardHeader() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: "/login",
        redirect: true 
      })
      toast.success("Logout realizado com sucesso!")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast.error("Erro ao fazer logout. Tente novamente.")
    }
  }

  const handleProfileNavigation = (path: string) => {
    try {
      router.push(path)
    } catch (error) {
      console.error("Erro na navegação:", error)
      toast.error("Erro ao navegar. Tente novamente.")
    }
  }

  // Loading state
  if (status === "loading") {
    return (
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative max-w-md w-full">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>
    )
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Buscar..." 
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors" 
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
          <span className="sr-only">Notificações</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-blue-500/20">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={session?.user?.image || ""} 
                  alt={session?.user?.name || "Usuário"} 
                />
                <AvatarFallback className="bg-blue-500 text-white">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name || "Usuário"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || "email@exemplo.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleProfileNavigation('/dashboard/settings')}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleProfileNavigation('/dashboard/settings')}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
