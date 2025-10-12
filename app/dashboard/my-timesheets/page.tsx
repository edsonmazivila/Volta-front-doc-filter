import { requireUser } from '@/lib/auth/dal'
import { Header } from '@/components/dashboard/header'
import { MyTimesheetsSection } from '@/components/my-timesheets/my-timesheets-section'
import { getMyTimesheets } from '@/lib/services/my-timesheets'

export default async function MyTimesheetsPage() {
  await requireUser()

  const timesheets = await getMyTimesheets()

  return (
    <>
      <Header title="My Timesheets" />
      <section className="p-4 overflow-y-auto">
        <MyTimesheetsSection timesheets={timesheets} />
      </section>
    </>
  )
}