import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { EmployeeEditForm } from '@/components/employees/employee-edit-form'
import { getCompany } from '@/lib/services/company'
import { getEmployees } from '@/lib/services/employees'
import { getDepartments } from '@/lib/services/departments'
import { notFound } from 'next/navigation'

export default async function EditEmployeePage(props: { params: Promise<{ id: string }> }) {
	await requireRole(['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'])
	
	const [company, { items: employees }, departments] = await Promise.all([
		getCompany(),
		getEmployees(),
		getDepartments(),
	])
	const { id } = await props.params
	const employee = employees.find(e => String(e.id) === String(id))

	if (!employee) {
		notFound()
	}

	return (
		<>
			<Header title='Edit Employee' />
			<section className='p-4 md:p-6'>
				<EmployeeEditForm employee={employee} companyName={company?.name || 'Company'} departments={departments} />
			</section>
		</>
	)
}

