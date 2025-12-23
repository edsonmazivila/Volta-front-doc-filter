import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { requireUser } from '@/lib/auth/dal'
import { EmployeeCreateForm } from '@/components/employees/employee-create-form'
import { getCompany } from '@/lib/services/company'
import { getActiveDepartments } from '@/lib/services/departments'
import { getAllCompanies } from '@/lib/services/companies'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export default async function NewEmployeePage() {
	await getLocaleAndInitialize()
	const user = await requireUser()
	await requireRole(['hr_manager', 'payroll_manager', 'system_admin', 'organization_admin'])

	// Organization admin can select from all companies
	// Other roles use their own company
	const isOrgAdmin = user.role === 'organization_admin'
	
	const [company, departments, companies] = await Promise.all([
		isOrgAdmin ? Promise.resolve(null) : getCompany(),
		getActiveDepartments(),
		isOrgAdmin ? getAllCompanies() : Promise.resolve(null),
	])

	return (
		<>
			<Header title={t`Add New Employee`} />
			<section className='p-4 md:p-6'>
				<EmployeeCreateForm 
					companyName={company?.name || 'Company'} 
					departments={departments}
					companies={companies?.data || null}
					isOrgAdmin={isOrgAdmin}
				/>
			</section>
		</>
	)
}

