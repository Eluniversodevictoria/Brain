'use client'

import { useState, useCallback } from 'react'
import {
  Link2, Sparkles, Copy, CheckCheck, ChevronDown, ChevronUp,
  RefreshCw, AlertCircle, ExternalLink, Bookmark, BookmarkCheck, AlertTriangle,
  FileText,
} from 'lucide-react'
import { Button, Eyebrow, Card, Badge } from '@/components/ui'
import { THEME_LABELS, FORMAT_LABELS, VISUAL_STYLE_LABELS } from '@/types'
import type { InspirationResult, InspiredPlatform } from '@/lib/mock/url-inspiration'
import { useContentStorage } from '@/hooks/useContentStorage'

// ── Types ──────────────────────────────────────────────────────────

type PageState = 'idle' | 'analyzing' | 'done' | 'error'
type InputMode = 'url' | 'text'

// ── Constants ──────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  'Detectando plataforma...',
  'Extrayendo contenido de referencia...',
  'Identificando tema y mecanismo...',
  'Generando versión original para Victoria...',
]

const STYLE_DESC: Record<string, string> = {
  STYLE_A: 'Glass · fondo translúcido, tipografía limpia',
  STYLE_B: 'Editorial · texto grande, fondo oscuro',
  STYLE_C: 'Cute Cards · colores pastel',
  STYLE_D: 'Minimalista · mucho espacio, una frase',
  STYLE_E: 'Emocional · textura cálida, durazno',
  STYLE_F: 'Bold · contraste fuerte, tipografía impactante',
}

const PLATFORM_CONFIG: Record<InspiredPlatform, { label: string; color: string; bg: string; border: string }> = {
  instagram: { label: 'Instagram', color: '#7b2fa8', bg: '#f5eefb', border: '#d4a8f0' },
  tiktok:    { label: 'TikTok',    color: '#1a56db', bg: '#e8f0ff', border: '#a8c4f8' },
  pinterest: { label: 'Pinterest', color: '#b91c1c', bg: '#fff0f0', border: '#f8a8a8' },
  facebook:  { label: 'Facebook',  color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' },
  web:       { label: 'Web',       color: 'var(--smoke)', bg: 'var(--surface-2)', border: 'var(--dust)' },
}

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

function CopyBtn({ id, label, text }: { id: string; label: string; text: string }) {
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
        cursor: 'pointer', transition: 'all 160ms', whiteSpace: 'nowrap',
      }}
    >
      {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
      {copied ? 'Copiado' : label}
    </button>
  )
}

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

function AnalysisRow({ label, value }: { label: string; value: string | string[] }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--smoke-2)', fontWeight: 600, minWidth: 110, flexShrink: 0, paddingTop: 1 }}>
        {label}
      </span>
      {Array.isArray(value) ? (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {value.map((v, i) => (
            <li key={i} style={{ display: 'flex', gap: 6, fontSize: '0.8rem', color: 'var(--ink-2)', lineHeight: 1.45 }}>
              <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }}>·</span>
              {v}
            </li>
          ))}
        </ul>
      ) : (
        <span style={{ fontSize: '0.8rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>{value}</span>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────

export default function InspirarPage() {
  const [inputMode, setInputMode] = useState<InputMode>('url')
  const [url, setUrl] = useState('')
  const [textInput, setTextInput] = useState('')
  const [pageState, setPageState] = useState<PageState>('idle')
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [result, setResult] = useState<InspirationResult | null>(null)
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [saveWarning, setSaveWarning] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [needsCaption, setNeedsCaption] = useState(false)
  const [captionInput, setCaptionInput] = useState('')

  const { save } = useContentStorage()

  async function handleAnalyzeCaption() {
    if (!captionInput.trim()) return
    // Re-use text mode with the pasted caption
    const prev = inputMode
    setPageState('analyzing')
    setLoadingMsg(0)
    setResult(null)
    setErrorMsg(null)
    setNeedsCaption(false)
    try {
      const res = await fetch('/api/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: captionInput.trim() }),
      })
      if (!res.ok) { setPageState('error'); return }
      const data = await res.json()
      const wordCount = (data.content.main_text?.split(' ').length ?? 0)
      const textLength: 'short' | 'medium' | 'long' =
        wordCount <= 30 ? 'short' : wordCount <= 70 ? 'medium' : 'long'
      setResult({
        analysis: {
          platform: prev === 'url' ? (() => {
            const u = url.toLowerCase()
            if (u.includes('instagram')) return 'instagram'
            if (u.includes('tiktok')) return 'tiktok'
            return 'web'
          })() : 'web',
          url: url || '',
          creator: null,
          format_detected: data.analysis?.estructura ?? '',
          tema: data.analysis?.tema ?? '',
          idea_principal: data.analysis?.idea_principal ?? '',
          hook_original: data.analysis?.hook_original ?? '',
          estructura: data.analysis?.estructura ? [data.analysis.estructura] : [],
          tono: data.analysis?.tono ?? '',
          mecanismo: data.analysis?.mecanismo ?? '',
          macro_theme: data.content.macro_theme,
          format: data.content.format,
          objective: data.content.objective,
          is_mock: false as any,
        },
        content: {
          kind: 'reel',
          strategy: { objective: '', pain_used: '', private_thought: '', desire: '', primary_emotion: '', psychological_mechanism: '', angle: '' },
          hook: data.content.hook,
          script: data.content.main_text,
          on_screen_text: data.content.on_screen_text ?? '',
          visual_direction: '',
          ai_video_prompt: '',
          caption: data.content.caption,
          cta: data.content.cta,
          hashtags: data.content.hashtags ?? [],
          visual_style: data.content.visual_style ?? 'STYLE_A',
          visual_style_label: data.content.visual_style_label ?? '',
          image_text_length: textLength,
        } as any,
      })
      setPageState('done')
    } catch {
      setPageState('error')
    }
  }

  async function handleAnalyze() {
    const isUrl = inputMode === 'url'
    const trimmed = isUrl ? url.trim() : textInput.trim()
    if (!trimmed) return

    setPageState('analyzing')
    setLoadingMsg(0)
    setResult(null)
    setErrorMsg(null)
    setNeedsCaption(false)

    // Start loading animation in parallel with API call
    const animDone = (async () => {
      for (let i = 0; i < LOADING_MESSAGES.length; i++) {
        await new Promise(r => setTimeout(r, 500))
        setLoadingMsg(i)
      }
    })()

    try {
      const body = isUrl ? { url: trimmed } : { content: trimmed }
      const res = await fetch('/api/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      await animDone

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 422) {
          setErrorMsg(err.error ?? 'No se pudo leer este URL. Pega el texto directamente.')
          setNeedsCaption(err.needsCaption === true)
          setPageState('error')
          return
        }
        console.error('API error:', err)
        setPageState('error')
        return
      }

      const data = await res.json()

      // Map API response to InspirationResult shape
      const platform: InspiredPlatform = isUrl
        ? (() => {
            const u = trimmed.toLowerCase()
            if (u.includes('instagram')) return 'instagram'
            if (u.includes('tiktok')) return 'tiktok'
            if (u.includes('pinterest')) return 'pinterest'
            if (u.includes('facebook')) return 'facebook'
            return 'web'
          })()
        : 'web'

      const wordCount = (data.content.main_text?.split(' ').length ?? 0)
      const textLength: 'short' | 'medium' | 'long' =
        wordCount <= 30 ? 'short' : wordCount <= 70 ? 'medium' : 'long'

      const mapped: InspirationResult = {
        analysis: {
          platform,
          url: isUrl ? trimmed : 'https://texto-pegado.com',
          tema: data.analysis.tema ?? '',
          mecanismo: data.analysis.mecanismo ?? '',
          idea_principal: data.analysis.idea_principal ?? '',
          hook_original: data.analysis.hook_original ?? '',
          estructura: data.analysis.estructura ?? '',
          tono: data.analysis.tono ?? '',
          macro_theme: data.content.macro_theme,
          format: data.content.format,
          objective: data.content.objective,
          creator: null,
          format_detected: data.content.format,
          is_mock: true,
        },
        content: {
          kind: 'reel' as const,
          hook: data.content.hook,
          script: data.content.main_text,
          on_screen_text: data.content.on_screen_text ?? '',
          visual_direction: data.content.visual_style_label ?? '',
          ai_video_prompt: '',
          cta: data.content.cta,
          caption: data.content.caption,
          hashtags: data.content.hashtags ?? [],
          visual_style: data.content.visual_style,
          visual_style_label: data.content.visual_style_label,
          strategy: {
            objective: data.content.objective,
            pain_used: '',
            private_thought: '',
            desire: '',
            primary_emotion: '',
            psychological_mechanism: data.analysis.mecanismo ?? '',
            angle: '',
          },
        },
      }

      setResult(mapped)
      setPageState('done')
      setAnalysisOpen(false)
    } catch (err) {
      console.error('Analizar fetch error:', err)
      setPageState('error')
    }
  }

  function handleReset() {
    setUrl('')
    setTextInput('')
    setResult(null)
    setPageState('idle')
    setSavedId(null)
    setSaveWarning(null)
  }

  const handleSave = useCallback(async () => {
    if (!result) return
    const { analysis, content } = result
    // inspirar always generates ReelContent from API
    const hook = content.kind === 'reel' ? content.hook : ''
    const main_text = content.kind === 'reel' ? content.script : ''
    const { saved, warning } = await save({
      source: 'inspirar',
      theme: analysis.macro_theme,
      format: analysis.format,
      objective: analysis.objective,
      hook,
      main_text,
      cta: content.cta,
      caption: content.caption,
      hashtags: content.hashtags,
      visual_style: content.visual_style,
      visual_style_label: content.visual_style_label,
      kind: content.kind,
      inspiration_platform: analysis.platform,
      inspiration_url: analysis.url,
      inspiration_tema: analysis.tema,
      inspiration_mecanismo: analysis.mecanismo,
    })
    setSavedId(saved.id)
    if (warning) {
      const msg = warning.reason === 'same_theme_format'
        ? `Ya tienes contenido guardado de ${THEME_LABELS[analysis.macro_theme]} en ese formato. Guardado de todos modos.`
        : 'El hook es muy similar a uno que ya guardaste. Guardado de todos modos.'
      setSaveWarning(msg)
    }
  }, [result, save])

  // Build copy strings from result — inspirar always produces reel content
  const reelContent = result?.content.kind === 'reel' ? result.content : null
  const hook    = reelContent?.hook ?? ''
  const mainTxt = reelContent?.script ?? ''

  const onScreenTxt = reelContent?.on_screen_text ?? ''
  const copyText = result ? [
    `HOOK\n${hook}`,
    '',
    `GUION / VOICE OVER\n${mainTxt}`,
    ...(onScreenTxt ? ['', `TEXTO EN PANTALLA\n${onScreenTxt}`] : []),
    '',
    `CTA\n${result.content.cta}`,
  ].join('\n') : ''

  const copyCaption = result ? [
    result.content.caption,
    '',
    result.content.hashtags.map(h => `#${h}`).join(' '),
  ].join('\n') : ''

  const copyAll = result ? [
    `TEMA: ${THEME_LABELS[result.analysis.macro_theme] ?? result.analysis.macro_theme}`,
    `FORMATO: ${FORMAT_LABELS[result.analysis.format] ?? result.analysis.format}`,
    `ESTILO VISUAL: ${result.content.visual_style} — ${STYLE_DESC[result.content.visual_style] ?? ''}`,
    '',
    `HOOK\n${hook}`,
    '',
    `GUION / VOICE OVER\n${mainTxt}`,
    ...(onScreenTxt ? ['', `TEXTO EN PANTALLA\n${onScreenTxt}`] : []),
    '',
    `CTA\n${result.content.cta}`,
    '',
    `CAPTION\n${result.content.caption}`,
    '',
    result.content.hashtags.map(h => `#${h}`).join(' '),
  ].join('\n') : ''

  const platformCfg = result ? PLATFORM_CONFIG[result.analysis.platform] : null

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>Crear contenido</Eyebrow>
        <h1 style={{
          fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
          fontSize: 'clamp(1.6rem, 3vw, 2rem)',
          fontWeight: 400, color: 'var(--ink)',
          margin: '4px 0 6px', letterSpacing: '-0.01em',
        }}>
          Crear desde un link
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', margin: 0 }}>
          Pega un link de Instagram, TikTok, Pinterest, Facebook o cualquier web.<br />
          La app extrae el mecanismo y genera una versión original para Victoria.
        </p>
      </div>

      {/* Input card */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 18px' }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--surface-2)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
            {([
              { mode: 'url' as InputMode, icon: Link2, label: 'Link' },
              { mode: 'text' as InputMode, icon: FileText, label: 'Pegar texto' },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => { setInputMode(mode); setPageState('idle'); setResult(null) }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 600, transition: 'all 120ms',
                  background: inputMode === mode ? 'var(--surface)' : 'transparent',
                  color: inputMode === mode ? 'var(--ink)' : 'var(--smoke)',
                  boxShadow: inputMode === mode ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          {inputMode === 'url' ? (
            <>
              <Label>Link de referencia</Label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <Link2 size={16} color="var(--smoke-2)" style={{ flexShrink: 0 }} />
                <input
                  type="url"
                  placeholder="https://www.instagram.com/p/... o cualquier URL"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && pageState !== 'analyzing') handleAnalyze() }}
                  disabled={pageState === 'analyzing'}
                  style={{
                    flex: 1, background: 'var(--surface)',
                    border: '1px solid var(--dust)', borderRadius: 10,
                    padding: '9px 14px', fontSize: '0.85rem', color: 'var(--ink)',
                    outline: 'none',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--dust)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {(['instagram', 'tiktok', 'pinterest', 'facebook', 'web'] as const).map(p => {
                  const cfg = PLATFORM_CONFIG[p]
                  return (
                    <span key={p} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      borderRadius: 999, padding: '2px 10px',
                      fontSize: '0.68rem', fontWeight: 600, color: cfg.color,
                    }}>{cfg.label}</span>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <Label>Contenido de referencia</Label>
              <textarea
                placeholder="Pega aquí el texto del post, guion, caption o cualquier contenido que quieras usar como inspiración..."
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                disabled={pageState === 'analyzing'}
                rows={5}
                style={{
                  width: '100%', background: 'var(--surface)',
                  border: '1px solid var(--dust)', borderRadius: 10,
                  padding: '10px 14px', fontSize: '0.83rem', color: 'var(--ink)',
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                  marginBottom: 14, boxSizing: 'border-box',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--dust)' }}
              />
            </>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {pageState !== 'analyzing' ? (
              <>
                <Button
                  onClick={handleAnalyze}
                  disabled={inputMode === 'url' ? !url.trim() : !textInput.trim()}
                >
                  <Sparkles size={13} style={{ marginRight: 5 }} />
                  Generar contenido
                </Button>
                {pageState === 'done' && (
                  <button
                    onClick={handleReset}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: 'none', border: '1px solid var(--dust)',
                      borderRadius: 999, padding: '8px 14px',
                      fontSize: '0.78rem', color: 'var(--smoke)', cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={12} /> {inputMode === 'url' ? 'Nuevo link' : 'Nuevo texto'}
                  </button>
                )}
              </>
            ) : null}
          </div>

          <p style={{ fontSize: '0.72rem', color: 'var(--smoke-2)', margin: '10px 0 0', lineHeight: 1.5 }}>
            Modo demo · El análisis es simulado. Cuando se conecte la API real, el mecanismo se extraerá del contenido original.
          </p>
        </div>
      </Card>

      {/* Loading */}
      {pageState === 'analyzing' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 14, padding: '48px 20px', textAlign: 'center',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '2px solid var(--dust)', borderTopColor: 'var(--gold)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ fontSize: '0.86rem', color: 'var(--smoke)', margin: 0 }}>
            {LOADING_MESSAGES[loadingMsg]}
          </p>
        </div>
      )}

      {/* Error */}
      {pageState === 'error' && (
        <Card>
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="var(--rose)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>
                  No se pudo leer el link
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--smoke)', lineHeight: 1.5 }}>
                  {errorMsg ?? 'Verifica que la URL esté completa (comienza con https://).'}
                </div>
              </div>
            </div>
            {needsCaption && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  placeholder="Pega aquí el caption o texto del reel..."
                  value={captionInput}
                  onChange={e => setCaptionInput(e.target.value)}
                  rows={5}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                    fontSize: '0.84rem', borderRadius: 8, border: '1px solid var(--border)',
                    background: 'var(--surface)', color: 'var(--ink)', resize: 'vertical',
                    fontFamily: 'inherit', lineHeight: 1.5,
                  }}
                />
                <button
                  onClick={handleAnalyzeCaption}
                  disabled={!captionInput.trim()}
                  style={{
                    alignSelf: 'flex-end', padding: '8px 18px', borderRadius: 8,
                    background: captionInput.trim() ? 'var(--gold)' : 'var(--border)',
                    color: captionInput.trim() ? '#000' : 'var(--smoke)',
                    border: 'none', fontSize: '0.84rem', fontWeight: 600, cursor: captionInput.trim() ? 'pointer' : 'default',
                  }}
                >
                  Analizar texto
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Result */}
      {pageState === 'done' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease forwards' }}>

          {/* Inspiration summary (collapsible) */}
          <Card>
            <button
              onClick={() => setAnalysisOpen(o => !o)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ExternalLink size={13} color="var(--smoke-2)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--smoke)' }}>
                  Inspiración detectada
                </span>
                {platformCfg && (
                  <span style={{
                    background: platformCfg.bg, border: `1px solid ${platformCfg.border}`,
                    borderRadius: 999, padding: '1px 8px',
                    fontSize: '0.65rem', fontWeight: 700, color: platformCfg.color,
                  }}>
                    {platformCfg.label}
                  </span>
                )}
                <span style={{
                  background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
                  borderRadius: 4, padding: '1px 6px',
                  fontSize: '0.58rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.06em',
                }}>
                  DEMO
                </span>
              </div>
              {analysisOpen ? <ChevronUp size={14} color="var(--smoke-2)" /> : <ChevronDown size={14} color="var(--smoke-2)" />}
            </button>

            {analysisOpen && (
              <div style={{
                padding: '0 18px 16px',
                borderTop: '1px solid var(--dust)',
                display: 'flex', flexDirection: 'column', gap: 10,
                animation: 'fadeIn 0.2s ease forwards',
              }}>
                <div style={{ paddingTop: 14 }}>
                  <AnalysisRow label="Tema" value={result.analysis.tema} />
                </div>
                <AnalysisRow label="Idea principal" value={result.analysis.idea_principal} />
                <AnalysisRow label="Hook original" value={`"${result.analysis.hook_original}"`} />
                <AnalysisRow label="Estructura" value={result.analysis.estructura} />
                <AnalysisRow label="Tono" value={result.analysis.tono} />
                <AnalysisRow label="Mecanismo" value={result.analysis.mecanismo} />
                <div style={{ marginTop: 4, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8, fontSize: '0.74rem', color: 'var(--smoke-2)', fontStyle: 'italic' }}>
                  Ninguna frase del contenido original fue copiada. Solo se adoptó el mecanismo.
                </div>
              </div>
            )}
          </Card>

          {/* Generated content */}
          <Card>
            <div style={{ padding: '14px 18px 6px', borderBottom: '1px solid var(--dust)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--smoke-2)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Contenido generado para Victoria
                </div>
              </div>
              <Badge variant="gold">{THEME_LABELS[result.analysis.macro_theme] ?? result.analysis.macro_theme}</Badge>
              <Badge variant="default">{FORMAT_LABELS[result.analysis.format] ?? result.analysis.format}</Badge>
            </div>

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Visual style */}
              <div>
                <Label>Estilo visual recomendado</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
                    borderRadius: 7, padding: '2px 9px',
                    fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)',
                  }}>
                    {result.content.visual_style}
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--smoke)' }}>
                    {STYLE_DESC[result.content.visual_style] ?? result.content.visual_style_label}
                  </span>
                </div>
              </div>

              {/* Hook — only on reel content */}
              {hook && (
                <div>
                  <Label>Hook</Label>
                  <div style={{
                    background: 'var(--rose-light)', border: '1px solid var(--rose-border)',
                    borderRadius: 10, padding: '10px 14px',
                    fontSize: '0.87rem', color: 'var(--ink)', lineHeight: 1.55, fontStyle: 'italic',
                  }}>
                    "{hook}"
                  </div>
                </div>
              )}

              {/* Guion / Voice Over */}
              <div>
                <Label>Guion / Voice Over</Label>
                <div style={{
                  background: 'var(--surface-2)', border: '1px solid var(--dust)',
                  borderRadius: 10, padding: '11px 14px',
                  fontSize: '0.84rem', color: 'var(--ink-2)', lineHeight: 1.65,
                  whiteSpace: 'pre-line',
                  fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
                }}>
                  {mainTxt}
                </div>
              </div>

              {/* Texto en pantalla */}
              {reelContent?.on_screen_text && (
                <div>
                  <Label>Texto en pantalla</Label>
                  <div style={{
                    background: 'var(--gold-light)', border: '1px solid var(--gold-border)',
                    borderRadius: 10, padding: '11px 14px',
                    fontSize: '0.84rem', color: 'var(--ink)', lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                    fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
                  }}>
                    {reelContent.on_screen_text}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div>
                <Label>CTA</Label>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--dust)',
                  borderRadius: 10, padding: '9px 14px',
                  fontSize: '0.83rem', color: 'var(--smoke)', lineHeight: 1.5,
                }}>
                  {result.content.cta}
                </div>
              </div>

              {/* Caption + Hashtags */}
              <div>
                <Label>Caption</Label>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--dust)',
                  borderRadius: 10, padding: '11px 14px',
                  fontSize: '0.82rem', color: 'var(--ink-2)', lineHeight: 1.65, whiteSpace: 'pre-line',
                }}>
                  {result.content.caption}
                  {result.content.hashtags.length > 0 && (
                    <div style={{ marginTop: 10, color: 'var(--smoke)', fontSize: '0.78rem', lineHeight: 1.8 }}>
                      {result.content.hashtags.map(h => `#${h}`).join(' ')}
                    </div>
                  )}
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

              {/* Copy + Save buttons */}
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', paddingTop: 4 }}>
                <CopyBtn id="texto" label="Copiar texto" text={copyText} />
                <CopyBtn id="caption" label="Copiar caption" text={copyCaption} />
                <CopyBtn id="todo" label="Copiar todo" text={copyAll} />
                <button
                  onClick={handleSave}
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
        </div>
      )}

      {/* Idle hint */}
      {pageState === 'idle' && (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: 'var(--glass)', border: '1px dashed var(--dust-2)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>✦</div>
          <p style={{
            fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
            fontSize: '0.95rem', color: 'var(--ink-2)', margin: '0 0 5px',
          }}>
            Convierte cualquier contenido en inspiración
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--smoke)', margin: 0 }}>
            La app extrae el mecanismo, no las frases.<br />
            El resultado es 100% original para El Universo de Victoria.
          </p>
        </div>
      )}
    </main>
  )
}
