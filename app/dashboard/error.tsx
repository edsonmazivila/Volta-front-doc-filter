'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	const router = useRouter()

	useEffect(() => {
		// Log the error for debugging
		console.error('Dashboard error:', error)

		// Check if this is likely a session/auth error
		const errorMessage = error.message?.toLowerCase() || ''
		const isAuthError =
			errorMessage.includes('unauthorized') ||
			errorMessage.includes('unauthenticated') ||
			errorMessage.includes('session') ||
			errorMessage.includes('401') ||
			errorMessage.includes('403')

		if (isAuthError) {
			// Redirect to login on auth errors
			router.push('/login?session_expired=true')
		}
	}, [error, router])

	const handleRetry = () => {
		reset()
	}

	const handleLogin = () => {
		router.push('/login')
	}

	return (
		<div className='min-h-dvh flex items-center justify-center bg-background'>
			<div className='text-center space-y-4 p-8 max-w-md'>
				<div className='w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center'>
					<svg
						className='w-8 h-8 text-destructive'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
						/>
					</svg>
				</div>
				<h2 className='text-xl font-semibold text-foreground'>
					Something went wrong
				</h2>
				<p className='text-sm text-muted-foreground'>
					An error occurred while loading this page. This may be due to a session timeout or a temporary issue.
				</p>
				<div className='flex gap-3 justify-center pt-2'>
					<Button variant='outline' onClick={handleRetry}>
						Try again
					</Button>
					<Button onClick={handleLogin}>
						Go to Login
					</Button>
				</div>
				{error.digest && (
					<p className='text-xs text-muted-foreground mt-4'>
						Error ID: {error.digest}
					</p>
				)}
			</div>
		</div>
	)
}
