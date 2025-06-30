/**
 * 📱 QR Code Display
 * Componente para exibir QR Code do WhatsApp
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useN8nConnection } from '@/hooks/useN8nConnection';
import { 
  QrCode, 
  RefreshCw, 
  Smartphone, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export const QRCodeDisplay: React.FC = () => {
  const {
    connected,
    qrCode,
    qrExpired,
    connecting,
    error,
    generateQR,
    refreshQR
  } = useN8nConnection();

  if (connected) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            WhatsApp Conectado!
          </h3>
          <p className="text-gray-400 text-center">
            Seu bot está conectado e funcionando perfeitamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Conectar WhatsApp
          </div>
          {qrExpired && (
            <Badge variant="secondary" className="bg-red-500/20 text-red-400">
              QR Expirado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {connecting && (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400">Conectando ao WhatsApp...</p>
          </div>
        )}

        {qrCode && !connecting ? (
          <div className="space-y-4">
            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-lg flex items-center justify-center">
              <img 
                src={qrCode} 
                alt="QR Code WhatsApp"
                className="max-w-full h-auto"
              />
            </div>

            {/* Instructions */}
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold text-green-400">Como conectar:</h4>
              </div>
              
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                  <span>Abra o WhatsApp no seu celular</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                  <span>Toque em "Mais opções" (⋮) e depois em "Aparelhos conectados"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                  <span>Toque em "Conectar um aparelho"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                  <span>Escaneie o QR Code acima</span>
                </div>
              </div>
            </div>

            {/* Expiration Warning */}
            {qrExpired ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-red-500" />
                  <span className="text-red-400 font-medium">QR Code Expirado</span>
                </div>
                <p className="text-red-300 text-sm mb-3">
                  O QR Code expirou. Gere um novo para conectar.
                </p>
                <Button 
                  onClick={refreshQR}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Novo QR
                </Button>
              </div>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-400 text-sm">
                      QR Code expira em 60 segundos
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={refreshQR}
                    className="h-7 text-yellow-400 hover:text-yellow-300"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Atualizar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : !connecting && !qrCode && (
          <div className="flex flex-col items-center justify-center py-8">
            <QrCode className="h-12 w-12 text-gray-500 mb-4" />
            <p className="text-gray-400 mb-4">Clique para gerar QR Code</p>
            <Button onClick={generateQR} className="bg-green-500 hover:bg-green-600">
              <QrCode className="h-4 w-4 mr-2" />
              Gerar QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
