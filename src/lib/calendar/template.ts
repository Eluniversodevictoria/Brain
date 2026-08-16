// Editorial weekly template — structure only, not specific hooks.
// Hooks and ideas are generated dynamically by generate.ts using the scoring engine.

import type { MacroTheme, ContentFormatType } from '@/types'

export type StoryType =
  | 'encuesta'
  | 'caja'
  | 'reflexion'
  | 'afirmacion'
  | 'mini_ejercicio'
  | 'ritual'
  | 'compartir_reel'
  | 'pregunta_audiencia'
  | 'elige_opcion'
  | 'cierre_nocturno'

export const STORY_TYPE_LABELS: Record<StoryType, string> = {
  encuesta:          'Encuesta',
  caja:              'Caja de preguntas',
  reflexion:         'Reflexión',
  afirmacion:        'Afirmación',
  mini_ejercicio:    'Mini ejercicio',
  ritual:            'Ritual',
  compartir_reel:    'Compartir Reel',
  pregunta_audiencia:'Pregunta a la audiencia',
  elige_opcion:      'Elige una opción',
  cierre_nocturno:   'Cierre nocturno',
}

export type FeedSlot = {
  time: string
  format: 'reel' | 'imagen' | 'carrusel'
  label: string // brief purpose hint
}

export type StorySlot = {
  time: string
  type: StoryType
  idea: string
}

export type DayTemplate = {
  /** 0=Dom 1=Lun 2=Mar 3=Mié 4=Jue 5=Vie 6=Sáb */
  dayIndex: number
  dayName: string
  theme: MacroTheme
  themeLabel: string
  feedSlots: FeedSlot[]
  storySlots: StorySlot[]
}

export const WEEKLY_TEMPLATE: DayTemplate[] = [
  {
    dayIndex: 0, dayName: 'Domingo',
    theme: 'desapego', themeLabel: 'Cerrar ciclos + nueva semana',
    feedSlots: [
      { time: '09:30', format: 'reel',    label: 'Reel de apertura de semana' },
      { time: '14:00', format: 'imagen',  label: 'Imagen/carrusel de cierre' },
      { time: '19:30', format: 'reel',    label: 'Ritual de domingo' },
    ],
    storySlots: [
      { time: '09:00', type: 'encuesta',       idea: '¿Necesitas un nuevo comienzo esta semana?' },
      { time: '12:30', type: 'compartir_reel', idea: 'Compartir el primer Reel con reflexión' },
      { time: '16:30', type: 'caja',           idea: '¿Qué quieres dejar atrás esta semana?' },
      { time: '20:30', type: 'ritual',         idea: 'Mini ritual: escribe una cosa que sueltas y una que quieres recibir' },
    ],
  },
  {
    dayIndex: 1, dayName: 'Lunes',
    theme: 'dinero', themeLabel: 'Dinero + merecimiento',
    feedSlots: [
      { time: '09:30', format: 'reel',    label: 'Reel de apertura — relación con el dinero' },
      { time: '14:00', format: 'carrusel', label: 'Carrusel — frases para sanar la relación con el dinero' },
      { time: '19:30', format: 'reel',    label: 'Reel — señales de bloqueo económico' },
    ],
    storySlots: [
      { time: '09:00', type: 'encuesta',        idea: '¿Qué sientes al imaginar tener mucho más dinero?' },
      { time: '12:30', type: 'afirmacion',      idea: 'Afirmación de recibir y merecer' },
      { time: '16:30', type: 'caja',            idea: 'Si el dinero no fuera una preocupación, ¿qué cambiarías primero?' },
      { time: '20:30', type: 'cierre_nocturno', idea: 'Afirmación nocturna o compartir Reel' },
    ],
  },
  {
    dayIndex: 2, dayName: 'Martes',
    theme: 'manifestacion', themeLabel: 'Manifestación',
    feedSlots: [
      { time: '09:30', format: 'reel',   label: 'Reel — error común al manifestar' },
      { time: '14:00', format: 'imagen', label: 'Imagen — intención sin obsesión' },
      { time: '19:30', format: 'reel',   label: 'Reel — qué hacer después de poner una intención' },
    ],
    storySlots: [
      { time: '09:00', type: 'caja',            idea: '¿Qué estás intentando manifestar ahora?' },
      { time: '12:30', type: 'encuesta',        idea: '¿Te cuesta soltar después de pedir?' },
      { time: '16:30', type: 'mini_ejercicio',  idea: 'Mini enseñanza: intención → acción → soltar' },
      { time: '20:30', type: 'cierre_nocturno', idea: 'Afirmación o reflexión nocturna' },
    ],
  },
  {
    dayIndex: 3, dayName: 'Miércoles',
    theme: 'rituales', themeLabel: 'Rituales + hogar',
    feedSlots: [
      { time: '09:30', format: 'reel',    label: 'Reel — palabras antes de salir de casa' },
      { time: '14:00', format: 'carrusel', label: 'Carrusel — frases para bendecir el hogar' },
      { time: '19:30', format: 'reel',    label: 'Reel — ritual de 1 minuto al llegar a casa' },
    ],
    storySlots: [
      { time: '09:00', type: 'encuesta',        idea: '¿Tienes algún ritual en casa?' },
      { time: '12:30', type: 'compartir_reel',  idea: 'Compartir el Reel del día' },
      { time: '16:30', type: 'pregunta_audiencia', idea: '¿Qué lugar de tu casa te transmite más paz?' },
      { time: '20:30', type: 'afirmacion',      idea: 'Bendición o afirmación para el hogar' },
    ],
  },
  {
    dayIndex: 4, dayName: 'Jueves',
    theme: 'merecimiento', themeLabel: 'Autoestima + identidad',
    feedSlots: [
      { time: '09:30', format: 'reel',    label: 'Reel — cómo hablas de ti' },
      { time: '14:00', format: 'carrusel', label: 'Carrusel — cosas que debes dejar de decir de ti' },
      { time: '19:30', format: 'reel',    label: 'Reel — ejercicio de autoestima' },
    ],
    storySlots: [
      { time: '09:00', type: 'encuesta',        idea: '¿Te cuesta recibir cumplidos?' },
      { time: '12:30', type: 'reflexion',       idea: 'Observa cómo hablas de ti misma hoy' },
      { time: '16:30', type: 'caja',            idea: 'Dime una cualidad que sí reconoces en ti' },
      { time: '20:30', type: 'cierre_nocturno', idea: 'Afirmación nocturna de autoestima' },
    ],
  },
  {
    dayIndex: 5, dayName: 'Viernes',
    theme: 'amor_relaciones', themeLabel: 'Amor + relaciones',
    feedSlots: [
      { time: '09:30', format: 'reel',    label: 'Reel — recibir el amor que pides' },
      { time: '14:00', format: 'carrusel', label: 'Carrusel — qué no confundir con amor' },
      { time: '19:30', format: 'reel',    label: 'Reel — la versión de ti que el amor requiere' },
    ],
    storySlots: [
      { time: '09:00', type: 'encuesta',        idea: 'Abrirse al amor vs. poner límites' },
      { time: '12:30', type: 'compartir_reel',  idea: 'Compartir Reel del día' },
      { time: '16:30', type: 'caja',            idea: 'Pregunta sobre relaciones o amor propio' },
      { time: '20:30', type: 'reflexion',       idea: 'Reflexión sobre soltar o crear espacio' },
    ],
  },
  {
    dayIndex: 6, dayName: 'Sábado',
    theme: 'senales', themeLabel: 'Señales + sincronías',
    feedSlots: [
      { time: '09:30', format: 'reel',   label: 'Reel — señales repetidas' },
      { time: '14:00', format: 'imagen', label: 'Imagen — mensaje del día' },
      { time: '19:30', format: 'reel',   label: 'Reel — 3 cosas para cambiar tu energía este fin de semana' },
    ],
    storySlots: [
      { time: '09:30', type: 'elige_opcion',    idea: 'Dinámica "elige una opción" con emojis o símbolos' },
      { time: '13:00', type: 'compartir_reel',  idea: 'Compartir mensaje del día' },
      { time: '17:00', type: 'encuesta',        idea: '¿Has notado señales o sincronías últimamente?' },
      { time: '20:30', type: 'pregunta_audiencia', idea: 'Encuesta para elegir el tema de la próxima semana' },
    ],
  },
]

// Map JS getDay() (0=Sun) to template dayIndex (0=Dom)
export function getTemplateForDate(date: Date): DayTemplate {
  const jsDay = date.getDay() // 0=Sun, 1=Mon...6=Sat
  return WEEKLY_TEMPLATE[jsDay]
}

// Suggested format_type for /crear from a feed slot
export const FEED_FORMAT_MAP: Record<FeedSlot['format'], ContentFormatType> = {
  reel:    'reel_talking',
  imagen:  'post',
  carrusel: 'carousel',
}
