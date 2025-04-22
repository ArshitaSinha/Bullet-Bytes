class FinanceManager {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.initializeEventListeners();
        this.renderTransactions();
        this.updateBalances();
        this.setupChart();
    }

    addTransaction(transaction) {
        this.transactions.push({
            ...transaction,
            id: Date.now(),
            date: new Date().toLocaleDateString()
        });
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
        this.renderTransactions();
        this.updateBalances();
        this.updateChart();
    }

    calculateTotalIncome() {
        return this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    }

    calculateTotalExpense() {
        return this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    }

    updateBalances() {
        document.getElementById('totalIncome').textContent = 
            `$${this.calculateTotalIncome().toFixed(2)}`;
        document.getElementById('totalExpense').textContent = 
            `$${this.calculateTotalExpense().toFixed(2)}`;
        document.getElementById('netBalance').textContent = 
            `$${(this.calculateTotalIncome() - this.calculateTotalExpense()).toFixed(2)}`;
    }

    renderTransactions(filter = 'all') {
        const filteredTransactions = this.transactions.filter(t => filter === 'all' || t.type === filter);
        const tbody = document.querySelector('#transactionTable tbody');
        tbody.innerHTML = filteredTransactions.map(transaction => `
            <tr>
                <td>${transaction.date}</td>
                <td class="${transaction.type}">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
                <td>${transaction.description}</td>
                <td class="amount">$${parseFloat(transaction.amount).toFixed(2)}</td>
            </tr>
        `).join('');
    }

    initializeEventListeners() {
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction({
                type: document.getElementById('transactionType').value,
                amount: document.getElementById('amount').value,
                description: document.getElementById('description').value
            });
            e.target.reset();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderTransactions(e.target.dataset.filter);
            });
        });
    }

    setupChart() {
        const ctx = document.getElementById('financeChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [{
                    data: [this.calculateTotalIncome(), this.calculateTotalExpense()],
                    backgroundColor: ['#4CAF50', '#F44336']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: {
                        display: true,
                        text: 'Income vs Expense Distribution'
                    }
                }
            }
        });
    }

    updateChart() {
        this.chart.data.datasets[0].data = [
            this.calculateTotalIncome(),
            this.calculateTotalExpense()
        ];
        this.chart.update();
    }
}

// Initialize finance manager when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    new FinanceManager();
});