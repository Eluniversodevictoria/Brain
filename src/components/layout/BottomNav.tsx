'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Sparkles, Calendar, History, Database } from 'lucide-react'
import clsx from 'clsx'

const BOTTOM_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/crear', icon: Sparkles, label: 'Crear' },
  { href: '/calendario', icon: Calendar, label: 'Calendario' },
  { href: '/historial', icon: History, label: 'Historial' },
  { href: '/base', icon: Database, label: 'Base' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-20"
      style={{
        height: 'var(--bottom-nav-h)',
        background: 'rgba(254,249,245,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--glass-border)',
        boxShadow: '0 -4px 20px rgba(192,120,96,.08)',
      }}
    >
      <div className="flex h-full">
        {BOTTOM_ITEMS.map((item) => {
          const active = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-all duration-150',
                active ? '' : 'hover:opacity-70'
              )}
              style={{ color: active ? 'var(--gold)' : 'var(--smoke-2)' }}
            >
              <div className="relative">
                <item.icon size={18} strokeWidth={active ? 2.2 : 1.5} />
                {active && (
                  <span
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--gold)' }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.04em',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
