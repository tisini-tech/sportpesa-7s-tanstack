import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/$seasonSlug/$legSlug/quiz/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 mt-10">
      <h1>Quiz: Comming Soon!</h1>
      <p className="text-center text-lg">
        We are working hard to bring you the best quiz experience possible.
        Please check back soon.
      </p>
      <Link to="/" className="text-blue-500">
        Go back to the home page
      </Link>
    </div>
  )
}
