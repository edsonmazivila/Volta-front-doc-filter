// Payroll JavaScript for Nexus Pay
document.addEventListener('DOMContentLoaded', function() {
    console.log('Nexus Pay Payroll - Ready');
    initializePayrollPage();
    // Watchdog to avoid infinite loading if no swaps happen
    setTimeout(payrollWatchdogIfStuck, 3000);
});

function initializePayrollPage(){
    if (window.__NP_PAYROLL_INITIALIZED) {
        return; // Prevent duplicate init calls on HTMX swaps
    }
    window.__NP_PAYROLL_INITIALIZED = true;
    try {
        // Check if HTMX is available
        if (typeof htmx !== 'undefined') {
            console.log('HTMX is available, loading data via HTMX...');
            // Load initial data via HTMX
            loadPayrollStats();
            loadPayrollHistory();
        } else {
            console.log('HTMX not available, loading data via fetch...');
            // Fallback to fetch if HTMX is not available
            loadPayrollStatsFallback();
            loadPayrollHistoryFallback();
        }
        setCurrentPayPeriod();
        // Setup role-based navigation
        setupRoleBasedNavigation();
    } catch (e) {
        console.error('Payroll init error:', e);
    }
}

// Expose init for HTMX swaps
window.NexuPayrollPayrollInit = function(){
    initializePayrollPage();
};

// Also initialize on HTMX loads (when navigating without full page refresh)
document.addEventListener('htmx:load', function(){
    try { initializePayrollPage(); } catch (_) {}
    setTimeout(payrollWatchdogIfStuck, 1500);
});

// Refresh hook used across the app
document.body.addEventListener('refresh', function(){
    try {
        loadPayrollStats();
        loadPayrollHistory();
    } catch (_) {}
});

// Load payroll statistics via HTMX
// Throttle flags to prevent duplicate HTMX requests causing flicker
window.__NP_PAYROLL_STATS_LOADING = window.__NP_PAYROLL_STATS_LOADING || false;
window.__NP_PAYROLL_HISTORY_LOADING = window.__NP_PAYROLL_HISTORY_LOADING || false;
window.__NP_PAYROLL_LAST_STATS_AT = window.__NP_PAYROLL_LAST_STATS_AT || 0;
window.__NP_PAYROLL_LAST_HISTORY_AT = window.__NP_PAYROLL_LAST_HISTORY_AT || 0;

function loadPayrollStats() {
    const statsContainer = document.getElementById('payroll-stats');
    if (!statsContainer) { console.error('Stats container not found!'); return; }

    const now = Date.now();
    if (window.__NP_PAYROLL_STATS_LOADING || (now - window.__NP_PAYROLL_LAST_STATS_AT < 800)) {
        return; // Avoid rapid duplicate loads
    }
    window.__NP_PAYROLL_STATS_LOADING = true;
    window.__NP_PAYROLL_LAST_STATS_AT = now;

    if (typeof htmx !== 'undefined') {
        htmx.ajax('GET', '/payroll/stats', { target: '#payroll-stats' });
        // Failsafe to clear the loading flag even if no event hook fires
        setTimeout(function(){ window.__NP_PAYROLL_STATS_LOADING = false; }, 1200);
    }
}



// Load payroll history via HTMX
function loadPayrollHistory() {
    const historyContainer = document.getElementById('payroll-history');
    if (!historyContainer) { console.error('History container not found!'); return; }

    const now = Date.now();
    if (window.__NP_PAYROLL_HISTORY_LOADING || (now - window.__NP_PAYROLL_LAST_HISTORY_AT < 800)) {
        return; // Avoid rapid duplicate loads
    }
    window.__NP_PAYROLL_HISTORY_LOADING = true;
    window.__NP_PAYROLL_LAST_HISTORY_AT = now;

    if (typeof htmx !== 'undefined') {
        htmx.ajax('GET', '/payroll/history', { target: '#payroll-history' });
        setTimeout(function(){ window.__NP_PAYROLL_HISTORY_LOADING = false; }, 1200);
    }
}

// Clear loading flags when HTMX swaps complete for our targets
document.body.addEventListener('htmx:afterSwap', function(evt){
    try {
        var t = evt && (evt.target || (evt.detail && evt.detail.target));
        if (!t) return;
        if (t.id === 'payroll-stats' || (t.closest && t.closest('#payroll-stats'))) {
            window.__NP_PAYROLL_STATS_LOADING = false;
        }
        if (t.id === 'payroll-history' || (t.closest && t.closest('#payroll-history'))) {
            window.__NP_PAYROLL_HISTORY_LOADING = false;
        }
    } catch (_) {}
});

// If requests fail or never fire, replace spinners with benign placeholders
function payrollWatchdogIfStuck(){
    try {
        var stats = document.getElementById('payroll-stats');
        if (stats && /Loading payroll statistics/i.test(stats.innerText)) {
            stats.innerHTML = '<div class="p-6 text-center text-gray-500">--</div>';
        }
        var hist = document.getElementById('payroll-history');
        if (hist && /Loading payroll history/i.test(hist.innerText)) {
            hist.innerHTML = '<div class="p-6 text-center text-gray-500">No history to display</div>';
        }
    } catch (_) {}
}

// Fallback function for loading payroll stats via fetch
function loadPayrollStatsFallback() {
    console.log('Loading payroll stats via fetch...');
    fetch('/payroll/stats', {
        headers: {
            'Cookie': document.cookie
        }
    })
    .then(response => response.text())
    .then(html => {
        const statsContainer = document.getElementById('payroll-stats');
        if (statsContainer) {
            statsContainer.innerHTML = html;
        }
    })
    .catch(error => {
        console.error('Error loading payroll stats:', error);
    });
}

// Fallback function for loading payroll history via fetch
function loadPayrollHistoryFallback() {
    console.log('Loading payroll history via fetch...');
    fetch('/payroll/history', {
        headers: {
            'Cookie': document.cookie
        }
    })
    .then(response => response.text())
    .then(html => {
        const historyContainer = document.getElementById('payroll-history');
        if (historyContainer) {
            historyContainer.innerHTML = html;
        }
    })
    .catch(error => {
        console.error('Error loading payroll history:', error);
    });
}

// Set current pay period dates
function setCurrentPayPeriod() {
    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    document.getElementById('period-start').value = periodStart.toISOString().split('T')[0];
    document.getElementById('period-end').value = periodEnd.toISOString().split('T')[0];
}

// Payroll action functions
async function calculatePayroll() {

	const startDate = document.getElementById('period-start').value;
	const endDate = document.getElementById('period-end').value;

	if (!startDate || !endDate) {
		showToast('Please select both start and end dates', 'error');
		return;
	}

	// Calculate pay date (next Friday after end date)
	const endDateObj = new Date(endDate);
	const payDate = new Date(endDateObj);
	payDate.setDate(endDateObj.getDate() + (5 + 7 - endDateObj.getDay()) % 7); // Next Friday

	const requestData = {
		pay_period_start: startDate,
		pay_period_end: endDate,
		pay_date: payDate.toISOString().split('T')[0],
		pay_frequency: 'biweekly'
	};

	showToast('Calculating payroll...', 'info');

    // Session is handled via HttpOnly cookie; no JS token reads

	try {
        const response = await fetch('/api/payroll/calculate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
            credentials: 'same-origin',
			body: JSON.stringify(requestData)
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		
		if (data.success) {
			showToast('Payroll calculation completed successfully!', 'success');
			loadPayrollStats();
			loadPayrollHistory();

			// Store the payroll run ID for later use
			localStorage.setItem('lastPayrollRunId', data.payroll_run.id);
		} else {
			showToast('Payroll calculation failed: ' + (data.message || 'Unknown error'), 'error');
		}
	} catch (error) {
		console.error('Error calculating payroll:', error);
		showToast('Error calculating payroll: ' + error.message, 'error');
	}
}

async function runPayroll() {

	const payrollRunId = localStorage.getItem('lastPayrollRunId');

	if (!payrollRunId) {
		showToast('No payroll calculation found. Please calculate payroll first.', 'error');
		return;
	}

    if (confirm('Are you sure you want to run payroll? This action cannot be undone.')) {
		showToast('Running payroll...', 'info');

		try {
			const response = await fetch(`/api/payroll/run/${payrollRunId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
                credentials: 'same-origin'
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			
			if (data.success) {
				showToast('Payroll run completed successfully!', 'success');
				loadPayrollStats();
				loadPayrollHistory();
				localStorage.removeItem('lastPayrollRunId');
			} else {
				showToast('Payroll run failed: ' + (data.message || 'Unknown error'), 'error');
			}
		} catch (error) {
			console.error('Error running payroll:', error);
			showToast('Error running payroll: ' + error.message, 'error');
		}
	}
}

async function previewPayroll() {
    console.log('previewPayroll function called');
    const startDate = document.getElementById('period-start').value;
    const endDate = document.getElementById('period-end').value;
    
    console.log('Start date:', startDate, 'End date:', endDate);
    
    if (!startDate || !endDate) {
        showToast('Please select both start and end dates', 'error');
        return;
    }
    
    showToast('Generating payroll preview...', 'info');
    
    try {
        // Get eligible employees count (company ID is now handled by backend)
        const employeesResponse = await fetch(`/api/employees?employment_status=active&limit=1000`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Include cookies for session-based auth
        });

        if (!employeesResponse.ok) {
            throw new Error('Failed to fetch employees');
        }

        const employeesData = await employeesResponse.json();
        console.log('Employees data:', employeesData);
        const eligibleEmployees = employeesData.employees ? employeesData.employees.length : 0;
        console.log('Eligible employees count:', eligibleEmployees);

        // Calculate total hours (estimate based on employees and pay period)
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const estimatedHoursPerEmployee = 8; // 8 hours per day
        const totalHours = eligibleEmployees * daysDiff * estimatedHoursPerEmployee;

        // Show preview modal
        showModal();
        document.getElementById('modal-content').innerHTML = `
            <div class="space-y-4">
                <h4 class="text-lg font-semibold">Payroll Preview</h4>
                <p><strong>Pay Period:</strong> ${startDate} to ${endDate}</p>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-4 rounded">
                        <p class="font-medium">Eligible Employees</p>
                        <p class="text-2xl font-bold text-jech-accent">${eligibleEmployees}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded">
                        <p class="font-medium">Estimated Total Hours</p>
                        <p class="text-2xl font-bold text-jech-accent">${totalHours.toLocaleString()}</p>
                    </div>
                </div>
                <div class="mt-6">
                    <button onclick="confirmPayroll()" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-3">
                        Confirm & Run
                    </button>
                    <button onclick="hideModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        Cancel
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error generating preview:', error);
        showToast('Error generating preview: ' + error.message, 'error');
        
        // Fallback to basic preview
        showModal();
        document.getElementById('modal-content').innerHTML = `
            <div class="space-y-4">
                <h4 class="text-lg font-semibold">Payroll Preview</h4>
                <p><strong>Pay Period:</strong> ${startDate} to ${endDate}</p>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-4 rounded">
                        <p class="font-medium">Eligible Employees</p>
                        <p class="text-2xl font-bold text-jech-accent">Calculating...</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded">
                        <p class="font-medium">Estimated Total Hours</p>
                        <p class="text-2xl font-bold text-jech-accent">Calculating...</p>
                    </div>
                </div>
                <div class="mt-6">
                    <button onclick="confirmPayroll()" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-3">
                        Confirm & Run
                    </button>
                    <button onclick="hideModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        Cancel
                    </button>
                </div>
            </div>
        `;
    }
}

function confirmPayroll() {
    hideModal();
    runPayroll();
}

function viewPayrollDetails(payrollRunId, date) {
    showToast(`Loading payroll details for ${date}`, 'info');
    // Implementation for viewing payroll details
    // Could open a modal or navigate to a detailed view
}

async function downloadPayrollReport(payrollRunId, date) {
    try {
        showToast(`Generating Excel report for ${date}...`, 'info');
        
        // Ensure we have a valid session
        
        // Download the Excel file directly
        const downloadLink = document.createElement('a');
        downloadLink.href = `/api/payroll/excel/${payrollRunId}`;
        downloadLink.download = `payroll_${date}.xlsx`;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        showToast(`Excel report downloaded successfully!`, 'success');
        
    } catch (error) {
        console.error('Error downloading payroll report:', error);
        showToast(`Error downloading report: ${error.message}`, 'error');
    }
}

async function downloadBCI(payrollRunId, date) {
    try {
        showToast(`Generating BCI file for ${date}...`, 'info');
        const a = document.createElement('a');
        a.href = `/api/payroll/excel/bci/${payrollRunId}`;
        a.download = `BCI_${date}.xlsx`;
        a.style.display = 'none';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        showToast('BCI file downloaded.', 'success');
    } catch (e) {
        console.error('BCI export error', e);
        showToast('Error exporting BCI file', 'error');
    }
}

async function downloadTabela(payrollRunId, date) {
    try {
        showToast(`Generating Tabela Salarial for ${date}...`, 'info');
        const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const d = new Date(date);
        const mes = monthNames[d.getMonth()] || '';
        const a = document.createElement('a');
        a.href = `/api/payroll/excel/tabela/${payrollRunId}?mes=${encodeURIComponent(mes)}`;
        a.download = `Tabela_salarial_${date}.xlsx`;
        a.style.display = 'none';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        showToast('Tabela Salarial downloaded.', 'success');
    } catch (e) {
        console.error('Tabela export error', e);
        showToast('Error exporting Tabela Salarial', 'error');
    }
}

// Modal functions
function showModal() {
    document.getElementById('modal').classList.remove('hidden');
}

function hideModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal-content').innerHTML = '';
}

// Toast notification function
function showToast(message, type = 'info') {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
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

// Removed JS token helpers; backend HttpOnly cookie handles auth

function getCompanyId() {
    // For now, return a default company ID
    // In a real implementation, this would come from user context
    return '538bed86-cc0e-4dce-8b9a-c378a0cf8f1b';
}

// Setup role-based navigation
async function setupRoleBasedNavigation() {
    try {
        const response = await fetch('/api/auth/profile', {
            credentials: 'same-origin'
        });
        
        if (response.ok) {
            const userData = await response.json();
            const userRole = userData.data.role;
            
            // Handle Users link (system_admin and hr_manager only)
            const usersLink = document.getElementById('users-link');
            if (usersLink) {
                if (userRole === 'system_admin' || userRole === 'hr_manager') {
                    usersLink.style.display = '';
                } else {
                    usersLink.style.display = 'none';
                }
            }
            
            // Handle Payroll link (system_admin, payroll_manager, hr_manager)
            const payrollLink = document.getElementById('payroll-link');
            if (payrollLink) {
                if (userRole === 'system_admin' || userRole === 'payroll_manager' || 
                    userRole === 'hr_manager') {
                    payrollLink.style.display = '';
                } else {
                    payrollLink.style.display = 'none';
                }
            }
            
            // Handle Reports link (system_admin, payroll_manager, hr_manager)
            const reportsLink = document.getElementById('reports-link');
            if (reportsLink) {
                if (userRole === 'system_admin' || userRole === 'payroll_manager' || 
                    userRole === 'hr_manager') {
                    reportsLink.style.display = '';
                } else {
                    reportsLink.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Hide links by default if we can't determine role
        const usersLink = document.getElementById('users-link');
        if (usersLink) {
            usersLink.style.display = 'none';
        }
        const payrollLink = document.getElementById('payroll-link');
        if (payrollLink) {
            payrollLink.style.display = 'none';
        }
        const reportsLink = document.getElementById('reports-link');
        if (reportsLink) {
            reportsLink.style.display = 'none';
        }
    }
}

// Handle unauthorized access
document.addEventListener('htmx:afterRequest', function(event) {
    if (event.detail.xhr.status === 401) {
        window.location.href = '/login';
    }
});

