'use client'
import { useState, useMemo } from 'react'
import type { Meeting } from '@/lib/types/meetings'
import { MeetingCard } from '@/components/meetings/meeting-card'
import { MeetingFormDialog } from '@/components/meetings/meeting-form-dialog'
import { Button } from '@/components/ui'
import { SearchInput } from '@/components/search-input'
import { Plus } from 'lucide-react'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface MeetingsSectionProps {
  meetings: Meeting[]
  availableParticipants?: Array<{ id: string; name: string; email?: string }>
  currentUserId?: string
}

export function MeetingsSection({ meetings, availableParticipants = [], currentUserId }: MeetingsSectionProps) {
  const { i18n } = useLingui()
  const [open, setOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return meetings

    return meetings.filter((m) => {
      const matchesTitle = m.title?.toLowerCase().includes(q)
      const matchesDescription = m.description?.toLowerCase().includes(q)
      const matchesLocation = m.location?.toLowerCase().includes(q)
      const matchesOrganizer = m.organizer_name?.toLowerCase().includes(q)
      return matchesTitle || matchesDescription || matchesLocation || matchesOrganizer
    })
  }, [meetings, search])

  function handleNew() {
    setEditingMeeting(null)
    setOpen(true)
  }

  function handleEdit(meeting: Meeting) {
    setEditingMeeting(meeting)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setEditingMeeting(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div>
          <h2 className="text-sm font-medium">{i18n._(msg`My Agenda`)}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {i18n._(msg`Manage, accept or decline meeting invitations`)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder={i18n._(msg`Search meetings...`)} />
          <Button onClick={handleNew} size="sm" className="shrink-0">
            <Plus className="h-4 w-4 mr-1" />
            {i18n._(msg`New Meeting`)}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-lg">
          <div className="text-muted-foreground">
            {search ? i18n._(msg`No meetings match your search`) : i18n._(msg`No meetings scheduled`)}
          </div>
          {!search && (
            <Button variant="outline" size="sm" onClick={handleNew} className="mt-3">
              <Plus className="h-4 w-4 mr-1" />
              {i18n._(msg`Schedule a Meeting`)}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              currentUserId={currentUserId}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <MeetingFormDialog
        open={open}
        onOpenChange={handleClose}
        meeting={editingMeeting}
        availableParticipants={availableParticipants}
      />
    </div>
  )
}
