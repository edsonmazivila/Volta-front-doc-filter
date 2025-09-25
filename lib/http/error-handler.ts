export enum ErrorType {
	AUTHENTICATION = 'AUTHENTICATION_ERROR',
	AUTHORIZATION = 'AUTHORIZATION_ERROR',
	VALIDATION = 'VALIDATION_ERROR',
	NOT_FOUND = 'NOT_FOUND_ERROR',
	SERVER = 'SERVER_ERROR',
	NETWORK = 'NETWORK_ERROR',
	UNKNOWN = 'UNKNOWN_ERROR',
}

export class ApiError extends Error {
	type: ErrorType
	status?: number
	details?: Record<string, unknown>

	constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, status?: number, details?: Record<string, unknown>) {
		super(message)
		this.name = 'ApiError'
		this.type = type
		this.status = status
		this.details = details
	}
}

export function handleServiceError(error: unknown, context: string, defaultMessage: string = 'An unknown error occurred'): never {
	console.error(`Error in ${context}:`, error)

	if (error instanceof ApiError) {
		throw error
	}

	if (error instanceof Error) {
		const msg = error.message || defaultMessage
		if (msg.includes('unauthorized') || msg.includes('token')) {
			throw new ApiError(msg, ErrorType.AUTHENTICATION)
		}
		if (msg.includes('permission') || msg.includes('not allowed')) {
			throw new ApiError(msg, ErrorType.AUTHORIZATION)
		}
		if (msg.includes('not found') || msg.includes('does not exist')) {
			throw new ApiError(msg, ErrorType.NOT_FOUND)
		}
		if (msg.includes('invalid') || msg.includes('required')) {
			throw new ApiError(msg, ErrorType.VALIDATION)
		}
		throw new ApiError(msg, ErrorType.UNKNOWN)
	}

	throw new ApiError(defaultMessage, ErrorType.UNKNOWN)
}


