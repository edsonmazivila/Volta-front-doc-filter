'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForm, PasswordField, ConfirmPasswordField } from '@/components/auth/auth-form'
import { resetPasswordSchema } from '@/lib/auth/types'
import { resetPasswordAction } from '@/lib/auth/actions'

interface ResetPasswordFormProps {
	token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
	// Use form's submitting state; remove external loading
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const router = useRouter()

	    const handleResetPassword = async () => {}

	if (success) {
		return (
			<div className="w-full max-w-md mx-auto">
				<div className="glass rounded-xl p-8 text-center">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
						<svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h1 className="text-xl font-bold text-white mb-2">Password Reset!</h1>
					<p className="text-neutral-400 text-sm">
						Your password has been reset successfully. Redirecting to login...
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
				title="Set new password"
				subtitle="Enter your new password below"
                onSubmit={handleResetPassword}
                action={async (formData) => {
                    if (!formData.get('token')) formData.set('token', token)
					const result = await resetPasswordAction(undefined, formData)
					if ('errors' in result) {
						const formErrors = (result.errors as Record<string, string[] | undefined>)._form
						if (formErrors && formErrors.length) {
							setError(formErrors[0])
							return
						}
					}
                    setSuccess(true)
                    setTimeout(() => {
                        router.push('/login?message=Password reset successfully! Please sign in with your new password.')
                    }, 2000)
                }}
				schema={resetPasswordSchema}
				defaultValues={{ token }}
				submitText="Reset password"
			>
				<PasswordField placeholder="Enter your new password" />
				<ConfirmPasswordField />
			</AuthForm>
		</>
	)
}
