'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForm, NameField, EmailField, PasswordField, CompanyNameField, TermsField } from '@/components/auth/auth-form'
import { signupSchema } from '@/lib/auth/types'
import { signupAction } from '@/lib/auth/actions'

export function SignupForm() {
	// Rely on form submitting state; no external loading state
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const router = useRouter()

	    const handleSignup = async () => {}

	if (success) {
		return (
			<div className="w-full max-w-md mx-auto">
				<div className="glass rounded-xl p-8 text-center">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
						<svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h1 className="text-xl font-bold text-white mb-2">Account Created!</h1>
					<p className="text-neutral-400 text-sm">
						Your account has been created successfully. Redirecting to login...
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
				title="Create your account"
				subtitle="Get started with NEXUpayroll in minutes"
                onSubmit={handleSignup}
                action={async (formData) => {
					const result = await signupAction(undefined, formData)
					if ('errors' in result) {
						const formErrors = (result.errors as Record<string, string[] | undefined>)._form
						if (formErrors && formErrors.length) {
							setError(formErrors[0])
							return
						}
					}
                    setSuccess(true)
                    setTimeout(() => {
                        router.push('/login?message=Account created successfully! Please sign in.')
                    }, 2000)
                }}
				schema={signupSchema}
				submitText="Create account"
			>
				<CompanyNameField />
				<NameField />
				<EmailField />
				<PasswordField placeholder="Create a strong password" showStrength={true} />

				{/* Optional fields */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex flex-col gap-1">
						<label className="text-sm">Employment type (optional)</label>
						<select name="employmentType" className="w-full border rounded-md px-3 py-2 bg-background">
							<option value="">Select type</option>
							<option value="full_time">Full time</option>
							<option value="part_time">Part time</option>
							<option value="contract">Contract</option>
							<option value="intern">Intern</option>
						</select>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-sm">Hire date (optional)</label>
						<input type="date" name="hireDate" className="w-full border rounded-md px-3 py-2 bg-background" />
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-sm">Job title (optional)</label>
						<input type="text" name="jobTitle" placeholder="e.g., CEO" className="w-full border rounded-md px-3 py-2 bg-background" />
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-sm">Employee number (optional)</label>
						<input type="text" name="employeeNumber" placeholder="Auto-generated if empty" className="w-full border rounded-md px-3 py-2 bg-background" />
					</div>
				</div>

				<TermsField />
			</AuthForm>
		</>
	)
}
