import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import {
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import { verifySchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { InputOTP } from '#/components/ui/input-otp'
import { InputOTPGroup, InputOTPSlot } from '#/components/ui/input-otp'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { verifyFn } from '#/data/auth'
import { pickFeaturedDivision } from '#/components/landing/division-utils'
import { getLegSlug, getSeasonSlug } from '#/lib/tournament-slugs'

const rootRoute = getRouteApi('__root__')

export const Route = createFileRoute('/_auth/verify')({
  component: VerifyPage,
})

function VerifyPage() {
  const { seasons } = rootRoute.useRouteContext()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      otp: '',
    },
    validators: {
      onSubmit: verifySchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        await verifyFn({ data: value })

        const season = seasons[0]
        const featured = season ? pickFeaturedDivision(season.divisions) : null

        if (!season || !featured) {
          void navigate({ to: '/' })
          return
        }

        void navigate({
          to: '/$seasonSlug/$legSlug/quiz',
          params: {
            seasonSlug: getSeasonSlug(season),
            legSlug: getLegSlug(featured.division),
          },
        })
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Could not verify your account',
        )
      }
    },
  })

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="font-heading text-xl font-black tracking-tight text-foreground uppercase">
          Verify your account
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Enter the 6-digit code we sent you to verify your account.
        </p>
      </header>

      <form
        noValidate
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-5">
          <form.Field
            name="otp"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field
                  className="gap-2"
                  data-invalid={isInvalid ? true : undefined}
                >
                  <FieldLabel htmlFor="reset-otp">One-time code</FieldLabel>
                  <div className="flex justify-center sm:justify-start">
                    <InputOTP
                      id="reset-otp"
                      maxLength={6}
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                      onBlur={field.handleBlur}
                      containerClassName="gap-2"
                      aria-invalid={isInvalid || undefined}
                    >
                      <InputOTPGroup className="gap-1.5">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={cn(
                              'size-11 rounded-xl border border-border bg-background text-base font-semibold first:rounded-xl first:border-l last:rounded-xl',
                              isInvalid && 'border-destructive',
                            )}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : (
                    <FieldDescription>
                      Check your phone or email for the code.
                    </FieldDescription>
                  )}
                </Field>
              )
            }}
          />

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
                    'Verify account'
                  )}
                </Button>
              )}
            />
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
