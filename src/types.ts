export interface Participant {
  /** Stable identifier derived from the source row. */
  id: string
  /** Display name shown when the reel stops. */
  name: string
}

export type DrawPhase = 'idle' | 'spinning' | 'revealed'
