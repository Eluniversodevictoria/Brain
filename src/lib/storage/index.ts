import { createClient } from '@/lib/supabase/client'
import type { SavedEntry } from './types'
import type { MacroTheme, ContentFormatType } from '@/types'

// ── Similarity detection (pure, no external deps) ──────────────────

function wordSet(s: string): Set<string> {
  return new Set(s.toLowerCase().match(/\w{4,}/g) ?? [])
}

function jaccardSim(a: string, b: string): number {
  const sa = wordSet(a)
  const sb = wordSet(b)
  if (sa.size === 0 && sb.size === 0) return 1
  let inter = 0
  sa.forEach(w => { if (sb.has(w)) inter++ })
  return inter / (sa.size + sb.size - inter)
}

export interface SimilarityWarning {
  entry: SavedEntry
  reason: 'same_theme_format' | 'similar_hook'
}

export function findSimilar(
  entries: SavedEntry[],
  candidate: Pick<SavedEntry, 'theme' | 'format' | 'hook'>,
): SimilarityWarning | null {
  for (const e of entries) {
    if (e.theme === candidate.theme && e.format === candidate.format) {
      return { entry: e, reason: 'same_theme_format' }
    }
    if (jaccardSim(e.hook, candidate.hook) >= 0.6) {
      return { entry: e, reason: 'similar_hook' }
    }
  }
  return null
}

// ── Filters (pure, applied client-side to fetched data) ────────────

export interface ContentFilter {
  search?: string
  theme?: MacroTheme | ''
  format?: ContentFormatType | ''
  source?: string
  favoritesOnly?: boolean
  dateFrom?: string
  dateTo?: string
}

export function filterEntries(entries: SavedEntry[], f: ContentFilter): SavedEntry[] {
  return entries.filter(e => {
    if (f.favoritesOnly && !e.is_favorite) return false
    if (f.theme  && e.theme  !== f.theme)  return false
    if (f.format && e.format !== f.format) return false
    if (f.source && e.source !== f.source) return false
    if (f.dateFrom && e.saved_at < f.dateFrom) return false
    if (f.dateTo   && e.saved_at > f.dateTo + 'T23:59:59') return false
    if (f.search) {
      const q = f.search.toLowerCase()
      const hit = [e.hook, e.main_text, e.caption, e.cta, e.hashtags.join(' ')]
        .some(s => s.toLowerCase().includes(q))
      if (!hit) return false
    }
    return true
  })
}

// ── Supabase CRUD ──────────────────────────────────────────────────

export async function getAll(): Promise<SavedEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('saved_entries')
    .select('*')
    .order('saved_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as SavedEntry[]
}

export async function saveEntry(
  entry: Omit<SavedEntry, 'id' | 'saved_at' | 'is_favorite'>,
  existing?: SavedEntry[],
): Promise<{ saved: SavedEntry; warning: SimilarityWarning | null }> {
  const supabase = createClient()

  // Use provided existing list or fetch from Supabase for similarity check
  const pool = existing ?? await getAll()
  const warning = findSimilar(pool, entry)

  const { data, error } = await supabase
    .from('saved_entries')
    .insert(entry)
    .select()
    .single()

  if (error) throw error
  return { saved: data as SavedEntry, warning }
}

export async function removeEntry(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('saved_entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function toggleFavorite(id: string, currentValue: boolean): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('saved_entries')
    .update({ is_favorite: !currentValue })
    .eq('id', id)
  if (error) throw error
}
