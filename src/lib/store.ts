'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import React from 'react'
import type { ContentObjective } from '@/types'
import { DEFAULT_STRATEGY, type PublicationStrategy } from './mock/data'
import { createClient } from '@/lib/supabase/client'

interface StrategyContextValue {
  strategy: PublicationStrategy
  updateStrategy: (patch: Partial<PublicationStrategy>) => void
  loading: boolean
}

const StrategyContext = createContext<StrategyContextValue>({
  strategy: DEFAULT_STRATEGY,
  updateStrategy: () => {},
  loading: true,
})

export function StrategyProvider({ children }: { children: React.ReactNode }) {
  const [strategy, setStrategy] = useState<PublicationStrategy>(DEFAULT_STRATEGY)
  const [loading, setLoading] = useState(true)

  // Load strategy from Supabase on mount, fall back to localStorage during migration
  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('user_strategy')
          .select('*')
          .maybeSingle()

        if (!error && data) {
          const { reels_per_week, carrusels_per_week, stories_per_week,
                  primary_objective, active_pillars, launch_start_date,
                  launch_mode } = data
          setStrategy({
            ...DEFAULT_STRATEGY,
            reels_per_week:      reels_per_week      ?? DEFAULT_STRATEGY.reels_per_week,
            carrusels_per_week:  carrusels_per_week  ?? DEFAULT_STRATEGY.carrusels_per_week,
            stories_per_week:    stories_per_week    ?? DEFAULT_STRATEGY.stories_per_week,
            primary_objective:   (primary_objective  ?? DEFAULT_STRATEGY.primary_objective) as ContentObjective,
            active_pillars:      active_pillars      ?? DEFAULT_STRATEGY.active_pillars,
            launch_start_date:   launch_start_date   ?? DEFAULT_STRATEGY.launch_start_date,
            launch_mode:         launch_mode         ?? DEFAULT_STRATEGY.launch_mode,
          })
        } else {
          // Supabase not ready — try localStorage migration
          try {
            const saved = localStorage.getItem('victoria_strategy')
            if (saved) {
              const parsed = JSON.parse(saved)
              setStrategy({ ...DEFAULT_STRATEGY, ...parsed })
            }
          } catch {}
        }
      } catch {
        // Supabase unavailable (no .env.local yet) — use localStorage fallback
        try {
          const saved = localStorage.getItem('victoria_strategy')
          if (saved) {
            const parsed = JSON.parse(saved)
            setStrategy({ ...DEFAULT_STRATEGY, ...parsed })
          }
        } catch {}
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateStrategy = (patch: Partial<PublicationStrategy>) => {
    const next = { ...strategy, ...patch }
    setStrategy(next)

    // Persist to Supabase async, keep localStorage as backup
    async function persist() {
      try {
        const supabase = createClient()
        await supabase.from('user_strategy').upsert({
          reels_per_week:      next.reels_per_week,
          carrusels_per_week:  next.carrusels_per_week,
          stories_per_week:    next.stories_per_week,
          primary_objective:   next.primary_objective,
          active_pillars:      next.active_pillars,
          launch_start_date:   next.launch_start_date,
          launch_mode:         next.launch_mode,
          updated_at:          new Date().toISOString(),
        }, { onConflict: 'user_id' })
      } catch {}
      try { localStorage.setItem('victoria_strategy', JSON.stringify(next)) } catch {}
    }
    persist()
  }

  if (loading) return React.createElement(React.Fragment, null, children)

  return React.createElement(
    StrategyContext.Provider,
    { value: { strategy, updateStrategy, loading } },
    children,
  )
}

export function useStrategy() {
  return useContext(StrategyContext)
}
