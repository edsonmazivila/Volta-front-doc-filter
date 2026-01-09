'use client'


import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui'
import { Trans } from '@lingui/react/macro'

export default function RegistrationSuccessPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const organizationName = searchParams.get('org')
	const companyName = searchParams.get('company')
	const adminEmail = searchParams.get('email')


	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
			<div className="w-full max-w-2xl">
				<div className="glass rounded-xl p-8 md:p-12">
					{/* Success Icon */}
					<div className="flex justify-center mb-6">
						<div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
							<svg
								className="w-10 h-10 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
					</div>

					{/* Title */}
					<h1 className="text-3xl font-bold text-center text-foreground mb-4">
						<Trans>Organization Registered Successfully!</Trans>
					</h1>

					{/* Info Alert */}
					<div className="mb-8 p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
						<div className="flex items-start gap-3">
							<svg
								className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-foreground mb-2">
									<Trans>Awaiting Platform Owner Approval</Trans>
								</h3>
								<p className="text-sm text-muted-foreground mb-4">
									<Trans>
										Your organization has been registered and is pending approval from a Platform Owner.
										You will receive an email notification once your organization is approved.
									</Trans>
								</p>
								<p className="text-sm text-muted-foreground">
									<Trans>
										Your organization registration has been received and is currently under review by our team.
										This security check ensures the integrity of our platform.
									</Trans>
								</p>
								<p className="text-sm text-muted-foreground">
									<Trans>
										You will receive an email notification as soon as your account is approved.
										Once approved, you will be able to sign in and access your dashboard.
									</Trans>
								</p>
							</div>
						</div>
					</div>

					{/* What's Next */}
					<div className="mb-8">
						<h2 className="text-xl font-semibold text-foreground mb-4">
							<Trans>What happens next?</Trans>
						</h2>
						<ol className="space-y-3">
							<li className="flex items-start gap-3">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
									1
								</div>
								<div>
									<h4 className="font-medium text-foreground">
										<Trans>Review Process</Trans>
									</h4>
									<p className="text-sm text-muted-foreground">
										<Trans>A Platform Owner will review your organization registration</Trans>
									</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
									2
								</div>
								<div>
									<h4 className="font-medium text-foreground">
										<Trans>Email Notification</Trans>
									</h4>
									<p className="text-sm text-muted-foreground">
										<Trans>You&apos;ll receive an email when your organization is approved or if additional information is needed</Trans>
									</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
									3
								</div>
								<div>
									<h4 className="font-medium text-foreground">
										<Trans>Access Granted</Trans>
									</h4>
									<p className="text-sm text-muted-foreground">
										<Trans>Once approved, log in with your credentials to access the platform</Trans>
									</p>
								</div>
							</li>
						</ol>
					</div>

					{/* Registration Details */}
					{(organizationName || companyName || adminEmail) && (
						<div className="mb-8 p-6 rounded-lg bg-muted/50 border border-border">
							<h3 className="text-lg font-semibold text-foreground mb-4">
								<Trans>Registration Details</Trans>
							</h3>
							<dl className="space-y-2">
								{organizationName && (
									<div className="flex justify-between items-center">
										<dt className="text-sm text-muted-foreground">
											<Trans>Organization Name</Trans>
										</dt>
										<dd className="text-sm font-medium text-foreground">
											{organizationName}
										</dd>
									</div>
								)}
								{companyName && (
									<div className="flex justify-between items-center">
										<dt className="text-sm text-muted-foreground">
											<Trans>First Company</Trans>
										</dt>
										<dd className="text-sm font-medium text-foreground">
											{companyName}
										</dd>
									</div>
								)}
								{adminEmail && (
									<div className="flex justify-between items-center">
										<dt className="text-sm text-muted-foreground">
											<Trans>Admin Email</Trans>
										</dt>
										<dd className="text-sm font-medium text-foreground">
											{adminEmail}
										</dd>
									</div>
								)}
							</dl>
						</div>
					)}

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-3">
						<Button
							variant="primaryGradient"
							className="flex-1 py-3"
							onClick={() => router.push('/login')}
						>
							<Trans>Go to Login</Trans>
						</Button>
						<Button
							variant="outline"
							className="flex-1 py-3"
							onClick={() => router.push('/')}
						>
							<Trans>Back to Home</Trans>
						</Button>
					</div>

				</div>
			</div>
		</div>
	)
}
