'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui'
import { signupAction } from '@/lib/auth/actions'
import { PasswordInput } from '@/components/auth/password-input'

export function SignupForm() {
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()

	if (success) {
		return (
			<div className="w-full max-w-md mx-auto">
				<div className="glass rounded-xl p-8 text-center">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
						<svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h1 className="text-xl font-bold text-foreground mb-2">Account Created!</h1>
					<p className="text-muted-foreground text-sm">
						Your account has been created successfully. Redirecting to login...
					</p>
				</div>
			</div>
		)
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsSubmitting(true)
		setError(null)
		
		const formData = new FormData(e.currentTarget)
		const result = await signupAction(undefined, formData)
		
		if ('errors' in result) {
			const formErrors = (result.errors as Record<string, string[] | undefined>)._form
			if (formErrors && formErrors.length) {
				setError(formErrors[0])
			} else {
				const firstError = Object.values(result.errors).flat().find(Boolean)
				setError(firstError || 'Validation failed')
			}
			setIsSubmitting(false)
			return
		}
		
		setSuccess(true)
		setTimeout(() => {
			router.push('/login?message=Account created successfully! Please sign in.')
		}, 2000)
	}

	return (
		<div className="w-full max-w-2xl mx-auto">
			<div className="glass rounded-xl p-8">
				<div className="mb-6 text-center">
					<h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
					<p className="text-muted-foreground text-sm">
						Register your company and admin account
					</p>
				</div>

				{error && (
					<div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
						<p className="text-sm text-red-700 dark:text-red-400">{error}</p>
					</div>
				)}
				
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Admin Details */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">Admin Details</h3>
						<div className="flex flex-col gap-1">
							<label className="text-sm text-foreground">Full Name *</label>
							<Input
								name="full_name"
								type="text"
								placeholder="John Doe"
								required
								disabled={isSubmitting}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-sm text-foreground">Email *</label>
							<Input
								name="email"
								type="email"
								placeholder="admin@company.com"
								required
								disabled={isSubmitting}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-sm text-foreground">Password *</label>
							<PasswordInput
								name="password"
								placeholder="Create a strong password"
								required
								disabled={isSubmitting}
							/>
							<p className="text-xs text-muted-foreground">Minimum 8 characters</p>
						</div>
					</div>

					{/* Company Details */}
					<div className="space-y-4 pt-4 border-t border-border">
						<h3 className="text-lg font-semibold text-foreground">Company Details</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col gap-1">
								<label className="text-sm text-foreground">Company Name *</label>
								<Input
									name="company_name"
									type="text"
									placeholder="Acme Inc"
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-sm text-foreground">Legal Name *</label>
								<Input
									name="legal_name"
									type="text"
									placeholder="Acme Inc."
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-sm text-foreground">Tax ID *</label>
								<Input
									name="tax_id"
									type="text"
									placeholder="XX123456789"
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-sm text-foreground">Country *</label>
								<Input
									name="country"
									type="text"
									placeholder="US"
									required
									disabled={isSubmitting}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-sm text-foreground">Address *</label>
							<Input
								name="address_line1"
								type="text"
								placeholder="123 Main St"
								required
								disabled={isSubmitting}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="flex flex-col gap-1">
								<label className="text-sm text-foreground">City *</label>
								<Input
									name="city"
									type="text"
									placeholder="New York"
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-sm text-foreground">State *</label>
								<Input
									name="state"
									type="text"
									placeholder="NY"
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-sm text-foreground">Postal Code *</label>
								<Input
									name="postal_code"
									type="text"
									placeholder="10001"
									required
									disabled={isSubmitting}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col gap-1">
								<label className="text-sm text-foreground">Company Phone *</label>
								<Input
									name="company_phone"
									type="tel"
									placeholder="+1 (555) 000-0000"
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-sm text-foreground">Company Email *</label>
								<Input
									name="company_email"
									type="email"
									placeholder="contact@company.com"
									required
									disabled={isSubmitting}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-sm text-foreground">Website (optional)</label>
							<Input
								name="website"
								type="url"
								placeholder="https://company.com"
								disabled={isSubmitting}
							/>
						</div>
					</div>

					{/* Terms */}
					<div className="flex items-start gap-2 pt-4">
						<input
							type="checkbox"
							name="termsAccepted"
							id="termsAccepted"
							required
							disabled={isSubmitting}
							className="mt-1"
						/>
						<label htmlFor="termsAccepted" className="text-sm text-foreground">
							I agree to the Terms of Service and Privacy Policy
						</label>
					</div>

					<Button
						type="submit"
						variant="primaryGradient"
						className="w-full py-3 text-base font-semibold cursor-pointer"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Creating account...' : 'Create account'}
					</Button>
				</form>
			</div>
		</div>
	)
}
