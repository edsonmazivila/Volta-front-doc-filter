import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { Button, Skeleton } from '@/components/ui'

export default function DepartmentsPage() {
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Departments' />
        <section className='p-4 grid gap-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-medium'>Manage Departments</h2>
            <Button>Add Department</Button>
          </div>
          <Card>
            <CardHeader title='Departments' />
            <div className='space-y-2'>
              {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className='h-10' />))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}


