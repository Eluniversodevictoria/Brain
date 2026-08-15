'use client'

import { useState } from 'react'
import {
  History, Search, Bookmark, BookmarkCheck, Trash2,
  Copy, CheckCheck, ChevronDown, ChevronUp, RefreshCw,
  Image as ImageIcon, Video, Globe, Sun, Sparkles,
} from 'lucide-react'
import { Eyebrow, Card, Badge } from '@/components/ui'
import { THEME_LABELS, FORMAT_LABELS } from '@/types'
import type { MacroTheme, ContentFormatType } from '@/types'
import { useContentStorage } from '@/hooks/useContentStorage'
import type { SavedEntry } from '@/hooks/useContentStorage'
import { VariationModal } from '@/components/VariationModal'

// ── Helpers ────────────────────────────────────────────────────────

function useCopy() {
  const [key, setKey] = useState<string | null>(null)
  function copy(k: string, text: string) {
    navigator.clipboard.writeText(text).catch(() => null)
    setKey(k)
    setTimeout(() => setKey(null), 1800)
  }
  return { copiedKey: key, copy }
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.58rem', color: 'var(--smoke-2)',
      letterSpacing: '0.1em', textTransform: 'uppercase',
      fontWeight: 700, marginBottom: 4,
    }}>
      {children}
    </div>
  )
}

const SOURCE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  'plan-hoy':         { label: 'Plan de hoy',       icon: <Sun size={10} />,     color: 'var(--gold)',  bg: 'var(--gold-light)',  border: 'var(--gold-border)' },
  'inspirar':         { label: 'Crear desde link',   icon: <Globe size={10} />,   color: '#7b2fa8',      bg: '#f5eefb',            border: '#d4a8f0' },
  'generador':        { label: 'Generador',          icon: <Sparkles size={10} />,color: 'var(--rose)',  bg: 'var(--rose-light)',  border: 'var(--rose-border)' },
  'dame-una-idea':    { label: 'Dame una idea',      icon: <Sparkles size={10} />,color: 'var(--rose)',  bg: 'var(--rose-light)',  border: 'var(--rose-border)' },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Entry Card ─────────────────────────────────────────────────────

function EntryCard({ entry, onToggleFav, onRemove, onReuse }: {
  entry: SavedEntry
  onToggleFav: (id: string) => void
  onRemove: (id: string) => void
  onReuse: (entry: SavedEntry) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { copiedKey, copy } = useCopy()

  const copyText = [
    `HOOK\n${entry.hook}`,
    '',
    `TEXTO\n${entry.main_text}`,
    '',
    `CTA\n${entry.cta}`,
  ].join('\n')

  const copyCaption = [entry.caption, '', entry.hashtags.map(h => `#${h}`).join(' ')].join('\n')

  const src = SOURCE_CONFIG[entry.source] ?? SOURCE_CONFIG['generador']
  const isReel = entry.kind === 'reel' || entry.format?.startsWith('reel')

  return (
    <Card style={{ marginBottom: 0 }}>
      {/* Header */}
      <div style={{
        padding: '11px 16px',
        borderBottom: expanded ? '1px solid var(--dust)' : 'none',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        {/* Kind icon */}
        <div style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          background: isReel ? 'var(--gold-light)' : 'var(--rose-light)',
          border: `1px solid ${isReel ? 'var(--gold-border)' : 'var(--rose-border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isReel
            ? <Video size={11} color="var(--gold)" strokeWidth={2} />
            : <ImageIcon size={11} color="var(--rose)" strokeWidth={2} />}
        </div>

        {/* Badges */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge variant="gold">{THEME_LABELS[entry.theme] ?? entry.theme}</Badge>
          <Badge variant="default">{FORMAT_LABELS[entry.format] ?? entry.format}</Badge>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: src.bg, border: `1px solid ${src.border}`,
            borderRadius: 999, padding: '1px 7px',
            fontSize: '0.62rem', fontWeight: 600, color: src.color,
          }}>
            {src.icon} {src.label}
          </span>
        </div>

        {/* Date + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--smoke-2)' }}>{formatDate(entry.saved_at)}</span>
          <button
            onClick={() => onToggleFav(entry.id)}
            title={entry.is_favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex', color: entry.is_favorite ? 'var(--gold)' : 'var(--smoke-2)' }}
          >
            {entry.is_favorite ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex', color: 'var(--smoke-2)' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Hook preview (always visible) */}
      {!expanded && (
        <div style={{ padding: '10px 16px', borderBottom: 'none' }}>
          <div style={{
            fontSize: '0.82rem', color: 'var(--ink-2)', lineHeight: 1.5,
            fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            "{entry.hook}"
          </div>
        </div>
      )}

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Hook */}
          <div>
            <Label>Hook</Label>
            <div style={{
              background: 'var(--rose-light)', border: '1px solid var(--rose-border)',
              borderRadius: 9, padding: '9px 13px',
              fontSize: '0.84rem', color: 'var(--ink)', lineHeight: 1.55, fontStyle: 'italic',
            }}>
              "{entry.hook}"
            </div>
          </div>

          {/* Main text */}
          <div>
            <Label>{entry.kind === 'reel' ? 'Guion / texto en pantalla' : 'Texto imagen'}</Label>
            <div style={{
              background: 'var(--surface-2)', border: '1px solid var(--dust)',
              borderRadius: 9, padding: '10px 13px',
              fontSize: '0.82rem', color: 'var(--ink-2)', lineHeight: 1.6, whiteSpace: 'pre-line',
              fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
            }}>
              {entry.main_text}
            </div>
          </div>

          {/* CTA */}
          <div>
            <Label>CTA</Label>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--dust)',
              borderRadius: 9, padding: '8px 13px',
              fontSize: '0.8rem', color: 'var(--smoke)', lineHeight: 1.5,
            }}>
              {entry.cta}
            </div>
          </div>

          {/* Caption */}
          <div>
            <Label>Caption</Label>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--dust)',
              borderRadius: 9, padding: '10px 13px',
              fontSize: '0.8rem', color: 'var(--ink-2)', lineHeight: 1.6, whiteSpace: 'pre-line',
            }}>
              {entry.caption}
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <Label>Hashtags</Label>
            <div style={{ fontSize: '0.75rem', color: 'var(--smoke)', lineHeight: 1.7 }}>
              {entry.hashtags.map(h => `#${h}`).join(' ')}
            </div>
          </div>

          {/* Inspirar extras */}
          {entry.inspiration_tema && (
            <div style={{
              background: 'var(--surface-2)', border: '1px solid var(--dust)',
              borderRadius: 8, padding: '8px 12px',
              fontSize: '0.74rem', color: 'var(--smoke-2)', lineHeight: 1.5,
            }}>
              <strong style={{ color: 'var(--smoke)' }}>Inspirado en:</strong> {entry.inspiration_tema}
              {entry.inspiration_platform && ` · ${entry.inspiration_platform}`}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', paddingTop: 2, borderTop: '1px solid var(--dust)', marginTop: 2 }}>
            {/* Copy text */}
            <button
              onClick={() => copy(`text-${entry.id}`, copyText)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: copiedKey === `text-${entry.id}` ? 'var(--success-light)' : 'var(--surface-2)',
                border: `1px solid ${copiedKey === `text-${entry.id}` ? 'var(--success)' : 'var(--dust)'}`,
                borderRadius: 999, padding: '6px 12px',
                fontSize: '0.73rem', fontWeight: 600,
                color: copiedKey === `text-${entry.id}` ? 'var(--success)' : 'var(--smoke)',
                cursor: 'pointer', transition: 'all 160ms', whiteSpace: 'nowrap',
              }}
            >
              {copiedKey === `text-${entry.id}` ? <CheckCheck size={11} /> : <Copy size={11} />}
              {copiedKey === `text-${entry.id}` ? 'Copiado' : 'Copiar texto'}
            </button>

            {/* Copy caption */}
            <button
              onClick={() => copy(`cap-${entry.id}`, copyCaption)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: copiedKey === `cap-${entry.id}` ? 'var(--success-light)' : 'var(--surface-2)',
                border: `1px solid ${copiedKey === `cap-${entry.id}` ? 'var(--success)' : 'var(--dust)'}`,
                borderRadius: 999, padding: '6px 12px',
                fontSize: '0.73rem', fontWeight: 600,
                color: copiedKey === `cap-${entry.id}` ? 'var(--success)' : 'var(--smoke)',
                cursor: 'pointer', transition: 'all 160ms', whiteSpace: 'nowrap',
              }}
            >
              {copiedKey === `cap-${entry.id}` ? <CheckCheck size={11} /> : <Copy size={11} />}
              {copiedKey === `cap-${entry.id}` ? 'Copiado' : 'Copiar caption'}
            </button>

            {/* Reuse / Create variation */}
            <button
              onClick={() => onReuse(entry)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
                borderRadius: 999, padding: '6px 12px',
                fontSize: '0.73rem', fontWeight: 600, color: 'var(--gold)',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <RefreshCw size={11} /> Crear variación
            </button>

            {/* Delete */}
            <button
              onClick={() => onRemove(entry.id)}
              title="Eliminar"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'none', border: '1px solid var(--dust)',
                borderRadius: 999, padding: '6px 11px',
                fontSize: '0.73rem', color: 'var(--smoke-2)',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <Trash2 size={11} /> Eliminar
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

// ── Filter Bar ─────────────────────────────────────────────────────

function FilterBar({ filter, setFilter }: {
  filter: Record<string, string>
  setFilter: (k: string, v: string) => void
}) {
  const themes: Array<{ value: string; label: string }> = [
    { value: '', label: 'Todos los temas' },
    ...Object.entries(THEME_LABELS).map(([v, l]) => ({ value: v, label: l })),
  ]
  const formats: Array<{ value: string; label: string }> = [
    { value: '', label: 'Todos los formatos' },
    ...Object.entries(FORMAT_LABELS).map(([v, l]) => ({ value: v, label: l })),
  ]
  const sources = [
    { value: '', label: 'Todas las fuentes' },
    { value: 'plan-hoy', label: 'Plan de hoy' },
    { value: 'inspirar', label: 'Crear desde link' },
    { value: 'generador', label: 'Generador' },
  ]

  const selectStyle: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--dust)',
    borderRadius: 10, padding: '7px 10px',
    fontSize: '0.78rem', color: 'var(--ink)', outline: 'none', cursor: 'pointer',
    flex: 1, minWidth: 130,
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 2, minWidth: 180 }}>
        <Search size={14} color="var(--smoke-2)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Buscar en hook, texto, caption..."
          value={filter.search ?? ''}
          onChange={e => setFilter('search', e.target.value)}
          style={{
            flex: 1, background: 'var(--surface)', border: '1px solid var(--dust)',
            borderRadius: 10, padding: '7px 12px',
            fontSize: '0.8rem', color: 'var(--ink)', outline: 'none',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--dust)' }}
        />
      </div>

      <select value={filter.theme ?? ''} onChange={e => setFilter('theme', e.target.value)} style={selectStyle}>
        {themes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      <select value={filter.format ?? ''} onChange={e => setFilter('format', e.target.value)} style={selectStyle}>
        {formats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>

      <select value={filter.source ?? ''} onChange={e => setFilter('source', e.target.value)} style={selectStyle}>
        {sources.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>

      {/* Favorites toggle */}
      <button
        onClick={() => setFilter('favoritesOnly', filter.favoritesOnly === '1' ? '' : '1')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: filter.favoritesOnly === '1' ? 'var(--gold-light)' : 'var(--surface)',
          border: `1px solid ${filter.favoritesOnly === '1' ? 'var(--gold-border)' : 'var(--dust)'}`,
          borderRadius: 999, padding: '7px 12px',
          fontSize: '0.75rem', fontWeight: 600,
          color: filter.favoritesOnly === '1' ? 'var(--gold)' : 'var(--smoke)',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        <Bookmark size={12} /> Solo favoritos
      </button>
    </div>
  )
}


// ── Page ───────────────────────────────────────────────────────────

export default function HistorialPage() {
  const [rawFilter, setRawFilter] = useState<Record<string, string>>({})
  const [reuseEntry, setReuseEntry] = useState<SavedEntry | null>(null)

  const { entries, total, filter, setFilter, remove, toggle } = useContentStorage({
    theme: (rawFilter.theme ?? '') as MacroTheme | '',
    format: (rawFilter.format ?? '') as ContentFormatType | '',
    source: rawFilter.source ?? '',
    search: rawFilter.search ?? '',
    favoritesOnly: rawFilter.favoritesOnly === '1',
  })

  function handleSetFilter(k: string, v: string) {
    setRawFilter(prev => ({ ...prev, [k]: v }))
  }

  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>Contenido guardado</Eyebrow>
        <h1 style={{
          fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
          fontSize: 'clamp(1.6rem, 3vw, 2rem)',
          fontWeight: 400, color: 'var(--ink)',
          margin: '4px 0 6px', letterSpacing: '-0.01em',
        }}>
          Historial
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', margin: 0 }}>
          {total} {total === 1 ? 'publicación guardada' : 'publicaciones guardadas'} · {entries.length !== total ? `${entries.length} filtradas` : 'todas visibles'}
        </p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20 }}>
        <FilterBar filter={rawFilter} setFilter={handleSetFilter} />
      </div>

      {/* Empty state */}
      {total === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 20px',
          background: 'var(--glass)', border: '1px dashed var(--dust-2)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 10 }}><History size={32} color="var(--smoke-2)" /></div>
          <p style={{
            fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
            fontSize: '1rem', color: 'var(--ink-2)', margin: '0 0 6px',
          }}>
            Todavía no hay nada guardado
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--smoke)', margin: 0 }}>
            Guarda contenido desde <strong>Plan de hoy</strong> o <strong>Crear desde link</strong><br />
            y aparecerá aquí.
          </p>
        </div>
      )}

      {/* No results but has data */}
      {total > 0 && entries.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '32px 20px',
          background: 'var(--surface-2)', borderRadius: 12,
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', margin: 0 }}>
            Ningún resultado con estos filtros.
            <button
              onClick={() => setRawFilter({})}
              style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Limpiar filtros
            </button>
          </p>
        </div>
      )}

      {/* Entries */}
      {entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onToggleFav={toggle}
              onRemove={remove}
              onReuse={setReuseEntry}
            />
          ))}
        </div>
      )}

      {/* Variation modal */}
      {reuseEntry && (
        <VariationModal
          original={reuseEntry}
          onClose={() => setReuseEntry(null)}
          onSaved={() => { setReuseEntry(null) }}
        />
      )}
    </main>
  )
}
