// Theme Management System
class ThemeManager {
    constructor() {
        this.themeToggle = document.querySelector('.theme-toggle');
        this.body = document.body;
        this.setupEventListeners();
        this.loadThemePreference();
    }

    setupEventListeners() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                const newTheme = this.body.dataset.theme === 'dark' ? 'light' : 'dark';
                this.applyTheme(newTheme);
                this.saveThemePreference();
            });
        }

        // Listen for storage events to sync theme across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                this.applyTheme(e.newValue);
            }
        });
    }

    applyTheme(theme) {
        this.body.dataset.theme = theme;
        if (this.themeToggle) {
            this.themeToggle.innerHTML = theme === 'dark' ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
        }

        // Update calendar if it exists
        const calendar = document.getElementById('calendar');
        if (calendar) {
            calendar.classList.toggle('fc-theme-dark', theme === 'dark');
            calendar.classList.toggle('fc-theme-light', theme === 'light');
        }

        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    loadThemePreference() {
        const theme = localStorage.getItem('theme') || 'light';
        this.applyTheme(theme);
    }

    saveThemePreference() {
        localStorage.setItem('theme', this.body.dataset.theme);
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});