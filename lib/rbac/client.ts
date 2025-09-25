'use client'

import { UserPermissions, Permission, Role, PERMISSIONS, ROLES, ROLE_DISPLAY_NAMES, TIMESHEET_STATUS_PERMISSIONS } from './types'

// RBAC Client-side helper
export class RBACClient {
	private userPermissions: UserPermissions | null = null
	private cacheKey = '__rbac_cache__'
	private cacheExpiry = 5 * 60 * 1000 // 5 minutes

	// Initialize RBAC by fetching user permissions
	async init(): Promise<void> {
		try {
			const response = await fetch('/api/rbac/my-permissions', {
				credentials: 'include'
			})

			if (response.ok) {
				const data = await response.json()
				this.userPermissions = {
					permissions: data.permissions || [],
					role: data.role || '',
					context: data.context || {}
				}

				// Cache the permissions
				this.cachePermissions(data)
				console.log('RBAC initialized:', { 
					role: this.userPermissions.role, 
					permissions: this.userPermissions.permissions.length 
				})
			} else {
				throw new Error(`RBAC API error: ${response.status}`)
			}
		} catch (error) {
			console.error('Failed to initialize RBAC:', error)
			// Fallback to cached permissions
			this.loadCachedPermissions()
		}
	}

	// Cache permissions to localStorage
	private cachePermissions(data: unknown): void {
		if (typeof window === 'undefined') return
		
		try {
			localStorage.setItem(this.cacheKey, JSON.stringify({
				timestamp: Date.now(),
				data
			}))
		} catch (error) {
			console.warn('Failed to cache RBAC permissions:', error)
		}
	}

	// Load cached permissions from localStorage
	private loadCachedPermissions(): void {
		if (typeof window === 'undefined') return

		try {
			const cached = localStorage.getItem(this.cacheKey)
			if (cached) {
				const { timestamp, data } = JSON.parse(cached)
				
				// Check if cache is still valid
				if (Date.now() - timestamp < this.cacheExpiry) {
					this.userPermissions = {
						permissions: data.permissions || [],
						role: data.role || '',
						context: data.context || {}
					}
					console.log('RBAC loaded from cache')
				}
			}
		} catch (error) {
			console.warn('Failed to load cached RBAC permissions:', error)
		}
	}

	// Check if user has a specific permission
	hasPermission(permission: Permission): boolean {
		return this.userPermissions?.permissions.includes(permission) ?? false
	}

	// Check if user has any of the specified permissions
	hasAnyPermission(permissions: Permission[]): boolean {
		return permissions.some(p => this.hasPermission(p))
	}

	// Check if user has all specified permissions
	hasAllPermissions(permissions: Permission[]): boolean {
		return permissions.every(p => this.hasPermission(p))
	}

	// Check if user has a specific role
	hasRole(role: Role): boolean {
		return this.userPermissions?.role === role
	}

	// Check if user has any of the specified roles
	hasAnyRole(roles: Role[]): boolean {
		return roles.includes(this.userPermissions?.role as Role)
	}

	// Get user's role display name
	getRoleDisplayName(): string {
		const role = this.userPermissions?.role as Role
		return ROLE_DISPLAY_NAMES[role] || role || 'Unknown'
	}

	// Get user's role
	getRole(): Role | null {
		return this.userPermissions?.role as Role || null
	}

	// Get user context
	getContext() {
		return this.userPermissions?.context || {}
	}

	// Check if user can access employee data
	canAccessEmployee(employeeId: string): boolean {
		if (this.hasPermission(PERMISSIONS.EMPLOYEE_VIEW_ALL)) return true
		if (this.hasPermission(PERMISSIONS.EMPLOYEE_VIEW_DEPARTMENT)) return true
		if (this.hasPermission(PERMISSIONS.EMPLOYEE_VIEW_OWN) && 
			this.userPermissions?.context.employee_id === employeeId) return true
		return false
	}

	// Check if user can approve timesheets
	canApproveTimesheet(): boolean {
		return this.hasAnyPermission([
			PERMISSIONS.TIMESHEET_APPROVE_ALL,
			PERMISSIONS.TIMESHEET_APPROVE_DEPARTMENT
		])
	}

	// Check if user can process payroll
	canProcessPayroll(): boolean {
		return this.hasPermission(PERMISSIONS.PAYROLL_PROCESS)
	}

	// Get timesheet status permissions for current role
	getTimesheetStatusPermissions(): string[] {
		const role = this.getRole()
		return role ? TIMESHEET_STATUS_PERMISSIONS[role] : ['draft']
	}

	// Legacy helpers for backward compatibility
	isAdmin(): boolean {
		return this.hasAnyRole([ROLES.ADMIN, ROLES.SYSTEM_ADMIN])
	}

	isManager(): boolean {
		return this.hasAnyRole([
			ROLES.MANAGER,
			ROLES.OPERATIONAL_MANAGER,
			ROLES.HR_MANAGER,
			ROLES.PAYROLL_MANAGER
		])
	}

	isEmployee(): boolean {
		return this.hasRole(ROLES.EMPLOYEE)
	}

	// Clear cached permissions
	clearCache(): void {
		if (typeof window === 'undefined') return
		
		try {
			localStorage.removeItem(this.cacheKey)
		} catch (error) {
			console.warn('Failed to clear RBAC cache:', error)
		}
		this.userPermissions = null
	}
}

// Create singleton instance
export const rbacClient = new RBACClient()
