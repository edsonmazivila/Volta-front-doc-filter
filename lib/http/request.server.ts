'use server'

/**
 * HTTP Request Utilities
 * Helper functions for making authenticated requests
 */

import { cookies } from 'next/headers'
import { COOKIE_NAMES } from '@/lib/config'

/**
 * Get authorization header with session cookie
 * Used for server-side API calls
 */
export async function getAuthCookieHeader(): Promise<Record<string, string>> {
	const cookieStore = await cookies()
	const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)

	if (!sessionToken) {
		return {}
	}

	// Return Cookie header for backend API
	return {
		'Cookie': `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken.value}`
	}
}

/**
 * Get session token value
 * Used when you need just the token value
 */
export async function getSessionToken(): Promise<string | undefined> {
	const cookieStore = await cookies()
	const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)
	return sessionToken?.value
}

/**
 * Fetch with automatic timeout
 * Prevents hanging requests to backend
 */
export async function fetchWithTimeout(
	url: string,
	options: RequestInit = {},
	timeoutMs = 10000
): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		if ((error as Error).name === 'AbortError') {
			throw new Error(`Request timeout after ${timeoutMs}ms`);
		}
		throw error;
	}
}
