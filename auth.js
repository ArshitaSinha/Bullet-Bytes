// Authentication Management

class AuthManager {
    constructor() {
        this.isAuthenticated = this.checkAuthStatus();
        this.setupLogoutHandler();
        this.updateUIState();
    }

    checkAuthStatus() {
        return localStorage.getItem('isAuthenticated') === 'true';
    }

    login(userData) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        this.isAuthenticated = true;
        this.updateUIState();
        // Redirect only if user is authenticated
        if (this.isAuthenticated) {
            window.location.href = 'index.html';
        }
    }

    logout() {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
        this.isAuthenticated = false;
        window.location.href = 'login.html';
    }

    setupLogoutHandler() {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    updateUIState() {
        const loginBtn = document.querySelector('.login-btn');
        const logoutBtn = document.querySelector('.logout-btn');
        const userProfile = document.querySelector('.user-profile');

        if (this.isAuthenticated) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (userProfile) userProfile.style.display = 'block';
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userProfile) userProfile.style.display = 'none';
        }
    }
}

// Initialize authentication manager
const authManager = new AuthManager();