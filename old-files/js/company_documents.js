(function(){
	if (window.__companyDocsInitialized) return; window.__companyDocsInitialized = true;
	document.addEventListener('DOMContentLoaded', function(){
		NexuPayrollCompanyDocsInit();
	}, { once: true });
})();

window.NexuPayrollCompanyDocsInit = function(){
	try {
		bindCompanyDocsUI();
		loadCompanyDocs();
	} catch(e){ console.error('CompanyDocs init error', e); }
};

let __CD_LOADING = false;
let __CD_LAST_TS = 0;
let __CD_STATE = { page: 1, limit: 20, search: '', document_type: '' };

function bindCompanyDocsUI(){
	const body = document.getElementById('docsBody');
	const search = document.getElementById('search');
	const docType = document.getElementById('docType');
	if (search && !search.__cdBound){
		search.__cdBound = true;
		let t; search.addEventListener('input', function(){ clearTimeout(t); t = setTimeout(()=>{ __CD_STATE.search = search.value; __CD_STATE.page = 1; loadCompanyDocs(); }, 400); });
	}
	if (docType && !docType.__cdBound){
		docType.__cdBound = true;
		docType.addEventListener('change', function(){ __CD_STATE.document_type = docType.value; __CD_STATE.page = 1; loadCompanyDocs(); });
	}
	// Unified click handler
	document.addEventListener('click', async (e)=>{
		const viewBtn = e.target.closest && e.target.closest('.viewBtn');
		if (viewBtn) {
			const id = viewBtn.getAttribute('data-id'); if (!id) return;
		try {
			const metaRes = await fetch(`/api/company-documents/${id}`, { credentials: 'same-origin' });
			if (!metaRes.ok) return;
			const meta = await metaRes.json(); const d = meta.document || meta;
			document.getElementById('viewTitle').textContent = d.name || d.original_filename || 'Document';
			document.getElementById('viewType').textContent = (d.document_type||'').replaceAll('_',' ');
			document.getElementById('viewUploaded').textContent = d.created_at ? new Date(d.created_at).toISOString().slice(0,10) : '-';
			document.getElementById('viewExpiry').textContent = d.expiry_date ? new Date(d.expiry_date).toISOString().slice(0,10) : '-';
			document.getElementById('viewDesc').textContent = d.description || '';
			document.getElementById('downloadLink').href = `/api/company-documents/${id}/download`;
			const frame = document.getElementById('previewFrame'); const fallback = document.getElementById('previewFallback');
			const lower = (d.mime_type||'').toLowerCase();
			if (lower.startsWith('application/pdf') || lower.startsWith('image/')) {
				frame.src = `/api/company-documents/${id}/preview`;
				frame.classList.remove('hidden'); fallback.classList.add('hidden');
			} else {
				frame.src = 'about:blank'; frame.classList.add('hidden'); fallback.classList.remove('hidden');
			}
			document.getElementById('viewModal').classList.remove('hidden');
			document.body.style.overflow = 'hidden';
		} catch(err){ console.error('view company doc error', err); }
			return;
		}

		const editBtn = e.target.closest && e.target.closest('.editBtn');
		if (editBtn) {
			const id = editBtn.getAttribute('data-id'); if (!id) return;
			try {
				const metaRes = await fetch(`/api/company-documents/${id}`, { credentials: 'same-origin' });
				if (!metaRes.ok) { alert('Failed to load document'); return; }
				const meta = await metaRes.json(); const d = meta.document || meta;
				const newName = prompt('Update name', d.name || d.original_filename || '');
				if (newName === null) return;
				const newDesc = prompt('Update description (optional)', d.description || '');
				const newExp = prompt('Update expiry date (YYYY-MM-DD, optional)', d.expiry_date ? new Date(d.expiry_date).toISOString().slice(0,10) : '');
				const payload = {};
				if (newName !== '') payload.name = newName;
				if (newDesc !== '') payload.description = newDesc;
				if (newExp) payload.expiry_date = newExp;
				const res = await fetch(`/api/company-documents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'same-origin' });
				if (res.ok) { await loadCompanyDocs(); }
				else { alert('Update failed'); }
			} catch(err){ console.error('edit company doc error', err); alert('Update failed'); }
			return;
		}

		const delBtn = e.target.closest && e.target.closest('.deleteBtn');
		if (delBtn) {
			const id = delBtn.getAttribute('data-id'); if (!id) return;
			if (!confirm('Delete this document? This action cannot be undone.')) return;
			try {
				const res = await fetch(`/api/company-documents/${id}`, { method: 'DELETE', credentials: 'same-origin' });
				if (res.status === 204) { await loadCompanyDocs(); }
				else { alert('Delete failed'); }
			} catch(err){ console.error('delete company doc error', err); alert('Delete failed'); }
			return;
		}
	});
}

async function loadCompanyDocs(){
	const body = document.getElementById('docsBody'); if (!body) return;
	const now = Date.now(); if (__CD_LOADING || (now-__CD_LAST_TS<500)) return; __CD_LOADING = true; __CD_LAST_TS = now;
	const url = `/api/company-documents?`+new URLSearchParams(__CD_STATE);
	try {
		const res = await fetch(url, { credentials: 'same-origin' });
		if (!res.ok) throw new Error('Failed');
		const data = await res.json();
		const list = (data && Array.isArray(data.documents)) ? data.documents : [];
		if (!list.length) { body.innerHTML = `<tr><td colspan="5" class="px-6 py-6 text-center text-gray-500">No documents found</td></tr>`; return; }
		body.innerHTML = list.map(d=>row(d)).join('');
	} catch(err){ console.error('load company docs error', err); }
	finally { __CD_LOADING = false; }
}

function row(d){
	const exp = d.expiry_date ? new Date(d.expiry_date).toISOString().slice(0,10) : '-';
	const upl = d.created_at ? new Date(d.created_at).toISOString().slice(0,10) : '-';
	const t = (d.document_type||'').replaceAll('_',' ');
	const name = (d.name||d.original_filename||'');
	const desc = d.description ? `<div class=\"text-sm text-gray-500\">${escapeHtml(d.description)}</div>` : '';
	return `<tr>
		<td class="px-6 py-4"><div class="font-medium text-gray-900">${escapeHtml(name)}</div>${desc}</td>
		<td class="px-6 py-4 capitalize">${escapeHtml(t)}</td>
		<td class="px-6 py-4">${upl}</td>
		<td class="px-6 py-4">${exp}</td>
		<td class="px-6 py-4 text-right space-x-3">
			<button data-id="${d.id}" class="viewBtn text-jech-accent hover:text-jech-blue underline dark:text-blue-400 dark:hover:text-blue-300">View</button>
			<a href="/api/company-documents/${d.id}/download" class="text-jech-accent hover:text-jech-blue underline dark:text-blue-400 dark:hover:text-blue-300">Download</a>
			<button data-id="${d.id}" class="editBtn text-blue-600 hover:text-blue-500 underline dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
			<button data-id="${d.id}" class="deleteBtn text-red-600 hover:text-red-500 underline dark:text-red-400 dark:hover:text-red-300">Delete</button>
		</td>
	</tr>`;
}

function escapeHtml(s){ return (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c)); } 