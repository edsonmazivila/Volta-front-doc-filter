// Admin Leaves Management - Nexus Pay
(function(){
    if (window.adminLeavesInitialized) return;
    window.adminLeavesInitialized = true;

    // Prevent duplicate global delegation bindings across HTMX swaps
    if (!window.__NP_ADMIN_LEAVES_DELEGATED__) {
        window.__NP_ADMIN_LEAVES_DELEGATED__ = true;
        document.addEventListener('click', function(e){
            const tabBtn = e.target.closest && e.target.closest('.tab-button');
            if (tabBtn && window.adminLeaveManagement && typeof window.adminLeaveManagement.switchTab === 'function') {
                e.preventDefault();
                window.adminLeaveManagement.switchTab(tabBtn.id);
                return;
            }
            if (e.target.id === 'cancelApproval' && window.adminLeaveManagement) {
                e.preventDefault(); window.adminLeaveManagement.closeModal(); return;
            }
            if (e.target.id === 'approveRequest' && window.adminLeaveManagement) {
                e.preventDefault(); window.adminLeaveManagement.processApproval(true); return;
            }
            if (e.target.id === 'rejectRequest' && window.adminLeaveManagement) {
                e.preventDefault(); window.adminLeaveManagement.processApproval(false); return;
            }
            // Delegated Review button
            const reviewBtn = e.target.closest && e.target.closest('.review-btn');
            if (reviewBtn && window.adminLeaveManagement && typeof window.adminLeaveManagement.openApprovalModal === 'function') {
                e.preventDefault();
                const id = reviewBtn.getAttribute('data-request-id');
                const name = reviewBtn.getAttribute('data-employee-name');
                const type = reviewBtn.getAttribute('data-leave-type');
                const start = reviewBtn.getAttribute('data-start');
                const end = reviewBtn.getAttribute('data-end');
                window.adminLeaveManagement.openApprovalModal(id, name, type, start, end);
                return;
            }
        });
        // Change filters via delegation
        document.addEventListener('change', function(e){
            if ((e.target && (e.target.id === 'statusFilter' || e.target.id === 'typeFilter')) && window.adminLeaveManagement) {
                window.adminLeaveManagement.loadAllRequests();
            }
        });
    }

    class AdminLeaveManagement {
        constructor() {
            this.currentRequest = null;
            this.userRole = null;
            this._loaded = { pending: false, all: false, balances: false };
            this.init();
        }
        async init() {
            await this.loadUserData();
            this.setupRoleBasedInterface();
            // Load only the default tab (pending) initially
            await this.loadPendingApprovals();
            // Ensure default active tab styling
            const pendingTab = document.getElementById('pendingTab');
            if (pendingTab) this._setActiveTab(pendingTab);
        }
        async loadUserData() {
            try {
                const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
                if (response.ok) {
                    const userData = await response.json();
                    this.userRole = userData.role;
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        }
        setupRoleBasedInterface() {
            if (!this.userRole) return;
        }
        _setActiveTab(tabBtn) {
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active', 'border-jech-accent', 'text-jech-accent');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            tabBtn.classList.add('active', 'border-jech-accent', 'text-jech-accent');
            tabBtn.classList.remove('border-transparent', 'text-gray-500');

            const map = { pendingTab: 'pendingContent', allRequestsTab: 'allRequestsContent', teamBalancesTab: 'teamBalancesContent' };
            Object.values(map).forEach(id => { const el = document.getElementById(id); if (el) { el.classList.remove('active'); el.classList.add('hidden'); } });
            const cid = map[tabBtn.id];
            const content = document.getElementById(cid);
            if (content) { content.classList.add('active'); content.classList.remove('hidden'); }
        }
        switchTab(tabId) {
            const tabBtn = document.getElementById(tabId);
            if (!tabBtn) return;
            this._setActiveTab(tabBtn);
            if (tabId === 'pendingTab' && !this._loaded.pending) {
                this.loadPendingApprovals();
            } else if (tabId === 'allRequestsTab' && !this._loaded.all) {
                this.loadAllRequests();
            } else if (tabId === 'teamBalancesTab' && !this._loaded.balances) {
                this.loadTeamBalances();
            }
        }
        async loadPendingApprovals() {
            try {
                const response = await fetch('/api/leave-requests/pending-approvals');
                if (!response.ok) throw new Error('Failed to load pending approvals');
                const data = await response.json();
                this.displayPendingApprovals(data.requests || []);
                const pendingCount = document.getElementById('pendingCount');
                if (pendingCount) pendingCount.textContent = data.requests?.length || 0;
                this._loaded.pending = true;
            } catch (error) {
                console.error('Error loading pending approvals:', error);
                const el = document.getElementById('pendingTable');
                if (el) el.innerHTML = '<div class="p-8 text-center text-red-500">Failed to load pending approvals</div>';
            }
        }
        async loadAllRequests() {
            try {
                const statusFilter = document.getElementById('statusFilter')?.value || '';
                const typeFilter = document.getElementById('typeFilter')?.value || '';
                const qs = new URLSearchParams();
                if (statusFilter) qs.append('status', statusFilter);
                if (typeFilter) qs.append('leave_type', typeFilter);
                const url = `/api/leave-requests${qs.toString() ? '?' + qs.toString() : ''}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to load requests');
                const data = await response.json();
                this.displayAllRequests(data?.requests || []);
                const allCount = document.getElementById('allRequestsCount');
                if (allCount) allCount.textContent = data?.requests?.length || 0;
                this._loaded.all = true;
            } catch (error) {
                console.error('Error loading all requests:', error);
                const el = document.getElementById('allRequestsTable');
                if (el) el.innerHTML = '<div class="p-8 text-center text-red-500">Failed to load requests</div>';
            }
        }
        async loadTeamBalances() {
            try {
                const response = await fetch('/api/team-balances');
                if (!response.ok) throw new Error('Failed to load team balances');
                const data = await response.json();
                this.displayTeamBalances(data?.balances || []);
                this._loaded.balances = true;
            } catch (error) {
                console.error('Error loading team balances:', error);
                const el = document.getElementById('teamBalancesTable');
                if (el) el.innerHTML = '<div class="p-8 text-center text-red-500">Failed to load team balances</div>';
            }
        }
        displayPendingApprovals(requests) {
            const container = document.getElementById('pendingTable');
            if (!container) return;
            if (!requests.length) {
                container.innerHTML = '<div class="p-8 text-center text-gray-500">No pending approvals</div>';
                return;
            }
            const html = `
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50"><tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${requests.map(r => this.renderRequestRow(r, true)).join('')}
                    </tbody>
                </table>`;
            container.innerHTML = html;
        }
        displayAllRequests(requests) {
            const container = document.getElementById('allRequestsTable');
            if (!container) return;
            if (!requests.length) {
                container.innerHTML = '<div class="p-8 text-center text-gray-500">No requests found</div>';
                return;
            }
            const html = `
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50"><tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${requests.map(r => this.renderRequestRow(r, false)).join('')}
                    </tbody>
                </table>`;
            container.innerHTML = html;
        }
        renderRequestRow(request, showActions) {
            const startDate = new Date(request.start_date).toLocaleDateString();
            const endDate = new Date(request.end_date).toLocaleDateString();
            const statusBadge = this.getStatusBadge(request.status);
            const actions = showActions ? this.renderActions(request) : '';
            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(request.employee_first_name || '') + ' ' + (request.employee_last_name || '') || 'Unknown Employee'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">${request.leave_type}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${startDate} - ${endDate}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${request.total_days || 0} ${request.is_half_day ? '(Half Day)' : ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${actions}</td>
                </tr>`;
        }
        renderActions(request) {
            if (request.status === 'SUBMITTED' || request.status === 'APPROVED_L1') {
                const employeeName = ((request.employee_first_name || '') + ' ' + (request.employee_last_name || '')).trim();
                return `<button class="review-btn text-jech-accent hover:text-green-700 font-medium" data-request-id="${request.id}" data-employee-name="${employeeName}" data-leave-type="${request.leave_type}" data-start="${request.start_date}" data-end="${request.end_date}">Review</button>`;
            }
            return '-';
        }
        getStatusBadge(status) {
            const badges = {
                'DRAFT': '<span class="badge badge-draft">Draft</span>',
                'SUBMITTED': '<span class="badge badge-submitted">Submitted</span>',
                'APPROVED_L1': '<span class="badge badge-approved-l1">Approved L1</span>',
                'APPROVED_FINAL': '<span class="badge badge-approved-final">Approved</span>',
                'REJECTED': '<span class="badge badge-rejected">Rejected</span>',
                'CANCELLED': '<span class="badge badge-cancelled">Cancelled</span>'
            };
            return badges[status] || `<span class="badge badge-draft">${status}</span>`;
        }
        displayTeamBalances(balances) {
            const container = document.getElementById('teamBalancesTable');
            if (!container) return;
            if (!balances.length) {
                container.innerHTML = '<div class="p-8 text-center text-gray-500">No team balances available</div>';
                return;
            }
            const html = `
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50"><tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vacation</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sick</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Used</th>
                    </tr></thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${balances.map(b => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(b.employee_first_name || '') + ' ' + (b.employee_last_name || '') || 'Unknown Employee'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${b.vacation_balance || 0} days</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${b.sick_balance || 0} days</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${b.personal_balance || 0} days</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${b.total_used || 0} days</td>
                            </tr>`).join('')}
                    </tbody>
                </table>`;
            container.innerHTML = html;
        }
        openApprovalModal(requestId, employeeName, leaveType, startDate, endDate) {
            this.currentRequest = requestId;
            const content = document.getElementById('approvalModalContent');
            if (content) {
                content.innerHTML = `<div class="space-y-2 text-sm">
                    <p><strong>Employee:</strong> ${employeeName}</p>
                    <p><strong>Type:</strong> ${leaveType}</p>
                    <p><strong>Dates:</strong> ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
                </div>`;
            }
            const modal = document.getElementById('approvalModal');
            if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
        }
        closeModal() {
            const modal = document.getElementById('approvalModal');
            if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
            const notes = document.getElementById('approvalNotes');
            if (notes) notes.value = '';
            this.currentRequest = null;
        }
        async processApproval(approve) {
            if (!this.currentRequest) return;
            const notes = document.getElementById('approvalNotes')?.value || '';
            const endpoint = approve ? 'approve' : 'reject';
            try {
                const response = await fetch(`/api/leave-requests/${this.currentRequest}/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) });
                if (!response.ok) throw new Error(`Failed to ${approve ? 'approve' : 'reject'} request`);
                this.closeModal();
                await this.loadPendingApprovals();
                await this.loadAllRequests();
                alert(`Request ${approve ? 'approved' : 'rejected'} successfully!`);
            } catch (error) {
                console.error('Error processing approval:', error);
                alert(`Failed to ${approve ? 'approve' : 'reject'} request. Please try again.`);
            }
        }
    }

    function init(){
        window.adminLeaveManagement = new AdminLeaveManagement();
        try { console.debug('[AdminLeaves] init executed'); } catch(e){}
    }

    window.NexuPayrollAdminLeavesInit = init;

    if (document.getElementById('pendingTab')) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init, { once: true });
        } else {
            init();
        }
    }
})(); 