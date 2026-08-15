'use client'

import { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { Button, SectionHeader, Badge, Card, Eyebrow } from '@/components/ui'
import { MECHANISM_LABELS } from '@/types'
import type { HookMechanism } from '@/types'
import { MOCK_HOOKS } from '@/lib/mock/data'

export default function HooksPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const byMechanism = MOCK_HOOKS.reduce<Record<string, typeof MOCK_HOOKS>>((acc, h) => {
    const key = h.mechanism
    acc[key] = acc[key] ? [...acc[key], h] : [h]
    return acc
  }, {})

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/base"><Button variant="ghost" size="sm"><ArrowLeft size={14} />Base</Button></Link>
      </div>
      <SectionHeader title="Biblioteca de hooks" subtitle={`${MOCK_HOOKS.length} hooks por mecanismo`} />

      <div className="space-y-5">
        {Object.entries(byMechanism).map(([mechanism, hooks]) => (
          <div key={mechanism}>
            <div className="flex items-center gap-2 mb-3">
              <Eyebrow>{MECHANISM_LABELS[mechanism as HookMechanism] ?? mechanism}</Eyebrow>
              <span className="text-xs" style={{ color: 'var(--smoke-2)' }}>({hooks.length})</span>
            </div>
            <div className="space-y-2">
              {hooks.map(hook => (
                <Card key={hook.id} className="overflow-hidden">
                  <button
                    className="w-full text-left p-4 flex items-start justify-between gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={() => setExpanded(expanded === hook.id ? null : hook.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ color: 'var(--ink)' }}>{hook.template}</p>
                    </div>
                    <div style={{ color: 'var(--smoke-2)', flexShrink: 0 }}>
                      {expanded === hook.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </button>
                  {expanded === hook.id && (
                    <div className="px-4 pb-4 border-t animate-fade-in" style={{ borderColor: 'var(--dust)' }}>
                      {hook.example_filled && (
                        <div className="pt-3 mb-3">
                          <Eyebrow className="mb-1">Ejemplo</Eyebrow>
                          <p className="text-sm" style={{ color: 'var(--gold)', fontStyle: 'italic' }}>"{hook.example_filled}"</p>
                        </div>
                      )}
                      {hook.why_it_works && (
                        <div>
                          <Eyebrow className="mb-1">Por qué funciona</Eyebrow>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{hook.why_it_works}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
