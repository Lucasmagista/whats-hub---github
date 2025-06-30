/**
 * 🎯 Settings Types - Tipos para configurações do sistema
 * Define todas as interfaces e tipos usados no sistema de configurações
 */

// Tipos de utilidade
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Severity = 'error' | 'warning' | 'info';
export type Effort = 'low' | 'medium' | 'high';
export type Environment = 'development' | 'staging' | 'production' | 'all';
export type BotPersonality = 'friendly' | 'professional' | 'casual' | 'formal';
export type BotStatus = 'online' | 'offline' | 'away' | 'busy';
export type Theme = 'default' | 'modern' | 'minimal' | 'classic';
export type TrackingLevel = 'basic' | 'detailed' | 'advanced';
export type ExportFormat = 'json' | 'csv' | 'xlsx' | 'pdf';
export type AIProvider = 'openai' | 'claude' | 'gemini' | 'local';
export type BackupFrequency = 'daily' | 'weekly' | 'monthly';
export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
export type ConfigCategory = 'basic' | 'advanced' | 'enterprise' | 'custom';
export type ReportType = 'security' | 'performance' | 'compliance' | 'full' | 'custom';
export type ChartType = 'line' | 'bar' | 'pie' | 'area';

export interface WorkingHours {
  enabled: boolean;
  start: string;
  end: string;
}

export interface WorkingSchedule {
  enabled: boolean;
  schedule: Record<string, { start: string; end: string }>;
}

export interface BotSettings {
  botName: string;
  botDescription: string;
  welcomeMessage: string;
  fallbackMessage: string;
  responseDelay: number;
  autoReply: boolean;
  workingHours: WorkingHours;
  maxConcurrentChats: number;
  botPersonality: BotPersonality;
  botLanguage: string;
  enableEmojis: boolean;
  botAvatar: string;
  botStatus: BotStatus;
}

export interface MessageSettings {
  messageRetention: number;
  enableReadReceipts: boolean;
  enableTypingIndicator: boolean;
  maxMessageLength: number;
  enableMediaMessages: boolean;
  enableVoiceMessages: boolean;
  enableDocuments: boolean;
  enableStickers: boolean;
  messageEncryption: boolean;
}

export interface NotificationSettings {
  enableNotifications: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationSound: string;
  notificationVolume: number;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface SecuritySettings {
  enableEncryption: boolean;
  sessionTimeout: number;
  loginAttempts: number;
  enableTwoFactor: boolean;
  ipWhitelist: string[];
  enableAuditLog: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
}

export interface PerformanceSettings {
  cacheEnabled: boolean;
  maxConnections: number;
  requestTimeout: number;
  enableCompression: boolean;
  memoryLimit: number;
  cpuLimit: number;
  diskCacheSize: number;
  networkOptimization: boolean;
}

export interface CustomizationSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: boolean;
  customLogo: string;
  brandName: string;
  fontFamily: string;
  fontSize: number;
  theme: Theme;
  animations: boolean;
}

export interface AnalyticsSettings {
  enableAnalytics: boolean;
  trackingLevel: TrackingLevel;
  dataRetention: number;
  enableReports: boolean;
  exportFormat: ExportFormat;
  customMetrics: string[];
}

export interface IntegrationSettings {
  emailIntegration: boolean;
  crmIntegration: boolean;
  slackIntegration: boolean;
  teamsIntegration: boolean;
  webhookUrl: string;
  n8nUsername: string;
  n8nPassword: string;
  defaultWorkflow: string;
  apiKey: string;
  secretKey: string;
}

export interface AISettings {
  enableAI: boolean;
  aiProvider: AIProvider;
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
  aiPersonality: string;
  enableAutoResponse: boolean;
  confidenceThreshold: number;
  fallbackToHuman: boolean;
}

export interface BackupSettings {
  backupEnabled: boolean;
  backupFrequency: BackupFrequency;
  backupLocation: string;
  maxBackups: number;
  enableCloudBackup: boolean;
  encryptBackups: boolean;
  backupTypes: {
    configuration: boolean;
    messages: boolean;
    analytics: boolean;
    logs: boolean;
  };
}

export interface QueueSettings {
  enableQueue: boolean;
  autoAssignment: boolean;
  maxWaitTime: number;
  priorityLevels: number;
  escalationRules: Array<{
    condition: string;
    action: string;
    delay: number;
  }>;
  queueWorkingHours: WorkingSchedule;
}

export interface EnterpriseSettings {
  complianceMode: boolean;
  gdprCompliance: boolean;
  auditLogging: boolean;
  dataGovernance: boolean;
  roleBasedAccess: boolean;
  ssoEnabled: boolean;
  ldapIntegration: boolean;
  enterpriseReporting: boolean;
  customBranding: boolean;
  whiteLabeling: boolean;
}

// Interface principal que combina todas as configurações
export interface ModalSettings {
  // Bot Settings
  botName: string;
  botDescription: string;
  welcomeMessage: string;
  fallbackMessage: string;
  responseDelay: number;
  autoReply: boolean;
  workingHours: WorkingHours;
  maxConcurrentChats: number;
  botPersonality: BotPersonality;
  botLanguage: string;
  enableEmojis: boolean;
  botAvatar: string;
  botStatus: BotStatus;
  
  // Message Settings
  messageRetention: number;
  enableReadReceipts: boolean;
  enableTypingIndicator: boolean;
  maxMessageLength: number;
  enableMediaMessages: boolean;
  enableVoiceMessages: boolean;
  enableDocuments: boolean;
  enableStickers: boolean;
  messageEncryption: boolean;
  
  // Notification Settings
  enableNotifications: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationSound: string;
  notificationVolume: number;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  
  // Security Settings
  enableEncryption: boolean;
  sessionTimeout: number;
  loginAttempts: number;
  enableTwoFactor: boolean;
  ipWhitelist: string[];
  enableAuditLog: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
  
  // Performance Settings
  cacheEnabled: boolean;
  maxConnections: number;
  requestTimeout: number;
  enableCompression: boolean;
  memoryLimit: number;
  cpuLimit: number;
  diskCacheSize: number;
  networkOptimization: boolean;
  
  // Customization Settings
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: boolean;
  customLogo: string;
  brandName: string;
  fontFamily: string;
  fontSize: number;
  theme: Theme;
  animations: boolean;
  
  // Analytics Settings
  enableAnalytics: boolean;
  trackingLevel: TrackingLevel;
  dataRetention: number;
  enableReports: boolean;
  exportFormat: ExportFormat;
  customMetrics: string[];
  
  // Integration Settings
  emailIntegration: boolean;
  crmIntegration: boolean;
  slackIntegration: boolean;
  teamsIntegration: boolean;
  webhookUrl: string;
  n8nUsername: string;
  n8nPassword: string;
  defaultWorkflow: string;
  apiKey: string;
  secretKey: string;
  
  // AI Settings
  enableAI: boolean;
  aiProvider: AIProvider;
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
  aiPersonality: string;
  enableAutoResponse: boolean;
  confidenceThreshold: number;
  fallbackToHuman: boolean;
  
  // Backup Settings
  backupEnabled: boolean;
  backupFrequency: BackupFrequency;
  backupLocation: string;
  maxBackups: number;
  enableCloudBackup: boolean;
  encryptBackups: boolean;
  backupTypes: {
    configuration: boolean;
    messages: boolean;
    analytics: boolean;
    logs: boolean;
  };
  
  // Queue Settings
  enableQueue: boolean;
  autoAssignment: boolean;
  maxWaitTime: number;
  priorityLevels: number;
  escalationRules: Array<{
    condition: string;
    action: string;
    delay: number;
  }>;
  queueWorkingHours: WorkingSchedule;
  
  // Enterprise Settings
  complianceMode: boolean;
  gdprCompliance: boolean;
  auditLogging: boolean;
  dataGovernance: boolean;
  roleBasedAccess: boolean;
  ssoEnabled: boolean;
  ldapIntegration: boolean;
  enterpriseReporting: boolean;
  customBranding: boolean;
  whiteLabeling: boolean;
}

// Estados de carregamento
export interface LoadingState {
  saving: boolean;
  loading: boolean;
  importing: boolean;
  exporting: boolean;
  validating: boolean;
  analyzing: boolean;
  optimizing: boolean;
  backing_up: boolean;
  monitoring: boolean;
}

// Resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: Severity;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    suggestion?: string;
  }>;
  suggestions: Array<{
    category: string;
    message: string;
    impact: Effort;
  }>;
}

// Métricas de configuração
export interface ConfigurationMetrics {
  totalSettings: number;
  activeFeatures: number;
  securityScore: number;
  performanceScore: number;
  complianceScore: number;
  optimizationLevel: number;
  healthStatus: HealthStatus;
  lastModified: string;
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  recommendations: Array<{
    type: 'security' | 'performance' | 'compliance' | 'feature';
    message: string;
    priority: Priority;
    estimated_impact: string;
  }>;
}

// Presets de configuração
export interface ConfigurationPreset {
  id: string;
  name: string;
  description: string;
  category: ConfigCategory;
  environment: Environment;
  settings: Partial<ModalSettings>;
  tags: string[];
  created: string;
  author: string;
  version: string;
}

// Análise de configuração
export interface ConfigurationAnalysis {
  overall_score: number;
  categories: {
    security: { score: number; issues: string[]; recommendations: string[] };
    performance: { score: number; issues: string[]; recommendations: string[] };
    compliance: { score: number; issues: string[]; recommendations: string[] };
    usability: { score: number; issues: string[]; recommendations: string[] };
    reliability: { score: number; issues: string[]; recommendations: string[] };
  };
  optimization_suggestions: Array<{
    category: string;
    action: string;
    impact: string;
    effort: Effort;
    priority: number;
  }>;
  comparison_with_best_practices: {
    matches: string[];
    gaps: string[];
    improvements: string[];
  };
}

// Report de configuração
export interface ConfigurationReport {
  id: string;
  type: ReportType;
  generated: string;
  period: { start: string; end: string };
  summary: {
    total_configurations: number;
    changes_made: number;
    issues_found: number;
    recommendations: number;
    compliance_score: number;
  };
  details: {
    configuration_changes: Array<{
      timestamp: string;
      section: string;
      field: string;
      old_value: unknown;
      new_value: unknown;
      user: string;
    }>;
    security_audit: {
      passed: string[];
      failed: string[];
      warnings: string[];
    };
    performance_metrics: {
      response_times: number[];
      resource_usage: number[];
      error_rates: number[];
    };
  };
  charts: Array<{
    type: ChartType;
    title: string;
    data: unknown;
    config: Record<string, unknown>;
  }>;
  recommendations: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    priority: Priority;
    effort: Effort;
    impact: string;
    implementation_guide: string[];
  }>;
  export_formats: ExportFormat[];
  metadata: {
    version: string;
    generator: string;
    environment: string;
    total_pages: number;
  };
}
