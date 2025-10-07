'use client'
import { useMemo, useState } from 'react'
import type { DocumentListItem } from '@/lib/services/documents'
import { Button, Skeleton } from '@/components/ui'
import { format } from 'date-fns'

interface DocumentTableProps {
	items?: DocumentListItem[]
	isLoading?: boolean
	onUpload?: () => void
	onApprove?: (id: string) => void
	onReject?: (id: string) => void
	onDelete?: (id: string) => void
	onView?: (id: string) => void
	onEdit?: (id: string) => void
}

export function DocumentTable({ items = [], isLoading = false, onUpload, onApprove, onReject, onDelete, onView, onEdit }: DocumentTableProps) {
	const rows = useMemo(() => items, [items])
	const [pendingId, setPendingId] = useState<string | null>(null)

	function statusClass(status: string) {
		switch (status) {
			case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
			case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
			case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300'
			case 'uploaded': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
			default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300'
		}
	}

	function fmtDate(v?: string) {
		if (!v) return '-'
		const d = new Date(v)
		return isNaN(d.getTime()) ? v : format(d, 'yyyy-MM-dd')
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
				No documents found
				{onUpload ? (
					<div className='mt-3'>
						<Button onClick={onUpload}>Upload</Button>
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
						<th className='p-3 font-medium'>Document</th>
						<th className='p-3 font-medium'>Type</th>
						<th className='p-3 font-medium'>Status</th>
						<th className='p-3 font-medium'>Date</th>
						<th className='p-3 font-medium text-right'>Actions</th>
					</tr>
				</thead>
				<tbody>
					{rows.map(row => (
						<tr key={row.id} className='border-t'>
							<td className='p-3'>{row.employeeName}</td>
							<td className='p-3'>{row.title}</td>
							<td className='p-3 uppercase'>{row.type}</td>
							<td className='p-3'><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs capitalize ${statusClass(row.status)}`}>{row.status}</span></td>
							<td className='p-3'>{fmtDate(row.createdAt)}</td>
							<td className='p-3 text-right'>
								<div className='inline-flex gap-2'>
									<Button variant='ghost' size='sm' onClick={() => onView?.(row.id)}>View</Button>
									<Button variant='secondary' size='sm' disabled={pendingId === row.id} onClick={async () => { setPendingId(row.id); await onApprove?.(row.id); setPendingId(null) }}>Approve</Button>
									<Button variant='secondary' size='sm' onClick={() => onEdit?.(row.id)}>Edit</Button>
									<Button variant='destructive' size='sm' disabled={pendingId === row.id} onClick={() => onReject?.(row.id)}>Reject</Button>
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


