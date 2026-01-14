'use server'
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from './types'
import { AUTH_ENDPOINTS } from './utils'
import { API_BASE_URL } from '@/lib/config'
import { cookies } from 'next/headers'
import { COOKIE_NAMES } from '@/lib/config'

type ActionResult = { errors: Record<string, string[]> } | { success: true } | never

export async function loginAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
	console.log('[LOGIN] Starting login action...');
	
	const validatedFields = loginSchema.safeParse({
		email: formData.get('email'),
		password: formData.get('password')
	})

	if (!validatedFields.success) {
		console.log('[LOGIN] Validation failed:', validatedFields.error);
		return { errors: validatedFields.error.flatten().fieldErrors }
	}

	const apiUrl = `${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`;
	console.log('[LOGIN] Calling API:', apiUrl);
	console.log('[LOGIN] Email:', validatedFields.data.email);
	
	try {
		// Add timeout to prevent infinite hanging
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
		
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(validatedFields.data),
			credentials: 'include',
			signal: controller.signal
		});
		
		clearTimeout(timeoutId);
		console.log('[LOGIN] Response status:', res.status);
		
		if (!res.ok) {
			const err: unknown = await res.json().catch(() => ({}))
			console.log('[LOGIN] Error response:', err);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return { errors: { _form: [(err as any)?.message || 'Invalid credentials'] } }
		}

		// Attempt to set session cookie from response payload if backend did not set it via Set-Cookie
		const json: unknown = await res.json().catch(() => null)
		console.log('[LOGIN] Success response:', json);
		
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const sessionId: string | undefined = (json as any)?.data?.session_id || (json as any)?.data?.access_token || (json as any)?.access_token
		
		if (sessionId) {
			console.log('[LOGIN] Setting session cookie');
			const cookieStore = await cookies()
			cookieStore.set(COOKIE_NAMES.SESSION_TOKEN, sessionId, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			})
		} else {
			console.log('[LOGIN] No session ID found in response');
		}

		console.log('[LOGIN] Returning success');
		// Return success; client will handle redirect to force full page reload with new cookie
		return { success: true }
	} catch (error) {
		console.error('[LOGIN] Fetch error:', error);
		if ((error as Error).name === 'AbortError') {
			return { errors: { _form: ['Request timeout - backend may be unavailable'] } }
		}
		return { errors: { _form: ['Network error - please check your connection'] } }
	}
}

export async function signupAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
	const parsed = signupSchema.safeParse({
		full_name: formData.get('full_name'),
		email: formData.get('email'),
		password: formData.get('password'),
		company_name: formData.get('company_name'),
		business_email: formData.get('business_email'),
		country: formData.get('country'),
		legal_name: formData.get('legal_name') || undefined,
		tax_id: formData.get('tax_id') || undefined,
		address_line1: formData.get('address_line1') || undefined,
		city: formData.get('city') || undefined,
		state: formData.get('state') || undefined,
		postal_code: formData.get('postal_code') || undefined,
		company_phone: formData.get('company_phone') || undefined,
		website: formData.get('website') || undefined,
		termsAccepted: formData.get('termsAccepted') === 'on'
	})

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	// Build payload according to backend API specification
	// POST /api/auth/register-account
	const payload: {
		admin: {
			full_name: string
			email: string
			password: string
		}
		company: {
			name: string
			business_email: string
			country: string
			legal_name?: string
			tax_id?: string
			address_line1?: string
			city?: string
			state?: string
			postal_code?: string
			phone?: string
			website?: string
		}
	} = {
		admin: {
			full_name: parsed.data.full_name,
			email: parsed.data.email,
			password: parsed.data.password
		},
		company: {
			name: parsed.data.company_name,
			business_email: parsed.data.business_email,
			country: parsed.data.country
		}
	}

	// Add optional company fields only if provided
	if (parsed.data.legal_name) payload.company.legal_name = parsed.data.legal_name
	if (parsed.data.tax_id) payload.company.tax_id = parsed.data.tax_id
	if (parsed.data.address_line1) payload.company.address_line1 = parsed.data.address_line1
	if (parsed.data.city) payload.company.city = parsed.data.city
	if (parsed.data.state) payload.company.state = parsed.data.state
	if (parsed.data.postal_code) payload.company.postal_code = parsed.data.postal_code
	if (parsed.data.company_phone) payload.company.phone = parsed.data.company_phone
	if (parsed.data.website) payload.company.website = parsed.data.website

	const res = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.REGISTER_ACCOUNT}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
		credentials: 'include'
	})

	if (!res.ok) {
		const err: unknown = await res.json().catch(() => ({}))
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return { errors: { _form: [(err as any)?.error || (err as any)?.message || 'Organization registration failed'] } }
	}

	return { success: true }
}

export async function forgotPasswordAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
	const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })
	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	const res = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.FORGOT_PASSWORD}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: parsed.data.email }),
		credentials: 'include'
	})

	if (!res.ok) {
    const err: unknown = await res.json().catch(() => ({}))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { errors: { _form: [(err as any)?.message || 'Failed to send reset email'] } }
	}

    return { success: true }
}

export async function resetPasswordAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
	const parsed = resetPasswordSchema.safeParse({
		password: formData.get('password'),
		confirmPassword: formData.get('confirmPassword'),
		token: formData.get('token')
	})
	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	const res = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.RESET_PASSWORD}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token: parsed.data.token, password: parsed.data.password }),
		credentials: 'include'
	})

	if (!res.ok) {
    const err: unknown = await res.json().catch(() => ({}))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { errors: { _form: [(err as any)?.message || 'Password reset failed'] } }
	}

    return { success: true }
}

