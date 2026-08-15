'use client'

import clsx from 'clsx'
import React from 'react'

// ── BADGE ────────────────────────────────────────────────────────
interface BadgeProps {
  variant?: 'default' | 'gold' | 'sage' | 'blush' | 'smoke' | 'celestial' | 'success' | 'rose'
  children: React.ReactNode
  className?: string
}
export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const styles: Record<string, React.CSSProperties> = {
    default:   { background: 'var(--surface-2)', color: 'var(--smoke)', border: '1px solid var(--dust)' },
    gold:      { background: 'var(--gold-light)', color: 'var(--gold)', border: '1px solid var(--gold-border)' },
    rose:      { background: 'var(--rose-light)', color: 'var(--rose)', border: '1px solid var(--rose-border)' },
    sage:      { background: 'var(--sage-light)', color: 'var(--sage)', border: '1px solid rgba(122,158,140,.28)' },
    blush:     { background: 'var(--blush-light)', color: 'var(--blush)', border: '1px solid rgba(216,154,132,.28)' },
    smoke:     { background: 'var(--surface-2)', color: 'var(--smoke)', border: '1px solid var(--dust)' },
    celestial: { background: 'var(--celestial-light)', color: 'var(--celestial)', border: '1px solid rgba(154,175,200,.28)' },
    success:   { background: 'var(--success-light)', color: 'var(--success)', border: '1px solid rgba(106,158,124,.28)' },
  }
  return (
    <span
      className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}
      style={{ letterSpacing: '0.04em', ...styles[variant] }}
    >
      {children}
    </span>
  )
}

// ── VOC BADGE ────────────────────────────────────────────────────
const VOC_STYLES: Record<string, { label: string; bg: string; color: string; border: string }> = {
  voc_real:      { label: 'VOC REAL',       bg: 'var(--sage-light)', color: 'var(--sage)', border: 'rgba(122,158,140,.35)' },
  dato_observado:{ label: 'DATO OBSERVADO', bg: 'var(--celestial-light)', color: 'var(--celestial)', border: 'rgba(154,175,200,.35)' },
  insight:       { label: 'INSIGHT',        bg: 'var(--gold-light)', color: 'var(--gold)', border: 'var(--gold-border)' },
  hipotesis:     { label: 'HIPÓTESIS',      bg: 'var(--rose-light)', color: 'var(--rose)', border: 'var(--rose-border)' },
}
export function VocBadge({ type }: { type: string }) {
  const s = VOC_STYLES[type] ?? VOC_STYLES.hipotesis
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, letterSpacing: '0.06em', fontSize: '0.6rem' }}
    >
      {s.label}
    </span>
  )
}

// ── CONFIDENCE BADGE ─────────────────────────────────────────────
const CONF_STYLES: Record<string, { label: string; color: string }> = {
  verified:   { label: 'verificado', color: 'var(--sage)' },
  supported:  { label: 'respaldado', color: 'var(--celestial)' },
  emerging:   { label: 'emergente',  color: 'var(--gold)' },
  hypothesis: { label: 'hipótesis',  color: 'var(--smoke)' },
}
export function ConfidenceBadge({ level }: { level: string }) {
  const s = CONF_STYLES[level] ?? CONF_STYLES.hypothesis
  return (
    <span className="inline-flex items-center gap-1 text-xs" style={{ color: s.color }}>
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

// ── BUTTON ───────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}
export function Button({
  variant = 'primary', size = 'md', loading, children, className, disabled, style, ...props
}: ButtonProps) {
  const base: React.CSSProperties =
    variant === 'primary' ? {
      background: 'linear-gradient(135deg, var(--gold) 0%, #B86858 100%)',
      color: '#FEF9F5',
      boxShadow: '0 2px 12px rgba(192,120,96,.28), 0 1px 3px rgba(80,30,20,.08)',
    }
    : variant === 'secondary' ? {
      background: 'var(--petal)',
      color: 'var(--ink)',
      border: '1px solid var(--dust)',
    }
    : variant === 'outline' ? {
      background: 'transparent',
      color: 'var(--gold)',
      border: '1px solid var(--gold-border)',
    }
    : variant === 'danger' ? {
      background: 'var(--rose-light)',
      color: 'var(--rose)',
      border: '1px solid var(--rose-border)',
    }
    : { background: 'transparent', color: 'var(--smoke)' }

  const sz = size === 'sm' ? 'px-3.5 py-1.5 text-xs'
    : size === 'lg' ? 'px-7 py-3.5 text-base'
    : 'px-5 py-2.5 text-sm'

  return (
    <button
      className={clsx(
        sz,
        'rounded-full font-medium transition-all duration-150',
        'inline-flex items-center gap-2 cursor-pointer whitespace-nowrap',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'hover:opacity-90 hover:-translate-y-px active:scale-[0.97]',
        className
      )}
      style={{ ...base, ...style }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full flex-shrink-0" style={{ animation: 'spin 0.8s linear infinite' }} />
      )}
      {children}
    </button>
  )
}

// ── CARD ─────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  hover?: boolean
  /** Usar glass translúcido. Default: true */
  glass?: boolean
}
export function Card({ children, className, style, onClick, hover, glass = true }: CardProps) {
  const isInteractive = onClick || hover
  return (
    <div
      className={clsx(
        'transition-all duration-200',
        isInteractive && 'cursor-pointer',
        className
      )}
      style={{
        background:    glass ? 'var(--glass)' : 'var(--surface)',
        border:        `1px solid ${glass ? 'var(--glass-border)' : 'var(--dust)'}`,
        borderRadius:  'var(--radius-md)',
        boxShadow:     glass ? 'var(--glass-shadow)' : 'var(--shadow-sm)',
        backdropFilter: glass ? 'blur(10px)' : undefined,
        WebkitBackdropFilter: glass ? 'blur(10px)' : undefined,
        ...(isInteractive ? { cursor: 'pointer' } : {}),
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={e => {
        if (isInteractive) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(192,120,96,.14), 0 2px 6px rgba(80,30,20,.06)'
        }
      }}
      onMouseLeave={e => {
        if (isInteractive) {
          (e.currentTarget as HTMLElement).style.transform = ''
          ;(e.currentTarget as HTMLElement).style.boxShadow = glass ? 'var(--glass-shadow)' : 'var(--shadow-sm)'
        }
      }}
    >
      {children}
    </div>
  )
}

// ── SECTION HEADER ───────────────────────────────────────────────
interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  eyebrow?: string
}
export function SectionHeader({ title, subtitle, action, eyebrow }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7">
      <div>
        {eyebrow && <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow>}
        <h1
          className="text-2xl font-normal leading-tight"
          style={{ fontFamily: "'Palatino Linotype', Palatino, Georgia, serif", color: 'var(--ink)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1.5" style={{ color: 'var(--smoke)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0 mt-1">{action}</div>}
    </div>
  )
}

// ── EMPTY STATE ──────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1.5px dashed var(--dust-2)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      {icon && <div className="mb-4" style={{ color: 'var(--blush)', opacity: 0.7 }}>{icon}</div>}
      <p className="text-sm font-medium mb-1.5" style={{ color: 'var(--ink)', fontFamily: "'Palatino Linotype', Palatino, Georgia, serif" }}>{title}</p>
      {description && <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--smoke)' }}>{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// ── EYEBROW ──────────────────────────────────────────────────────
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx('text-xs font-semibold', className)}
      style={{ color: 'var(--gold)', letterSpacing: '0.10em', textTransform: 'uppercase' }}
    >
      {children}
    </div>
  )
}

// ── DIVIDER ──────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return (
    <div
      className={clsx('w-full h-px', className)}
      style={{ background: 'linear-gradient(90deg, transparent, var(--dust-2) 20%, var(--dust-2) 80%, transparent)' }}
    />
  )
}

// ── STATUS DOT ───────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  idea:         'var(--smoke)',
  in_development:'var(--gold)',
  script_ready: 'var(--sage)',
  produced:     'var(--sage)',
  scheduled:    'var(--celestial)',
  published:    'var(--sage)',
  discarded:    'var(--dust-2)',
}
export function StatusDot({ status }: { status: string }) {
  return (
    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[status] ?? 'var(--smoke)' }} />
  )
}

// ── INPUT ────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        'w-full border px-3.5 py-2.5 text-sm transition-all duration-150 focus:outline-none',
        'focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_var(--gold-light)]',
        className
      )}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--dust)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--ink)',
      }}
      {...props}
    />
  )
}

// ── TEXTAREA ─────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={clsx(
        'w-full border px-3.5 py-2.5 text-sm resize-none transition-all duration-150 focus:outline-none',
        'focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_var(--gold-light)]',
        className
      )}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--dust)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--ink)',
      }}
      {...props}
    />
  )
}

// ── SELECT ───────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}
export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={clsx(
        'w-full border px-3.5 py-2.5 text-sm transition-all duration-150 cursor-pointer focus:outline-none',
        'focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_var(--gold-light)]',
        className
      )}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--dust)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--ink)',
      }}
      {...props}
    />
  )
}

// ── PROGRESS BAR ─────────────────────────────────────────────────
export function ProgressBar({ value, color, className }: { value: number; color?: string; className?: string }) {
  const fill = color ?? 'linear-gradient(90deg, var(--gold) 0%, var(--rose) 100%)'
  const isGradient = !color || color.includes('gradient') || !color.startsWith('var(')
  return (
    <div className={clsx('w-full h-1.5 rounded-full overflow-hidden', className)} style={{ background: 'var(--dust)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: isGradient ? fill : color,
        }}
      />
    </div>
  )
}

// ── TABS ─────────────────────────────────────────────────────────
interface Tab { id: string; label: string; count?: number }
interface TabsProps { tabs: Tab[]; active: string; onChange: (id: string) => void }
export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div
      className="flex gap-1 p-1 rounded-full"
      style={{ background: 'var(--petal)', border: '1px solid var(--dust)' }}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx('flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-all duration-150 cursor-pointer')}
          style={{
            background: active === tab.id ? 'var(--glass)' : 'transparent',
            color: active === tab.id ? 'var(--gold)' : 'var(--smoke)',
            fontWeight: active === tab.id ? 600 : 400,
            boxShadow: active === tab.id ? 'var(--shadow-sm)' : 'none',
            backdropFilter: active === tab.id ? 'blur(8px)' : undefined,
          }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background: active === tab.id ? 'var(--gold-light)' : 'transparent',
                color: active === tab.id ? 'var(--gold)' : 'var(--smoke)',
                fontSize: '0.65rem',
              }}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ── MODAL ────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: string
}
export function Modal({ open, onClose, title, children, maxWidth = '520px' }: ModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(58,37,32,0.38)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full animate-fade-in"
        style={{
          maxWidth,
          background: 'var(--glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 60px rgba(58,37,32,.18)',
        }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--dust)' }}>
            <h2
              className="text-base font-normal"
              style={{ fontFamily: "'Palatino Linotype', Palatino, Georgia, serif", color: 'var(--ink)' }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-sm hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: 'var(--smoke)', background: 'var(--surface-2)' }}
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── TOAST ────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', visible }: { message: string; type?: 'success' | 'error'; visible: boolean }) {
  if (!visible) return null
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-sm font-medium shadow-lg animate-fade-in"
      style={{
        background: type === 'success'
          ? 'linear-gradient(135deg, var(--gold) 0%, #B86858 100%)'
          : 'var(--rose)',
        color: '#FEF9F5',
        letterSpacing: '0.02em',
        boxShadow: '0 4px 20px rgba(192,120,96,.30)',
      }}
    >
      {message}
    </div>
  )
}
