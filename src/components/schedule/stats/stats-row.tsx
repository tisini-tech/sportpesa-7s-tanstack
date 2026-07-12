import { cn } from '#/lib/utils'

type StatsRowProps = {
  homeStat: number
  stat: string
  awayStat: number
  homeOnly: boolean
  awayOnly: boolean
  bothTeams: boolean
}

function valueClass(isHigher: boolean): string {
  return isHigher
    ? 'font-bold text-foreground'
    : 'font-normal text-foreground/70'
}

const StatsRow = ({
  homeStat,
  stat,
  awayStat,
  homeOnly,
  awayOnly,
  bothTeams,
}: StatsRowProps) => {
  const total = homeStat + awayStat
  const homePercentage = total === 0 ? 0 : (homeStat / total) * 100
  const awayPercentage = total === 0 ? 0 : (awayStat / total) * 100
  const homeHigher = homeStat > awayStat
  const awayHigher = awayStat > homeStat

  return (
    <div className="px-4 py-4">
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className={cn('text-lg tabular-nums', valueClass(homeHigher))}>
          {bothTeams || homeOnly ? homeStat : '-'}
        </p>
        <p className="text-center text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {stat}
        </p>
        <p
          className={cn(
            'text-right text-lg tabular-nums',
            valueClass(awayHigher),
          )}
        >
          {bothTeams || awayOnly ? awayStat : '-'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="relative h-2 overflow-hidden rounded-full bg-muted/50">
          <div
            className="absolute inset-y-0 right-0 rounded-full bg-primary transition-all"
            style={{ width: `${homePercentage}%` }}
          />
        </div>

        <div className="relative h-2 overflow-hidden rounded-full bg-muted/50">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-secondary transition-all"
            style={{ width: `${awayPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default StatsRow
