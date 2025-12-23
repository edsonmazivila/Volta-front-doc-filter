import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { requireUser } from '@/lib/auth/dal'
import { EmployeeEditForm } from '@/components/employees/employee-edit-form'
import { getCompany } from '@/lib/services/company'
import { getUsers, getAllOrganizationUsers } from '@/lib/services/users'
import { getActiveDepartments } from '@/lib/services/departments'
import { notFound } from 'next/navigation'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export default async function EditEmployeePage(props: { params: Promise<{ id: string }> }) {
	await getLocaleAndInitialize()
	const user = await requireUser()
	await requireRole(['hr_manager', 'payroll_manager', 'system_admin', 'organization_admin'])

	const { id } = await props.params

	// Fetch users based on role
	const isOrgAdmin = user.role === 'organization_admin'
	const [company, usersData, departments] = await Promise.all([
		getCompany().catch(() => null),
		isOrgAdmin ? getAllOrganizationUsers() : getUsers(),
		getActiveDepartments(),
	])

	// Extract users array from response
	const users = Array.isArray(usersData) ? usersData : (usersData?.data || [])
	
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

