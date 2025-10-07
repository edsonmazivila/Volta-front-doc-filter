import type { UserRole } from '@/lib/auth/types'

// Role hierarchy - exactly 5 roles
export const ROLE_HIERARCHY = {
	employee: 1,
	operational_manager: 2,
	hr_manager: 3,
	payroll_manager: 3,
	system_admin: 5,
} as const

// Define which roles can access which pages - based on WORKFLOWS_AND_RBAC.md
export const PAGE_PERMISSIONS: Record<string, UserRole[]> = {
	// Overview - Everyone (all roles inherit employee)
	'/dashboard': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'],

	// Management Section
	'/dashboard/employees': ['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'],
	'/dashboard/timesheets': ['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'],
	'/dashboard/attendance': ['operational_manager', 'hr_manager', 'system_admin'],
	'/dashboard/leaves': ['operational_manager', 'hr_manager', 'system_admin'],
	'/dashboard/payroll': ['payroll_manager', 'system_admin'],
	'/dashboard/departments': ['operational_manager', 'hr_manager', 'system_admin'],
	'/dashboard/meetings': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'],

	// Self Service - Everyone (all roles can access own data)
	'/dashboard/paystubs': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'],
	'/dashboard/my-timesheets': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'],
	'/dashboard/my-leaves': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'],
	'/dashboard/my-documents': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'],

	// Administration Section
	'/dashboard/reports': ['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'],
	'/dashboard/users': ['hr_manager', 'system_admin'],
	'/dashboard/documents': ['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'],
	'/dashboard/company': ['hr_manager', 'system_admin'],
	'/dashboard/settings': ['system_admin'],
}

// Check if user has access to a page
export function canAccessPage(userRole: UserRole | undefined, pagePath: string): boolean {
	if (!userRole) return false

	// Normalize the path for comparison
	const normalizedPath = pagePath.split('?')[0]

	// Check if page has defined permissions
	const allowedRoles = PAGE_PERMISSIONS[normalizedPath]
	if (!allowedRoles) {
		// If no permissions defined, allow access (open page)
		return true
	}

	return allowedRoles.includes(userRole)
}

// Check if user has any of the specified roles
export function hasAnyRole(userRole: UserRole | undefined, roles: UserRole[]): boolean {
	if (!userRole) return false
	return roles.includes(userRole)
}

// Check if user is system admin
export function isAdmin(userRole: UserRole | undefined): boolean {
	if (!userRole) return false
	return userRole === 'system_admin'
}

// Check if user is any type of manager
export function isManager(userRole: UserRole | undefined): boolean {
	if (!userRole) return false
	return ['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'].includes(userRole)
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
	const displayNames: Record<UserRole, string> = {
		employee: 'Employee',
		operational_manager: 'Operational Manager',
		hr_manager: 'HR Manager',
		payroll_manager: 'Payroll Manager',
		system_admin: 'System Administrator',
	}
	return displayNames[role] || role
}
