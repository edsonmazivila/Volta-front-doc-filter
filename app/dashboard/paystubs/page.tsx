import { Header } from '@/components/dashboard/header'
import { verifySession } from '@/lib/auth/dal'
import { requireRole } from '@/lib/rbac/server'
import { getMyPaystubs } from '@/lib/services/paystubs'
import { PaystubsSection } from '@/components/paystubs/paystubs-section'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export const metadata = {
  title: 'My Paystubs - Volta HR',
  description: 'View and download your paystubs',
}

export default async function PaystubsPage() {
  await getLocaleAndInitialize()
  await requireRole(['employee','operational_manager','hr_manager','payroll_manager','organization_admin','system_admin'])
  const session = await verifySession()

  const paystubs = await getMyPaystubs()

  return (
    <>
      <Header title={t`My Paystubs`} />
      <section className="p-4 overflow-y-auto">
        <PaystubsSection
          paystubs={paystubs}
          employeeName={session?.user?.full_name}
          employeeInfo={{
            employeeId: session?.user?.id,
          }}
        />
      </section>
    </>
  )
}
