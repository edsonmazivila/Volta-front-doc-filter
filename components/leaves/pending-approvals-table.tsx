
import type { LeaveRequestItem } from '@/lib/services/leaves-server'
import { Button } from '@/components/ui'

interface PendingApprovalsTableProps {
  items: LeaveRequestItem[]
  onApproveL1: (id: string) => Promise<void> | void
  onApproveFinal: (id: string) => Promise<void> | void
  onReject: (id: string) => void
}

export function PendingApprovalsTable({ items, onApproveL1, onApproveFinal, onReject }: PendingApprovalsTableProps) {
  return (
    <div className='overflow-x-auto border rounded-md'>
      <table className='w-full text-sm'>
        <thead className='bg-muted/50 text-left'>
          <tr>
            <th className='p-3 font-medium'>Employee</th>
            <th className='p-3 font-medium'>Type</th>
            <th className='p-3 font-medium'>Dates</th>
            <th className='p-3 font-medium'>Days</th>
            <th className='p-3 font-medium'>Reason</th>
            <th className='p-3 font-medium'>Submitted</th>
            <th className='p-3 font-medium text-right'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(row => (
            <tr key={row.id} className='border-t'>
              <td className='p-3'>{`${row.employee_first_name || ''} ${row.employee_last_name || ''}`.trim() || '—'}</td>
              <td className='p-3 capitalize'>{row.leave_type}</td>
              <td className='p-3'>{row.start_date?.slice(0,10)} - {row.end_date?.slice(0,10)}</td>
              <td className='p-3'>{row.total_days}{row.is_half_day ? ' (Half Day)' : ''}</td>
              <td className='p-3 max-w-[240px] truncate' title={row.reason || ''}>{row.reason || '-'}</td>
              <td className='p-3'>{row.submitted_at?.slice(0,10) || row.created_at?.slice(0,10) || '-'}</td>
              <td className='p-3 text-right'>
                <div className='inline-flex gap-2'>
                  {row.status === 'SUBMITTED' ? (
                    <Button size='sm' onClick={() => onApproveL1(row.id)}>Approve</Button>
                  ) : null}
                  {row.status === 'APPROVED_L1' ? (
                    <Button size='sm' onClick={() => onApproveFinal(row.id)}>Approve Final</Button>
                  ) : null}
                  <Button variant='destructive' size='sm' onClick={() => onReject(row.id)}>Reject</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


