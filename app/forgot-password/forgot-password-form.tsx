'use client'

import { useState } from 'react'
import { AuthForm, EmailField } from '@/components/auth/auth-form'
import { forgotPasswordSchema } from '@/lib/auth/types'
import { forgotPasswordAction } from '@/lib/auth/actions'

export function ForgotPasswordForm() {
	// Remove external loading; rely on form's submitting state
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	    const handleForgotPassword = async () => {}

	if (success) {
		return (
			<div className="w-full max-w-md mx-auto">
				<div className="glass rounded-xl p-8 text-center">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
						<svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
					</div>
					<h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
					<p className="text-neutral-400 text-sm">
						We&apos;ve sent you a password reset link. Please check your email and follow the instructions to reset your password.
					</p>
				</div>
			</div>
		)
	}

	return (
		<>
			{error && (
				<div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
					<p className="text-sm text-red-400">{error}</p>
				</div>
			)}
			
            <AuthForm
				title="Reset your password"
				subtitle="Enter your email address and we'll send you a link to reset your password"
                onSubmit={handleForgotPassword}
				action={async (formData) => {
					const result = await forgotPasswordAction(undefined, formData)
					if ('errors' in result) {
						const formErrors = (result.errors as Record<string, string[] | undefined>)._form
						if (formErrors && formErrors.length) {
							setError(formErrors[0])
							return
						}
					}
					setSuccess(true)
				}}
				schema={forgotPasswordSchema}
				submitText="Send reset link"
			>
				<EmailField />
			</AuthForm>
		</>
	)
}
