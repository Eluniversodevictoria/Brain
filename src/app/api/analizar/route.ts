import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Eres el motor de contenido de "El Universo de Victoria" — una cuenta de Instagram de una mujer de 32-36 años especializada en manifestación, autoestima, abundancia y crecimiento personal.

Tu tarea: analizar contenido de referencia, extraer el mecanismo psicológico que lo hace funcionar, y generar un piece de contenido 100% original para Victoria que use ese mismo mecanismo pero desde su voz única.

VOZ DE VICTORIA:
- Cercana, reflexiva, como una amiga que entendió algo importante
- No promete resultados materiales garantizados
- No inventa experiencias propias
- No suena a coach corporativa
- Usa segunda persona ("tú")

TEMAS VÁLIDOS: manifestacion | dinero | abundancia | suerte | oportunidades | rituales | senales | numeros_fechas | deseos_concretos | creencias | merecimiento | desapego | amor_relaciones

FORMATOS VÁLIDOS: reel_talking | reel_storytelling | reel_educational | affirmation | pov | carousel | post

ESTILOS VISUALES: STYLE_A (Glass·fondo translúcido) | STYLE_B (Editorial·texto grande fondo oscuro) | STYLE_C (Cute Cards·pasteles) | STYLE_D (Minimalista) | STYLE_E (Emocional·textura cálida) | STYLE_F (Bold·contraste fuerte)

Devuelve ÚNICAMENTE este JSON (sin markdown, sin explicaciones):
{
  "analysis": {
    "tema": "de qué trata el contenido original en 1 frase corta",
    "mecanismo": "nombre del mecanismo psicológico usado (ej: identificación, contraste, curiosidad, confesión)",
    "idea_principal": "idea central del contenido en 1 frase",
    "hook_original": "el hook del contenido original tal cual o parafraseado",
    "estructura": "cómo está construido (ej: problema → solución → CTA)",
    "tono": "tono del contenido original (ej: íntimo, urgente, educativo, aspiracional)"
  },
  "content": {
    "macro_theme": "uno de los temas válidos de arriba",
    "format": "uno de los formatos válidos de arriba",
    "objective": "saves",
    "hook": "frase de apertura para Victoria, máx 12 palabras, sin emojis",
    "main_text": "texto completo del contenido para Victoria (3-6 oraciones), sin emojis",
    "cta": "call to action de Victoria, máx 15 palabras",
    "caption": "caption completo con saltos de línea, máx 150 palabras, 1-2 emojis naturales",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"],
    "visual_style": "uno de los estilos válidos de arriba",
    "visual_style_label": "descripción muy corta del estilo elegido"
  }
}`

export async function POST(req: NextRequest) {
  try {
    const { content, url } = await req.json()

    let textToAnalyze = content?.trim()

    // If URL provided and no text, try to extract content
    if (!textToAnalyze && url?.trim()) {
      const targetUrl = url.trim()

      // Strategy 1: Jina AI Reader — renders JS, bypasses many open-web blocks.
      // Not used for Instagram/TikTok/Facebook — they always return login walls.
      const isSocialWall = /instagram\.com|tiktok\.com|vm\.tiktok\.com|facebook\.com|fb\.com/.test(targetUrl)

      if (!isSocialWall) {
        try {
          const jinaRes = await fetch(`https://r.jina.ai/${targetUrl}`, {
            headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' },
            signal: AbortSignal.timeout(15000),
          })
          if (jinaRes.ok) {
            const text = await jinaRes.text()
            // Reject if Jina returned a login wall instead of real content
            const loginWall = /log in|sign in|iniciar sesión|create an account|join instagram|inicia sesión/i.test(text)
            if (!loginWall) {
              const cleaned = text.trim().slice(0, 5000)
              if (cleaned.length > 100) textToAnalyze = cleaned
            }
          }
        } catch {
          // Jina failed — continue to strategy 2
        }
      }

      // Strategy 2: Direct fetch + strip HTML (works for open web articles)
      if (!textToAnalyze) {
        try {
          const res = await fetch(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContentBot/1.0)' },
            signal: AbortSignal.timeout(8000),
          })
          const html = await res.text()
          const stripped = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 4000)
          if (stripped.length > 100) {
            textToAnalyze = stripped
          }
        } catch {
          // Direct fetch also failed
        }
      }

      if (!textToAnalyze) {
        const msg = isSocialWall
          ? 'Instagram, TikTok y Facebook requieren login para leer el contenido. Pega el caption o texto del post en el campo de abajo.'
          : 'No se pudo leer este URL. Prueba pegando el texto directamente.'
        return NextResponse.json({ error: msg, needsCaption: isSocialWall }, { status: 422 })
      }
    }

    if (!textToAnalyze) {
      return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1800,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Analiza este contenido y genera el contenido para Victoria:\n\n${textToAnalyze}` }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    let result
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Error procesando respuesta', raw }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Analizar error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
