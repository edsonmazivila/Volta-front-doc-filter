'use server'
import { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema } from './types'
import { AUTH_ENDPOINTS } from './utils'
import { API_BASE_URL } from '@/lib/config'
import { cookies } from 'next/headers'
import { COOKIE_NAMES } from '@/lib/config'
import { revalidatePath } from 'next/cache'

type ActionResult = { errors: Record<string, string[]> } | { success: true }

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
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24
		})
	}

	revalidatePath('/', 'layout')

    return { success: true }
}

export async function signupAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
	const parsed = signupSchema.safeParse({
		name: formData.get('name'),
		email: formData.get('email'),
		password: formData.get('password'),
		confirmPassword: formData.get('confirmPassword'),
		companyName: formData.get('companyName'),
		termsAccepted: formData.get('termsAccepted') === 'on'
	})
	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	const res = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.SIGNUP}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			name: parsed.data.name,
			email: parsed.data.email,
			password: parsed.data.password,
			companyName: parsed.data.companyName
		}),
		credentials: 'include'
	})

	if (!res.ok) {
    const err: unknown = await res.json().catch(() => ({}))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { errors: { _form: [(err as any)?.message || 'Signup failed'] } }
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


