'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui'
import { signupAction } from '@/lib/auth/actions'
import { PasswordInput } from '@/components/auth/password-input'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { msg } from '@lingui/core/macro'

export function SignupForm() {
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
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
					<h1 className="text-xl font-bold text-foreground mb-2"><Trans>Account Created!</Trans></h1>
					<p className="text-muted-foreground text-sm">
						<Trans>Your account has been created successfully. Redirecting to login...</Trans>
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
					<h1 className="text-2xl font-bold text-foreground mb-2"><Trans>Create your account</Trans></h1>
					<p className="text-muted-foreground text-sm">
						<Trans>Register your company and admin account</Trans>
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
						<h3 className="text-lg font-semibold text-foreground"><Trans>Admin Details</Trans></h3>
						<div className="flex flex-col gap-1">
							<label htmlFor="full_name" className="text-sm text-foreground"><Trans>Full Name</Trans> *</label>
							<Input
								id="full_name"
								name="full_name"
								type="text"
								placeholder={i18n._(msg`John Doe`)}
								required
								disabled={isSubmitting}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label htmlFor="email" className="text-sm text-foreground"><Trans>Email</Trans> *</label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="admin@company.com"
								required
								disabled={isSubmitting}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label htmlFor="password" className="text-sm text-foreground"><Trans>Password</Trans> *</label>
							<PasswordInput
								id="password"
								name="password"
								placeholder={i18n._(msg`Create a strong password`)}
								required
								disabled={isSubmitting}
							/>
							<p className="text-xs text-muted-foreground"><Trans>Minimum 8 characters</Trans></p>
						</div>
					</div>

					{/* Company Details */}
					<div className="space-y-4 pt-4 border-t border-border">
						<h3 className="text-lg font-semibold text-foreground"><Trans>Company Details</Trans></h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col gap-1">
								<label htmlFor="company_name" className="text-sm text-foreground"><Trans>Company Name</Trans> *</label>
								<Input
									id="company_name"
									name="company_name"
									type="text"
									placeholder={i18n._(msg`Acme Inc`)}
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label htmlFor="legal_name" className="text-sm text-foreground"><Trans>Legal Name</Trans> *</label>
								<Input
									id="legal_name"
									name="legal_name"
									type="text"
									placeholder={i18n._(msg`Acme Inc.`)}
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label htmlFor="tax_id" className="text-sm text-foreground"><Trans>Tax ID</Trans> *</label>
								<Input
									id="tax_id"
									name="tax_id"
									type="text"
									placeholder="XX123456789"
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label htmlFor="country" className="text-sm text-foreground"><Trans>Country</Trans> *</label>
								<Input
									id="country"
									name="country"
									type="text"
									placeholder="PT"
									required
									disabled={isSubmitting}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<label htmlFor="address_line1" className="text-sm text-foreground"><Trans>Address</Trans> *</label>
							<Input
								id="address_line1"
								name="address_line1"
								type="text"
								placeholder={i18n._(msg`123 Main St`)}
								required
								disabled={isSubmitting}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="flex flex-col gap-1">
								<label htmlFor="city" className="text-sm text-foreground"><Trans>City</Trans> *</label>
								<Input
									id="city"
									name="city"
									type="text"
									placeholder={i18n._(msg`Lisbon`)}
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label htmlFor="state" className="text-sm text-foreground"><Trans>State/District</Trans> *</label>
								<Input
									id="state"
									name="state"
									type="text"
									placeholder={i18n._(msg`Lisboa`)}
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label htmlFor="postal_code" className="text-sm text-foreground"><Trans>Postal Code</Trans> *</label>
								<Input
									id="postal_code"
									name="postal_code"
									type="text"
									placeholder="1000-001"
									required
									disabled={isSubmitting}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col gap-1">
								<label htmlFor="company_phone" className="text-sm text-foreground"><Trans>Company Phone</Trans> *</label>
								<Input
									id="company_phone"
									name="company_phone"
									type="tel"
									placeholder="+351 210 000 000"
									required
									disabled={isSubmitting}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label htmlFor="company_email" className="text-sm text-foreground"><Trans>Company Email</Trans> *</label>
								<Input
									id="company_email"
									name="company_email"
									type="email"
									placeholder="contact@company.com"
									required
									disabled={isSubmitting}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<label htmlFor="website" className="text-sm text-foreground"><Trans>Website (optional)</Trans></label>
							<Input
								id="website"
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
							<Trans>I agree to the Terms of Service and Privacy Policy</Trans>
						</label>
					</div>

					<Button
						type="submit"
						variant="primaryGradient"
						className="w-full py-3 text-base font-semibold cursor-pointer"
						disabled={isSubmitting}
					>
						{isSubmitting ? <Trans>Creating account...</Trans> : <Trans>Create account</Trans>}
					</Button>
				</form>
			</div>
		</div>
	)
}
