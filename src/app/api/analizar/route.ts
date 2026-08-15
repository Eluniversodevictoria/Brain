import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Allow up to 45s — Apify scrapes can take 15-25s
export const maxDuration = 45

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

// ── URL extractors ────────────────────────────────────────────────────

async function extractInstagram(url: string): Promise<string | null> {
  const token = process.env.APIFY_API_TOKEN
  if (!token) return null

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}&timeout=30`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directUrls: [url],
          resultsType: 'posts',
          resultsLimit: 1,
        }),
        signal: AbortSignal.timeout(35000),
      },
    )
    if (!res.ok) return null
    const items = await res.json()
    const post = Array.isArray(items) ? items[0] : null
    if (!post) return null

    const parts: string[] = []
    if (post.ownerUsername) parts.push(`@${post.ownerUsername}`)
    if (post.caption) parts.push(post.caption)
    if (post.hashtags?.length) parts.push(post.hashtags.map((h: string) => `#${h}`).join(' '))
    return parts.join('\n\n') || null
  } catch {
    return null
  }
}

async function extractTikTok(url: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(8000) },
    )
    if (!res.ok) return null
    const data = await res.json()
    const parts: string[] = []
    if (data.author_name) parts.push(`@${data.author_name}`)
    if (data.title) parts.push(data.title)
    return parts.join('\n\n') || null
  } catch {
    return null
  }
}

async function extractPinterest(url: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(8000) },
    )
    if (!res.ok) return null
    const data = await res.json()
    const parts: string[] = []
    if (data.author_name) parts.push(`@${data.author_name}`)
    if (data.title) parts.push(data.title)
    if (data.description) parts.push(data.description)
    return parts.join('\n\n') || null
  } catch {
    return null
  }
}

async function extractWeb(url: string): Promise<string | null> {
  // Jina AI Reader — renders JS, works for most web articles
  try {
    const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' },
      signal: AbortSignal.timeout(15000),
    })
    if (jinaRes.ok) {
      const text = await jinaRes.text()
      const loginWall = /log in|sign in|iniciar sesión|create an account|join instagram|inicia sesión/i.test(text)
      if (!loginWall && text.trim().length > 100) return text.trim().slice(0, 5000)
    }
  } catch { /* continue */ }

  // Direct fetch fallback
  try {
    const res = await fetch(url, {
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
    if (stripped.length > 100) return stripped
  } catch { /* failed */ }

  return null
}

// ── Route ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { content, url } = await req.json()

    let textToAnalyze = content?.trim()

    if (!textToAnalyze && url?.trim()) {
      const targetUrl = url.trim()

      if (/instagram\.com/.test(targetUrl)) {
        textToAnalyze = await extractInstagram(targetUrl)
        if (!textToAnalyze) {
          const hasToken = !!process.env.APIFY_API_TOKEN
          return NextResponse.json(
            {
              error: hasToken
                ? 'No se pudo leer este post de Instagram. Puede ser privado o haber expirado.'
                : 'La integración con Instagram no está configurada aún. Pega el caption del post directamente.',
              needsCaption: true,
            },
            { status: 422 },
          )
        }
      } else if (/tiktok\.com|vm\.tiktok\.com/.test(targetUrl)) {
        textToAnalyze = await extractTikTok(targetUrl)
        if (!textToAnalyze) {
          return NextResponse.json(
            { error: 'No se pudo leer este post de TikTok. Pega el texto directamente.', needsCaption: true },
            { status: 422 },
          )
        }
      } else if (/pinterest\.(com|es|co)/.test(targetUrl)) {
        textToAnalyze = await extractPinterest(targetUrl)
        if (!textToAnalyze) {
          return NextResponse.json(
            { error: 'No se pudo leer este pin de Pinterest. Pega el texto directamente.', needsCaption: true },
            { status: 422 },
          )
        }
      } else {
        textToAnalyze = await extractWeb(targetUrl)
        if (!textToAnalyze) {
          return NextResponse.json(
            { error: 'No se pudo leer este URL. Prueba pegando el texto directamente.', needsCaption: true },
            { status: 422 },
          )
        }
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
