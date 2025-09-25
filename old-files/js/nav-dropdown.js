/**
 * User Dropdown Navigation Handler
 * Handles the user dropdown menu in the navigation bar with notifications
 */

class UserDropdown {
    constructor() {
        this.dropdownButton = document.getElementById('userDropdownButton');
        this.dropdownMenu = document.getElementById('userDropdownMenu');
        this.dropdownArrow = document.getElementById('dropdownArrow');
        this.isOpen = false;
        this.backdrop = null;
        
        // Notification elements
        this.notificationsList = document.getElementById('notificationsList');
        this.notificationsLoading = document.getElementById('notificationsLoading');
        this.notificationsEmpty = document.getElementById('notificationsEmpty');
        this.notificationsContent = document.getElementById('notificationsContent');
        this.clearNotificationsBtn = document.getElementById('clearNotificationsBtn');
        
        // Badge elements
        this.notificationBadge = document.getElementById('notificationBadge');
        this.notificationCount = document.getElementById('notificationCount');

        if (this.dropdownButton && this.dropdownMenu) {
            this.init();
            // Load notification count on page load (optional - won't break if it fails)
            this.updateNotificationBadge().catch(() => {
                // Silently ignore notification badge errors
                console.debug('Notification badge not available');
            });
        }
    }

    init() {
        // Click event for dropdown button
        this.dropdownButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });

        // Keyboard events for accessibility
        this.dropdownButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });

        // Handle menu item keyboard navigation
        this.dropdownMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
                this.dropdownButton.focus();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateMenu(e.key === 'ArrowDown');
            }
        });

        // Prevent menu from closing when clicking inside
        this.dropdownMenu.addEventListener('click', (e) => {
            // Allow links to work normally, but prevent propagation
            if (e.target.tagName === 'A') {
                return; // Let the link navigate normally
            }
            e.stopPropagation();
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.isOpen) return;

        // Close other dropdowns first
        if (adminDropdownInstance && adminDropdownInstance.isOpen) {
            adminDropdownInstance.close();
        }
        if (myStuffDropdownInstance && myStuffDropdownInstance.isOpen) {
            myStuffDropdownInstance.close();
        }

        this.isOpen = true;
        
        // Update button state
        this.dropdownButton.setAttribute('aria-expanded', 'true');
        
        // Show menu with animation
        this.dropdownMenu.classList.remove('hidden');
        this.dropdownMenu.classList.add('show');
        
        // Rotate arrow
        if (this.dropdownArrow) {
            this.dropdownArrow.classList.add('rotate');
        }

        // Create backdrop for click-outside-to-close
        this.createBackdrop();

        // Load notifications when dropdown opens (optional - won't break if it fails)
        this.loadNotifications().catch(() => {
            console.debug('Notifications not available');
        });

        // Focus first menu item for keyboard navigation
        setTimeout(() => {
            const firstMenuItem = this.dropdownMenu.querySelector('a');
            if (firstMenuItem) {
                firstMenuItem.focus();
            }
        }, 100);
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        
        // Update button state
        this.dropdownButton.setAttribute('aria-expanded', 'false');
        
        // Hide menu with animation
        this.dropdownMenu.classList.remove('show');
        
        // Reset arrow
        if (this.dropdownArrow) {
            this.dropdownArrow.classList.remove('rotate');
        }

        // Remove backdrop
        this.removeBackdrop();

        // Hide menu after animation
        setTimeout(() => {
            if (!this.isOpen) { // Double-check in case it was reopened
                this.dropdownMenu.classList.add('hidden');
            }
        }, 200);
    }

    createBackdrop() {
        if (this.backdrop) return;

        this.backdrop = document.createElement('div');
        this.backdrop.className = 'dropdown-backdrop';
        this.backdrop.addEventListener('click', () => this.close());
        document.body.appendChild(this.backdrop);
    }

    removeBackdrop() {
        if (this.backdrop) {
            document.body.removeChild(this.backdrop);
            this.backdrop = null;
        }
    }

    navigateMenu(down = true) {
        const menuItems = Array.from(this.dropdownMenu.querySelectorAll('a'));
        const currentIndex = menuItems.findIndex(item => item === document.activeElement);
        
        let nextIndex;
        if (down) {
            nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        }
        
        menuItems[nextIndex].focus();
    }

    // Load notifications from API
    async loadNotifications() {
        if (!this.notificationsContent) return;

        try {
            // Show loading state
            this.showLoadingState();

            const response = await fetch('/api/notifications?limit=5', {
                method: 'GET',
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to load notifications');
            }

            const data = await response.json();
            this.renderNotifications(data.notifications || []);

        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showErrorState();
        }
    }

    // Show loading state
    showLoadingState() {
        if (this.notificationsLoading) {
            this.notificationsLoading.classList.remove('hidden');
        }
        if (this.notificationsEmpty) {
            this.notificationsEmpty.classList.add('hidden');
        }
        if (this.notificationsContent) {
            this.notificationsContent.innerHTML = '';
        }
    }

    // Show error state
    showErrorState() {
        if (this.notificationsLoading) {
            this.notificationsLoading.classList.add('hidden');
        }
        if (this.notificationsContent) {
            this.notificationsContent.innerHTML = `
                <div class="px-4 py-3 text-center">
                    <p class="text-xs text-red-500">Failed to load notifications</p>
                </div>
            `;
        }
    }

    // Render notifications
    renderNotifications(notifications) {
        if (this.notificationsLoading) {
            this.notificationsLoading.classList.add('hidden');
        }

        if (!notifications || notifications.length === 0) {
            if (this.notificationsEmpty) {
                this.notificationsEmpty.classList.remove('hidden');
            }
            if (this.notificationsContent) {
                this.notificationsContent.innerHTML = '';
            }
            return;
        }

        if (this.notificationsEmpty) {
            this.notificationsEmpty.classList.add('hidden');
        }

        const notificationsHtml = notifications.map(notification => this.createNotificationHtml(notification)).join('');
        
        if (this.notificationsContent) {
            this.notificationsContent.innerHTML = notificationsHtml;
        }
    }

    // Create HTML for a single notification with enhanced JECH styling
    createNotificationHtml(notification) {
        const priorityClass = this.getPriorityClass(notification.priority);
        const icon = this.getTypeIcon(notification.type);
        const isUnread = notification.status === 'unread';
        const isDeleted = notification.status === 'deleted';
        
        // Skip rendering deleted notifications (they shouldn't appear in normal view)
        if (isDeleted) {
            return '';
        }

        // Enhanced status display with emoji
        const statusDisplay = this.getStatusDisplay(notification.status);

        return `
            <div class="notification-item ${priorityClass}" 
                 data-notification-id="${notification.id}"
                 data-status="${notification.status}" 
                 onclick="userDropdownInstance.markAsReadAndNavigate('${notification.id}', '${notification.action_url || ''}')"
                 title="Click to ${isUnread ? 'mark as read and ' : ''}${notification.action_url ? 'navigate' : 'view details'}">
                <div class="flex items-start">
                    <div class="flex-shrink-0">${icon}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between mb-3">
                            <h5 class="notification-title">${notification.title}</h5>
                            <div class="flex items-center space-x-2 flex-shrink-0 ml-4">
                                ${isUnread ? '<div class="w-2 h-2 bg-jech-accent rounded-full" title="Unread"></div>' : ''}
                                <span class="text-xs text-gray-500 capitalize">${statusDisplay}</span>
                            </div>
                        </div>
                        <p class="notification-message line-clamp-2">${notification.message}</p>
                        <div class="flex items-center justify-between mt-4">
                            <span class="text-xs text-gray-400">${notification.time_ago}</span>
                            <button 
                                class="delete-btn"
                                onclick="event.stopPropagation(); userDropdownInstance.deleteNotification('${notification.id}')"
                                title="Delete notification"
                                aria-label="Delete notification"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Get priority class for notification styling (JECH themed)
    getPriorityClass(priority) {
        switch (priority) {
            case 'urgent': return 'priority-urgent';
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            case 'low': return 'priority-low';
            default: return 'priority-medium';
        }
    }

    // Get enhanced status display - professional style
    getStatusDisplay(status) {
        switch (status) {
            case 'unread':
                return 'Unread';
            case 'read':
                return 'Read';
            case 'deleted':
                return 'Deleted';
            default:
                return 'Unknown';
        }
    }

    // Get icon for notification type (includes new JECH notification types)
    getTypeIcon(type) {
        switch (type) {
            case 'document_approved': return '✅';
            case 'document_rejected': return '❌';
            case 'payroll_generated': return '💰';
            case 'timesheet_approved': return '✅';
            case 'timesheet_rejected': return '❌';
            case 'employee_created': return '👤';
            case 'payment_processed': return '💳';
            case 'system_announcement': return '📢';
            // Enhanced notification types
            case 'paystub_generated': return '🧾';
            case 'document_expiring': return '⚠️';
            case 'document_expired': return '🚨';
            default: return '🔔';
        }
    }

    // Delete a specific notification (soft delete)
    async deleteNotification(notificationId) {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                credentials: 'same-origin',
            });

            if (response.ok) {
                // Remove notification from UI (soft delete means it disappears from user view)
                const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
                if (notificationElement) {
                    // Check if it was unread before removing
                    const wasUnread = notificationElement.dataset.status === 'unread';
                    
                    // Animate removal
                    notificationElement.style.opacity = '0.5';
                    notificationElement.style.transform = 'translateX(-100%)';
                    
                    setTimeout(() => {
                        notificationElement.remove();
                        
                        // Check if no notifications left
                        const remainingNotifications = this.notificationsContent.querySelectorAll('.notification-item');
                        if (remainingNotifications.length === 0) {
                            if (this.notificationsEmpty) {
                                this.notificationsEmpty.classList.remove('hidden');
                            }
                        }
                    }, 200);
                    
                    // Update badge count if it was unread
                    if (wasUnread) {
                        this.updateNotificationBadge().catch(() => {
                            console.debug('Could not update notification badge');
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    // Mark notification as read and navigate to action URL
    async markAsReadAndNavigate(notificationId, actionUrl) {
        try {
            // Mark as read if currently unread
            const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
            if (notificationElement && notificationElement.dataset.status === 'unread') {
                const response = await fetch(`/api/notifications/${notificationId}/read`, {
                    method: 'PUT',
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    // Update UI to show as read
                    notificationElement.dataset.status = 'read';
                    notificationElement.classList.remove('bg-jech-notification-unread');
                    
                    // Remove unread indicator and update status text
                    const unreadIndicator = notificationElement.querySelector('.w-2.h-2.bg-jech-accent');
                    if (unreadIndicator) {
                        unreadIndicator.remove();
                    }
                    
                    // Update status text
                    const statusText = notificationElement.querySelector('.text-xs.text-gray-500.capitalize');
                    if (statusText) {
                        statusText.textContent = 'read';
                    }
                    
                    // Update badge count
                    this.updateNotificationBadge().catch(() => {
                        console.debug('Could not update notification badge');
                    });
                }
            }

            // Navigate to action URL if provided
            if (actionUrl && actionUrl !== '') {
                // Close dropdown first
                this.close();
                // Navigate after a small delay
                setTimeout(() => {
                    window.location.href = actionUrl;
                }, 200);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // Update notification badge with unread count
    async updateNotificationBadge() {
        try {
            const response = await fetch('/api/notifications/count', {
                method: 'GET',
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                const unreadCount = data.unread_count || 0;
                
                if (this.notificationBadge && this.notificationCount) {
                    if (unreadCount > 0) {
                        this.notificationCount.textContent = unreadCount > 9 ? '9+' : unreadCount.toString();
                        this.notificationBadge.classList.remove('hidden');
                    } else {
                        this.notificationBadge.classList.add('hidden');
                    }
                }
            }
        } catch (error) {
            console.error('Error updating notification badge:', error);
        }
    }
}

class AdminDropdown {
    constructor() {
        this.dropdownButton = document.getElementById('adminDropdownButton');
        this.dropdownMenu = document.getElementById('adminDropdownMenu');
        this.dropdownArrow = document.getElementById('adminDropdownArrow');
        this.isOpen = false;
        this.backdrop = null;

        if (this.dropdownButton && this.dropdownMenu) {
            this.init();
        }
    }

    init() {
        // Click event for dropdown button
        this.dropdownButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });

        // Keyboard events for accessibility
        this.dropdownButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });

        // Handle menu item keyboard navigation
        this.dropdownMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
                this.dropdownButton.focus();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateMenu(e.key === 'ArrowDown');
            }
        });

        // Prevent menu from closing when clicking inside
        this.dropdownMenu.addEventListener('click', (e) => {
            // Allow links to work normally
            if (e.target.tagName === 'A') {
                return; 
            }
            e.stopPropagation();
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.isOpen) return;

        // Close other dropdowns first
        if (userDropdownInstance && userDropdownInstance.isOpen) {
            userDropdownInstance.close();
        }
        if (myStuffDropdownInstance && myStuffDropdownInstance.isOpen) {
            myStuffDropdownInstance.close();
        }

        this.isOpen = true;
        
        // Update button state
        this.dropdownButton.setAttribute('aria-expanded', 'true');
        
        // Show menu with animation
        this.dropdownMenu.classList.remove('hidden');
        this.dropdownMenu.classList.add('show');
        
        // Rotate arrow
        if (this.dropdownArrow) {
            this.dropdownArrow.classList.add('rotate');
        }

        // Create backdrop for click-outside-to-close
        this.createBackdrop();

        // Focus first menu item for keyboard navigation
        setTimeout(() => {
            const firstMenuItem = this.dropdownMenu.querySelector('a');
            if (firstMenuItem) {
                firstMenuItem.focus();
            }
        }, 100);
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        
        // Update button state
        this.dropdownButton.setAttribute('aria-expanded', 'false');
        
        // Hide menu with animation
        this.dropdownMenu.classList.remove('show');
        
        // Reset arrow
        if (this.dropdownArrow) {
            this.dropdownArrow.classList.remove('rotate');
        }

        // Remove backdrop
        this.removeBackdrop();

        // Hide menu after animation
        setTimeout(() => {
            if (!this.isOpen) {
                this.dropdownMenu.classList.add('hidden');
            }
        }, 200);
    }

    createBackdrop() {
        if (this.backdrop) return;

        this.backdrop = document.createElement('div');
        this.backdrop.className = 'dropdown-backdrop';
        this.backdrop.addEventListener('click', () => this.close());
        document.body.appendChild(this.backdrop);
    }

    removeBackdrop() {
        if (this.backdrop) {
            document.body.removeChild(this.backdrop);
            this.backdrop = null;
        }
    }

    navigateMenu(down = true) {
        const menuItems = Array.from(this.dropdownMenu.querySelectorAll('a'));
        const currentIndex = menuItems.findIndex(item => item === document.activeElement);
        
        let nextIndex;
        if (down) {
            nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        }
        
        menuItems[nextIndex].focus();
    }
}

// MyStuffDropdown class for handling My Stuff dropdown functionality
class MyStuffDropdown {
    constructor() {
        this.dropdownButton = document.getElementById('myStuffDropdownButton');
        this.dropdownMenu = document.getElementById('myStuffDropdownMenu');
        this.dropdownArrow = document.getElementById('myStuffDropdownArrow');
        this.isOpen = false;
        this.backdrop = null;

        if (this.dropdownButton && this.dropdownMenu) {
            this.init();
        }
    }

    init() {
        // Click event for dropdown button
        this.dropdownButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });

        // Keyboard events for accessibility
        this.dropdownButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });

        // Handle menu item keyboard navigation
        this.dropdownMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
                this.dropdownButton.focus();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateMenu(e.key === 'ArrowDown');
            }
        });

        // Prevent menu from closing when clicking inside
        this.dropdownMenu.addEventListener('click', (e) => {
            // Allow links to work normally
            if (e.target.tagName === 'A') {
                return; 
            }
            e.stopPropagation();
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.isOpen) return;

        // Close other dropdowns first
        if (userDropdownInstance && userDropdownInstance.isOpen) {
            userDropdownInstance.close();
        }
        if (adminDropdownInstance && adminDropdownInstance.isOpen) {
            adminDropdownInstance.close();
        }

        this.isOpen = true;
        
        // Update button state
        this.dropdownButton.setAttribute('aria-expanded', 'true');
        
        // Show menu with animation
        this.dropdownMenu.classList.remove('hidden');
        this.dropdownMenu.classList.add('show');
        
        // Rotate arrow
        if (this.dropdownArrow) {
            this.dropdownArrow.classList.add('rotate');
        }

        // Create backdrop for click-outside-to-close
        this.createBackdrop();

        // Focus first menu item for keyboard navigation
        setTimeout(() => {
            const firstMenuItem = this.dropdownMenu.querySelector('a');
            if (firstMenuItem) {
                firstMenuItem.focus();
            }
        }, 100);
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        
        // Update button state
        this.dropdownButton.setAttribute('aria-expanded', 'false');
        
        // Hide menu with animation
        this.dropdownMenu.classList.remove('show');
        
        // Reset arrow
        if (this.dropdownArrow) {
            this.dropdownArrow.classList.remove('rotate');
        }

        // Remove backdrop
        this.removeBackdrop();

        // Hide menu after animation
        setTimeout(() => {
            if (!this.isOpen) {
                this.dropdownMenu.classList.add('hidden');
            }
        }, 200);
    }

    createBackdrop() {
        if (this.backdrop) return;

        this.backdrop = document.createElement('div');
        this.backdrop.className = 'dropdown-backdrop';
        this.backdrop.addEventListener('click', () => this.close());
        document.body.appendChild(this.backdrop);
    }

    removeBackdrop() {
        if (this.backdrop) {
            document.body.removeChild(this.backdrop);
            this.backdrop = null;
        }
    }

    navigateMenu(down = true) {
        const menuItems = Array.from(this.dropdownMenu.querySelectorAll('a'));
        const currentIndex = menuItems.findIndex(item => item === document.activeElement);
        
        let nextIndex;
        if (down) {
            nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        }
        
        menuItems[nextIndex].focus();
    }
}

// Global function for clearing all notifications
async function clearAllNotifications() {
    if (!confirm('Are you sure you want to clear all notifications?')) {
        return;
    }

    try {
        const response = await fetch('/api/notifications/clear', {
            method: 'DELETE',
            credentials: 'same-origin',
        });

        if (response.ok) {
            // Clear notifications from UI
            const notificationsContent = document.getElementById('notificationsContent');
            const notificationsEmpty = document.getElementById('notificationsEmpty');
            
            if (notificationsContent) {
                notificationsContent.innerHTML = '';
            }
            if (notificationsEmpty) {
                notificationsEmpty.classList.remove('hidden');
            }
            
            // Update badge count to 0
            if (userDropdownInstance) {
                userDropdownInstance.updateNotificationBadge().catch(() => {
                    console.debug('Could not update notification badge');
                });
            }
        }
    } catch (error) {
        console.error('Error clearing notifications:', error);
        alert('Failed to clear notifications. Please try again.');
    }
}

// Store global instances for easy access
let userDropdownInstance;
let adminDropdownInstance;
let myStuffDropdownInstance;

// Initialize dropdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    userDropdownInstance = new UserDropdown();
    adminDropdownInstance = new AdminDropdown();
    myStuffDropdownInstance = new MyStuffDropdown();
});

// Close dropdowns on window resize (helpful for mobile)
window.addEventListener('resize', () => {
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const adminDropdownMenu = document.getElementById('adminDropdownMenu');
    const myStuffDropdownMenu = document.getElementById('myStuffDropdownMenu');
    
    if (userDropdownMenu && !userDropdownMenu.classList.contains('hidden')) {
        if (userDropdownInstance) {
            userDropdownInstance.close();
        }
    }
    
    if (adminDropdownMenu && !adminDropdownMenu.classList.contains('hidden')) {
        if (adminDropdownInstance) {
            adminDropdownInstance.close();
        }
    }
    
    if (myStuffDropdownMenu && !myStuffDropdownMenu.classList.contains('hidden')) {
        if (myStuffDropdownInstance) {
            myStuffDropdownInstance.close();
        }
    }
}); 

// Global Cancel handler (works after HTMX swaps)
document.body.addEventListener('click', function(evt){
    try {
        const clicked = evt.target.closest('button, a');
        if (!clicked) return;
        // Only handle buttons/links that visibly say "Cancel"
        const label = (clicked.textContent || '').trim().toLowerCase();
        if (label !== 'cancel') return;
        // If element already has explicit behavior, let it proceed
        if (clicked.hasAttribute('onclick') || clicked.hasAttribute('hx-get') || clicked.getAttribute('href')) return;
        // Prevent default and attempt sensible cancel behavior
        evt.preventDefault();
        // Prefer closing known modals if present
        if (typeof hideModal === 'function') {
            const modal = document.getElementById('modal');
            if (modal && !modal.classList.contains('hidden')) { hideModal(); return; }
        }
        if (typeof hideUploadModal === 'function') { hideUploadModal(); return; }
        if (typeof hideUserModal === 'function') { hideUserModal(); return; }
        if (typeof hideDeleteModal === 'function') { hideDeleteModal(); return; }
        // Fallback: simple history back
        if (window.history && typeof window.history.back === 'function') { window.history.back(); }
    } catch(e) { console.error('Global cancel handler error:', e); }
}); 