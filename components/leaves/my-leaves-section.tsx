'use client'
import { useMemo, useState } from 'react'
import type { LeaveRequestItem, LeaveBalanceItem } from '@/lib/services/leaves'
import { LeaveTable } from '@/components/leaves/leave-table'
import { Button, Skeleton } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { useToastHelpers } from '@/components/ui/toast'
import { createLeaveRequestAction, submitLeaveRequestAction, cancelLeaveRequestAction, updateLeaveRequestAction } from '@/lib/services/leaves'
import { Calendar } from 'lucide-react'

interface MyLeavesSectionProps {
  requests: LeaveRequestItem[]
  balances: LeaveBalanceItem[]
  isLoading?: boolean
}

export function MyLeavesSection({ requests, balances, isLoading = false }: MyLeavesSectionProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const router = useRouter()
  const toast = useToastHelpers()
  const [newOpen, setNewOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewItem, setViewItem] = useState<LeaveRequestItem | null>(null)
  const [leaveType, setLeaveType] = useState('vacation')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [isHalfDay, setIsHalfDay] = useState(false)
  const [operationInProgress, setOperationInProgress] = useState<Record<string, boolean>>({})
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<LeaveRequestItem | null>(null)
  const [editType, setEditType] = useState('vacation')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [editReason, setEditReason] = useState('')
  const [editHalfDay, setEditHalfDay] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return requests.filter(r => {
      const matchesQ = !q || [r.leave_type, r.reason, r.status].some(v => String(v || '').toLowerCase().includes(q))
      const matchesStatus = !statusFilter || r.status === statusFilter
      const matchesType = !typeFilter || r.leave_type === typeFilter
      return matchesQ && matchesStatus && matchesType
    })
  }, [requests, search, statusFilter, typeFilter])

  return (
    <div className='grid gap-4'>
      <div>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className='h-20' />)
          ) : (
            balances.map(b => (
              <div
                key={b.leave_type}
                className='relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/40 p-4 hover:shadow-md transition-colors'
              >
                <div className='absolute right-0 top-0 h-20 w-20 rounded-bl-[48px] bg-primary/5' />
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center'>
                      <Calendar className='h-4 w-4' />
                    </div>
                    <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      {b.leave_type}
                    </span>
                  </div>
                </div>
                <div className='mt-3 flex items-baseline gap-2'>
                  <span className='text-2xl font-semibold'>
                    {(b.remaining_days ?? 0).toFixed(1)}
                  </span>
                  <span className='text-xs text-muted-foreground'>days left</span>
                </div>
                {b.pending_days ? (
                  <div className='mt-1 text-xs text-muted-foreground'>
                    Pending: <span className='font-medium'>{b.pending_days}</span>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      <div className='flex items-center justify-between gap-3 flex-wrap'>
        <h2 className='text-sm font-medium'>My Leave Requests</h2>
        <div className='flex items-center gap-2 flex-1 justify-end'>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='border rounded-md px-3 py-2 bg-background text-sm'
            placeholder='Search requests...'
          />
          <select className='border rounded-md px-2 py-2 bg-background' value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value=''>All status</option>
            {['DRAFT','SUBMITTED','APPROVED_L1','APPROVED_FINAL','REJECTED','CANCELLED'].map(s => (<option key={s} value={s}>{s}</option>))}
          </select>
          <select className='border rounded-md px-2 py-2 bg-background' value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value=''>All types</option>
            {['vacation','sick','personal','maternity','paternity','bereavement','emergency'].map(t => (<option key={t} value={t}>{t}</option>))}
          </select>
          <Button onClick={() => setNewOpen(true)}>New request</Button>
        </div>
      </div>

      <LeaveTable
        items={filtered}
        isLoading={isLoading}
        onNew={() => setNewOpen(true)}
        onView={(id) => { const it = requests.find(r => r.id === id) || null; setViewItem(it); setViewOpen(!!it) }}
        onSubmit={async (id) => {
          if (operationInProgress[id]) return
          setOperationInProgress(prev => ({ ...prev, [id]: true }))
          try {
            await submitLeaveRequestAction(id)
            toast.success('Submitted')
            router.refresh()
          } catch {
            toast.error('Failed to submit')
          } finally {
            setOperationInProgress(prev => ({ ...prev, [id]: false }))
          }
        }}
        onCancel={async (id) => {
          if (operationInProgress[id]) return
          const reason = window.prompt('Cancel reason (optional):') || undefined
          setOperationInProgress(prev => ({ ...prev, [id]: true }))
          try {
            await cancelLeaveRequestAction(id, reason)
            toast.success('Cancelled')
            router.refresh()
          } catch {
            toast.error('Failed to cancel')
          } finally {
            setOperationInProgress(prev => ({ ...prev, [id]: false }))
          }
        }}
      />

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Leave Request</DialogTitle>
          </DialogHeader>
          <div className='grid gap-3'>
            <div className='flex flex-col gap-1'>
              <label className='text-sm'>Type</label>
              <select className='w-full border rounded-md px-3 py-2 bg-background' value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                {['vacation','sick','personal','maternity','paternity','bereavement','emergency'].map(t => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-sm'>Start date</label>
                <input type='date' className='w-full border rounded-md px-3 py-2 bg-background' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-sm'>End date</label>
                <input type='date' className='w-full border rounded-md px-3 py-2 bg-background' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <input id='half-day' type='checkbox' checked={isHalfDay} onChange={(e) => setIsHalfDay(e.target.checked)} />
              <label htmlFor='half-day' className='text-sm'>Half day</label>
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-sm'>Reason</label>
              <textarea className='w-full border rounded-md px-3 py-2 bg-background' rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='secondary' onClick={() => setNewOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!leaveType || !startDate || !endDate) { toast.error('Type, start and end dates are required'); return }
                try {
                  const form = new FormData()
                  form.append('leave_type', leaveType)
                  form.append('start_date', `${startDate}T00:00:00Z`)
                  form.append('end_date', `${endDate}T23:59:59Z`)
                  form.append('reason', reason)
                  form.append('is_half_day', isHalfDay ? 'true' : 'false')
                  const result = await createLeaveRequestAction(null, form)
                  if (result.errors) { toast.error(result.errors._form?.[0] || 'Failed to create request'); return }
                  toast.success('Leave request created')
                  setNewOpen(false)
                  setLeaveType('vacation'); setStartDate(''); setEndDate(''); setReason(''); setIsHalfDay(false)
                  router.refresh()
                } catch {
                  toast.error('Failed to create request')
                }
              }}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={(v) => { if (!v) setViewItem(null); setViewOpen(v) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {viewItem ? (
            <div className='grid gap-2 text-sm'>
              <div><span className='text-muted-foreground'>Status:</span> <span className='capitalize'>{viewItem.status.toLowerCase()}</span></div>
              <div><span className='text-muted-foreground'>Type:</span> <span className='capitalize'>{viewItem.leave_type}</span></div>
              <div><span className='text-muted-foreground'>Dates:</span> {viewItem.start_date?.slice(0,10)} - {viewItem.end_date?.slice(0,10)}</div>
              <div><span className='text-muted-foreground'>Days:</span> {viewItem.total_days}{viewItem.is_half_day ? ' (Half Day)' : ''}</div>
              <div><span className='text-muted-foreground'>Reason:</span> {viewItem.reason || '-'}</div>
              <div><span className='text-muted-foreground'>Created:</span> {viewItem.created_at?.slice(0,10) || '-'}</div>
              {viewItem.status === 'DRAFT' ? (
                <div className='pt-2'>
                  <Button
                    size='sm'
                    onClick={() => {
                      setEditItem(viewItem)
                      setEditType(viewItem.leave_type)
                      setEditStart(viewItem.start_date?.slice(0,10) || '')
                      setEditEnd(viewItem.end_date?.slice(0,10) || '')
                      setEditReason(viewItem.reason || '')
                      setEditHalfDay(!!viewItem.is_half_day)
                      setEditOpen(true)
                      setViewOpen(false)
                    }}
                  >Edit draft</Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(v) => { if (!v) setEditItem(null); setEditOpen(v) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Leave Draft</DialogTitle>
          </DialogHeader>
          <div className='grid gap-3'>
            <div className='flex flex-col gap-1'>
              <label className='text-sm'>Type</label>
              <select className='w-full border rounded-md px-3 py-2 bg-background' value={editType} onChange={(e) => setEditType(e.target.value)}>
                {['vacation','sick','personal','maternity','paternity','bereavement','emergency'].map(t => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-sm'>Start date</label>
                <input type='date' className='w-full border rounded-md px-3 py-2 bg-background' value={editStart} onChange={(e) => setEditStart(e.target.value)} />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-sm'>End date</label>
                <input type='date' className='w-full border rounded-md px-3 py-2 bg-background' value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <input id='edit-half-day' type='checkbox' checked={editHalfDay} onChange={(e) => setEditHalfDay(e.target.checked)} />
              <label htmlFor='edit-half-day' className='text-sm'>Half day</label>
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-sm'>Reason</label>
              <textarea className='w-full border rounded-md px-3 py-2 bg-background' rows={3} value={editReason} onChange={(e) => setEditReason(e.target.value)} />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='secondary' onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!editItem) return
                if (!editType || !editStart || !editEnd) { toast.error('Type, start and end dates are required'); return }
                try {
                  const form = new FormData()
                  form.append('leave_type', editType)
                  form.append('start_date', `${editStart}T00:00:00Z`)
                  form.append('end_date', `${editEnd}T23:59:59Z`)
                  form.append('reason', editReason)
                  form.append('is_half_day', editHalfDay ? 'true' : 'false')
                  const result = await updateLeaveRequestAction(editItem.id, null, form)
                  if (result.errors) { toast.error(result.errors._form?.[0] || 'Failed to update request'); return }
                  toast.success('Leave request updated')
                  setEditOpen(false)
                  setEditItem(null)
                  router.refresh()
                } catch {
                  toast.error('Failed to update request')
                }
              }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


