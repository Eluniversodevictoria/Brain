// SCORING-VICTORIA-v1.2.1 — El Universo de Victoria
// Diseño: SCORING-VICTORIA-v1.2.1.md (aprobado 2026-08-14)
// LOCAL/MOCK — no conecta APIs ni Supabase.
// Implementar runScoring() en server-side cuando se integre Supabase.

import type { MacroTheme, ContentFormatType, ContentObjective, ContentPiece } from '@/types'
import { MOCK_CONTENT_PIECES } from './data'
import type { PublicationStrategy } from './data'

// ── PUBLIC TYPES ───────────────────────────────────────────────────

export interface ScoringContext {
  history: ContentPiece[]       // published pieces, newest first
  bank: ContentPiece[]          // script_ready / produced pieces
  weeklyObjective: ContentObjective
  painRoot: string              // 'general' when not specified
  date: Date
  phase: 'A' | 'B' | 'C'
  thisWeekPieces: ContentPiece[]  // published/scheduled this week (for projected support ratio)
}

export interface ScoreBreakdown {
  strategic: number           // raw strategic_score (0-100)
  evidence: number            // raw evidence_score (0-100)
  underrepresentation: number // raw underrep_score (0-100)
  format_objective: number    // raw format_obj_score (0-100)
  calendar: number            // raw calendar_score (0-100)
  performance: number         // raw perf_score (0-100)
  penalty_theme: number       // raw P_theme penalty (0-100, shown positive)
  penalty_format: number      // raw P_format penalty (0-100, shown positive)
  bank_reuse_bonus: number    // 15 if from_bank, else 0
}

export interface ScoredIdea {
  theme: MacroTheme
  format: ContentFormatType
  objective: ContentObjective
  pillar: string
  pillar_slug: string
  hook_seed: string
  reasoning: string[]
  score: number
  from_bank: boolean
  score_breakdown: ScoreBreakdown
}

// ── STATIC TABLES ──────────────────────────────────────────────────

// strategic_score: CENTRO (100–58) vs SUPPORT (50–17)
// Source: SCORING-VICTORIA-v1.2.md Sección 3.1
export const STRATEGIC_SCORE: Record<MacroTheme, number> = {
  manifestacion:    100,
  dinero:           100,
  abundancia:       83,
  rituales:         83,
  deseos_concretos: 75,
  suerte:           67,
  oportunidades:    67,
  senales:          58,
  numeros_fechas:   50,
  creencias:        50,
  merecimiento:     50,
  desapego:         33,
  amor_relaciones:  17,
}

// evidence_score (0-100): computed from INVESTIGACION-VOC-FASE2.md v0.3
// Formula: Σ min(count/sat, 1) × w_type; bias_multiplier=0.55 for biased_sample themes
// HYPOTHESIS weight = 0 (v1.2.1 P3: hypothesis ≠ evidence)
// Source: SCORING-VICTORIA-v1.2.md Corrección C2, v1.2.1 Corrección P3
export const EVIDENCE_SCORE: Record<MacroTheme, number> = {
  manifestacion:    80,  // VOC(15)+SDS(9)+AQP(4) = 40+25+14.4 → 80
  dinero:           63,  // VOC(5)+SDS(4)+AQP(14,cap) = 25+20+18 → 63
  abundancia:       51,  // VOC(5)+SDS(3)+AQP(3) = 25+15+10.8 → 51
  rituales:         49,  // VOC(4)+SDS(5)+AQP(1) = 20+25+3.6 → 49
  creencias:        50,  // VOC(15×0.55)+SDS(2)+AQP(5) = 22+10+18 → 50 (biased_sample)
  deseos_concretos: 32,  // VOC(3)+SDS(2)+AQP(2) = 15+10+7.2 → 32
  merecimiento:     36,  // VOC(10×0.55)+AQP(4) = 22+14.4 → 36 (biased_sample)
  senales:          15,  // VOC(2)+SDS(1) = 10+5 → 15
  numeros_fechas:   15,  // VOC(1)+SDS(2) = 5+10 → 15
  suerte:           10,  // VOC(1)+SDS(1) = 5+5 → 10
  amor_relaciones:  10,  // VOC(1)+SDS(1) = 5+5 → 10
  oportunidades:     5,  // VOC(1) = 5 → 5 (INSUFFICIENT_EVIDENCE)
  desapego:          5,  // VOC(1) = 5 → 5
}

// SUPPORT themes: soft cap 30% of weekly content (−10 penalty if projected ratio > 0.30)
export const SUPPORT_THEMES = new Set<MacroTheme>([
  'creencias', 'merecimiento', 'desapego', 'amor_relaciones',
])

// Phase weights: [w1..w6] positive factors, [p1..p3] penalty multipliers
// Source: SCORING-VICTORIA-v1.2.md Sección 5
const PHASE_WEIGHTS = {
  A: { w1: 0.35, w2: 0.25, w3: 0.15, w4: 0.15, w5: 0.10, w6: 0.00, p1: 0.28, p2: 0.18, p3: 0.12 },
  B: { w1: 0.30, w2: 0.22, w3: 0.13, w4: 0.15, w5: 0.10, w6: 0.10, p1: 0.25, p2: 0.15, p3: 0.10 },
  C: { w1: 0.25, w2: 0.18, w3: 0.12, w4: 0.15, w5: 0.08, w6: 0.22, p1: 0.22, p2: 0.13, p3: 0.09 },
}

// Format × objective affinity (0-100)
const FORMAT_OBJ_AFFINITY: Partial<Record<ContentFormatType, Partial<Record<ContentObjective, number>>>> = {
  reel_talking:          { grow: 95, comments: 90, connection: 90, shares: 75, nurture: 70, saves: 50, authority: 50 },
  reel_storytelling:     { connection: 90, shares: 90, nurture: 85, comments: 75, grow: 70, saves: 60, authority: 50 },
  reel_educational:      { saves: 95, authority: 90, shares: 70, grow: 70, comments: 60, connection: 50, nurture: 60 },
  affirmation:           { saves: 85, nurture: 85, connection: 75, comments: 50, authority: 40 },
  carousel:              { saves: 90, authority: 85, shares: 75, grow: 60, nurture: 60 },
  pov:                   { connection: 90, comments: 85, shares: 80, grow: 75, nurture: 70 },
  scripting_guided:      { saves: 90, nurture: 85, connection: 80 },
  method_steps:          { saves: 90, authority: 85, shares: 70 },
  signal_date:           { grow: 75, connection: 75, shares: 70, saves: 60 },
  broll_voiceover:       { connection: 80, grow: 70, nurture: 75 },
  visualization:         { saves: 80, nurture: 80, connection: 75 },
  morning_practice:      { nurture: 85, saves: 75, connection: 70 },
  night_practice:        { nurture: 85, saves: 75, connection: 70 },
  qa_response:           { comments: 90, connection: 80, authority: 75 },
  symbolic_object:       { saves: 75, connection: 75, nurture: 70 },
  concrete_desire:       { saves: 80, nurture: 75, connection: 70 },
  manifestation_experiment: { saves: 80, connection: 75, nurture: 70, shares: 65 },
}

// Pillar mapping for UI display
const PILLAR_THEME_MAP: Record<string, MacroTheme[]> = {
  manifestacion:         ['manifestacion', 'desapego'],
  'dinero-abundancia':   ['dinero', 'abundancia'],
  'suerte-oportunidades':['suerte', 'oportunidades'],
  'rituales-practicas':  ['rituales'],
  'senales-sincronias':  ['senales', 'numeros_fechas'],
  'deseo-intencion':     ['deseos_concretos'],
  'creencias-apoyo':     ['creencias', 'merecimiento', 'amor_relaciones'],
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

// Active formats for candidate generation
const ACTIVE_FORMATS: ContentFormatType[] = [
  // Reels
  'reel_talking', 'reel_storytelling', 'reel_educational',
  'affirmation', 'pov', 'scripting_guided',
  'method_steps', 'broll_voiceover', 'signal_date',
  // Carousel
  'carousel',
  // Posts de imagen única — ahora participan en scoring general (/dame-una-idea, /banco)
  'morning_practice', 'night_practice', 'post',
  'symbolic_object', 'concrete_desire',
]

const ALL_THEMES: MacroTheme[] = [
  'manifestacion', 'dinero', 'abundancia', 'suerte', 'oportunidades',
  'rituales', 'senales', 'numeros_fechas', 'deseos_concretos',
  'creencias', 'merecimiento', 'desapego', 'amor_relaciones',
]

const BANK_REUSE_BONUS = 15
const TIE_BAND = 5

// ── PURE FUNCTIONS (exported for tests) ───────────────────────────

export function detectPhase(publishedCount: number): 'A' | 'B' | 'C' {
  if (publishedCount <= 15) return 'A'
  if (publishedCount <= 50) return 'B'
  return 'C'
}

export function getStrategicScore(theme: MacroTheme): number {
  return STRATEGIC_SCORE[theme] ?? 50
}

export function getEvidenceScore(theme: MacroTheme): number {
  return EVIDENCE_SCORE[theme] ?? 10
}

// Returns how many pieces have been published since the last time this theme appeared.
// If theme never appeared: history.length + 1 (maximum absence).
export function getPiecesAbsent(theme: MacroTheme, history: ContentPiece[]): number {
  const sorted = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const idx = sorted.findIndex(p => p.macro_theme === theme)
  return idx === -1 ? sorted.length + 1 : idx
}

export function getUnderrepScore(theme: MacroTheme, history: ContentPiece[]): number {
  const absent = getPiecesAbsent(theme, history)
  if (absent <= 3)  return 0    // in last 3 → no underrep
  if (absent <= 7)  return 20   // recently seen
  if (absent <= 14) return 50   // moderate absence
  if (absent <= 19) return 75   // significant absence
  return 100                    // long absence or never published
}

export function getFormatObjScore(format: ContentFormatType, objective: ContentObjective): number {
  return FORMAT_OBJ_AFFINITY[format]?.[objective] ?? 40
}

// Seasonal calendar boosts for relevant dates
export function getCalendarScore(theme: MacroTheme, date: Date): number {
  const month = date.getMonth() + 1
  const day   = date.getDate()

  if (month === 11 && day >= 9 && day <= 12 && theme === 'numeros_fechas') return 100
  if (month === 1  && day <= 15 && (theme === 'manifestacion' || theme === 'deseos_concretos')) return 80
  if (month === 12 && theme === 'rituales') return 70
  if ((month === 3 || month === 4) && (theme === 'abundancia' || theme === 'oportunidades')) return 60
  return 0
}

export function getPerfScore(
  history: ContentPiece[],
  phase: 'A' | 'B' | 'C'
): number {
  if (phase === 'A') return 0

  const withPerf = history.filter(p => p.performance !== undefined)
  if (withPerf.length === 0) return 50

  const good = withPerf.filter(p => p.performance === 'good').length
  const base = Math.round((good / withPerf.length) * 100)
  return phase === 'B' ? Math.round(base * 0.40) : base
}

export function getThemeRecencyPenalty(theme: MacroTheme, history: ContentPiece[]): number {
  const absent = getPiecesAbsent(theme, history)
  if (absent === 0) return 57   // last piece published
  if (absent <= 2)  return 28   // in last 3
  if (absent <= 6)  return 8    // in last 4–7
  return 0
}

function inferFormat(piece: ContentPiece): ContentFormatType {
  const vd = (piece.visual_direction ?? '').toLowerCase()
  if (vd.includes('carrusel') || vd.includes('slide')) return 'carousel'
  if (vd.includes('storytelling'))                       return 'reel_storytelling'
  if (vd.includes('educativo') || vd.includes('lista'))  return 'reel_educational'
  if (vd.includes('afirmaci'))                           return 'affirmation'
  if (vd.includes('b-roll') || vd.includes('broll'))    return 'broll_voiceover'
  if (vd.includes('pov'))                                return 'pov'
  return 'reel_talking'
}

export function getFormatRecencyPenalty(format: ContentFormatType, history: ContentPiece[]): number {
  const recent = [...history]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(inferFormat)

  const count = recent.filter(f => f === format).length
  if (count >= 3) return 25
  if (count === 2) return 12
  if (count === 1) return 3
  return 0
}

// Projected support ratio AFTER adding this candidate (v1.2.1 P1)
export function getProjectedSupportRatio(theme: MacroTheme, ctx: ScoringContext): number {
  const { thisWeekPieces } = ctx
  const currentSupport = thisWeekPieces.filter(
    p => p.macro_theme && SUPPORT_THEMES.has(p.macro_theme)
  ).length
  const currentTotal    = thisWeekPieces.length
  const projectedSupport = currentSupport + (SUPPORT_THEMES.has(theme) ? 1 : 0)
  const projectedTotal   = currentTotal + 1
  return projectedSupport / projectedTotal
}

// Unified editorial constraints — applies to new candidates AND bank pieces
// MUST be called before bank_reuse_bonus (v1.2.1 P1)
export function applyEditorialConstraints(
  formulaScore: number,
  theme: MacroTheme,
  ctx: ScoringContext
): number {
  let score = formulaScore

  if (SUPPORT_THEMES.has(theme) && getProjectedSupportRatio(theme, ctx) > 0.30) {
    score -= 10
  }

  return score
}

// ── SCORE CANDIDATE (detailed) ─────────────────────────────────────

interface RawFactors {
  strategic: number
  evidence: number
  underrepresentation: number
  format_objective: number
  calendar: number
  performance: number
  penalty_theme: number
  penalty_format: number
}

function getRawFactors(
  theme: MacroTheme,
  format: ContentFormatType,
  objective: ContentObjective,
  ctx: ScoringContext
): RawFactors {
  return {
    strategic:           getStrategicScore(theme),
    evidence:            getEvidenceScore(theme),
    underrepresentation: getUnderrepScore(theme, ctx.history),
    format_objective:    getFormatObjScore(format, objective),
    calendar:            getCalendarScore(theme, ctx.date),
    performance:         getPerfScore(ctx.history, ctx.phase),
    penalty_theme:       getThemeRecencyPenalty(theme, ctx.history),
    penalty_format:      getFormatRecencyPenalty(format, ctx.history),
  }
}

export function scoreCandidate(
  theme: MacroTheme,
  format: ContentFormatType,
  objective: ContentObjective,
  ctx: ScoringContext
): number {
  const f = getRawFactors(theme, format, objective, ctx)
  const w = PHASE_WEIGHTS[ctx.phase]

  const pos = (
    w.w1 * f.strategic +
    w.w2 * f.evidence +
    w.w3 * f.underrepresentation +
    w.w4 * f.format_objective +
    w.w5 * f.calendar +
    w.w6 * f.performance
  )

  const neg = w.p1 * f.penalty_theme + w.p2 * f.penalty_format

  return pos - neg
}

// ── TIE-BREAKER ────────────────────────────────────────────────────

interface ScoredCandidate {
  theme: MacroTheme
  format: ContentFormatType
  objective: ContentObjective
  score: number          // post-constraints score
  rawFactors: RawFactors
}

export function resolveTieBreaker(
  first: ScoredCandidate,
  second: ScoredCandidate,
  history: ContentPiece[]
): ScoredCandidate {
  const absFirst  = getPiecesAbsent(first.theme,  history)
  const absSecond = getPiecesAbsent(second.theme, history)

  if (absFirst  > absSecond) return first
  if (absSecond > absFirst)  return second

  const stratFirst  = getStrategicScore(first.theme)
  const stratSecond = getStrategicScore(second.theme)

  if (stratFirst  > stratSecond) return first
  if (stratSecond > stratFirst)  return second

  return Math.random() < 0.5 ? first : second
}

// ── MAIN ALGORITHM ─────────────────────────────────────────────────

function getPillarForTheme(theme: MacroTheme): { name: string; slug: string } {
  for (const [slug, themes] of Object.entries(PILLAR_THEME_MAP)) {
    if (themes.includes(theme)) return { name: PILLAR_NAMES[slug] ?? slug, slug }
  }
  return { name: 'Manifestación', slug: 'manifestacion' }
}

function buildReasoning(
  theme: MacroTheme,
  format: ContentFormatType,
  fromBank: boolean,
  bankBonus: number,
  factors: RawFactors,
  history: ContentPiece[]
): string[] {
  const THEME_LABELS: Record<MacroTheme, string> = {
    manifestacion: 'Manifestación', dinero: 'Dinero', abundancia: 'Abundancia',
    suerte: 'Suerte', oportunidades: 'Oportunidades', rituales: 'Rituales',
    senales: 'Señales', numeros_fechas: 'Números y fechas', deseos_concretos: 'Deseos concretos',
    creencias: 'Creencias', merecimiento: 'Merecimiento', desapego: 'Desapego',
    amor_relaciones: 'Amor y relaciones',
  }
  const FORMAT_LABELS: Record<ContentFormatType, string> = {
    reel_talking: 'Reel hablado', reel_storytelling: 'Reel storytelling',
    reel_educational: 'Reel educativo', reel_visual: 'Video visual',
    affirmation: 'Afirmación', pov: 'POV', carousel: 'Carrusel', story: 'Story',
    post: 'Post', other: 'Otro', visualization: 'Visualización',
    scripting_guided: 'Scripting dictado', method_steps: 'Método paso a paso',
    morning_practice: 'Práctica matutina', night_practice: 'Práctica nocturna',
    symbolic_object: 'Objeto simbólico', concrete_desire: 'Deseo concreto',
    manifestation_experiment: 'Experimento', qa_response: 'Respuesta Q&A',
    broll_voiceover: 'B-roll + voz', signal_date: 'Señal / fecha',
  }

  const reasons: string[] = []
  const absent = getPiecesAbsent(theme, history)

  if (fromBank) {
    reasons.push(`Pieza del banco reutilizada — ahorra producción (bonus operativo +${bankBonus} pts en selección).`)
  }

  if (absent > history.length) {
    reasons.push(`${THEME_LABELS[theme]} no tiene piezas publicadas — prioridad máxima de diversidad (underrep 100).`)
  } else if (absent === 0) {
    reasons.push(`${THEME_LABELS[theme]} fue la última pieza publicada — penalizado por recencia.`)
  } else {
    reasons.push(`${THEME_LABELS[theme]} ausente ${absent} piezas — momento oportuno para retomarlo (underrep ${factors.underrepresentation}).`)
  }

  const strat = factors.strategic
  if (strat >= 83) {
    reasons.push(`Posicionamiento estratégico alto (${strat}/100) — MacroTheme CENTRO de primera línea.`)
  } else if (SUPPORT_THEMES.has(theme)) {
    reasons.push(`Tema SUPPORT (posicionamiento ${strat}/100) — complementa el contenido CENTRO sin saturar.`)
  } else {
    reasons.push(`Posicionamiento estratégico ${strat}/100 — CENTRO de segundo nivel.`)
  }

  reasons.push(`Evidencia de audiencia: ${factors.evidence}/100 (VOC_REAL + SDS + AQP de FASE 2).`)
  reasons.push(`${FORMAT_LABELS[format] ?? format} — afinidad con objetivo: ${factors.format_objective}/100.`)

  if (factors.penalty_theme > 0) {
    reasons.push(`Penalización por recencia temática activa: −${factors.penalty_theme} pts (raw).`)
  }
  if (factors.calendar > 0) {
    reasons.push(`Boost de calendario activo: ${factors.calendar}/100 — momento editorial relevante.`)
  }

  return reasons
}

export function runScoring(strategy: PublicationStrategy): ScoredIdea {
  const published = MOCK_CONTENT_PIECES
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const bank = MOCK_CONTENT_PIECES
    .filter(p => p.status === 'script_ready' || p.status === 'produced')

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const thisWeekPieces = published.filter(p => new Date(p.created_at) >= oneWeekAgo)

  const ctx: ScoringContext = {
    history: published,
    bank,
    weeklyObjective: strategy.primary_objective,
    painRoot: 'general',
    date: new Date(),
    phase: detectPhase(published.length),
    thisWeekPieces,
  }

  // ── A: Score and filter new candidates ──────────────────────────
  const candidates: ScoredCandidate[] = []

  for (const theme of ALL_THEMES) {
    for (const format of ACTIVE_FORMATS) {
      const rawFactors   = getRawFactors(theme, format, ctx.weeklyObjective, ctx)
      const formulaScore = scoreCandidate(theme, format, ctx.weeklyObjective, ctx)
      const constrained  = applyEditorialConstraints(formulaScore, theme, ctx)  // P2: filter after constraints

      if (constrained <= 0) continue
      candidates.push({ theme, format, objective: ctx.weeklyObjective, score: constrained, rawFactors })
    }
  }

  // ── B: Sort descending ───────────────────────────────────────────
  candidates.sort((a, b) => b.score - a.score)

  // ── C: Tie-breaker → bestNew FINAL ──────────────────────────────
  let bestNew: ScoredCandidate | null = candidates[0] ?? null

  if (candidates.length >= 2) {
    const [first, second] = candidates
    if (Math.abs(first.score - second.score) < TIE_BAND) {
      bestNew = resolveTieBreaker(first, second, ctx.history)
    }
  }

  // ── D: Evaluate bank ────────────────────────────────────────────
  interface BankEntry {
    piece: ContentPiece
    theme: MacroTheme
    format: ContentFormatType
    rawFactors: RawFactors
    formula_raw_score: number
    constrained_raw_score: number
    bank_reuse_bonus: number
    selection_score: number
  }

  const bankEntries: BankEntry[] = ctx.bank
    .filter(p => p.macro_theme)
    .map(p => {
      const theme  = p.macro_theme!
      const format = inferFormat(p)
      const rawFactors        = getRawFactors(theme, format, ctx.weeklyObjective, ctx)
      const formula_raw_score = scoreCandidate(theme, format, ctx.weeklyObjective, ctx)
      const constrained_raw_score = applyEditorialConstraints(formula_raw_score, theme, ctx)
      return {
        piece: p, theme, format, rawFactors,
        formula_raw_score,
        constrained_raw_score,
        bank_reuse_bonus: BANK_REUSE_BONUS,
        selection_score: constrained_raw_score + BANK_REUSE_BONUS,
      }
    })
    .filter(b => b.constrained_raw_score > 0)  // constraint discards before bonus
    .sort((a, b) => b.selection_score - a.selection_score)

  const bestBank = bankEntries[0] ?? null

  // ── E: Compare bestNew FINAL vs bestBank ─────────────────────────
  let fromBank = false
  let selectedTheme: MacroTheme
  let selectedFormat: ContentFormatType
  let selectedScore: number
  let selectedFactors: RawFactors
  let selectedBonus = 0

  if (bestBank && bestNew) {
    if (bestBank.selection_score >= bestNew.score) {
      selectedTheme   = bestBank.theme
      selectedFormat  = bestBank.format
      selectedScore   = bestBank.constrained_raw_score
      selectedFactors = bestBank.rawFactors
      selectedBonus   = BANK_REUSE_BONUS
      fromBank        = true
    } else {
      selectedTheme   = bestNew.theme
      selectedFormat  = bestNew.format
      selectedScore   = bestNew.score
      selectedFactors = bestNew.rawFactors
    }
  } else if (bestBank) {
    selectedTheme   = bestBank.theme
    selectedFormat  = bestBank.format
    selectedScore   = bestBank.constrained_raw_score
    selectedFactors = bestBank.rawFactors
    selectedBonus   = BANK_REUSE_BONUS
    fromBank        = true
  } else if (bestNew) {
    selectedTheme   = bestNew.theme
    selectedFormat  = bestNew.format
    selectedScore   = bestNew.score
    selectedFactors = bestNew.rawFactors
  } else {
    // Fallback (should not happen in normal operation)
    const ctx2 = ctx
    selectedTheme   = 'manifestacion'
    selectedFormat  = 'reel_talking'
    selectedFactors = getRawFactors('manifestacion', 'reel_talking', ctx2.weeklyObjective, ctx2)
    selectedScore   = Math.max(1, scoreCandidate('manifestacion', 'reel_talking', ctx2.weeklyObjective, ctx2))
  }

  // ── F: Build output ──────────────────────────────────────────────
  const { name: pillar, slug: pillar_slug } = getPillarForTheme(selectedTheme)
  const reasoning = buildReasoning(
    selectedTheme, selectedFormat, fromBank, selectedBonus, selectedFactors, ctx.history
  )

  return {
    theme:       selectedTheme,
    format:      selectedFormat,
    objective:   ctx.weeklyObjective,
    pillar,
    pillar_slug,
    hook_seed:   HOOK_SEEDS[selectedTheme] ?? '¿Y si lo que buscas ya existe en ti?',
    reasoning,
    score:       Math.round(selectedScore),
    from_bank:   fromBank,
    score_breakdown: {
      strategic:           selectedFactors.strategic,
      evidence:            selectedFactors.evidence,
      underrepresentation: selectedFactors.underrepresentation,
      format_objective:    selectedFactors.format_objective,
      calendar:            selectedFactors.calendar,
      performance:         selectedFactors.performance,
      penalty_theme:       selectedFactors.penalty_theme,
      penalty_format:      selectedFactors.penalty_format,
      bank_reuse_bonus:    selectedBonus,
    },
  }
}
