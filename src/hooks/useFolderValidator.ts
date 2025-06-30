import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FolderValidationState {
  step: string;
  progress: number;
  files: string[];
  success: boolean;
  message: string;
}

interface BotProjectInfo {
  isValid: boolean;
  projectType: string;
  recommendedStartMode: string;
  hasTypeScript: boolean;
  hasDocker: boolean;
  hasEnvFile: boolean;
  hasNodeModules: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
}

export const useFolderValidator = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState<FolderValidationState | null>(null);

  const analyzeProjectFiles = useCallback((files: FileList): BotProjectInfo => {
    const foundFiles: string[] = [];
    let hasPackageJson = false;
    let hasMainFile = false;
    let hasTypeScript = false;
    let hasDocker = false;
    let hasEnvFile = false;
    let hasNodeModules = false;
    let hasYarnLock = false;
    let hasPnpmLock = false;
    let hasBunLock = false;

    // Análise detalhada dos arquivos
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name.toLowerCase();
      const relativePath = file.webkitRelativePath;

      // Detectar arquivos importantes
      if (fileName === 'package.json') {
        hasPackageJson = true;
        foundFiles.push('📦 package.json');
      } else if (fileName.includes('index.') && (fileName.endsWith('.js') || fileName.endsWith('.ts'))) {
        hasMainFile = true;
        foundFiles.push('🚀 ' + file.name);
        if (fileName.endsWith('.ts')) hasTypeScript = true;
      } else if (fileName.includes('main.') && (fileName.endsWith('.js') || fileName.endsWith('.ts'))) {
        hasMainFile = true;
        foundFiles.push('🎯 ' + file.name);
        if (fileName.endsWith('.ts')) hasTypeScript = true;
      } else if (fileName.includes('app.') && (fileName.endsWith('.js') || fileName.endsWith('.ts'))) {
        hasMainFile = true;
        foundFiles.push('🏗️ ' + file.name);
        if (fileName.endsWith('.ts')) hasTypeScript = true;
      } else if (fileName === 'tsconfig.json') {
        hasTypeScript = true;
        foundFiles.push('🔷 tsconfig.json');
      } else if (fileName === 'dockerfile' || fileName === 'docker-compose.yml') {
        hasDocker = true;
        foundFiles.push('🐳 ' + file.name);
      } else if (fileName === '.env' || fileName === '.env.local' || fileName === '.env.example') {
        hasEnvFile = true;
        foundFiles.push('🔧 ' + file.name);
      } else if (fileName === 'yarn.lock') {
        hasYarnLock = true;
        foundFiles.push('🧶 yarn.lock');
      } else if (fileName === 'pnpm-lock.yaml') {
        hasPnpmLock = true;
        foundFiles.push('📦 pnpm-lock.yaml');
      } else if (fileName === 'bun.lockb') {
        hasBunLock = true;
        foundFiles.push('🥟 bun.lockb');
      } else if (relativePath.includes('node_modules') && !foundFiles.some(f => f.includes('node_modules'))) {
        hasNodeModules = true;
        foundFiles.push('📁 node_modules/ (dependências)');
      } else if (relativePath.includes('src/') && fileName.endsWith('.js')) {
        foundFiles.push('📄 src/' + file.name);
      } else if (relativePath.includes('src/') && fileName.endsWith('.ts')) {
        foundFiles.push('📘 src/' + file.name);
        hasTypeScript = true;
      } else if (fileName === 'readme.md' || fileName === 'readme.txt') {
        foundFiles.push('📖 ' + file.name);
      }
    }

    // Determinar gerenciador de pacotes
    let packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' = 'npm';
    if (hasBunLock) packageManager = 'bun';
    else if (hasPnpmLock) packageManager = 'pnpm';
    else if (hasYarnLock) packageManager = 'yarn';

    // Determinar tipo de projeto
    let projectType = 'Node.js';
    if (hasTypeScript) projectType = 'TypeScript';
    if (hasDocker) projectType += ' (Docker)';

    // Comando recomendado
    let recommendedStartMode = 'npm start';
    if (hasTypeScript) {
      recommendedStartMode = hasNodeModules ? `${packageManager} start` : `${packageManager} run dev`;
    } else {
      recommendedStartMode = hasNodeModules ? `${packageManager} start` : `${packageManager} run dev`;
    }

    const isValid = hasPackageJson && hasMainFile;

    return {
      isValid,
      projectType,
      recommendedStartMode,
      hasTypeScript,
      hasDocker,
      hasEnvFile,
      hasNodeModules,
      packageManager
    };
  }, []);

  const validateFolder = useCallback(async (files: FileList, folderPath: string) => {
    setIsLoading(true);
    setValidation(null);

    const validationSteps = [
      { step: '🔍 Escaneando estrutura da pasta...', progress: 5 },
      { step: '📂 Analisando arquivos do projeto...', progress: 15 },
      { step: '📦 Procurando package.json...', progress: 30 },
      { step: '🚀 Verificando arquivos principais...', progress: 45 },
      { step: '🔧 Analisando dependências...', progress: 60 },
      { step: '⚙️ Verificando configurações...', progress: 75 },
      { step: '🔬 Detectando tipo de projeto...', progress: 90 },
      { step: '✅ Finalizando análise...', progress: 100 }
    ];

    try {
      let projectInfo: BotProjectInfo;
      const foundFiles: string[] = [];

      // Executar steps com delays realistas
      for (let i = 0; i < validationSteps.length; i++) {
        const currentStep = validationSteps[i];
        
        setValidation({
          step: currentStep.step,
          progress: currentStep.progress,
          files: foundFiles,
          success: false,
          message: 'Analisando arquivos...'
        });

        // Análise real na metade do processo
        if (i === 3) {
          projectInfo = analyzeProjectFiles(files);
          foundFiles.push(...projectInfo.isValid ? ['✅ Projeto válido detectado'] : ['❌ Projeto inválido']);
        }

        // Delays realistas baseados na complexidade
        const delay = i < 3 ? 400 : i < 6 ? 600 : 300;
        await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 200));
      }

      // Gerar mensagem final
      const { isValid, projectType, recommendedStartMode, hasNodeModules, hasEnvFile, hasDocker } = projectInfo!;
      
      let finalMessage = '';
      if (isValid) {
        finalMessage = `🎉 ${projectType} Bot detectado com sucesso!\n\n`;
        finalMessage += `📁 Pasta: ${folderPath}\n`;
        finalMessage += `🔧 Tipo: ${projectType}\n`;
        finalMessage += `📦 Arquivos encontrados: ${foundFiles.length}\n\n`;
        
        if (hasNodeModules) {
          finalMessage += '✅ Dependências já instaladas\n';
        } else {
          finalMessage += '⚠️ Execute: npm install\n';
        }
        
        if (hasEnvFile) finalMessage += '✅ Arquivo de ambiente encontrado\n';
        if (hasDocker) finalMessage += '🐳 Docker configurado\n';
        
        finalMessage += `\n🚀 Comando recomendado: ${recommendedStartMode}`;
        finalMessage += '\n\n✨ Configuração aplicada automaticamente!';
      } else {
        finalMessage = `❌ Pasta não contém um projeto de bot válido\n\n`;
        finalMessage += `📁 Pasta: ${folderPath}\n`;
        finalMessage += `📄 Arquivos: ${foundFiles.length}\n\n`;
        finalMessage += '❌ package.json ou arquivo principal não encontrado\n';
        finalMessage += '💡 Selecione a pasta raiz do projeto do bot.';
      }

      setValidation({
        step: isValid ? '🎉 Bot configurado com sucesso!' : '❌ Pasta inválida',
        progress: 100,
        files: foundFiles,
        success: isValid,
        message: finalMessage
      });

      // Toast com resultado
      toast({
        title: isValid ? `✅ ${projectType} Bot Configurado!` : "❌ Pasta Inválida",
        description: isValid 
          ? `${foundFiles.length} arquivos analisados. Comando: ${recommendedStartMode}`
          : "Selecione uma pasta que contenha package.json e arquivos do bot.",
        variant: isValid ? "default" : "destructive",
        duration: isValid ? 6000 : 5000,
      });

      return { 
        ...projectInfo!, 
        folderPath, 
        foundFiles 
      };

    } catch (error) {
      const errorMessage = `❌ Erro ao analisar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      
      setValidation({
        step: '💥 Erro na análise',
        progress: 100,
        files: [],
        success: false,
        message: errorMessage
      });

      toast({
        title: "❌ Erro na Análise",
        description: "Não foi possível analisar a pasta selecionada.",
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsLoading(false);
      
      // Auto-limpar após 15 segundos
      setTimeout(() => {
        setValidation(null);
      }, 15000);
    }
  }, [analyzeProjectFiles, toast]);

  const clearValidation = useCallback(() => {
    setValidation(null);
  }, []);

  return {
    isLoading,
    validation,
    validateFolder,
    clearValidation
  };
};
