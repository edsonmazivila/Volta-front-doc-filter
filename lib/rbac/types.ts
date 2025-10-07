// Re-export types from auth for consistency
export type { UserRole } from '@/lib/auth/types'

// Role constants - exactly 5 roles
export const ROLES = {
	EMPLOYEE: 'employee',
	OPERATIONAL_MANAGER: 'operational_manager',
	HR_MANAGER: 'hr_manager',
	PAYROLL_MANAGER: 'payroll_manager',
	SYSTEM_ADMIN: 'system_admin',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// Role display names
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
	[ROLES.EMPLOYEE]: 'Employee',
	[ROLES.OPERATIONAL_MANAGER]: 'Operational Manager',
	[ROLES.HR_MANAGER]: 'HR Manager',
	[ROLES.PAYROLL_MANAGER]: 'Payroll Manager',
	[ROLES.SYSTEM_ADMIN]: 'System Administrator',
}
