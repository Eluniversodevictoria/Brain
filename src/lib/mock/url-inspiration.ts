// MOCK — "Crear desde un link". Stub para integración futura con extractor real.
// Cuando se conecte un extractor de URLs, reemplazar mockAnalyzeUrl() con la llamada real.
// La función generateInspirationContent() no cambia — recibe el análisis normalizado.

import type { MacroTheme, ContentFormatType, ContentObjective, GeneratedContent } from '@/types'
import { generateMockContent } from './generation'

// ── Platform detection ─────────────────────────────────────────────

export type InspiredPlatform =
  | 'instagram' | 'tiktok' | 'pinterest' | 'facebook' | 'web'

export function detectPlatformExtended(url: string): InspiredPlatform | null {
  if (!url.trim()) return null
  try { new URL(url.startsWith('http') ? url : `https://${url}`) } catch { return null }
  if (/instagram\.com/.test(url)) return 'instagram'
  if (/tiktok\.com|vm\.tiktok\.com/.test(url)) return 'tiktok'
  if (/pinterest\.(com|es|co)/.test(url)) return 'pinterest'
  if (/facebook\.com|fb\.com|fb\.watch/.test(url)) return 'facebook'
  return 'web'
}

// ── Normalized inspiration analysis ───────────────────────────────
// This is what the real extractor will fill. Currently populated by mock.

export interface InspirationAnalysis {
  platform: InspiredPlatform
  url: string

  // Source content metadata (DEMO — from mock)
  creator: string | null
  format_detected: string

  // Content analysis (DEMO — from mock)
  tema: string
  idea_principal: string
  hook_original: string
  estructura: string[]
  tono: string
  mecanismo: string

  // Routing for content generation
  macro_theme: MacroTheme
  format: ContentFormatType
  objective: ContentObjective

  // Mock flag — remove when real extractor is connected
  is_mock: true
}

// ── Mock pool — varied analyses per platform ───────────────────────

interface MockTemplate {
  creator: string | null
  format_detected: string
  tema: string
  idea_principal: string
  hook_original: string
  estructura: string[]
  tono: string
  mecanismo: string
  macro_theme: MacroTheme
  format: ContentFormatType
  objective: ContentObjective
}

const MOCK_POOL: Record<InspiredPlatform, MockTemplate[]> = {
  instagram: [
    {
      creator: '@cuenta_referencia',
      format_detected: 'Reel hablado (~30 segundos)',
      tema: 'Ritual de manifestación nocturna',
      idea_principal: 'Escribir lo que quieres manifestar antes de dormir activa la intención de forma diferente.',
      hook_original: 'Pon esto debajo de tu almohada esta noche y observa lo que pasa...',
      estructura: ['Hook con objeto misterioso', 'Práctica paso a paso', 'Cierre emocional "confía en el proceso"'],
      tono: 'Cálido, íntimo, con misterio suave',
      mecanismo: 'Instrucción directa + suspense abierto + ritual físico accesible',
      macro_theme: 'rituales', format: 'reel_talking', objective: 'saves',
    },
    {
      creator: '@cuenta_referencia',
      format_detected: 'Carrusel (6 slides)',
      tema: 'Creencias limitantes sobre el dinero',
      idea_principal: 'Las frases aprendidas en la infancia siguen dictando la relación adulta con el dinero.',
      hook_original: '5 frases que te programaron para tener miedo del dinero (sin que te dieran cuenta)',
      estructura: ['Hook lista', 'Una frase por slide con explicación', 'Slide final con reencuadre'],
      tono: 'Educativo, revelador, sin juzgar',
      mecanismo: 'Lista de reconocimiento + revelación de origen + permiso de cuestionar',
      macro_theme: 'creencias', format: 'carousel', objective: 'saves',
    },
  ],
  tiktok: [
    {
      creator: '@tiktoker_referencia',
      format_detected: 'Reel educativo (~45 segundos)',
      tema: 'Abundancia y dinero como energía',
      idea_principal: 'La escasez se sostiene con comportamientos específicos que puedes cambiar.',
      hook_original: 'Si haces esto todos los días, estás bloqueando el dinero y no lo sabes.',
      estructura: ['Hook de error invisible', 'Lista de comportamientos de escasez', 'CTA para guardar'],
      tono: 'Directo, energético, con urgencia suave',
      mecanismo: 'Identificación de comportamiento inconsciente + solución implícita',
      macro_theme: 'dinero', format: 'reel_educational', objective: 'saves',
    },
  ],
  pinterest: [
    {
      creator: null,
      format_detected: 'Pin de imagen con texto superpuesto',
      tema: 'Afirmaciones de abundancia matutinas',
      idea_principal: 'Las afirmaciones funcionan mejor cuando van ligadas a un momento del día y una emoción concreta.',
      hook_original: '"El dinero llega a mí con facilidad y gratitud" — afirmación matutina',
      estructura: ['Afirmación central en tipografía grande', 'Paleta visual aspiracional', 'Sin instrucción — solo la frase'],
      tono: 'Aspiracional, tranquilo, visual',
      mecanismo: 'Afirmación en presente + imagen de contexto emocional',
      macro_theme: 'abundancia', format: 'affirmation', objective: 'saves',
    },
    {
      creator: null,
      format_detected: 'Pin de imagen — cita inspiracional',
      tema: 'Merecimiento y autoestima',
      idea_principal: 'Creerte merecedora es el primer paso antes de cualquier técnica de manifestación.',
      hook_original: '"No puedes atraer lo que crees que no mereces"',
      estructura: ['Cita en tipografía serif', 'Fondo neutro o floral', 'Sin texto adicional'],
      tono: 'Reflexivo, íntimo, poético',
      mecanismo: 'Cita de identificación + imagen que invita a guardar',
      macro_theme: 'merecimiento', format: 'affirmation', objective: 'saves',
    },
  ],
  facebook: [
    {
      creator: null,
      format_detected: 'Post de texto largo',
      tema: 'Señales del universo en lo cotidiano',
      idea_principal: 'Las señales no son espectaculares — llegan como coincidencias que sientes significativas.',
      hook_original: 'Esta semana el universo me mandó 3 señales. Aquí están.',
      estructura: ['Hook personal + lista de señales', 'Reflexión sobre por qué las ignoramos', 'Pregunta para comentarios'],
      tono: 'Conversacional, personal, íntimo',
      mecanismo: 'Historia personal + listado + pregunta que invita a compartir experiencias',
      macro_theme: 'senales', format: 'pov', objective: 'comments',
    },
  ],
  web: [
    {
      creator: null,
      format_detected: 'Artículo o blog post',
      tema: 'Desapego en la manifestación',
      idea_principal: 'Soltar el resultado no significa que ya no te importa — significa que confías en que llegará.',
      hook_original: 'La paradoja del desapego: cómo dejar ir algo sin dejar de quererlo',
      estructura: ['Definición del concepto', 'Por qué el aferramiento bloquea', 'Método concreto para soltar'],
      tono: 'Reflexivo, analítico, con calidez',
      mecanismo: 'Paradoja → explicación → herramienta práctica',
      macro_theme: 'desapego', format: 'scripting_guided', objective: 'saves',
    },
    {
      creator: null,
      format_detected: 'Artículo o contenido web',
      tema: 'Oportunidades y suerte como hábito',
      idea_principal: 'Las personas "con suerte" tienen comportamientos específicos que aumentan sus probabilidades.',
      hook_original: 'La suerte no es aleatoria: lo que hacen diferente las personas que siempre tienen buenas oportunidades',
      estructura: ['Desmitificación de la suerte', '3–5 comportamientos concretos', 'Conclusión accionable'],
      tono: 'Analítico, motivador, basado en evidencia',
      mecanismo: 'Desmitificación + listado de hábitos + reencuadre de control',
      macro_theme: 'oportunidades', format: 'reel_educational', objective: 'saves',
    },
  ],
}

// ── Mock analyzer ──────────────────────────────────────────────────
// STUB: Replace the body of this function with a real URL extractor.
// The return type (InspirationAnalysis) must stay stable.

export function mockAnalyzeUrl(url: string, platform: InspiredPlatform): InspirationAnalysis {
  const pool = MOCK_POOL[platform] ?? MOCK_POOL.web

  // Pick based on URL hash for determinism (same URL → same result)
  const hash = url.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const template = pool[hash % pool.length]

  return {
    platform,
    url,
    ...template,
    is_mock: true,
  }
}

// ── Generated content for Victoria ────────────────────────────────
// Uses existing generation layer — no changes needed when real extractor connects.

export interface InspirationResult {
  analysis: InspirationAnalysis
  content: GeneratedContent
}

export function generateInspirationContent(analysis: InspirationAnalysis): InspirationResult {
  const content = generateMockContent(analysis.macro_theme, analysis.format, analysis.objective)
  return { analysis, content }
}
