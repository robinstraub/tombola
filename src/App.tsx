import { useCallback, useRef, useState } from 'react'

import './App.css'
import { FileDrop } from './components/FileDrop'
import { SakuraBackground } from './components/SakuraBackground'
import { SlotReel } from './components/SlotReel'
import { useDraw } from './hooks/useDraw'
import type { DrawPhase, Participant } from './types'

const SPIN_DURATION_MS = 3200

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [phase, setPhase] = useState<DrawPhase>('idle')
  const [winner, setWinner] = useState<Participant | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const { remaining, winners, draw, reset } = useDraw(participants)

  const handleParticipants = useCallback((list: Participant[], name: string) => {
    setParticipants(list)
    setFileName(name)
    setPhase('idle')
    setWinner(null)
  }, [])

  const spin = useCallback(() => {
    if (phase === 'spinning' || remaining.length === 0) return

    const picked = draw()
    if (!picked) return

    setWinner(picked)
    setPhase('spinning')

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      setPhase('revealed')
    }, SPIN_DURATION_MS)
  }, [phase, remaining.length, draw])

  const nextDraw = useCallback(() => {
    setPhase('idle')
    setWinner(null)
  }, [])

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

  return (
    <div className="app">
      <SakuraBackground />

      <header className="app__header">
        <p className="app__eyebrow">道場 · DŌJŌ</p>
        <h1 className="app__title">Tombola du Japon</h1>
        <p className="app__subtitle">Tirage au sort — cap sur le pays du soleil levant</p>
      </header>

      <main className="app__main">
        {!hasParticipants ? (
          <FileDrop onParticipants={handleParticipants} />
        ) : (
          <div className="stage">
            <SlotReel phase={phase} winner={winner} />

            <div className="stage__controls">
              {phase !== 'revealed' && !poolEmpty && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={spin}
                  disabled={phase === 'spinning'}
                >
                  {phase === 'spinning' ? 'Le sort en décide…' : 'Lancer le tirage'}
                </button>
              )}

              {phase === 'revealed' && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={nextDraw}
                  disabled={remaining.length === 0}
                >
                  {remaining.length === 0 ? 'Plus de participants' : 'Tirage suivant'}
                </button>
              )}

              <button type="button" className="btn btn--ghost" onClick={restart}>
                Réinitialiser
              </button>
              <button type="button" className="btn btn--ghost" onClick={clearAll}>
                Changer de fichier
              </button>
            </div>

            <div className="stage__meta">
              {fileName && <span className="chip">{fileName}</span>}
              <span className="chip">
                {remaining.length} restant{remaining.length > 1 ? 's' : ''} / {participants.length}
              </span>
              <span className="chip">
                {winners.length} tiré{winners.length > 1 ? 's' : ''}
              </span>
            </div>

            {winners.length > 0 && (
              <section className="winners">
                <h2 className="winners__title">Gagnants</h2>
                <ol className="winners__list">
                  {winners.map((w, i) => (
                    <li key={w.id} className="winners__item">
                      <span className="winners__rank">{i + 1}</span>
                      <span className="winners__name">{w.name}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
