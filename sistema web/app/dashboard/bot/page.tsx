"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Play, Square, RefreshCw, QrCode, Smartphone, Wifi, WifiOff, AlertCircle, CheckCircle } from "lucide-react"
import { useBotStatus } from "@/lib/hooks/use-bot-status"
import Image from "next/image"

export default function BotManagementPage() {
  const { status, loading, startBot, stopBot } = useBotStatus()
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)

  const handleStartBot = async () => {
    setIsStarting(true)
    try {
      await startBot()
    } catch (error) {
      console.error("Falha ao iniciar o bot:", error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopBot = async () => {
    setIsStopping(true)
    try {
      await stopBot()
    } catch (error) {
      console.error("Falha ao parar o bot:", error)
    } finally {
      setIsStopping(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento do Bot</h1>
        <div className="flex items-center space-x-2">
          <Badge variant={status.isRunning ? "default" : "secondary"} className="flex items-center space-x-1">
            <Bot className="w-3 h-3" />
            <span>{status.isRunning ? "Online" : "Offline"}</span>
          </Badge>
        </div>
      </div>

      {/* Bot Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>Status & Controles do Bot</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${status.isRunning ? "bg-green-500" : "bg-gray-400"}`} />
              <div>
                <p className="text-sm font-medium">Status do Bot</p>
                <p className="text-xs text-gray-600">{status.isRunning ? "Em execução" : "Parado"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              {status.isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium">Conexão</p>
                <p className="text-xs text-gray-600">{status.isConnected ? "Conectado" : "Desconectado"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Smartphone className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Mensagens</p>
                <p className="text-xs text-gray-600">{status.messagesCount} hoje</p>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center space-x-4">
            {!status.isRunning ? (
              <Button onClick={handleStartBot} disabled={isStarting} className="bg-green-600 hover:bg-green-700">
                {isStarting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {isStarting ? "Iniciando..." : "Iniciar Bot"}
              </Button>
            ) : (
              <Button onClick={handleStopBot} disabled={isStopping} variant="destructive">
                {isStopping ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Square className="w-4 h-4 mr-2" />}
                {isStopping ? "Parando..." : "Parar Bot"}
              </Button>
            )}

            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reiniciar Bot
            </Button>
          </div>

          {/* Alerts */}
          {!status.isConnected && status.isRunning && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                O bot está em execução, mas não está conectado ao WhatsApp. Por favor, escaneie o QR code abaixo.
              </AlertDescription>
            </Alert>
          )}

          {status.isConnected && status.isRunning && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Bot em execução e conectado com sucesso!</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* QR Code Section */}
      {status.isRunning && !status.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="w-5 h-5" />
              <span>Conexão com WhatsApp</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Escaneie este QR code com seu WhatsApp para conectar o bot</p>

            {status.qrCode ? (
              <div className="flex justify-center">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <Image
                    src={status.qrCode || "/placeholder.svg"}
                    alt="QR Code do WhatsApp"
                    width={256}
                    height={256}
                    className="w-64 h-64"
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Gerando QR Code...</p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500 space-y-1">
              <p>1. Abra o WhatsApp no seu celular</p>
              <p>2. Vá em Configurações → Dispositivos conectados</p>
              <p>3. Toque em "Conectar um dispositivo"</p>
              <p>4. Escaneie este QR code</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bot Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Bot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{Math.floor(status.uptime / 3600)}h</p>
              <p className="text-sm text-gray-600">Tempo online</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{status.messagesCount}</p>
              <p className="text-sm text-gray-600">Mensagens enviadas</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">24</p>
              <p className="text-sm text-gray-600">Conversas ativas</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">98%</p>
              <p className="text-sm text-gray-600">Taxa de sucesso</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
