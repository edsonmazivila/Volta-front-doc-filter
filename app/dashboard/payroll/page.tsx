import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader, Stat } from '@/components/dashboard/card'
import { Button, Skeleton } from '@/components/ui'
import { requireUser } from '@/lib/auth/dal'

export default async function PayrollPage() {
  await requireUser()
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Payroll Processing' />
        <section className='p-4 grid gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card><Stat label='Current Period' value={'—'} /></Card>
            <Card><Stat label='Total Hours' value={'—'} /></Card>
            <Card><Stat label='Gross Payroll' value={'—'} /></Card>
          </div>
          <Card>
            <CardHeader title='Pending Approvals' action={<Button>Run Payroll</Button>} />
            <div className='space-y-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-10' />
              ))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}


