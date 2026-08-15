// MOCK — Variation generator. Produces genuinely different content for the same theme.
// Replace angle/hook pools with Claude API call when connected.

import type { MacroTheme, ContentFormatType, ContentObjective, VisualStyle, ContentKind } from '@/types'
import { FORMAT_KIND, VISUAL_STYLE_LABELS } from '@/types'
import { generateMockContent } from './generation'
import type { SavedEntry } from '@/lib/storage/types'

// ── Format pools — keyed by kind ───────────────────────────────────
// These mirror FORMAT_KIND but provide pools for picking variations.
// Carousel and post are SEPARATE from reel — a carousel original
// always produces a carousel variation; post → post; reel → reel.

const FORMATS_BY_KIND: Record<ContentKind, ContentFormatType[]> = {
  reel:     ['reel_talking', 'reel_storytelling', 'reel_educational', 'broll_voiceover', 'affirmation', 'pov', 'scripting_guided'],
  carousel: ['carousel', 'method_steps'],
  post:     ['morning_practice', 'night_practice', 'post', 'symbolic_object', 'concrete_desire'],
}

// ── Objectives rotation ────────────────────────────────────────────

const OBJECTIVE_POOL: ContentObjective[] = ['saves', 'comments', 'shares', 'connection', 'authority']

// ── Theme variation pools ──────────────────────────────────────────
// Each theme has 5 different angles/hooks. Variation picks the next one
// based on a hash of the original entry id.

const VARIATION_POOLS: Record<MacroTheme, string[]> = {
  manifestacion: [
    'La manifestación no es desear — es decidir antes de que el resultado sea visible.',
    'El primer paso de la manifestación no es la visualización. Es la identidad.',
    'Lo que bloquea la manifestación casi nunca es la técnica. Es la duda que queda después.',
    'Hay una diferencia entre manifestar y esperar. Muy poca gente sabe cuál es.',
    'El momento más poderoso de la manifestación es el que nadie muestra en redes.',
  ],
  dinero: [
    'Nadie te enseña que la relación con el dinero empieza mucho antes de que tengas uno.',
    'El dinero no es el premio. Es el reflejo de cuánto permites recibir.',
    'La conversación de dinero que tuviste a los 8 años todavía está tomando decisiones por ti.',
    'No es que no hayas intentado ahorrar. Es que ahorrar requiere creer que el futuro vale la pena.',
    'El dinero que no entra, a veces, es el que subconscientemente rechazas.',
  ],
  abundancia: [
    'La abundancia no empieza cuando llega algo. Empieza cuando dejas de necesitar que llegue para sentirte bien.',
    'Vivir en abundancia no es un estado económico. Es una decisión de percepción.',
    'El problema con esperar la abundancia es que nunca la reconoces cuando llega.',
    'La abundancia ya existe en tu vida. Lo que cambia es si la puedes ver.',
    'Hay abundancia que ya tienes y que todavía no has contado.',
  ],
  suerte: [
    'La suerte no elige personas. Elige frecuencias.',
    'Lo que llamamos suerte es el cruce de preparación y apertura — ambas se entrenan.',
    'Las personas que parecen tener suerte hacen algo diferente antes de que llegue.',
    'No es suerte. Es que siguen diciendo sí cuando tú ya dijiste no.',
    'La suerte favorece a quien actúa sin garantías.',
  ],
  oportunidades: [
    'Hay oportunidades que no ves porque no crees que sean para ti.',
    'Las oportunidades rara vez llegan como las imaginaste. Por eso las dejas pasar.',
    'La oportunidad que pides ya puede haber llegado. La pregunta es si la reconociste.',
    'Lo que bloquea las oportunidades no es el exterior. Es el permiso que no te das.',
    'Una oportunidad disfrazada de trabajo duro todavía es una oportunidad.',
  ],
  rituales: [
    'Un ritual no necesita durar una hora para funcionar. Necesita consistencia.',
    'Los rituales no son superstición. Son la forma más antigua de crear intención deliberada.',
    'El ritual que cambió todo no era el más elaborado. Era el que hacía todos los días.',
    'Un ritual de 3 minutos en el mismo momento del día vale más que uno perfecto que nunca haces.',
    'Lo que importa en un ritual no es la forma. Es el estado que genera en ti.',
  ],
  senales: [
    'Las señales no llegan como truenos. Llegan como susurros que has ignorado tres veces.',
    'Una señal del universo que ignoraste no desaparece. Regresa con más volumen.',
    'Las señales solo se reconocen cuando ya sabes qué estás buscando.',
    '¿Y si la "coincidencia" que ignoraste esta semana era exactamente lo que pediste?',
    'El problema con las señales no es que no lleguen. Es que no las creemos suficientemente grandes.',
  ],
  numeros_fechas: [
    'No es el número en sí — es que te forzó a hacer pausa y preguntarte algo.',
    'Los números no predicen. Recuerdan.',
    'El 11:11 no es magia. Es un recordatorio de que ya llevas tiempo preparándote.',
    'Una fecha significativa no cambia nada sola. Cambia cuando decides usarla.',
    'Los números repetitivos son el universo diciéndote "sigo aquí, ¿y tú?"',
  ],
  deseos_concretos: [
    'Un deseo vago genera resultados vagos. La especificidad es el acto de manifestación más poderoso.',
    'El universo no puede darte lo que no sabes describir.',
    'Cuanto más concreto el deseo, menos lugar deja para la duda.',
    'Lo que diferencia a quien manifiesta de quien espera es la precisión del pedido.',
    'Escribe el deseo tan específico que si llegara hoy, lo reconocerías al instante.',
  ],
  creencias: [
    'La creencia que te frena no llega como limitación. Llega como lógica.',
    'Una creencia limitante no se siente como creencia — se siente como verdad.',
    'No elegiste la mayoría de tus creencias. Las heredaste.',
    'El primer paso para cambiar una creencia no es reemplazarla. Es cuestionarla.',
    'La creencia más poderosa que tienes sobre ti misma es la que nunca has dicho en voz alta.',
  ],
  merecimiento: [
    'El merecimiento no es algo que se consigue. Es algo que se decide.',
    'Nadie te dará lo que tú no crees que mereces — aunque te lo ofrezcan.',
    'Sentirte merecedora no viene del logro. Viene de antes del logro.',
    'El mayor bloqueo no es externo. Es que no crees que es para ti.',
    'Puedes manifestar todo lo que quieras — y seguir rechazándolo si no te crees capaz de tenerlo.',
  ],
  desapego: [
    'Soltar no es dejar de querer. Es dejar de necesitar un resultado específico para estar bien.',
    'El desapego no significa que no importa. Significa que confías en que llegará.',
    'La paradoja: cuanto más sueltas, más cerca llega.',
    'Aferrarte al cómo bloquea el qué.',
    'El desapego se practica, no se decide una sola vez.',
  ],
  amor_relaciones: [
    'Las relaciones que atraes dicen algo sobre lo que crees que mereces.',
    'No puedes recibir amor de una forma que no te permites darte a ti misma.',
    'La relación más importante que tienes es la que tienes contigo.',
    'Manifestar amor empieza antes de conocer a la persona.',
    'Las relaciones sanas no dependen de encontrar a la persona correcta — dependen de ser quien puede recibirla.',
  ],
}

// ── Style pool ─────────────────────────────────────────────────────

const STYLES: VisualStyle[] = ['STYLE_A', 'STYLE_B', 'STYLE_C', 'STYLE_D', 'STYLE_E', 'STYLE_F']

// ── Core variation logic ───────────────────────────────────────────

function intHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function pickDifferent<T>(pool: T[], current: T, seed: number): T {
  const others = pool.filter(x => x !== current)
  if (others.length === 0) return pool[(seed + 1) % pool.length]
  return others[seed % others.length]
}

export interface VariationResult {
  hook: string          // '' for carousel and post
  main_text: string     // cover_text for carousel, image_text for post, on_screen_text for reel
  slides_count?: number // only set for carousel, to inform the UI
  cta: string
  caption: string
  hashtags: string[]
  visual_style: VisualStyle
  visual_style_label: string
  format: ContentFormatType
  objective: ContentObjective
  kind: ContentKind     // 'reel' | 'carousel' | 'post'
}

export function generateVariation(original: SavedEntry): VariationResult {
  const seed = intHash(original.id)

  // Derive the original kind from its format (authoritative source of truth)
  const originalKind: ContentKind = FORMAT_KIND[original.format] ?? 'reel'

  // Variation always stays within the same kind:
  // reel original → reel variation, carousel → carousel, post → post
  const formatPool = FORMATS_BY_KIND[originalKind]
  const newFormat = pickDifferent(formatPool, original.format, seed >> 2)

  // Different objective
  const newObjective = pickDifferent(OBJECTIVE_POOL, original.objective, seed >> 4)

  // Different visual style
  const newStyle = pickDifferent(STYLES, original.visual_style, seed >> 3)

  // Different hook angle (reel/post); carousel uses cover slide from generator
  const hookPool = VARIATION_POOLS[original.theme] ?? VARIATION_POOLS.manifestacion
  const originalIdx = hookPool.findIndex(h => h === original.hook)
  const nextIdx = originalIdx >= 0
    ? (originalIdx + 1 + (seed % (hookPool.length - 1))) % hookPool.length
    : seed % hookPool.length
  const variationHook = hookPool[nextIdx]

  // Generate new content body
  const generated = generateMockContent(original.theme, newFormat, newObjective)
  const newKind = FORMAT_KIND[newFormat]

  // Extract the flat fields per kind — no casts, just narrowing
  let hook = ''
  let main_text = ''
  let slides_count: number | undefined

  switch (generated.kind) {
    case 'reel':
      hook = variationHook
      main_text = generated.on_screen_text
      break
    case 'carousel':
      // Carousel variations use the cover slide as the preview text.
      // The full slides are available via generateMockContent if needed.
      hook = ''
      main_text = generated.cover_text
      slides_count = generated.slides.length
      break
    case 'post':
      hook = ''
      main_text = generated.image_text
      break
  }

  return {
    hook,
    main_text,
    slides_count,
    cta: generated.cta,
    caption: generated.caption,
    hashtags: generated.hashtags,
    visual_style: newStyle,
    visual_style_label: VISUAL_STYLE_LABELS[newStyle],
    format: newFormat,
    objective: newObjective,
    kind: newKind,
  }
}
