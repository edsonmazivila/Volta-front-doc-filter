// Documents JavaScript for Nexus Pay
(function(){
    if (window.__documentsInitialized) return;
    window.__documentsInitialized = true;
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Nexus Pay Documents - Ready');
        
        // Initialize page
        initializeDocuments();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup role-based navigation (guarded)
        try { if (typeof window.setupRoleBasedNavigation === 'function') { window.setupRoleBasedNavigation(); } } catch(_) {}
        
        // Load initial data only if HTMX is not already wired to tbody
        const tbody = document.getElementById('documents-tbody');
        const htmxManaging = tbody && (tbody.hasAttribute('hx-get') || tbody.getAttribute('hx-trigger'));
        if (!htmxManaging) {
            loadDocuments();
        }
        loadDocumentStats();
        loadEmployees();
    }, { once: true });
    // Re-run lightweight setups after HTMX swaps
    document.addEventListener('htmx:afterSwap', function(evt){
        const target = evt.target || evt.detail?.target;
        if (target && (target.id === 'documents-tbody' || target.closest?.('#documents-tbody'))) {
            // no-op; HTMX already swapped rows
        }
    });
})();

// Expose init for HTMX swaps
window.NexuPayrollDocumentsInit = function() {
    try {
        initializeDocuments();
        setupEventListeners();
        setupRoleBasedDocumentActions();
        loadDocuments();
        loadDocumentStats();
        loadEmployees();
    } catch (e) {
        console.error('Documents init error:', e);
    }
};

// Initialize documents page
function initializeDocuments() {
    // Setup file drag and drop
    setupFileDragDrop();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup HTMX event listeners
    setupHTMXListeners();
    
    // Setup role-based document actions
    setupRoleBasedDocumentActions();
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                applyFilters();
            }
        });
        
        // Debounced search
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyFilters();
            }, 500);
        });
    }
    
    // Filter selects
    ['document-type-filter', 'category-filter', 'status-filter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', applyFilters);
        }
    });
    
    // Upload form (fallback handler only when HTMX is not available)
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm && (typeof htmx === 'undefined')) {
        uploadForm.addEventListener('submit', handleUpload);
    }
    
    // Document type select change
    const docTypeSelect = document.getElementById('document-type-select');
    if (docTypeSelect) {
        docTypeSelect.addEventListener('change', updateFileConstraints);
    }
}

// Setup HTMX event listeners
function setupHTMXListeners() {
    document.addEventListener('htmx:beforeRequest', function(event) {
        console.log('HTMX beforeRequest:', event.detail);
        showLoadingState();
    });
    
    document.addEventListener('htmx:afterRequest', function(event) {
        console.log('HTMX afterRequest:', event.detail);
        hideLoadingState();
        
        if (event.detail.xhr && event.detail.xhr.status === 401) {
            console.log('Unauthorized - redirecting to login');
            if (typeof window.redirectToLoginOnce === 'function') { window.redirectToLoginOnce(); } else { window.location.href = '/login'; }
        }
        
        if (event.detail.xhr && event.detail.xhr.status >= 400) {
            showToast('Error loading data', 'error');
        }
    });
    
    document.addEventListener('htmx:responseError', function(event) {
        console.log('HTMX responseError:', event.detail);
        hideLoadingState();
        showToast('Connection error', 'error');
    });
}

// Load documents table
function loadDocuments() {
    // Prefer full table container if present
    const tableContainer = document.getElementById('documents-table');
    const tbody = document.getElementById('documents-tbody');
    
    // If neither container exists, skip
    if (!tableContainer && !tbody) return;
    
    // If HTMX attributes are present on tbody, avoid duplicate manual fetch
    if (tbody && (tbody.hasAttribute('hx-get') || tbody.getAttribute('hx-trigger'))) {
        return;
    }
    
    // Build query parameters
    const params = new URLSearchParams({
        search: document.getElementById('search-input')?.value || '',
        document_type: document.getElementById('document-type-filter')?.value || '',
        category: document.getElementById('category-filter')?.value || '',
        status: document.getElementById('status-filter')?.value || '',
        limit: 20,
        offset: 0
    });
    
    // If tbody-based partial rows flow exists, use it
    if (tbody) {
        if (typeof htmx !== 'undefined') {
            htmx.ajax('GET', `/documents/rows?${params.toString()}`, {
                target: '#documents-tbody',
                swap: 'innerHTML'
            });
        } else {
            fetch(`/documents/rows?${params.toString()}`, {
                credentials: 'include'
            })
            .then(r => r.text())
            .then(html => { tbody.innerHTML = html; })
            .catch(() => { tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Error loading documents</td></tr>'; });
        }
        return;
    }

    // Fallback to legacy table render path
    if (typeof htmx !== 'undefined') {
        htmx.ajax('GET', `/documents/table?${params.toString()}`, {
            target: '#documents-table',
            swap: 'innerHTML'
        });
    } else {
        fetch(`/api/documents?${params.toString()}`)
            .then(response => response.json())
            .then(data => {
                renderDocumentsTable(data);
            })
            .catch(error => {
                console.error('Error loading documents:', error);
                showToast('Error loading documents', 'error');
            });
    }
}

// Load document statistics
function loadDocumentStats() {
    fetch('/documents/stats')
        .then(response => response.json())
        .then(data => {
            updateStatsCards(data);
        })
        .catch(error => {
            console.error('Error loading document stats:', error);
        });
}

// Load employees for dropdown
function loadEmployees() {
    fetch('/documents/employees/list')
        .then(response => response.text())
        .then(html => {
            const select = document.getElementById('employee-select');
            if (select) {
                select.innerHTML = html;
            }
        })
        .catch(error => {
            console.error('Error loading employees:', error);
            const select = document.getElementById('employee-select');
            if (select) {
                select.innerHTML = '<option value="">Erro ao carregar colaboradores</option>';
            }
        });
}

// Load document types for dropdown
function loadDocumentTypes() {
    fetch('/documents/types', { credentials: 'include' })
        .then(response => response.text())
        .then(html => {
            const select = document.getElementById('document-type-select');
            if (select) {
                select.innerHTML = html;
            }
        })
        .catch(error => {
            console.error('Error loading document types:', error);
            const select = document.getElementById('document-type-select');
            if (select) {
                select.innerHTML = '<option value="">Error loading types</option>';
            }
        });
}

// Update statistics cards
function updateStatsCards(stats) {
    const id = document.getElementById('identity-count');
    const em = document.getElementById('employment-count');
    const mi = document.getElementById('missing-count');
    const ex = document.getElementById('expiring-count');
    if (id) id.textContent = stats.identity || 0;
    if (em) em.textContent = stats.employment || 0;
    if (mi) mi.textContent = stats.missing || 0;
    if (ex) ex.textContent = stats.expiring || 0;
}

// Populate employee select
function populateEmployeeSelect(employees) {
    const select = document.getElementById('employee-select');
    if (!select) return;
    
    // Clear existing options except the first one
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = `${employee.first_name} ${employee.last_name} - ${employee.employee_id}`;
        select.appendChild(option);
    });
}

// Render documents table (fallback)
function renderDocumentsTable(data) {
    const tableContainer = document.getElementById('documents-table');
    if (!tableContainer) return;
    
    if (!data.documents || data.documents.length === 0) {
        tableContainer.innerHTML = `
            <div class="p-8 text-center">
                <i class="fas fa-folder-open text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-500">Nenhum documento encontrado</p>
            </div>
        `;
        return;
    }
    
    const table = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Colaborador
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documento
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acções
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${data.documents.map(doc => `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="h-8 w-8 bg-jech-primary rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-medium">
                                        ${doc.employee?.first_name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div class="ml-3">
                                    <div class="text-sm font-medium text-gray-900">
                                        ${doc.employee?.first_name || ''} ${doc.employee?.last_name || ''}
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        ${doc.employee?.employee_id || ''}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">
                                ${doc.title || doc.original_filename}
                            </div>
                            <div class="text-sm text-gray-500">
                                ${formatFileSize(doc.file_size)}
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeClass(doc.document_type)}">
                                ${getDocumentTypeDisplay(doc.document_type)}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(doc.document_status)}">
                                ${getStatusDisplay(doc.document_status)}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${formatDate(doc.created_at)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex space-x-2">
                                <button onclick="viewDocument('${doc.id}')" 
                                        class="text-jech-primary hover:text-jech-secondary">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="downloadDocument('${doc.id}')" 
                                        class="text-green-600 hover:text-green-900">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button onclick="deleteDocument('${doc.id}')" 
                                        class="text-red-600 hover:text-red-900">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = table;
}

// Apply filters
function applyFilters() {
    loadDocuments();
}

// Refresh documents
function refreshDocuments() {
    loadDocuments();
    loadDocumentStats();
            showToast('Documents updated', 'success');
}

// Show upload modal
window.showUploadModal = function() {
    const modal = document.getElementById('upload-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Ensure dropdown data
    const emp = document.getElementById('employee-select');
    const typ = document.getElementById('document-type-select');
    if (emp) emp.innerHTML = '<option value="">Loading employees...</option>';
    if (typ) typ.innerHTML = '<option value="">Loading types...</option>';
    loadEmployees();
    loadDocumentTypes();
}

// Hide upload modal
window.hideUploadModal = function() {
    const modal = document.getElementById('upload-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    const form = document.getElementById('upload-form');
    if (form) {
        form.reset();
        clearFileSelection();
    }
}

// Handle file upload (fallback API submit)
function handleUpload(event) {
	if (!event || !event.target) return;
	event.preventDefault();
	// Prevent double submission
	if (window.__DOC_UPLOAD_SUBMITTING__) return;
	window.__DOC_UPLOAD_SUBMITTING__ = true;
	
	const form = event.target;
	const formData = new FormData(form);
	
	// Validate form
	if (!validateUploadForm(formData)) {
		window.__DOC_UPLOAD_SUBMITTING__ = false;
		return;
	}
	
	// Show loading state
	const submitButton = form.querySelector('button[type="submit"]');
	if (submitButton) {
		var originalText = submitButton.innerHTML;
		submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>A carregar...';
		submitButton.disabled = true;
	}
	
	fetch('/api/documents/upload', {
		method: 'POST',
		body: formData,
		credentials: 'include'
	})
	.then(response => {
		if (!response.ok) {
			return response.json().then(err => Promise.reject(err));
		}
		return response.json();
	})
	.then(() => {
		showToast('Document uploaded successfully!', 'success');
		hideUploadModal();
		refreshDocuments();
	})
	.catch(error => {
		console.error('Upload error:', error);
		showToast(error.message || 'Error uploading document', 'error');
	})
	.finally(() => {
		if (submitButton) {
			submitButton.innerHTML = originalText;
			submitButton.disabled = false;
		}
		window.__DOC_UPLOAD_SUBMITTING__ = false;
	});
}

// Handle HTMX form submit fallback used in templates
window.handleFormSubmit = function(event) {
	if (typeof htmx !== 'undefined') {
		return true;
	}
	handleUpload(event);
	return false;
}

// Handle HTMX after-request callback from template (graceful no-op if not needed)
window.handleUploadResponse = function(event){
	try {
		if (!event || !event.detail || !event.detail.xhr) return;
		const status = event.detail.xhr.status;
		if (status === 201 || status === 200) {
			showToast('Document uploaded successfully', 'success');
			if (typeof window.hideUploadModal === 'function') { hideUploadModal(); }
			if (typeof htmx !== 'undefined') { htmx.trigger('body','refresh'); }
		} else if (status >= 400) {
			showToast('Upload failed', 'error');
		}
	} catch(e) { console.warn('handleUploadResponse error', e); }
}

// Validate upload form
function validateUploadForm(formData) {
    const employeeId = formData.get('employee_id');
    const documentType = formData.get('document_type');
    const file = formData.get('file');
    
    if (!employeeId) { showToast('Please select an employee', 'error'); return false; }
    if (!documentType) { showToast('Please select a document type', 'error'); return false; }
    if (!file || file.size === 0) { showToast('Please select a file', 'error'); return false; }
    if (file.size > 50 * 1024 * 1024) { showToast('File is too large. Maximum 50MB allowed.', 'error'); return false; }
    return true;
}

// Handle file selection
function handleFileSelect(input) {
    const file = input.files[0];
    if (!file) return;
    
    const preview = document.getElementById('file-preview');
    const fileName = document.getElementById('file-name');
    const dropZone = document.getElementById('file-drop-zone');
    
    if (fileName) fileName.textContent = `${file.name} (${formatFileSize(file.size)})`;
    if (dropZone) dropZone.style.display = 'none';
    if (preview) preview.classList.remove('hidden');
}

// Clear file selection
function clearFileSelection() {
    const input = document.getElementById('file-input');
    const preview = document.getElementById('file-preview');
    const dropZone = document.getElementById('file-drop-zone');
    
    if (input) input.value = '';
    if (dropZone) dropZone.style.display = 'block';
    if (preview) preview.classList.add('hidden');
}

// Setup file drag and drop
function setupFileDragDrop() {
    const dropZone = document.getElementById('file-drop-zone');
    if (!dropZone) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }
    function highlight() { dropZone.classList.add('border-jech-primary', 'bg-blue-50'); }
    function unhighlight() { dropZone.classList.remove('border-jech-primary', 'bg-blue-50'); }
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
                fileInput.files = files;
                handleFileSelect(fileInput);
            }
        }
    }
}

// Update file constraints based on document type
function updateFileConstraints(event) {
    const docType = event.target.value;
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('file-drop-zone');
    
    if (!docType || !fileInput || !dropZone) return;
    
    // Update accepted file types based on document type
    const constraints = getDocumentTypeConstraints(docType);
    if (constraints) {
        fileInput.accept = constraints.mimeTypes.join(',');
        const helpText = dropZone.querySelector('p:last-child');
        if (helpText) {
            helpText.textContent = `${constraints.description} (máx. ${formatFileSize(constraints.maxSize)})`;
        }
    }
}

// Get document type constraints
function getDocumentTypeConstraints(docType) {
    const constraints = {
        'identity_card': { mimeTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'], maxSize: 10 * 1024 * 1024, description: 'PDF, JPG, PNG, WEBP' },
        'passport': { mimeTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'], maxSize: 10 * 1024 * 1024, description: 'PDF, JPG, PNG, WEBP' },
        'tax_id': { mimeTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'], maxSize: 10 * 1024 * 1024, description: 'PDF, JPG, PNG, WEBP' },
        'bank_id': { mimeTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'], maxSize: 10 * 1024 * 1024, description: 'PDF, JPG, PNG, WEBP' },
        'contract': { mimeTypes: ['.pdf', '.doc', '.docx'], maxSize: 50 * 1024 * 1024, description: 'PDF, DOC, DOCX' },
        'income_declaration': { mimeTypes: ['.pdf', '.doc', '.docx'], maxSize: 50 * 1024 * 1024, description: 'PDF, DOC, DOCX' },
        'qualifications_certificate': { mimeTypes: ['.pdf', '.doc', '.docx'], maxSize: 50 * 1024 * 1024, description: 'PDF, DOC, DOCX' }
    };
    return constraints[docType];
}

// Document actions
function viewDocument(documentId) {
	fetch(`/api/documents/${documentId}`, { credentials: 'same-origin' })
		.then(response => response.json())
		.then(data => {
			if (data && data.document) {
				showDocumentModal(data.document);
			} else {
				showToast('Document not found', 'error');
			}
		})
		.catch(error => {
			console.error('Error viewing document:', error);
			showToast('Error loading document', 'error');
		});
}

// Show document details modal
function showDocumentModal(doc) {
	const modal = document.getElementById('document-details-modal');
	const content = document.getElementById('document-details-content');
	const actions = document.getElementById('document-actions');
	if (!modal || !content) { console.warn('Document modal elements not found'); return; }

	// Build content safely
	const createdDate = doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-PT') : '-';
	const expiryDate = doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('pt-PT') : 'N/A';
	const fileSize = typeof doc.file_size === 'number' ? formatFileSize(doc.file_size) : '-';

	content.innerHTML = `
		<div class="space-y-6">
			<div class="bg-gray-50 rounded-lg p-4">
				<h4 class="text-lg font-semibold text-gray-900 mb-3">Informações do Documento</h4>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700">Tipo</label>
						<p class="mt-1 text-sm text-gray-900">${getDocumentTypeDisplay(doc.document_type)}</p>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700">Status</label>
						<span class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(doc.document_status)}">${getStatusDisplay(doc.document_status)}</span>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700">Tamanho do Arquivo</label>
						<p class="mt-1 text-sm text-gray-900">${fileSize}</p>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700">Data de Upload</label>
						<p class="mt-1 text-sm text-gray-900">${createdDate}</p>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700">Data de Expiração</label>
						<p class="mt-1 text-sm text-gray-900">${expiryDate}</p>
					</div>
				</div>
			</div>
			<div class="border rounded">
				<iframe id="document-preview-frame" class="w-full h-[70vh]" src="about:blank"></iframe>
				<div id="document-preview-fallback" class="p-4 text-gray-500 text-sm hidden">Preview not available for this file type. Please use Download.</div>
			</div>
		</div>
	`;

	// Configure preview inline
	(function(){
		try {
			const frame = document.getElementById('document-preview-frame');
			const fallback = document.getElementById('document-preview-fallback');
			const lower = (doc.mime_type || '').toLowerCase();
			if (lower.startsWith('application/pdf') || lower.startsWith('image/')) {
				frame.src = `/api/documents/${doc.id}/preview`;
				frame.classList.remove('hidden');
				fallback.classList.add('hidden');
			} else {
				frame.src = 'about:blank';
				frame.classList.add('hidden');
				fallback.classList.remove('hidden');
			}
		} catch(e) { console.warn('preview config error', e); }
	})();

	if (actions) {
		actions.innerHTML = `
			<div class="flex justify-end space-x-3">
				<a href="/api/documents/${doc.id}/preview" target="_blank" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Preview</a>
				<a href="/api/documents/${doc.id}/download" target="_blank" class="px-4 py-2 bg-jech-primary text-white rounded-lg hover:bg-jech-secondary transition-colors">Download</a>
				<button type="button" onclick="hideDocumentModal()" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Close</button>
			</div>
		`;
	}

	modal.classList.remove('hidden');
	document.body.style.overflow = 'hidden';
}

function hideDocumentModal(){
	const modal = document.getElementById('document-details-modal');
	if (modal) {
		modal.classList.add('hidden');
		document.body.style.overflow = 'auto';
	}
}

function downloadDocument(documentId) {
    window.open(`/api/documents/${documentId}/download`, '_blank');
}

function approveDocument(documentId) {
    if (!confirm('Tem certeza que deseja aprovar este documento?')) { return; }
    
    fetch(`/api/documents/${documentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: 'Documento aprovado' })
    })
    .then(response => {
        if (response.ok) {
            showToast('Document approved successfully', 'success');
            refreshDocuments();
        } else {
            throw new Error('Erro ao aprovar documento');
        }
    })
    .catch(error => {
        console.error('Approve error:', error);
        showToast('Error approving document', 'error');
    });
}

function rejectDocument(documentId) {
    const reason = prompt('Rejection reason:');
    if (!reason || reason.trim() === '') { showToast('Rejection reason is required', 'warning'); return; }
    
    fetch(`/api/documents/${documentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: reason.trim() })
    })
    .then(response => {
        if (response.ok) {
            showToast('Document rejected', 'success');
            refreshDocuments();
        } else {
            throw new Error('Erro ao rejeitar documento');
        }
    })
    .catch(error => {
        console.error('Reject error:', error);
        showToast('Error rejecting document', 'error');
    });
}

function deleteDocument(documentId) {
    if (!confirm('Tem certeza que deseja eliminar este documento?')) {
        return;
    }
    
    fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            showToast('Document deleted successfully', 'success');
            refreshDocuments();
        } else {
            throw new Error('Erro ao eliminar documento');
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
                    showToast('Error deleting document', 'error');
    });
}

// Open edit modal and populate fields
function editDocumentGeneral(documentId){
	const modal = document.getElementById('editDocumentModal');
	if (!modal) return;
	fetch(`/api/documents/${documentId}`, { credentials: 'same-origin' })
		.then(r=>r.json())
		.then(data=>{
			const d = data && (data.document || data);
			if (!d || !d.id) { showToast('Document not found', 'error'); return; }
			document.getElementById('editDocumentId') && (document.getElementById('editDocumentId').value = d.id);
			document.getElementById('editTitle') && (document.getElementById('editTitle').value = d.title || '');
			document.getElementById('editDescription') && (document.getElementById('editDescription').value = d.description || '');
			document.getElementById('editIsConfidential') && (document.getElementById('editIsConfidential').checked = !!d.is_confidential);
			document.getElementById('editExpiryDate') && (document.getElementById('editExpiryDate').value = d.expiry_date ? new Date(d.expiry_date).toISOString().slice(0,10) : '');
			modal.classList.remove('hidden');
			document.body.style.overflow = 'hidden';
		})
		.catch(err=>{ console.error('edit load error', err); showToast('Error loading document', 'error'); });
}

function closeEditModalGeneral(){
	const modal = document.getElementById('editDocumentModal');
	if (modal) { modal.classList.add('hidden'); document.body.style.overflow = 'auto'; }
}

// Submit edit form
(function(){
	const form = document.getElementById('editDocumentForm');
	if (!form) return;
	form.addEventListener('submit', function(e){
		e.preventDefault();
		const id = document.getElementById('editDocumentId')?.value;
		if (!id) { showToast('Invalid document id', 'error'); return; }
		const title = document.getElementById('editTitle')?.value || '';
		const description = document.getElementById('editDescription')?.value || '';
		const isConf = document.getElementById('editIsConfidential')?.checked || false;
		const expiry = document.getElementById('editExpiryDate')?.value || '';
		// Build payload (metadata only)
		const payload = { };
		if (title) payload.title = title;
		if (description) payload.description = description;
		payload.is_confidential = isConf;
		if (expiry) payload.expiry_date = expiry;
		fetch(`/api/documents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
			.then(r=>{ if (!r.ok) throw new Error('Update failed'); return r.json().catch(()=>({})); })
			.then(()=>{ showToast('Document updated', 'success'); closeEditModalGeneral(); refreshDocuments(); })
			.catch(err=>{ console.error('edit submit error', err); showToast('Error updating document', 'error'); });
	});
})();

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getDocumentTypeDisplay(type) {
    const types = {
        'identity_card': 'ID Card',
        'passport': 'Passport',
        'tax_id': 'NUIT',
        'bank_id': 'NIB',
        'contract': 'Contract',
        'income_declaration': 'Income Declaration',
        'qualifications_certificate': 'Qualification Certificate'
    };
    return types[type] || type;
}

function getDocumentTypeClass(type) {
    const classes = {
        'identity_card': 'bg-blue-100 text-blue-800',
        'passport': 'bg-purple-100 text-purple-800',
        'tax_id': 'bg-yellow-100 text-yellow-800',
        'bank_id': 'bg-green-100 text-green-800',
        'contract': 'bg-indigo-100 text-indigo-800',
        'income_declaration': 'bg-red-100 text-red-800',
        'qualifications_certificate': 'bg-pink-100 text-pink-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
}

function getStatusDisplay(status) {
    const statuses = {
        'uploaded': 'Uploaded',
        'approved': 'Approved',
        'rejected': 'Rejected',
        'expired': 'Expired',
        'pending': 'Pending'
    };
    return statuses[status] || status;
}

function getStatusClass(status) {
    const classes = {
        'uploaded': 'bg-blue-100 text-blue-800',
        'approved': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800',
        'expired': 'bg-gray-100 text-gray-800',
        'pending': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

function showLoadingState() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => { if (!btn.disabled) btn.classList.add('opacity-50'); });
}

function hideLoadingState() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => { btn.classList.remove('opacity-50'); });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${getToastClass(type)}`;
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${getToastIcon(type)} mr-3"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-lg">&times;</button>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 5000);
}

function getToastClass(type) {
    const classes = {
        'success': 'bg-green-500 text-white',
        'error': 'bg-red-500 text-white',
        'warning': 'bg-yellow-500 text-white',
        'info': 'bg-blue-500 text-white'
    };
    return classes[type] || classes.info;
}

function getToastIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('upload-form');
    if (!form) return;
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() { validateField(this); });
        field.addEventListener('input', function() { clearFieldError(this); });
    });
}

function validateField(field) {
    const isValid = field.checkValidity();
    if (!isValid) { showFieldError(field, 'Este campo é obrigatório'); return false; }
    clearFieldError(field); return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('border-red-500');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1 field-error';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('border-red-500');
    const errorDiv = field.parentElement.querySelector('.field-error');
    if (errorDiv) { errorDiv.remove(); }
} 

// Setup role-based document actions
async function setupRoleBasedDocumentActions() {
    try {
        const response = await fetch('/api/auth/profile', { credentials: 'same-origin' });
        if (response.ok) {
            const userData = await response.json();
            const userRole = userData.data.role;
            // Do not hide Approve/Reject for operational managers; RBAC will be enforced server-side.
        }
    } catch (error) {
        console.error('Error loading user profile for document actions:', error);
    }
} 

// Ensure all action buttons are visible and bound after HTMX swaps
function ensureDocumentActionsInitialized() {
    // Unhide any action buttons hidden by older scripts
    const actionButtons = document.querySelectorAll('[onclick*="approveDocument"], [onclick*="rejectDocument"], [onclick*="editDocumentGeneral"], [onclick*="deleteDocument"], [onclick*="viewDocument"], [href*="/documents/download/"]');
    actionButtons.forEach(btn => { if (btn && btn.style && btn.style.display === 'none') btn.style.display = ''; });

    // No re-binding needed since actions are inline onclicks; this function acts as a safety net
} 