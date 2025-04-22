// Calendar integration for habit tracking
const calendarEl = document.createElement('div');
calendarEl.id = 'calendar';

// Initialize FullCalendar
document.addEventListener('DOMContentLoaded', function() {
    // Create calendar container
    const habitsGrid = document.querySelector('.habits-grid');
    habitsGrid.appendChild(calendarEl);

    // Initialize the calendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        selectable: true,
        events: [], // Will be populated with habit events
        select: function(info) {
            // Handle date selection for habit tracking
            const habitName = prompt('Enter habit name:');
            if (habitName) {
                calendar.addEvent({
                    title: habitName,
                    start: info.start,
                    end: info.end,
                    allDay: true,
                    color: '#6366f1' // Using primary color from CSS
                });
                // TODO: Save to backend/API
            }
            calendar.unselect();
        },
        eventClick: function(info) {
            // Handle clicking on existing habits
            if (confirm(`Delete habit: ${info.event.title}?`)) {
                info.event.remove();
                // TODO: Delete from backend/API
            }
        }
    });

    calendar.render();
});

// Function to sync with external calendar API (e.g., Google Calendar)
async function syncWithCalendarAPI() {
    try {
        // TODO: Implement API integration
        // Example structure for Google Calendar API integration:
        /*
        const response = await gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime'
        });
        const events = response.result.items;
        // Add events to calendar
        events.forEach(event => {
            calendar.addEvent({
                title: event.summary,
                start: event.start.dateTime || event.start.date,
                end: event.end.dateTime || event.end.date,
            });
        });
        */
    } catch (error) {
        console.error('Error syncing with calendar API:', error);
    }
}