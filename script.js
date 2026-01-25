document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const expenseForm = document.getElementById('expense-form');
  const monthSelect = document.getElementById('month');
  const yearSelect = document.getElementById('year');
  const amountInput = document.getElementById('amount');
  const descriptionInput = document.getElementById('description');
  const dateInput = document.getElementById('date');
  const expenseChart = document.getElementById('expense-chart');
  const themeToggle = document.getElementById('theme-toggle');
  const incomeInput = document.getElementById('income-input');
  const setIncomeBtn = document.getElementById('set-income-btn');
  const incomeDisplay = document.getElementById('income-display');
  const balanceDisplay = document.getElementById('balance-display');
  const budgetProgress = document.getElementById('budget-progress');
  const budgetPercentage = document.getElementById('budget-percentage');
  const totalExpensesEl = document.getElementById('total-expenses');
  const totalTransactionsEl = document.getElementById('total-transactions');
  const topCategoryEl = document.getElementById('top-category');
  const transactionsList = document.getElementById('transactions-list');
  const searchInput = document.getElementById('search-input');
  const filterCategory = document.getElementById('filter-category');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importFile = document.getElementById('import-file');

  let selectedMonth;
  let selectedYear;
  let myChart;
  let currentChartType = 'doughnut';

  // Category colors and icons
  const categoryConfig = {
    Housing: { color: '#FF6384', icon: '🏠' },
    Food: { color: '#36A2EB', icon: '🍔' },
    Transportation: { color: '#FFCE56', icon: '🚗' },
    Bills: { color: '#4BC0C0', icon: '💡' },
    Entertainment: { color: '#9966FF', icon: '🎬' },
    Healthcare: { color: '#FF9F40', icon: '⚕️' },
    Shopping: { color: '#FF6384', icon: '🛍️' },
    Education: { color: '#4CAF50', icon: '📚' },
    Miscellaneous: { color: '#C9CBCF', icon: '📦' },
  };

  // Initialize
  init();

  function init() {
    generateYearOptions();
    setDefaultMonthYear();
    setDefaultDate();
    loadTheme();
    loadData();
    setupEventListeners();
    setupTabs();
  }

  // Generate year options
  function generateYearOptions() {
    for (let year = 2020; year <= 2040; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }
  }

  // Set default month and year
  function setDefaultMonthYear() {
    const now = new Date();
    const initialMonth = now.toLocaleString('default', { month: 'long' });
    const initialYear = now.getFullYear();
    monthSelect.value = initialMonth;
    yearSelect.value = initialYear;
    selectedMonth = initialMonth;
    selectedYear = initialYear;
  }

  // Set default date to today
  function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // Setup event listeners
  function setupEventListeners() {
    expenseForm.addEventListener('submit', handleSubmit);
    monthSelect.addEventListener('change', handlePeriodChange);
    yearSelect.addEventListener('change', handlePeriodChange);
    themeToggle.addEventListener('click', toggleTheme);
    setIncomeBtn.addEventListener('click', setIncome);
    searchInput.addEventListener('input', filterTransactions);
    filterCategory.addEventListener('change', filterTransactions);
    clearAllBtn.addEventListener('click', clearAllTransactions);
    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importData);

    // Chart type buttons
    document.querySelectorAll('.chart-type-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.chart-type-btn').forEach((b) => b.classList.remove('active'));
        e.target.closest('.chart-type-btn').classList.add('active');
        currentChartType = e.target.closest('.chart-type-btn').dataset.type;
        updateChart();
      });
    });
  }

  // Setup tabs
  function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');
      });
    });
  }

  // Theme toggle
  function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    if (myChart) updateChart();
  }

  function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  // Get storage key
  function getStorageKey() {
    return `${selectedMonth}-${selectedYear}`;
  }

  // Load data
  function loadData() {
    selectedMonth = monthSelect.value;
    selectedYear = yearSelect.value;
    updateStats();
    renderTransactions();
    updateChart();
  }

  // Handle period change
  function handlePeriodChange() {
    loadData();
  }

  // Set income
  function setIncome() {
    const income = parseFloat(incomeInput.value);
    if (isNaN(income) || income < 0) {
      alert('Please enter a valid income amount');
      return;
    }
    const key = `income-${getStorageKey()}`;
    localStorage.setItem(key, income.toString());
    incomeInput.value = '';
    updateStats();
  }

  // Get income
  function getIncome() {
    const key = `income-${getStorageKey()}`;
    return parseFloat(localStorage.getItem(key)) || 0;
  }

  // Get transactions
  function getTransactions() {
    const key = `transactions-${getStorageKey()}`;
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  // Save transactions
  function saveTransactions(transactions) {
    const key = `transactions-${getStorageKey()}`;
    localStorage.setItem(key, JSON.stringify(transactions));
  }

  // Add transaction
  function handleSubmit(event) {
    event.preventDefault();

    const transaction = {
      id: Date.now(),
      description: descriptionInput.value,
      category: event.target.category.value,
      amount: parseFloat(amountInput.value),
      date: dateInput.value,
      timestamp: new Date().toISOString(),
    };

    const transactions = getTransactions();
    transactions.push(transaction);
    saveTransactions(transactions);

    // Reset form
    expenseForm.reset();
    setDefaultDate();

    // Update UI
    loadData();
    showNotification('Expense added successfully!');
  }

  // Update statistics
  function updateStats() {
    const transactions = getTransactions();
    const income = getIncome();
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const balance = income - totalExpenses;
    const percentage = income > 0 ? (totalExpenses / income) * 100 : 0;

    // Update displays
    incomeDisplay.textContent = `$${income.toFixed(2)}`;
    balanceDisplay.textContent = `$${balance.toFixed(2)}`;
    balanceDisplay.style.color = balance < 0 ? 'var(--danger)' : 'var(--success)';
    totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
    totalTransactionsEl.textContent = transactions.length;

    // Update progress bar
    budgetProgress.style.width = `${Math.min(percentage, 100)}%`;
    budgetProgress.style.backgroundColor = percentage > 90 ? 'var(--danger)' : percentage > 70 ? 'var(--warning)' : 'var(--success)';
    budgetPercentage.textContent = `${percentage.toFixed(1)}% spent`;

    // Find top category
    const categoryTotals = {};
    transactions.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    const topCategory = Object.keys(categoryTotals).reduce((a, b) => (categoryTotals[a] > categoryTotals[b] ? a : b), '-');
    topCategoryEl.textContent = topCategory !== '-' ? `${categoryConfig[topCategory]?.icon || ''} ${topCategory}` : '-';
  }

  // Render transactions
  function renderTransactions(filter = '') {
    const transactions = getTransactions();
    const categoryFilter = filterCategory.value;

    let filtered = transactions
      .filter((t) => {
        const matchesSearch = filter === '' || t.description.toLowerCase().includes(filter.toLowerCase()) || t.category.toLowerCase().includes(filter.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    transactionsList.innerHTML = '';

    if (filtered.length === 0) {
      transactionsList.innerHTML = '<p class="no-data">No transactions found. Add your first expense!</p>';
      return;
    }

    filtered.forEach((transaction) => {
      const item = document.createElement('div');
      item.className = 'transaction-item';
      item.innerHTML = `
        <div class="transaction-icon" style="background: ${categoryConfig[transaction.category]?.color}20">
          ${categoryConfig[transaction.category]?.icon || '📦'}
        </div>
        <div class="transaction-details">
          <h4>${transaction.description}</h4>
          <p>${transaction.category} • ${new Date(transaction.date).toLocaleDateString()}</p>
        </div>
        <div class="transaction-amount">
          $${transaction.amount.toFixed(2)}
        </div>
        <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
          <i class="fas fa-trash"></i>
        </button>
      `;
      transactionsList.appendChild(item);
    });
  }

  // Delete transaction
  window.deleteTransaction = function (id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    let transactions = getTransactions();
    transactions = transactions.filter((t) => t.id !== id);
    saveTransactions(transactions);
    loadData();
    showNotification('Transaction deleted');
  };

  // Filter transactions
  function filterTransactions() {
    renderTransactions(searchInput.value);
  }

  // Clear all transactions
  function clearAllTransactions() {
    if (!confirm('Are you sure you want to delete all transactions for this period? This cannot be undone!')) return;

    saveTransactions([]);
    loadData();
    showNotification('All transactions cleared');
  }

  // Update chart
  function updateChart() {
    const transactions = getTransactions();
    const categoryTotals = {};

    // Initialize all categories
    Object.keys(categoryConfig).forEach((cat) => {
      categoryTotals[cat] = 0;
    });

    // Calculate totals
    transactions.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    // Filter out zero values
    const labels = [];
    const data = [];
    const colors = [];

    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > 0) {
        labels.push(category);
        data.push(amount);
        colors.push(categoryConfig[category]?.color || '#C9CBCF');
      }
    });

    const ctx = expenseChart.getContext('2d');

    if (myChart) {
      myChart.destroy();
    }

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#e0e0e0' : '#333';

    myChart = new Chart(ctx, {
      type: currentChartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Expenses',
            data: data,
            backgroundColor: colors,
            borderColor: isDark ? '#1e1e1e' : '#fff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: textColor,
              padding: 15,
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
                return `${label}: $${value.toFixed(2)}`;
              },
            },
          },
        },
        scales:
          currentChartType !== 'doughnut'
            ? {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: textColor,
                    callback: function (value) {
                      return '$' + value.toFixed(0);
                    },
                  },
                  grid: {
                    color: isDark ? '#333' : '#e0e0e0',
                  },
                },
                x: {
                  ticks: { color: textColor },
                  grid: {
                    color: isDark ? '#333' : '#e0e0e0',
                  },
                },
              }
            : {},
      },
    });
  }

  // Export data
  function exportData() {
    const allData = {
      transactions: {},
      income: {},
      exportDate: new Date().toISOString(),
      version: '2.0',
    };

    // Export all months and years
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('transactions-') || key.startsWith('income-')) {
        allData[key.startsWith('transactions-') ? 'transactions' : 'income'][key] = JSON.parse(localStorage.getItem(key) || 'null');
      }
    }

    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!');
  }

  // Import data
  function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);

        if (!data.transactions || !data.income) {
          alert('Invalid data format');
          return;
        }

        if (!confirm('This will replace all existing data. Continue?')) return;

        // Clear existing data
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith('transactions-') || key.startsWith('income-')) {
            localStorage.removeItem(key);
          }
        });

        // Import new data
        Object.entries(data.transactions).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
        Object.entries(data.income).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });

        loadData();
        showNotification('Data imported successfully!');
      } catch (error) {
        alert('Error importing data: ' + error.message);
      }
    };
    reader.readAsText(file);
    importFile.value = '';
  }

  // Show notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
});
