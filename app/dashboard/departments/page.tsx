import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireUser } from '@/lib/auth/dal'
import { DepartmentManagement } from '@/components/departments/department-management'
import { fetchDepartmentsServer, fetchDepartmentsStatsServer } from '@/lib/services/departments-server'
import { fetchUsersServer } from '@/lib/services/users-server'
import type { Department, DepartmentStats } from '@/components/departments/department-management'

export default async function DepartmentsPage() {
  await requireUser()

  const [initialDepartments, initialStats, allUsers] = await Promise.all([
    fetchDepartmentsServer(),
    fetchDepartmentsStatsServer(),
    fetchUsersServer(),
  ])

  const normalizedDepartments: Department[] = (initialDepartments || []).map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    manager_id: d.manager_id,
    manager: d.manager,
    is_active: d.is_active,
    created_at: d.created_at,
    updated_at: d.updated_at,
  }))

  const normalizedStats: DepartmentStats = initialStats as unknown as DepartmentStats

  // Get potential managers (users with manager/admin roles)
  const managers = allUsers
    .filter((u) => ['system_admin', 'hr_manager', 'payroll_manager', 'operational_manager', 'manager'].includes(u.role))
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
              initialDepartments={normalizedDepartments}
              initialStats={normalizedStats}
              managers={managers}
            />
          </Card>
        </section>
      </main>
    </div>
  )
}


