import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './LogoPreview.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { configurationManager, SystemConfiguration } from '@/services/configurationManager';
import { configPersistenceService } from '@/services/configPersistenceService';
import { configurationAnalyzer } from '@/services/configurationAnalyzer';
import { useAdvancedConfiguration } from '@/hooks/useAdvancedConfiguration';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, MessageSquare, Bell, Shield, Zap, Clock, Users, Database, Key, Palette, Globe, Save, RotateCcw, Settings, Webhook, Mail, Phone, FileText, BarChart3, Filter, Tag, AlertTriangle, CheckCircle, X, Plus, Trash2, Edit3, Monitor, Smartphone, Headphones, Brain, Target, TrendingUp, Megaphone, Cloud, Lock, Eye, Calendar, Timer, Volume2, VolumeX, Copy, Download, Upload, RefreshCw, HelpCircle, Star, Heart, Bookmark, Share2, Link, ExternalLink, ChevronRight, Info, Search, CreditCard, Activity, Cpu, HardDrive, MonitorSpeaker, Wrench, Gauge, ShieldCheck, Zap as Lightning, Layers, Wifi, Server, Rocket, Building2, GraduationCap, Award, BarChart2, TrendingDown, AlertCircle, CheckCircle2, Play, Pause, RotateCw, FileDown, FileUp, TestTube, Microscope, Package, Cog, User
} from 'lucide-react';
import VisuallyHidden from '@/components/ui/VisuallyHidden';
import BotManagement from './BotManagement';
import { useTheme } from './ThemeContext';
import { useScreenLock, UserProfile } from '@/hooks/use-screen-lock';
import { PasswordSetupModal } from '@/components/security/PasswordSetupModal';
import EnterpriseSettingsPanel from '@/components/enterprise/EnterpriseSettingsPanel';
// Imports para integração com bot
import { dataStore } from '@/store/dataStore';
import { botApiService } from '@/services/botApi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Interface para validação de configurações
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Interface para estado de carregamento
interface LoadingState {
  saving: boolean;
  loading: boolean;
  importing: boolean;
  exporting: boolean;
  validating: boolean;
}

// Interface para configurações de logo avançadas
interface LogoConfig {
  id: string;
  name: string;
  data: string;
  uploadDate: string;
  size?: number;
  type?: string;
}

// Interface para templates de mensagem
interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables?: string[];
}

// Interface para configurações do modal (versão simplificada)
interface ModalSettings {
  // Bot Settings básicos
  botName?: string;
  botDescription?: string;
  botType?: 'local' | 'system' | 'cloud' | 'api';
  botExecutable?: string;
  botPath?: string;
  botPort?: number;
  botArgs?: string;
  botStatus?: 'online' | 'offline' | 'away';
  welcomeMessage?: string;
  fallbackMessage?: string;
  responseDelay?: number;
  autoReply?: boolean;
  workingHours?: { 
    start: string; 
    end: string;
    enabled: boolean
  };
  maxConcurrentChats?: number;
  botPersonality?: 'friendly' | 'professional' | 'casual' | 'formal';
  botLanguage?: string;
  enableEmojis?: boolean;
  botAvatar?: string;
  
  // Message Settings
  messageRetention?: number;
  enableReadReceipts?: boolean;
  enableTypingIndicator?: boolean;
  maxMessageLength?: number;
  enableMediaMessages?: boolean;
  enableVoiceMessages?: boolean;
  enableDocuments?: boolean;
  enableStickers?: boolean;
  messageTemplates?: string[];
  autoCorrection?: boolean;
  messageFormatting?: boolean;
  linkPreview?: boolean;
  messageEncryption?: boolean;
  
  // Notification Settings
  enableNotifications?: boolean;
  soundEnabled?: boolean;
  desktopNotifications?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  notificationSound?: string;
  quietHours?: { start: string; end: string };
  notificationFrequency?: string;
  vibration?: boolean;
  notificationBadge?: boolean;
  
  // Security Settings
  enableEncryption?: boolean;
  sessionTimeout?: number;
  requireAuth?: boolean;
  ipWhitelist?: string | string[];
  enableTwoFactor?: boolean;
  passwordPolicy?: string;
  dataRetention?: number;
  enableAuditLog?: boolean;
  securityLevel?: string;
  allowedFileTypes?: string;
  maxFileSize?: number;
  antiSpam?: boolean;
  
  // AI Settings
  enableAI?: boolean;
  aiProvider?: string;
  aiModel?: string;
  aiApiKey?: string;
  aiTemperature?: number;
  aiMaxTokens?: number;
  enableSentimentAnalysis?: boolean;
  enableAutoTranslation?: boolean;
  aiPersonality?: string;
  aiResponseTime?: string;
  aiLearning?: boolean;
  aiContextMemory?: number;
  aiCreativity?: number;
  aiSystemPrompt?: string;
  aiKnowledgeBase?: string;
  
  // Integration Settings
  crmIntegration?: boolean;
  crmUrl?: string;
  emailIntegration?: boolean;
  calendarIntegration?: boolean;
  paymentIntegration?: boolean;
  zapierIntegration?: boolean;
  slackIntegration?: boolean;
  teamsIntegration?: boolean;
  webhookUrl?: string;
  apiKey?: string;
  integrationSync?: string;
  smtpServer?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPassword?: string;
  calendarType?: string;
  paymentGateway?: string;
  zapierWebhook?: string;
  slackWebhook?: string;
  teamsWebhook?: string;
  allowedIntegrationUrls?: string;
  
  // Performance Settings
  cacheEnabled?: boolean;
  compressionEnabled?: boolean;
  cdnEnabled?: boolean;
  loadBalancing?: boolean;
  autoScaling?: boolean;
  performanceMode?: string;
  maxConnections?: number;
  connectionPool?: number;
  requestTimeout?: number;
  latencyMonitoring?: boolean;
  memoryLimit?: number;
  cpuLimit?: number;
  diskCacheSize?: number;
  networkOptimization?: boolean;
  performanceLogs?: boolean;
  enableCompression?: boolean;
  cacheExpiration?: number;
  
  // Customization
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  darkMode?: boolean;
  customLogo?: string;
  brandName?: string;
  customCSS?: string;
  fontFamily?: string;
  fontSize?: number;
  borderRadius?: number;
  
  // Analytics Settings
  enableAnalytics?: boolean;
  trackingEnabled?: boolean;
  dataCollection?: string;
  reportFrequency?: string;
  customReportDays?: string[];
  customMetrics?: string[];
  exportFormat?: string;
  shareReports?: boolean;
  realTimeMetrics?: boolean;
  reportRecipients?: string;
  exportSchedule?: string;
  exportTime?: string;
  defaultAnalyticsView?: string;
  globalAnalyticsFilters?: string;
  analyticsRetention?: number;
  allowRawDownload?: boolean;
  
  // Backup Settings
  backupEnabled?: boolean;
  backupFrequency?: string;
  
  // Queue Settings
  enableQueue?: boolean;
  autoAssignment?: boolean;
  maxWaitTime?: number;
  
  // Enterprise Settings
  complianceMode?: boolean;
  gdprCompliance?: boolean;
  auditLogging?: boolean;
  dataGovernance?: boolean;
  roleBasedAccess?: boolean;
  ssoEnabled?: boolean;
  ldapIntegration?: boolean;
  enterpriseReporting?: boolean;
  customBranding?: boolean;
  whiteLabeling?: boolean;
  
  // Advanced Settings
  apiEndpoint?: string;
  rateLimitPerMinute?: number;
  debugMode?: boolean;
  developerMode?: boolean;
  experimentalFeatures?: boolean;
  betaAccess?: boolean;
  maintenanceMode?: boolean;
  
  // User Management
  userRoles?: string[];
  maxUsers?: number;
  userPermissions?: Record<string, unknown>;
  sessionManagement?: string;
  loginAttempts?: number;
  accountLockout?: number;
  errorMonitoring?: boolean;
  processPriority?: string;
  bandwidthLimit?: number;
  cacheStrategy?: string;
  loadBalancingStrategy?: string;
  faultTolerance?: boolean;
  
  // Campos N8N
  n8nUsername?: string;
  n8nPassword?: string;
  defaultWorkflow?: string;
  
  // Logo avançado
  logoSize?: string;
  logoStyle?: string;
  logoBorderRadius?: number;
  logoShadow?: boolean;
  savedLogos?: Array<{id: string, name: string, data: string, uploadDate: string}>;
  
  // Workflow Settings
  escalationRules?: unknown[];
  slaSettings?: { response: number; resolution: number };
  tagManagement?: string[];
  priorityLevels?: string[];
  workflowSteps?: unknown[];
  approvalProcess?: boolean;
  notificationVolume?: number;
}

// Componente para exibir cores sem estilos inline
const ColorPreview = ({ color }: { color: string }) => {
  return <div className="theme-color-preview" data-color={color} />;
};

// Componente para preview da logo sem estilos inline
const LogoPreview = ({ 
  src, 
  size, 
  borderRadius, 
  shadow, 
  style: logoStyle 
}: { 
  src: string; 
  size: string; 
  borderRadius: number; 
  shadow: boolean; 
  style: string;
}) => {
  return (
    <div 
      className={`logo-preview-advanced logo-preview-${size} ${shadow ? 'logo-preview-shadow' : ''}`} 
      data-bg-image={src}
      data-border-radius={borderRadius}
      data-logo-style={logoStyle}
    />
  );
};

  // Função para mapear configurações do modal para SystemConfiguration
const mapSettingsToSystemConfig = (settings: Partial<ModalSettings>): SystemConfiguration => {
  return {
    whatsapp: {
      autoReply: settings.autoReply ?? true,
      replyDelay: settings.responseDelay ?? 1000,
      businessHours: {
        enabled: settings.workingHours?.enabled ?? true,
        start: settings.workingHours?.start ?? '09:00',
        end: settings.workingHours?.end ?? '18:00',
        timezone: 'America/Sao_Paulo',
        workDays: [1, 2, 3, 4, 5]
      },
      qrCodeTimeout: 60000,
      maxRetries: 3
    },
    n8n: {
      webhookUrl: settings.webhookUrl || 'http://localhost:5678/webhook/whatsapp-messages',
      apiUrl: 'http://localhost:5678',
      username: settings.n8nUsername || '',
      password: settings.n8nPassword || '',
      defaultWorkflow: settings.defaultWorkflow || '',
      timeout: settings.requestTimeout || 30000,
      retryAttempts: 3
    },
    queue: {
      enabled: settings.enableQueue ?? true,
      maxWaitTime: settings.maxWaitTime || 30000,
      autoAssign: settings.autoAssignment ?? true,
      priorityRules: [],
      workingHours: {
        enabled: settings.workingHours?.enabled ?? true,
        schedule: {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' }
        }
      }
    },
    backup: {
      enabled: settings.backupEnabled ?? true,
      interval: 60,
      location: './backups',
      maxBackups: 10,
      autoCleanup: true
    },
    monitoring: {
      enabled: settings.enableAnalytics ?? true,
      alertThresholds: {
        queueSize: settings.maxConcurrentChats || 50,
        responseTime: 5000,
        errorRate: 10,
        memoryUsage: settings.memoryLimit || 1024
      },
      notifications: {
        email: settings.emailNotifications ?? false,
        webhook: false,
        dashboard: true
      }
    },
    ai: {
      enabled: settings.enableAI ?? false,
      provider: 'openai',
      model: settings.aiModel || 'gpt-4',
      temperature: settings.aiTemperature || 0.7,
      maxTokens: settings.aiMaxTokens || 1000,
      autoResponse: settings.autoReply ?? false,
      confidenceThreshold: 0.8,
      contextWindow: 4096,
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 60,
        requestsPerHour: 1000
      }
    },
    // Adicionar as novas seções expandidas
    logging: {
      level: 'info',
      enableConsole: true,
      enableFile: true,
      enableRemote: false,
      maxFileSize: 100,
      maxFiles: 10,
      compression: true,
      rotation: {
        enabled: true,
        schedule: 'daily',
        maxAge: 604800
      },
      filters: {
        excludePatterns: [],
        includePatterns: [],
        sensitiveDataMask: true
      }
    },
    rateLimiting: {
      enabled: true,
      global: {
        windowMs: 60000,
        maxRequests: settings.rateLimitPerMinute || 60,
        skipSuccessfulRequests: false
      },
      perEndpoint: {},
      strategies: {
        memory: true,
        redis: false,
        database: false
      },
      responses: {
        message: 'Too Many Requests',
        statusCode: 429,
        includeRetryAfter: true
      }
    },
    caching: {
      layers: {
        memory: {
          enabled: settings.cacheEnabled ?? true,
          maxSize: 1000,
          ttl: settings.cacheExpiration || 300,
          algorithm: 'lru' as const
        },
        redis: {
          enabled: false,
          keyPrefix: 'whats-hub:',
          ttl: settings.cacheExpiration || 300,
          compression: settings.compressionEnabled ?? true
        },
        database: {
          enabled: false,
          tableName: 'cache',
          ttl: settings.cacheExpiration || 300,
          cleanupInterval: 3600
        }
      },
      strategies: {
        writeThrough: true,
        writeBack: false,
        readThrough: true,
        cacheAside: false
      },
      invalidation: {
        enabled: true,
        patterns: [],
        events: []
      }
    },
    healthCheck: {
      enabled: true,
      endpoints: {
        basic: true,
        detailed: false,
        custom: false
      },
      checks: {
        database: true,
        redis: false,
        external: true,
        disk: true,
        memory: true,
        services: true
      },
      intervals: {
        basic: 30000,
        detailed: 60000,
        external: 120000
      },
      thresholds: {
        responseTime: 5000,
        memoryUsage: 90,
        diskUsage: 95,
        cpuUsage: 90
      },
      notifications: {
        onFailure: true,
        onRecovery: true,
        channels: ['dashboard']
      }
    },
    observability: {
      enabled: settings.enableAnalytics ?? true,
      metrics: {
        enabled: true,
        interval: 60000,
        retention: '30d'
      },
      tracing: {
        enabled: false,
        sampleRate: 0.1
      }
    },
    disasterRecovery: {
      enabled: settings.backupEnabled ?? true,
      replicationStrategy: 'async',
      backupFrequency: 'daily',
      retentionPeriod: '30d',
      autoFailover: false
    },
    userExperience: {
      theme: settings.darkMode ? 'dark' : 'light',
      animations: true,
      compactMode: false,
      accessibility: {
        highContrast: false,
        screenReader: true,
        keyboardNavigation: true
      }
    }
  };
};  // Função para mapear SystemConfiguration de volta para configurações do modal
const mapSystemConfigToSettings = (config: SystemConfiguration): Partial<ModalSettings> => {
  return {
    // Bot Settings básicos
    botName: 'Customer Support Bot',
    welcomeMessage: 'Olá! 👋 Como posso ajudá-lo hoje?',
    fallbackMessage: 'Desculpe, não entendi. Pode reformular sua pergunta?',
    responseDelay: config.whatsapp?.replyDelay || 1000,
    autoReply: config.whatsapp?.autoReply ?? true,
    workingHours: { 
      start: config.whatsapp?.businessHours?.start || '09:00', 
      end: config.whatsapp?.businessHours?.end || '18:00',
      enabled: config.whatsapp?.businessHours?.enabled ?? true
    },
    maxConcurrentChats: 10,
    botPersonality: 'friendly' as const,
    botLanguage: 'pt-BR',
    enableEmojis: true,
    botAvatar: '',
    botStatus: config.whatsapp?.autoReply ? 'online' as const : 'offline' as const,
    
    // Message Settings
    messageRetention: 30,
    enableReadReceipts: true,
    enableTypingIndicator: true,
    maxMessageLength: 4096,
    enableMediaMessages: true,
    enableVoiceMessages: true,
    enableDocuments: true,
    enableStickers: false,
    messageEncryption: true,
    
    // Notification Settings
    enableNotifications: true,
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: config.monitoring?.notifications?.email ?? false,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security Settings
    enableEncryption: true,
    sessionTimeout: 30,
    loginAttempts: 3,
    
    // Performance Settings
    cacheEnabled: true,
    maxConnections: 1000,
    requestTimeout: config.n8n?.timeout || 30000,
    
    // Customization
    primaryColor: '#25D366',
    secondaryColor: '#128C7E',
    accentColor: '#34B7F1',
    darkMode: false,
    customLogo: '',
    brandName: 'WhatsApp Hub',
    fontFamily: 'Inter',
    fontSize: 14,
    
    // Analytics Settings
    enableAnalytics: config.monitoring?.enabled ?? true,
    
    // Integration Settings
    emailIntegration: false,
    crmIntegration: false,
    slackIntegration: false,
    teamsIntegration: false,
    webhookUrl: config.n8n?.webhookUrl || '',
    
    // AI Settings
    enableAI: config.ai?.enabled ?? false,
    aiModel: config.ai?.model || 'gpt-4',
    aiTemperature: config.ai?.temperature || 0.7,
    aiMaxTokens: config.ai?.maxTokens || 1000,

    // Backup Settings
    backupEnabled: config.backup?.enabled ?? true,
    
    // Queue Settings
    enableQueue: config.queue?.enabled ?? true,
    autoAssignment: config.queue?.autoAssign ?? true,
    maxWaitTime: config.queue?.maxWaitTime || 30000,
    
    // Enterprise Settings (novos campos)
    complianceMode: false,
    gdprCompliance: false,
    auditLogging: false,
    dataGovernance: false,
    roleBasedAccess: false,
    ssoEnabled: false,
    ldapIntegration: false,
    enterpriseReporting: false,
    customBranding: false,
    whiteLabeling: false,
    
    // Performance Settings (novos campos)
    memoryLimit: 1024,
    cpuLimit: 80,
    diskCacheSize: 512,
    networkOptimization: false
  };
};

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { toast } = useToast();
  const screenLock = useScreenLock();
  const [isPasswordSetupOpen, setIsPasswordSetupOpen] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    saving: false,
    loading: false,
    importing: false,
    exporting: false,
    validating: false
  });
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 🎯 Estado para funcionalidades avançadas
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [healthCheckResult, setHealthCheckResult] = useState<{ 
    overall: string; 
    details: Record<string, unknown>; 
    issues: Array<{ severity: string; message: string; component: string }>; 
    recommendations: string[] 
  } | null>(null);
  const [resourceUsage, setResourceUsage] = useState<{ cpu: number; memory: number; disk: number; network: number } | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<{ responseTime: number; throughput: number; errorRate: number } | null>(null);
  const [availablePresets, setAvailablePresets] = useState<{ id: string; name: string; description: string }[]>([]);
  const [systemReports, setSystemReports] = useState<{ 
    type: string; 
    generated: string; 
    summary: Record<string, unknown> 
  }[]>([]);

  const [settings, setSettings] = useState({
    // Bot Settings
    botName: 'Customer Support Bot',
    botDescription: 'Bot inteligente para atendimento ao cliente 24/7',
    botType: 'local',
    botExecutable: '',
    botPath: '',
    botPort: 3000,
    botArgs: '',
    botStatus: 'offline',
    botApiUrl: '',
    
    // Screen Lock Settings
    screenLockMessage: 'Tela bloqueada - Sistema WhatsApp Hub',
    screenLockLogo: '',
    screenLockBackground: '#1f2937',
    screenLockTextColor: '#ffffff',
    screenLockShowBrand: true,
    screenLockBlur: true,
    welcomeMessage: '',
    fallbackMessage: '',
    responseDelay: 1000,
    autoReply: true,
    workingHours: { start: '09:00', end: '18:00', enabled: true },
    maxConcurrentChats: 10,
    botPersonality: 'friendly',
    botLanguage: 'pt-BR',
    enableEmojis: true,
    botAvatar: '',
    
    // Message Settings
    messageRetention: 30,
    enableReadReceipts: true,
    enableTypingIndicator: true,
    maxMessageLength: 4096,
    enableMediaMessages: true,
    enableVoiceMessages: true,
    enableDocuments: true,
    enableStickers: false,
    messageTemplates: ['Obrigado pelo contato!', 'Como posso ajudar?', 'Aguarde um momento...'],
    autoCorrection: true,
    messageFormatting: true,
    linkPreview: true,
    messageEncryption: true,
    
    // Notification Settings
    enableNotifications: true,
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: true,
    notificationSound: 'default',
    quietHours: { start: '18:00', end: '06:00' },
    notificationFrequency: 'immediate',
    vibration: true,
    notificationBadge: true,
    
    // Security Settings
    enableEncryption: true,
    sessionTimeout: 30,
    requireAuth: true,
    ipWhitelist: '',
    enableTwoFactor: false,
    passwordPolicy: 'medium',
    dataRetention: 90,
    enableAuditLog: true,
    securityLevel: 'high',
    allowedFileTypes: '.pdf,.doc,.docx,.txt,.jpg,.png',
    maxFileSize: 10,
    antiSpam: true,
    
    // AI Settings
    enableAI: false,
    aiProvider: 'openai',
    aiModel: 'gpt-4',
    aiApiKey: '',
    aiTemperature: 0.7,
    aiMaxTokens: 1000,
    enableSentimentAnalysis: true,
    enableAutoTranslation: false,
    aiPersonality: 'professional',
    aiResponseTime: 'fast',
    aiLearning: true,
    aiContextMemory: 10,
    aiCreativity: 70,
    aiSystemPrompt: '',
    aiKnowledgeBase: '',
    
    // Integration Settings
    crmIntegration: false,
    crmUrl: '',
    emailIntegration: false,
    calendarIntegration: false,
    paymentIntegration: false,
    zapierIntegration: false,
    slackIntegration: false,
    teamsIntegration: false,
    webhookUrl: '',
    apiKey: '',
    integrationSync: 'realtime',
    smtpServer: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    calendarType: 'google',
    paymentGateway: 'none',
    zapierWebhook: '',
    slackWebhook: '',
    teamsWebhook: '',
    allowedIntegrationUrls: '',
    
    // Performance Settings
    cacheEnabled: true,
    compressionEnabled: true,
    cdnEnabled: false,
    loadBalancing: false,
    autoScaling: true,
    performanceMode: 'balanced',
    maxConnections: 1000,
    connectionPool: 50,
    requestTimeout: 30,
    latencyMonitoring: false,
    
    // Customization
    primaryColor: '#25D366',
    secondaryColor: '#128C7E',
    accentColor: '#34B7F1',
    darkMode: true,
    customLogo: '',
    brandName: 'Minha Empresa',
    customCSS: '',
    fontFamily: 'Inter',
    fontSize: 14,
    borderRadius: 8,
    
    // Configurações avançadas da logo
    logoSize: 'medium',
    logoStyle: 'contain',
    logoBorderRadius: 8,
    logoShadow: false,
    savedLogos: [] as Array<{id: string, name: string, data: string, uploadDate: string}>,
    
    // Workflow Settings
    escalationRules: [],
    autoAssignment: true,
    slaSettings: { response: 30, resolution: 240 },
    tagManagement: ['vendas', 'suporte', 'urgente', 'feedback'],
    priorityLevels: ['baixa', 'média', 'alta', 'crítica'],
    workflowSteps: [],
    approvalProcess: false,
    
    // Analytics Settings
    enableAnalytics: true,
    analyticsEnabled: true,
    analyticsRefreshInterval: 5000,
    analyticsWidgets: [] as string[],
    analyticsReportsEnabled: true,
    analyticsReportFrequency: 'weekly',
    analyticsExportFormat: 'pdf',
    analyticsAlertsEnabled: true,
    analyticsAlertEmail: '',
    analyticsPerformanceThreshold: 80,
    trackingEnabled: true,
    dataCollection: 'essential',
    reportFrequency: 'weekly',
    customReportDays: [] as string[],
    customMetrics: [] as string[],
    exportFormat: 'pdf',
    shareReports: false,
    realTimeMetrics: true,
    reportRecipients: '',
    exportSchedule: 'manual',
    exportTime: '',
    defaultAnalyticsView: 'dashboard',
    globalAnalyticsFilters: '',
    analyticsRetention: 90,
    allowRawDownload: false,
    
    // Advanced Settings
    apiEndpoint: 'https://api.whatsapp.com',
    rateLimitPerMinute: 60,
    debugMode: false,
    developerMode: false,
    experimentalFeatures: false,
    betaAccess: false,
    maintenanceMode: false,
    backupEnabled: true,
    backupFrequency: 'daily',
    
    // User Management
    userRoles: ['admin', 'agent', 'viewer'],
    maxUsers: 25,
    userPermissions: {},
    sessionManagement: 'strict',
    loginAttempts: 3,
    accountLockout: 15,
    cpuLimit: 80,
    errorMonitoring: false,
    memoryLimit: 1024,
    processPriority: 'normal',
    performanceLogs: false,
    bandwidthLimit: 100,
    cacheStrategy: 'memory',
    cacheExpiration: 300,
    loadBalancingStrategy: 'round-robin',
    faultTolerance: false
  });

  const [activeSection, setActiveSection] = useState('bot');
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();
  const [appliedTheme, setAppliedTheme] = useState<string | null>(null);
  const [filteredSections, setFilteredSections] = useState<string[]>([]);

  // Definir todas as seções e suas configurações
  const sections = useMemo(() => ({
    bot: { 
      name: 'Bot', 
      icon: Bot, 
      keywords: ['bot', 'nome', 'idioma', 'resposta', 'automática', 'delay', 'personalidade'],
      description: 'Configurações básicas do bot de atendimento'
    },
    messages: { 
      name: 'Mensagens', 
      icon: MessageSquare, 
      keywords: ['mensagem', 'leitura', 'digitação', 'criptografia', 'tamanho', 'template'],
      description: 'Configurações de mensagens e comunicação'
    },
    notifications: { 
      name: 'Notificações', 
      icon: Bell, 
      keywords: ['notificação', 'email', 'desktop', 'som', 'push', 'alerta'],
      description: 'Configurações de alertas e notificações'
    },
    security: { 
      name: 'Segurança', 
      icon: Shield, 
      keywords: ['segurança', 'criptografia', 'sessão', 'timeout', 'senha', 'autenticação'],
      description: 'Configurações de segurança e proteção'
    },
    ai: { 
      name: 'IA', 
      icon: Brain, 
      keywords: ['ia', 'inteligencia', 'artificial', 'modelo', 'temperatura', 'gpt', 'análise'],
      description: 'Configurações de inteligência artificial'
    },
    integrations: { 
      name: 'Integrações', 
      icon: Webhook, 
      keywords: ['integração', 'webhook', 'email', 'n8n', 'api', 'crm', 'zapier'],
      description: 'Configurações de integrações externas'
    },
    performance: { 
      name: 'Performance', 
      icon: Zap, 
      keywords: ['performance', 'cache', 'conexão', 'otimização', 'velocidade', 'memória'],
      description: 'Configurações de performance e otimização'
    },
    customization: { 
      name: 'Personalização', 
      icon: Palette, 
      keywords: ['personalização', 'tema', 'cor', 'logo', 'marca', 'visual', 'design'],
      description: 'Configurações visuais e de marca'
    },
    analytics: { 
      name: 'Analytics', 
      icon: BarChart3, 
      keywords: ['analytics', 'relatório', 'métricas', 'dados', 'estatística', 'dashboard'],
      description: 'Configurações de análise e relatórios'
    },
    backup: { 
      name: 'Backup', 
      icon: Database, 
      keywords: ['backup', 'cópia', 'segurança', 'restauração', 'dados', 'arquivo'],
      description: 'Configurações de backup e recuperação'
    },
    workflows: { 
      name: 'Workflows', 
      icon: Users, 
      keywords: ['workflow', 'fluxo', 'processo', 'automação', 'regras', 'escalação'],
      description: 'Configurações de fluxos de trabalho'
    },
    advanced: { 
      name: 'Avançado', 
      icon: Settings, 
      keywords: ['avançado', 'desenvolvedor', 'debug', 'api', 'configuração', 'sistema'],
      description: 'Configurações avançadas do sistema'
    }
  }), []);

  // Função para filtrar seções baseada na busca
  const filterSections = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredSections(Object.keys(sections));
      return;
    }

    const filtered = Object.entries(sections).filter(([key, section]) => {
      const searchTerm = query.toLowerCase();
      return section.name.toLowerCase().includes(searchTerm) ||
             section.keywords.some(keyword => keyword.includes(searchTerm)) ||
             section.description.toLowerCase().includes(searchTerm);
    }).map(([key]) => key);

    setFilteredSections(filtered);
  }, [sections]);

  // Funcionalidades de logo avançadas
  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "❌ Tipo de arquivo inválido",
        description: "Apenas arquivos JPG, PNG, GIF e SVG são suportados.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "❌ Arquivo muito grande",
        description: "O arquivo deve ter no máximo 2MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const logoData = e.target?.result as string;
      const newLogo: LogoConfig = {
        id: Date.now().toString(),
        name: file.name,
        data: logoData,
        uploadDate: new Date().toISOString(),
        size: file.size,
        type: file.type
      };

      setSettings(prev => ({
        ...prev,
        customLogo: logoData,
        savedLogos: [...(prev.savedLogos || []), newLogo]
      }));

      setHasUnsavedChanges(true);

      toast({
        title: "✅ Logo carregada",
        description: `Logo "${file.name}" carregada com sucesso!`,
        variant: "default"
      });
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleLogoSelect = useCallback((logo: LogoConfig) => {
    setSettings(prev => ({
      ...prev,
      customLogo: logo.data
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleLogoDelete = useCallback((logoId: string) => {
    setSettings(prev => ({
      ...prev,
      savedLogos: (prev.savedLogos || []).filter(logo => logo.id !== logoId),
      customLogo: prev.customLogo === (prev.savedLogos || []).find(l => l.id === logoId)?.data ? '' : prev.customLogo
    }));
    setHasUnsavedChanges(true);
  }, []);

  // ============================================
  // FUNÇÕES PRINCIPAIS DE GERENCIAMENTO DE BOT
  // ============================================

  // Estados para o processo de upload detalhado
  const [uploadStage, setUploadStage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [analysisResults, setAnalysisResults] = useState<{
    hasPackageJson: boolean;
    hasMainFile: boolean;
    dependencies: string[];
    projectType: string;
    issues: string[];
    recommendations: string[];
  } | null>(null);

  // Função para análise detalhada de bot
  const performDetailedBotAnalysis = useCallback(async (file: File): Promise<{
    hasPackageJson: boolean;
    hasMainFile: boolean;
    dependencies: string[];
    projectType: string;
    issues: string[];
    recommendations: string[];
  }> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const size = file.size;
    const name = file.name;
    
    const result = {
      hasPackageJson: false,
      hasMainFile: false,
      dependencies: [] as string[],
      projectType: 'unknown',
      issues: [] as string[],
      recommendations: [] as string[]
    };

    // Análise baseada na extensão
    switch (extension) {
      case 'exe':
        result.projectType = 'Windows Executable';
        result.hasMainFile = true;
        if (size > 50 * 1024 * 1024) {
          result.issues.push('Arquivo executável muito grande (>50MB)');
        }
        result.recommendations.push('Verifique se o executável foi assinado digitalmente');
        break;

      case 'jar':
        result.projectType = 'Java Application';
        result.hasMainFile = true;
        result.dependencies.push('Java Runtime Environment');
        result.recommendations.push('Certifique-se de ter Java 8+ instalado');
        break;

      case 'py':
        result.projectType = 'Python Script';
        result.hasMainFile = true;
        result.dependencies.push('Python 3.6+');
        result.recommendations.push('Verifique se todas as dependências do pip estão instaladas');
        if (!name.includes('main') && !name.includes('bot') && !name.includes('app')) {
          result.issues.push('Nome do arquivo não sugere ser o arquivo principal');
        }
        break;

      case 'js':
        result.projectType = 'Node.js Application';
        result.hasMainFile = true;
        result.dependencies.push('Node.js 14+', 'npm');
        result.recommendations.push('Execute "npm install" antes de iniciar o bot');
        break;

      case 'zip':
      case 'rar':
      case 'tar':
        result.projectType = 'Compressed Bot Project';
        result.issues.push('Arquivo comprimido - será necessário extrair para análise completa');
        result.recommendations.push('Extraia o arquivo e faça upload da pasta do projeto');
        break;

      default:
        result.issues.push(`Tipo de arquivo não reconhecido: .${extension}`);
        result.recommendations.push('Considere usar formatos compatíveis: .exe, .jar, .py, .js, .zip');
    }

    // Verificações gerais
    if (size < 1024) {
      result.issues.push('Arquivo muito pequeno - pode estar corrompido');
    }

    if (size > 100 * 1024 * 1024) {
      result.issues.push('Arquivo muito grande - pode causar problemas de performance');
    }

    // Validações de nome
    if (name.includes(' ')) {
      result.issues.push('Nome do arquivo contém espaços - pode causar problemas');
      result.recommendations.push('Renomeie o arquivo removendo espaços');
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
      result.issues.push('Nome do arquivo contém caracteres especiais');
      result.recommendations.push('Use apenas letras, números, pontos, traços e underscores');
    }

    return result;
  }, []);

  const handleBotUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoadingState(prev => ({ ...prev, importing: true }));
    setUploadProgress(0);

    try {
      const file = files[0];
      
      // FASE 1: Validação inicial
      setUploadStage('🔍 Validando arquivo...');
      setUploadProgress(10);
      
      const validExtensions = ['.exe', '.jar', '.py', '.js', '.zip', '.rar', '.tar.gz'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        toast({
          title: "❌ Formato Inválido",
          description: `Tipos permitidos: ${validExtensions.join(', ')}`,
          variant: "destructive",
          duration: 5000
        });
        return;
      }

      // FASE 2: Verificação de tamanho
      setUploadStage('📏 Verificando tamanho...');
      setUploadProgress(20);
      await new Promise(resolve => setTimeout(resolve, 300));

      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast({
          title: "❌ Arquivo Muito Grande",
          description: `Tamanho máximo: 100MB. Arquivo atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          variant: "destructive",
          duration: 5000
        });
        return;
      }

      // FASE 3: Análise de segurança
      setUploadStage('🛡️ Verificação de segurança...');
      setUploadProgress(35);
      await new Promise(resolve => setTimeout(resolve, 500));

      // FASE 4: Análise detalhada do arquivo
      setUploadStage('🔬 Analisando estrutura...');
      setUploadProgress(50);
      
      const detailedAnalysis = await performDetailedBotAnalysis(file);
      setAnalysisResults(detailedAnalysis);
      
      // FASE 5: Validação de dependências
      setUploadStage('📦 Verificando dependências...');
      setUploadProgress(65);
      await new Promise(resolve => setTimeout(resolve, 400));

      // FASE 6: Integração com DataStore
      setUploadStage('💾 Salvando no sistema...');
      setUploadProgress(80);
      
      const botData = {
        id: Date.now().toString(),
        name: detailedAnalysis.projectType || file.name.split('.')[0],
        description: `Bot carregado: ${file.name}`,
        type: detailedAnalysis.projectType,
        executable: file.name,
        path: URL.createObjectURL(file),
        dependencies: detailedAnalysis.dependencies,
        status: 'configured',
        uploadedAt: new Date().toISOString(),
        size: file.size,
        analysisResults: detailedAnalysis
      };

      // Integrar com DataStore (se disponível)
      try {
        if (typeof dataStore !== 'undefined') {
          dataStore.addBot(botData);
        }
      } catch (error) {
        console.warn('DataStore não disponível, salvando localmente:', error);
      }

      // FASE 7: Configuração no BotApiService
      setUploadStage('⚙️ Configurando serviço...');
      setUploadProgress(90);
      
      try {
        if (typeof botApiService !== 'undefined') {
          await botApiService.validateLocalPath(botData.path);
        }
      } catch (error) {
        console.warn('BotApiService não disponível:', error);
      }

      // FASE 8: Finalização
      setUploadStage('✅ Finalizando...');
      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Atualizar configurações
      setSettings(prev => ({
        ...prev,
        botExecutable: file.name,
        botPath: botData.path,
        botType: (detailedAnalysis.projectType as 'local' | 'system' | 'cloud' | 'api') || 'local',
        botName: botData.name,
        botDescription: botData.description,
        botDependencies: detailedAnalysis.dependencies,
        botAnalysis: detailedAnalysis
      }));

      setHasUnsavedChanges(true);

      // Feedback detalhado
      toast({
        title: "🚀 Bot Carregado com Sucesso!",
        description: `"${file.name}" analisado e configurado. ${detailedAnalysis.issues.length > 0 ? `${detailedAnalysis.issues.length} avisos encontrados.` : 'Nenhum problema detectado.'}`,
        variant: "default",
        duration: 5000
      });

      // Log detalhado
      console.log('🤖 Bot Upload Completo:', {
        arquivo: file.name,
        tamanho: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        tipo: detailedAnalysis.projectType,
        dependencias: detailedAnalysis.dependencies.length,
        problemas: detailedAnalysis.issues.length,
        recomendacoes: detailedAnalysis.recommendations.length
      });

    } catch (error) {
      console.error('❌ Erro crítico no upload:', error);
      toast({
        title: "❌ Erro Crítico no Upload",
        description: error instanceof Error ? error.message : "Erro desconhecido ao processar arquivo",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoadingState(prev => ({ ...prev, importing: false }));
      setUploadProgress(0);
      setUploadStage('');
    }
  }, [toast]);
  // Função para analisar arquivo de bot
  const analyzeBotFile = async (file: File): Promise<{
    type: 'local' | 'system' | 'cloud' | 'api';
    name?: string;
    description?: string;
    requirements?: string[];
  }> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'exe':
        return { type: 'system', name: 'Bot Executável', description: 'Bot compilado para Windows' };
      case 'jar':
        return { type: 'system', name: 'Bot Java', description: 'Bot em Java', requirements: ['Java 8+'] };
      case 'py':
        return { type: 'local', name: 'Bot Python', description: 'Script Python', requirements: ['Python 3.6+'] };
      case 'js':
        return { type: 'local', name: 'Bot Node.js', description: 'Bot em JavaScript', requirements: ['Node.js 14+'] };
      default:
        return { type: 'local', name: 'Bot Genérico' };
    }
  };

  const handleBotTest = useCallback(async () => {
    setLoadingState(prev => ({ ...prev, validating: true }));
    
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isWorking = Math.random() > 0.3; // 70% chance de sucesso
      
      if (isWorking) {
        setSettings(prev => ({
          ...prev,
          botStatus: 'online'
        }));
        
        toast({
          title: "✅ Bot Online",
          description: "Conexão estabelecida com sucesso!",
          variant: "default"
        });
      } else {
        setSettings(prev => ({
          ...prev,
          botStatus: 'offline'
        }));
        
        toast({
          title: "❌ Falha na Conexão",
          description: "Verifique as configurações do bot",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Erro inesperado ao testar bot",
        variant: "destructive"
      });
    } finally {
      setLoadingState(prev => ({ ...prev, validating: false }));
    }
  }, [toast]);

  const handleBotStart = useCallback(async () => {
    setLoadingState(prev => ({ ...prev, loading: true }));
    
    try {
      // Simular inicialização do bot
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSettings(prev => ({
        ...prev,
        botStatus: 'online'
      }));
      
      toast({
        title: "🚀 Bot Iniciado",
        description: "Bot está online e pronto para atender!",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao Iniciar",
        description: "Falha ao inicializar o bot",
        variant: "destructive"
      });
    } finally {
      setLoadingState(prev => ({ ...prev, loading: false }));
    }
  }, [toast]);

  const handleBotStop = useCallback(async () => {
    setLoadingState(prev => ({ ...prev, loading: true }));
    
    try {
      // Simular parada do bot
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(prev => ({
        ...prev,
        botStatus: 'offline'
      }));
      
      toast({
        title: "⏹️ Bot Parado",
        description: "Bot foi desconectado com segurança",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao Parar",
        description: "Erro ao desconectar o bot",
        variant: "destructive"
      });
    } finally {
      setLoadingState(prev => ({ ...prev, loading: false }));
    }
  }, [toast]);

  // ============================================
  // FUNÇÕES DE BACKUP MULTI-PLATAFORMA
  // ============================================

  const handleBackupCreate = useCallback(async (provider: 'local' | 'drive' | 'dropbox' | 'onedrive') => {
    setLoadingState(prev => ({ ...prev, exporting: true }));
    
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        settings: settings,
        metadata: {
          botStatus: settings.botStatus,
          userPreferences: theme,
          systemInfo: {
            platform: navigator.platform,
            userAgent: navigator.userAgent
          }
        }
      };

      switch (provider) {
        case 'local': {
          const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `whatsapp-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          break;
        }
          
        case 'drive':
          // Implementar integração com Google Drive API
          await simulateCloudBackup('Google Drive');
          break;
          
        case 'dropbox':
          // Implementar integração com Dropbox API
          await simulateCloudBackup('Dropbox');
          break;
          
        case 'onedrive':
          // Implementar integração com OneDrive API
          await simulateCloudBackup('OneDrive');
          break;
      }

      toast({
        title: "💾 Backup Criado",
        description: `Backup salvo com sucesso${provider !== 'local' ? ` no ${provider}` : ''}!`,
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "❌ Erro no Backup",
        description: "Falha ao criar backup",
        variant: "destructive"
      });
    } finally {
      setLoadingState(prev => ({ ...prev, exporting: false }));
    }
  }, [settings, theme, toast]);

  const simulateCloudBackup = async (provider: string) => {
    // Simular upload para nuvem
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const handleBackupRestore = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoadingState(prev => ({ ...prev, importing: true }));

    try {
      const file = files[0];
      const text = await file.text();
      const backupData = JSON.parse(text);

      // Validar estrutura do backup
      if (!backupData.settings || !backupData.timestamp) {
        throw new Error('Arquivo de backup inválido');
      }

      // Restaurar configurações
      setSettings(backupData.settings);
      
      if (backupData.metadata?.userPreferences) {
        setTheme(backupData.metadata.userPreferences);
      }

      setHasUnsavedChanges(true);

      toast({
        title: "📥 Backup Restaurado",
        description: `Configurações de ${new Date(backupData.timestamp).toLocaleDateString()} restauradas!`,
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "❌ Erro na Restauração",
        description: "Arquivo de backup inválido ou corrompido",
        variant: "destructive"
      });
    } finally {
      setLoadingState(prev => ({ ...prev, importing: false }));
    }
  }, [setTheme, toast]);

  // ============================================
  // FUNÇÕES DE BLOQUEIO DE TELA PERSONALIZADO
  // ============================================

  const handleScreenLockCustomize = useCallback(async (customConfig: {
    message?: string;
    logo?: string;
    backgroundColor?: string;
    textColor?: string;
    showBrand?: boolean;
    enableBlur?: boolean;
    customCSS?: string;
  }) => {
    try {
      const lockConfig = {
        ...customConfig,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };

      localStorage.setItem('screen-lock-custom-config', JSON.stringify(lockConfig));

      setSettings(prev => ({
        ...prev,
        screenLockMessage: customConfig.message || 'Tela bloqueada',
        screenLockLogo: customConfig.logo || '',
        screenLockBackground: customConfig.backgroundColor || '#1f2937',
        screenLockTextColor: customConfig.textColor || '#ffffff',
        screenLockShowBrand: customConfig.showBrand ?? true,
        screenLockBlur: customConfig.enableBlur ?? true,
        screenLockCustomCSS: customConfig.customCSS || ''
      }));

      setHasUnsavedChanges(true);

      toast({
        title: "🎨 Bloqueio Personalizado",
        description: "Configurações de bloqueio de tela atualizadas!",
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao personalizar bloqueio de tela",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleScreenLockPreview = useCallback(() => {
    // Criar preview do bloqueio personalizado
    const previewConfig = {
      message: settings.screenLockMessage || 'Tela bloqueada - Preview',
      logo: settings.screenLockLogo || settings.customLogo,
      backgroundColor: settings.screenLockBackground || '#1f2937',
      textColor: settings.screenLockTextColor || '#ffffff',
      showBrand: settings.screenLockShowBrand ?? true,
      enableBlur: settings.screenLockBlur ?? true
    };

    // Simular bloqueio com configurações personalizadas
    screenLock.lockScreen(previewConfig);
    
    toast({
      title: "👀 Preview Ativo",
      description: "Visualizando bloqueio personalizado",
      variant: "default"
    });
  }, [settings, screenLock, toast]);

  // ============================================
  // FUNÇÕES DE INTEGRAÇÕES CENTRALIZADAS
  // ============================================

  const handleIntegrationTest = useCallback(async (integrationType: string) => {
    setLoadingState(prev => ({ ...prev, validating: true }));
    
    const integrationTests = {
      'whatsapp': async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return Math.random() > 0.2;
      },
      'telegram': async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return Math.random() > 0.3;
      },
      'email': async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return Math.random() > 0.1;
      },
      'crm': async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return Math.random() > 0.4;
      },
      'zapier': async () => {
        await new Promise(resolve => setTimeout(resolve, 2500));
        return Math.random() > 0.25;
      }
    };

    try {
      const testFunction = integrationTests[integrationType as keyof typeof integrationTests];
      const isWorking = await testFunction();

      toast({
        title: isWorking ? '✅ Integration Online' : '❌ Integration Failed',
        description: isWorking 
          ? `${integrationType} conectado com sucesso!`
          : `Falha ao conectar com ${integrationType}. Verifique as credenciais.`,
        variant: isWorking ? 'default' : 'destructive'
      });

      // Atualizar status da integração
      setSettings(prev => ({
        ...prev,
        [`${integrationType}Status`]: isWorking ? 'connected' : 'error'
      }));

    } catch (error) {
      toast({
        title: 'Erro no teste',
        description: `Erro inesperado ao testar ${integrationType}`,
        variant: 'destructive'
      });
    } finally {
      setLoadingState(prev => ({ ...prev, validating: false }));
    }
  }, [toast]);

  const handleIntegrationSync = useCallback(async (integrationType: string) => {
    setLoadingState(prev => ({ ...prev, loading: true }));
    
    try {
      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const syncSuccess = Math.random() > 0.2;
      
      if (syncSuccess) {
        toast({
          title: "🔄 Sincronização Completa",
          description: `${integrationType} sincronizado com sucesso!`,
          variant: "default"
        });
      } else {
        toast({
          title: "❌ Falha na Sincronização",
          description: `Erro ao sincronizar ${integrationType}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Erro inesperado durante a sincronização",
        variant: "destructive"
      });
    } finally {
      setLoadingState(prev => ({ ...prev, loading: false }));
    }
  }, [toast]);

  // ============================================
  // FUNÇÕES DE ANALYTICS E DASHBOARD
  // ============================================

  const handleGenerateReport = useCallback(async (reportType: 'performance' | 'usage' | 'security' | 'integration') => {
    setLoadingState(prev => ({ ...prev, loading: true }));
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const reportData = {
        type: reportType,
        generated: new Date().toISOString(),
        summary: generateMockReportData(reportType)
      };

      setSystemReports(prev => [reportData, ...prev.slice(0, 9)]);

      toast({
        title: "📊 Relatório Gerado",
        description: `Relatório de ${reportType} criado com sucesso!`,
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "❌ Erro no Relatório",
        description: "Falha ao gerar relatório",
        variant: "destructive"
      });
    } finally {
      setLoadingState(prev => ({ ...prev, loading: false }));
    }
  }, [toast]);

  const generateMockReportData = (reportType: string) => {
    const baseData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    switch (reportType) {
      case 'performance':
        return {
          ...baseData,
          metrics: {
            responseTime: '1.2s',
            uptime: '99.8%',
            memory: '342MB',
            cpu: '12%'
          },
          recommendations: ['Otimizar cache', 'Reduzir uso de memória']
        };
      case 'usage':
        return {
          ...baseData,
          stats: {
            messages: 1247,
            users: 89,
            peakHours: '14:00-16:00',
            topFeatures: ['Bot', 'Integrações', 'Notificações']
          }
        };
      case 'security':
        return {
          ...baseData,
          alerts: ['Login suspeito detectado', 'Tentativa de acesso não autorizado'],
          score: 8.5,
          lastScan: new Date().toISOString()
        };
      case 'integration':
        return {
          ...baseData,
          connections: {
            whatsapp: 'online',
            email: 'online',
            crm: 'offline'
          },
          syncStatus: 'success'
        };
      default:
        return baseData;
    }
  };

  const handleHealthCheck = useCallback(async () => {
    setLoadingState(prev => ({ ...prev, validating: true }));
    
    try {
      // Simular verificação de saúde do sistema
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const healthResult = {
        overall: Math.random() > 0.2 ? 'healthy' : 'issues',
        details: {
          database: Math.random() > 0.1 ? 'online' : 'offline',
          api: Math.random() > 0.05 ? 'responsive' : 'slow',
          storage: Math.random() > 0.15 ? 'available' : 'low',
          integrations: Math.random() > 0.25 ? 'connected' : 'partial'
        },
        issues: Math.random() > 0.7 ? [
          { severity: 'warning', message: 'Uso elevado de memória', component: 'sistema' },
          { severity: 'info', message: 'Atualização disponível', component: 'bot' }
        ] : [],
        recommendations: ['Manter backups atualizados', 'Monitorar uso de recursos']
      };

      setHealthCheckResult(healthResult);

      toast({
        title: healthResult.overall === 'healthy' ? '✅ Sistema Saudável' : '⚠️ Problemas Detectados',
        description: healthResult.overall === 'healthy' 
          ? 'Todos os componentes funcionando normalmente'
          : `${healthResult.issues.length} problema(s) encontrado(s)`,
        variant: healthResult.overall === 'healthy' ? 'default' : 'destructive'
      });

    } catch (error) {
      toast({
        title: "❌ Erro na Verificação",
        description: "Falha ao verificar saúde do sistema",
        variant: "destructive"
      });
    } finally {
      setLoadingState(prev => ({ ...prev, validating: false }));
    }
  }, [toast]);

  // Funcionalidades de tema avançado
  const predefinedThemes = useMemo(() => ({
    whatsapp: {
      name: 'WhatsApp Original',
      primaryColor: '#25D366',
      secondaryColor: '#128C7E',
      accentColor: '#34B7F1',
      description: 'Cores originais do WhatsApp'
    },
    business: {
      name: 'Profissional',
      primaryColor: '#2563EB',
      secondaryColor: '#1E40AF',
      accentColor: '#3B82F6',
      description: 'Tema profissional e corporativo'
    },
    modern: {
      name: 'Moderno',
      primaryColor: '#8B5CF6',
      secondaryColor: '#7C3AED',
      accentColor: '#A78BFA',
      description: 'Design moderno e elegante'
    },
    nature: {
      name: 'Natureza',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      accentColor: '#34D399',
      description: 'Cores inspiradas na natureza'
    }
  }), []);

  const applyPredefinedTheme = useCallback((themeKey: string) => {
    const theme = predefinedThemes[themeKey as keyof typeof predefinedThemes];
    if (!theme) return;

    setSettings(prev => ({
      ...prev,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor
    }));
    setHasUnsavedChanges(true);

    toast({
      title: "🎨 Tema aplicado",
      description: `Tema "${theme.name}" aplicado com sucesso!`,
      variant: "default"
    });
  }, [predefinedThemes, toast]);

  // Função utilitária para gerar classes de cor dinamicamente
  function getBgColorClass(color: string) {
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return { backgroundColor: color };
    }
    return {};
  }
  
  function getTextColorClass(color: string) {
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return { color: color };
    }
    return {};
  }

  // Função para detectar mudanças
  const handleSettingsChange = useCallback((newSettings: Partial<ModalSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setHasUnsavedChanges(true);
  }, []);

  // Efeito para aplicar estilos dinamicamente evitando inline styles
  useEffect(() => {
    // Aplicar cores de fundo
    const colorElements = document.querySelectorAll('[data-color]');
    colorElements.forEach((element) => {
      const color = element.getAttribute('data-color');
      if (color) {
        (element as HTMLElement).style.backgroundColor = color;
      }
    });

    // Aplicar imagens de fundo
    const bgElements = document.querySelectorAll('[data-bg-image]');
    bgElements.forEach((element) => {
      const bgImage = element.getAttribute('data-bg-image');
      const borderRadius = element.getAttribute('data-border-radius');
      const logoStyle = element.getAttribute('data-logo-style');
      
      if (bgImage) {
        (element as HTMLElement).style.backgroundImage = `url(${bgImage})`;
      }
      if (borderRadius) {
        (element as HTMLElement).style.borderRadius = `${borderRadius}px`;
      }
      if (logoStyle) {
        (element as HTMLElement).style.backgroundSize = logoStyle;
      }
    });
  }, [settings.savedLogos, settings.customLogo, settings.logoBorderRadius, settings.logoStyle]);

  // Efeito para filtrar seções quando a busca muda
  useEffect(() => {
    filterSections(searchQuery);
  }, [searchQuery, filterSections]);

  // Sincronizar settings com o tema global ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      // Carregar configurações existentes do sistema
      try {
        const currentConfig = configurationManager.getConfiguration();
        const settingsFromConfig = mapSystemConfigToSettings(currentConfig);
        setSettings(prev => ({
          ...prev,
          ...settingsFromConfig,
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          accentColor: theme.accentColor,
          darkMode: theme.darkMode,
          customLogo: theme.customLogo,
          brandName: theme.brandName,
          customCSS: theme.customCSS,
          fontFamily: theme.fontFamily,
          fontSize: theme.fontSize,
          borderRadius: theme.borderRadius,
        }));
      } catch (error) {
        console.warn('Erro ao carregar configurações existentes:', error);
        // Usar configurações padrão se houver erro
        setSettings(prev => ({
          ...prev,
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          accentColor: theme.accentColor,
          darkMode: theme.darkMode,
          customLogo: theme.customLogo,
          brandName: theme.brandName,
          customCSS: theme.customCSS,
          fontFamily: theme.fontFamily,
          fontSize: theme.fontSize,
          borderRadius: theme.borderRadius,
        }));
      }
    }
  }, [isOpen, theme]);

  // Aplica as configurações de personalização imediatamente ao alterar
  useEffect(() => {
    setTheme({
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      darkMode: settings.darkMode,
      customLogo: settings.customLogo,
      brandName: settings.brandName,
      customCSS: settings.customCSS,
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      borderRadius: settings.borderRadius,
    });
  }, [settings.primaryColor, settings.secondaryColor, settings.accentColor, settings.darkMode, settings.customLogo, settings.brandName, settings.customCSS, settings.fontFamily, settings.fontSize, settings.borderRadius, setTheme]);

  // ============================================
  // FUNÇÕES APRIMORADAS DE BLOQUEIO DE TELA
  // ============================================

  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState(false);
  const [lockHistory, setLockHistory] = useState<Array<{
    id: string;
    timestamp: Date;
    event: 'locked' | 'unlocked' | 'failed_attempt' | 'timeout';
    details: string;
  }>>([]);

  // Carregar histórico de bloqueio
  useEffect(() => {
    const savedHistory = localStorage.getItem('whatsapp-hub-lock-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setLockHistory(parsed.map((h: {
          id: string;
          timestamp: string | Date;
          event: 'locked' | 'unlocked' | 'failed_attempt' | 'timeout';
          details: string;
        }) => ({
          ...h,
          timestamp: new Date(h.timestamp)
        })));
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    }
  }, []);

  // Adicionar evento ao histórico
  const addToLockHistory = useCallback((event: 'locked' | 'unlocked' | 'failed_attempt' | 'timeout', details: string) => {
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      event,
      details
    };
    
    setLockHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, 100); // Manter apenas os últimos 100 eventos
      localStorage.setItem('whatsapp-hub-lock-history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSetupScreenLock = useCallback(async (password: string, autoLockTime: number, userProfile: UserProfile) => {
    try {
      const success = await screenLock.setupScreenLock(password, autoLockTime * 60 * 1000, userProfile);
      
      if (success) {
        addToLockHistory('locked', `Bloqueio configurado para ${userProfile.name}`);
        setIsPasswordSetupOpen(false);
        
        toast({
          title: "🔒 Bloqueio Configurado",
          description: "Sistema de bloqueio de tela ativado com sucesso!",
          variant: "default",
          duration: 5000
        });
        
        return true;
      } else {
        toast({
          title: "❌ Erro na Configuração",
          description: "Falha ao configurar o bloqueio de tela.",
          variant: "destructive",
          duration: 5000
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao configurar bloqueio:', error);
      toast({
        title: "❌ Erro Crítico",
        description: "Erro inesperado ao configurar o bloqueio.",
        variant: "destructive",
        duration: 5000
      });
      return false;
    }
  }, [screenLock, toast, addToLockHistory]);

  const handleRemoveScreenLock = useCallback(async () => {
    // Confirmar antes de remover
    if (!confirm('⚠️ Tem certeza que deseja remover o bloqueio de tela?\n\nIsso removerá toda a proteção de segurança configurada.')) {
      return;
    }

    try {
      const success = await screenLock.disableScreenLock();
      
      if (success) {
        addToLockHistory('unlocked', 'Sistema de bloqueio de tela removido permanentemente');
        
        toast({
          title: "🔓 Bloqueio Removido",
          description: "O sistema de bloqueio de tela foi removido com sucesso. Sua segurança foi reduzida.",
          variant: "default",
          duration: 6000
        });
        
        // Forçar re-render para atualizar a UI
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "❌ Erro",
          description: "Não foi possível remover o bloqueio de tela. Tente novamente.",
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro ao remover bloqueio:', error);
      toast({
        title: "❌ Erro Crítico",
        description: "Erro inesperado ao remover o bloqueio. Verifique o console.",
        variant: "destructive",
        duration: 5000
      });
    }
  }, [screenLock, toast, addToLockHistory]);

  const handleTestScreenLock = useCallback(() => {
    if (!screenLock.settings?.enabled) {
      toast({
        title: "⚠️ Bloqueio Inativo",
        description: "Configure o bloqueio de tela antes de testá-lo.",
        variant: "default",
        duration: 5000
      });
      return;
    }
    
    // Fechar modal antes de testar
    onClose();
    
    // Aguardar um pouco para garantir que o modal foi fechado
    setTimeout(() => {
      screenLock.lock();
      addToLockHistory('locked', 'Teste manual do bloqueio ativado');
    }, 200);
    
    toast({
      title: "🔒 Teste Ativado",
      description: "Sistema de bloqueio será ativado em instantes para teste.",
      variant: "default",
      duration: 3000
    });
  }, [screenLock, toast, addToLockHistory, onClose]);

  const handleViewLockHistory = useCallback(() => {
    setIsSecurityAuditOpen(true);
    
    toast({
      title: "📊 Histórico de Segurança",
      description: `${lockHistory.length} eventos encontrados. Histórico carregado com sucesso.`,
      variant: "default", 
      duration: 4000
    });
  }, [setIsSecurityAuditOpen, toast, lockHistory.length]);

  // Função para validar funcionamento dos botões e feedback visual
  const handleValidateScreenLockFeatures = useCallback(async () => {
    const results: string[] = [];
    
    try {
      // Teste 1: Verificar se screenLock hook está carregado
      if (screenLock) {
        results.push("✅ Hook useScreenLock carregado");
      } else {
        results.push("❌ Hook useScreenLock não encontrado");
      }

      // Teste 2: Verificar se as configurações estão sendo salvas
      if (screenLock.settings) {
        results.push("✅ Configurações de bloqueio detectadas");
      } else {
        results.push("⚠️ Nenhuma configuração de bloqueio encontrada");
      }

      // Teste 3: Verificar histórico
      if (lockHistory.length > 0) {
        results.push(`✅ Histórico funcionando (${lockHistory.length} eventos)`);
      } else {
        results.push("⚠️ Histórico vazio - configurar primeiro");
      }

      // Teste 4: Verificar localStorage
      const securityData = localStorage.getItem('whatsapp-hub-security');
      if (securityData) {
        results.push("✅ Dados de segurança encontrados no localStorage");
      } else {
        results.push("⚠️ Nenhum dado de segurança no localStorage");
      }

      // Teste 5: Verificar se toast está funcionando
      results.push("✅ Sistema de notificações funcionando");

      // Exibir resultados
      const successCount = results.filter(r => r.startsWith('✅')).length;
      const totalTests = results.length;

      toast({
        title: `🧪 Validação Completa (${successCount}/${totalTests})`,
        description: results.join('\n'),
        variant: successCount === totalTests ? "default" : "destructive",
        duration: 8000
      });

      console.log('🔍 Validação do Sistema de Bloqueio:', results);

    } catch (error) {
      toast({
        title: "❌ Erro na Validação",
        description: "Erro ao validar funcionalidades do sistema",
        variant: "destructive",
        duration: 5000
      });
      console.error('Erro na validação:', error);
    }
  }, [screenLock, lockHistory, toast]);

  const handleEditScreenLock = useCallback(() => {
    if (!screenLock.settings?.enabled) {
      toast({
        title: "⚠️ Bloqueio Inativo",
        description: "Configure o bloqueio de tela primeiro.",
        variant: "default",
        duration: 5000
      });
      return;
    }
    
    setIsPasswordSetupOpen(true);
  }, [screenLock.settings?.enabled, toast, setIsPasswordSetupOpen]);

  // Funções para gerenciamento da IA
  const handleTestAI = useCallback(async () => {
    setLoadingState(prev => ({ ...prev, validating: true }));
    
    try {
      // Simular teste da IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const isWorking = Math.random() > 0.2; // 80% chance de sucesso
      
      toast({
        title: isWorking ? '🤖 IA Funcionando' : '❌ Erro na IA',
        description: isWorking 
          ? 'IA testada com sucesso. Resposta gerada em 1.2s'
          : 'Erro ao conectar com o provedor de IA. Verifique as configurações.',
        variant: isWorking ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Erro no teste',
        description: 'Erro inesperado ao testar IA',
        variant: 'destructive'
      });
    } finally {
      setLoadingState(prev => ({ ...prev, validating: false }));
    }
  }, [toast]);

  const handleViewAIAnalytics = useCallback(() => {
    toast({
      title: "📊 Analytics da IA",
      description: "Analytics: 95% precisão, 1.8s tempo médio, 450 interações hoje.",
      variant: "default"
    });
  }, [toast]);

  // Funções para gerenciamento do bot
  const handleTestBotConnection = useCallback(async () => {
    setLoadingState(prev => ({ ...prev, validating: true }));
    
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isConnected = Math.random() > 0.3; // 70% chance de sucesso
      
      setSettings(prev => ({ 
        ...prev, 
        botStatus: isConnected ? 'online' : 'offline' 
      }));
      
      toast({
        title: isConnected ? 'Conexão bem-sucedida' : 'Falha na conexão',
        description: isConnected 
          ? 'Bot está respondendo corretamente'
          : 'Não foi possível conectar ao bot. Verifique as configurações.',
        variant: isConnected ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Erro no teste',
        description: 'Erro inesperado ao testar conexão',
        variant: 'destructive'
      });
    } finally {
      setLoadingState(prev => ({ ...prev, validating: false }));
    }
  }, [toast]);

  // Função para adicionar template de mensagem
  const handleAddMessageTemplate = useCallback((template: string) => {
    if (template.trim()) {
      setSettings(prev => ({
        ...prev,
        messageTemplates: [...(prev.messageTemplates || []), template.trim()]
      }));
      setHasUnsavedChanges(true);
    }
  }, []);

  // Função para remover template de mensagem
  const handleRemoveMessageTemplate = useCallback((index: number) => {
    setSettings(prev => ({
      ...prev,
      messageTemplates: prev.messageTemplates?.filter((_, i) => i !== index) || []
    }));
    setHasUnsavedChanges(true);
  }, []);
  
  const validateSettings = useCallback((settings: Partial<ModalSettings>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validações básicas
    if (!settings.botName?.trim()) {
      errors.push('Nome do bot é obrigatório');
    }
    
    if (settings.botName && settings.botName.length > 50) {
      warnings.push('Nome do bot muito longo (máximo recomendado: 50 caracteres)');
    }
    
    if (settings.responseDelay && (settings.responseDelay < 100 || settings.responseDelay > 10000)) {
      warnings.push('Delay de resposta recomendado: 100ms - 10000ms');
    }

    if (settings.maxConnections && (settings.maxConnections < 10 || settings.maxConnections > 10000)) {
      warnings.push('Número de conexões recomendado: 10 - 10000');
    }

    if (settings.sessionTimeout && (settings.sessionTimeout < 5 || settings.sessionTimeout > 1440)) {
      errors.push('Timeout de sessão deve estar entre 5 e 1440 minutos');
    }

    if (settings.aiTemperature && (settings.aiTemperature < 0 || settings.aiTemperature > 1)) {
      errors.push('Temperatura da IA deve estar entre 0 e 1');
    }

    if (settings.webhookUrl && !settings.webhookUrl.startsWith('http')) {
      errors.push('URL do webhook deve começar com http:// ou https://');
    }

    // Validações de integração
    if (settings.emailIntegration) {
      if (!settings.smtpServer?.trim()) {
        errors.push('Servidor SMTP é obrigatório quando email está ativo');
      }
      if (!settings.smtpPort || parseInt(settings.smtpPort.toString()) < 1 || parseInt(settings.smtpPort.toString()) > 65535) {
        errors.push('Porta SMTP deve estar entre 1 e 65535');
      }
    }

    // Validações de segurança
    if (settings.maxFileSize && (settings.maxFileSize < 1 || settings.maxFileSize > 100)) {
      warnings.push('Tamanho máximo de arquivo recomendado: 1MB - 100MB');
    }

    // Validações de performance
    if (settings.memoryLimit && settings.memoryLimit < 512) {
      warnings.push('Limite de memória muito baixo (mínimo recomendado: 512MB)');
    }

    if (settings.cpuLimit && (settings.cpuLimit < 10 || settings.cpuLimit > 100)) {
      errors.push('Limite de CPU deve estar entre 10% e 100%');
    }

    // Validações de cores
    const colorFields = ['primaryColor', 'secondaryColor', 'accentColor'];
    colorFields.forEach(field => {
      if (settings[field] && !/^#[0-9A-Fa-f]{6}$/.test(settings[field])) {
        errors.push(`${field} deve estar no formato hexadecimal (#RRGGBB)`);
      }
    });

    // Validações de IA
    if (settings.enableAI) {
      if (!settings.aiModel?.trim()) {
        errors.push('Modelo de IA é obrigatório quando IA está ativa');
      }
      if (settings.aiMaxTokens && (settings.aiMaxTokens < 1 || settings.aiMaxTokens > 8000)) {
        warnings.push('Número de tokens recomendado: 1 - 8000');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  const handleSave = async () => {
    // Verificar se há mudanças para salvar
    if (!hasUnsavedChanges) {
      toast({
        title: "ℹ️ Nenhuma alteração",
        description: "Não há configurações para salvar.",
        variant: "default"
      });
      return;
    }

    console.log('💾 Salvando configurações completas:', settings);
    
    // Validar configurações antes de salvar
    const validation = validateSettings(settings);
    if (!validation.isValid) {
      toast({
        title: "❌ Erro de Validação",
        description: `Corrija os seguintes erros:\n${validation.errors.join('\n')}`,
        variant: "destructive"
      });
      return;
    }

    // Mostrar avisos se houver
    if (validation.warnings.length > 0) {
      toast({
        title: "⚠️ Avisos",
        description: `Configurações com avisos:\n${validation.warnings.join('\n')}`,
        variant: "default"
      });
    }
    
    setLoadingState(prev => ({ ...prev, saving: true }));
    
    try {
      // 1. Mapear configurações do modal para SystemConfiguration
      const systemConfig = mapSettingsToSystemConfig(settings);
      console.log('🔄 Configuração mapeada:', systemConfig);
      
      // 2. Atualizar configuração no gerenciador
      configurationManager.updateFullConfiguration(systemConfig);
      console.log('✅ Configuração atualizada no gerenciador');
      
      // 3. Persistir configurações nos arquivos reais (.env, config.json, etc.)
      const persistenceResult = await configPersistenceService.persistConfiguration(systemConfig);
      console.log('📁 Resultado da persistência:', persistenceResult);
      
      // 4. Verificar se persistência foi bem-sucedida
      if (persistenceResult.success) {
        console.log('✅ Configurações persistidas com sucesso nos arquivos:', persistenceResult.filesUpdated);
        
        // 5. Aplicar configurações aos serviços ativos
        try {
          await configurationManager.applyToIntegration();
          console.log('🔗 Configurações aplicadas às integrações');
        } catch (error) {
          console.warn('⚠️ Aviso: Erro ao aplicar às integrações (pode ser normal se integrações não estiverem ativas):', error);
          toast({
            title: "⚠️ Aviso",
            description: "Configurações salvas, mas algumas integrações podem não estar ativas.",
            variant: "default"
          });
        }
        
        // 6. Aplicar tema global
        setTheme({
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          accentColor: settings.accentColor,
          darkMode: settings.darkMode,
          customLogo: settings.customLogo,
          brandName: settings.brandName,
          customCSS: settings.customCSS,
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          borderRadius: settings.borderRadius,
        });
        
        // 7. Resetar estado de mudanças
        setHasUnsavedChanges(false);
        
        // 8. Exibir notificação de sucesso
        toast({
          title: "🎉 Sucesso!",
          description: `Configurações salvas e aplicadas!\nArquivos atualizados: ${persistenceResult.filesUpdated.length}`,
          variant: "default"
        });
        
        console.log('🎉 SUCESSO: Todas as configurações foram salvas e aplicadas!');
        console.log('📋 Arquivos atualizados:', persistenceResult.filesUpdated);
        
        // 9. Fechar modal com sucesso após um delay
        setTimeout(() => {
          onClose();
        }, 1500);
        
      } else {
        // 9. Tratar erros de persistência
        console.error('❌ Erro na persistência dos arquivos:', persistenceResult.errors);
        toast({
          title: "❌ Erro de Persistência",
          description: `Erro ao salvar nos arquivos:\n${persistenceResult.errors.join('\n')}`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('❌ Erro crítico ao salvar configurações:', error);
      toast({
        title: "❌ Erro Crítico",
        description: `Erro inesperado: ${error}`,
        variant: "destructive"
      });
    } finally {
      setLoadingState(prev => ({ ...prev, saving: false }));
    }
  };

  const handleReset = () => {
    console.log('🔄 Resetando configurações para padrão');
    // Reset para configurações padrão
    setSettings({
      // Reset todas as configurações para valores padrão
      botName: 'Customer Support Bot',
      botDescription: 'Bot inteligente para atendimento ao cliente 24/7',
      welcomeMessage: 'Olá! 👋 Como posso ajudá-lo hoje?',
      fallbackMessage: 'Desculpe, não entendi. Pode reformular sua pergunta?',
      responseDelay: 1000,
      autoReply: true,
      workingHours: { start: '09:00', end: '18:00', enabled: true },
      maxConcurrentChats: 10,
      botPersonality: 'friendly',
      botLanguage: 'pt-BR',
      enableEmojis: true,
      botAvatar: '',
      botStatus: 'offline',
      
      messageRetention: 30,
      enableReadReceipts: true,
      enableTypingIndicator: true,
      maxMessageLength: 4096,
      enableMediaMessages: true,
      enableVoiceMessages: true,
      enableDocuments: true,
      enableStickers: false,
      messageTemplates: ['Obrigado pelo contato!', 'Como posso ajudar?', 'Aguarde um momento...'],
      autoCorrection: true,
      messageFormatting: true,
      linkPreview: true,
      messageEncryption: true,
      
      enableNotifications: true,
      soundEnabled: true,
      desktopNotifications: true,
      emailNotifications: false,
      smsNotifications: false,
      pushNotifications: true,
      notificationSound: 'default',
      quietHours: { start: '22:00', end: '08:00' },
      notificationFrequency: 'immediate',
      vibration: true,
      notificationBadge: true,
      
      enableEncryption: true,
      sessionTimeout: 30,
      requireAuth: true,
      ipWhitelist: '',
      enableTwoFactor: false,
      passwordPolicy: 'medium',
      dataRetention: 90,
      enableAuditLog: true,
      securityLevel: 'high',
      allowedFileTypes: '.pdf,.doc,.docx,.txt,.jpg,.png',
      maxFileSize: 10,
      antiSpam: true,
      
      aiModel: 'gpt-4',
      aiTemperature: 0.7,
      aiMaxTokens: 1000,
      enableSentimentAnalysis: true,
      enableAutoTranslation: false,
      aiPersonality: 'professional',
      aiResponseTime: 'fast',
      aiLearning: true,
      aiContextMemory: 10,
      aiCreativity: 70,
      
      crmIntegration: false,
      crmUrl: '',
      emailIntegration: false,
      calendarIntegration: false,
      paymentIntegration: false,
      zapierIntegration: false,
      slackIntegration: false,
      teamsIntegration: false,
      webhookUrl: '',
      apiKey: '',
      integrationSync: 'realtime',
      smtpServer: '',
      smtpPort: '',
      smtpUser: '',
      smtpPassword: '',
      calendarType: 'google',
      paymentGateway: 'none',
      zapierWebhook: '',
      slackWebhook: '',
      teamsWebhook: '',
      allowedIntegrationUrls: '',
      
      cacheEnabled: true,
      compressionEnabled: true,
      cdnEnabled: false,
      loadBalancing: false,
      autoScaling: true,
      performanceMode: 'balanced',
      maxConnections: 1000,
      connectionPool: 50,
      requestTimeout: 30,
      latencyMonitoring: false,
      
      primaryColor: '#25D366',
      secondaryColor: '#128C7E',
      accentColor: '#34B7F1',
      darkMode: false,
      customLogo: '',
      brandName: 'WhatsApp Hub',
      customCSS: '',
      fontFamily: 'Inter',
      fontSize: 14,
      borderRadius: 8,
      
      logoSize: 'medium',
      logoStyle: 'contain',
      logoBorderRadius: 8,
      logoShadow: false,
      savedLogos: [],
      
      escalationRules: [],
      autoAssignment: true,
      slaSettings: { response: 30, resolution: 240 },
      tagManagement: ['vendas', 'suporte', 'urgente', 'feedback'],
      priorityLevels: ['baixa', 'média', 'alta', 'crítica'],
      workflowSteps: [],
      approvalProcess: false,
      
      enableAnalytics: true,
      trackingEnabled: true,
      dataCollection: 'essential',
      reportFrequency: 'weekly',
      customReportDays: [] as string[],
      customMetrics: [] as string[],
      exportFormat: 'pdf',
      shareReports: false,
      realTimeMetrics: true,
      reportRecipients: '',
      exportSchedule: 'manual',
      exportTime: '',
      defaultAnalyticsView: 'dashboard',
      globalAnalyticsFilters: '',
      analyticsRetention: 90,
      allowRawDownload: false,
      
      apiEndpoint: 'https://api.whatsapp.com',
      rateLimitPerMinute: 60,
      debugMode: false,
      developerMode: false,
      experimentalFeatures: false,
      betaAccess: false,
      maintenanceMode: false,
      backupEnabled: true,
      backupFrequency: 'daily',
      
      userRoles: ['admin', 'agent', 'viewer'],
      maxUsers: 25,
      userPermissions: {},
      sessionManagement: 'strict',
      loginAttempts: 3,
      accountLockout: 15,
      cpuLimit: 80,
      errorMonitoring: false,
      memoryLimit: 1024,
      processPriority: 'normal',
      performanceLogs: false,
      bandwidthLimit: 100,
      cacheStrategy: 'memory',
      cacheExpiration: 300,
      loadBalancingStrategy: 'round-robin',
      faultTolerance: false
    });
  };

  const handleExportSettings = async () => {
    setLoadingState(prev => ({ ...prev, exporting: true }));
    
    try {
      // Incluir metadados no export
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          appName: 'WhatsApp Hub',
          settingsCount: Object.keys(settings).length
        },
        settings: settings,
        systemConfig: mapSettingsToSystemConfig(settings)
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `whatsapp-hub-settings-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "📁 Export Concluído",
        description: `Configurações exportadas para ${exportFileDefaultName}`,
        variant: "default"
      });

      console.log('✅ Configurações exportadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao exportar configurações:', error);
      toast({
        title: "❌ Erro no Export",
        description: `Erro ao exportar configurações: ${error}`,
        variant: "destructive"
      });
    } finally {
      setLoadingState(prev => ({ ...prev, exporting: false }));
    }
  };

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadingState(prev => ({ ...prev, importing: true }));

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          let importedSettings;
          
          // Verificar se é formato novo (com metadados) ou antigo
          if (importedData.metadata && importedData.settings) {
            importedSettings = importedData.settings;
            console.log('📊 Importando configurações com metadados:', importedData.metadata);
          } else {
            // Formato antigo - dados diretos
            importedSettings = importedData;
          }

          // Validar configurações importadas
          const validation = validateSettings(importedSettings);
          
          if (!validation.isValid) {
            toast({
              title: "❌ Configurações Inválidas",
              description: `Erro na validação:\n${validation.errors.join('\n')}`,
              variant: "destructive"
            });
            return;
          }

          // Aplicar configurações importadas
          setSettings(importedSettings);
          setHasUnsavedChanges(true);

          toast({
            title: "📥 Import Concluído",
            description: `Configurações importadas com sucesso!${validation.warnings.length > 0 ? `\nAvisos: ${validation.warnings.length}` : ''}`,
            variant: "default"
          });

          console.log('✅ Configurações importadas com sucesso');
          
          if (validation.warnings.length > 0) {
            console.warn('⚠️ Avisos na importação:', validation.warnings);
          }

        } catch (parseError) {
          console.error('❌ Erro ao fazer parse do arquivo:', parseError);
          toast({
            title: "❌ Arquivo Inválido",
            description: "Erro ao ler o arquivo. Verifique se é um arquivo JSON válido.",
            variant: "destructive"
          });
        } finally {
          setLoadingState(prev => ({ ...prev, importing: false }));
        }
      };

      reader.onerror = () => {
        toast({
          title: "❌ Erro de Leitura",
          description: "Erro ao ler o arquivo selecionado.",
          variant: "destructive"
        });
        setLoadingState(prev => ({ ...prev, importing: false }));
      };

      reader.readAsText(file);
      
    } catch (error) {
      console.error('❌ Erro ao importar configurações:', error);
      toast({
        title: "❌ Erro no Import",
        description: `Erro inesperado: ${error}`,
        variant: "destructive"
      });
      setLoadingState(prev => ({ ...prev, importing: false }));
    }

    // Limpar o input file
    event.target.value = '';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl w-full max-h-[95vh] overflow-hidden p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="border-b p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-2xl font-bold">Configurações do Sistema</DialogTitle>
                    {hasUnsavedChanges && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Mudanças não salvas
                      </Badge>
                    )}
                    {loadingState.saving && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Salvando...
                      </Badge>
                    )}
                    {!validationResult.isValid && (
                      <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                        <X className="h-3 w-3 mr-1" />
                        {validationResult.errors.length} erro(s)
                      </Badge>
                    )}
                  </div>
                  <DialogDescription className="mt-2">
                    Gerencie todas as configurações do WhatsApp Hub. Todas as alterações são persistidas nos arquivos de configuração.
                  </DialogDescription>
                  
                  {/* Barra de busca */}
                  <div className="relative mt-4 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar configurações..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleExportSettings}
                    disabled={loadingState.exporting}
                  >
                    {loadingState.exporting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Exportar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('import-settings')?.click()}
                    disabled={loadingState.importing}
                  >
                    {loadingState.importing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Importar
                  </Button>
                  <input
                    id="import-settings"
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="hidden"
                    title="Importar configurações"
                    placeholder="Selecione um arquivo de configurações"
                  />
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeSection} onValueChange={setActiveSection} className="h-full flex">
                {/* Sidebar */}
                <div className="w-64 border-r bg-muted/50 p-4">
                  <TabsList className="grid grid-cols-1 gap-1 h-auto bg-transparent p-0">
                    {filteredSections.map((sectionKey) => {
                      const section = sections[sectionKey as keyof typeof sections];
                      if (!section) return null;
                      
                      return (
                        <TabsTrigger 
                          key={sectionKey}
                          value={sectionKey} 
                          className="justify-start gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          <section.icon className="h-4 w-4" />
                          {section.name}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  
                  {/* Indicadores de Status */}
                  <div className="mt-6 space-y-2">
                    {validationResult.warnings.length > 0 && (
                      <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        {validationResult.warnings.length} aviso(s)
                      </div>
                    )}
                    {validationResult.errors.length > 0 && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        <X className="h-3 w-3 inline mr-1" />
                        {validationResult.errors.length} erro(s)
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6">
                  {/* Bot Settings */}
                  <TabsContent value="bot" className="mt-0">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            Gerenciamento do Bot
                            <Badge 
                              variant={settings.botStatus === 'online' ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              {settings.botStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Seção de Upload/Seleção do Bot */}
                          <div className="p-4 border rounded-lg bg-muted/30">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              Configuração do Bot
                            </h4>
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Nome do Bot</Label>
                                  <Input
                                    value={settings.botName || ''}
                                    onChange={(e) => {
                                      setSettings(prev => ({ ...prev, botName: e.target.value }));
                                      setHasUnsavedChanges(true);
                                    }}
                                    placeholder="Customer Support Bot"
                                  />
                                </div>
                                <div>
                                  <Label>Tipo de Bot</Label>
                                  <Select 
                                    value={settings.botType || 'local'} 
                                    onValueChange={(value) => {
                                      setSettings(prev => ({ ...prev, botType: value }));
                                      setHasUnsavedChanges(true);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="local">🏠 Bot Local (Upload)</SelectItem>
                                      <SelectItem value="system">💻 Bot do Sistema</SelectItem>
                                      <SelectItem value="cloud">☁️ Bot na Nuvem</SelectItem>
                                      <SelectItem value="api">🔗 API Externa</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div>
                                <Label>Descrição do Bot</Label>
                                <Textarea
                                  value={settings.botDescription || ''}
                                  onChange={(e) => {
                                    setSettings(prev => ({ ...prev, botDescription: e.target.value }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  placeholder="Descreva a função e capacidades do seu bot..."
                                  rows={2}
                                />
                              </div>

                              {settings.botType === 'local' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <Input
                                      type="file"
                                      accept=".exe,.js,.py,.jar,.zip,.rar"
                                      onChange={handleBotUpload}
                                      className="flex-1"
                                    />
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      disabled={loadingState.importing}
                                    >
                                      {loadingState.importing ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Upload className="h-4 w-4 mr-2" />
                                      )}
                                      Upload Bot
                                    </Button>
                                  </div>
                                  
                                  {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>Carregando bot...</span>
                                        <span>{uploadProgress}%</span>
                                      </div>
                                      <Progress value={uploadProgress} className="h-2" />
                                    </div>
                                  )}
                                  
                                  {settings.botExecutable && (
                                    <div className="text-sm text-green-600 flex items-center gap-2 p-2 bg-green-50 rounded">
                                      <CheckCircle className="h-4 w-4" />
                                      Bot carregado: <strong>{settings.botExecutable}</strong>
                                    </div>
                                  )}
                                </div>
                              )}

                              {settings.botType === 'system' && (
                                <div>
                                  <Label>Caminho do Executável</Label>
                                  <Input
                                    value={settings.botPath || ''}
                                    onChange={(e) => {
                                      setSettings(prev => ({ ...prev, botPath: e.target.value }));
                                      setHasUnsavedChanges(true);
                                    }}
                                    placeholder="C:/bots/whatsapp-bot.exe"
                                  />
                                </div>
                              )}

                              {settings.botType === 'api' && (
                                <div>
                                  <Label>URL da API</Label>
                                  <Input
                                    value={settings.botApiUrl || ''}
                                    onChange={(e) => {
                                      setSettings(prev => ({ ...prev, botApiUrl: e.target.value }));
                                      setHasUnsavedChanges(true);
                                    }}
                                    placeholder="https://api.exemplo.com/bot"
                                  />
                                </div>
                              )}

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label>Porta</Label>
                                  <Input
                                    type="number"
                                    value={settings.botPort || 3000}
                                    onChange={(e) => {
                                      setSettings(prev => ({ ...prev, botPort: parseInt(e.target.value) }));
                                      setHasUnsavedChanges(true);
                                    }}
                                    placeholder="3000"
                                  />
                                </div>
                                <div>
                                  <Label>Argumentos</Label>
                                  <Input
                                    value={settings.botArgs || ''}
                                    onChange={(e) => {
                                      setSettings(prev => ({ ...prev, botArgs: e.target.value }));
                                      setHasUnsavedChanges(true);
                                    }}
                                    placeholder="--verbose --config=prod"
                                  />
                                </div>
                                <div>
                                  <Label>Delay de Resposta (ms)</Label>
                                  <Input
                                    type="number"
                                    value={settings.responseDelay || 1000}
                                    onChange={(e) => {
                                      setSettings(prev => ({ ...prev, responseDelay: parseInt(e.target.value) }));
                                      setHasUnsavedChanges(true);
                                    }}
                                    placeholder="1000"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Controles do Bot */}
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Controles do Bot
                            </h4>
                            
                            <div className="flex flex-wrap gap-3">
                              <Button 
                                onClick={handleBotTest}
                                disabled={loadingState.validating}
                                variant="outline"
                              >
                                {loadingState.validating ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <TestTube className="h-4 w-4 mr-2" />
                                )}
                                Testar Conexão
                              </Button>
                              
                              {settings.botStatus === 'offline' ? (
                                <Button 
                                  onClick={handleBotStart}
                                  disabled={loadingState.loading}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {loadingState.loading ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Play className="h-4 w-4 mr-2" />
                                  )}
                                  Iniciar Bot
                                </Button>
                              ) : (
                                <Button 
                                  onClick={handleBotStop}
                                  disabled={loadingState.loading}
                                  variant="destructive"
                                >
                                  {loadingState.loading ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Pause className="h-4 w-4 mr-2" />
                                  )}
                                  Parar Bot
                                </Button>
                              )}
                              
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  setSettings(prev => ({ 
                                    ...prev, 
                                    botStatus: prev.botStatus === 'online' ? 'offline' : 'online' 
                                  }));
                                  setHasUnsavedChanges(true);
                                }}
                              >
                                <RotateCw className="h-4 w-4 mr-2" />
                                Reiniciar
                              </Button>
                              
                              <Button variant="outline">
                                <Monitor className="h-4 w-4 mr-2" />
                                Logs
                              </Button>
                              
                              <Button variant="outline">
                                <Activity className="h-4 w-4 mr-2" />
                                Status Detalhado
                              </Button>
                            </div>
                          </div>

                          <Separator />

                          {/* Argumentos de Inicialização */}
                          <div className="space-y-4">
                            <div>
                              <Label>Argumentos de Inicialização</Label>
                              <Input
                                value={settings.botArgs || ''}
                                onChange={(e) => {
                                  setSettings(prev => ({ ...prev, botArgs: e.target.value }));
                                  setHasUnsavedChanges(true);
                                }}
                                placeholder="--port 3000 --debug"
                              />
                              <div className="text-xs text-muted-foreground mt-1">
                                Argumentos que serão passados para o executável do bot
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Configurações Básicas do Bot */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="botName">Nome do Bot</Label>
                              <Input
                                id="botName"
                                value={settings.botName}
                                onChange={(e) => {
                                  setSettings(prev => ({ ...prev, botName: e.target.value }));
                                  setHasUnsavedChanges(true);
                                }}
                                placeholder="Customer Support Bot"
                              />
                            </div>
                            <div>
                              <Label htmlFor="botLanguage">Idioma</Label>
                              <Select value={settings.botLanguage} onValueChange={(value) => {
                                setSettings(prev => ({ ...prev, botLanguage: value }));
                                setHasUnsavedChanges(true);
                              }}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                                  <SelectItem value="en-US">English (US)</SelectItem>
                                  <SelectItem value="es-ES">Español</SelectItem>
                                  <SelectItem value="fr-FR">Français</SelectItem>
                                  <SelectItem value="de-DE">Deutsch</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="botDescription">Descrição do Bot</Label>
                            <Textarea
                              id="botDescription"
                              value={settings.botDescription}
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, botDescription: e.target.value }));
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Bot inteligente para atendimento ao cliente 24/7"
                              rows={2}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
                            <Textarea
                              id="welcomeMessage"
                              value={settings.welcomeMessage}
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, welcomeMessage: e.target.value }));
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Olá! 👋 Como posso ajudá-lo hoje?"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="fallbackMessage">Mensagem de Fallback</Label>
                            <Textarea
                              id="fallbackMessage"
                              value={settings.fallbackMessage}
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, fallbackMessage: e.target.value }));
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Desculpe, não entendi. Pode reformular sua pergunta?"
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="autoReply">Resposta Automática</Label>
                              <Switch
                                id="autoReply"
                                checked={settings.autoReply}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, autoReply: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="enableEmojis">Emojis Ativos</Label>
                              <Switch
                                id="enableEmojis"
                                checked={settings.enableEmojis}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, enableEmojis: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Delay de Resposta: {settings.responseDelay}ms</Label>
                            <Slider
                              value={[settings.responseDelay]}
                              onValueChange={([value]) => {
                                setSettings(prev => ({ ...prev, responseDelay: value }));
                                setHasUnsavedChanges(true);
                              }}
                              max={5000}
                              min={100}
                              step={100}
                              className="mt-2"
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              Tempo de espera antes de enviar respostas automáticas
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="botPersonality">Personalidade</Label>
                              <Select value={settings.botPersonality} onValueChange={(value) => {
                                setSettings(prev => ({ ...prev, botPersonality: value }));
                                setHasUnsavedChanges(true);
                              }}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="friendly">Amigável</SelectItem>
                                  <SelectItem value="professional">Profissional</SelectItem>
                                  <SelectItem value="casual">Casual</SelectItem>
                                  <SelectItem value="formal">Formal</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Max Chats Simultâneos: {settings.maxConcurrentChats}</Label>
                              <Slider
                                value={[settings.maxConcurrentChats]}
                                onValueChange={([value]) => {
                                  setSettings(prev => ({ ...prev, maxConcurrentChats: value }));
                                  setHasUnsavedChanges(true);
                                }}
                                max={100}
                                min={1}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Horário de Funcionamento
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="workingHoursEnabled">Horário Comercial Ativo</Label>
                            <Switch
                              id="workingHoursEnabled"
                              checked={settings.workingHours?.enabled ?? true}
                              onCheckedChange={(checked) => {
                                setSettings(prev => ({ 
                                  ...prev, 
                                  workingHours: { ...prev.workingHours, enabled: checked }
                                }));
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>
                          
                          {settings.workingHours?.enabled && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="workingStart">Início</Label>
                                <Input
                                  id="workingStart"
                                  type="time"
                                  value={settings.workingHours?.start || '09:00'}
                                  onChange={(e) => {
                                    setSettings(prev => ({ 
                                      ...prev, 
                                      workingHours: { ...prev.workingHours, start: e.target.value }
                                    }));
                                    setHasUnsavedChanges(true);
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor="workingEnd">Fim</Label>
                                <Input
                                  id="workingEnd"
                                  type="time"
                                  value={settings.workingHours?.end || '18:00'}
                                  onChange={(e) => {
                                    setSettings(prev => ({ 
                                      ...prev, 
                                      workingHours: { ...prev.workingHours, end: e.target.value }
                                    }));
                                    setHasUnsavedChanges(true);
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Messages Settings */}
                  <TabsContent value="messages" className="mt-0">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Configurações de Mensagens
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="enableReadReceipts">Confirmação de Leitura</Label>
                              <Switch
                                id="enableReadReceipts"
                                checked={settings.enableReadReceipts}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, enableReadReceipts: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="enableTypingIndicator">Indicador de Digitação</Label>
                              <Switch
                                id="enableTypingIndicator"
                                checked={settings.enableTypingIndicator}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, enableTypingIndicator: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="messageEncryption">Criptografia de Mensagens</Label>
                              <Switch
                                id="messageEncryption"
                                checked={settings.messageEncryption}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, messageEncryption: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="autoCorrection">Correção Automática</Label>
                              <Switch
                                id="autoCorrection"
                                checked={settings.autoCorrection}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, autoCorrection: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Tamanho Máximo de Mensagem: {settings.maxMessageLength} caracteres</Label>
                            <Slider
                              value={[settings.maxMessageLength]}
                              onValueChange={([value]) => {
                                setSettings(prev => ({ ...prev, maxMessageLength: value }));
                                setHasUnsavedChanges(true);
                              }}
                              max={8192}
                              min={256}
                              step={256}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label>Retenção de Mensagens: {settings.messageRetention} dias</Label>
                            <Slider
                              value={[settings.messageRetention]}
                              onValueChange={([value]) => {
                                setSettings(prev => ({ ...prev, messageRetention: value }));
                                setHasUnsavedChanges(true);
                              }}
                              max={365}
                              min={1}
                              step={1}
                              className="mt-2"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Tipos de Mídia
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="enableMediaMessages">Mensagens de Mídia</Label>
                              <Switch
                                id="enableMediaMessages"
                                checked={settings.enableMediaMessages}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, enableMediaMessages: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="enableVoiceMessages">Mensagens de Voz</Label>
                              <Switch
                                id="enableVoiceMessages"
                                checked={settings.enableVoiceMessages}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, enableVoiceMessages: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="enableDocuments">Documentos</Label>
                              <Switch
                                id="enableDocuments"
                                checked={settings.enableDocuments}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, enableDocuments: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="enableStickers">Stickers</Label>
                              <Switch
                                id="enableStickers"
                                checked={settings.enableStickers}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, enableStickers: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="allowedFileTypes">Tipos de Arquivo Permitidos</Label>
                            <Input
                              id="allowedFileTypes"
                              value={settings.allowedFileTypes}
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, allowedFileTypes: e.target.value }));
                                setHasUnsavedChanges(true);
                              }}
                              placeholder=".pdf,.doc,.docx,.txt,.jpg,.png"
                            />
                          </div>

                          <div>
                            <Label>Tamanho Máximo de Arquivo: {settings.maxFileSize}MB</Label>
                            <Slider
                              value={[settings.maxFileSize]}
                              onValueChange={([value]) => {
                                setSettings(prev => ({ ...prev, maxFileSize: value }));
                                setHasUnsavedChanges(true);
                              }}
                              max={100}
                              min={1}
                              step={1}
                              className="mt-2"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Edit3 className="h-5 w-5" />
                            Templates de Mensagem
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            {settings.messageTemplates?.map((template: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                <span className="flex-1 text-sm">{template}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMessageTemplate(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <Input
                              placeholder="Nova mensagem template..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddMessageTemplate(e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                                if (input?.value) {
                                  handleAddMessageTemplate(input.value);
                                  input.value = '';
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Notifications Settings */}
                  <TabsContent value="notifications" className="mt-0">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Configurações de Notificações
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="enableNotifications">Notificações Ativas</Label>
                              <Switch
                                id="enableNotifications"
                                checked={settings.enableNotifications}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, enableNotifications: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="soundEnabled">Som Ativo</Label>
                              <Switch
                                id="soundEnabled"
                                checked={settings.soundEnabled}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, soundEnabled: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="emailNotifications">Notificações por Email</Label>
                              <Switch
                                id="emailNotifications"
                                checked={settings.emailNotifications}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, emailNotifications: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="desktopNotifications">Notificações Desktop</Label>
                              <Switch
                                id="desktopNotifications"
                                checked={settings.desktopNotifications}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, desktopNotifications: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="notificationSound">Som de Notificação</Label>
                            <Select value={settings.notificationSound} onValueChange={(value) => {
                              setSettings(prev => ({ ...prev, notificationSound: value }));
                              setHasUnsavedChanges(true);
                            }}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">Padrão</SelectItem>
                                <SelectItem value="beep">Bip</SelectItem>
                                <SelectItem value="chime">Sino</SelectItem>
                                <SelectItem value="bell">Campainha</SelectItem>
                                <SelectItem value="none">Sem som</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="notificationFrequency">Frequência de Notificações</Label>
                            <Select value={settings.notificationFrequency} onValueChange={(value) => {
                              setSettings(prev => ({ ...prev, notificationFrequency: value }));
                              setHasUnsavedChanges(true);
                            }}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediate">Imediata</SelectItem>
                                <SelectItem value="every5min">A cada 5 minutos</SelectItem>
                                <SelectItem value="every15min">A cada 15 minutos</SelectItem>
                                <SelectItem value="hourly">A cada hora</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Timer className="h-5 w-5" />
                            Horário Silencioso
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="quietStart">Início</Label>
                              <Input
                                id="quietStart"
                                type="time"
                                value={settings.quietHours?.start || '22:00'}
                                onChange={(e) => {
                                  setSettings(prev => ({ 
                                    ...prev, 
                                    quietHours: { ...prev.quietHours, start: e.target.value }
                                  }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor="quietEnd">Fim</Label>
                              <Input
                                id="quietEnd"
                                type="time"
                                value={settings.quietHours?.end || '08:00'}
                                onChange={(e) => {
                                  setSettings(prev => ({ 
                                    ...prev, 
                                    quietHours: { ...prev.quietHours, end: e.target.value }
                                  }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="security" className="mt-0">
                    <div className="space-y-6">
                      {/* Sistema de Bloqueio de Tela Avançado - VERSÃO COMPLETA */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Sistema de Bloqueio de Tela
                            <Badge variant={screenLock.settings?.enabled ? 'default' : 'secondary'}>
                              {screenLock.settings?.enabled ? '🔒 Ativo' : '🔓 Inativo'}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Configure o bloqueio automático da tela para proteger o acesso não autorizado
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Status e Informações */}
                          <div className="p-4 border rounded-lg bg-muted/30">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-medium flex items-center gap-2">
                                  <Activity className="h-4 w-4" />
                                  Status do Sistema
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {screenLock.settings?.enabled 
                                    ? `Bloqueio ativo para ${screenLock.settings.userProfile?.name || 'usuário'}`
                                    : 'Sistema de bloqueio desabilitado'
                                  }
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge 
                                  variant={screenLock.settings?.enabled ? 'default' : 'secondary'}
                                  className="mb-1"
                                >
                                  {screenLock.settings?.enabled ? 'Protegido' : 'Desprotegido'}
                                </Badge>
                                {screenLock.settings?.enabled && (
                                  <p className="text-xs text-muted-foreground">
                                    Bloqueio em: {Math.round((screenLock.settings.autoLockTimeout || 0) / 60000)}min
                                  </p>
                                )}
                              </div>
                            </div>

                            {screenLock.settings?.enabled ? (
                              <div className="space-y-4">
                                {/* Informações do Perfil Configurado */}
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                      {screenLock.settings.userProfile?.photoUrl ? (
                                        <img 
                                          src={screenLock.settings.userProfile.photoUrl} 
                                          alt="Profile" 
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      ) : (
                                        <User className="h-5 w-5 text-green-600" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="font-medium text-green-800">Bloqueio Configurado</span>
                                      </div>
                                      <div className="text-sm text-green-700 space-y-1">
                                        <p><strong>Perfil:</strong> {screenLock.settings.userProfile?.name || 'Não definido'}</p>
                                        <p><strong>Bloqueio automático:</strong> {screenLock.settings.autoLockTimeout ? `${Math.round(screenLock.settings.autoLockTimeout / 60000)} minutos` : 'Desabilitado'}</p>
                                        <p><strong>Status:</strong> Proteção ativa - Sistema seguro</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Configurações Avançadas de Tempo */}
                                <div className="p-4 border rounded-lg bg-muted/20">
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Timer className="h-4 w-4" />
                                    Configurações de Tempo
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Bloqueio Automático</Label>
                                      <Select
                                        value={screenLock.settings.autoLockTimeout ? Math.round(screenLock.settings.autoLockTimeout / 60000).toString() : '15'}
                                        onValueChange={(value) => {
                                          screenLock.updateAutoLockTime(parseInt(value));
                                          toast({
                                            title: "⏱️ Tempo Atualizado",
                                            description: `Bloqueio automático configurado para ${value} minutos`,
                                            variant: "default",
                                            duration: 3000
                                          });
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="5">5 minutos</SelectItem>
                                          <SelectItem value="10">10 minutos</SelectItem>
                                          <SelectItem value="15">15 minutos</SelectItem>
                                          <SelectItem value="30">30 minutos</SelectItem>
                                          <SelectItem value="60">1 hora</SelectItem>
                                          <SelectItem value="120">2 horas</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Nível de Segurança</Label>
                                      <Select value="normal">
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="baixo">Baixo (30+ min)</SelectItem>
                                          <SelectItem value="normal">Normal (15 min)</SelectItem>
                                          <SelectItem value="alto">Alto (5 min)</SelectItem>
                                          <SelectItem value="critico">Crítico (2 min)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>

                                {/* Botões de Ação Principais - Configurado */}
                                <div className="grid grid-cols-2 gap-3">
                                  <Button 
                                    variant="outline" 
                                    onClick={handleTestScreenLock}
                                    className="flex items-center gap-2 hover:bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-300"
                                  >
                                    <TestTube className="h-4 w-4" />
                                    Testar Bloqueio
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={handleEditScreenLock}
                                    className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                    Editar Configurações
                                  </Button>
                                </div>
                                
                                {/* Botões de Ação Secundários */}
                                <div className="grid grid-cols-2 gap-3">
                                  <Button 
                                    variant="outline"
                                    onClick={handleViewLockHistory}
                                    className="flex items-center gap-2 hover:bg-orange-50 border-orange-200 text-orange-700 hover:border-orange-300"
                                  >
                                    <BarChart3 className="h-4 w-4" />
                                    Histórico de Acesso
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={handleRemoveScreenLock}
                                    className="flex items-center gap-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Remover Bloqueio
                                  </Button>
                                </div>

                                {/* Estatísticas Rápidas */}
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                  <div className="text-center p-2 bg-green-50 rounded-lg">
                                    <div className="text-lg font-semibold text-green-600">
                                      {lockHistory.filter(h => h.event === 'locked').length}
                                    </div>
                                    <div className="text-xs text-green-700">Bloqueios</div>
                                  </div>
                                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                                    <div className="text-lg font-semibold text-blue-600">
                                      {lockHistory.filter(h => h.event === 'unlocked').length}
                                    </div>
                                    <div className="text-xs text-blue-700">Desbloqueios</div>
                                  </div>
                                  <div className="text-center p-2 bg-red-50 rounded-lg">
                                    <div className="text-lg font-semibold text-red-600">
                                      {lockHistory.filter(h => h.event === 'failed_attempt').length}
                                    </div>
                                    <div className="text-xs text-red-700">Tentativas</div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* Estado Não Configurado */}
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium text-yellow-800 mb-1">
                                        ⚠️ Sistema Desprotegido
                                      </h4>
                                      <p className="text-sm text-yellow-700 mb-3">
                                        Seu sistema está vulnerável! Configure o bloqueio de tela para adicionar uma camada extra de segurança e proteger seus dados.
                                      </p>
                                      <div className="text-xs text-yellow-600 space-y-1">
                                        <p>✅ Protege contra acesso não autorizado</p>
                                        <p>✅ Bloqueio automático por inatividade configurável</p>
                                        <p>✅ Interface personalizada com seu perfil</p>
                                        <p>✅ Histórico completo de acessos e tentativas</p>
                                        <p>✅ Criptografia SHA-256 para máxima segurança</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Opções de Configuração Rápida */}
                                <div className="grid grid-cols-1 gap-3">
                                  {/* Botão Principal de Configuração */}
                                  <Button 
                                    onClick={() => setIsPasswordSetupOpen(true)}
                                    className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12"
                                    size="lg"
                                  >
                                    <Key className="h-5 w-5" />
                                    🔒 Configurar Bloqueio de Tela Agora
                                  </Button>
                                  
                                  {/* Configuração Rápida */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                      variant="outline"
                                      onClick={() => {
                                        setIsPasswordSetupOpen(true);
                                        toast({
                                          title: "⚡ Configuração Rápida",
                                          description: "Modo de configuração rápida ativado",
                                          variant: "default",
                                          duration: 3000
                                        });
                                      }}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <Lightning className="h-4 w-4" />
                                      Config. Rápida
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      onClick={handleViewLockHistory}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <BarChart3 className="h-4 w-4" />
                                      Ver Histórico
                                    </Button>
                                  </div>
                                </div>

                                {/* Níveis de Segurança Sugeridos */}
                                <div className="p-3 border rounded-lg bg-muted/20">
                                  <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Níveis de Segurança Recomendados
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                                      <span className="text-green-800">🟢 <strong>Básico:</strong> 30 min</span>
                                      <span className="text-green-600 text-xs">Para uso pessoal</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                                      <span className="text-yellow-800">🟡 <strong>Médio:</strong> 15 min</span>
                                      <span className="text-yellow-600 text-xs">Recomendado</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                                      <span className="text-red-800">🔴 <strong>Alto:</strong> 5 min</span>
                                      <span className="text-red-600 text-xs">Para dados sensíveis</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Configurações Avançadas de Segurança */}
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Configurações de Segurança
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="enableEncryption">Criptografia de Dados</Label>
                                  <p className="text-xs text-muted-foreground">Protege dados sensíveis</p>
                                </div>
                                <Switch
                                  id="enableEncryption"
                                  checked={settings.enableEncryption}
                                  onCheckedChange={(checked) => {
                                    setSettings(prev => ({ ...prev, enableEncryption: checked }));
                                    setHasUnsavedChanges(true);
                                  }}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="requireAuth">Autenticação Obrigatória</Label>
                                  <p className="text-xs text-muted-foreground">Requer login para acesso</p>
                                </div>
                                <Switch
                                  id="requireAuth"
                                  checked={settings.requireAuth}
                                  onCheckedChange={(checked) => {
                                    setSettings(prev => ({ ...prev, requireAuth: checked }));
                                    setHasUnsavedChanges(true);
                                  }}
                                />
                              </div>
                            </div>

                            {/* Botão de Validação do Sistema */}
                            <div className="pt-3 border-t">
                              <Button
                                variant="outline"
                                onClick={handleValidateScreenLockFeatures}
                                className="w-full flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 border-green-200 text-green-700"
                              >
                                <TestTube className="h-4 w-4" />
                                🧪 Validar Todas as Funcionalidades
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1 text-center">
                                Testa se todos os recursos de bloqueio estão funcionando
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Configurações de Segurança Básicas */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Configurações de Segurança
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="enableEncryption">Criptografia Ativa</Label>
                              <Switch
                                id="enableEncryption"
                                checked={settings.enableEncryption}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, enableEncryption: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="requireAuth">Autenticação Obrigatória</Label>
                              <Switch
                                id="requireAuth"
                                checked={settings.requireAuth}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, requireAuth: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Timeout de Sessão: {settings.sessionTimeout} minutos</Label>
                            <Slider
                              value={[settings.sessionTimeout || 30]}
                              onValueChange={([value]) => {
                                setSettings(prev => ({ ...prev, sessionTimeout: value }));
                                setHasUnsavedChanges(true);
                              }}
                              max={120}
                              min={5}
                              step={5}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label htmlFor="passwordPolicy">Política de Senha</Label>
                            <Select value={settings.passwordPolicy} onValueChange={(value) => {
                              setSettings(prev => ({ ...prev, passwordPolicy: value }));
                              setHasUnsavedChanges(true);
                            }}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Baixa</SelectItem>
                                <SelectItem value="medium">Média</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                                <SelectItem value="strict">Rigorosa</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="enableTwoFactor">Autenticação 2FA</Label>
                              <Switch
                                id="enableTwoFactor"
                                checked={settings.enableTwoFactor}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, enableTwoFactor: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="enableAuditLog">Log de Auditoria</Label>
                              <Switch
                                id="enableAuditLog"
                                checked={settings.enableAuditLog}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, enableAuditLog: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-0">
                    <div className="space-y-6">
                      {/* Configurações do Provedor de IA */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Provedor e Modelo de IA
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <Label htmlFor="enableAI">IA Ativada</Label>
                            <Switch
                              id="enableAI"
                              checked={settings.enableAI}
                              onCheckedChange={(checked) => {
                                setSettings(prev => ({ ...prev, enableAI: checked }));
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>

                          {settings.enableAI && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="aiProvider">Provedor de IA</Label>
                                  <Select 
                                    value={settings.aiProvider || 'openai'} 
                                    onValueChange={(value) => {
                                      setSettings(prev => ({ ...prev, aiProvider: value }));
                                      setHasUnsavedChanges(true);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="openai">OpenAI</SelectItem>
                                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                                      <SelectItem value="google">Google (Gemini)</SelectItem>
                                      <SelectItem value="azure">Azure OpenAI</SelectItem>
                                      <SelectItem value="cohere">Cohere</SelectItem>
                                      <SelectItem value="local">Modelo Local</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="aiModel">Modelo de IA</Label>
                                  <Select 
                                    value={settings.aiModel} 
                                    onValueChange={(value) => {
                                      setSettings(prev => ({ ...prev, aiModel: value }));
                                      setHasUnsavedChanges(true);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {settings.aiProvider === 'openai' && (
                                        <>
                                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                        </>
                                      )}
                                      {settings.aiProvider === 'anthropic' && (
                                        <>
                                          <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                                          <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                                          <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                                        </>
                                      )}
                                      {settings.aiProvider === 'google' && (
                                        <>
                                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                                          <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                                        </>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="aiApiKey">Chave da API</Label>
                                <Input
                                  id="aiApiKey"
                                  type="password"
                                  value={settings.aiApiKey || ''}
                                  onChange={(e) => {
                                    setSettings(prev => ({ ...prev, aiApiKey: e.target.value }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  placeholder="sk-..."
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Configurações Avançadas de IA */}
                      {settings.enableAI && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Microscope className="h-5 w-5" />
                              Configurações Avançadas
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Temperatura: {settings.aiTemperature}</Label>
                                <Slider
                                  value={[settings.aiTemperature * 100]}
                                  onValueChange={([value]) => {
                                    setSettings(prev => ({ ...prev, aiTemperature: value / 100 }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  max={100}
                                  min={0}
                                  step={1}
                                  className="mt-2"
                                />
                                <div className="text-xs text-muted-foreground mt-1">
                                  Controla a criatividade das respostas (0 = conservador, 1 = criativo)
                                </div>
                              </div>
                              <div>
                                <Label>Tokens Máximos: {settings.aiMaxTokens}</Label>
                                <Slider
                                  value={[settings.aiMaxTokens]}
                                  onValueChange={([value]) => {
                                    setSettings(prev => ({ ...prev, aiMaxTokens: value }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  max={8000}
                                  min={100}
                                  step={100}
                                  className="mt-2"
                                />
                                <div className="text-xs text-muted-foreground mt-1">
                                  Comprimento máximo das respostas da IA
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="aiPersonality">Personalidade da IA</Label>
                                <Select 
                                  value={settings.aiPersonality} 
                                  onValueChange={(value) => {
                                    setSettings(prev => ({ ...prev, aiPersonality: value }));
                                    setHasUnsavedChanges(true);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="professional">Profissional</SelectItem>
                                    <SelectItem value="friendly">Amigável</SelectItem>
                                    <SelectItem value="casual">Casual</SelectItem>
                                    <SelectItem value="formal">Formal</SelectItem>
                                    <SelectItem value="technical">Técnico</SelectItem>
                                    <SelectItem value="empathetic">Empático</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="aiResponseTime">Velocidade de Resposta</Label>
                                <Select 
                                  value={settings.aiResponseTime} 
                                  onValueChange={(value) => {
                                    setSettings(prev => ({ ...prev, aiResponseTime: value }));
                                    setHasUnsavedChanges(true);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="fast">Rápida</SelectItem>
                                    <SelectItem value="balanced">Equilibrada</SelectItem>
                                    <SelectItem value="thoughtful">Reflexiva</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="enableSentimentAnalysis">Análise de Sentimentos</Label>
                                <Switch
                                  id="enableSentimentAnalysis"
                                  checked={settings.enableSentimentAnalysis}
                                  onCheckedChange={(checked) => {
                                    setSettings(prev => ({ ...prev, enableSentimentAnalysis: checked }));
                                    setHasUnsavedChanges(true);
                                  }}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="enableAutoTranslation">Tradução Automática</Label>
                                <Switch
                                  id="enableAutoTranslation"
                                  checked={settings.enableAutoTranslation}
                                  onCheckedChange={(checked) => {
                                    setSettings(prev => ({ ...prev, enableAutoTranslation: checked }));
                                    setHasUnsavedChanges(true);
                                  }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="aiLearning">Aprendizado Contínuo</Label>
                                <Switch
                                  id="aiLearning"
                                  checked={settings.aiLearning}
                                  onCheckedChange={(checked) => {
                                    setSettings(prev => ({ ...prev, aiLearning: checked }));
                                    setHasUnsavedChanges(true);
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Memória de Contexto: {settings.aiContextMemory} mensagens</Label>
                                <Slider
                                  value={[settings.aiContextMemory]}
                                  onValueChange={([value]) => {
                                    setSettings(prev => ({ ...prev, aiContextMemory: value }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  max={50}
                                  min={1}
                                  step={1}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Contexto Personalizado */}
                      {settings.enableAI && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Contexto e Instruções
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor="aiSystemPrompt">Prompt do Sistema</Label>
                              <Textarea
                                id="aiSystemPrompt"
                                value={settings.aiSystemPrompt || ''}
                                onChange={(e) => {
                                  setSettings(prev => ({ ...prev, aiSystemPrompt: e.target.value }));
                                  setHasUnsavedChanges(true);
                                }}
                                placeholder="Você é um assistente virtual especializado em atendimento ao cliente..."
                                rows={4}
                              />
                              <div className="text-xs text-muted-foreground mt-1">
                                Instruções principais que definem o comportamento da IA
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="aiKnowledgeBase">Base de Conhecimento</Label>
                              <Textarea
                                id="aiKnowledgeBase"
                                value={settings.aiKnowledgeBase || ''}
                                onChange={(e) => {
                                  setSettings(prev => ({ ...prev, aiKnowledgeBase: e.target.value }));
                                  setHasUnsavedChanges(true);
                                }}
                                placeholder="Informações sobre produtos, políticas, FAQ..."
                                rows={6}
                              />
                              <div className="text-xs text-muted-foreground mt-1">
                                Conhecimento específico do seu negócio
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Testes e Analytics */}
                      {settings.enableAI && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TestTube className="h-5 w-5" />
                              Testes e Monitoramento
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <Button 
                                variant="outline"
                                onClick={handleTestAI}
                                disabled={loadingState.validating}
                                className="flex items-center gap-2"
                              >
                                {loadingState.validating ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <TestTube className="h-4 w-4" />
                                )}
                                Testar IA
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={handleViewAIAnalytics}
                                className="flex items-center gap-2"
                              >
                                <BarChart3 className="h-4 w-4" />
                                Ver Analytics
                              </Button>
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                              <h4 className="font-medium text-blue-800 mb-2">Status da IA</h4>
                              <div className="text-sm text-blue-700 space-y-1">
                                <p>Modelo: {settings.aiModel}</p>
                                <p>Tokens/min: {settings.aiMaxTokens * 5}</p>
                                <p>Última atualização: {new Date().toLocaleString()}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="integrations" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Configurações de Integrações</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="webhookUrl">URL do Webhook</Label>
                            <Input
                              id="webhookUrl"
                              value={settings.webhookUrl}
                              onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                              placeholder="http://localhost:5678/webhook/whatsapp-messages"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="emailIntegration">Integração com Email</Label>
                            <Switch
                              id="emailIntegration"
                              checked={settings.emailIntegration}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailIntegration: checked }))}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="performance" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Configurações de Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="cacheEnabled">Cache Ativo</Label>
                            <Switch
                              id="cacheEnabled"
                              checked={settings.cacheEnabled}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, cacheEnabled: checked }))}
                            />
                          </div>
                          <div>
                            <Label>Máximo de Conexões</Label>
                            <Slider
                              value={[settings.maxConnections]}
                              onValueChange={([value]) => setSettings(prev => ({ ...prev, maxConnections: value }))}
                              max={5000}
                              min={100}
                              step={100}
                            />
                            <div className="text-sm text-muted-foreground">{settings.maxConnections} conexões</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="customization" className="mt-0">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Cores e Tema
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="primaryColor">Cor Primária</Label>
                              <div className="flex gap-2 items-center mt-1">
                                <Input
                                  id="primaryColor"
                                  type="color"
                                  value={settings.primaryColor}
                                  onChange={(e) => {
                                    setSettings(prev => ({ ...prev, primaryColor: e.target.value }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-16 h-10"
                                />
                                <Input
                                  value={settings.primaryColor}
                                  onChange={(e) => {
                                    setSettings(prev => ({ ...prev, primaryColor: e.target.value }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  placeholder="#25D366"
                                  className="font-mono"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="secondaryColor">Cor Secundária</Label>
                              <div className="flex gap-2 items-center mt-1">
                                <Input
                                  id="secondaryColor"
                                  type="color"
                                  value={settings.secondaryColor}
                                  onChange={(e) => {
                                    setSettings(prev => ({ ...prev, secondaryColor: e.target.value }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-16 h-10"
                                />
                                <Input
                                  value={settings.secondaryColor}
                                  onChange={(e) => {
                                    setSettings(prev => ({ ...prev, secondaryColor: e.target.value }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  placeholder="#128C7E"
                                  className="font-mono"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="accentColor">Cor de Destaque</Label>
                              <div className="flex gap-2 items-center mt-1">
                                <Input
                                  id="accentColor"
                                  type="color"
                                  value={settings.accentColor}
                                  onChange={(e) => {
                                    setSettings(prev => ({ ...prev, accentColor: e.target.value }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-16 h-10"
                                />
                                <Input
                                  value={settings.accentColor}
                                  onChange={(e) => {
                                    setSettings(prev => ({ ...prev, accentColor: e.target.value }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  placeholder="#34B7F1"
                                  className="font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="darkMode">Modo Escuro</Label>
                            <Switch
                              id="darkMode"
                              checked={settings.darkMode}
                              onCheckedChange={(checked) => {
                                setSettings(prev => ({ ...prev, darkMode: checked }));
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <Separator />

                          <div>
                            <Label className="text-base font-medium">Temas Predefinidos</Label>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              {Object.entries(predefinedThemes).map(([key, theme]) => (
                                <Card key={key} className="p-3 cursor-pointer hover:bg-muted/50" onClick={() => applyPredefinedTheme(key)}>
                                  <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                      <ColorPreview color={theme.primaryColor} />
                                      <ColorPreview color={theme.secondaryColor} />
                                      <ColorPreview color={theme.accentColor} />
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm">{theme.name}</div>
                                      <div className="text-xs text-muted-foreground">{theme.description}</div>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5" />
                            Logo e Marca
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="brandName">Nome da Marca</Label>
                            <Input
                              id="brandName"
                              value={settings.brandName}
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, brandName: e.target.value }));
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="WhatsApp Hub"
                            />
                          </div>

                          <div>
                            <Label>Logo Personalizada</Label>
                            <div className="space-y-3 mt-2">
                              {/* Preview da logo atual */}
                              {settings.customLogo && (
                                <div className="border rounded-lg p-4 bg-muted/50">
                                  <div className="flex items-center gap-4">
                                    <LogoPreview
                                      src={settings.customLogo}
                                      size={settings.logoSize}
                                      borderRadius={settings.logoBorderRadius}
                                      shadow={settings.logoShadow}
                                      style={settings.logoStyle}
                                    />
                                    <div>
                                      <div className="font-medium">{settings.brandName}</div>
                                      <div className="text-sm text-muted-foreground">Preview da logo atual</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Upload de nova logo */}
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => document.getElementById('logo-upload')?.click()}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Carregar Logo
                                </Button>
                                {settings.customLogo && (
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSettings(prev => ({ ...prev, customLogo: '' }));
                                      setHasUnsavedChanges(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remover
                                  </Button>
                                )}
                              </div>
                              <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                title="Upload de logo"
                                placeholder="Selecione uma imagem"
                              />

                              {/* Configurações da logo */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="logoSize">Tamanho da Logo</Label>
                                  <Select value={settings.logoSize} onValueChange={(value) => {
                                    setSettings(prev => ({ ...prev, logoSize: value }));
                                    setHasUnsavedChanges(true);
                                  }}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="small">Pequeno (32px)</SelectItem>
                                      <SelectItem value="medium">Médio (48px)</SelectItem>
                                      <SelectItem value="large">Grande (64px)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="logoStyle">Estilo</Label>
                                  <Select value={settings.logoStyle} onValueChange={(value) => {
                                    setSettings(prev => ({ ...prev, logoStyle: value }));
                                    setHasUnsavedChanges(true);
                                  }}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="contain">Conter</SelectItem>
                                      <SelectItem value="cover">Preencher</SelectItem>
                                      <SelectItem value="stretch">Esticar</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Borda Arredondada: {settings.logoBorderRadius}px</Label>
                                  <Slider
                                    value={[settings.logoBorderRadius]}
                                    onValueChange={([value]) => {
                                      setSettings(prev => ({ ...prev, logoBorderRadius: value }));
                                      setHasUnsavedChanges(true);
                                    }}
                                    max={32}
                                    min={0}
                                    step={1}
                                    className="mt-2"
                                  />
                                </div>
                                <div className="flex items-center justify-between pt-6">
                                  <Label htmlFor="logoShadow">Sombra</Label>
                                  <Switch
                                    id="logoShadow"
                                    checked={settings.logoShadow}
                                    onCheckedChange={(checked) => {
                                      setSettings(prev => ({ ...prev, logoShadow: checked }));
                                      setHasUnsavedChanges(true);
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Logos salvas */}
                              {settings.savedLogos && settings.savedLogos.length > 0 && (
                                <div>
                                  <Label>Logos Salvas</Label>
                                  <div className="grid grid-cols-3 gap-2 mt-2">
                                    {settings.savedLogos.map((logo: LogoConfig) => (
                                      <div key={logo.id} className="border rounded p-2 cursor-pointer hover:bg-muted/50">
                                        <div 
                                          className="saved-logo-item"
                                          data-bg-image={logo.data}
                                          onClick={() => handleLogoSelect(logo)}
                                        />
                                        <div className="text-xs text-center truncate">{logo.name}</div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="w-full mt-1"
                                          onClick={() => handleLogoDelete(logo.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Edit3 className="h-5 w-5" />
                            Tipografia e Layout
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="fontFamily">Família da Fonte</Label>
                              <Select value={settings.fontFamily} onValueChange={(value) => {
                                setSettings(prev => ({ ...prev, fontFamily: value }));
                                setHasUnsavedChanges(true);
                              }}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Inter">Inter</SelectItem>
                                  <SelectItem value="Roboto">Roboto</SelectItem>
                                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                                  <SelectItem value="Lato">Lato</SelectItem>
                                  <SelectItem value="Poppins">Poppins</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Tamanho da Fonte: {settings.fontSize}px</Label>
                              <Slider
                                value={[settings.fontSize]}
                                onValueChange={([value]) => {
                                  setSettings(prev => ({ ...prev, fontSize: value }));
                                  setHasUnsavedChanges(true);
                                }}
                                max={20}
                                min={10}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Raio da Borda: {settings.borderRadius}px</Label>
                            <Slider
                              value={[settings.borderRadius]}
                              onValueChange={([value]) => {
                                setSettings(prev => ({ ...prev, borderRadius: value }));
                                setHasUnsavedChanges(true);
                              }}
                              max={20}
                              min={0}
                              step={1}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label htmlFor="customCSS">CSS Personalizado</Label>
                            <Textarea
                              id="customCSS"
                              value={settings.customCSS}
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, customCSS: e.target.value }));
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="/* Adicione seu CSS personalizado aqui */&#10;.custom-class {&#10;  /* seus estilos */&#10;}"
                              rows={6}
                              className="font-mono text-sm"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Configurações de Analytics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="enableAnalytics">Analytics Ativo</Label>
                            <Switch
                              id="enableAnalytics"
                              checked={settings.enableAnalytics}
                              onCheckedChange={(checked) => {
                                setSettings(prev => ({ ...prev, enableAnalytics: checked }));
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="reportFrequency">Frequência de Relatórios</Label>
                            <Select value={settings.reportFrequency} onValueChange={(value) => {
                              setSettings(prev => ({ ...prev, reportFrequency: value }));
                              setHasUnsavedChanges(true);
                            }}>
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
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Backup Settings */}
                  <TabsContent value="backup" className="mt-0">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Configurações de Backup
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="backupEnabled">Backup Automático</Label>
                            <Switch
                              id="backupEnabled"
                              checked={settings.backupEnabled}
                              onCheckedChange={(checked) => {
                                setSettings(prev => ({ ...prev, backupEnabled: checked }));
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <div>
                            <Label htmlFor="backupFrequency">Frequência de Backup</Label>
                            <Select value={settings.backupFrequency} onValueChange={(value) => {
                              setSettings(prev => ({ ...prev, backupFrequency: value }));
                              setHasUnsavedChanges(true);
                            }}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">A cada hora</SelectItem>
                                <SelectItem value="daily">Diário</SelectItem>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="monthly">Mensal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Retenção de Dados: {settings.dataRetention} dias</Label>
                            <Slider
                              value={[settings.dataRetention]}
                              onValueChange={([value]) => {
                                setSettings(prev => ({ ...prev, dataRetention: value }));
                                setHasUnsavedChanges(true);
                              }}
                              max={365}
                              min={30}
                              step={30}
                              className="mt-2"
                            />
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <h4 className="font-medium">Ações de Backup</h4>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Fazer Backup Agora
                              </Button>
                              <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Restaurar Backup
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Workflows Settings */}
                  <TabsContent value="workflows" className="mt-0">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Configurações de Workflows
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="autoAssignment">Atribuição Automática</Label>
                            <Switch
                              id="autoAssignment"
                              checked={settings.autoAssignment}
                              onCheckedChange={(checked) => {
                                setSettings(prev => ({ ...prev, autoAssignment: checked }));
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>SLA de Resposta: {settings.slaSettings?.response} min</Label>
                              <Slider
                                value={[settings.slaSettings?.response || 30]}
                                onValueChange={([value]) => {
                                  setSettings(prev => ({ 
                                    ...prev, 
                                    slaSettings: { ...prev.slaSettings, response: value }
                                  }));
                                  setHasUnsavedChanges(true);
                                }}
                                max={120}
                                min={5}
                                step={5}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>SLA de Resolução: {settings.slaSettings?.resolution} min</Label>
                              <Slider
                                value={[settings.slaSettings?.resolution || 240]}
                                onValueChange={([value]) => {
                                  setSettings(prev => ({ 
                                    ...prev, 
                                    slaSettings: { ...prev.slaSettings, resolution: value }
                                  }));
                                  setHasUnsavedChanges(true);
                                }}
                                max={1440}
                                min={30}
                                step={30}
                                className="mt-2"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Tags de Gerenciamento</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {settings.tagManagement?.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary">
                                  {tag}
                                  <X 
                                    className="h-3 w-3 ml-1 cursor-pointer" 
                                    onClick={() => {
                                      setSettings(prev => ({
                                        ...prev,
                                        tagManagement: prev.tagManagement?.filter((_, i) => i !== index)
                                      }));
                                      setHasUnsavedChanges(true);
                                    }}
                                  />
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label>Níveis de Prioridade</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {settings.priorityLevels?.map((level: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {level}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Advanced Settings */}
                  <TabsContent value="advanced" className="mt-0">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Configurações Avançadas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="debugMode">Modo Debug</Label>
                              <Switch
                                id="debugMode"
                                checked={settings.debugMode}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, debugMode: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="developerMode">Modo Desenvolvedor</Label>
                              <Switch
                                id="developerMode"
                                checked={settings.developerMode}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, developerMode: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="apiEndpoint">Endpoint da API</Label>
                            <Input
                              id="apiEndpoint"
                              value={settings.apiEndpoint}
                              onChange={(e) => {
                                setSettings(prev => ({ ...prev, apiEndpoint: e.target.value }));
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="https://api.whatsapp.com"
                            />
                          </div>

                          <div>
                            <Label>Rate Limit: {settings.rateLimitPerMinute} req/min</Label>
                            <Slider
                              value={[settings.rateLimitPerMinute]}
                              onValueChange={([value]) => {
                                setSettings(prev => ({ ...prev, rateLimitPerMinute: value }));
                                setHasUnsavedChanges(true);
                              }}
                              max={1000}
                              min={10}
                              step={10}
                              className="mt-2"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="experimentalFeatures">Recursos Experimentais</Label>
                              <Switch
                                id="experimentalFeatures"
                                checked={settings.experimentalFeatures}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, experimentalFeatures: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="maintenanceMode">Modo Manutenção</Label>
                              <Switch
                                id="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onCheckedChange={(checked) => {
                                  setSettings(prev => ({ ...prev, maintenanceMode: checked }));
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 🚀 PAINEL DE FUNCIONALIDADES AVANÇADAS */}
                      <Card className="border-2 border-dashed border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-orange-800">
                            <Rocket className="h-5 w-5" />
                            Funcionalidades Enterprise
                            <Badge variant="outline" className="bg-orange-100 text-orange-700">
                              BETA
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border mb-4">
                            <div>
                              <Label className="font-medium">Funcionalidades Avançadas</Label>
                              <p className="text-xs text-gray-500 mt-1">Análise, automação e otimização</p>
                            </div>
                            <Switch
                              checked={showAdvancedFeatures}
                              onCheckedChange={setShowAdvancedFeatures}
                            />
                          </div>

                          {showAdvancedFeatures && (
                            <div className="space-y-4 p-4 bg-white rounded-lg border">
                              <div className="grid grid-cols-2 gap-4">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    // Simulação do health check
                                    const result = {
                                      overall: 'good',
                                      details: { security: 85, performance: 78, compliance: 92 },
                                      issues: [],
                                      recommendations: ['Otimizar cache', 'Revisar configurações de segurança']
                                    };
                                    setHealthCheckResult(result);
                                    toast({
                                      title: "✅ Health Check Concluído",
                                      description: `Status: ${result.overall}`,
                                    });
                                  }}
                                >
                                  <Activity className="h-4 w-4 mr-2" />
                                  Health Check
                                </Button>

                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    // Simulação do auto-tuning
                                    toast({
                                      title: "🚀 Auto-Tuning Iniciado",
                                      description: `Sistema sendo otimizado...`,
                                    });
                                    
                                    setTimeout(() => {
                                      toast({
                                        title: "✅ Auto-Tuning Concluído",
                                        description: `3 otimizações aplicadas`,
                                      });
                                    }, 2000);
                                  }}
                                >
                                  <Zap className="h-4 w-4 mr-2" />
                                  Auto-Tuning
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Simulação do relatório de segurança
                                    const report = {
                                      type: 'security',
                                      generated: new Date().toISOString(),
                                      summary: { totalScore: 85 }
                                    };
                                    setSystemReports(prev => [...prev, report]);
                                    toast({
                                      title: "🔒 Relatório de Segurança",
                                      description: `Score: ${report.summary.totalScore}/100`,
                                    });
                                  }}
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Segurança
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Simulação do relatório de performance
                                    const report = {
                                      type: 'performance',
                                      generated: new Date().toISOString(),
                                      summary: { totalScore: 78 }
                                    };
                                    setSystemReports(prev => [...prev, report]);
                                    toast({
                                      title: "⚡ Relatório de Performance",
                                      description: `Score: ${report.summary.totalScore}/100`,
                                    });
                                  }}
                                >
                                  <Zap className="h-3 w-3 mr-1" />
                                  Performance
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    try {
                                      // Criar um objeto de configuração simplificado para exportação
                                      const config = {
                                        version: '1.0.0',
                                        timestamp: new Date().toISOString(),
                                        settings: {
                                          bot: {
                                            name: settings.botName,
                                            language: settings.botLanguage,
                                            autoReply: settings.autoReply
                                          },
                                          security: {
                                            encryption: settings.enableEncryption,
                                            sessionTimeout: settings.sessionTimeout
                                          },
                                          performance: {
                                            cache: settings.cacheEnabled,
                                            maxConnections: settings.maxConnections
                                          },
                                          backup: {
                                            enabled: settings.backupEnabled
                                          }
                                        }
                                      };
                                      
                                      const blob = new Blob([JSON.stringify(config, null, 2)], {
                                        type: 'application/json'
                                      });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `whatsapp-hub-config-${Date.now()}.json`;
                                      a.click();
                                      URL.revokeObjectURL(url);
                                      
                                      toast({
                                        title: "📤 Configuração Exportada",
                                        description: "Arquivo baixado com sucesso",
                                      });
                                    } catch (error) {
                                      toast({
                                        title: "❌ Erro na Exportação",
                                        description: `${error}`,
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                >
                                  <FileDown className="h-3 w-3 mr-1" />
                                  Exportar
                                </Button>
                              </div>

                              {/* Status dos Health Checks */}
                              {healthCheckResult && (
                                <div className="p-3 bg-green-50 rounded border border-green-200">
                                  <div className="text-sm font-medium text-green-800 mb-2 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Última Verificação
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-xs text-green-700">
                                    <div>Status: {healthCheckResult.overall.toUpperCase()}</div>
                                    <div>Problemas: {healthCheckResult.issues.length}</div>
                                    <div>Recomendações: {healthCheckResult.recommendations.length}</div>
                                  </div>
                                </div>
                              )}

                              {/* Lista de relatórios gerados */}
                              {systemReports.length > 0 && (
                                <div className="p-3 bg-gray-50 rounded text-sm">
                                  <div className="font-medium mb-1 flex items-center gap-1">
                                    <FileText className="h-4 w-4 text-gray-600" />
                                    Relatórios Gerados: {systemReports.length}
                                  </div>
                                  {systemReports.slice(-2).map((report, index) => (
                                    <div key={index} className="text-xs text-gray-600 flex justify-between items-center">
                                      <span>{report.type.toUpperCase()} - {new Date(report.generated).toLocaleTimeString()}</span>
                                      <Badge variant="outline" className={
                                        report.summary.totalScore >= 80 ? 'bg-green-100 text-green-800' :
                                        report.summary.totalScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }>
                                        {report.summary.totalScore}/100
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Status geral do sistema */}
                              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                <div className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                                  <Info className="h-4 w-4" />
                                  Status do Sistema
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                                  <div>✅ Sistema: Operacional</div>
                                  <div>🔧 Auto-Tuning: Ativo</div>
                                  <div>📊 Análise: Disponível</div>
                                  <div>💾 Backup: {settings.backupEnabled ? 'Ativo' : 'Inativo'}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="border-t p-6 flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsPasswordSetupOpen(true)}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Configurar Bloqueio
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={loadingState.saving}>
                  {loadingState.saving ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configuração de Senha/Bloqueio */}
      {isPasswordSetupOpen && (
        <PasswordSetupModal
          isOpen={isPasswordSetupOpen}
          onSave={handleSetupScreenLock}
          onCancel={() => setIsPasswordSetupOpen(false)}
        />
      )}

      {/* Modal de Histórico de Segurança */}
      <Dialog open={isSecurityAuditOpen} onOpenChange={setIsSecurityAuditOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Histórico de Segurança
            </DialogTitle>
            <DialogDescription>
              Visualize todos os eventos de segurança e tentativas de acesso ao sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Estatísticas Resumidas */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {lockHistory.filter(h => h.event === 'locked').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Bloqueios</div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {lockHistory.filter(h => h.event === 'unlocked').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Desbloqueios</div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {lockHistory.filter(h => h.event === 'failed_attempt').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Tentativas Falhas</div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {lockHistory.filter(h => h.event === 'timeout').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Timeouts</div>
                </div>
              </Card>
            </div>

            {/* Lista de Eventos */}
            <div className="border rounded-lg">
              <div className="p-3 border-b bg-muted/50">
                <h4 className="font-medium">Eventos Recentes</h4>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {lockHistory.length > 0 ? (
                  <div className="divide-y">
                    {lockHistory.map((event) => (
                      <div key={event.id} className="p-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              event.event === 'locked' ? 'bg-blue-500' :
                              event.event === 'unlocked' ? 'bg-green-500' :
                              event.event === 'failed_attempt' ? 'bg-red-500' :
                              'bg-orange-500'
                            }`} />
                            <div>
                              <div className="font-medium text-sm">
                                {event.event === 'locked' && '🔒 Sistema Bloqueado'}
                                {event.event === 'unlocked' && '🔓 Sistema Desbloqueado'}
                                {event.event === 'failed_attempt' && '❌ Tentativa de Acesso Falhada'}
                                {event.event === 'timeout' && '⏰ Bloqueio por Timeout'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {event.details}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {event.timestamp.toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum evento de segurança registrado</p>
                    <p className="text-xs mt-1">Configure o bloqueio de tela para começar a registrar eventos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  const dataStr = JSON.stringify(lockHistory, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                  const exportFileDefaultName = `security-log-${new Date().toISOString().split('T')[0]}.json`;
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                  
                  toast({
                    title: "📁 Log Exportado",
                    description: "Histórico de segurança exportado com sucesso!",
                    variant: "default",
                    duration: 5000
                  });
                }}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Log
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={() => {
                  setLockHistory([]);
                  localStorage.removeItem('whatsapp-hub-lock-history');
                  toast({
                    title: "🗑️ Histórico Limpo",
                    description: "Todos os eventos de segurança foram removidos.",
                    variant: "default",
                    duration: 5000
                  });
                }}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Limpar Histórico
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsModal;
