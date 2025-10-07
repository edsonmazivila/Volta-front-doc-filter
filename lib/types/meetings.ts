export type MeetingStatus = 'scheduled' | 'cancelled' | 'completed'
export type ParticipantStatus = 'pending' | 'accepted' | 'declined'

export interface MeetingParticipant {
  user_id: string
  name: string
  status: ParticipantStatus
}

export interface Meeting {
  id: string
  title: string
  description?: string
  datetime: string // ISO datetime
  location?: string
  status: MeetingStatus
  organizer_id: string
  organizer_name?: string
  participants?: MeetingParticipant[]
  is_organizer?: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateMeetingData {
  title: string
  description?: string
  datetime: string
  location?: string
  participant_ids?: string[]
}

export interface ActionResult {
  success?: boolean
  data?: unknown
  errors?: {
    _form?: string[]
    [key: string]: string[] | undefined
  }
}
