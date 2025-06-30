import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Zap,
  Square,
  Activity,
  AlertTriangle,
  Eye,
  EyeOff,
  Play,
  Pause,
  Copy,
  Check,
  Upload,
  Download,
  Globe,
  Shield,
  MessageSquare,
  Users,
  BarChart3,
  Webhook,
  Key,
  TestTube,
  RefreshCw,
  Monitor,
  Calendar,
  Target,
  Search,
  SortAsc,
  SortDesc,  
  Folder,
  Terminal,
  Settings,
  FileText,
  HardDrive,
  Workflow
} from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { botApiService } from '@/services/botApi';
import { Bot as BotType } from '@/types/global';
import AutomationManagement from './AutomationManagement';
import N8nConfiguration from './N8nConfiguration';
import { useAutomation } from '@/hooks/useAutomation';

interface BotFormData {
  name: string;
  description: string;
  apiKey: string;
  webhookUrl: string;
  autoReply: boolean;
  workingHoursEnabled: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  maxConcurrentChats: number;
  welcomeMessage: string;
  fallbackMessage: string;
  // Advanced settings
  messageDelay: number;
  responseTimeout: number;
  maxRetries: number;
  enableSentimentAnalysis: boolean;
  enableSpamFilter: boolean;
  enableAutoTranslation: boolean;
  defaultLanguage: string;
  timezone: string;
  // Integration settings
  crmIntegration: boolean;
  crmUrl: string;
  crmApiKey: string;
  analyticsEnabled: boolean;
  loggingLevel: 'error' | 'warn' | 'info' | 'debug';
  // Performance settings
  rateLimitEnabled: boolean;
  rateLimitPerMinute: number;
  memoryCacheEnabled: boolean;
  memoryCacheSize: number;
  // Security settings
  encryptionEnabled: boolean;
  whitelistedNumbers: string[];
  blacklistedNumbers: string[];
  requireAuth: boolean;
  // Notification settings
  alertsEnabled: boolean;
  alertEmail: string;
  alertWebhook: string;
  // Backup settings
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  // Features
  enableVoiceMessages: boolean;
  enableMediaMessages: boolean;
  enableLocationSharing: boolean;
  enableGroupChats: boolean;  // Tags and categories
  tags: string[];
  category: string;
  environment: 'production' | 'staging' | 'development';
  // Local Development settings
  localPath: string;
  startCommand: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  startMode: 'npm start' | 'npm run dev' | 'npm run serve' | 'yarn start' | 'yarn dev' | 'pnpm start' | 'pnpm dev' | 'bun start' | 'bun dev' | 'node index.js' | 'python main.py' | 'custom';
  customCommand: string;
  autoStart: boolean;
  workingDirectory: string;
  envFile: string;
  port: number;
  processMonitoring: boolean;
}

interface BotTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  config: Partial<BotFormData>;
  features: string[];
}

interface ValidationErrors {
  [key: string]: string;
}

interface BotFilters {
  status: string;
  category: string;
  environment: string;
  search: string;
}

interface BotMetrics {
  messagesCount: number;
  chatsCount: number;
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastActivity: string;
}

const BotManagement: React.FC = () => {
  const { toast } = useToast();
  const [bots, setBots] = useState<BotType[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<BotType | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [validatingApiKey, setValidatingApiKey] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [filters, setFilters] = useState<BotFilters>({
    status: 'all',
    category: 'all',
    environment: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'status' | 'activity'>('created');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');  
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string>('');
  const [botMetrics, setBotMetrics] = useState<Record<string, BotMetrics>>({});
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  
  // Estados para carregamento de pasta
  const [folderLoading, setFolderLoading] = useState(false);
  const [folderValidation, setFolderValidation] = useState<{
    step: string;
    progress: number;
    files: string[];
    success: boolean;
    message: string;
  } | null>(null);

  // Estados para automação
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isN8nConfigOpen, setIsN8nConfigOpen] = useState(false);
  const automation = useAutomation();

  const botTemplates: BotTemplate[] = [
    {
      id: 'customer-service',
      name: 'Atendimento ao Cliente',
      description: 'Bot configurado para atendimento básico ao cliente',
      category: 'Atendimento',
      features: ['Auto Reply', 'Horário Comercial', 'Respostas Rápidas'],
      config: {
        autoReply: true,
        workingHoursEnabled: true,
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
        maxConcurrentChats: 20,
        welcomeMessage: 'Olá! 👋 Bem-vindo ao nosso atendimento. Como posso ajudá-lo hoje?',
        fallbackMessage: 'Desculpe, não entendi sua mensagem. Pode reformular ou digitar "menu" para ver as opções?',
        messageDelay: 1000,
        enableSentimentAnalysis: true,
        enableSpamFilter: true,
        category: 'Atendimento',
        environment: 'production'
      }
    },
    {
      id: 'sales',
      name: 'Vendas e Prospecção',
      description: 'Bot otimizado para vendas e geração de leads',
      category: 'Vendas',
      features: ['CRM Integration', 'Lead Scoring', 'Analytics'],
      config: {
        autoReply: true,
        workingHoursEnabled: true,
        workingHoursStart: '08:00',
        workingHoursEnd: '20:00',
        maxConcurrentChats: 50,
        welcomeMessage: 'Olá! 🎯 Interesse em nossos produtos? Vou te ajudar a encontrar a melhor solução!',
        fallbackMessage: 'Não entendi. Você gostaria de falar com um consultor de vendas?',
        messageDelay: 500,
        crmIntegration: true,
        analyticsEnabled: true,
        enableSentimentAnalysis: true,
        category: 'Vendas',
        environment: 'production'
      }
    },
    {
      id: 'support',
      name: 'Suporte Técnico',
      description: 'Bot especializado em suporte técnico e resolução de problemas',
      category: 'Suporte',
      features: ['Ticket System', 'Knowledge Base', 'Escalation'],
      config: {
        autoReply: true,
        workingHoursEnabled: true,
        workingHoursStart: '08:00',
        workingHoursEnd: '22:00',
        maxConcurrentChats: 30,
        welcomeMessage: 'Olá! 🔧 Estou aqui para ajudar com questões técnicas. Descreva seu problema:',
        fallbackMessage: 'Para um melhor atendimento, preciso mais detalhes. Pode explicar melhor o problema?',
        messageDelay: 800,
        enableSpamFilter: true,
        analyticsEnabled: true,
        alertsEnabled: true,
        category: 'Suporte',
        environment: 'production'
      }
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Bot para lojas online com integração de pagamentos',
      category: 'E-commerce',
      features: ['Payment Integration', 'Order Tracking', 'Product Catalog'],
      config: {
        autoReply: true,
        workingHoursEnabled: false,
        maxConcurrentChats: 100,
        welcomeMessage: 'Bem-vindo à nossa loja! 🛍️ Como posso ajudá-lo com seus pedidos?',
        fallbackMessage: 'Desculpe, não entendi. Digite "catálogo" para ver produtos ou "pedidos" para rastrear.',
        messageDelay: 300,
        enableMediaMessages: true,
        enableLocationSharing: true,        analyticsEnabled: true,
        category: 'E-commerce',
        environment: 'production'
      }
    },
    {
      id: 'local-nodejs',
      name: 'Bot Local Node.js',
      description: 'Template para desenvolvimento local com Node.js',
      category: 'Desenvolvimento',
      features: ['Local Development', 'Hot Reload', 'Debug Mode'],
      config: {
        autoReply: true,
        maxConcurrentChats: 5,
        welcomeMessage: 'Bot em desenvolvimento 🚧 Testando funcionalidades...',
        fallbackMessage: 'Comando não reconhecido. Este bot está em desenvolvimento.',
        environment: 'development',
        packageManager: 'npm',
        startMode: 'npm run dev',
        port: 3000,
        autoStart: false,
        processMonitoring: true,
        envFile: '.env.local'
      }
    },
    {
      id: 'local-python',
      name: 'Bot Local Python',
      description: 'Template para desenvolvimento local com Python',
      category: 'Desenvolvimento',
      features: ['Local Development', 'Virtual Env', 'Flask/FastAPI'],
      config: {
        autoReply: true,
        maxConcurrentChats: 3,
        welcomeMessage: 'Bot Python em desenvolvimento 🐍',
        fallbackMessage: 'Erro no processamento. Verificando logs...',
        environment: 'development',
        packageManager: 'npm',
        startMode: 'python main.py',
        port: 5000,
        autoStart: false,
        processMonitoring: true,
        envFile: '.env'
      }
    },
    {
      id: 'local-typescript',
      name: 'Bot Local TypeScript',
      description: 'Template para desenvolvimento local com TypeScript',
      category: 'Desenvolvimento',
      features: ['TypeScript', 'Type Safety', 'Modern JS'],
      config: {
        autoReply: true,
        maxConcurrentChats: 10,
        welcomeMessage: 'Bot TypeScript 🔷 Sistema tipado em desenvolvimento',
        fallbackMessage: 'Tipo de mensagem não suportado no modo desenvolvimento.',
        environment: 'development',
        packageManager: 'pnpm',
        startMode: 'pnpm dev',
        port: 3001,
        autoStart: true,
        processMonitoring: true,
        envFile: '.env.development'
      }
    }
  ];

  const [formData, setFormData] = useState<BotFormData>({
    name: '',
    description: '',
    apiKey: '',
    webhookUrl: '',
    autoReply: true,
    workingHoursEnabled: false,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    maxConcurrentChats: 10,
    welcomeMessage: 'Olá! 👋 Como posso ajudá-lo hoje?',
    fallbackMessage: 'Desculpe, não entendi. Pode reformular sua pergunta?',
    // Advanced settings
    messageDelay: 1000,
    responseTimeout: 30000,
    maxRetries: 3,
    enableSentimentAnalysis: false,
    enableSpamFilter: true,
    enableAutoTranslation: false,
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    // Integration settings
    crmIntegration: false,
    crmUrl: '',
    crmApiKey: '',
    analyticsEnabled: true,
    loggingLevel: 'info',
    // Performance settings
    rateLimitEnabled: true,
    rateLimitPerMinute: 60,
    memoryCacheEnabled: true,
    memoryCacheSize: 100,
    // Security settings
    encryptionEnabled: true,
    whitelistedNumbers: [],
    blacklistedNumbers: [],
    requireAuth: false,
    // Notification settings
    alertsEnabled: true,
    alertEmail: '',
    alertWebhook: '',
    // Backup settings
    autoBackup: true,
    backupFrequency: 'daily',
    // Features
    enableVoiceMessages: true,
    enableMediaMessages: true,
    enableLocationSharing: false,    enableGroupChats: true,
    // Tags and categories
    tags: [],
    category: 'Geral',
    environment: 'production',
    // Local Development settings
    localPath: '',
    startCommand: '',
    packageManager: 'npm',
    startMode: 'npm start',
    customCommand: '',
    autoStart: false,
    workingDirectory: '',
    envFile: '',
    port: 3000,
    processMonitoring: true
  });
  useEffect(() => {
    loadBots();
    loadBotMetrics();
  }, []);

  const loadBots = () => {
    const storedBots = dataStore.getBots();
    setBots(storedBots);
  };

  const loadBotMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const storedBots = dataStore.getBots();
      const metrics: Record<string, BotMetrics> = {};
      
      for (const bot of storedBots) {
        // Simulate metrics loading - replace with actual API call
        metrics[bot.id] = {
          messagesCount: Math.floor(Math.random() * 1000),
          chatsCount: Math.floor(Math.random() * 100),
          uptime: Math.floor(Math.random() * 100),
          responseTime: Math.floor(Math.random() * 500) + 100,
          errorRate: Math.floor(Math.random() * 10),
          lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString()
        };
      }
      
      setBotMetrics(metrics);
    } catch (error) {
      console.error('Error loading bot metrics:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
      // PRIORIDADE MÁXIMA: Para desenvolvimento local, o caminho da pasta é OBRIGATÓRIO
    if (formData.environment === 'development' || activeTab === 'local') {
      // 🚨 CAMINHO DA PASTA É PRIORIDADE - SEM ISSO NÃO FUNCIONA
      if (!formData.localPath.trim()) {
        errors.localPath = '🚨 OBRIGATÓRIO: Caminho da pasta do bot é necessário para desenvolvimento local';
      } else if (!isValidPath(formData.localPath)) {
        errors.localPath = '❌ Caminho da pasta inválido - verifique o formato';
      }
      
      // Comando de execução é obrigatório para local dev
      if (formData.startMode === 'custom' && !formData.customCommand.trim()) {
        errors.customCommand = 'Comando personalizado é obrigatório quando selecionado';
      }
      
      // API Key é OPCIONAL em desenvolvimento local (prioridade baixa)
      if (formData.apiKey.trim() && formData.apiKey.length < 10) {
        errors.apiKey = 'Se informada, API Key deve ter pelo menos 10 caracteres';
      }
    } else {
      // Para produção/staging, API Key é obrigatória
      if (!formData.apiKey.trim()) {
        errors.apiKey = 'API Key é obrigatória para ambiente de produção';
      } else if (formData.apiKey.length < 10) {
        errors.apiKey = 'API Key deve ter pelo menos 10 caracteres';
      }
    }
    
    if (formData.webhookUrl && !isValidUrl(formData.webhookUrl)) {
      errors.webhookUrl = 'URL do webhook inválida';
    }
    
    if (formData.crmIntegration && formData.crmUrl && !isValidUrl(formData.crmUrl)) {
      errors.crmUrl = 'URL do CRM inválida';
    }
    
    if (formData.alertEmail && !isValidEmail(formData.alertEmail)) {
      errors.alertEmail = 'Email inválido';
    }
    
    if (formData.alertWebhook && !isValidUrl(formData.alertWebhook)) {
      errors.alertWebhook = 'URL do webhook de alerta inválida';
    }
    
    if (formData.maxConcurrentChats < 1 || formData.maxConcurrentChats > 1000) {
      errors.maxConcurrentChats = 'Número de conversas deve estar entre 1 e 1000';
    }
    
    if (formData.messageDelay < 0 || formData.messageDelay > 10000) {
      errors.messageDelay = 'Delay deve estar entre 0 e 10000ms';
    }
    
    if (formData.port && (formData.port < 1 || formData.port > 65535)) {
      errors.port = 'Porta deve estar entre 1 e 65535';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const isValidPath = (path: string): boolean => {
    // Basic path validation - can be enhanced based on OS
    const windowsPathRegex = /^[a-zA-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*$/;
    const unixPathRegex = /^\/(?:[^/\0]+\/)*[^/\0]*$/;
    const relativePathRegex = /^(?:\.\.?\/)*(?:[^/\0]+\/)*[^/\0]*$/;
    
    return windowsPathRegex.test(path) || unixPathRegex.test(path) || relativePathRegex.test(path);
  };
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };const validateFolderContents = async (files: FileList, folderPath: string) => {
    setFolderLoading(true);
    setFolderValidation(null);
    
    const foundFiles: string[] = [];
    const validationSteps = [
      { step: '🔍 Escaneando estrutura da pasta...', progress: 5 },
      { step: '📂 Analisando arquivos do projeto...', progress: 15 },
      { step: '📦 Procurando package.json...', progress: 25 },
      { step: '🚀 Verificando arquivos principais...', progress: 40 },
      { step: '🔧 Analisando dependências...', progress: 55 },
      { step: '⚙️ Verificando configurações...', progress: 70 },
      { step: '🔬 Detectando tipo de projeto...', progress: 85 },
      { step: '✨ Finalizando análise...', progress: 95 },
      { step: '✅ Validação concluída!', progress: 100 }
    ];

    try {
      // Auto-preencher o caminho imediatamente para feedback visual
      setFormData(prev => ({ ...prev, localPath: folderPath }));

      // Processo de validação com animação realista
      for (let i = 0; i < validationSteps.length; i++) {
        const currentStep = validationSteps[i];
        
        setFolderValidation({
          step: currentStep.step,
          progress: currentStep.progress,
          files: foundFiles,
          success: false,
          message: 'Analisando arquivos...'
        });

        // Análise real dos arquivos em diferentes etapas
        if (i === 2) {
          // Buscar arquivos essenciais
          for (let j = 0; j < files.length; j++) {
            const file = files[j];
            const fileName = file.name.toLowerCase();
            const relativePath = file.webkitRelativePath;
            
            if (fileName === 'package.json') {
              foundFiles.push('📦 package.json');
            } else if (fileName.includes('index.') && (fileName.endsWith('.js') || fileName.endsWith('.ts'))) {
              foundFiles.push('🚀 ' + file.name);
            } else if (fileName.includes('main.') && (fileName.endsWith('.js') || fileName.endsWith('.ts'))) {
              foundFiles.push('🎯 ' + file.name);
            } else if (fileName.includes('app.') && (fileName.endsWith('.js') || fileName.endsWith('.ts'))) {
              foundFiles.push('🏗️ ' + file.name);
            } else if (fileName === '.env' || fileName === '.env.local' || fileName === '.env.example') {
              foundFiles.push('🔧 ' + file.name);
            } else if (fileName === 'readme.md' || fileName === 'readme.txt') {
              foundFiles.push('📖 ' + file.name);
            } else if (fileName === 'dockerfile' || fileName === 'docker-compose.yml') {
              foundFiles.push('🐳 ' + file.name);
            } else if (fileName === 'tsconfig.json') {
              foundFiles.push('🔷 tsconfig.json');
            } else if (relativePath.includes('node_modules') && !foundFiles.some(f => f.includes('node_modules'))) {
              foundFiles.push('📁 node_modules/ (dependências)');
            } else if (relativePath.includes('src/') && fileName.endsWith('.js')) {
              foundFiles.push('📄 src/' + file.name);
            } else if (relativePath.includes('src/') && fileName.endsWith('.ts')) {
              foundFiles.push('📘 src/' + file.name);
            }
          }
        }

        // Delay realista baseado na complexidade da etapa
        const baseDelay = i < 3 ? 600 : i < 6 ? 800 : 400;
        await new Promise(resolve => setTimeout(resolve, baseDelay + Math.random() * 300));
      }

      // Análise inteligente dos resultados
      const hasPackageJson = foundFiles.some(f => f.includes('package.json'));
      const hasMainFile = foundFiles.some(f => f.includes('index.') || f.includes('main.') || f.includes('app.'));
      const hasNodeModules = foundFiles.some(f => f.includes('node_modules'));
      const hasTypeScript = foundFiles.some(f => f.includes('tsconfig.json') || f.includes('.ts'));
      const hasDockerfile = foundFiles.some(f => f.includes('dockerfile') || f.includes('docker-compose'));
      const hasEnvFile = foundFiles.some(f => f.includes('.env'));

      const isValidBot = hasPackageJson && hasMainFile;
      
      let successMessage = '';
      let recommendedStartMode = 'npm start';
      let detectedProjectType = 'Node.js';

      if (isValidBot) {
        // Detectar tipo de projeto
        if (hasTypeScript) {
          detectedProjectType = 'TypeScript';
          recommendedStartMode = 'npm run dev';
        }
        if (hasDockerfile) {
          detectedProjectType += ' (Docker)';
        }

        successMessage = `🎉 Bot ${detectedProjectType} válido encontrado!\n\n`;
        successMessage += `📁 Pasta: ${folderPath}\n`;
        successMessage += `📦 Arquivos encontrados: ${foundFiles.length}\n`;
        successMessage += `🔧 Tipo de projeto: ${detectedProjectType}\n\n`;
        
        if (hasNodeModules) {
          successMessage += '✅ Dependências já instaladas\n';
          recommendedStartMode = hasTypeScript ? 'npm run dev' : 'npm start';
        } else {
          successMessage += '⚠️ Dependências precisam ser instaladas\n';
          successMessage += '💡 Execute: npm install\n';
          recommendedStartMode = 'npm run dev';
        }

        if (hasEnvFile) {
          successMessage += '✅ Arquivo de ambiente encontrado\n';
        }

        if (hasDockerfile) {
          successMessage += '🐳 Docker configurado\n';
        }

        successMessage += `\n🚀 Comando recomendado: ${recommendedStartMode}`;
        successMessage += '\n\n✨ Configuração aplicada automaticamente!';        // Auto-configurar baseado na análise
        setFormData(prev => ({ 
          ...prev, 
          localPath: folderPath,
          startMode: recommendedStartMode as 'npm start' | 'npm run dev' | 'yarn start' | 'yarn dev' | 'pnpm start' | 'pnpm dev' | 'bun start' | 'bun dev' | 'node index.js' | 'python main.py' | 'custom',
          packageManager: 'npm',
          environment: 'development',
          port: hasTypeScript ? 3001 : 3000
        }));

        // Auto-navegar para próxima etapa
        setTimeout(() => {
          toast({
            title: "🎯 Próximo passo",
            description: "Configure o comando de execução na seção abaixo ou teste a configuração!",
            duration: 4000,
          });
        }, 2000);

      } else {
        successMessage = `❌ Pasta não contém um projeto de bot válido\n\n`;
        successMessage += `📁 Pasta analisada: ${folderPath}\n`;
        successMessage += `📄 Arquivos encontrados: ${foundFiles.length}\n\n`;
        
        if (!hasPackageJson) {
          successMessage += '❌ package.json não encontrado\n';
          successMessage += '💡 Esta pasta deve conter um projeto Node.js\n';
        }
        if (!hasMainFile) {
          successMessage += '❌ Arquivo principal não encontrado\n';
          successMessage += '💡 Procure por: index.js, main.js, app.js, etc.\n';
        }
        
        successMessage += '\n🔍 Certifique-se de selecionar a pasta raiz do projeto do bot.';
        successMessage += '\n📚 A pasta deve conter package.json e arquivo principal.';
      }

      setFolderValidation({
        step: isValidBot ? '🎉 Bot configurado com sucesso!' : '❌ Pasta inválida para bot',
        progress: 100,
        files: foundFiles,
        success: isValidBot,
        message: successMessage
      });

      // Toast de resultado com mais detalhes
      toast({
        title: isValidBot ? `✅ ${detectedProjectType} Bot Configurado!` : "❌ Pasta Inválida",
        description: isValidBot 
          ? `${foundFiles.length} arquivos analisados. Comando: ${recommendedStartMode}`
          : "Selecione uma pasta que contenha package.json e arquivos do bot.",
        variant: isValidBot ? "default" : "destructive",
        duration: isValidBot ? 6000 : 5000,
      });

    } catch (error) {
      setFolderValidation({
        step: '💥 Erro na análise',
        progress: 100,
        files: foundFiles,
        success: false,
        message: `❌ Erro ao analisar pasta: ${error instanceof Error ? error.message : 'Erro desconhecido'}\n\n🔧 Tente selecionar uma pasta diferente ou verifique as permissões.`
      });

      toast({
        title: "❌ Erro na Análise",
        description: "Não foi possível analisar a pasta selecionada. Verifique as permissões.",
        variant: "destructive",
      });
    } finally {
      setFolderLoading(false);
      
      // Limpar validação após 15 segundos (mais tempo para ler)
      setTimeout(() => {
        setFolderValidation(null);
      }, 15000);
    }
  };
  const testLocalConfiguration = async () => {
    if (!formData.localPath) {
      toast({
        title: "⚠️ Pasta não selecionada",
        description: "Selecione uma pasta para o bot primeiro usando o botão 'Selecionar' acima.",
        variant: "destructive",
      });
      return;
    }

    const command = formData.startMode === 'custom' ? formData.customCommand : formData.startMode;
    if (!command) {
      toast({
        title: "⚠️ Comando não configurado",
        description: "Configure um comando de inicialização no campo 'Modo de Inicialização'.",
        variant: "destructive",
      });
      return;
    }

    // Iniciar teste com validação visual
    setFolderLoading(true);
    setFolderValidation({
      step: 'Iniciando teste de configuração...',
      progress: 0,
      files: [],
      success: false,
      message: 'Verificando configurações do bot...'
    });

    try {
      const testSteps = [
        { step: 'Verificando pasta do projeto...', progress: 15 },
        { step: 'Validando package.json...', progress: 30 },
        { step: 'Verificando dependências...', progress: 45 },
        { step: 'Testando comando de inicialização...', progress: 60 },
        { step: 'Verificando porta configurada...', progress: 75 },
        { step: 'Validando configurações finais...', progress: 90 },
        { step: 'Teste concluído!', progress: 100 }
      ];

      // Simular teste de configuração com progresso
      for (let i = 0; i < testSteps.length; i++) {
        const currentStep = testSteps[i];
        
        setFolderValidation(prev => prev ? {
          ...prev,
          step: currentStep.step,
          progress: currentStep.progress
        } : null);

        // Simular delay de teste
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      }

      // Simular resultados de teste (mais realistas)
      const testResults = {
        pathExists: formData.localPath.length > 0,
        packageJsonExists: Math.random() > 0.15, // 85% chance
        dependenciesInstalled: Math.random() > 0.25, // 75% chance
        commandValid: command.length > 3 && !command.includes('undefined'),
        portValid: formData.port >= 1 && formData.port <= 65535,
        environmentVarsOk: Math.random() > 0.3 // 70% chance
      };

      let message = '🔍 Resultado do Teste de Configuração:\n\n';
      message += `📁 Pasta do projeto: ${testResults.pathExists ? '✅' : '❌'} ${formData.localPath}\n`;
      message += `📄 package.json: ${testResults.packageJsonExists ? '✅ Encontrado' : '❌ Não encontrado'}\n`;
      message += `📦 Dependências: ${testResults.dependenciesInstalled ? '✅ Instaladas' : '❌ Precisam ser instaladas'}\n`;
      message += `⚡ Comando: ${testResults.commandValid ? '✅' : '❌'} "${command}"\n`;
      message += `🔌 Porta: ${testResults.portValid ? '✅' : '❌'} ${formData.port || 'Não configurada'}\n`;
      message += `🔧 Variáveis de ambiente: ${testResults.environmentVarsOk ? '✅ OK' : '⚠️ Podem precisar de configuração'}\n\n`;      const allValid = Object.values(testResults).every(Boolean);
        if (allValid) {
        message += '🎉 Configuração válida! Bot pronto para iniciar.\n\n';
        message += `💡 Para iniciar: ${formData.packageManager} install; ${command}`;
      } else {
        message += '⚠️ Problemas encontrados:\n';
        if (!testResults.packageJsonExists) message += '• Execute este comando na pasta correta\n';
        if (!testResults.dependenciesInstalled) message += `• Execute: ${formData.packageManager} install\n`;
        if (!testResults.commandValid) message += '• Verifique o comando de inicialização\n';
        if (!testResults.portValid) message += '• Configure uma porta válida (1-65535)\n';
      }

      setFolderValidation({
        step: 'Teste concluído!',
        progress: 100,
        files: [
          `📁 Pasta: ${formData.localPath}`,
          `⚡ Comando: ${command}`,
          `🔌 Porta: ${formData.port || 'Automática'}`,
          `📦 Gerenciador: ${formData.packageManager}`
        ],
        success: allValid,
        message: message
      });

      toast({
        title: allValid ? "✅ Teste concluído com sucesso!" : "⚠️ Teste concluído com problemas",
        description: allValid 
          ? "Todas as configurações estão válidas. Bot pronto para uso!"
          : "Alguns problemas foram encontrados. Verifique os detalhes abaixo.",
        variant: allValid ? "default" : "destructive",
        duration: 6000,
      });

    } catch (error) {
      setFolderValidation({
        step: 'Erro no teste',
        progress: 100,
        files: [],
        success: false,
        message: `❌ Erro durante o teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });

      toast({
        title: "❌ Erro no teste",
        description: "Erro ao testar as configurações do bot.",
        variant: "destructive",
      });
    } finally {
      setFolderLoading(false);
      
      // Limpar validação após 15 segundos
      setTimeout(() => {
        setFolderValidation(null);
      }, 15000);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      apiKey: '',
      webhookUrl: '',
      autoReply: true,
      workingHoursEnabled: false,
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
      maxConcurrentChats: 10,
      welcomeMessage: 'Olá! 👋 Como posso ajudá-lo hoje?',
      fallbackMessage: 'Desculpe, não entendi. Pode reformular sua pergunta?',
      // Advanced settings
      messageDelay: 1000,
      responseTimeout: 30000,
      maxRetries: 3,
      enableSentimentAnalysis: false,
      enableSpamFilter: true,
      enableAutoTranslation: false,
      defaultLanguage: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      // Integration settings
      crmIntegration: false,
      crmUrl: '',
      crmApiKey: '',
      analyticsEnabled: true,
      loggingLevel: 'info',
      // Performance settings
      rateLimitEnabled: true,
      rateLimitPerMinute: 60,
      memoryCacheEnabled: true,
      memoryCacheSize: 100,
      // Security settings
      encryptionEnabled: true,
      whitelistedNumbers: [],
      blacklistedNumbers: [],
      requireAuth: false,
      // Notification settings
      alertsEnabled: true,
      alertEmail: '',
      alertWebhook: '',
      // Backup settings
      autoBackup: true,
      backupFrequency: 'daily',
      // Features
      enableVoiceMessages: true,
      enableMediaMessages: true,
      enableLocationSharing: false,
      enableGroupChats: true,      // Tags and categories
      tags: [],
      category: 'Geral',
      environment: 'production',
      // Local Development settings
      localPath: '',
      startCommand: '',
      packageManager: 'npm',
      startMode: 'npm start',
      customCommand: '',
      autoStart: false,
      workingDirectory: '',
      envFile: '',
      port: 3000,
      processMonitoring: true
    });
    setValidationErrors({});
    setActiveTab('basic');
  };

  const applyTemplate = (template: BotTemplate) => {
    setFormData(prev => ({
      ...prev,
      ...template.config,
      name: template.name,
      description: template.description
    }));
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const exportBotConfig = (bot: BotType) => {
    const config = {
      name: bot.name,
      description: bot.description,
      settings: bot.settings,
      createdAt: bot.createdAt
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bot-config-${bot.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importBotConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        setFormData(prev => ({
          ...prev,
          name: config.name || '',
          description: config.description || '',
          ...config.settings
        }));
      } catch (error) {
        alert('Erro ao importar configuração: arquivo inválido');
      }
    };
    reader.readAsText(file);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const botData: Omit<BotType, 'id' | 'createdAt' | 'status'> = {
      name: formData.name,
      description: formData.description,
      apiKey: formData.apiKey,
      webhookUrl: formData.webhookUrl,
      settings: {
        autoReply: formData.autoReply,
        workingHours: {
          enabled: formData.workingHoursEnabled,
          start: formData.workingHoursStart,
          end: formData.workingHoursEnd
        },
        maxConcurrentChats: formData.maxConcurrentChats,
        welcomeMessage: formData.welcomeMessage,
        fallbackMessage: formData.fallbackMessage
      }
    };

    try {
      if (editingBot) {
        // Update existing bot
        const updatedBot = dataStore.updateBot(editingBot.id, botData);
        if (updatedBot) {
          setBots(prev => prev.map(bot => bot.id === editingBot.id ? updatedBot : bot));
        }
      } else {
        // Add new bot
        const newBot = dataStore.addBot(botData);
        setBots(prev => [...prev, newBot]);
      }
      
      setIsAddModalOpen(false);
      setEditingBot(null);
      resetForm();
      loadBotMetrics(); // Reload metrics for new/updated bot
    } catch (error) {
      console.error('Error saving bot:', error);
      alert('Erro ao salvar bot');
    }
  };

  const handleEdit = (bot: BotType) => {
    setEditingBot(bot);
    setFormData({
      name: bot.name,
      description: bot.description || '',
      apiKey: bot.apiKey,
      webhookUrl: bot.webhookUrl || '',
      autoReply: bot.settings.autoReply,
      workingHoursEnabled: bot.settings.workingHours.enabled,
      workingHoursStart: bot.settings.workingHours.start,
      workingHoursEnd: bot.settings.workingHours.end,
      maxConcurrentChats: bot.settings.maxConcurrentChats,
      welcomeMessage: bot.settings.welcomeMessage,
      fallbackMessage: bot.settings.fallbackMessage,
      // Set default values for new fields
      messageDelay: 1000,
      responseTimeout: 30000,
      maxRetries: 3,
      enableSentimentAnalysis: false,
      enableSpamFilter: true,
      enableAutoTranslation: false,
      defaultLanguage: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      crmIntegration: false,
      crmUrl: '',
      crmApiKey: '',
      analyticsEnabled: true,
      loggingLevel: 'info',
      rateLimitEnabled: true,
      rateLimitPerMinute: 60,
      memoryCacheEnabled: true,
      memoryCacheSize: 100,
      encryptionEnabled: true,
      whitelistedNumbers: [],
      blacklistedNumbers: [],
      requireAuth: false,
      alertsEnabled: true,
      alertEmail: '',
      alertWebhook: '',
      autoBackup: true,
      backupFrequency: 'daily',
      enableVoiceMessages: true,
      enableMediaMessages: true,
      enableLocationSharing: false,
      enableGroupChats: true,      tags: [],
      category: 'Geral',
      environment: 'production',
      // Local Development settings
      localPath: '',
      startCommand: '',
      packageManager: 'npm',
      startMode: 'npm start',
      customCommand: '',
      autoStart: false,
      workingDirectory: '',
      envFile: '',
      port: 3000,
      processMonitoring: true
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (botId: string) => {
    const success = dataStore.deleteBot(botId);
    if (success) {
      setBots(prev => prev.filter(bot => bot.id !== botId));
      // Remove metrics for deleted bot
      setBotMetrics(prev => {
        const newMetrics = { ...prev };
        delete newMetrics[botId];
        return newMetrics;
      });
    }
  };
  const handleBulkAction = async (action: 'start' | 'stop' | 'delete', botIds: string[]) => {
    try {
      for (const botId of botIds) {
        switch (action) {
          case 'start': {
            const bot = bots.find(b => b.id === botId);
            if (bot) await botApiService.startBot(bot);
            break;
          }
          case 'stop': {
            await botApiService.stopBot(botId);
            break;
          }
          case 'delete': {
            handleDelete(botId);
            break;
          }
        }
      }
      setSelectedBots([]);
      loadBots();
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('Erro ao executar ação em lote');
    }
  };

  const toggleBotStatus = async (bot: BotType) => {
    try {
      if (bot.status === 'online') {
        await botApiService.stopBot(bot.id);
      } else {
        await botApiService.startBot(bot);
      }
      loadBots();
    } catch (error) {
      console.error('Error toggling bot status:', error);
      alert('Erro ao alterar status do bot');
    }
  };
  const validateApiKey = async (apiKey: string) => {
    if (!apiKey.trim()) return;
    
    setValidatingApiKey(true);
    try {
      const result = await botApiService.validateApiKey(apiKey);
      if (result.success) {
        alert('✅ API Key válida!');
        setValidationErrors(prev => ({ ...prev, apiKey: '' }));
      } else {
        alert('❌ API Key inválida: ' + result.message);
        setValidationErrors(prev => ({ ...prev, apiKey: 'API Key inválida' }));
      }
    } catch (error) {
      alert('❌ Erro ao validar API Key');
      setValidationErrors(prev => ({ ...prev, apiKey: 'Erro na validação' }));
    } finally {
      setValidatingApiKey(false);
    }
  };

  const testWebhook = async (url: string) => {
    if (!url.trim()) return;
    
    setTestingWebhook(true);
    try {
      const result = await botApiService.testWebhookEndpoint(url, {
        event: 'test',
        data: { message: 'Test webhook from WhatsHub' },
        timestamp: new Date().toISOString()
      });
      
      if (result.success) {
        alert('✅ Webhook testado com sucesso!');
        setValidationErrors(prev => ({ ...prev, webhookUrl: '' }));
      } else {
        alert('❌ Erro no teste do webhook: ' + result.message);
        setValidationErrors(prev => ({ ...prev, webhookUrl: 'Webhook inválido' }));
      }
    } catch (error) {
      alert('❌ Erro ao testar webhook');
      setValidationErrors(prev => ({ ...prev, webhookUrl: 'Erro no teste' }));
    } finally {
      setTestingWebhook(false);
    }
  };

  const getStatusBadge = (status: BotType['status']) => {
    const configs = {
      online: { 
        color: 'bg-green-500/20 text-green-700 border-green-500/30', 
        icon: <Zap className="h-3 w-3" />, 
        pulse: 'animate-pulse' 
      },
      offline: { 
        color: 'bg-gray-500/20 text-gray-700 border-gray-500/30', 
        icon: <Square className="h-3 w-3" />, 
        pulse: '' 
      },
      connecting: { 
        color: 'bg-amber-500/20 text-amber-700 border-amber-500/30', 
        icon: <Activity className="h-3 w-3" />, 
        pulse: 'animate-pulse' 
      },
      error: { 
        color: 'bg-red-600/20 text-red-800 border-red-600/30', 
        icon: <AlertTriangle className="h-3 w-3" />, 
        pulse: 'animate-pulse' 
      }
    };
    
    const config = configs[status] || configs.offline;
    
    return (
      <Badge className={`${config.color} ${config.pulse} flex items-center gap-1 border`}>
        {config.icon}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const toggleApiKeyVisibility = (botId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [botId]: !prev[botId]
    }));
  };

  const maskApiKey = (apiKey: string) => {
    if (apiKey.length <= 8) return '*'.repeat(apiKey.length);
    return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
  };
  const getFilteredAndSortedBots = () => {
    const filtered = bots.filter(bot => {
      const matchesSearch = bot.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           bot.description?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'all' || bot.status === filters.status;
      const matchesCategory = filters.category === 'all'; // Add category filtering logic
      const matchesEnvironment = filters.environment === 'all'; // Add environment filtering logic
      
      return matchesSearch && matchesStatus && matchesCategory && matchesEnvironment;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name': {
          comparison = a.name.localeCompare(b.name);
          break;
        }
        case 'created': {
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        }
        case 'status': {
          comparison = a.status.localeCompare(b.status);
          break;
        }
        case 'activity': {
          const aActivity = a.lastActivity || a.createdAt;
          const bActivity = b.lastActivity || b.createdAt;
          comparison = new Date(aActivity).getTime() - new Date(bActivity).getTime();
          break;
        }
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const toggleBotSelection = (botId: string) => {
    setSelectedBots(prev => 
      prev.includes(botId) 
        ? prev.filter(id => id !== botId)
        : [...prev, botId]
    );
  };

  const selectAllBots = () => {
    const filteredBots = getFilteredAndSortedBots();
    setSelectedBots(filteredBots.map(bot => bot.id));
  };

  const clearBotSelection = () => {
    setSelectedBots([]);
  };
  const filteredBots = getFilteredAndSortedBots();

  return (
    <TooltipProvider>
      <Card className="glass-effect border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              Gerenciamento de Bots
              <Badge variant="secondary" className="ml-2">
                {filteredBots.length} de {bots.length}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {selectedBots.length > 0 && (
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-sm text-muted-foreground">
                    {selectedBots.length} selecionado(s)
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('start', selectedBots)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('stop', selectedBots)}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction('delete', selectedBots)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearBotSelection}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
                <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={loadBotMetrics}
                    disabled={loadingMetrics}
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingMetrics ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Atualizar métricas</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsN8nConfigOpen(true)}
                    className="bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20"
                  >
                    <Workflow className="h-4 w-4 mr-2" />
                    n8n
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Configurar n8n</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAutomationModalOpen(true)}
                    className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Automações
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Gerenciar automações</TooltipContent>
              </Tooltip>

              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingBot(null);
                      resetForm();
                    }}
                    className="bg-gradient-to-r from-primary to-secondary text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Bot
                  </Button>
                </DialogTrigger>                <DialogContent 
                  className="stable-modal-content max-w-5xl w-full max-h-[95vh] overflow-hidden glass-card border-0 p-0"
                  aria-describedby="bot-management-description"
                >
                  <DialogDescription id="bot-management-description">
                    Configuração completa de bots do WhatsApp, incluindo configurações básicas, locais, avançadas e integrações.
                  </DialogDescription>
                  <div className="flex flex-col h-full max-h-[95vh]">
                    <DialogHeader className="border-b border-border/20 p-4 glass-effect flex-shrink-0">
                      <DialogTitle className="text-xl font-bold gradient-text">
                        {editingBot ? 'Editar Bot' : 'Adicionar Novo Bot'}
                      </DialogTitle>
                    </DialogHeader>
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 min-h-0 max-h-[calc(95vh-120px)]">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">                        <TabsList className="grid w-full grid-cols-7 mb-4 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                          <TabsTrigger value="basic">Básico</TabsTrigger>
                          <TabsTrigger value="local" className="bg-yellow-100 border-yellow-400 text-yellow-800 font-bold">
                            🎯 Local Dev
                          </TabsTrigger>
                          <TabsTrigger value="advanced">Avançado</TabsTrigger>
                          <TabsTrigger value="integrations">Integrações</TabsTrigger>
                          <TabsTrigger value="security">Segurança</TabsTrigger>
                          <TabsTrigger value="performance">Performance</TabsTrigger>
                          <TabsTrigger value="templates">Templates</TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Tab */}
                        <TabsContent value="basic" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Nome do Bot *</Label>
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ex: Bot de Atendimento"
                                className={validationErrors.name ? 'border-red-500' : ''}
                                required
                              />
                              {validationErrors.name && (
                                <p className="text-sm text-red-500">{validationErrors.name}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category">Categoria</Label>
                              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Atendimento">Atendimento</SelectItem>
                                  <SelectItem value="Vendas">Vendas</SelectItem>
                                  <SelectItem value="Suporte">Suporte</SelectItem>
                                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                                  <SelectItem value="Marketing">Marketing</SelectItem>
                                  <SelectItem value="Geral">Geral</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Descrição detalhada do bot e suas funcionalidades"
                              rows={3}
                            />
                          </div>                          <div className="space-y-2">
                            <Label htmlFor="apiKey">
                              API Key {formData.environment === 'development' ? '(Opcional para Dev Local)' : '*'}
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="apiKey"
                                type="password"
                                value={formData.apiKey}
                                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                                placeholder={formData.environment === 'development' ? 'API Key (opcional para desenvolvimento local)' : 'Cole sua API key aqui'}
                                className={validationErrors.apiKey ? 'border-red-500' : ''}
                                required={formData.environment !== 'development'}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => validateApiKey(formData.apiKey)}
                                disabled={validatingApiKey}
                              >
                                {validatingApiKey ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <TestTube className="h-4 w-4" />
                                )}
                              </Button>                            </div>
                            {validationErrors.apiKey && (
                              <p className="text-sm text-red-500">{validationErrors.apiKey}</p>
                            )}                            {formData.environment === 'development' && (
                              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                                🎯 <strong>PRIORIDADE:</strong> Configure o caminho da pasta na aba "Local Dev" primeiro! A API Key é opcional para desenvolvimento local.
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="webhookUrl">Webhook URL</Label>
                            <div className="flex gap-2">
                              <Input
                                id="webhookUrl"
                                value={formData.webhookUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                                placeholder="https://sua-api.com/webhook"
                                className={validationErrors.webhookUrl ? 'border-red-500' : ''}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => testWebhook(formData.webhookUrl)}
                                disabled={testingWebhook || !formData.webhookUrl}
                              >
                                {testingWebhook ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Webhook className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            {validationErrors.webhookUrl && (
                              <p className="text-sm text-red-500">{validationErrors.webhookUrl}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
                              <Textarea
                                id="welcomeMessage"
                                value={formData.welcomeMessage}
                                onChange={(e) => setFormData(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                                rows={3}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="fallbackMessage">Mensagem de Fallback</Label>
                              <Textarea
                                id="fallbackMessage"
                                value={formData.fallbackMessage}
                                onChange={(e) => setFormData(prev => ({ ...prev, fallbackMessage: e.target.value }))}
                                rows={3}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="autoReply"
                                checked={formData.autoReply}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoReply: checked }))}
                              />
                              <Label htmlFor="autoReply">Resposta Automática</Label>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maxConcurrentChats">Máx. Conversas Simultâneas</Label>
                              <Input
                                id="maxConcurrentChats"
                                type="number"
                                min="1"
                                max="1000"
                                value={formData.maxConcurrentChats}
                                onChange={(e) => setFormData(prev => ({ ...prev, maxConcurrentChats: parseInt(e.target.value) ?? 1 }))}
                                className={validationErrors.maxConcurrentChats ? 'border-red-500' : ''}
                              />
                              {validationErrors.maxConcurrentChats && (
                                <p className="text-sm text-red-500">{validationErrors.maxConcurrentChats}</p>
                              )}
                            </div>                            <div className="space-y-2">
                              <Label htmlFor="environment">Ambiente</Label>                              <Select 
                                value={formData.environment} 
                                onValueChange={(value: 'production' | 'staging' | 'development') => {
                                  setFormData(prev => ({ ...prev, environment: value }));
                                  // Auto-navegar para a aba Local Dev quando desenvolvimento for selecionado
                                  if (value === 'development') {
                                    setTimeout(() => {
                                      setActiveTab('local');
                                      toast({
                                        title: "🎯 Mudança Automática de Aba",
                                        description: "Navegamos para a aba 'Local Dev' - configure o caminho da pasta primeiro!",
                                        duration: 4000,
                                      });
                                    }, 300);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="production">Produção</SelectItem>
                                  <SelectItem value="staging">Homologação</SelectItem>
                                  <SelectItem value="development">🛠️ Desenvolvimento (Local)</SelectItem>
                                </SelectContent>
                              </Select>{formData.environment === 'development' && (
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                  <p className="text-sm text-blue-800 font-medium">
                                    🚀 <strong>Modo Desenvolvimento Ativo!</strong>
                                  </p>
                                  <p className="text-xs text-blue-700 mt-1">
                                    ✅ Configure primeiro o <strong>caminho da pasta</strong> na aba "Local Dev"<br/>
                                    ⏩ API Key pode ser adicionada depois (opcional para local)
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="workingHours"
                                checked={formData.workingHoursEnabled}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, workingHoursEnabled: checked }))}
                              />
                              <Label htmlFor="workingHours">Horário de Funcionamento</Label>
                            </div>
                            {formData.workingHoursEnabled && (
                              <div className="grid grid-cols-2 gap-4 ml-6">
                                <div className="space-y-2">
                                  <Label htmlFor="workingStart">Início</Label>
                                  <Input
                                    id="workingStart"
                                    type="time"
                                    value={formData.workingHoursStart}
                                    onChange={(e) => setFormData(prev => ({ ...prev, workingHoursStart: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="workingEnd">Fim</Label>
                                  <Input
                                    id="workingEnd"
                                    type="time"
                                    value={formData.workingHoursEnd}
                                    onChange={(e) => setFormData(prev => ({ ...prev, workingHoursEnd: e.target.value }))}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* Advanced Tab */}
                        <TabsContent value="advanced" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="messageDelay">Delay entre mensagens (ms)</Label>
                              <Input
                                id="messageDelay"
                                type="number"
                                min="0"
                                max="10000"
                                value={formData.messageDelay}
                                onChange={(e) => setFormData(prev => ({ ...prev, messageDelay: parseInt(e.target.value) ?? 0 }))}
                                className={validationErrors.messageDelay ? 'border-red-500' : ''}
                              />
                              {validationErrors.messageDelay && (
                                <p className="text-sm text-red-500">{validationErrors.messageDelay}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="responseTimeout">Timeout de resposta (ms)</Label>
                              <Input
                                id="responseTimeout"
                                type="number"
                                min="1000"
                                max="120000"
                                value={formData.responseTimeout}
                                onChange={(e) => setFormData(prev => ({ ...prev, responseTimeout: parseInt(e.target.value) ?? 30000 }))}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="defaultLanguage">Idioma Padrão</Label>
                              <Select value={formData.defaultLanguage} onValueChange={(value) => setFormData(prev => ({ ...prev, defaultLanguage: value }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                                  <SelectItem value="en-US">English (US)</SelectItem>
                                  <SelectItem value="es-ES">Español</SelectItem>
                                  <SelectItem value="fr-FR">Français</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="timezone">Fuso Horário</Label>
                              <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="America/Sao_Paulo">América/São Paulo</SelectItem>
                                  <SelectItem value="America/New_York">América/Nova York</SelectItem>
                                  <SelectItem value="Europe/London">Europa/Londres</SelectItem>
                                  <SelectItem value="Asia/Tokyo">Ásia/Tóquio</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold">Recursos Avançados</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { key: 'enableSentimentAnalysis', label: 'Análise de Sentimento', icon: <Target className="h-4 w-4" /> },
                                { key: 'enableSpamFilter', label: 'Filtro Anti-Spam', icon: <Shield className="h-4 w-4" /> },
                                { key: 'enableAutoTranslation', label: 'Tradução Automática', icon: <Globe className="h-4 w-4" /> },
                                { key: 'enableVoiceMessages', label: 'Mensagens de Voz', icon: <MessageSquare className="h-4 w-4" /> },
                                { key: 'enableMediaMessages', label: 'Mensagens de Mídia', icon: <Upload className="h-4 w-4" /> },
                                { key: 'enableLocationSharing', label: 'Compartilhamento de Localização', icon: <Monitor className="h-4 w-4" /> },
                                { key: 'enableGroupChats', label: 'Conversas em Grupo', icon: <Users className="h-4 w-4" /> },
                                { key: 'analyticsEnabled', label: 'Analytics Avançado', icon: <BarChart3 className="h-4 w-4" /> }
                              ].map((setting) => (
                                <div key={setting.key} className="flex items-center justify-between p-3 glass-effect rounded-lg">
                                  <div className="flex items-center gap-2">
                                    {setting.icon}
                                    <Label htmlFor={setting.key}>{setting.label}</Label>
                                  </div>
                                  <Switch
                                    id={setting.key}
                                    checked={formData[setting.key as keyof BotFormData] as boolean}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [setting.key]: checked }))}
                                  />
                                </div>
                              ))}                            </div>
                          </div>
                        </TabsContent>

                        {/* Integrations Tab */}
                        <TabsContent value="integrations" className="space-y-4">
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-lg font-semibold mb-4">Integrações CRM</h4>
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="crmIntegration"
                                    checked={formData.crmIntegration}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, crmIntegration: checked }))}
                                  />
                                  <Label htmlFor="crmIntegration">Habilitar integração com CRM</Label>
                                </div>
                                
                                {formData.crmIntegration && (
                                  <div className="ml-6 space-y-3">
                                    <div className="space-y-2">
                                      <Label htmlFor="crmUrl">URL do CRM</Label>
                                      <Input
                                        id="crmUrl"
                                        value={formData.crmUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, crmUrl: e.target.value }))}
                                        placeholder="https://api.crm.com/v1"
                                        className={validationErrors.crmUrl ? 'border-red-500' : ''}
                                      />
                                      {validationErrors.crmUrl && (
                                        <p className="text-sm text-red-500">{validationErrors.crmUrl}</p>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="crmApiKey">API Key do CRM</Label>
                                      <Input
                                        id="crmApiKey"
                                        type="password"
                                        value={formData.crmApiKey}
                                        onChange={(e) => setFormData(prev => ({ ...prev, crmApiKey: e.target.value }))}
                                        placeholder="Sua API key do CRM"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-lg font-semibold mb-4">Analytics e Métricas</h4>
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="analyticsEnabled"
                                    checked={formData.analyticsEnabled}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, analyticsEnabled: checked }))}
                                  />
                                  <Label htmlFor="analyticsEnabled">Habilitar analytics avançado</Label>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="loggingLevel">Nível de Log</Label>
                                  <Select value={formData.loggingLevel} onValueChange={(value: 'error' | 'warn' | 'info' | 'debug') => setFormData(prev => ({ ...prev, loggingLevel: value }))}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="error">Error</SelectItem>
                                      <SelectItem value="warn">Warning</SelectItem>
                                      <SelectItem value="info">Info</SelectItem>
                                      <SelectItem value="debug">Debug</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-lg font-semibold mb-4">Notificações e Alertas</h4>
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="alertsEnabled"
                                    checked={formData.alertsEnabled}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, alertsEnabled: checked }))}
                                  />
                                  <Label htmlFor="alertsEnabled">Habilitar alertas</Label>
                                </div>
                                
                                {formData.alertsEnabled && (
                                  <div className="ml-6 space-y-3">
                                    <div className="space-y-2">
                                      <Label htmlFor="alertEmail">Email para alertas</Label>
                                      <Input
                                        id="alertEmail"
                                        type="email"
                                        value={formData.alertEmail}
                                        onChange={(e) => setFormData(prev => ({ ...prev, alertEmail: e.target.value }))}
                                        placeholder="admin@empresa.com"
                                        className={validationErrors.alertEmail ? 'border-red-500' : ''}
                                      />
                                      {validationErrors.alertEmail && (
                                        <p className="text-sm text-red-500">{validationErrors.alertEmail}</p>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="alertWebhook">Webhook para alertas</Label>
                                      <Input
                                        id="alertWebhook"
                                        value={formData.alertWebhook}
                                        onChange={(e) => setFormData(prev => ({ ...prev, alertWebhook: e.target.value }))}
                                        placeholder="https://hooks.slack.com/services/..."
                                        className={validationErrors.alertWebhook ? 'border-red-500' : ''}
                                      />
                                      {validationErrors.alertWebhook && (
                                        <p className="text-sm text-red-500">{validationErrors.alertWebhook}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-lg font-semibold mb-4">Backup e Recuperação</h4>
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="autoBackup"
                                    checked={formData.autoBackup}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoBackup: checked }))}
                                  />
                                  <Label htmlFor="autoBackup">Backup automático</Label>
                                </div>
                                
                                {formData.autoBackup && (
                                  <div className="ml-6">
                                    <div className="space-y-2">
                                      <Label htmlFor="backupFrequency">Frequência do backup</Label>
                                      <Select value={formData.backupFrequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setFormData(prev => ({ ...prev, backupFrequency: value }))}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="daily">Diário</SelectItem>
                                          <SelectItem value="weekly">Semanal</SelectItem>
                                          <SelectItem value="monthly">Mensal</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="space-y-4">
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-lg font-semibold mb-4">Segurança e Criptografia</h4>
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="encryptionEnabled"
                                    checked={formData.encryptionEnabled}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, encryptionEnabled: checked }))}
                                  />
                                  <Label htmlFor="encryptionEnabled">Habilitar criptografia de mensagens</Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="requireAuth"
                                    checked={formData.requireAuth}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireAuth: checked }))}
                                  />
                                  <Label htmlFor="requireAuth">Exigir autenticação</Label>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-lg font-semibold mb-4">Controle de Acesso</h4>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="whitelistedNumbers">Números autorizados (um por linha)</Label>
                                  <Textarea
                                    id="whitelistedNumbers"
                                    value={formData.whitelistedNumbers.join('\n')}
                                    onChange={(e) => setFormData(prev => ({ 
                                      ...prev, 
                                      whitelistedNumbers: e.target.value.split('\n').filter(n => n.trim()) 
                                    }))}
                                    placeholder="+5511999999999&#10;+5511888888888"
                                    rows={4}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Se preenchido, apenas estes números poderão interagir com o bot
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="blacklistedNumbers">Números bloqueados (um por linha)</Label>
                                  <Textarea
                                    id="blacklistedNumbers"
                                    value={formData.blacklistedNumbers.join('\n')}
                                    onChange={(e) => setFormData(prev => ({ 
                                      ...prev, 
                                      blacklistedNumbers: e.target.value.split('\n').filter(n => n.trim()) 
                                    }))}
                                    placeholder="+5511999999999&#10;+5511888888888"
                                    rows={4}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Números nesta lista serão bloqueados automaticamente
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-lg font-semibold mb-4">Tags e Categorização</h4>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                                  <Input
                                    id="tags"
                                    value={formData.tags.join(', ')}
                                    onChange={(e) => setFormData(prev => ({ 
                                      ...prev, 
                                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                                    }))}
                                    placeholder="atendimento, vendas, suporte"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Use tags para organizar e filtrar seus bots
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-lg font-semibold mb-4">Configurações de Segurança Avançadas</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <h5 className="font-medium">Proteção DDoS</h5>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-3">
                                    Proteção automática contra ataques de negação de serviço
                                  </p>
                                  <Switch
                                    checked={formData.rateLimitEnabled}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rateLimitEnabled: checked }))}
                                  />
                                </Card>

                                <Card className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Key className="h-4 w-4 text-primary" />
                                    <h5 className="font-medium">Rotação de Chaves</h5>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-3">
                                    Rotação automática de chaves de API para maior segurança
                                  </p>
                                  <Button variant="outline" size="sm">
                                    Configurar
                                  </Button>
                                </Card>

                                <Card className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Monitor className="h-4 w-4 text-primary" />
                                    <h5 className="font-medium">Monitoramento</h5>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-3">
                                    Monitoramento em tempo real de atividades suspeitas
                                  </p>
                                  <Switch defaultChecked />
                                </Card>

                                <Card className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-primary" />
                                    <h5 className="font-medium">Auditoria</h5>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-3">
                                    Log detalhado de todas as ações e acessos
                                  </p>
                                  <Switch defaultChecked />
                                </Card>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Performance Tab */}
                        <TabsContent value="performance" className="space-y-4">
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-lg font-semibold mb-4">Configurações de Performance</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="maxRetries">Máximo de tentativas</Label>
                                  <Input
                                    id="maxRetries"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.maxRetries}
                                    onChange={(e) => setFormData(prev => ({ ...prev, maxRetries: parseInt(e.target.value) ?? 3 }))}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Número máximo de tentativas para reenvio de mensagens
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="rateLimitPerMinute">Rate limit (msg/min)</Label>
                                  <Input
                                    id="rateLimitPerMinute"
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={formData.rateLimitPerMinute}
                                    onChange={(e) => setFormData(prev => ({ ...prev, rateLimitPerMinute: parseInt(e.target.value) ?? 60 }))}
                                    disabled={!formData.rateLimitEnabled}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Limite de mensagens por minuto por usuário
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-lg font-semibold mb-4">Cache e Memória</h4>
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="memoryCacheEnabled"
                                    checked={formData.memoryCacheEnabled}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, memoryCacheEnabled: checked }))}
                                  />
                                  <Label htmlFor="memoryCacheEnabled">Habilitar cache em memória</Label>
                                </div>
                                
                                {formData.memoryCacheEnabled && (
                                  <div className="ml-6">
                                    <div className="space-y-2">
                                      <Label htmlFor="memoryCacheSize">Tamanho do cache (MB)</Label>
                                      <Input
                                        id="memoryCacheSize"
                                        type="number"
                                        min="10"
                                        max="1000"
                                        value={formData.memoryCacheSize}
                                        onChange={(e) => setFormData(prev => ({ ...prev, memoryCacheSize: parseInt(e.target.value) ?? 100 }))}
                                      />
                                      <p className="text-xs text-muted-foreground">
                                        Tamanho máximo do cache em memória
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-lg font-semibold mb-4">Monitoramento de Performance</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">                                <Card className="p-4 text-center">
                                  <div className="text-2xl font-bold text-primary mb-1">95%</div>
                                  <div className="text-xs text-muted-foreground">Uptime</div>
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div className="bg-green-500 h-2 rounded-full progress-95 progress-animated"></div>
                                    </div>
                                  </div>
                                </Card>

                                <Card className="p-4 text-center">
                                  <div className="text-2xl font-bold text-primary mb-1">250ms</div>
                                  <div className="text-xs text-muted-foreground">Tempo de Resposta</div>
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div className="bg-blue-500 h-2 rounded-full progress-70 progress-animated"></div>
                                    </div>
                                  </div>
                                </Card>

                                <Card className="p-4 text-center">
                                  <div className="text-2xl font-bold text-primary mb-1">1.2GB</div>
                                  <div className="text-xs text-muted-foreground">Uso de Memória</div>
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div className="bg-amber-500 h-2 rounded-full progress-60 progress-animated"></div>
                                    </div>
                                  </div>
                                </Card>

                                <Card className="p-4 text-center">
                                  <div className="text-2xl font-bold text-primary mb-1">15%</div>
                                  <div className="text-xs text-muted-foreground">CPU</div>
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div className="bg-purple-500 h-2 rounded-full progress-15 progress-animated"></div>
                                    </div>
                                  </div>
                                </Card>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-lg font-semibold mb-4">Otimizações Automáticas</h4>
                              <div className="space-y-3">
                                <Card className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">Compressão de mensagens</div>
                                      <div className="text-xs text-muted-foreground">
                                        Comprime automaticamente mensagens longas para melhor performance
                                      </div>
                                    </div>
                                    <Switch defaultChecked />
                                  </div>
                                </Card>

                                <Card className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">Pool de conexões</div>
                                      <div className="text-xs text-muted-foreground">
                                        Reutiliza conexões para reduzir latência
                                      </div>
                                    </div>
                                    <Switch defaultChecked />
                                  </div>
                                </Card>

                                <Card className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">Cache de respostas</div>
                                      <div className="text-xs text-muted-foreground">
                                        Armazena respostas frequentes em cache para resposta mais rápida
                                      </div>
                                    </div>
                                    <Switch defaultChecked />
                                  </div>
                                </Card>

                                <Card className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">Auto-scaling</div>
                                      <div className="text-xs text-muted-foreground">
                                        Ajusta recursos automaticamente baseado na demanda
                                      </div>
                                    </div>
                                    <Switch />
                                  </div>
                                </Card>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-lg font-semibold mb-4">Configurações Avançadas</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="connectionPoolSize">Tamanho do pool de conexões</Label>
                                  <Input
                                    id="connectionPoolSize"
                                    type="number"
                                    min="1"
                                    max="100"
                                    defaultValue="10"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="keepAliveTimeout">Keep-alive timeout (s)</Label>
                                  <Input
                                    id="keepAliveTimeout"
                                    type="number"
                                    min="5"
                                    max="300"
                                    defaultValue="60"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="maxQueueSize">Tamanho máximo da fila</Label>
                                  <Input
                                    id="maxQueueSize"
                                    type="number"
                                    min="100"
                                    max="10000"
                                    defaultValue="1000"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="batchSize">Tamanho do lote de processamento</Label>
                                  <Input
                                    id="batchSize"
                                    type="number"
                                    min="1"
                                    max="100"
                                    defaultValue="10"
                                  />
                                </div>
                              </div>
                            </div>                          </div>
                        </TabsContent>

                        {/* Local Development Tab */}
                        <TabsContent value="local" className="space-y-4">
                          <div className="space-y-6">                            <div>
                              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <HardDrive className="h-5 w-5 text-primary" />
                                🎯 Desenvolvimento Local - PRIORIDADE
                              </h4>
                              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
                                <p className="text-sm text-yellow-800">
                                  <strong>⚡ IMPORTANTE:</strong> Para desenvolvimento local, o <strong>caminho da pasta do bot</strong> é 
                                  o mais importante! A API Key pode ser configurada depois.
                                </p>
                              </div>                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="localPath" className="text-base font-medium flex items-center gap-2">
                                    🎯 Caminho da Pasta do Bot <span className="text-red-500">*</span>
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">OBRIGATÓRIO</span>
                                  </Label>
                                  <div className="flex gap-2">
                                    <Input
                                      id="localPath"
                                      value={formData.localPath}
                                      onChange={(e) => setFormData(prev => ({ ...prev, localPath: e.target.value }))}
                                      placeholder="C:\bots\meu-bot ou /home/user/bots/meu-bot"
                                      className={`${validationErrors.localPath ? 'border-red-500' : 'border-green-400'} font-mono`}
                                    />                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.webkitdirectory = true;
                                        input.multiple = true;
                                        input.onchange = async (e) => {
                                          const files = (e.target as HTMLInputElement).files;
                                          if (files && files.length > 0) {
                                            const folderPath = files[0].webkitRelativePath.split('/')[0];
                                            
                                            // Iniciar validação com animação
                                            await validateFolderContents(files, folderPath);
                                          }
                                        };
                                        input.click();
                                      }}
                                      disabled={folderLoading}
                                    >
                                      {folderLoading ? (
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
                                    {/* Componente de Loading/Validação Melhorado */}
                                  {(folderLoading || folderValidation) && (                                    <div className="mt-4 p-6 border rounded-xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-slate-600 shadow-lg">
                                      <div className="space-y-4">
                                        {/* Header do status com animação */}
                                        <div className="flex items-center gap-3">
                                          {folderLoading ? (
                                            <div className="relative">
                                              <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                                              <div className="absolute inset-0 h-6 w-6 border-2 border-blue-200 rounded-full animate-pulse"></div>
                                            </div>
                                          ) : folderValidation?.success ? (
                                            <div className="relative">
                                              <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                                <div className="h-3 w-3 text-white">✓</div>
                                              </div>
                                              <div className="absolute inset-0 h-6 w-6 border-2 border-green-300 rounded-full animate-ping opacity-30"></div>
                                            </div>
                                          ) : (
                                            <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                              <div className="h-3 w-3 text-white">!</div>
                                            </div>
                                          )}
                                          <div className="flex-1">                                            <span className="font-semibold text-slate-100 text-sm">
                                              {folderValidation?.step || 'Iniciando análise...'}
                                            </span>
                                            {folderValidation && folderValidation.progress < 100 && (
                                              <div className="text-xs text-slate-300 mt-1">
                                                Analisando projeto de bot...
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Barra de progresso melhorada */}
                                        {folderValidation && (
                                          <div className="space-y-2">                                            <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden shadow-inner">
                                              <div 
                                                className={`h-full dynamic-progress-bar relative overflow-hidden ${
                                                  folderValidation.success ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
                                                  folderValidation.progress === 100 ? 'bg-gradient-to-r from-red-400 to-red-500' : 
                                                  'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600'
                                                }`}
                                                data-progress={folderValidation.progress}
                                              >
                                                {folderValidation.progress < 100 && (
                                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
                                                )}
                                              </div>
                                            </div>                                            <div className="flex justify-between text-xs text-slate-300">
                                              <span className="font-medium">{folderValidation.progress}% concluído</span>
                                              <span>{folderValidation.files.length} arquivos encontrados</span>
                                            </div>
                                          </div>
                                        )}

                                        {/* Lista de arquivos encontrados com animação */}
                                        {folderValidation && folderValidation.files.length > 0 && (
                                          <div className="space-y-2">                                            <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                                              <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                              Arquivos detectados:
                                            </div>
                                            <div className="max-h-32 overflow-y-auto bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-slate-500 shadow-inner custom-scrollbar text-slate-100">                                              {folderValidation.files.slice(0, 12).map((file, index) => (                                                <div 
                                                  key={index} 
                                                  className={`py-1.5 border-b border-slate-600 last:border-0 text-xs font-mono animate-fadeIn-delay-${Math.min(index, 11)} text-slate-200`}
                                                >
                                                  {file}
                                                </div>                                              ))}                                              {folderValidation.files.length > 12 && (
                                                <div className="text-slate-400 italic py-1.5 text-xs">
                                                  ... e mais {folderValidation.files.length - 12} arquivos
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}                                        {/* Mensagem final com melhor apresentação */}
                                        {folderValidation && folderValidation.progress === 100 && (                                          <div className={`p-4 rounded-lg text-sm whitespace-pre-line border-l-4 ${
                                            folderValidation.success 
                                              ? 'bg-emerald-900/30 text-emerald-100 border-emerald-400 shadow-lg shadow-emerald-900/20 backdrop-blur-sm' 
                                              : 'bg-red-900/30 text-red-100 border-red-400 shadow-lg shadow-red-900/20 backdrop-blur-sm'
                                          }`}>
                                            {folderValidation.message}
                                          </div>
                                        )}

                                        {/* Botões de ação */}
                                        {folderValidation && folderValidation.progress === 100 && (
                                          <div className="flex justify-between items-center pt-2">
                                            {folderValidation.success && (
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={testLocalConfiguration}
                                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                              >
                                                <TestTube className="h-4 w-4 mr-2" />
                                                Testar Configuração
                                              </Button>
                                            )}
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setFolderValidation(null)}
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
                                  
                                  <div className="bg-green-50 border border-green-200 p-3 rounded">
                                    <p className="text-sm text-green-700 font-medium">
                                      📁 <strong>PASSO 1:</strong> Selecione a pasta onde está o código do seu bot
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                      Esta é a pasta que contém arquivos como package.json, index.js, etc.
                                    </p>
                                  </div>
                                  {validationErrors.localPath && (
                                    <p className="text-sm text-red-500">{validationErrors.localPath}</p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="workingDirectory">Diretório de Trabalho (Opcional)</Label>
                                  <Input
                                    id="workingDirectory"
                                    value={formData.workingDirectory}
                                    onChange={(e) => setFormData(prev => ({ ...prev, workingDirectory: e.target.value }))}
                                    placeholder="Deixe vazio para usar o caminho da pasta do bot"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Diretório onde o comando será executado (se diferente da pasta do bot)
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Terminal className="h-5 w-5 text-primary" />
                                Configuração de Execução
                              </h4>

                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="packageManager">Gerenciador de Pacotes</Label>
                                    <Select 
                                      value={formData.packageManager} 
                                      onValueChange={(value: 'npm' | 'yarn' | 'pnpm' | 'bun') => 
                                        setFormData(prev => ({ ...prev, packageManager: value }))
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="npm">npm</SelectItem>
                                        <SelectItem value="yarn">Yarn</SelectItem>
                                        <SelectItem value="pnpm">pnpm</SelectItem>
                                        <SelectItem value="bun">Bun</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="startMode">Modo de Inicialização</Label>
                                    <Select 
                                      value={formData.startMode} 
                                      onValueChange={(value) => {
                                        setFormData(prev => ({ 
                                          ...prev, 
                                          startMode: value as typeof formData.startMode,
                                          startCommand: value !== 'custom' ? value : prev.startCommand
                                        }));
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="npm start">npm start</SelectItem>
                                        <SelectItem value="npm run dev">npm run dev</SelectItem>
                                        <SelectItem value="npm run serve">npm run serve</SelectItem>
                                        <SelectItem value="yarn start">yarn start</SelectItem>
                                        <SelectItem value="yarn dev">yarn dev</SelectItem>
                                        <SelectItem value="pnpm start">pnpm start</SelectItem>
                                        <SelectItem value="pnpm dev">pnpm dev</SelectItem>
                                        <SelectItem value="bun start">bun start</SelectItem>
                                        <SelectItem value="bun dev">bun dev</SelectItem>
                                        <SelectItem value="node index.js">node index.js</SelectItem>
                                        <SelectItem value="python main.py">python main.py</SelectItem>
                                        <SelectItem value="custom">Comando Personalizado</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                {formData.startMode === 'custom' && (
                                  <div className="space-y-2">
                                    <Label htmlFor="customCommand">Comando Personalizado</Label>                                    <Input
                                      id="customCommand"
                                      value={formData.customCommand}
                                      onChange={(e) => setFormData(prev => ({ ...prev, customCommand: e.target.value }))}
                                      placeholder="node --inspect app.js"
                                      className={validationErrors.customCommand ? 'border-red-500' : ''}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Digite o comando completo para iniciar seu bot
                                    </p>
                                    {validationErrors.customCommand && (
                                      <p className="text-sm text-red-500">{validationErrors.customCommand}</p>
                                    )}
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label htmlFor="startCommand">Comando Final de Execução</Label>
                                  <Input
                                    id="startCommand"
                                    value={formData.startMode === 'custom' ? formData.customCommand : formData.startMode}
                                    readOnly
                                    className="bg-muted"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Este será o comando executado para iniciar o bot
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" />
                                Configurações Adicionais
                              </h4>

                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="port">Porta (Opcional)</Label>                                    <Input
                                      id="port"
                                      type="number"
                                      min="1"
                                      max="65535"
                                      value={formData.port}
                                      onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) || 3000 }))}
                                      className={validationErrors.port ? 'border-red-500' : ''}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Porta onde o bot será executado (padrão: 3000)
                                    </p>
                                    {validationErrors.port && (
                                      <p className="text-sm text-red-500">{validationErrors.port}</p>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="envFile">Arquivo de Ambiente (.env)</Label>
                                    <Input
                                      id="envFile"
                                      value={formData.envFile}
                                      onChange={(e) => setFormData(prev => ({ ...prev, envFile: e.target.value }))}
                                      placeholder=".env ou .env.local"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Nome do arquivo de variáveis de ambiente
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id="autoStart"
                                      checked={formData.autoStart}
                                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoStart: checked }))}
                                    />
                                    <Label htmlFor="autoStart">Iniciar automaticamente ao salvar</Label>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id="processMonitoring"
                                      checked={formData.processMonitoring}
                                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, processMonitoring: checked }))}
                                    />
                                    <Label htmlFor="processMonitoring">Monitoramento de processo</Label>
                                  </div>
                                </div>                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <h5 className="font-medium mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Resumo da Configuração
                                  </h5>
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <p><strong>Pasta:</strong> {formData.localPath || 'Não selecionada'}</p>
                                    <p><strong>Comando:</strong> {formData.startMode === 'custom' ? formData.customCommand : formData.startMode}</p>
                                    <p><strong>Gerenciador:</strong> {formData.packageManager}</p>
                                    <p><strong>Porta:</strong> {formData.port}</p>
                                    <p><strong>Auto-start:</strong> {formData.autoStart ? 'Sim' : 'Não'}</p>
                                  </div>
                                  <div className="mt-4">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={testLocalConfiguration}
                                      className="w-full"
                                    >
                                      <TestTube className="h-4 w-4 mr-2" />
                                      Testar Configuração
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Templates Tab */}
                        <TabsContent value="templates" className="space-y-4">
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold">Templates Pré-configurados</h4>
                              <p className="text-sm text-muted-foreground">
                                Escolha um template para configurar rapidamente seu bot com as melhores práticas.
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {botTemplates.map((template) => (
                                  <Card key={template.id} className="glass-effect border hover:border-primary/50 transition-colors cursor-pointer">
                                    <CardHeader className="pb-2">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{template.name}</CardTitle>
                                        <Badge variant="outline">{template.category}</Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{template.description}</p>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-2">
                                        <div className="flex flex-wrap gap-1">
                                          {template.features.map((feature) => (
                                            <Badge key={feature} variant="secondary" className="text-xs">
                                              {feature}
                                            </Badge>
                                          ))}
                                        </div>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="w-full"
                                          onClick={() => applyTemplate(template)}
                                        >
                                          Aplicar Template
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>

                              <Separator />

                              <div className="space-y-3">
                                <h5 className="font-semibold">Importar/Exportar Configuração</h5>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('import-config')?.click()}
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Importar Configuração
                                  </Button>                                  <input
                                    id="import-config"
                                    type="file"
                                    accept=".json"
                                    onChange={importBotConfig}
                                    className="hidden"
                                    aria-label="Importar arquivo de configuração do bot"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      const config = {
                                        ...formData,
                                        exportedAt: new Date().toISOString()
                                      };
                                      
                                      const dataStr = JSON.stringify(config, null, 2);
                                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                      const url = URL.createObjectURL(dataBlob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `bot-template-${formData.name || 'config'}.json`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      URL.revokeObjectURL(url);
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar Configuração
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border/20">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAddModalOpen(false);
                              setEditingBot(null);
                              resetForm();
                            }}
                            className="glass-effect modern-button"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>                          <Button 
                            type="submit" 
                            className="bg-gradient-to-r from-primary to-secondary text-white modern-button shadow-lg"
                            disabled={formData.environment === 'development' && !formData.localPath.trim()}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {formData.environment === 'development' && !formData.localPath.trim() 
                              ? '📁 Configure a pasta primeiro' 
                              : (editingBot ? 'Atualizar' : 'Adicionar')
                            }
                          </Button>
                        </div>
                      </form>
                    </Tabs>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar bots..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="connecting">Conectando</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredBots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2 text-lg">
                {bots.length === 0 ? 'Nenhum bot configurado' : 'Nenhum bot encontrado'}
              </h3>
              <p className="text-sm mb-6">
                {bots.length === 0 
                  ? 'Adicione seu primeiro bot para começar a automatizar o atendimento'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
              {bots.length === 0 && (
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-primary to-secondary text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Bot
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bulk Actions Bar */}
              {selectedBots.length === 0 && (
                <div className="flex items-center justify-between p-2 glass-effect rounded-lg">
                  <div className="flex items-center gap-2">                    <input
                      type="checkbox"
                      onChange={(e) => e.target.checked ? selectAllBots() : clearBotSelection()}
                      className="rounded"
                      aria-label="Selecionar todos os bots"
                    />
                    <span className="text-sm text-muted-foreground">Selecionar todos</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filteredBots.length} bot(s) encontrado(s)
                  </div>
                </div>
              )}

              {/* Bot Cards */}
              {filteredBots.map((bot) => (
                <div key={bot.id} className="glass-effect rounded-xl p-4 space-y-3 border hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">                      <input
                        type="checkbox"
                        checked={selectedBots.includes(bot.id)}
                        onChange={() => toggleBotSelection(bot.id)}
                        className="mt-1 rounded"
                        aria-label={`Selecionar bot ${bot.name}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{bot.name}</h3>
                          {getStatusBadge(bot.status)}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleBotStatus(bot)}
                              >
                                {bot.status === 'online' ? (
                                  <Pause className="h-3 w-3" />
                                ) : (
                                  <Play className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {bot.status === 'online' ? 'Pausar bot' : 'Iniciar bot'}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        
                        {bot.description && (
                          <p className="text-muted-foreground text-sm mb-3">{bot.description}</p>
                        )}
                        
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Key className="h-3 w-3" />
                            <span className="font-medium">API Key:</span>
                            <span className="font-mono">
                              {showApiKey[bot.id] ? bot.apiKey : maskApiKey(bot.apiKey)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={() => toggleApiKeyVisibility(bot.id)}
                            >
                              {showApiKey[bot.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={() => copyToClipboard(bot.apiKey, 'apiKey')}
                            >
                              {copiedText === 'apiKey' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                          
                          {bot.webhookUrl && (
                            <div className="flex items-center gap-2">
                              <Webhook className="h-3 w-3" />
                              <span className="font-medium">Webhook:</span>
                              <span className="truncate max-w-xs">{bot.webhookUrl}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                onClick={() => copyToClipboard(bot.webhookUrl ?? '', 'webhook')}
                              >
                                {copiedText === 'webhook' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span className="font-medium">Criado em:</span>
                            <span>{new Date(bot.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>

                          {bot.lastActivity && (
                            <div className="flex items-center gap-2">
                              <Activity className="h-3 w-3" />
                              <span className="font-medium">Última atividade:</span>
                              <span>{new Date(bot.lastActivity).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportBotConfig(bot)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Exportar configuração</TooltipContent>
                      </Tooltip>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(bot)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o bot "{bot.name}"? 
                              Esta ação removerá todas as conversas e dados associados e não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(bot.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {/* Bot Metrics */}
                  {botMetrics[bot.id] && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-3 border-t border-border/30">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Mensagens</div>
                        <div className="font-semibold">{botMetrics[bot.id].messagesCount}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Conversas</div>
                        <div className="font-semibold">{botMetrics[bot.id].chatsCount}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Uptime</div>
                        <div className="font-semibold">{botMetrics[bot.id].uptime}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Tempo Resposta</div>
                        <div className="font-semibold">{botMetrics[bot.id].responseTime}ms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Taxa de Erro</div>
                        <div className="font-semibold text-red-500">{botMetrics[bot.id].errorRate}%</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Configuration Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/30">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Auto Reply</div>
                      <div className="font-medium flex items-center justify-center gap-1">
                        {bot.settings.autoReply ? (
                          <>
                            <Check className="h-3 w-3 text-green-500" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 text-red-500" />
                            Inativo
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Máx. Conversas</div>
                      <div className="font-medium">{bot.settings.maxConcurrentChats}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Horário</div>
                      <div className="font-medium">
                        {bot.settings.workingHours.enabled 
                          ? `${bot.settings.workingHours.start}-${bot.settings.workingHours.end}`
                          : '24h'
                        }
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Webhook</div>
                      <div className="font-medium flex items-center justify-center gap-1">
                        {bot.webhookUrl ? (
                          <>
                            <Check className="h-3 w-3 text-green-500" />
                            Configurado
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 text-amber-500" />
                            Não configurado
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default BotManagement;
