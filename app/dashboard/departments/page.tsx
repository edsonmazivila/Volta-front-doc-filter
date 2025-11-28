import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { DepartmentManagement } from '@/components/departments/department-management'
import { getDepartments, getDepartmentStats } from '@/lib/services/departments'
import { getUsers } from '@/lib/services/users'
import { t } from '@lingui/core/macro'

export default async function DepartmentsPage() {
  await requireRole(['hr_manager', 'system_admin'])

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
      full_name: u.full_name,
    }))

  return (
    <>
      <Header title={t`Departments`} />
      <section className='p-4 overflow-y-auto'>
        <div>
          <h1 className="text-xl font-bold mb-2">
            {t`Manage departments and organizational structure`}
          </h1>
        </div>
        <DepartmentManagement
          departments={departments}
          stats={stats}
          managers={managers}
        />
      </section>
    </>
  )
}


