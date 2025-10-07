'use client'

import type { PayrollRunItem } from '@/lib/services/payroll'

interface PayrollChartProps {
	data: PayrollRunItem[]
	className?: string
}

export function PayrollChart({ data, className = '' }: PayrollChartProps) {
	// Take last 6 payroll runs and reverse to show chronologically
	// If no data, create placeholder entries
	const recentRuns = data.length > 0 
		? data.slice(0, 6).reverse()
		: [
			{ id: '1', periodStart: '', periodEnd: '', grossAmount: 0, netAmount: 0 },
			{ id: '2', periodStart: '', periodEnd: '', grossAmount: 0, netAmount: 0 },
			{ id: '3', periodStart: '', periodEnd: '', grossAmount: 0, netAmount: 0 },
			{ id: '4', periodStart: '', periodEnd: '', grossAmount: 0, netAmount: 0 },
			{ id: '5', periodStart: '', periodEnd: '', grossAmount: 0, netAmount: 0 },
			{ id: '6', periodStart: '', periodEnd: '', grossAmount: 0, netAmount: 0 },
		]

	// Calculate max value for scaling
	const maxGross = Math.max(...recentRuns.map(r => r.grossAmount || 0), 1) // At least 1 to avoid division by 0
	const maxNet = Math.max(...recentRuns.map(r => r.netAmount || 0), 1)
	const maxValue = Math.max(maxGross, maxNet)
	
	const hasData = data.length > 0 && maxValue > 1

	const formatCurrency = (amount: number) => {
		if (amount >= 1000000) {
			return `$${(amount / 1000000).toFixed(1)}M`
		}
		if (amount >= 1000) {
			return `$${(amount / 1000).toFixed(1)}K`
		}
		return `$${amount.toFixed(0)}`
	}

	const formatDate = (dateStr: string, index: number) => {
		if (!dateStr) {
			// Show placeholder labels like "Run 1", "Run 2", etc.
			return `Run ${index + 1}`
		}
		const date = new Date(dateStr)
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
	}

	return (
		<div className={`flex flex-col ${className}`}>
			{/* No Data Message */}
			{!hasData && (
				<div className='absolute inset-0 flex items-center justify-center pointer-events-none z-10'>
					<div className='bg-background/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2'>
						<p className='text-sm text-muted-foreground'>No payroll data available yet</p>
					</div>
				</div>
			)}

			{/* Chart Area */}
			<div className='flex-1 flex items-end gap-2 px-4 pb-4'>
				{recentRuns.map((run, index) => {
					const grossHeight = ((run.grossAmount || 0) / maxValue) * 100
					const netHeight = ((run.netAmount || 0) / maxValue) * 100
					
					return (
						<div key={run.id || index} className='flex-1 flex flex-col items-center gap-2'>
							{/* Bars Container */}
							<div className='w-full flex items-end justify-center gap-1 h-48'>
								{/* Gross Amount Bar */}
								<div className='flex-1 flex flex-col items-center justify-end'>
									<div
										className={`w-full rounded-t transition-all relative group ${hasData ? 'bg-blue-500/80 hover:bg-blue-500 cursor-pointer' : 'bg-blue-500/20'}`}
										style={{ height: `${grossHeight}%`, minHeight: grossHeight > 0 ? '4px' : '0' }}
									>
										{/* Tooltip - only show if has data */}
										{hasData && (
											<div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
												<div className='bg-popover border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap'>
													<p className='text-xs font-medium'>Gross</p>
													<p className='text-sm font-bold'>{formatCurrency(run.grossAmount || 0)}</p>
												</div>
											</div>
										)}
									</div>
								</div>
								
								{/* Net Amount Bar */}
								<div className='flex-1 flex flex-col items-center justify-end'>
									<div
										className={`w-full rounded-t transition-all relative group ${hasData ? 'bg-green-500/80 hover:bg-green-500 cursor-pointer' : 'bg-green-500/20'}`}
										style={{ height: `${netHeight}%`, minHeight: netHeight > 0 ? '4px' : '0' }}
									>
										{/* Tooltip - only show if has data */}
										{hasData && (
											<div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10'>
												<div className='bg-popover border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap'>
													<p className='text-xs font-medium'>Net</p>
													<p className='text-sm font-bold'>{formatCurrency(run.netAmount || 0)}</p>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
							
							{/* Label */}
							<div className='text-center'>
								<p className='text-xs text-muted-foreground'>
									{formatDate(run.periodEnd || run.periodStart, index)}
								</p>
							</div>
						</div>
					)
				})}
			</div>

			{/* Legend */}
			<div className='flex items-center justify-center gap-6 px-4 pb-4 pt-2 border-t border-border/50'>
				<div className='flex items-center gap-2'>
					<div className='w-3 h-3 rounded bg-blue-500/80' />
					<span className='text-xs text-muted-foreground'>Gross Pay</span>
				</div>
				<div className='flex items-center gap-2'>
					<div className='w-3 h-3 rounded bg-green-500/80' />
					<span className='text-xs text-muted-foreground'>Net Pay</span>
				</div>
			</div>

			{/* Summary */}
			<div className='px-4 pb-4'>
				<div className='grid grid-cols-2 gap-4 text-center'>
					<div>
						<p className='text-xs text-muted-foreground mb-1'>Total Gross</p>
						<p className={`text-lg font-bold ${hasData ? 'text-blue-500' : 'text-muted-foreground'}`}>
							{formatCurrency(recentRuns.reduce((sum, r) => sum + (r.grossAmount || 0), 0))}
						</p>
					</div>
					<div>
						<p className='text-xs text-muted-foreground mb-1'>Total Net</p>
						<p className={`text-lg font-bold ${hasData ? 'text-green-500' : 'text-muted-foreground'}`}>
							{formatCurrency(recentRuns.reduce((sum, r) => sum + (r.netAmount || 0), 0))}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

