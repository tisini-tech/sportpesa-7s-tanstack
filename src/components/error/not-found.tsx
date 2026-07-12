import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, HomeIcon } from 'lucide-react'
import type { NotFoundRouteProps } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type NotFoundProps = NotFoundRouteProps & {
  className?: string
}

function OutOfBoundsIllustration() {
  return (
    <svg
      viewBox="0 0 220 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full max-w-[16rem]"
      aria-hidden
    >
      <line
        x1="72"
        y1="104"
        x2="72"
        y2="28"
        className="stroke-border"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="108"
        y1="104"
        x2="108"
        y2="28"
        className="stroke-border"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="72"
        y1="40"
        x2="108"
        y2="40"
        className="stroke-secondary"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M118 72c18-8 34-8 52 2"
        className="stroke-primary/35"
        strokeWidth="2"
        strokeDasharray="5 6"
        strokeLinecap="round"
      />
      <g className="sp-error-out-of-bounds">
        <ellipse cx="168" cy="58" rx="22" ry="14" className="fill-[#6b4423]" />
        <path
          d="M150 58c0-6 8-10 18-10s18 4 18 10-8 10-18 10-18-4-18-10Z"
          className="stroke-white/85"
          strokeWidth="1.75"
        />
        <path
          d="M168 46v24M156 52c4 2 16 2 24 0M156 64c4-2 16-2 24 0"
          className="stroke-secondary"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

export function NotFound({ className }: NotFoundProps) {
  return (
    <section
      className={cn(
        'sp-error-page sp-content-shell flex min-h-[60vh] flex-col items-center justify-center py-16 text-center',
        className,
      )}
    >
      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        <OutOfBoundsIllustration />

        <div className="space-y-3">
          <p className="text-xs font-bold tracking-[0.28em] text-primary uppercase">
            Out of bounds
          </p>
          <h1 className="font-heading text-6xl font-black tracking-tight text-foreground sm:text-7xl">
            <span className="text-secondary">4</span>0
            <span className="text-secondary">4</span>
          </h1>
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            This page has been knocked into touch. Head back to the circuit hub
            and pick up play from there.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            render={
              <Link to="/">
                <HomeIcon data-icon="inline-start" />
                Back to home
              </Link>
            }
            nativeButton={false}
          />
          <Button
            variant="outline"
            render={
              <Link to={'/matches' as never}>
                <ArrowLeftIcon data-icon="inline-start" />
                View schedule
              </Link>
            }
            nativeButton={false}
          />
        </div>
      </div>
    </section>
  )
}
