'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User, Users, Heart, Sparkles, BarChart2, Mic, BookOpen, ChevronRight
} from 'lucide-react'
import { SectionHeader, Eyebrow, Card } from '@/components/ui'

const SECTIONS = [
  {
    href: '/base/victoria',
    icon: User,
    title: 'Ficha de Victoria',
    desc: 'Backstory, voz, frases recurrentes, restricciones de personaje',
    color: 'var(--gold)',
  },
  {
    href: '/base/avatar',
    icon: Users,
    title: 'Avatar de audiencia',
    desc: 'Perfil del cliente ideal — solo completar con investigación real',
    color: 'var(--sage)',
  },
  {
    href: '/base/dolores',
    icon: Heart,
    title: 'Dolores y deseos',
    desc: 'Biblioteca de dolores por tema — clasificados por tipo de fuente',
    color: 'var(--blush)',
  },
  {
    href: '/base/hooks',
    icon: Sparkles,
    title: 'Biblioteca de hooks',
    desc: 'Plantillas de hooks por mecanismo psicológico',
    color: 'var(--gold)',
  },
  {
    href: '/base/pilares',
    icon: BarChart2,
    title: 'Pilares de contenido',
    desc: 'Los 5-7 pilares temáticos del perfil',
    color: 'var(--sage)',
  },
  {
    href: '/base/formatos',
    icon: BookOpen,
    title: 'Formatos',
    desc: 'Estructuras de video y publicación disponibles',
    color: 'var(--smoke)',
  },
  {
    href: '/base/voz',
    icon: Mic,
    title: 'Voz de marca',
    desc: 'Palabras preferidas, prohibidas, tono y estilo',
    color: 'var(--gold)',
  },
]

export default function BasePage() {
  return (
    <div>
      <SectionHeader
        title="Base estratégica"
        subtitle="El conocimiento que alimenta al agente generador"
      />

      <div
        className="rounded border p-4 mb-6 text-sm"
        style={{ background: 'var(--gold-light)', borderColor: 'var(--gold-border)' }}
      >
        <Eyebrow className="mb-1.5">Recordatorio de investigación</Eyebrow>
        <p style={{ color: 'var(--ink)' }}>
          Antes de completar Dolores, Avatar o Deseos, realiza la fase de investigación de audiencia.
          Mantén siempre la clasificación: <strong>VOC REAL → DATO OBSERVADO → INSIGHT → HIPÓTESIS</strong>.
          No ingreses datos inventados presentados como investigación real.
        </p>
      </div>

      <div className="space-y-2">
        {SECTIONS.map(s => (
          <Link key={s.href} href={s.href}>
            <Card className="p-4 flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
              <div
                className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: `color-mix(in srgb, ${s.color} 12%, transparent)` }}
              >
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{s.title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--smoke)' }}>{s.desc}</div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--smoke-2)', flexShrink: 0 }} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
