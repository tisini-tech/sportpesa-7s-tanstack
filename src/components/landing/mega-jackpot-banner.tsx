import { ArrowRightIcon } from 'lucide-react'

import { megaJackpotBanner } from '#/assets'
import { buttonVariants } from '#/components/ui/button'
import { trackEvent } from '#/lib/analytics'
import { cn } from '#/lib/utils'

const SPORTPESA_URL = 'https://ke.sportpesa.com'

function trackMegaJackpotClick() {
  trackEvent('mega_jackpot_click', {
    link_url: SPORTPESA_URL,
    placement: 'site_footer_banner',
  })
}

/** Mega Jackpot promo — sits above the site footer. */
export function MegaJackpotBanner() {
  return (
    <section className="sp-content-shell py-6 sm:py-8">
      <a
        href={SPORTPESA_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackMegaJackpotClick}
        className="group relative block overflow-hidden rounded-2xl border border-border bg-[#0a1630] shadow-sm outline-none transition-opacity hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Play SportPesa Mega Jackpot on ke.sportpesa.com"
      >
        <img
          src={megaJackpotBanner}
          alt="SportPesa Mega Jackpot — win over KSh 132,000,000. Play from 99 bob. 18+. T&Cs apply."
          width={1200}
          height={628}
          className="h-auto w-full object-cover object-center"
        />

        <div className="absolute bottom-[2.5%] left-1/2 -translate-x-1/2 sm:bottom-[3.5%]">
          <span
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'lg' }),
              'sp-jackpot-cta h-9 rounded-xl px-4 text-xs font-bold tracking-[0.08em] uppercase sm:h-10 sm:px-5 sm:text-sm',
            )}
          >
            Play now
            <ArrowRightIcon data-icon="inline-end" />
          </span>
        </div>
      </a>
    </section>
  )
}
