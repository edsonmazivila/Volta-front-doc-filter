import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { EmployeeCreateForm } from '@/components/employees/employee-create-form'
import { getCompany } from '@/lib/services/company'
import { getDepartments } from '@/lib/services/departments'

export default async function NewEmployeePage() {
	await requireRole(['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'])
	
	const [company, departments] = await Promise.all([
		getCompany(),
		getDepartments(),
	])

	return (
		<div className='min-h-dvh flex app-background'>
			<Sidebar />
			<main className='flex-1'>
				<Header title='Add New Employee' />
				<section className='p-4 md:p-6 max-w-5xl mx-auto'>
					<EmployeeCreateForm companyName={company?.name || 'Company'} departments={departments} />
				</section>
			</main>
		</div>
	)
}

