import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'
import { StrategyProvider } from '@/lib/store'

export const metadata: Metadata = {
  title: 'El Universo de Victoria · Content Brain',
  description: 'Sistema de creación y planificación de contenido para @eluniversodevictoria',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <StrategyProvider>
          <AppShell>{children}</AppShell>
        </StrategyProvider>
      </body>
    </html>
  )
}
