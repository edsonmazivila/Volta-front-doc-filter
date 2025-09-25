import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { Skeleton } from '@/components/ui'
import { requireUser } from '@/lib/auth/dal'

export default async function UsersPage() {
  await requireUser()
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Users' />
        <section className='p-4 grid gap-4'>
          <Card>
            <CardHeader title='User Accounts' />
            <div className='space-y-2'>
              {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className='h-10' />))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}


