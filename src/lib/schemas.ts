import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginSchema = z.infer<typeof loginSchema>
