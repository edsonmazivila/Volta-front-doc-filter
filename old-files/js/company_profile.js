(function(){
	if (window.__companyProfileInit__) return; window.__companyProfileInit__=true;
	document.addEventListener('DOMContentLoaded', function(){ NexuPayrollCompanyProfileInit(); }, { once:true });
})();

window.NexuPayrollCompanyProfileInit = function(){
	try {
		bindCompanyProfileUI();
		loadPaySchedules();
		loadLeavePolicies();
	} catch(e){ console.error('CompanyProfile init error', e); }
};

function bindCompanyProfileUI(){
	const addPS = document.querySelector('button[onclick="showCreatePayScheduleForm()"]');
	if (addPS && !addPS.__bound){ addPS.__bound=true; addPS.addEventListener('click', ()=>{ const el = document.getElementById('create-pay-schedule-form'); if (el) { el.classList.remove('hidden'); document.getElementById('schedule_name')?.focus(); } }); }
	const addLP = document.querySelector('button[onclick="showCreateLeavePolicyForm()"]');
	if (addLP && !addLP.__bound){ addLP.__bound=true; addLP.addEventListener('click', ()=>{ const el = document.getElementById('create-leave-policy-form'); if (el) { el.classList.remove('hidden'); document.getElementById('policy_name')?.focus(); } }); }
}

async function loadPaySchedules(){
	const container = document.getElementById('pay-schedules-list'); if (!container) return;
	try {
		const r = await fetch('/api/pay-schedules', { credentials: 'same-origin' });
		const data = await r.json();
		if (data.success && Array.isArray(data.pay_schedules) && data.pay_schedules.length){ container.innerHTML = renderPaySchedules(data.pay_schedules); }
		else { container.innerHTML = '<p class="text-gray-500 text-center py-4">No pay schedules found. Create one to enable payroll processing.</p>'; }
	} catch(e){ container.innerHTML = '<p class="text-red-500 text-center py-4">Error loading pay schedules.</p>'; }
}

function renderPaySchedules(list){
	return list.map(s=>`<div class="border rounded-lg p-4 mb-2 bg-gray-50"><div class="flex justify-between items-center"><div><h4 class="font-medium text-gray-900">${s.name}</h4><p class="text-sm text-gray-600">Frequency: ${s.frequency} | Start Date: ${new Date(s.start_date).toLocaleDateString()} | Status: ${s.is_active ? '<span class=\"text-green-600\">Active</span>' : '<span class=\"text-red-600\">Inactive</span>'}</p></div></div></div>`).join('');
}

async function loadLeavePolicies(){
	const container = document.getElementById('leave-policies-list'); if (!container) return;
	try {
		const r = await fetch('/api/leave-policies', { credentials: 'same-origin' });
		const data = await r.json();
		if (data.success && Array.isArray(data.policies) && data.policies.length){ container.innerHTML = renderLeavePolicies(data.policies); }
		else { container.innerHTML = '<p class="text-gray-500 text-center py-4">No leave policies found.</p>'; }
	} catch(e){ container.innerHTML = '<p class="text-red-500 text-center py-4">Error loading leave policies.</p>'; }
}

function renderLeavePolicies(list){
	return list.map(p=>`<div class="border rounded-lg p-4 mb-2 bg-gray-50"><div class="flex justify-between items-center"><div><h4 class="font-medium text-gray-900">${p.name}</h4><p class="text-sm text-gray-600 capitalize">Type: ${p.leave_type} | Allocation: ${p.annual_allocation_days} days</p></div></div></div>`).join('');
} 