import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { Button, Skeleton } from '@/components/ui'

export default function TimesheetsPage() {
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Timesheets' />
        <section className='p-4 grid gap-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-medium'>Review Timesheets</h2>
            <Button>New Timesheet</Button>
          </div>
          <Card>
            <CardHeader title='This Period' />
            <div className='space-y-2'>
              {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className='h-10' />))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}


