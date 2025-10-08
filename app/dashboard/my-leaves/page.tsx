import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { getMyLeaveRequests, getLeaveBalances } from '@/lib/services/leaves'
import { MyLeavesSection } from '@/components/leaves/my-leaves-section'

export default async function MyLeavesPage() {
  await requireRole(['employee','operational_manager','hr_manager','payroll_manager'])
  const [requests, balances] = await Promise.all([
    getMyLeaveRequests().catch(() => []),
    getLeaveBalances().catch(() => []),
  ])
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='My Leaves' />
        <section className='p-4 grid gap-4'>
          <MyLeavesSection requests={requests} balances={balances} />
        </section>
      </main>
    </div>
  )
}


