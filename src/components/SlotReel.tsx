import { useEffect, useMemo, useRef, useState } from 'react'

import { REEL_GLYPHS, glyphAt } from '../lib/glyphs'
import type { DrawPhase, Participant } from '../types'

interface SlotReelProps {
  phase: DrawPhase
  winner: Participant | null
  /** Prize currently in play (announced, then won on reveal). */
  prize?: string | null
  /** Number of vertical glyph columns. */
  columns?: number
}

const ROWS_PER_COLUMN = 24

/**
 * A slot-machine style reel with a two-step flow:
 * - `announced`: a big overlay presents the prize that's up for grabs.
 * - `spinning` : the columns scroll fast.
 * - `revealed` : the columns settle and the centre panel shows the winner and,
 *   underneath, the prize they just won.
 */
export function SlotReel({ phase, winner, prize, columns = 5 }: SlotReelProps) {
  return (
    <div className={`reel reel--${phase}`} aria-live="polite">
      <div className="reel__frame">
        <div className="reel__columns" aria-hidden={phase === 'revealed' || phase === 'announced'}>
          {Array.from({ length: columns }, (_, i) => (
            <ReelColumn key={i} columnIndex={i} spinning={phase === 'spinning'} />
          ))}
        </div>

        {/* Step 1 — announce the prize before spinning. */}
        <div className={`reel__prize${phase === 'announced' ? ' reel__prize--shown' : ''}`}>
          {prize && (
            <div className="reel__prize-card">
              <span className="reel__prize-kicker">景品 · PROCHAIN LOT</span>
              <span className="reel__prize-name">{prize}</span>
              <span className="reel__prize-sub">À qui la chance ?</span>
            </div>
          )}
        </div>

        {/* Step 3 — reveal the winner and the prize they won. */}
        <div className={`reel__winner${phase === 'revealed' ? ' reel__winner--shown' : ''}`}>
          {winner && (
            <div className="reel__winner-card">
              <span className="reel__winner-kicker">当選 · TŌSEN</span>
              <span className="reel__winner-name">{winner.name}</span>
              {prize && <span className="reel__winner-prize">remporte&nbsp;: {prize}</span>}
              <span className="reel__winner-sub">おめでとう · Félicitations</span>
            </div>
          )}
        </div>

        <div className="reel__payline" aria-hidden="true" />
      </div>
    </div>
  )
}

interface ReelColumnProps {
  columnIndex: number
  spinning: boolean
}

function ReelColumn({ columnIndex, spinning }: ReelColumnProps) {
  // Each column keeps its own strip of glyphs; when it stops we freeze it on a
  // pseudo-random glyph so the machine never looks identical twice.
  const strip = useMemo(
    () =>
      Array.from({ length: ROWS_PER_COLUMN }, (_, row) =>
        glyphAt(columnIndex * 7 + row * 3 + row * row),
      ),
    [columnIndex],
  )

  const [restGlyph, setRestGlyph] = useState(() => REEL_GLYPHS[columnIndex % REEL_GLYPHS.length])
  const wasSpinning = useRef(false)

  useEffect(() => {
    if (wasSpinning.current && !spinning) {
      // Pick a fresh glyph to land on each time the reel halts.
      setRestGlyph(REEL_GLYPHS[Math.floor(Math.random() * REEL_GLYPHS.length)])
    }
    wasSpinning.current = spinning
  }, [spinning])

  // Slight per-column speed offset so they don't move in lockstep.
  const duration = 0.55 + columnIndex * 0.08

  return (
    <div className="reel-col">
      {spinning ? (
        <div className="reel-col__strip" style={{ animationDuration: `${duration}s` }}>
          {strip.map((glyph, i) => (
            <span className="reel-col__glyph" key={i}>
              {glyph}
            </span>
          ))}
          {/* duplicate for a seamless loop */}
          {strip.map((glyph, i) => (
            <span className="reel-col__glyph" key={`dup-${i}`}>
              {glyph}
            </span>
          ))}
        </div>
      ) : (
        <div className="reel-col__rest">
          <span className="reel-col__glyph">{restGlyph}</span>
        </div>
      )}
    </div>
  )
}
