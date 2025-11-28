import { requireUser } from '@/lib/auth/dal'
import { Header } from '@/components/dashboard/header'
import { MyTimesheetsSection } from '@/components/my-timesheets/my-timesheets-section'
import { getMyTimesheets } from '@/lib/services/my-timesheets'
import { t } from '@lingui/core/macro'

export default async function MyTimesheetsPage() {
  await requireUser()

  const timesheets = await getMyTimesheets()

  return (
    <>
      <Header title={t`My Timesheets`} />
      <section className="p-4 overflow-y-auto">
        <MyTimesheetsSection timesheets={timesheets} />
      </section>
    </>
  )
}