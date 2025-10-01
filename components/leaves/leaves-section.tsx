'use client'
import { useMemo, useState } from 'react'
import type { LeaveRequestItem, LeaveBalanceItem } from '@/lib/services/leaves-server'
import { LeaveTable } from '@/components/leaves/leave-table'
import { PendingApprovalsTable } from '@/components/leaves/pending-approvals-table'
import { LeavesService } from '@/lib/services/leaves'
import { Button } from '@/components/ui'
import { useToastHelpers } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SearchInput } from '@/components/search-input'

interface LeavesSectionProps {
  requests: LeaveRequestItem[]
  balances: LeaveBalanceItem[]
  pending: LeaveRequestItem[]
}

export function LeavesSection({ requests, balances, pending }: LeavesSectionProps) {
  const router = useRouter()
  const toast = useToastHelpers()
  const [open, setOpen] = useState(false)
  const [leaveType, setLeaveType] = useState('vacation')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [isHalfDay, setIsHalfDay] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return requests.filter(r => {
      const matchesQ = !q || [r.leave_type, r.reason, r.status].some(v => String(v || '').toLowerCase().includes(q))
      const matchesStatus = !statusFilter || r.status === statusFilter
      const matchesType = !typeFilter || r.leave_type === typeFilter
      return matchesQ && matchesStatus && matchesType
    })
  }, [requests, search, statusFilter, typeFilter])

  async function handleCreate() {
    if (!leaveType || !startDate || !endDate) {
      toast.error('Type, start and end dates are required')
      return
    }
    try {
      await LeavesService.create({ leave_type: leaveType, start_date: `${startDate}T00:00:00Z`, end_date: `${endDate}T23:59:59Z`, reason, is_half_day: isHalfDay })
      toast.success('Leave request created')
      setOpen(false)
      setLeaveType('vacation'); setStartDate(''); setEndDate(''); setReason(''); setIsHalfDay(false)
      router.refresh()
    } catch { toast.error('Failed to create request') }
  }

  return (
    <div className='grid gap-4'>
      <Tabs defaultValue='my'>
        <TabsList>
          <TabsTrigger value='my'>My Requests</TabsTrigger>
          <TabsTrigger value='pending'>Pending Approvals</TabsTrigger>
          <TabsTrigger value='balances'>Team Balances</TabsTrigger>
        </TabsList>
        <TabsContent value='my'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {balances.map(b => (
          <div key={b.leave_type} className='p-3 border rounded balance-card'>
            <div className='text-xs text-muted-foreground capitalize'>{b.leave_type}</div>
            <div className='text-lg font-semibold'>{(b.remaining_days ?? 0).toFixed(1)}</div>
            {b.pending_days ? <div className='text-xs text-muted-foreground'>Pending: {b.pending_days}</div> : null}
          </div>
        ))}
          </div>

          <div className='flex items-center justify-between gap-3 flex-wrap mb-4'>
        <h2 className='text-sm font-medium'>My Leave Requests</h2>
        <div className='flex items-center gap-2 flex-1 justify-end'>
          <SearchInput value={search} onChange={setSearch} placeholder='Search requests...' />
          <select className='border rounded-md px-2 py-2 bg-background' value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value=''>All status</option>
            {['DRAFT','SUBMITTED','APPROVED_L1','APPROVED_FINAL','REJECTED','CANCELLED'].map(s => (<option key={s} value={s}>{s}</option>))}
          </select>
          <select className='border rounded-md px-2 py-2 bg-background' value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value=''>All types</option>
            {['vacation','sick','personal','maternity','paternity','bereavement','emergency'].map(t => (<option key={t} value={t}>{t}</option>))}
          </select>
          <Button onClick={() => setOpen(true)}>New request</Button>
        </div>
          </div>

          <LeaveTable
        items={filtered}
        onNew={() => setOpen(true)}
        onView={() => {}}
        onSubmit={async (id) => { try { await LeavesService.submit(id); toast.success('Submitted'); router.refresh() } catch { toast.error('Failed to submit') } }}
        onCancel={async (id) => { const reason = prompt('Cancel reason (optional):') || undefined; try { await LeavesService.cancel(id, reason); toast.success('Cancelled'); router.refresh() } catch { toast.error('Failed to cancel') } }}
      />
        </TabsContent>

        <TabsContent value='pending'>
          <PendingApprovalsTable
            items={pending}
            onApproveL1={async (id) => { try { await LeavesService.approveL1(id); toast.success('Approved L1'); router.refresh() } catch { toast.error('Failed') } }}
            onApproveFinal={async (id) => { try { await LeavesService.approveFinal(id); toast.success('Approved'); router.refresh() } catch { toast.error('Failed') } }}
            onReject={(id) => { setRejectId(id); setRejectReason(''); setRejectOpen(true) }}
          />
        </TabsContent>

        <TabsContent value='balances'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            {balances.map(b => (
              <div key={b.leave_type} className='p-3 border rounded balance-card'>
                <div className='text-xs text-muted-foreground capitalize'>{b.leave_type}</div>
                <div className='text-lg font-semibold'>{(b.remaining_days ?? 0).toFixed(1)}</div>
                {b.pending_days ? <div className='text-xs text-muted-foreground'>Pending: {b.pending_days}</div> : null}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
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
              <Button variant='secondary' onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={rejectOpen} onOpenChange={(v) => { if (!v) { setRejectId(null); setRejectReason('') } setRejectOpen(v) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            <label className='text-sm'>Reason</label>
            <textarea className='w-full border rounded-md px-3 py-2 bg-background' rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </div>
          <div className='flex justify-end gap-2 pt-2'>
            <Button variant='secondary' onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant='destructive' onClick={async () => { if (!rejectId || !rejectReason.trim()) return; try { await LeavesService.reject(rejectId, rejectReason.trim()); toast.success('Rejected'); setRejectOpen(false); router.refresh() } catch { toast.error('Failed to reject') } }}>Reject</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


