// MOCK DATA — Week organizer algorithm. Replace with server-side logic after approval.
import type { MacroTheme, ContentFormatType, ContentObjective, ContentPiece } from '@/types'
import { MOCK_CONTENT_PIECES } from './data'
import type { PublicationStrategy } from './data'

export interface WeekDayPlan {
  day: number // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  dayName: string
  content_piece: ContentPiece
  format: ContentFormatType
  theme: MacroTheme
  objective: ContentObjective
  pillar: string
  hypothesis_applied: string
}

export interface WeekPlan {
  entries: WeekDayPlan[]
  total_reels: number
  total_carrusels: number
  pillar_distribution: Record<string, number>
  objective_distribution: Record<string, number>
  week_objective: string
}

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const DAY_HYPOTHESES: Record<number, { preferred_format: ContentFormatType, preferred_objective: ContentObjective, rationale: string }> = {
  0: { preferred_format: 'reel_talking', preferred_objective: 'grow', rationale: 'HIPÓTESIS: Los reels hablados del lunes tienen mayor alcance — la audiencia vuelve activa después del fin de semana.' },
  2: { preferred_format: 'carousel', preferred_objective: 'saves', rationale: 'HIPÓTESIS: El miércoles genera más guardados — mitad de semana, la gente busca contenido para guardar y volver.' },
  3: { preferred_format: 'reel_storytelling', preferred_objective: 'connection', rationale: 'HIPÓTESIS: El jueves storytelling conecta mejor — hay más tiempo de consumo en el cierre de semana laboral.' },
  4: { preferred_format: 'reel_talking', preferred_objective: 'grow', rationale: 'HIPÓTESIS: El viernes cierra el ciclo semanal de contenido con alcance — buen momento para nuevos descubrimientos.' },
}

const PILLAR_THEME_MAP: Record<string, MacroTheme[]> = {
  'Manifestación': ['manifestacion', 'desapego'],
  'Dinero y abundancia': ['dinero', 'abundancia'],
  'Suerte y oportunidades': ['suerte', 'oportunidades'],
  'Rituales y prácticas': ['rituales'],
  'Señales y sincronías': ['senales', 'numeros_fechas'],
  'Deseo e intención': ['deseos_concretos'],
  'Creencias y apoyo': ['creencias', 'merecimiento', 'amor_relaciones'],
}

function getPillarForTheme(theme: MacroTheme): string {
  for (const [pillar, themes] of Object.entries(PILLAR_THEME_MAP)) {
    if (themes.includes(theme)) return pillar
  }
  return 'Manifestación'
}

function getFormatFromPiece(piece: ContentPiece): ContentFormatType {
  const vd = piece.visual_direction?.toLowerCase() ?? ''
  const sc = piece.script?.toLowerCase() ?? ''
  if (vd.includes('carrusel') || vd.includes('slide')) return 'carousel'
  if (vd.includes('storytelling')) return 'reel_storytelling'
  if (vd.includes('educativo') || vd.includes('lista')) return 'reel_educational'
  if (vd.includes('pov') || sc.includes('pov:')) return 'pov'
  if (vd.includes('afirmaci')) return 'affirmation'
  return 'reel_talking'
}

export function organizeWeek(strategy: PublicationStrategy): WeekPlan {
  // Get available pieces (not published, not discarded)
  const available = MOCK_CONTENT_PIECES.filter(p =>
    ['idea', 'in_development', 'script_ready', 'produced'].includes(p.status)
  ).sort((a, b) => {
    // Prioritize more complete pieces
    const statusOrder = { produced: 0, script_ready: 1, in_development: 2, idea: 3 }
    return (statusOrder[a.status as keyof typeof statusOrder] ?? 4) - (statusOrder[b.status as keyof typeof statusOrder] ?? 4)
  })

  const totalFeedSlots = strategy.reels_per_week + strategy.carrusels_per_week
  const slots = Math.min(totalFeedSlots, available.length, 5) // max 5 days of content

  // Decide which days get content (skip weekends unless needed)
  const contentDays = [0, 2, 3, 4] // Mon, Wed, Thu, Fri — default
  if (slots >= 5) contentDays.push(1) // Add Tue if 5 slots
  if (slots <= 3) contentDays.splice(1, 1) // Remove Thu if only 3 slots

  const entries: WeekDayPlan[] = []
  const usedPieceIds = new Set<string>()
  const usedPillars: string[] = []
  const usedObjectives: ContentObjective[] = []

  for (let i = 0; i < Math.min(slots, contentDays.length); i++) {
    const day = contentDays[i]
    const dayHypothesis = DAY_HYPOTHESES[day]

    // Pick best piece for this day
    let selectedPiece = available.find(p => {
      if (usedPieceIds.has(p.id)) return false
      // Avoid same pillar 3x
      const pillar = getPillarForTheme(p.macro_theme ?? 'manifestacion')
      if (usedPillars.filter(pi => pi === pillar).length >= 2) return false
      return true
    }) ?? available.find(p => !usedPieceIds.has(p.id)) ?? available[0]

    if (!selectedPiece) break

    usedPieceIds.add(selectedPiece.id)
    const theme = selectedPiece.macro_theme ?? 'manifestacion'
    const pillar = getPillarForTheme(theme)
    usedPillars.push(pillar)

    // Pick format
    const format = dayHypothesis?.preferred_format ?? getFormatFromPiece(selectedPiece)

    // Pick objective (rotate)
    let objective: ContentObjective = dayHypothesis?.preferred_objective ?? strategy.primary_objective
    if (usedObjectives.filter(o => o === objective).length >= 2) {
      const alternatives: ContentObjective[] = ['connection', 'saves', 'comments', 'authority', 'nurture']
      objective = alternatives.find(o => !usedObjectives.includes(o)) ?? objective
    }
    usedObjectives.push(objective)

    const hypothesis = dayHypothesis?.rationale ??
      `Pieza seleccionada por diversidad de pilar (${pillar}) y rotación de objetivo.`

    entries.push({
      day,
      dayName: DAY_NAMES[day],
      content_piece: selectedPiece,
      format,
      theme,
      objective,
      pillar,
      hypothesis_applied: hypothesis,
    })
  }

  const pillarDist: Record<string, number> = {}
  const objDist: Record<string, number> = {}
  entries.forEach(e => {
    pillarDist[e.pillar] = (pillarDist[e.pillar] ?? 0) + 1
    objDist[e.objective] = (objDist[e.objective] ?? 0) + 1
  })

  return {
    entries,
    total_reels: entries.filter(e => e.format.startsWith('reel')).length,
    total_carrusels: entries.filter(e => e.format === 'carousel').length,
    pillar_distribution: pillarDist,
    objective_distribution: objDist,
    week_objective: strategy.launch_mode
      ? 'Semana de lanzamiento — prioridad: alcance e identificación'
      : 'Semana de crecimiento — prioridad: diversidad y conexión',
  }
}
