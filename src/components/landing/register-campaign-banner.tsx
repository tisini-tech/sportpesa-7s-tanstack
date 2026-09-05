import { ArrowRightIcon } from 'lucide-react'
import { getRouteApi } from '@tanstack/react-router'

import { aviatorRegisterBanner } from '#/assets'
import { buttonVariants } from '#/components/ui/button'
import { trackEvent } from '#/lib/analytics'
import { cn } from '#/lib/utils'

const siteRoute = getRouteApi('/_site')

const AVIATOR_JOIN_URL =
  'https://www.ke.sportpesa.com/join?utm_source=tisini&utm_medium=tisini&utm_campaign=register'

function trackAviatorClick(placement: string) {
  trackEvent('aviator_register_click', {
    link_url: AVIATOR_JOIN_URL,
    placement,
  })
}

type RegisterCampaignBannerProps = {
  /** GA placement label — defaults to homepage hero. */
  placement?: string
}

/** Guest-only Aviator register promo → SportPesa join. */
export function RegisterCampaignBanner({
  placement = 'homepage_hero',
}: RegisterCampaignBannerProps) {
  const { user } = siteRoute.useRouteContext()
  if (user) return null

  return (
    <section className="sp-content-shell py-4 sm:py-5">
      <a
        href={AVIATOR_JOIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackAviatorClick(placement)}
        className="group relative block overflow-hidden rounded-2xl border border-border bg-[#4b0a6e] shadow-sm outline-none transition-opacity hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Register on SportPesa for free bundles"
      >
        <img
          src={aviatorRegisterBanner}
          alt="Register now for free bundles on SportPesa"
          width={3840}
          height={640}
          className="h-auto w-full min-h-[8.5rem] object-cover object-center sm:min-h-0"
        />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-black/20 to-transparent px-4 pb-3 pt-10 sm:justify-end sm:px-6 sm:pb-4">
          <span
            className={cn(
              buttonVariants({ size: 'lg' }),
              'sp-register-cta h-10 rounded-xl px-5 text-sm font-bold tracking-[0.08em] uppercase shadow-md',
            )}
          >
            Register
            <ArrowRightIcon data-icon="inline-end" />
          </span>
        </div>
      </a>
    </section>
  )
}
