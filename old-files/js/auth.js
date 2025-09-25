/**
 * Authentication utility for handling JWT tokens in localStorage
 * Use this for API calls from JavaScript
 */
class AuthManager {
    constructor() {
        this.TOKEN_KEY = 'access_token';
        this.REFRESH_TOKEN_KEY = 'refresh_token';
        this.BASE_URL = '/api';
        this.isRefreshing = false;
        this.failedQueue = [];
    }

    /**
     * Store JWT tokens in localStorage
     */
    setTokens(accessToken, refreshToken) {
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        if (refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        }
    }

    /**
     * Get access token from localStorage
     */
    getAccessToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Get refresh token from localStorage
     */
    getRefreshToken() {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Remove tokens from localStorage
     */
    clearTokens() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.getAccessToken();
    }

    /**
     * Login via API and store tokens
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store tokens in localStorage for API usage
                this.setTokens(data.data.access_token, data.data.refresh_token);
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.message || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error during login' };
        }
    }

    /**
     * Logout via API and clear tokens
     */
    async logout() {
        try {
            await fetch(`${this.BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAccessToken()}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            // Always clear tokens from localStorage
            this.clearTokens();
        }
    }

    /**
     * Make authenticated API request
     */
    async makeRequest(url, options = {}) {
        // For session-based auth, we don't need to add Authorization header
        // The session cookie will be automatically included by the browser
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        const requestOptions = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
            credentials: 'same-origin', // Include cookies
        };

        try {
            const response = await fetch(url, requestOptions);

            // If unauthorized, redirect to login (guarded)
            if (response.status === 401) {
                if (window.location && window.location.pathname !== '/login') { if (typeof window.redirectToLoginOnce === 'function') { window.redirectToLoginOnce(); } else { window.location.href = '/login'; } }
                throw new Error('Authentication expired');
            }

            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        
        if (!refreshToken) {
            return false;
        }

        try {
            const response = await fetch(`${this.BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Update access token in localStorage
                localStorage.setItem(this.TOKEN_KEY, data.data.access_token);
                return true;
            } else {
                // Refresh failed, clear tokens
                this.clearTokens();
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearTokens();
            return false;
        }
    }

    /**
     * Get user profile
     */
    async getProfile() {
        try {
            const response = await this.makeRequest(`${this.BASE_URL}/auth/profile`);
            const data = await response.json();
            
            if (response.ok && data.success) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.message || 'Failed to get profile' };
            }
        } catch (error) {
            return { success: false, error: 'Network error getting profile' };
        }
    }
}

// Create global instance
const authManager = new AuthManager();
if (typeof window !== 'undefined') {
	window.authManager = authManager;
	// One-shot redirect guard to avoid multiple /login navigations
	if (!window.redirectToLoginOnce) {
		window.redirectToLoginOnce = function(){
			if (window.__redirectingToLogin) return;
			window.__redirectingToLogin = true;
			try { window.location.assign('/login'); } catch(_) { window.location.href = '/login'; }
		};
	}
	// Lightweight readiness/caching API for other modules
	if (!window.__authReadyCallbacks) window.__authReadyCallbacks = [];
	window.__authProfileCache = null;
	window.__authProfilePending = null;
	authManager.getCachedProfile = async function() {
		if (window.__authProfileCache) return window.__authProfileCache;
		if (window.__authProfilePending) return window.__authProfilePending;
		window.__authProfilePending = (async () => {
			try {
				const res = await this.getProfile();
				if (res && res.success) {
					window.__authProfileCache = res.data;
					const cbs = window.__authReadyCallbacks.splice(0);
					cbs.forEach(cb => { try { cb(res.data); } catch(e) {} });
					return res.data;
				}
				return null;
			} finally {
				window.__authProfilePending = null;
			}
		})();
		return window.__authProfilePending;
	};
	authManager.onReady = function(cb) {
		if (window.__authProfileCache) { try { cb(window.__authProfileCache); } catch(e) {} return; }
		window.__authReadyCallbacks.push(cb);
		// Kick off load if not started
		this.getCachedProfile();
	};
	authManager.init = function() {
		this.getCachedProfile();
	};
	// auto-init
	authManager.init();
}

// Example usage:
/*
// Login
const loginResult = await authManager.login('user@example.com', 'password');
if (loginResult.success) {
    console.log('Login successful', loginResult.data);
} else {
    console.error('Login failed', loginResult.error);
}

// Make authenticated API request
try {
    const response = await authManager.makeRequest('/api/employees');
    const data = await response.json();
    console.log('Employees:', data);
} catch (error) {
    console.error('Failed to fetch employees:', error);
}

// Logout
await authManager.logout();
*/

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
