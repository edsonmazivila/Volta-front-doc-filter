// Server-side: use API_URL (private) if available, fallback to NEXT_PUBLIC_API_URL
// Client-side: use NEXT_PUBLIC_API_URL only
export const API_BASE_URL =
	typeof window === 'undefined'
		? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
		: process.env.NEXT_PUBLIC_API_URL

export const COOKIE_NAMES = {
	SESSION_TOKEN: 'session_token',
	REFRESH_TOKEN: 'refresh_token'
} as const
