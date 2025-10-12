import { Header } from '@/components/dashboard/header'
import { requireUser } from '@/lib/auth/dal'
import { getMyLeaveRequests, getLeaveBalances } from '@/lib/services/leaves'
import { MyLeavesSection } from '@/components/leaves/my-leaves-section'

export default async function MyLeavesPage() {
  await requireUser()
  
  const [requests, balances] = await Promise.all([
    getMyLeaveRequests().catch(() => []),
    getLeaveBalances().catch(() => []),
  ])
  
  return (
    <>
      <Header title='My Leaves' />
      <section className='p-4 grid gap-4 overflow-y-auto'>
        <MyLeavesSection requests={requests} balances={balances} />
      </section>
    </>
  )
}


