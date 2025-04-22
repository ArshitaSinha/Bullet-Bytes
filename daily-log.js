// Daily Log Management System

class LogEntry {
    constructor(id, content, type, date, completed = false) {
        this.id = id;
        this.content = content;
        this.type = type; // 'task', 'note', 'event'
        this.date = date;
        this.completed = completed;
        this.createdAt = new Date();
    }
};

class DailyLogManager {
    constructor() {
        this.entries = [];
        this.currentDate = new Date();
        this.logEntryInput = document.getElementById('logEntryInput');
        this.entryTypeSelect = document.getElementById('entryTypeSelect');
        this.addLogEntryBtn = document.getElementById('addLogEntryBtn');
        this.logEntriesContainer = document.getElementById('logEntries');
        this.currentDateElement = document.getElementById('currentDate');
        this.prevDayBtn = document.getElementById('prevDay');
        this.nextDayBtn = document.getElementById('nextDay');
        this.migrateBtn = document.getElementById('migrateBtn');
        this.migrationDateInput = document.getElementById('migrationDate');
        
        this.setupEventListeners();
        this.loadEntries();
        this.updateDateDisplay();
    }

    setupEventListeners() {
        // Add new entry
        if (this.addLogEntryBtn) {
            this.addLogEntryBtn.addEventListener('click', () => this.addEntry());
        }
        
        if (this.logEntryInput) {
            this.logEntryInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addEntry();
            });
        }

        // Date navigation
        if (this.prevDayBtn) {
            this.prevDayBtn.addEventListener('click', () => {
                this.currentDate.setDate(this.currentDate.getDate() - 1);
                this.updateDateDisplay();
                this.renderEntries();
            });
        }

        if (this.nextDayBtn) {
            this.nextDayBtn.addEventListener('click', () => {
                this.currentDate.setDate(this.currentDate.getDate() + 1);
                this.updateDateDisplay();
                this.renderEntries();
            });
        }

        // Migration
        if (this.migrateBtn) {
            this.migrateBtn.addEventListener('click', () => this.migrateEntries());
        }

        // Set default migration date to tomorrow
        if (this.migrationDateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            this.migrationDateInput.valueAsDate = tomorrow;
        }
    }

    updateDateDisplay() {
        if (this.currentDateElement) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            this.currentDateElement.textContent = this.currentDate.toLocaleDateString('en-US', options);
        }
    }

    addEntry() {
        const content = this.logEntryInput.value.trim();
        const type = this.entryTypeSelect.value;
        
        if (content) {
            const entry = new LogEntry(
                Date.now(),
                content,
                type,
                new Date(this.currentDate)
            );
            
            this.entries.push(entry);
            this.renderEntry(entry);
            this.saveEntries();
            this.logEntryInput.value = '';
        }
    }

    renderEntries() {
        // Clear current entries
        this.logEntriesContainer.innerHTML = '';
        
        // Filter entries for current date
        const currentDateStr = this.currentDate.toDateString();
        const filteredEntries = this.entries.filter(entry => 
            new Date(entry.date).toDateString() === currentDateStr
        );
        
        // Render filtered entries
        filteredEntries.forEach(entry => this.renderEntry(entry));
    }

    renderEntry(entry) {
        const entryElement = document.createElement('div');
        entryElement.className = `log-entry ${entry.type}`;
        entryElement.dataset.id = entry.id;

        // Create icon based on entry type
        let icon;
        switch(entry.type) {
            case 'task':
                icon = 'fa-check-circle';
                break;
            case 'note':
                icon = 'fa-sticky-note';
                break;
            case 'event':
                icon = 'fa-calendar-day';
                break;
            default:
                icon = 'fa-circle';
        }

        entryElement.innerHTML = `
            <div class="entry-content ${entry.completed ? 'completed' : ''}">
                <i class="fas ${icon}"></i>
                <span class="entry-text">${entry.content}</span>
            </div>
            <div class="entry-actions">
                ${entry.type === 'task' ? `
                <button class="action-btn complete-btn" title="${entry.completed ? 'Mark Incomplete' : 'Mark Complete'}">
                    <i class="fas ${entry.completed ? 'fa-times' : 'fa-check'}"></i>
                </button>` : ''}
                <button class="action-btn edit-btn" title="Edit Entry">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete Entry">
                    <i class="fas fa-trash"></i>
                </button>
                <input type="checkbox" class="migrate-checkbox" title="Select for migration">
            </div>
        `;

        // Add event listeners
        const completeBtn = entryElement.querySelector('.complete-btn');
        const deleteBtn = entryElement.querySelector('.delete-btn');
        const editBtn = entryElement.querySelector('.edit-btn');

        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.toggleComplete(entry.id));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteEntry(entry.id));
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editEntry(entry.id));
        }

        this.logEntriesContainer.appendChild(entryElement);
    }

    toggleComplete(id) {
        const entry = this.entries.find(entry => entry.id === id);
        if (entry && entry.type === 'task') {
            entry.completed = !entry.completed;
            this.saveEntries();
            this.renderEntries();
        }
    }

    deleteEntry(id) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.entries = this.entries.filter(entry => entry.id !== id);
            this.saveEntries();
            this.renderEntries();
        }
    }

    editEntry(id) {
        const entry = this.entries.find(entry => entry.id === id);
        if (entry) {
            const newContent = prompt('Edit entry:', entry.content);
            if (newContent !== null && newContent.trim() !== '') {
                entry.content = newContent.trim();
                this.saveEntries();
                this.renderEntries();
            }
        }
    }

    migrateEntries() {
        const checkboxes = document.querySelectorAll('.migrate-checkbox:checked');
        if (checkboxes.length === 0) {
            alert('Please select entries to migrate');
            return;
        }

        const targetDate = this.migrationDateInput.valueAsDate;
        if (!targetDate) {
            alert('Please select a valid migration date');
            return;
        }

        // Migrate selected entries
        checkboxes.forEach(checkbox => {
            const entryElement = checkbox.closest('.log-entry');
            const id = parseInt(entryElement.dataset.id);
            const entry = this.entries.find(e => e.id === id);
            
            if (entry) {
                // Create a copy of the entry with new date and ID
                const migratedEntry = new LogEntry(
                    Date.now(),
                    entry.content,
                    entry.type,
                    new Date(targetDate),
                    entry.completed
                );
                
                this.entries.push(migratedEntry);
                
                // Mark original as completed if it's a task
                if (entry.type === 'task' && !entry.completed) {
                    entry.completed = true;
                }
            }
        });

        this.saveEntries();
        this.renderEntries();
        alert(`${checkboxes.length} entries migrated to ${targetDate.toLocaleDateString()}`);
    }

    loadEntries() {
        const savedEntries = localStorage.getItem('dailyLogEntries');
        if (savedEntries) {
            this.entries = JSON.parse(savedEntries).map(entry => {
                // Convert string dates back to Date objects
                entry.date = new Date(entry.date);
                entry.createdAt = new Date(entry.createdAt);
                return entry;
            });
            this.renderEntries();
        }
    }

    saveEntries() {
        localStorage.setItem('dailyLogEntries', JSON.stringify(this.entries));
    }
}

// Initialize the Daily Log Manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dailyLogManager = new DailyLogManager();
});