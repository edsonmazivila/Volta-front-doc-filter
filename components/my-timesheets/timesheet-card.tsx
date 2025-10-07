'use client'
import { format } from 'date-fns'
import { Calendar, Clock, FileText, Send, Trash2, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MyTimesheet } from '@/lib/types/my-timesheets'
import { submitMyTimesheetAction, deleteMyTimesheetAction } from '@/lib/services/my-timesheets'
import { toast } from 'sonner'
import { useTransition } from 'react'

interface TimesheetCardProps {
  timesheet: MyTimesheet
  onEdit?: (timesheet: MyTimesheet) => void
}

export function TimesheetCard({ timesheet, onEdit }: TimesheetCardProps) {
  const [isPending, startTransition] = useTransition()

  const statusColors = {
    draft: 'bg-gray-500',
    submitted: 'bg-blue-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
  }

  const canEdit = timesheet.status === 'draft'
  const canSubmit = timesheet.status === 'draft' && timesheet.total_hours > 0
  const canDelete = timesheet.status === 'draft'

  function handleSubmit() {
    if (!canSubmit) return

    startTransition(async () => {
      try {
        await submitMyTimesheetAction(timesheet.id)
        toast.success('Timesheet submitted successfully')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to submit timesheet')
      }
    })
  }

  function handleDelete() {
    if (!canDelete) return

    if (!confirm('Are you sure you want to delete this timesheet?')) return

    startTransition(async () => {
      try {
        await deleteMyTimesheetAction(timesheet.id)
        toast.success('Timesheet deleted successfully')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete timesheet')
      }
    })
  }

  function handleEdit() {
    if (canEdit && onEdit) {
      onEdit(timesheet)
    }
  }

  return (
    <div className="bg-card border border-[var(--border)] rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {format(new Date(timesheet.period_start), 'MMM d, yyyy')} -{' '}
              {format(new Date(timesheet.period_end), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {timesheet.total_hours} hours
            </span>
          </div>
        </div>
        <Badge className={statusColors[timesheet.status]}>
          {timesheet.status}
        </Badge>
      </div>

      {timesheet.notes && (
        <div className="flex items-start gap-2 mb-3 text-sm text-muted-foreground">
          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2">{timesheet.notes}</p>
        </div>
      )}

      {timesheet.submitted_at && (
        <div className="text-xs text-muted-foreground mb-3">
          Submitted: {format(new Date(timesheet.submitted_at), 'MMM d, yyyy h:mm a')}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            disabled={isPending}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
        {canSubmit && (
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1"
          >
            <Send className="w-4 h-4 mr-1" />
            Submit
          </Button>
        )}
        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
