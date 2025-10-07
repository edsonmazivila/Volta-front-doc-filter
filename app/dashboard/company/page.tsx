import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { CompanyProfile as CompanyProfileComponent } from '@/components/company/company-profile'
import { getCompany, getLeavePolicies, getPaySchedules, getCompanyDocuments } from '@/lib/services/company'
import { CompanyDocumentsSection } from '@/components/company/company-documents-section'

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
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Company Management' />
        <section className='p-4 grid gap-4'>
          <Card>
            <CardHeader title='Company Profile' />
            <CompanyProfileComponent company={safeCompany} paySchedules={paySchedules || []} leavePolicies={leavePolicies || []} />
          </Card>
          
          <Card>
            <CardHeader title='Company Documents' />
            <CompanyDocumentsSection 
              documents={companyDocuments.documents} 
              total={companyDocuments.total}
              page={companyDocuments.page}
              limit={companyDocuments.limit}
            />
          </Card>
        </section>
      </main>
    </div>
  )
}


