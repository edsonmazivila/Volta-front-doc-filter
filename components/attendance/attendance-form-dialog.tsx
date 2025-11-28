'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { createMyAttendanceAction, updateMyAttendanceAction, submitJustificationAction } from '@/lib/services/attendance'
import { useToastHelpers } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, FileText, Upload, X, ExternalLink } from 'lucide-react'
import type { AttendanceRecord } from '@/lib/types/attendance'
import { formatTimeForInput } from '@/lib/utils'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface AttendanceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance?: AttendanceRecord | null
  isEdit?: boolean
}

export function AttendanceFormDialog({
  open,
  onOpenChange,
  attendance,
  isEdit = false
}: AttendanceFormDialogProps) {
  const router = useRouter()
  const toast = useToastHelpers()
  const { i18n } = useLingui()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const STATUS_OPTIONS = [
    { value: 'present', label: i18n._(msg`Present`) },
    { value: 'absent', label: i18n._(msg`Absent`) },
    { value: 'late', label: i18n._(msg`Late`) },
    { value: 'half_day', label: i18n._(msg`Half Day`) },
    { value: 'on_leave', label: i18n._(msg`On Leave`) },
    { value: 'justified', label: i18n._(msg`Justified`) },
  ]

  // Form state
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('present')
  const [clockIn, setClockIn] = useState('')
  const [clockOut, setClockOut] = useState('')
  const [justification, setJustification] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

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
       
        setUploadedFile(null)
      } else {
        // Create mode - set defaults
        const today = new Date().toISOString().split('T')[0]
        setDate(today)
        setStatus('present')
        setClockIn('')
        setClockOut('')
        setJustification('')
        setUploadedFile(null)
      }
    }
  }, [open, isEdit, attendance])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(i18n._(msg`File size must be less than 10MB`))
        return
      }
      setUploadedFile(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date.trim()) {
      toast.error(i18n._(msg`Date is required`))
      return
    }

    if (status === 'absent' && !justification.trim()) {
      toast.error(i18n._(msg`Justification is required for absent status`))
      return
    }

    if (status === 'late' && !justification.trim()) {
      toast.error(i18n._(msg`Justification is required for late status`))
      return
    }

    setIsSubmitting(true)
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const formData = new FormData()
      formData.append('date', date)
      
      let result
      if (!isEdit && (status === 'absent' || status === 'late')) {
        formData.append('reason', justification)
				if (uploadedFile) {
					formData.append('document', uploadedFile)
				}
        result = await submitJustificationAction(null, formData)
      } else if (isEdit && attendance) {
        formData.append('status', status)
        formData.append('timezone', timezone)
        if (clockIn) formData.append('clock_in', clockIn)
        if (clockOut) formData.append('clock_out', clockOut)
        if (justification) formData.append('justification', justification)
        result = await updateMyAttendanceAction(null, attendance.id, formData)
      } else {
        
        formData.append('status', status)
        formData.append('timezone', timezone)
        if (clockIn) formData.append('clock_in', clockIn)
        if (clockOut) formData.append('clock_out', clockOut)
        if (justification) formData.append('justification', justification)
        result = await createMyAttendanceAction(null, formData)
      }

      if ('errors' in result) {
        toast.error(result.errors._form?.[0] || i18n._(msg`Failed to save attendance`))
        return
      }

      const successMessage = isEdit
        ? i18n._(msg`Attendance updated successfully`)
        : (status === 'absent' || status === 'late'
          ? i18n._(msg`Justification submitted successfully`)
          : i18n._(msg`Attendance issue reported successfully`))
      toast.success(successMessage)
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error(i18n._(msg`Failed to save attendance`))
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
            {isEdit ? i18n._(msg`Edit Attendance`) : i18n._(msg`Report Attendance Issue`)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              {i18n._(msg`Date`)} <span className="text-red-400">*</span>
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
              {i18n._(msg`Status`)} <span className="text-red-400">*</span>
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
          {(status === 'present' || status === 'late' || status === 'half_day') && (
          <div>
            <label htmlFor="clockIn" className="flex items-center gap-1 text-sm font-medium mb-1">
              <Clock className="h-4 w-4" />
              {i18n._(msg`Clock In`)}
            </label>
            <Input
              id="clockIn"
              type="time"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          )}

          {/* Clock Out */}
          {(status === 'present' || status === 'late' || status === 'half_day') && (
          <div>
            <label htmlFor="clockOut" className="flex items-center gap-1 text-sm font-medium mb-1">
              <Clock className="h-4 w-4" />
              {i18n._(msg`Clock Out`)}
            </label>
            <Input
              id="clockOut"
              type="time"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          )}

          {/* Justification - Show for absent/late/justified status or when editing existing justification/document */}
          {(status === 'absent' || status === 'late' || status === 'justified' || (isEdit && (attendance?.justification || attendance?.justification_document_url))) && (
            <div className="space-y-3">
              <div>
                <label htmlFor="justification" className="flex items-center gap-1 text-sm font-medium mb-1">
                  <FileText className="h-4 w-4" />
                  {i18n._(msg`Justification`)}
                  {(status === 'absent' || status === 'late') && <span className="text-red-400">*</span>}
                </label>
                <textarea
                  id="justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={i18n._(msg`Enter reason for absence/lateness or additional notes...`)}
                  disabled={isSubmitting}
                  required={status === 'absent' || status === 'late'}
                />
              </div>

              {/* File Upload for Justification */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium mb-2">
                  <Upload className="h-4 w-4" />
                  {i18n._(msg`Supporting Document`)}{' '}
                  <span className="text-xs text-muted-foreground font-normal">({i18n._(msg`Optional`)})</span>
                </label>
                
                {!uploadedFile && !attendance?.justification_document_url ? (
                  // No document uploaded yet
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {i18n._(msg`Upload Document`)}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      {i18n._(msg`Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB)`)}
                    </p>
                  </div>
                ) : uploadedFile ? (
                  // New file selected (to be uploaded or replacing existing)
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 rounded-md border border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
                      <FileText className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-green-900 dark:text-green-100">{uploadedFile.name}</p>
                        <p className="text-xs text-green-700 dark:text-green-400">
                          {i18n._(msg`New file`)} · {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        disabled={isSubmitting}
                        className="flex-shrink-0 hover:bg-green-100 dark:hover:bg-green-900"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {attendance?.justification_document_url && (
                      <p className="text-xs text-muted-foreground">
                        {i18n._(msg`This will replace`)}: {attendance.justification_document_filename || i18n._(msg`existing document`)}
                      </p>
                    )}
                  </div>
                ) : attendance?.justification_document_url ? (
                  // Existing document (edit mode)
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 rounded-md border border-[var(--border)] bg-muted/30">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attendance.justification_document_filename || i18n._(msg`Uploaded document`)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {i18n._(msg`Current document`)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attendance.justification_document_url, '_blank')}
                        disabled={isSubmitting}
                        className="flex-shrink-0"
                        title={i18n._(msg`View document`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="hidden"
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting}
                        className="w-full"
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {i18n._(msg`Replace with new document`)}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting
                ? (isEdit ? i18n._(msg`Updating...`) : i18n._(msg`Reporting...`))
                : (isEdit ? i18n._(msg`Update Attendance`) : i18n._(msg`Report Issue`))
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {i18n._(msg`Cancel`)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
