import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function Analytics() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const search = useRouterState({ select: (s) => s.location.searchStr })
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID

  useEffect(() => {
    if (!gaId || typeof window.gtag !== 'function') return

    window.gtag('event', 'page_view', {
      page_path: `${pathname}${search}`,
      page_title: document.title,
    })
  }, [gaId, pathname, search])

  return null
}
