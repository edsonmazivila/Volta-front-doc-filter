import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { verifySession } from '@/lib/auth/dal'
import { requireRole } from '@/lib/rbac/server'
import { getMyPaystubs } from '@/lib/services/paystubs'
import { PaystubsSection } from '@/components/paystubs/paystubs-section'

export const metadata = {
  title: 'My Paystubs - NexuPayroll',
  description: 'View and download your paystubs',
}

export default async function PaystubsPage() {
  await requireRole(['employee','operational_manager','hr_manager','payroll_manager'])
  const session = await verifySession()

  const paystubs = await getMyPaystubs()

  return (
    <div className="min-h-dvh flex app-background">
      <Sidebar />
      <main className="flex-1">
        <Header title="My Paystubs" />
        <section className="p-4">
          <PaystubsSection
            paystubs={paystubs}
            employeeName={session?.user?.name}
            employeeInfo={{
              employeeId: session?.user?.id,
            }}
          />
        </section>
      </main>
    </div>
  )
}
