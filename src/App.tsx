import { useCallback, useRef, useState } from 'react'

import './App.css'
import { FileDrop } from './components/FileDrop'
import { SakuraBackground } from './components/SakuraBackground'
import { SlotReel } from './components/SlotReel'
import { useDraw } from './hooks/useDraw'
import { prizeForRank } from './lib/prizes'
import type { DrawPhase, Participant } from './types'

const SPIN_MIN_MS = 500
const SPIN_MAX_MS = 3200
const SPIN_DEFAULT_MS = 1600

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [phase, setPhase] = useState<DrawPhase>('idle')
  const [winner, setWinner] = useState<Participant | null>(null)
  const [spinDuration, setSpinDuration] = useState(SPIN_DEFAULT_MS)
  const timeoutRef = useRef<number | null>(null)

  const { remaining, winners, draw, reset } = useDraw(participants)

  const handleParticipants = useCallback((list: Participant[], name: string) => {
    setParticipants(list)
    setFileName(name)
    setPhase('idle')
    setWinner(null)
  }, [])

  // A single action drives the whole draw: from idle *or* from a revealed
  // winner it immediately starts spinning again — no intermediate click.
  // The actual pick happens only when the reel stops, so the winner never
  // appears in the side list while the wheel is still spinning.
  const spin = useCallback(() => {
    if (phase === 'spinning' || remaining.length === 0) return

    setWinner(null)
    setPhase('spinning')

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      const picked = draw()
      if (!picked) {
        setPhase('idle')
        return
      }
      setWinner(picked)
      setPhase('revealed')
    }, spinDuration)
  }, [phase, remaining.length, draw, spinDuration])

  const restart = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    reset()
    setPhase('idle')
    setWinner(null)
  }, [reset])

  const clearAll = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    setParticipants([])
    setFileName(null)
    reset()
    setPhase('idle')
    setWinner(null)
  }, [reset])

  const hasParticipants = participants.length > 0
  const poolEmpty = hasParticipants && remaining.length === 0

  let mainButtonLabel: string
  if (poolEmpty) {
    mainButtonLabel = 'Tous les participants ont été tirés'
  } else if (phase === 'spinning') {
    mainButtonLabel = 'Le sort en décide…'
  } else if (phase === 'revealed') {
    mainButtonLabel = 'Lancer le tirage suivant'
  } else if (winners.length > 0) {
    mainButtonLabel = 'Lancer le tirage suivant'
  } else {
    mainButtonLabel = 'Lancer le tirage'
  }

  return (
    <div className="app">
      <SakuraBackground count={14} />

      <header className="app__header">
        <p className="app__eyebrow">柔道 · JUDO PAYS VILAINE</p>
        <h1 className="app__title">Grande Tombola Solidaire</h1>
        <p className="app__subtitle">Tirage au sort — cap sur le Japon 🇯🇵</p>
      </header>

      <main className={`app__main${winners.length > 0 ? ' app__main--with-winners' : ''}`}>
        {!hasParticipants ? (
          <FileDrop onParticipants={handleParticipants} />
        ) : (
          <div className="stage-layout">
            <div className="stage">
              <SlotReel phase={phase} winner={winner} />

              <div className="stage__controls">
                <button
                  type="button"
                  className="btn btn--primary btn--hero"
                  onClick={spin}
                  disabled={phase === 'spinning' || poolEmpty}
                >
                  {mainButtonLabel}
                </button>

                <label className="speed">
                  <span className="speed__label">Vitesse&nbsp;de&nbsp;la&nbsp;roulette</span>
                  <input
                    className="speed__range"
                    type="range"
                    min={SPIN_MIN_MS}
                    max={SPIN_MAX_MS}
                    step={100}
                    value={SPIN_MIN_MS + SPIN_MAX_MS - spinDuration}
                    onChange={(e) =>
                      setSpinDuration(SPIN_MIN_MS + SPIN_MAX_MS - Number(e.target.value))
                    }
                    disabled={phase === 'spinning'}
                    aria-label="Vitesse de la roulette"
                  />
                  <span className="speed__value">{(spinDuration / 1000).toFixed(1)}&nbsp;s</span>
                </label>

                <div className="stage__controls-secondary">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={restart}>
                    Réinitialiser
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={clearAll}>
                    Changer de fichier
                  </button>
                </div>
              </div>

              <div className="stage__meta">
                {fileName && <span className="chip">{fileName}</span>}
                <span className="chip">
                  {remaining.length} restant{remaining.length > 1 ? 's' : ''} /{' '}
                  {participants.length}
                </span>
                <span className="chip">
                  {winners.length} tiré{winners.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {winners.length > 0 && (
              <aside className="winners">
                <h2 className="winners__title">
                  Gagnants &amp; lots <span className="winners__count">{winners.length}</span>
                </h2>
                <ol className="winners__list">
                  {winners.map((w, i) => {
                    const prize = prizeForRank(i)
                    return (
                      <li key={w.id} className="winners__item">
                        <span className="winners__rank">{i + 1}</span>
                        <span className="winners__body">
                          <span className="winners__name">{w.name}</span>
                          {prize && <span className="winners__prize">{prize}</span>}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </aside>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
