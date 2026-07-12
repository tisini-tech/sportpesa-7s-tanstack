import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import { SiteLogo } from './logo'

type NavItem = {
  to: string
  label: string
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/matches', label: 'Schedule' },
  { to: '/standings', label: 'Standings' },
  { to: '/teams', label: 'Clubs' },
  { to: '/stats', label: 'Stats' },
  { to: '/voting', label: 'Voting' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/gallery', label: 'Gallery' },
]

type HeaderNavLinkProps = {
  item: NavItem
  onNavigate?: () => void
  className?: string
}

function HeaderNavLink({ item, onNavigate, className }: HeaderNavLinkProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isActive = item.exact
    ? pathname === item.to
    : pathname === item.to || pathname.startsWith(`${item.to}/`)

  return (
    <Link
      to={item.to as never}
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
      {item.label}
    </Link>
  )
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

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
              <HeaderNavLink key={item.to} item={item} />
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
                <li key={item.to}>
                  <HeaderNavLink
                    item={item}
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
