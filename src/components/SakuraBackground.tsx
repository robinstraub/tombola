import { useState } from 'react'

interface SakuraBackgroundProps {
  count?: number
}

interface Petal {
  left: number
  delay: number
  duration: number
  size: number
  drift: number
  rotate: number
}

function createPetals(count: number): Petal[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    delay: -Math.random() * 12,
    duration: 9 + Math.random() * 9,
    size: 10 + Math.random() * 14,
    drift: 40 + Math.random() * 120,
    rotate: Math.random() * 360,
  }))
}

/** A gentle, GPU-friendly rain of cherry-blossom petals across the backdrop. */
export function SakuraBackground({ count = 28 }: SakuraBackgroundProps) {
  // Generated once on mount (lazy initialiser) so petals stay stable across
  // re-renders and we don't call an impure function during render.
  const [petals] = useState<Petal[]>(() => createPetals(count))

  return (
    <div className="sakura" aria-hidden="true">
      {petals.map((petal, i) => (
        <span
          key={i}
          className="sakura__petal"
          style={
            {
              left: `${petal.left}%`,
              width: `${petal.size}px`,
              height: `${petal.size * 0.9}px`,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
              '--drift': `${petal.drift}px`,
              '--rot': `${petal.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
