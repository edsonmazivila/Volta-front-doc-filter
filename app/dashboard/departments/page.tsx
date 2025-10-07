import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { DepartmentManagement } from '@/components/departments/department-management'
import { getDepartments, getDepartmentStats } from '@/lib/services/departments'
import { getUsers } from '@/lib/services/users'

export default async function DepartmentsPage() {
  // Only managers and admins can access department management
  await requireRole(['operational_manager', 'hr_manager', 'system_admin'])

  const [departments, stats, allUsers] = await Promise.all([
    getDepartments(),
    getDepartmentStats(),
    getUsers(),
  ])

  // Get potential managers (users with manager/admin roles)
  const managers = allUsers
    .filter((u) => ['system_admin', 'hr_manager', 'payroll_manager', 'operational_manager', ].includes(u.role))
    .map((u) => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
    }))

  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Departments' />
        <section className='p-4 grid gap-4'>
          <Card>
            <CardHeader title='Department Management' />
            <DepartmentManagement
              departments={departments}
              stats={stats}
              managers={managers}
            />
          </Card>
        </section>
      </main>
    </div>
  )
}


