import { requireUser } from '@/lib/auth/dal'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MyTimesheetsSection } from '@/components/my-timesheets/my-timesheets-section'
import { getMyTimesheets } from '@/lib/services/my-timesheets'

export default async function MyTimesheetsPage() {
  await requireUser()

  const timesheets = await getMyTimesheets()

  return (
    <div className="min-h-dvh flex app-background">
      <Sidebar />
      <main className="flex-1">
        <Header title="My Timesheets" />
        <section className="p-4">
          <MyTimesheetsSection timesheets={timesheets} />
        </section>
      </main>
    </div>
  )
}