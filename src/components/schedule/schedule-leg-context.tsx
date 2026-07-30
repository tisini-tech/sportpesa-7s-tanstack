import { createContext, useContext, type ReactNode } from 'react'

const ScheduleLegSlugContext = createContext<string | null>(null)

export function ScheduleLegProvider({
  legSlug,
  children,
}: {
  legSlug: string
  children: ReactNode
}) {
  return (
    <ScheduleLegSlugContext.Provider value={legSlug}>
      {children}
    </ScheduleLegSlugContext.Provider>
  )
}

/** Leg slug for the current schedule section (required under stacked legs). */
export function useScheduleLegSlug(): string | null {
  return useContext(ScheduleLegSlugContext)
}
