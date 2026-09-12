import { useCallback, useEffect, useRef, useState } from 'react'

import './App.css'
import { Confetti } from './components/Confetti'
import { FileDrop } from './components/FileDrop'
import { SakuraBackground } from './components/SakuraBackground'
import { SlotReel } from './components/SlotReel'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { useDraw } from './hooks/useDraw'
import { PRIZE_COUNT, type PrizeOrder, orderedPrizes, prizeForRank } from './lib/prizes'
import { DEFAULT_THEME, confettiColorsFor, type ThemeId } from './lib/themes'
import type { DrawPhase, Participant } from './types'

const THEME_STORAGE_KEY = 'tombola-theme'

const SPIN_MIN_MS = 500
const SPIN_MAX_MS = 3200
const SPIN_DEFAULT_MS = 1600

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [phase, setPhase] = useState<DrawPhase>('idle')
  const [winner, setWinner] = useState<Participant | null>(null)
  const [spinDuration, setSpinDuration] = useState(SPIN_DEFAULT_MS)
  const [prizeOrder, setPrizeOrder] = useState<PrizeOrder>('smallToBig')
  const [theme, setTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    return saved === 'spirit' || saved === 'poster' ? saved : DEFAULT_THEME
  })
  const timeoutRef = useRef<number | null>(null)

  // Drive the theme through a data attribute on <html> so all CSS variables
  // (and the body background) swap in one place. Persisted across reloads.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const { remaining, winners, draw, reset } = useDraw(participants)

  const handleParticipants = useCallback((list: Participant[], name: string) => {
    setParticipants(list)
    setFileName(name)
    setPhase('idle')
    setWinner(null)
  }, [])

  // The prize shown on the centre reel depends on the phase:
  // - before/while spinning we announce the NEXT rank's prize (winners.length);
  // - once revealed, `draw()` has already bumped winners.length, so the prize
  //   just won is the one for the LAST rank (winners.length - 1).
  const stagePrizeRank = phase === 'revealed' ? winners.length - 1 : winners.length
  const stagePrize = prizeForRank(stagePrizeRank, prizeOrder)

  // Full lot list (in draw order) for the left progress panel.
  const prizeList = orderedPrizes(prizeOrder)

  // The left panel must stay in sync with what the CENTRE reel is showing.
  // During `revealed`, `draw()` has already bumped winners.length, but we're
  // still celebrating the current draw — so the lot in play (rank
  // winners.length - 1) is highlighted as "in progress", not yet ticked off.
  // It only settles once the user clicks "Lot suivant".
  const inPlayRank = phase === 'revealed' ? winners.length - 1 : winners.length
  const settledCount = phase === 'revealed' ? winners.length - 1 : winners.length
  const prizesLeft = Math.max(0, PRIZE_COUNT - settledCount)

  // First click: announce the prize that's up for grabs (the reel stays calm).
  const announce = useCallback(() => {
    if (remaining.length === 0) return
    setWinner(null)
    setPhase('announced')
  }, [remaining.length])

  // Second click: roll the reel. The actual pick happens only when it stops, so
  // the winner never appears in the side list while the wheel is still spinning.
  const spin = useCallback(() => {
    if (phase !== 'announced' || remaining.length === 0) return

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

  // Single primary button: its meaning depends on the phase.
  const primaryAction = phase === 'announced' ? spin : announce

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
  } else if (phase === 'announced') {
    // We're showing the prize; the next click actually spins the reel.
    mainButtonLabel = 'Lancer le tirage'
  } else if (phase === 'revealed' || winners.length > 0) {
    // A winner was just revealed (or some already were): reveal the next prize.
    mainButtonLabel = 'Lot suivant'
  } else {
    mainButtonLabel = 'Découvrir le premier lot'
  }

  return (
    <div className="app">
      <SakuraBackground count={14} />
      <Confetti
        fireKey={winners.length}
        active={phase === 'revealed'}
        colors={confettiColorsFor(theme)}
      />

      <ThemeSwitcher value={theme} onChange={setTheme} />

      <header className="app__header">
        <p className="app__eyebrow">柔道 · JUDO PAYS VILAINE</p>
        <h1 className="app__title">Grande Tombola Solidaire</h1>
        <p className="app__subtitle">Tirage au sort — cap sur le Japon 🇯🇵</p>
      </header>

      <main className={`app__main${hasParticipants ? ' app__main--with-winners' : ''}`}>
        {!hasParticipants ? (
          <FileDrop onParticipants={handleParticipants} />
        ) : (
          <div className="stage-layout">
            <aside className="prizes">
              <h2 className="prizes__title">
                Lots à gagner
                <span className="prizes__count">
                  {prizesLeft} restant{prizesLeft > 1 ? 's' : ''}
                </span>
              </h2>
              <ol className="prizes__list">
                {prizeList.map((prize, i) => {
                  const won = i < settledCount
                  const inPlay = i === inPlayRank && !poolEmpty
                  return (
                    <li
                      key={`${i}-${prize}`}
                      className={`prizes__item${won ? ' prizes__item--won' : ''}${
                        inPlay ? ' prizes__item--next' : ''
                      }`}
                    >
                      <span className="prizes__rank">{won ? '✓' : i + 1}</span>
                      <span className="prizes__name">{prize}</span>
                    </li>
                  )
                })}
              </ol>
            </aside>

            <div className="stage">
              <SlotReel phase={phase} winner={winner} prize={stagePrize} />

              <div className="stage__controls">
                <button
                  type="button"
                  className="btn btn--primary btn--hero"
                  onClick={primaryAction}
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

                <label className="order-toggle">
                  <input
                    type="checkbox"
                    className="order-toggle__input"
                    checked={prizeOrder === 'bigToSmall'}
                    onChange={(e) => setPrizeOrder(e.target.checked ? 'bigToSmall' : 'smallToBig')}
                    disabled={phase === 'spinning' || winners.length > 0}
                  />
                  <span className="order-toggle__text">
                    Commencer par le gros lot
                    <span className="order-toggle__hint">
                      {prizeOrder === 'bigToSmall'
                        ? 'du plus gros au plus petit'
                        : 'du plus petit au plus gros (suspense)'}
                    </span>
                  </span>
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
                    const prize = prizeForRank(i, prizeOrder)
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
