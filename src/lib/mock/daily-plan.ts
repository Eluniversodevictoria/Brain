// MOCK — Plan semanal de contenido.
// Prioridad editorial: imagen única > reel > carrusel ocasional.
// Builds on SCORING-VICTORIA-v1.2.1 without modifying scoring.ts.

import type { MacroTheme, ContentFormatType, ContentObjective } from '@/types'
import {
  detectPhase,
  getStrategicScore,
  getEvidenceScore,
  getUnderrepScore,
  getFormatObjScore,
  getCalendarScore,
  getPerfScore,
  getThemeRecencyPenalty,
  getFormatRecencyPenalty,
  applyEditorialConstraints,
  type ScoringContext,
  type ScoredIdea,
  type ScoreBreakdown,
} from './scoring'
import { generateMockContent, type LengthBias } from './generation'
import { MOCK_CONTENT_PIECES, type PublicationStrategy } from './data'
import type { GeneratedContent } from '@/types'
import type { SavedEntry } from '@/lib/storage/types'

export interface DailyPost {
  index: number         // 1–9 (6 imagen + 2 reel + 0–1 carousel)
  kind: 'image' | 'reel' | 'carousel'
  idea: ScoredIdea
  content: GeneratedContent
  referenceLink: string
}

// ── Familias de formato ──────────────────────────────────────────────

const IMAGE_FORMATS: ContentFormatType[] = [
  'morning_practice', 'night_practice', 'post', 'symbolic_object', 'concrete_desire',
]
const REEL_FORMATS: ContentFormatType[] = [
  'reel_talking', 'reel_storytelling', 'reel_educational', 'broll_voiceover',
]
const CAROUSEL_FORMATS: ContentFormatType[] = [
  'carousel', 'method_steps',
]

const ALL_THEMES: MacroTheme[] = [
  'manifestacion', 'dinero', 'abundancia', 'suerte', 'oportunidades',
  'rituales', 'senales', 'numeros_fechas', 'deseos_concretos',
  'creencias', 'merecimiento', 'desapego', 'amor_relaciones',
]

// ── Parámetros de diversidad editorial ──────────────────────────────
// Aplicados DESPUÉS del scoring estratégico, en la capa de planner.
// No tocan FORMAT_OBJ_AFFINITY ni scoring.ts.

// Descuento por cada vez adicional que el mismo formato imagen aparece en la semana.
// Primera aparición: 0. Segunda: -PENALTY. Tercera: -2×PENALTY. Etcétera.
const PENALTY_PER_USE = 20

// Bonus para formatos de imagen que aún no han aparecido esta semana.
// Evita que formatos con affinity baja (ej. `post`) queden sistemáticamente excluidos.
// No es una cuota — si un formato sigue siendo menos relevante después del bonus, no entra.
const UNUSED_FORMAT_BONUS = 30

// Un carrusel aparece solo si su score supera este umbral para el objetivo semanal.
// carousel: saves=90, authority=85; para nurture/connection scores son bajos → no activa.
const CAROUSEL_SCORE_THRESHOLD = 65

// ── Underrepresentation de longitud 'long' ───────────────────────────
// El planner rastrea cuántos slots de imagen consecutivos han pasado sin producir un 'long'.
// Cuando la sequía supera el umbral, pasa un bias suave a generatePost().
// El generador aplica el bias pero no conoce la política editorial.

// Umbral en slots (6 imágenes/semana ≈ 8 slots = ~1.3 semanas)
function calcLongBias(longDryStreak: number): LengthBias {
  if (longDryStreak < 8)  return {}
  if (longDryStreak < 12) return { long: 2 }
  if (longDryStreak < 16) return { long: 4 }
  return { long: 6 }
}

// Calcula cuántos posts de imagen consecutivos más recientes NO son 'long'.
// Recorre el historial de más reciente a más antiguo (history ya viene ordenado desc).
// Solo cuenta entradas kind='post' o legacy kind='image'.
// Reels y carruseles se ignoran — no suman ni resetean el streak.
// Entradas legacy sin image_text_length se tratan como non-long (conservador).
// Exportada para poder escribir tests unitarios.
export function estimateLongDryStreakFromHistory(history: SavedEntry[]): number {
  let streak = 0
  for (const entry of history) {
    const isImage = entry.kind === 'post' || entry.kind === 'image'
    if (!isImage) continue                          // reel / carousel: ignora
    if (entry.image_text_length === 'long') break   // encontramos el último long: para
    streak++                                         // post sin long (o sin dato): cuenta
  }
  return streak
}

const HOOK_SEEDS: Record<MacroTheme, string> = {
  manifestacion:    'Llevo años estudiando manifestación y el error más común no es el que crees.',
  dinero:           'El día que entendí que no quería el dinero — quería el permiso de sentirme segura.',
  abundancia:       'Nunca había pensado en la abundancia como algo que ya está — hasta que dejé de buscarla en el futuro.',
  suerte:           'La suerte no es aleatoria. Tiene una frecuencia — y se puede aprender a sintonizarla.',
  oportunidades:    'Hay oportunidades que no ves porque no crees que son para ti.',
  rituales:         'Un ritual no es superstición. Es una conversación consciente con tu propia energía.',
  senales:          '¿Y si las señales que buscas ya están en tu día a día — y simplemente no las estás leyendo?',
  numeros_fechas:   'El 11/11 no es magia. Es un recordatorio de que ya llevas tiempo preparándote para esto.',
  deseos_concretos: 'Lo que pides al universo no puede ser vago. Te explico por qué.',
  creencias:        'Si te has dicho "yo no soy de las que tienen eso" — necesitas ver esto.',
  merecimiento:     'Nadie te va a dar lo que tú misma no consideras que mereces.',
  desapego:         '¿Y si soltar no significa que ya no te importa? ¿Y si es exactamente lo contrario?',
  amor_relaciones:  'Hay algo sobre las relaciones que nadie te dice porque no es cómodo de escuchar.',
}

const PILLAR_THEME_MAP: Record<string, MacroTheme[]> = {
  manifestacion:          ['manifestacion', 'desapego'],
  'dinero-abundancia':    ['dinero', 'abundancia'],
  'suerte-oportunidades': ['suerte', 'oportunidades'],
  'rituales-practicas':   ['rituales'],
  'senales-sincronias':   ['senales', 'numeros_fechas'],
  'deseo-intencion':      ['deseos_concretos'],
  'creencias-apoyo':      ['creencias', 'merecimiento', 'amor_relaciones'],
}

const PILLAR_NAMES: Record<string, string> = {
  manifestacion:          'Manifestación',
  'dinero-abundancia':    'Dinero y abundancia',
  'suerte-oportunidades': 'Suerte y oportunidades',
  'rituales-practicas':   'Rituales y prácticas',
  'senales-sincronias':   'Señales y sincronías',
  'deseo-intencion':      'Deseo e intención',
  'creencias-apoyo':      'Creencias y apoyo',
}

function getPillar(theme: MacroTheme): { name: string; slug: string } {
  for (const [slug, themes] of Object.entries(PILLAR_THEME_MAP)) {
    if (themes.includes(theme)) return { name: PILLAR_NAMES[slug] ?? slug, slug }
  }
  return { name: 'Manifestación', slug: 'manifestacion' }
}

interface Candidate {
  theme: MacroTheme
  format: ContentFormatType
  score: number
  breakdown: ScoreBreakdown
}

// ── Scoring estratégico (sin cambios respecto a scoring.ts) ──────────

function scoreAll(
  formats: ContentFormatType[],
  objective: ContentObjective,
  ctx: ScoringContext
): Candidate[] {
  const out: Candidate[] = []
  for (const theme of ALL_THEMES) {
    for (const format of formats) {
      const raw = {
        strategic:           getStrategicScore(theme),
        evidence:            getEvidenceScore(theme),
        underrepresentation: getUnderrepScore(theme, ctx.history),
        format_objective:    getFormatObjScore(format, objective),
        calendar:            getCalendarScore(theme, ctx.date),
        performance:         getPerfScore(ctx.history, ctx.phase),
        penalty_theme:       getThemeRecencyPenalty(theme, ctx.history),
        penalty_format:      getFormatRecencyPenalty(format, ctx.history),
      }
      const w = ctx.phase === 'A'
        ? { w1:0.35, w2:0.25, w3:0.15, w4:0.15, w5:0.10, w6:0.00, p1:0.28, p2:0.18 }
        : ctx.phase === 'B'
        ? { w1:0.30, w2:0.22, w3:0.13, w4:0.15, w5:0.10, w6:0.10, p1:0.25, p2:0.15 }
        : { w1:0.25, w2:0.18, w3:0.12, w4:0.15, w5:0.08, w6:0.22, p1:0.22, p2:0.13 }

      const pos = w.w1*raw.strategic + w.w2*raw.evidence + w.w3*raw.underrepresentation +
                  w.w4*raw.format_objective + w.w5*raw.calendar + w.w6*raw.performance
      const neg = w.p1*raw.penalty_theme + w.p2*raw.penalty_format
      const base = pos - neg
      const constrained = applyEditorialConstraints(base, theme, ctx)
      if (constrained <= 0) continue
      out.push({
        theme, format, score: constrained,
        breakdown: { ...raw, bank_reuse_bonus: 0 },
      })
    }
  }
  out.sort((a, b) => b.score - a.score)
  return out
}

// ── Selección con cooldown + bonus de underrepresentation ────────────
// Selecciona N candidatos de imagen uno a uno, recomputando scores
// tras cada pick para aplicar penalizaciones y bonus correctamente.

function pickImagesWithDiversity(
  strategicCandidates: Candidate[],
  n: number,
): Candidate[] {
  const picked: Candidate[] = []
  const usedThemes = new Set<MacroTheme>()
  const formatUses: Partial<Record<ContentFormatType, number>> = {}

  for (let i = 0; i < n; i++) {
    let best: (Candidate & { adjustedScore: number }) | null = null

    for (const c of strategicCandidates) {
      if (usedThemes.has(c.theme)) continue

      const uses = formatUses[c.format] ?? 0
      const cooldownPenalty = uses * PENALTY_PER_USE
      const freshBonus = uses === 0 ? UNUSED_FORMAT_BONUS : 0
      const adjustedScore = c.score - cooldownPenalty + freshBonus

      if (!best || adjustedScore > best.adjustedScore) {
        best = { ...c, adjustedScore }
      }
    }

    if (!best) break
    picked.push(best)
    usedThemes.add(best.theme)
    formatUses[best.format] = (formatUses[best.format] ?? 0) + 1
  }

  return picked
}

// Pick N with diverse themes, no format diversity (for reels/carousel)
function pickDiverse(
  candidates: Candidate[],
  n: number,
  excludeThemes: Set<MacroTheme> = new Set()
): Candidate[] {
  const picked: Candidate[] = []
  const usedThemes = new Set(excludeThemes)
  for (const c of candidates) {
    if (picked.length >= n) break
    if (!usedThemes.has(c.theme)) { picked.push(c); usedThemes.add(c.theme) }
  }
  if (picked.length < n) {
    for (const c of candidates) {
      if (picked.length >= n) break
      if (!picked.includes(c)) picked.push(c)
    }
  }
  return picked
}

function buildIdea(c: Candidate, ctx: ScoringContext): ScoredIdea {
  const { name: pillar, slug: pillar_slug } = getPillar(c.theme)
  return {
    theme: c.theme,
    format: c.format,
    objective: ctx.weeklyObjective,
    pillar,
    pillar_slug,
    hook_seed: HOOK_SEEDS[c.theme] ?? '¿Y si lo que buscas ya existe en ti?',
    reasoning: [],
    score: Math.round(c.score),
    from_bank: false,
    score_breakdown: c.breakdown,
  }
}

export function runDailyPlan(strategy: PublicationStrategy, savedEntries: SavedEntry[] = []): DailyPost[] {
  const published = MOCK_CONTENT_PIECES
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const thisWeekPieces = published.filter(p => new Date(p.created_at) >= oneWeekAgo)

  const ctx: ScoringContext = {
    history: published,
    bank: MOCK_CONTENT_PIECES.filter(p => p.status === 'script_ready' || p.status === 'produced'),
    weeklyObjective: strategy.primary_objective,
    painRoot: 'general',
    date: new Date(),
    phase: detectPhase(published.length),
    thisWeekPieces,
  }

  // ── Scoring estratégico ──────────────────────────────────────────
  const imageCandidates   = scoreAll(IMAGE_FORMATS,    ctx.weeklyObjective, ctx)
  const reelCandidates    = scoreAll(REEL_FORMATS,     ctx.weeklyObjective, ctx)
  const carouselCandidates = scoreAll(CAROUSEL_FORMATS, ctx.weeklyObjective, ctx)

  // ── Selección con diversidad editorial ──────────────────────────
  // 6 imágenes con cooldown de formato + bonus de underrepresentation
  const top6Images = pickImagesWithDiversity(imageCandidates, 6)
  const imageThemes = new Set(top6Images.map(c => c.theme))

  // 2 reels con temas distintos a los de imagen
  const top2Reels = pickDiverse(reelCandidates, 2, imageThemes)
  const reelThemes = new Set(top2Reels.map(c => c.theme))

  // Carrusel opcional: solo si su score supera el umbral para el objetivo semanal
  const allUsedThemes = new Set([...imageThemes, ...reelThemes])
  const topCarousel = pickDiverse(carouselCandidates, 1, allUsedThemes)
  const includeCarousel = topCarousel.length > 0 &&
    topCarousel[0].score >= CAROUSEL_SCORE_THRESHOLD

  // ── Generación de contenido ──────────────────────────────────────
  const posts: DailyPost[] = []
  const daySeed = ctx.date.getFullYear() * 366 + ctx.date.getMonth() * 31 + ctx.date.getDate()

  // El streak se deriva del historial local real (savedEntries viene de useContentStorage).
  // Cada entrada kind='post' con image_text_length guardado contribuye al cálculo.
  // El historial ya viene ordenado desc por saved_at (más reciente primero).
  // Compatibilidad: entradas legacy sin image_text_length se tratan como non-long.
  let longDryStreak = estimateLongDryStreakFromHistory(savedEntries)

  for (let i = 0; i < top6Images.length; i++) {
    const c = top6Images[i]
    const idea = buildIdea(c, ctx)
    const slotSeed = daySeed + i * 7
    const lengthBias = calcLongBias(longDryStreak)
    const raw = generateMockContent(c.theme, c.format, ctx.weeklyObjective, { seed: slotSeed, lengthBias })
    if (raw.kind === 'carousel') {
      throw new Error(`[daily-plan] format ${c.format} produced carousel — carousel must not be in IMAGE_FORMATS`)
    }
    // Actualiza el streak antes del siguiente slot
    if (raw.kind === 'post' && raw.image_text_length === 'long') {
      longDryStreak = 0
    } else {
      longDryStreak++
    }
    posts.push({ index: i + 1, kind: 'image', idea, content: raw, referenceLink: '' })
  }

  for (let i = 0; i < top2Reels.length; i++) {
    const c = top2Reels[i]
    const idea = buildIdea(c, ctx)
    const raw = generateMockContent(c.theme, c.format, ctx.weeklyObjective)
    if (raw.kind === 'carousel') {
      throw new Error(`[daily-plan] reel format ${c.format} produced carousel`)
    }
    posts.push({ index: 6 + i + 1, kind: 'reel', idea, content: raw, referenceLink: '' })
  }

  if (includeCarousel) {
    const c = topCarousel[0]
    const idea = buildIdea(c, ctx)
    const raw = generateMockContent(c.theme, c.format, ctx.weeklyObjective)
    posts.push({ index: 9, kind: 'carousel', idea, content: raw, referenceLink: '' })
  }

  return posts
}
