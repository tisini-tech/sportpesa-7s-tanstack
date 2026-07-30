import { createFileRoute, Outlet } from '@tanstack/react-router'

import { loadScheduleSeasonContext } from './load-context'

export const Route = createFileRoute('/_site/$leagueSlug/$seasonSlug/schedule')({
  // Resolve season on this layout so child loaders never race on undefined context.
  beforeLoad: async ({ params }) => loadScheduleSeasonContext(params),
  component: ScheduleSeasonLayout,
})

function ScheduleSeasonLayout() {
  return <Outlet />
}
