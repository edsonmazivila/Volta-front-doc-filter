import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { getTimesheets } from '@/lib/services/timesheets'
import { getUsers } from '@/lib/services/users'
import { TimesheetsSection } from '@/components/timesheets/timesheets-section'

export default async function TimesheetsPage() {
  // Only managers and admins can access timesheet management
  await requireRole(['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'])
  const [items, users] = await Promise.all([
    getTimesheets(),
    getUsers()
  ])
  
  // Filter for active employees only
  const employees = users.filter(u => u.is_employee && u.is_active)
  
  return (
    <>
      <Header title='Timesheets' />
      <section className='p-4 grid gap-4 overflow-y-auto'>
        <Card>
          <CardHeader title='This Period' />
          <TimesheetsSection items={items} employees={employees} />
        </Card>
      </section>
    </>
  )
}


