import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/services/emailService';
import { EmailExamples } from '@/examples/emailExamples';
import {
  Send,
  Clock,
  Users,
  Shield,
  Gift,
  AlertCircle,
  BarChart3,
  Calendar,
  Sparkles,
  Bot
} from 'lucide-react';
import type { Campaign, ScheduledEmail } from '@/services/emailService';

interface AdvancedEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdvancedEmailModal: React.FC<AdvancedEmailModalProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('welcome');
  const [isConfigured, setIsConfigured] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [analytics, setAnalytics] = useState({ sentEmails: 0, templates: 0, campaigns: 0 });

  // Estados para formulários
  const [welcomeForm, setWelcomeForm] = useState({
    email: '',
    name: ''
  });

  const [securityForm, setSecurityForm] = useState({
    email: '',
    alertType: 'Login Suspeito',
    description: 'Detectamos um login de um novo dispositivo'
  });

  const [campaignForm, setCampaignForm] = useState({
    name: 'Campanha de Teste',
    description: 'Campanha para testar funcionalidades',
    recipients: '',
    title: 'Newsletter WhatsHub',
    content: 'Confira as últimas novidades do sistema!'
  });

  const [scheduleForm, setScheduleForm] = useState({
    email: '',
    template: 'template_welcome',
    subject: 'Email Agendado',
    message: 'Este é um email agendado para teste',
    scheduleMinutes: 5
  });

  // Estados para listagem
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);

  useEffect(() => {
    if (open) {
      setIsConfigured(emailService.isConfigured());
      setAnalytics(emailService.getAnalytics());
      setCampaigns(emailService.getCampaigns ? emailService.getCampaigns() : []);
      setScheduledEmails(emailService.getScheduledEmails ? emailService.getScheduledEmails() : []);
    }
  }, [open]);

  const handleWelcomeEmail = async () => {
    if (!welcomeForm.email || !welcomeForm.name) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e nome",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const result = await EmailExamples.boasVindas({
        email: welcomeForm.email,
        nome: welcomeForm.name
      });

      if (result?.success) {
        toast({
          title: "🎉 Email de boas-vindas enviado!",
          description: `Email enviado para ${welcomeForm.name}`,
        });
        
        setWelcomeForm({ email: '', name: '' });
        setAnalytics(emailService.getAnalytics()); // Atualiza analytics
      } else {
        throw new Error(result?.message ?? 'Erro ao enviar');
      }
    } catch (error) {
      toast({
        title: "Erro no envio",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSecurityAlert = async () => {
    if (!securityForm.email) {
      toast({
        title: "Email obrigatório",
        description: "Preencha o email do destinatário",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const result = await EmailExamples.seguranca(securityForm.email);

      if (result?.success) {
        toast({
          title: "🔒 Alerta de segurança enviado!",
          description: "Email de alerta enviado com sucesso",
        });
        
        setSecurityForm({ ...securityForm, email: '' });
        setAnalytics(emailService.getAnalytics()); // Atualiza analytics
      } else {
        throw new Error(result?.message ?? 'Erro ao enviar');
      }
    } catch (error) {
      toast({
        title: "Erro no envio",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.recipients || !campaignForm.title || !campaignForm.content) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos da campanha.',
        variant: 'destructive',
      });
      return;
    }
    setProcessing(true);
    try {
      const recipients = campaignForm.recipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email.includes('@'));
      if (recipients.length === 0) {
        toast({
          title: 'Destinatários inválidos',
          description: 'Adicione pelo menos um email válido.',
          variant: 'destructive',
        });
        setProcessing(false);
        return;
      }
      const campaignId = emailService.createCampaign(
        campaignForm.name,
        campaignForm.description,
        'template_newsletter',
        recipients
      );
      const success = await emailService.sendCampaign(campaignId, {
        newsletter_title: campaignForm.title,
        newsletter_content: campaignForm.content,
        newsletter_date: new Date().toLocaleDateString('pt-BR')
      });
      if (success) {
        toast({
          title: '📢 Campanha enviada!',
          description: `Campanha para ${recipients.length} destinatários`,
        });
        setCampaignForm({ ...campaignForm, recipients: '' });
        setAnalytics(emailService.getAnalytics()); // Atualiza analytics
        setCampaigns(emailService.getCampaigns ? emailService.getCampaigns() : []);
      } else {
        throw new Error('Falha ao enviar campanha');
      }
    } catch (error) {
      toast({
        title: 'Erro na campanha',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };
  const handleScheduleEmail = async () => {
    if (!scheduleForm.email || !scheduleForm.subject || !scheduleForm.message || !scheduleForm.scheduleMinutes) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos do agendamento.',
        variant: 'destructive',
      });
      return;
    }
    setProcessing(true);
    try {
      const scheduleDate = new Date();
      scheduleDate.setMinutes(scheduleDate.getMinutes() + scheduleForm.scheduleMinutes);
      const emailId = emailService.scheduleEmail(
        scheduleForm.template,
        {
          to_email: scheduleForm.email,
          subject: scheduleForm.subject,
          message: scheduleForm.message,
          scheduled_time: scheduleDate.toLocaleString('pt-BR')
        },
        scheduleForm.email,
        scheduleDate
      );
      toast({
        title: '📅 Email agendado!',
        description: `Email ${emailId} será enviado em ${scheduleForm.scheduleMinutes} minutos`,
      });
      setScheduleForm({ ...scheduleForm, email: '' });
      setAnalytics(emailService.getAnalytics()); // Atualiza analytics
      setScheduledEmails(emailService.getScheduledEmails ? emailService.getScheduledEmails() : []);
    } catch (error) {
      toast({
        title: 'Erro no agendamento',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };
  const handleRunExamples = async () => {
    toast({
      title: 'Funcionalidade em breve',
      description: 'Automação de exemplos ainda não está disponível nesta versão.',
      variant: 'destructive',
    });
  };
  const handleTestAll = async () => {
    toast({
      title: 'Funcionalidade em breve',
      description: 'Testes completos ainda não estão disponíveis nesta versão.',
      variant: 'destructive',
    });
  };

  if (!isConfigured) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-md"
          aria-describedby="email-not-configured-description"
        >
          <DialogDescription id="email-not-configured-description">
            O MailerSend precisa ser configurado antes de usar as funcionalidades avançadas de email.
          </DialogDescription>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              MailerSend não configurado
            </DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Configure o MailerSend primeiro no botão "📧 Email" do header para usar as funcionalidades avançadas.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (    <Dialog open={open} onOpenChange={onOpenChange}>      <DialogContent 
        className="stable-modal-content max-w-4xl max-h-[90vh] overflow-y-auto modal-content-stable"
        aria-describedby="advanced-email-description"
      >
        <DialogDescription id="advanced-email-description">
          Funcionalidades avançadas de email incluindo campanhas, analytics, templates e automações.
        </DialogDescription>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Funcionalidades Avançadas de Email
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="welcome" className="flex items-center gap-1">
              <Gift className="w-3 h-3" />
              Boas-vindas
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Campanhas
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Agendados
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-1">
              <Bot className="w-3 h-3" />
              Automação
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Aba Boas-vindas */}
          <TabsContent value="welcome" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Email de Boas-vindas
                </CardTitle>
                <CardDescription>
                  Envie emails de boas-vindas personalizados para novos usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="welcome-email">Email do usuário</Label>
                    <Input
                      id="welcome-email"
                      type="email"
                      value={welcomeForm.email}
                      onChange={(e) => setWelcomeForm({...welcomeForm, email: e.target.value})}
                      placeholder="usuario@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="welcome-name">Nome do usuário</Label>
                    <Input
                      id="welcome-name"
                      value={welcomeForm.name}
                      onChange={(e) => setWelcomeForm({...welcomeForm, name: e.target.value})}
                      placeholder="João Silva"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleWelcomeEmail}
                    disabled={processing}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Boas-vindas
                  </Button>
                </div>

                <Alert>
                  <Gift className="w-4 h-4" />
                  <AlertDescription>
                    O email incluirá um template profissional com instruções de início,
                    recursos disponíveis e informações de contato.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Segurança */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Alertas de Segurança
                </CardTitle>
                <CardDescription>
                  Envie alertas de segurança para usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="security-email">Email do usuário</Label>
                    <Input
                      id="security-email"
                      type="email"
                      value={securityForm.email}
                      onChange={(e) => setSecurityForm({...securityForm, email: e.target.value})}
                      placeholder="usuario@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alert-type">Tipo de alerta</Label>
                    <Input
                      id="alert-type"
                      value={securityForm.alertType}
                      onChange={(e) => setSecurityForm({...securityForm, alertType: e.target.value})}
                      placeholder="Login Suspeito"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="alert-description">Descrição</Label>
                  <Textarea
                    id="alert-description"
                    value={securityForm.description}
                    onChange={(e) => setSecurityForm({...securityForm, description: e.target.value})}
                    placeholder="Descrição detalhada do alerta de segurança"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSecurityAlert}
                    disabled={processing}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Enviar Alerta
                  </Button>
                </div>

                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    Alertas de segurança incluem informações detalhadas, passos de verificação
                    e links para ações de segurança.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Campanhas */}
          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Campanhas de Email
                </CardTitle>
                <CardDescription>
                  Crie e envie campanhas para múltiplos destinatários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Formulário de campanha */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaign-name">Nome da campanha</Label>
                    <Input
                      id="campaign-name"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                      placeholder="Newsletter Semanal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-title">Título do email</Label>
                    <Input
                      id="campaign-title"
                      value={campaignForm.title}
                      onChange={(e) => setCampaignForm({...campaignForm, title: e.target.value})}
                      placeholder="Newsletter WhatsHub"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="campaign-recipients">Destinatários (separados por vírgula)</Label>
                  <Textarea
                    id="campaign-recipients"
                    value={campaignForm.recipients}
                    onChange={(e) => setCampaignForm({...campaignForm, recipients: e.target.value})}
                    placeholder="user1@email.com, user2@email.com, user3@email.com"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="campaign-content">Conteúdo</Label>
                  <Textarea
                    id="campaign-content"
                    value={campaignForm.content}
                    onChange={(e) => setCampaignForm({...campaignForm, content: e.target.value})}
                    placeholder="Conteúdo da newsletter..."
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateCampaign}
                    disabled={processing}
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Criar e Enviar Campanha
                  </Button>
                </div>
                <Alert>
                  <Users className="w-4 h-4" />
                  <AlertDescription>
                    Campanhas respeitam automaticamente os limites de rate do EmailJS (10 emails/minuto).
                    O sistema envia com intervalos seguros entre cada email.
                  </AlertDescription>
                </Alert>
                {/* Listagem de campanhas */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Campanhas Recentes</h4>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 bg-muted">
                    {campaigns.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Nenhuma campanha cadastrada.</div>
                    ) : (
                      <ul className="text-xs">
                        {campaigns.slice().reverse().map((c) => (
                          <li key={c.id} className="mb-1 flex flex-col border-b last:border-b-0 pb-1">
                            <span className="font-medium">{c.name}</span>
                            <span>Destinatários: {c.recipients.length}</span>
                            <span>Status: {c.sent ? 'Enviada' : 'Pendente'}</span>
                            <span className="text-muted-foreground">Criada: {c.createdAt && new Date(c.createdAt).toLocaleString('pt-BR')}</span>
                            {c.sentAt && <span className="text-muted-foreground">Enviada: {new Date(c.sentAt).toLocaleString('pt-BR')}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Agendamentos */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Emails Agendados
                </CardTitle>
                <CardDescription>
                  Agende emails para envio futuro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Formulário de agendamento */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule-email">Email do destinatário</Label>
                    <Input
                      id="schedule-email"
                      type="email"
                      value={scheduleForm.email}
                      onChange={(e) => setScheduleForm({...scheduleForm, email: e.target.value})}
                      placeholder="usuario@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule-minutes">Agendar para (minutos)</Label>
                    <Input
                      id="schedule-minutes"
                      type="number"
                      value={scheduleForm.scheduleMinutes}
                      onChange={(e) => setScheduleForm({...scheduleForm, scheduleMinutes: parseInt(e.target.value) || 5})}
                      min="1"
                      max="1440"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="schedule-subject">Assunto</Label>
                  <Input
                    id="schedule-subject"
                    value={scheduleForm.subject}
                    onChange={(e) => setScheduleForm({...scheduleForm, subject: e.target.value})}
                    placeholder="Email Agendado"
                  />
                </div>
                
                <div>
                  <Label htmlFor="schedule-message">Mensagem</Label>
                  <Textarea
                    id="schedule-message"
                    value={scheduleForm.message}
                    onChange={(e) => setScheduleForm({...scheduleForm, message: e.target.value})}
                    placeholder="Conteúdo do email agendado..."
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleScheduleEmail}
                    disabled={processing}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Agendar Email
                  </Button>
                </div>
                <Alert>
                  <Clock className="w-4 h-4" />
                  <AlertDescription>
                    Emails agendados são processados automaticamente pelo sistema a cada minuto.
                    Você pode agendar para qualquer momento futuro.
                  </AlertDescription>
                </Alert>
                {/* Listagem de agendados */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Próximos Agendamentos</h4>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 bg-muted">
                    {scheduledEmails.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Nenhum email agendado.</div>
                    ) : (
                      <ul className="text-xs">
                        {scheduledEmails.slice().reverse().map((e) => (
                          <li key={e.id} className="mb-1 flex flex-col border-b last:border-b-0 pb-1">
                            <span className="font-medium">{e.subject}</span>
                            <span>Para: {e.to}</span>
                            <span>Agendado para: {e.sendAt && new Date(e.sendAt).toLocaleString('pt-BR')}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Automação */}
          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Automação e Exemplos
                </CardTitle>
                <CardDescription>
                  Execute exemplos e configure automações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🤖 Notificações de Bots</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Simula notificações de conexão/desconexão de bots
                    </p>
                    <Button 
                      onClick={handleRunExamples}
                      disabled={processing}
                      size="sm"
                      variant="outline"
                    >
                      Executar Exemplos
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🧪 Teste Completo</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Executa todos os testes do sistema
                    </p>
                    <Button 
                      onClick={handleTestAll}
                      disabled={processing}
                      size="sm"
                      variant="outline"
                    >
                      Testar Tudo
                    </Button>
                  </div>
                </div>

                <Alert>
                  <Bot className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Auto-respostas configuradas:</strong> O sistema criará automaticamente
                    regras para responder a novos usuários e relatórios com baixa satisfação.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics e Relatórios
                </CardTitle>
                <CardDescription>
                  Veja estatísticas e performance do sistema de email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.sentEmails}
                    </div>
                    <div className="text-sm text-muted-foreground">Emails Enviados</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.templates}
                    </div>
                    <div className="text-sm text-muted-foreground">Templates</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics.campaigns}
                    </div>
                    <div className="text-sm text-muted-foreground">Campanhas</div>
                  </div>
                </div>
                <Button 
                  onClick={() => toast({ title: 'Funcionalidade em breve', description: 'Relatórios completos estarão disponíveis em breve.' })}
                  className="w-full"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Gerar Relatório Completo
                </Button>
                <Alert>
                  <BarChart3 className="w-4 h-4" />
                  <AlertDescription>
                    O sistema mantém estatísticas detalhadas de todos os emails enviados,
                    incluindo taxa de sucesso, templates mais usados e campanhas ativas.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between border-t pt-4">
          <Badge variant="outline" className="text-green-600 border-green-600">
            ✅ Sistema Funcional
          </Badge>
          
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedEmailModal;
