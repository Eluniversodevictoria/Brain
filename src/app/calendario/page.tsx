'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Wand2, Sparkles, Check, X } from 'lucide-react'
import { Button, Eyebrow, Modal } from '@/components/ui'
import { THEME_LABELS } from '@/types'
import type { CalendarEntry, ContentStatus } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { generateWeekEntries, parseMeta } from '@/lib/calendar/generate'
import { STORY_TYPE_LABELS } from '@/lib/calendar/template'
import type { CalendarSlotMeta } from '@/lib/calendar/generate'

// ── Constants ──────────────────────────────────────────────────────

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAYS_LONG  = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

const STATUS_LABELS: Record<ContentStatus, string> = {
  idea:         'Idea',
  in_development: 'En creación',
  script_ready: 'Listo',
  produced:     'Producido',
  scheduled:    'Programado',
  published:    'Publicado',
  discarded:    'Descartado',
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  idea:           { bg: 'var(--surface-2)', text: 'var(--smoke)',    border: 'var(--dust)' },
  in_development: { bg: '#fff8e6',          text: '#b45309',         border: '#f0c040' },
  script_ready:   { bg: 'var(--gold-light)', text: 'var(--gold)',   border: 'var(--gold-border)' },
  produced:       { bg: '#f5eefb',           text: '#7b2fa8',        border: '#d4a8f0' },
  scheduled:      { bg: '#e8f4ff',           text: '#1d4ed8',        border: '#93c5fd' },
  published:      { bg: '#f0fdf4',           text: '#16a34a',        border: '#86efac' },
  discarded:      { bg: 'var(--surface)',    text: 'var(--smoke-2)', border: 'var(--dust)' },
}

const STATUS_NEXT: Partial<Record<ContentStatus, ContentStatus>> = {
  idea: 'in_development',
  in_development: 'script_ready',
  script_ready: 'produced',
  produced: 'scheduled',
  scheduled: 'published',
}

const FORMAT_ICONS: Record<string, string> = {
  reel: '🎬', imagen: '🖼️', carrusel: '📋', story: '⭕',
}

const FORMAT_COLORS: Record<string, string> = {
  reel:    '#7b2fa8',
  imagen:  '#c47b8a',
  carrusel:'#c49a5a',
  story:   '#1d4ed8',
}

// ── Helpers ────────────────────────────────────────────────────────

function dateKey(d: Date) { return d.toISOString().split('T')[0] }

function getWeekDates(ref: Date): Date[] {
  const start = new Date(ref)
  // Week starts Sunday
  start.setDate(start.getDate() - start.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setDate(d.getDate() + i); return d
  })
}

// ── Status Badge ───────────────────────────────────────────────────

function StatusBadge({ status, onClick }: { status: ContentStatus; onClick?: () => void }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.idea
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center',
        background: c.bg, color: c.text,
        border: `1px solid ${c.border}`,
        borderRadius: 999, padding: '2px 8px',
        fontSize: '0.6rem', fontWeight: 700,
        letterSpacing: '0.04em', cursor: onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
      }}
    >
      {STATUS_LABELS[status]}
    </button>
  )
}

// ── Feed Card ──────────────────────────────────────────────────────

function FeedCard({ entry, meta, onStatusChange, onNavigate }: {
  entry: CalendarEntry
  meta: CalendarSlotMeta
  onStatusChange: (entry: CalendarEntry, next: ContentStatus) => void
  onNavigate: (meta: CalendarSlotMeta, entry: CalendarEntry) => void
}) {
  const fmt = meta.feed_format ?? 'reel'
  const fmtColor = FORMAT_COLORS[fmt] ?? 'var(--smoke)'
  const next = STATUS_NEXT[entry.status]

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--dust)',
      borderLeft: `3px solid ${fmtColor}`,
      borderRadius: 10,
      padding: '11px 13px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: fmtColor }}>
            {FORMAT_ICONS[fmt]} {fmt.toUpperCase()}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--smoke-2)', fontVariantNumeric: 'tabular-nums' }}>
            {meta.time_slot}
          </span>
        </div>
        <StatusBadge
          status={entry.status}
          onClick={next ? () => onStatusChange(entry, next) : undefined}
        />
      </div>

      <p style={{
        fontSize: '0.78rem', color: 'var(--ink)', lineHeight: 1.5,
        fontStyle: 'italic', margin: '0 0 8px',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        "{meta.hook || meta.idea}"
      </p>

      <button
        onClick={() => onNavigate(meta, entry)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'var(--gold-light)', color: 'var(--gold)',
          border: '1px solid var(--gold-border)',
          borderRadius: 999, padding: '4px 10px',
          fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer',
        }}
      >
        <Sparkles size={10} /> Crear contenido
      </button>
    </div>
  )
}

// ── Story Card ─────────────────────────────────────────────────────

function StoryCard({ entry, meta, onStatusChange, onNavigate }: {
  entry: CalendarEntry
  meta: CalendarSlotMeta
  onStatusChange: (entry: CalendarEntry, next: ContentStatus) => void
  onNavigate: (meta: CalendarSlotMeta, entry: CalendarEntry) => void
}) {
  const next = STATUS_NEXT[entry.status]
  const storyLabel = meta.story_type ? STORY_TYPE_LABELS[meta.story_type as keyof typeof STORY_TYPE_LABELS] : 'Story'

  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--dust)',
        borderLeft: '3px solid #1d4ed8',
        borderRadius: 8,
        padding: '8px 11px',
        cursor: 'pointer',
      }}
      onClick={() => onNavigate(meta, entry)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#1d4ed8' }}>⭕ STORY</span>
          <span style={{ fontSize: '0.6rem', color: 'var(--smoke-2)' }}>{meta.time_slot}</span>
        </div>
        <StatusBadge
          status={entry.status}
          onClick={next ? (e) => { e?.stopPropagation?.(); onStatusChange(entry, next) } : undefined}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{
          fontSize: '0.58rem', fontWeight: 600,
          background: '#e8f4ff', color: '#1d4ed8',
          border: '1px solid #93c5fd', borderRadius: 999,
          padding: '1px 6px', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {storyLabel}
        </span>
        <span style={{
          fontSize: '0.7rem', color: 'var(--smoke)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {meta.idea}
        </span>
      </div>
    </div>
  )
}

// ── Day Column (mobile) ────────────────────────────────────────────

function DaySection({ date, dayIndex, entries, onStatusChange, onNavigate }: {
  date: Date
  dayIndex: number
  entries: CalendarEntry[]
  onStatusChange: (entry: CalendarEntry, next: ContentStatus) => void
  onNavigate: (meta: CalendarSlotMeta, entry: CalendarEntry) => void
}) {
  const isToday = date.toDateString() === new Date().toDateString()
  const isPast  = date < new Date() && !isToday

  const feedEntries = entries
    .map(e => ({ e, m: parseMeta(e.notes) }))
    .filter(({ m }) => m?.content_type === 'feed')
    .sort((a, b) => (a.m?.time_slot ?? '').localeCompare(b.m?.time_slot ?? ''))

  const storyEntries = entries
    .map(e => ({ e, m: parseMeta(e.notes) }))
    .filter(({ m }) => m?.content_type === 'story')
    .sort((a, b) => (a.m?.time_slot ?? '').localeCompare(b.m?.time_slot ?? ''))

  // Get day theme from first feed entry
  const dayMeta = feedEntries[0]?.m ?? storyEntries[0]?.m

  return (
    <div style={{
      background: isToday ? 'var(--gold-light)' : 'var(--surface)',
      border: `1px solid ${isToday ? 'var(--gold-border)' : 'var(--dust)'}`,
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Day header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--dust)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: isToday ? 'var(--gold)' : isPast ? 'var(--surface-2)' : 'var(--surface)',
          border: `2px solid ${isToday ? 'var(--gold)' : 'var(--dust)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--smoke-2)', lineHeight: 1 }}>
            {DAYS_SHORT[dayIndex]}
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: isToday ? 'white' : isPast ? 'var(--smoke-2)' : 'var(--ink)', lineHeight: 1 }}>
            {date.getDate()}
          </span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isToday ? 'var(--gold)' : 'var(--ink)' }}>
            {DAYS_LONG[dayIndex]}
          </div>
          {dayMeta?.day_theme_label && (
            <div style={{
              fontSize: '0.68rem', color: 'var(--smoke)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {dayMeta.day_theme_label}
            </div>
          )}
        </div>
        {dayMeta?.day_theme && (
          <span style={{
            marginLeft: 'auto', flexShrink: 0,
            fontSize: '0.58rem', fontWeight: 700,
            background: 'var(--gold-light)', color: 'var(--gold)',
            border: '1px solid var(--gold-border)',
            borderRadius: 999, padding: '2px 8px',
          }}>
            {THEME_LABELS[dayMeta.day_theme] ?? dayMeta.day_theme}
          </span>
        )}
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Feed */}
        {feedEntries.length > 0 && (
          <div>
            <div style={{
              fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--smoke-2)', marginBottom: 7,
            }}>
              Feed
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {feedEntries.map(({ e, m }, i) => m && (
                <FeedCard key={e.id ?? i} entry={e} meta={m}
                  onStatusChange={onStatusChange} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}

        {/* Stories */}
        {storyEntries.length > 0 && (
          <div>
            <div style={{
              fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#1d4ed8', marginBottom: 7,
            }}>
              Stories
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {storyEntries.map(({ e, m }, i) => m && (
                <StoryCard key={e.id ?? i} entry={e} meta={m}
                  onStatusChange={onStatusChange} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}

        {feedEntries.length === 0 && storyEntries.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '16px 0',
            fontSize: '0.75rem', color: 'var(--smoke-2)',
          }}>
            Sin contenido planificado
          </div>
        )}

      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries]         = useState<CalendarEntry[]>([])
  const [loading, setLoading]         = useState(true)
  const [organizing, setOrganizing]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [preview, setPreview]         = useState<CalendarEntry[]>([])

  const weekDates = getWeekDates(currentDate)
  const weekLabel = `${weekDates[0].getDate()} – ${weekDates[6].getDate()} de ${MONTHS[weekDates[6].getMonth()]} ${weekDates[6].getFullYear()}`

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('calendar_entries')
          .select('*')
          .order('scheduled_date', { ascending: true })
        if (data) setEntries(data as CalendarEntry[])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  function entriesForDate(date: Date) {
    const key = dateKey(date)
    return entries.filter(e => e.scheduled_date?.startsWith(key))
  }

  function prevWeek() { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d) }
  function nextWeek() { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d) }

  async function handleOrganize() {
    setOrganizing(true)
    await new Promise(r => setTimeout(r, 800))
    const generated = generateWeekEntries(weekDates)
    const asEntries: CalendarEntry[] = generated.map((g, i) => ({
      id: `preview-${i}`,
      scheduled_date: g.scheduled_date,
      status: g.status as ContentStatus,
      notes: g.notes,
      format_type: g.format_type,
      created_at: new Date().toISOString(),
    }))
    setPreview(asEntries)
    setOrganizing(false)
    setShowConfirm(true)
  }

  async function applyPlan() {
    const weekKeys = weekDates.map(dateKey)
    // Optimistic update
    setEntries(prev => [
      ...prev.filter(e => !weekKeys.includes(e.scheduled_date?.split('T')[0])),
      ...preview,
    ])
    setShowConfirm(false)
    setPreview([])

    // Persist
    try {
      const supabase = createClient()
      await supabase.from('calendar_entries').delete().in('scheduled_date', weekKeys)
      const toInsert = preview.map(({ id: _id, ...rest }) => rest)
      const { data } = await supabase.from('calendar_entries').insert(toInsert).select()
      if (data) {
        setEntries(prev => {
          const previewIds = new Set(preview.map(p => p.id))
          return [...prev.filter(e => !previewIds.has(e.id)), ...(data as CalendarEntry[])]
        })
      }
    } catch {}
  }

  async function updateStatus(entry: CalendarEntry, next: ContentStatus) {
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: next } : e))
    if (!entry.id.startsWith('preview-')) {
      try {
        const supabase = createClient()
        await supabase.from('calendar_entries').update({ status: next }).eq('id', entry.id)
      } catch {}
    }
  }

  function navigateToCrear(meta: CalendarSlotMeta, entry: CalendarEntry) {
    const params = new URLSearchParams()
    if (meta.macro_theme) params.set('theme', meta.macro_theme)
    if (meta.format && meta.format !== 'story') params.set('format', meta.format)
    if (meta.hook) params.set('hook', meta.hook)
    if (meta.idea) params.set('idea', meta.idea)
    if (entry.scheduled_date) params.set('date', entry.scheduled_date)
    if (meta.time_slot) params.set('time', meta.time_slot)
    if (meta.content_type) params.set('content_type', meta.content_type)
    if (meta.story_type) params.set('story_type', meta.story_type)
    router.push(`/crear?${params.toString()}`)
  }

  // Week stats
  const thisWeekEntries = weekDates.flatMap(d => entriesForDate(d))
  const feedCount = thisWeekEntries.filter(e => {
    const m = parseMeta(e.notes); return m?.content_type === 'feed'
  }).length
  const storyCount = thisWeekEntries.filter(e => {
    const m = parseMeta(e.notes); return m?.content_type === 'story'
  }).length
  const publishedCount = thisWeekEntries.filter(e => e.status === 'published').length

  return (
    <div className="animate-fade-in">

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <Eyebrow>Planner editorial</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
              fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 400,
              color: 'var(--ink)', margin: '2px 0 4px', letterSpacing: '-0.01em',
            }}>
              Calendario
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--smoke)', margin: 0 }}>
              {weekLabel}
            </p>
          </div>
          <Button variant="primary" size="sm" loading={organizing} onClick={handleOrganize}>
            <Wand2 size={13} /> Organizar mi semana
          </Button>
        </div>
      </div>

      {/* ── Navigation + stats ──────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap', rowGap: 10 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={prevWeek} style={{ padding: '7px 10px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--dust)', cursor: 'pointer', color: 'var(--smoke)', display: 'flex' }}>
            <ChevronLeft size={15} />
          </button>
          <button onClick={nextWeek} style={{ padding: '7px 10px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--dust)', cursor: 'pointer', color: 'var(--smoke)', display: 'flex' }}>
            <ChevronRight size={15} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} style={{ padding: '7px 12px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--dust)', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--smoke)' }}>
            Hoy
          </button>
        </div>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { label: 'Feed', value: feedCount, color: 'var(--gold)' },
            { label: 'Stories', value: storyCount, color: '#1d4ed8' },
            { label: 'Publicadas', value: publishedCount, color: '#16a34a' },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'var(--surface)', border: '1px solid var(--dust)',
              borderRadius: 999, padding: '4px 11px', fontSize: '0.72rem',
            }}>
              <span style={{ color: 'var(--smoke)' }}>{s.label}</span>
              <strong style={{ color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* ── Loading ──────────────────────────────────────────── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--smoke)', fontSize: '0.82rem' }}>
          Cargando calendario…
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────── */}
      {!loading && thisWeekEntries.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 20px',
          background: 'var(--glass)', border: '1px dashed var(--dust-2)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>📅</div>
          <p style={{
            fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
            fontSize: '0.95rem', color: 'var(--ink-2)', margin: '0 0 6px',
          }}>
            Esta semana no tiene contenido planificado
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--smoke)', margin: '0 0 16px' }}>
            Presiona "Organizar mi semana" para generar una estrategia editorial completa.
          </p>
          <Button variant="primary" size="sm" onClick={handleOrganize} loading={organizing}>
            <Wand2 size={13} /> Organizar mi semana
          </Button>
        </div>
      )}

      {/* ── Week grid ────────────────────────────────────────── */}
      {!loading && thisWeekEntries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {weekDates.map((date, i) => (
            <DaySection
              key={i}
              date={date}
              dayIndex={date.getDay()}
              entries={entriesForDate(date)}
              onStatusChange={updateStatus}
              onNavigate={navigateToCrear}
            />
          ))}
        </div>
      )}

      {/* ── Confirm modal ────────────────────────────────────── */}
      <Modal
        open={showConfirm}
        onClose={() => { setShowConfirm(false); setPreview([]) }}
        title="Semana generada"
        maxWidth="640px"
      >
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--smoke)', marginBottom: 16, lineHeight: 1.6 }}>
            Se generaron <strong>{preview.filter(e => parseMeta(e.notes)?.content_type === 'feed').length} piezas de feed</strong> y{' '}
            <strong>{preview.filter(e => parseMeta(e.notes)?.content_type === 'story').length} bloques de Stories</strong> para esta semana.
            Los hooks son sugerencias — puedes editar cualquier pieza después de aplicar.
          </p>

          {/* Preview by day */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, maxHeight: 380, overflowY: 'auto' }}>
            {weekDates.map((date, di) => {
              const dk = dateKey(date)
              const dayEntries = preview.filter(e => e.scheduled_date === dk)
              if (dayEntries.length === 0) return null
              const firstMeta = parseMeta(dayEntries[0].notes)
              return (
                <div key={di} style={{ background: 'var(--surface)', border: '1px solid var(--dust)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                      {DAYS_LONG[date.getDay()]}
                    </span>
                    {firstMeta?.day_theme_label && (
                      <span style={{
                        fontSize: '0.62rem', color: 'var(--gold)',
                        background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
                        borderRadius: 999, padding: '1px 7px', fontWeight: 600,
                      }}>
                        {firstMeta.day_theme_label}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {dayEntries.map((e, ei) => {
                      const m = parseMeta(e.notes)
                      if (!m) return null
                      return (
                        <div key={ei} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.74rem' }}>
                          <span style={{ color: 'var(--smoke-2)', flexShrink: 0, fontVariantNumeric: 'tabular-nums', minWidth: 34 }}>
                            {m.time_slot}
                          </span>
                          <span style={{
                            flexShrink: 0,
                            color: m.content_type === 'story' ? '#1d4ed8' : FORMAT_COLORS[m.feed_format ?? 'reel'],
                            fontWeight: 600, fontSize: '0.62rem', paddingTop: 1,
                          }}>
                            {m.content_type === 'story' ? '⭕' : FORMAT_ICONS[m.feed_format ?? 'reel']} {m.content_type === 'story' ? (STORY_TYPE_LABELS[m.story_type as keyof typeof STORY_TYPE_LABELS] ?? 'Story') : (m.feed_format ?? 'reel').toUpperCase()}
                          </span>
                          <span style={{ color: 'var(--ink-2)', lineHeight: 1.4 }}>
                            {m.content_type === 'story' ? m.idea : (m.hook || m.idea).slice(0, 60) + ((m.hook || m.idea).length > 60 ? '…' : '')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button onClick={applyPlan}>
              <Check size={14} /> Aplicar plan
            </Button>
            <Button variant="ghost" onClick={() => { setShowConfirm(false); setPreview([]) }}>
              <X size={14} /> Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
