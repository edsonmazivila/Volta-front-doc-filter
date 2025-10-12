import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { getLeaveRequests, getLeaveBalances, getPendingApprovals, getTeamBalances } from '@/lib/services/leaves'
import { LeaveManagement } from '@/components/leaves/leave-management'

export default async function LeavesPage() {
  await requireRole(['operational_manager', 'hr_manager', 'system_admin'])
  const [requestsList, , pending, teamBalances] = await Promise.all([
    getLeaveRequests(),
    getLeaveBalances(),
    getPendingApprovals(),
    getTeamBalances(),
  ])
  const requests = requestsList.requests
  
  return (
    <>
      <Header title='Leaves' />
      <section className='p-4 overflow-y-auto'>
        <div>
          <h1 className="text-xl font-bold mb-2">
            Manage leave requests and team balances.
          </h1>
        </div>
        <LeaveManagement
          requests={requests}
          pending={pending}
          teamBalances={teamBalances}
        />
      </section>
    </>
  )
}


