import { useEffect, useState } from 'react'

import { aviatrixxBanner, aviatorRegisterBanner, xupBanner } from '#/assets'
import { trackEvent } from '#/lib/analytics'
import { cn } from '#/lib/utils'

export type AdsBannerItem = {
  href: string
  src: string
  alt: string
  /** Accessible name for the link. Defaults to `alt`. */
  label?: string
  /** Fallback fill behind wide art (match banner edge color). */
  className?: string
  /** Optional GA campaign key appended to placement. */
  id?: string
}

export type AdsBannerProps = {
  banners: AdsBannerItem[]
  /** GA placement prefix, e.g. `voting_top`, `quiz_top`. */
  placement: string
  /** GA event name. Defaults to `promo_banner_click`. */
  eventName?: string
  /** Auto-rotate interval in ms. Defaults to 6000. Set 0 to disable. */
  intervalMs?: number
}

export const XUP_BANNER_URL =
  'https://www.ke.sportpesa.com/en/sports-betting/football-1/popular-games/?utm_source=tisini&utm_medium=tisini&utm_campaign=xup'

export const AVIATRIXX_BANNER_URL =
  'https://www.ke.sportpesa.com/casino/category/popular?utm_source=tisini&utm_medium=tisini&utm_campaign=aviatrixx'

export const AVIATOR_REGISTER_BANNER_URL =
  'https://www.ke.sportpesa.com/join?utm_source=tisini&utm_medium=tisini&utm_campaign=register'

export const SPORTPESA_PROMO_BANNERS: AdsBannerItem[] = [
  {
    id: 'aviatrixx',
    href: AVIATRIXX_BANNER_URL,
    src: aviatrixxBanner,
    alt: 'SportPesa Aviatrix — KSh 100,000,000 up for grabs.',
    className: 'bg-[#88005b]',
  },
  {
    id: 'xup',
    href: XUP_BANNER_URL,
    src: xupBanner,
    alt: 'SportPesa XUP — get paid early when your team goes 1UP, 2UP or 3UP. Play now.',
    className: 'bg-[#0a1a6b]',
  },
  {
    id: 'aviator',
    href: AVIATOR_REGISTER_BANNER_URL,
    src: aviatorRegisterBanner,
    alt: 'SportPesa Aviator — Register now to win KSh 100,000,000.',
    className: 'bg-[#000000]',
  },
]

export function AdsBanner({
  banners,
  placement,
  eventName = 'promo_banner_click',
  intervalMs = 6000,
}: AdsBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = banners.length

  useEffect(() => {
    if (count <= 1 || intervalMs <= 0 || paused) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % count)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [count, intervalMs, paused])

  if (count === 0) return null

  const active = banners[activeIndex] ?? banners[0]

  return (
    <section className="sp-content-shell py-3 sm:py-3.5">
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setPaused(false)
          }
        }}
      >
        <div
          className="relative h-28 overflow-hidden rounded-2xl border border-border shadow-sm sm:h-32 lg:h-36"
          role={count > 1 ? 'region' : undefined}
          aria-roledescription={count > 1 ? 'carousel' : undefined}
          aria-label={count > 1 ? 'SportPesa promotions' : undefined}
        >
          {banners.map((banner, index) => {
            const isActive = index === activeIndex
            const slidePlacement = banner.id
              ? `${placement}_${banner.id}`
              : placement

            return (
              <a
                key={`${banner.href}-${index}`}
                href={banner.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent(eventName, {
                    link_url: banner.href,
                    placement: slidePlacement,
                  })
                }
                aria-label={banner.label ?? banner.alt}
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}
                className={cn(
                  'absolute inset-0 block overflow-hidden outline-none transition-opacity duration-500 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  banner.className,
                  isActive
                    ? 'pointer-events-auto opacity-100'
                    : 'pointer-events-none opacity-0',
                )}
              >
                <img
                  src={banner.src}
                  alt={banner.alt}
                  width={1920}
                  height={320}
                  className="size-full object-cover object-center"
                />
              </a>
            )
          })}
        </div>

        {count > 1 ? (
          <div
            className="mt-2 flex items-center justify-center gap-1.5"
            role="tablist"
            aria-label="Banner slides"
          >
            {banners.map((banner, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={`${banner.href}-dot-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Show banner ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    isActive
                      ? 'w-5 bg-primary'
                      : 'w-1.5 bg-muted-foreground/35 hover:bg-muted-foreground/55',
                  )}
                />
              )
            })}
          </div>
        ) : null}
      </div>

      <span className="sr-only" aria-live="polite">
        {active.alt}
      </span>
    </section>
  )
}
