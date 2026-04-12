import { motion } from 'framer-motion'

export default function HeroArt() {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewBox="0 0 720 520"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gCard" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.03)" />
        </linearGradient>
        <linearGradient id="gLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#16A34A" stopOpacity="0.0" />
          <stop offset="0.35" stopColor="#16A34A" stopOpacity="0.42" />
          <stop offset="1" stopColor="#16A34A" stopOpacity="0.0" />
        </linearGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* subtle background structure (10–20% opacity max) */}
      <g opacity="0.11">
        <circle cx="590" cy="120" r="120" fill="rgba(22,163,74,0.12)" filter="url(#soft)" />
        <circle cx="180" cy="420" r="140" fill="rgba(255,255,255,0.10)" filter="url(#soft)" />
      </g>

      <g transform="translate(110 118)">
        <motion.rect
          x="0"
          y="0"
          width="500"
          height="300"
          rx="22"
          fill="url(#gCard)"
          stroke="rgba(255,255,255,0.10)"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* header */}
        <g opacity="0.85">
          <rect x="24" y="22" width="180" height="12" rx="6" fill="rgba(229,231,235,0.30)" />
          <rect x="24" y="44" width="130" height="10" rx="5" fill="rgba(156,163,175,0.22)" />
          <rect x="24" y="72" width="452" height="1" fill="rgba(255,255,255,0.10)" />
        </g>

        {/* chart grid */}
        <g transform="translate(24 96)" opacity="0.55">
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="0"
              x2="452"
              y1={i * 46}
              y2={i * 46}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="1"
            />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`v${i}`}
              y1="0"
              y2="184"
              x1={i * 113}
              x2={i * 113}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* trend line */}
        <motion.path
          d="M136 300 C 220 250, 270 270, 330 230 S 440 170, 540 195"
          fill="none"
          stroke="url(#gLine)"
          strokeWidth="5"
          strokeLinecap="round"
          animate={{ pathLength: [0.92, 1, 0.92] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ translateX: -70, translateY: -92 }}
        />

        {/* security / trust mark */}
        <g transform="translate(392 26)">
          <path
            d="M38 6c10 8 22 10 34 12v22c0 25-16 45-34 55C20 85 4 65 4 40V18c12-2 24-4 34-12z"
            fill="rgba(22,163,74,0.12)"
            stroke="rgba(22,163,74,0.35)"
            strokeWidth="1.5"
          />
          <path
            d="M24 44l10 10 20-24"
            fill="none"
            stroke="rgba(229,231,235,0.85)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </motion.svg>
  )
}

