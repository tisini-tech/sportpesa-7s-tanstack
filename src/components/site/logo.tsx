import { Link } from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import { sportpesaLogo } from '#/assets'

type SiteLogoProps = {
  onNavigate?: () => void
  variant?: 'header' | 'default'
  className?: string
  sportpesaClassName?: string
}

export function SiteLogo({
  onNavigate,
  variant = 'default',
  className,
  sportpesaClassName,
}: SiteLogoProps) {
  const isHeader = variant === 'header'

  return (
    <div className={cn('flex shrink-0 items-stretch', className)}>
      <Link
        to="/"
        onClick={onNavigate}
        className={cn(
          'flex items-center transition-opacity hover:opacity-95',
          isHeader ? 'py-0.5' : '',
        )}
        aria-label="SportPesa National 7s Circuit — Home"
      >
        <img
          src={sportpesaLogo}
          alt="SportPesa National 7s Circuit"
          width={120}
          height={160}
          className={cn(
            isHeader
              ? 'h-12 w-auto object-contain sm:h-14 md:h-16 lg:h-[4.25rem]'
              : 'h-11 w-auto object-contain sm:h-[5.85rem] md:h-[6.35rem] lg:h-[6.65rem]',
            sportpesaClassName,
          )}
        />
      </Link>
    </div>
  )
}
