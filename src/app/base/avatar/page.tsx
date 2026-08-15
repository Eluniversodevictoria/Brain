'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button, SectionHeader, Eyebrow, Card } from '@/components/ui'

const MOCK_AVATAR = {
  name: 'Avatar hipotético v1 — consumidora de manifestación — pendiente de investigación real (FASE 2)',
  age_range: '25–42',
  gender: 'Principalmente mujeres (hipótesis)',
  location: 'Latinoamérica hispanohablante — México, Argentina, Colombia, Chile, Perú',
  profile_summary: 'Mujer adulta que ya consume contenido de manifestación activamente. Ha probado rituales, scripting, afirmaciones y métodos. Cree en el proceso pero siente que algo no está funcionando como debería. La brecha no es de información — es de práctica, constancia o de no entender por qué no le llega lo que pide.',
  daily_reality: [
    'Sigue cuentas de manifestación, abundancia y espiritualidad en Instagram y TikTok',
    'Ha intentado scripting o journaling al menos una vez, aunque no de forma constante',
    'Busca activamente: "cómo manifestar dinero", "ritual de luna llena", "scripting para manifestar"',
    'Guarda contenido de rituales para "hacerlo después" — muchas veces no lo hace',
    'Presta atención a fechas: luna llena, 11/11, equinoccios',
    'Trabaja, estudia o tiene negocio propio — quiere prosperidad sin sentir que pide demasiado',
    'A veces siente que las demás "les funciona" y a ella no — pero sigue intentando',
  ],
  what_she_wants: [
    'Que la manifestación realmente funcione para ella, no solo para otras',
    'Un método claro de scripting que no la haga sentir que lo está haciendo mal',
    'Reconocer las señales del universo sin dudar de su propia mente',
    'Manifestar dinero y oportunidades concretas — no solo bienestar abstracto',
    'Rituales que pueda mantener sin abandonarlos a los 3 días',
    'Soltar el control sin sentir que renuncia a lo que quiere',
    'Sentirse merecedora de recibir lo que pide antes de recibirlo',
  ],
  how_she_finds_victoria: [
    'Feed recomendado de Instagram — Reels de manifestación, scripting o rituales',
    'Compartidos por amigas en DM — "mira este video, creo que te sirve"',
    'Búsqueda de: "scripting para manifestar", "ritual de abundancia", "señales del universo", "cómo manifestar dinero"',
    'TikTok For You page — contenido de manifestación y rituales',
  ],
  classification_note: 'HIPÓTESIS v1 — realineada al nicho de manifestación (agosto 2026). Construida a partir de patrones de referentes (@sermanifiesto, @soymanifiesto_) y dolores observados del nicho. NO basada en entrevistas, encuestas ni VOC real. Completar con investigación real en FASE 2 antes de usar para decisiones editoriales definitivas.',
}

export default function AvatarPage() {
  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/base"><Button variant="ghost" size="sm"><ArrowLeft size={14} />Base</Button></Link>
      </div>
      <SectionHeader title="Avatar de audiencia" subtitle="Perfil hipotético — requiere investigación real" />

      <div className="rounded-lg border px-4 py-3 mb-5 text-xs" style={{ background: 'var(--gold-light)', borderColor: 'var(--gold-border)' }}>
        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>HIPÓTESIS — NO DATO REAL · </span>
        <span style={{ color: 'var(--smoke)' }}>
          Este perfil es exploratorio. No usar para tomar decisiones editoriales definitivas.
          Completar con VOC real, entrevistas y encuestas antes de producción.
        </span>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <Eyebrow className="mb-3">Datos demográficos hipotéticos</Eyebrow>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div><span style={{ color: 'var(--smoke)' }}>Rango de edad: </span><span style={{ color: 'var(--ink)' }}>{MOCK_AVATAR.age_range}</span></div>
            <div><span style={{ color: 'var(--smoke)' }}>Género: </span><span style={{ color: 'var(--ink)' }}>{MOCK_AVATAR.gender}</span></div>
            <div className="col-span-2"><span style={{ color: 'var(--smoke)' }}>Ubicación: </span><span style={{ color: 'var(--ink)' }}>{MOCK_AVATAR.location}</span></div>
          </div>
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-2">Perfil general</Eyebrow>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{MOCK_AVATAR.profile_summary}</p>
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-3">Realidad cotidiana (hipótesis)</Eyebrow>
          <ul className="space-y-2">
            {MOCK_AVATAR.daily_reality.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span style={{ color: 'var(--gold)', flexShrink: 0 }}>·</span>
                <span style={{ color: 'var(--ink)', lineHeight: 1.6 }}>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-3">Lo que quiere (hipótesis)</Eyebrow>
          <ul className="space-y-2">
            {MOCK_AVATAR.what_she_wants.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span style={{ color: 'var(--sage)', flexShrink: 0 }}>·</span>
                <span style={{ color: 'var(--ink)', lineHeight: 1.6 }}>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-3">Cómo llega a Victoria (hipótesis)</Eyebrow>
          <ul className="space-y-1.5">
            {MOCK_AVATAR.how_she_finds_victoria.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span style={{ color: 'var(--celestial)', flexShrink: 0 }}>·</span>
                <span style={{ color: 'var(--ink)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="rounded-lg border px-4 py-3 text-xs" style={{ borderColor: 'var(--dust)', background: 'var(--surface-2)' }}>
          <span style={{ color: 'var(--smoke)', fontStyle: 'italic' }}>{MOCK_AVATAR.classification_note}</span>
        </div>
      </div>
    </div>
  )
}
