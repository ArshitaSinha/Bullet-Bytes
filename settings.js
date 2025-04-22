// Settings and Customization Management System

class SettingsManager {
    constructor() {
        this.themeOptions = document.querySelectorAll('.theme-option');
        this.colorOptions = document.querySelectorAll('.color-option');
        this.fontSelect = document.getElementById('fontSelect');
        this.decreaseFontBtn = document.getElementById('decreaseFontBtn');
        this.increaseFontBtn = document.getElementById('increaseFontBtn');
        this.currentFontSizeEl = document.getElementById('currentFontSize');
        this.exportDataBtn = document.getElementById('exportDataBtn');
        this.importDataBtn = document.getElementById('importDataBtn');
        this.clearDataBtn = document.getElementById('clearDataBtn');
        
        this.settings = {
            theme: 'light',
            colorScheme: 'default',
            font: 'Inter',
            fontSize: 16
        };
        
        this.setupEventListeners();
        this.loadSettings();
        this.applySettings();
    }

    setupEventListeners() {
        // Theme options
        if (this.themeOptions) {
            this.themeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const theme = option.dataset.theme;
                    this.settings.theme = theme;
                    this.applyTheme(theme);
                    this.saveSettings();
                    this.updateActiveOptions();
                });
            });
        }

        // Color scheme options
        if (this.colorOptions) {
            this.colorOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const colorScheme = option.dataset.colorScheme;
                    this.settings.colorScheme = colorScheme;
                    this.applyColorScheme(colorScheme);
                    this.saveSettings();
                    this.updateActiveOptions();
                });
            });
        }

        // Font selection
        if (this.fontSelect) {
            this.fontSelect.addEventListener('change', () => {
                const font = this.fontSelect.value;
                this.settings.font = font;
                this.applyFont(font);
                this.saveSettings();
            });
        }

        // Font size controls
        if (this.decreaseFontBtn) {
            this.decreaseFontBtn.addEventListener('click', () => {
                if (this.settings.fontSize > 12) {
                    this.settings.fontSize -= 1;
                    this.applyFontSize(this.settings.fontSize);
                    this.saveSettings();
                }
            });
        }

        if (this.increaseFontBtn) {
            this.increaseFontBtn.addEventListener('click', () => {
                if (this.settings.fontSize < 24) {
                    this.settings.fontSize += 1;
                    this.applyFontSize(this.settings.fontSize);
                    this.saveSettings();
                }
            });
        }

        // Data management
        if (this.exportDataBtn) {
            this.exportDataBtn.addEventListener('click', () => this.exportData());
        }

        if (this.importDataBtn) {
            this.importDataBtn.addEventListener('click', () => this.importData());
        }

        if (this.clearDataBtn) {
            this.clearDataBtn.addEventListener('click', () => this.clearData());
        }
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('bulletBytesSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
    }

    saveSettings() {
        localStorage.setItem('bulletBytesSettings', JSON.stringify(this.settings));
    }

    applySettings() {
        this.applyTheme(this.settings.theme);
        this.applyColorScheme(this.settings.colorScheme);
        this.applyFont(this.settings.font);
        this.applyFontSize(this.settings.fontSize);
        this.updateActiveOptions();
        this.updateFontSelectValue();
    }

    applyTheme(theme) {
        document.body.dataset.theme = theme;
        
        // Update theme toggle icon
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = theme === 'dark' ? 
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

    applyColorScheme(colorScheme) {
        // Remove any existing color scheme classes
        document.body.classList.remove('color-default', 'color-ocean', 'color-forest', 'color-sunset');
        
        // Add the new color scheme class
        document.body.classList.add(`color-${colorScheme}`);
        
        // Apply CSS variables based on color scheme
        switch(colorScheme) {
            case 'ocean':
                document.documentElement.style.setProperty('--primary-color', '#1A5276');
                document.documentElement.style.setProperty('--secondary-color', '#3498DB');
                document.documentElement.style.setProperty('--accent-color', '#76D7C4');
                break;
            case 'forest':
                document.documentElement.style.setProperty('--primary-color', '#145A32');
                document.documentElement.style.setProperty('--secondary-color', '#27AE60');
                document.documentElement.style.setProperty('--accent-color', '#F1C40F');
                break;
            case 'sunset':
                document.documentElement.style.setProperty('--primary-color', '#922B21');
                document.documentElement.style.setProperty('--secondary-color', '#E74C3C');
                document.documentElement.style.setProperty('--accent-color', '#F39C12');
                break;
            default: // Default color scheme
                document.documentElement.style.setProperty('--primary-color', '#2C3E50');
                document.documentElement.style.setProperty('--secondary-color', '#3498DB');
                document.documentElement.style.setProperty('--accent-color', '#27AE60');
        }
    }

    applyFont(font) {
        // Add the Google Font link if not already present
        this.loadGoogleFont(font);
        
        // Apply the font to the body
        document.documentElement.style.setProperty('--body-font', `'${font}', sans-serif`);
        document.body.style.fontFamily = `'${font}', sans-serif`;
    }

    loadGoogleFont(font) {
        // Skip if it's the default font which is already loaded in CSS
        if (font === 'Inter') return;
        
        const fontLink = document.getElementById(`google-font-${font}`);
        if (!fontLink) {
            const link = document.createElement('link');
            link.id = `google-font-${font}`;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}&display=swap`;
            document.head.appendChild(link);
        }
    }

    applyFontSize(size) {
        document.documentElement.style.setProperty('--base-font-size', `${size}px`);
        document.body.style.fontSize = `${size}px`;
        
        // Update the displayed font size
        if (this.currentFontSizeEl) {
            this.currentFontSizeEl.textContent = `${size}px`;
        }
    }

    updateActiveOptions() {
        // Update active theme
        if (this.themeOptions) {
            this.themeOptions.forEach(option => {
                option.classList.toggle('active', option.dataset.theme === this.settings.theme);
            });
        }

        // Update active color scheme
        if (this.colorOptions) {
            this.colorOptions.forEach(option => {
                option.classList.toggle('active', option.dataset.colorScheme === this.settings.colorScheme);
            });
        }
    }

    updateFontSelectValue() {
        if (this.fontSelect) {
            this.fontSelect.value = this.settings.font;
        }
    }

    exportData() {
        try {
            // Collect all data from localStorage
            const exportData = {
                settings: this.settings,
                tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
                habits: JSON.parse(localStorage.getItem('habits') || '[]'),
                dailyLogEntries: JSON.parse(localStorage.getItem('dailyLogEntries') || '[]'),
                goals: JSON.parse(localStorage.getItem('goals') || '[]')
            };
            
            // Convert to JSON string
            const dataStr = JSON.stringify(exportData, null, 2);
            
            // Create a download link
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `bullet-bytes-backup-${new Date().toISOString().slice(0, 10)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            alert('Data exported successfully!');
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data. Please try again.');
        }
    }

    importData() {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validate the imported data structure
                    if (!importedData.settings) {
                        throw new Error('Invalid data format');
                    }
                    
                    // Confirm before overwriting
                    if (confirm('This will overwrite your current data. Continue?')) {
                        // Store each data type in localStorage
                        localStorage.setItem('bulletBytesSettings', JSON.stringify(importedData.settings));
                        localStorage.setItem('tasks', JSON.stringify(importedData.tasks || []));
                        localStorage.setItem('habits', JSON.stringify(importedData.habits || []));
                        localStorage.setItem('dailyLogEntries', JSON.stringify(importedData.dailyLogEntries || []));
                        localStorage.setItem('goals', JSON.stringify(importedData.goals || []));
                        
                        // Apply the imported settings
                        this.loadSettings();
                        this.applySettings();
                        
                        alert('Data imported successfully! Refreshing page...');
                        setTimeout(() => window.location.reload(), 1000);
                    }
                } catch (error) {
                    console.error('Error importing data:', error);
                    alert('Failed to import data. The file may be corrupted or in an invalid format.');
                }
            };
            reader.readAsText(file);
        });
        
        fileInput.click();
    }

    clearData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
            if (confirm('FINAL WARNING: All your tasks, habits, logs, and settings will be permanently deleted. Continue?')) {
                // Clear all app data except for user authentication
                localStorage.removeItem('tasks');
                localStorage.removeItem('habits');
                localStorage.removeItem('dailyLogEntries');
                localStorage.removeItem('goals');
                localStorage.removeItem('bulletBytesSettings');
                
                alert('All data has been cleared. Refreshing page...');
                setTimeout(() => window.location.reload(), 1000);
            }
        }
    }
}

// Initialize the Settings Manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const settingsManager = new SettingsManager();
});