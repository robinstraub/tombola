export interface Participant {
  /** Stable identifier derived from the source row. */
  id: string
  /** Display name shown when the reel stops. */
  name: string
}

/**
 * Draw lifecycle:
 * - `idle`      nothing drawn yet, reel calm
 * - `announced` the next prize is shown big; a second click starts the spin
 * - `spinning`  the reel is rolling
 * - `revealed`  the winner (and the prize they won) is shown, with confetti
 */
export type DrawPhase = 'idle' | 'announced' | 'spinning' | 'revealed'
