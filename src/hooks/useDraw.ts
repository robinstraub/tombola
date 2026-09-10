import { useCallback, useMemo, useState } from 'react'

import type { Participant } from '../types'

export interface DrawResult {
  winner: Participant
}

export interface UseDraw {
  /** Participants still eligible for the next draw. */
  remaining: Participant[]
  /** Winners in the order they were drawn (most recent last). */
  winners: Participant[]
  /** Picks a random remaining participant and removes them from the pool. */
  draw: () => Participant | null
  /** Puts every winner back into the pool. */
  reset: () => void
}

/** Cryptographically strong random integer in [0, max). */
function randomIndex(max: number): number {
  if (max <= 0) return 0
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] % max
}

export function useDraw(participants: Participant[]): UseDraw {
  const [drawnIds, setDrawnIds] = useState<string[]>([])

  const drawnSet = useMemo(() => new Set(drawnIds), [drawnIds])

  const remaining = useMemo(
    () => participants.filter((p) => !drawnSet.has(p.id)),
    [participants, drawnSet],
  )

  const winners = useMemo(() => {
    const byId = new Map(participants.map((p) => [p.id, p]))
    return drawnIds.map((id) => byId.get(id)).filter((p): p is Participant => p !== undefined)
  }, [participants, drawnIds])

  const draw = useCallback((): Participant | null => {
    const pool = participants.filter((p) => !drawnSet.has(p.id))
    if (pool.length === 0) return null

    const winner = pool[randomIndex(pool.length)]
    setDrawnIds((prev) => [...prev, winner.id])
    return winner
  }, [participants, drawnSet])

  const reset = useCallback(() => setDrawnIds([]), [])

  return { remaining, winners, draw, reset }
}
