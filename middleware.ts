import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAMES } from '@/lib/config'

// Public routes that don't require authentication
const publicRoutes = [
	'/',
	'/login',
	'/signup',
	'/forgot-password',
	'/reset-password',
	'/dashboard'
]

// Auth routes that should redirect to dashboard if already authenticated
const authRoutes = [
	'/login',
	'/signup',
	'/forgot-password',
	'/reset-password'
]

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	
	// Add security headers (extend in future as needed)
	// Check if the route is public
	const isPublicRoute = publicRoutes.includes(pathname)
	const isAuthRoute = authRoutes.includes(pathname)
	
	// Get session token from cookies (centralized name)
	const sessionToken = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value
	
	// If user is authenticated and trying to access auth pages, redirect to dashboard
	if (sessionToken && isAuthRoute) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}
	
	// If user is not authenticated and trying to access protected routes, redirect to login
	if (!sessionToken && !isPublicRoute) {
		const loginUrl = new URL('/login', request.url)
		loginUrl.searchParams.set('redirect', pathname)
		return NextResponse.redirect(loginUrl)
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


