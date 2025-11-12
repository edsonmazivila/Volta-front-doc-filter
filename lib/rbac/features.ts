import type { UserRole } from '@/lib/auth/types'

/**
 * Feature-level permissions based on WORKFLOWS_AND_RBAC.md
 * Defines what actions/features each role can perform
 */

// Timesheet features
export const TIMESHEET_FEATURES = {
	CREATE_OWN: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	EDIT_OWN: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	SUBMIT_OWN: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	VIEW_DEPARTMENT: ['operational_manager', 'hr_manager', 'system_admin'] as UserRole[],
	VIEW_ALL: ['hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	APPROVE_DEPARTMENT: ['operational_manager', 'hr_manager', 'system_admin'] as UserRole[],
	APPROVE_ALL: ['hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
}

// Employee features
export const EMPLOYEE_FEATURES = {
	VIEW_OWN: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	VIEW_DEPARTMENT: ['operational_manager', 'hr_manager', 'system_admin'] as UserRole[],
	VIEW_ALL: ['hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	CREATE: ['hr_manager', 'system_admin'] as UserRole[],
	EDIT_DEPARTMENT: ['hr_manager', 'system_admin'] as UserRole[],
	EDIT_ALL: ['hr_manager', 'system_admin'] as UserRole[],
	DELETE: ['hr_manager', 'system_admin'] as UserRole[],
}

// Leave features
export const LEAVE_FEATURES = {
	CREATE_OWN: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	VIEW_OWN: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	VIEW_TEAM: ['operational_manager', 'hr_manager', 'system_admin'] as UserRole[],
	VIEW_ALL: ['hr_manager', 'system_admin'] as UserRole[],
	APPROVE: ['operational_manager', 'hr_manager', 'system_admin'] as UserRole[],
	MANAGE_POLICIES: ['hr_manager', 'system_admin'] as UserRole[],
}

// Payroll features
export const PAYROLL_FEATURES = {
	VIEW_OWN: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	VIEW_ALL: ['hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	PROCESS: ['payroll_manager', 'system_admin'] as UserRole[],
	CALCULATE: ['payroll_manager', 'system_admin'] as UserRole[],
	EXPORT: ['payroll_manager', 'system_admin'] as UserRole[],
}

// Document features
export const DOCUMENT_FEATURES = {
	VIEW_OWN: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	UPLOAD_OWN: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	VIEW_DEPARTMENT: ['hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	VIEW_ALL: ['hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	APPROVE: ['hr_manager', 'system_admin'] as UserRole[],
	DELETE: ['hr_manager', 'system_admin'] as UserRole[],
}

// Department features
export const DEPARTMENT_FEATURES = {
	VIEW: ['hr_manager', 'system_admin'] as UserRole[],
	CREATE: ['hr_manager', 'system_admin'] as UserRole[],
	EDIT: ['hr_manager', 'system_admin'] as UserRole[],
	DELETE: ['hr_manager', 'system_admin'] as UserRole[],
}

// User management features
export const USER_FEATURES = {
	VIEW_ALL: ['hr_manager', 'system_admin'] as UserRole[],
	CREATE: ['hr_manager', 'system_admin'] as UserRole[],
	EDIT: ['hr_manager', 'system_admin'] as UserRole[],
	DELETE: ['hr_manager', 'system_admin'] as UserRole[],
}

// Attendance features
export const ATTENDANCE_FEATURES = {
	CHECK_IN_OUT: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	VIEW_OWN: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	VIEW_TEAM: ['operational_manager', 'hr_manager', 'system_admin'] as UserRole[],
	MARK_ABSENCE: ['operational_manager', 'hr_manager', 'system_admin'] as UserRole[],
	APPROVE_JUSTIFICATION: ['operational_manager', 'hr_manager', 'system_admin'] as UserRole[],
	EXPORT: ['operational_manager', 'hr_manager', 'system_admin'] as UserRole[],
}

// Meeting features
export const MEETING_FEATURES = {
	CREATE_OWN: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	EDIT_OWN: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	VIEW_TEAM: ['operational_manager', 'hr_manager', 'system_admin'] as UserRole[],
	CANCEL: ['employee', 'operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
}

// Report features
export const REPORT_FEATURES = {
	VIEW_DEPARTMENT: ['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	VIEW_ALL: ['hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	GENERATE: ['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
	EXPORT: ['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'] as UserRole[],
}

// Company settings features
export const COMPANY_FEATURES = {
	VIEW: ['hr_manager', 'system_admin'] as UserRole[],
	EDIT_BASIC_INFO: ['hr_manager', 'system_admin'] as UserRole[],
	MANAGE_PAY_SCHEDULES: ['hr_manager', 'system_admin'] as UserRole[],
	MANAGE_LEAVE_POLICIES: ['hr_manager', 'system_admin'] as UserRole[],
}

// System settings features
export const SYSTEM_FEATURES = {
	VIEW_SETTINGS: ['system_admin'] as UserRole[],
	EDIT_SETTINGS: ['system_admin'] as UserRole[],
	VIEW_AUDIT_LOGS: ['system_admin'] as UserRole[],
}

/**
 * Check if user can perform a specific feature
 */
export function canPerformAction(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
	if (!userRole) return false
	return allowedRoles.includes(userRole)
}
