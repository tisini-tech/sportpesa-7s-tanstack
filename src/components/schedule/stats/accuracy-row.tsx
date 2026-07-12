import { cn } from '#/lib/utils'

type AccuracyProps = {
  hComp: number
  aComp: number
  hTotal: number
  aTotal: number
  stat: string
  homeOnly: boolean
  awayOnly: boolean
  bothTeams: boolean
}

function valueClass(isHigher: boolean): string {
  return isHigher
    ? 'font-bold text-foreground'
    : 'font-normal text-foreground/70'
}

const AccuracyRow = ({
  hComp,
  aComp,
  hTotal,
  aTotal,
  stat,
  homeOnly,
  awayOnly,
  bothTeams,
}: AccuracyProps) => {
  const homePercentage = hTotal === 0 ? 0 : (hComp / hTotal) * 100
  const awayPercentage = aTotal === 0 ? 0 : (aComp / aTotal) * 100
  const homeHigher = homePercentage > awayPercentage
  const awayHigher = awayPercentage > homePercentage

  return (
    <div className="px-4 py-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <p
            className={cn(
              'min-w-[3.5rem] text-sm tabular-nums',
              valueClass(homeHigher),
            )}
          >
            {bothTeams || homeOnly ? `${hComp}/${hTotal}` : '-'}
          </p>
          <CircularPercentageIndicator
            percentage={homePercentage}
            team="home"
          />
        </div>

        <p className="text-center text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {stat}
        </p>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <CircularPercentageIndicator
            percentage={awayPercentage}
            team="away"
          />
          <p
            className={cn(
              'min-w-[3.5rem] text-right text-sm tabular-nums',
              valueClass(awayHigher),
            )}
          >
            {bothTeams || awayOnly ? `${aComp}/${aTotal}` : '-'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AccuracyRow

type CircularProps = {
  percentage: number
  team: 'home' | 'away'
  size?: number
}

export const CircularPercentageIndicator = ({
  percentage,
  team,
  size = 56,
}: CircularProps) => {
  const strokeWidth = 4
  const radius = size / 2 - strokeWidth - 1
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const strokeColor = team === 'home' ? 'var(--primary)' : 'var(--secondary)'
  const label = percentage === 0 ? '-' : `${percentage.toFixed(0)}%`

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-[10px] flex items-center justify-center">
        <span className="text-[0.7rem] font-bold leading-none tracking-tight text-foreground tabular-nums">
          {label}
        </span>
      </div>
    </div>
  )
}
