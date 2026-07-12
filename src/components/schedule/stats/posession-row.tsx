import { cn } from '#/lib/utils'

type PosessionProps = {
  homeStat: string
  stat: string
  awayStat: string
}

function valueClass(isHigher: boolean): string {
  return isHigher
    ? 'font-bold text-foreground'
    : 'font-normal text-foreground/70'
}

const PosessionRow = ({ homeStat, stat, awayStat }: PosessionProps) => {
  const homeValue = parseInt(homeStat)
  const awayValue = parseInt(awayStat)
  const total = homeValue + awayValue
  const homePercentage = total === 0 ? 0 : (homeValue / total) * 100
  const awayPercentage = total === 0 ? 0 : (awayValue / total) * 100
  const homeHigher = homeValue > awayValue
  const awayHigher = awayValue > homeValue

  return (
    <div className="px-4 py-4">
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className={cn('text-lg tabular-nums', valueClass(homeHigher))}>
          {`${homeStat}%`}
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
          {`${awayStat}%`}
        </p>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-muted/50">
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-all"
          style={{ width: `${homePercentage}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-secondary transition-all"
          style={{ width: `${awayPercentage}%` }}
        />
      </div>
    </div>
  )
}

export default PosessionRow
