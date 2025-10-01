'use client'
import { useMemo, useState } from 'react'
import type { LeaveRequestItem } from '@/lib/services/leaves-server'
import { Button, Skeleton } from '@/components/ui'

interface LeaveTableProps {
  items?: LeaveRequestItem[]
  isLoading?: boolean
  onNew?: () => void
  onView?: (id: string) => void
  onSubmit?: (id: string) => void
  onCancel?: (id: string) => void
}

export function LeaveTable({ items = [], isLoading = false, onNew, onView, onSubmit, onCancel }: LeaveTableProps) {
  const rows = useMemo(() => items, [items])
  const [pendingId, setPendingId] = useState<string | null>(null)

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
        No leave requests found
        {onNew ? (
          <div className='mt-3'>
            <Button onClick={onNew}>New request</Button>
          </div>
        ) : null}
      </div>
    )
  }

  function statusBadge(status: string) {
    const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs'
    switch (status) {
      case 'SUBMITTED': return `${base} bg-blue-100 text-blue-700`
      case 'APPROVED_L1': return `${base} bg-yellow-100 text-yellow-700`
      case 'APPROVED_FINAL': return `${base} bg-green-100 text-green-700`
      case 'REJECTED': return `${base} bg-red-100 text-red-700`
      case 'CANCELLED': return `${base} bg-gray-100 text-gray-700`
      case 'DRAFT':
      default: return `${base} bg-gray-100 text-gray-700`
    }
  }

  return (
    <div className='overflow-x-auto border rounded-md'>
      <table className='w-full text-sm'>
        <thead className='bg-muted/50 text-left'>
          <tr>
            <th className='p-3 font-medium'>Status</th>
            <th className='p-3 font-medium'>Type</th>
            <th className='p-3 font-medium'>Dates</th>
            <th className='p-3 font-medium'>Days</th>
            <th className='p-3 font-medium'>Reason</th>
            <th className='p-3 font-medium'>Created</th>
            <th className='p-3 font-medium text-right'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className='border-t'>
              <td className='p-3'><span className={statusBadge(row.status)}>{row.status}</span></td>
              <td className='p-3 capitalize'>{row.leave_type}</td>
              <td className='p-3'>{row.start_date?.slice(0,10)} - {row.end_date?.slice(0,10)}</td>
              <td className='p-3'>{row.total_days}{row.is_half_day ? ' (Half Day)' : ''}</td>
              <td className='p-3 max-w-[240px] truncate' title={row.reason || ''}>{row.reason || '-'}</td>
              <td className='p-3'>{row.created_at?.slice(0,10) || '-'}</td>
              <td className='p-3 text-right'>
                <div className='inline-flex gap-2'>
                  <Button variant='ghost' size='sm' onClick={() => onView?.(row.id)}>View</Button>
                  {row.status === 'DRAFT' ? (
                    <Button size='sm' disabled={pendingId === row.id} onClick={async () => { setPendingId(row.id); await onSubmit?.(row.id); setPendingId(null) }}>Submit</Button>
                  ) : null}
                  {['DRAFT','SUBMITTED','APPROVED_L1'].includes(row.status) ? (
                    <Button variant='destructive' size='sm' disabled={pendingId === row.id} onClick={() => onCancel?.(row.id)}>Cancel</Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


