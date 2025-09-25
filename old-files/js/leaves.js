// Leave Management JavaScript - Nexus Pay
class LeaveManagement {
    constructor() {
        if (window.__leaveManagementInitialized) {
            return; // Prevent duplicate initialization
        }
        window.__leaveManagementInitialized = true;
        this.currentTab = 'myRequests';
        // Check if this is the My Leaves page
        this.isMyLeavesPage = window.location.pathname === '/my-leaves';
        this.leaveRequests = [];
        this.pendingApprovals = [];
        this.balances = {};
        this.filters = {
            status: '',
            type: ''
        };
        
        // Add flag to prevent duplicate submissions
        this.isSubmitting = false;
        this.submissionQueue = new Set(); // Track pending submissions
        
        this._loadedTabs = new Set(['myRequests']);
        this.init();
    }

    init() {
        console.log('🚀 Initializing Leave Management System');
        this.setupEventListeners();
        this.loadUserData();
        this.loadInitialData();
    }

    async loadUserData() {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                const json = await response.json();
                const role = json?.role || json?.data?.role;
                this.userRole = role;
                this.setupRoleBasedInterface();
                console.log('✅ User data loaded, role:', this.userRole);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    setupRoleBasedInterface() {
        if (!this.userRole) return;

        // Operational managers should see all tabs
        if (this.userRole === 'operational_manager') {
            // Show pending approvals tab for managers
            const pendingTab = document.getElementById('pendingApprovalsTab');
            if (pendingTab) {
                pendingTab.style.display = 'block';
            }
        } else if (this.userRole === 'employee') {
            // Hide pending approvals tab for regular employees
            const pendingTab = document.getElementById('pendingApprovalsTab');
            if (pendingTab) {
                pendingTab.style.display = 'none';
            }
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.getElementById('myRequestsTab')?.addEventListener('click', () => this.switchTab('myRequests'));
        document.getElementById('myBalancesTab')?.addEventListener('click', () => this.switchTab('myBalances'));
        document.getElementById('pendingApprovalsTab')?.addEventListener('click', () => this.switchTab('pendingApprovals'));

        // Action buttons
        document.getElementById('newLeaveRequestBtn')?.addEventListener('click', () => this.openNewRequestModal());
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.refreshData());

        // Modal controls - PREVENT DUPLICATE SUBMISSIONS
        const submitButton = document.getElementById('submitLeaveRequest');
        if (submitButton) {
            // Remove any existing listeners first
            submitButton.replaceWith(submitButton.cloneNode(true));
            const newSubmitButton = document.getElementById('submitLeaveRequest');
            newSubmitButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.submitNewRequest();
            });
        }
        
        document.getElementById('cancelLeaveRequest')?.addEventListener('click', () => this.closeNewRequestModal());

        // Filter controls
        document.getElementById('statusFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('typeFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => this.clearFilters());

        // Form date calculation
        document.getElementById('startDate')?.addEventListener('change', () => this.calculateDays());
        document.getElementById('endDate')?.addEventListener('change', () => this.calculateDays());
        document.getElementById('isHalfDay')?.addEventListener('change', () => this.calculateDays());

        // Close modals on backdrop click
        document.getElementById('leaveRequestModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'leaveRequestModal') this.closeNewRequestModal();
        });
        document.getElementById('leaveDetailModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'leaveDetailModal') this.closeDetailModal();
        });
        
        // Close modal on close button click
        document.getElementById('closeDetailsBtn')?.addEventListener('click', () => {
            this.closeDetailModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeNewRequestModal();
                this.closeDetailModal();
            }
        });
    }

    async loadInitialData() {
        try {
            // Load only the active tab on first load to avoid burst calls
            await Promise.all([
                this.loadLeaveBalances(),
                this.currentTab === 'myRequests' ? this.loadLeaveRequests() : Promise.resolve(),
                this.currentTab === 'pendingApprovals' ? this.loadPendingApprovals() : Promise.resolve()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Erro ao carregar dados iniciais');
        }
    }

    async loadLeaveBalances() {
        try {
            const response = await fetch('/api/leave-balances/me', {
                credentials: 'same-origin'
            });

            if (!response.ok) throw new Error('Failed to load balances');

            const data = await response.json();
            this.balances = Array.isArray(data.balances) ? data.balances : [];
            this.updateBalanceDisplay();
            
            console.log('✅ Leave balances loaded:', this.balances);
        } catch (error) {
            console.error('Error loading leave balances:', error);
            this.showError('Erro ao carregar saldos de licenças');
        }
    }

    async loadLeaveRequests() {
        try {
            const params = new URLSearchParams();
            const filters = (this && this.filters) ? this.filters : { status: '', type: '' };
            if (filters.status) params.append('status', filters.status);
            if (filters.type) params.append('leave_type', filters.type);

            // Use different endpoint based on current tab
            let endpoint = '/api/leave-requests';
            if (this.currentTab === 'myRequests') {
                endpoint = '/api/leave-requests/my';
            }

            console.log('🔍 DEBUG: Current tab:', this.currentTab, 'Using endpoint:', endpoint);

            const response = await fetch(`${endpoint}?${params}`, {
                credentials: 'same-origin'
            });

            if (!response.ok) throw new Error('Failed to load leave requests');

            const data = await response.json();
            this.leaveRequests = data.requests || [];
            
            console.log('🔍 DEBUG: Response data:', data);
            console.log('🔍 DEBUG: Requests array:', this.leaveRequests);
            
            if (this.currentTab === 'myRequests') {
                this.renderLeaveRequests();
            }
            
            console.log('✅ Leave requests loaded:', this.leaveRequests.length);
        } catch (error) {
            console.error('Error loading leave requests:', error);
            this.showError('Erro ao carregar solicitações');
        }
    }

    async loadPendingApprovals() {
        try {
            const response = await fetch('/api/leave-requests/pending-approvals', {
                credentials: 'same-origin'
            });

            if (!response.ok) throw new Error('Failed to load pending approvals');

            const data = await response.json();
            this.pendingApprovals = data.requests || [];
            
            // Update pending count badge
            const countBadge = document.getElementById('pendingCount');
            if (countBadge) {
                if (this.pendingApprovals.length > 0) {
                    countBadge.textContent = this.pendingApprovals.length;
                    countBadge.classList.remove('hidden');
                } else {
                    countBadge.classList.add('hidden');
                }
            }

            if (this.currentTab === 'pendingApprovals') {
                this.renderPendingApprovals();
            }
            
            console.log('✅ Pending approvals loaded:', this.pendingApprovals.length, this.pendingApprovals);
        } catch (error) {
            console.error('Error loading pending approvals:', error);
            // Don't show error for pending approvals as user might not have permission
        }
    }

    updateBalanceDisplay() {
        const balanceMap = {};
        let totalPending = 0;

        // Convert array to map and calculate totals
        (this.balances || []).forEach(balance => {
            balanceMap[balance.leave_type] = balance;
            totalPending += balance.pending_days || 0;
        });

        // Update vacation balance
        const vacationBalance = balanceMap.vacation || null;
        const vacationElement = document.getElementById('vacationBalance');
        if (vacationBalance && vacationElement) {
            vacationElement.textContent = vacationBalance.remaining_days.toFixed(1);
            this.updateBalanceCardStyle('vacationBalance', vacationBalance.remaining_days);
        }

        // Update sick balance
        const sickBalance = balanceMap.sick || null;
        const sickElement = document.getElementById('sickBalance');
        if (sickBalance && sickElement) {
            sickElement.textContent = sickBalance.remaining_days.toFixed(1);
            this.updateBalanceCardStyle('sickBalance', sickBalance.remaining_days);
        }

        // Update personal balance
        const personalBalance = balanceMap.personal || null;
        const personalElement = document.getElementById('personalBalance');
        if (personalBalance && personalElement) {
            personalElement.textContent = personalBalance.remaining_days.toFixed(1);
            this.updateBalanceCardStyle('personalBalance', personalBalance.remaining_days);
        }

        // Update pending days
        const pendingElement = document.getElementById('pendingDays');
        if (pendingElement) {
            pendingElement.textContent = totalPending.toFixed(1);
        }
    }

    updateBalanceCardStyle(elementId, remainingDays) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const card = element.closest('.balance-card');
        if (!card) return;

        // Remove existing balance classes
        card.classList.remove('balance-low', 'balance-medium', 'balance-high');

        // Add appropriate class based on remaining days
        if (remainingDays <= 2) {
            card.classList.add('balance-low');
        } else if (remainingDays <= 5) {
            card.classList.add('balance-medium');
        } else {
            card.classList.add('balance-high');
        }
    }

    renderLeaveRequests() {
        console.log('🔄 Rendering leave requests...');
        const container = document.getElementById('leaveRequestsList');
        console.log('📍 Container found:', !!container);
        console.log('📋 Leave requests count:', this.leaveRequests.length);
        
        if (!container) {
            console.error('❌ leaveRequestsList container not found!');
            return;
        }

        if (this.leaveRequests.length === 0) {
            console.log('📝 No leave requests, showing empty state...');
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center">
                        <div class="text-gray-500">
                            <i class="fas fa-calendar-alt text-3xl mb-3"></i>
                            <p class="text-lg font-medium">Nenhuma solicitação encontrada</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        try {
            console.log('🔨 Creating HTML for', this.leaveRequests.length, 'requests...');
            const html = this.leaveRequests.map((request, index) => {
                console.log(`📄 Processing request ${index + 1}:`, request.id);
                return this.createLeaveRequestRow(request);
            }).join('');
            
            console.log('✅ HTML created, length:', html.length);
            container.innerHTML = html;
            console.log('✅ HTML inserted into container');

            // Add event listeners to action buttons
            this.attachLeaveRequestListeners();
        } catch (error) {
            console.error('❌ Error rendering leave requests:', error);
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-red-500">
                        Erro ao carregar solicitações: ${error.message}
                    </td>
                </tr>
            `;
        }
    }

    renderPendingApprovals() {
        console.log('🔄 Rendering pending approvals...');
        const container = document.getElementById('pendingApprovalsList');
        console.log('📍 Pending container found:', !!container);
        console.log('📋 Pending approvals count:', this.pendingApprovals.length);
        
        if (!container) {
            console.error('❌ pendingApprovalsList container not found!');
            return;
        }

        if (this.pendingApprovals.length === 0) {
            console.log('📝 No pending approvals, showing empty state...');
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center">
                        <div class="text-gray-500">
                            <i class="fas fa-check-circle text-3xl mb-3"></i>
                            <p class="text-lg font-medium">Nenhuma aprovação pendente</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        try {
            console.log('🔨 Creating pending approval HTML for', this.pendingApprovals.length, 'approvals...');
            const html = this.pendingApprovals.map((request, index) => {
                console.log(`📄 Processing pending request ${index + 1}:`, request.id);
                return this.createPendingApprovalRow(request);
            }).join('');
            
            console.log('✅ Pending HTML created, length:', html.length);
            container.innerHTML = html;
            console.log('✅ Pending HTML inserted into container');

            // Add event listeners to approval buttons
            this.attachApprovalListeners();
        } catch (error) {
            console.error('❌ Error rendering pending approvals:', error);
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-red-500">
                        Erro ao carregar aprovações: ${error.message}
                    </td>
                </tr>
            `;
        }
    }

    createLeaveRequestRow(request) {
        const statusBadge = this.getStatusBadge(request.status);
        const typeText = this.getLeaveTypeText(request.leave_type);
        const dateRange = `${this.formatDate(request.start_date)} - ${this.formatDate(request.end_date)}`;
        const days = `${request.total_days || 0}${request.is_half_day ? ' (Half Day)' : ''}`;
        const reasonText = request.reason || '-';
        const createdDate = this.formatDate(request.created_at);
        const actions = this.getRequestActions(request);
        
        return `
            <tr class="hover:bg-gray-50 transition-colors" data-request-id="${request.id}">
                <td class="px-6 py-4 whitespace-nowrap">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                            <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <i class="fas fa-calendar-alt text-blue-600 text-sm"></i>
                            </div>
                        </div>
                        <div class="ml-3">
                            <div class="text-sm font-medium text-gray-900">${typeText}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${dateRange}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${days}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title="${reasonText}">
                    ${reasonText}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${createdDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-2">
                        <button onclick="safeLeaveAction('viewRequestDetails', '${request.id}')" 
                                class="text-blue-600 hover:text-blue-800 transition-colors" 
                                title="Ver detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${actions}
                    </div>
                </td>
            </tr>
        `;
    }

    createPendingApprovalCard(request) {
        const statusClass = `leave-status-${request.status.toLowerCase()}`;
        const typeClass = `leave-type-${request.leave_type}`;
        
        return `
            <div class="leave-card border-l-4 border-orange-400" data-request-id="${request.id}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="${statusClass}">${this.getStatusText(request.status)}</span>
                            <span class="text-sm text-gray-500">•</span>
                            <span class="${typeClass} font-medium">${this.getLeaveTypeText(request.leave_type)}</span>
                            <span class="text-sm text-gray-500">•</span>
                            <span class="text-sm text-gray-700 font-medium">${request.employee_first_name} ${request.employee_last_name}</span>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                                <p class="text-sm text-gray-600">Período</p>
                                <p class="font-medium">${this.formatDate(request.start_date)} até ${this.formatDate(request.end_date)}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Duração</p>
                                <p class="font-medium">${request.total_days} dias ${request.is_half_day ? '(meio dia)' : ''}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Submetido em</p>
                                <p class="font-medium">${this.formatDateTime(request.submitted_at || request.created_at)}</p>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <p class="text-sm text-gray-600 mb-1">Motivo</p>
                            <p class="text-sm text-gray-800">${request.reason}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-2 ml-4">
                        <button onclick="safeLeaveAction('viewRequestDetails', '${request.id}')" 
                                class="text-gray-400 hover:text-jech-accent transition-colors" title="Ver detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        
                        ${this.getApprovalActions(request)}
                    </div>
                </div>
            </div>
        `;
    }

    getRequestActions(request) {
        const actions = [];
        
        if (request.status === 'DRAFT') {
            actions.push(`
                <button onclick="safeLeaveAction('submitRequest', '${request.id}')" 
                        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors" 
                        title="Submeter">
                    <i class="fas fa-paper-plane mr-1"></i>
                    Submit
                </button>
            `);
        }
        
        if (['DRAFT', 'SUBMITTED', 'APPROVED_L1'].includes(request.status)) {
            actions.push(`
                <button onclick="safeLeaveAction('cancelRequest', '${request.id}')" 
                        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 transition-colors" 
                        title="Cancelar">
                    <i class="fas fa-times mr-1"></i>
                    Cancel
                </button>
            `);
        }
        
        return actions.join(' ');
    }

    getApprovalActions(request) {
        const actions = [];
        
        if (request.status === 'SUBMITTED') {
            actions.push(`
                <button onclick="safeLeaveAction('approveRequestL1', '${request.id}')" 
                        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors" 
                        title="Aprovar L1">
                    <i class="fas fa-check mr-1"></i>
                    Approve
                </button>
            `);
        }
        
        if (request.status === 'APPROVED_L1') {
            actions.push(`
                <button onclick="safeLeaveAction('approveRequestFinal', '${request.id}')" 
                        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors" 
                        title="Aprovação Final">
                    <i class="fas fa-check-double mr-1"></i>
                    Approve Final
                </button>
            `);
        }
        
        if (['SUBMITTED', 'APPROVED_L1'].includes(request.status)) {
            actions.push(`
                <button onclick="safeLeaveAction('rejectRequest', '${request.id}')" 
                        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 transition-colors" 
                        title="Rejeitar">
                    <i class="fas fa-times mr-1"></i>
                    Reject
                </button>
            `);
        }
        
        return actions.join(' ');
    }

    attachLeaveRequestListeners() {
        // Event listeners are attached via onclick attributes in the HTML
    }

    attachApprovalListeners() {
        // Event listeners are attached via onclick attributes in the HTML
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        const myRequestsTab = document.getElementById('myRequestsTab');
        const myBalancesTab = document.getElementById('myBalancesTab');
        const pendingTab = document.getElementById('pendingApprovalsTab');
        
        // Reset all tabs
        [myRequestsTab, myBalancesTab, pendingTab].forEach(tabElement => {
            if (tabElement) {
                tabElement.classList.remove('active', 'border-jech-accent', 'text-jech-accent');
                tabElement.classList.add('border-transparent', 'text-gray-500');
            }
        });
        
        // Hide all content
        const myReq = document.getElementById('myRequestsContent'); if (myReq) myReq.classList.add('hidden');
        const myBal = document.getElementById('myBalancesContent'); if (myBal) myBal.classList.add('hidden');
        const pend = document.getElementById('pendingApprovalsContent'); if (pend) pend.classList.add('hidden');
        
        // Show selected tab content
        if (tab === 'myRequests') {
            myRequestsTab?.classList.add('active', 'border-jech-accent', 'text-jech-accent');
            myRequestsTab?.classList.remove('border-transparent', 'text-gray-500');
            const myReq2 = document.getElementById('myRequestsContent'); if (myReq2) myReq2.classList.remove('hidden');
            // Reload data for my requests tab to ensure correct endpoint is used
            this.loadLeaveRequests();
        } else if (tab === 'myBalances') {
            myBalancesTab?.classList.add('active', 'border-jech-accent', 'text-jech-accent');
            myBalancesTab?.classList.remove('border-transparent', 'text-gray-500');
            const myBal2 = document.getElementById('myBalancesContent'); if (myBal2) myBal2.classList.remove('hidden');
            if (!this._loadedTabs.has('myBalances')) {
                this.loadLeaveBalances();
                this._loadedTabs.add('myBalances');
            }
        } else if (tab === 'pendingApprovals') {
            pendingTab?.classList.add('active', 'border-jech-accent', 'text-jech-accent');
            pendingTab?.classList.remove('border-transparent', 'text-gray-500');
            const pend2 = document.getElementById('pendingApprovalsContent'); if (pend2) pend2.classList.remove('hidden');
            if (!this._loadedTabs.has('pendingApprovals')) {
                this.loadPendingApprovals();
                this._loadedTabs.add('pendingApprovals');
            } else {
                this.loadPendingApprovals(); // refresh on revisit
            }
        }
    }

    openNewRequestModal() {
        const modal = document.getElementById('leaveRequestModal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Reset form
            document.getElementById('leaveRequestForm').reset();
            document.getElementById('calculatedDays').classList.add('hidden');
            
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('startDate').min = today;
            document.getElementById('endDate').min = today;
        }
    }

    closeNewRequestModal() {
        const modal = document.getElementById('leaveRequestModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    closeDetailModal() {
        const modal = document.getElementById('leaveDetailModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    calculateDays() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const isHalfDay = document.getElementById('isHalfDay').checked;
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (end >= start) {
                const days = this.calculateBusinessDays(start, end);
                const totalDays = isHalfDay ? days - 0.5 : days;
                
                const totalDaysElement = document.getElementById('totalDays');
                const calculatedDaysElement = document.getElementById('calculatedDays');
                
                if (totalDaysElement) {
                    totalDaysElement.textContent = totalDays;
                }
                if (calculatedDaysElement) {
                    calculatedDaysElement.classList.remove('hidden');
                }
            } else {
                const calculatedDaysElement = document.getElementById('calculatedDays');
                if (calculatedDaysElement) {
                    calculatedDaysElement.classList.add('hidden');
                }
            }
        }
    }

    calculateBusinessDays(startDate, endDate) {
        let count = 0;
        const current = new Date(startDate);
        
        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        
        return count;
    }

    async submitNewRequest() {
        // Prevent duplicate submissions
        if (this.isSubmitting) {
            console.log(' Already submitting, ignoring duplicate request');
            return;
        }
        
        const form = document.getElementById('leaveRequestForm');
        const formData = new FormData(form);
        
        // Create a unique key for this submission to prevent duplicates
        const submissionKey = JSON.stringify({
            leave_type: formData.get('leave_type'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            reason: formData.get('reason'),
            is_half_day: formData.get('is_half_day')
        });
        
        // Check if this exact submission is already in progress
        if (this.submissionQueue.has(submissionKey)) {
            console.log('🚫 Duplicate submission detected, ignoring');
            return;
        }
        
        this.isSubmitting = true;
        this.submissionQueue.add(submissionKey);
        
        const requestData = {
            leave_type: formData.get('leave_type'),
            start_date: formData.get('start_date') + 'T00:00:00Z',
            end_date: formData.get('end_date') + 'T23:59:59Z',
            reason: formData.get('reason'),
            is_half_day: formData.get('is_half_day') === 'on'
        };

        console.log('🚀 Sending leave request data:', requestData);

        try {
            const response = await fetch('/api/leave-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess('Solicitação criada com sucesso!');
                this.closeNewRequestModal();
                await this.refreshData();
            } else {
                this.showError(data.error || 'Erro ao criar solicitação');
            }
        } catch (error) {
            console.error('Error submitting leave request:', error);
            this.showError('Erro ao comunicar com o servidor');
        } finally {
            // Reset submission flags
            this.isSubmitting = false;
            this.submissionQueue.delete(submissionKey);
        }
    }

    async submitRequest(requestId) {
        if (!confirm('Tem certeza que deseja submeter esta solicitação para aprovação?')) return;

        try {
            const response = await fetch(`/api/leave-requests/${requestId}/submit`, {
                method: 'POST',
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (response.ok) {
                console.log('✅ Leave request submitted successfully:', requestId);
                this.showSuccess('Solicitação submetida para aprovação!');
                await this.refreshData();
            } else {
                this.showError(data.error || 'Erro ao submeter solicitação');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            this.showError('Erro ao comunicar com o servidor');
        }
    }

    async cancelRequest(requestId) {
        const reason = prompt('Motivo do cancelamento (opcional):');
        if (reason === null) return; // User cancelled

        try {
            const response = await fetch(`/api/leave-requests/${requestId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ reason: reason || 'Cancelado pelo usuário' })
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess('Solicitação cancelada!');
                await this.refreshData();
            } else {
                this.showError(data.error || 'Erro ao cancelar solicitação');
            }
        } catch (error) {
            console.error('Error cancelling request:', error);
            this.showError('Erro ao comunicar com o servidor');
        }
    }

    async approveRequestL1(requestId) {
        const notes = prompt('Observações da aprovação (opcional):');
        if (notes === null) return; // User cancelled

        try {
            const response = await fetch(`/api/leave-requests/${requestId}/approve-l1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ notes: notes || null })
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess('Solicitação aprovada (Nível 1)!');
                await this.refreshData();
            } else {
                this.showError(data.error || 'Erro ao aprovar solicitação');
            }
        } catch (error) {
            console.error('Error approving request L1:', error);
            this.showError('Erro ao comunicar com o servidor');
        }
    }

    async approveRequestFinal(requestId) {
        const notes = prompt('Observações da aprovação final (opcional):');
        if (notes === null) return; // User cancelled

        try {
            const response = await fetch(`/api/leave-requests/${requestId}/approve-final`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ notes: notes || null })
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess('Solicitação aprovada (Final)!');
                await this.refreshData();
            } else {
                this.showError(data.error || 'Erro ao aprovar solicitação');
            }
        } catch (error) {
            console.error('Error approving request final:', error);
            this.showError('Erro ao comunicar com o servidor');
        }
    }

    async rejectRequest(requestId) {
        const reason = prompt('Motivo da rejeição:');
        if (!reason) return;

        try {
            const response = await fetch(`/api/leave-requests/${requestId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ reason: reason })
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess('Solicitação rejeitada!');
                await this.refreshData();
            } else {
                this.showError(data.error || 'Erro ao rejeitar solicitação');
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            this.showError('Erro ao comunicar com o servidor');
        }
    }

    async viewRequestDetails(requestId) {
        try {
            // Show loading state
            const modal = document.getElementById('leaveDetailModal');
            const content = document.getElementById('leaveDetailContent');
            
            content.innerHTML = `
                <div class="flex items-center justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-jech-accent"></div>
                    <span class="ml-3 text-gray-600">Carregando detalhes...</span>
                </div>
            `;
            
            modal.classList.remove('hidden');
            
            // Fetch request details from API
            const response = await fetch(`/api/leave-requests/${requestId}`);
            if (!response.ok) {
                throw new Error('Falha ao carregar detalhes da solicitação');
            }
            
            const request = await response.json();
            
            // Format dates
            const formatDate = (dateString) => {
                if (!dateString) return 'N/A';
                return new Date(dateString).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };
            
            const formatDateTime = (dateString) => {
                if (!dateString) return 'N/A';
                return new Date(dateString).toLocaleString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            };
            
            // Calculate duration
            const calculateDuration = (startDate, endDate) => {
                if (!startDate || !endDate) return 'N/A';
                const start = new Date(startDate);
                const end = new Date(endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return diffDays === 1 ? '1 dia' : `${diffDays} dias`;
            };
            
            // Get status badge HTML
            const statusBadge = this.getStatusBadge(request.status);
            
            // Build approval timeline
            let approvalTimeline = '';
            if (request.approval_history && request.approval_history.length > 0) {
                approvalTimeline = `
                    <div class="mb-6">
                        <h4 class="text-sm font-medium text-gray-900 mb-3">Histórico de Aprovações</h4>
                        <div class="space-y-3">
                            ${request.approval_history.map(approval => `
                                <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div class="flex-shrink-0">
                                        ${approval.action === 'APPROVED' ? 
                                            '<div class="w-2 h-2 bg-green-400 rounded-full mt-2"></div>' :
                                            '<div class="w-2 h-2 bg-red-400 rounded-full mt-2"></div>'
                                        }
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-sm">
                                            <span class="font-medium text-gray-900">${approval.approver_name || 'Sistema'}</span>
                                            <span class="text-gray-600">
                                                ${approval.action === 'APPROVED' ? 'aprovou' : 'rejeitou'} 
                                                ${approval.level === 'L1' ? '(Nível 1)' : '(Final)'}
                                            </span>
                                        </div>
                                        <div class="text-xs text-gray-500 mt-1">
                                            ${formatDateTime(approval.created_at)}
                                        </div>
                                        ${approval.notes ? `
                                            <div class="text-sm text-gray-700 mt-2 bg-white p-2 rounded border">
                                                <strong>Observações:</strong> ${approval.notes}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            
            // Populate modal content
            content.innerHTML = `
                <div class="space-y-6">
                    <!-- Header com Status -->
                    <div class="flex items-center justify-between pb-4 border-b border-gray-200">
                        <div>
                            <h4 class="text-lg font-medium text-gray-900">Solicitação de Licença</h4>
                            <p class="text-sm text-gray-600">ID: ${request.id}</p>
                        </div>
                        <div>${statusBadge}</div>
                    </div>
                    
                    <!-- Informações Básicas -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h5 class="text-sm font-medium text-gray-900 mb-3">Informações da Solicitação</h5>
                            <dl class="space-y-2">
                                <div>
                                    <dt class="text-sm font-medium text-gray-600">Funcionário:</dt>
                                    <dd class="text-sm text-gray-900">${request.employee?.full_name || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt class="text-sm font-medium text-gray-600">Tipo de Licença:</dt>
                                    <dd class="text-sm text-gray-900">${this.getLeaveTypeText(request.leave_type)}</dd>
                                </div>
                                <div>
                                    <dt class="text-sm font-medium text-gray-600">Data de Início:</dt>
                                    <dd class="text-sm text-gray-900">${formatDate(request.start_date)}</dd>
                                </div>
                                <div>
                                    <dt class="text-sm font-medium text-gray-600">Data de Fim:</dt>
                                    <dd class="text-sm text-gray-900">${formatDate(request.end_date)}</dd>
                                </div>
                                <div>
                                    <dt class="text-sm font-medium text-gray-600">Duração:</dt>
                                    <dd class="text-sm text-gray-900">${calculateDuration(request.start_date, request.end_date)}</dd>
                                </div>
                            </dl>
                        </div>
                        
                        <div>
                            <h5 class="text-sm font-medium text-gray-900 mb-3">Informações do Sistema</h5>
                            <dl class="space-y-2">
                                <div>
                                    <dt class="text-sm font-medium text-gray-600">Criado em:</dt>
                                    <dd class="text-sm text-gray-900">${formatDateTime(request.created_at)}</dd>
                                </div>
                                <div>
                                    <dt class="text-sm font-medium text-gray-600">Última atualização:</dt>
                                    <dd class="text-sm text-gray-900">${formatDateTime(request.updated_at)}</dd>
                                </div>
                                ${request.submitted_at ? `
                                <div>
                                    <dt class="text-sm font-medium text-gray-600">Submetido em:</dt>
                                    <dd class="text-sm text-gray-900">${formatDateTime(request.submitted_at)}</dd>
                                </div>
                                ` : ''}
                            </dl>
                        </div>
                    </div>
                    
                    <!-- Motivo/Comentário -->
                    ${request.reason ? `
                    <div>
                        <h5 class="text-sm font-medium text-gray-900 mb-2">Motivo da Solicitação</h5>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <p class="text-sm text-gray-700">${request.reason}</p>
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Timeline de Aprovações -->
                    ${approvalTimeline}
                    
                    <!-- Documentos Anexos (se houver) -->
                    ${request.attachments && request.attachments.length > 0 ? `
                    <div>
                        <h5 class="text-sm font-medium text-gray-900 mb-2">Documentos Anexos</h5>
                        <div class="space-y-2">
                            ${request.attachments.map(doc => `
                                <div class="flex items-center justify-between p-2 border border-gray-200 rounded">
                                    <span class="text-sm text-gray-700">${doc.name}</span>
                                    <button class="text-blue-600 hover:text-blue-800 text-sm">Baixar</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading request details:', error);
            const content = document.getElementById('leaveDetailContent');
            content.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-red-600 mb-2">
                        <i class="fas fa-exclamation-triangle text-2xl"></i>
                    </div>
                    <p class="text-gray-600">Erro ao carregar detalhes da solicitação.</p>
                    <p class="text-sm text-gray-500 mt-1">${error.message}</p>
                </div>
            `;
        }
    }

    applyFilters() {
        this.filters.status = document.getElementById('statusFilter').value;
        this.filters.type = document.getElementById('typeFilter').value;

        this.loadLeaveRequests();
    }

    clearFilters() {
        this.filters = { status: '', type: '' };
        
        document.getElementById('statusFilter').value = '';
        document.getElementById('typeFilter').value = '';

        this.loadLeaveRequests();
    }

    async refreshData() {
        const refreshBtn = document.getElementById('refreshBtn');
        let icon = null;
        
        if (refreshBtn) {
            icon = refreshBtn.querySelector('i');
            if (icon) icon.classList.add('fa-spin');
            refreshBtn.disabled = true;
        }

        try {
            await this.loadInitialData();
        } finally {
            if (icon) icon.classList.remove('fa-spin');
            if (refreshBtn) refreshBtn.disabled = false;
        }
    }

    // Utility methods
    getStatusText(status) {
        const statusMap = {
            'DRAFT': 'Draft',
            'SUBMITTED': 'Submitted',
            'APPROVED_L1': 'Approved L1',
            'APPROVED_FINAL': 'Approved',
            'REJECTED': 'Rejected',
            'CANCELLED': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    getStatusBadge(status) {
        const statusConfig = {
            'DRAFT': { text: 'Draft', classes: 'bg-gray-100 text-gray-800' },
            'SUBMITTED': { text: 'Submitted', classes: 'bg-blue-100 text-blue-800' },
            'APPROVED_L1': { text: 'Approved L1', classes: 'bg-yellow-100 text-yellow-800' },
            'APPROVED_FINAL': { text: 'Approved', classes: 'bg-green-100 text-green-800' },
            'REJECTED': { text: 'Rejected', classes: 'bg-red-100 text-red-800' },
            'CANCELLED': { text: 'Cancelled', classes: 'bg-gray-100 text-gray-800' }
        };
        
        const config = statusConfig[status] || { text: status, classes: 'bg-gray-100 text-gray-800' };
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}">${config.text}</span>`;
    }

    createPendingApprovalRow(request) {
        const employeeName = `${request.employee_first_name || ''} ${request.employee_last_name || ''}`.trim() || 'Unknown Employee';
        const typeText = this.getLeaveTypeText(request.leave_type);
        const dateRange = `${this.formatDate(request.start_date)} - ${this.formatDate(request.end_date)}`;
        const days = `${request.total_days || 0}${request.is_half_day ? ' (Half Day)' : ''}`;
        const reasonText = request.reason || '-';
        const submittedDate = this.formatDate(request.submitted_at || request.created_at);
        const approvalActions = this.getApprovalActions(request);
        
        return `
            <tr class="hover:bg-gray-50 transition-colors" data-request-id="${request.id}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                            <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <span class="text-sm font-medium text-gray-600">${employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                            </div>
                        </div>
                        <div class="ml-3">
                            <div class="text-sm font-medium text-gray-900">${employeeName}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                            <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <i class="fas fa-calendar-alt text-blue-600 text-sm"></i>
                            </div>
                        </div>
                        <div class="ml-3">
                            <div class="text-sm font-medium text-gray-900">${typeText}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${dateRange}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${days}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title="${reasonText}">
                    ${reasonText}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${submittedDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-2">
                        <button onclick="safeLeaveAction('viewRequestDetails', '${request.id}')" 
                                class="text-blue-600 hover:text-blue-800 transition-colors" 
                                title="Ver detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${approvalActions}
                    </div>
                </td>
            </tr>
        `;
    }

    getLeaveTypeText(type) {
        const typeMap = {
            'vacation': 'Vacation',
            'sick': 'Sick',
            'personal': 'Personal',
            'maternity': 'Maternity',
            'paternity': 'Paternity',
            'bereavement': 'Bereavement',
            'emergency': 'Emergency'
        };
        return typeMap[type] || type;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getEmptyStateHTML(message, icon) {
        return `
            <div class="flex items-center justify-center py-12">
                <div class="text-center">
                    <i class="fas fa-${icon} text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">${message}</p>
                </div>
            </div>
        `;
    }

    showSuccess(message) {
        // This would ideally use a toast notification system
        alert(`✅ ${message}`);
    }

    showError(message) {
        // This would ideally use a toast notification system
        alert(`❌ ${message}`);
    }
}

// Initialize the leave management system
let leaveManagement;

function initializeLeaveManagement() {
    leaveManagement = new LeaveManagement();
}

// Global init for HTMX swaps
window.NexuPayrollLeavesInit = function() {
    try { initializeLeaveManagement(); } catch (e) { console.error('Leaves init error:', e); }
};

// Initialize when DOM is ready
(function(){
    const initOnce = () => {
        if (!window.leaveManagement) {
            initializeLeaveManagement();
        }
    };
    document.addEventListener('DOMContentLoaded', initOnce, { once: true });
    // Re-init on HTMX swaps that affect main content
    document.addEventListener('htmx:afterSwap', function(evt){
        const target = evt.target || evt.detail?.target;
        if (target && (target.id === 'main-content' || target.closest?.('#main-content'))) {
            if (!window.__leaveManagementInitialized) {
                initializeLeaveManagement();
            }
        }
    });
})();

// Re-render when HTMX swaps tab contents
(function(){
    if (!window.__LEAVES_HTMX_BOUND__) {
        window.__LEAVES_HTMX_BOUND__ = true;
        document.body.addEventListener('htmx:afterSwap', function(evt){
            try {
                const target = evt.target;
                if (!target || !window.leaveManagement) return;
                if (target.id === 'myRequestsContent') {
                    if (typeof window.leaveManagement.loadLeaveRequests === 'function') {
                        window.leaveManagement.loadLeaveRequests();
                    }
                } else if (target.id === 'myBalancesContent') {
                    if (typeof window.leaveManagement.loadLeaveBalances === 'function') {
                        window.leaveManagement.loadLeaveBalances();
                    }
                } else if (target.id === 'pendingApprovalsContent') {
                    if (typeof window.leaveManagement.loadPendingApprovals === 'function') {
                        window.leaveManagement.loadPendingApprovals();
                    }
                }
            } catch(err) { console.error('Leaves htmx afterSwap hook error', err); }
        });
    }
})();

// Export for global access
window.leaveManagement = leaveManagement; 

// Global delegated handlers to survive HTMX swaps
(function(){
    if (!window.__LEAVES_DELEGATED__) {
        window.__LEAVES_DELEGATED__ = true;
        document.addEventListener('click', function(e){
            try {
                const refreshBtn = e.target.closest && e.target.closest('#refreshBtn');
                if (refreshBtn && window.leaveManagement && typeof window.leaveManagement.refreshData === 'function') {
                    e.preventDefault();
                    window.leaveManagement.refreshData();
                    return;
                }
                const newReqBtn = e.target.closest && e.target.closest('#newLeaveRequestBtn');
                if (newReqBtn && window.leaveManagement && typeof window.leaveManagement.openNewRequestModal === 'function') {
                    e.preventDefault();
                    window.leaveManagement.openNewRequestModal();
                    return;
                }
            } catch(err) { console.error('Leaves delegated click error', err); }
        });
        document.addEventListener('change', function(e){
            try {
                if (!window.leaveManagement) return;
                if (e.target && (e.target.id === 'statusFilter' || e.target.id === 'typeFilter')) {
                    if (typeof window.leaveManagement.applyFilters === 'function') {
                        window.leaveManagement.applyFilters();
                    }
                }
            } catch(err) { console.error('Leaves delegated change error', err); }
        });
    }
})(); 