import type {
  MacroTheme, ContentFormatType, ContentObjective, VisualStyle,
  ContentKind, CarouselSlide, ImageTextLength,
} from '@/types'

export type SavedEntrySource = 'plan-hoy' | 'inspirar' | 'generador' | 'dame-una-idea'

export interface SavedEntry {
  id: string
  saved_at: string              // ISO 8601
  source: SavedEntrySource
  is_favorite: boolean

  // Taxonomy
  theme: MacroTheme
  format: ContentFormatType
  objective: ContentObjective

  // Content
  hook: string                  // '' for carousel and post
  main_text: string             // cover_text (carousel) | image_text (post) | on_screen_text (reel)
  cta: string
  caption: string
  hashtags: string[]
  visual_style: VisualStyle
  visual_style_label: string

  // Kind — covers all three content types.
  // For entries created before the discriminated union (legacy), kind may be absent
  // or hold the old 'image' | 'reel' values; use FORMAT_KIND[format] as fallback.
  // NOTA: 'image' es un valor legacy de plan-hoy; el canonical kind para posts es 'post'.
  // No cambiar entradas existentes — sólo nuevas escrituras deben usar ContentKind.
  kind?: ContentKind | 'image'  // 'image' kept for legacy plan-hoy entries

  // Longitud del texto de imagen — solo para kind='post' (o legacy 'image').
  // Usada por el planner para calcular longDryStreak sin depender de Supabase.
  // Entradas legacy sin este campo simplemente no participan en el cálculo del streak.
  image_text_length?: ImageTextLength

  // Carousel slides — only populated when kind === 'carousel'.
  // DEUDA TÉCNICA: el schema de Supabase necesita columna `slides jsonb` antes
  // de que los carruseles puedan persistirse. En LOCAL/MOCK se usan en memoria.
  slides?: CarouselSlide[]

  // Plan de hoy extras
  reference_link?: string

  // Inspirar extras
  inspiration_platform?: string
  inspiration_url?: string
  inspiration_tema?: string
  inspiration_mecanismo?: string

  // Variation lineage
  related_to?: string   // id of the entry this was generated from
}
