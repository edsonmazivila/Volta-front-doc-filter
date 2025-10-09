'use client'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { formatNumberFixed } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToastHelpers } from '@/components/ui/toast'
import { usePermissions } from '@/lib/rbac/hooks'
import {
  processPayrollAction,
  runPayrollAction,
  getExcelExportUrl,
  getBCIExportUrl,
  getTabelaExportUrl,
  type PayrollRunItem
} from '@/lib/services/payroll'

interface PayrollSectionProps {
  runs: PayrollRunItem[]
}

export function PayrollSection({ runs }: PayrollSectionProps) {
  const toast = useToastHelpers()
  const { role } = usePermissions()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastRunId, setLastRunId] = useState<string | null>(null)

  const isPayrollActor = role === 'payroll_manager' || role === 'system_admin'

  async function handleProcess() {
    if (!startDate || !endDate) {
      toast.error('Select start and end dates')
      return
    }

    setIsSubmitting(true)
    try {
      // Calculate pay date (next Friday after end date)
      const endDateObj = new Date(endDate)
      const payDate = new Date(endDateObj)
      payDate.setDate(endDateObj.getDate() + (5 + 7 - endDateObj.getDay()) % 7)

      // Create FormData for Server Action
      const formData = new FormData()
      formData.append('pay_period_start', startDate)
      formData.append('pay_period_end', endDate)
      formData.append('pay_date', payDate.toISOString().slice(0, 10))
      formData.append('pay_frequency', 'biweekly')

      const result = await processPayrollAction(null, formData)

      if ('errors' in result) {
        toast.error(result.errors._form?.[0] || 'Failed to calculate payroll')
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = result?.data as any
        const id = (data?.payroll_run?.id ?? data?.id ?? data?.run_id ?? null) as string | null
        if (id) setLastRunId(id)
        toast.success('Payroll calculated')
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to calculate payroll')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRun() {
    const id = lastRunId || runs[0]?.id
    if (!id) {
      toast.error('No calculated payroll to run')
      return
    }

    try {
      await runPayrollAction(id)
      toast.success('Payroll executed')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to run payroll')
    }
  }

  async function handleExport(type: 'excel' | 'bci' | 'tabela') {
    const id = lastRunId || runs[0]?.id
    if (!id) {
      toast.error('No payroll run selected')
      return
    }

    try {
      let url: string
      if (type === 'excel') {
        url = await getExcelExportUrl(id)
      } else if (type === 'bci') {
        url = await getBCIExportUrl(id)
      } else {
        url = await getTabelaExportUrl(id)
      }

      if (typeof window !== 'undefined') {
        window.open(url, '_blank')
      }
      toast.success('Export started')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Export failed')
    }
  }

  async function handleRowExport(runId: string, type: 'excel' | 'bci' | 'tabela') {
    try {
      let url: string
      if (type === 'excel') {
        url = await getExcelExportUrl(runId)
      } else if (type === 'bci') {
        url = await getBCIExportUrl(runId)
      } else {
        url = await getTabelaExportUrl(runId)
      }

      if (typeof window !== 'undefined') {
        window.open(url, '_blank')
      }
      toast.success('Export started')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Export failed')
    }
  }

  function formatNumber(n?: number) {
    return formatNumberFixed(n)
  }

  function StatusBadge({ status }: { status?: string }) {
    const s = (status || '—').toLowerCase()
    const map: Record<string, string> = {
      processed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      calculated: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    }
    const cls = map[s] || 'bg-muted text-foreground'
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
        {status || '—'}
      </span>
    )
  }

  return (
		<div className='grid gap-4'>
			{/* Header with period selection and actions */}
			<div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
				<h2 className='text-base font-semibold tracking-tight'>Payroll Processing</h2>
				<div className='flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3 w-full md:w-auto'>
					<div className='flex-1 min-w-[180px]'>
						<label className='block text-xs text-muted-foreground mb-1'>Period start</label>
						<input
							type='date'
							className='w-full border rounded-md px-3 py-2 bg-background'
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</div>
					<div className='flex-1 min-w-[180px]'>
						<label className='block text-xs text-muted-foreground mb-1'>Period end</label>
						<input
							type='date'
							className='w-full border rounded-md px-3 py-2 bg-background'
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>
					</div>
					<div className='flex items-center gap-2 sm:ml-auto'>
						{isPayrollActor && (
							<Button onClick={handleProcess} disabled={isSubmitting}>
								{isSubmitting ? 'Processing…' : 'Calculate'}
							</Button>
						)}
						{isPayrollActor && (
							<Button variant='secondary' onClick={handleRun}>
								Run
							</Button>
						)}
						{isPayrollActor && (
							<Button variant='outline' onClick={() => handleExport('excel')}>
								Export Excel
							</Button>
						)}
						{isPayrollActor && (
							<Button variant='outline' onClick={() => handleExport('bci')}>
								Export BCI
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className='flex items-center justify-between gap-3 flex-wrap'>
				<h2 className='text-sm font-medium'>Recent Runs</h2>
			</div>

      <div className='grid gap-2'>
        {runs.length > 0 ? (
          <div className="glass rounded-xl overflow-hidden">
            <div className='w-full overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='border-b border-[var(--border)] text-neutral-400'>
                  <tr>
                    <th className='text-left p-3'>Pay Date</th>
                    <th className='text-left p-3'>Employees</th>
                    <th className='text-left p-3'>Gross Pay</th>
                    <th className='text-left p-3'>Net Pay</th>
                    <th className='text-left p-3'>Status</th>
                    <th className='text-left p-3'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--border)] hover:bg-muted/50 transition-colors">
                      <td className='p-3'>{r.payDate || '—'}</td>
                      <td className='p-3'>{formatNumber(r.employeesCount)}</td>
                      <td className='p-3 text-emerald-600 dark:text-emerald-400'>{formatNumber(r.grossAmount)}</td>
                      <td className='p-3 text-sky-600 dark:text-sky-400'>{formatNumber(r.netAmount)}</td>
                      <td className='p-3'>
                        <StatusBadge status={r.status} />
                      </td>
                      <td className='p-3'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size="sm" className="h-8 w-8 p-0">
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 20 20'
                                fill='currentColor'
                                className='h-4 w-4'
                              >
                                <path d='M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z' />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => handleRowExport(r.id, 'excel')}>
                              Export Summary
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRowExport(r.id, 'bci')}>
                              Export BCI
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRowExport(r.id, 'tabela')}>
                              Export Tabela
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass rounded-xl overflow-hidden">
            <div className='p-8 text-center'>
              <div className='flex flex-col items-center gap-2'>
                <svg className='w-12 h-12 text-muted-foreground/50' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
                <p className='text-sm text-muted-foreground'>No payroll runs yet</p>
                <p className='text-xs text-muted-foreground/70'>Calculate payroll to get started</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
