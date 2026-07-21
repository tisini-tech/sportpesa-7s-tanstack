import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import {
  createFileRoute,
  getRouteApi,
  Link,
  useNavigate,
} from '@tanstack/react-router'

import { registerSchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { InputField } from '#/components/forms/input-field'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '#/components/ui/field'
import { registerFn } from '#/data/auth'
import { getDefaultCountry, PhoneField } from '#/components/forms/phone-field'

const authRoute = getRouteApi('/_auth')

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const { countries } = authRoute.useRouteContext()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()

  const defaultCountry = getDefaultCountry(countries)

  const form = useForm({
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      countryCode: defaultCountry?.telephone_code ?? '+254',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        await registerFn({ data: value })
        void navigate({ to: '/verify' })
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Could not create your account',
        )
      }
    },
  })

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="font-heading text-xl font-black tracking-tight text-foreground uppercase">
          Create account
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sign up with your details to play quizzes and join the circuit.
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <form.Field
              name="firstName"
              children={(field) => (
                <InputField
                  field={field}
                  id="register-first-name"
                  label="First name"
                  type="text"
                  placeholder="John"
                  autoComplete="given-name"
                  className="gap-2"
                  inputClassName="h-11 rounded-xl px-3"
                />
              )}
            />

            <form.Field
              name="lastName"
              children={(field) => (
                <InputField
                  field={field}
                  id="register-last-name"
                  label="Last name"
                  type="text"
                  placeholder="Doe"
                  autoComplete="family-name"
                  className="gap-2"
                  inputClassName="h-11 rounded-xl px-3"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <form.Field
              name="username"
              children={(field) => (
                <InputField
                  field={field}
                  id="register-username"
                  label="Username"
                  type="text"
                  placeholder="johndoe"
                  autoComplete="username"
                  className="gap-2"
                  inputClassName="h-11 rounded-xl px-3"
                />
              )}
            />

            <form.Field
              name="email"
              children={(field) => (
                <InputField
                  field={field}
                  id="register-email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="gap-2"
                  inputClassName="h-11 rounded-xl px-3"
                />
              )}
            />
          </div>

          <form.Field
            name="countryCode"
            children={(countryCodeField) => (
              <form.Field
                name="phone"
                children={(phoneField) => (
                  <PhoneField
                    countries={countries}
                    countryCodeField={countryCodeField}
                    phoneField={phoneField}
                    id="register-phone"
                  />
                )}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <form.Field
              name="password"
              children={(field) => (
                <InputField
                  field={field}
                  id="register-password"
                  label="Password"
                  type="password"
                  placeholder="Min 6 chars + special"
                  autoComplete="new-password"
                  className="gap-2"
                  inputClassName="h-11 rounded-xl px-3"
                />
              )}
            />

            <form.Field
              name="confirmPassword"
              children={(field) => (
                <InputField
                  field={field}
                  id="register-confirm-password"
                  label="Confirm password"
                  type="password"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className="gap-2"
                  inputClassName="h-11 rounded-xl px-3"
                />
              )}
            />
          </div>

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
                    'Create account'
                  )}
                </Button>
              )}
            />

            <FieldDescription className="text-center text-xs leading-relaxed">
              Already have an account?{' '}
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
