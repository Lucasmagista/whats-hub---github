import React from 'react';
import {
  Bot,
  MessageSquare,
  Ticket,
  Clock,
  Zap,
  Network,
  Settings,
  Mail,
  Bug,
  Sparkles,
  Plus,
  Home,
  ChevronUp,
  User2,
  MoreHorizontal,
  LogOut,
  UserCircle,
  Gauge,
  Activity,
  BarChart3,
  Bell,
  HelpCircle,  Star,
  Command,
  TestTube
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarSeparator,
  SidebarMenuAction
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from './dashboard/ThemeContext';

interface AppSidebarProps {
  readonly activeTab: string;
  readonly onTabChange: (tab: 'chats' | 'tickets' | 'queue' | 'integrations' | 'workflows' | 'n8n' | 'tests') => void;
  readonly onShowBotStatus: () => void;
  readonly onShowSettings: () => void;
  readonly onShowAbout: () => void;
  readonly onShowReportIssue: () => void;
  readonly onShowEmailConfig: () => void;
  readonly onShowAdvancedEmail: () => void;
  readonly onShowAdvancedSettings: () => void;
  readonly onShowDev: () => void;
  readonly onResetWelcome: () => void;
  readonly emailConfigured: boolean;
}

// Menu items principais
const mainMenuItems = [
  {
    title: 'Conversas',
    key: 'chats',
    icon: MessageSquare,
    description: 'Gerencie suas conversas ativas',
    count: 0,
    isActive: true
  },
  {
    title: 'Tickets',
    key: 'tickets',
    icon: Ticket,
    description: 'Acompanhe solicitações em aberto',
    count: 0,
    isActive: false
  },
  {
    title: 'Fila',
    key: 'queue',
    icon: Clock,
    description: 'Mensagens aguardando resposta',
    count: 0,
    isActive: false
  },
  {
    title: 'Integrações',
    key: 'integrations',
    icon: Network,
    description: 'Configure integrações e automações',
    count: 0,
    isActive: false
  },  {
    title: 'Workflows',
    key: 'workflows',
    icon: Zap,
    description: 'Construa e gerencie fluxos de trabalho',
    count: 0,
    isActive: false
  },  {
    title: 'N8N Dashboard',
    key: 'n8n',
    icon: Bot,
    description: 'Monitor integração N8N + WhatsApp',
    count: 0,
    isActive: false
  },
  {
    title: 'Testes de Integração',
    key: 'tests',
    icon: TestTube,
    description: 'Testar conectividade e funcionalidades',
    count: 0,
    isActive: false
  }
];

// Menu items de monitoramento
const monitoringItems = [
  {
    title: 'Dashboard',
    key: 'dashboard',
    icon: BarChart3,
    description: 'Visão geral das métricas',
    count: 0
  },
  {
    title: 'Atividade',
    key: 'activity',
    icon: Activity,
    description: 'Monitoramento em tempo real',
    count: 0
  },
  {
    title: 'Relatórios',
    key: 'reports',
    icon: Star,
    description: 'Relatórios detalhados',
    count: 0
  }
];

export function AppSidebar({
  activeTab,
  onTabChange,
  onShowBotStatus,
  onShowSettings,
  onShowAbout,
  onShowReportIssue,
  onShowEmailConfig,
  onShowAdvancedEmail,
  onShowAdvancedSettings,
  onShowDev,
  onResetWelcome,
  emailConfigured
}: AppSidebarProps) {
  const { theme } = useTheme();  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground sidebar-logo-container">
                {theme.customLogo ? (
                  <img src={theme.customLogo} alt="Logo" className="size-5" />
                ) : (
                  <Bot className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-xs">
                  {theme.brandName || 'WhatsApp Hub Pro'}
                </span>
                <span className="truncate text-[10px] text-sidebar-foreground/70">
                  Sistema completo de atendimento
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>      <SidebarContent>
        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item, index) => (
                <SidebarMenuItem key={item.key}>                  <SidebarMenuButton 
                    onClick={() => onTabChange(item.key as 'chats' | 'tickets' | 'queue' | 'integrations' | 'workflows')}
                    isActive={activeTab === item.key}
                    tooltip={item.description}
                    className="group relative h-8"
                    size="sm"
                  >
                    <item.icon className="size-3.5" />
                    <span className="text-xs">{item.title}</span>
                    {item.count > 0 && (
                      <SidebarMenuBadge className="bg-primary text-primary-foreground text-[9px]">
                        {item.count}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Monitoramento */}
        <SidebarGroup>
          <SidebarGroupLabel>Monitoramento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {monitoringItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton tooltip={item.description} className="h-8" size="sm">
                    <item.icon className="size-3.5" />
                    <span className="text-xs">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />        {/* Gestão de Bots */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestão de Bots</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onShowBotStatus} 
                  tooltip="Gerenciar Bots"
                  className="h-8"
                  size="sm"
                >
                  <div className="flex items-center relative">
                    <Bot className="size-3.5" />
                    <div className="absolute -top-0.5 -right-0.5 size-1.5 bg-primary rounded-full animate-pulse">
                      <div className="size-0.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-xs">Status dos Bots</span>
                  <SidebarMenuBadge className="bg-green-500 text-white text-[9px]">
                    Online
                  </SidebarMenuBadge>
                </SidebarMenuButton>
                <SidebarMenuAction asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div 
                        className="flex h-5 w-5 items-center justify-center rounded-md outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
                        title="Opções do Bot"
                        aria-label="Opções do Bot"
                      >
                        <MoreHorizontal className="size-2.5" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem onClick={onShowBotStatus}>
                        <Gauge className="size-3.5 mr-2" />
                        <span className="text-xs">Ver Status</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Plus className="size-3.5 mr-2" />
                        <span className="text-xs">Adicionar Bot</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Activity className="size-3.5 mr-2" />
                        <span className="text-xs">Logs do Sistema</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />        {/* Comunicação */}
        <SidebarGroup>
          <SidebarGroupLabel>Comunicação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onShowEmailConfig}
                  tooltip={emailConfigured ? "Email Configurado - Ver estatísticas" : "Configurar Email"}
                  className={`${emailConfigured ? "text-green-400" : "text-yellow-400"} h-8`}
                  size="sm"
                >
                  <Mail className="size-3.5" />
                  <span className="text-xs">Email</span>
                  {emailConfigured && (
                    <div className="size-1.5 bg-green-400 rounded-full animate-pulse" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {emailConfigured && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={onShowAdvancedEmail}
                    tooltip="Funcionalidades Avançadas de Email"
                    className="text-primary h-8"
                    size="sm"
                  >
                    <Zap className="size-3.5" />
                    <span className="text-xs">Email Avançado</span>
                    <Sparkles className="size-2.5" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Central de Notificações" className="h-8" size="sm">
                  <Bell className="size-3.5" />
                  <span className="text-xs">Notificações</span>
                  <SidebarMenuBadge className="bg-red-500 text-white text-[9px]">
                    3
                  </SidebarMenuBadge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />        {/* Suporte e Ferramentas */}
        <SidebarGroup>
          <SidebarGroupLabel>Suporte & Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onShowAbout} tooltip="Sobre o Sistema" className="h-8" size="sm">
                  <HelpCircle className="size-3.5" />
                  <span className="text-xs">Sobre</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onShowReportIssue} 
                  tooltip="Relatar Problema ou Sugerir Melhoria"
                  className="text-red-400 h-8"
                  size="sm"
                >
                  <Bug className="size-3.5" />
                  <span className="text-xs">Relatar Problema</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onShowDev} tooltip="Ferramentas de Desenvolvimento" className="h-8" size="sm">
                  <Command className="size-3.5" />
                  <span className="text-xs">DEV </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onResetWelcome} 
                  tooltip="Resetar Tela de Boas-vindas"
                  className="text-yellow-400 h-8"
                  size="sm"
                >
                  <Star className="size-3.5" />
                  <span className="text-xs">Reset Welcome</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground cursor-pointer h-12">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <UserCircle className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Usuário Admin</span>
                    <span className="truncate text-xs text-sidebar-foreground/70">admin@empresa.com</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >                <DropdownMenuItem onClick={onShowSettings}>
                  <Settings className="size-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShowAdvancedSettings}>
                  <Zap className="size-4 mr-2" />
                  Configurações Avançadas
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserCircle className="size-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                  <LogOut className="size-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
