document.addEventListener('DOMContentLoaded', () => {
  const expense = document.getElementById('expense-form');
  const monthSelect = document.getElementById('month');
  const yearSelect = document.getElementById('year');
  const amountInput = document.getElementById('amount');
  const expenseChart = document.getElementById('expense-chart');

  // Generate year options dynamically
  for (let year = 2025; year <= 2040; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  // Initialize expenses object with categories
  const expenses = {
    January: { Housing: 0, Food: 0, Transportation: 0, Bills: 0, Miscellaneous: 0 },
    February: { Housing: 0, Food: 0, Transportation: 0, Bills: 0, Miscellaneous: 0 },
    March: { Housing: 0, Food: 0, Transportation: 0, Bills: 0, Miscellaneous: 0 },
    April: { Housing: 0, Food: 0, Transportation: 0, Bills: 0, Miscellaneous: 0 },
    May: { Housing: 0, Food: 0, Transportation: 0, Bills: 0, Miscellaneous: 0 },
    June: { Housing: 0, Food: 0, Transportation: 0, Bills: 0, Miscellaneous: 0 },
    July: { Housing: 0, Food: 0, Transportation: 0, Bills: 0, Miscellaneous: 0 },
    August: { Housing: 0, Food: 0, Transportation: 0, Bills: 0, Miscellaneous: 0 },
    September: { Housing: 0, Food: 0, Transportation: 0, Bills: 0, Miscellaneous: 0 },
    October: { Housing: 0, Food: 0, Transportation: 0, Bills: 0, Miscellaneous: 0 },
    November: { Housing: 0, Food: 0, Transportation: 0, Bills: 0, Miscellaneous: 0 },
    December: { Housing: 0, Food: 0, Transportation: 0, Bills: 0, Miscellaneous: 0 },
  };

  // Set default month and year based on current month and year
  function setDefaultMonthYear() {
    const now = new Date();
    const initialMonth = now.toLocaleString('default', { month: 'long' });
    const initialYear = now.getFullYear();
    monthSelect.value = initialMonth;
    yearSelect.value = initialYear;
  }

  setDefaultMonthYear();
});
