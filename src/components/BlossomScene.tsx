/**
 * A soft, vector "spirit garden" backdrop: two stylised cherry-blossom trees
 * arching in from the sides, gentle hills and a spirit halo. Kept deliberately
 * sparse in the centre so the torii + reel stay readable — and drawn as SVG so
 * it's crisp on a projector, tiny in weight, and copyright-free.
 */
export function BlossomScene() {
  return (
    <div className="scene" aria-hidden="true">
      <svg
        className="scene__svg"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <radialGradient id="scene-halo" cx="50%" cy="42%" r="55%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#eafdff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#eafdff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="scene-hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe6f3" stopOpacity="0.9" />
            <stop offset="1" stopColor="#dff6ff" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id="canopy-pink" cx="45%" cy="40%" r="60%">
            <stop offset="0" stopColor="#ffd7ea" />
            <stop offset="55%" stopColor="#ff86c2" />
            <stop offset="100%" stopColor="#f14fa4" />
          </radialGradient>
          <radialGradient id="canopy-soft" cx="50%" cy="45%" r="60%">
            <stop offset="0" stopColor="#fff0f7" />
            <stop offset="100%" stopColor="#ffa9d5" />
          </radialGradient>
          <filter id="canopy-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="soft-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* central spirit halo */}
        <ellipse cx="800" cy="380" rx="620" ry="440" fill="url(#scene-halo)" />

        {/* distant rolling hills */}
        <path
          d="M0 760 C 340 690, 560 720, 820 748 C 1120 780, 1320 700, 1600 742 L 1600 900 L 0 900 Z"
          fill="url(#scene-hill)"
          filter="url(#soft-blur)"
          opacity="0.85"
        />

        {/* ---- left cherry tree ---- */}
        <g className="scene__tree scene__tree--left">
          <path
            d="M20 900
               C 70 760, 60 640, 120 540
               C 165 462, 235 420, 300 392
               M 150 500 C 210 470, 250 450, 300 430
               M 190 430 C 150 410, 120 400, 85 402"
            fill="none"
            stroke="#4a2b52"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          {/* canopy clusters */}
          <g filter="url(#canopy-blur)">
            <circle cx="170" cy="330" r="140" fill="url(#canopy-pink)" opacity="0.95" />
            <circle cx="330" cy="320" r="110" fill="url(#canopy-soft)" opacity="0.9" />
            <circle cx="70" cy="420" r="110" fill="url(#canopy-pink)" opacity="0.82" />
            <circle cx="300" cy="450" r="80" fill="url(#canopy-soft)" opacity="0.78" />
          </g>
        </g>

        {/* ---- right cherry tree ---- */}
        <g className="scene__tree scene__tree--right">
          <path
            d="M1580 900
               C 1530 760, 1540 640, 1480 540
               C 1435 462, 1365 420, 1300 392
               M 1450 500 C 1390 470, 1350 450, 1300 430
               M 1410 430 C 1450 410, 1480 400, 1515 402"
            fill="none"
            stroke="#4a2b52"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <g filter="url(#canopy-blur)">
            <circle cx="1430" cy="330" r="150" fill="url(#canopy-pink)" opacity="0.95" />
            <circle cx="1270" cy="320" r="110" fill="url(#canopy-soft)" opacity="0.9" />
            <circle cx="1530" cy="420" r="110" fill="url(#canopy-pink)" opacity="0.82" />
            <circle cx="1300" cy="450" r="80" fill="url(#canopy-soft)" opacity="0.78" />
          </g>
        </g>
      </svg>
    </div>
  )
}
