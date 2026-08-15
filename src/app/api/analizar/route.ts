import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Allow up to 90s — Apify (25s) + AssemblyAI transcription (up to 40s)
export const maxDuration = 90

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Eres el motor de contenido de "El Universo de Victoria" — una cuenta de Instagram de una mujer de 32-36 años especializada en manifestación, autoestima, abundancia y crecimiento personal.

Tu tarea: analizar contenido de referencia e inspirarte en él para crear contenido para Victoria. El objetivo NO es reescribirlo desde cero — es mantener la esencia práctica del original (la lista, el ritual, los pasos concretos, la estructura) y adaptarla a la voz de Victoria.

REGLA PRINCIPAL — preservar lo concreto al máximo:
Si el original tiene una lista de afirmaciones o palabras específicas, Victoria usa ESA MISMA LISTA o una muy cercana — mismo número de ítems, mismo formato de cada ítem (ej: si son "Yo soy X", Victoria también usa "Yo soy X").
Si el original enseña un ritual con pasos, Victoria enseña ese mismo ritual con esos mismos pasos.
Si el original menciona un número específico (7 palabras, 3 pasos, 5 días), Victoria mantiene exactamente ese número.
Lo que cambia es SOLO el intro, el outro, el tono narrativo y la voz — no el contenido central.
Si el texto de referencia NO incluye los ítems específicos (solo menciona que existen), infiere el formato y crea ítems coherentes con el tema.
REGLA DE CONSISTENCIA NUMÉRICA: antes de escribir cualquier campo, cuenta los ítems reales de la lista. Ese número debe ser idéntico en el hook, el main_text, el on_screen_text y el caption. Si la lista tiene 6 ítems, todos los campos dicen "seis" — nunca "siete". Nunca uses un número diferente al conteo real.

VOZ DE VICTORIA:
- Cercana, reflexiva, como una amiga que entendió algo importante — no una coach dando instrucciones
- No promete resultados materiales garantizados ("el dinero llegará", "tu vida cambiará")
- NUNCA inventa experiencias propias: no usar "yo lo comprobé", "a mí me cambió la vida", "la frase que cambió mi hogar", "las declaraciones que yo uso" ni ninguna historia personal no definida
- Usa segunda persona ("tú") y ancla las prácticas en momentos concretos del día: "cuando preparas el café", "antes de salir", "mientras ordenas el cuarto"
- Crea imagen o contexto emocional ANTES de dar la práctica — no empieces directo con instrucciones
- Incluye al menos una frase que toque algo emocional real: el cansancio de esperar, el deseo de calma, las ganas de sentir que algo va bien
- Usa el lenguaje de manifestación con matiz: "puedes verlo como…", "una práctica que puede ayudarte…", "prueba observar cómo se siente…"
- Evita frases genéricas vacías: "es más simple de lo que imaginas", "no es un ritual complicado", "solo tienes que…"

CAMPOS:
- hook: frase de apertura que detiene el scroll — máx 10 palabras, sin emojis, SIN autobiografía inventada. Debe ser una de estas fórmulas: (a) dato inesperado o número concreto ("Hay siete palabras que cambian cómo percibes tu hogar"), (b) pregunta que toca algo incómodo o deseado ("¿Y si lo que buscas ya está disponible para ti?"), (c) afirmación que rompe una creencia común ("La energía de tu hogar no depende de lo que compras"). NUNCA empezar con "¿Alguna vez…", "A veces…", ni preguntas genéricas de identificación
- main_text: guion hablado completo — si el original tiene lista, la lista va incluida; pero antes y después de la lista debe haber contexto emocional que la ancle; 130-200 palabras
- on_screen_text: texto corto que aparece en pantalla mientras Victoria habla — distinto al main_text, máx 3-4 líneas o la lista clave si aplica
- caption: texto para la publicación, máx 150 palabras, 4-6 emojis dispersos de forma natural a lo largo del texto, SIN frases como "las que yo uso" o "lo que a mí me funciona"

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
    "main_text": "guion completo con la estructura concreta del original adaptada a Victoria",
    "on_screen_text": "texto breve para pantalla — diferente al main_text, puede ser la lista clave si aplica",
    "cta": "call to action de Victoria, máx 15 palabras",
    "caption": "caption completo con saltos de línea, máx 150 palabras, 4-6 emojis dispersos de forma natural a lo largo del texto (no solo al inicio o al final)",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"],
    "visual_style": "uno de los estilos válidos de arriba",
    "visual_style_label": "descripción muy corta del estilo elegido"
  }
}`

// ── URL extractors ────────────────────────────────────────────────────

type ApifyResult = { text: string | null; timedOut: boolean }

async function transcribeWithAssemblyAI(audioUrl: string): Promise<string | null> {
  const key = process.env.ASSEMBLYAI_API_KEY
  if (!key) return null

  try {
    // Submit transcription job
    const submitRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: { authorization: key, 'content-type': 'application/json' },
      body: JSON.stringify({ audio_url: audioUrl, language_code: 'es' }),
      signal: AbortSignal.timeout(10000),
    })
    if (!submitRes.ok) return null
    const { id } = await submitRes.json()
    if (!id) return null

    // Poll until complete (max 40s)
    const deadline = Date.now() + 40000
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 3000))
      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: { authorization: key },
        signal: AbortSignal.timeout(8000),
      })
      if (!pollRes.ok) break
      const data = await pollRes.json()
      if (data.status === 'completed') return data.text ?? null
      if (data.status === 'error') break
    }
  } catch { /* transcription failed — proceed with caption only */ }

  return null
}

async function extractInstagram(url: string): Promise<ApifyResult> {
  const token = process.env.APIFY_API_TOKEN
  if (!token) return { text: null, timedOut: false }

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}&timeout=25`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directUrls: [url],
          resultsType: 'posts',
          resultsLimit: 1,
        }),
        signal: AbortSignal.timeout(30000),
      },
    )
    if (!res.ok) return { text: null, timedOut: false }
    const items = await res.json()
    const post = Array.isArray(items) ? items[0] : null
    if (!post) return { text: null, timedOut: false }

    // Try to transcribe the video if available
    const videoUrl: string | undefined = post.videoUrl
    const transcript = videoUrl ? await transcribeWithAssemblyAI(videoUrl) : null

    const parts: string[] = []
    if (post.ownerUsername) parts.push(`@${post.ownerUsername}`)
    if (transcript) parts.push(`TRANSCRIPCIÓN DEL VIDEO:\n${transcript}`)
    if (post.caption) parts.push(`CAPTION:\n${post.caption}`)
    if (!transcript && post.hashtags?.length) parts.push(post.hashtags.map((h: string) => `#${h}`).join(' '))

    return { text: parts.join('\n\n') || null, timedOut: false }
  } catch (err) {
    const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')
    return { text: null, timedOut: isTimeout }
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
        const ig = await extractInstagram(targetUrl)
        textToAnalyze = ig.text
        if (!textToAnalyze) {
          const hasToken = !!process.env.APIFY_API_TOKEN
          const errorMsg = !hasToken
            ? 'La integración con Instagram no está configurada aún. Pega el caption del post directamente.'
            : ig.timedOut
            ? 'Instagram tardó demasiado en responder. Pega el caption del reel directamente aquí abajo.'
            : 'No se pudo leer este post de Instagram. Puede ser privado o haber expirado. Pega el caption directamente.'
          return NextResponse.json(
            { error: errorMsg, needsCaption: true },
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
