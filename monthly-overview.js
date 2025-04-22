// Monthly Overview Management System

class MonthlyOverviewManager {
    constructor() {
        this.calendar = null;
        this.calendarEl = document.getElementById('calendar');
        this.selectedDateEl = document.getElementById('selectedDate');
        this.dayPreviewContentEl = document.getElementById('dayPreviewContent');
        this.todayBtn = document.getElementById('todayBtn');
        this.showTasksBtn = document.getElementById('showTasksBtn');
        this.showHabitsBtn = document.getElementById('showHabitsBtn');
        this.showEventsBtn = document.getElementById('showEventsBtn');
        this.showAllBtn = document.getElementById('showAllBtn');
        
        this.displayFilters = {
            tasks: true,
            habits: true,
            events: true
        };
        
        this.initializeCalendar();
        this.setupEventListeners();
        this.loadData();
    }

    initializeCalendar() {
        if (!this.calendarEl) return;

        this.calendar = new FullCalendar.Calendar(this.calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            selectable: true,
            select: info => this.handleDateSelect(info),
            eventClick: info => this.handleEventClick(info),
            eventDidMount: info => this.customizeEventDisplay(info),
            dayCellDidMount: info => this.customizeDayCell(info),
            events: [] // Will be populated with data
        });

        this.calendar.render();
        
        // Apply theme
        const theme = localStorage.getItem('theme') || 'light';
        this.calendarEl.classList.toggle('fc-theme-dark', theme === 'dark');
        this.calendarEl.classList.toggle('fc-theme-light', theme === 'light');
    }

    setupEventListeners() {
        // Today button
        if (this.todayBtn) {
            this.todayBtn.addEventListener('click', () => {
                this.calendar.today();
                this.updateDayPreview(new Date());
            });
        }

        // Filter buttons
        if (this.showTasksBtn) {
            this.showTasksBtn.addEventListener('click', () => {
                this.toggleFilter('tasks');
                this.toggleActiveClass(this.showTasksBtn);
            });
        }

        if (this.showHabitsBtn) {
            this.showHabitsBtn.addEventListener('click', () => {
                this.toggleFilter('habits');
                this.toggleActiveClass(this.showHabitsBtn);
            });
        }

        if (this.showEventsBtn) {
            this.showEventsBtn.addEventListener('click', () => {
                this.toggleFilter('events');
                this.toggleActiveClass(this.showEventsBtn);
            });
        }

        if (this.showAllBtn) {
            this.showAllBtn.addEventListener('click', () => {
                this.displayFilters = {
                    tasks: true,
                    habits: true,
                    events: true
                };
                this.refreshCalendarEvents();
                
                // Update active state of all buttons
                [this.showTasksBtn, this.showHabitsBtn, this.showEventsBtn].forEach(btn => {
                    btn.classList.add('active');
                });
                this.showAllBtn.classList.add('active');
            });
        }

        // Listen for theme changes
        window.addEventListener('themechange', (e) => {
            if (this.calendarEl) {
                this.calendarEl.classList.toggle('fc-theme-dark', e.detail.theme === 'dark');
                this.calendarEl.classList.toggle('fc-theme-light', e.detail.theme === 'light');
            }
        });
    }

    toggleFilter(type) {
        this.displayFilters[type] = !this.displayFilters[type];
        this.refreshCalendarEvents();
    }

    toggleActiveClass(button) {
        button.classList.toggle('active');
    }

    loadData() {
        // Load tasks
        const tasks = this.getTasksFromLocalStorage();
        
        // Load habits
        const habits = this.getHabitsFromLocalStorage();
        
        // Load daily log entries
        const logEntries = this.getDailyLogEntriesFromLocalStorage();
        
        // Combine all data into calendar events
        this.updateCalendarEvents(tasks, habits, logEntries);
        
        // Update day preview for today
        this.updateDayPreview(new Date());
    }

    getTasksFromLocalStorage() {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    }

    getHabitsFromLocalStorage() {
        const savedHabits = localStorage.getItem('habits');
        return savedHabits ? JSON.parse(savedHabits) : [];
    }

    getDailyLogEntriesFromLocalStorage() {
        const savedEntries = localStorage.getItem('dailyLogEntries');
        return savedEntries ? JSON.parse(savedEntries) : [];
    }

    updateCalendarEvents(tasks, habits, logEntries) {
        if (!this.calendar) return;
        
        // Remove all existing events
        this.calendar.removeAllEvents();
        
        // Add tasks as events
        if (this.displayFilters.tasks) {
            tasks.forEach(task => {
                this.calendar.addEvent({
                    id: `task-${task.id}`,
                    title: task.content,
                    start: new Date(task.dueDate),
                    allDay: true,
                    backgroundColor: task.completed ? '#27AE60' : '#3498DB',
                    borderColor: task.completed ? '#27AE60' : '#3498DB',
                    extendedProps: {
                        type: 'task',
                        completed: task.completed
                    }
                });
            });
        }
        
        // Add habits as events
        if (this.displayFilters.habits) {
            habits.forEach(habit => {
                // For each completion date of the habit
                if (habit.completionHistory && habit.completionHistory.length > 0) {
                    habit.completionHistory.forEach(dateStr => {
                        this.calendar.addEvent({
                            id: `habit-${habit.id}-${dateStr}`,
                            title: habit.name,
                            start: new Date(dateStr),
                            allDay: true,
                            backgroundColor: '#E74C3C',
                            borderColor: '#E74C3C',
                            extendedProps: {
                                type: 'habit'
                            }
                        });
                    });
                }
            });
        }
        
        // Add log entries as events
        if (this.displayFilters.events) {
            logEntries.forEach(entry => {
                if (entry.type === 'event') {
                    this.calendar.addEvent({
                        id: `event-${entry.id}`,
                        title: entry.content,
                        start: new Date(entry.date),
                        allDay: true,
                        backgroundColor: '#9B59B6',
                        borderColor: '#9B59B6',
                        extendedProps: {
                            type: 'event'
                        }
                    });
                }
            });
        }
    }

    refreshCalendarEvents() {
        const tasks = this.getTasksFromLocalStorage();
        const habits = this.getHabitsFromLocalStorage();
        const logEntries = this.getDailyLogEntriesFromLocalStorage();
        
        this.updateCalendarEvents(tasks, habits, logEntries);
    }

    handleDateSelect(info) {
        const selectedDate = info.start;
        this.updateDayPreview(selectedDate);
    }

    handleEventClick(info) {
        const eventDate = info.event.start;
        this.updateDayPreview(eventDate);
    }

    customizeEventDisplay(info) {
        // Add custom styling or icons based on event type
        const eventType = info.event.extendedProps.type;
        const eventEl = info.el;
        
        if (eventType === 'task') {
            const isCompleted = info.event.extendedProps.completed;
            if (isCompleted) {
                eventEl.style.textDecoration = 'line-through';
            }
        }
    }

    customizeDayCell(info) {
        // Add custom styling to day cells based on data
        const date = info.date;
        const dateStr = date.toISOString().split('T')[0];
        
        // Check if there are tasks due on this date
        const tasks = this.getTasksFromLocalStorage();
        const hasTasks = tasks.some(task => {
            const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
            return taskDate === dateStr;
        });
        
        // Check if there are habits tracked on this date
        const habits = this.getHabitsFromLocalStorage();
        const hasHabits = habits.some(habit => {
            return habit.completionHistory && habit.completionHistory.includes(dateStr);
        });
        
        // Check if there are events on this date
        const logEntries = this.getDailyLogEntriesFromLocalStorage();
        const hasEvents = logEntries.some(entry => {
            const entryDate = new Date(entry.date).toISOString().split('T')[0];
            return entryDate === dateStr && entry.type === 'event';
        });
        
        // Add indicators
        if (hasTasks || hasHabits || hasEvents) {
            const indicators = document.createElement('div');
            indicators.className = 'day-indicators';
            
            if (hasTasks) {
                const taskDot = document.createElement('span');
                taskDot.className = 'indicator task-indicator';
                indicators.appendChild(taskDot);
            }
            
            if (hasHabits) {
                const habitDot = document.createElement('span');
                habitDot.className = 'indicator habit-indicator';
                indicators.appendChild(habitDot);
            }
            
            if (hasEvents) {
                const eventDot = document.createElement('span');
                eventDot.className = 'indicator event-indicator';
                indicators.appendChild(eventDot);
            }
            
            info.el.querySelector('.fc-daygrid-day-top').appendChild(indicators);
        }
    }

    updateDayPreview(date) {
        if (!this.selectedDateEl || !this.dayPreviewContentEl) return;
        
        // Format and display the selected date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.selectedDateEl.textContent = date.toLocaleDateString('en-US', options);
        
        // Clear previous content
        this.dayPreviewContentEl.innerHTML = '';
        
        // Get the date string for comparison
        const dateStr = date.toISOString().split('T')[0];
        
        // Get tasks for this date
        const tasks = this.getTasksFromLocalStorage();
        const dateTasks = tasks.filter(task => {
            const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
            return taskDate === dateStr;
        });
        
        // Get habits tracked on this date
        const habits = this.getHabitsFromLocalStorage();
        const dateHabits = habits.filter(habit => {
            return habit.completionHistory && habit.completionHistory.includes(dateStr);
        });
        
        // Get log entries for this date
        const logEntries = this.getDailyLogEntriesFromLocalStorage();
        const dateEntries = logEntries.filter(entry => {
            const entryDate = new Date(entry.date).toISOString().split('T')[0];
            return entryDate === dateStr;
        });
        
        // Create sections for each type of content
        if (dateTasks.length > 0) {
            this.createPreviewSection('Tasks', dateTasks, 'task');
        }
        
        if (dateHabits.length > 0) {
            this.createPreviewSection('Habits', dateHabits, 'habit');
        }
        
        if (dateEntries.length > 0) {
            // Group entries by type
            const notes = dateEntries.filter(entry => entry.type === 'note');
            const events = dateEntries.filter(entry => entry.type === 'event');
            
            if (notes.length > 0) {
                this.createPreviewSection('Notes', notes, 'note');
            }
            
            if (events.length > 0) {
                this.createPreviewSection('Events', events, 'event');
            }
        }
        
        // If no content, show a message
        if (this.dayPreviewContentEl.children.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-day-message';
            emptyMessage.textContent = 'No entries for this day. Add some from the Daily Log!';
            this.dayPreviewContentEl.appendChild(emptyMessage);
        }
    }

    createPreviewSection(title, items, type) {
        const section = document.createElement('div');
        section.className = 'preview-section';
        
        const sectionTitle = document.createElement('h4');
        sectionTitle.textContent = title;
        section.appendChild(sectionTitle);
        
        const itemsList = document.createElement('ul');
        itemsList.className = 'preview-items';
        
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = `preview-item ${type}-item`;
            
            // Different display based on item type
            switch(type) {
                case 'task':
                    listItem.innerHTML = `
                        <span class="${item.completed ? 'completed' : ''}">
                            <i class="fas ${item.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                            ${item.content}
                        </span>
                    `;
                    break;
                case 'habit':
                    listItem.innerHTML = `
                        <span>
                            <i class="fas fa-chart-line"></i>
                            ${item.name}
                        </span>
                    `;
                    break;
                case 'note':
                    listItem.innerHTML = `
                        <span>
                            <i class="fas fa-sticky-note"></i>
                            ${item.content}
                        </span>
                    `;
                    break;
                case 'event':
                    listItem.innerHTML = `
                        <span>
                            <i class="fas fa-calendar-day"></i>
                            ${item.content}
                        </span>
                    `;
                    break;
            }
            
            itemsList.appendChild(listItem);
        });
        
        section.appendChild(itemsList);
        this.dayPreviewContentEl.appendChild(section);
    }
}

// Initialize the Monthly Overview Manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const monthlyOverviewManager = new MonthlyOverviewManager();
});