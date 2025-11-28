import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { getLeaveRequests, getTeamBalances } from '@/lib/services/leaves'
import { LeaveManagement } from '@/components/leaves/leave-management'
import { t } from '@lingui/core/macro'

export default async function LeavesPage() {
  await requireRole(['operational_manager', 'hr_manager', 'system_admin'])
  const [requestsList, teamBalances] = await Promise.all([
    getLeaveRequests(),
    getTeamBalances(),
  ])
  const requests = requestsList.requests.filter(request => request.status !== 'DRAFT')

  return (
    <>
      <Header title={t`Leaves`} />
      <section className='p-4 overflow-y-auto'>
        <div>
          <h1 className="text-xl font-bold mb-2">
            {t`Manage leave requests and team balances.`}
          </h1>
        </div>
        <LeaveManagement
          requests={requests}
          teamBalances={teamBalances}
        />
      </section>
    </>
  )
}


