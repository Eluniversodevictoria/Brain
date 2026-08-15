'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Sparkles, Copy, CheckCheck, Calendar, Archive } from 'lucide-react'
import {
  Button, Badge, SectionHeader, Eyebrow, Card, Divider, Select
} from '@/components/ui'
import {
  OBJECTIVE_LABELS, THEME_LABELS, FORMAT_LABELS,
  IMAGE_TEXT_LENGTH_LABELS, VISUAL_STYLE_LABELS,
  type ContentObjective, type MacroTheme, type ContentFormatType, type GeneratedContent,
  type ReelContent, type CarouselContent, type PostContent,
  type ImageTextLength, type VisualStyle,
} from '@/types'
import { useContentStorage } from '@/hooks/useContentStorage'

type Step = 'objetivo' | 'tema' | 'formato' | 'resultado'

const OBJECTIVES: { value: ContentObjective; description: string }[] = [
  { value: 'grow', description: 'Llegar a gente nueva, reel viral' },
  { value: 'connection', description: 'Que la audiencia sienta que la entiendes' },
  { value: 'comments', description: 'Activar conversación en comentarios' },
  { value: 'saves', description: 'Contenido que quieren guardar y volver a ver' },
  { value: 'shares', description: 'Contenido que comparten con alguien más' },
  { value: 'authority', description: 'Posicionarte como voz de referencia' },
  { value: 'nurture', description: 'Mantener caliente a la audiencia actual' },
  { value: 'presell', description: 'Preparar el terreno para una oferta' },
]

const THEMES: MacroTheme[] = [
  'manifestacion', 'dinero', 'abundancia', 'suerte', 'oportunidades',
  'rituales', 'senales', 'numeros_fechas', 'deseos_concretos',
  'creencias', 'merecimiento', 'desapego', 'amor_relaciones',
]

const FORMATS: { value: ContentFormatType; hint: string }[] = [
  { value: 'reel_talking', hint: 'Victoria habla directo a cámara' },
  { value: 'reel_storytelling', hint: 'Historia con narrativa emocional' },
  { value: 'reel_educational', hint: 'Lista, proceso, tips paso a paso' },
  { value: 'reel_visual', hint: 'Video estético sin diálogo' },
  { value: 'pov', hint: 'Punto de vista inmersivo ("POV: eres tú cuando...")' },
  { value: 'affirmation', hint: 'Afirmación para repetir o guardar' },
  { value: 'carousel', hint: 'Carrusel de slides' },
  { value: 'story', hint: 'Story de Instagram' },
]

function copyToClipboard(text: string, setCopied: (key: string) => void, key: string) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  })
}

function CrearPageInner() {
  const searchParams = useSearchParams()
  const hookParam = searchParams.get('hook') ?? ''

  const [step, setStep] = useState<Step>('objetivo')
  const [objective, setObjective] = useState<ContentObjective | null>(null)
  const [theme, setTheme] = useState<MacroTheme | null>(null)
  const [format, setFormat] = useState<ContentFormatType | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratedContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [manualLength, setManualLength] = useState<ImageTextLength | null>(null)
  const [manualStyle, setManualStyle] = useState<VisualStyle | null>(null)

  const { save } = useContentStorage()

  const steps: Step[] = ['objetivo', 'tema', 'formato', 'resultado']
  const stepIndex = steps.indexOf(step)

  async function generate() {
    if (!objective || !theme || !format) return
    setLoading(true)
    setError(null)
    setStep('resultado')

    try {
      // MOCK — replace with Claude API after approval
      await new Promise(r => setTimeout(r, 1600))
      const { generateMockContent } = await import('@/lib/mock/generation')
      const generated = generateMockContent(theme, format, objective, {
        image_text_length: manualLength ?? undefined,
        visual_style:      manualStyle  ?? undefined,
      })
      // hookParam only applies to reel content (carousels and posts have no hook field)
      const final = (hookParam && generated.kind === 'reel')
        ? { ...generated, hook: hookParam }
        : generated
      setResult(final)

      const hook      = final.kind === 'reel' ? final.hook : ''
      const main_text = final.kind === 'reel'     ? final.on_screen_text
                      : final.kind === 'carousel' ? final.cover_text
                      :                             final.image_text
      const { saved } = await save({
        source:              'generador',
        theme:               theme!,
        format:              format!,
        objective:           objective!,
        hook,
        main_text,
        cta:                 final.cta,
        caption:             final.caption,
        hashtags:            final.hashtags,
        visual_style:        final.visual_style,
        visual_style_label:  final.visual_style_label,
        kind:                final.kind,
        image_text_length:   final.kind === 'post'      ? final.image_text_length : undefined,
        slides:              final.kind === 'carousel'  ? final.slides            : undefined,
      })
      setSavedId(saved.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('objetivo')
    setObjective(null)
    setTheme(null)
    setFormat(null)
    setResult(null)
    setError(null)
    setSavedId(null)
    setManualLength(null)
    setManualStyle(null)
  }

  return (
    <div>
      <SectionHeader
        title="Crear pieza"
        subtitle="Generador guiado · 3 pasos"
        action={
          step !== 'objetivo' && step !== 'resultado' ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(steps[stepIndex - 1] as Step)}>
              <ArrowLeft size={14} /> Atrás
            </Button>
          ) : undefined
        }
      />

      {/* Hook desde /transformar */}
      {hookParam && (
        <div className="rounded-xl border px-4 py-3 mb-6 flex items-start gap-3"
          style={{ background: 'var(--gold-light)', borderColor: 'var(--gold-border)' }}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>✦</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--gold)' }}>
              Hook desde Transformar — se usará en el resultado generado
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)', fontStyle: 'italic' }}>
              "{hookParam}"
            </p>
          </div>
        </div>
      )}

      {/* Step indicator */}
      {step !== 'resultado' && (
        <div className="flex gap-2 mb-8">
          {['Objetivo', 'Tema', 'Formato'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5"
                style={{ opacity: i <= stepIndex ? 1 : 0.35 }}
              >
                <span
                  className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium"
                  style={{
                    background: i < stepIndex ? 'var(--sage)' : i === stepIndex ? 'var(--gold)' : 'var(--dust)',
                    color: i <= stepIndex ? 'white' : 'var(--smoke)',
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-xs" style={{ color: i === stepIndex ? 'var(--ink)' : 'var(--smoke)' }}>
                  {label}
                </span>
              </div>
              {i < 2 && <span style={{ color: 'var(--dust-2)' }} className="text-xs">·</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── STEP 1: OBJETIVO ── */}
      {step === 'objetivo' && (
        <div>
          <Eyebrow className="mb-4">¿Qué quieres lograr con esta pieza?</Eyebrow>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
            {OBJECTIVES.map(({ value, description }) => (
              <button
                key={value}
                onClick={() => setObjective(value)}
                className="text-left p-4 rounded border transition-all duration-150"
                style={{
                  background: objective === value ? 'var(--gold-light)' : 'var(--surface)',
                  borderColor: objective === value ? 'var(--gold-border)' : 'var(--dust)',
                  cursor: 'pointer',
                }}
              >
                <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--ink)' }}>
                  {OBJECTIVE_LABELS[value]}
                </div>
                <div className="text-xs" style={{ color: 'var(--smoke)' }}>{description}</div>
              </button>
            ))}
          </div>
          <Button disabled={!objective} onClick={() => setStep('tema')}>
            Continuar <ArrowRight size={14} />
          </Button>
        </div>
      )}

      {/* ── STEP 2: TEMA ── */}
      {step === 'tema' && (
        <div>
          <Eyebrow className="mb-4">¿Sobre qué tema?</Eyebrow>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="p-3 rounded border text-sm transition-all duration-150"
                style={{
                  background: theme === t ? 'var(--gold-light)' : 'var(--surface)',
                  borderColor: theme === t ? 'var(--gold-border)' : 'var(--dust)',
                  color: theme === t ? 'var(--gold)' : 'var(--ink)',
                  cursor: 'pointer',
                }}
              >
                {THEME_LABELS[t]}
              </button>
            ))}
          </div>
          <Button disabled={!theme} onClick={() => setStep('formato')}>
            Continuar <ArrowRight size={14} />
          </Button>
        </div>
      )}

      {/* ── STEP 3: FORMATO ── */}
      {step === 'formato' && (
        <div>
          <Eyebrow className="mb-4">¿En qué formato?</Eyebrow>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
            {FORMATS.map(({ value, hint }) => (
              <button
                key={value}
                onClick={() => setFormat(value)}
                className="text-left p-4 rounded border transition-all duration-150"
                style={{
                  background: format === value ? 'var(--gold-light)' : 'var(--surface)',
                  borderColor: format === value ? 'var(--gold-border)' : 'var(--dust)',
                  cursor: 'pointer',
                }}
              >
                <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--ink)' }}>
                  {FORMAT_LABELS[value]}
                </div>
                <div className="text-xs" style={{ color: 'var(--smoke)' }}>{hint}</div>
              </button>
            ))}
          </div>
          {/* Summary before generating */}
          {objective && theme && format && (
            <div
              className="rounded border p-4 mb-4 text-sm"
              style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}
            >
              <Eyebrow className="mb-2">Resumen</Eyebrow>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="gold">{OBJECTIVE_LABELS[objective]}</Badge>
                <Badge variant="sage">{THEME_LABELS[theme]}</Badge>
                <Badge>{FORMAT_LABELS[format]}</Badge>
              </div>
            </div>
          )}

          {/* Personalización visual opcional */}
          <div className="rounded border p-4 mb-6" style={{ background: 'var(--surface-2)', borderColor: 'var(--dust)' }}>
            <Eyebrow className="mb-3">Personalización visual <span style={{ color: 'var(--smoke)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— opcional</span></Eyebrow>

            {/* Longitud del texto de imagen */}
            <div className="mb-4">
              <p className="text-xs mb-2" style={{ color: 'var(--smoke)' }}>
                Longitud del texto para imagen <span style={{ opacity: 0.6 }}>(auto si no eliges)</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(IMAGE_TEXT_LENGTH_LABELS) as ImageTextLength[]).map(len => (
                  <button
                    key={len}
                    onClick={() => setManualLength(manualLength === len ? null : len)}
                    className="px-3 py-1.5 rounded text-xs transition-all"
                    style={{
                      background: manualLength === len ? 'var(--gold-light)' : 'var(--surface)',
                      border: `1px solid ${manualLength === len ? 'var(--gold-border)' : 'var(--dust)'}`,
                      color: manualLength === len ? 'var(--gold)' : 'var(--smoke)',
                      cursor: 'pointer',
                    }}
                  >
                    {IMAGE_TEXT_LENGTH_LABELS[len]}
                  </button>
                ))}
              </div>
            </div>

            {/* Estilo visual */}
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--smoke)' }}>
                Estilo visual <span style={{ opacity: 0.6 }}>(auto si no eliges)</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(VISUAL_STYLE_LABELS) as VisualStyle[]).map(style => (
                  <button
                    key={style}
                    onClick={() => setManualStyle(manualStyle === style ? null : style)}
                    className="px-3 py-1.5 rounded text-xs transition-all"
                    style={{
                      background: manualStyle === style ? 'var(--gold-light)' : 'var(--surface)',
                      border: `1px solid ${manualStyle === style ? 'var(--gold-border)' : 'var(--dust)'}`,
                      color: manualStyle === style ? 'var(--gold)' : 'var(--smoke)',
                      cursor: 'pointer',
                    }}
                  >
                    {style} · {VISUAL_STYLE_LABELS[style]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button
            disabled={!format}
            loading={loading}
            onClick={generate}
          >
            <Sparkles size={14} />
            Generar pieza
          </Button>
        </div>
      )}

      {/* ── RESULT ── */}
      {step === 'resultado' && (
        <div>
          {loading && (
            <div className="py-20 flex flex-col items-center gap-4" style={{ color: 'var(--smoke)' }}>
              <span className="w-8 h-8 border-2 border-current border-t-transparent rounded-full block" style={{ animation: 'spin 0.9s linear infinite' }} />
              <p className="text-sm" style={{ color: 'var(--ink)' }}>Victoria está pensando...</p>
              <p className="text-xs" style={{ color: 'var(--smoke)' }}>Construyendo ángulo · Buscando hooks · Redactando guion</p>
            </div>
          )}

          {error && (
            <div
              className="rounded border p-4 mb-6"
              style={{ background: 'var(--blush-light)', borderColor: 'rgba(196,146,122,.3)' }}
            >
              <p className="text-sm" style={{ color: 'var(--blush)' }}>{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={reset}>
                Intentar de nuevo
              </Button>
            </div>
          )}

          {result && !loading && (
            <div>
              {/* Selection badges */}
              <div className="flex gap-2 flex-wrap mb-6">
                {objective && <Badge variant="gold">{OBJECTIVE_LABELS[objective]}</Badge>}
                {theme && <Badge variant="sage">{THEME_LABELS[theme]}</Badge>}
                {format && <Badge>{FORMAT_LABELS[format]}</Badge>}
                {savedId && <Badge variant="smoke">Guardado</Badge>}
              </div>

              {/* Strategy card — shared across all kinds */}
              <StrategyCard strategy={result.strategy} />

              {/* Kind-specific content */}
              {result.kind === 'reel' && (
                <ReelResult result={result} copied={copied} setCopied={setCopied} />
              )}
              {result.kind === 'carousel' && (
                <CarouselResult result={result} copied={copied} setCopied={setCopied} />
              )}
              {result.kind === 'post' && (
                <PostResult result={result} copied={copied} setCopied={setCopied} />
              )}

              <Divider className="my-6" />

              <div className="flex gap-3 flex-wrap">
                <Button onClick={reset} variant="outline">
                  <Sparkles size={14} />
                  Crear otra pieza
                </Button>
                {savedId && (
                  <Button variant="secondary" onClick={() => window.location.href = '/historial'}>
                    <Archive size={14} />
                    Ver en historial
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CrearPage() {
  return (
    <Suspense>
      <CrearPageInner />
    </Suspense>
  )
}

// ── Shared: copy block ────────────────────────────────────────
function ContentBlock({
  label, content, copyKey, copied, setCopied, serif,
}: {
  label: string
  content: string
  copyKey: string
  copied: string
  setCopied: (k: string) => void
  serif?: boolean
}) {
  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <Eyebrow>{label}</Eyebrow>
        <button
          onClick={() => copyToClipboard(content, setCopied, copyKey)}
          className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
          style={{ color: 'var(--smoke)' }}
        >
          {copied === copyKey ? <CheckCheck size={12} /> : <Copy size={12} />}
          {copied === copyKey ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <p
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{
          color: 'var(--ink)',
          fontFamily: serif ? "'Palatino Linotype', Palatino, Georgia, serif" : 'inherit',
          fontStyle: serif ? 'italic' : 'normal',
        }}
      >
        {content}
      </p>
    </Card>
  )
}

// ── Shared: visual style chip ─────────────────────────────────
function VisualStyleChip({ style, label }: { style: string; label: string }) {
  return (
    <Card className="p-4 mb-4">
      <Eyebrow className="mb-2">Estilo visual recomendado</Eyebrow>
      <div className="flex items-center gap-3">
        <div
          className="px-3 py-1.5 rounded text-xs font-semibold"
          style={{ background: 'var(--gold-light)', border: '1px solid var(--gold-border)', color: 'var(--gold)', letterSpacing: '0.04em' }}
        >
          {style}
        </div>
        <span className="text-sm" style={{ color: 'var(--ink)' }}>{label}</span>
      </div>
    </Card>
  )
}

// ── Shared: caption + cta + hashtags ─────────────────────────
function CommonFooter({
  caption, cta, hashtags, copied, setCopied,
}: {
  caption: string; cta: string; hashtags: string[]
  copied: string; setCopied: (k: string) => void
}) {
  return (
    <>
      <ContentBlock label="Caption de Instagram" content={caption} copyKey="caption" copied={copied} setCopied={setCopied} />
      <ContentBlock label="CTA" content={cta} copyKey="cta" copied={copied} setCopied={setCopied} />
      {hashtags.length > 0 && (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <Eyebrow>Hashtags</Eyebrow>
            <button
              onClick={() => copyToClipboard(hashtags.join(' '), setCopied, 'hashtags')}
              className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
              style={{ color: 'var(--smoke)' }}
            >
              {copied === 'hashtags' ? <CheckCheck size={12} /> : <Copy size={12} />}
              {copied === 'hashtags' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-sm" style={{ color: 'var(--smoke)' }}>{hashtags.join(' ')}</p>
        </Card>
      )}
    </>
  )
}

// ── Shared: strategy ─────────────────────────────────────────
function StrategyCard({ strategy }: { strategy: ReelContent['strategy'] }) {
  return (
    <Card className="p-5 mb-4">
      <Eyebrow className="mb-3">Estrategia</Eyebrow>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
        <div><span style={{ color: 'var(--smoke)' }}>Ángulo: </span><span style={{ color: 'var(--ink)' }}>{strategy.angle}</span></div>
        <div><span style={{ color: 'var(--smoke)' }}>Emoción: </span><span style={{ color: 'var(--ink)' }}>{strategy.primary_emotion}</span></div>
        <div><span style={{ color: 'var(--smoke)' }}>Mecanismo: </span><span style={{ color: 'var(--ink)' }}>{strategy.psychological_mechanism}</span></div>
        <div><span style={{ color: 'var(--smoke)' }}>Deseo tocado: </span><span style={{ color: 'var(--ink)' }}>{strategy.desire}</span></div>
        <div className="sm:col-span-2"><span style={{ color: 'var(--smoke)' }}>Pensamiento privado: </span><span style={{ color: 'var(--ink)' }}>{strategy.private_thought}</span></div>
      </div>
    </Card>
  )
}

// ── REEL result ───────────────────────────────────────────────
function ReelResult({ result, copied, setCopied }: {
  result: ReelContent; copied: string; setCopied: (k: string) => void
}) {
  return (
    <>
      <ContentBlock label="Hook (primeros 3 segundos)" content={result.hook} copyKey="hook" copied={copied} setCopied={setCopied} />
      <ContentBlock label="Guion" content={result.script} copyKey="script" copied={copied} setCopied={setCopied} />
      {result.on_screen_text && (
        <ContentBlock label="Texto en pantalla" content={result.on_screen_text} copyKey="on_screen" copied={copied} setCopied={setCopied} />
      )}
      <VisualStyleChip style={result.visual_style} label={result.visual_style_label} />
      <ContentBlock label="Dirección visual" content={result.visual_direction} copyKey="visual" copied={copied} setCopied={setCopied} />
      <CommonFooter caption={result.caption} cta={result.cta} hashtags={result.hashtags} copied={copied} setCopied={setCopied} />
      {result.ai_video_prompt && (
        <ContentBlock label="Prompt de video IA (inglés)" content={result.ai_video_prompt} copyKey="video_prompt" copied={copied} setCopied={setCopied} />
      )}
    </>
  )
}

// ── CAROUSEL result ───────────────────────────────────────────
function CarouselResult({ result, copied, setCopied }: {
  result: CarouselContent; copied: string; setCopied: (k: string) => void
}) {
  const allSlidesText = result.slides.map(s => `Slide ${s.slide}:\n${s.text}`).join('\n\n')
  return (
    <>
      {/* Topic + angle */}
      <Card className="p-4 mb-4">
        <Eyebrow className="mb-3">Concepto del carrusel</Eyebrow>
        <div className="flex flex-col gap-2 text-sm">
          <div><span style={{ color: 'var(--smoke)' }}>Tema: </span><span style={{ color: 'var(--ink)' }}>{result.topic}</span></div>
          <div><span style={{ color: 'var(--smoke)' }}>Objetivo: </span><span style={{ color: 'var(--ink)' }}>{result.goal}</span></div>
          <div><span style={{ color: 'var(--smoke)' }}>Ángulo: </span><span style={{ color: 'var(--ink)' }}>{result.angle}</span></div>
        </div>
      </Card>

      {/* Slides */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <Eyebrow>Slides ({result.slides.length})</Eyebrow>
          <button
            onClick={() => copyToClipboard(allSlidesText, setCopied, 'slides')}
            className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
            style={{ color: 'var(--smoke)' }}
          >
            {copied === 'slides' ? <CheckCheck size={12} /> : <Copy size={12} />}
            {copied === 'slides' ? 'Copiado' : 'Copiar todo'}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {result.slides.map(slide => (
            <div key={slide.slide} className="flex gap-3 items-start">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: slide.role === 'cover' ? 'var(--gold-light)' : slide.role === 'cta' ? 'var(--rose-light)' : 'var(--surface-2)',
                  border: `1px solid ${slide.role === 'cover' ? 'var(--gold-border)' : slide.role === 'cta' ? 'var(--rose-border)' : 'var(--dust)'}`,
                  color: slide.role === 'cover' ? 'var(--gold)' : slide.role === 'cta' ? 'var(--rose)' : 'var(--smoke)',
                }}
              >
                {slide.slide}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs mb-1" style={{ color: 'var(--smoke-2)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {slide.role === 'cover' ? 'Portada' : slide.role === 'cta' ? 'CTA' : 'Desarrollo'}
                </div>
                <p
                  className="text-sm leading-relaxed whitespace-pre-line"
                  style={{
                    color: 'var(--ink)',
                    fontFamily: slide.role === 'cover' ? "'Palatino Linotype', Palatino, Georgia, serif" : 'inherit',
                    fontWeight: slide.role === 'cover' ? 500 : 400,
                  }}
                >
                  {slide.text}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(slide.text, setCopied, `slide-${slide.slide}`)}
                className="flex-shrink-0 flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
                style={{ color: 'var(--smoke)' }}
              >
                {copied === `slide-${slide.slide}` ? <CheckCheck size={11} /> : <Copy size={11} />}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Visual notes */}
      {result.visual_notes && (
        <ContentBlock label="Notas visuales" content={result.visual_notes} copyKey="visual_notes" copied={copied} setCopied={setCopied} />
      )}

      <VisualStyleChip style={result.visual_style} label={result.visual_style_label} />
      <CommonFooter caption={result.caption} cta={result.cta} hashtags={result.hashtags} copied={copied} setCopied={setCopied} />
    </>
  )
}

// ── POST result ───────────────────────────────────────────────
function PostResult({ result, copied, setCopied }: {
  result: PostContent; copied: string; setCopied: (k: string) => void
}) {
  const lengthColor = {
    short:  { bg: 'var(--sage-light, rgba(107,142,101,.12))', color: 'var(--sage)' },
    medium: { bg: 'var(--gold-light)', color: 'var(--gold)' },
    long:   { bg: 'var(--blush-light)', color: 'var(--blush)' },
  }[result.image_text_length]

  return (
    <>
      {/* Image text */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <Eyebrow>Texto para imagen</Eyebrow>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ background: lengthColor.bg, color: lengthColor.color, border: '1px solid transparent' }}
            >
              {IMAGE_TEXT_LENGTH_LABELS[result.image_text_length]}
            </span>
            <button
              onClick={() => copyToClipboard(result.image_text, setCopied, 'image_text')}
              className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
              style={{ color: 'var(--smoke)' }}
            >
              {copied === 'image_text' ? <CheckCheck size={12} /> : <Copy size={12} />}
              {copied === 'image_text' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
        <p
          className="text-sm leading-relaxed whitespace-pre-line"
          style={{ color: 'var(--ink)', fontFamily: "'Palatino Linotype', Palatino, Georgia, serif", fontStyle: 'italic' }}
        >
          {result.image_text}
        </p>
      </Card>

      <VisualStyleChip style={result.visual_style} label={result.visual_style_label} />
      <CommonFooter caption={result.caption} cta={result.cta} hashtags={result.hashtags} copied={copied} setCopied={setCopied} />
    </>
  )
}
