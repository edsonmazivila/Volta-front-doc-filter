import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EmployeeNotFound() {
	return (
		<div className="min-h-dvh flex app-background">
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold">Employee Not Found</h1>
					<p className="text-muted-foreground">
						The employee you are looking for does not exist or has been removed.
					</p>
					<Button asChild>
						<Link href="/dashboard/employees">
							Back to Employees
						</Link>
					</Button>
				</div>
			</div>
		</div>
	)
}
