declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

type TrackEventParams = Record<string, string | number | boolean | undefined>

/** Fire a GA4 event when measurement ID + gtag are available. */
export function trackEvent(eventName: string, params?: TrackEventParams) {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID
  if (!gaId || typeof window.gtag !== 'function') return

  window.gtag('event', eventName, params)
}
