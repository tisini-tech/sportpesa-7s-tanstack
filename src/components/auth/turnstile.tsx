import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { cn } from '#/lib/utils'

export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as
  | string
  | undefined

const SCRIPT_ID = 'cf-turnstile-script'
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      theme?: 'light' | 'dark' | 'auto'
      size?: 'normal' | 'compact' | 'flexible'
      callback?: (token: string) => void
      'error-callback'?: () => void
      'expired-callback'?: () => void
    },
  ) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

function loadTurnstileScript(): Promise<TurnstileApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Turnstile requires a browser'))
  }

  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => {
        if (window.turnstile) resolve(window.turnstile)
        else reject(new Error('Turnstile failed to load'))
      })
      existing.addEventListener('error', () =>
        reject(new Error('Turnstile failed to load')),
      )
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile)
      else reject(new Error('Turnstile failed to load'))
    }
    script.onerror = () => reject(new Error('Turnstile failed to load'))
    document.head.appendChild(script)
  })
}

export type TurnstileHandle = {
  reset: () => void
}

type TurnstileWidgetProps = {
  onTokenChange: (token: string | null) => void
  className?: string
}

export const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onTokenChange, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)
    const onTokenChangeRef = useRef(onTokenChange)
    const [loadError, setLoadError] = useState<string | null>(null)

    onTokenChangeRef.current = onTokenChange

    useImperativeHandle(ref, () => ({
      reset: () => {
        onTokenChangeRef.current(null)
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current)
        }
      },
    }))

    useEffect(() => {
      const sitekey = TURNSTILE_SITE_KEY
      if (!sitekey) {
        setLoadError('Turnstile is not configured')
        return
      }

      const container = containerRef.current
      if (!container) return

      let cancelled = false

      void loadTurnstileScript()
        .then((turnstile) => {
          if (cancelled || !containerRef.current) return

          widgetIdRef.current = turnstile.render(containerRef.current, {
            sitekey,
            theme: 'dark',
            size: 'flexible',
            callback: (token) => onTokenChangeRef.current(token),
            'expired-callback': () => onTokenChangeRef.current(null),
            'error-callback': () => onTokenChangeRef.current(null),
          })
        })
        .catch(() => {
          if (!cancelled) {
            setLoadError('Could not load verification. Refresh and try again.')
          }
        })

      return () => {
        cancelled = true
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }
      }
    }, [])

    if (loadError) {
      return (
        <p className={cn('text-sm text-destructive', className)} role="alert">
          {loadError}
        </p>
      )
    }

    return <div ref={containerRef} className={cn('min-h-[65px] w-full', className)} />
  },
)
