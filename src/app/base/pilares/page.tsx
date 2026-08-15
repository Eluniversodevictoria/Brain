'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button, SectionHeader, Badge, Card, Eyebrow } from '@/components/ui'
import { THEME_LABELS } from '@/types'
import { MOCK_PILLARS } from '@/lib/mock/data'

export default function PilaresPage() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/base"><Button variant="ghost" size="sm"><ArrowLeft size={14} />Base</Button></Link>
      </div>
      <SectionHeader title="Pilares de contenido" subtitle={`${MOCK_PILLARS.length} pilares activos`} />

      <div className="space-y-3">
        {MOCK_PILLARS.map((pillar, i) => (
          <Card key={pillar.id} className="p-5">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded flex items-center justify-center text-sm font-semibold flex-shrink-0"
                style={{ background: 'var(--gold-light)', color: 'var(--gold)' }}>{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--ink)', fontFamily: "'Palatino Linotype', Palatino, Georgia, serif", fontSize: '0.95rem' }}>{pillar.name}</p>
                {pillar.description && (
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--smoke)' }}>{pillar.description}</p>
                )}
                {pillar.related_themes && pillar.related_themes.length > 0 && (
                  <div>
                    <Eyebrow className="mb-2">Temas relacionados</Eyebrow>
                    <div className="flex gap-1.5 flex-wrap">
                      {pillar.related_themes.map(t => (
                        <Badge key={t} variant="sage">{THEME_LABELS[t as keyof typeof THEME_LABELS] ?? t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
