import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { EmployeeEditForm } from '@/components/employees/employee-edit-form'
import { getCompany } from '@/lib/services/company'
import { getUsers } from '@/lib/services/users'
import { getActiveDepartments } from '@/lib/services/departments'
import { notFound } from 'next/navigation'
import { t } from '@lingui/core/macro'

export default async function EditEmployeePage(props: { params: Promise<{ id: string }> }) {
	await requireRole(['hr_manager', 'payroll_manager', 'system_admin'])

	const [company, users, departments] = await Promise.all([
		getCompany(),
		getUsers(),
		getActiveDepartments(),
	])
	const { id } = await props.params
	// Show all users (no filtering by is_employee)
	const employee = users.find(e => String(e.id) === String(id))

	if (!employee) {
		notFound()
	}

	return (
		<>
			<Header title={t`Edit Employee`} />
			<section className='p-4 md:p-6'>
				<EmployeeEditForm employee={employee} companyName={company?.name || 'Company'} departments={departments} />
			</section>
		</>
	)
}

