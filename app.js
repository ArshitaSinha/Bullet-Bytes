// Task and Habit Management System

// Task Class Definition
class Task {
    constructor(id, content, completed = false, dueDate = null) {
        this.id = id;
        this.content = content;
        this.completed = completed;
        this.dueDate = dueDate;
    }
}

// Habit Class Definition
class Habit {
    constructor(id, name, frequency = 'daily', streak = 0) {
        this.id = id;
        this.name = name;
        this.frequency = frequency;
        this.streak = streak;
        this.completedDates = [];
    }
}

// Task Manager
class TaskManager {
    constructor() {
        this.tasks = [];
        this.taskInput = document.querySelector('.task-input');
        this.addButton = document.querySelector('.add-btn');
        this.taskList = document.getElementById('taskList');
        this.setupEventListeners();
        this.loadTasks();
    }

    setupEventListeners() {
        if (this.addButton) {
            this.addButton.addEventListener('click', () => this.addTask());
        }
        if (this.taskInput) {
            this.taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTask();
            });
        }

        // Filter button event listeners
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.filterTasks(button.textContent);
            });
        });
    }

    addTask() {
        const content = this.taskInput.value.trim();
        if (content) {
            const task = new Task(Date.now(), content, false, new Date());
            this.tasks.push(task);
            this.renderTask(task);
            this.saveTasks();
            this.taskInput.value = '';
        }
    }

    renderTask(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.dataset.id = task.id;
        taskElement.draggable = true;

        taskElement.innerHTML = `
            <h3>${task.content}</h3>
            <p class="task-date">${new Date(task.dueDate).toLocaleDateString()}</p>
            <div class="task-actions">
                <div class="action-buttons">
                    <button class="action-btn complete-btn" title="${task.completed ? 'Mark Incomplete' : 'Mark Complete'}">
                        <i class="fas ${task.completed ? 'fa-times' : 'fa-check'}"></i>
                    </button>
                    <button class="action-btn edit-btn" title="Edit Task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        if (task.completed) {
            taskElement.classList.add('completed');
        }

        // Add event listeners
        const completeBtn = taskElement.querySelector('.complete-btn');
        const deleteBtn = taskElement.querySelector('.delete-btn');
        const editBtn = taskElement.querySelector('.edit-btn');

        completeBtn.addEventListener('click', () => this.toggleTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        editBtn.addEventListener('click', () => this.editTask(task.id));

        // Add drag and drop functionality
        this.setupDragAndDrop(taskElement);

        this.taskList.appendChild(taskElement);
    }

    setupDragAndDrop(taskElement) {
        taskElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', taskElement.dataset.id);
            taskElement.classList.add('dragging');
        });

        taskElement.addEventListener('dragend', () => {
            taskElement.classList.remove('dragging');
        });

        this.taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingElement = document.querySelector('.dragging');
            const closestTask = this.getDragAfterElement(this.taskList, e.clientY);
            
            if (closestTask) {
                this.taskList.insertBefore(draggingElement, closestTask);
            } else {
                this.taskList.appendChild(draggingElement);
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.refreshTasks();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.refreshTasks();
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const newContent = prompt('Edit task:', task.content);
            if (newContent !== null && newContent.trim() !== '') {
                task.content = newContent.trim();
                this.saveTasks();
                this.refreshTasks();
            }
        }
    }

    filterTasks(filter) {
        const taskElements = this.taskList.querySelectorAll('.task-card');
        taskElements.forEach(element => {
            const task = this.tasks.find(t => t.id === parseInt(element.dataset.id));
            if (task) {
                switch(filter.toLowerCase()) {
                    case 'completed':
                        element.style.display = task.completed ? 'block' : 'none';
                        break;
                    case 'today':
                        const isToday = new Date(task.dueDate).toDateString() === new Date().toDateString();
                        element.style.display = isToday ? 'block' : 'none';
                        break;
                    case 'upcoming':
                        const isUpcoming = new Date(task.dueDate) > new Date();
                        element.style.display = isUpcoming ? 'block' : 'none';
                        break;
                    default: // 'all'
                        element.style.display = 'block';
                }
            }
        });
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
            this.refreshTasks();
        }
    }

    refreshTasks() {
        if (this.taskList) {
            this.taskList.innerHTML = '';
            this.tasks.forEach(task => this.renderTask(task));
        }
    }
}

// Habit Manager
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

    addHabit() {
        const name = this.habitInput.value.trim();
        if (name) {
            const habit = new Habit(Date.now(), name);
            this.habits.push(habit);
            this.renderHabit(habit);
            this.saveHabits();
            this.habitInput.value = '';
        }
    }

    renderHabit(habit) {
        const habitElement = document.createElement('div');
        habitElement.className = 'task-card';
        habitElement.dataset.id = habit.id;

        habitElement.innerHTML = `
            <h3>${habit.name}</h3>
            <p>Streak: ${habit.streak} days</p>
            <div class="task-actions">
                <div class="action-buttons">
                    <button class="action-btn complete-btn" title="Mark Complete for Today">
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

    completeHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (habit) {
            const today = new Date().toDateString();
            if (!habit.completedDates.includes(today)) {
                habit.completedDates.push(today);
                habit.streak++;
                this.saveHabits();
                this.refreshHabits();
            }
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

// Initialize managers based on current page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('taskList')) {
        new TaskManager();
    }
    if (document.querySelector('.habits-grid')) {
        new HabitManager();
    }
});