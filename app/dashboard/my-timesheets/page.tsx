import { requireUser } from '@/lib/auth/dal'
import { Header } from '@/components/dashboard/header'
import { MyTimesheetsSection } from '@/components/my-timesheets/my-timesheets-section'
import { getMyTimesheets } from '@/lib/services/my-timesheets'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export default async function MyTimesheetsPage() {
  await getLocaleAndInitialize()
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