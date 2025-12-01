import { Header } from '@/components/dashboard/header'
import { requireUser, verifySession } from '@/lib/auth/dal'
import { getMyMeetings, getAvailableParticipants } from '@/lib/services/meetings'
import { MeetingsSection } from '@/components/meetings/meetings-section'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export const metadata = {
  title: 'Meetings - NexuPayroll',
  description: 'Manage your meetings and agenda',
}

export default async function MeetingsPage() {
  await getLocaleAndInitialize()
  await requireUser()
  const session = await verifySession()

  const [meetings, participants] = await Promise.all([
    getMyMeetings(),
    getAvailableParticipants(),
  ])

  return (
    <>
      <Header title={t`Meetings`} />
      <section className="p-4 overflow-y-auto">
        <MeetingsSection
          meetings={meetings}
          availableParticipants={participants}
          currentUserId={session?.user?.id}
        />
      </section>
    </>
  )
}
