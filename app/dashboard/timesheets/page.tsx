import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { getTimesheets } from '@/lib/services/timesheets'
import { getUsers, type User } from '@/lib/services/users'
import { TimesheetsSection } from '@/components/timesheets/timesheets-section'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export default async function TimesheetsPage() {
  await getLocaleAndInitialize()
  // Only managers and admins can access timesheet management
  const user = await requireRole(['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'])
  const canFetchUsers = ['operational_manager', 'hr_manager', 'system_admin'].includes(user.role)

  const [items, fetchedUsers] = await Promise.all([
    getTimesheets(),
    canFetchUsers ? getUsers() : Promise.resolve<User[]>([])
  ])

  const employees: User[] = canFetchUsers && fetchedUsers.length > 0
    ? fetchedUsers
    : Array.from(new Map(
        items.map((item, index) => {
          const id = item.user_id || item.employeeId || `timesheet-${index}`
          return [id, {
            id,
            email: '',
            role: 'employee',
            full_name: item.employeeName || 'Employee',
            company_id: '',
            is_active: true,
            created_at: '',
            updated_at: '',
            is_employee: true,
            can_login: false,
          } as User]
        })
      ).values())

  return (
    <>
      <Header title={t`Timesheets`} />
      <section className='p-4 grid gap-4 overflow-y-auto'>
        <Card>
          <CardHeader title={t`This Period`} />
          <TimesheetsSection items={items} employees={employees} />
        </Card>
      </section>
    </>
  )
}


