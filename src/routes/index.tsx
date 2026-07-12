import { Button } from '#/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>

      <Button variant="secondary">Click me</Button>

      <Button variant="ghost">Click me</Button>
      <Button variant="link">Click me</Button>
      <Button variant="destructive">Click me</Button>
    </div>
  )
}
