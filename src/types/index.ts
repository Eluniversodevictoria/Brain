export type MacroTheme =
  // CORE — de qué trata el contenido
  | 'manifestacion' | 'dinero' | 'abundancia' | 'suerte' | 'oportunidades'
  | 'rituales' | 'senales' | 'numeros_fechas' | 'deseos_concretos'
  // SUPPORT — temas de soporte que también pueden ser el tema central
  | 'creencias' | 'merecimiento' | 'desapego' | 'amor_relaciones'

export type ContentObjective =
  | 'grow' | 'comments' | 'saves' | 'shares' | 'connection'
  | 'authority' | 'nurture' | 'presell' | 'sell'

export type ContentFormatType =
  | 'reel_talking' | 'reel_storytelling' | 'reel_educational' | 'reel_visual'
  | 'affirmation' | 'pov' | 'carousel' | 'story' | 'post' | 'other'
  | 'visualization' | 'scripting_guided' | 'method_steps' | 'morning_practice'
  | 'night_practice' | 'symbolic_object' | 'concrete_desire'
  | 'manifestation_experiment' | 'qa_response' | 'broll_voiceover' | 'signal_date'

export type HookMechanism =
  | 'curiosity' | 'identification' | 'error' | 'contrast' | 'story'
  | 'question' | 'confession' | 'revelation' | 'signal' | 'warning'
  | 'new_perspective' | 'micro_story' | 'result' | 'demystification'
  | 'ritual_instruction' | 'scripting_invitation' | 'signal_recognition'
  | 'method_distinction' | 'desire_specificity' | 'lucky_reframe'

export type ContentStatus =
  | 'idea' | 'in_development' | 'script_ready' | 'produced'
  | 'scheduled' | 'published' | 'discarded'

export type ContentPerformance = 'good' | 'normal' | 'poor'
export type IdeaStatus = 'raw' | 'developing' | 'script_ready'
export type IdeaSource = 'generator' | 'dame_idea' | 'manual' | 'analyzer' | 'transformer'
export type LaunchPhase = 'launch' | 'growth' | 'mature'
export type VocType = 'voc_real' | 'dato_observado' | 'insight' | 'hipotesis'

export interface Pain {
  id: string
  macro_theme: MacroTheme
  micro_label: string
  surface_pain: string
  emotional_pain?: string
  private_thought?: string
  core_fear?: string
  surface_desire?: string
  deep_desire?: string
  daily_situations?: string[]
  recommended_ctas?: string[]
  voc_type: VocType
  source_notes?: string
  is_active: boolean
}

export interface Hook {
  id: string
  mechanism: HookMechanism
  template: string
  example_filled?: string
  why_it_works?: string
  compatible_themes?: MacroTheme[]
  compatible_formats?: ContentFormatType[]
  is_active: boolean
}

export interface Format {
  id: string
  name: string
  format_type: ContentFormatType
  description?: string
  structure?: string
  recommended_length_seconds?: number
  is_active: boolean
}

export interface Pillar {
  id: string
  name: string
  slug: string
  description?: string
  related_themes?: MacroTheme[]
  primary_emotion?: string
  is_active: boolean
  sort_order: number
}

export interface IdeaBankItem {
  id: string
  title?: string
  raw_idea: string
  macro_theme?: MacroTheme
  secondary_themes?: MacroTheme[]
  subthemes?: string[]
  pillar_id?: string
  format_hint?: string
  source: IdeaSource
  status: IdeaStatus
  content_piece_id?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface CalendarEntry {
  id: string
  scheduled_date: string
  scheduled_time?: string
  content_piece_id?: string
  idea_bank_id?: string
  pillar_id?: string
  format_type?: ContentFormatType
  status: ContentStatus
  week_number?: number
  notes?: string
  created_at: string
  // joined
  content_piece?: ContentPiece
  idea_bank?: IdeaBankItem
  pillar?: Pillar
}

export interface ContentPiece {
  id: string
  created_at: string
  updated_at: string
  objective?: ContentObjective
  pain_id?: string
  pillar_id?: string
  format_id?: string
  hook_id?: string
  macro_theme?: MacroTheme
  secondary_themes?: MacroTheme[]
  subthemes?: string[]
  psychological_mechanism?: string
  angle?: string
  primary_emotion?: string
  hook_text?: string
  script?: string
  on_screen_text?: string
  visual_direction?: string
  caption?: string
  cta?: string
  hashtags?: string[]
  ai_video_prompt?: string
  status: ContentStatus
  performance?: ContentPerformance
  metrics?: {
    views?: number | null
    likes?: number | null
    comments?: number | null
    saves?: number | null
    shares?: number | null
    followers_gained?: number | null
  }
  notes?: string
}

export interface GenerateRequest {
  objective: ContentObjective
  macro_theme: MacroTheme
  format_type: ContentFormatType
}

export type ImageTextLength = 'short' | 'medium' | 'long'

export type VisualStyle = 'STYLE_A' | 'STYLE_B' | 'STYLE_C' | 'STYLE_D' | 'STYLE_E' | 'STYLE_F'

export const IMAGE_TEXT_LENGTH_LABELS: Record<ImageTextLength, string> = {
  short:  'Breve',
  medium: 'Media',
  long:   'Larga',
}

export const VISUAL_STYLE_LABELS: Record<VisualStyle, string> = {
  STYLE_A: 'Victoria Glass Message',
  STYLE_B: 'Editorial Highlight',
  STYLE_C: 'Cute Reminder Cards',
  STYLE_D: 'Cozy Dark Overlay',
  STYLE_E: 'Emotional Lifestyle Letter',
  STYLE_F: 'Dreamy Landscape',
}

// ── Content strategy (shared across all kinds) ─────────────────────
export interface ContentStrategy {
  objective: string
  pain_used: string
  private_thought: string
  desire: string
  primary_emotion: string
  psychological_mechanism: string
  angle: string
}

// ── Carousel slide ──────────────────────────────────────────────────
export interface CarouselSlide {
  slide: number
  role: 'cover' | 'development' | 'cta'
  text: string
}

// ── Discriminated union: one kind per content structure ─────────────

export interface ReelContent {
  kind: 'reel'
  strategy: ContentStrategy
  hook: string
  script: string
  on_screen_text: string
  visual_direction: string
  ai_video_prompt: string
  caption: string
  cta: string
  hashtags: string[]
  visual_style: VisualStyle
  visual_style_label: string
}

export interface CarouselContent {
  kind: 'carousel'
  strategy: ContentStrategy
  topic: string
  goal: string
  angle: string
  // cover_text = slides[0].text — derived on generation, stored for UI convenience
  cover_text: string
  slides: CarouselSlide[]
  visual_notes: string
  caption: string
  cta: string
  hashtags: string[]
  visual_style: VisualStyle
  visual_style_label: string
}

export interface PostContent {
  kind: 'post'
  strategy: ContentStrategy
  image_text: string
  image_text_length: ImageTextLength
  caption: string
  cta: string
  hashtags: string[]
  visual_style: VisualStyle
  visual_style_label: string
}

export type GeneratedContent = ReelContent | CarouselContent | PostContent
export type ContentKind = GeneratedContent['kind']

// ── Centralised format → kind mapping ──────────────────────────────
// Add new formats here; all callers derive kind from this map.
//
// DECISIONES TEMPORALES — revisar antes de añadir nuevos formatos:
//
// • affirmation → 'reel': actualmente representa una afirmación hablada/en video
//   (ReelContent con hook + on_screen_text). Si en el futuro se necesita una
//   afirmación puramente estática (imagen con texto), crear un formato separado
//   como 'affirmation_static' → 'post' en lugar de cambiar este mapping.
//   Cambiar aquí afectaría generation.ts, daily-plan, variation y cualquier
//   contenido ya guardado con format='affirmation'.
//
// • story → 'post': el MVP solo genera una pieza estática para Stories
//   (PostContent con image_text). Revisar cuando implementemos Stories
//   interactivas o multi-frame — en ese caso probablemente necesite su propio
//   kind ('story') con estructura de slides cortos, diferente de carousel.
export const FORMAT_KIND: Record<ContentFormatType, ContentKind> = {
  // Reels
  reel_talking:             'reel',
  reel_storytelling:        'reel',
  reel_educational:         'reel',
  reel_visual:              'reel',
  affirmation:              'reel', // ver nota arriba
  pov:                      'reel',
  visualization:            'reel',
  scripting_guided:         'reel',
  broll_voiceover:          'reel',
  qa_response:              'reel',
  other:                    'reel',
  // Carousels
  carousel:                 'carousel',
  method_steps:             'carousel',
  // Posts / static images
  morning_practice:         'post',
  night_practice:           'post',
  story:                    'post', // ver nota arriba
  post:                     'post',
  symbolic_object:          'post',
  concrete_desire:          'post',
  manifestation_experiment: 'post',
  signal_date:              'post',
}

export const OBJECTIVE_LABELS: Record<ContentObjective, string> = {
  grow: 'Crecer',
  comments: 'Generar comentarios',
  saves: 'Conseguir guardados',
  shares: 'Conseguir compartidos',
  connection: 'Crear conexión',
  authority: 'Aumentar autoridad',
  nurture: 'Nutrir audiencia',
  presell: 'Preparar para oferta',
  sell: 'Vender',
}

export const MACRO_THEMES: MacroTheme[] = [
  'manifestacion', 'dinero', 'abundancia', 'suerte', 'oportunidades',
  'rituales', 'senales', 'numeros_fechas', 'deseos_concretos',
  'creencias', 'merecimiento', 'desapego', 'amor_relaciones',
]

export const THEME_LABELS: Record<MacroTheme, string> = {
  manifestacion: 'Manifestación',
  dinero: 'Dinero',
  abundancia: 'Abundancia',
  suerte: 'Suerte',
  oportunidades: 'Oportunidades',
  rituales: 'Rituales',
  senales: 'Señales',
  numeros_fechas: 'Números y fechas',
  deseos_concretos: 'Deseos concretos',
  creencias: 'Creencias',
  merecimiento: 'Merecimiento',
  desapego: 'Desapego',
  amor_relaciones: 'Amor y relaciones',
}

export const FORMAT_LABELS: Record<ContentFormatType, string> = {
  reel_talking: 'Reel hablado a cámara',
  reel_storytelling: 'Reel storytelling',
  reel_educational: 'Reel educativo / lista',
  reel_visual: 'Video visual sin diálogo',
  affirmation: 'Afirmación para repetir',
  pov: 'POV',
  carousel: 'Carrusel',
  story: 'Story',
  post: 'Post de texto',
  other: 'Otro',
  visualization: 'Visualización guiada',
  scripting_guided: 'Scripting dictado',
  method_steps: 'Método paso a paso',
  morning_practice: 'Práctica matutina',
  night_practice: 'Práctica nocturna',
  symbolic_object: 'Ritual con objeto simbólico',
  concrete_desire: 'Práctica de deseo concreto',
  manifestation_experiment: 'Experimento de manifestación',
  qa_response: 'Respuesta a pregunta / comentario',
  broll_voiceover: 'B-roll + voz de Victoria',
  signal_date: 'Señal / número / fecha especial',
}

export const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Idea',
  in_development: 'En desarrollo',
  script_ready: 'Guion listo',
  produced: 'Producido',
  scheduled: 'Programado',
  published: 'Publicado',
  discarded: 'Descartado',
}

export const MECHANISM_LABELS: Record<HookMechanism, string> = {
  curiosity: 'Curiosidad',
  identification: 'Identificación',
  error: 'Error',
  contrast: 'Contraste',
  story: 'Historia',
  question: 'Pregunta',
  confession: 'Confesión',
  revelation: 'Revelación',
  signal: 'Señal',
  warning: 'Advertencia',
  new_perspective: 'Nueva perspectiva',
  micro_story: 'Microhistoria',
  result: 'Resultado',
  demystification: 'Desmitificación',
  ritual_instruction: 'Instrucción ritual',
  scripting_invitation: 'Scripting guiado',
  signal_recognition: 'Reconocimiento de señal',
  method_distinction: 'Distinción de método',
  desire_specificity: 'Especificidad del deseo',
  lucky_reframe: 'Reencuadre de suerte',
}
