// RBAC Types for Next.js implementation

export interface UserPermissions {
	permissions: string[]
	role: string
	context: {
		employee_id?: string
		department_id?: string
		company_id?: string
	}
}

export interface PermissionCheck {
	permission: string
	permissions?: string[]
	role?: string
	roles?: string[]
}

// Role definitions
export const ROLES = {
	EMPLOYEE: 'employee',
	OPERATIONAL_MANAGER: 'operational_manager',
	HR_MANAGER: 'hr_manager',
	PAYROLL_MANAGER: 'payroll_manager',
	SYSTEM_ADMIN: 'system_admin',
	ADMIN: 'admin', // Legacy
	MANAGER: 'manager' // Legacy
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// Permission definitions
export const PERMISSIONS = {
	// Employee permissions
	EMPLOYEE_VIEW_OWN: 'employee:view:own',
	EMPLOYEE_VIEW_DEPARTMENT: 'employee:view:department',
	EMPLOYEE_VIEW_ALL: 'employee:view:all',
	
	// Timesheet permissions
	TIMESHEET_APPROVE_ALL: 'timesheet:approve:all',
	TIMESHEET_APPROVE_DEPARTMENT: 'timesheet:approve:department',
	TIMESHEET_VIEW_ALL: 'timesheet:view:all',
	TIMESHEET_VIEW_DEPARTMENT: 'timesheet:view:department',
	
	// Payroll permissions
	PAYROLL_PROCESS: 'payroll:process',
	PAYROLL_VIEW_ALL: 'payroll:view:all',
	PAYROLL_VIEW_DEPARTMENT: 'payroll:view:department',
	
	// User management permissions
	USER_CREATE: 'user:create',
	USER_UPDATE: 'user:update',
	USER_DELETE: 'user:delete',
	USER_VIEW_ALL: 'user:view:all',
	
	// Report permissions
	REPORT_VIEW_ALL: 'report:view:all',
	REPORT_VIEW_DEPARTMENT: 'report:view:department',
	REPORT_EXPORT: 'report:export'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role display names
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
	[ROLES.EMPLOYEE]: 'Employee',
	[ROLES.OPERATIONAL_MANAGER]: 'Operational Manager',
	[ROLES.HR_MANAGER]: 'HR Manager',
	[ROLES.PAYROLL_MANAGER]: 'Payroll Manager',
	[ROLES.SYSTEM_ADMIN]: 'System Administrator',
	[ROLES.ADMIN]: 'Administrator (Legacy)',
	[ROLES.MANAGER]: 'Manager (Legacy)'
}

// Timesheet status permissions by role
export const TIMESHEET_STATUS_PERMISSIONS: Record<Role, string[]> = {
	[ROLES.EMPLOYEE]: ['draft', 'submitted'],
	[ROLES.OPERATIONAL_MANAGER]: ['draft', 'submitted', 'approved', 'rejected'],
	[ROLES.HR_MANAGER]: ['draft', 'submitted', 'approved', 'rejected'],
	[ROLES.PAYROLL_MANAGER]: ['draft', 'submitted', 'approved', 'rejected', 'processed'],
	[ROLES.SYSTEM_ADMIN]: ['draft', 'submitted', 'approved', 'rejected', 'processed'],
	[ROLES.ADMIN]: ['draft', 'submitted', 'approved', 'rejected', 'processed'],
	[ROLES.MANAGER]: ['draft', 'submitted', 'approved', 'rejected']
}
