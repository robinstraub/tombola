import { useEffect, useRef } from 'react'

interface ConfettiProps {
  /** Bump this value to fire a fresh burst (e.g. the winners count). */
  fireKey: number
  /** Whether a burst should play right now. */
  active: boolean
  /** Palette for the pieces. */
  colors?: string[]
}

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  vrot: number
  color: string
  shape: 0 | 1 // 0 = rect, 1 = circle
  life: number
}

const GRAVITY = 0.15
const DRAG = 0.992
const DEFAULT_COLORS = ['#ff5fb0', '#35e6e0', '#f0c06a', '#c81e33', '#7a1f52', '#ffffff']

/**
 * Lightweight canvas confetti — no dependency. On each new `fireKey` (while
 * `active`), it shoots a "paf-paf-paf" burst from the centre plus a rain of
 * pieces from the top, then fades out on its own.
 */
export function Confetti({ fireKey, active, colors = DEFAULT_COLORS }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const piecesRef = useRef<Piece[]>([])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = window.innerWidth
    const H = window.innerHeight
    const pieces: Piece[] = []

    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    const pick = () => colors[Math.floor(Math.random() * colors.length)]

    // Central "fireworks" bursts — a few staggered pops for the paf-paf-paf feel.
    const burst = (cx: number, cy: number, count: number) => {
      for (let i = 0; i < count; i += 1) {
        const angle = rand(0, Math.PI * 2)
        const speed = rand(4, 11)
        pieces.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          size: rand(6, 12),
          rot: rand(0, Math.PI),
          vrot: rand(-0.3, 0.3),
          color: pick(),
          shape: Math.random() < 0.5 ? 0 : 1,
          life: 1,
        })
      }
    }

    burst(W * 0.5, H * 0.42, 90)
    window.setTimeout(() => burst(W * 0.32, H * 0.36, 60), 160)
    window.setTimeout(() => burst(W * 0.68, H * 0.36, 60), 320)

    // Gentle rain from the top for a lingering celebratory backdrop.
    for (let i = 0; i < 120; i += 1) {
      pieces.push({
        x: rand(0, W),
        y: rand(-H * 0.5, 0),
        vx: rand(-1.5, 1.5),
        vy: rand(2, 5),
        size: rand(5, 10),
        rot: rand(0, Math.PI),
        vrot: rand(-0.2, 0.2),
        color: pick(),
        shape: Math.random() < 0.5 ? 0 : 1,
        life: 1,
      })
    }

    piecesRef.current = pieces

    const tick = () => {
      ctx.clearRect(0, 0, W, H)
      const list = piecesRef.current
      for (const p of list) {
        p.vx *= DRAG
        p.vy = p.vy * DRAG + GRAVITY
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vrot
        if (p.y > H * 0.62) p.life -= 0.012

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      // Drop dead / off-screen pieces.
      piecesRef.current = list.filter((p) => p.life > 0 && p.y < H + 40)

      if (piecesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, W, H)
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      piecesRef.current = []
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }
    // Re-run for every new burst.
  }, [fireKey, active, colors])

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />
}
