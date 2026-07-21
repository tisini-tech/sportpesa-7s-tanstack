import { useSession } from '@tanstack/react-start/server'

export type SessionUser = {
  id: number
  name: string
  email: string
  phone: string
}

export type SessionData = {
  user?: SessionUser
  accessToken?: string
  refreshToken?: string
  /** Email or E.164 phone awaiting OTP verification after register. */
  pendingVerification?: string
}

export function useAppSession() {
  return useSession<SessionData>({
    name: 'app-session',
    password: process.env.SESSION_SECRET!,
    maxAge: 60 * 60 * 24, // 1 day
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
    sessionHeader: 'x-app-session',
    generateId: () => crypto.randomUUID(),
  })
}
