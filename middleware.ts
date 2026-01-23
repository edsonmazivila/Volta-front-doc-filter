import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAMES, API_BASE_URL } from '@/lib/config'
import { locales, defaultLocale, LOCALE_COOKIE_NAME, type Locale } from '@/lib/i18n/locales'

// Public routes that don't require authentication
const publicRoutes = new Set([
	'/',
	'/login',
	'/signup',
	'/signup/success',
	'/forgot-password',
	'/reset-password',
	'/pricing',
	'/about',
	'/features',
	'/contact',
	'/careers'
])

// Auth routes that should redirect to dashboard if already authenticated
const authRoutes = new Set([
	'/login',
	'/signup',
	'/forgot-password',
	'/reset-password'
])

/**
 * Detect the user's preferred locale from request headers and cookies
 */
function getPreferredLocale(request: NextRequest): Locale {
	// 1. Check cookie first (user's explicit preference)
	const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value
	if (cookieLocale && locales.includes(cookieLocale as Locale)) {
		return cookieLocale as Locale
	}

	// 2. Parse Accept-Language header
	const acceptLanguage = request.headers.get('Accept-Language')
	if (acceptLanguage) {
		// Parse language preferences (e.g., "pt-PT,pt;q=0.9,en;q=0.8")
		const languages = acceptLanguage
			.split(',')
			.map(lang => {
				const [code, qValue] = lang.trim().split(';q=')
				return {
					code: code.trim(),
					quality: qValue ? Number.parseFloat(qValue) : 1
				}
			})
			.sort((a, b) => b.quality - a.quality)

		// Find first matching locale
		for (const { code } of languages) {
			// Exact match
			if (locales.includes(code as Locale)) {
				return code as Locale
			}
			// Language-only match (e.g., "pt" matches "pt-PT")
			const languageOnly = code.split('-')[0]
			const matchingLocale = locales.find(
				locale => locale.startsWith(languageOnly)
			)
			if (matchingLocale) {
				return matchingLocale
			}
		}
	}

	// 3. Fallback to default
	return defaultLocale
}

/**
 * Create a response with locale header
 */
function createResponseWithLocale(
	response: NextResponse,
	locale: Locale
): NextResponse {
	// Set locale in response headers for use in layout
	response.headers.set('x-locale', locale)

	// Set locale cookie if not already set (persists user preference)
	if (!response.cookies.get(LOCALE_COOKIE_NAME)) {
		response.cookies.set(LOCALE_COOKIE_NAME, locale, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365, // 1 year
			sameSite: 'lax',
		})
	}

	return response
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Detect preferred locale
	const locale = getPreferredLocale(request)

	// Check if the route is public
	const isPublicRoute = publicRoutes.has(pathname)
	const isAuthRoute = authRoutes.has(pathname)

	// Get session token from cookies (centralized name)
	const sessionToken = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value

	// If no session token exists
	if (!sessionToken) {
		// Redirect to login if trying to access protected route
		if (!isPublicRoute) {
			const loginUrl = new URL('/login', request.url)
			loginUrl.searchParams.set('redirect', pathname)
			return NextResponse.redirect(loginUrl)
		}
		// Allow access to public routes with locale
		return createResponseWithLocale(NextResponse.next(), locale)
	}

	// Session token exists - validate it with backend for protected routes
	// Skip validation for auth pages (will be handled by page logic)
	if (!isPublicRoute && !isAuthRoute) {
		try {
			// Validate session with backend
			const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Cookie': `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken}`
				},
				// Don't cache auth checks
				cache: 'no-store',
				// Add timeout to prevent hanging in development
				signal: AbortSignal.timeout(5000)
			})

			// Session is invalid
			if (!res.ok) {
				// Clear the invalid cookie and redirect to login
				const loginUrl = new URL('/login', request.url)
				loginUrl.searchParams.set('redirect', pathname)
				loginUrl.searchParams.set('session_expired', 'true')

				const response = NextResponse.redirect(loginUrl)
				// Delete the invalid cookie
				response.cookies.delete(COOKIE_NAMES.SESSION_TOKEN)
				response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN)

				return response
			}
		} catch (error) {
			// Network error or backend down
			console.error('[Middleware] Session validation failed:', error)
			
			// In development, log warning but allow access if timeout/network error
			// This prevents blocking during local development when backend might be restarting
			if (process.env.NODE_ENV === 'development' && 
			    (error instanceof Error && (error.name === 'TimeoutError' || error.message.includes('ECONNREFUSED')))) {
				console.warn('[Middleware] Development mode: Allowing access despite backend connection issue')
				return createResponseWithLocale(NextResponse.next(), locale)
			}
			
			// In production or for other errors, redirect to login
			const loginUrl = new URL('/login', request.url)
			loginUrl.searchParams.set('redirect', pathname)
			loginUrl.searchParams.set('error', 'auth_check_failed')
			return NextResponse.redirect(loginUrl)
		}
	}

	// If user is authenticated and trying to access auth pages, redirect to dashboard
	if (sessionToken && isAuthRoute) {
		// Check user role to redirect to appropriate dashboard
		// In production, we'd validate with backend, but for now redirect to /dashboard
		// The page logic will handle role-based redirects
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	// Normal response with locale header
	return createResponseWithLocale(NextResponse.next(), locale)
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - logo (logo files)
		 * - icons (icon files)
		 * - static files
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|logo|icons|figma|moon|nextjs|ts|vercel|window|file|globe).*)',
	]
}

