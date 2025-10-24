'use server'
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from './types'
import { AUTH_ENDPOINTS } from './utils'
import { API_BASE_URL } from '@/lib/config'
import { cookies } from 'next/headers'
import { COOKIE_NAMES } from '@/lib/config'

type ActionResult = { errors: Record<string, string[]> } | { success: true } | never

export async function loginAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
	const validatedFields = loginSchema.safeParse({
		email: formData.get('email'),
		password: formData.get('password')
	})

	if (!validatedFields.success) {
		return { errors: validatedFields.error.flatten().fieldErrors }
	}

	const res = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(validatedFields.data),
		credentials: 'include'
	})

	if (!res.ok) {
    const err: unknown = await res.json().catch(() => ({}))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { errors: { _form: [(err as any)?.message || 'Invalid credentials'] } }
	}

	// Attempt to set session cookie from response payload if backend did not set it via Set-Cookie
    const json: unknown = await res.json().catch(() => null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionId: string | undefined = (json as any)?.data?.session_id || (json as any)?.data?.access_token || (json as any)?.access_token
	if (sessionId) {
		const cookieStore = await cookies()
		cookieStore.set(COOKIE_NAMES.SESSION_TOKEN, sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict', // Changed from 'lax' for better CSRF protection
			secure: true, // Always secure - dev environments should use HTTPS or backend handles this
			maxAge: 60 * 60 * 24
		})
	}

	// Return success; client will handle redirect to force full page reload with new cookie
	return { success: true }
}

export async function signupAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
	const parsed = signupSchema.safeParse({
		full_name: formData.get('full_name'),
		email: formData.get('email'),
		password: formData.get('password'),
		company_name: formData.get('company_name'),
		legal_name: formData.get('legal_name'),
		tax_id: formData.get('tax_id'),
		address_line1: formData.get('address_line1'),
		city: formData.get('city'),
		state: formData.get('state'),
		postal_code: formData.get('postal_code'),
		country: formData.get('country'),
		company_phone: formData.get('company_phone'),
		company_email: formData.get('company_email'),
		website: formData.get('website') || undefined,
		termsAccepted: formData.get('termsAccepted') === 'on'
	})

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	const res = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.REGISTER_ACCOUNT}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			admin: {
				full_name: parsed.data.full_name,
				email: parsed.data.email,
				password: parsed.data.password
			},
			company: {
				name: parsed.data.company_name,
				legal_name: parsed.data.legal_name,
				tax_id: parsed.data.tax_id,
				address_line1: parsed.data.address_line1,
				city: parsed.data.city,
				state: parsed.data.state,
				postal_code: parsed.data.postal_code,
				country: parsed.data.country,
				phone: parsed.data.company_phone,
				email: parsed.data.company_email,
				website: parsed.data.website
			}
		}),
		credentials: 'include'
	})

	if (!res.ok) {
		const err: unknown = await res.json().catch(() => ({}))
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return { errors: { _form: [(err as any)?.message || 'Account registration failed'] } }
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

