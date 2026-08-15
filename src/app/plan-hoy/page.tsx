'use client'

import { useState, useCallback } from 'react'
import {
  Sparkles, Copy, CheckCheck, Link2,
  Image as ImageIcon, Video, RefreshCw, ChevronDown, ChevronUp,
  Bookmark, BookmarkCheck, AlertTriangle,
} from 'lucide-react'
import { Button, Eyebrow, Card, Badge } from '@/components/ui'
import { THEME_LABELS, FORMAT_LABELS, IMAGE_TEXT_LENGTH_LABELS } from '@/types'
import { useStrategy } from '@/lib/store'
import { useContentStorage } from '@/hooks/useContentStorage'
import type { DailyPost } from '@/lib/mock/daily-plan'

// ── Constants ──────────────────────────────────────────────────────

type PageState = 'idle' | 'loading' | 'done'

const LOADING_MESSAGES = [
  'Analizando inventario del día...',
  'Calculando variedad temática...',
  'Distribuyendo formatos...',
  'Armando tu plan de hoy...',
]

function buildPlanSummary(posts: DailyPost[]): string {
  const imagenes = posts.filter(p => p.content.kind === 'post').length
  const reels    = posts.filter(p => p.content.kind === 'reel').length
  const carousel = posts.filter(p => p.content.kind === 'carousel').length
  const parts: string[] = []
  if (imagenes > 0) parts.push(`${imagenes} ${imagenes === 1 ? 'imagen' : 'imágenes'}`)
  if (reels    > 0) parts.push(`${reels} ${reels === 1 ? 'reel' : 'reels'}`)
  if (carousel > 0) parts.push(`${carousel} ${carousel === 1 ? 'carrusel' : 'carruseles'}`)
  return parts.join(' · ')
}

const STYLE_DESC: Record<string, string> = {
  STYLE_A: 'Glass · fondo translúcido, tipografía limpia',
  STYLE_B: 'Editorial · texto grande, fondo oscuro',
  STYLE_C: 'Cute Cards · colores pastel',
  STYLE_D: 'Minimalista · mucho espacio, una frase',
  STYLE_E: 'Emocional · textura cálida, durazno',
  STYLE_F: 'Bold · contraste fuerte, tipografía impactante',
}

// ── Copy hook ──────────────────────────────────────────────────────

function useCopy() {
  const [key, setKey] = useState<string | null>(null)
  function copy(k: string, text: string) {
    navigator.clipboard.writeText(text).catch(() => null)
    setKey(k)
    setTimeout(() => setKey(null), 1800)
  }
  return { copiedKey: key, copy }
}

// ── CopyButton ─────────────────────────────────────────────────────

function CopyBtn({ label, text, id }: { label: string; text: string; id: string }) {
  const { copiedKey, copy } = useCopy()
  const copied = copiedKey === id
  return (
    <button
      onClick={() => copy(id, text)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: copied ? 'var(--success-light)' : 'var(--surface-2)',
        border: `1px solid ${copied ? 'var(--success)' : 'var(--dust)'}`,
        borderRadius: 999, padding: '7px 14px',
        fontSize: '0.76rem', fontWeight: 600,
        color: copied ? 'var(--success)' : 'var(--smoke)',
        cursor: 'pointer', transition: 'all 160ms',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
      {copied ? 'Copiado' : label}
    </button>
  )
}

// ── Section label ──────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.6rem', color: 'var(--smoke-2)',
      letterSpacing: '0.1em', textTransform: 'uppercase',
      fontWeight: 700, marginBottom: 5,
    }}>
      {children}
    </div>
  )
}

// ── PostCard ───────────────────────────────────────────────────────

function PostCard({ post, refLinks, onRefChange, onSave, savedId, saveWarning }: {
  post: DailyPost
  refLinks: Record<number, string>
  onRefChange: (i: number, v: string) => void
  onSave: (post: DailyPost, refLink: string) => void
  savedId: string | null
  saveWarning: string | null
}) {
  const [hashExpanded, setHashExpanded] = useState(false)
  const { idea, content, kind, index } = post
  const isImage = kind === 'image'

  const isReel = content.kind === 'reel'
  const mainText  = content.kind === 'post'     ? content.image_text
                  : content.kind === 'carousel' ? content.cover_text
                  :                               content.script
  const textLabel = content.kind === 'post'
    ? `Texto imagen · ${IMAGE_TEXT_LENGTH_LABELS[content.image_text_length]}`
    : content.kind === 'carousel' ? 'Portada (slide 1)'
    : 'Guion / Voice Over'

  const hashtags = content.hashtags.map(h => `#${h}`).join(' ')

  const copyText = [
    `HOOK\n${idea.hook_seed}`,
    '',
    `${textLabel.toUpperCase()}\n${mainText}`,
    ...(isReel && content.on_screen_text ? ['', `TEXTO EN PANTALLA\n${content.on_screen_text}`] : []),
    '',
    `CTA\n${content.cta}`,
  ].join('\n')

  const copyCaption = [content.caption, '', hashtags].join('\n')

  const copyAll = [
    `PUBLICACIÓN ${index} — ${THEME_LABELS[idea.theme] ?? idea.theme} · ${FORMAT_LABELS[idea.format] ?? idea.format}`,
    `Estilo visual: ${content.visual_style} — ${STYLE_DESC[content.visual_style] ?? ''}`,
    '',
    `HOOK\n${idea.hook_seed}`,
    '',
    `${textLabel.toUpperCase()}\n${mainText}`,
    ...(isReel && content.on_screen_text ? ['', `TEXTO EN PANTALLA\n${content.on_screen_text}`] : []),
    '',
    `CTA\n${content.cta}`,
    '',
    `CAPTION\n${content.caption}`,
    '',
    hashtags,
    ...(refLinks[index] ? [`\nReferencia: ${refLinks[index]}`] : []),
  ].join('\n')

  const kindColor  = isImage ? 'var(--rose)' : 'var(--gold)'
  const kindBg     = isImage ? 'var(--rose-light)' : 'var(--gold-light)'
  const kindBorder = isImage ? 'var(--rose-border)' : 'var(--gold-border)'

  return (
    <Card style={{ marginBottom: 0 }}>
      {/* Header */}
      <div style={{
        padding: '13px 18px 11px',
        borderBottom: '1px solid var(--dust)',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: kindBg, border: `1px solid ${kindBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {isImage
            ? <ImageIcon size={12} color={kindColor} strokeWidth={2} />
            : <Video size={12} color={kindColor} strokeWidth={2} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.58rem', color: 'var(--smoke-2)', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 700 }}>
            Publicación {index}
          </div>
          <div style={{ fontSize: '0.77rem', color: kindColor, fontWeight: 700 }}>
            {isImage ? 'Imagen' : 'Reel / Video'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <Badge variant="gold">{THEME_LABELS[idea.theme] ?? idea.theme}</Badge>
          <Badge variant="default">{FORMAT_LABELS[idea.format] ?? idea.format}</Badge>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Visual style */}
        <div>
          <Label>Estilo visual recomendado</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
              borderRadius: 7, padding: '2px 9px',
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)',
            }}>
              {content.visual_style}
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--smoke)' }}>
              {STYLE_DESC[content.visual_style] ?? content.visual_style_label}
            </span>
          </div>
        </div>

        {/* Hook */}
        <div>
          <Label>Hook</Label>
          <div style={{
            background: 'var(--rose-light)', border: '1px solid var(--rose-border)',
            borderRadius: 10, padding: '10px 14px',
            fontSize: '0.87rem', color: 'var(--ink)', lineHeight: 1.55, fontStyle: 'italic',
          }}>
            "{idea.hook_seed}"
          </div>
        </div>

        {/* Main text — script / voice over / image text */}
        <div>
          <Label>{textLabel}</Label>
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--dust)',
            borderRadius: 10, padding: '11px 14px',
            fontSize: '0.84rem', color: 'var(--ink-2)',
            lineHeight: 1.65, whiteSpace: 'pre-line',
            fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
          }}>
            {mainText}
          </div>
        </div>

        {/* Texto en pantalla — only for reels */}
        {isReel && content.kind === 'reel' && content.on_screen_text && (
          <div>
            <Label>Texto en pantalla</Label>
            <div style={{
              background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
              borderRadius: 10, padding: '11px 14px',
              fontSize: '0.84rem', color: 'var(--ink)',
              lineHeight: 1.6, whiteSpace: 'pre-line',
              fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
            }}>
              {content.on_screen_text}
            </div>
          </div>
        )}

        {/* CTA */}
        <div>
          <Label>CTA</Label>
          <div style={{
            fontSize: '0.83rem', color: 'var(--smoke)', lineHeight: 1.5,
            background: 'var(--surface)', border: '1px solid var(--dust)',
            borderRadius: 10, padding: '9px 14px',
          }}>
            {content.cta}
          </div>
        </div>

        {/* Caption */}
        <div>
          <Label>Caption</Label>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--dust)',
            borderRadius: 10, padding: '11px 14px',
            fontSize: '0.82rem', color: 'var(--ink-2)', lineHeight: 1.65, whiteSpace: 'pre-line',
          }}>
            {content.caption}
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <button
            onClick={() => setHashExpanded(e => !e)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <Label>Hashtags</Label>
            {hashExpanded ? <ChevronUp size={11} color="var(--smoke-2)" style={{ marginTop: -4 }} /> : <ChevronDown size={11} color="var(--smoke-2)" style={{ marginTop: -4 }} />}
          </button>
          {hashExpanded && (
            <div style={{ fontSize: '0.78rem', color: 'var(--smoke)', lineHeight: 1.7 }}>
              {hashtags}
            </div>
          )}
        </div>

        {/* Reference link */}
        <div>
          <Label>Link de referencia · solo inspiración</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Link2 size={13} color="var(--smoke-2)" style={{ flexShrink: 0 }} />
            <input
              type="url"
              placeholder="Pega aquí un link de inspiración..."
              value={refLinks[index] ?? ''}
              onChange={e => onRefChange(index, e.target.value)}
              style={{
                flex: 1, background: 'var(--surface)', border: '1px solid var(--dust)',
                borderRadius: 10, padding: '7px 12px',
                fontSize: '0.8rem', color: 'var(--ink)', outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--dust)' }}
            />
          </div>
        </div>

        {/* Similarity warning */}
        {saveWarning && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 7,
            background: '#fff8e6', border: '1px solid #f0c040',
            borderRadius: 9, padding: '8px 12px',
            fontSize: '0.76rem', color: '#7a5c00',
          }}>
            <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{saveWarning}</span>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', paddingTop: 2 }}>
          <CopyBtn label="Copiar texto" text={copyText} id={`text-${index}`} />
          <CopyBtn label="Copiar caption" text={copyCaption} id={`caption-${index}`} />
          <CopyBtn label="Copiar todo" text={copyAll} id={`all-${index}`} />
          <button
            onClick={() => onSave(post, refLinks[index] ?? '')}
            disabled={!!savedId}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: savedId ? 'var(--gold-light)' : 'var(--surface-2)',
              border: `1px solid ${savedId ? 'var(--gold-border)' : 'var(--dust)'}`,
              borderRadius: 999, padding: '7px 14px',
              fontSize: '0.76rem', fontWeight: 600,
              color: savedId ? 'var(--gold)' : 'var(--smoke)',
              cursor: savedId ? 'default' : 'pointer',
              transition: 'all 160ms', whiteSpace: 'nowrap',
            }}
          >
            {savedId
              ? <><BookmarkCheck size={12} /> Guardado</>
              : <><Bookmark size={12} /> Guardar</>
            }
          </button>
        </div>
      </div>
    </Card>
  )
}

// ── Page ───────────────────────────────────────────────────────────

export default function PlanHoyPage() {
  const { strategy } = useStrategy()
  const [pageState, setPageState] = useState<PageState>('idle')
  const [posts, setPosts] = useState<DailyPost[]>([])
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [refLinks, setRefLinks] = useState<Record<number, string>>({})
  const [savedIds, setSavedIds] = useState<Record<number, string>>({})
  const [saveWarnings, setSaveWarnings] = useState<Record<number, string>>({})

  const { save, allEntries } = useContentStorage()

  async function generate() {
    setPageState('loading')
    setLoadingMsg(0)
    setPosts([])
    setRefLinks({})
    setSavedIds({})
    setSaveWarnings({})
    for (let i = 0; i < LOADING_MESSAGES.length; i++) {
      await new Promise(r => setTimeout(r, 270))
      setLoadingMsg(i)
    }
    await new Promise(r => setTimeout(r, 350))
    const { runDailyPlan } = await import('@/lib/mock/daily-plan')
    setPosts(runDailyPlan(strategy, allEntries))
    setPageState('done')
  }

  const handleSave = useCallback(async (post: DailyPost, refLink: string) => {
    const { idea, content, kind } = post
    const { saved, warning } = await save({
      source: 'plan-hoy',
      theme: idea.theme,
      format: idea.format,
      objective: idea.objective,
      hook: idea.hook_seed,
      main_text: content.kind === 'post'     ? content.image_text
               : content.kind === 'carousel' ? content.cover_text
               :                               content.on_screen_text,
      cta: content.cta,
      caption: content.caption,
      hashtags: content.hashtags,
      visual_style: content.visual_style,
      visual_style_label: content.visual_style_label,
      kind: content.kind,
      image_text_length: content.kind === 'post' ? content.image_text_length : undefined,
      reference_link: refLink || undefined,
    })
    setSavedIds(prev => ({ ...prev, [post.index]: saved.id }))
    if (warning) {
      const msg = warning.reason === 'same_theme_format'
        ? `Ya tienes contenido guardado de ${THEME_LABELS[idea.theme]} en formato ${FORMAT_LABELS[idea.format]}. Guardado de todos modos.`
        : 'El hook es muy similar a uno que ya guardaste. Guardado de todos modos.'
      setSaveWarnings(prev => ({ ...prev, [post.index]: msg }))
    }
  }, [save])

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>Plan de contenido</Eyebrow>
        <h1 style={{
          fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
          fontSize: 'clamp(1.6rem, 3vw, 2rem)',
          fontWeight: 400, color: 'var(--ink)',
          margin: '4px 0 6px', letterSpacing: '-0.01em',
        }}>
          Plan de hoy
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', margin: 0, textTransform: 'capitalize' }}>
          {today}{posts.length > 0 ? ` · ${buildPlanSummary(posts)}` : ''}
        </p>
      </div>

      {/* Generate button */}
      <div style={{ marginBottom: 24 }}>
        {pageState === 'idle' ? (
          <Button onClick={generate} size="lg">
            <Sparkles size={14} style={{ marginRight: 6 }} />
            Generar plan de hoy
          </Button>
        ) : (
          <button
            onClick={generate}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px solid var(--dust)',
              borderRadius: 999, padding: '8px 16px',
              fontSize: '0.8rem', color: 'var(--smoke)', cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} /> Regenerar plan
          </button>
        )}
      </div>

      {/* Loading */}
      {pageState === 'loading' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 12, padding: '48px 20px', textAlign: 'center',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            border: '2px solid var(--dust)', borderTopColor: 'var(--gold)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', margin: 0 }}>
            {LOADING_MESSAGES[loadingMsg]}
          </p>
        </div>
      )}

      {/* Posts */}
      {pageState === 'done' && posts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Day summary */}
          <div style={{
            display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
            padding: '10px 14px',
            background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
            borderRadius: 12, fontSize: '0.8rem', color: 'var(--ink-2)',
          }}>
            <span style={{ fontWeight: 700, color: 'var(--gold)' }}>Hoy publicas:</span>
            {posts.map((p, i) => (
              <span key={p.index} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {p.kind === 'image'
                  ? <ImageIcon size={11} color="var(--rose)" />
                  : <Video size={11} color="var(--gold)" />}
                {THEME_LABELS[p.idea.theme] ?? p.idea.theme}
                {i < posts.length - 1 && <span style={{ color: 'var(--smoke-2)' }}>·</span>}
              </span>
            ))}
          </div>

          {posts.map(post => (
            <PostCard
              key={post.index}
              post={post}
              refLinks={refLinks}
              onRefChange={(i, v) => setRefLinks(prev => ({ ...prev, [i]: v }))}
              onSave={handleSave}
              savedId={savedIds[post.index] ?? null}
              saveWarning={saveWarnings[post.index] ?? null}
            />
          ))}
        </div>
      )}

      {/* Idle empty state */}
      {pageState === 'idle' && (
        <div style={{
          textAlign: 'center', padding: '48px 20px',
          background: 'var(--glass)', border: '1px dashed var(--dust-2)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>✦</div>
          <p style={{
            fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
            fontSize: '1rem', color: 'var(--ink-2)', margin: '0 0 6px',
          }}>
            Tu plan de contenido diario
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--smoke)', margin: 0 }}>
            Hook · texto · caption · CTA · hashtags<br />
            para tus 4 publicaciones de hoy.
          </p>
        </div>
      )}
    </main>
  )
}
