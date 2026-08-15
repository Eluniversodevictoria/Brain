'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button, SectionHeader, Eyebrow, Card } from '@/components/ui'
import { MOCK_VOICE } from '@/lib/mock/data'

export default function VozPage() {
  const v = MOCK_VOICE
  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/base"><Button variant="ghost" size="sm"><ArrowLeft size={14} />Base</Button></Link>
      </div>
      <SectionHeader title="Voz de marca" subtitle="Cómo habla Victoria" eyebrow="Solo lectura — MOCK DATA" />

      <div className="space-y-4 mb-5">
        {[
          { label: 'Cercanía', value: v.closeness },
          { label: 'Espiritualidad', value: v.spirituality_level },
          { label: 'Tipo de español', value: v.spanish_type },
          { label: 'Tono', value: v.tone_description },
        ].map(item => (
          <div key={item.label} className="rounded-lg border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}>
            <Eyebrow className="mb-1">{item.label}</Eyebrow>
            <p className="text-sm" style={{ color: 'var(--ink)' }}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <Eyebrow className="mb-3">Palabras preferidas</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {v.preferred_words.map((w, i) => (
              <span key={i} className="px-2 py-1 rounded-full text-xs" style={{ background: 'var(--sage-light)', color: 'var(--sage)', border: '1px solid rgba(92,122,110,.2)' }}>
                {w}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-3">Palabras prohibidas</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {v.forbidden_words.map((w, i) => (
              <span key={i} className="px-2 py-1 rounded-full text-xs" style={{ background: 'var(--surface-2)', color: 'var(--smoke)', border: '1px solid var(--dust)' }}>
                <span style={{ color: 'var(--blush)', marginRight: 4 }}>✕</span>{w}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
