import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  HelpCircleIcon,
  PlayIcon,
  StarIcon,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { venueHero } from '#/assets'
import { getSeasonsFn } from '#/data/seasons'
import {
  LEAGUES,
  materializeSeasons,
  resolveLeagueBySlug,
  type LeagueDefinition,
} from '#/lib/leagues'
import { getSeasonSlug, resolveSeasonBySlug } from '#/lib/tournament-slugs'
import { cn } from '#/lib/utils'

const AUTO_PLAY_MS = 5500

const TAB_LABELS: Record<string, string> = {
  'national-7s-circuit-men-div1': 'Men Div 1',
  'national-7s-circuit-men-div2': 'Men Div 2',
  'national-7s-circuit-women': 'Women',
  'safari-7s-men': 'Men',
  'safari-7s-women': 'Women',
}

type Slide = {
  id: string
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  cta: string
  href:
    | { to: '/$leagueSlug/$seasonSlug/schedule' }
    | { to: '/$leagueSlug/$seasonSlug/videos' }
    | { to: '/voting' }
    | { to: '/quiz' }
}

function tabLabel(league: LeagueDefinition): string {
  return TAB_LABELS[league.slug] ?? league.title
}

export default function NewHero() {
  const { leagueSlug = '', seasonSlug = '' } = useParams({ strict: false })
  const { leg } = useSearch({ strict: false })
  const legSlug = typeof leg === 'string' ? leg : undefined
  const navigate = useNavigate()
  const league = resolveLeagueBySlug(leagueSlug)
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [switchingSlug, setSwitchingSlug] = useState<string | null>(null)

  const seasonsQuery = useQuery({
    queryKey: ['league-seasons', league?.id],
    enabled: Boolean(league),
    queryFn: () =>
      getSeasonsFn({
        data: { id: String(league!.id) },
      }),
  })

  const season = league
    ? resolveSeasonBySlug(
        materializeSeasons(seasonsQuery.data ?? [], league),
        seasonSlug,
      )
    : undefined

  const slides: Slide[] = [
    {
      id: 'fixtures',
      icon: CalendarDaysIcon,
      eyebrow: 'Fixtures',
      title: 'Every match, one place',
      description: 'Scores, kickoffs, and the road to the final.',
      cta: 'View fixtures',
      href: { to: '/$leagueSlug/$seasonSlug/schedule' },
    },
    {
      id: 'watch',
      icon: PlayIcon,
      eyebrow: 'Watch',
      title: 'Live from the pitch',
      description: 'Matchday streams and highlights from across 7s.',
      cta: 'Watch',
      href: { to: '/$leagueSlug/$seasonSlug/videos' },
    },
    {
      id: 'vote',
      icon: StarIcon,
      eyebrow: 'Vote',
      title: 'Player of the Tournament',
      description: 'Back the players lighting up the weekend.',
      cta: 'Cast your vote',
      href: { to: '/voting' },
    },
    {
      id: 'quiz',
      icon: HelpCircleIcon,
      eyebrow: 'Quiz',
      title: '10 questions, real prizes',
      description: 'Test your 7s knowledge and climb the leaderboard.',
      cta: 'Start quiz',
      href: { to: '/quiz' },
    },
  ]

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, AUTO_PLAY_MS)
    return () => window.clearInterval(timer)
  }, [paused, slides.length])

  const selectLeague = async (next: LeagueDefinition) => {
    if (next.slug === leagueSlug || switchingSlug) return
    setSwitchingSlug(next.slug)
    try {
      let nextSeasonSlug = seasonSlug
      try {
        const nextSeasons = materializeSeasons(
          await getSeasonsFn({ data: { id: String(next.id) } }),
          next,
        )
        const nextSeason = nextSeasons[0]
        if (nextSeason) nextSeasonSlug = getSeasonSlug(nextSeason)
      } catch {
        // Some competitions are not on this API key yet. Keep the year in the URL.
      }
      await navigate({
        to: '/$leagueSlug/$seasonSlug',
        params: {
          leagueSlug: next.slug,
          seasonSlug: nextSeasonSlug,
        },
        search: {},
      })
    } finally {
      setSwitchingSlug(null)
    }
  }

  const circuit = LEAGUES.filter((item) => item.series === 'circuit')
  const safari = LEAGUES.filter((item) => item.series === 'safari')

  return (
    <section className="border-b border-border">
      <div className="sp-shell-wide space-y-4 py-4 sm:py-6">
        <div
          className="relative min-h-[28rem] overflow-hidden rounded-2xl border border-border shadow-lg sm:min-h-[34rem] lg:min-h-[38rem]"
          role="region"
          aria-roledescription="carousel"
          aria-label="Rugby 7s"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setPaused(false)
            }
          }}
        >
          {slides.map((slide, index) => {
            const isActive = index === activeIndex
            const Icon = slide.icon
            return (
              <article
                key={slide.id}
                aria-hidden={!isActive}
                inert={!isActive}
                className={cn(
                  'absolute inset-0 transition-opacity duration-500',
                  isActive
                    ? 'pointer-events-auto opacity-100'
                    : 'pointer-events-none opacity-0',
                )}
              >
                <img
                  src={venueHero}
                  alt=""
                  className="absolute inset-0 size-full object-cover opacity-45"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-primary/20" />
                <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-12">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted ring-1 ring-border sm:size-14">
                    <Icon className="size-6 text-secondary sm:size-7" aria-hidden />
                  </div>
                  <p className="mt-6 text-xs font-bold tracking-[0.16em] text-secondary uppercase">
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-2 max-w-3xl font-heading text-4xl font-black tracking-tight text-foreground uppercase sm:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mt-3 max-w-lg text-base text-foreground/80 sm:text-lg">
                    {slide.description}
                  </p>
                  <SlideLink
                    slide={slide}
                    leagueSlug={leagueSlug}
                    seasonSlug={seasonSlug}
                    legSlug={legSlug}
                  />
                </div>
              </article>
            )
          })}

          <div className="absolute right-4 bottom-4 z-20 flex gap-1.5 sm:right-8 sm:bottom-8">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show ${slide.eyebrow}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => goTo(index)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  index === activeIndex
                    ? 'w-6 bg-primary'
                    : 'w-1.5 bg-foreground/35 hover:bg-foreground/55',
                )}
              />
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
            <LeagueGroup
              label="National 7s Circuit"
              leagues={circuit}
              activeSlug={leagueSlug}
              pendingSlug={switchingSlug}
              onSelect={selectLeague}
            />
            <div className="hidden h-5 w-px bg-border sm:block" aria-hidden />
            <LeagueGroup
              label="Safari 7s"
              leagues={safari}
              activeSlug={leagueSlug}
              pendingSlug={switchingSlug}
              onSelect={selectLeague}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function SlideLink({
  slide,
  leagueSlug,
  seasonSlug,
  legSlug,
}: {
  slide: Slide
  leagueSlug: string
  seasonSlug: string
  legSlug?: string
}) {
  const className =
    'mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-secondary/20 px-4 py-2.5 text-sm font-bold tracking-wide text-secondary uppercase ring-1 ring-secondary/40 transition-colors hover:bg-secondary/30'

  if (slide.href.to === '/voting' || slide.href.to === '/quiz') {
    return (
      <Link to={slide.href.to} className={className}>
        {slide.cta}
        <ArrowRightIcon className="size-4" aria-hidden />
      </Link>
    )
  }

  if (slide.href.to === '/$leagueSlug/$seasonSlug/schedule') {
    return (
      <Link
        to="/$leagueSlug/$seasonSlug/schedule"
        params={{ leagueSlug, seasonSlug }}
        search={{ leg: legSlug }}
        className={className}
      >
        {slide.cta}
        <ArrowRightIcon className="size-4" aria-hidden />
      </Link>
    )
  }

  return (
    <Link
      to="/$leagueSlug/$seasonSlug/videos"
      params={{ leagueSlug, seasonSlug }}
      className={className}
    >
      {slide.cta}
      <ArrowRightIcon className="size-4" aria-hidden />
    </Link>
  )
}

function LeagueGroup({
  label,
  leagues,
  activeSlug,
  pendingSlug,
  onSelect,
}: {
  label: string
  leagues: LeagueDefinition[]
  activeSlug: string
  pendingSlug: string | null
  onSelect: (league: LeagueDefinition) => void
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <p className="shrink-0 text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={label}>
        {leagues.map((item) => {
          const selected = item.slug === activeSlug
          return (
            <button
              key={item.slug}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={pendingSlug != null}
              onClick={() => onSelect(item)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors',
                selected
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground ring-1 ring-border hover:text-foreground',
              )}
            >
              {tabLabel(item)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
