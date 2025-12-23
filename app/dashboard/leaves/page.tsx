import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { requireUser } from '@/lib/auth/dal'
import { getLeaveRequests, getTeamBalances } from '@/lib/services/leaves'
import { LeaveManagement } from '@/components/leaves/leave-management'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export default async function LeavesPage() {
  await getLocaleAndInitialize()
  const user = await requireUser()
  await requireRole(['operational_manager', 'hr_manager', 'system_admin', 'organization_admin'])
  
  // Organization admin might not have team balances endpoint working yet
  const isOrgAdmin = user.role === 'organization_admin'
  
  const [requestsList, teamBalances] = await Promise.all([
    getLeaveRequests(),
    isOrgAdmin 
      ? Promise.resolve([]) 
      : getTeamBalances().catch((err) => {
          console.error('Failed to fetch team balances:', err.message);
          return [];
        }),
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


