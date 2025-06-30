"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginFormContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    const error = searchParams.get("error")
    const verified = searchParams.get("verified")
    
    if (error) {
      switch (error) {
        case "CredentialsSignin":
          toast.error("Credenciais inválidas. Verifique seu email e senha.")
          break
        case "EmailNotVerified":
          toast.error("Email não verificado. Verifique seu email antes de fazer login.")
          break
        case "AccountInactive":
          toast.error("Conta inativa. Entre em contato com o suporte.")
          break
        default:
          toast.error("Erro ao fazer login. Tente novamente.")
      }
    }
    
    if (verified === "true") {
      toast.success("Email verificado com sucesso! Agora você pode fazer login.")
    }
  }, [searchParams])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        switch (result.error) {
          case "CredentialsSignin":
            toast.error("Credenciais inválidas. Verifique seu email e senha.")
            break
          case "EmailNotVerified":
            toast.error("Email não verificado. Verifique seu email antes de fazer login.")
            break
          case "AccountInactive":  
            toast.error("Conta inativa. Entre em contato com o suporte.")
            break
          default:
            toast.error("Erro ao fazer login. Tente novamente.")
        }
        return
      }

      if (result?.ok) {
        toast.success("Login realizado com sucesso!")
        
        // Aguarda um pouco para garantir que a sessão foi definida
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Verifica se a sessão foi criada
        const session = await getSession()
        if (session) {
          router.push("/dashboard")
        } else {
          toast.error("Erro ao estabelecer sessão. Tente novamente.")
        }
      }
    } catch (error) {
      console.error("Erro no login:", error)
      toast.error("Erro interno. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
        <p className="text-gray-600">Faça login para acessar o dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className={cn(
                "pl-10 h-11 bg-white/50 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              {...register("email")}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={cn(
                "pl-10 pr-10 h-11 bg-white/50 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              {...register("password")}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link 
              href="/forgot-password" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Esqueceu a senha?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
          Cadastre-se
        </Link>
      </div>
    </div>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  )
}

export function LoginForm() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginFormContent />
    </Suspense>
  )
}
