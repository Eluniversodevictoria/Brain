'use client'

import { useState } from 'react'
import { Zap, Copy, CheckCheck, ChevronDown, ChevronUp, BarChart2, Lightbulb, RotateCcw, ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react'
import Link from 'next/link'
import { Button, Badge, SectionHeader, Eyebrow, Card, Divider, ProgressBar } from '@/components/ui'
import { OBJECTIVE_LABELS, THEME_LABELS, FORMAT_LABELS } from '@/types'
import { useStrategy } from '@/lib/store'
import { useContentStorage } from '@/hooks/useContentStorage'
import type { ScoredIdea } from '@/lib/mock/scoring'

type State = 'idle' | 'loading' | 'done'

const SCORE_LABELS: Record<string, string> = {
  strategic: 'Score estratégico',
  evidence: 'Evidencia de audiencia',
  underrepresentation: 'Subrepresentación',
  format_objective: 'Formato × objetivo',
  calendar: 'Calendario',
  performance: 'Performance histórica',
  penalty_theme: 'Penalización tema',
  penalty_format: 'Penalización formato',
  bank_reuse_bonus: 'Bonus banco',
}

const LOADING_MESSAGES = [
  'Revisando inventario reciente...',
  'Calculando diversidad temática...',
  'Evaluando balance de pilares...',
  'Seleccionando mejor combinación...',
]

export default function DameUnaIdeaPage() {
  const { strategy } = useStrategy()
  const { save } = useContentStorage()
  const [state, setState] = useState<State>('idle')
  const [idea, setIdea] = useState<ScoredIdea | null>(null)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [showReasoning, setShowReasoning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  async function saveIdea() {
    if (!idea || savedId) return
    const { saved } = await save({
      source:             'dame-una-idea',
      theme:              idea.theme,
      format:             idea.format,
      objective:          idea.objective,
      hook:               idea.hook_seed,
      main_text:          '',
      cta:                '',
      caption:            '',
      hashtags:           [],
      visual_style:       'STYLE_A',
      visual_style_label: '',
    })
    setSavedId(saved.id)
  }

  async function runScoring() {
    setState('loading')
    setLoadingMsg(0)
    setIdea(null)
    setShowReasoning(false)
    setSavedId(null)

    // Animate loading messages
    const msgs = [0, 1, 2, 3]
    for (const i of msgs) {
      await new Promise(r => setTimeout(r, 300))
      setLoadingMsg(i)
    }
    await new Promise(r => setTimeout(r, 500))

    // MOCK — replace with server-side scoring after approval
    const { runScoring: score } = await import('@/lib/mock/scoring')
    const result = score(strategy)
    setIdea(result)
    setState('done')
  }

  function copyHook() {
    if (!idea) return
    navigator.clipboard.writeText(idea.hook_seed).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const scoreEntries = idea ? Object.entries(idea.score_breakdown) as [string, number][] : []

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Dame una idea"
        subtitle="El sistema analiza tu inventario y elige el ángulo más estratégico"
        eyebrow="Scoring editorial"
      />

      {state === 'idle' && (
        <div className="stagger-1 animate-fade-in">
          {/* Scoring criteria */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['Diversidad temática', 'Rotación de formatos', 'Balance de pilares', 'Rotación de objetivos'].map(label => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
                style={{ background: 'var(--surface-2)', color: 'var(--smoke)', border: '1px solid var(--dust)' }}
              >
                <BarChart2 size={10} />
                {label}
              </span>
            ))}
          </div>

          <div
            className="rounded-xl border border-dashed p-16 flex flex-col items-center gap-6 mb-8"
            style={{ borderColor: 'var(--dust-2)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--gold-light)', border: '1px solid var(--gold-border)' }}
            >
              <Zap size={26} style={{ color: 'var(--gold)' }} />
            </div>
            <div className="text-center max-w-sm">
              <p className="text-base font-medium mb-2" style={{ color: 'var(--ink)', fontFamily: "'Palatino Linotype', Palatino, Georgia, serif" }}>
                Pídele una idea al sistema
              </p>
              <p className="text-sm" style={{ color: 'var(--smoke)' }}>
                El scoring analiza qué temas, formatos y objetivos están subrepresentados en tu inventario y devuelve la combinación más estratégica para esta semana.
              </p>
            </div>
            <Button onClick={runScoring} size="lg">
              <Zap size={16} />
              Dame una idea
            </Button>
          </div>

          {/* Estrategia activa */}
          <div className="rounded-lg border px-4 py-3 text-xs" style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}>
            <span style={{ color: 'var(--smoke)' }}>Estrategia activa: </span>
            <span style={{ color: 'var(--ink)' }}>{strategy.reels_per_week} reels + {strategy.carrusels_per_week} carruseles/semana · </span>
            <span style={{ color: 'var(--ink)' }}>Objetivo principal: {OBJECTIVE_LABELS[strategy.primary_objective]} · </span>
            <span style={{ color: 'var(--ink)' }}>{strategy.active_pillars.length} pilares activos</span>
            <Link href="/estrategia" className="ml-2 hover:opacity-70 transition-opacity" style={{ color: 'var(--gold)' }}>
              Cambiar →
            </Link>
          </div>
        </div>
      )}

      {state === 'loading' && (
        <div className="py-24 flex flex-col items-center gap-5">
          <div className="relative w-12 h-12">
            <div
              className="absolute inset-0 rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }}
            />
            <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: 'var(--gold-light)' }}>
              <Zap size={14} style={{ color: 'var(--gold)' }} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>Analizando tu inventario</p>
            <p className="text-xs animate-pulse-soft" style={{ color: 'var(--smoke)' }}>
              {LOADING_MESSAGES[loadingMsg]}
            </p>
          </div>
          <div className="flex gap-1">
            {LOADING_MESSAGES.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{ background: i <= loadingMsg ? 'var(--gold)' : 'var(--dust)' }}
              />
            ))}
          </div>
        </div>
      )}

      {state === 'done' && idea && (
        <div className="animate-fade-in">
          {/* Header result */}
          <div
            className="rounded-xl border p-6 mb-6"
            style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <Eyebrow className="mb-2">Idea seleccionada</Eyebrow>
                <h2
                  className="text-xl font-normal leading-snug"
                  style={{ fontFamily: "'Palatino Linotype', Palatino, Georgia, serif", color: 'var(--ink)' }}
                >
                  {THEME_LABELS[idea.theme]}
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--smoke)' }}>Pilar: {idea.pillar}</p>
              </div>
              <div className="rounded-lg px-3 py-2 text-center" style={{ background: 'var(--gold-light)', border: '1px solid var(--gold-border)', minWidth: 56 }}>
                <div className="text-lg font-semibold" style={{ color: 'var(--gold)', fontVariantNumeric: 'tabular-nums' }}>{idea.score}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--smoke)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>score</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <Badge variant="sage">{THEME_LABELS[idea.theme]}</Badge>
              <Badge variant="gold">{FORMAT_LABELS[idea.format]}</Badge>
              <Badge variant="celestial">{OBJECTIVE_LABELS[idea.objective]}</Badge>
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
              {scoreEntries.map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <span style={{ fontSize: '0.68rem', color: 'var(--smoke)' }}>{SCORE_LABELS[key] ?? key}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{val}</span>
                  </div>
                  <ProgressBar
                    value={val}
                    color={val >= 70 ? 'var(--sage)' : val >= 40 ? 'var(--gold)' : 'var(--blush)'}
                  />
                </div>
              ))}
            </div>

            <Divider className="mb-4" />

            {/* Hook seed */}
            <div className="rounded-lg px-4 py-3 flex items-start justify-between gap-3" style={{ background: 'var(--surface-2)' }}>
              <div className="flex-1">
                <Eyebrow className="mb-1.5">Hook sugerido</Eyebrow>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)', fontStyle: 'italic' }}>
                  "{idea.hook_seed}"
                </p>
              </div>
              <button
                onClick={copyHook}
                className="flex items-center gap-1 text-xs flex-shrink-0 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--smoke)', marginTop: 2 }}
              >
                {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Razonamiento */}
          <div
            className="rounded-xl border mb-6 overflow-hidden"
            style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}
          >
            <button
              className="w-full flex items-center justify-between px-5 py-4 hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => setShowReasoning(v => !v)}
            >
              <div className="flex items-center gap-2">
                <Lightbulb size={14} style={{ color: 'var(--gold)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Decisión editorial del sistema</span>
              </div>
              {showReasoning ? <ChevronUp size={14} style={{ color: 'var(--smoke)' }} /> : <ChevronDown size={14} style={{ color: 'var(--smoke)' }} />}
            </button>
            {showReasoning && (
              <div className="px-5 pb-5 animate-fade-in">
                <Divider className="mb-4" />
                <ul className="space-y-3">
                  {idea.reasoning.map((r, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium"
                        style={{ background: 'var(--gold-light)', color: 'var(--gold)' }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--ink)', lineHeight: 1.6 }}>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link href={`/crear?theme=${idea.theme}&format=${idea.format}&objective=${idea.objective}`}>
              <Button>
                <ArrowRight size={14} />
                Desarrollar esta idea
              </Button>
            </Link>
            <Button variant="outline" onClick={runScoring}>
              <RotateCcw size={14} />
              Pedir otra idea
            </Button>
            <button
              onClick={saveIdea}
              disabled={!!savedId}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: savedId ? 'var(--gold-light)' : 'var(--surface)',
                border: `1px solid ${savedId ? 'var(--gold-border)' : 'var(--dust)'}`,
                borderRadius: 999, padding: '8px 16px',
                fontSize: '0.8rem', fontWeight: 600,
                color: savedId ? 'var(--gold)' : 'var(--smoke)',
                cursor: savedId ? 'default' : 'pointer',
                transition: 'all 160ms',
              }}
            >
              {savedId
                ? <><BookmarkCheck size={13} /> Guardada</>
                : <><Bookmark size={13} /> Guardar idea</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
