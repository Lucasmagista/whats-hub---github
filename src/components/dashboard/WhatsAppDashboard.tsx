import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatInterface from './ChatInterface';
import TicketManager from './TicketManager';
import MessageQueue from './MessageQueue';
import SettingsModal from './SettingsModal';
import DevModal from './DevModal';
import { Button } from '@/components/ui/button';
import './WhatsAppDashboard.css';
import './OptimizedLayout.css';
import './ModernHeader.css';
import '@/components/ui/sidebar-modern.css';
import { BotStatusModal } from './BotStatus';
import AboutBotModal from './AboutBotModal';
import ReportIssueModal from './ReportIssueModal';
import EmailConfigModal from './EmailConfigModal';
import AdvancedEmailModal from './AdvancedEmailModal';
import { BotLogsModal } from './BotLogsModal';
import { QRCodeModal } from './QRCodeModal';
import { AdvancedSettingsModal } from '@/components/n8n/AdvancedSettingsModal';
import { Bot, Sparkles, Bug, Mail, MessageCircle, Ticket, Clock, Settings, Bell, Zap, Network, Workflow } from 'lucide-react';
import IntegrationPage from './IntegrationPage';
import WorkflowBuilderPage from './WorkflowBuilderPage';
import { useIsMobile } from "@/hooks/use-mobile";
import WelcomeScreen from './WelcomeScreen';
import WelcomeScreenModal from './WelcomeScreenModal';
import { Bot as BotType } from '@/types/global';
import { ThemeProvider, useTheme } from './ThemeContext';
import { dashboardNotificationService } from '@/services/dashboardNotificationService';
import { emailService } from '@/services/emailService';
import { useScreenLock } from '@/hooks/use-screen-lock';
import { useIdleTimer } from '@/hooks/use-idle-timer';
import { LockScreen } from '@/components/security/LockScreen';
import { SidebarLayout } from '@/components/SidebarLayout';
// FASE 1 - Integração N8N Components
import { N8nStatusCard } from '@/components/n8n/N8nStatusCard';
import { SupportQueuePanel } from '@/components/support-queue/SupportQueuePanel';
import { RealTimeLogs } from '@/components/automation/RealTimeLogs';
import { N8nIntegrationTestPage } from '@/components/n8n/N8nIntegrationTestPage';
// FASE 1 - Hooks for N8N Integration
import { useN8nConnection } from '@/hooks/useN8nConnection';
import { useSupportQueue } from '@/hooks/useSupportQueue';

interface Chat {
  id: string;
  contact: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  botId: string;
  status: 'active' | 'pending' | 'closed';
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  slaTime?: string;
}

const LOCAL_STORAGE_TAB_KEY = 'whatsapp_dashboard_active_tab';
const LOCAL_STORAGE_WELCOME_KEY = 'whatsapp_dashboard_welcome_seen';

const WhatsAppDashboard = () => {
  console.log("Renderizando WhatsAppDashboard"); // Debug: verifique se aparece no console

  // FASE 1 - Hooks para integração N8N
  const n8nConnection = useN8nConnection();
  const supportQueue = useSupportQueue();

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState<'chats' | 'tickets' | 'queue' | 'integrations' | 'workflows' | 'n8n' | 'tests'>('chats');
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const [showBotStatus, setShowBotStatus] = useState(false);
  const [showReportIssue, setShowReportIssue] = useState(false);
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [showAdvancedEmail, setShowAdvancedEmail] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  // Estados para os modais dos bots
  const [selectedBot, setSelectedBot] = useState<BotType | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const [showWelcome, setShowWelcome] = useState(() => {
    // Verificar se o usuário já viu a tela de boas-vindas
    console.log("Verificando localStorage para welcome screen...");
    const hasSeenWelcome = localStorage.getItem(LOCAL_STORAGE_WELCOME_KEY);
    console.log("Valor no localStorage:", hasSeenWelcome);
    const shouldShow = !hasSeenWelcome;
    console.log("Deve mostrar welcome:", shouldShow);
    return shouldShow; // Mostrar welcome apenas se não foi visto antes
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false); // Novo estado para o modal
  const isMobile = useIsMobile();
  
  // Screen lock functionality
  const screenLock = useScreenLock();
  
  // Debug logs
  useEffect(() => {
    console.log('🔒 Screen Lock Status:', {
      isLocked: screenLock.isLocked,
      settings: screenLock.settings,
      config: screenLock.config
    });
  }, [screenLock.isLocked, screenLock.settings, screenLock.config]);
  
  // Handle auto-lock when idle - only when not locked
  useIdleTimer({
    timeout: (screenLock.settings?.autoLockTimeout ?? 15) * 60 * 1000, // Convert minutes to milliseconds
    onIdle: () => {
      console.log('⏰ Idle timer triggered!');
      if (screenLock.settings?.enabled && !screenLock.isLocked) {
        console.log('🔒 Locking screen due to inactivity...');
        screenLock.lock();
      } else {
        console.log('⏰ Idle timer triggered but screen is already locked or disabled');
      }
    },
    enabled: (screenLock.settings?.enabled ?? false) && !screenLock.isLocked // Disable timer when locked
  });

  // Handle unlock
  const handleUnlock = async (password: string) => {
    console.log('🔓 Attempting to unlock...');
    const result = await screenLock.unlock(password);
    console.log('🔓 Unlock result:', result);
    
    if (result) {
      console.log('🔓 Unlock successful - timer will be re-enabled automatically');
      // O useIdleTimer será automaticamente re-habilitado quando isLocked mudar para false
    }
    
    return result;
  };

  // Restaurar aba ativa do localStorage ao montar
  useEffect(() => {
    const savedTab = localStorage.getItem(LOCAL_STORAGE_TAB_KEY);
    if (savedTab === 'chats' || savedTab === 'tickets' || savedTab === 'queue' || savedTab === 'integrations' || savedTab === 'workflows') {
      setActiveTab(savedTab);
    }

    // Inicializar sistema de notificações
    initializeNotificationSystem();
  }, []);

  // Inicializar sistema de notificações e monitoramento
  const initializeNotificationSystem = () => {
    // Simular eventos do sistema para demonstração
    setTimeout(() => {
      dashboardNotificationService.notifyBotConnected('bot-demo-001', 'Bot Principal');
    }, 5000);

    // Simular métricas de performance a cada minuto
    const metricsInterval = setInterval(() => {
      const metrics = {
        cpuUsage: 30 + Math.random() * 40,
        memoryUsage: 50 + Math.random() * 30,
        responseTime: 200 + Math.random() * 300,
        errorRate: Math.random() * 3,
        activeConnections: Math.floor(50 + Math.random() * 100),
        queueSize: Math.floor(Math.random() * 20),
        timestamp: new Date().toISOString()
      };

      dashboardNotificationService.recordPerformanceMetrics(metrics);
    }, 60000); // A cada minuto

    // Cleanup do interval quando o componente for desmontado
    return () => {
      if (metricsInterval) {
        clearInterval(metricsInterval);
      }
    };
  };

  // Sempre que activeTab mudar, salvar no localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TAB_KEY, activeTab);
  }, [activeTab]);

  // Função para fechar o modal de boas-vindas e marcar como visto
  const handleCloseWelcome = () => {
    console.log("Fechando welcome screen...");
    setShowWelcome(false);
    localStorage.setItem(LOCAL_STORAGE_WELCOME_KEY, 'true');
    console.log("Welcome screen marcado como visto:", localStorage.getItem(LOCAL_STORAGE_WELCOME_KEY));
  };

  // Função para resetar a tela de boas-vindas (útil para desenvolvimento/teste)
  const resetWelcomeScreen = () => {
    console.log("Resetando welcome screen...");
    localStorage.removeItem(LOCAL_STORAGE_WELCOME_KEY);
    setShowWelcomeModal(true); // Usar modal para reset
    console.log("Welcome screen resetado:", localStorage.getItem(LOCAL_STORAGE_WELCOME_KEY));
  };

  // If screen is locked, show lock screen
  if (screenLock.isLocked && screenLock.settings?.userProfile) {
    console.log('🔒 Rendering LockScreen component!');
    return (
      <LockScreen
        userProfile={screenLock.settings.userProfile}
        onUnlock={handleUnlock}
        isUnlocking={screenLock.isLoading}
      />
    );
  }

  // Log screen lock state
  console.log('🔒 Current screen lock state:', {
    isLocked: screenLock.isLocked,
    hasSettings: !!screenLock.settings,
    enabled: screenLock.settings?.enabled,
    hasUserProfile: !!screenLock.settings?.userProfile
  });

  try {
    // Se é primeira vez (showWelcome = true), mostrar tela completa
    if (showWelcome) {
      return (
        <ThemeProvider>
          <div className="dashboard-container min-h-screen h-screen bg-background relative overflow-hidden w-full flex flex-col max-w-full">
            {/* Enhanced Background */}
            <div className="fixed inset-0 opacity-5 pointer-events-none select-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse animation-delay-1s"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-accent/10 rounded-full blur-2xl animate-pulse animation-delay-2s"></div>
            </div>
            
            {/* Welcome Screen completa */}
            <WelcomeScreen 
              onStartChat={handleCloseWelcome}
              onOpenSettings={() => setShowSettings(true)}
              isModal={false}
            />
          </div>
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider>
        <div className="dashboard-container min-h-screen h-screen bg-background relative overflow-hidden w-full flex flex-col max-w-full">
          {/* Welcome Modal (apenas para reset) */}
          <WelcomeScreenModal
            open={showWelcomeModal}
            onOpenChange={(open) => {
              if (!open) {
                setShowWelcomeModal(false);
              }
            }}
            onStartChat={() => setShowWelcomeModal(false)}
          />

          {/* Enhanced Background */}
          <div className="fixed inset-0 opacity-5 pointer-events-none select-none">
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-pulse animation-delay-1s"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-accent/10 rounded-full blur-2xl animate-pulse animation-delay-2s"></div>
          </div>

          {/* Sidebar Layout */}
          <SidebarLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onShowBotStatus={() => setShowBotStatus(true)}
            onShowSettings={() => setShowSettings(true)}
            onShowAbout={() => setShowAbout(true)}
            onShowReportIssue={() => setShowReportIssue(true)}
            onShowEmailConfig={() => setShowEmailConfig(true)}
            onShowAdvancedEmail={() => setShowAdvancedEmail(true)}
            onShowAdvancedSettings={() => setShowAdvancedSettings(true)}
            onShowDev={() => setShowDev(true)}
            onResetWelcome={resetWelcomeScreen}
            emailConfigured={emailService.isConfigured()}
          >
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden p-4">
              {/* Lista de conversas e área principal */}
              {activeTab === 'chats' && (
                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 h-full`}>
                  {/* Lista de conversas - Responsiva */}
                  <div className={`${isMobile ? 'w-full h-2/5' : 'w-80 flex-shrink-0'} sidebar-compact`}>
                    <ChatList 
                      onChatSelect={setSelectedChat}
                      selectedChatId={selectedChat?.id}
                      onOpenSettings={() => setShowSettings(true)}
                    />
                  </div>

                  {/* Área de chat */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 chat-area-optimized overflow-hidden">
                      {selectedChat ? (
                        <ChatInterface selectedChat={selectedChat} />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground bg-card rounded-lg border">
                          <div className="text-center space-y-3">
                            <div className="text-6xl opacity-30">💬</div>
                            <div className="space-y-1">
                              <p className="text-lg font-medium">Selecione uma conversa</p>
                              <p className="text-sm opacity-70">Escolha uma conversa para começar a interagir</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Outras abas ocupam toda a área */}
              {activeTab === 'tickets' && (
                <div className="h-full smooth-transition bounce-in overflow-hidden">
                  <TicketManager />
                </div>
              )}
              
              {activeTab === 'queue' && (
                <div className="h-full smooth-transition bounce-in overflow-hidden">
                  <MessageQueue />
                </div>
              )}
              
              {activeTab === 'integrations' && (
                <div className="h-full smooth-transition bounce-in overflow-hidden">
                  <IntegrationPage />
                </div>
              )}
              
              {activeTab === 'workflows' && (
                <div className="h-full smooth-transition bounce-in overflow-hidden">
                  <WorkflowBuilderPage />
                </div>
              )}
              
              {activeTab === 'n8n' && (
                <div className="h-full smooth-transition bounce-in overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6 h-full overflow-y-auto">
                    {/* N8N Status Card */}
                    <div className="lg:col-span-2 xl:col-span-3">
                      <N8nStatusCard 
                        systemStatus={n8nConnection.systemStatus}
                        loading={n8nConnection.connecting}
                        onRefresh={() => n8nConnection.refreshStatus()}
                      />
                    </div>
                    
                    {/* Support Queue Panel */}
                    <div className="lg:col-span-1 xl:col-span-2">
                      <SupportQueuePanel 
                        queue={supportQueue.queue}
                        loading={supportQueue.loading}
                        onStartChat={supportQueue.startChat}
                        onTransferChat={supportQueue.transferChat}
                        onEndChat={supportQueue.endChat}
                      />
                    </div>
                    
                    {/* Real Time Logs */}
                    <div className="lg:col-span-1 xl:col-span-1">
                      <RealTimeLogs 
                        logs={n8nConnection.recentLogs}
                        autoScroll={true}
                        onClear={() => {}}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'tests' && (
                <div className="h-full smooth-transition bounce-in overflow-hidden">
                  <N8nIntegrationTestPage />
                </div>
              )}
            </div>
          </SidebarLayout>

          {/* Modal do BotStatus */}
          <BotStatusModal 
            open={showBotStatus} 
            onOpenChange={setShowBotStatus}
            onOpenQRModal={(bot) => {
              setSelectedBot(bot);
              setShowQRModal(true);
            }}
            onOpenLogsModal={(bot) => {
              setSelectedBot(bot);
              setShowLogsModal(true);
            }}
          />

          {/* Dev Modal */}
          <DevModal open={showDev} onOpenChange={setShowDev} />
          {/* Settings Modal */}
          <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
          {/* About Bot Modal */}
          <AboutBotModal
            open={showAbout}
            onOpenChange={setShowAbout}
            botName={"Zap Bot"}
            botDescription={"Bot inteligente para atendimento automatizado no WhatsApp. Plataforma com IA, integrações e automação."}
            botStatus={"online"}
            botVersion={"1.0.0"}
            integrations={["WhatsApp", "Telegram", "CRM", "API"]}
          />
          {/* Report Issue Modal */}
          <ReportIssueModal 
            isOpen={showReportIssue} 
            onClose={() => setShowReportIssue(false)}
            onSubmit={(issue) => {
              console.log('Issue reported:', issue);
              // Handle the issue submission here
              setShowReportIssue(false);
            }}
          />
          {/* Email Config Modal */}
          <EmailConfigModal
            open={showEmailConfig}
            onOpenChange={setShowEmailConfig}
          />
          
          {/* Advanced Email Modal */}
          <AdvancedEmailModal
            open={showAdvancedEmail}
            onOpenChange={setShowAdvancedEmail}
          />
          
          {/* Advanced Settings Modal */}
          <AdvancedSettingsModal
            open={showAdvancedSettings}
            onOpenChange={setShowAdvancedSettings}
          />
          
          {/* Modais dos Bots - FORA dos modais principais */}
          {selectedBot && (
            <>
              <BotLogsModal
                isOpen={showLogsModal}
                onClose={() => {
                  setShowLogsModal(false);
                  setSelectedBot(null);
                }}
                botName={selectedBot.name}
                botId={selectedBot.id}
              />
              
              <QRCodeModal
                isOpen={showQRModal}
                onClose={() => {
                  setShowQRModal(false);
                  setSelectedBot(null);
                }}
                botName={selectedBot.name}
              />
            </>
          )}
        </div>
      </ThemeProvider>
    );
  } catch (error) {
    console.error("Erro ao renderizar WhatsAppDashboard:", error);
    return (
      <div className="dashboard-error-message">
        Erro ao carregar o dashboard. Veja o console para detalhes.
      </div>
    );
  }
};

export default WhatsAppDashboard;
