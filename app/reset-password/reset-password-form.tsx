'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForm, PasswordField, ConfirmPasswordField } from '@/components/auth/auth-form'
import { resetPasswordSchema } from '@/lib/auth/types'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { msg } from '@lingui/core/macro'
import { resetPasswordClient } from '@/lib/services/password-client'

interface ResetPasswordFormProps {
	token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const router = useRouter()
	const { i18n } = useLingui()

	if (success) {
		return (
			<div className="w-full max-w-md mx-auto">
				<div className="glass rounded-xl p-8 text-center">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
						<svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h1 className="text-xl font-bold text-white mb-2"><Trans>Password Reset!</Trans></h1>
					<p className="text-neutral-400 text-sm">
						<Trans>Your password has been reset successfully. Redirecting to login...</Trans>
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
				title={i18n._(msg`Set new password`)}
				subtitle={i18n._(msg`Enter your new password below`)}
				onSubmit={async () => {}}
				action={async (formData) => {
					setError(null)
					const password = formData.get('password') as string
					const confirmPassword = formData.get('confirmPassword') as string
					
					// Validate form data
					const validation = resetPasswordSchema.safeParse({
						password,
						confirmPassword,
						token,
					})
					
					if (!validation.success) {
						const errors = validation.error.flatten()
						const firstError = 
							errors.fieldErrors.password?.[0] ||
							errors.fieldErrors.confirmPassword?.[0] ||
							errors.formErrors?.[0] ||
							'Invalid form data'
						setError(firstError)
						return
					}

					// Call API
					const result = await resetPasswordClient(token, password)
					
					if (!result.success) {
						setError(result.error)
						return
					}

					setSuccess(true)
					setTimeout(() => {
						router.push('/login?message=Password reset successfully! Please sign in with your new password.')
					}, 2000)
				}}
				schema={resetPasswordSchema}
				defaultValues={{ token }}
				submitText={i18n._(msg`Reset password`)}
			>
				<PasswordField placeholder={i18n._(msg`Enter your new password`)} />
				<ConfirmPasswordField />
			</AuthForm>
		</>
	)
}
