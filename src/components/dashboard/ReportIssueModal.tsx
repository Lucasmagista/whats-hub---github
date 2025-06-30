import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Bug, Send, AlertCircle, CheckCircle2, X, Upload, FileText, 
  Monitor, Smartphone, Calendar, Clock, User, Mail, Phone,
  Camera, Mic, Globe, Wifi, HardDrive, Cpu // substitui Memory por Cpu
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface IssueReport {
  title: string;
  description: string;
  type: IssueType;
  priority: IssuePriority;
  category: IssueCategory;
  severity: IssueSeverity;
  reproducible: boolean;
  steps: string[];
  expectedBehavior: string;
  actualBehavior: string;
  workaround?: string;
  affectedUsers?: number;
  businessImpact?: string;
  attachments?: File[];
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  environment: {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    screenResolution: string;
    device: string;
    network: string;
    timestamp: string;
    url: string;
    userAgent: string;
  };
  systemInfo?: {
    memory: string;
    storage: string;
    permissions: string[];
  };
}

type IssueType = 'bug' | 'feature' | 'improvement' | 'integration' | 'ui' | 'performance' | 'security' | 'accessibility';
type IssuePriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';
type IssueCategory = 'frontend' | 'backend' | 'database' | 'api' | 'mobile' | 'desktop' | 'infrastructure' | 'third-party';
type IssueSeverity = 'minor' | 'moderate' | 'major' | 'critical' | 'blocker';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issue: IssueReport) => Promise<void> | void;
  defaultValues?: Partial<IssueReport>;
  allowAnonymous?: boolean;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
}

const ISSUE_TYPES = [
  { value: 'bug', label: '🐛 Bug/Erro', description: 'Algo não está funcionando corretamente', icon: Bug },
  { value: 'feature', label: '✨ Nova Funcionalidade', description: 'Solicitar nova funcionalidade', icon: FileText },
  { value: 'improvement', label: '🚀 Melhoria', description: 'Melhorar funcionalidade existente', icon: CheckCircle2 },
  { value: 'integration', label: '🔗 Integração', description: 'Problemas com integrações', icon: Globe },
  { value: 'ui', label: '🎨 Interface', description: 'Problemas visuais ou de usabilidade', icon: Monitor },
  { value: 'performance', label: '⚡ Performance', description: 'Lentidão ou problemas de performance', icon: Cpu },
  { value: 'security', label: '🔒 Segurança', description: 'Vulnerabilidades ou questões de segurança', icon: AlertCircle },
  { value: 'accessibility', label: '♿ Acessibilidade', description: 'Problemas de acessibilidade', icon: User }
] as const;

const PRIORITIES = [
  { value: 'low', label: '🟢 Baixa', color: 'bg-green-100 text-green-800 border-green-200', description: 'Pode aguardar próxima versão' },
  { value: 'medium', label: '🟡 Média', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', description: 'Importante mas não urgente' },
  { value: 'high', label: '🟠 Alta', color: 'bg-orange-100 text-orange-800 border-orange-200', description: 'Precisa ser resolvido em breve' },
  { value: 'critical', label: '🔴 Crítica', color: 'bg-red-100 text-red-800 border-red-200', description: 'Sistema parcialmente comprometido' },
  { value: 'urgent', label: '🚨 Urgente', color: 'bg-red-200 text-red-900 border-red-300', description: 'Sistema completamente indisponível' }
] as const;

const CATEGORIES = [
  { value: 'frontend', label: 'Frontend', icon: Monitor },
  { value: 'backend', label: 'Backend', icon: HardDrive },
  { value: 'database', label: 'Banco de Dados', icon: HardDrive },
  { value: 'api', label: 'API', icon: Globe },
  { value: 'mobile', label: 'Mobile', icon: Smartphone },
  { value: 'desktop', label: 'Desktop', icon: Monitor },
  { value: 'infrastructure', label: 'Infraestrutura', icon: Wifi },
  { value: 'third-party', label: 'Terceiros', icon: Globe }
] as const;

const SEVERITIES = [
  { value: 'minor', label: 'Menor', color: 'bg-blue-100 text-blue-800' },
  { value: 'moderate', label: 'Moderada', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'major', label: 'Maior', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Crítica', color: 'bg-red-100 text-red-800' },
  { value: 'blocker', label: 'Bloqueante', color: 'bg-red-200 text-red-900' }
] as const;

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  allowAnonymous = false,
  maxFileSize = 10,
  allowedFileTypes = ['image/*', '.pdf', '.txt', '.doc', '.docx']
}) => {
  // Tipagem explícita do estado inicial
  const initialFormData: Omit<IssueReport, 'environment' | 'systemInfo'> = {
    title: '',
    description: '',
    type: 'bug',
    priority: 'medium',
    category: 'frontend',
    severity: 'moderate',
    reproducible: false,
    steps: [''],
    expectedBehavior: '',
    actualBehavior: '',
    workaround: '',
    affectedUsers: undefined,
    businessImpact: '',
    attachments: [],
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      role: ''
    }
  };
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Omit<IssueReport, 'environment' | 'systemInfo'>>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [environment, setEnvironment] = useState<IssueReport['environment'] | null>(null);

  const steps = useMemo(() => [
    { title: 'Tipo & Categoria', description: 'Classificação do problema' },
    { title: 'Detalhes', description: 'Informações principais' },
    { title: 'Reprodução', description: 'Como reproduzir o problema' },
    { title: 'Impacto', description: 'Impacto no negócio' },
    { title: 'Contato', description: 'Suas informações' },
    { title: 'Revisão', description: 'Confirmar informações' }
  ], []);

  const progressPercentage = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep, steps.length]);

  // Detectar informações do ambiente com fallback seguro
  useEffect(() => {
    const detectEnvironment = async () => {
      const nav = navigator as any;
      const screen = window.screen;
      
      let deviceInfo = 'Desktop';
      if (nav.userAgentData?.mobile || /Mobile|Android|iPhone|iPad/.test(nav.userAgent)) {
        deviceInfo = 'Mobile';
      }

      let networkInfo = 'Unknown';
      if ('connection' in nav && nav.connection) {
        const connection = nav.connection;
        networkInfo = `${connection.effectiveType || 'Unknown'} (${connection.downlink || 'Unknown'}Mbps)`;
      }

      const env: IssueReport['environment'] = {
        browser: nav.userAgentData?.brands?.[0]?.brand || (nav.appName || 'Unknown'),
        browserVersion: nav.userAgentData?.brands?.[0]?.version || (nav.appVersion || 'Unknown'),
        os: nav.platform || 'Unknown',
        osVersion: nav.oscpu || nav.platform || 'Unknown',
        screenResolution: `${screen.width}x${screen.height}`,
        device: deviceInfo,
        network: networkInfo,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: nav.userAgent
      };

      setEnvironment(env);
    };

    if (isOpen) {
      detectEnvironment();
    }
  }, [isOpen]);

  // Aplicar valores padrão
  useEffect(() => {
    if (defaultValues && isOpen) {
      setFormData(prev => ({ ...prev, ...defaultValues }));
    }
  }, [defaultValues, isOpen]);

  const validateCurrentStep = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Tipo & Categoria
        if (!formData.type) newErrors.type = 'Tipo é obrigatório';
        if (!formData.category) newErrors.category = 'Categoria é obrigatória';
        break;
        
      case 1: // Detalhes
        if (!formData.title.trim()) {
          newErrors.title = 'Título é obrigatório';
        } else if (formData.title.length < 5) {
          newErrors.title = 'Título deve ter pelo menos 5 caracteres';
        } else if (formData.title.length > 100) {
          newErrors.title = 'Título deve ter no máximo 100 caracteres';
        }

        if (!formData.description.trim()) {
          newErrors.description = 'Descrição é obrigatória';
        } else if (formData.description.length < 10) {
          newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
        } else if (formData.description.length > 2000) {
          newErrors.description = 'Descrição deve ter no máximo 2000 caracteres';
        }
        break;
        
      case 2: // Reprodução
        if (formData.reproducible && formData.steps.filter(s => s.trim()).length === 0) {
          newErrors.steps = 'Pelo menos um passo é obrigatório para problemas reproduzíveis';
        }
        break;
        
      case 4: // Contato
        if (!allowAnonymous) {
          if (!formData.contactInfo.name.trim()) {
            newErrors['contactInfo.name'] = 'Nome é obrigatório';
          }
          if (!formData.contactInfo.email.trim()) {
            newErrors['contactInfo.email'] = 'Email é obrigatório';
          } else if (!/\S+@\S+\.\S+/.test(formData.contactInfo.email)) {
            newErrors['contactInfo.email'] = 'Email inválido';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData, allowAnonymous]);

  const nextStep = useCallback(() => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [validateCurrentStep, currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Reset aprimorado
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setIsSubmitting(false);
    setCurrentStep(0);
  }, []);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const maxSizeBytes = maxFileSize * 1024 * 1024;

    Array.from(files).forEach(file => {
      if (file.size > maxSizeBytes) {
        toast({
          title: 'Arquivo muito grande',
          description: `${file.name} excede o limite de ${maxFileSize}MB`,
          variant: 'destructive',
        });
        return;
      }

      const isValidType = allowedFileTypes.some(type => {
        if (type === 'image/*') return file.type.startsWith('image/');
        if (type.startsWith('.')) return file.name.endsWith(type);
        return file.type === type;
      });

      if (!isValidType) {
        toast({
          title: 'Tipo de arquivo não permitido',
          description: `${file.name} não é um tipo de arquivo válido`,
          variant: 'destructive',
        });
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments ?? []), ...validFiles].slice(0, 5) // máximo 5 arquivos
      }));
    }
  }, [maxFileSize, allowedFileTypes]);

  const removeFile = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments ?? []).filter((_, i) => i !== index)
    }));
  }, []);

  const addStep = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  }, []);

  const updateStep = useCallback((index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }));
  }, []);

  const removeStep = useCallback((index: number) => {
    if (formData.steps.length > 1) {
      setFormData(prev => ({
        ...prev,
        steps: prev.steps.filter((_, i) => i !== index)
      }));
    }
  }, [formData.steps.length]);

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep() || !environment) return;

    setIsSubmitting(true);
    
    try {
      const issue: IssueReport = {
        ...formData,
        steps: formData.steps.filter(step => step.trim()),
        environment,
        systemInfo: {
          memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory}GB` : 'Unknown',
          storage: 'permissions' in navigator ? 'Available' : 'Unknown',
          permissions: []
        }
      };

      await onSubmit(issue);

      toast({
        title: "Relatório enviado com sucesso!",
        description: "Obrigado pelo feedback. Nossa equipe irá analisar o problema.",
        duration: 5000,
      });

      onClose();
      resetForm();
    } catch (error) {
      toast({
        title: "Erro ao enviar relatório",
        description: error instanceof Error ? error.message : "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateCurrentStep, environment, formData, onSubmit, onClose, resetForm]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
      setTimeout(resetForm, 200); // delay para garantir animação do modal
    }
  }, [isSubmitting, onClose, resetForm]);

  // Corrigir updateFormData para garantir objeto ao espalhar
  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else {
        const parent = prev[keys[0] as keyof typeof prev] || {};
        return {
          ...prev,
          [keys[0]]: {
            ...parent,
            [keys[1]]: value
          }
        };
      }
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const renderStep = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo do Problema *</Label>
                <Select value={formData.type} onValueChange={(value: IssueType) => updateFormData('type', value)}>
                  <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span>{type.label}</span>
                            <span className="text-xs text-muted-foreground">{type.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <span className="text-sm text-red-500">{errors.type}</span>}
              </div>

              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={formData.category} onValueChange={(value: IssueCategory) => updateFormData('category', value)}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <category.icon className="h-4 w-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <span className="text-sm text-red-500">{errors.category}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value: IssuePriority) => updateFormData('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div className="flex flex-col">
                          <Badge variant="secondary" className={priority.color}>
                            {priority.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground mt-1">{priority.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severidade</Label>
                <Select value={formData.severity} onValueChange={(value: IssueSeverity) => updateFormData('severity', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((severity) => (
                      <SelectItem key={severity.value} value={severity.value}>
                        <Badge variant="secondary" className={severity.color}>
                          {severity.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Descreva o problema em uma frase clara e objetiva"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
                maxLength={100}
              />
              {errors.title && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </div>
              )}
              <div className="text-xs text-muted-foreground text-right">
                {formData.title.length}/100
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada *</Label>
              <Textarea
                id="description"
                placeholder="Descreva o problema detalhadamente..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                className={errors.description ? 'border-red-500' : ''}
                rows={6}
                maxLength={2000}
              />
              {errors.description && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </div>
              )}
              <div className="text-xs text-muted-foreground text-right">
                {formData.description.length}/2000
              </div>
            </div>

            <div className="space-y-4">
              <Label>Anexos (Opcional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept={allowedFileTypes.join(',')}
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para adicionar arquivos ou arraste e solte
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo {maxFileSize}MB por arquivo • {allowedFileTypes.join(', ')}
                  </p>
                </label>
              </div>

              {formData.attachments && formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reproducible"
                checked={formData.reproducible}
                onCheckedChange={(checked) => updateFormData('reproducible', checked)}
              />
              <Label htmlFor="reproducible">Este problema é reproduzível</Label>
            </div>

            {formData.reproducible && (
              <>
                <div className="space-y-4">
                  <Label>Passos para Reproduzir *</Label>
                  {formData.steps.map((step, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder={`Passo ${index + 1}`}
                          value={step}
                          onChange={(e) => updateStep(index, e.target.value)}
                        />
                      </div>
                      {formData.steps.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeStep(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addStep}
                    className="w-full"
                  >
                    Adicionar Passo
                  </Button>
                  {errors.steps && <span className="text-sm text-red-500">{errors.steps}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Comportamento Esperado</Label>
                    <Textarea
                      placeholder="O que deveria acontecer?"
                      value={formData.expectedBehavior}
                      onChange={(e) => updateFormData('expectedBehavior', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Comportamento Atual</Label>
                    <Textarea
                      placeholder="O que realmente acontece?"
                      value={formData.actualBehavior}
                      onChange={(e) => updateFormData('actualBehavior', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Solução Temporária (Workaround)</Label>
              <Textarea
                placeholder="Existe alguma forma de contornar o problema temporariamente?"
                value={formData.workaround}
                onChange={(e) => updateFormData('workaround', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Número de Usuários Afetados</Label>
              <Input
                type="number"
                placeholder="Quantos usuários são afetados?"
                value={formData.affectedUsers || ''}
                onChange={(e) => updateFormData('affectedUsers', e.target.value ? parseInt(e.target.value) : undefined)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Impacto no Negócio</Label>
              <Textarea
                placeholder="Como este problema afeta o negócio ou operações?"
                value={formData.businessImpact}
                onChange={(e) => updateFormData('businessImpact', e.target.value)}
                rows={4}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações do Sistema</CardTitle>
                <CardDescription>
                  Informações técnicas coletadas automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {environment && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Navegador:</strong> {environment.browser} {environment.browserVersion}
                      </div>
                      <div>
                        <strong>Sistema:</strong> {environment.os}
                      </div>
                      <div>
                        <strong>Dispositivo:</strong> {environment.device}
                      </div>
                      <div>
                        <strong>Resolução:</strong> {environment.screenResolution}
                      </div>
                      <div className="col-span-2">
                        <strong>URL:</strong> {environment.url}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {!allowAnonymous && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Informações de contato são obrigatórias</strong> para que possamos entrar em contato sobre o progresso do seu relatório.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome {!allowAnonymous && '*'}</Label>
                <Input
                  placeholder="Seu nome completo"
                  value={formData.contactInfo.name}
                  onChange={(e) => updateFormData('contactInfo.name', e.target.value)}
                  className={errors['contactInfo.name'] ? 'border-red-500' : ''}
                />
                {errors['contactInfo.name'] && (
                  <span className="text-sm text-red-500">{errors['contactInfo.name']}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email {!allowAnonymous && '*'}</Label>
                <Input
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={formData.contactInfo.email}
                  onChange={(e) => updateFormData('contactInfo.email', e.target.value)}
                  className={errors['contactInfo.email'] ? 'border-red-500' : ''}
                />
                {errors['contactInfo.email'] && (
                  <span className="text-sm text-red-500">{errors['contactInfo.email']}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone (Opcional)</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={formData.contactInfo.phone}
                  onChange={(e) => updateFormData('contactInfo.phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Cargo/Função (Opcional)</Label>
                <Input
                  placeholder="Desenvolvedor, Gerente, etc."
                  value={formData.contactInfo.role}
                  onChange={(e) => updateFormData('contactInfo.role', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <ScrollArea className="h-96">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo do Relatório</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Tipo:</strong> {ISSUE_TYPES.find(t => t.value === formData.type)?.label}
                    </div>
                    <div>
                      <strong>Categoria:</strong> {CATEGORIES.find(c => c.value === formData.category)?.label}
                    </div>
                    <div>
                      <strong>Prioridade:</strong> {PRIORITIES.find(p => p.value === formData.priority)?.label}
                    </div>
                    <div>
                      <strong>Severidade:</strong> {SEVERITIES.find(s => s.value === formData.severity)?.label}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <strong>Título:</strong>
                    <p className="mt-1">{formData.title}</p>
                  </div>
                  
                  <div>
                    <strong>Descrição:</strong>
                    <p className="mt-1 whitespace-pre-wrap">{formData.description}</p>
                  </div>

                  {formData.reproducible && formData.steps.filter(s => s.trim()).length > 0 && (
                    <div>
                      <strong>Passos para Reproduzir:</strong>
                      <ol className="mt-1 list-decimal list-inside space-y-1">
                        {formData.steps.filter(s => s.trim()).map((step, index) => (
                          <li key={index} className="text-sm">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {formData.attachments && formData.attachments.length > 0 && (
                    <div>
                      <strong>Anexos:</strong>
                      <ul className="mt-1 space-y-1">
                        {formData.attachments.map((file, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(formData.contactInfo.name || formData.contactInfo.email) && (
                    <div>
                      <strong>Contato:</strong>
                      <div className="mt-1 text-sm">
                        {formData.contactInfo.name && <div>Nome: {formData.contactInfo.name}</div>}
                        {formData.contactInfo.email && <div>Email: {formData.contactInfo.email}</div>}
                        {formData.contactInfo.phone && <div>Telefone: {formData.contactInfo.phone}</div>}
                        {formData.contactInfo.role && <div>Cargo: {formData.contactInfo.role}</div>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        );

      default:
        return null;
    }
  }, [currentStep, formData, errors, environment, allowAnonymous, maxFileSize, allowedFileTypes, handleFileUpload, removeFile, addStep, updateStep, removeStep, updateFormData]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-500" />
              Relatar Problema - {steps[currentStep].title}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso</span>
              <span>{currentStep + 1} de {steps.length}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex justify-center">
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentStep
                      ? 'bg-primary'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto">
          {renderStep}
        </div>

        <Separator />

        <div className="flex justify-between items-center pt-2">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
          >
            Anterior
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Relatório
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                disabled={isSubmitting}
              >
                Próximo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportIssueModal;
