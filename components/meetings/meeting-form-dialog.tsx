'use client'
import { useState, useEffect } from 'react'
import type { Meeting } from '@/lib/types/meetings'
import { createMeetingAction, updateMeetingAction } from '@/lib/services/meetings'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { useToastHelpers } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toIsoUtc } from '@/lib/utils'

interface MeetingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting?: Meeting | null
  availableParticipants?: Array<{ id: string; name: string; email?: string }>
}

export function MeetingFormDialog({
  open,
  onOpenChange,
  meeting,
  availableParticipants = [],
}: MeetingFormDialogProps) {
  const router = useRouter()
  const toast = useToastHelpers()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  // Initialize form when meeting changes
  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title || '')
      setDescription(meeting.description || '')
      setLocation(meeting.location || '')

      // Parse datetime
      if (meeting.datetime) {
        try {
          const dt = new Date(meeting.datetime)
          if (!isNaN(dt.getTime())) {
            setDate(format(dt, 'yyyy-MM-dd'))
            setTime(format(dt, 'HH:mm'))
          }
        } catch (error) {
          console.warn('Failed to parse meeting datetime:', meeting.datetime, error)
        }
      }

      // Set participants
      if (meeting.participants) {
        setSelectedParticipants(meeting.participants.map((p) => p.user_id))
      }
    } else {
      // Reset form
      setTitle('')
      setDescription('')
      setDate('')
      setTime('')
      setLocation('')
      setSelectedParticipants([])
    }
  }, [meeting])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !date || !time) {
      toast.error('Title, date, and time are required')
      return
    }

    setIsSubmitting(true)
    try {
      // Create proper ISO datetime string
      const datetimeString = `${date}T${time}`
      const isoDateTime = toIsoUtc(datetimeString)
      
      if (!isoDateTime) {
        toast.error('Invalid date or time format')
        return
      }

      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('datetime', isoDateTime)
      formData.append('location', location.trim())

      
      selectedParticipants.forEach((id) => {
        formData.append('participants_ids', id)
      })

      const result = meeting
        ? await updateMeetingAction(meeting.id, null, formData)
        : await createMeetingAction(null, formData)

      if (result.errors) {
        toast.error(result.errors._form?.[0] || 'Failed to save meeting')
        return
      }

      toast.success(meeting ? 'Meeting updated' : 'Meeting created')
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error('Failed to save meeting')
    } finally {
      setIsSubmitting(false)
    }
  }

  function toggleParticipant(userId: string) {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{meeting ? 'Edit Meeting' : 'Create Meeting'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title <span className="text-red-400">*</span>
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Team standup"
                required
              />
            </div>

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
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-1">
                Time <span className="text-red-400">*</span>
              </label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Conference Room A or Zoom link"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Meeting agenda or details..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Participants
              </label>
              <div className="border border-[var(--border)] rounded-md p-3 max-h-48 overflow-y-auto space-y-2 bg-background">
                {availableParticipants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users available</p>
                ) : (
                  availableParticipants.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(user.id)}
                        onChange={() => toggleParticipant(user.id)}
                        className="rounded border-[var(--border)] text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-foreground">
                        {user.name}
                        {user.email && <span className="text-muted-foreground ml-1">({user.email})</span>}
                      </span>
                    </label>
                  ))
                )}
              </div>
              {selectedParticipants.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedParticipants.length} participant{selectedParticipants.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : meeting ? 'Save Changes' : 'Create Meeting'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
