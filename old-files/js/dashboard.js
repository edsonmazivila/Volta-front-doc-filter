// Dashboard JavaScript for Nexus Pay
let isLoadingStats = false;
let refreshInterval = null;
let privacyMode = localStorage.getItem('dashboard-privacy-mode') === 'true';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Nexus Pay Dashboard - Ready');
    
    // Load dashboard statistics
    loadDashboardStats();
    // Fallback watchdog: if still loading after 3s, show placeholders
    setTimeout(forceStopLoadingIfStuck, 3000);
    
    // Setup navigation highlighting
    highlightCurrentPage();
    
    // Setup quick action handlers
    setupQuickActions();
    
    // Setup user role-based navigation
    setupRoleBasedNavigation();
    
    // Initialize privacy mode
    initializePrivacyMode();
    
    // Auto-refresh stats every 60 seconds (reduced frequency to prevent flickering)
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        if (!isLoadingStats) {
            loadDashboardStats();
        }
    }, 60000);
});

// Initialize dashboard after HTMX swaps when the main content is replaced
function initDashboard() {
    try {
        // Only run if dashboard cards exist in the DOM
        if (!document.getElementById('employee-count') && !document.getElementById('pending-timesheets') && !document.getElementById('monthly-payroll')) {
            return;
        }

        loadDashboardStats();
        setTimeout(forceStopLoadingIfStuck, 3000);
        highlightCurrentPage();
        setupQuickActions();
        setupRoleBasedNavigation();
        initializePrivacyMode();

        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(() => {
            if (!isLoadingStats) {
                loadDashboardStats();
            }
        }, 60000);
    } catch (e) {
        console.warn('initDashboard error', e);
    }
}

// Re-initialize when HTMX swaps in the dashboard content
document.body && document.body.addEventListener('htmx:afterSwap', function(evt) {
    const target = evt && evt.target;
    if (!target) return;
    // Run when #main-content is updated or when swapped fragment contains a dashboard KPI
    if (target.id === 'main-content' || target.querySelector && (target.querySelector('#employee-count') || target.querySelector('#monthly-payroll'))) {
        initDashboard();
    }
});

// Also initialize on HTMX load events (some navigations only fire htmx:load)
document.body && document.body.addEventListener('htmx:load', function(evt){
    const el = evt && evt.target;
    if (!el) return;
    if (el.id === 'main-content' || el.querySelector && (el.querySelector('#employee-count') || el.querySelector('#monthly-payroll'))) {
        initDashboard();
    }
});

// Load dashboard statistics
async function loadDashboardStats() {
    // Prevent concurrent loading
    if (isLoadingStats) {
        console.log('Dashboard stats already loading, skipping...');
        return;
    }
    
    isLoadingStats = true;
    
    // Rely on HttpOnly session cookie (same-origin). Do not require JS-accessible token.
    const authToken = null;

    // Get user profile to get company ID
    let companyId = null;
    try {
        const profileResponse = await fetch('/api/auth/profile', {
            credentials: 'same-origin',
            headers: {}
        });
        
        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            companyId = profileData.data.company_id;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }

    if (!companyId) {
        console.error('No company ID available');
        updateStatCard('Total Employees', '--');
        updateStatCard('Pending Timesheets', '--');
        updateStatCard('Monthly Payroll', '--');
        isLoadingStats = false;
        return;
    }

    try {
        // Load employee count
        const employeeResponse = await fetch('/api/employees/stats', {
            credentials: 'same-origin',
            headers: {}
        });
        
        if (employeeResponse.ok) {
            const employeeData = await employeeResponse.json();
            updateStatCard('Total Employees', employeeData.total || 0);
        } else {
            updateStatCard('Total Employees', '--');
        }
    } catch (error) {
        console.error('Error loading employee stats:', error);
        updateStatCard('Total Employees', '--');
    }

    try {
        // Load timesheet stats
        const timesheetResponse = await fetch('/api/timesheets/stats', {
            credentials: 'same-origin',
            headers: {}
        });
        
        if (timesheetResponse.ok) {
            const timesheetData = await timesheetResponse.json();
            updateStatCard('Pending Timesheets', timesheetData.data.pending || 0);
        } else {
            updateStatCard('Pending Timesheets', '--');
        }
    } catch (error) {
        console.error('Error loading timesheet stats:', error);
        updateStatCard('Pending Timesheets', '--');
    }

    try {
        // Load payroll stats (non-API web endpoint) using session cookie
        const payrollResponse = await fetch('/payroll/stats', {
            credentials: 'same-origin'
        });
        
        if (payrollResponse.ok) {
            const contentType = payrollResponse.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const payrollData = await payrollResponse.json();
                let monthlyTotal = (payrollData.data && payrollData.data.monthly_total) || payrollData.monthly_total || 0;
                
                // Validate and sanitize the data - prevent unrealistic values
                if (typeof monthlyTotal === 'number' && isFinite(monthlyTotal)) {
                    // Cap at reasonable maximum (e.g., $1 trillion) to prevent display issues
                    monthlyTotal = Math.min(Math.abs(monthlyTotal), 1e12) * Math.sign(monthlyTotal);
                } else {
                    monthlyTotal = 0;
                }
                
                updateStatCard('Monthly Payroll', monthlyTotal);
            } else {
                // Fallback: try text and parse number if server returned plain text
                const text = await payrollResponse.text();
                let num = parseFloat(text.replace(/[^0-9.-]/g, '')) || 0;
                
                // Apply same validation
                if (isFinite(num)) {
                    num = Math.min(Math.abs(num), 1e12) * Math.sign(num);
                } else {
                    num = 0;
                }
                
                updateStatCard('Monthly Payroll', num);
            }
        } else {
            updateStatCard('Monthly Payroll', '--');
        }
    } catch (error) {
        console.error('Error loading payroll stats:', error);
        updateStatCard('Monthly Payroll', '--');
    }
    
    // Mark loading as complete
    isLoadingStats = false;
}

// Initialize privacy mode on page load
function initializePrivacyMode() {
    const privacyToggle = document.getElementById('privacy-toggle');
    if (privacyToggle) {
        updatePrivacyToggleIcon();
        if (privacyMode) {
            applyPrivacyMode();
        }
    }
}

// Toggle privacy mode for sensitive data
function togglePrivacyMode() {
    privacyMode = !privacyMode;
    localStorage.setItem('dashboard-privacy-mode', privacyMode.toString());
    updatePrivacyToggleIcon();
    
    if (privacyMode) {
        applyPrivacyMode();
    } else {
        removePrivacyMode();
    }
}

// Update privacy toggle icon
function updatePrivacyToggleIcon() {
    const privacyToggle = document.getElementById('privacy-toggle');
    if (!privacyToggle) return;
    
    const svg = privacyToggle.querySelector('svg');
    if (privacyMode) {
        // Eye-off icon (hidden)
        svg.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
        `;
        privacyToggle.title = 'Show sensitive data';
    } else {
        // Eye icon (visible)
        svg.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        `;
        privacyToggle.title = 'Hide sensitive data';
    }
}

// Apply privacy mode (blur sensitive data)
function applyPrivacyMode() {
    const payrollCard = document.getElementById('monthly-payroll');
    if (payrollCard) {
        payrollCard.style.filter = 'blur(8px)';
        payrollCard.style.userSelect = 'none';
        payrollCard.setAttribute('data-privacy-hidden', 'true');
    }
}

// Remove privacy mode (show sensitive data)
function removePrivacyMode() {
    const payrollCard = document.getElementById('monthly-payroll');
    if (payrollCard) {
        payrollCard.style.filter = 'none';
        payrollCard.style.userSelect = 'auto';
        payrollCard.removeAttribute('data-privacy-hidden');
    }
}

// Get authentication token from localStorage or cookie
function getAuthToken() {
    // Check for session_token cookie (set by backend)
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'session_token') {
            return `Bearer ${value}`;
        }
    }
    
    // Fallback to localStorage (for API usage)
    let token = localStorage.getItem('session_token');
    if (token) {
        return `Bearer ${token}`;
    }
    
    return '';
}

// Update stat card with value
function updateStatCard(title, value) {
    let elementId = '';
    
    switch(title) {
        case 'Total Employees':
            elementId = 'employee-count';
            break;
        case 'Pending Timesheets':
            elementId = 'pending-timesheets';
            break;
        case 'Monthly Payroll':
            elementId = 'monthly-payroll';
            break;
    }
    
    if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            // Remove loading placeholder
            const loadingPlaceholder = element.querySelector('.loading-placeholder');
            if (loadingPlaceholder) {
                loadingPlaceholder.remove();
            }
            
            // Store the current value to prevent unnecessary updates
            const currentValue = element.getAttribute('data-current-value');
            const newValueStr = String(value);
            
            // Only update if the value has actually changed
            if (currentValue !== newValueStr) {
                // Format the value based on type
                let formattedValue = value;
                if (typeof value === 'number') {
                    if (title === 'Monthly Payroll') {
                        formattedValue = formatCurrency(value);
                    } else {
                        formattedValue = formatNumber(value);
                    }
                }
                
                element.textContent = formattedValue;
                element.setAttribute('data-current-value', newValueStr);
                
                // Add subtle animation only for actual changes
                element.classList.add('animate-pulse');
                setTimeout(() => {
                    element.classList.remove('animate-pulse');
                }, 500);
            }
        }
    }
}

// Watchdog to remove infinite loading placeholders if something stalled
function forceStopLoadingIfStuck(){
    try {
        const ids = ['employee-count','pending-timesheets','monthly-payroll'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const placeholder = el.querySelector('.loading-placeholder');
            if (placeholder) {
                placeholder.remove();
                if (!el.getAttribute('data-current-value')) {
                    el.textContent = '--';
                    el.setAttribute('data-current-value', '--');
                }
            }
        });
    } catch(_){}
}

// Enhanced number formatting utilities following 2025 best practices
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '--';
    
    // Use compact notation for numbers >= 1000 for better dashboard readability
    if (Math.abs(num) >= 1000) {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 1
        }).format(num);
    }
    
    return new Intl.NumberFormat('en-US').format(num);
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '--';
    
    // Sanitize extremely large numbers that might be test data or errors
    const sanitizedAmount = Math.abs(amount) > 1e15 ? 0 : amount;
    
    // Use compact notation for large currency amounts (>= $10K) for dashboard clarity
    if (Math.abs(sanitizedAmount) >= 10000) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 1
        }).format(sanitizedAmount);
    }
    
    // Standard formatting for smaller amounts
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(sanitizedAmount);
}

function formatCompactNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '--';
    
    // Sanitize extremely large numbers
    const sanitizedNum = Math.abs(num) > 1e15 ? 0 : num;
    
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
    }).format(sanitizedNum);
}

// Highlight current page in navigation
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('text-jech-accent', 'font-bold');
            link.classList.remove('text-jech-dark');
        }
    });
}

// Setup quick action handlers
function setupQuickActions() {
    const actionButtons = document.querySelectorAll('.bg-gradient-to-r button');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const actionText = this.parentElement.querySelector('span').textContent;
            handleQuickAction(actionText);
        });
    });
}

// Handle quick action clicks
function handleQuickAction(action) {
    switch(action) {
        case 'Add Employee':
            window.location.href = '/employees';
            break;
        case 'Create Timesheet':
            window.location.href = '/timesheets';
            break;
        case 'Run Payroll':
            window.location.href = '/payroll';
            break;
        default:
            console.log('Unknown action:', action);
    }
}



// Toast notification system
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 3000);
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
            
            // Handle Employees link (system_admin, hr_manager, operational_manager, payroll_manager)
            const employeesLink = document.getElementById('employees-link');
            if (employeesLink) {
                if (userRole === 'system_admin' || userRole === 'hr_manager' || 
                    userRole === 'operational_manager' || userRole === 'payroll_manager') {
                    employeesLink.style.display = '';
                } else {
                    employeesLink.style.display = 'none';
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
        const employeesLink = document.getElementById('employees-link');
        if (employeesLink) {
            employeesLink.style.display = 'none';
        }
        const reportsLink = document.getElementById('reports-link');
        if (reportsLink) {
            reportsLink.style.display = 'none';
        }
    }
}

// Handle logout
document.addEventListener('htmx:afterRequest', function(event) {
    if (event.detail.xhr.status === 401) {
        // Redirect to login if unauthorized
        if (typeof window.redirectToLoginOnce === 'function') { window.redirectToLoginOnce(); } else { window.location.href = '/login'; }
    }
});

// Global utility functions
window.NexuPayrollDashboard = {
    showToast: showToast,
    loadStats: loadDashboardStats,
    updateStatCard: updateStatCard
};
