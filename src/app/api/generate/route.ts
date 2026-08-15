import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildGenerationContext, buildSystemPrompt } from '@/lib/context-builder'
import { createClient } from '@/lib/supabase/server'
import type { MacroTheme, ContentObjective, ContentFormatType, GeneratedContent, ReelContent } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { objective, macro_theme, format_type } = body as {
      objective: ContentObjective
      macro_theme: MacroTheme
      format_type: ContentFormatType
    }

    if (!objective || !macro_theme || !format_type) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    // Build dynamic context
    const ctx = await buildGenerationContext(macro_theme, format_type, objective)
    const systemPrompt = buildSystemPrompt(ctx, objective)

    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Genera una pieza de contenido para Victoria sobre el tema "${macro_theme}" con formato "${format_type}" y objetivo "${objective}".`,
        },
      ],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON from response
    let generated: GeneratedContent
    try {
      // Strip potential markdown code blocks
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      generated = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: 'El modelo no devolvió JSON válido', raw: rawText },
        { status: 500 }
      )
    }

    // DEUDA TÉCNICA — antes de conectar esta ruta a producción:
    // El JSON que devuelve Claude no está validado contra el schema de GeneratedContent.
    // El cast `as ReelContent` asume que el modelo siempre devuelve una estructura de reel,
    // lo cual se mantiene mientras el system prompt lo fuerce. Pero si el prompt cambia,
    // o si el modelo alucina campos, los errores serán silenciosos en runtime.
    //
    // Antes de producción: añadir validación runtime del JSON (Zod u otra librería ya
    // presente en el proyecto). Patrón sugerido:
    //   const parsed = ReelContentSchema.safeParse(rawJson)
    //   if (!parsed.success) return NextResponse.json({ error: 'invalid_model_output', issues: parsed.error.issues }, { status: 500 })
    //
    // También extender el insert para manejar carousel y post kinds según FORMAT_KIND[format_type].
    const reel = generated as ReelContent
    const supabase = await createClient()
    const { data: saved, error: saveError } = await supabase
      .from('content_pieces')
      .insert({
        objective,
        macro_theme,
        psychological_mechanism: generated.strategy.psychological_mechanism,
        angle: generated.strategy.angle,
        primary_emotion: generated.strategy.primary_emotion,
        hook_text: reel.hook,
        script: reel.script,
        on_screen_text: reel.on_screen_text,
        visual_direction: reel.visual_direction,
        caption: generated.caption,
        cta: generated.cta,
        hashtags: generated.hashtags,
        ai_video_prompt: reel.ai_video_prompt,
        status: 'idea',
      })
      .select()
      .single()

    if (saveError) {
      console.error('Save error:', saveError)
      // Return content even if save fails
      return NextResponse.json({ generated, saved: null })
    }

    return NextResponse.json({ generated, saved })
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
