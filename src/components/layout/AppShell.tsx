import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh' }}>
      <Sidebar />
      <main
        className="lg:pl-[var(--nav-w)]"
        style={{ paddingBottom: 'var(--bottom-nav-h)' }}
      >
        <div className="max-w-4xl px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
