import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { requireUser, verifySession } from '@/lib/auth/dal'
import { getMyMeetings, getAvailableParticipants } from '@/lib/services/meetings'
import { MeetingsSection } from '@/components/meetings/meetings-section'

export const metadata = {
  title: 'Meetings - NexuPayroll',
  description: 'Manage your meetings and agenda',
}

export default async function MeetingsPage() {
  await requireUser()
  const session = await verifySession()

  const [meetings, participants] = await Promise.all([
    getMyMeetings(),
    getAvailableParticipants(),
  ])

  return (
    <div className="min-h-dvh flex app-background">
      <Sidebar />
      <main className="flex-1">
        <Header title="Meetings" />
        <section className="p-4">
          <MeetingsSection
            meetings={meetings}
            availableParticipants={participants}
            currentUserId={session?.user?.id}
          />
        </section>
      </main>
    </div>
  )
}
