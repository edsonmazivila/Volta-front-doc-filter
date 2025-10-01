import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireUser } from '@/lib/auth/dal'
import { fetchTimesheets } from '@/lib/services/timesheets-server'
import { TimesheetsSection } from '@/components/timesheets/timesheets-section'

export default async function TimesheetsPage() {
  await requireUser()
  const items = await fetchTimesheets()
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Timesheets' />
        <section className='p-4 grid gap-4'>
          <Card>
            <CardHeader title='This Period' />
            <TimesheetsSection items={items} />
          </Card>
        </section>
      </main>
    </div>
  )
}


