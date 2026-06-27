# SpendWise — Personal Expense Tracker

SpendWise is a responsive, premium, and interactive Personal Expense Tracker web application built using only vanilla **HTML5**, **CSS3 (Custom Properties & HSL)**, and **JavaScript (ES6+)**. No external frameworks or libraries are used.

![SpendWise Screenshot Placeholder](C:/Users/Shivam/.gemini/antigravity/brain/4c54026f-6538-43e3-817e-0c742a994604/light_mode_screenshot.png)

---

## 🌟 Key Features

### 1. Form Visual Feedback
* Toggling between **Income** and **Expense** updates the form styling instantly.
* Action buttons change color dynamically (Green for Income; Rose-Red for Expense) and update text labels ("Add Income", "Save Expense").
* Text placeholders update contextually (e.g. `e.g. Monthly Salary` vs `e.g. Grocery Shop`).
* The form card gets a top border highlight matching the selection type.

### 2. Contextual Categories
* **Expense Categories**: Food, Transport, Shopping, Bills, Entertainment, Education, Other.
* **Income Categories**: Salary, Freelance, Business, Investments, Other.
* The Category selection dropdown dynamically updates its options on the fly depending on the selected transaction type.

### 3. Dashboard Statistics
* **Total Balance**: Displays net positive (Green left border) or net negative (Red left border) balance.
* **Total Income**: Sums up all income transactions.
* **Total Expenses**: Sums up all expense transactions.

### 4. Interactive Transaction Feed
* **Search**: Real-time title search (case-insensitive).
* **Category Filters**: Filter transactions by category.
* **Type Tabs**: Filter by All, Income, or Expense.
* **Actions**: Edit or delete transactions with instant calculation updates.

### 5. Monthly Insights
* Displays total expense for the current month.
* Generates a category-wise breakdown list with spending values and percentage progress bars.

### 6. CSV Exporter
* Export your entire transaction ledger to a clean, formatted CSV file with the click of a button.

### 7. Dark/Light Mode
* Modern theme toggle button.
* Smooth layout transition using HSL color variables.
* Persists the user's theme selection across page loads.

### 8. Data Persistence
* Automatically saves all transaction records and user settings (theme) in browser **Local Storage**.

---

## 📂 File Structure

* `index.html` - Semantic markup, loading Inter Google Font and custom inline SVGs.
* `style.css` - Custom design system, typography styling, dark theme HSL overrides, CSS transitions, responsive grid/flex layouts, and animations.
* `script.js` - Global state handling, dynamic DOM updating, calculations, input validation, Local Storage sync, and CSV formatting.

---

## 🚀 How to Run

1. **Directly in Browser**:
   Double click the `index.html` file to open it in any modern browser.

2. **Using VS Code Live Server (Recommended)**:
   * Open the project directory `gcff` in VS Code.
   * Click **Go Live** on the bottom status bar to run the server on `http://127.0.0.1:5500/index.html`.
   * The page will hot-reload automatically when files are modified.
