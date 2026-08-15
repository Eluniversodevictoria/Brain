'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button, SectionHeader, Badge, Card, Eyebrow } from '@/components/ui'
import { FORMAT_LABELS } from '@/types'
import { MOCK_FORMATS } from '@/lib/mock/data'

export default function FormatosPage() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/base"><Button variant="ghost" size="sm"><ArrowLeft size={14} />Base</Button></Link>
      </div>
      <SectionHeader title="Formatos" subtitle={`${MOCK_FORMATS.length} formatos disponibles`} />

      <div className="space-y-3">
        {MOCK_FORMATS.map(format => (
          <Card key={format.id} className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{format.name}</p>
              <Badge variant="gold">{FORMAT_LABELS[format.format_type] ?? format.format_type}</Badge>
            </div>
            {format.description && (
              <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--smoke)' }}>{format.description}</p>
            )}
            {format.structure && (
              <div className="mb-2">
                <Eyebrow className="mb-1">Estructura</Eyebrow>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink)' }}>{format.structure}</p>
              </div>
            )}
            {format.recommended_length_seconds && (
              <p className="text-xs mt-2" style={{ color: 'var(--smoke-2)' }}>
                Duración sugerida: ~{format.recommended_length_seconds}s
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
