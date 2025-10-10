'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { createMyAttendanceAction, updateMyAttendanceAction } from '@/lib/services/attendance'
import { useToastHelpers } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, FileText } from 'lucide-react'
import type { AttendanceRecord } from '@/lib/types/attendance'
import { formatTimeForInput } from '@/lib/utils'

interface AttendanceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance?: AttendanceRecord | null
  isEdit?: boolean
}

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'justified', label: 'Justified' },
]

export function AttendanceFormDialog({ 
  open, 
  onOpenChange, 
  attendance, 
  isEdit = false 
}: AttendanceFormDialogProps) {
  const router = useRouter()
  const toast = useToastHelpers()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('present')
  const [clockIn, setClockIn] = useState('')
  const [clockOut, setClockOut] = useState('')
  const [justification, setJustification] = useState('')

  // Initialize form when dialog opens or attendance changes
  useEffect(() => {
    if (open) {
      if (isEdit && attendance) {
        // Edit mode - populate with existing data
        setDate(attendance.date ? attendance.date.split('T')[0] : '')
        setStatus(attendance.status || 'present')
        
     
        setClockIn(formatTimeForInput(attendance.clock_in))
        setClockOut(formatTimeForInput(attendance.clock_out))
        setJustification(attendance.justification || '')
      } else {
        // Create mode - set defaults
        const today = new Date().toISOString().split('T')[0]
        setDate(today)
        setStatus('present')
        setClockIn('')
        setClockOut('')
        setJustification('')
      }
    }
  }, [open, isEdit, attendance])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date.trim()) {
      toast.error('Date is required')
      return
    }

    if (status === 'absent' && !justification.trim()) {
      toast.error('Justification is required for absent status')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('date', date)
      formData.append('status', status)
      if (clockIn) formData.append('clock_in', clockIn)
      if (clockOut) formData.append('clock_out', clockOut)
      if (justification) formData.append('justification', justification)

      const result = isEdit && attendance
        ? await updateMyAttendanceAction(null, attendance.id, formData)
        : await createMyAttendanceAction(null, formData)

      if ('errors' in result) {
        toast.error(result.errors._form?.[0] || 'Failed to save attendance')
        return
      }

      toast.success(isEdit ? 'Attendance updated successfully' : 'Attendance recorded successfully')
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error('Failed to save attendance')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isEdit ? 'Edit Attendance' : 'Record Attendance'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Date <span className="text-red-400">*</span>
            </label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Status <span className="text-red-400">*</span>
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clock In */}
          <div>
            <label htmlFor="clockIn" className="flex items-center gap-1 text-sm font-medium mb-1">
              <Clock className="h-4 w-4" />
              Clock In
            </label>
            <Input
              id="clockIn"
              type="time"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Clock Out */}
          <div>
            <label htmlFor="clockOut" className="flex items-center gap-1 text-sm font-medium mb-1">
              <Clock className="h-4 w-4" />
              Clock Out
            </label>
            <Input
              id="clockOut"
              type="time"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Justification */}
          <div>
            <label htmlFor="justification" className="flex items-center gap-1 text-sm font-medium mb-1">
              <FileText className="h-4 w-4" />
              Justification
              {status === 'absent' && <span className="text-red-400">*</span>}
            </label>
            <textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reason for absence or additional notes..."
              disabled={isSubmitting}
              required={status === 'absent'}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting 
                ? (isEdit ? 'Updating...' : 'Recording...') 
                : (isEdit ? 'Update Attendance' : 'Record Attendance')
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
