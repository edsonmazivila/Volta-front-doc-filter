export interface ApiErrorResponse {
	error?: string
	message?: string
	code?: number
}

export interface ApiRequestConfig {
	headers?: Record<string, string>
	searchParams?: Record<string, string | number | boolean | undefined>
	disableLogging?: boolean
	retries?: number
	retryDelayMs?: number
}

const getCsrfToken = (): string | null => {
	if (typeof document === 'undefined') return null
	const cookies = document.cookie.split(';')
	for (const cookie of cookies) {
		const [name, value] = cookie.trim().split('=')
		if (name === 'csrf_token') return decodeURIComponent(value)
	}
	return null
}

export class ApiClient {
	private baseUrl: string
	private enableLogging: boolean

	// Prevent multiple parallel 401 handlers from racing
	private static isHandlingUnauthorized = false

	constructor(baseUrl = process.env.NEXT_PUBLIC_API_URL || '', enableLogging = false) {
		this.baseUrl = baseUrl
		this.enableLogging = enableLogging
	}

	private buildUrl(endpoint: string, config?: ApiRequestConfig): string {
		// On the browser, prefer same-origin for our Next.js API routes to avoid CORS
		const isBrowser = typeof window !== 'undefined'
		const useRelative = isBrowser && endpoint.startsWith('/api/')
		const base = useRelative ? '' : this.baseUrl
		const url = new URL(`${base}${endpoint}`, isBrowser ? window.location.origin : 'http://localhost')
		if (config?.searchParams) {
			Object.entries(config.searchParams).forEach(([key, value]) => {
				if (value !== undefined) url.searchParams.append(key, String(value))
			})
		}
		return url.toString()
	}

	private redactSensitiveInfo(obj: unknown): unknown {
		if (!obj || typeof obj !== 'object') return obj
		if (Array.isArray(obj)) return [...obj]
		const result: Record<string, unknown> = { ...(obj as Record<string, unknown>) }
		const sensitive = ['password','current_password','new_password','confirm_password','token','access_token','refresh_token','csrf_token']
		for (const key in result) {
			if (sensitive.includes(key)) {
				result[key] = '[REDACTED]'
			} else if (typeof result[key] === 'object' && result[key] !== null) {
				result[key] = this.redactSensitiveInfo(result[key])
			}
		}
		return result
	}

	private logRequest(method: string, url: string, headers: Record<string, string>): void {
		if (!this.enableLogging) return
		const safe = { ...headers }
		if (safe['Authorization']) safe['Authorization'] = 'Bearer [REDACTED]'
		if (safe['X-CSRF-Token']) safe['X-CSRF-Token'] = '[REDACTED]'
		// Logging disabled for production
	}

	private logResponse(method: string, url: string, status: number, data: unknown, start: number): void {
		if (!this.enableLogging) return
		// Logging disabled for production
		void start // Duration calculation removed but start param kept for future use
	}

	private async doFetch(method: string, endpoint: string, body?: unknown, _token?: string, config?: ApiRequestConfig): Promise<Response> {
		const url = this.buildUrl(endpoint, config)
		const headers: Record<string, string> = { ...config?.headers }
		
		// Only add Content-Type for non-FormData requests
		if (!(body instanceof FormData)) {
			headers['Content-Type'] = 'application/json'
		}
		
		// Note: Token-based auth removed - use HTTP-only cookies only
		if (method !== 'GET') {
			const csrf = getCsrfToken()
			if (csrf) headers['X-CSRF-Token'] = csrf
		}
		if (this.enableLogging && !config?.disableLogging) this.logRequest(method, url, headers)
		return fetch(url, {
			method,
			headers,
			credentials: 'include',
			body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
		})
	}

	private async handleResponse<T>(response: Response, method: string, url: string, start: number, config?: ApiRequestConfig): Promise<T> {
		if (!response.ok) {
			// Global 401 handling: clear session and redirect to login from the browser
			if (response.status === 401) {
				if (typeof window !== 'undefined' && !ApiClient.isHandlingUnauthorized) {
					ApiClient.isHandlingUnauthorized = true
					// Best-effort logout to clear httpOnly cookies
					fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
					// Avoid redirect loop if already on /login
					try {
						const currentPath = window.location.pathname || '/'
						if (!currentPath.startsWith('/login')) {
							const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`
							window.location.replace(loginUrl)
						}
					} finally {
						// If we're already on /login, allow further 401s to be handled normally
						ApiClient.isHandlingUnauthorized = false
					}
				}
			}
			const text = await response.text()
			if (this.enableLogging && !config?.disableLogging) {
				// Error logging disabled for production
			}
			try {
				if (text.trim().startsWith('{')) {
					const err = JSON.parse(text) as ApiErrorResponse
					throw new Error(err.error || err.message || `HTTP ${response.status}`)
				}
			} catch {}
			throw new Error(`HTTP ${response.status}: ${text}`)
		}
		if (response.status === 204 || response.headers.get('content-length') === '0') {
			if (this.enableLogging && !config?.disableLogging) this.logResponse(method, url, response.status, {}, start)
			return {} as T
		}
		const data = await response.json()
		if (this.enableLogging && !config?.disableLogging) this.logResponse(method, url, response.status, data, start)
		return data as T
	}

	private async withRetry<T>(fn: () => Promise<T>, config?: ApiRequestConfig): Promise<T> {
		const retries = config?.retries ?? 3
		const delayMs = config?.retryDelayMs ?? 1000
		let lastErr: unknown
		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				return await fn()
			} catch (err) {
				lastErr = err
				const msg = err instanceof Error ? err.message : ''
				if (msg.includes('HTTP 4')) break
				if (attempt < retries) await new Promise(r => setTimeout(r, delayMs * attempt))
			}
		}
		throw lastErr as Error
	}

	async get<T>(endpoint: string, _token?: string, config?: ApiRequestConfig): Promise<T> {
		const start = Date.now()
		const url = this.buildUrl(endpoint, config)
		return this.withRetry(async () => {
			const res = await this.doFetch('GET', endpoint, undefined, undefined, config)
			return this.handleResponse<T>(res, 'GET', url, start, config)
		}, config)
	}

	async post<T>(endpoint: string, data: unknown, _token?: string, config?: ApiRequestConfig): Promise<T> {
		const start = Date.now()
		const url = this.buildUrl(endpoint, config)
		const res = await this.doFetch('POST', endpoint, data, undefined, config)
		return this.handleResponse<T>(res, 'POST', url, start, config)
	}

	async put<T>(endpoint: string, data: unknown, _token?: string, config?: ApiRequestConfig): Promise<T> {
		const start = Date.now()
		const url = this.buildUrl(endpoint, config)
		const res = await this.doFetch('PUT', endpoint, data, undefined, config)
		return this.handleResponse<T>(res, 'PUT', url, start, config)
	}

	async patch<T>(endpoint: string, data: unknown, _token?: string, config?: ApiRequestConfig): Promise<T> {
		const start = Date.now()
		const url = this.buildUrl(endpoint, config)
		const res = await this.doFetch('PATCH', endpoint, data, undefined, config)
		return this.handleResponse<T>(res, 'PATCH', url, start, config)
	}

	async delete<T>(endpoint: string, _token?: string, config?: ApiRequestConfig): Promise<T> {
		const start = Date.now()
		const url = this.buildUrl(endpoint, config)
		const res = await this.doFetch('DELETE', endpoint, undefined, undefined, config)
		return this.handleResponse<T>(res, 'DELETE', url, start, config)
	}
}

export const apiClient = new ApiClient()


