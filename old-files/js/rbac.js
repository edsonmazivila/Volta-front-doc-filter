// RBAC JavaScript Helper
// Provides client-side permission checking and role management

(function(){
	if (window.__rbacInitialized) return;
	window.__rbacInitialized = true;

	class RBACHelper {
		constructor() {
			this.userPermissions = [];
			this.userRole = '';
			this.userContext = {};
		}

		// Initialize RBAC helper by fetching user permissions
		async init() {
			try {
				// Ensure auth is ready before calling RBAC API
				if (window.authManager && typeof window.authManager.getCachedProfile === 'function') {
					await window.authManager.getCachedProfile();
				}
				const response = await fetch('/api/rbac/my-permissions', {
					credentials: 'include'
				});
				if (response.ok) {
					const data = await response.json();
					this.userPermissions = data.permissions || [];
					this.userRole = data.role || '';
					this.userContext = data.context || {};
					try { localStorage.setItem('__rbac_cache__', JSON.stringify({ts:Date.now(), data})); } catch(e) {}
					console.log('RBAC initialized:', { role: this.userRole, permissions: this.userPermissions.length });
				} else {
					throw new Error('RBAC API error: ' + response.status);
				}
			} catch (error) {
				console.error('Failed to initialize RBAC:', error);
				// Fallback to last known cache to keep UI stable
				try {
					const raw = localStorage.getItem('__rbac_cache__');
					if (raw) {
						const cached = JSON.parse(raw);
						this.userPermissions = (cached && cached.data && cached.data.permissions) || [];
						this.userRole = (cached && cached.data && cached.data.role) || '';
						this.userContext = (cached && cached.data && cached.data.context) || {};
					}
				} catch(_) {}
			}
		}

		// Check if user has a specific permission
		hasPermission(permission) { return this.userPermissions.includes(permission); }
		// Check if user has any of the specified permissions
		hasAnyPermission(permissions) { return permissions.some(p => this.hasPermission(p)); }
		// Check if user has all specified permissions
		hasAllPermissions(permissions) { return permissions.every(p => this.hasPermission(p)); }
		// Check if user has a specific role
		hasRole(role) { return this.userRole === role; }
		// Check if user has any of the specified roles
		hasAnyRole(roles) { return roles.includes(this.userRole); }
		// Get user's role display name
		getRoleDisplayName() {
			const roleNames = { 'employee':'Employee','operational_manager':'Operational Manager','hr_manager':'HR Manager','payroll_manager':'Payroll Manager','system_admin':'System Administrator','admin':'Administrator (Legacy)','manager':'Manager (Legacy)' };
			return roleNames[this.userRole] || this.userRole;
		}
		// Show/hide based on permissions
		toggleElementByPermission(elementId, permission) { const el = document.getElementById(elementId); if (el) el.style.display = this.hasPermission(permission) ? '' : 'none'; }
		// Show/hide based on role
		toggleElementByRole(elementId, role) { const el = document.getElementById(elementId); if (el) el.style.display = this.hasRole(role) ? '' : 'none'; }
		// Enable/disable buttons based on permissions
		toggleButtonByPermission(buttonId, permission) { const b = document.getElementById(buttonId); if (b) { const ok = this.hasPermission(permission); b.disabled = !ok; if (!ok) { b.classList.add('opacity-50','cursor-not-allowed'); b.title = 'You do not have permission to perform this action'; } } }
		// Timesheet status permissions
		getTimesheetStatusPermissions() {
			const p = { 'employee':['draft','submitted'], 'operational_manager':['draft','submitted','approved','rejected'], 'hr_manager':['draft','submitted','approved','rejected'], 'payroll_manager':['draft','submitted','approved','rejected','processed'], 'system_admin':['draft','submitted','approved','rejected','processed'], 'admin':['draft','submitted','approved','rejected','processed'], 'manager':['draft','submitted','approved','rejected'] };
			return p[this.userRole] || ['draft'];
		}
		canAccessEmployee(employeeId) {
			if (this.hasPermission('employee:view:all')) return true;
			if (this.hasPermission('employee:view:department')) return true;
			if (this.hasPermission('employee:view:own') && this.userContext.employee_id === employeeId) return true;
			return false;
		}
		canApproveTimesheet() { return this.hasAnyPermission(['timesheet:approve:all','timesheet:approve:department']); }
		canProcessPayroll() { return this.hasPermission('payroll:process'); }
		// Legacy helpers
		isAdmin() { return this.hasAnyRole(['admin','system_admin']); }
		isManager() { return this.hasAnyRole(['manager','operational_manager','hr_manager','payroll_manager']); }
		isEmployee() { return this.hasRole('employee'); }
	}

	// Global RBAC instance
	let rbac;

	// Initialize when DOM is loaded (once)
	document.addEventListener('DOMContentLoaded', async function() {
		if (window.rbac) return; // already created
		rbac = new RBACHelper();
		try { await rbac.init(); } catch(e) {}
		window.rbac = rbac;
	});
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
	module.exports = window.RBACHelper || function(){};
} 