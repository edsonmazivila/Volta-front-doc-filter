// Login page JavaScript for Nexus Pay
document.addEventListener('DOMContentLoaded', function() {
    console.log('Nexus Pay Login - Ready');
    
    // Add smooth loading animations
    const form = document.querySelector('form');
    const inputs = document.querySelectorAll('input');
    const submitButton = document.querySelector('button[type="submit"]');
    
    // Add focus effects to inputs
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('ring-2', 'ring-blue-400');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('ring-2', 'ring-blue-400');
        });
        
        // Real-time validation
        input.addEventListener('input', function() {
            validateField(this);
        });
    });
    
    // Form submission handling - Use JavaScript API instead of HTMX
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="spinner mr-2"></div>
                Signing In...
            </div>
        `;
        
        // Add subtle animation to form
        form.classList.add('opacity-75', 'pointer-events-none');
        
        try {
            // Make web login request that sets HTTP-only cookies
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                },
                credentials: 'include',
                body: new URLSearchParams({
                    email: email,
                    password: password
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                showToast(result.message || result.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Network error during login', 'error');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg class="h-5 w-5 text-blue-300 group-hover:text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"></path>
                    </svg>
                </span>
                Sign In
            `;
            
            // Remove loading state
            form.classList.remove('opacity-75', 'pointer-events-none');
        }
    });
    
    // HTMX event handlers removed - now using pure JavaScript authentication
    
    // Validation functions
    function validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        
        // Remove existing validation classes
        field.classList.remove('input-error', 'input-success');
        
        if (value === '') {
            return;
        }
        
        if (fieldType === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(value)) {
                field.classList.add('input-success');
            } else {
                field.classList.add('input-error');
            }
        } else if (fieldType === 'password') {
            if (value.length >= 6) {
                field.classList.add('input-success');
            } else {
                field.classList.add('input-error');
            }
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
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Enter key on email field focuses password
        if (event.key === 'Enter' && event.target.type === 'email') {
            event.preventDefault();
            document.getElementById('password').focus();
        }
    });
    
    // Add floating animation to logo
    const logo = document.querySelector('.animate-pulse-glow');
    if (logo) {
        logo.classList.add('float');
    }
    
    // Progressive enhancement for older browsers
    if (!window.CSS || !CSS.supports('backdrop-filter', 'blur(10px)')) {
        // Fallback for browsers without backdrop-filter support
        const glassElements = document.querySelectorAll('.bg-white\\/10');
        glassElements.forEach(el => {
            el.classList.remove('bg-white/10');
            el.classList.add('bg-slate-800');
        });
    }
});

// Utility functions for HTMX integration
window.JechPay = {
    showToast: function(message, type = 'info') {
        // Same toast function for global access
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
    },
    
    validateForm: function(formElement) {
        const inputs = formElement.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            const value = input.value.trim();
            if (value === '') {
                input.classList.add('input-error');
                isValid = false;
            } else {
                input.classList.remove('input-error');
            }
        });
        
        return isValid;
    }
};
