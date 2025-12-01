import { Header } from '@/components/dashboard/header'
import { requireUser } from '@/lib/auth/dal'
import { getMyLeaveRequests, getLeaveBalances } from '@/lib/services/leaves'
import { MyLeavesSection } from '@/components/leaves/my-leaves-section'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export default async function MyLeavesPage() {
  await getLocaleAndInitialize()
  await requireUser()

  const [requests, balances] = await Promise.all([
    getMyLeaveRequests().catch(() => []),
    getLeaveBalances().catch(() => []),
  ])

  return (
    <>
      <Header title={t`My Leaves`} />
      <section className='p-4 grid gap-4 overflow-y-auto'>
        <MyLeavesSection requests={requests} balances={balances} />
      </section>
    </>
  )
}


