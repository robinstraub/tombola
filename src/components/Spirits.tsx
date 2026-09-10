import { useState } from 'react'

interface SpiritsProps {
  count?: number
}

interface Spirit {
  left: number
  top: number
  delay: number
  duration: number
  size: number
  hue: 'cyan' | 'blossom'
}

function createSpirits(count: number): Spirit[] {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: -Math.random() * 8,
    duration: 5 + Math.random() * 7,
    size: 4 + Math.random() * 7,
    hue: i % 3 === 0 ? 'blossom' : 'cyan',
  }))
}

/**
 * Floating spirit fox-fire: soft glowing motes drifting through the mist, in
 * the luminous cyan / magenta of the Spirit Blossom mood.
 */
export function Spirits({ count = 22 }: SpiritsProps) {
  const [spirits] = useState<Spirit[]>(() => createSpirits(count))

  return (
    <div className="spirits" aria-hidden="true">
      {spirits.map((s, i) => (
        <span
          key={i}
          className={`spirits__mote spirits__mote--${s.hue}`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
