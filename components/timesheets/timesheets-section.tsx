'use client'
import { useState, useTransition } from 'react'
import { TimesheetTable } from '@/components/timesheets/timesheet-table'
import { TimesheetFormDialog, type TimesheetFormValues } from '@/components/timesheets/timesheet-form-dialog'
import type { TimesheetListItem } from '@/lib/services/timesheets'
import type { User } from '@/lib/services/users'
import {
  createTimesheetAction,
  updateTimesheetAction,
  submitTimesheetAction,
  approveTimesheetAction,
  rejectTimesheetAction,
  deleteTimesheetAction,
} from '@/lib/services/timesheets'
import { Button } from '@/components/ui'
import { useToastHelpers } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface TimesheetsSectionProps {
	items: TimesheetListItem[]
	employees?: User[]
}

export function TimesheetsSection({ items, employees = [] }: TimesheetsSectionProps) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [isPending, startTransition] = useTransition()
  const toast = useToastHelpers()
  const [editId, setEditId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  async function handleSave(values: TimesheetFormValues) {
		try {
			const totalHours = (values.regularHours || 0) + (values.overtimeHours || 0)
			const payload = {
				user_id: values.employee_id,
				pay_period_start: values.periodStart,
				pay_period_end: values.periodEnd,
				regular_hours: values.regularHours,
				overtime_hours: values.overtimeHours,
				total_hours: totalHours,
				status: values.status,
				notes: values.notes || '',
			}
      if (editId) {
        const res = await updateTimesheetAction(editId, payload)
        if ('errors' in res && res.errors?._form?.length) throw new Error(res.errors._form[0])
				toast.success('Timesheet updated')
			} else {
        const res = await createTimesheetAction(payload)
        if ('errors' in res && res.errors?._form?.length) throw new Error(res.errors._form[0])
				toast.success('Timesheet created')
			}
			startTransition(() => router.refresh())
		} catch {
			toast.error('Failed to save timesheet')
		}
	}

async function handleSubmitTimesheet(id: string) {
  try {
    await submitTimesheetAction(id)
		toast.success('Timesheet submitted')
		startTransition(() => router.refresh())
	} catch {
		toast.error('Failed to submit timesheet')
	}
}

async function handleApprove(id: string) {
  try {
    await approveTimesheetAction(id)
		toast.success('Timesheet approved')
		startTransition(() => router.refresh())
	} catch {
		toast.error('Failed to approve timesheet')
	}
}

async function handleReject(id: string) {
	setRejectId(id)
	setRejectReason('')
	setRejectOpen(true)
}

return (
		<div className='grid gap-4'>
			<div className='flex items-center justify-between'>
				<h2 className='text-sm font-medium'>Review Timesheets</h2>
				<Button onClick={() => { setEditId(null); setOpen(true) }}>New Timesheet</Button>
			</div>
			<TimesheetTable
				items={items}
				isLoading={isPending}
				onNewTimesheet={() => { setEditId(null); setOpen(true) }}
				onEdit={(id) => { setEditId(id); setOpen(true) }}
				onSubmit={handleSubmitTimesheet}
				onApprove={handleApprove}
				onReject={handleReject}
				onDelete={(id) => {
					// Simple confirm; can be replaced by a styled dialog later
					if (!confirm('Delete this timesheet?')) return
          deleteTimesheetAction(id)
						.then(() => { toast.success('Timesheet deleted'); startTransition(() => router.refresh()) })
						.catch(() => toast.error('Failed to delete timesheet'))
				}}
			/>
			<TimesheetFormDialog
				open={open}
				onOpenChange={(v) => { if (!v) setEditId(null); setOpen(v) }}
				employees={employees}
				defaultValues={editId ? (() => {
					const item = items.find(i => i.id === editId)
					return item ? {
						employee_id: item.user_id || item.employeeId || '',
						periodStart: item.pay_period_start || item.periodStart || '',
						periodEnd: item.pay_period_end || item.periodEnd || '',
						regularHours: item.regular_hours || item.regularHours || 0,
						overtimeHours: item.overtime_hours || item.overtimeHours || 0,
						status: (item.status as 'draft' | 'submitted') || 'draft',
						notes: item.notes || '',
					} : undefined
				})() : undefined}
				onSubmit={handleSave}
				title={editId ? 'Edit Timesheet' : 'New Timesheet'}
				submitLabel={editId ? 'Update' : 'Save'}
			/>
			{/* Reject reason dialog */}
			<Dialog open={rejectOpen} onOpenChange={(v: boolean) => { if (!v) { setRejectId(null); setRejectReason('') }; setRejectOpen(v) }}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Timesheet</DialogTitle>
					</DialogHeader>
					<div className='flex flex-col gap-2'>
						<label className='text-sm'>Reason (optional)</label>
						<textarea className='textarea' rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
					</div>
					<div className='flex justify-end gap-2 pt-2'>
						<Button variant='secondary' onClick={() => setRejectOpen(false)}>Cancel</Button>
						<Button
							variant='destructive'
							onClick={async () => {
								if (!rejectId) return
                try {
                    await rejectTimesheetAction(rejectId, rejectReason || undefined)
									toast.success('Timesheet rejected')
									setRejectOpen(false)
									startTransition(() => router.refresh())
					} catch {
						toast.error('Failed to reject timesheet')
								}
							}}
						>
							Reject
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}


