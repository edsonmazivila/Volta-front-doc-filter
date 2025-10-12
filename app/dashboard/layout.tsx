import { Sidebar } from '@/components/dashboard/sidebar'
import { ReactNode } from 'react'

export default function DashboardLayout({
	children,
}: {
	children: ReactNode
}) {
	return (
		<div className='min-h-dvh flex app-background'>
			<Sidebar />
			<main className='flex-1 overflow-hidden flex flex-col'>
				{children}
			</main>
		</div>
	)
}

