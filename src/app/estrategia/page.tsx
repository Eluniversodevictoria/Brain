'use client'

import { SectionHeader, Eyebrow, Divider, ProgressBar, Badge } from '@/components/ui'
import { OBJECTIVE_LABELS } from '@/types'
import type { ContentObjective } from '@/types'
import { useStrategy } from '@/lib/store'
import { MOCK_PILLARS } from '@/lib/mock/data'
import Link from 'next/link'

const PILLAR_SLUGS = MOCK_PILLARS.map(p => p.slug)
const OBJECTIVES: ContentObjective[] = ['grow', 'connection', 'saves', 'comments', 'authority', 'nurture']

function getLaunchWeek(startDate: string) {
  const start = new Date(startDate)
  const days = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.min(4, Math.max(1, Math.ceil((days + 1) / 7)))
}

const WEEK_NOTES: Record<number, string> = {
  1: 'Foco en identidad y alcance. Reels hablados a cámara dominan.',
  2: 'Profundizar en temas con mejor respuesta. Introducir carruseles.',
  3: 'Primera evaluación de datos reales. Ajustar según señales.',
  4: 'Consolidar identidad. Preparar estrategia mes 2.',
}

export default function EstrategiaPage() {
  const { strategy, updateStrategy } = useStrategy()
  const totalFeed = strategy.reels_per_week + strategy.carrusels_per_week
  const total30 = totalFeed * 4
  const launchWeek = getLaunchWeek(strategy.launch_start_date)

  const feedQuality = totalFeed < 3 ? 'low' : totalFeed <= 6 ? 'ok' : 'high'
  const feedColor = feedQuality === 'low' ? 'var(--blush)' : feedQuality === 'ok' ? 'var(--sage)' : 'var(--gold)'
  const feedNote = feedQuality === 'low' ? 'Por debajo del mínimo recomendado (3-5)' : feedQuality === 'ok' ? 'En el rango recomendado según Buffer' : 'Por encima del rango — asegúrate de mantener calidad'

  function togglePillar(slug: string) {
    const current = strategy.active_pillars
    if (current.includes(slug)) {
      if (current.length <= 2) return // mínimo 2
      updateStrategy({ active_pillars: current.filter(p => p !== slug) })
    } else {
      updateStrategy({ active_pillars: [...current, slug] })
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <SectionHeader
        title="Estrategia de publicación"
        subtitle="Afecta a 'Dame una idea' y 'Organiza mi semana'"
      />

      {/* Frecuencia */}
      <div className="rounded-xl border p-5 mb-5 stagger-1 animate-fade-in" style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}>
        <Eyebrow className="mb-4">Frecuencia de publicación</Eyebrow>

        <div className="space-y-5">
          {[
            { label: 'Reels por semana', key: 'reels_per_week', min: 1, max: 7, value: strategy.reels_per_week },
            { label: 'Carruseles por semana', key: 'carrusels_per_week', min: 0, max: 4, value: strategy.carrusels_per_week },
            { label: 'Stories por día', key: 'stories_per_week', min: 0, max: 5, value: strategy.stories_per_week },
          ].map(item => (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--ink)' }}>{item.label}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--gold)', fontVariantNumeric: 'tabular-nums', minWidth: 20, textAlign: 'right' }}>
                  {item.value}
                </span>
              </div>
              <input
                type="range"
                min={item.min}
                max={item.max}
                value={item.value}
                onChange={e => updateStrategy({ [item.key]: Number(e.target.value) })}
                className="w-full"
                style={{ accentColor: 'var(--gold)' }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--smoke-2)' }}>
                <span>{item.min}</span>
                <span>{item.max}</span>
              </div>
            </div>
          ))}
        </div>

        <Divider className="my-4" />

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium" style={{ color: feedColor }}>{totalFeed} piezas de feed por semana</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--smoke)' }}>{feedNote}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--smoke)' }}>Proyección 30 días: ~{total30} piezas</div>
          </div>
          <div className="text-right">
            <ProgressBar value={Math.round((totalFeed / 7) * 100)} color={feedColor} className="w-20" />
          </div>
        </div>
      </div>

      {/* Modo lanzamiento */}
      <div className="rounded-xl border p-5 mb-5 stagger-2 animate-fade-in" style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}>
        <div className="flex items-center justify-between mb-3">
          <Eyebrow>Modo lanzamiento</Eyebrow>
          <button
            onClick={() => updateStrategy({ launch_mode: !strategy.launch_mode })}
            className="relative w-10 h-6 rounded-full transition-all duration-200 cursor-pointer flex-shrink-0"
            style={{ background: strategy.launch_mode ? 'var(--gold)' : 'var(--dust)' }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200"
              style={{
                background: 'white',
                left: strategy.launch_mode ? '20px' : '2px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>

        {strategy.launch_mode ? (
          <div>
            <div className="rounded-lg px-4 py-3 mb-3" style={{ background: 'var(--gold-light)', borderLeft: '2px solid var(--gold)' }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--gold)' }}>Modo lanzamiento activo · Semana {launchWeek} de 4</div>
              <div className="text-xs" style={{ color: 'var(--smoke)' }}>{WEEK_NOTES[launchWeek]}</div>
            </div>
            <p className="text-xs" style={{ color: 'var(--smoke)' }}>
              El sistema prioriza alcance e identificación. Siguiendo <Link href="/plan-lanzamiento" className="underline" style={{ color: 'var(--gold)' }}>Plan de Lanzamiento 30 días v0.2</Link>.
            </p>
          </div>
        ) : (
          <p className="text-xs" style={{ color: 'var(--smoke)' }}>
            Modo crecimiento. El sistema equilibra alcance, conexión y autoridad según tu objetivo principal.
          </p>
        )}
      </div>

      {/* Objetivo principal */}
      <div className="rounded-xl border p-5 mb-5 stagger-3 animate-fade-in" style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}>
        <Eyebrow className="mb-4">Objetivo principal de la semana</Eyebrow>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {OBJECTIVES.map(obj => (
            <button
              key={obj}
              onClick={() => updateStrategy({ primary_objective: obj })}
              className="px-3 py-2 rounded-lg text-sm text-left transition-all duration-150 cursor-pointer"
              style={{
                background: strategy.primary_objective === obj ? 'var(--gold-light)' : 'var(--surface-2)',
                border: `1px solid ${strategy.primary_objective === obj ? 'var(--gold-border)' : 'var(--dust)'}`,
                color: strategy.primary_objective === obj ? 'var(--gold)' : 'var(--ink)',
                fontWeight: strategy.primary_objective === obj ? 500 : 400,
              }}
            >
              {OBJECTIVE_LABELS[obj]}
            </button>
          ))}
        </div>
      </div>

      {/* Pilares activos */}
      <div className="rounded-xl border p-5 mb-5 stagger-4 animate-fade-in" style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}>
        <Eyebrow className="mb-1">Pilares activos</Eyebrow>
        <p className="text-xs mb-4" style={{ color: 'var(--smoke)' }}>Mínimo 2 pilares deben estar activos</p>
        <div className="flex flex-wrap gap-2">
          {MOCK_PILLARS.map(pillar => {
            const active = strategy.active_pillars.includes(pillar.slug)
            return (
              <button
                key={pillar.slug}
                onClick={() => togglePillar(pillar.slug)}
                className="px-3 py-1.5 rounded-full text-sm transition-all duration-150 cursor-pointer"
                style={{
                  background: active ? 'var(--sage-light)' : 'var(--surface-2)',
                  border: `1px solid ${active ? 'rgba(92,122,110,.4)' : 'var(--dust)'}`,
                  color: active ? 'var(--sage)' : 'var(--smoke)',
                  fontWeight: active ? 500 : 400,
                }}
              >
                {active ? '✓ ' : ''}{pillar.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Resumen estratégico */}
      <div className="rounded-xl border p-5 stagger-5 animate-fade-in" style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}>
        <Eyebrow className="mb-3">Resumen de configuración actual</Eyebrow>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span style={{ color: 'var(--smoke)', flexShrink: 0 }}>Pilares activos:</span>
            <div className="flex flex-wrap gap-1">
              {MOCK_PILLARS.filter(p => strategy.active_pillars.includes(p.slug)).map(p => (
                <Badge key={p.slug} variant="sage">{p.name}</Badge>
              ))}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--smoke)' }}>Objetivo prioritario: </span>
            <span style={{ color: 'var(--gold)', fontWeight: 500 }}>{OBJECTIVE_LABELS[strategy.primary_objective]}</span>
          </div>
          <div>
            <span style={{ color: 'var(--smoke)' }}>Formato dominante: </span>
            <span style={{ color: 'var(--ink)' }}>Reels ({strategy.reels_per_week}/sem)</span>
          </div>
          <div>
            <span style={{ color: 'var(--smoke)' }}>KPI recomendado (Mosseri 2025): </span>
            <span style={{ color: 'var(--ink)' }}>Compartidos en DM por alcance</span>
          </div>
          <div>
            <span style={{ color: 'var(--smoke)' }}>Modo: </span>
            <span style={{ color: strategy.launch_mode ? 'var(--gold)' : 'var(--celestial)' }}>
              {strategy.launch_mode ? `Lanzamiento — Semana ${launchWeek}` : 'Crecimiento normal'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
