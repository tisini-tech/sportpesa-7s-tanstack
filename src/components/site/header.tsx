import { LogOutIcon, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  getRouteApi,
  Link,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'

import {
  buildFeaturedTournamentPath,
  getSeasonBaseFromPathname,
  getSeasonBaseFromTournamentBase,
  getTournamentBaseFromPathname,
} from '#/lib/tournament-slugs'
import { clearSessionFn } from '#/data/auth'
import { DEFAULT_LEAGUE } from '#/lib/leagues'
import type { SessionUser } from '#/lib/session'
import { cn } from '#/lib/utils'
import { SiteLogo } from './logo'

const siteRoute = getRouteApi('/_site')

type NavItem =
  | { kind: 'tournament'; segment: string; label: string }
  | { kind: 'season'; segment: string; label: string }
  | { kind: 'absolute'; to: string; label: string }

const NAV_ITEMS: NavItem[] = [
  { kind: 'season', segment: 'schedule', label: 'Schedule' },
  { kind: 'tournament', segment: 'standings', label: 'Standings' },
  { kind: 'tournament', segment: 'clubs', label: 'Clubs' },
  { kind: 'tournament', segment: 'stats', label: 'Stats' },
  { kind: 'absolute', to: '/voting', label: 'Voting' },
  { kind: 'absolute', to: '/quiz', label: 'Quiz' },
  { kind: 'tournament', segment: 'videos', label: 'Videos' },
  { kind: 'absolute', to: '/gallery', label: 'Gallery' },
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
  const context = siteRoute.useRouteContext()
  const defaultSeasons = context.defaultSeasons ?? []
  const defaultLeague = context.defaultLeague ?? DEFAULT_LEAGUE
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    getTournamentBaseFromPathname(pathname) ??
    buildFeaturedTournamentPath(defaultSeasons, defaultLeague.slug) ??
    '/'
  )
}

function resolveNavTo(
  item: NavItem,
  tournamentBase: string,
  pathname: string,
): string {
  if (item.kind === 'absolute') return item.to

  if (item.kind === 'season') {
    const seasonBase =
      getSeasonBaseFromPathname(pathname) ??
      getSeasonBaseFromTournamentBase(tournamentBase)
    return seasonBase ? `${seasonBase}/${item.segment}` : `/${item.segment}`
  }

  return `${tournamentBase}/${item.segment}`
}

function userInitials(user: SessionUser): string {
  const parts = user.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
}

function AuthGuestLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Link
        to="/login"
        onClick={onNavigate}
        className="rounded-md border border-border bg-transparent px-4 py-2 text-center text-sm font-semibold text-foreground transition-colors hover:bg-accent"
      >
        Login
      </Link>
      <Link
        to="/register"
        onClick={onNavigate}
        className="rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Register
      </Link>
    </div>
  )
}

function AuthUserMenu({
  user,
  onNavigate,
}: {
  user: SessionUser
  onNavigate?: () => void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await clearSessionFn()
      setOpen(false)
      onNavigate?.()
      await router.invalidate()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.name}`}
        onClick={() => setOpen((value) => !value)}
        className="flex size-10 items-center justify-center rounded-full border border-border bg-primary/15 text-xs font-bold tracking-wide text-primary transition-colors hover:bg-primary/25"
      >
        {userInitials(user)}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email || user.phone}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            disabled={loggingOut}
            onClick={() => {
              void handleLogout()
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
          >
            <LogOutIcon className="size-4 shrink-0 text-muted-foreground" />
            {loggingOut ? 'Signing out…' : 'Log out'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function HeaderAuth({
  user,
  onNavigate,
  className,
}: {
  user: SessionUser | null | undefined
  onNavigate?: () => void
  className?: string
}) {
  if (user) {
    return (
      <div className={className}>
        <AuthUserMenu user={user} onNavigate={onNavigate} />
      </div>
    )
  }

  return <AuthGuestLinks onNavigate={onNavigate} className={className} />
}

export function SiteHeader() {
  const { user } = siteRoute.useRouteContext()
  const [mobileOpen, setMobileOpen] = useState(false)
  const tournamentBase = useTournamentNavBase()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

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
          <SiteLogo
            to={tournamentBase}
            variant="header"
            onNavigate={closeMobileMenu}
          />

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 lg:flex xl:gap-2"
          >
            {NAV_ITEMS.map((item) => (
              <HeaderNavLink
                key={item.label}
                to={resolveNavTo(item, tournamentBase, pathname)}
                label={item.label}
              />
            ))}

            <HeaderAuth user={user} className="ml-2" />
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            {user ? (
              <AuthUserMenu user={user} onNavigate={closeMobileMenu} />
            ) : null}
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-accent"
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
        </div>

        {mobileOpen ? (
          <nav
            id="mobile-navigation"
            aria-label="Main navigation"
            className="border-t border-border pb-4 lg:hidden"
          >
            <ul className="divide-y divide-border">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <HeaderNavLink
                    to={resolveNavTo(item, tournamentBase, pathname)}
                    label={item.label}
                    onNavigate={closeMobileMenu}
                    className="block w-full px-1 py-3 after:inset-x-1"
                  />
                </li>
              ))}
            </ul>

            {!user ? (
              <div className="mt-4 border-t border-border pt-4">
                <AuthGuestLinks
                  onNavigate={closeMobileMenu}
                  className="grid w-full grid-cols-2 gap-2"
                />
              </div>
            ) : null}
          </nav>
        ) : null}
      </div>
    </header>
  )
}
