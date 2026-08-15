'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shuffle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { Button, Badge, SectionHeader, Eyebrow, Textarea, Divider } from '@/components/ui'
import Link from 'next/link'

interface Angle {
  id: string
  label: string
  approach: string
  hook: string
  emotion: string
  format_hint: string
}

function generateAngles(idea: string): Angle[] {
  const base = idea.slice(0, 30) || 'esta idea'
  return [
    {
      id: 'a1',
      label: 'Inversión de creencia',
      approach: 'Empezar con lo que "todos creen" y demolerlo',
      hook: `Lo que crees sobre ${base} te está frenando — y yo lo hacía también`,
      emotion: 'Sorpresa → apertura',
      format_hint: 'Reel hablado a cámara',
    },
    {
      id: 'a2',
      label: 'Historia personal',
      approach: 'Narrar el momento exacto en que algo cambió',
      hook: `Hubo un momento en que ${base} dejó de ser un problema para mí`,
      emotion: 'Empatía → identificación',
      format_hint: 'Reel storytelling',
    },
    {
      id: 'a3',
      label: 'Lista de señales',
      approach: 'Enumerar síntomas reconocibles con validación emocional',
      hook: `5 señales de que ${base} te afecta más de lo que crees`,
      emotion: 'Reconocimiento → alivio',
      format_hint: 'Carrusel o reel con texto en pantalla',
    },
    {
      id: 'a4',
      label: 'Reencuadre semántico',
      approach: 'Redefinir el concepto desde una perspectiva nueva',
      hook: `${base} no es lo que te enseñaron. Esto es lo que realmente significa`,
      emotion: 'Curiosidad → revelación',
      format_hint: 'Reel educativo',
    },
    {
      id: 'a5',
      label: 'Pregunta directa',
      approach: 'Abrir con una pregunta que ponga al usuario frente a sí mismo',
      hook: `¿Y si ${base} ya estuviera disponible para ti — y simplemente no lo vieras?`,
      emotion: 'Reflexión → curiosidad',
      format_hint: 'Reel hablado o carrusel introspectivo',
    },
    {
      id: 'a6',
      label: 'Contraste antes/después',
      approach: 'Mostrar la distancia emocional entre dos estados',
      hook: `Antes pensaba que ${base} era imposible. Ahora es mi punto de partida`,
      emotion: 'Esperanza → posibilidad',
      format_hint: 'Reel storytelling o carrusel',
    },
    {
      id: 'a7',
      label: 'Confesión + revelación',
      approach: 'Compartir algo que no se suele decir en voz alta',
      hook: `Nunca lo había dicho así, pero ${base} era lo que más me costaba`,
      emotion: 'Vulnerabilidad → conexión',
      format_hint: 'Reel íntimo a cámara',
    },
    {
      id: 'a8',
      label: 'Permiso explícito',
      approach: 'Darle al usuario algo que nadie le había dado permiso de tener',
      hook: `Tienes permiso de ${base} sin justificarte, sin explicarte, sin disculparte`,
      emotion: 'Alivio → autorización',
      format_hint: 'Reel corto o carrusel de afirmaciones',
    },
    {
      id: 'a9',
      label: 'Desmontaje de mito',
      approach: 'Tomar una creencia muy extendida y desmantelarla con calma',
      hook: `El mito más caro que pagué creer sobre ${base}`,
      emotion: 'Reconocimiento → apertura',
      format_hint: 'Reel educativo o carrusel largo',
    },
  ]
}

function TransformarPageInner() {
  const searchParams = useSearchParams()
  const [idea, setIdea] = useState('')
  const [angles, setAngles] = useState<Angle[]>([])
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingMsg, setLoadingMsg] = useState(0)

  useEffect(() => {
    const hook = searchParams.get('hook')
    if (hook) setIdea(hook)
  }, [searchParams])

  const LOADING_MESSAGES = ['Analizando el núcleo emocional...', 'Generando ángulos alternativos...', 'Ordenando por potencial editorial...']

  async function handleTransform() {
    if (!idea.trim()) return
    setState('loading')
    setLoadingMsg(0)
    for (let i = 0; i < LOADING_MESSAGES.length; i++) {
      await new Promise(r => setTimeout(r, 400))
      setLoadingMsg(i)
    }
    await new Promise(r => setTimeout(r, 400))
    setAngles(generateAngles(idea))
    setState('done')
    setExpandedId(null)
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <SectionHeader
        title="Transformar idea"
        subtitle="Toma una idea y genera múltiples ángulos editoriales para desarrollarla de distintas formas"
        eyebrow="Transformación editorial"
      />

      <div className="rounded-xl border p-5 mb-5 stagger-1 animate-fade-in" style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}>
        <Eyebrow className="mb-3">Idea o hook de partida</Eyebrow>
        <Textarea
          placeholder="Escribe o pega tu idea, hook, o ángulo inicial..."
          value={idea}
          onChange={e => setIdea(e.target.value)}
          rows={3}
          className="mb-4"
        />
        <div className="flex justify-end">
          <Button onClick={handleTransform} disabled={!idea.trim() || state === 'loading'} loading={state === 'loading'}>
            <Shuffle size={14} />
            Generar ángulos
          </Button>
        </div>
      </div>

      {state === 'loading' && (
        <div className="py-16 flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }} />
          </div>
          <p className="text-xs animate-pulse-soft" style={{ color: 'var(--smoke)' }}>{LOADING_MESSAGES[loadingMsg]}</p>
        </div>
      )}

      {state === 'done' && angles.length > 0 && (
        <div className="animate-fade-in">
          <p className="text-xs mb-4" style={{ color: 'var(--smoke)' }}>
            {angles.length} ángulos generados · Haz clic en uno para expandirlo y enviarlo al generador
          </p>
          <div className="space-y-2">
            {angles.map((angle, i) => {
              const isOpen = expandedId === angle.id
              return (
                <div
                  key={angle.id}
                  className={`rounded-xl border overflow-hidden transition-all duration-150 stagger-${Math.min(i + 1, 6)} animate-fade-in`}
                  style={{ background: 'var(--surface)', borderColor: isOpen ? 'var(--gold-border)' : 'var(--dust)' }}
                >
                  <button
                    onClick={() => setExpandedId(isOpen ? null : angle.id)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-semibold"
                      style={{ background: 'var(--gold-light)', color: 'var(--gold)' }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>{angle.label}</span>
                        <span className="text-xs rounded-full px-2 py-0.5" style={{ background: 'var(--surface-2)', color: 'var(--smoke)', border: '1px solid var(--dust)' }}>{angle.format_hint}</span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--smoke)', fontStyle: 'italic' }}>
                        "{angle.hook.slice(0, isOpen ? undefined : 70)}{!isOpen && angle.hook.length > 70 ? '…' : ''}"
                      </p>
                    </div>
                    <div style={{ color: 'var(--smoke-2)', flexShrink: 0, marginTop: 4 }}>
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 animate-fade-in">
                      <Divider className="mb-4" />
                      <div className="space-y-3 mb-4">
                        <div>
                          <Eyebrow className="mb-1">Enfoque</Eyebrow>
                          <p className="text-sm" style={{ color: 'var(--ink)' }}>{angle.approach}</p>
                        </div>
                        <div>
                          <Eyebrow className="mb-1">Arco emocional</Eyebrow>
                          <p className="text-sm" style={{ color: 'var(--gold)' }}>{angle.emotion}</p>
                        </div>
                        <div className="rounded-lg px-4 py-3" style={{ background: 'var(--surface-2)' }}>
                          <Eyebrow className="mb-1.5">Hook completo</Eyebrow>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)', fontStyle: 'italic' }}>"{angle.hook}"</p>
                        </div>
                      </div>
                      <Link href={`/crear?hook=${encodeURIComponent(angle.hook)}`}>
                        <Button size="sm">
                          <ArrowRight size={12} />
                          Desarrollar en generador
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6">
            <Button variant="outline" onClick={() => { setState('idle'); setAngles([]); setIdea('') }}>
              Transformar otra idea
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TransformarPage() {
  return (
    <Suspense>
      <TransformarPageInner />
    </Suspense>
  )
}
