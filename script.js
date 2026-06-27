/**
 * SpendWise - Personal Expense Tracker Script
 * Handles state management, UI rendering, calculations, local storage,
 * and advanced features like search, category/type filters, editing, and CSV exports.
 */

// --- 1. Global Application State ---
let transactions = [];
let editId = null; // Tracks the transaction being edited

// Predefined category lists
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Education', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investments', 'Other'];

// --- 2. DOM Elements Selection ---
const themeToggleBtn = document.getElementById('themeToggleBtn');
const moonIcon = themeToggleBtn.querySelector('.moon-icon');
const sunIcon = themeToggleBtn.querySelector('.sun-icon');

const transactionForm = document.getElementById('transactionForm');
const formTitle = document.getElementById('formTitle');
const editBadge = document.getElementById('editBadge');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Form Input Elements
const typeExpense = document.getElementById('typeExpense');
const typeIncome = document.getElementById('typeIncome');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');

// Form Errors
const titleError = document.getElementById('titleError');
const amountError = document.getElementById('amountError');
const categoryError = document.getElementById('categoryError');
const dateError = document.getElementById('dateError');

// Summary Cards Elements
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');

// Filters & Search
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const tabButtons = document.querySelectorAll('.tab-btn');
let activeTypeFilter = 'all'; // Can be 'all', 'income', or 'expense'

// Transaction List & Feed
const transactionListEl = document.getElementById('transactionList');
const emptyStateEl = document.getElementById('emptyState');
const exportCsvBtn = document.getElementById('exportCsvBtn');

// Monthly Insights
const currentMonthYearEl = document.getElementById('currentMonthYear');
const monthlyTotalExpenseEl = document.getElementById('monthlyTotalExpense');
const categoryBreakdownListEl = document.getElementById('categoryBreakdownList');

// --- 3. Initial Setup & Event Listeners ---
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSpendWise);
} else {
  initSpendWise();
}

function initSpendWise() {
  initTheme();
  setDefaultDate();
  loadData();
  renderApp();
  setupEventListeners();
  updateFormUiForType();
}

// Setup Event Listeners
function setupEventListeners() {
  // Theme Toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Form Submission
  transactionForm.addEventListener('submit', handleFormSubmit);

  // Cancel Editing
  cancelEditBtn.addEventListener('click', exitEditMode);

  // Search Input (Real-time)
  searchInput.addEventListener('input', renderTransactionsFeed);

  // Category Filter
  categoryFilter.addEventListener('change', renderTransactionsFeed);

  // Type Filter Tabs
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeTypeFilter = e.currentTarget.getAttribute('data-type');
      renderTransactionsFeed();
    });
  });

  // Export CSV Action
  exportCsvBtn.addEventListener('click', exportToCSV);

  // Transaction Type switchers
  typeExpense.addEventListener('change', updateFormUiForType);
  typeIncome.addEventListener('change', updateFormUiForType);

  // Real-time error clearing on typing/changing
  titleInput.addEventListener('input', () => validateField(titleInput, titleError, () => titleInput.value.trim() !== ''));
  amountInput.addEventListener('input', () => validateField(amountInput, amountError, () => {
    const val = parseFloat(amountInput.value);
    return !isNaN(val) && val > 0;
  }));
  categoryInput.addEventListener('change', () => validateField(categoryInput, categoryError, () => categoryInput.value !== ''));
  dateInput.addEventListener('input', () => validateField(dateInput, dateError, () => dateInput.value !== ''));
}

// Updates form buttons, headers, and category options dynamically based on selected transaction type
function updateFormUiForType() {
  const formCard = document.getElementById('formCard');
  if (!formCard) return;

  const currentCategoryVal = categoryInput.value;

  // Clear all options except the placeholder
  categoryInput.innerHTML = '<option value="" disabled selected>Select category</option>';

  let categoriesToUse = [];

  if (typeIncome.checked) {
    formCard.classList.remove('form-expense');
    formCard.classList.add('form-income');
    submitBtn.classList.remove('btn-expense-submit');
    submitBtn.classList.add('btn-income-submit');
    submitBtn.textContent = editId ? 'Save Income' : 'Add Income';
    categoriesToUse = INCOME_CATEGORIES;
  } else {
    formCard.classList.remove('form-income');
    formCard.classList.add('form-expense');
    submitBtn.classList.remove('btn-income-submit');
    submitBtn.classList.add('btn-expense-submit');
    submitBtn.textContent = editId ? 'Save Expense' : 'Add Expense';
    categoriesToUse = EXPENSE_CATEGORIES;
  }

  // Populate new options
  categoriesToUse.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryInput.appendChild(opt);
  });

  // Restore previous selection if it is valid for the new type
  if (categoriesToUse.includes(currentCategoryVal)) {
    categoryInput.value = currentCategoryVal;
  }
}

// --- 4. Theme Management (Dark / Light Mode) ---
function initTheme() {
  const savedTheme = localStorage.getItem('spendwise-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('spendwise-theme', 'light');
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('spendwise-theme', 'dark');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  }
}

// Set form date default value to today
function setDefaultDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0
  let dd = today.getDate();

  if (mm < 10) mm = '0' + mm;
  if (dd < 10) dd = '0' + dd;

  dateInput.value = `${yyyy}-${mm}-${dd}`;
}

// --- 5. Data Loading & Persistence ---
function loadData() {
  const storedTransactions = localStorage.getItem('spendwise-transactions');
  if (storedTransactions) {
    transactions = JSON.parse(storedTransactions);
  } else {
    // Generate beautiful initial mock data if first time using SpendWise
    const today = new Date();
    const formatDate = (daysOffset) => {
      const d = new Date();
      d.setDate(today.getDate() - daysOffset);
      const yyyy = d.getFullYear();
      let mm = d.getMonth() + 1;
      let dd = d.getDate();
      if (mm < 10) mm = '0' + mm;
      if (dd < 10) dd = '0' + dd;
      return `${yyyy}-${mm}-${dd}`;
    };

    transactions = [
      {
        id: 'mock-1',
        title: 'Monthly Salary Payment',
        type: 'income',
        amount: 3200.00,
        category: 'Salary',
        date: formatDate(3)
      },
      {
        id: 'mock-2',
        title: 'Whole Foods Grocery',
        type: 'expense',
        amount: 142.50,
        category: 'Food',
        date: formatDate(2)
      },
      {
        id: 'mock-3',
        title: 'Metro Transit Pass',
        type: 'expense',
        amount: 45.00,
        category: 'Transport',
        date: formatDate(1)
      },
      {
        id: 'mock-4',
        title: 'Online Coursera Course',
        type: 'expense',
        amount: 89.00,
        category: 'Education',
        date: formatDate(0)
      },
      {
        id: 'mock-5',
        title: 'Starbucks Coffee',
        type: 'expense',
        amount: 12.80,
        category: 'Food',
        date: formatDate(0)
      }
    ];
    saveData();
  }
}

function saveData() {
  localStorage.setItem('spendwise-transactions', JSON.stringify(transactions));
}

// --- 6. Form Operations & Validation ---

// Validates a single input and adds/removes error styling
function validateField(inputEl, errorEl, validationFn) {
  const isValid = validationFn();
  const formGroup = inputEl.closest('.form-group');
  if (isValid) {
    formGroup.classList.remove('invalid');
  } else {
    formGroup.classList.add('invalid');
  }
  return isValid;
}

// Handles submitting both additions and edits
function handleFormSubmit(e) {
  e.preventDefault();

  // Validate form fields
  const isTitleValid = validateField(titleInput, titleError, () => titleInput.value.trim() !== '');
  
  const isAmountValid = validateField(amountInput, amountError, () => {
    const val = parseFloat(amountInput.value);
    return !isNaN(val) && val > 0;
  });
  
  const isCategoryValid = validateField(categoryInput, categoryError, () => categoryInput.value !== '');
  
  const isDateValid = validateField(dateInput, dateError, () => dateInput.value !== '');

  if (!isTitleValid || !isAmountValid || !isCategoryValid || !isDateValid) {
    return; // Block submission if any field is invalid
  }

  // Extract form values
  const title = titleInput.value.trim();
  const type = typeExpense.checked ? 'expense' : 'income';
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (editId) {
    // Edit mode: Update existing transaction
    const index = transactions.findIndex(t => t.id === editId);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], title, type, amount, category, date };
    }
    exitEditMode();
  } else {
    // Add mode: Create new transaction
    const newTransaction = {
      id: Date.now().toString(),
      title,
      type,
      amount,
      category,
      date
    };
    transactions.unshift(newTransaction); // Insert at the beginning of list
  }

  saveData();
  resetForm();
  renderApp();
}

// Resets input values & clears error outlines
function resetForm() {
  transactionForm.reset();
  setDefaultDate();
  
  // Clear any validation marks
  document.querySelectorAll('.form-group').forEach(grp => {
    grp.classList.remove('invalid');
  });
  
  // Ensure default radio buttons match state
  typeExpense.checked = true;
  updateFormUiForType();
}

// Switches form into editing mode for a transaction
function enterEditMode(id) {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  editId = id;

  // Visual cues
  formTitle.textContent = 'Edit Transaction';
  editBadge.classList.remove('hidden');
  submitBtn.textContent = 'Save Changes';
  cancelEditBtn.classList.remove('hidden');

  // Fill input fields
  titleInput.value = transaction.title;
  amountInput.value = transaction.amount;
  categoryInput.value = transaction.category;
  dateInput.value = transaction.date;

  if (transaction.type === 'income') {
    typeIncome.checked = true;
  } else {
    typeExpense.checked = true;
  }

  updateFormUiForType();

  // Smooth scroll to the form card for mobile devices
  document.getElementById('formCard').scrollIntoView({ behavior: 'smooth' });
}

// Safely exits edit mode and cleans form
function exitEditMode() {
  editId = null;
  formTitle.textContent = 'Add Transaction';
  editBadge.classList.add('hidden');
  submitBtn.textContent = 'Add Transaction';
  cancelEditBtn.classList.add('hidden');
  resetForm();
}

// Deletes transaction by ID
function deleteTransaction(id) {
  // If deleting the item currently in edit mode, exit edit mode first
  if (editId === id) {
    exitEditMode();
  }

  transactions = transactions.filter(t => t.id !== id);
  saveData();
  renderApp();
}

// --- 7. Utility Calculations ---

// Format numbers as standard currency string ($1,234.56)
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Parses a date string and returns a formatted date (e.g. "Jun 24, 2026")
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr + 'T00:00:00'); // Prevent UTC shift issues
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// --- 8. UI Rendering Modules ---

// Coordinates the refresh of all UI segments
function renderApp() {
  renderSummaryCards();
  renderTransactionsFeed();
  renderMonthlyInsights();
}

// Calculates and updates the Total Balance, Income, and Expense panels
function renderSummaryCards() {
  let incomeTotal = 0;
  let expenseTotal = 0;

  transactions.forEach(t => {
    if (t.type === 'income') {
      incomeTotal += t.amount;
    } else {
      expenseTotal += t.amount;
    }
  });

  const balanceTotal = incomeTotal - expenseTotal;

  // Format values
  totalIncomeEl.textContent = formatCurrency(incomeTotal);
  totalExpenseEl.textContent = formatCurrency(expenseTotal);
  totalBalanceEl.textContent = formatCurrency(balanceTotal);

  // Style balance card border based on net positive/negative balance
  const balanceCard = totalBalanceEl.closest('.stat-card');
  if (balanceTotal >= 0) {
    balanceCard.style.borderLeft = '4px solid var(--income)';
  } else {
    balanceCard.style.borderLeft = '4px solid var(--expense)';
  }
}

// Filters, sorts, and draws the primary transaction list
function renderTransactionsFeed() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;
  
  // Apply Search, Type, and Category Filters
  const filtered = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesType = activeTypeFilter === 'all' || t.type === activeTypeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Sort by date descending (newest first), fallback to ID if dates are same
  filtered.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateB - dateA !== 0) {
      return dateB - dateA;
    }
    return b.id.localeCompare(a.id);
  });

  // Clear list
  transactionListEl.innerHTML = '';

  if (filtered.length === 0) {
    emptyStateEl.classList.remove('hidden');
    transactionListEl.classList.add('hidden');
    return;
  }

  emptyStateEl.classList.add('hidden');
  transactionListEl.classList.remove('hidden');

  filtered.forEach(t => {
    const li = document.createElement('li');
    li.className = `transaction-item ${t.type}`;

    // Get specific category class slug for styling badge
    const catClass = `cat-${t.category.toLowerCase()}`;

    // Inline SVG Icon for visual type (Income Arrow Up / Expense Arrow Down)
    const iconSvg = t.type === 'income' 
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    const prefix = t.type === 'income' ? '+' : '-';
    
    li.innerHTML = `
      <div class="item-badge-indicator" title="${t.type}">
        ${iconSvg}
      </div>
      <div class="item-details">
        <span class="item-title">${escapeHTML(t.title)}</span>
        <div class="item-meta">
          <span class="category-badge ${catClass}">${t.category}</span>
          <span class="item-date">${formatDisplayDate(t.date)}</span>
        </div>
      </div>
      <div class="item-amount">
        ${prefix}${formatCurrency(t.amount)}
      </div>
      <div class="item-actions">
        <button class="action-btn btn-edit" title="Edit transaction" onclick="enterEditMode('${t.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="action-btn btn-delete" title="Delete transaction" onclick="deleteTransaction('${t.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;

    transactionListEl.appendChild(li);
  });
}

// Calculates and renders Monthly Insights card (Expenses for Current Month & Category Breakdown)
function renderMonthlyInsights() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  // Format month name header
  const monthName = today.toLocaleString('en-US', { month: 'long' });
  currentMonthYearEl.textContent = `${monthName} ${currentYear}`;

  // Filter only current month's expenses
  const monthlyExpenses = transactions.filter(t => {
    if (t.type !== 'expense') return false;
    const tDate = new Date(t.date + 'T00:00:00');
    return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
  });

  const totalMonthlyExpense = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
  monthlyTotalExpenseEl.textContent = formatCurrency(totalMonthlyExpense);

  categoryBreakdownListEl.innerHTML = '';

  if (monthlyExpenses.length === 0) {
    categoryBreakdownListEl.innerHTML = `<div class="empty-state-small">No expenses registered for this month.</div>`;
    return;
  }

  // Calculate expense groupings per category
  const breakdown = {};
  EXPENSE_CATEGORIES.forEach(cat => breakdown[cat] = 0);

  monthlyExpenses.forEach(t => {
    if (breakdown[t.category] !== undefined) {
      breakdown[t.category] += t.amount;
    } else {
      breakdown['Other'] += t.amount;
    }
  });

  // Sort categories by expenditure value descending
  const sortedCategories = Object.keys(breakdown)
    .map(cat => ({ name: cat, amount: breakdown[cat] }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  sortedCategories.forEach(item => {
    const percentage = totalMonthlyExpense > 0 
      ? Math.round((item.amount / totalMonthlyExpense) * 100) 
      : 0;

    const catItem = document.createElement('div');
    catItem.className = 'category-breakdown-item';
    
    // Pick the CSS color variable according to category
    const colorVar = `var(--cat-${item.name.toLowerCase()})`;

    catItem.innerHTML = `
      <div class="category-breakdown-info">
        <span class="text-secondary">${item.name} (${percentage}%)</span>
        <span class="font-bold">${formatCurrency(item.amount)}</span>
      </div>
      <div class="category-breakdown-bar-bg">
        <div class="category-breakdown-bar-fill" style="width: ${percentage}%; background-color: ${colorVar};"></div>
      </div>
    `;

    categoryBreakdownListEl.appendChild(catItem);
  });
}

// --- 9. Export to CSV Utility ---
function exportToCSV() {
  if (transactions.length === 0) {
    alert("No transactions found to export.");
    return;
  }

  // CSV Headers
  const csvRows = [
    ['ID', 'Title', 'Type', 'Category', 'Amount', 'Date']
  ];

  // Map transactions to rows, sorting them newest first (same as user feed layout)
  const sortedForExport = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  sortedForExport.forEach(t => {
    // Clean string fields to prevent CSV breaking issues
    const cleanTitle = t.title.replace(/"/g, '""');
    csvRows.push([
      t.id,
      `"${cleanTitle}"`,
      t.type,
      t.category,
      t.amount.toFixed(2),
      t.date
    ]);
  });

  // Join array elements to CSV format
  const csvContent = "data:text/csv;charset=utf-8," 
    + csvRows.map(e => e.join(",")).join("\n");

  // Create temporary link element to trigger the download prompt
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `spendwise_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link); // Required for Firefox compatibility
  
  link.click();
  document.body.removeChild(link);
}

// --- 10. Sanitizer Helper ---
// Escapes HTML tags to prevent XSS vulnerability issues from transaction inputs
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
