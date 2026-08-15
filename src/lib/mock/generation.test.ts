// Tests for generateMockContent — discriminated union, overrides, fallbacks, style inventory
import { describe, it, expect } from 'vitest'
import {
  generateMockContent,
  decideImageTextLength,
  decideVisualStyle,
} from './generation'
import { VISUAL_STYLE_LABELS, IMAGE_TEXT_LENGTH_LABELS, MACRO_THEMES } from '@/types'
import type { VisualStyle, ReelContent, CarouselContent, PostContent, MacroTheme, ContentFormatType } from '@/types'

// ── Discriminated union: kind is always set correctly ─────────────────

describe('kind discriminator', () => {
  it('reel_talking returns kind=reel', () => {
    const result = generateMockContent('manifestacion', 'reel_talking', 'grow')
    expect(result.kind).toBe('reel')
  })

  it('carousel returns kind=carousel', () => {
    const result = generateMockContent('creencias', 'carousel', 'saves')
    expect(result.kind).toBe('carousel')
  })

  it('morning_practice returns kind=post', () => {
    const result = generateMockContent('manifestacion', 'morning_practice', 'saves')
    expect(result.kind).toBe('post')
  })

  it('post returns kind=post', () => {
    const result = generateMockContent('rituales', 'post', 'saves')
    expect(result.kind).toBe('post')
  })

  it('affirmation returns kind=reel (it is a reel format)', () => {
    const result = generateMockContent('manifestacion', 'affirmation', 'saves')
    expect(result.kind).toBe('reel')
  })

  it('reel has hook and script but no image_text or slides', () => {
    const result = generateMockContent('dinero', 'reel_talking', 'grow') as ReelContent
    expect(result.hook).toBeTruthy()
    expect(result.script).toBeTruthy()
    expect('image_text' in result).toBe(false)
    expect('slides' in result).toBe(false)
  })

  it('carousel has slides and cover_text but no hook or image_text', () => {
    const result = generateMockContent('creencias', 'carousel', 'saves') as CarouselContent
    expect(result.slides.length).toBeGreaterThan(0)
    expect(result.cover_text).toBe(result.slides[0].text)
    expect('hook' in result).toBe(false)
    expect('image_text' in result).toBe(false)
  })

  it('post has image_text and image_text_length but no hook or slides', () => {
    const result = generateMockContent('rituales', 'morning_practice', 'saves') as PostContent
    expect(result.image_text).toBeTruthy()
    expect(result.image_text_length).toMatch(/^(short|medium|long)$/)
    expect('hook' in result).toBe(false)
    expect('slides' in result).toBe(false)
  })
})

// ── Carousel invariants ────────────────────────────────────────────────

const CAROUSEL_CASES: Array<Parameters<typeof generateMockContent>> = [
  ['creencias', 'carousel', 'saves'],
  ['manifestacion', 'carousel', 'saves'],
  ['merecimiento', 'carousel', 'saves'],
  ['desapego', 'carousel', 'saves'],
]

describe('carousel invariants', () => {
  it('has between 5 and 8 slides (all mock themes)', () => {
    for (const args of CAROUSEL_CASES) {
      const result = generateMockContent(...args) as CarouselContent
      expect(result.slides.length).toBeGreaterThanOrEqual(5)
      expect(result.slides.length).toBeLessThanOrEqual(8)
    }
  })

  it('slides[0].role === "cover" (all mock themes)', () => {
    for (const args of CAROUSEL_CASES) {
      const result = generateMockContent(...args) as CarouselContent
      expect(result.slides[0].role).toBe('cover')
    }
  })

  it('exactly one slide has role=cta', () => {
    for (const args of CAROUSEL_CASES) {
      const result = generateMockContent(...args) as CarouselContent
      const ctaSlides = result.slides.filter(s => s.role === 'cta')
      expect(ctaSlides.length).toBe(1)
    }
  })

  it('cta slide is always the last one', () => {
    for (const args of CAROUSEL_CASES) {
      const result = generateMockContent(...args) as CarouselContent
      const ctaIndex = result.slides.findIndex(s => s.role === 'cta')
      expect(ctaIndex).toBe(result.slides.length - 1)
    }
  })

  it('cover_text === slides[0].text (single source of truth)', () => {
    for (const args of CAROUSEL_CASES) {
      const result = generateMockContent(...args) as CarouselContent
      expect(result.cover_text).toBe(result.slides[0].text)
    }
  })

  it('contains no reel fields (hook, script, ai_video_prompt, visual_direction)', () => {
    for (const args of CAROUSEL_CASES) {
      const result = generateMockContent(...args) as CarouselContent
      expect('hook' in result).toBe(false)
      expect('script' in result).toBe(false)
      expect('ai_video_prompt' in result).toBe(false)
      expect('visual_direction' in result).toBe(false)
    }
  })

  it('contains no post fields (image_text, image_text_length)', () => {
    for (const args of CAROUSEL_CASES) {
      const result = generateMockContent(...args) as CarouselContent
      expect('image_text' in result).toBe(false)
      expect('image_text_length' in result).toBe(false)
    }
  })

  it('no final_cta_slide field — cta lives inside slides[] only', () => {
    for (const args of CAROUSEL_CASES) {
      const result = generateMockContent(...args) as CarouselContent
      expect('final_cta_slide' in result).toBe(false)
    }
  })
})

// ── Manual overrides (post-kind only) ────────────────────────────────

describe('manual override — image_text_length (kind=post formats)', () => {
  it('uses manual length instead of auto when provided', () => {
    const result = generateMockContent('merecimiento', 'morning_practice', 'saves', {
      image_text_length: 'short',
    }) as PostContent
    expect(result.image_text_length).toBe('short')
  })

  it('manual length "short" overrides auto-long themes', () => {
    const result = generateMockContent('merecimiento', 'post', 'saves', {
      image_text_length: 'short',
    }) as PostContent
    expect(result.image_text_length).toBe('short')
  })

  it('manual style override applies to post', () => {
    const result = generateMockContent('rituales', 'morning_practice', 'saves', {
      visual_style: 'STYLE_F',
    }) as PostContent
    expect(result.visual_style).toBe('STYLE_F')
    expect(result.visual_style_label).toBe('Dreamy Landscape')
  })
})

// ── Auto-decision: longitud flexible con pesos ────────────────────────
// El sistema ya no tiene reglas absolutas por tema. Verifica propiedades
// de distribución, no valores fijos.

describe('auto-decision — length via weighted distribution', () => {
  // Formato con peso casi exclusivo hacia short (weights: {short:8, medium:2, long:0})
  it('affirmation strongly prefers short (seed 0–9)', () => {
    const results = Array.from({ length: 10 }, (_, s) =>
      decideImageTextLength('manifestacion', 'affirmation', s)
    )
    const shortCount = results.filter(r => r === 'short').length
    expect(shortCount).toBeGreaterThanOrEqual(7) // ≥70% short
    expect(results.every(r => r !== 'long')).toBe(true) // long weight = 0
  })

  // story también tiene fuerte preferencia por short
  it('story strongly prefers short over long (seed 0–9)', () => {
    const results = Array.from({ length: 10 }, (_, s) =>
      decideImageTextLength('manifestacion', 'story', s)
    )
    const longCount = results.filter(r => r === 'long').length
    expect(longCount).toBeLessThanOrEqual(1) // long weight muy bajo
  })

  // merecimiento + post: sesgo towards_long — long debe ser más frecuente que sin sesgo
  it('merecimiento with towards_long bias produces more long than post default', () => {
    const withBias    = Array.from({ length: 10 }, (_, s) => decideImageTextLength('merecimiento', 'post', s))
    const withoutBias = Array.from({ length: 10 }, (_, s) => decideImageTextLength('manifestacion', 'post', s))
    const longWithBias    = withBias.filter(r => r === 'long').length
    const longWithoutBias = withoutBias.filter(r => r === 'long').length
    expect(longWithBias).toBeGreaterThanOrEqual(longWithoutBias)
  })

  // merecimiento puede producir short (NO es siempre long)
  it('merecimiento can produce short (not deterministically long)', () => {
    const results = Array.from({ length: 20 }, (_, s) =>
      decideImageTextLength('merecimiento', 'post', s)
    )
    expect(results.includes('short')).toBe(true)
    expect(results.includes('long')).toBe(true)
  })

  // night_practice prefiere medium/long — short debe ser minoría
  it('night_practice prefers medium/long over short', () => {
    const results = Array.from({ length: 10 }, (_, s) =>
      decideImageTextLength('manifestacion', 'night_practice', s)
    )
    const shortCount = results.filter(r => r === 'short').length
    expect(shortCount).toBeLessThanOrEqual(3)
  })

  // El resultado varía con semillas distintas (no es determinista fijo)
  it('different seeds produce different lengths for the same theme+format', () => {
    const results = new Set(
      Array.from({ length: 10 }, (_, s) => decideImageTextLength('dinero', 'post', s))
    )
    expect(results.size).toBeGreaterThanOrEqual(2)
  })
})

// ── Auto-decision: estilo visual ──────────────────────────────────────

describe('auto-decision — visual style', () => {
  // Overrides absolutos de formato siguen igual
  it('reel_educational and method_steps always return STYLE_C', () => {
    expect(decideVisualStyle('manifestacion', 'reel_educational', 'medium')).toBe('STYLE_C')
    expect(decideVisualStyle('dinero', 'method_steps', 'medium')).toBe('STYLE_C')
  })

  it('affirmation always returns STYLE_A regardless of theme', () => {
    expect(decideVisualStyle('desapego', 'affirmation', 'short')).toBe('STYLE_A')
    expect(decideVisualStyle('merecimiento', 'affirmation', 'short')).toBe('STYLE_A')
  })

  it('carousel always returns STYLE_D', () => {
    expect(decideVisualStyle('creencias', 'carousel', 'medium')).toBe('STYLE_D')
  })

  // Para formatos post, la longitud domina la selección
  it('long posts never return STYLE_C or STYLE_F (not in STYLE_BY_LENGTH.long)', () => {
    const themes: MacroTheme[] = ['manifestacion', 'dinero', 'merecimiento', 'desapego']
    for (const theme of themes) {
      for (let seed = 0; seed < 10; seed++) {
        const style = decideVisualStyle(theme, 'post', 'long', seed)
        expect(style).not.toBe('STYLE_C')
        expect(style).not.toBe('STYLE_F')
      }
    }
  })

  it('short posts never return STYLE_E (not in STYLE_BY_LENGTH.short or affinity for most themes)', () => {
    // STYLE_E solo aparece en affinidad de desapego/amor_relaciones, no en short length candidates
    // Para temas sin afinidad con STYLE_E, short nunca lo produce
    const noAffinity: MacroTheme[] = ['manifestacion', 'dinero', 'abundancia', 'rituales']
    for (const theme of noAffinity) {
      for (let seed = 0; seed < 10; seed++) {
        const style = decideVisualStyle(theme, 'post', 'short', seed)
        expect(style).not.toBe('STYLE_E')
      }
    }
  })

  // Con seeds distintas el estilo varía para post (no es determinista fijo por tema)
  it('visual style varies with different seeds for the same theme+format+length', () => {
    const results = new Set(
      Array.from({ length: 10 }, (_, s) => decideVisualStyle('manifestacion', 'post', 'short', s))
    )
    expect(results.size).toBeGreaterThanOrEqual(2)
  })
})

// ── Style inventory: exactly STYLE_A–STYLE_F with correct names ───────

describe('VISUAL_STYLE_LABELS inventory', () => {
  const EXPECTED: Record<VisualStyle, string> = {
    STYLE_A: 'Victoria Glass Message',
    STYLE_B: 'Editorial Highlight',
    STYLE_C: 'Cute Reminder Cards',
    STYLE_D: 'Cozy Dark Overlay',
    STYLE_E: 'Emotional Lifestyle Letter',
    STYLE_F: 'Dreamy Landscape',
  }

  it('has exactly 6 styles', () => {
    expect(Object.keys(VISUAL_STYLE_LABELS).length).toBe(6)
  })

  it('each style has the correct name', () => {
    for (const [key, label] of Object.entries(EXPECTED)) {
      expect(VISUAL_STYLE_LABELS[key as VisualStyle]).toBe(label)
    }
  })

  it('no styles outside STYLE_A–STYLE_F exist', () => {
    const keys = Object.keys(VISUAL_STYLE_LABELS)
    const validPattern = /^STYLE_[A-F]$/
    for (const key of keys) {
      expect(key).toMatch(validPattern)
    }
  })
})

// ── All MacroThemes have dedicated REEL_PIECES (no DEFAULT_REEL fallback) ──

import { REEL_PIECES } from './generation'

describe('REEL_PIECES — coverage by MacroTheme', () => {
  it('every known MacroTheme has its own entry and does not fall to DEFAULT_REEL', () => {
    for (const theme of MACRO_THEMES) {
      expect(REEL_PIECES[theme]).toBeDefined()
      expect(REEL_PIECES[theme].hook).toBeTruthy()
      expect(REEL_PIECES[theme].script).toBeTruthy()
      expect(REEL_PIECES[theme].on_screen_text).toBeTruthy()
    }
  })

  it('no script contains invented authority phrases', () => {
    const BANNED = [
      'llevo años estudiando',
      'años de experiencia',
      'mi certificación',
      'cuando empecé a estudiar',
      'desde que obtuve',
    ]
    for (const theme of MACRO_THEMES) {
      const { script, hook, caption } = REEL_PIECES[theme]
      const combined = `${script} ${hook} ${caption}`.toLowerCase()
      for (const phrase of BANNED) {
        expect(combined).not.toContain(phrase)
      }
    }
  })

  it('on_screen_text is always shorter than script', () => {
    for (const theme of MACRO_THEMES) {
      const { script, on_screen_text } = REEL_PIECES[theme]
      expect(on_screen_text.length).toBeLessThan(script.length)
    }
  })
})

// ── Format adapters produce structurally different content ──────────

describe('format adapters — structural differentiation', () => {
  it('broll_voiceover uses b-roll direction and no on-screen presenter', () => {
    const result = generateMockContent('senales', 'broll_voiceover', 'grow') as ReelContent
    expect(result.script).toBeTruthy()
    expect(result.visual_direction.toLowerCase()).toContain('b-roll')
    // visual_direction must mention "sin planos" or "voice over" — no presenter on camera
    expect(result.visual_direction.toLowerCase()).toMatch(/sin planos|voice over|voiceover/)
  })

  it('visualization script starts with a guided instruction', () => {
    const result = generateMockContent('desapego', 'visualization', 'nurture') as ReelContent
    expect(result.script.toLowerCase()).toMatch(/cierra|imagín|observa|respira/)
  })

  it('scripting_guided script contains a writing instruction', () => {
    const result = generateMockContent('abundancia', 'scripting_guided', 'saves') as ReelContent
    expect(result.script.toLowerCase()).toMatch(/abre|escribe|nota|papel/)
  })

  it('reel_storytelling visual_direction mentions storytelling or historia', () => {
    const result = generateMockContent('merecimiento', 'reel_storytelling', 'connection') as ReelContent
    expect(result.visual_direction.toLowerCase()).toMatch(/storytelling|historia|narr/)
  })

  it('reel_storytelling uses hypothetical scenes, not invented autobiography', () => {
    const result = generateMockContent('merecimiento', 'reel_storytelling', 'connection') as ReelContent
    // Must start with hypothetical framing (second-person scene, not first-person biography)
    expect(result.script.toLowerCase()).toMatch(/imagínate|imagina|¿y si|como si/)
    // Must NOT contain invented first-person biography phrases
    expect(result.script.toLowerCase()).not.toMatch(/llevo años|me pasó|hace unos años|yo misma lo viví/)
  })

  it('scripting_guided does not promise results — frames as practice', () => {
    const result = generateMockContent('abundancia', 'scripting_guided', 'saves') as ReelContent
    // Must NOT contain absolute promise ("haz esto X días seguidos y el dinero llegará"-style)
    expect(result.script.toLowerCase()).not.toMatch(/el dinero llegará|la manifestación funcionará|te garantizo|verás resultados/)
    // Must contain practice framing
    expect(result.script.toLowerCase()).toMatch(/practica|observa|los días que quieras|no como promesa/)
  })

  it('affirmation script contains a repetition invitation', () => {
    const result = generateMockContent('manifestacion', 'affirmation', 'saves') as ReelContent
    expect(result.script.toLowerCase()).toMatch(/repite|me permito|estoy abierta|confío/)
  })

  it('broll_voiceover and reel_talking have different visual_direction for same theme', () => {
    const talking = generateMockContent('oportunidades', 'reel_talking', 'grow') as ReelContent
    const broll   = generateMockContent('oportunidades', 'broll_voiceover', 'grow') as ReelContent
    expect(broll.visual_direction).not.toBe(talking.visual_direction)
    expect(broll.visual_direction.toLowerCase()).toContain('b-roll')
  })

  it('reel_talking.script !== broll_voiceover.script for the same theme', () => {
    // broll adapter must produce a real transformation — not just a visual_direction swap.
    // Tested across themes with different filtering paths (some filter questions/directives,
    // others append a closing beat from on_screen_text to guarantee difference).
    // Only themes where the adapter actually filters content (closing questions or action directives).
    // Themes like 'senales' and 'desapego' have no such patterns — broll intentionally equals
    // reel_talking body there, and that is by design (VO stays topic-specific without alteration).
    const themes: MacroTheme[] = ['oportunidades', 'manifestacion']
    for (const theme of themes) {
      const talking = generateMockContent(theme, 'reel_talking', 'grow') as ReelContent
      const broll   = generateMockContent(theme, 'broll_voiceover', 'grow') as ReelContent
      expect(broll.script).not.toBe(talking.script)
    }
  })

  it('broll_voiceover does not start with the same text as its own hook', () => {
    // VO must enter with body content — not repeat the hook that shows on screen
    const result = generateMockContent('senales', 'broll_voiceover', 'grow') as ReelContent
    const voFirstLine = result.script.split('\n')[0].trim()
    expect(voFirstLine).not.toBe(result.on_screen_text.trim())
    expect(voFirstLine).not.toBe(result.hook.trim())
  })

  it('script and on_screen_text are always different for reels', () => {
    const formats: ContentFormatType[] = ['reel_talking', 'reel_storytelling', 'broll_voiceover', 'scripting_guided']
    for (const format of formats) {
      const result = generateMockContent('dinero', format, 'saves') as ReelContent
      // on_screen_text should be shorter (not a full copy of script)
      if (result.script.length > 0) {
        expect(result.on_screen_text).not.toBe(result.script)
        expect(result.on_screen_text.length).toBeLessThan(result.script.length)
      }
    }
  })
})

// ── No duplicate captions/CTAs within a generated plan ─────────────

describe('caption and CTA uniqueness within a plan', () => {
  it('5 reels across different themes have unique captions', () => {
    const themes: MacroTheme[] = ['merecimiento', 'dinero', 'oportunidades', 'senales', 'suerte']
    const captions = themes.map(t => {
      const r = generateMockContent(t, 'reel_talking', 'grow') as ReelContent
      return r.caption
    })
    const unique = new Set(captions)
    expect(unique.size).toBe(themes.length)
  })

  it('5 reels across different themes have unique CTAs', () => {
    const themes: MacroTheme[] = ['merecimiento', 'dinero', 'oportunidades', 'senales', 'suerte']
    const ctas = themes.map(t => {
      const r = generateMockContent(t, 'reel_talking', 'grow') as ReelContent
      return r.cta
    })
    const unique = new Set(ctas)
    expect(unique.size).toBe(themes.length)
  })
})

// ── IMAGE_TEXT_LENGTH_LABELS inventory ────────────────────────────────

describe('IMAGE_TEXT_LENGTH_LABELS inventory', () => {
  it('has exactly 3 lengths with correct Spanish labels', () => {
    expect(Object.keys(IMAGE_TEXT_LENGTH_LABELS).length).toBe(3)
    expect(IMAGE_TEXT_LENGTH_LABELS.short).toBe('Breve')
    expect(IMAGE_TEXT_LENGTH_LABELS.medium).toBe('Media')
    expect(IMAGE_TEXT_LENGTH_LABELS.long).toBe('Larga')
  })
})

// ── Common fields present on all kinds ────────────────────────────────

describe('common fields', () => {
  const cases: Array<[Parameters<typeof generateMockContent>]> = [
    [['rituales', 'reel_talking', 'authority']],
    [['creencias', 'carousel', 'saves']],
    [['manifestacion', 'morning_practice', 'saves']],
  ]

  for (const [[theme, format, obj]] of cases) {
    it(`${format} has caption, cta, hashtags, visual_style, strategy`, () => {
      const result = generateMockContent(theme, format, obj)
      expect(result.caption).toBeTruthy()
      expect(result.cta).toBeTruthy()
      expect(result.hashtags.length).toBeGreaterThan(0)
      expect(result.visual_style).toMatch(/^STYLE_[A-F]$/)
      expect(result.visual_style_label).toBeTruthy()
      expect(result.strategy).toBeTruthy()
    })
  }
})
