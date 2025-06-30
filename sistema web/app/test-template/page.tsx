"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Mail, TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function TestTemplatePage() {
  const [isTestingGet, setIsTestingGet] = useState(false)
  const [isTestingPost, setIsTestingPost] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testName, setTestName] = useState("")
  const [lastResult, setLastResult] = useState<any>(null)

  const handleQuickTest = async () => {
    setIsTestingGet(true)
    try {
      const response = await fetch("/api/test-template")
      const result = await response.json()
      
      setLastResult(result)
      
      if (result.success) {
        toast.success("✅ Template testado com sucesso! Verifique o email.")
      } else {
        toast.error(`❌ Erro: ${result.error}`)
      }
    } catch (error) {
      toast.error("❌ Erro interno do servidor")
      console.error(error)
    } finally {
      setIsTestingGet(false)
    }
  }

  const handleCustomTest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!testEmail || !testName) {
      toast.error("Preencha email e nome")
      return
    }

    setIsTestingPost(true)
    try {
      const response = await fetch("/api/test-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          name: testName,
        }),
      })

      const result = await response.json()
      setLastResult(result)
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("❌ Erro interno do servidor")
      console.error(error)
    } finally {
      setIsTestingPost(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <TestTube className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Teste do Template EmailJS
          </h1>
          <p className="text-gray-500">Teste o template aprimorado de verificação por email</p>
        </div>

        {/* Quick Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Teste Rápido
            </CardTitle>
            <CardDescription>
              Envia um email de teste para lucasmagistav@gmail.com usando o template configurado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleQuickTest} 
              disabled={isTestingGet}
              className="w-full"
            >
              {isTestingGet ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando Template...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar Template Agora
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Custom Test */}
        <Card>
          <CardHeader>
            <CardTitle>Teste Personalizado</CardTitle>
            <CardDescription>
              Teste o template com seu próprio email e nome
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCustomTest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testName">Nome</Label>
                  <Input
                    id="testName"
                    type="text"
                    placeholder="Seu nome"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Email</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isTestingPost}
                className="w-full"
              >
                {isTestingPost ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email de Teste
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Display */}
        {lastResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {lastResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                Resultado do Teste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  lastResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`font-medium ${
                    lastResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {lastResult.success ? '✅ Sucesso!' : '❌ Erro!'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    lastResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {lastResult.message || lastResult.error}
                  </p>
                </div>

                {lastResult.instructions && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Instruções:</h4>                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {lastResult.instructions.map((instruction: string) => (
                        <li key={instruction.slice(0, 20)}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {lastResult.troubleshooting && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Solução de Problemas:</h4>                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {lastResult.troubleshooting.map((item: string) => (
                        <li key={item.slice(0, 20)}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {lastResult.config && (
                  <details className="border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900">
                      Configuração Atual
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(lastResult.config, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Como Usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1. Configure o Template</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Acesse o EmailJS Dashboard</li>
                  <li>• Edite o template template_r190n0d</li>
                  <li>• Use o HTML fornecido na documentação</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2. Teste o Sistema</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Clique em "Testar Template Agora"</li>
                  <li>• Verifique o email recebido</li>
                  <li>• Confirme o design aprimorado</li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">🎨 Características do Template:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p>• Design estilo WhatsApp</p>
                  <p>• Tema escuro profissional</p>
                  <p>• Código destacado</p>
                </div>
                <div>
                  <p>• Responsivo (mobile/desktop)</p>
                  <p>• Ícones e gradientes</p>
                  <p>• Footer com copyright</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
