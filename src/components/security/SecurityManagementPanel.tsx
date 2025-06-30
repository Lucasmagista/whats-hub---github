/**
 * 🔒 Security Management Panel - SISTEMA COMPLETO DE SEGURANÇA
 * Painel robusto para gerenciar todas as configurações de segurança
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useScreenLock, UserProfile, ScreenLockSettings } from '@/hooks/use-screen-lock';
import { PasswordSetupModal } from './PasswordSetupModal';
import { 
  Shield, 
  Lock, 
  Unlock,
  Key, 
  Timer, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  Clock,
  Users,
  Activity,
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';

interface SecuritySession {
  id: string;
  deviceInfo: string;
  location: string;
  loginTime: Date;
  lastActivity: Date;
  isActive: boolean;
}

interface SecurityAuditLog {
  id: string;
  event: 'login' | 'logout' | 'failed_attempt' | 'settings_changed' | 'password_changed';
  timestamp: Date;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AdvancedSecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  maxFailedAttempts: number;
  lockoutDuration: number;
  allowMultipleSessions: boolean;
  requirePasswordChange: boolean;
  passwordChangeInterval: number;
  enableAuditLog: boolean;
  enableSessionMonitoring: boolean;
  trustedDevices: string[];
}

export const SecurityManagementPanel: React.FC = () => {
  const { toast } = useToast();
  const { 
    isLocked, 
    settings, 
    setupScreenLock, 
    disableScreenLock, 
    updateSettings,
    isLoading 
  } = useScreenLock();

  const [activeTab, setActiveTab] = useState('overview');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditingLock, setIsEditingLock] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    maxFailedAttempts: 5,
    lockoutDuration: 15,
    allowMultipleSessions: false,
    requirePasswordChange: false,
    passwordChangeInterval: 90,
    enableAuditLog: true,
    enableSessionMonitoring: true,
    trustedDevices: []
  });
  const [securitySessions, setSecuritySessions] = useState<SecuritySession[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [isValidatingPassword, setIsValidatingPassword] = useState(false);

  useEffect(() => {
    loadAdvancedSettings();
    loadSecuritySessions();
    loadAuditLogs();
  }, []);

  const loadAdvancedSettings = () => {
    try {
      const saved = localStorage.getItem('whatsapp-hub-advanced-security');
      if (saved) {
        setAdvancedSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações avançadas:', error);
    }
  };

  const saveAdvancedSettings = (newSettings: AdvancedSecuritySettings) => {
    try {
      localStorage.setItem('whatsapp-hub-advanced-security', JSON.stringify(newSettings));
      setAdvancedSettings(newSettings);
      addAuditLog('settings_changed', 'Configurações de segurança atualizadas');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const loadSecuritySessions = () => {
    // Simulação de sessões ativas
    const mockSessions: SecuritySession[] = [
      {
        id: '1',
        deviceInfo: 'Chrome 120.0 (Windows 11)',
        location: 'São Paulo, SP',
        loginTime: new Date(Date.now() - 3600000),
        lastActivity: new Date(),
        isActive: true
      },
      {
        id: '2',
        deviceInfo: 'Firefox 121.0 (Windows 11)',
        location: 'São Paulo, SP',
        loginTime: new Date(Date.now() - 7200000),
        lastActivity: new Date(Date.now() - 1800000),
        isActive: false
      }
    ];
    setSecuritySessions(mockSessions);
  };

  const loadAuditLogs = () => {
    // Simulação de logs de auditoria
    const mockLogs: SecurityAuditLog[] = [
      {
        id: '1',
        event: 'login',
        timestamp: new Date(),
        details: 'Login realizado com sucesso',
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        event: 'settings_changed',
        timestamp: new Date(Date.now() - 3600000),
        details: 'Timeout de sessão alterado para 30 minutos',
        ipAddress: '192.168.1.100'
      },
      {
        id: '3',
        event: 'failed_attempt',
        timestamp: new Date(Date.now() - 7200000),
        details: 'Tentativa de login falhada - senha incorreta',
        ipAddress: '192.168.1.100'
      }
    ];
    setAuditLogs(mockLogs);
  };

  const addAuditLog = (event: SecurityAuditLog['event'], details: string) => {
    if (!advancedSettings.enableAuditLog) return;

    const newLog: SecurityAuditLog = {
      id: Date.now().toString(),
      event,
      timestamp: new Date(),
      details,
      ipAddress: '192.168.1.100' // Seria obtido dinamicamente
    };

    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]); // Manter apenas 100 logs
  };

  const handleSetupLock = async (password: string, autoLockTime: number, userProfile: UserProfile) => {
    const success = await setupScreenLock(password, autoLockTime, userProfile);
    if (success) {
      setIsPasswordModalOpen(false);
      addAuditLog('settings_changed', 'Bloqueio de tela configurado');
      toast({
        title: "Bloqueio Configurado",
        description: "Bloqueio de tela configurado com sucesso!",
        variant: "default"
      });
    }
    return success;
  };

  const handleDisableLock = async () => {
    if (!currentPassword) {
      toast({
        title: "Senha Necessária",
        description: "Digite a senha atual para desabilitar o bloqueio",
        variant: "destructive"
      });
      return;
    }

    setIsValidatingPassword(true);
    try {
      // Validar senha atual
      const passwordHash = await hashPassword(currentPassword);
      const savedHash = localStorage.getItem('whatsapp-hub-password-hash');
      
      if (passwordHash !== savedHash) {
        toast({
          title: "Senha Incorreta",
          description: "A senha digitada está incorreta",
          variant: "destructive"
        });
        return;
      }

      await disableScreenLock();
      setCurrentPassword('');
      addAuditLog('settings_changed', 'Bloqueio de tela desabilitado');
      toast({
        title: "Bloqueio Desabilitado",
        description: "O bloqueio de tela foi desabilitado com sucesso",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao desabilitar bloqueio de tela",
        variant: "destructive"
      });
    } finally {
      setIsValidatingPassword(false);
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const terminateSession = (sessionId: string) => {
    setSecuritySessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, isActive: false }
          : session
      )
    );
    addAuditLog('logout', `Sessão ${sessionId} terminada remotamente`);
    toast({
      title: "Sessão Terminada",
      description: "A sessão foi terminada com sucesso",
      variant: "default"
    });
  };

  const getSecurityScore = (): number => {
    let score = 0;
    if (settings?.enabled) score += 30;
    if (advancedSettings.twoFactorEnabled) score += 25;
    if (advancedSettings.enableAuditLog) score += 15;
    if (advancedSettings.enableSessionMonitoring) score += 15;
    if (advancedSettings.maxFailedAttempts <= 3) score += 10;
    if (settings?.autoLockTimeout && settings.autoLockTimeout <= 15) score += 5;
    return Math.min(score, 100);
  };

  const getSecurityLevel = (score: number): { level: string; color: string; icon: React.ReactNode } => {
    if (score >= 80) return { 
      level: 'Excelente', 
      color: 'text-green-600 bg-green-100', 
      icon: <ShieldCheck className="h-4 w-4" /> 
    };
    if (score >= 60) return { 
      level: 'Boa', 
      color: 'text-blue-600 bg-blue-100', 
      icon: <Shield className="h-4 w-4" /> 
    };
    if (score >= 40) return { 
      level: 'Regular', 
      color: 'text-yellow-600 bg-yellow-100', 
      icon: <ShieldAlert className="h-4 w-4" /> 
    };
    return { 
      level: 'Baixa', 
      color: 'text-red-600 bg-red-100', 
      icon: <AlertTriangle className="h-4 w-4" /> 
    };
  };

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciamento de Segurança</h2>
          <p className="text-muted-foreground">
            Configure e monitore todas as configurações de segurança do sistema
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Nível de Segurança</div>
            <Badge className={`${securityLevel.color} flex items-center gap-1`}>
              {securityLevel.icon}
              {securityLevel.level}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Score</div>
            <div className="text-2xl font-bold">{securityScore}/100</div>
          </div>
        </div>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="screen-lock">Bloqueio de Tela</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status do Bloqueio de Tela */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bloqueio de Tela</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {settings?.enabled ? 'Ativado' : 'Desativado'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {settings?.enabled 
                    ? `Auto-bloqueio em ${settings.autoLockTimeout}min`
                    : 'Configure para maior segurança'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Sessões Ativas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {securitySessions.filter(s => s.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {securitySessions.length} sessões no total
                </p>
              </CardContent>
            </Card>

            {/* Últimos Eventos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos Recentes</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditLogs.length}</div>
                <p className="text-xs text-muted-foreground">
                  Último: {auditLogs[0]?.timestamp.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recomendações de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendações de Segurança</CardTitle>
              <CardDescription>
                Melhore a segurança do seu sistema seguindo essas recomendações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!settings?.enabled && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Configure um bloqueio de tela para proteger o acesso ao sistema
                  </AlertDescription>
                </Alert>
              )}
              
              {!advancedSettings.twoFactorEnabled && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Habilite a autenticação de dois fatores para maior segurança
                  </AlertDescription>
                </Alert>
              )}
              
              {settings?.autoLockTimeout && settings.autoLockTimeout > 30 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Considere reduzir o tempo de auto-bloqueio para menos de 30 minutos
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screen-lock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Bloqueio de Tela</CardTitle>
              <CardDescription>
                Gerencie o bloqueio automático de tela e configurações relacionadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!settings?.enabled ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Unlock className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Bloqueio de Tela Desativado</h3>
                    <p className="text-muted-foreground">
                      Configure um bloqueio de tela para proteger o acesso ao sistema
                    </p>
                  </div>
                  <Button onClick={() => setIsPasswordModalOpen(true)}>
                    <Lock className="h-4 w-4 mr-2" />
                    Configurar Bloqueio
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Atual */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Lock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800">Bloqueio Ativo</h3>
                        <p className="text-sm text-green-600">
                          Auto-bloqueio em {settings.autoLockTimeout} minutos de inatividade
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingLock(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>

                  {/* Informações do Usuário */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Perfil do Usuário</h4>
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      {settings.userProfile.photoUrl ? (
                        <img 
                          src={settings.userProfile.photoUrl} 
                          alt={settings.userProfile.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {settings.userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h5 className="font-medium">{settings.userProfile.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {settings.userProfile.phoneNumber || 'Sem número registrado'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Opções de Modificação */}
                  {isEditingLock && (
                    <div className="space-y-4 p-4 border-2 border-dashed border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Modificar Configurações</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          onClick={() => setIsPasswordModalOpen(true)}
                          className="h-20 flex-col"
                        >
                          <Edit3 className="h-6 w-6 mb-2" />
                          Alterar Perfil
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => setIsPasswordModalOpen(true)}
                          className="h-20 flex-col"
                        >
                          <Key className="h-6 w-6 mb-2" />
                          Alterar Senha
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h5 className="font-medium text-red-600">Zona de Perigo</h5>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Senha Atual</Label>
                            <div className="relative">
                              <Input
                                id="current-password"
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Digite sua senha atual"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <Button 
                            variant="destructive"
                            onClick={handleDisableLock}
                            disabled={!currentPassword || isValidatingPassword}
                            className="w-full"
                          >
                            {isValidatingPassword ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Desabilitar Bloqueio de Tela
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          variant="outline"
                          onClick={() => setIsEditingLock(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Sessões</CardTitle>
              <CardDescription>
                Monitore e gerencie as sessões ativas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {securitySessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${session.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <h4 className="font-medium">{session.deviceInfo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {session.location} • Login: {session.loginTime.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Última atividade: {session.lastActivity.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={session.isActive ? "default" : "secondary"}>
                      {session.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                    {session.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                      >
                        Terminar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Configure opções avançadas de segurança e monitoramento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="two-factor">Autenticação de Dois Fatores</Label>
                    <Switch
                      id="two-factor"
                      checked={advancedSettings.twoFactorEnabled}
                      onCheckedChange={(checked) => 
                        saveAdvancedSettings({...advancedSettings, twoFactorEnabled: checked})
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
                    <Select
                      value={advancedSettings.sessionTimeout.toString()}
                      onValueChange={(value) => 
                        saveAdvancedSettings({...advancedSettings, sessionTimeout: parseInt(value)})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                        <SelectItem value="240">4 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">Máximo de Tentativas Falhadas</Label>
                    <Slider
                      id="max-attempts"
                      min={3}
                      max={10}
                      step={1}
                      value={[advancedSettings.maxFailedAttempts]}
                      onValueChange={(value) => 
                        saveAdvancedSettings({...advancedSettings, maxFailedAttempts: value[0]})
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      {advancedSettings.maxFailedAttempts} tentativas
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lockout-duration">Duração do Bloqueio (minutos)</Label>
                    <Select
                      value={advancedSettings.lockoutDuration.toString()}
                      onValueChange={(value) => 
                        saveAdvancedSettings({...advancedSettings, lockoutDuration: parseInt(value)})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutos</SelectItem>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="multiple-sessions">Permitir Múltiplas Sessões</Label>
                    <Switch
                      id="multiple-sessions"
                      checked={advancedSettings.allowMultipleSessions}
                      onCheckedChange={(checked) => 
                        saveAdvancedSettings({...advancedSettings, allowMultipleSessions: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="audit-log">Log de Auditoria</Label>
                    <Switch
                      id="audit-log"
                      checked={advancedSettings.enableAuditLog}
                      onCheckedChange={(checked) => 
                        saveAdvancedSettings({...advancedSettings, enableAuditLog: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="session-monitoring">Monitoramento de Sessão</Label>
                    <Switch
                      id="session-monitoring"
                      checked={advancedSettings.enableSessionMonitoring}
                      onCheckedChange={(checked) => 
                        saveAdvancedSettings({...advancedSettings, enableSessionMonitoring: checked})
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log de Auditoria</CardTitle>
              <CardDescription>
                Histórico de eventos de segurança e atividades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        log.event === 'login' ? 'bg-green-500' :
                        log.event === 'failed_attempt' ? 'bg-red-500' :
                        log.event === 'logout' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div>
                        <h4 className="font-medium">{log.details}</h4>
                        <p className="text-sm text-muted-foreground">
                          {log.timestamp.toLocaleString()}
                          {log.ipAddress && ` • IP: ${log.ipAddress}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {log.event.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Configuração de Senha */}
      <PasswordSetupModal
        isOpen={isPasswordModalOpen}
        onSave={handleSetupLock}
        onCancel={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default SecurityManagementPanel;
