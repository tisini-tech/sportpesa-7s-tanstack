import { useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Loader2Icon, MailIcon, SmartphoneIcon } from 'lucide-react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { requestPasswordSchema } from '#/lib/schemas'
import type { LoginMethod } from '#/components/auth/login'
import { InputField } from '#/components/forms/input-field'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '#/components/ui/field'
import { requestOtpFn } from '#/data/auth'

export const Route = createFileRoute('/_auth/request-password')({
  component: RequestPasswordPage,
})

function RequestPasswordPage() {
  const [method, setMethod] = useState<LoginMethod>('email')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()

  const methodRef = useRef(method)
  methodRef.current = method

  const form = useForm({
    defaultValues: {
      phone: '',
      email: '',
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = requestPasswordSchema(methodRef.current).safeParse(value)
        if (result.success) return undefined

        return {
          fields: Object.fromEntries(
            result.error.issues.map((issue) => [
              String(issue.path[0] ?? 'form'),
              issue.message,
            ]),
          ),
        }
      },
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const identifier =
        methodRef.current === 'phone' ? value.phone.trim() : value.email.trim()

      try {
        await requestOtpFn({ data: { identifier } })
        void navigate({ to: '/reset-password' })
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Could not request OTP',
        )
      }
    },
  })

  const switchMethod = (next: LoginMethod) => {
    setMethod(next)
    setSubmitError(null)
    form.setFieldMeta('phone', (meta) => ({
      ...meta,
      errors: [],
      errorMap: {},
    }))
    form.setFieldMeta('email', (meta) => ({
      ...meta,
      errors: [],
      errorMap: {},
    }))
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="font-heading text-xl font-black tracking-tight text-foreground uppercase">
          Forgot password
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Enter your phone or email and we&apos;ll send a one-time code to reset
          your password.
        </p>
      </header>

      <div
        className="grid grid-cols-2 gap-0.5 rounded-xl border border-border bg-muted/30 p-0.5"
        role="tablist"
        aria-label="Recovery method"
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
                  id="request-phone"
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
                  id="request-email"
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

          {submitError ? (
            <Field>
              <FieldError errors={[{ message: submitError }]} />
            </Field>
          ) : null}

          <Field className="gap-4">
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
                    'Request OTP'
                  )}
                </Button>
              )}
            />

            <FieldDescription className="text-center text-xs leading-relaxed">
              Remembered your password?{' '}
              <Link
                to="/"
                className="font-semibold text-secondary underline-offset-4 hover:underline"
              >
                Back to home
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
