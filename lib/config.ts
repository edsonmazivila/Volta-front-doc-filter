// Server-side: use API_URL (private) if available, fallback to NEXT_PUBLIC_API_URL
// Client-side: use NEXT_PUBLIC_API_URL only
// No hardcoded fallbacks - fail fast if environment variables are not configured
function getApiBaseUrl(): string {
	if (typeof window === 'undefined') {
		// Server-side: prefer API_URL (internal), fallback to NEXT_PUBLIC_API_URL
		const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
		if (!url) {
			throw new Error(
				'Missing API configuration: API_URL or NEXT_PUBLIC_API_URL must be set in environment variables'
			)
		}
		return url
	} else {
		// Client-side: only NEXT_PUBLIC_API_URL is available
		const url = process.env.NEXT_PUBLIC_API_URL
		if (!url) {
			throw new Error(
				'Missing API configuration: NEXT_PUBLIC_API_URL must be set in environment variables'
			)
		}
		return url
	}
}

export const API_BASE_URL = getApiBaseUrl()

export const COOKIE_NAMES = {
	SESSION_TOKEN: 'session_token',
	REFRESH_TOKEN: 'refresh_token'
} as const
