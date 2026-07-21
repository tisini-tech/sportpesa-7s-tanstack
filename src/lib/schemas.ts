import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginSchema = z.infer<typeof loginSchema>

const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character')

const localPhoneSchema = z
  .string()
  .regex(/^\d{9}$/, 'Phone number must be exactly 9 digits')

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    username: z.string().min(1, 'Username is required'),
    countryCode: z.string().min(1, 'Country code is required'),
    phone: localPhoneSchema,
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/** Combine dial code + local 9-digit number → e.g. +254713909472 */
export function formatE164Phone(countryCode: string, localPhone: string): string {
  const code = countryCode.trim().startsWith('+')
    ? countryCode.trim()
    : `+${countryCode.trim()}`
  const digits = localPhone.trim().replace(/\D/g, '').replace(/^0+/, '')
  return `${code}${digits}`
}

export const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(6, 'Enter the 6-digit code')
      .regex(/^\d{6}$/, 'OTP must be 6 digits'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const verifySchema = z.object({
  otp: z
    .string()
    .length(6, 'Enter the 6-digit code')
    .regex(/^\d{6}$/, 'OTP must be 6 digits'),
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

export type RegisterSchema = z.infer<typeof registerSchema>

export type RequestPasswordMethod = 'phone' | 'email'

export function requestPasswordSchema(method: RequestPasswordMethod) {
  return z
    .object({
      phone: z.string(),
      email: z.string(),
    })
    .superRefine((data, ctx) => {
      if (method === 'phone') {
        const phone = data.phone.trim()
        if (phone.length < 10) {
          ctx.addIssue({
            code: 'custom',
            message: 'Phone number must be at least 10 digits',
            path: ['phone'],
          })
        }
        return
      }

      const email = data.email.trim()
      if (!email) {
        ctx.addIssue({
          code: 'custom',
          message: 'Email is required',
          path: ['email'],
        })
        return
      }

      const emailResult = z
        .string()
        .email('Invalid email address')
        .safeParse(email)
      if (!emailResult.success) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid email address',
          path: ['email'],
        })
      }
    })
}
