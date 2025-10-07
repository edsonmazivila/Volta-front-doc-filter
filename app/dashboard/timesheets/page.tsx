import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { getTimesheets } from '@/lib/services/timesheets'
import { TimesheetsSection } from '@/components/timesheets/timesheets-section'

export default async function TimesheetsPage() {
  // Only managers and admins can access timesheet management
  await requireRole(['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'])
  const items = await getTimesheets()
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


