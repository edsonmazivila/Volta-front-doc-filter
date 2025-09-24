import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { Button, Skeleton } from '@/components/ui'

export default function LeavesPage() {
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Leaves' />
        <section className='p-4 grid gap-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-medium'>Leave Management</h2>
            <Button>Request Leave</Button>
          </div>
          <Card>
            <CardHeader title='Upcoming Leaves' />
            <div className='space-y-2'>
              {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className='h-10' />))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}


