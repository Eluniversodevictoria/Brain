/**
 * Context Builder — assembles the dynamic prompt for the agent.
 * Each call to the LLM receives only the context needed for that specific piece.
 * Never a monolithic system prompt.
 */

import { createClient } from '@/lib/supabase/server'
import type { MacroTheme, ContentObjective, ContentFormatType, HookMechanism } from '@/types'

export interface ContextPackage {
  persona: string
  brandVoice: string
  pain: string
  hooks: string
  format: string
  antiRepetition: string
  totalEstimatedTokens: number
}

export async function buildGenerationContext(
  theme: MacroTheme,
  formatType: ContentFormatType,
  objective: ContentObjective
): Promise<ContextPackage> {
  const supabase = await createClient()

  // Fetch in parallel — only what we need
  const [personaRes, voiceRes, painRes, hooksRes, formatRes, recentRes] = await Promise.all([
    supabase.from('persona').select('*').eq('is_active', true).single(),
    supabase.from('brand_voice').select('*').single(),
    supabase.from('pains').select('*').eq('macro_theme', theme).eq('is_active', true).limit(1).maybeSingle(),
    supabase.from('hooks').select('*').contains('compatible_themes', [theme]).eq('is_active', true).limit(5),
    supabase.from('formats').select('*').eq('format_type', formatType).eq('is_active', true).maybeSingle(),
    supabase.from('content_pieces').select('angle, hook_text, macro_theme').eq('macro_theme', theme).order('created_at', { ascending: false }).limit(12),
  ])

  const persona = personaRes.data
  const voice = voiceRes.data
  const pain = painRes.data
  const hooksList = hooksRes.data ?? []
  const format = formatRes.data
  const recent = recentRes.data ?? []

  // ── BLOQUE 1: VICTORIA ──────────────────────────────────
  const personaBlock = persona ? `
PERSONAJE: Victoria, mujer de 32-36 años, avatar IA con continuidad.
Historia: ${persona.backstory ?? ''}
Voz: ${persona.speech_style ?? ''}
Frases recurrentes (usar con variación natural, NO repetir mecánicamente): ${(persona.recurring_phrases ?? []).join(' · ')}
NUNCA diría: ${(persona.would_never_say ?? []).slice(0, 6).join(' · ')}
Regla crítica de storytelling: Victoria solo puede referirse en primera persona a hechos confirmados en su ficha. Para otros dolores, usa observaciones, reflexiones o ejemplos hipotéticos — NUNCA los inventa como experiencias propias.` : 'PERSONAJE: Victoria (configurar en /base)'

  // ── BLOQUE 2: VOZ ──────────────────────────────────────
  const voiceBlock = voice ? `
VOZ DE MARCA:
Cercanía: ${voice.closeness}/5 | Espiritualidad: ${voice.spirituality_level}/5
Español: ${voice.spanish_type}
Palabras preferidas: ${(voice.preferred_words ?? []).join(', ')}
Palabras prohibidas: ${(voice.forbidden_words ?? []).join(', ')}
CTA style: invitación, nunca comando urgente
Emojis: mínimos e intencionales, no decorativos` : ''

  // ── BLOQUE 3: DOLOR ─────────────────────────────────────
  const painBlock = pain ? `
DOLOR SELECCIONADO — Tema: ${theme}
Dolor superficial: "${pain.surface_pain}"
Dolor emocional: "${pain.emotional_pain ?? ''}"
Pensamiento privado (de la audiencia, nunca atribuir a Victoria directamente): "${pain.private_thought ?? ''}"
Miedo central: "${pain.core_fear ?? ''}"
Deseo superficial: "${pain.surface_desire ?? ''}"
Deseo profundo: "${pain.deep_desire ?? ''}"
Situaciones cotidianas: ${(pain.daily_situations ?? []).join(' · ')}
Nota de fuente: ${pain.voc_type === 'hipotesis' ? '[HIPÓTESIS — no presentar como dato validado]' : '[' + pain.voc_type.toUpperCase() + ']'}` : `
DOLOR — Tema: ${theme}
No hay dolor específico cargado para este tema todavía.
Genera contenido basado en el tema general con cautela. Marca claramente que se necesita investigación de audiencia antes de usar como referencia.`

  // ── BLOQUE 4: HOOKS ─────────────────────────────────────
  const hooksBlock = hooksList.length > 0 ? `
HOOKS DISPONIBLES PARA ESTE TEMA:
${hooksList.map(h => `[${h.mechanism.toUpperCase()}] Plantilla: "${h.template}" | Por qué funciona: ${h.why_it_works ?? ''}`).join('\n')}` : `
HOOKS: No hay hooks específicos cargados. Usa tu criterio basándote en los mecanismos: curiosidad, identificación, error, contraste, señal.`

  // ── BLOQUE 5: FORMATO ────────────────────────────────────
  const formatBlock = format ? `
FORMATO: ${format.name}
Estructura: ${format.structure ?? 'Hook → desarrollo → reflexión → CTA'}
Duración estimada: ${format.recommended_length_seconds ? format.recommended_length_seconds + ' segundos' : 'flexible'}` : `
FORMATO: ${formatType}
Adapta la estructura al tipo de contenido seleccionado.`

  // ── BLOQUE 6: ANTIREPETICIÓN ─────────────────────────────
  const antiRepBlock = recent.length > 0 ? `
ÁNGULOS YA USADOS RECIENTEMENTE — NO REPETIR:
${recent.map(r => `• Ángulo: "${r.angle ?? ''}" | Hook: "${r.hook_text?.slice(0, 60) ?? ''}..."`).join('\n')}` : ''

  return {
    persona: personaBlock,
    brandVoice: voiceBlock,
    pain: painBlock,
    hooks: hooksBlock,
    format: formatBlock,
    antiRepetition: antiRepBlock,
    totalEstimatedTokens: 1200, // estimate
  }
}

export function buildSystemPrompt(ctx: ContextPackage, objective: ContentObjective): string {
  return `Eres el cerebro creativo del perfil de Instagram de Victoria.
Victoria es un personaje ficticio: mujer de 32-36 años, avatar IA creado con inteligencia artificial, con continuidad visual y de personalidad.

REGLAS ABSOLUTAS:
1. No prometas resultados financieros, médicos o materiales concretos.
2. No uses frases vacías sin contexto real ("cree en ti", "el universo tiene grandes cosas para ti").
3. Mantén siempre la voz de Victoria — no inventes hechos biográficos no confirmados en su ficha.
4. Las frases recurrentes de Victoria son referencias de voz, NO plantillas obligatorias. Varía el lenguaje naturalmente.
5. Genera ÚNICAMENTE en el formato JSON especificado. Sin texto adicional fuera del JSON.
6. Reconoce que existen circunstancias externas reales — la abundancia y manifestación no ignoran eso.

${ctx.persona}

${ctx.brandVoice}

${ctx.pain}

${ctx.hooks}

${ctx.format}

${ctx.antiRepetition}

OBJETIVO DE ESTA PIEZA: ${objective}

INSTRUCCIÓN: Genera una pieza de contenido completa para Victoria.
Devuelve ÚNICAMENTE el siguiente JSON, sin texto antes ni después:

{
  "strategy": {
    "objective": "string — objetivo real logrado",
    "pain_used": "string — dolor específico activado",
    "private_thought": "string — pensamiento de la audiencia que resonará",
    "desire": "string — deseo que se toca",
    "primary_emotion": "string — emoción principal que provoca",
    "psychological_mechanism": "string — mecanismo usado y por qué funciona",
    "angle": "string — ángulo único de esta pieza (debe diferir de los recientes)"
  },
  "hook": "string — frase de apertura de máximo impacto (primeros 3 segundos)",
  "script": "string — guion completo con ritmo de Victoria. Párrafos separados con \\n\\n",
  "on_screen_text": "string — texto que aparece visualmente en pantalla (separado del guion)",
  "visual_direction": "string — qué hace Victoria en el video: expresión, movimiento, escenario, plano, objetos, iluminación. Mantener continuidad del personaje.",
  "caption": "string — descripción de Instagram en voz de Victoria",
  "cta": "string — llamado a la acción como invitación, no como comando urgente",
  "hashtags": ["string", "string"],
  "ai_video_prompt": "string — prompt en inglés listo para Flow/Veo/Hedra, incluyendo CHARACTER CONSISTENCY de Victoria"
}`
}
