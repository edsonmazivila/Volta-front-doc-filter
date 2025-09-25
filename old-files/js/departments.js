(function(){
	if (window.__departmentsInit__) return; window.__departmentsInit__=true;
	document.addEventListener('DOMContentLoaded', function(){ /* no-op for now */ }, { once:true });
})();

window.showEditDepartmentForm = function(id){
	const modal = document.getElementById('modal');
	let modalContent = document.getElementById('modal-content');
	if (!modal) {
		// create a simple modal shell if not present
		const shell = document.createElement('div'); shell.id='modal'; shell.className='fixed inset-0 bg-black bg-opacity-50 z-50';
		const inner = document.createElement('div'); inner.id='modal-content'; inner.className='bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto mt-20 p-4';
		shell.appendChild(inner); document.body.appendChild(shell);
	}
	modalContent = document.getElementById('modal-content');
	if (typeof htmx !== 'undefined') {
		htmx.ajax('GET', `/departments/${id}/edit`, { target: '#modal-content', swap: 'innerHTML' });
	}
	document.getElementById('modal').classList.remove('hidden');
	document.body.style.overflow='hidden';
};

window.hideDepartmentModal = function(){
	const modal = document.getElementById('modal'); if (!modal) return;
	modal.classList.add('hidden'); document.body.style.overflow='auto';
}; 

window.deleteDepartment = async function(id, name){
	try {
		const confirmMsg = `Delete department "${name}"? This action cannot be undone.`;
		if (!window.confirm(confirmMsg)) return;

		const response = await fetch(`/api/departments/${id}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: { 'Accept': 'application/json' }
		});

		if (!response.ok) {
			let errText = 'Failed to delete department';
			try { const data = await response.json(); if (data && data.error) errText = data.error; } catch(_){}
			alert(errText);
			return;
		}

		// Refresh the departments table via HTMX if present, else fallback full reload
		if (typeof htmx !== 'undefined') {
			htmx.ajax('GET', '/departments/table', { target: '#departments-table', swap: 'innerHTML' });
		} else {
			window.location.reload();
		}
	} catch (err) {
		console.error('deleteDepartment error', err);
		alert('Unexpected error deleting department');
	}
}; 