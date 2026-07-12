import type { ErrorComponentProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { HomeIcon, RefreshCwIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type ErrorProps = ErrorComponentProps & {
  className?: string
}

function ScrumResetIllustration() {
  return (
    <svg
      viewBox="0 0 220 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full max-w-[16rem]"
      aria-hidden
    >
      <ellipse
        cx="110"
        cy="78"
        rx="72"
        ry="10"
        className="fill-black/20"
      />
      <g className="sp-error-scrum-wobble">
        <ellipse
          cx="110"
          cy="58"
          rx="34"
          ry="22"
          className="fill-[#6b4423]"
        />
        <ellipse
          cx="110"
          cy="58"
          rx="34"
          ry="22"
          className="fill-[url(#error-ball-shine)]"
        />
        <path
          d="M80 58c0-9 13.4-17 30-17s30 8 30 17-13.4 17-30 17-30-8-30-17Z"
          className="stroke-white/85"
          strokeWidth="2"
        />
        <path
          d="M110 39v38M94 47c6 4 26 4 32 0M94 69c6-4 26-4 32 0"
          className="stroke-secondary"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </g>
      <circle
        cx="154"
        cy="34"
        r="16"
        className="fill-destructive/15 stroke-destructive/50"
        strokeWidth="2"
      />
      <path
        d="M154 26v16M146 34h16"
        className="stroke-destructive"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <defs>
        <radialGradient
          id="error-ball-shine"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(18 110 58) scale(36 22)"
        >
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="black" stopOpacity="0.16" />
        </radialGradient>
      </defs>
    </svg>
  )
}

function getErrorMessage(error: unknown): string | null {
  if (typeof error === 'string' && error.length > 0) {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message
    return typeof message === 'string' && message.length > 0 ? message : null
  }

  return null
}

export function Error({ error, reset, className }: ErrorProps) {
  const message = getErrorMessage(error as unknown)

  return (
    <section
      className={cn(
        'sp-error-page sp-content-shell flex min-h-[60vh] flex-col items-center justify-center py-16 text-center',
        className,
      )}
    >
      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        <ScrumResetIllustration />

        <div className="space-y-3">
          <p className="text-xs font-bold tracking-[0.28em] text-destructive uppercase">
            Scrum reset
          </p>
          <h1 className="font-heading text-3xl font-black tracking-tight text-foreground uppercase sm:text-4xl">
            Something went wrong
          </h1>
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            We hit a stoppage in play and could not load this page. Run it again
            or return to the home leg.
          </p>
          {message ? (
            <p className="mx-auto max-w-md rounded-xl border border-border bg-muted/40 px-4 py-3 text-left text-xs leading-relaxed text-muted-foreground">
              {message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>
            <RefreshCwIcon data-icon="inline-start" />
            Try again
          </Button>
          <Button
            variant="outline"
            render={
              <Link to="/">
                <HomeIcon data-icon="inline-start" />
                Back to home
              </Link>
            }
            nativeButton={false}
          />
        </div>
      </div>
    </section>
  )
}
