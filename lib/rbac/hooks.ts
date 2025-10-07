'use client'

import { useSession } from '@/components/auth/session-context'
import { canAccessPage, hasAnyRole, isAdmin, isManager, getRoleDisplayName } from './permissions'
import { canPerformAction } from './features'
import type { UserRole } from '@/lib/auth/types'

/**
 * Hook to check user permissions and feature access
 */
export function usePermissions() {
	const { user } = useSession()
	const userRole = user?.role

	return {
		role: userRole,
		roleName: userRole ? getRoleDisplayName(userRole) : 'Guest',
		canAccessPage: (path: string) => canAccessPage(userRole, path),
		hasAnyRole: (roles: UserRole[]) => hasAnyRole(userRole, roles),
		canPerformAction: (allowedRoles: UserRole[]) => canPerformAction(userRole, allowedRoles),
		isAdmin: () => isAdmin(userRole),
		isManager: () => isManager(userRole),
		isEmployee: () => userRole === 'employee',
	}
}
