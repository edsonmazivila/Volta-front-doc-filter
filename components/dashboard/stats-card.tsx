import { ReactNode } from 'react'
import { Card, Stat } from '@/components/dashboard/card'

interface StatsCardProps {
	label: string
	value: ReactNode
	trend?: ReactNode
	className?: string
}

export function StatsCard({ label, value, trend, className = '' }: StatsCardProps) {
	return (
		<Card className={className}>
			<Stat label={label} value={value} trend={trend} />
		</Card>
	)
}


