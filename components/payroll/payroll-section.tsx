'use client'
import { useMemo, useState } from 'react'
import { Button, Skeleton } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToastHelpers } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { PayrollService } from '@/lib/services/payroll'

interface PayrollRunItem {
	id: string
	periodStart: string
	periodEnd: string
	payDate?: string
	status?: string
	totalHours?: number
	grossAmount?: number
	netAmount?: number
	employeesCount?: number
}

interface PayrollSectionProps {
	runs: PayrollRunItem[]
}

export function PayrollSection({ runs }: PayrollSectionProps) {
	const router = useRouter()
	const toast = useToastHelpers()
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [lastRunId, setLastRunId] = useState<string | null>(null)


	async function handleProcess() {
		if (!startDate || !endDate) { toast.error('Select start and end dates'); return }
		setIsSubmitting(true)
		try {
			const endDateObj = new Date(endDate)
			const payDate = new Date(endDateObj)
			payDate.setDate(endDateObj.getDate() + (5 + 7 - endDateObj.getDay()) % 7)
			const result: any = await PayrollService.process({
				pay_period_start: startDate,
				pay_period_end: endDate,
				pay_date: payDate.toISOString().slice(0, 10),
				pay_frequency: 'biweekly',
			})
			const id = (result?.payroll_run?.id ?? result?.id ?? result?.run_id ?? null) as string | null
			if (id) setLastRunId(id)
			toast.success('Payroll calculated')
			router.refresh()
		} catch {
			toast.error('Failed to calculate payroll')
		} finally {
			setIsSubmitting(false)
		}
	}

	async function handleRun() {
		const id = lastRunId || runs[0]?.id
		if (!id) { toast.error('No calculated payroll to run'); return }
		try {
			await PayrollService.run(id)
			toast.success('Payroll executed')
			router.refresh()
		} catch {
			toast.error('Failed to run payroll')
		}
	}

	async function handleExport(type: 'excel' | 'bci') {
		const id = lastRunId || runs[0]?.id
		if (!id) { toast.error('No payroll run selected'); return }
		try {
			if (type === 'excel') await PayrollService.downloadExcel(id)
			if (type === 'bci') await PayrollService.downloadBCI(id)
			toast.success('Export started')
		} catch {
			toast.error('Export failed')
		}
	}

	async function handleRowExport(runId: string, type: 'excel' | 'bci') {
		try {
			if (type === 'excel') await PayrollService.downloadExcel(runId)
			if (type === 'bci') await PayrollService.downloadBCI(runId)
			toast.success('Export started')
		} catch {
			toast.error('Export failed')
		}
	}

	return (
		<div className='grid gap-4'>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
				<div className='flex flex-col gap-1'>
					<label className='text-sm'>Period start</label>
					<input type='date' className='w-full border rounded-md px-3 py-2 bg-background' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
				</div>
				<div className='flex flex-col gap-1'>
					<label className='text-sm'>Period end</label>
					<input type='date' className='w-full border rounded-md px-3 py-2 bg-background' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
				</div>
				<div className='flex items-center flex-wrap gap-2 justify-end w-full'>
					<Button onClick={handleProcess} disabled={isSubmitting}>{isSubmitting ? 'Processing…' : 'Calculate'}</Button>
					<Button variant='secondary' onClick={handleRun}>Run</Button>
					<Button variant='outline' onClick={() => handleExport('excel')}>Export Excel</Button>
					<Button variant='outline' onClick={() => handleExport('bci')}>Export BCI</Button>
				</div>
			</div>

			<div className='flex items-center justify-between gap-3 flex-wrap'>
				<h2 className='text-sm font-medium'>Recent Runs</h2>
			</div>

			<div className='grid gap-2'>
				{runs.length ? (
					<div className='w-full overflow-x-auto'>
						<table className='w-full text-sm'>
							<thead className='text-left text-muted-foreground'>
								<tr>
									<th className='py-2 px-2'>Pay Date</th>
									<th className='py-2 px-2'>Employees</th>
									<th className='py-2 px-2'>Gross Pay</th>
									<th className='py-2 px-2'>Net Pay</th>
									<th className='py-2 px-2'>Status</th>
									<th className='py-2 px-2'>Actions</th>
								</tr>
							</thead>
							<tbody>
								{runs.map(r => (
									<tr key={r.id} className='border-t'>
										<td className='py-2 px-2'>{r.payDate || '—'}</td>
										<td className='py-2 px-2'>{(r.employeesCount ?? 0).toLocaleString()}</td>
										<td className='py-2 px-2'>{(r.grossAmount ?? 0).toLocaleString()}</td>
										<td className='py-2 px-2'>{(r.netAmount ?? 0).toLocaleString()}</td>
										<td className='py-2 px-2'>{r.status || '—'}</td>
										<td className='py-2 px-2 whitespace-nowrap'>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant='outline' aria-label='Actions'>
														<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' className='h-4 w-4'>
															<path d='M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z' />
														</svg>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align='end'>
													<DropdownMenuItem onClick={() => handleRowExport(r.id, 'excel')}>Export Summary</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleRowExport(r.id, 'bci')}>Export BCI</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className='space-y-2'>{Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className='h-8' />))}</div>
				)}
			</div>
		</div>
	)
}


