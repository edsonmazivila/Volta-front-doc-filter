'use client'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { formatNumberFixed } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToastHelpers } from '@/components/ui/toast'
import { usePermissions } from '@/lib/rbac/hooks'
import { useRouter } from 'next/navigation'
import {
  processPayrollAction,
  runPayrollAction,
  getExcelExportUrl,
  getBCIExportUrl,
  getTabelaExportUrl,
  type PayrollRunItem
} from '@/lib/services/payroll'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface PayrollSectionProps {
  runs: PayrollRunItem[]
}

export function PayrollSection({ runs }: PayrollSectionProps) {
  const { i18n } = useLingui()
  const toast = useToastHelpers()
  const router = useRouter()
  const { role } = usePermissions()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [payFrequency, setPayFrequency] = useState('biweekly')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastRunId, setLastRunId] = useState<string | null>(null)

  const isPayrollActor = role === 'payroll_manager' || role === 'system_admin'

  async function handleProcess() {
    if (!startDate || !endDate) {
      toast.error(i18n._(msg`Select start and end dates`))
      return
    }

    setIsSubmitting(true)
    try {
      // Calculate pay date (next Friday after end date)
      const startDateObj = new Date(startDate)
      const endDateObj = new Date(endDate)
      if (Number.isNaN(startDateObj.getTime()) || Number.isNaN(endDateObj.getTime())) {
        toast.error(i18n._(msg`Invalid start or end date`))
        return
      }
      const msPerDay = 1000 * 60 * 60 * 24
      const inclusiveDiff =
        Math.floor((endDateObj.getTime() - startDateObj.getTime()) / msPerDay) + 1
      const frequencyRequirements: Record<
        string,
        { requiredDays?: number; message: string }
      > = {
        weekly: {
          requiredDays: 7,
          message: i18n._(msg`Weekly period must cover exactly 7 days`),
        },
        biweekly: {
          requiredDays: 14,
          message: i18n._(msg`Biweekly period must cover exactly 14 days`),
        },
        semimonthly: {
          message: i18n._(msg`Semi-monthly periods should align with 1st-15th or 16th-end of month ranges`),
        },
        monthly: {
          message: i18n._(msg`Monthly periods should start on the first and end on the last day of the month`),
        },
      }

      const requirement = frequencyRequirements[payFrequency]
      if (requirement?.requiredDays && inclusiveDiff !== requirement.requiredDays) {
        toast.error(requirement.message)
        return
      }
      if (!requirement?.requiredDays && inclusiveDiff <= 0) {
        toast.error(i18n._(msg`End date must be after start date`))
        return
      }

      const payDate = new Date(endDateObj)
      payDate.setDate(endDateObj.getDate() + (5 + 7 - endDateObj.getDay()) % 7)

      // Create FormData for Server Action
      const formData = new FormData()
      formData.append('pay_period_start', startDate)
      formData.append('pay_period_end', endDate)
      formData.append('pay_date', payDate.toISOString().slice(0, 10))
      formData.append('pay_frequency', payFrequency)

      const result = await processPayrollAction(null, formData)

      if ('errors' in result) {
        // Show all validation errors to user
        const errorMessages = []

        // Field-specific errors
        if (result.errors.pay_period_start) errorMessages.push(...result.errors.pay_period_start)
        if (result.errors.pay_period_end) errorMessages.push(...result.errors.pay_period_end)
        if (result.errors.pay_date) errorMessages.push(...result.errors.pay_date)
        if (result.errors.pay_frequency) errorMessages.push(...result.errors.pay_frequency)

        // General form errors (including backend errors)
        if (result.errors._form) errorMessages.push(...result.errors._form)

        // Show the first error or a fallback message
        toast.error(errorMessages[0] || i18n._(msg`Failed to calculate payroll`))
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = result?.data as any
        const id = (data?.payroll_run?.id ?? data?.id ?? data?.run_id ?? null) as string | null
        if (id) setLastRunId(id)
        toast.success(i18n._(msg`Payroll calculated`))
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : i18n._(msg`Failed to calculate payroll`))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRun() {
    const id = lastRunId || runs[0]?.id
    if (!id) {
      toast.error(i18n._(msg`No calculated payroll to run`))
      return
    }

    try {
      await runPayrollAction(id)
      toast.success(i18n._(msg`Payroll executed`))
      router.refresh()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : i18n._(msg`Failed to run payroll`))
    }
  }

  async function handleRowRun(runId: string) {
    try {
      await runPayrollAction(runId)
      toast.success(i18n._(msg`Payroll executed`))
      router.refresh()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : i18n._(msg`Failed to run payroll`))
    }
  }

  async function handleExport(type: 'excel' | 'bci' | 'tabela') {
    const id = lastRunId || runs[0]?.id
    if (!id) {
      toast.error(i18n._(msg`No payroll run selected`))
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
      toast.success(i18n._(msg`Export started`))
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : i18n._(msg`Export failed`))
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
      toast.success(i18n._(msg`Export started`))
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : i18n._(msg`Export failed`))
    }
  }

  function handleViewPaystubs(runId: string) {
    // Navigate to paystubs page filtered by payroll run
    router.push(`/dashboard/paystubs?payrollRunId=${runId}`)
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
			<div className='flex flex-col gap-3'>
				<div className='grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4 w-full'>
					<div>
						<label className='block text-xs text-muted-foreground mb-1'>{i18n._(msg`Period start`)}</label>
						<input
							type='date'
							className='w-full border border-input rounded-md px-3 py-2 bg-background text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</div>
					<div>
						<label className='block text-xs text-muted-foreground mb-1'>{i18n._(msg`Period end`)}</label>
						<input
							type='date'
							className='w-full border border-input rounded-md px-3 py-2 bg-background text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>
					</div>
					<div>
						<label className='block text-xs text-muted-foreground mb-1'>{i18n._(msg`Pay frequency`)}</label>
						<select
							value={payFrequency}
							onChange={(e) => setPayFrequency(e.target.value)}
							className='w-full border border-input rounded-md px-3 py-2 bg-background text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'
						>
							<option value='weekly'>{i18n._(msg`Weekly`)}</option>
							<option value='biweekly'>{i18n._(msg`Biweekly`)}</option>
							<option value='semimonthly'>{i18n._(msg`Semi-monthly`)}</option>
							<option value='monthly'>{i18n._(msg`Monthly`)}</option>
						</select>
					</div>
				</div>
				{isPayrollActor && (
					<div className='flex flex-wrap items-center gap-2 sm:justify-end'>
						<Button onClick={handleProcess} disabled={isSubmitting}>
							{isSubmitting ? i18n._(msg`Processing…`) : i18n._(msg`Calculate`)}
						</Button>
						<Button variant='secondary' onClick={handleRun}>
							{i18n._(msg`Run`)}
						</Button>
						<Button variant='outline' onClick={() => handleExport('excel')}>
							{i18n._(msg`Export Excel`)}
						</Button>
						<Button variant='outline' onClick={() => handleExport('bci')}>
							{i18n._(msg`Export BCI`)}
						</Button>
					</div>
				)}
			</div>

			<div className='flex items-center justify-between gap-3 flex-wrap'>
				<h2 className='text-sm font-medium'>{i18n._(msg`Recent Runs`)}</h2>
			</div>

      <div className='grid gap-2'>
        {runs.length > 0 ? (
          <div className="glass rounded-xl overflow-hidden">
            <div className='w-full overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='border-b border-[var(--border)] text-neutral-400'>
                  <tr>
                    <th className='text-left p-3'>{i18n._(msg`Pay Date`)}</th>
                    <th className='text-left p-3'>{i18n._(msg`Employees`)}</th>
                    <th className='text-left p-3'>{i18n._(msg`Gross Pay`)}</th>
                    <th className='text-left p-3'>{i18n._(msg`Net Pay`)}</th>
                    <th className='text-left p-3'>{i18n._(msg`Status`)}</th>
                    <th className='text-left p-3'>{i18n._(msg`Actions`)}</th>
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
                            {r.status?.toLowerCase() === 'calculated' && isPayrollActor && (
                              <DropdownMenuItem onClick={() => handleRowRun(r.id)}>
                                {i18n._(msg`Run Payroll`)}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleViewPaystubs(r.id)}>
                              {i18n._(msg`View Paystubs`)}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRowExport(r.id, 'excel')}>
                              {i18n._(msg`Export Summary`)}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRowExport(r.id, 'bci')}>
                              {i18n._(msg`Export BCI`)}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRowExport(r.id, 'tabela')}>
                              {i18n._(msg`Export Tabela`)}
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
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 2z' />
                </svg>
                <p className='text-sm text-muted-foreground'>{i18n._(msg`No payroll runs yet`)}</p>
                <p className='text-xs text-muted-foreground/70'>{i18n._(msg`Calculate payroll to get started`)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
