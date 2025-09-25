// Employees JavaScript for Nexus Pay

// Configure HTMX globally
htmx.config.withCredentials = true;

let employeeCurrentPage = Number(localStorage.getItem('emp_page')) || 1;
let employeePageSize = Number(localStorage.getItem('emp_limit')) || 10;
let employeeHasNext = true;
let isLoadingEmployees = false; // prevent duplicate table loads
let employeeInitial = localStorage.getItem('emp_initial') || '';
let pendingEmployeeParams = null; // queue latest params while in-flight

function updateEmployeePageLabel(page){
    const el = document.getElementById('employee-page-label');
    if (el) el.textContent = `Page ${page}`;
}

function changeEmployeePage(delta){
    const newPage = Math.max(1, employeeCurrentPage + delta);
    if (delta < 0 && employeeCurrentPage === 1) return;
    if (delta > 0 && !employeeHasNext) return;
    employeeCurrentPage = newPage;
    applyFilters();
}

function initializeEmployeesPage(){
	// proteção simples contra burst
	if (typeof window.shouldInitNow === 'function' && !window.shouldInitNow(500)) return;
    try {
        loadEmployees();
        loadFilterOptions();
        setupRoleBasedNavigation();
	} catch (e) { console.error('Employees init error:', e); }
}

// Expose init for HTMX swaps
window.NexuPayrollEmployeesInit = function(){ initializeEmployeesPage(); };

document.addEventListener('DOMContentLoaded', function() {
    console.log('Nexus Pay Employees - Ready');
    initializeEmployeesPage();
}, { once: true });

// Load employees table using HTMX
function loadEmployees(page = employeeCurrentPage, limit = employeePageSize, search = '', department = '', status = '', sort = '') {
    const employeeTable = document.getElementById('employee-table');
    if (!employeeTable) return;
    // If a request is in-flight, queue the latest params and exit
    if (isLoadingEmployees) {
        pendingEmployeeParams = { page, limit, search, department, status };
        return;
    }
    isLoadingEmployees = true;
    updateEmployeePageLabel(page);
    // persist
    localStorage.setItem('emp_page', String(page));
    localStorage.setItem('emp_limit', String(limit));
    localStorage.setItem('emp_search', search);
    localStorage.setItem('emp_department', department);
    localStorage.setItem('emp_status', status);
    localStorage.setItem('emp_sort', sort);

    htmx.ajax('GET', `/employees/table?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&department=${encodeURIComponent(department)}&status=${encodeURIComponent(status)}&sort=${encodeURIComponent(sort)}&initial=${encodeURIComponent(employeeInitial)}`, {
        target: '#employee-table'
    });
}

// Departments cache to avoid 429
let __NP_DEPARTMENTS_CACHE = null;
let __NP_DEPARTMENTS_TS = 0;
let __NP_DEPARTMENTS_PENDING = null;
const DEPT_TTL_MS = 60000;

// Load filter options (departments, etc.)
function loadFilterOptions() {
    const departmentFilter = document.getElementById('department-filter');
    if (!departmentFilter) return;
    // Already populated
    if (departmentFilter.options && departmentFilter.options.length > 1) return;

    const now = Date.now();
    if (__NP_DEPARTMENTS_CACHE && (now - __NP_DEPARTMENTS_TS < DEPT_TTL_MS)) {
        populateDepartments(departmentFilter, __NP_DEPARTMENTS_CACHE);
        return;
    }
    if (__NP_DEPARTMENTS_PENDING) {
        __NP_DEPARTMENTS_PENDING.then(list => populateDepartments(departmentFilter, list)).catch(()=>{});
        return;
    }
	__NP_DEPARTMENTS_PENDING = fetch(`/api/departments`, { credentials: 'same-origin' })
        .then(response => response.json())
        .then(data => {
            __NP_DEPARTMENTS_CACHE = Array.isArray(data) ? data : [];
            __NP_DEPARTMENTS_TS = Date.now();
            populateDepartments(departmentFilter, __NP_DEPARTMENTS_CACHE);
            __NP_DEPARTMENTS_PENDING = null;
            return __NP_DEPARTMENTS_CACHE;
        })
        .catch(error => { console.error('Error loading departments:', error); __NP_DEPARTMENTS_PENDING = null; });
}

function populateDepartments(selectEl, departments){
    if (!selectEl) return;
    while (selectEl.options.length > 1) selectEl.remove(1);
    departments.forEach(department => {
        const option = document.createElement('option');
        option.value = department.id;
        option.textContent = department.name;
        selectEl.appendChild(option);
    });
}

// Apply search and filters
function applyFilters() {
    const search = document.getElementById('employee-search')?.value || '';
    const department = document.getElementById('department-filter')?.value || '';
    const status = document.getElementById('status-filter')?.value || '';
    const sort = document.getElementById('sort-select')?.value || (localStorage.getItem('emp_sort') || 'name_asc');
    loadEmployees(employeeCurrentPage, employeePageSize, search, department, status, sort);
}

// Alpha filter
function setAlphaFilter(ch){
    employeeInitial = ch || '';
    localStorage.setItem('emp_initial', employeeInitial);
    applyFilters();
}

// Setup role-based navigation

document.addEventListener('htmx:afterRequest', function(event) {
    if (event.detail.xhr.status === 401) {
        if (typeof window.redirectToLoginOnce === 'function') { window.redirectToLoginOnce(); } else { window.location.href = '/login'; }
    }
    if (event.detail.xhr.responseURL && event.detail.xhr.responseURL.includes('/employees/table')) {
        try {
            const hasNextHeader = event.detail.xhr.getResponseHeader('X-Has-Next');
            employeeHasNext = hasNextHeader ? hasNextHeader === 'true' : true;
        } catch (e) { employeeHasNext = true; }
        updateEmployeePageLabel(employeeCurrentPage);
        setTimeout(() => { setupRoleBasedNavigation(); }, 100);
        isLoadingEmployees = false; // release lock
        if (pendingEmployeeParams) {
            const { page, limit, search, department, status } = pendingEmployeeParams;
            pendingEmployeeParams = null;
            loadEmployees(page, limit, search, department, status);
        }
    }
});

async function setupRoleBasedNavigation() {
    try {
        const response = await fetch('/api/auth/profile', { credentials: 'same-origin' });
        if (response.ok) {
            const userData = await response.json();
            const userRole = userData.data.role;
            const usersLink = document.getElementById('users-link');
            if (usersLink) {
                usersLink.style.display = (userRole === 'system_admin' || userRole === 'hr_manager') ? 'inline' : 'none';
            }
            const payrollLink = document.getElementById('payroll-link');
            if (payrollLink) {
                payrollLink.style.display = (userRole === 'system_admin' || userRole === 'payroll_manager' || userRole === 'hr_manager') ? 'inline' : 'none';
            }
            const reportsLink = document.getElementById('reports-link');
            if (reportsLink) {
                reportsLink.style.display = (userRole === 'system_admin' || userRole === 'payroll_manager' || userRole === 'hr_manager') ? 'inline' : 'none';
            }
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

// Export functions to global scope
window.changeEmployeePage = changeEmployeePage;
window.applyFilters = applyFilters;
window.setAlphaFilter = setAlphaFilter;
