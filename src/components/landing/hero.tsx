import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, MapPinIcon } from 'lucide-react'

import { venueHero } from '#/assets'
import { EngagementCarousel } from '#/components/landing/hero-carousel'
import {
  formatDivisionHeroDate,
  formatDivisionStatusLabel,
  getDivisionStatus,
  pickFeaturedDivision,
  type DivisionStatus,
} from '#/components/landing/division-utils'
import { cn } from '#/lib/utils'
import { getLegSlug, getSeasonSlug } from '#/lib/tournament-slugs'
import type { Division, Season } from '#/lib/types'

type HeroSectionProps = {
  divisions: Division[]
  season: Season
  seasonName: string
  activeDivisionId?: number | null
}

function resolveHeroDivision(
  divisions: Division[],
  activeDivisionId?: number | null,
) {
  if (activeDivisionId != null) {
    const division = divisions.find((item) => item.id === activeDivisionId)
    if (division) {
      return {
        division,
        status: getDivisionStatus(division),
      }
    }
  }

  return pickFeaturedDivision(divisions)
}

function statusBadgeClass(status: DivisionStatus): string {
  if (status === 'live') {
    return 'bg-secondary/15 text-secondary ring-secondary/30'
  }
  if (status === 'completed') {
    return 'bg-muted text-muted-foreground ring-border'
  }
  return 'bg-primary/15 text-primary ring-primary/30'
}

function statusHeadline(status: DivisionStatus): string {
  if (status === 'live') return 'Leg in progress'
  if (status === 'completed') return 'Leg completed'
  return 'Next leg'
}

function HeroDateBlock({ division }: { division: Division }) {
  const formattedDate = formatDivisionHeroDate(division)

  if (formattedDate === 'Dates TBC') {
    return (
      <p className="mt-6 text-3xl font-black tracking-tight text-foreground md:text-4xl">
        Dates TBC
      </p>
    )
  }

  const [startDay, endPart] = formattedDate
    .split(' – ')
    .map((part) => part.trim())

  const isRange = endPart !== undefined
  const monthLabel = isRange
    ? endPart.split(' ').slice(1).join(' ') ||
      startDay.split(' ').slice(1).join(' ')
    : startDay.split(' ').slice(1).join(' ')

  return (
    <div className="mt-6 flex flex-wrap items-end gap-3">
      <span className="text-7xl font-black leading-none text-foreground md:text-8xl">
        {startDay.split(' ')[0]}
      </span>
      {isRange ? (
        <span className="pb-2 text-3xl font-bold text-muted-foreground md:text-4xl">
          – {endPart.split(' ')[0]}
        </span>
      ) : null}
      <span className="mb-3 ml-2 rounded-full bg-muted px-3 py-1 text-xs font-bold tracking-wider text-foreground uppercase">
        {monthLabel}
      </span>
    </div>
  )
}

function HeroLegFeature({
  division,
  status,
  season,
  seasonName,
}: {
  division: Division
  status: DivisionStatus
  season: Season
  seasonName: string
}) {
  const legNumber =
    season.divisions.findIndex((item) => item.id === division.id) + 1

  return (
    <article className="relative min-h-[30rem] overflow-hidden rounded-2xl border border-border bg-card/50 shadow-lg sm:min-h-[32rem] lg:min-h-[35rem]">
      <img
        src={venueHero}
        alt=""
        width={1600}
        height={1200}
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-primary/20 to-primary/5" />

      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 top-2 select-none text-[8rem] font-black leading-none tracking-tight text-secondary/[0.08] sm:text-[12rem] lg:text-[16rem]"
      >
        {seasonName}
      </span>

      <div className="relative z-10 flex h-full min-h-[30rem] flex-col justify-between p-8 md:min-h-[32rem] md:p-12 lg:min-h-[35rem]">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            {statusHeadline(status)} · {legNumber}
          </p>
          <HeroDateBlock division={division} />
        </div>

        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground uppercase md:text-5xl">
            {division.name}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0 text-primary" aria-hidden />
            Leg {division.order} · {division.county}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-bold tracking-wider uppercase ring-1',
                statusBadgeClass(status),
                status === 'live' && 'animate-pulse',
              )}
            >
              {formatDivisionStatusLabel(status)}
            </span>

            {(status === 'live' || status === 'upcoming') && (
              <Link
                to="/$seasonSlug/$legSlug/schedule"
                params={{
                  seasonSlug: getSeasonSlug(season),
                  legSlug: getLegSlug(division),
                }}
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                View fixtures
                <ArrowRightIcon
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function HeroLegFallback() {
  return (
    <article className="relative flex min-h-[30rem] flex-col justify-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-lg md:p-12 lg:min-h-[35rem]">
      <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
        Tournament hub
      </p>
      <p className="text-3xl font-black tracking-tight text-foreground uppercase sm:text-4xl">
        Season underway
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Follow every try, cast your vote, and test your 7s knowledge.
      </p>
    </article>
  )
}

export function HeroSection({
  divisions,
  season,
  seasonName,
  activeDivisionId,
}: HeroSectionProps) {
  const featured = resolveHeroDivision(divisions, activeDivisionId)

  return (
    <section className="sp-landing-hero overflow-hidden border-b border-border text-foreground">
      <div className="sp-shell-wide relative py-6 sm:py-8">
        <div className="grid items-stretch gap-5 lg:min-h-[35rem] lg:grid-cols-[1.65fr_1fr]">
          {featured ? (
            <HeroLegFeature
              division={featured.division}
              status={featured.status}
              season={season}
              seasonName={seasonName}
            />
          ) : (
            <HeroLegFallback />
          )}

          <EngagementCarousel division={featured?.division ?? null} />
        </div>
      </div>
    </section>
  )
}
