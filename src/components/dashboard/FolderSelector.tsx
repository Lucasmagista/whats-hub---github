import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Folder, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { useFolderValidator } from '@/hooks/useFolderValidator';

interface ValidationResult {
  isValid: boolean;
  projectType: string;
  recommendedStartMode: string;
  hasTypeScript: boolean;
  hasDocker: boolean;
  hasEnvFile: boolean;
  hasNodeModules: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  folderPath: string;
  foundFiles: string[];
}

interface FolderValidationState {
  step: string;
  progress: number;
  files: string[];
  success: boolean;
  message: string;
}

interface FolderSelectorProps {
  value: string;
  onChange: (path: string) => void;
  onValidated?: (result: ValidationResult) => void;
  required?: boolean;
  error?: string;
}

export const FolderSelector: React.FC<FolderSelectorProps> = ({ 
  value, 
  onChange, 
  onValidated,
  required = false,
  error 
}) => {
  const { isLoading, validation, validateFolder, clearValidation } = useFolderValidator();  // Função para determinar a classe CSS da barra de progresso
  const getProgressBarClass = (validation: FolderValidationState) => {
    if (validation.success) return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
    if (validation.progress === 100) return 'bg-gradient-to-r from-red-400 to-red-500';
    return 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600';
  };

  // Função para determinar a classe CSS do input
  const getInputClass = () => {
    if (error) return 'font-mono border-red-500';
    if (validation?.success) return 'font-mono border-green-400';
    return 'font-mono';
  };

  // Função para renderizar o ícone de status
  const renderStatusIcon = () => {
    if (isLoading) {
      return (
        <div className="relative">
          <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
          <div className="absolute inset-0 h-6 w-6 border-2 border-blue-200 rounded-full animate-pulse opacity-50"></div>
        </div>
      );
    }
    
    if (validation?.success) {
      return (
        <div className="relative">
          <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center animate-bounceIn">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
          <div className="absolute inset-0 h-6 w-6 border-2 border-green-300 rounded-full animate-ping opacity-30"></div>
        </div>
      );
    }
    
    return (
      <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
        <X className="h-3 w-3 text-white" />
      </div>
    );
  };

  const handleFolderSelect = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const folderPath = files[0].webkitRelativePath.split('/')[0];
        
        try {
          // Atualizar o valor imediatamente para feedback visual
          onChange(folderPath);
          
          // Executar validação
          const result = await validateFolder(files, folderPath);
          
          // Callback com resultado da validação
          if (onValidated) {
            onValidated(result);
          }
        } catch (error) {
          console.error('Erro na validação:', error);
        }
      }
    };
    input.click();
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="folderPath" className="text-base font-medium flex items-center gap-2">
        📁 Caminho da Pasta do Bot
        {required && (
          <>
            <span className="text-red-500">*</span>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">OBRIGATÓRIO</span>
          </>
        )}
      </Label>
      
      <div className="flex gap-2">
        <Input
          id="folderPath"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="C:\\bots\\meu-bot ou /home/user/bots/meu-bot"
          className={getInputClass()}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleFolderSelect}
          disabled={isLoading}
          className="shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Folder className="h-4 w-4 mr-2" />
              Selecionar
            </>
          )}
        </Button>
      </div>

      {/* Componente de Loading/Validação */}
      {(isLoading || validation) && (
        <div className="p-6 border rounded-xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-slate-600 shadow-lg animate-fadeIn">
          <div className="space-y-4">            {/* Header do status com animação */}
            <div className="flex items-center gap-3">
              {renderStatusIcon()}
              <div className="flex-1"><span className="font-semibold text-slate-100 text-sm">
                  {validation?.step ?? 'Iniciando análise...'}
                </span>
                {validation && validation.progress < 100 && (
                  <div className="text-xs text-slate-300 mt-1">
                    Analisando estrutura do projeto...
                  </div>
                )}
              </div>
            </div>

            {/* Barra de progresso */}
            {validation && (
              <div className="space-y-2">                <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full dynamic-progress-bar relative overflow-hidden ${getProgressBarClass(validation)}`}
                    data-progress={validation.progress}
                  >
                    {validation.progress < 100 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
                    )}
                  </div>
                </div>                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-medium">{validation.progress}% concluído</span>
                  <span>{validation.files.length} itens encontrados</span>
                </div>
              </div>
            )}

            {/* Lista de arquivos encontrados */}
            {validation && validation.files.length > 0 && (
              <div className="space-y-2">                <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  Arquivos detectados:
                </div>
                <div className="max-h-32 overflow-y-auto bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-slate-500 shadow-inner custom-scrollbar">                  {validation.files.slice(0, 12).map((file, index) => (
                    <div 
                      key={`file-${file.replace(/[^a-zA-Z0-9]/g, '')}-${index}`}
                      className={`py-1.5 border-b border-slate-600 last:border-0 text-xs font-mono animate-fadeIn-delay-${Math.min(index, 11)} text-slate-200`}
                    >
                      {file}
                    </div>
                  ))}
                  {validation.files.length > 12 && (                    <div className="text-slate-400 italic py-1.5 text-xs">
                      ... e mais {validation.files.length - 12} arquivos
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mensagem final */}
            {validation && validation.progress === 100 && (              <div className={`p-4 rounded-lg text-sm whitespace-pre-line border-l-4 ${
                validation.success 
                  ? 'bg-emerald-900/30 text-emerald-100 border-emerald-400 shadow-lg shadow-emerald-100' 
                  : 'bg-red-900/30 text-red-100 border-red-400 shadow-lg shadow-red-100'
              }`}>
                {validation.message}
              </div>
            )}

            {/* Botões de ação */}
            {validation && validation.progress === 100 && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearValidation}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3 mr-1" />
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-green-50 border border-green-200 p-3 rounded">
        <p className="text-sm text-green-700 font-medium">
          📁 <strong>PASSO 1:</strong> Selecione a pasta onde está o código do seu bot
        </p>
        <p className="text-xs text-green-600 mt-1">
          Esta é a pasta que contém arquivos como package.json, index.js, etc.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
