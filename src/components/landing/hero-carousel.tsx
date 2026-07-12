import { useCallback, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  HelpCircleIcon,
  StarIcon,
  type LucideIcon,
} from 'lucide-react'

import { venueHero } from '#/assets'
import { cn } from '#/lib/utils'

const AUTO_PLAY_MS = 5500

type SlideId = 'matches' | 'vote' | 'quiz'

type HeroSlide = {
  id: SlideId
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  cta: string
  to: '/matches' | '/voting' | '/quiz'
  footnote?: string
  imageSrc: string
  overlayClass: string
}

const HERO_OVERLAY =
  'bg-gradient-to-br from-background/85 via-secondary/20 to-primary/25'

const SLIDES: HeroSlide[] = [
  {
    id: 'matches',
    icon: CalendarDaysIcon,
    imageSrc: venueHero,
    overlayClass: HERO_OVERLAY,
    eyebrow: 'Follow every try',
    title: 'Live scores & fixtures',
    description: 'Standings and matchdays for every leg on the tour.',
    cta: 'View matches',
    to: '/matches',
  },
  {
    id: 'vote',
    icon: StarIcon,
    imageSrc: venueHero,
    overlayClass: HERO_OVERLAY,
    eyebrow: 'Vote for your stars',
    title: 'Player of the Tournament',
    description:
      'Pick your favourites and back the players lighting up each leg.',
    cta: 'Cast your vote',
    to: '/voting',
    footnote: '4,218 fan votes this leg',
  },
  {
    id: 'quiz',
    icon: HelpCircleIcon,
    imageSrc: venueHero,
    overlayClass: HERO_OVERLAY,
    eyebrow: 'Matchday quiz',
    title: '10 questions, real prizes',
    description: 'Test your 7s knowledge and climb the leaderboard.',
    cta: 'Start quiz',
    to: '/quiz',
    footnote: '~2 min · win merch',
  },
]

export function EngagementCarousel({
  schedulePath,
}: {
  schedulePath: string | null
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length)
  }, [])

  const next = useCallback(() => {
    goTo(activeIndex + 1)
  }, [activeIndex, goTo])

  useEffect(() => {
    if (isPaused) return

    const timer = window.setInterval(next, AUTO_PLAY_MS)
    return () => window.clearInterval(timer)
  }, [isPaused, next])

  return (
    <div
      className="flex h-full min-h-[30rem] w-full flex-col sm:min-h-[32rem] lg:min-h-[35rem]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsPaused(false)
        }
      }}
    >
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border shadow-lg"
        role="region"
        aria-roledescription="carousel"
        aria-label="Fan engagement highlights"
      >
        <div className="relative min-h-0 flex-1">
          {SLIDES.map((slide, index) => {
            const isActive = index === activeIndex
            const Icon = slide.icon

            return (
              <article
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${SLIDES.length}`}
                aria-hidden={!isActive}
                className={cn(
                  'absolute inset-0 overflow-hidden',
                  'transition-all duration-500',
                  isActive
                    ? 'pointer-events-auto translate-x-0 opacity-100'
                    : 'pointer-events-none translate-x-3 opacity-0',
                )}
              >
                <img
                  src={slide.imageSrc}
                  alt=""
                  width={1600}
                  height={1200}
                  className="absolute inset-0 h-full w-full object-cover opacity-50"
                />
                <div className={cn('absolute inset-0', slide.overlayClass)} />

                <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border backdrop-blur-sm">
                    <Icon className="size-6 text-secondary" aria-hidden />
                  </div>

                  <div className="flex flex-1 flex-col justify-center gap-2 py-6">
                    <p className="text-[11px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
                      {slide.eyebrow}
                    </p>
                    <p className="text-xl font-bold leading-snug text-foreground md:text-2xl">
                      {slide.title}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {slide.description}
                    </p>
                    {slide.footnote ? (
                      <p className="text-xs font-semibold text-secondary">
                        {slide.footnote}
                      </p>
                    ) : null}
                  </div>

                  <Link
                    to={
                      (slide.id === 'matches' && schedulePath
                        ? schedulePath
                        : slide.to) as never
                    }
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary/20 px-4 py-3 text-sm font-bold tracking-wide text-secondary uppercase ring-1 ring-secondary/40 backdrop-blur-sm transition-colors hover:bg-secondary/30"
                  >
                    {slide.cta}
                    <ArrowRightIcon
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        <div className="relative z-10 flex shrink-0 items-center justify-center gap-2 border-t border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${index + 1}: ${slide.eyebrow}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => goTo(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                index === activeIndex
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
