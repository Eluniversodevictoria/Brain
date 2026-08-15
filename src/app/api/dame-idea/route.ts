import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildGenerationContext, buildSystemPrompt } from '@/lib/context-builder'
import { createClient } from '@/lib/supabase/server'
import type { MacroTheme, ContentObjective, ContentFormatType } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const THEMES: MacroTheme[] = [
  'manifestacion', 'dinero', 'abundancia', 'suerte', 'oportunidades',
  'rituales', 'senales', 'numeros_fechas', 'deseos_concretos',
  'creencias', 'merecimiento', 'desapego', 'amor_relaciones',
]

const FORMATS: ContentFormatType[] = [
  'reel_talking', 'reel_storytelling', 'reel_educational', 'pov', 'affirmation',
]

const OBJECTIVES: ContentObjective[] = [
  'grow', 'connection', 'comments', 'saves', 'authority', 'nurture',
]

export async function POST() {
  try {
    const supabase = await createClient()

    // Find which themes have least recent content to avoid repetition
    const { data: recentPieces } = await supabase
      .from('content_pieces')
      .select('macro_theme')
      .order('created_at', { ascending: false })
      .limit(20)

    const recentThemes = new Set(recentPieces?.map(p => p.macro_theme) ?? [])

    // Pick a theme that hasn't been used recently, or random if all recent
    const freshThemes = THEMES.filter(t => !recentThemes.has(t))
    const themePool = freshThemes.length > 0 ? freshThemes : THEMES
    const theme = themePool[Math.floor(Math.random() * themePool.length)] as MacroTheme

    // Pick format and objective randomly from curated pools
    const format = FORMATS[Math.floor(Math.random() * FORMATS.length)]
    const objective = OBJECTIVES[Math.floor(Math.random() * OBJECTIVES.length)]

    // Build context and generate
    const ctx = await buildGenerationContext(theme, format, objective)
    const systemPrompt = buildSystemPrompt(ctx, objective)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `El agente ha seleccionado autónomamente: tema "${theme}", formato "${format}", objetivo "${objective}". Genera la pieza de contenido completa.`,
        },
      ],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

    let generated
    try {
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      generated = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'JSON inválido del modelo', raw: rawText }, { status: 500 })
    }

    // Save
    const { data: saved } = await supabase
      .from('content_pieces')
      .insert({
        objective,
        macro_theme: theme,
        psychological_mechanism: generated.strategy.psychological_mechanism,
        angle: generated.strategy.angle,
        primary_emotion: generated.strategy.primary_emotion,
        hook_text: generated.hook,
        script: generated.script,
        on_screen_text: generated.on_screen_text,
        visual_direction: generated.visual_direction,
        caption: generated.caption,
        cta: generated.cta,
        hashtags: generated.hashtags,
        ai_video_prompt: generated.ai_video_prompt,
        status: 'idea',
      })
      .select()
      .single()

    return NextResponse.json({ generated, saved, selected: { theme, format, objective } })
  } catch (err) {
    console.error('Dame idea error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
