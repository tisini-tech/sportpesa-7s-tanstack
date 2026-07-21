import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getRouteApi, Link, useRouterState } from '@tanstack/react-router'

import {
  buildFeaturedTournamentPath,
  getTournamentBaseFromPathname,
} from '#/lib/tournament-slugs'
import { cn } from '#/lib/utils'
import { SiteLogo } from './logo'

const rootRoute = getRouteApi('__root__')

type NavItem = {
  segment: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { segment: 'schedule', label: 'Schedule' },
  { segment: 'standings', label: 'Standings' },
  { segment: 'clubs', label: 'Clubs' },
  { segment: 'stats', label: 'Stats' },
  { segment: 'voting', label: 'Voting' },
  { segment: 'quiz', label: 'Quiz' },
  { segment: 'videos', label: 'Videos' },
  { segment: 'gallery', label: 'Gallery' },
]

type HeaderNavLinkProps = {
  to: string
  label: string
  onNavigate?: () => void
  className?: string
}

function HeaderNavLink({
  to,
  label,
  onNavigate,
  className,
}: HeaderNavLinkProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isActive =
    pathname === to || (to !== '/' && pathname.startsWith(`${to}/`))

  return (
    <Link
      to={to as never}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative px-2 py-2 text-xs font-semibold tracking-[0.14em] uppercase transition-colors',
        isActive
          ? 'text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-secondary'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {label}
    </Link>
  )
}

function useTournamentNavBase(): string {
  const { seasons } = rootRoute.useRouteContext()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    getTournamentBaseFromPathname(pathname) ??
    buildFeaturedTournamentPath(seasons) ??
    '/'
  )
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const tournamentBase = useTournamentNavBase()

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const closeMobileMenu = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50 overflow-visible border-b-2 bg-card">
      <div className="sp-shell-wide">
        <div className="flex items-center justify-between gap-4 py-2 lg:py-2.5">
          <SiteLogo variant="header" onNavigate={closeMobileMenu} />

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 lg:flex xl:gap-2"
          >
            {NAV_ITEMS.map((item) => (
              <HeaderNavLink
                key={item.segment}
                to={`${tournamentBase}/${item.segment}`}
                label={item.label}
              />
            ))}
          </nav>

          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-accent lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {mobileOpen ? (
          <nav
            id="mobile-navigation"
            aria-label="Main navigation"
            className="border-t border-border pb-4 lg:hidden"
          >
            <ul className="divide-y divide-border">
              {NAV_ITEMS.map((item) => (
                <li key={item.segment}>
                  <HeaderNavLink
                    to={`${tournamentBase}/${item.segment}`}
                    label={item.label}
                    onNavigate={closeMobileMenu}
                    className="block w-full px-1 py-3 after:inset-x-1"
                  />
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  )
}
