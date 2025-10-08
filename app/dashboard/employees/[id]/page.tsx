import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { EmployeeEditForm } from '@/components/employees/employee-edit-form'
import { getCompany } from '@/lib/services/company'
import { getEmployees } from '@/lib/services/employees'
import { getDepartments } from '@/lib/services/departments'
import { notFound } from 'next/navigation'

export default async function EditEmployeePage(props: { params: Promise<{ id: string }> }) {
	await requireRole(['hr_manager', 'system_admin', 'operational_manager'])
	
	const [company, { items: employees }, departments] = await Promise.all([
		getCompany(),
		getEmployees(),
		getDepartments(),
	])
	const { id } = await props.params
	const employee = employees.find(e => e.id === id)

	if (!employee) {
		notFound()
	}

	return (
		<div className='min-h-dvh flex app-background'>
			<Sidebar />
			<main className='flex-1'>
				<Header title='Edit Employee' />
				<section className='p-4 md:p-6 max-w-5xl mx-auto'>
					<EmployeeEditForm employee={employee} companyName={company?.name || 'Company'} departments={departments} />
				</section>
			</main>
		</div>
	)
}

