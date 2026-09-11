export type PitchOrientation = 'portrait' | 'landscape'

/** Portrait: attack toward top. Landscape: attack toward left (rotated CW). */
export const RUGBY_SLOT_LAYOUT: Record<
  PitchOrientation,
  Record<number, { top: string; left: string }>
> = {
  portrait: {
    1: { top: '18%', left: '24%' },
    2: { top: '28%', left: '50%' },
    3: { top: '18%', left: '76%' },
    4: { top: '46%', left: '50%' },
    5: { top: '60%', left: '30%' },
    6: { top: '64%', left: '58%' },
    7: { top: '78%', left: '76%' },
  },
  landscape: {
    1: { top: '76%', left: '18%' },
    2: { top: '50%', left: '28%' },
    3: { top: '24%', left: '18%' },
    4: { top: '50%', left: '46%' },
    5: { top: '70%', left: '60%' },
    6: { top: '42%', left: '64%' },
    7: { top: '24%', left: '80%' },
  },
}

export function RugbyPitchMarkings({
  orientation,
  idPrefix = 'pitch',
}: {
  orientation: PitchOrientation
  idPrefix?: string
}) {
  const landscape = orientation === 'landscape'
  const vb = landscape ? '0 0 140 100' : '0 0 100 140'
  const w = landscape ? 140 : 100
  const h = landscape ? 100 : 140
  const stripesId = `${idPrefix}-stripes-${orientation}`
  const grassId = `${idPrefix}-grass-${orientation}`

  return (
    <svg
      viewBox={vb}
      className="pointer-events-none absolute inset-0 size-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <pattern
          id={stripesId}
          width={landscape ? '14' : '100'}
          height={landscape ? '100' : '14'}
          patternUnits="userSpaceOnUse"
        >
          {landscape ? (
            <rect width="7" height="100" fill="rgba(255,255,255,0.035)" />
          ) : (
            <rect width="100" height="7" fill="rgba(255,255,255,0.035)" />
          )}
        </pattern>
        <linearGradient
          id={grassId}
          x1="0"
          y1="0"
          x2={landscape ? '1' : '0'}
          y2={landscape ? '0' : '1'}
        >
          <stop offset="0%" stopColor="#1f6b3a" />
          <stop offset="50%" stopColor="#16552d" />
          <stop offset="100%" stopColor="#0e3f20" />
        </linearGradient>
      </defs>

      <rect width={w} height={h} fill={`url(#${grassId})`} />
      <rect width={w} height={h} fill={`url(#${stripesId})`} />

      {landscape ? (
        <>
          <rect
            x="6"
            y="6"
            width="128"
            height="88"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="0.7"
          />
          <line
            x1="16"
            y1="6"
            x2="16"
            y2="94"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="0.55"
          />
          <line
            x1="124"
            y1="6"
            x2="124"
            y2="94"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="0.55"
          />
          <line
            x1="34"
            y1="6"
            x2="34"
            y2="94"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="0.45"
          />
          <line
            x1="106"
            y1="6"
            x2="106"
            y2="94"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="0.45"
          />
          <line
            x1="58"
            y1="6"
            x2="58"
            y2="94"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.2"
          />
          <line
            x1="82"
            y1="6"
            x2="82"
            y2="94"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.2"
          />
          <line
            x1="70"
            y1="6"
            x2="70"
            y2="94"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="0.65"
          />
          <circle
            cx="70"
            cy="50"
            r="5.5"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.45"
          />
          <circle cx="70" cy="50" r="0.7" fill="rgba(255,255,255,0.55)" />
          <path
            d="M6 42 H2 M6 58 H2 M2 42 V58"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <path
            d="M134 42 H138 M134 58 H138 M138 42 V58"
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="0.7"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <rect
            x="6"
            y="6"
            width="88"
            height="128"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="0.7"
          />
          <line
            x1="6"
            y1="16"
            x2="94"
            y2="16"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="0.55"
          />
          <line
            x1="6"
            y1="124"
            x2="94"
            y2="124"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="0.55"
          />
          <line
            x1="6"
            y1="34"
            x2="94"
            y2="34"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="0.45"
          />
          <line
            x1="6"
            y1="106"
            x2="94"
            y2="106"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="0.45"
          />
          <line
            x1="6"
            y1="58"
            x2="94"
            y2="58"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.2"
          />
          <line
            x1="6"
            y1="82"
            x2="94"
            y2="82"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.2"
          />
          <line
            x1="6"
            y1="70"
            x2="94"
            y2="70"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="0.65"
          />
          <circle
            cx="50"
            cy="70"
            r="5.5"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.45"
          />
          <circle cx="50" cy="70" r="0.7" fill="rgba(255,255,255,0.55)" />
          <path
            d="M42 6 V2 M58 6 V2 M42 2 H58"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <path
            d="M42 134 V138 M58 134 V138 M42 138 H58"
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="0.7"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}
