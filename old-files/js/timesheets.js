// Timesheets JavaScript for NEXUpayroll
(function(){
	if (window.__timesheetsInitialized) return;
	window.__timesheetsInitialized = true;
	document.addEventListener('DOMContentLoaded', function() {
		console.log('NEXUpayroll Timesheets - Ready');
		initializeTimesheetsPage();
	}, { once: true });

	// Ensure load after HTMX swaps when navigating from other sections
	document.body.addEventListener('htmx:afterSwap', function(evt){
		try {
			const target = evt.target;
			if (!target) return;
			// If main content changed and timesheet container exists but is empty, load it
			if ((target.id === 'main-content' || target.tagName === 'MAIN') && document.getElementById('timesheet-table')) {
				setTimeout(function(){
					const table = document.getElementById('timesheet-table');
					if (table && !table.querySelector('tbody tr')) {
						initializeTimesheetsPage();
					}
				}, 0);
			}
		} catch(e) { console.warn('timesheets afterSwap guard error', e); }
	});
})();

function initializeTimesheetsPage(){
	// Guard against burst re-inits (e.g., multiple htmx swaps)
	if (typeof window.shouldInitNow === 'function' && !window.shouldInitNow(500)) return;
	try {
		// Initial load of timesheet data
		loadTimesheets();
		// Setup quick actions and event listeners
		setupTimesheetUI();
		// Setup role-based navigation
		setupRoleBasedNavigation();
	} catch (e) {
		console.error('Timesheets init error:', e);
	}
}

// Expose init for HTMX swaps
window.NexuPayrollTimesheetsInit = function(){
	initializeTimesheetsPage();
};

let __isLoadingTimesheets = false;
let __pendingTimesheetParams = null;
let __tsLastLoadAt = 0;

// Load timesheets
function loadTimesheets(page = 1, limit = 10) {
	const timesheetTable = document.getElementById('timesheet-table');
	if (!timesheetTable) return;
	const now = Date.now();
	// If a request is inflight OR we recently loaded, coalesce to latest params
	if (__isLoadingTimesheets || (now - __tsLastLoadAt < 800)) {
		__pendingTimesheetParams = { page, limit };
		return;
	}
	__isLoadingTimesheets = true;
	__tsLastLoadAt = now;
	// Use HTMX to load timesheets
	htmx.ajax('GET', `/timesheets/table?page=${page}&limit=${limit}`, {
		target: '#timesheet-table'
	});
}

// Setup permissions after timesheet table loads
document.addEventListener('htmx:afterRequest', function(event) {
	if (event.detail.xhr.responseURL && event.detail.xhr.responseURL.includes('/timesheets/table')) {
		// Get user role and setup permissions
		setupRoleBasedNavigation();
		__isLoadingTimesheets = false;
		if (__pendingTimesheetParams) {
			const { page, limit } = __pendingTimesheetParams;
			__pendingTimesheetParams = null;
			loadTimesheets(page, limit);
		}
	}
	
	// Setup status options when edit form is loaded
	if (event.detail.xhr.responseURL && event.detail.xhr.responseURL.includes('/timesheets/') && event.detail.xhr.responseURL.includes('/edit')) {
		console.log('Edit form loaded, setting up status options');
		setTimeout(() => {
			setupRoleBasedNavigation();
		}, 100);
	}
	
	// Setup delete buttons after table is loaded
	if (event.detail.xhr.responseURL && event.detail.xhr.responseURL.includes('/timesheets/table')) {
		console.log('Timesheet table loaded, setting up delete buttons');
		setTimeout(() => {
			setupRoleBasedNavigation();
		}, 100);
	}
});

function setupTimesheetUI() {
	// Add quick action event listeners, if needed
}

function showModal() {
	const modal = document.getElementById('modal');
	if (modal) {
		modal.classList.remove('hidden');
		document.body.style.overflow = 'hidden';
	}
}

function hideModal() {
	const modal = document.getElementById('modal');
	if (modal) {
		modal.classList.add('hidden');
		document.body.style.overflow = 'auto';
	}
}

async function setupRoleBasedNavigation() {
	console.log('setupRoleBasedNavigation called');
	try {
		const response = await fetch('/api/auth/profile', {
			credentials: 'same-origin'
		});
		if (response.ok) {
			const userData = await response.json();
			const userRole = userData.data.role;
			console.log('User role detected:', userRole);
			const usersLink = document.getElementById('users-link');
			if (usersLink) {
				usersLink.style.display = (userRole === 'system_admin' || userRole === 'hr_manager') ? '' : 'none';
			}
			const payrollLink = document.getElementById('payroll-link');
			if (payrollLink) {
				payrollLink.style.display = (userRole === 'system_admin' || userRole === 'payroll_manager' || 
					userRole === 'hr_manager') ? '' : 'none';
			}
			const reportsLink = document.getElementById('reports-link');
			if (reportsLink) {
				reportsLink.style.display = (userRole === 'system_admin' || userRole === 'payroll_manager' || 
					userRole === 'hr_manager') ? '' : 'none';
			}
			setupDeleteButtonVisibility(userRole);
			setupTimesheetStatusOptions(userRole);
			revealApprovalButtons(userRole);
		}
	} catch (error) {
		console.error('Error loading user profile:', error);
		const usersLink = document.getElementById('users-link');
		if (usersLink) usersLink.style.display = 'none';
		const payrollLink = document.getElementById('payroll-link');
		if (payrollLink) payrollLink.style.display = 'none';
		const reportsLink = document.getElementById('reports-link');
		if (reportsLink) reportsLink.style.display = 'none';
	}
}

function setupTimesheetStatusOptions(userRole) {
	const statusSelect = document.getElementById('status');
	if (!statusSelect) {
		console.log('No status select found - not in edit form');
		return;
	}
	console.log('Setting up status options for role:', userRole);
	statusSelect.innerHTML = '';
	let allowedStatuses = [];
	switch (userRole) {
		case 'admin':
			allowedStatuses = [
				{ value: 'draft', label: 'Draft' },
				{ value: 'submitted', label: 'Submitted' },
				{ value: 'approved', label: 'Approved' },
				{ value: 'rejected', label: 'Rejected' }
			];
			break;
		case 'manager':
		case 'operational_manager':
		case 'hr_manager':
		case 'payroll_manager':
			allowedStatuses = [
				{ value: 'approved', label: 'Approved' },
				{ value: 'rejected', label: 'Rejected' }
			];
			break;
		case 'employee':
			allowedStatuses = [
				{ value: 'draft', label: 'Draft' },
				{ value: 'submitted', label: 'Submitted' }
			];
			break;
		default:
			allowedStatuses = [
				{ value: 'draft', label: 'Draft' },
				{ value: 'submitted', label: 'Submitted' }
			];
	}
	allowedStatuses.forEach(status => {
		const option = document.createElement('option');
		option.value = status.value;
		option.textContent = status.label;
		statusSelect.appendChild(option);
	});
	const currentStatus = statusSelect.getAttribute('data-current-status');
	if (currentStatus && allowedStatuses.some(s => s.value === currentStatus)) {
		statusSelect.value = currentStatus;
	} else if (allowedStatuses.length > 0) {
		statusSelect.value = allowedStatuses[0].value;
	}
	setupFieldPermissions(userRole, currentStatus);
	setupDeleteButtonVisibility(userRole);
	revealApprovalButtons(userRole);
}

function setupFieldPermissions(userRole, currentStatus) {
	const contentFields = document.querySelectorAll('.content-editable-field');
	const statusField = document.getElementById('status');
	if (userRole === 'operational_manager' || userRole === 'hr_manager' || userRole === 'payroll_manager') {
		contentFields.forEach(field => {
			field.disabled = true;
			field.classList.add('bg-gray-100', 'cursor-not-allowed');
		});
		if (statusField) {
			if (currentStatus === 'submitted') {
				statusField.disabled = false;
				statusField.classList.remove('bg-gray-100', 'cursor-not-allowed');
			} else {
				statusField.disabled = true;
				statusField.classList.add('bg-gray-100', 'cursor-not-allowed');
			}
		}
	} else if (userRole === 'employee') {
		if (currentStatus === 'draft') {
			contentFields.forEach(field => {
				field.disabled = false;
				field.classList.remove('bg-gray-100', 'cursor-not-allowed');
			});
			if (statusField) {
				statusField.disabled = false;
				statusField.classList.remove('bg-gray-100', 'cursor-not-allowed');
			}
		} else {
			contentFields.forEach(field => {
				field.disabled = true;
				field.classList.add('bg-gray-100', 'cursor-not-allowed');
			});
			if (statusField) {
				statusField.disabled = true;
				statusField.classList.add('bg-gray-100', 'cursor-not-allowed');
			}
		}
	} else if (userRole === 'system_admin') {
		contentFields.forEach(field => {
			field.disabled = false;
			field.classList.remove('bg-gray-100', 'cursor-not-allowed');
		});
		if (statusField) {
			statusField.disabled = false;
			statusField.classList.remove('bg-gray-100', 'cursor-not-allowed');
		}
	}
}

document.addEventListener('htmx:afterRequest', function(event) {
	if (event.detail.xhr.status === 401) {
		if (typeof window.redirectToLoginOnce === 'function') { window.redirectToLoginOnce(); } else { window.location.href = '/login'; }
	}
});

function getAuthToken() {
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === 'session_token') {
			return `Bearer ${value}`;
		}
	}
	let token = localStorage.getItem('session_token');
	if (token) {
		return `Bearer ${token}`;
	}
	return '';
}

function showEditTimesheetModal() {
	showToast('Edit timesheet functionality goes here', 'info');
}

function showDeleteConfirmation() {
	showToast('Delete timesheet functionality goes here', 'error');
}

function showToast(message, type = 'info') {
	const toast = document.createElement('div');
	toast.className = `toast ${type}`;
	toast.textContent = message;
	document.body.appendChild(toast);
	setTimeout(() => {
		toast.classList.add('show');
	}, 100);
	setTimeout(() => {
		toast.classList.remove('show');
		setTimeout(() => {
			if (toast.parentElement) {
				toast.remove();
			}
		}, 300);
	}, 3000);
}

function setupDeleteButtonVisibility(userRole) {
	const deleteButtons = document.querySelectorAll('.delete-timesheet-btn');
	console.log('Setup delete button visibility:', {
		userRole: userRole,
		deleteButtonsFound: deleteButtons.length,
		shouldShow: userRole === 'system_admin' || userRole === 'operational_manager'
	});
	if (userRole === 'system_admin' || userRole === 'operational_manager') {
		deleteButtons.forEach(button => {
			button.style.display = 'inline';
			console.log('Showing delete button for role:', userRole);
		});
	} else {
		deleteButtons.forEach(button => {
			button.style.display = 'none';
			console.log('Hiding delete button for role:', userRole);
		});
	}
}

// Show Approve/Reject buttons for approver roles on submitted rows
function revealApprovalButtons(userRole) {
    const approverRoles = ['system_admin', 'operational_manager', 'hr_manager', 'payroll_manager'];
    const rows = document.querySelectorAll('#timesheet-table tbody tr');
    rows.forEach(row => {
        const statusCell = row.querySelector('td:nth-child(4) span');
        const isSubmitted = statusCell && statusCell.textContent && statusCell.textContent.trim() === 'submitted';
        const approveBtn = row.querySelector('.approve-timesheet-btn');
        const rejectBtn = row.querySelector('.reject-timesheet-btn');
        if (!approveBtn || !rejectBtn) return;
        if (isSubmitted && approverRoles.includes(userRole)) {
            approveBtn.style.display = 'inline';
            rejectBtn.style.display = 'inline';
        } else {
            approveBtn.style.display = 'none';
            rejectBtn.style.display = 'none';
        }
    });
}
