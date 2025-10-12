import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { CompanyProfile as CompanyProfileComponent } from '@/components/company/company-profile'
import { getCompany, getLeavePolicies, getPaySchedules, getCompanyDocuments } from '@/lib/services/company'
export default async function CompanyPage() {
  // Only HR managers and admins can manage company settings
  await requireRole(['hr_manager', 'system_admin'])
  const [company, paySchedules, leavePolicies, companyDocuments] = await Promise.all([
    getCompany(),
    getPaySchedules(),
    getLeavePolicies(),
    getCompanyDocuments(),
  ])
  const safeCompany = company ?? {
    id: '',
    name: '',
    legal_name: '',
    tax_id: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    logo: '',
  }
  return (
    <>
      <Header title='Company Management' />
      <section className='p-2 grid gap-4 overflow-y-auto overflow-x-hidden'>
        <Card className="overflow-hidden">
          <CardHeader title='Company Profile' />
          <CompanyProfileComponent 
            company={safeCompany} 
            paySchedules={paySchedules || []} 
            leavePolicies={leavePolicies || []}
            companyDocuments={companyDocuments}
          />
        </Card>
      </section>
    </>
  )
}


