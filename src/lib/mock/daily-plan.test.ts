// Tests for estimateLongDryStreakFromHistory
// Verifica que el streak de longitud 'long' ausente se calcula correctamente
// desde el historial local de SavedEntry.

import { describe, it, expect } from 'vitest'
import { estimateLongDryStreakFromHistory } from './daily-plan'
import type { SavedEntry } from '@/lib/storage/types'

// Helper mínimo — solo los campos que usa estimateLongDryStreakFromHistory
function entry(kind: SavedEntry['kind'], image_text_length?: SavedEntry['image_text_length']): SavedEntry {
  return {
    id: 'x',
    saved_at: '2026-01-01T00:00:00Z',
    source: 'plan-hoy',
    is_favorite: false,
    theme: 'manifestacion',
    format: 'morning_practice',
    objective: 'saves',
    hook: '',
    main_text: '',
    cta: '',
    caption: '',
    hashtags: [],
    visual_style: 'STYLE_A',
    visual_style_label: '',
    kind,
    image_text_length,
  }
}

describe('estimateLongDryStreakFromHistory', () => {
  it('devuelve 0 con historial vacío', () => {
    expect(estimateLongDryStreakFromHistory([])).toBe(0)
  })

  it('devuelve 0 cuando la última imagen es long', () => {
    const history = [
      entry('post', 'long'),    // más reciente
      entry('post', 'short'),
      entry('post', 'medium'),
    ]
    expect(estimateLongDryStreakFromHistory(history)).toBe(0)
  })

  it('cuenta correctamente varios short/medium antes del último long', () => {
    // short, medium, short, medium, medium, short, medium, short, long → streak 8
    const history = [
      entry('post', 'short'),
      entry('post', 'medium'),
      entry('post', 'short'),
      entry('post', 'medium'),
      entry('post', 'medium'),
      entry('post', 'short'),
      entry('post', 'medium'),
      entry('post', 'short'),
      entry('post', 'long'),    // último long
      entry('post', 'medium'),  // anterior al long: no cuenta
    ]
    expect(estimateLongDryStreakFromHistory(history)).toBe(8)
  })

  it('reels intercalados no afectan el streak', () => {
    const history = [
      entry('post', 'short'),
      entry('reel'),            // ← debe ignorarse
      entry('post', 'medium'),
      entry('reel'),            // ← debe ignorarse
      entry('post', 'long'),
    ]
    expect(estimateLongDryStreakFromHistory(history)).toBe(2)
  })

  it('carouseles intercalados no afectan el streak', () => {
    const history = [
      entry('post', 'short'),
      entry('carousel'),        // ← debe ignorarse
      entry('post', 'medium'),
      entry('carousel'),        // ← debe ignorarse
      entry('post', 'long'),
    ]
    expect(estimateLongDryStreakFromHistory(history)).toBe(2)
  })

  it('entradas legacy kind=image cuentan como imágenes', () => {
    const history = [
      entry('image', 'short'),  // legacy
      entry('image', 'medium'), // legacy
      entry('post', 'long'),
    ]
    expect(estimateLongDryStreakFromHistory(history)).toBe(2)
  })

  it('entradas legacy sin image_text_length se tratan como non-long (conservador)', () => {
    // Sin image_text_length: la entrada existe pero no es 'long' → cuenta en el streak
    const history = [
      entry('post', undefined),  // sin dato: cuenta como non-long
      entry('post', 'short'),
      entry('post', 'long'),
    ]
    expect(estimateLongDryStreakFromHistory(history)).toBe(2)
  })

  it('si no hay ningún long en el historial, cuenta todos los posts de imagen', () => {
    const history = [
      entry('post', 'short'),
      entry('post', 'medium'),
      entry('reel'),
      entry('post', 'short'),
    ]
    expect(estimateLongDryStreakFromHistory(history)).toBe(3)
  })

  it('solo reels en el historial: streak es 0 (no hay posts de imagen)', () => {
    const history = [
      entry('reel'),
      entry('reel'),
      entry('reel'),
    ]
    expect(estimateLongDryStreakFromHistory(history)).toBe(0)
  })
})
