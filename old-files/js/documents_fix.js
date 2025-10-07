// Documents JavaScript for NEXUpayroll
document.addEventListener('DOMContentLoaded', function() {
    console.log('NEXUpayroll Documents - Ready');
    
    // Initialize page
    initializeDocuments();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup role-based navigation
    setupRoleBasedNavigation();
    
    // Load initial data
    loadDocuments();
    loadDocumentStats();
    loadEmployees();
});

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
