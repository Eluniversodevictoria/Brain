'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Wand2, Check, X, Circle } from 'lucide-react'
import { Button, Badge, SectionHeader, Eyebrow, Card, StatusDot, Modal, Divider } from '@/components/ui'
import { STATUS_LABELS, THEME_LABELS, FORMAT_LABELS, OBJECTIVE_LABELS } from '@/types'
import type { CalendarEntry, ContentStatus } from '@/types'
import { useStrategy } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import type { WeekPlan } from '@/lib/mock/organize'

const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DAYS_LONG  = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function getWeekDates(ref: Date): Date[] {
  const start = new Date(ref)
  const dow = start.getDay() === 0 ? 6 : start.getDay() - 1
  start.setDate(start.getDate() - dow)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

function dateKey(d: Date) { return d.toISOString().split('T')[0] }

const STATUS_NEXT: Partial<Record<ContentStatus, ContentStatus>> = {
  idea: 'in_development',
  in_development: 'script_ready',
  script_ready: 'produced',
  produced: 'scheduled',
  scheduled: 'published',
}

const STATUS_COLOR: Record<string, string> = {
  published: 'var(--sage)',
  scheduled: 'var(--celestial)',
  produced: '#7b2fa8',
  script_ready: 'var(--gold)',
  in_development: 'var(--blush)',
  idea: 'var(--smoke-2)',
  discarded: 'var(--dust-2)',
}

// ── Entry pill for desktop column view ─────────────────────────────

function EntryPill({ entry, onClick }: { entry: CalendarEntry; onClick: () => void }) {
  const piece = entry.content_piece
  const isOrg = (entry as CalendarEntry & { _organized?: boolean })._organized
  const statusColor = STATUS_COLOR[entry.status] ?? 'var(--smoke-2)'
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', background: 'var(--surface-2)',
        borderLeft: `2px solid ${statusColor}`,
        borderRadius: 6, padding: '6px 8px',
        cursor: 'pointer', transition: 'opacity 150ms',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
        <Circle size={5} fill={statusColor} color={statusColor} />
        {isOrg && <span style={{ fontSize: '0.5rem', color: 'var(--gold)' }}>✦</span>}
      </div>
      <div style={{ fontSize: '0.58rem', color: 'var(--smoke)', lineHeight: 1.4, fontWeight: 600 }}>
        {piece?.macro_theme ? THEME_LABELS[piece.macro_theme] : entry.format_type ?? '—'}
      </div>
      {piece?.hook_text && (
        <div style={{ fontSize: '0.52rem', color: 'var(--smoke-2)', lineHeight: 1.3, marginTop: 2 }}>
          {piece.hook_text.slice(0, 28)}…
        </div>
      )}
    </button>
  )
}

// ── Entry card for mobile list view ────────────────────────────────

function EntryCard({ entry, onClick }: { entry: CalendarEntry; onClick: () => void }) {
  const piece = entry.content_piece
  const isOrg = (entry as CalendarEntry & { _organized?: boolean })._organized
  const statusColor = STATUS_COLOR[entry.status] ?? 'var(--smoke-2)'

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        background: 'var(--surface)',
        border: '1px solid var(--dust)',
        borderLeft: `3px solid ${statusColor}`,
        borderRadius: 10, padding: '12px 14px',
        cursor: 'pointer', transition: 'all 150ms',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--dust-2)' }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--dust)'
        ;(e.currentTarget as HTMLElement).style.borderLeftColor = statusColor
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        {isOrg && (
          <span style={{
            fontSize: '0.58rem', color: 'var(--gold)', background: 'var(--gold-light)',
            border: '1px solid var(--gold-border)', borderRadius: 4, padding: '1px 5px',
            fontWeight: 700, letterSpacing: '0.04em',
          }}>
            ✦ Auto
          </span>
        )}
        {piece?.macro_theme && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, color: 'var(--gold)',
            background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
            borderRadius: 999, padding: '1px 8px',
          }}>
            {THEME_LABELS[piece.macro_theme]}
          </span>
        )}
        {piece?.format_id && (
          <span style={{
            fontSize: '0.68rem', color: 'var(--smoke)',
            background: 'var(--surface-2)', border: '1px solid var(--dust)',
            borderRadius: 999, padding: '1px 8px',
          }}>
            {entry.format_type ?? piece.format_id}
          </span>
        )}
        <span style={{
          fontSize: '0.65rem', fontWeight: 600,
          color: statusColor,
          background: 'var(--surface-2)', border: `1px solid ${statusColor}22`,
          borderRadius: 999, padding: '1px 8px', marginLeft: 'auto', flexShrink: 0,
        }}>
          {STATUS_LABELS[entry.status]}
        </span>
      </div>
      {piece?.hook_text && (
        <div style={{
          fontSize: '0.8rem', color: 'var(--ink-2)', lineHeight: 1.5,
          fontStyle: 'italic',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          "{piece.hook_text}"
        </div>
      )}
      {!piece?.hook_text && entry.notes && (
        <div style={{ fontSize: '0.76rem', color: 'var(--smoke)', lineHeight: 1.4 }}>
          {entry.notes}
        </div>
      )}
    </button>
  )
}

// ── Week progress pills ────────────────────────────────────────────

function WeekProgress({ reels, carruseles, published, reelsMax, carruselesMax, total }: {
  reels: number; carruseles: number; published: number
  reelsMax: number; carruselesMax: number; total: number
}) {
  const items = [
    { label: 'Reels', value: reels, max: reelsMax, color: 'var(--gold)' },
    { label: 'Carruseles', value: carruseles, max: carruselesMax, color: '#7b2fa8' },
    { label: 'Publicadas', value: published, max: total || 1, color: '#16a34a' },
  ]
  return (
    <div style={{
      display: 'flex', gap: 8, flexWrap: 'wrap',
    }}>
      {items.map(item => {
        const pct = Math.min(100, Math.round((item.value / item.max) * 100))
        return (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--surface)', border: '1px solid var(--dust)',
            borderRadius: 999, padding: '5px 12px',
            fontSize: '0.72rem',
          }}>
            <div style={{
              width: 28, height: 4, borderRadius: 99,
              background: 'var(--dust)', overflow: 'hidden', flexShrink: 0,
            }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: item.color, borderRadius: 99,
                transition: 'width 0.4s',
              }} />
            </div>
            <span style={{ color: 'var(--smoke)', whiteSpace: 'nowrap' }}>
              {item.label}
              <strong style={{ color: item.color, marginLeft: 4, fontVariantNumeric: 'tabular-nums' }}>
                {item.value}/{item.max}
              </strong>
            </span>
          </div>
        )
      })}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'var(--surface-2)', border: '1px solid var(--dust)',
        borderRadius: 999, padding: '5px 12px', fontSize: '0.72rem', color: 'var(--smoke)',
      }}>
        Total: <strong style={{ color: 'var(--ink)', marginLeft: 4 }}>{total}</strong>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const { strategy } = useStrategy()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(true)
  const [organizing, setOrganizing] = useState(false)
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null)
  const [showEntryModal, setShowEntryModal] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('calendar_entries')
          .select('*')
          .order('scheduled_date', { ascending: true })
        if (!error && data) setEntries(data as CalendarEntry[])
      } catch {}
      finally { setLoadingEntries(false) }
    }
    load()
  }, [])

  const weekDates = getWeekDates(currentDate)
  const weekLabel = `${weekDates[0].getDate()} – ${weekDates[6].getDate()} ${MONTHS[weekDates[6].getMonth()]} ${weekDates[6].getFullYear()}`

  function prevWeek() { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d) }
  function nextWeek() { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d) }
  function goToday()  { setCurrentDate(new Date()) }

  function entriesForDate(date: Date): CalendarEntry[] {
    const key = dateKey(date)
    return entries.filter(e => e.scheduled_date.startsWith(key))
  }

  async function handleOrganize() {
    setOrganizing(true)
    await new Promise(r => setTimeout(r, 1600))
    const { organizeWeek } = await import('@/lib/mock/organize')
    const plan = organizeWeek(strategy)
    setWeekPlan(plan)
    setOrganizing(false)
    setShowConfirmModal(true)
  }

  async function applyPlan() {
    if (!weekPlan) return
    const weekDts = getWeekDates(new Date())
    const thisWeekKeys = [...new Set(weekDts.map(d => dateKey(d)))]

    const tempEntries: CalendarEntry[] = weekPlan.entries.map((e, i) => ({
      id: 'temp-' + i,
      scheduled_date: dateKey(weekDts[e.day]),
      status: 'scheduled' as ContentStatus,
      notes: `${THEME_LABELS[e.theme]} · ${FORMAT_LABELS[e.format]} · ${e.hypothesis_applied.slice(0, 120)}`,
      created_at: new Date().toISOString(),
    }))

    // Optimistic — close modal and show entries immediately
    setEntries(prev => [
      ...prev.filter(e => !thisWeekKeys.includes(e.scheduled_date.split('T')[0])),
      ...tempEntries,
    ])
    setShowConfirmModal(false)
    setWeekPlan(null)
    setCurrentDate(new Date())

    // Persist to Supabase
    try {
      const supabase = createClient()
      await supabase.from('calendar_entries').delete().in('scheduled_date', thisWeekKeys)
      const toInsert = tempEntries.map(({ id: _id, ...rest }) => rest)
      const { data } = await supabase.from('calendar_entries').insert(toInsert).select()
      // Swap temp IDs for real DB IDs
      if (data) {
        const real = data as CalendarEntry[]
        setEntries(prev => {
          const tempIdSet = new Set(tempEntries.map(e => e.id))
          return [...prev.filter(e => !tempIdSet.has(e.id)), ...real]
        })
      }
    } catch {}
  }

  async function removeEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
    setShowEntryModal(false)
    setSelectedEntry(null)
    if (!id.startsWith('temp-')) {
      try {
        const supabase = createClient()
        await supabase.from('calendar_entries').delete().eq('id', id)
      } catch {}
    }
  }

  async function advanceStatus(entry: CalendarEntry) {
    const next = STATUS_NEXT[entry.status]
    if (!next) return
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: next } : e))
    if (selectedEntry?.id === entry.id) setSelectedEntry({ ...entry, status: next })
    if (!entry.id.startsWith('temp-')) {
      try {
        const supabase = createClient()
        await supabase.from('calendar_entries').update({ status: next }).eq('id', entry.id)
      } catch {}
    }
  }

  // Week stats
  const thisWeekEntries = weekDates.flatMap(d => entriesForDate(d))
  const reelsCount      = thisWeekEntries.filter(e => (e.notes ?? '').toLowerCase().includes('reel')).length
  const carruselCount   = thisWeekEntries.filter(e => (e.notes ?? '').toLowerCase().includes('carrusel')).length
  const publishedCount  = thisWeekEntries.filter(e => e.status === 'published').length

  return (
    <div className="animate-fade-in">
      {/* ── Header ─────────────────────────────────────────── */}
      <SectionHeader
        title="Calendario"
        subtitle={weekLabel}
        action={
          <Button variant="primary" size="sm" loading={organizing} onClick={handleOrganize}>
            <Wand2 size={13} />
            Organiza mi semana
          </Button>
        }
      />

      {/* ── Week navigation ────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, flexWrap: 'wrap', rowGap: 10 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={prevWeek} style={{ padding: '7px 10px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--dust)', cursor: 'pointer', color: 'var(--smoke)', display: 'flex' }}>
            <ChevronLeft size={15} />
          </button>
          <button onClick={nextWeek} style={{ padding: '7px 10px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--dust)', cursor: 'pointer', color: 'var(--smoke)', display: 'flex' }}>
            <ChevronRight size={15} />
          </button>
          <button onClick={goToday} style={{ padding: '7px 12px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--dust)', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--smoke)' }}>
            Hoy
          </button>
        </div>
        <WeekProgress
          reels={reelsCount} carruseles={carruselCount} published={publishedCount}
          reelsMax={strategy.reels_per_week} carruselesMax={strategy.carrusels_per_week}
          total={thisWeekEntries.length}
        />
      </div>

      {/* ── Loading ────────────────────────────────────────── */}
      {loadingEntries && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--smoke)', fontSize: '0.82rem' }}>
          Cargando calendario…
        </div>
      )}

      {/* ── MOBILE: day-by-day list ─────────────────────────── */}
      <div className="block lg:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {weekDates.map((date, di) => {
          const isToday  = date.toDateString() === new Date().toDateString()
          const isPast   = date < new Date() && !isToday
          const dayEntries = entriesForDate(date)
          return (
            <div key={di}>
              {/* Day header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                padding: '8px 12px',
                background: isToday ? 'var(--gold-light)' : 'transparent',
                border: isToday ? '1px solid var(--gold-border)' : '1px solid transparent',
                borderRadius: 10,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: isToday ? 'var(--gold)' : 'var(--surface-2)',
                  border: `1px solid ${isToday ? 'var(--gold)' : 'var(--dust)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '0.52rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: isToday ? 'rgba(255,255,255,0.85)' : 'var(--smoke-2)', lineHeight: 1 }}>
                    {DAYS_SHORT[di]}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isToday ? 'white' : isPast ? 'var(--dust-2)' : 'var(--ink)', lineHeight: 1 }}>
                    {date.getDate()}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isToday ? 'var(--gold)' : isPast ? 'var(--smoke-2)' : 'var(--ink)' }}>
                    {DAYS_LONG[di]}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--smoke-2)' }}>
                    {dayEntries.length === 0
                      ? 'Sin publicaciones'
                      : `${dayEntries.length} ${dayEntries.length === 1 ? 'publicación' : 'publicaciones'}`}
                  </div>
                </div>
              </div>

              {/* Entries */}
              {dayEntries.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingLeft: 2 }}>
                  {dayEntries.map((entry, ei) => (
                    <EntryCard
                      key={ei}
                      entry={entry}
                      onClick={() => { setSelectedEntry(entry); setShowEntryModal(true) }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--surface)',
                  border: '1px dashed var(--dust)',
                  borderRadius: 10,
                  fontSize: '0.76rem', color: 'var(--smoke-2)', textAlign: 'center',
                }}>
                  Día libre
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── DESKTOP: 7-column grid ─────────────────────────── */}
      <div className="hidden lg:grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 20 }}>
        {weekDates.map((date, di) => {
          const isToday  = date.toDateString() === new Date().toDateString()
          const isPast   = date < new Date() && !isToday
          const dayEntries = entriesForDate(date)
          return (
            <div key={di} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                textAlign: 'center', marginBottom: 6, padding: '5px 4px', borderRadius: 7,
                background: isToday ? 'var(--gold-light)' : 'transparent',
              }}>
                <div style={{ fontSize: '0.58rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: isToday ? 'var(--gold)' : 'var(--smoke-2)' }}>
                  {DAYS_SHORT[di]}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isToday ? 'var(--gold)' : isPast ? 'var(--dust-2)' : 'var(--ink)' }}>
                  {date.getDate()}
                </div>
              </div>
              <div style={{
                flex: 1, minHeight: 120, borderRadius: 9,
                border: `1px solid ${isToday ? 'var(--gold-border)' : 'var(--dust)'}`,
                background: 'var(--surface)',
                display: 'flex', flexDirection: 'column', gap: 5, padding: 6,
              }}>
                {dayEntries.map((entry, ei) => (
                  <EntryPill
                    key={ei}
                    entry={entry}
                    onClick={() => { setSelectedEntry(entry); setShowEntryModal(true) }}
                  />
                ))}
                {dayEntries.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dust-2)', fontSize: '0.6rem' }}>—</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Modals (same as before) ─────────────────────────── */}
      <Modal
        open={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setWeekPlan(null) }}
        title="Organización propuesta para esta semana"
        maxWidth="600px"
      >
        {weekPlan && (
          <div>
            <div style={{ borderRadius: 10, padding: '10px 14px', marginBottom: 16, background: 'var(--gold-light)', border: '1px solid var(--gold-border)' }}>
              <strong style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>Objetivo editorial: </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--ink)' }}>{weekPlan.week_objective}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {weekPlan.entries.map((e, i) => (
                <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--dust)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)' }}>{e.dayName}</span>
                    <Badge variant="sage">{THEME_LABELS[e.theme]}</Badge>
                    <Badge variant="default">{FORMAT_LABELS[e.format]}</Badge>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--smoke)', margin: '0 0 8px' }}>
                    Objetivo: {OBJECTIVE_LABELS[e.objective]} · Pilar: {e.pillar}
                  </p>
                  <div style={{ background: 'var(--surface-2)', borderRadius: 7, padding: '7px 10px', fontSize: '0.74rem', color: 'var(--smoke)', fontStyle: 'italic' }}>
                    {e.hypothesis_applied}
                  </div>
                  {e.content_piece.hook_text && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--ink)', margin: '8px 0 0' }}>
                      "{e.content_piece.hook_text.slice(0, 70)}…"
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button onClick={applyPlan}>
                <Check size={14} /> Aplicar plan
              </Button>
              <Button variant="ghost" onClick={() => { setShowConfirmModal(false); setWeekPlan(null) }}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showEntryModal}
        onClose={() => { setShowEntryModal(false); setSelectedEntry(null) }}
        title="Detalle de pieza"
      >
        {selectedEntry && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <StatusDot status={selectedEntry.status} />
              <span style={{ fontSize: '0.8rem', color: 'var(--smoke)' }}>{STATUS_LABELS[selectedEntry.status]}</span>
              {selectedEntry.content_piece?.macro_theme && (
                <Badge variant="sage">{THEME_LABELS[selectedEntry.content_piece.macro_theme]}</Badge>
              )}
            </div>
            {selectedEntry.content_piece?.hook_text && (
              <div style={{ background: 'var(--surface-2)', borderRadius: 9, padding: '12px 14px', marginBottom: 14 }}>
                <p style={{ fontSize: '0.84rem', lineHeight: 1.55, color: 'var(--ink)', fontStyle: 'italic', margin: 0 }}>
                  "{selectedEntry.content_piece.hook_text}"
                </p>
              </div>
            )}
            {selectedEntry.notes && (
              <p style={{ fontSize: '0.76rem', color: 'var(--smoke)', fontStyle: 'italic', marginBottom: 14 }}>
                {selectedEntry.notes}
              </p>
            )}
            <div style={{ height: 1, background: 'var(--dust)', margin: '0 0 14px' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {STATUS_NEXT[selectedEntry.status] && (
                <Button size="sm" variant="secondary" onClick={() => advanceStatus(selectedEntry)}>
                  → {STATUS_LABELS[STATUS_NEXT[selectedEntry.status]!]}
                </Button>
              )}
              <Button size="sm" variant="danger" onClick={() => removeEntry(selectedEntry.id)}>
                <X size={12} /> Quitar del calendario
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
