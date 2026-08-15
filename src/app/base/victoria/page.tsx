'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button, SectionHeader, Eyebrow, Card, Divider } from '@/components/ui'
import { MOCK_VICTORIA } from '@/lib/mock/data'

export default function VictoriaPage() {
  const v = MOCK_VICTORIA
  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/base">
          <Button variant="ghost" size="sm"><ArrowLeft size={14} />Base</Button>
        </Link>
      </div>
      <SectionHeader title="Ficha de Victoria" subtitle="Solo hechos establecidos — lectura" eyebrow="FICHA PERSONAJE" />

      <div className="rounded-lg border px-4 py-3 mb-5 text-xs" style={{ background: 'var(--gold-light)', borderColor: 'var(--gold-border)' }}>
        <span style={{ color: 'var(--gold)', fontWeight: 500 }}>Datos de personaje confirmados · </span>
        <span style={{ color: 'var(--smoke)' }}>
          No inventar: divorcios, hijos, embarazos, muertes, enfermedades, deudas, despidos, diagnósticos, traumas, relaciones abusivas.
        </span>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <Eyebrow className="mb-3">Identidad</Eyebrow>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div><span style={{ color: 'var(--smoke)' }}>Nombre: </span><span style={{ color: 'var(--ink)' }}>Victoria</span></div>
            <div><span style={{ color: 'var(--smoke)' }}>Edad: </span><span style={{ color: 'var(--ink)' }}>32–36</span></div>
            <div><span style={{ color: 'var(--smoke)' }}>Instagram: </span><span style={{ color: 'var(--ink)' }}>@eluniversodevictoria</span></div>
          </div>
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-3">Backstory (hechos establecidos)</Eyebrow>
          <ul className="space-y-1.5">
            {v.bio_facts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span style={{ color: 'var(--gold)', flexShrink: 0 }}>·</span>
                <span style={{ color: 'var(--ink)', lineHeight: 1.6 }}>{fact}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-2">Posicionamiento</Eyebrow>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{v.positioning}</p>
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-2">Nota de evolución</Eyebrow>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)', fontStyle: 'italic' }}>{v.evolution_note}</p>
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-2">Prácticas que el contenido puede cubrir</Eyebrow>
          <p className="text-xs mb-3" style={{ color: 'var(--smoke)', fontStyle: 'italic' }}>Lo que el contenido puede explicar o mostrar — no credenciales biográficas</p>
          <ul className="space-y-1.5">
            {v.covered_practices.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span style={{ color: 'var(--sage)', flexShrink: 0 }}>·</span>
                <span style={{ color: 'var(--ink)', lineHeight: 1.6 }}>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-2">Dominios temáticos del contenido</Eyebrow>
          <p className="text-xs mb-3" style={{ color: 'var(--smoke)', fontStyle: 'italic' }}>Territorios editoriales — no implica certificación ni expertise formal</p>
          <ul className="space-y-1.5">
            {v.content_domains.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span style={{ color: 'var(--celestial)', flexShrink: 0 }}>·</span>
                <span style={{ color: 'var(--ink)', lineHeight: 1.6 }}>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-3">Frases recurrentes</Eyebrow>
          <div className="space-y-2">
            {v.recurring_phrases.map((phrase, i) => (
              <div key={i} className="rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--surface-2)', color: 'var(--ink)', fontStyle: 'italic' }}>
                "{phrase}"
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-3">Victoria nunca diría</Eyebrow>
          <div className="space-y-1.5">
            {v.would_never_say.map((phrase, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span style={{ color: 'var(--blush)', flexShrink: 0 }}>✕</span>
                <span style={{ color: 'var(--smoke)', fontStyle: 'italic' }}>{phrase}</span>
              </div>
            ))}
          </div>
          <Divider className="my-3" />
          <div>
            <Eyebrow className="mb-2">Nunca inventar</Eyebrow>
            <div className="space-y-1">
              {v.never_invent.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span style={{ color: 'var(--blush)', flexShrink: 0 }}>✕</span>
                  <span style={{ color: 'var(--smoke)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
