interface ToriiProps {
  className?: string
}

/**
 * A stylised vermilion torii gate, drawn as vector art so it stays crisp on a
 * projector and carries no copyright. Used as a frame around the reel: the two
 * pillars sit on the sides and the curved kasagi crowns the top.
 */
export function Torii({ className }: ToriiProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 1000 620"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="torii-lacquer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ec3350" />
          <stop offset="0.5" stopColor="#c81e33" />
          <stop offset="1" stopColor="#97121f" />
        </linearGradient>
        <linearGradient id="torii-pillar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#97121f" />
          <stop offset="0.35" stopColor="#ec3350" />
          <stop offset="0.65" stopColor="#d42338" />
          <stop offset="1" stopColor="#8f1019" />
        </linearGradient>
        <filter id="torii-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#ff5fb0" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter="url(#torii-glow)">
        {/* Kasagi — top curved beam with upswept ends */}
        <path
          d="M40 96
             C 180 40, 820 40, 960 96
             L 960 150
             C 820 100, 180 100, 40 150
             Z"
          fill="url(#torii-lacquer)"
        />
        {/* Shimaki accent line under the kasagi */}
        <path
          d="M70 158 C 210 116, 790 116, 930 158 L 930 178 C 790 138, 210 138, 70 178 Z"
          fill="#7d0f19"
          opacity="0.7"
        />

        {/* Nuki — second horizontal beam */}
        <rect x="96" y="236" width="808" height="52" rx="6" fill="url(#torii-lacquer)" />
        {/* Gakuzuka — small central post between the two beams */}
        <rect x="472" y="182" width="56" height="60" rx="4" fill="url(#torii-lacquer)" />

        {/* Pillars — slightly tapered, standing on the sides */}
        <path d="M150 288 L 214 288 L 236 620 L 128 620 Z" fill="url(#torii-pillar)" />
        <path d="M786 288 L 850 288 L 872 620 L 764 620 Z" fill="url(#torii-pillar)" />

        {/* Highlight strokes for a lacquered sheen */}
        <path
          d="M40 96 C 180 40, 820 40, 960 96"
          fill="none"
          stroke="#ffb6c8"
          strokeWidth="3"
          opacity="0.55"
        />
      </g>
    </svg>
  )
}
