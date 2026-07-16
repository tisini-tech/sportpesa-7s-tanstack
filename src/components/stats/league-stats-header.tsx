import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import type { Division, Season } from '#/lib/types'

export function LeagueStatsHeader({
  seasons,
  season,
  division,
  onSeasonChange,
  onDivisionChange,
}: {
  seasons: Season[]
  season: Season
  division: Division
  onSeasonChange: (seasonId: number) => void
  onDivisionChange: (divisionId: number) => void
}) {
  const sortedDivisions = [...season.divisions].sort((a, b) => a.order - b.order)
  const seasonItems = seasons.map((item) => ({
    value: item.id.toString(),
    label: item.name,
  }))
  const divisionItems = sortedDivisions.map((leg) => ({
    value: leg.id.toString(),
    label: leg.name,
  }))

  return (
    <section className="border-b border-border bg-card">
      <div className="sp-content-shell border-b border-border/60 bg-muted/15 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="min-w-0">
            <h1 className="text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              League Stats
            </h1>
            <p className="mt-1 text-sm text-foreground/90">
              Leaders across team and player metrics.
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:min-w-[18rem]">
            <Select
              value={season.id.toString()}
              items={seasonItems}
              onValueChange={(value) => {
                if (value) onSeasonChange(Number(value))
              }}
            >
              <SelectTrigger className="w-full border-border bg-background">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={division.id.toString()}
              items={divisionItems}
              onValueChange={(value) => {
                if (value) onDivisionChange(Number(value))
              }}
            >
              <SelectTrigger className="w-full border-border bg-background">
                <SelectValue placeholder="Leg" />
              </SelectTrigger>
              <SelectContent>
                {sortedDivisions.map((leg) => (
                  <SelectItem key={leg.id} value={leg.id.toString()}>
                    {leg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  )
}
