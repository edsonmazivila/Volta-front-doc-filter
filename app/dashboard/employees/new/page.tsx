import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { EmployeeCreateForm } from '@/components/employees/employee-create-form'
import { getCompany } from '@/lib/services/company'
import { getActiveDepartments } from '@/lib/services/departments'
import { t } from '@lingui/core/macro'

export default async function NewEmployeePage() {
	await requireRole(['hr_manager', 'payroll_manager', 'system_admin'])

	const [company, departments] = await Promise.all([
		getCompany(),
		getActiveDepartments(),
	])

	return (
		<>
			<Header title={t`Add New Employee`} />
			<section className='p-4 md:p-6'>
				<EmployeeCreateForm companyName={company?.name || 'Company'} departments={departments} />
			</section>
		</>
	)
}

