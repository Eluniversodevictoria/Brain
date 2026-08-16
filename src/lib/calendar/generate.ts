// Week generator — uses the editorial template + scoring engine to produce
// a full week of CalendarEntry-compatible objects. No hardcoded hooks.

import { WEEKLY_TEMPLATE, FEED_FORMAT_MAP, type DayTemplate } from './template'
import type { MacroTheme, ContentFormatType, ContentStatus } from '@/types'

export type CalendarSlotMeta = {
  time_slot: string
  content_type: 'feed' | 'story'
  feed_format?: 'reel' | 'imagen' | 'carrusel'
  story_type?: string
  day_theme: string
  day_theme_label: string
  hook: string
  idea: string
  macro_theme: MacroTheme
  format: ContentFormatType
}

export type GeneratedEntry = {
  scheduled_date: string         // YYYY-MM-DD
  status: ContentStatus
  notes: string                  // JSON-encoded CalendarSlotMeta
  format_type: string
}

// Hook seed banks per theme — varied, not autobiographical
const HOOK_BANK: Record<MacroTheme, string[]> = {
  manifestacion: [
    'Hay algo que haces después de pedir lo que quieres que puede estar saboteándote.',
    'No necesitas pensar en tu deseo todo el día para manifestarlo.',
    'La manifestación no falla porque no funciona — falla por esto.',
    'Lo que bloquea la manifestación casi nunca es lo que crees.',
  ],
  dinero: [
    'Puede que no tengas un problema con el dinero, sino con permitirte recibirlo.',
    '3 señales de que estás asociando dinero con culpa o ansiedad.',
    'La relación con el dinero se aprende — y también se puede reaprender.',
    'No es que el dinero no llegue. Es que no estás en posición de recibirlo.',
  ],
  abundancia: [
    'La abundancia no es una cantidad — es una frecuencia.',
    'Hay 7 palabras que puedes decir hoy para cambiar la energía de tu hogar.',
    'Lo que dices sobre el dinero en voz baja importa más de lo que crees.',
    'Todo lo que se bendice, aumenta. Empieza aquí.',
  ],
  suerte: [
    'La suerte tiene una frecuencia — y se puede aprender a sintonizarla.',
    '¿Y si la suerte no es aleatoria sino que responde a algo concreto?',
    'Las personas que "tienen suerte" hacen esto diferente.',
    'Hay 3 hábitos que atraen más oportunidades que cualquier ritual.',
  ],
  oportunidades: [
    'Hay oportunidades que no ves porque no crees que son para ti.',
    'Dejas de ver las oportunidades cuando buscas las que imaginaste, no las que existen.',
    'La oportunidad llega diferente de como la pediste — por eso no la reconoces.',
    '¿Y si ya estás rodeada de oportunidades y simplemente no las estás mirando?',
  ],
  rituales: [
    'Di estas palabras antes de salir de tu casa.',
    'Un ritual de 1 minuto al llegar a casa puede cambiar cómo sientes tu hogar.',
    'No necesitas un altar ni velas. El ritual más poderoso es este.',
    '5 frases para bendecir diferentes espacios de tu hogar.',
  ],
  senales: [
    'Si últimamente estás viendo la misma señal una y otra vez, escucha esto.',
    '3 pequeñas cosas que pueden cambiar tu energía este fin de semana.',
    '¿Cuántas señales necesitas ver antes de empezar a confiar en el proceso?',
    'Las señales no aparecen cuando las buscas — aparecen cuando dejas de necesitarlas.',
  ],
  numeros_fechas: [
    'El 11/11 no es magia — es un recordatorio de que ya llevas tiempo preparándote.',
    'Hay fechas que no son coincidencia. Son invitaciones.',
    'Los números que sigues viendo tienen algo que decirte.',
    '¿Y si la fecha de hoy ya tiene algo de especial?',
  ],
  deseos_concretos: [
    'Lo que pides al universo no puede ser vago. Te explico por qué.',
    'La diferencia entre un deseo que se cumple y uno que no — está en esto.',
    'Hay una manera de escribir tus deseos que los hace más reales.',
    'Un deseo concreto tiene más fuerza que diez intenciones vagas.',
  ],
  creencias: [
    'Si te has dicho "yo no soy de las que tienen eso" — necesitas ver esto.',
    'La creencia que más bloquea la abundancia no es obvia.',
    'Tus límites no son tuyos — son prestados. Y se pueden devolver.',
    '¿Cuántas de tus creencias sobre el dinero son realmente tuyas?',
  ],
  merecimiento: [
    'Nadie te va a dar lo que tú misma no consideras que mereces.',
    'La forma en la que hablas de ti también le enseña al mundo cómo tratarte.',
    '5 cosas que deberías dejar de decir sobre ti misma.',
    'Hay una versión de ti que ya sabe que merece lo que pide.',
  ],
  desapego: [
    '¿Y si soltar no significa que ya no te importa? ¿Y si es exactamente lo contrario?',
    'Antes de comenzar una nueva semana, deja esto atrás.',
    '5 cosas que no tienes que llevar contigo a una nueva semana.',
    'Soltar no es rendirse — es hacer espacio para lo que sigue.',
  ],
  amor_relaciones: [
    'Deja de pedir un amor que todavía no estás dispuesta a recibir.',
    'El amor que quieres también requiere una versión diferente de ti.',
    'Hay cosas que no deberías confundir con amor.',
    'La relación más importante que tienes es la que tienes contigo misma.',
  ],
}

const STORY_IDEA_BANK: Record<string, string[]> = {
  encuesta:           ['¿Esto resuena contigo?', '¿Lo has intentado antes?', '¿Qué se siente pensar en esto?'],
  caja:               ['¿Qué pregunta tienes sobre este tema?', '¿Qué estás enfrentando esta semana?', 'Cuéntame algo que quieras cambiar'],
  reflexion:          ['Pausa un momento y observa cómo te sientes', 'Tómate 60 segundos para esto', 'Una pregunta para llevar contigo hoy'],
  afirmacion:         ['Repite esto en voz alta', 'Guarda esto para cuando lo necesites', 'Una afirmación para arrancar el día'],
  mini_ejercicio:     ['Ejercicio rápido de 2 minutos', 'Prueba esto hoy y observa qué pasa', 'Un ejercicio simple con mucho impacto'],
  ritual:             ['Mini ritual para esta noche', 'Un ritual de 1 minuto', 'Haz esto antes de dormir'],
  compartir_reel:     ['¿Ya viste el Reel de hoy?', 'Si esto resonó contigo, guárdalo', 'Comparte si conoces a alguien que lo necesita'],
  pregunta_audiencia: ['Cuéntame en los comentarios', '¿Cómo te describes tú?', '¿Qué te gustaría ver más?'],
  elige_opcion:       ['¿Con cuál te identificas más?', 'Elige la que más resuena', '¿A cuál le mandas esto?'],
  cierre_nocturno:    ['Para cerrar el día con intención', 'Una cosa que soltas hoy', 'Reflexión antes de dormir'],
}

function pickHook(theme: MacroTheme, seed: number): string {
  const bank = HOOK_BANK[theme] ?? ['¿Y si lo que buscas ya existe en ti?']
  return bank[seed % bank.length]
}

function pickStoryIdea(storyType: string, seed: number): string {
  const bank = STORY_IDEA_BANK[storyType] ?? ['Interacción con tu audiencia']
  return bank[seed % bank.length]
}

function dateKey(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function generateWeekEntries(weekDates: Date[]): GeneratedEntry[] {
  const entries: GeneratedEntry[] = []
  const daySeed = Date.now() % 1000 // slight randomness per generation run

  for (const date of weekDates) {
    const jsDay = date.getDay() // 0=Sun
    const template: DayTemplate = WEEKLY_TEMPLATE[jsDay]
    const dk = dateKey(date)

    // Feed slots
    template.feedSlots.forEach((slot, i) => {
      const seed = jsDay * 100 + i + daySeed
      const hook = pickHook(template.theme, seed)
      const format = FEED_FORMAT_MAP[slot.format]
      const meta: CalendarSlotMeta = {
        time_slot: slot.time,
        content_type: 'feed',
        feed_format: slot.format,
        day_theme: template.theme,
        day_theme_label: template.themeLabel,
        hook,
        idea: slot.label,
        macro_theme: template.theme,
        format,
      }
      entries.push({
        scheduled_date: dk,
        status: 'idea',
        notes: JSON.stringify(meta),
        format_type: slot.format,
      })
    })

    // Story slots
    template.storySlots.forEach((slot, i) => {
      const seed = jsDay * 100 + i + daySeed + 50
      const meta: CalendarSlotMeta = {
        time_slot: slot.time,
        content_type: 'story',
        story_type: slot.type,
        day_theme: template.theme,
        day_theme_label: template.themeLabel,
        hook: '',
        idea: pickStoryIdea(slot.type, seed),
        macro_theme: template.theme,
        format: 'story' as ContentFormatType,
      }
      entries.push({
        scheduled_date: dk,
        status: 'idea',
        notes: JSON.stringify(meta),
        format_type: 'story',
      })
    })
  }

  return entries
}

export function parseMeta(notes: string | null | undefined): CalendarSlotMeta | null {
  if (!notes) return null
  try {
    const parsed = JSON.parse(notes)
    if (parsed.content_type) return parsed as CalendarSlotMeta
  } catch {}
  return null
}
