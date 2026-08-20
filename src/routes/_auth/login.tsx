import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'

import { LoginForm } from '#/components/auth/login'

export const Route = createFileRoute('/_auth/login')({
  head: () => ({
    title: 'SportPesa 7s | Login',
    meta: [
      {
        name: 'description',
        content: 'Sign in with your phone or email to continue.',
      },
    ],
  }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const router = useRouter()

  return (
    <LoginForm
      idPrefix="login-page"
      onSuccess={() => {
        void router.invalidate().then(() => {
          void navigate({ to: '/' })
        })
      }}
    />
  )
}
