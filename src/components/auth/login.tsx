import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Loader2Icon, MailIcon, SmartphoneIcon } from 'lucide-react'

import { InputField } from '#/components/forms/input-field'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '#/components/ui/field'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { cn } from '#/lib/utils'
import { loginFn } from '#/data/auth'
import type { LoginSchema } from '#/lib/schemas'

type LoginMethod = 'phone' | 'email'

type LoginModalProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
  onSuccess?: () => void
}

export function LoginModal({
  open,
  onOpenChange,
  showTrigger = true,
  onSuccess,
}: LoginModalProps) {
  const [method, setMethod] = useState<LoginMethod>('phone')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      phone: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      const identifier =
        method === 'phone' ? value.phone.trim() : value.email.trim()

      if (!identifier) {
        setSubmitError(
          method === 'phone'
            ? 'Enter your phone number to continue.'
            : 'Enter your email to continue.',
        )
        return
      }

      if (!value.password) {
        setSubmitError('Enter your password to continue.')
        return
      }

      try {
        await loginFn({
          data: { identifier, password: value.password } as LoginSchema,
        })
        onSuccess?.()
      } catch (error) {
        if (error instanceof Error) {
          setSubmitError(error.message)
        } else {
          setSubmitError('An unknown error occurred')
        }
      }
    },
  })

  const switchMethod = (next: LoginMethod) => {
    setMethod(next)
    setSubmitError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger ? (
        <DialogTrigger
          render={<Button variant="secondary" className="min-w-28" />}
        >
          Login
        </DialogTrigger>
      ) : null}

      <DialogContent className="gap-7 p-7 sm:max-w-md sm:p-8">
        <DialogHeader className="gap-2.5 space-y-0 text-center sm:text-center">
          <DialogTitle className="font-heading text-xl font-black tracking-tight uppercase">
            Welcome back
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Sign in with your phone or email to continue.
          </DialogDescription>
        </DialogHeader>

        <div
          className="grid grid-cols-2 gap-0.5 rounded-xl border border-border bg-muted/30 p-0.5"
          role="tablist"
          aria-label="Login method"
        >
          <button
            type="button"
            role="tab"
            aria-selected={method === 'phone'}
            onClick={() => switchMethod('phone')}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-[0.65rem] font-bold tracking-[0.1em] uppercase transition-colors',
              method === 'phone'
                ? 'bg-secondary/15 text-secondary shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <SmartphoneIcon className="size-3.5" aria-hidden />
            Phone
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={method === 'email'}
            onClick={() => switchMethod('email')}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-[0.65rem] font-bold tracking-[0.1em] uppercase transition-colors',
              method === 'email'
                ? 'bg-secondary/15 text-secondary shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <MailIcon className="size-3.5" aria-hidden />
            Email
          </button>
        </div>

        <form
          noValidate
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <FieldGroup className="gap-5">
            {method === 'phone' ? (
              <form.Field
                name="phone"
                children={(field) => (
                  <InputField
                    field={field}
                    id="login-phone"
                    label="Phone number"
                    type="tel"
                    placeholder="0712 345 678"
                    autoComplete="tel"
                    className="gap-2"
                    inputClassName="h-11 rounded-xl px-3"
                  />
                )}
              />
            ) : (
              <form.Field
                name="email"
                children={(field) => (
                  <InputField
                    field={field}
                    id="login-email"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="gap-2"
                    inputClassName="h-11 rounded-xl px-3"
                  />
                )}
              />
            )}

            <form.Field
              name="password"
              children={(field) => (
                <InputField
                  field={field}
                  id="login-password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  className="gap-2"
                  inputClassName="h-11 rounded-xl px-3"
                  labelEnd={
                    <a
                      href="#"
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </a>
                  }
                />
              )}
            />

            {submitError ? (
              <Field>
                <FieldError errors={[{ message: submitError }]} />
              </Field>
            ) : null}

            <Field className="mt-1 gap-4">
              <form.Subscribe
                selector={(state) => state.isSubmitting}
                children={(isSubmitting) => (
                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    size="lg"
                    className="h-11 w-full rounded-xl text-sm font-bold tracking-[0.08em] uppercase"
                  >
                    {isSubmitting ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      'Login'
                    )}
                  </Button>
                )}
              />
              <FieldDescription className="text-center text-xs leading-relaxed">
                Don&apos;t have an account?{' '}
                <a
                  href="#"
                  className="font-semibold text-secondary underline-offset-4 hover:underline"
                >
                  Sign up
                </a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
