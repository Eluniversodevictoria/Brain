'use client'

import Link from 'next/link'
import {
  Sparkles, Zap, Calendar, History, BookmarkCheck,
  Globe, Sun, RefreshCw, Rocket, TrendingUp,
} from 'lucide-react'
import { Eyebrow, ProgressBar } from '@/components/ui'
import { MOCK_CONTENT_PIECES } from '@/lib/mock/data'
import { useStrategy } from '@/lib/store'

// ── Helpers ────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function getLaunchProgress(startDate: string) {
  const start = new Date(startDate)
  const days = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.min(100, Math.max(0, Math.round((days / 30) * 100)))
}

// ── Action card data ───────────────────────────────────────────────

const ACTIONS = [
  {
    href: '/plan-hoy',
    icon: Sun,
    label: 'Plan de hoy',
    desc: '4 publicaciones listas en segundos',
    accent: 'var(--gold)',
    bg: 'var(--gold-light)',
    border: 'var(--gold-border)',
    featured: true,
  },
  {
    href: '/crear',
    icon: Sparkles,
    label: 'Crear contenido',
    desc: 'Generador guiado con scoring',
    accent: 'var(--rose)',
    bg: 'var(--rose-light)',
    border: 'var(--rose-border)',
    featured: false,
  },
  {
    href: '/inspirar',
    icon: Globe,
    label: 'Crear desde link',
    desc: 'Inspírate sin copiar literalmente',
    accent: '#7b2fa8',
    bg: '#f5eefb',
    border: '#d4a8f0',
    featured: false,
  },
  {
    href: '/dame-una-idea',
    icon: Zap,
    label: 'Dame una idea',
    desc: 'Idea puntuada por el scoring editorial',
    accent: '#1d4ed8',
    bg: '#eff6ff',
    border: '#93c5fd',
    featured: false,
  },
  {
    href: '/calendario',
    icon: Calendar,
    label: 'Calendario',
    desc: 'Organiza y programa tu semana',
    accent: '#0e7490',
    bg: '#ecfeff',
    border: '#a5f3fc',
    featured: false,
  },
  {
    href: '/historial',
    icon: History,
    label: 'Historial',
    desc: 'Todo el contenido que guardaste',
    accent: 'var(--smoke)',
    bg: 'var(--surface-2)',
    border: 'var(--dust)',
    featured: false,
  },
  {
    href: '/banco',
    icon: BookmarkCheck,
    label: 'Banco de ideas',
    desc: 'Tus favoritos listos para usar',
    accent: 'var(--gold)',
    bg: 'var(--gold-light)',
    border: 'var(--gold-border)',
    featured: false,
  },
  {
    href: '/historial',
    icon: RefreshCw,
    label: 'Crear variación',
    desc: 'Nueva versión de una idea guardada',
    accent: '#7b2fa8',
    bg: '#f5eefb',
    border: '#d4a8f0',
    featured: false,
  },
] as const

// ── Page ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { strategy } = useStrategy()

  const published = MOCK_CONTENT_PIECES.filter(p => p.status === 'published').length
  const inQueue   = MOCK_CONTENT_PIECES.filter(p => ['idea', 'in_development', 'script_ready'].includes(p.status)).length
  const launchProgress = getLaunchProgress(strategy.launch_start_date)

  const todayStr = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 0 80px' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--smoke)', marginBottom: 4, textTransform: 'capitalize' }}>
          {todayStr}
        </p>
        <h1 style={{
          fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
          fontSize: 'clamp(1.7rem, 4vw, 2.1rem)',
          fontWeight: 400, color: 'var(--ink)',
          margin: '0 0 6px', letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}>
          {getGreeting()}, Victoria.
        </h1>
        <p style={{
          fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
          fontSize: '1rem', color: 'var(--smoke)', margin: 0,
          fontStyle: 'italic',
        }}>
          ¿Qué quieres crear hoy?
        </p>
      </div>

      {/* ── Featured CTA — Plan de hoy ─────────────────────── */}
      <Link
        href="/plan-hoy"
        style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'linear-gradient(110deg, var(--gold-light) 0%, rgba(254,249,245,0.8) 100%)',
          border: '1px solid var(--gold-border)',
          borderRadius: 16, padding: '18px 22px',
          marginBottom: 20, textDecoration: 'none',
          boxShadow: '0 2px 12px rgba(192,120,96,0.10)',
          transition: 'transform 160ms, box-shadow 160ms',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(192,120,96,0.16)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = ''
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(192,120,96,0.10)'
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(192,120,96,0.35)',
        }}>
          <Sun size={22} color="white" strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: '0.1em',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: 3,
          }}>
            Empezar el día
          </div>
          <div style={{
            fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
            fontSize: '1.05rem', color: 'var(--ink)', fontWeight: 400,
          }}>
            Plan de hoy
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--smoke)', marginTop: 2 }}>
            3 imágenes + 1 reel · copys listos para publicar
          </div>
        </div>
        <div style={{
          fontSize: '0.72rem', fontWeight: 600, color: 'var(--gold)',
          background: 'white', border: '1px solid var(--gold-border)',
          borderRadius: 999, padding: '5px 12px', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          Generar →
        </div>
      </Link>

      {/* ── Action grid ───────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 12 }}><Eyebrow>Todas las herramientas</Eyebrow></div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
        }}>
          {ACTIONS.slice(1).map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href + action.label}
                href={action.href}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  background: 'var(--surface)', border: '1px solid var(--dust)',
                  borderRadius: 13, padding: '14px 16px',
                  textDecoration: 'none', transition: 'all 160ms',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'
                  el.style.borderColor = action.border as string
                  el.style.background = action.bg as string
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = ''
                  el.style.boxShadow = ''
                  el.style.borderColor = 'var(--dust)'
                  el.style.background = 'var(--surface)'
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: action.bg as string,
                  border: `1px solid ${action.border as string}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={action.accent as string} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)',
                    marginBottom: 2, lineHeight: 1.3,
                  }}>
                    {action.label}
                  </div>
                  <div style={{
                    fontSize: '0.72rem', color: 'var(--smoke)', lineHeight: 1.4,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {action.desc}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        marginBottom: 20,
      }}>
        {[
          { label: 'Publicadas', value: published, sub: 'este mes', color: 'var(--gold)' },
          { label: 'En cola', value: inQueue, sub: 'ideas y borradores', color: 'var(--smoke)' },
          { label: 'Plan 30d', value: `${launchProgress}%`, sub: 'completado', color: 'var(--rose)' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--dust)',
            borderRadius: 12, padding: '12px 14px', textAlign: 'center',
          }}>
            <div style={{
              fontSize: '1.4rem', fontWeight: 600, color: s.color,
              fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink)', marginTop: 3 }}>
              {s.label}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--smoke-2)', marginTop: 1 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Plan progress compact ─────────────────────────── */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--dust)',
        borderRadius: 13, padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Rocket size={15} color="var(--gold)" strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink)' }}>Plan 30 días</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700 }}>{launchProgress}%</span>
          </div>
          <ProgressBar value={launchProgress} />
        </div>
        <Link
          href="/plan-lanzamiento"
          style={{
            fontSize: '0.72rem', color: 'var(--smoke)', textDecoration: 'none',
            background: 'var(--surface-2)', border: '1px solid var(--dust)',
            borderRadius: 999, padding: '5px 10px', whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          Ver plan
        </Link>
      </div>
    </div>
  )
}
