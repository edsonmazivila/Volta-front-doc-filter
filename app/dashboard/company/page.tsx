import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireUser } from '@/lib/auth/dal'
import { CompanyProfile as CompanyProfileComponent } from '@/components/company/company-profile'
import { fetchCompany, fetchLeavePoliciesServer, fetchPaySchedulesServer } from '@/lib/services/company-server'

export default async function CompanyPage() {
  await requireUser()
  const [company, paySchedules, leavePolicies] = await Promise.all([
    fetchCompany(),
    fetchPaySchedulesServer(),
    fetchLeavePoliciesServer(),
  ])
  const safeCompany = company ?? {
    id: '',
    name: '',
    registration_number: '',
    tax_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    bank_name: '',
    bank_account: '',
    bank_iban: '',
    bank_swift: '',
  }
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Company Management' />
        <section className='p-4 grid gap-4'>
          <Card>
            <CardHeader title='Company Profile' />
            <CompanyProfileComponent company={safeCompany} paySchedules={paySchedules || []} leavePolicies={leavePolicies || []} />
          </Card>
        </section>
      </main>
    </div>
  )
}


