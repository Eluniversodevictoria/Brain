'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Sparkles, Lightbulb, Calendar,
  BookOpen, History, Database, Settings,
  Zap, Shuffle, Rocket, Sun, Globe
} from 'lucide-react'
import clsx from 'clsx'

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Crear',
    items: [
      { href: '/crear', icon: Sparkles, label: 'Generador' },
      { href: '/dame-una-idea', icon: Zap, label: 'Dame una idea' },
      { href: '/inspirar', icon: Globe, label: 'Crear desde link' },
      { href: '/transformar', icon: Shuffle, label: 'Transformar' },
    ],
  },
  {
    label: 'Planificar',
    items: [
      { href: '/plan-hoy', icon: Sun, label: 'Plan de hoy' },
      { href: '/banco', icon: Lightbulb, label: 'Banco de ideas' },
      { href: '/calendario', icon: Calendar, label: 'Calendario' },
      { href: '/plan-lanzamiento', icon: Rocket, label: 'Plan 30 días' },
    ],
  },
  {
    label: 'Revisar',
    items: [
      { href: '/historial', icon: History, label: 'Historial' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/base', icon: Database, label: 'Base estratégica' },
      { href: '/estrategia', icon: Settings, label: 'Estrategia' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-20"
      style={{
        width: 'var(--nav-w)',
        background: 'linear-gradient(180deg, rgba(254,249,245,0.96) 0%, rgba(251,240,232,0.96) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--glass-border)',
        boxShadow: '2px 0 20px rgba(192,120,96,.06)',
      }}
    >
      {/* Brand */}
      <div
        className="px-5 py-6"
        style={{ borderBottom: '1px solid var(--dust)' }}
      >
        {/* Doodle floral pequeño */}
        <div className="flex items-start gap-2">
          <div style={{ flex: 1 }}>
            <div
              className="text-base font-normal leading-snug"
              style={{
                fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
                color: 'var(--ink)',
                letterSpacing: '0.01em',
              }}
            >
              El Universo
              <br />de Victoria
            </div>
            <div
              className="text-xs mt-1.5 flex items-center gap-1"
              style={{ color: 'var(--gold)', letterSpacing: '0.06em' }}
            >
              <span>@eluniversodevictoria</span>
            </div>
          </div>
          {/* Doodle floral */}
          <div style={{ color: 'var(--rose)', opacity: 0.55, marginTop: 2, flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="2.5" fill="currentColor" opacity="0.8"/>
              <ellipse cx="9" cy="4" rx="2" ry="2.8" fill="currentColor" opacity="0.45"/>
              <ellipse cx="9" cy="14" rx="2" ry="2.8" fill="currentColor" opacity="0.45"/>
              <ellipse cx="4" cy="9" rx="2.8" ry="2" fill="currentColor" opacity="0.45"/>
              <ellipse cx="14" cy="9" rx="2.8" ry="2" fill="currentColor" opacity="0.45"/>
              <ellipse cx="5.5" cy="5.5" rx="1.6" ry="2.2" fill="currentColor" opacity="0.28" transform="rotate(-45 5.5 5.5)"/>
              <ellipse cx="12.5" cy="5.5" rx="1.6" ry="2.2" fill="currentColor" opacity="0.28" transform="rotate(45 12.5 5.5)"/>
              <ellipse cx="5.5" cy="12.5" rx="1.6" ry="2.2" fill="currentColor" opacity="0.28" transform="rotate(45 5.5 12.5)"/>
              <ellipse cx="12.5" cy="12.5" rx="1.6" ry="2.2" fill="currentColor" opacity="0.28" transform="rotate(-45 12.5 12.5)"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-5' : ''}>
            {section.label && (
              <div
                className="text-xs mb-2 px-2 flex items-center gap-1.5"
                style={{
                  color: 'var(--smoke-2)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontSize: '0.58rem',
                  fontWeight: 600,
                }}
              >
                {section.label}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-150',
                      active ? 'font-semibold' : 'hover:opacity-80 hover:translate-x-0.5'
                    )}
                    style={{
                      color: active ? 'var(--gold)' : 'var(--smoke)',
                      background: active
                        ? 'linear-gradient(90deg, var(--gold-light) 0%, rgba(192,120,96,.05) 100%)'
                        : 'transparent',
                      borderRadius: '999px',
                      boxShadow: active ? 'inset 0 0 0 1px var(--gold-border)' : 'none',
                    }}
                  >
                    <item.icon size={14} strokeWidth={active ? 2.2 : 1.5} />
                    <span>{item.label}</span>
                    {active && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: 'var(--gold)', opacity: 0.7 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--dust)' }}>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--smoke-2)' }}>
          <span style={{ color: 'var(--blush)', fontSize: '0.7rem' }}>✦</span>
          <span>Demo mode</span>
        </div>
      </div>
    </aside>
  )
}
