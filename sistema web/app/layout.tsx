import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/providers/session-provider'
import { Toaster } from '@/components/ui/sonner'
import ErrorBoundary from '@/components/error-boundary'
import ClientWrapper from '@/components/client-wrapper'
import './globals.css'

export const metadata: Metadata = {
  title: 'WhatsApp Bot Dashboard',
  description: 'Dashboard para gerenciar seu bot do WhatsAsync',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-background font-sans antialiased">
        <ErrorBoundary>
          <ClientWrapper>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <main className="flex-1">
                  {children}
                </main>
              </div>
              <Toaster 
                position="top-right"
                closeButton
                richColors
                expand={false}
                duration={4000}
              />
            </AuthProvider>
          </ClientWrapper>
        </ErrorBoundary>
      </body>
    </html>
  )
}
