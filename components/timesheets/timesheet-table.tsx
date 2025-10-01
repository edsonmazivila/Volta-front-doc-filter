'use client'
import { useMemo, useState } from 'react'
import type { TimesheetListItem } from '@/lib/services/timesheets-server'
import { Button, Skeleton } from '@/components/ui'
import { format } from 'date-fns'


interface TimesheetTableProps {
	items?: TimesheetListItem[]
	isLoading?: boolean
	onNewTimesheet?: () => void
	onEdit?: (id: string) => void
	onSubmit?: (id: string) => void
	onApprove?: (id: string) => void
	onReject?: (id: string) => void
	onDelete?: (id: string) => void
}

export function TimesheetTable({ items = [], isLoading = false, onNewTimesheet, onEdit, onSubmit, onApprove, onReject, onDelete }: TimesheetTableProps) {
	const rows = useMemo(() => items, [items])
  const [pendingId, setPendingId] = useState<string | null>(null)

  function fmtDate(v?: string) {
    if (!v) return '-'
    const d = new Date(v)
    return isNaN(d.getTime()) ? v : format(d, 'yyyy-MM-dd')
  }

	function statusClass(status: string) {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
      case 'draft':
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300'
    }
  }

	function formatPayPeriod(start?: string, end?: string) {
		if (!start || !end) return '-'
		const s = new Date(start)
		const e = new Date(end)
		if (isNaN(s.getTime()) || isNaN(e.getTime())) return '-'
		const sameMonth = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()
		if (sameMonth) {
			return `${format(s, 'MMM dd')} - ${format(e, 'MMM dd, yyyy')}`
		}
		return `${format(s, 'MMM dd, yyyy')} - ${format(e, 'MMM dd, yyyy')}`
	}

	function truncateNote(note?: string, max = 40) {
		if (!note) return '-'
		if (note.length <= max) return note
		return note.slice(0, max - 1) + '…'
	}

	if (isLoading) {
		return (
			<div className='space-y-2'>
				{Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className='h-10' />))}
			</div>
		)
	}

	if (!rows.length) {
		return (
			<div className='border rounded-md p-6 text-center text-sm text-muted-foreground'>
				No timesheets found
				{onNewTimesheet ? (
					<div className='mt-3'>
						<Button onClick={onNewTimesheet}>New Timesheet</Button>
					</div>
				) : null}
			</div>
		)
	}

	return (
		<div className='overflow-x-auto border rounded-md'>
			<table className='w-full text-sm'>
				<thead className='bg-muted/50 text-left'>
					<tr>
						<th className='p-3 font-medium'>Employee</th>
						<th className='p-3 font-medium'>Pay Period</th>
						<th className='p-3 font-medium'>Total Hours</th>
						<th className='p-3 font-medium'>Notes</th>
						<th className='p-3 font-medium'>Status</th>
						<th className='p-3 font-medium text-right'>Actions</th>
					</tr>
				</thead>
				<tbody>
					{rows.map(row => (
						<tr key={row.id} className='border-t'>
							<td className='p-3'>{String(row.employeeName)}</td>
							<td className='p-3'>{formatPayPeriod(row.periodStart, row.periodEnd)}</td>
							<td className='p-3'>{Number(row.totalHours) || 0}</td>
							<td className='p-3 max-w-[240px] truncate' title={row.notes || ''}>{truncateNote(row.notes)}</td>
							<td className='p-3'><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs capitalize ${statusClass(row.status)}`}>{row.status}</span></td>
							<td className='p-3 text-right'>
								<div className='inline-flex gap-2'>
									<Button variant='secondary' size='sm' disabled={pendingId === row.id} onClick={() => onEdit?.(row.id)}>Edit</Button>
									<Button variant='destructive' size='sm' disabled={pendingId === row.id} onClick={() => onDelete?.(row.id)}>Delete</Button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}


