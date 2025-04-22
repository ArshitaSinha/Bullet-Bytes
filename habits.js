// Habit Management System

class Habit {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.completed = false;
        this.lastCompletedDate = null;
        this.streak = 0;
        this.completionHistory = [];
        this.calendarEventId = null;
    }
}

class HabitManager {
    constructor() {
        this.habits = [];
        this.habitInput = document.querySelector('.task-input');
        this.addButton = document.querySelector('.add-btn');
        this.habitsGrid = document.querySelector('.habits-grid');
        this.setupEventListeners();
        this.loadHabits();
    }

    setupEventListeners() {
        if (this.addButton) {
            this.addButton.addEventListener('click', () => this.addHabit());
        }
        if (this.habitInput) {
            this.habitInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addHabit();
            });
        }
    }

    async addHabit() {
        const name = this.habitInput.value.trim();
        if (name) {
            try {
                const habit = new Habit(Date.now(), name);
                const response = await fetch(`${this.apiUrl}/habits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...habit, userId: this.userId })
                });
                if (!response.ok) throw new Error('Failed to create habit');
                const savedHabit = await response.json();
                this.habits.push(savedHabit);
                this.renderHabit(savedHabit);
                this.habitInput.value = '';
            } catch (error) {
                console.error('Error adding habit:', error);
                alert('Failed to add habit. Please try again.');
            }
        }
    }

    renderHabit(habit) {
        const habitElement = document.createElement('div');
        habitElement.className = 'task-card';
        habitElement.dataset.id = habit.id;

        habitElement.innerHTML = `
            <div class="habit-content">
                <div class="habit-info">
                    <h3>${habit.name}</h3>
                    <div class="streak-count">
                        <i class="fas fa-fire"></i>
                        <span>${habit.streak} day${habit.streak !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <div class="action-buttons">
                        <button class="action-btn complete-btn ${habit.completed ? 'completed' : ''}" title="${habit.completed ? 'Completed' : 'Mark Complete'}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-btn edit-btn" title="Edit Habit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Delete Habit">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const completeBtn = habitElement.querySelector('.complete-btn');
        const deleteBtn = habitElement.querySelector('.delete-btn');
        const editBtn = habitElement.querySelector('.edit-btn');

        completeBtn.addEventListener('click', () => this.completeHabit(habit.id));
        deleteBtn.addEventListener('click', () => this.deleteHabit(habit.id));
        editBtn.addEventListener('click', () => this.editHabit(habit.id));

        this.habitsGrid.appendChild(habitElement);
    }

    updateStreak(habit) {
        const today = new Date().toISOString().split('T')[0];
        
        if (habit.completed) {
            // Add today to completion history if not already present
            if (!habit.completionHistory.includes(today)) {
                habit.completionHistory.push(today);
                
                // Sort completion history to ensure chronological order
                habit.completionHistory.sort();
                
                // Get the most recent completion date before today
                const lastCompletionIndex = habit.completionHistory.indexOf(today) - 1;
                const lastCompletionDate = lastCompletionIndex >= 0 ? habit.completionHistory[lastCompletionIndex] : null;
                
                if (!lastCompletionDate) {
                    // First completion
                    habit.streak = 1;
                } else {
                    // Check if the last completion was yesterday
                    const lastDate = new Date(lastCompletionDate);
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
                        // Maintain streak
                        habit.streak++;
                    } else {
                        // Break in streak, reset to 1
                        habit.streak = 1;
                    }
                }
            }
        } else {
            // Remove today from completion history if present
            const todayIndex = habit.completionHistory.indexOf(today);
            if (todayIndex !== -1) {
                habit.completionHistory.splice(todayIndex, 1);
                
                // Recalculate streak based on remaining completion history
                if (habit.completionHistory.length === 0) {
                    habit.streak = 0;
                } else {
                    // Sort remaining dates
                    habit.completionHistory.sort();
                    let currentStreak = 1;
                    let maxStreak = 1;
                    
                    // Calculate current streak from the most recent completions
                    for (let i = habit.completionHistory.length - 1; i > 0; i--) {
                        const currentDate = new Date(habit.completionHistory[i]);
                        const previousDate = new Date(habit.completionHistory[i - 1]);
                        const dayDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
                        
                        if (dayDiff === 1) {
                            currentStreak++;
                            maxStreak = Math.max(maxStreak, currentStreak);
                        } else {
                            break;
                        }
                    }
                    habit.streak = maxStreak;
                }
            }
        }
    }

    getPreviousDay(dateString) {
        const date = new Date(dateString);
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    }

    completeHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (habit) {
            habit.completed = !habit.completed;
            const today = new Date();
            habit.lastCompletedDate = habit.completed ? today.toISOString() : null;
            this.updateStreak(habit);
            
            // Update calendar event
            const calendar = document.querySelector('#calendar')._calendar;
            if (calendar) {
                if (habit.completed) {
                    const event = calendar.addEvent({
                        title: habit.name,
                        start: today,
                        allDay: true,
                        color: '#4CAF50'
                    });
                    habit.calendarEventId = event.id;
                } else if (habit.calendarEventId) {
                    const event = calendar.getEventById(habit.calendarEventId);
                    if (event) event.remove();
                    habit.calendarEventId = null;
                }
            }
            
            this.saveHabits();
            this.refreshHabits();
        }
    }

    deleteHabit(habitId) {
        this.habits = this.habits.filter(h => h.id !== habitId);
        this.saveHabits();
        this.refreshHabits();
    }

    editHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (habit) {
            const newName = prompt('Edit habit name:', habit.name);
            if (newName !== null && newName.trim() !== '') {
                habit.name = newName.trim();
                this.saveHabits();
                this.refreshHabits();
            }
        }
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    loadHabits() {
        const savedHabits = localStorage.getItem('habits');
        if (savedHabits) {
            this.habits = JSON.parse(savedHabits);
            this.refreshHabits();
        }
    }

    refreshHabits() {
        if (this.habitsGrid) {
            this.habitsGrid.innerHTML = '';
            this.habits.forEach(habit => this.renderHabit(habit));
        }
    }
}

// Initialize HabitManager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.habits-grid')) {
        const manager = new HabitManager();
        
        // Initialize calendar after HabitManager
        const calendarEl = document.createElement('div');
        calendarEl.id = 'calendar';
        document.querySelector('.habits-grid').appendChild(calendarEl);
        
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            events: manager.habits
                .filter(h => h.completed)
                .map(h => ({
                    id: h.calendarEventId,
                    title: h.name,
                    start: new Date(h.lastCompletedDate),
                    allDay: true,
                    color: '#4CAF50'
                }))
        });
        
        calendar.render();
        calendarEl._calendar = calendar;
    }
});