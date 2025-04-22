// Mood tracking functionality
class MoodTracker {
    constructor() {
        this.currentDate = new Date();
        this.selectedMood = null;
        this.initializeElements();
        this.attachEventListeners();
        this.loadMoodData();
        this.updateDateDisplay();
        this.renderMoodHistory();
    }

    initializeElements() {
        this.moodButtons = document.querySelectorAll('.mood-btn');
        this.notesInput = document.querySelector('.notes-input');
        this.saveMoodBtn = document.querySelector('.save-mood-btn');
        this.prevDateBtn = document.querySelector('.date-nav:first-child');
        this.nextDateBtn = document.querySelector('.date-nav:last-child');
        this.currentDateDisplay = document.getElementById('currentDate');
        this.moodCalendar = document.getElementById('moodCalendar');
    }

    attachEventListeners() {
        // Mood button selection
        this.moodButtons.forEach(button => {
            button.addEventListener('click', () => this.selectMood(button));
        });

        // Save mood entry
        this.saveMoodBtn.addEventListener('click', () => this.saveMoodEntry());

        // Date navigation
        this.prevDateBtn.addEventListener('click', () => this.changeDate(-1));
        this.nextDateBtn.addEventListener('click', () => this.changeDate(1));

        // Load mood data for current date on page load
        this.loadMoodForCurrentDate();
    }

    selectMood(button) {
        // Remove selected class from all buttons
        this.moodButtons.forEach(btn => btn.classList.remove('selected'));
        // Add selected class to clicked button
        button.classList.add('selected');
        this.selectedMood = button.getAttribute('data-mood');
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    updateDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.currentDateDisplay.textContent = this.currentDate.toLocaleDateString(undefined, options);
    }

    changeDate(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
        this.updateDateDisplay();
        this.loadMoodForCurrentDate();
    }

    loadMoodData() {
        const storedData = localStorage.getItem('moodData');
        return storedData ? JSON.parse(storedData) : {};
    }

    saveMoodData(data) {
        localStorage.setItem('moodData', JSON.stringify(data));
    }

    loadMoodForCurrentDate() {
        const moodData = this.loadMoodData();
        const currentDateStr = this.formatDate(this.currentDate);
        const todaysMood = moodData[currentDateStr];

        // Reset UI
        this.moodButtons.forEach(btn => btn.classList.remove('selected'));
        this.notesInput.value = '';
        this.selectedMood = null;

        if (todaysMood) {
            // Restore mood selection
            const moodButton = Array.from(this.moodButtons)
                .find(btn => btn.getAttribute('data-mood') === todaysMood.mood);
            if (moodButton) {
                moodButton.classList.add('selected');
                this.selectedMood = todaysMood.mood;
            }
            // Restore notes
            this.notesInput.value = todaysMood.notes || '';
        }
    }

    saveMoodEntry() {
        if (!this.selectedMood) {
            alert('Please select a mood before saving!');
            return;
        }

        const moodData = this.loadMoodData();
        const currentDateStr = this.formatDate(this.currentDate);

        // Save mood and notes for current date
        moodData[currentDateStr] = {
            mood: this.selectedMood,
            notes: this.notesInput.value.trim(),
            timestamp: new Date().toISOString()
        };

        this.saveMoodData(moodData);
        this.renderMoodHistory(); // Update mood history display
        alert('Mood entry saved successfully!');
    }
}
    renderMoodHistory() 
    {
        if (!this.moodCalendar) return;
        
        const moodData = this.loadMoodData();
        this.moodCalendar.innerHTML = ''; // Clear existing content

        // Create calendar grid
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);

        // Create month header
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.textContent = today.toLocaleString('default', { month: 'long', year: 'numeric' });
        this.moodCalendar.appendChild(monthHeader);

        // Create weekday headers
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekdayHeader = document.createElement('div');
        weekdayHeader.className = 'weekday-header';
        weekdays.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'weekday';
            dayEl.textContent = day;
            weekdayHeader.appendChild(dayEl);
        });
        this.moodCalendar.appendChild(weekdayHeader);

        // Create calendar grid
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }

        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            const dateStr = this.formatDate(new Date(currentYear, currentMonth, day));
            const dayData = moodData[dateStr];

            if (dayData) {
                dayCell.classList.add('has-mood', dayData.mood);
                dayCell.title = `Mood: ${dayData.mood}${dayData.notes ? '\nNotes: ' + dayData.notes : ''}`;
            }

            const dayNumber = document.createElement('span');
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);

            if (day === today.getDate() && currentMonth === today.getMonth()) {
                dayCell.classList.add('today');
            }

            calendarGrid.appendChild(dayCell);
        }

        this.moodCalendar.appendChild(calendarGrid);
    }


// Initialize mood tracker when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MoodTracker();
});