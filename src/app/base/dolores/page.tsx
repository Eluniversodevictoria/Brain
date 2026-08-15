'use client'

import { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { Button, Badge, SectionHeader, Eyebrow, Card, Select, VocBadge, ConfidenceBadge } from '@/components/ui'
import { THEME_LABELS } from '@/types'
import type { MacroTheme, VocType } from '@/types'
import { MOCK_PAINS } from '@/lib/mock/data'
import type { PainWithConfidence } from '@/lib/mock/data'

type ConfidenceLevel = 'verified' | 'supported' | 'emerging' | 'hypothesis'

const VOC_LABELS: Record<VocType, string> = {
  voc_real: 'VOC Real',
  dato_observado: 'Dato Observado',
  insight: 'Insight',
  hipotesis: 'Hipótesis',
}

const ALL_THEMES = Object.keys(THEME_LABELS) as MacroTheme[]
const ALL_VOC_TYPES: VocType[] = ['voc_real', 'dato_observado', 'insight', 'hipotesis']

export default function DoloresPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterTheme, setFilterTheme] = useState<MacroTheme | ''>('')
  const [filterVoc, setFilterVoc] = useState<VocType | ''>('')

  const filtered = MOCK_PAINS.filter(p => {
    if (filterTheme && p.macro_theme !== filterTheme) return false
    if (filterVoc && p.voc_type !== filterVoc) return false
    return true
  })

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/base"><Button variant="ghost" size="sm"><ArrowLeft size={14} />Base</Button></Link>
      </div>
      <SectionHeader title="Dolores y deseos" subtitle={`${MOCK_PAINS.length} entradas`} />

      <div className="rounded-lg border px-4 py-3 mb-5 text-xs" style={{ background: 'var(--gold-light)', borderColor: 'var(--gold-border)' }}>
        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>INVESTIGACIÓN V0 — EXPLORATORIO · </span>
        <span style={{ color: 'var(--smoke)' }}>
          Clasificación obligatoria: <strong style={{ color: 'var(--ink)' }}>VOC REAL → DATO OBSERVADO → INSIGHT → HIPÓTESIS</strong>.
          No completar Supabase con VOC ficticio. No marcar hipótesis como datos reales.
        </span>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <Select value={filterTheme} onChange={e => setFilterTheme(e.target.value as MacroTheme | '')} className="w-auto min-w-[160px] text-xs">
          <option value="">Todos los temas ({MOCK_PAINS.length})</option>
          {ALL_THEMES.map(t => <option key={t} value={t}>{THEME_LABELS[t]} ({MOCK_PAINS.filter(p => p.macro_theme === t).length})</option>)}
        </Select>
        <Select value={filterVoc} onChange={e => setFilterVoc(e.target.value as VocType | '')} className="w-auto min-w-[150px] text-xs">
          <option value="">Todos los tipos</option>
          {ALL_VOC_TYPES.map(v => <option key={v} value={v}>{VOC_LABELS[v]} ({MOCK_PAINS.filter(p => p.voc_type === v).length})</option>)}
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map(pain => (
          <div key={pain.id} className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: expanded === pain.id ? 'var(--gold-border)' : 'var(--dust)' }}>
            <button
              className="w-full text-left px-4 py-3 flex items-start gap-3 hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => setExpanded(expanded === pain.id ? null : pain.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge variant="sage">{THEME_LABELS[pain.macro_theme]}</Badge>
                  <VocBadge type={pain.voc_type} />
                  <ConfidenceBadge level={(pain as PainWithConfidence).confidence_level as ConfidenceLevel} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{pain.micro_label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--smoke)' }}>{pain.surface_pain?.slice(0, 80)}{(pain.surface_pain?.length ?? 0) > 80 ? '…' : ''}</p>
              </div>
              <div style={{ color: 'var(--smoke-2)', flexShrink: 0, marginTop: 4 }}>
                {expanded === pain.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {expanded === pain.id && (
              <div className="px-4 pb-4 border-t animate-fade-in" style={{ borderColor: 'var(--dust)' }}>
                <div className="pt-3 space-y-3">
                  {pain.surface_pain && <F label="Dolor superficial" value={pain.surface_pain} />}
                  {pain.emotional_pain && <F label="Dolor emocional" value={pain.emotional_pain} />}
                  {pain.private_thought && <F label="Pensamiento privado (audiencia)" value={pain.private_thought} note="No atribuir a Victoria" />}
                  {pain.core_fear && <F label="Miedo central" value={pain.core_fear} />}
                  {pain.surface_desire && <F label="Deseo superficial" value={pain.surface_desire} />}
                  {pain.deep_desire && <F label="Deseo profundo" value={pain.deep_desire} />}
                  {pain.daily_situations && pain.daily_situations.length > 0 && (
                    <div>
                      <Eyebrow className="mb-1.5">Situaciones cotidianas</Eyebrow>
                      <ul className="space-y-1">
                        {pain.daily_situations.map((s, i) => (
                          <li key={i} className="text-xs flex gap-1.5" style={{ color: 'var(--ink)' }}>
                            <span style={{ color: 'var(--smoke)' }}>·</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pain.source_notes && <F label="Fuente / trazabilidad" value={pain.source_notes} />}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-14 text-center" style={{ color: 'var(--smoke)' }}>
          <p className="text-sm">Sin entradas que coincidan</p>
        </div>
      )}
    </div>
  )
}

function F({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <Eyebrow className="mb-1">{label}</Eyebrow>
      {note && <p className="text-xs mb-1" style={{ color: 'var(--blush)' }}>{note}</p>}
      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{value}</p>
    </div>
  )
}
