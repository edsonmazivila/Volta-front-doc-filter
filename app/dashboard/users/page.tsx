import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { UserManagement } from '@/components/users/user-management'
import { getUsers, getUserStats } from '@/lib/services/users'

export default async function UsersPage() {
  // Only HR managers and admins can manage users
  await requireRole(['hr_manager', 'system_admin'])

  const [users, stats] = await Promise.all([
    getUsers(),
    getUserStats(),
  ])

  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Users' />
        <section className='p-4 grid gap-4'>
          <Card>
            <CardHeader title='User Management' />
            <UserManagement users={users} stats={stats} />
          </Card>
        </section>
      </main>
    </div>
  )
}


