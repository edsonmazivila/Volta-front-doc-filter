'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createMyTimesheetAction, updateMyTimesheetAction } from '@/lib/services/my-timesheets'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { MyTimesheet } from '@/lib/types/my-timesheets'

interface TimesheetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timesheet?: MyTimesheet | null
}

export function TimesheetFormDialog({ open, onOpenChange, timesheet }: TimesheetFormDialogProps) {
  const router = useRouter()
  const isEdit = !!timesheet
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [totalHours, setTotalHours] = useState(0)
  const [notes, setNotes] = useState('')

  // Initialize form when timesheet changes
  useEffect(() => {
    if (timesheet) {
      setPeriodStart(timesheet.period_start || '')
      setPeriodEnd(timesheet.period_end || '')
      setTotalHours(timesheet.total_hours || 0)
      setNotes(timesheet.notes || '')
    } else {
      setPeriodStart('')
      setPeriodEnd('')
      setTotalHours(0)
      setNotes('')
    }
  }, [timesheet])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('period_start', periodStart)
      formData.append('period_end', periodEnd)
      formData.append('total_hours', String(totalHours))
      formData.append('notes', notes)

      let result
      if (isEdit && timesheet) {
        result = await updateMyTimesheetAction(timesheet.id, null, formData)
      } else {
        result = await createMyTimesheetAction(null, formData)
      }

      if (result.success) {
        toast.success(isEdit ? 'Timesheet updated successfully' : 'Timesheet created successfully')
        onOpenChange(false)
        router.refresh()
      } else if (result.errors?._form) {
        toast.error(result.errors._form[0])
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Timesheet' : 'New Timesheet'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="period_start" className="text-sm font-medium">Period Start *</label>
            <input
              type="date"
              id="period_start"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
              className="w-full mt-1 rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="period_end" className="text-sm font-medium">Period End *</label>
            <input
              type="date"
              id="period_end"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              required
              className="w-full mt-1 rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="total_hours" className="text-sm font-medium">Total Hours *</label>
            <input
              type="number"
              id="total_hours"
              value={totalHours}
              onChange={(e) => setTotalHours(Number(e.target.value))}
              min="0"
              step="0.5"
              required
              className="w-full mt-1 rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full mt-1 rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm"
              placeholder="Optional notes about this timesheet..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
