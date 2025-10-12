'use client'
import { useState } from 'react'
import type { LeaveRequestItem, TeamBalanceItem } from '@/lib/services/leaves'
import { LeaveTable } from '@/components/leaves/leave-table'
import { PendingApprovalsTable } from '@/components/leaves/pending-approvals-table'
import { TeamBalancesTable } from '@/components/leaves/team-balances-table'
import { LeaveRequestFormDialog } from '@/components/leaves/leave-request-form-dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui'
import { SearchInput } from '@/components/search-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToastHelpers } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import {
  submitLeaveRequestAction,
  cancelLeaveRequestAction,
  approveL1Action,
  approveFinalAction,
  rejectLeaveRequestAction,
} from '@/lib/services/leaves'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface LeaveManagementProps {
  requests: LeaveRequestItem[]
  pending: LeaveRequestItem[]
  teamBalances: TeamBalanceItem[]
}

export function LeaveManagement({ requests, pending, teamBalances }: LeaveManagementProps) {
  const router = useRouter()
  const toast = useToastHelpers()
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [operationInProgress, setOperationInProgress] = useState<Record<string, boolean>>({})
  const [viewOpen, setViewOpen] = useState(false)
  const [viewItem, setViewItem] = useState<LeaveRequestItem | null>(null)

  const filtered = requests.filter(r => {
    const q = search.trim().toLowerCase()
    const matchesQ = !q || [r.leave_type, r.reason, r.status].some(v => String(v || '').toLowerCase().includes(q))
    const matchesStatus = statusFilter === 'all' || !statusFilter || r.status === statusFilter
    const matchesType = typeFilter === 'all' || !typeFilter || r.leave_type === typeFilter
    return matchesQ && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs defaultValue="my">
        <TabsList>
          <TabsTrigger value="my">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="balances">Team Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="text-sm font-medium">All Leave Requests</h2>
            <SearchInput value={search} onChange={setSearch} placeholder="Search requests..." />
            <div className="flex gap-4 flex-1 flex-col sm:flex-row w-full">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background border border-[var(--border)]">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-[var(--border)]">
                  <SelectItem value="all">All status</SelectItem>
                  {['DRAFT','SUBMITTED','APPROVED_L1','APPROVED_FINAL','REJECTED','CANCELLED'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background border border-[var(--border)]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-[var(--border)]">
                  <SelectItem value="all">All types</SelectItem>
                  {['vacation','sick','personal','maternity','paternity','bereavement','emergency'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setFormOpen(true)} className='ml-auto '>New request</Button>
            </div>
          </div>

          <LeaveTable
            items={filtered}
            onNew={() => setFormOpen(true)}
            onSubmit={async (id) => {
              if (operationInProgress[id]) return;
              setOperationInProgress(prev => ({ ...prev, [id]: true }));
              try {
                await submitLeaveRequestAction(id);
                toast.success('Submitted');
                router.refresh();
              } catch {
                toast.error('Failed to submit');
              } finally {
                setOperationInProgress(prev => ({ ...prev, [id]: false }));
              }
            }}
            onCancel={async (id) => {
              if (operationInProgress[id]) return;
              const reason = prompt('Cancel reason (optional):') || undefined;
              setOperationInProgress(prev => ({ ...prev, [id]: true }));
              try {
                await cancelLeaveRequestAction(id, reason);
                toast.success('Cancelled');
                router.refresh();
              } catch {
                toast.error('Failed to cancel');
              } finally {
                setOperationInProgress(prev => ({ ...prev, [id]: false }));
              }
            }}
          />
        </TabsContent>

        <TabsContent value="pending">
          <PendingApprovalsTable
            items={pending}
            onApproveL1={async (id) => {
              if (operationInProgress[id]) return;
              setOperationInProgress(prev => ({ ...prev, [id]: true }));
              try {
                await approveL1Action(id);
                toast.success('Approved L1');
                router.refresh();
              } catch {
                toast.error('Failed');
              } finally {
                setOperationInProgress(prev => ({ ...prev, [id]: false }));
              }
            }}
            onApproveFinal={async (id) => {
              if (operationInProgress[id]) return;
              setOperationInProgress(prev => ({ ...prev, [id]: true }));
              try {
                await approveFinalAction(id);
                toast.success('Approved');
                router.refresh();
              } catch {
                toast.error('Failed');
              } finally {
                setOperationInProgress(prev => ({ ...prev, [id]: false }));
              }
            }}
            onReject={(id) => {
              if (operationInProgress[id]) return;
              setRejectId(id);
              setRejectReason('');
              setRejectOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="balances">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Team Leave Balances</h3>
            <TeamBalancesTable teamBalances={teamBalances} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <LeaveRequestFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="create"
      />

      <Dialog open={viewOpen} onOpenChange={(v) => { if (!v) setViewItem(null); setViewOpen(v) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {viewItem ? (
            <div className="grid gap-2 text-sm">
              <div><span className="text-muted-foreground">Status:</span> <span className="capitalize">{viewItem.status.toLowerCase()}</span></div>
              <div><span className="text-muted-foreground">Type:</span> <span className="capitalize">{viewItem.leave_type}</span></div>
              <div><span className="text-muted-foreground">Dates:</span> {viewItem.start_date?.slice(0,10)} - {viewItem.end_date?.slice(0,10)}</div>
              <div><span className="text-muted-foreground">Days:</span> {viewItem.total_days}{viewItem.is_half_day ? ' (Half Day)' : ''}</div>
              <div><span className="text-muted-foreground">Reason:</span> {viewItem.reason || '-'}</div>
              <div><span className="text-muted-foreground">Created:</span> {viewItem.created_at?.slice(0,10) || '-'}</div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={(v) => { if (!v) { setRejectId(null); setRejectReason('') } setRejectOpen(v) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label className="text-sm">Reason</label>
            <textarea className="w-full border rounded-md px-3 py-2 bg-background" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={operationInProgress['reject']}
              onClick={async () => {
                if (!rejectId || !rejectReason.trim() || operationInProgress['reject']) return;
                setOperationInProgress(prev => ({ ...prev, reject: true }));
                try {
                  await rejectLeaveRequestAction(rejectId, rejectReason.trim());
                  toast.success('Rejected');
                  setRejectOpen(false);
                  router.refresh();
                } catch {
                  toast.error('Failed to reject');
                } finally {
                  setOperationInProgress(prev => ({ ...prev, reject: false }));
                }
              }}
            >
              {operationInProgress['reject'] ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
