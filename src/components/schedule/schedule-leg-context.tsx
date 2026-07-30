import { createContext, useContext, type ReactNode } from 'react'
import { getRouteApi } from '@tanstack/react-router'

const legRoute = getRouteApi('/_site/$leagueSlug/$seasonSlug/$legSlug')

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

/** Prefer the section’s leg slug when schedule shows multiple legs. */
export function useScheduleLegSlug(): string {
  const sectionLegSlug = useContext(ScheduleLegSlugContext)
  const { legSlug } = legRoute.useParams()
  return sectionLegSlug ?? legSlug
}
