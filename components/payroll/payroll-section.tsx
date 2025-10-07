'use client'
import { useState } from 'react'
import { Button, Skeleton } from '@/components/ui'
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

  return (
    <div className='grid gap-4'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        <div className='flex flex-col gap-1'>
          <label className='text-sm'>Period start</label>
          <input
            type='date'
            className='w-full border rounded-md px-3 py-2 bg-background'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='text-sm'>Period end</label>
          <input
            type='date'
            className='w-full border rounded-md px-3 py-2 bg-background'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className='flex items-center flex-wrap gap-2 justify-end w-full'>
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
                {runs.map((r) => (
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
        ) : (
          <div className='space-y-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-8' />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
