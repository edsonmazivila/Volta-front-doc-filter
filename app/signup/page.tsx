import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { verifySession } from "@/lib/auth/dal"
import { SignupForm } from "./signup-form"

export default async function SignupPage() {
	// Redirect if already authenticated
	const session = await verifySession()
	const user = session?.user
	if (user) {
		redirect('/dashboard')
	}

	return (
		<main className="min-h-dvh app-background flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				<Suspense fallback={<div>Loading...</div>}>
					<SignupForm />
				</Suspense>
				
				<div className="mt-6 text-center">
					<p className="text-sm text-neutral-400">
						Already have an account?{' '}
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
