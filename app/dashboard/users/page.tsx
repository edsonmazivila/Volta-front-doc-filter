import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireUser } from '@/lib/auth/dal'
import { UserManagement } from '@/components/users/user-management'
import { fetchUsersServer, fetchUsersStatsServer } from '@/lib/services/users-server'
import type { User as UIUser, UserStats as UIUserStats } from '@/components/users/user-management'

export default async function UsersPage() {
  await requireUser()
  const [initialUsers, initialStats] = await Promise.all([
    fetchUsersServer(),
    fetchUsersStatsServer(),
  ])
  const normalizedUsers: UIUser[] = (initialUsers || []).map((u) => ({
    id: u.id,
    first_name: u.first_name,
    last_name: u.last_name,
    email: u.email,
    role: u.role as any,
    is_active: u.is_active,
    created_at: u.created_at,
    updated_at: '',
  }))
  const normalizedStats: UIUserStats = initialStats as unknown as UIUserStats
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Users' />
        <section className='p-4 grid gap-4'>
          <Card>
            <CardHeader title='User Management' />
            <UserManagement initialUsers={normalizedUsers} initialStats={normalizedStats} />
          </Card>
        </section>
      </main>
    </div>
  )
}


