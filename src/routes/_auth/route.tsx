import { createFileRoute, Outlet } from '@tanstack/react-router'

import { getCountriesFn } from '#/data/quiz'
import { SiteLogo } from '#/components/site/logo'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const countries = await getCountriesFn()
    return { countries }
  },
  component: AuthLayout,
})

function AuthLayout() {
  const year = new Date().getFullYear()

  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <div
        className="pointer-events-none absolute inset-0 sp-landing-hero opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--secondary)_12%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex w-full max-w-xl flex-col items-center gap-8">
          <SiteLogo sportpesaClassName="h-16 sm:h-20" />

          <div className="w-full rounded-2xl border border-border bg-card/95 p-6 shadow-lg backdrop-blur-sm sm:p-8">
            <Outlet />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            © {year} SportPesa National 7s Circuit. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  )
}
