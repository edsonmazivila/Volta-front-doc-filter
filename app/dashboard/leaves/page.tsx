import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { getLeaveRequests, getLeaveBalances, getPendingApprovals, getTeamBalances } from '@/lib/services/leaves'
import { LeavesSection } from '@/components/leaves/leaves-section'

export default async function LeavesPage() {
  // Only managers and admins can access leave management
  await requireRole(['operational_manager', 'hr_manager', 'system_admin'])
  const [requestsList, balances, pending, teamBalances] = await Promise.all([
    getLeaveRequests(),
    getLeaveBalances(),
    getPendingApprovals(),
    getTeamBalances(),
  ])
  const requests = requestsList.requests
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Leaves' />
        <section className='p-4 grid gap-4'>
          <Card>
            <CardHeader title='Leave Management' />
            <LeavesSection
              requests={requests}
              balances={balances}
              pending={pending}
              teamBalances={teamBalances}
            />
          </Card>
        </section>
      </main>
    </div>
  )
}


