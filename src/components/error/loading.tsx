import { cn } from '#/lib/utils'

type LoadingProps = {
  label?: string
  className?: string
}

function RugbyBallIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse
        cx="60"
        cy="40"
        rx="54"
        ry="34"
        className="fill-[#6b4423]"
      />
      <ellipse
        cx="60"
        cy="40"
        rx="54"
        ry="34"
        className="fill-[url(#rugby-ball-shine)]"
      />
      <path
        d="M14 40c0-14 20.6-26 46-26s46 12 46 26-20.6 26-46 26-46-12-46-26Z"
        className="stroke-white/90"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M60 14v52"
        className="stroke-white/75"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M34 24c10 6 42 6 52 0M34 56c10-6 42-6 52 0"
        className="stroke-secondary"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <defs>
        <radialGradient
          id="rugby-ball-shine"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(24 60 40) scale(58 36)"
        >
          <stop offset="0%" stopColor="white" stopOpacity="0.22" />
          <stop offset="55%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.18" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export function Loading({ label = 'Loading', className }: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'sp-loading flex min-h-[50vh] w-full flex-col items-center justify-center gap-6 px-6 py-16',
        className,
      )}
    >
      <div className="relative flex h-28 w-48 items-end justify-center">
        <div className="sp-loading-pitch absolute bottom-2 h-px w-40 bg-border" />
        <div className="sp-loading-shadow absolute bottom-1 h-3 w-16 rounded-[100%] bg-black/30 blur-sm" />
        <div className="sp-loading-ball relative">
          <RugbyBallIcon className="h-16 w-24 drop-shadow-lg" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-heading text-sm font-bold tracking-[0.28em] text-foreground uppercase">
          {label}
        </p>
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="sp-loading-dot size-1.5 rounded-full bg-secondary" />
          <span className="sp-loading-dot size-1.5 rounded-full bg-secondary" />
          <span className="sp-loading-dot size-1.5 rounded-full bg-secondary" />
        </div>
      </div>
    </div>
  )
}
