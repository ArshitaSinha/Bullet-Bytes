// Goals Management System

class Goal {
    constructor(id, content, type, deadline = null) {
        this.id = id;
        this.content = content;
        this.type = type; // 'short-term' or 'long-term'
        this.completed = false;
        this.progress = 0; // 0-100
        this.createdAt = new Date();
        this.deadline = deadline;
        this.milestones = [];
    }

    addMilestone(milestone) {
        this.milestones.push({
            id: Date.now(),
            content: milestone,
            completed: false
        });
    }

    updateProgress() {
        if (this.milestones.length === 0) {
            this.progress = this.completed ? 100 : 0;
            return;
        }

        const completedMilestones = this.milestones.filter(m => m.completed).length;
        this.progress = Math.round((completedMilestones / this.milestones.length) * 100);
        this.completed = this.progress === 100;
    }
}

class GoalsManager {
    constructor() {
        this.goals = [];
        this.goalInput = document.getElementById('goalInput');
        this.goalTypeSelect = document.getElementById('goalTypeSelect');
        this.addGoalBtn = document.getElementById('addGoalBtn');
        this.goalsList = document.getElementById('goalsList');
        this.allGoalsBtn = document.getElementById('allGoalsBtn');
        this.shortTermBtn = document.getElementById('shortTermBtn');
        this.longTermBtn = document.getElementById('longTermBtn');
        this.shortTermProgress = document.getElementById('shortTermProgress');
        this.longTermProgress = document.getElementById('longTermProgress');
        this.overallProgress = document.getElementById('overallProgress');
        this.shortTermProgressValue = document.getElementById('shortTermProgressValue');
        this.longTermProgressValue = document.getElementById('longTermProgressValue');
        this.overallProgressValue = document.getElementById('overallProgressValue');
        
        this.currentFilter = 'all';
        
        this.setupEventListeners();
        this.loadGoals();
        this.renderGoals();
        this.updateProgressStats();
    }

    setupEventListeners() {
        // Add new goal
        if (this.addGoalBtn) {
            this.addGoalBtn.addEventListener('click', () => this.addGoal());
        }
        
        if (this.goalInput) {
            this.goalInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addGoal();
            });
        }

        // Filter buttons
        if (this.allGoalsBtn) {
            this.allGoalsBtn.addEventListener('click', () => {
                this.setActiveFilter('all');
                this.renderGoals();
            });
        }

        if (this.shortTermBtn) {
            this.shortTermBtn.addEventListener('click', () => {
                this.setActiveFilter('short-term');
                this.renderGoals();
            });
        }

        if (this.longTermBtn) {
            this.longTermBtn.addEventListener('click', () => {
                this.setActiveFilter('long-term');
                this.renderGoals();
            });
        }
    }

    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        [this.allGoalsBtn, this.shortTermBtn, this.longTermBtn].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        
        switch(filter) {
            case 'short-term':
                if (this.shortTermBtn) this.shortTermBtn.classList.add('active');
                break;
            case 'long-term':
                if (this.longTermBtn) this.longTermBtn.classList.add('active');
                break;
            default:
                if (this.allGoalsBtn) this.allGoalsBtn.classList.add('active');
        }
    }

    addGoal() {
        const content = this.goalInput.value.trim();
        const type = this.goalTypeSelect.value;
        
        if (content) {
            const goal = new Goal(
                Date.now(),
                content,
                type
            );
            
            this.goals.push(goal);
            this.saveGoals();
            this.renderGoals();
            this.updateProgressStats();
            this.goalInput.value = '';
        }
    }

    renderGoals() {
        if (!this.goalsList) return;
        
        // Clear current goals
        this.goalsList.innerHTML = '';
        
        // Filter goals based on current filter
        let filteredGoals = this.goals;
        if (this.currentFilter !== 'all') {
            filteredGoals = this.goals.filter(goal => goal.type === this.currentFilter);
        }
        
        // Render filtered goals
        if (filteredGoals.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-goals-message';
            emptyMessage.textContent = `No ${this.currentFilter === 'all' ? '' : this.currentFilter} goals found. Add some!`;
            this.goalsList.appendChild(emptyMessage);
            return;
        }
        
        filteredGoals.forEach(goal => this.renderGoal(goal));
    }

    renderGoal(goal) {
        const goalElement = document.createElement('div');
        goalElement.className = `goal-card ${goal.type}`;
        goalElement.dataset.id = goal.id;

        const deadlineStr = goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline';

        goalElement.innerHTML = `
            <div class="goal-header">
                <h3 class="${goal.completed ? 'completed' : ''}">${goal.content}</h3>
                <span class="goal-type">${goal.type === 'short-term' ? 'Short-term' : 'Long-term'}</span>
            </div>
            <div class="goal-progress">
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${goal.progress}%;"></div>
                </div>
                <span class="progress-value">${goal.progress}%</span>
            </div>
            <div class="goal-details">
                <span class="goal-deadline"><i class="fas fa-calendar-alt"></i> ${deadlineStr}</span>
                <div class="goal-actions">
                    <button class="action-btn milestone-btn" title="Add Milestone">
                        <i class="fas fa-flag"></i>
                    </button>
                    <button class="action-btn edit-btn" title="Edit Goal">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete Goal">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="action-btn complete-btn" title="${goal.completed ? 'Mark Incomplete' : 'Mark Complete'}">
                        <i class="fas ${goal.completed ? 'fa-times' : 'fa-check'}"></i>
                    </button>
                </div>
            </div>
        `;

        // Add milestones if they exist
        if (goal.milestones && goal.milestones.length > 0) {
            const milestonesContainer = document.createElement('div');
            milestonesContainer.className = 'milestones-container';
            
            const milestonesTitle = document.createElement('h4');
            milestonesTitle.textContent = 'Milestones';
            milestonesContainer.appendChild(milestonesTitle);
            
            const milestonesList = document.createElement('ul');
            milestonesList.className = 'milestones-list';
            
            goal.milestones.forEach(milestone => {
                const milestoneItem = document.createElement('li');
                milestoneItem.className = 'milestone-item';
                milestoneItem.dataset.id = milestone.id;
                
                milestoneItem.innerHTML = `
                    <div class="milestone-content ${milestone.completed ? 'completed' : ''}">
                        <input type="checkbox" class="milestone-checkbox" ${milestone.completed ? 'checked' : ''}>
                        <span>${milestone.content}</span>
                    </div>
                    <button class="milestone-delete-btn"><i class="fas fa-times"></i></button>
                `;
                
                // Add event listener for milestone checkbox
                const checkbox = milestoneItem.querySelector('.milestone-checkbox');
                checkbox.addEventListener('change', () => {
                    this.toggleMilestone(goal.id, milestone.id);
                });
                
                // Add event listener for milestone delete button
                const deleteBtn = milestoneItem.querySelector('.milestone-delete-btn');
                deleteBtn.addEventListener('click', () => {
                    this.deleteMilestone(goal.id, milestone.id);
                });
                
                milestonesList.appendChild(milestoneItem);
            });
            
            milestonesContainer.appendChild(milestonesList);
            goalElement.appendChild(milestonesContainer);
        }

        // Add event listeners
        const completeBtn = goalElement.querySelector('.complete-btn');
        const deleteBtn = goalElement.querySelector('.delete-btn');
        const editBtn = goalElement.querySelector('.edit-btn');
        const milestoneBtn = goalElement.querySelector('.milestone-btn');

        completeBtn.addEventListener('click', () => this.toggleGoalComplete(goal.id));
        deleteBtn.addEventListener('click', () => this.deleteGoal(goal.id));
        editBtn.addEventListener('click', () => this.editGoal(goal.id));
        milestoneBtn.addEventListener('click', () => this.addMilestone(goal.id));

        this.goalsList.appendChild(goalElement);
    }

    toggleGoalComplete(id) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            goal.progress = goal.completed ? 100 : 0;
            this.saveGoals();
            this.renderGoals();
            this.updateProgressStats();
        }
    }

    deleteGoal(id) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(g => g.id !== id);
            this.saveGoals();
            this.renderGoals();
            this.updateProgressStats();
        }
    }

    editGoal(id) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            const newContent = prompt('Edit goal:', goal.content);
            if (newContent !== null && newContent.trim() !== '') {
                goal.content = newContent.trim();
                
                // Optionally update deadline
                const updateDeadline = confirm('Do you want to update the deadline?');
                if (updateDeadline) {
                    const deadlineStr = prompt('Enter deadline (YYYY-MM-DD):', 
                        goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
                    
                    if (deadlineStr && deadlineStr.trim() !== '') {
                        goal.deadline = new Date(deadlineStr);
                    } else {
                        goal.deadline = null;
                    }
                }
                
                this.saveGoals();
                this.renderGoals();
            }
        }
    }

    addMilestone(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            const milestoneContent = prompt('Enter milestone:');
            if (milestoneContent && milestoneContent.trim() !== '') {
                goal.addMilestone(milestoneContent.trim());
                goal.updateProgress();
                this.saveGoals();
                this.renderGoals();
                this.updateProgressStats();
            }
        }
    }

    toggleMilestone(goalId, milestoneId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            const milestone = goal.milestones.find(m => m.id === milestoneId);
            if (milestone) {
                milestone.completed = !milestone.completed;
                goal.updateProgress();
                this.saveGoals();
                this.renderGoals();
                this.updateProgressStats();
            }
        }
    }

    deleteMilestone(goalId, milestoneId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.milestones = goal.milestones.filter(m => m.id !== milestoneId);
            goal.updateProgress();
            this.saveGoals();
            this.renderGoals();
            this.updateProgressStats();
        }
    }

    updateProgressStats() {
        // Calculate progress for short-term goals
        const shortTermGoals = this.goals.filter(g => g.type === 'short-term');
        const shortTermProgress = shortTermGoals.length > 0 ?
            Math.round(shortTermGoals.reduce((sum, goal) => sum + goal.progress, 0) / shortTermGoals.length) : 0;
        
        // Calculate progress for long-term goals
        const longTermGoals = this.goals.filter(g => g.type === 'long-term');
        const longTermProgress = longTermGoals.length > 0 ?
            Math.round(longTermGoals.reduce((sum, goal) => sum + goal.progress, 0) / longTermGoals.length) : 0;
        
        // Calculate overall progress
        const overallProgress = this.goals.length > 0 ?
            Math.round(this.goals.reduce((sum, goal) => sum + goal.progress, 0) / this.goals.length) : 0;
        
        // Update progress bars
        if (this.shortTermProgress) {
            this.shortTermProgress.style.width = `${shortTermProgress}%`;
            this.shortTermProgressValue.textContent = `${shortTermProgress}%`;
        }
        
        if (this.longTermProgress) {
            this.longTermProgress.style.width = `${longTermProgress}%`;
            this.longTermProgressValue.textContent = `${longTermProgress}%`;
        }
        
        if (this.overallProgress) {
            this.overallProgress.style.width = `${overallProgress}%`;
            this.overallProgressValue.textContent = `${overallProgress}%`;
        }
    }

    loadGoals() {
        const savedGoals = localStorage.getItem('goals');
        if (savedGoals) {
            this.goals = JSON.parse(savedGoals);
            
            // Convert string dates back to Date objects
            this.goals.forEach(goal => {
                if (goal.deadline) goal.deadline = new Date(goal.deadline);
                goal.createdAt = new Date(goal.createdAt);
            });
        }
    }

    saveGoals() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }
}

// Initialize the Goals Manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const goalsManager = new GoalsManager();
});