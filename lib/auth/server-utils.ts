import 'server-only'
import { cookies } from 'next/headers'
import { COOKIE_NAMES } from '@/lib/config'

/**
 * Builds a Cookie header string from Next.js cookies for forwarding to backend API
 * This is a server-only utility that must be called from Server Components or Server Actions
 * @returns Cookie header string or undefined if no auth cookies present
 */
export async function getAuthCookieHeader(): Promise<string | undefined> {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value
  const refresh = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value
  
  const cookieHeader = [
    session ? `${COOKIE_NAMES.SESSION_TOKEN}=${session}` : null,
    refresh ? `${COOKIE_NAMES.REFRESH_TOKEN}=${refresh}` : null,
  ].filter(Boolean).join('; ')
  
  return cookieHeader || undefined
}
