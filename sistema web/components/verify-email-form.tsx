"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Mail, Shield, Timer, RefreshCw } from "lucide-react"
import Link from "next/link"

export function VerifyEmailForm() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutos em segundos
  const [canResend, setCanResend] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  // Timer para o código
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Email não fornecido")
      return
    }

    if (code.length !== 6) {
      toast.error("O código deve ter 6 dígitos")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("✅ Email verificado com sucesso!", {
          description: "Você será redirecionado para o login.",
          duration: 3000,
        })

        // Aguardar um pouco antes de redirecionar
        setTimeout(() => {
          router.push("/login?message=email-verified&redirect=dashboard")
        }, 2000)
      } else {
        toast.error(result.error ?? "Código inválido")
      }
    } catch (error) {
      console.error("Verification error:", error)
      toast.error("Erro interno. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email não fornecido")
      return
    }

    setIsResending(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message ?? "Código reenviado!")
        setTimeLeft(600) // Reset timer
        setCanResend(false)
      } else {
        toast.error(result.error ?? "Erro ao reenviar código")
      }
    } catch (error) {
      console.error("Resend error:", error)
      toast.error("Erro interno. Tente novamente.")
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Mail className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Email não fornecido</CardTitle>
          <CardDescription>
            Não foi possível encontrar o email para verificação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/register">
            <Button className="w-full">
              Voltar para o cadastro
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-10 w-10 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Verificar Email</CardTitle>
        <CardDescription>
          Enviamos um código de 6 dígitos para
          <br />
          <strong className="text-foreground">{email}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código de Verificação</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-lg tracking-widest"
              maxLength={6}
              required
            />
            <div className="text-sm text-muted-foreground text-center">
              Digite o código de 6 dígitos enviado por email
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar Email"
            )}
          </Button>
        </form>

        <div className="space-y-4">
          {!canResend && (
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Timer className="mr-2 h-4 w-4" />
              O código expira em {formatTime(timeLeft)}
            </div>
          )}

          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={!canResend || isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {canResend ? "Reenviar código" : "Aguarde para reenviar"}
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Não recebeu o email? Verifique sua caixa de spam.
            <br />
            <Link href="/register" className="text-blue-600 hover:underline">
              Voltar para o cadastro
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
