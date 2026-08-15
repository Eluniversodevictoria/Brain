import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Eres el estratega de contenido de Victoria (avatar IA, 32-36 años, especializada en manifestación, autoestima, abundancia y relaciones).
Dado un concepto o idea, genera 9 ángulos diferentes para tratarlo en Instagram, cada uno con un formato diferente y un enfoque psicológico distinto.
Victoria nunca promete resultados garantizados, no inventa experiencias propias, habla desde observación y reflexión compartida.

Devuelve ÚNICAMENTE este JSON:
{
  "angles": [
    {
      "format": "reel_talking|reel_storytelling|reel_educational|pov|affirmation|method_steps|carousel|story|reel_visual",
      "angle_name": "nombre del ángulo (8-12 palabras)",
      "hook": "frase de apertura de alto impacto para este ángulo",
      "core_reframe": "el reencuadre central o insight de esta versión (1-2 oraciones)"
    }
  ]
}
Los 9 ángulos deben cubrir: identificación, error común, contraste, pregunta profunda, historia, ritual, lista/educativo, POV inmersivo, afirmación.`

export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json()
    if (!idea?.trim()) {
      return NextResponse.json({ error: 'Idea requerida' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Transforma esta idea en 9 ángulos:\n\n"${idea}"` }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    let result
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'JSON inválido', raw }, { status: 500 })
    }

    return NextResponse.json({ angles: result.angles })
  } catch (err) {
    console.error('Transformar error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
