import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireUser } from '@/lib/auth/dal'
import { fetchMyLeaveRequests, fetchLeaveBalances, fetchPendingApprovals } from '@/lib/services/leaves-server'
import { LeavesSection } from '@/components/leaves/leaves-section'

export default async function LeavesPage() {
  await requireUser()
  const [requests, balances, pending] = await Promise.all([
    fetchMyLeaveRequests(),
    fetchLeaveBalances(),
    fetchPendingApprovals(),
  ])
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Leaves' />
        <section className='p-4 grid gap-4'>
          <Card>
            <CardHeader title='Leave Management' />
            <LeavesSection requests={requests} balances={balances} pending={pending} />
          </Card>
        </section>
      </main>
    </div>
  )
}


