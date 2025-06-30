import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Separator } from '@/components/ui/separator';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbList, 
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: 'chats' | 'tickets' | 'queue' | 'integrations' | 'workflows' | 'n8n' | 'tests') => void;
  onShowBotStatus: () => void;
  onShowSettings: () => void;
  onShowAbout: () => void;
  onShowReportIssue: () => void;
  onShowEmailConfig: () => void;
  onShowAdvancedEmail: () => void;
  onShowAdvancedSettings: () => void;
  onShowDev: () => void;
  onResetWelcome: () => void;
  emailConfigured: boolean;
}

const tabLabels = {
  chats: 'Conversas',
  tickets: 'Tickets de Suporte',
  queue: 'Fila de Mensagens',
  integrations: "Integrações em DESENVOLVIMENTO",
  workflows: 'Workflows',
  n8n: 'N8N Dashboard',
  tests: 'Testes de Integração'
};

const tabIcons = {
  chats: '💬',
  tickets: '🎫',
  queue: '⏰',
  integrations: '🔗',
  workflows: '⚡',
  n8n: '🤖',
  tests: '🧪'
};

export function SidebarLayout({
  children,
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
}: SidebarLayoutProps) {  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onShowBotStatus={onShowBotStatus}
        onShowSettings={onShowSettings}
        onShowAbout={onShowAbout}
        onShowReportIssue={onShowReportIssue}
        onShowEmailConfig={onShowEmailConfig}
        onShowAdvancedEmail={onShowAdvancedEmail}
        onShowAdvancedSettings={onShowAdvancedSettings}
        onShowDev={onShowDev}
        onResetWelcome={onResetWelcome}
        emailConfigured={emailConfigured}
      />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur px-3 supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1 h-7 w-7" />
          <div className="h-4 w-px bg-sidebar-border mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#" className="flex items-center gap-2 text-xs font-medium hover:text-foreground transition-colors">
                  <Home className="h-3.5 w-3.5" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2">
                  <span className="text-sm">{tabIcons[activeTab as keyof typeof tabIcons]}</span>
                  <span className="font-medium text-sm">
                    {tabLabels[activeTab as keyof typeof tabLabels] || 'Dashboard'}
                  </span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
