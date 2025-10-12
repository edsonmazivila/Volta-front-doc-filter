import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { UserManagement } from '@/components/users/user-management'
import { getUsers, getUserStats } from '@/lib/services/users'

export default async function UsersPage() {

  await requireRole(['hr_manager', 'system_admin'])

  const [users, stats] = await Promise.all([
    getUsers(),
    getUserStats(),
  ])

  return (
    <>
      <Header title='Users' />
      <section className='p-4 overflow-y-auto'>
        <div>
          <h1 className="text-xl font-bold mb-2">
            Manage users and access permissions
          </h1>
        </div>
        <UserManagement users={users} stats={stats} />
      </section>
    </>
  )
}


