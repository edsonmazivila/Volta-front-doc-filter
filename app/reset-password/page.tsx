import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { verifySession } from "@/lib/auth/dal"
import { ResetPasswordForm } from "./reset-password-form"

interface ResetPasswordPageProps {
	searchParams: {
		token?: string
	}
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
	// Redirect if already authenticated
	const session = await verifySession()
	const user = session?.user
	if (user) {
		redirect('/dashboard')
	}

	// Redirect if no token provided
	if (!searchParams.token) {
		redirect('/forgot-password')
	}

	return (
		<main className="min-h-dvh app-background flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<Suspense fallback={<div>Loading...</div>}>
					<ResetPasswordForm token={searchParams.token} />
				</Suspense>
				
				<div className="mt-6 text-center">
					<p className="text-sm text-neutral-400">
						Remember your password?{' '}
						<Link 
							href="/login" 
							className="text-blue-400 hover:text-blue-300 font-medium underline"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</main>
	)
}
