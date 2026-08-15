'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getAll, saveEntry, removeEntry, toggleFavorite,
  filterEntries, type ContentFilter, type SimilarityWarning,
} from '@/lib/storage'
import type { SavedEntry } from '@/lib/storage/types'

export type { SavedEntry, SimilarityWarning }

export function useContentStorage(initialFilter?: ContentFilter) {
  const [allEntries, setAllEntries] = useState<SavedEntry[]>([])
  const [filter, setFilter] = useState<ContentFilter>(initialFilter ?? {})
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      const data = await getAll()
      setAllEntries(data)
    } catch (err) {
      console.error('[useContentStorage] getAll failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  const save = useCallback(
    async (entry: Omit<SavedEntry, 'id' | 'saved_at' | 'is_favorite'>) => {
      const result = await saveEntry(entry, allEntries)
      // Optimistic prepend — no need to re-fetch
      setAllEntries(prev => [result.saved, ...prev])
      return result
    },
    [allEntries],
  )

  const remove = useCallback(
    async (id: string) => {
      // Optimistic remove
      setAllEntries(prev => prev.filter(e => e.id !== id))
      await removeEntry(id)
    },
    [],
  )

  const toggle = useCallback(
    async (id: string) => {
      // Optimistic toggle
      setAllEntries(prev =>
        prev.map(e => e.id === id ? { ...e, is_favorite: !e.is_favorite } : e)
      )
      const entry = allEntries.find(e => e.id === id)
      if (entry) await toggleFavorite(id, entry.is_favorite)
    },
    [allEntries],
  )

  const filtered = filterEntries(allEntries, filter)

  return {
    entries: filtered,
    allEntries,           // historial completo sin filtrar, para streak y scoring
    total: allEntries.length,
    loading,
    filter,
    setFilter,
    save,
    remove,
    toggle,
  }
}
