import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireUser } from '@/lib/auth/dal'
import { getTimesheets } from '@/lib/services/timesheets'
import { getEmployees } from '@/lib/services/employees'
import { TimesheetsSection } from '@/components/timesheets/timesheets-section'

export default async function TimesheetsPage() {
  // Accessible by all authenticated users, backend returns data based on role
  await requireUser()
  const [items, employeesData] = await Promise.all([
    getTimesheets(),
    getEmployees({ status: 'active' })
  ])
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Timesheets' />
        <section className='p-4 grid gap-4'>
          <Card>
            <CardHeader title='This Period' />
            <TimesheetsSection items={items} employees={employeesData.items} />
          </Card>
        </section>
      </main>
    </div>
  )
}


