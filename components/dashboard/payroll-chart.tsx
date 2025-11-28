'use client'

import type { PayrollRunItem } from '@/lib/services/payroll'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface PayrollChartProps {
	data: PayrollRunItem[]
	className?: string
}

export function PayrollChart({ data, className = '' }: PayrollChartProps) {
	const { i18n } = useLingui()
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

	// Calculate max value for scaling (at least 1 to avoid division by 0)
	const maxGross = Math.max(...recentRuns.map(r => r.grossAmount || 0), 1)
	const maxNet = Math.max(...recentRuns.map(r => r.netAmount || 0), 1)
	const maxValue = Math.max(maxGross, maxNet)

	const getNiceMaxValue = (value: number): number => {
		if (value <= 0) return 1
		const exponent = Math.floor(Math.log10(value))
		const fraction = value / Math.pow(10, exponent)

		let niceFraction: number
		if (fraction <= 1) niceFraction = 1
		else if (fraction <= 2) niceFraction = 2
		else if (fraction <= 5) niceFraction = 5
		else niceFraction = 10

		return niceFraction * Math.pow(10, exponent)
	}

	const scaleMax = getNiceMaxValue(maxValue)
	
	const hasData = data.length > 0 && maxValue > 1
	const tickCount = 4
	const ticks = Array.from({ length: tickCount + 1 }, (_, index) => {
		const ratio = index / tickCount
		return scaleMax - ratio * scaleMax
	})

	const formatCurrency = (amount: number) => {
		if (amount >= 1000000) {
			return `$${(amount / 1000000).toFixed(1)}M`
		}
		if (amount >= 1000) {
			return `$${(amount / 1000).toFixed(1)}K`
		}
		return `$${amount.toFixed(0)}`
	}

	const formatAxisLabel = (amount: number) => {
		if (amount <= 0) return '$0'
		if (amount >= 1000000) {
			return `$${(amount / 1000000).toFixed(1)}M`
		}
		if (amount >= 1000) {
			return `$${(amount / 1000).toFixed(0)}K`
		}
		return `$${amount.toFixed(0)}`
	}

	const formatDate = (dateStr: string, index: number) => {
		if (!dateStr) {
			// Show placeholder labels like "Run 1", "Run 2", etc.
			return i18n._(msg`Run ${index + 1}`)
		}
		const date = new Date(dateStr)
		return date.toLocaleDateString(i18n.locale, { month: 'short', day: 'numeric' })
	}

	return (
		<div className={`flex flex-col ${className}`}>
			{/* No Data Message */}
			{!hasData && (
				<div className='absolute inset-0 flex items-center justify-center pointer-events-none z-10'>
					<div className='bg-background/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2'>
						<p className='text-sm text-muted-foreground'>{i18n._(msg`No payroll data available yet`)}</p>
					</div>
				</div>
			)}

			{/* Chart Area */}
			<div className='flex-1 flex gap-3 px-4 pb-4'>
				{/* Y Axis */}
				<div className='relative h-48 flex flex-col justify-between py-2 text-xs text-muted-foreground'>
					{ticks.map((value, index) => (
						<div key={index} className='flex items-center gap-2'>
							<span>{formatAxisLabel(Math.max(value, 0))}</span>
						</div>
					))}
				</div>

				{/* Bars */}
				<div className='flex-1 relative flex items-end gap-2'>
					{/* Grid Lines */}
					<div className='absolute inset-0 flex flex-col justify-between pointer-events-none select-none'>
						{ticks.map((_, index) => (
							<div key={index} className='w-full border-t border-border/40' />
						))}
					</div>

					{recentRuns.map((run, index) => {
						const chartHeight = 192 // h-48 = 192px
						const grossHeightPx = Math.min(((run.grossAmount || 0) / scaleMax) * chartHeight, chartHeight)
						const netHeightPx = Math.min(((run.netAmount || 0) / scaleMax) * chartHeight, chartHeight)
					
					return (
							<div key={run.id || index} className='relative flex-1 flex flex-col items-center gap-2'>
								{/* Bars Container */}
								<div className='w-full flex items-end justify-center gap-1 h-48 pt-2 pb-2'>
								{/* Gross Amount Bar */}
								<div className='flex-1 flex flex-col items-center justify-end'>
									<div
										className={`w-full rounded-t transition-all relative group ${hasData ? 'bg-blue-500/80 hover:bg-blue-500 cursor-pointer' : 'bg-blue-500/20'}`}
										style={{ height: `${grossHeightPx}px`, minHeight: grossHeightPx > 0 ? '4px' : '0' }}
									>
											{hasData && grossHeightPx > 0 && (
												<span className='absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-2 text-[10px] font-medium text-blue-300 whitespace-nowrap'>
													{formatCurrency(run.grossAmount || 0)}
												</span>
											)}
										{/* Tooltip - only show if has data */}
										{hasData && (
											<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20'>
												<div className='bg-popover border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap'>
													<p className='text-xs font-medium'>{i18n._(msg`Gross`)}</p>
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
										style={{ height: `${netHeightPx}px`, minHeight: netHeightPx > 0 ? '4px' : '0' }}
									>
										{hasData && netHeightPx > 0 && (
											<span className='absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-2 text-[10px] font-medium text-green-300 whitespace-nowrap'>
												{formatCurrency(run.netAmount || 0)}
											</span>
										)}
										{/* Tooltip - only show if has data */}
										{hasData && (
											<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20'>
												<div className='bg-popover border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap'>
													<p className='text-xs font-medium'>{i18n._(msg`Net`)}</p>
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
			</div>

			{/* Legend */}
			<div className='flex items-center justify-center gap-6 px-4 pb-4 pt-2 border-t border-border/50'>
				<div className='flex items-center gap-2'>
					<div className='w-3 h-3 rounded bg-blue-500/80' />
					<span className='text-xs text-muted-foreground'>{i18n._(msg`Gross Pay`)}</span>
				</div>
				<div className='flex items-center gap-2'>
					<div className='w-3 h-3 rounded bg-green-500/80' />
					<span className='text-xs text-muted-foreground'>{i18n._(msg`Net Pay`)}</span>
				</div>
			</div>

			{/* Summary */}
			<div className='px-4 pb-4'>
				<div className='grid grid-cols-2 gap-4 text-center'>
					<div>
						<p className='text-xs text-muted-foreground mb-1'>{i18n._(msg`Total Gross`)}</p>
						<p className={`text-lg font-bold ${hasData ? 'text-blue-500' : 'text-muted-foreground'}`}>
							{formatCurrency(recentRuns.reduce((sum, r) => sum + (r.grossAmount || 0), 0))}
						</p>
					</div>
					<div>
						<p className='text-xs text-muted-foreground mb-1'>{i18n._(msg`Total Net`)}</p>
						<p className={`text-lg font-bold ${hasData ? 'text-green-500' : 'text-muted-foreground'}`}>
							{formatCurrency(recentRuns.reduce((sum, r) => sum + (r.netAmount || 0), 0))}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

