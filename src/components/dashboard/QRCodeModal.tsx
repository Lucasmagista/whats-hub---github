import React, { useState, useEffect, useCallback } from 'react';
import { DraggableModal } from '@/components/ui/draggable-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  QrCode, 
  RefreshCw, 
  CheckCircle, 
  Clock,
  Smartphone,
  AlertCircle,
  Copy,
  Download,
  Wifi
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  botName: string;
  qrCodeData?: string;
  isEmbedded?: boolean;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  botName,
  qrCodeData,
  isEmbedded = false
}) => {
  const [qrStatus, setQrStatus] = useState<'waiting' | 'generated' | 'scanned' | 'expired' | 'error'>('waiting');
  const [countdown, setCountdown] = useState(120);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Gerar QR Code real quando os dados estão disponíveis
  useEffect(() => {
    if (!isOpen || !qrCodeData) {
      setQrStatus('waiting');
      setQrCodeImage(null);
      return;
    }    const generateQRImage = async () => {
      try {
        setQrStatus('waiting');
        
        const qrImageData = await QRCode.toDataURL(qrCodeData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#1e40af',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
        });
        
        setQrCodeImage(qrImageData);
        setQrStatus('generated');
        setCountdown(120);
        setIsExpired(false);
        
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        setQrStatus('error');
        toast({
          title: "❌ Erro",
          description: "Não foi possível gerar o QR Code",
          variant: "destructive"
        });
      }
    };

    generateQRImage();
  }, [qrCodeData, isOpen]);

  // Countdown do QR Code
  useEffect(() => {
    if (!isOpen || qrStatus !== 'generated') return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setQrStatus('expired');
          setIsExpired(true);
          toast({
            title: "⏰ QR Code Expirado",
            description: "Gere um novo código para continuar",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, qrStatus]);

  // Simular scan após um tempo (para demonstração)
  useEffect(() => {
    if (qrStatus === 'generated' && !isExpired) {
      const timeoutId = setTimeout(() => {
        if (!isExpired && qrStatus === 'generated') {
          setQrStatus('scanned');
          toast({
            title: "✅ QR Code Escaneado!",
            description: "WhatsApp conectado com sucesso",
          });
        }
      }, 30000);

      return () => clearTimeout(timeoutId);
    }
  }, [qrStatus, isExpired]);

  const generateNewQR = useCallback(() => {
    if (qrCodeData) {
      setQrStatus('waiting');
      setCountdown(120);
      setIsExpired(false);
        // Re-trigger QR generation
      const generateQRImage = async () => {
        try {
          const qrImageData = await QRCode.toDataURL(qrCodeData, {
            width: 256,
            margin: 2,
            color: {
              dark: '#1e40af',
              light: '#ffffff'
            },
            errorCorrectionLevel: 'H'
          });
          
          setQrCodeImage(qrImageData);
          setQrStatus('generated');
          
        } catch (error) {
          setQrStatus('error');
        }
      };
      
      generateQRImage();
    }
  }, [qrCodeData]);

  const copyQRData = useCallback(() => {
    if (qrCodeData) {
      navigator.clipboard.writeText(qrCodeData).then(() => {
        toast({
          title: "📋 QR Code Copiado",
          description: "Dados copiados para a área de transferência",
        });
      });
    }
  }, [qrCodeData]);

  const downloadQRCode = useCallback(() => {
    if (!qrCodeImage) return;

    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = `qr-code-${botName.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "📥 QR Code Baixado",
      description: "Imagem salva com sucesso",
    });
  }, [qrCodeImage, botName]);
  const getStatusIcon = () => {
    switch (qrStatus) {
      case 'waiting':
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'generated':
        return <QrCode className="w-5 h-5 text-green-400" />;
      case 'scanned':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (qrStatus) {
      case 'waiting':
        return qrCodeData ? 'Gerando QR Code...' : 'Aguardando QR Code...';
      case 'generated':
        return 'QR Code pronto! Escaneie com seu WhatsApp';
      case 'scanned':
        return 'QR Code escaneado com sucesso!';
      case 'expired':
        return 'QR Code expirou. Gere um novo código.';
      case 'error':
        return 'Erro ao gerar QR Code. Tente novamente.';
    }
  };  const getStatusColor = () => {
    switch (qrStatus) {
      case 'waiting':
        return 'bg-slate-800/50 border-blue-800/50';
      case 'generated':
        return 'bg-slate-800/50 border-green-800/50';
      case 'scanned':
        return 'bg-slate-800/50 border-green-800/50';
      case 'expired':
      case 'error':
        return 'bg-slate-800/50 border-red-800/50';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };  // Conteúdo do modal
  const modalContent = (
    <div className="space-y-4 max-w-xl mx-auto">{/* Header compacto */}
      <div className="text-center space-y-2">
        <div className="relative mx-auto">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-md mx-auto">
            <QrCode className="w-7 h-7 text-white" />
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-bold text-blue-200">
            {botName}
          </h2>
          <p className="text-gray-300 text-xs">
            Conecte seu WhatsApp escaneando o código
          </p>
        </div>
      </div>      {/* Status aprimorado */}
      <div className={`rounded-lg border transition-all duration-300 ${getStatusColor()}`}>
        <div className="p-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-800/40">
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-100">{getStatusMessage()}</p>
              {qrStatus === 'generated' && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5 text-xs text-blue-300">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono font-bold">{formatTime(countdown)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>{/* QR Code Display compacto */}      <div className="flex flex-col items-center space-y-2">        {qrStatus === 'waiting' && (
          <div className="w-48 h-48 border-2 border-dashed border-blue-700/70 rounded-lg flex items-center justify-center bg-slate-800/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent animate-pulse"></div>
            <div className="text-center relative z-10">
              <div className="w-14 h-14 bg-blue-900/70 rounded-full flex items-center justify-center mb-3 mx-auto shadow-md border border-blue-700/40">
                <RefreshCw className="w-8 h-8 text-blue-300 animate-spin" />
              </div>
              <p className="text-blue-200 text-sm font-medium">
                Aguardando dados...
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Conectando servidor
              </p>
            </div>
          </div>
        )}        {qrStatus === 'generated' && qrCodeImage && (          <div className="relative group">
            <div className="w-48 h-48 bg-blue-950 rounded-lg p-2 shadow-lg border border-blue-800 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-slate-500"></div>
              </div>
              
              {/* QR Code */}
              <div className="relative z-10 w-full h-full bg-white rounded-md p-1 shadow-lg flex items-center justify-center">
                <img 
                  src={qrCodeImage} 
                  alt="QR Code para conexão WhatsApp"
                  className="w-44 h-44 object-contain"
                />
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            {/* Warning Overlay */}
            {countdown <= 30 && (
              <div className="absolute inset-0 bg-red-500/10 border-2 border-red-500 rounded-lg animate-pulse z-20">
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-sm px-2.5 py-1 rounded-full font-bold shadow-lg">
                  ⚠️ {countdown}s
                </div>
              </div>
            )}
          </div>
        )}        {qrStatus === 'scanned' && (
          <div className="w-48 h-48 border-2 border-green-500 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-950/80 to-blue-900/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-green-400/10 animate-pulse"></div>
            <div className="text-center relative z-10">
              <div className="relative mb-2">
                <div className="w-14 h-14 rounded-full bg-green-900/70 flex items-center justify-center mx-auto border border-green-500/50 shadow-md">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto animate-bounce" />
                </div>
                <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
              </div>
              <p className="text-green-300 font-bold text-base mb-1">✅ Conectado!</p>
              <p className="text-green-400 text-xs font-medium">WhatsApp vinculado</p>
              <div className="mt-2 flex justify-center">
                <div className="flex items-center gap-1.5 bg-green-900/50 px-2.5 py-0.5 rounded-full border border-green-500">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-xs font-semibold">Bot Online</span>
                </div>
              </div>
            </div>
          </div>
        )}        {(qrStatus === 'expired' || qrStatus === 'error') && (
          <div className="w-48 h-48 border-2 border-red-500 rounded-lg flex items-center justify-center bg-gradient-to-br from-slate-800/90 to-red-900/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-400/10"></div>
            <div className="text-center relative z-10">
              <div className="w-14 h-14 bg-red-900/60 rounded-full flex items-center justify-center mb-2 mx-auto border border-red-500/50 shadow-lg">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-300 font-bold text-base mb-1">
                {qrStatus === 'expired' ? '⏰ Expirado' : '❌ Erro'}
              </p>
              <p className="text-red-300 text-xs">
                {qrStatus === 'expired' ? 'Código expirou' : 'Falha na geração'}
              </p>
              <p className="text-red-400/90 text-xs mt-1 bg-red-950/60 px-2 py-0.5 rounded-full inline-block">
                {qrStatus === 'expired' ? 'Gere um novo código' : 'Tente novamente'}
              </p>
            </div>
          </div>
        )}
      </div>      {/* Instruções com tema escuro melhorado */}
      <div className="bg-blue-950/60 border border-blue-800/60 rounded-lg p-2.5 shadow-md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-700/70 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <Smartphone className="w-4 h-4 text-blue-200" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-blue-200 mb-1.5 text-xs">📱 Como conectar seu WhatsApp:</p>
            <div className="space-y-1.5">
              {[
                'Abra o WhatsApp no seu celular',
                'Toque nos 3 pontos (menu superior)',
                'Selecione "Aparelhos conectados"',
                'Toque em "Conectar um aparelho"',
                'Aponte a câmera para este QR Code'
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-700/50 text-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-gray-300 text-xs">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>      {/* Ações melhoradas e mais visíveis */}
      <div className="space-y-4 mt-2">
        <div className="flex gap-3">
          {(qrStatus === 'expired' || qrStatus === 'error') && (
            <Button 
              onClick={generateNewQR} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg border border-blue-500" 
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Gerar Novo QR Code
            </Button>
          )}
          
          {qrStatus === 'generated' && qrCodeData && (
            <>                <Button 
                variant="outline" 
                onClick={copyQRData} 
                size="default" 
                className="flex-1 border border-blue-800 text-blue-300 hover:bg-blue-900 hover:text-white"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Dados
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadQRCode} 
                size="default" 
                className="flex-1 border border-blue-800 text-blue-300 hover:bg-blue-900 hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Imagem
              </Button>
            </>
          )}
          
          {qrStatus === 'scanned' && (
            <Button 
              onClick={onClose} 
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg border border-green-500" 
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          )}
        </div>
        
        {/* Info adicional */}
        {qrStatus === 'generated' && (
          <div className="text-center">
            <p className="text-xs text-blue-300 font-medium bg-blue-950/40 py-1.5 px-3 rounded-full inline-block border border-blue-900/50">
              ⏱️ O QR Code expira em {formatTime(countdown)} por segurança
            </p>
          </div>
        )}
      </div>
    </div>
  );
  // Se for modo embutido, retornar apenas o conteúdo
  if (isEmbedded) {
    return (
      <div className="h-full glass-card border-0 overflow-hidden flex flex-col">
        <div className="pb-3 border-b border-border/50 glass-effect flex flex-col gap-2 flex-shrink-0 p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              <span className="gradient-text text-sm">QR Code - {botName}</span>
            </div>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {modalContent}
        </div>
      </div>
    );
  }  // Modo modal normal
  return (
    <DraggableModal 
      isOpen={isOpen} 
      onClose={onClose}
      title={`QR Code - ${botName}`}
      size="xl"
      defaultPosition={{ x: -385, y: -25 }}
    >
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-blue-950 via-slate-950 to-blue-900 rounded-xl shadow-inner" />
      </div>
      <div className="relative z-10 flex flex-col h-full min-h-[500px] w-full">
        <div className="flex-1 flex flex-col justify-between px-6 py-6">
          {modalContent}
        </div>
      </div>
    </DraggableModal>
  );
};
