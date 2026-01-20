'use client'

import { useState } from 'react'
import { AuthForm, EmailField } from '@/components/auth/auth-form'
import { forgotPasswordSchema } from '@/lib/auth/types'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { msg } from '@lingui/core/macro'
import { forgotPasswordClient } from '@/lib/services/password-client'

export function ForgotPasswordForm() {
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const { i18n } = useLingui()

	if (success) {
		return (
			<div className="w-full max-w-md mx-auto">
				<div className="glass rounded-xl p-8 text-center">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
						<svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
					</div>
					<h1 className="text-xl font-bold text-white mb-2"><Trans>Check your email</Trans></h1>
					<p className="text-neutral-400 text-sm">
						<Trans>We&apos;ve sent you a password reset link. Please check your email and follow the instructions to reset your password.</Trans>
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
				title={i18n._(msg`Reset your password`)}
				subtitle={i18n._(msg`Enter your email address and we'll send you a link to reset your password`)}
				onSubmit={async () => {}}
				action={async (formData) => {
					setError(null)
					const email = formData.get('email') as string
					
				if (process.env.NODE_ENV === 'development') {
					console.log('[ForgotPassword] Starting request...')
				}
				
				// Validate email
				const validation = forgotPasswordSchema.safeParse({ email })
				if (!validation.success) {
					const emailErrors = validation.error.flatten().fieldErrors.email
					if (emailErrors?.length) {
						if (process.env.NODE_ENV === 'development') {
							console.log('[ForgotPassword] Validation error:', emailErrors[0])
						}
						setError(emailErrors[0])
						return
					}
				}

				try {
					// Call API
					if (process.env.NODE_ENV === 'development') {
						console.log('[ForgotPassword] Calling API...')
					}
					const result = await forgotPasswordClient(email)
					
					if (process.env.NODE_ENV === 'development') {
						console.log('[ForgotPassword] Request completed with success:', result.success)
					}
					
					if (!result.success) {
						setError(result.error)
						return
					}

					setSuccess(true)
				} catch (err) {
					console.error('[ForgotPassword] Unexpected error:', err)
					setError('An unexpected error occurred. Please try again.')
				}
				}}
				schema={forgotPasswordSchema}
				submitText={i18n._(msg`Send reset link`)}
			>
				<EmailField />
			</AuthForm>
		</>
	)
}
