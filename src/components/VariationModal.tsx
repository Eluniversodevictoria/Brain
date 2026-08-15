'use client'

import { useState, useEffect } from 'react'
import {
  X, RefreshCw, Bookmark, BookmarkCheck, Copy, CheckCheck,
  Image as ImageIcon, Video, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Badge } from '@/components/ui'
import { THEME_LABELS, FORMAT_LABELS } from '@/types'
import type { SavedEntry } from '@/lib/storage/types'
import type { VariationResult } from '@/lib/mock/variation'

const STYLE_DESC: Record<string, string> = {
  STYLE_A: 'Glass · fondo translúcido, tipografía limpia',
  STYLE_B: 'Editorial · texto grande, fondo oscuro',
  STYLE_C: 'Cute Cards · colores pastel',
  STYLE_D: 'Minimalista · mucho espacio, una frase',
  STYLE_E: 'Emocional · textura cálida, durazno',
  STYLE_F: 'Bold · contraste fuerte, tipografía impactante',
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

function useCopy() {
  const [key, setKey] = useState<string | null>(null)
  function copy(k: string, text: string) {
    navigator.clipboard.writeText(text).catch(() => null)
    setKey(k)
    setTimeout(() => setKey(null), 1800)
  }
  return { copiedKey: key, copy }
}

// ── Field block ────────────────────────────────────────────────────

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--dust)',
        borderRadius: 9, padding: '10px 13px',
        fontSize: '0.82rem', color: 'var(--ink-2)', lineHeight: 1.6, whiteSpace: 'pre-line',
        fontFamily: mono ? "'Palatino Linotype', Palatino, Georgia, serif" : 'inherit',
      }}>
        {value}
      </div>
    </div>
  )
}

// ── Original preview (collapsed) ──────────────────────────────────

function OriginalPreview({ entry }: { entry: SavedEntry }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--dust)',
      borderRadius: 10, overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--smoke-2)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Original
          </span>
          <Badge variant="gold">{THEME_LABELS[entry.theme] ?? entry.theme}</Badge>
          <Badge variant="default">{FORMAT_LABELS[entry.format] ?? entry.format}</Badge>
        </div>
        {open ? <ChevronUp size={12} color="var(--smoke-2)" /> : <ChevronDown size={12} color="var(--smoke-2)" />}
      </button>
      {open && (
        <div style={{ padding: '0 14px 12px', borderTop: '1px solid var(--dust)' }}>
          <div style={{ paddingTop: 10, fontSize: '0.8rem', color: 'var(--smoke)', fontStyle: 'italic', lineHeight: 1.5 }}>
            "{entry.hook}"
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main modal ─────────────────────────────────────────────────────

interface Props {
  original: SavedEntry
  onClose: () => void
  onSaved: (newEntry: SavedEntry) => void
}

type ModalState = 'generating' | 'ready' | 'saved'

export function VariationModal({ original, onClose, onSaved }: Props) {
  const [state, setState] = useState<ModalState>('generating')
  const [variation, setVariation] = useState<VariationResult | null>(null)
  const [savedEntry, setSavedEntry] = useState<SavedEntry | null>(null)
  const { copiedKey, copy } = useCopy()

  useEffect(() => {
    let cancelled = false
    async function generate() {
      // Simulate generation delay
      await new Promise(r => setTimeout(r, 900))
      if (cancelled) return
      const { generateVariation } = await import('@/lib/mock/variation')
      setVariation(generateVariation(original))
      setState('ready')
    }
    generate()
    return () => { cancelled = true }
  }, [original])

  function handleRegenerate() {
    setState('generating')
    setVariation(null)
    // Re-trigger effect by forcing a new promise
    let cancelled = false
    async function generate() {
      await new Promise(r => setTimeout(r, 700))
      if (cancelled) return
      const { generateVariation } = await import('@/lib/mock/variation')
      // Slightly different seed: mutate original id
      const fakeMutated = { ...original, id: original.id + Date.now() }
      setVariation(generateVariation(fakeMutated))
      setState('ready')
    }
    generate()
    return () => { cancelled = true }
  }

  async function handleSave() {
    if (!variation) return
    const { saveEntry } = await import('@/lib/storage')
    const { saved } = await saveEntry({
      source: original.source,
      theme: original.theme,
      format: variation.format,
      objective: variation.objective,
      hook: variation.hook,
      main_text: variation.main_text,
      cta: variation.cta,
      caption: variation.caption,
      hashtags: variation.hashtags,
      visual_style: variation.visual_style,
      visual_style_label: variation.visual_style_label,
      kind: variation.kind === 'reel' ? 'reel' : 'image',
      related_to: original.id,
    })
    setSavedEntry(saved)
    setState('saved')
    onSaved(saved)
  }

  const copyAll = variation ? [
    `HOOK\n${variation.hook}`,
    '',
    `TEXTO\n${variation.main_text}`,
    '',
    `CTA\n${variation.cta}`,
    '',
    `CAPTION\n${variation.caption}`,
    '',
    variation.hashtags.map(h => `#${h}`).join(' '),
  ].join('\n') : ''

  const isReel     = variation?.kind === 'reel'
  const isCarousel = variation?.kind === 'carousel'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          zIndex: 200, backdropFilter: 'blur(3px)',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 201,
        background: 'var(--surface)',
        borderTop: '1px solid var(--dust)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '88vh',
        overflowY: 'auto',
        animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1) forwards',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--dust-2)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px 12px',
          borderBottom: '1px solid var(--dust)',
        }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--smoke-2)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>
              Crear variación
            </div>
            <div style={{
              fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
              fontSize: '1.1rem', color: 'var(--ink)', fontWeight: 400,
            }}>
              {THEME_LABELS[original.theme] ?? original.theme}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--smoke-2)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Original reference */}
          <OriginalPreview entry={original} />

          {/* Generating state */}
          {state === 'generating' && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              padding: '40px 20px', textAlign: 'center',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                border: '2px solid var(--dust)', borderTopColor: 'var(--gold)',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ fontSize: '0.84rem', color: 'var(--smoke)', margin: 0 }}>
                Generando variación con diferente ángulo...
              </p>
            </div>
          )}

          {/* Variation result */}
          {state === 'ready' && variation && (
            <>
              {/* Diff badges */}
              <div style={{
                display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
                padding: '10px 12px',
                background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
                borderRadius: 10, fontSize: '0.74rem',
              }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700, marginRight: 2 }}>Cambios:</span>
                {variation.format !== original.format && (
                  <span style={{ background: 'var(--surface)', border: '1px solid var(--dust)', borderRadius: 999, padding: '1px 8px', color: 'var(--smoke)', fontSize: '0.7rem' }}>
                    Formato → {FORMAT_LABELS[variation.format] ?? variation.format}
                  </span>
                )}
                {variation.visual_style !== original.visual_style && (
                  <span style={{ background: 'var(--surface)', border: '1px solid var(--dust)', borderRadius: 999, padding: '1px 8px', color: 'var(--smoke)', fontSize: '0.7rem' }}>
                    Estilo → {variation.visual_style}
                  </span>
                )}
                {variation.kind !== (original.kind ?? 'reel') && (
                  <span style={{ background: 'var(--surface)', border: '1px solid var(--dust)', borderRadius: 999, padding: '1px 8px', color: 'var(--smoke)', fontSize: '0.7rem' }}>
                    Tipo → {{ reel: 'Reel', carousel: 'Carrusel', post: 'Imagen' }[variation.kind]}
                  </span>
                )}
                <span style={{ background: 'var(--surface)', border: '1px solid var(--dust)', borderRadius: 999, padding: '1px 8px', color: 'var(--smoke)', fontSize: '0.7rem' }}>
                  Hook · Texto · Caption · CTA
                </span>
              </div>

              {/* Format + style */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: isReel ? 'var(--gold-light)' : isCarousel ? 'var(--surface-2)' : 'var(--rose-light)',
                  border: `1px solid ${isReel ? 'var(--gold-border)' : isCarousel ? 'var(--dust)' : 'var(--rose-border)'}`,
                  borderRadius: 999, padding: '3px 10px',
                  fontSize: '0.72rem', fontWeight: 600,
                  color: isReel ? 'var(--gold)' : isCarousel ? 'var(--smoke)' : 'var(--rose)',
                }}>
                  {isReel ? <Video size={11} /> : <ImageIcon size={11} />}
                  {{ reel: 'Reel', carousel: 'Carrusel', post: 'Imagen' }[variation.kind]}
                  {isCarousel && variation.slides_count != null && (
                    <span style={{ opacity: 0.7 }}>({variation.slides_count} slides)</span>
                  )}
                </div>
                <Badge variant="default">{FORMAT_LABELS[variation.format] ?? variation.format}</Badge>
                <div style={{
                  background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
                  borderRadius: 7, padding: '2px 9px',
                  fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)',
                }}>
                  {variation.visual_style}
                </div>
                <span style={{ fontSize: '0.73rem', color: 'var(--smoke)' }}>
                  {STYLE_DESC[variation.visual_style] ?? variation.visual_style_label}
                </span>
              </div>

              {/* Hook */}
              <div>
                <Label>Hook</Label>
                <div style={{
                  background: 'var(--rose-light)', border: '1px solid var(--rose-border)',
                  borderRadius: 10, padding: '11px 14px',
                  fontSize: '0.87rem', color: 'var(--ink)', lineHeight: 1.55, fontStyle: 'italic',
                }}>
                  "{variation.hook}"
                </div>
              </div>

              {/* Main text */}
              <Field
                label={isReel ? 'Guion / texto en pantalla' : isCarousel ? 'Portada (slide 1)' : 'Texto imagen'}
                value={variation.main_text}
                mono
              />
              {isCarousel && (
                <div style={{ fontSize: '0.72rem', color: 'var(--smoke-2)', fontStyle: 'italic', marginTop: -8 }}>
                  Carrusel de {variation.slides_count} slides — muestra la portada. Slides completos disponibles al generar en /crear.
                </div>
              )}

              {/* CTA */}
              <Field label="CTA" value={variation.cta} />

              {/* Caption */}
              <Field label="Caption" value={variation.caption} />

              {/* Hashtags */}
              <div>
                <Label>Hashtags</Label>
                <div style={{ fontSize: '0.76rem', color: 'var(--smoke)', lineHeight: 1.7 }}>
                  {variation.hashtags.map(h => `#${h}`).join(' ')}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 4, borderTop: '1px solid var(--dust)', marginTop: 2 }}>
                {/* Copy all */}
                <button
                  onClick={() => copy('all', copyAll)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: copiedKey === 'all' ? 'var(--success-light)' : 'var(--surface-2)',
                    border: `1px solid ${copiedKey === 'all' ? 'var(--success)' : 'var(--dust)'}`,
                    borderRadius: 999, padding: '8px 14px',
                    fontSize: '0.78rem', fontWeight: 600,
                    color: copiedKey === 'all' ? 'var(--success)' : 'var(--smoke)',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {copiedKey === 'all' ? <CheckCheck size={12} /> : <Copy size={12} />}
                  {copiedKey === 'all' ? 'Copiado' : 'Copiar todo'}
                </button>

                {/* Regenerate */}
                <button
                  onClick={handleRegenerate}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'none', border: '1px solid var(--dust)',
                    borderRadius: 999, padding: '8px 14px',
                    fontSize: '0.78rem', color: 'var(--smoke)',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  <RefreshCw size={12} /> Otra variación
                </button>

                {/* Save */}
                <button
                  onClick={handleSave}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
                    borderRadius: 999, padding: '8px 16px',
                    fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold)',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  <Bookmark size={12} /> Guardar variación
                </button>
              </div>
            </>
          )}

          {/* Saved confirmation */}
          {state === 'saved' && savedEntry && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              padding: '32px 20px', textAlign: 'center',
            }}>
              <BookmarkCheck size={28} color="var(--gold)" />
              <p style={{
                fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
                fontSize: '1rem', color: 'var(--ink)', margin: 0,
              }}>
                Variación guardada
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--smoke)', margin: 0 }}>
                Aparece en tu Historial vinculada al contenido original.
              </p>
              <button
                onClick={onClose}
                style={{
                  background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
                  borderRadius: 999, padding: '8px 20px',
                  fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold)', cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
