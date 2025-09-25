// Users JavaScript for Nexus Pay
(function(){
    if (window.__usersInitialized) return;
    window.__usersInitialized = true;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Nexus Pay Users - Ready');
    initializeUsersPage();
    }, { once: true });

    // Re-init lightweight logic after HTMX swaps of main content
    document.body.addEventListener('htmx:afterSwap', function(evt){
        if (evt.target && (evt.target.id === 'main-content' || evt.target.tagName === 'MAIN')) {
            try { initializeUsersPage(); } catch(e) { console.error('Users init afterSwap error:', e); }
        }
    });
})();

function initializeUsersPage() {
    // Avoid re-binding HTMX listeners multiple times
    if (!window.__usersHTMXBound) {
        setupHTMXListeners();
        window.__usersHTMXBound = true;
    }

    if (typeof htmx !== 'undefined') {
        try { htmx.config.withCredentials = true; } catch(e) {}
        loadUsersTable();
        loadUserStats();
    } else {
        loadUsersTableFallback();
        loadUserStatsFallback();
    }
    setupRoleBasedNavigation();
}

// Expose init for HTMX swaps
window.NexuPayrollUsersInit = function() {
    try { initializeUsersPage(); } catch (e) { console.error('Users init error:', e); }
};

// Load users table via HTMX
function loadUsersTable() {
    const tableContainer = document.getElementById('users-table');
    if (!tableContainer) return;
    const now = Date.now();
    if (!window.__NP_USERS_TABLE_TS) window.__NP_USERS_TABLE_TS = 0;
    if (window.__NP_USERS_TABLE_LOADING || (now - window.__NP_USERS_TABLE_TS < 1000)) return;
    window.__NP_USERS_TABLE_LOADING = true;
    window.__NP_USERS_TABLE_TS = now;
    if (typeof htmx !== 'undefined') {
        htmx.ajax('GET', '/users/table', { target: '#users-table' });
    }
}

// Load user stats via fetch with credentials
function loadUserStats() {
    // Simple throttle to avoid spamming
    const now = Date.now();
    if (!window.__NP_USERS_STATS_TS) window.__NP_USERS_STATS_TS = 0;
    if (now - window.__NP_USERS_STATS_TS < 1000) return;
    window.__NP_USERS_STATS_TS = now;

    fetch('/api/users/stats', { credentials: 'same-origin' })
    .then(response => response.json())
        .then(data => { if (data && (data.success || data.total)) { const stats = data.data || data;
            updateUserStats({
                totalUsers: stats.totalUsers || stats.total || 0,
                activeUsers: stats.activeUsers || stats.active || 0,
                adminUsers: stats.adminUsers || (stats.roles && stats.roles.system_admin) || 0,
                managerUsers: stats.managerUsers || (stats.roles && ((stats.roles.hr_manager||0) + (stats.roles.payroll_manager||0) + (stats.roles.operational_manager||0))) || 0,
                employeeUsers: stats.employeeUsers || stats.employees || 0,
            }); } })
    .catch(error => { console.error('Error loading user stats:', error); });
}

// Fallback function for loading users table via fetch
function loadUsersTableFallback() {
    fetch('/users/table', { credentials: 'same-origin' })
    .then(response => response.text())
    .then(html => { const tableContainer = document.getElementById('users-table'); if (tableContainer) { tableContainer.innerHTML = html; } })
    .catch(error => { console.error('Error loading users table:', error); });
}

// Fallback function for loading user stats via fetch
function loadUserStatsFallback() {
    // Use same endpoint and throttle
    return loadUserStats();
}

// Update user stats in the UI
function updateUserStats(stats) {
    document.getElementById('totalUsers') && (document.getElementById('totalUsers').textContent = stats.totalUsers || 0);
    document.getElementById('activeUsers') && (document.getElementById('activeUsers').textContent = stats.activeUsers || 0);
    document.getElementById('adminUsers') && (document.getElementById('adminUsers').textContent = stats.adminUsers || 0);
    document.getElementById('managerUsers') && (document.getElementById('managerUsers').textContent = stats.managerUsers || 0);
    document.getElementById('employeeUsers') && (document.getElementById('employeeUsers').textContent = stats.employeeUsers || 0);
}

// Setup HTMX event listeners (bind once)
function setupHTMXListeners() {
	document.addEventListener('htmx:afterRequest', function(event) {
		if (event.detail && event.detail.xhr && event.detail.xhr.responseURL && event.detail.xhr.responseURL.includes('/users/table')) {
			window.__NP_USERS_TABLE_LOADING = false;
		}
		if (event.detail && event.detail.elt && event.detail.elt.tagName === 'FORM' && (event.detail.elt.hasAttribute('hx-post') || event.detail.elt.hasAttribute('hx-put'))) {
			if (event.detail.successful) {
				showToast('User saved successfully!', 'success');
				hideUserModal();
				loadUsersTable();
				loadUserStats();
			} else {
				let msg = 'Failed to save user';
				try {
					const txt = event.detail.xhr.responseText || '';
					const json = JSON.parse(txt);
					msg = json.message || json.error || msg;
				} catch(e) {}
				showToast(msg, 'error');
			}
		}
	});
}

// Show create user modal
function showCreateUserModal() {
    document.getElementById('modalTitle').textContent = 'Add New User';
    const form = document.getElementById('userForm');
    form.removeAttribute('hx-put');
    form.setAttribute('hx-post', '/api/users');
    form.action = '/api/users';
    form.method = 'POST';
    form.removeAttribute('data-mode');
    document.getElementById('userForm').reset();
    document.getElementById('passwordField').style.display = 'block';
    document.getElementById('password').required = true;
    document.getElementById('userModal').classList.remove('hidden');
}

// Show edit user modal
function showEditUserModal(userId) {
	document.getElementById('modalTitle').textContent = 'Edit User';
	const form = document.getElementById('userForm');
	// Disable HTMX submission in edit mode to avoid duplicate requests
	form.removeAttribute('hx-post');
	form.removeAttribute('hx-put');
	form.action = '';
	form.method = 'POST';
	form.setAttribute('data-mode', 'edit');
	form.setAttribute('data-user-id', userId);
	fetch(`/api/users/${userId}`, { credentials: 'same-origin' })
	.then(async response => {
		if (!response.ok) {
			throw new Error(`Failed to load user (${response.status})`);
		}
		const data = await response.json().catch(() => null);
		const user = (data && (data.data || data)) || null;
		if (!user || !user.id) {
			throw new Error('Invalid user payload');
		}
		document.getElementById('firstName').value = user.first_name || '';
		document.getElementById('lastName').value = user.last_name || '';
		document.getElementById('email').value = user.email || '';
		document.getElementById('role').value = user.role || '';
		document.getElementById('isActive').checked = !!user.is_active;
		document.getElementById('passwordField').style.display = 'none';
		document.getElementById('password').required = false;
		document.getElementById('userModal').classList.remove('hidden');
	})
	.catch(error => { console.error('Error loading user data:', error); showToast('Failed to load user data', 'error'); });
}

// Hide user modal
function hideUserModal() { document.getElementById('userModal').classList.add('hidden'); }

// Show delete confirmation modal
function showDeleteModal(userId, userName) { window.deleteUserId = userId; window.deleteUserName = userName; document.getElementById('deleteModal').classList.remove('hidden'); }

// Hide delete modal
function hideDeleteModal() { document.getElementById('deleteModal').classList.add('hidden'); window.deleteUserId = null; window.deleteUserName = null; }

// Confirm delete user
function confirmDeleteUser() {
    const userId = window.deleteUserId; if (!userId) return;
    fetch(`/api/users/${userId}`, { method: 'DELETE', credentials: 'same-origin' })
    .then(response => response.json())
    .then(data => {
        if (data.success) { showToast('User deleted successfully!', 'success'); hideDeleteModal(); loadUsersTable(); loadUserStats(); }
        else { showToast('Failed to delete user', 'error'); }
    })
    .catch(error => { console.error('Error deleting user:', error); showToast('Failed to delete user', 'error'); });
}

// Toggle user active status
function toggleUserStatus(userId, currentStatus) {
    const newStatus = !currentStatus;
    fetch(`/api/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ is_active: newStatus })})
    .then(response => response.json())
    .then(data => { if (data.success) { showToast(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`, 'success'); loadUsersTable(); loadUserStats(); } else { showToast('Failed to update user status', 'error'); } })
    .catch(error => { console.error('Error updating user status:', error); showToast('Failed to update user status', 'error'); });
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${ type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600' }`;
    toast.textContent = message; document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) { toast.parentNode.removeChild(toast); } }, 3000);
}

// Setup role-based navigation
async function setupRoleBasedNavigation() {
    try {
        const response = await fetch('/api/auth/profile', { credentials: 'same-origin' });
        if (response.ok) {
            const userData = await response.json(); const userRole = userData.data.role;
            const usersLink = document.getElementById('users-link'); if (usersLink) { usersLink.style.display = (userRole === 'system_admin' || userRole === 'hr_manager') ? '' : 'none'; }
            const payrollLink = document.getElementById('payroll-link'); if (payrollLink) { payrollLink.style.display = (userRole === 'system_admin' || userRole === 'payroll_manager' || userRole === 'hr_manager') ? '' : 'none'; }
            const reportsLink = document.getElementById('reports-link'); if (reportsLink) { reportsLink.style.display = (userRole === 'system_admin' || userRole === 'payroll_manager' || userRole === 'hr_manager') ? '' : 'none'; }
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        const usersLink = document.getElementById('users-link'); if (usersLink) usersLink.style.display = 'none';
        const payrollLink = document.getElementById('payroll-link'); if (payrollLink) payrollLink.style.display = 'none';
        const reportsLink = document.getElementById('reports-link'); if (reportsLink) reportsLink.style.display = 'none';
    }
}

// Export functions to global scope
window.showCreateUserModal = showCreateUserModal;
window.showEditUserModal = showEditUserModal;
window.hideUserModal = hideUserModal;
window.showDeleteModal = showDeleteModal;
window.hideDeleteModal = hideDeleteModal;
window.confirmDeleteUser = confirmDeleteUser;
window.toggleUserStatus = toggleUserStatus; 

(function attachUserFormSubmitOnce(){
	if (window.__usersFormSubmitBound__) return; window.__usersFormSubmitBound__ = true;
	document.addEventListener('submit', function(e){
		const form = e.target;
		if (!form || form.id !== 'userForm') return;
		const mode = form.getAttribute('data-mode') || 'create';
		if (mode === 'edit') {
			// Force PUT via fetch to avoid accidental POST creates
			e.preventDefault();
			const userId = form.getAttribute('data-user-id');
			const formData = new FormData(form);
			fetch(`/api/users/${userId}`, { method: 'PUT', body: formData, credentials: 'same-origin' })
			.then(r => r.json())
			.then(data => {
				if (data && data.success) {
					showToast('User updated successfully!', 'success');
					hideUserModal();
					loadUsersTable();
					loadUserStats();
				} else {
					let msg = (data && (data.message || data.error)) || 'Failed to update user';
					showToast(msg, 'error');
				}
			})
			.catch(err => { console.error('Update user error', err); showToast('Failed to update user', 'error'); });
		} else {
			// create mode
			e.preventDefault();
			const formData = new FormData(form);
			fetch('/api/users', { method: 'POST', body: formData, credentials: 'same-origin' })
			.then(r => r.json())
			.then(data => {
				if (data && data.success) {
					showToast('User created successfully!', 'success');
					hideUserModal();
					loadUsersTable();
					loadUserStats();
					form.reset();
				} else {
					let msg = (data && (data.message || data.error)) || 'Failed to create user';
					showToast(msg, 'error');
				}
			})
			.catch(err => { console.error('Create user error', err); showToast('Failed to create user', 'error'); });
		}
	}, true);
})(); 