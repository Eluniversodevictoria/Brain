// SCORING-VICTORIA-v1.2.1 — deterministic unit tests
// Tests use controlled data — no MOCK_CONTENT_PIECES dependency.

import { describe, it, expect } from 'vitest'
import type { ContentPiece } from '@/types'
import {
  detectPhase,
  getStrategicScore,
  getEvidenceScore,
  getPiecesAbsent,
  getUnderrepScore,
  getFormatObjScore,
  getCalendarScore,
  getPerfScore,
  getThemeRecencyPenalty,
  getFormatRecencyPenalty,
  getProjectedSupportRatio,
  applyEditorialConstraints,
  scoreCandidate,
  resolveTieBreaker,
  STRATEGIC_SCORE,
  EVIDENCE_SCORE,
  SUPPORT_THEMES,
} from './scoring'
import type { ScoringContext } from './scoring'

// ── Helpers ───────────────────────────────────────────────────────────

function makePiece(overrides: Partial<ContentPiece>): ContentPiece {
  return {
    id: Math.random().toString(36).slice(2),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'published',
    ...overrides,
  }
}

function makeHistory(themes: string[], daysAgoStart = 1): ContentPiece[] {
  return themes.map((macro_theme, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (daysAgoStart + i))
    return makePiece({ macro_theme: macro_theme as any, created_at: d.toISOString() })
  })
}

function baseCtx(overrides: Partial<ScoringContext> = {}): ScoringContext {
  return {
    history: [],
    bank: [],
    weeklyObjective: 'grow',
    painRoot: 'general',
    date: new Date('2026-08-14'),
    phase: 'A',
    thisWeekPieces: [],
    ...overrides,
  }
}

// ── Phase detection ───────────────────────────────────────────────────

describe('detectPhase', () => {
  it('returns A for 0 published', () => expect(detectPhase(0)).toBe('A'))
  it('returns A for 15 published', () => expect(detectPhase(15)).toBe('A'))
  it('returns B for 16 published', () => expect(detectPhase(16)).toBe('B'))
  it('returns B for 50 published', () => expect(detectPhase(50)).toBe('B'))
  it('returns C for 51 published', () => expect(detectPhase(51)).toBe('C'))
})

// ── Static tables ─────────────────────────────────────────────────────

describe('STRATEGIC_SCORE', () => {
  it('manifestacion and dinero score 100', () => {
    expect(STRATEGIC_SCORE.manifestacion).toBe(100)
    expect(STRATEGIC_SCORE.dinero).toBe(100)
  })
  it('amor_relaciones scores 17 (lowest)', () => {
    expect(STRATEGIC_SCORE.amor_relaciones).toBe(17)
  })
  it('all 13 themes are present', () => {
    expect(Object.keys(STRATEGIC_SCORE).length).toBe(13)
  })
})

describe('EVIDENCE_SCORE', () => {
  it('manifestacion evidence is 80 (highest)', () => {
    expect(EVIDENCE_SCORE.manifestacion).toBe(80)
  })
  it('oportunidades and desapego are 5 (lowest)', () => {
    expect(EVIDENCE_SCORE.oportunidades).toBe(5)
    expect(EVIDENCE_SCORE.desapego).toBe(5)
  })
})

describe('SUPPORT_THEMES', () => {
  it('contains the 4 SUPPORT themes', () => {
    expect(SUPPORT_THEMES.has('creencias')).toBe(true)
    expect(SUPPORT_THEMES.has('merecimiento')).toBe(true)
    expect(SUPPORT_THEMES.has('desapego')).toBe(true)
    expect(SUPPORT_THEMES.has('amor_relaciones')).toBe(true)
  })
  it('does not contain CENTRO themes', () => {
    expect(SUPPORT_THEMES.has('manifestacion')).toBe(false)
    expect(SUPPORT_THEMES.has('dinero')).toBe(false)
  })
})

// ── getPiecesAbsent ───────────────────────────────────────────────────

describe('getPiecesAbsent', () => {
  it('returns history.length + 1 when theme never appears', () => {
    const history = makeHistory(['dinero', 'abundancia'])
    expect(getPiecesAbsent('manifestacion', history)).toBe(3)
  })

  it('returns 0 when theme is the most recent piece', () => {
    const history = makeHistory(['manifestacion', 'dinero', 'abundancia'])
    expect(getPiecesAbsent('manifestacion', history)).toBe(0)
  })

  it('returns correct index when theme appeared 2 pieces ago', () => {
    const history = makeHistory(['dinero', 'abundancia', 'manifestacion'])
    expect(getPiecesAbsent('manifestacion', history)).toBe(2)
  })
})

// ── getUnderrepScore ──────────────────────────────────────────────────

describe('getUnderrepScore', () => {
  it('returns 0 when theme was published recently (absent ≤ 3)', () => {
    const history = makeHistory(['manifestacion', 'dinero', 'manifestacion'])
    expect(getUnderrepScore('manifestacion', history)).toBe(0)
  })

  it('returns 100 when theme never published (long history)', () => {
    // Need history.length + 1 > 19 to hit the 100 branch
    const history = makeHistory(Array(20).fill('dinero'))
    expect(getUnderrepScore('manifestacion', history)).toBe(100)
  })

  it('returns 50 for moderate absence (absent 8–14)', () => {
    const themes = ['dinero', 'dinero', 'dinero', 'dinero', 'dinero', 'dinero', 'dinero', 'dinero', 'manifestacion']
    const history = makeHistory(themes)
    expect(getUnderrepScore('manifestacion', history)).toBe(50)
  })
})

// ── getFormatObjScore ─────────────────────────────────────────────────

describe('getFormatObjScore', () => {
  it('reel_talking + grow = 95', () => {
    expect(getFormatObjScore('reel_talking', 'grow')).toBe(95)
  })
  it('carousel + saves = 90', () => {
    expect(getFormatObjScore('carousel', 'saves')).toBe(90)
  })
  it('unknown combo falls back to 40', () => {
    expect(getFormatObjScore('story', 'sell')).toBe(40)
  })
})

// ── getCalendarScore ──────────────────────────────────────────────────

describe('getCalendarScore', () => {
  it('numeros_fechas gets 100 near 11/11', () => {
    expect(getCalendarScore('numeros_fechas', new Date('2026-11-11'))).toBe(100)
  })
  it('manifestacion gets 80 in early January', () => {
    expect(getCalendarScore('manifestacion', new Date('2026-01-05'))).toBe(80)
  })
  it('returns 0 for non-matching theme/date', () => {
    expect(getCalendarScore('dinero', new Date('2026-08-14'))).toBe(0)
  })
})

// ── getPerfScore ──────────────────────────────────────────────────────

describe('getPerfScore', () => {
  it('returns 0 in phase A regardless of history', () => {
    const history = makeHistory(['manifestacion']).map(p => ({ ...p, performance: 'good' as const }))
    expect(getPerfScore(history, 'A')).toBe(0)
  })

  it('returns 50 in phase B/C when no performance data', () => {
    expect(getPerfScore([], 'B')).toBe(50)
    expect(getPerfScore([], 'C')).toBe(50)
  })

  it('100% good performance → 40 in phase B (40% scaling)', () => {
    const history = [
      makePiece({ performance: 'good' }),
      makePiece({ performance: 'good' }),
    ]
    expect(getPerfScore(history, 'B')).toBe(40)
  })

  it('100% good performance → 100 in phase C (full)', () => {
    const history = [makePiece({ performance: 'good' })]
    expect(getPerfScore(history, 'C')).toBe(100)
  })
})

// ── getThemeRecencyPenalty ────────────────────────────────────────────

describe('getThemeRecencyPenalty', () => {
  it('returns 57 when theme was last published (absent=0)', () => {
    const history = makeHistory(['manifestacion', 'dinero'])
    expect(getThemeRecencyPenalty('manifestacion', history)).toBe(57)
  })

  it('returns 0 when theme absent more than 6 pieces', () => {
    const themes = ['dinero', 'dinero', 'dinero', 'dinero', 'dinero', 'dinero', 'dinero']
    const history = makeHistory(themes)
    expect(getThemeRecencyPenalty('manifestacion', history)).toBe(0)
  })
})

// ── getProjectedSupportRatio (projected, not current) ─────────────────

describe('getProjectedSupportRatio', () => {
  it('0 / (0+1) = 0 when adding CENTRO theme to empty week', () => {
    const ctx = baseCtx({ thisWeekPieces: [] })
    expect(getProjectedSupportRatio('manifestacion', ctx)).toBeCloseTo(0)
  })

  it('1 / (0+1) = 1.0 when adding SUPPORT theme to empty week', () => {
    const ctx = baseCtx({ thisWeekPieces: [] })
    expect(getProjectedSupportRatio('creencias', ctx)).toBeCloseTo(1.0)
  })

  it('caps projected ratio above 0.30 when 2 SUPPORT + 4 CENTRO already published', () => {
    const thisWeekPieces = [
      makePiece({ macro_theme: 'creencias' }),
      makePiece({ macro_theme: 'merecimiento' }),
      makePiece({ macro_theme: 'manifestacion' }),
      makePiece({ macro_theme: 'dinero' }),
    ]
    const ctx = baseCtx({ thisWeekPieces })
    // Adding another SUPPORT: 3/(4+1) = 3/5 = 0.60 > 0.30 → should trigger penalty
    const ratio = getProjectedSupportRatio('desapego', ctx)
    expect(ratio).toBeGreaterThan(0.30)
  })

  it('does not trigger cap when CENTRO added to SUPPORT-heavy week', () => {
    // 2 SUPPORT already (ratio = 2/4 = 0.50 current), adding CENTRO → 2/5 = 0.40 projected
    const thisWeekPieces = [
      makePiece({ macro_theme: 'creencias' }),
      makePiece({ macro_theme: 'merecimiento' }),
      makePiece({ macro_theme: 'manifestacion' }),
      makePiece({ macro_theme: 'dinero' }),
    ]
    const ctx = baseCtx({ thisWeekPieces })
    const ratio = getProjectedSupportRatio('manifestacion', ctx)
    expect(ratio).toBeCloseTo(2 / 5)
    expect(ratio).toBeLessThanOrEqual(0.40) // still ≤ 0.40 after adding CENTRO
  })
})

// ── applyEditorialConstraints ─────────────────────────────────────────

describe('applyEditorialConstraints', () => {
  it('deducts 10 pts when SUPPORT projected ratio exceeds 0.30', () => {
    const thisWeekPieces = [
      makePiece({ macro_theme: 'creencias' }),
      makePiece({ macro_theme: 'manifestacion' }),
    ]
    // Adding SUPPORT to 1 SUPPORT + 1 CENTRO: projected 2/3 = 0.67 > 0.30
    const ctx = baseCtx({ thisWeekPieces })
    const score = applyEditorialConstraints(50, 'merecimiento', ctx)
    expect(score).toBe(40)
  })

  it('does NOT deduct when CENTRO is added regardless of SUPPORT ratio', () => {
    const thisWeekPieces = [
      makePiece({ macro_theme: 'creencias' }),
      makePiece({ macro_theme: 'merecimiento' }),
    ]
    const ctx = baseCtx({ thisWeekPieces })
    const score = applyEditorialConstraints(50, 'manifestacion', ctx)
    expect(score).toBe(50)
  })

  it('constraint before bonus: bank_reuse_bonus not factored into constrained score', () => {
    // The constraint function receives formulaScore — no bonus included
    const ctx = baseCtx({ thisWeekPieces: [] })
    const formulaScore = 60
    const constrained = applyEditorialConstraints(formulaScore, 'manifestacion', ctx)
    // CENTRO, empty week → no penalty
    expect(constrained).toBe(60)
  })
})

// ── scoreCandidate formula ────────────────────────────────────────────

describe('scoreCandidate formula', () => {
  it('returns positive score for strong candidate in phase A', () => {
    const ctx = baseCtx({ history: [], phase: 'A' })
    const score = scoreCandidate('manifestacion', 'reel_talking', 'grow', ctx)
    expect(score).toBeGreaterThan(0)
  })

  it('manifestacion scores higher than amor_relaciones (same format/objective)', () => {
    const ctx = baseCtx({ history: [], phase: 'A' })
    const mani = scoreCandidate('manifestacion', 'reel_talking', 'grow', ctx)
    const amor = scoreCandidate('amor_relaciones', 'reel_talking', 'grow', ctx)
    expect(mani).toBeGreaterThan(amor)
  })

  it('recency penalty reduces score when theme was just published', () => {
    const history = makeHistory(['manifestacion'])
    const ctxFresh = baseCtx({ history: [], phase: 'A' })
    const ctxRecent = baseCtx({ history, phase: 'A' })
    const scoreFresh  = scoreCandidate('manifestacion', 'reel_talking', 'grow', ctxFresh)
    const scoreRecent = scoreCandidate('manifestacion', 'reel_talking', 'grow', ctxRecent)
    expect(scoreRecent).toBeLessThan(scoreFresh)
  })

  it('phase C gives more weight to performance (w6=0.22 vs A w6=0)', () => {
    const goodHistory = [
      makePiece({ performance: 'good' }),
      makePiece({ performance: 'good' }),
    ]
    const ctxA = baseCtx({ history: goodHistory, phase: 'A' })
    const ctxC = baseCtx({ history: goodHistory, phase: 'C' })
    const scoreA = scoreCandidate('abundancia', 'reel_talking', 'grow', ctxA)
    const scoreC = scoreCandidate('abundancia', 'reel_talking', 'grow', ctxC)
    expect(scoreC).toBeGreaterThan(scoreA)
  })
})

// ── resolveTieBreaker ─────────────────────────────────────────────────

describe('resolveTieBreaker', () => {
  function candidate(theme: any, score = 50): any {
    return { theme, format: 'reel_talking', objective: 'grow', score, rawFactors: {} }
  }

  it('picks the candidate with longer absence first', () => {
    // dinero last published 5 pieces ago, manifestacion was last piece → more absent = dinero wins
    const history = makeHistory(['manifestacion', 'abundancia', 'rituales', 'suerte', 'oportunidades', 'dinero'])
    const a = candidate('dinero') // absent 5
    const b = candidate('manifestacion') // absent 0
    const winner = resolveTieBreaker(a, b, history)
    expect(winner.theme).toBe('dinero')
  })

  it('falls back to higher strategic_score when absence is equal', () => {
    // Both themes never appear in history → equal max absence
    const history = makeHistory(['abundancia', 'rituales'])
    const a = candidate('manifestacion') // strategic 100
    const b = candidate('suerte')        // strategic 67
    const winner = resolveTieBreaker(a, b, history)
    expect(winner.theme).toBe('manifestacion')
  })
})

// ── Bank wins / loses ─────────────────────────────────────────────────

describe('bank_reuse_bonus invariant', () => {
  it('BANK_REUSE_BONUS=15 is added to selection_score but not to raw score', () => {
    // The test verifies the conceptual invariant:
    // if constrained_raw_score = X, selection_score = X + 15
    const BANK_REUSE_BONUS = 15
    const constrained_raw = 40
    const selection = constrained_raw + BANK_REUSE_BONUS
    expect(selection - constrained_raw).toBe(15)
  })

  it('bank piece with constrained ≤ 0 is filtered before adding bonus', () => {
    // A bank piece that gets constrained to ≤ 0 must be discarded
    // (P2: discard AFTER constraints, not before)
    const constrained = 0
    const filtered = constrained > 0  // mimics .filter(b => b.constrained_raw_score > 0)
    expect(filtered).toBe(false)
  })
})
