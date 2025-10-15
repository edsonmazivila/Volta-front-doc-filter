'use client'
import { useState } from 'react'
import type { Meeting } from '@/lib/types/meetings'
import { deleteMeetingAction, respondToMeetingAction, cancelMeetingAction } from '@/lib/services/meetings'
import { Button } from '@/components/ui'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { useToastHelpers } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, User } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface MeetingCardProps {
  meeting: Meeting
  currentUserId?: string
  onEdit?: (meeting: Meeting) => void
}

export function MeetingCard({ meeting, currentUserId, onEdit }: MeetingCardProps) {
  const router = useRouter()
  const toast = useToastHelpers()
  const [isProcessing, setIsProcessing] = useState(false)
  const [responseStatus, setResponseStatus] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelledLocally, setIsCancelledLocally] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)


  const isOrganizer = meeting.is_organizer || meeting.organizer_id === currentUserId
  
  // Find current user's participant status
  const currentUserParticipant = meeting.participants?.find(p => p.user_id === currentUserId)
  const userResponseStatus = currentUserParticipant?.status || 'pending'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'declined':
        return 'bg-red-50 border-red-200 text-red-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  const getParticipantDotColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500'
      case 'declined':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  async function handleCancel() {
    setIsProcessing(true)
    try {
      const result = await cancelMeetingAction(meeting.id)
      if (result.errors) {
        toast.error(result.errors._form?.[0] || 'Failed to cancel meeting')
        return
      }
      toast.success('Meeting cancelled')
      setIsCancelledLocally(true)
      setShowCancelDialog(false)
      router.refresh()
    } catch {
      toast.error('Failed to cancel meeting')
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleDelete() {
    setIsProcessing(true)
    try {
      const result = await deleteMeetingAction(meeting.id)
      if (result.errors) {
        toast.error(result.errors._form?.[0] || 'Failed to delete meeting')
        return
      }
      toast.success('Meeting deleted')
      setShowDeleteDialog(false)
      router.refresh()
    } catch {
      toast.error('Failed to delete meeting')
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleRespond(decision: 'accept' | 'decline') {
    setIsProcessing(true)
    try {
      const result = await respondToMeetingAction(meeting.id, decision)
      if (result.errors) {
        toast.error(result.errors._form?.[0] || `Failed to ${decision} meeting`)
        return
      }
      toast.success(`Meeting ${decision}ed`)
      setResponseStatus(decision === 'accept' ? 'accepted' : 'declined')
      router.refresh()
    } catch {
      toast.error(`Failed to ${decision} meeting`)
    } finally {
      setIsProcessing(false)
    }
  }

  const formattedDateTime = meeting.datetime
    ? formatDateTime(meeting.datetime)
    : 'Date TBD'

  return (
    <div className="border border-[var(--border)] rounded-lg p-4 mb-3 bg-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span>{formattedDateTime}</span>
            {meeting.location && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <MapPin className="h-4 w-4" />
                <span>{meeting.location}</span>
              </>
            )}
          </div>

          <h4 className="text-base font-semibold text-card-foreground mb-1">{meeting.title}</h4>

          {meeting.description && (
            <p className="text-sm text-muted-foreground mb-2">{meeting.description}</p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <User className="h-3 w-3" />
            <span>
              Organizer: <span className="font-medium">{meeting.organizer_name || 'Unknown'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {responseStatus || (userResponseStatus !== 'pending' && !isOrganizer) ? (
            <span
              className={`text-sm px-3 py-1.5 rounded border ${
                (responseStatus || userResponseStatus) === 'accepted'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-200 text-gray-800 border-gray-300'
              }`}
            >
              {(responseStatus || userResponseStatus) === 'accepted' ? 'Accepted' : 'Declined'}
            </span>
          ) : isOrganizer ? (
            <>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(meeting)}
                  disabled={isProcessing || isCancelledLocally || meeting.status !== 'scheduled'}
                >
                  Edit
                </Button>
              )}

              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isProcessing || isCancelledLocally || meeting.status !== 'scheduled'}
                    className="border-red-200 text-red-500 hover:bg-red-50 "
                  >
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel meeting?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel the meeting for all participants. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing}>Keep meeting</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} disabled={isProcessing} className="bg-red-600 hover:bg-red-600 text-white">
                      {isProcessing ? 'Cancelling…' : 'Cancel meeting'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete meeting permanently?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the meeting entirely. Participants will no longer see it. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isProcessing} className="bg-red-700 hover:bg-red-700 text-white">
                      {isProcessing ? 'Deleting…' : 'Delete meeting'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : !isOrganizer && userResponseStatus === 'pending' ? (
            <>
              <Button
                size="sm"
                onClick={() => handleRespond('accept')}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRespond('decline')}
                disabled={isProcessing}
              >
                Decline
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {meeting.participants && meeting.participants.length > 0 ? (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <div className="text-xs text-muted-foreground mb-2">Participants</div>
          <div className="flex flex-wrap gap-2">
            {meeting.participants.map((participant, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded border ${getParticipantStatusColor(
                  participant.status
                )}`}
              >
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${getParticipantDotColor(participant.status)}`} />
                {participant.name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <div className="text-xs text-muted-foreground">No participants listed</div>
        </div>
      )}
    </div>
  )
}
