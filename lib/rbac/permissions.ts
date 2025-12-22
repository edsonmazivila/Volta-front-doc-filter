import type { UserRole } from '@/lib/auth/types'

// Role hierarchy - 7 roles with multi-tenant support
export const ROLE_HIERARCHY = {
	employee: 1,
	operational_manager: 2,
	hr_manager: 3,
	payroll_manager: 3,
	system_admin: 5,
	organization_admin: 6,
	platform_owner: 7,
} as const

// Define which roles can access which pages - based on WORKFLOWS_AND_RBAC.md
export const PAGE_PERMISSIONS: Record<string, UserRole[]> = {
	// Overview - Everyone (all roles inherit employee)
	'/dashboard': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin', 'organization_admin', 'platform_owner'],

	// Platform - platform_owner only
	'/platform/dashboard': ['platform_owner'],
	'/platform/organizations': ['platform_owner'],

	// Organization - organization_admin and platform_owner only
	'/dashboard/organization': ['organization_admin', 'platform_owner'],

	// Management Section
	'/dashboard/employees': ['hr_manager', 'system_admin', 'organization_admin'],
	'/dashboard/timesheets': ['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin', 'organization_admin'], 
	'/dashboard/attendance': ['operational_manager', 'hr_manager', 'system_admin', 'organization_admin'],
	'/dashboard/leaves': ['operational_manager', 'hr_manager', 'system_admin', 'organization_admin'],
	'/dashboard/payroll': ['payroll_manager', 'system_admin', 'organization_admin'],
	'/dashboard/departments': ['hr_manager', 'system_admin', 'organization_admin'],
	'/dashboard/meetings': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin', 'organization_admin'],

	// Self Service - Everyone (all roles can access own data)
	'/dashboard/paystubs': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin', 'organization_admin'],
	'/dashboard/my-attendance': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin', 'organization_admin'],
	'/dashboard/my-timesheets': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin', 'organization_admin'],
	'/dashboard/my-leaves': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin', 'organization_admin'],
	'/dashboard/my-documents': ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin', 'organization_admin'],

	// Administration Section
	'/dashboard/reports': ['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin', 'organization_admin'],
	'/dashboard/documents': ['hr_manager', 'system_admin', 'organization_admin'],
	'/dashboard/company': ['hr_manager', 'system_admin', 'organization_admin'],
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
		platform_owner: 'Platform Owner',
		organization_admin: 'Organization Administrator',
		system_admin: 'System Administrator',
		hr_manager: 'HR Manager',
		payroll_manager: 'Payroll Manager',
		operational_manager: 'Operational Manager',
		employee: 'Employee',
	}
	return displayNames[role] || role
}
