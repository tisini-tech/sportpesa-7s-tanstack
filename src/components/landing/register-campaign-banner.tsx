import { Link, getRouteApi } from '@tanstack/react-router'
import { ArrowRightIcon } from 'lucide-react'

import { aviatorRegisterBanner } from '#/assets'
import { Button } from '#/components/ui/button'

const siteRoute = getRouteApi('/_site')

/** Guest-only Aviator register promo. */
export function RegisterCampaignBanner() {
  const { user } = siteRoute.useRouteContext()
  if (user) return null

  return (
    <section className="sp-content-shell py-6 sm:py-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[#4b0a6e] shadow-sm">
        <img
          src={aviatorRegisterBanner}
          alt="Register now for free bundles"
          width={3840}
          height={640}
          className="h-auto w-full min-h-[8.5rem] object-cover object-center sm:min-h-0"
        />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-black/20 to-transparent px-4 pb-3 pt-10 sm:justify-end sm:px-6 sm:pb-4">
          <Button
            size="lg"
            className="h-10 rounded-xl px-5 text-sm font-bold tracking-[0.08em] uppercase shadow-md"
            render={
              <Link to="/register">
                Register
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            }
            nativeButton={false}
          />
        </div>
      </div>
    </section>
  )
}
