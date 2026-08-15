'use client'

import { SectionHeader, Eyebrow, Badge, ProgressBar, Divider } from '@/components/ui'
import { useStrategy } from '@/lib/store'
import { Check, Circle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function getLaunchWeek(startDate: string) {
  const start = new Date(startDate)
  const days = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.min(4, Math.max(1, Math.ceil((days + 1) / 7)))
}

function getLaunchProgress(startDate: string) {
  const start = new Date(startDate)
  const days = Math.max(0, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)))
  return Math.min(100, Math.round((days / 30) * 100))
}

const WEEKS = [
  {
    num: 1,
    label: 'Semana 1',
    title: 'Establecer presencia',
    dates: '3 – 9 agosto',
    objective: 'Alcance e identificación',
    kpi: 'Compartidos en DM / 100 cuentas alcanzadas',
    pieces: [
      { type: 'Reel', hook: '"¿Y si el problema no eres tú sino lo que te enseñaron a creer?"', pillar: 'Identidad', objective: 'Alcance' },
      { type: 'Reel', hook: '"Esto pasa cuando llevas años poniendo a todos primero"', pillar: 'Amor propio', objective: 'Identificación' },
      { type: 'Reel', hook: '"No es que no te lo merezcas — es que nadie te enseñó cómo"', pillar: 'Merecimiento', objective: 'Alcance' },
      { type: 'Carrusel', hook: '5 señales de que crecias cosas limitantes sobre el dinero', pillar: 'Abundancia', objective: 'Guardados' },
    ],
    notes: 'Formato predominante: reel hablado a cámara. Fondo neutro o natural. Sin producción elaborada.',
    status: 'done' as const,
  },
  {
    num: 2,
    label: 'Semana 2',
    title: 'Profundizar en temas que respondieron',
    dates: '10 – 16 agosto',
    objective: 'Conexión + guardados',
    kpi: 'Tasa de guardados / reproducciones completas',
    pieces: [
      { type: 'Reel', hook: '"El día que dejé de pedir permiso para querer más"', pillar: 'Merecimiento', objective: 'Conexión' },
      { type: 'Reel', hook: '"La voz que me decía que era demasiado — y cómo la silencié"', pillar: 'Amor propio', objective: 'Identificación' },
      { type: 'Reel', hook: '"Lo que nadie te dice sobre manifestar sin trabajar la identidad primero"', pillar: 'Manifestación', objective: 'Alcance' },
      { type: 'Carrusel', hook: 'Cómo cambiar una creencia sin afirmaciones que no te crees', pillar: 'Creencias', objective: 'Guardados' },
    ],
    notes: 'Introducir carrusel educativo. Responder comentarios con contenido relacionado.',
    status: 'current' as const,
  },
  {
    num: 3,
    label: 'Semana 3',
    title: 'Primera lectura de datos',
    dates: '17 – 23 agosto',
    objective: 'Autoridad + comentarios',
    kpi: 'Comentarios significativos (no emojis) / número de piezas',
    pieces: [
      { type: 'Reel', hook: '"Esto es lo que encontré después de revisar mis métricas del mes"', pillar: 'Identidad', objective: 'Autoridad' },
      { type: 'Reel', hook: '"La pieza que más compartieron — y por qué creo que resonó"', pillar: 'Merecimiento', objective: 'Conexión' },
      { type: 'Reel', hook: '"3 cosas que aprendí sobre mi audiencia en las primeras 2 semanas"', pillar: 'Creencias', objective: 'Autoridad' },
      { type: 'Carrusel', hook: 'Las preguntas que me están llegando — las respondo con detalle', pillar: 'Amor propio', objective: 'Comentarios' },
    ],
    notes: 'Ajustar según señales reales. Amplificar temas con más respuesta orgánica.',
    status: 'pending' as const,
  },
  {
    num: 4,
    label: 'Semana 4',
    title: 'Consolidación de identidad',
    dates: '24 – 30 agosto',
    objective: 'Nutrición + mes 2',
    kpi: 'Perfil visitado / nuevos seguidores / DMs entrantes',
    pieces: [
      { type: 'Reel', hook: '"Un mes de contenido — lo que cambió y lo que mantendré"', pillar: 'Identidad', objective: 'Conexión' },
      { type: 'Reel', hook: '"Esto es lo que viene — y por qué me entusiasma"', pillar: 'Abundancia', objective: 'Nutrición' },
      { type: 'Reel', hook: '"Para la persona que lleva meses leyéndome sin comentar"', pillar: 'Amor propio', objective: 'Conexión profunda' },
      { type: 'Carrusel', hook: 'Mi método de trabajo: cómo planifico sin perder autenticidad', pillar: 'Identidad', objective: 'Autoridad' },
    ],
    notes: 'Preparar estrategia mes 2. Evaluar si agregar un formato nuevo (lives, close friends).',
    status: 'pending' as const,
  },
]

const SETUP_CHECKLIST = [
  { done: true, label: 'Bio optimizada con propuesta de valor' },
  { done: true, label: 'Nombre de cuenta definido: @eluniversodevictoria' },
  { done: false, label: 'Foto de perfil coherente con la marca' },
  { done: false, label: 'Highlight covers diseñados' },
  { done: false, label: 'Al menos 3 piezas en el feed antes de la primera campaña activa' },
  { done: false, label: 'Story de presentación anclada como primer highlight' },
]

const WHAT_NOT_TO_DO = [
  'No comprar seguidores ni usar pods de engagement',
  'No publicar sin hook pensado (ni contenido de relleno)',
  'No marcar todo como "alta prioridad" — el foco diferencia',
  'No comparar métricas con cuentas en etapas distintas',
  'No cambiar de tema cada semana — la consistencia temática es el activo',
]

const STATUS_COLORS = { done: 'var(--sage)', current: 'var(--gold)', pending: 'var(--dust-2)' }
const STATUS_LABELS_MAP = { done: 'Completada', current: 'En curso', pending: 'Pendiente' }

export default function PlanLanzamientoPage() {
  const { strategy } = useStrategy()
  const launchWeek = getLaunchWeek(strategy.launch_start_date)
  const progress = getLaunchProgress(strategy.launch_start_date)
  const doneSetup = SETUP_CHECKLIST.filter(i => i.done).length

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Plan de lanzamiento 30 días"
        subtitle="v0.2 — hipótesis inicial · APROBADO como estrategia de lanzamiento"
        eyebrow="Agosto 2026"
      />

      {/* Estado actual */}
      <div className="rounded-xl border p-5 mb-6 stagger-1 animate-fade-in" style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}>
        <Eyebrow className="mb-3">Estado actual del lanzamiento</Eyebrow>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Semana', value: `${launchWeek} / 4`, color: 'var(--gold)' },
            { label: 'Progreso', value: `${progress}%`, color: 'var(--sage)' },
            { label: 'Modo', value: strategy.launch_mode ? 'Activo' : 'Pausado', color: strategy.launch_mode ? 'var(--sage)' : 'var(--smoke)' },
            { label: 'Setup', value: `${doneSetup}/${SETUP_CHECKLIST.length}`, color: 'var(--celestial)' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-semibold mb-0.5" style={{ color: stat.color, fontFamily: "'Palatino Linotype', Palatino, Georgia, serif" }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--smoke)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <ProgressBar value={progress} color="var(--gold)" />
        <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--smoke-2)' }}>
          <span>3 ago</span>
          <span>1 sep</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <Eyebrow className="mb-4">Timeline semanal</Eyebrow>
        <div className="space-y-3">
          {WEEKS.map((week, wi) => {
            const isCurrent = week.num === launchWeek
            return (
              <div
                key={week.num}
                className={`rounded-xl border p-5 stagger-${wi + 2} animate-fade-in`}
                style={{
                  background: 'var(--surface)',
                  borderColor: isCurrent ? 'var(--gold-border)' : 'var(--dust)',
                  opacity: week.status === 'pending' ? 0.75 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={week.status === 'done' ? 'sage' : week.status === 'current' ? 'gold' : 'smoke'}>
                        {STATUS_LABELS_MAP[week.status]}
                      </Badge>
                      <span className="text-xs" style={{ color: 'var(--smoke-2)' }}>{week.dates}</span>
                      {isCurrent && <span className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>← Estás aquí</span>}
                    </div>
                    <p className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "'Palatino Linotype', Palatino, Georgia, serif" }}>{week.title}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: STATUS_COLORS[week.status], color: 'white' }}>
                    <span className="text-xs font-bold">{week.num}</span>
                  </div>
                </div>

                <div className="rounded-lg px-3 py-2 mb-3 text-xs" style={{ background: 'var(--gold-light)', border: '1px solid var(--gold-border)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 500 }}>Objetivo: </span>
                  <span style={{ color: 'var(--ink)' }}>{week.objective}</span>
                  <span style={{ color: 'var(--smoke)', marginLeft: 8 }}>KPI: {week.kpi}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {week.pieces.map((piece, pi) => (
                    <div key={pi} className="rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--surface-2)' }}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="smoke">{piece.type}</Badge>
                        <span style={{ color: 'var(--smoke-2)' }}>{piece.pillar} · {piece.objective}</span>
                      </div>
                      <p style={{ color: 'var(--ink)', fontStyle: 'italic', lineHeight: 1.5 }}>"{piece.hook}"</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs" style={{ color: 'var(--smoke)', fontStyle: 'italic' }}>{week.notes}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Setup checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}>
          <Eyebrow className="mb-3">Checklist de configuración</Eyebrow>
          <div className="space-y-2">
            {SETUP_CHECKLIST.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex-shrink-0">
                  {item.done
                    ? <Check size={14} style={{ color: 'var(--sage)' }} />
                    : <Circle size={14} style={{ color: 'var(--dust-2)' }} />}
                </div>
                <span className="text-sm" style={{ color: item.done ? 'var(--ink)' : 'var(--smoke)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--dust)' }}>
          <Eyebrow className="mb-3">Qué no hacer</Eyebrow>
          <div className="space-y-2">
            {WHAT_NOT_TO_DO.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--blush)' }} />
                <span className="text-xs leading-relaxed" style={{ color: 'var(--smoke)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clasificación */}
      <div className="rounded-lg border px-4 py-3 text-xs" style={{ borderColor: 'var(--dust)', background: 'var(--surface-2)' }}>
        <span className="font-semibold" style={{ color: 'var(--gold)' }}>PLAN v0.2 — HIPÓTESIS INICIAL</span>
        <span style={{ color: 'var(--smoke)', marginLeft: 8 }}>
          Aprobado como estrategia de lanzamiento. La semana 3 incluye revisión de datos reales para ajustar semanas siguientes.
          Ver también: <Link href="/estrategia" className="underline" style={{ color: 'var(--gold)' }}>Estrategia de publicación</Link>
        </span>
      </div>
    </div>
  )
}
