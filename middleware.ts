import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAMES, API_BASE_URL } from '@/lib/config'

// Public routes that don't require authentication
const publicRoutes = [
	'/',
	'/login',
	'/signup',
	'/forgot-password',
	'/reset-password'
]

// Auth routes that should redirect to dashboard if already authenticated
const authRoutes = [
	'/login',
	'/signup',
	'/forgot-password',
	'/reset-password'
]

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Check if the route is public
	const isPublicRoute = publicRoutes.includes(pathname)
	const isAuthRoute = authRoutes.includes(pathname)

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
		// Allow access to public routes
		return NextResponse.next()
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
				cache: 'no-store'
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
			// Network error or backend down - redirect to login
			console.error('[Middleware] Session validation failed:', error)
			const loginUrl = new URL('/login', request.url)
			loginUrl.searchParams.set('redirect', pathname)
			loginUrl.searchParams.set('error', 'auth_check_failed')
			return NextResponse.redirect(loginUrl)
		}
	}

	// If user is authenticated and trying to access auth pages, redirect to dashboard
	if (sessionToken && isAuthRoute) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	return NextResponse.next()
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

