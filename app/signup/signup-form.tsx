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
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const { i18n } = useLingui()

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
		
		// Success - redirect to success page with organization details
		const companyName = formData.get('company_name') as string
		const email = formData.get('email') as string
		
		const params = new URLSearchParams({
			company: companyName,
			email: email
		})
		
		router.push(`/signup/success?${params.toString()}`)
	}

	return (
		<div className="w-full max-w-2xl mx-auto">
			<div className="glass rounded-xl p-8">
				<div className="mb-6 text-center">
					<h1 className="text-2xl font-bold text-foreground mb-2"><Trans>Create your organization</Trans></h1>
					<p className="text-muted-foreground text-sm">
						<Trans>Register your organization and first company</Trans>
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
						<h3 className="text-lg font-semibold text-foreground"><Trans>Administrator Information</Trans></h3>
						<p className="text-sm text-muted-foreground">
							<Trans>You will be the Organization Admin with access to all companies</Trans>
						</p>
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
						<h3 className="text-lg font-semibold text-foreground"><Trans>First Company Information</Trans></h3>
						<p className="text-sm text-muted-foreground">
							<Trans>You can add more companies later from your dashboard</Trans>
						</p>
						
						<div className="flex flex-col gap-1">
							<label htmlFor="company_name" className="text-sm text-foreground"><Trans>Company Name</Trans> *</label>
							<Input
								id="company_name"
								name="company_name"
								type="text"
								placeholder={i18n._(msg`Acme Corporation`)}
								required
								disabled={isSubmitting}
							/>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col gap-1">
								<label htmlFor="business_email" className="text-sm text-foreground"><Trans>Business Email</Trans> *</label>
								<Input
									id="business_email"
									name="business_email"
									type="email"
									placeholder="info@company.com"
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
									maxLength={2}
									required
									disabled={isSubmitting}
								/>
								<p className="text-xs text-muted-foreground"><Trans>2-letter code (e.g., US, PT, UK)</Trans></p>
							</div>
						</div>

						{/* Optional Fields */}
						<details className="group">
							<summary className="cursor-pointer text-sm font-medium text-foreground mb-3">
								<Trans>Additional Information (Optional)</Trans>
							</summary>
							<div className="space-y-4 pl-4 border-l-2 border-border">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="flex flex-col gap-1">
										<label htmlFor="legal_name" className="text-sm text-foreground"><Trans>Legal Name</Trans></label>
										<Input
											id="legal_name"
											name="legal_name"
											type="text"
											placeholder={i18n._(msg`Acme Inc.`)}
											disabled={isSubmitting}
										/>
									</div>
									<div className="flex flex-col gap-1">
										<label htmlFor="tax_id" className="text-sm text-foreground"><Trans>Tax ID</Trans></label>
										<Input
											id="tax_id"
											name="tax_id"
											type="text"
											placeholder="XX123456789"
											disabled={isSubmitting}
										/>
									</div>
								</div>

								<div className="flex flex-col gap-1">
									<label htmlFor="address_line1" className="text-sm text-foreground"><Trans>Address</Trans></label>
									<Input
										id="address_line1"
										name="address_line1"
										type="text"
										placeholder={i18n._(msg`123 Main St`)}
										disabled={isSubmitting}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="flex flex-col gap-1">
										<label htmlFor="city" className="text-sm text-foreground"><Trans>City</Trans></label>
										<Input
											id="city"
											name="city"
											type="text"
											placeholder={i18n._(msg`Lisbon`)}
											disabled={isSubmitting}
										/>
									</div>
									<div className="flex flex-col gap-1">
										<label htmlFor="state" className="text-sm text-foreground"><Trans>State/District</Trans></label>
										<Input
											id="state"
											name="state"
											type="text"
											placeholder={i18n._(msg`Lisboa`)}
											disabled={isSubmitting}
										/>
									</div>
									<div className="flex flex-col gap-1">
										<label htmlFor="postal_code" className="text-sm text-foreground"><Trans>Postal Code</Trans></label>
										<Input
											id="postal_code"
											name="postal_code"
											type="text"
											placeholder="1000-001"
											disabled={isSubmitting}
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="flex flex-col gap-1">
										<label htmlFor="company_phone" className="text-sm text-foreground"><Trans>Company Phone</Trans></label>
										<Input
											id="company_phone"
											name="company_phone"
											type="tel"
											placeholder="+351 210 000 000"
											disabled={isSubmitting}
										/>
									</div>
									<div className="flex flex-col gap-1">
										<label htmlFor="website" className="text-sm text-foreground"><Trans>Website</Trans></label>
										<Input
											id="website"
											name="website"
											type="url"
											placeholder="https://company.com"
											disabled={isSubmitting}
										/>
									</div>
								</div>
							</div>
						</details>
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
							<Trans>I agree to the Terms of Service and Privacy Policy</Trans> *
						</label>
					</div>

					<Button
						type="submit"
						variant="primaryGradient"
						className="w-full py-3 text-base font-semibold cursor-pointer"
						disabled={isSubmitting}
					>
						{isSubmitting ? <Trans>Creating organization...</Trans> : <Trans>Create Organization</Trans>}
					</Button>
				</form>
			</div>
		</div>
	)
}
