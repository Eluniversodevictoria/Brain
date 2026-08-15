'use client'

import { useState } from 'react'
import { BookmarkCheck, Search, Trash2, Copy, CheckCheck, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { VariationModal } from '@/components/VariationModal'
import { Eyebrow, Card, Badge } from '@/components/ui'
import { THEME_LABELS, FORMAT_LABELS } from '@/types'
import { useContentStorage } from '@/hooks/useContentStorage'
import type { SavedEntry } from '@/hooks/useContentStorage'

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

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Fav Card ───────────────────────────────────────────────────────

function FavCard({ entry, onUnfav, onRemove, onReuse }: {
  entry: SavedEntry
  onUnfav: (id: string) => void
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

  return (
    <Card style={{ marginBottom: 0, border: '1px solid var(--gold-border)' }}>
      {/* Header */}
      <div style={{
        padding: '11px 16px',
        borderBottom: expanded ? '1px solid var(--dust)' : 'none',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <BookmarkCheck size={14} color="var(--gold)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge variant="gold">{THEME_LABELS[entry.theme] ?? entry.theme}</Badge>
          <Badge variant="default">{FORMAT_LABELS[entry.format] ?? entry.format}</Badge>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--smoke-2)' }}>{formatDate(entry.saved_at)}</span>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex', color: 'var(--smoke-2)' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Hook preview */}
      {!expanded && (
        <div style={{ padding: '10px 16px' }}>
          <div style={{
            fontSize: '0.82rem', color: 'var(--ink-2)', lineHeight: 1.5, fontStyle: 'italic',
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            "{entry.hook}"
          </div>
        </div>
      )}

      {/* Expanded */}
      {expanded && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Label>Hook</Label>
            <div style={{
              background: 'var(--rose-light)', border: '1px solid var(--rose-border)',
              borderRadius: 9, padding: '9px 13px',
              fontSize: '0.84rem', color: 'var(--ink)', lineHeight: 1.55, fontStyle: 'italic',
            }}>"{entry.hook}"</div>
          </div>
          <div>
            <Label>{entry.kind === 'reel' ? 'Guion' : 'Texto imagen'}</Label>
            <div style={{
              background: 'var(--surface-2)', border: '1px solid var(--dust)',
              borderRadius: 9, padding: '10px 13px',
              fontSize: '0.82rem', color: 'var(--ink-2)', lineHeight: 1.6, whiteSpace: 'pre-line',
              fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
            }}>{entry.main_text}</div>
          </div>
          <div>
            <Label>Caption</Label>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--dust)',
              borderRadius: 9, padding: '10px 13px',
              fontSize: '0.8rem', color: 'var(--ink-2)', lineHeight: 1.6, whiteSpace: 'pre-line',
            }}>{entry.caption}</div>
          </div>
          <div>
            <Label>Hashtags</Label>
            <div style={{ fontSize: '0.75rem', color: 'var(--smoke)', lineHeight: 1.7 }}>
              {entry.hashtags.map(h => `#${h}`).join(' ')}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', paddingTop: 4, borderTop: '1px solid var(--dust)', marginTop: 2 }}>
            <button
              onClick={() => copy(`t-${entry.id}`, copyText)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: copiedKey === `t-${entry.id}` ? 'var(--success-light)' : 'var(--surface-2)',
                border: `1px solid ${copiedKey === `t-${entry.id}` ? 'var(--success)' : 'var(--dust)'}`,
                borderRadius: 999, padding: '6px 12px',
                fontSize: '0.73rem', fontWeight: 600,
                color: copiedKey === `t-${entry.id}` ? 'var(--success)' : 'var(--smoke)',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {copiedKey === `t-${entry.id}` ? <CheckCheck size={11} /> : <Copy size={11} />}
              Copiar texto
            </button>
            <button
              onClick={() => copy(`c-${entry.id}`, copyCaption)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: copiedKey === `c-${entry.id}` ? 'var(--success-light)' : 'var(--surface-2)',
                border: `1px solid ${copiedKey === `c-${entry.id}` ? 'var(--success)' : 'var(--dust)'}`,
                borderRadius: 999, padding: '6px 12px',
                fontSize: '0.73rem', fontWeight: 600,
                color: copiedKey === `c-${entry.id}` ? 'var(--success)' : 'var(--smoke)',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {copiedKey === `c-${entry.id}` ? <CheckCheck size={11} /> : <Copy size={11} />}
              Copiar caption
            </button>
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
            <button
              onClick={() => onUnfav(entry.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'none', border: '1px solid var(--gold-border)',
                borderRadius: 999, padding: '6px 11px',
                fontSize: '0.73rem', color: 'var(--gold)',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <BookmarkCheck size={11} /> Quitar de favoritos
            </button>
            <button
              onClick={() => onRemove(entry.id)}
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


// ── Page ───────────────────────────────────────────────────────────

export default function BancoPage() {
  const [search, setSearch] = useState('')
  const [reuseEntry, setReuseEntry] = useState<SavedEntry | null>(null)

  const { entries, remove, toggle } = useContentStorage({ favoritesOnly: true, search })

  // Count all favorites without search filter
  const { entries: allFavs } = useContentStorage({ favoritesOnly: true })
  const totalFavs = allFavs.length

  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>Banco de ideas</Eyebrow>
        <h1 style={{
          fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
          fontSize: 'clamp(1.6rem, 3vw, 2rem)',
          fontWeight: 400, color: 'var(--ink)',
          margin: '4px 0 6px', letterSpacing: '-0.01em',
        }}>
          Favoritos
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', margin: 0 }}>
          {totalFavs} {totalFavs === 1 ? 'idea guardada' : 'ideas guardadas'} como favorito
        </p>
      </div>

      {/* Search */}
      {totalFavs > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Search size={14} color="var(--smoke-2)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar en favoritos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, background: 'var(--surface)', border: '1px solid var(--dust)',
              borderRadius: 10, padding: '8px 14px',
              fontSize: '0.82rem', color: 'var(--ink)', outline: 'none',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--dust)' }}
          />
        </div>
      )}

      {/* Empty state */}
      {totalFavs === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 20px',
          background: 'var(--glass)', border: '1px dashed var(--dust-2)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <BookmarkCheck size={32} color="var(--smoke-2)" />
          </div>
          <p style={{
            fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
            fontSize: '1rem', color: 'var(--ink-2)', margin: '0 0 6px',
          }}>
            Tu banco de ideas está vacío
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--smoke)', margin: '0 0 16px' }}>
            Guarda contenido desde Plan de hoy o Crear desde link,<br />
            luego marca los mejores como favorito desde el Historial.
          </p>
          <a href="/historial" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
            borderRadius: 999, padding: '8px 16px',
            fontSize: '0.78rem', fontWeight: 600, color: 'var(--gold)', textDecoration: 'none',
          }}>
            Ver historial
          </a>
        </div>
      )}

      {/* No results */}
      {totalFavs > 0 && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px', background: 'var(--surface-2)', borderRadius: 12 }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', margin: 0 }}>
            Ningún favorito coincide con "{search}".
          </p>
        </div>
      )}

      {/* Entries */}
      {entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map(entry => (
            <FavCard
              key={entry.id}
              entry={entry}
              onUnfav={toggle}
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
