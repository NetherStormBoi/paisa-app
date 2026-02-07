// --- 1. THE STATE (Our Data) ---

// Try to get data from browser storage
// We use 'paisaData' for budgets to keep your existing settings
let budgets = JSON.parse(localStorage.getItem('paisaData')) || [
    { id: 1, name: "Food", budget: 500, spent: 0 },
    { id: 2, name: "Rent", budget: 1000, spent: 0 },
    { id: 3, name: "Fun", budget: 200, spent: 0 }
];

// We use 'paisaExpenses' for the new history log
let expenses = JSON.parse(localStorage.getItem('paisaExpenses')) || [];

// --- HELPER: Unified Save Function ---
function saveData() {
    localStorage.setItem('paisaData', JSON.stringify(budgets));
    localStorage.setItem('paisaExpenses', JSON.stringify(expenses));
}

// --- 2. THE ELEMENTS (HTML hooks) ---
const newCatName = document.getElementById("new-cat-name");
const newCatBudget = document.getElementById("new-cat-budget");
const createBtn = document.getElementById("create-btn");
const dashboard = document.getElementById("dashboard");
const categorySelect = document.getElementById("category-select");
const addBtn = document.getElementById("add-btn");
const amountInput = document.getElementById("amount-input"); // Defined globally to avoid errors

// --- 3. THE RENDER (The Artist) ---
function renderApp() {
    // A. Reset the HTML (Wipe the canvas)
    dashboard.innerHTML = "";
    categorySelect.innerHTML = "";

    // B. Calculate Totals
    const totalBudget = budgets.reduce((sum, item) => sum + item.budget, 0);
    const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
    const totalPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // C. Update the Total Summary UI
    document.getElementById("total-math").innerText = `$${totalSpent} / $${totalBudget}`;
    document.getElementById("total-fill").style.width = `${Math.min(totalPercent, 100)}%`;

    // Change background color based on status
    const summaryCard = document.getElementById("total-summary");
    if (totalSpent > totalBudget) {
        summaryCard.style.backgroundColor = "#e74c3c"; // Danger Red
    } else {
        summaryCard.style.backgroundColor = "#2c3e50"; // Original Dark Blue/Black
    }

    // D. Loop through data to create cards
    budgets.forEach(category => {
        // Calculate the math
        const remaining = category.budget - category.spent;
        const percentage = (category.spent / category.budget) * 100;
        
        // Create the HTML Card
        const card = `
            <div class="card">
                <div class="card-header">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        ${category.name}
                        <button onclick="editBudget('${category.name}')" style="background:none; color:#3498db; padding:0; margin-left:10px; font-size:0.8rem; cursor:pointer;">Edit Limit</button>
                        <button onclick="deleteCategory(${category.id})" style="background:none; color:red; border:none; padding:0; font-size:1.2rem; cursor:pointer;">&times;</button>
                    </span>
                    <span>$${category.spent} / $${category.budget}</span>
                </div>
                <div class="progress-bar" style="margin-bottom: 8px;">
                    ${category.spent > category.budget 
                        ? `<div class="overfill" style="width: ${Math.min(percentage, 100)}%"></div>` 
                        : `<div class="fill" style="width: ${percentage}%"></div>`
                    }
                </div>
                <small>${category.spent > category.budget ? `Exceeded by $${Math.abs(remaining)}` : `Left: $${remaining}`}</small>
            </div>
        `;
        dashboard.innerHTML += card;

        // Add option to the dropdown menu
        const option = document.createElement("option");
        option.value = category.name; // We use Name for the value to make finding it easier
        option.innerText = category.name;
        categorySelect.appendChild(option);
    });
}

// --- 4. HISTORY VIEW LOGIC ---
function showView(view) {
    const main = document.getElementById('main-view');
    const history = document.getElementById('history-view');
    
    if (view === 'main') {
        main.style.display = 'block';
        history.style.display = 'none';
    } else {
        main.style.display = 'none';
        history.style.display = 'block';
        renderHistory(); 
    }
}

function renderHistory() {
    const container = document.getElementById('history-list');
    container.innerHTML = expenses.length === 0 ? '<p style="color:white; text-align:center;">No expenses yet.</p>' : '';

    expenses.forEach(item => {
        container.innerHTML += `
            <div class="card" style="margin-bottom: 10px; border-left: 5px solid #27ae60;">
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                    <span>${item.category}</span>
                    <span>$${item.amount}</span>
                </div>
                <div style="font-size: 0.8rem; color: #7f8c8d; margin-top: 5px;">
                    ${item.date} — <em>"${item.note}"</em>
                </div>
            </div>
        `;
    });
}

// --- 5. ADD EXPENSE LOGIC ---
addBtn.addEventListener("click", () => {
    // A. Get values from the inputs
    const amount = parseFloat(amountInput.value);
    const categoryName = document.getElementById('category-select').value;

    // B. Validation
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount!");
        return; 
    }

    // C. Find the correct envelope by Name
    const cat = budgets.find(b => b.name === categoryName);

    // D. Update the Data
    if (cat) {
        const note = prompt("Add a note for this expense (optional):") || "No note";

        // 1. Update the category total
        cat.spent += amount;

        // 2. Add to history log
        const newEntry = {
            id: Date.now(),
            category: categoryName,
            amount: amount,
            note: note,
            date: new Date().toLocaleDateString()
        };
        expenses.unshift(newEntry); // Add to the TOP of the list

        saveData();
        renderApp();
        
        // Clear the input
        amountInput.value = "";
    } else {
        alert("Please select a category first!");
    }
});

// --- 6. CREATE NEW BUDGET ---
createBtn.addEventListener("click", () => {
    const name = newCatName.value;
    const limit = Number(newCatBudget.value);

    if (name === "" || limit <= 0) {
        alert("Please enter a name and a limit!");
        return;
    }

    const newCategory = {
        id: Date.now(),
        name: name,
        budget: limit,
        spent: 0
    };

    budgets.push(newCategory);
    saveData();
    renderApp();

    newCatName.value = "";
    newCatBudget.value = "";
});

// --- 7. EDIT & DELETE ACTIONS ---

// Edit Budget Limit
window.editBudget = (name) => {
    const category = budgets.find(b => b.name === name);
    
    if (category) {
        const newLimit = prompt(`Enter new monthly limit for ${name}:`, category.budget);

        if (newLimit !== null && newLimit !== "") {
            const parsedLimit = parseFloat(newLimit);

            if (!isNaN(parsedLimit) && parsedLimit > 0) {
                category.budget = parsedLimit;
                saveData();
                renderApp();
            } else {
                alert("Please enter a valid number!");
            }
        }
    }
}

// Delete Category
window.deleteCategory = (id) => {
    if (confirm("Delete this category permanently?")) {
        budgets = budgets.filter(item => item.id !== id);
        saveData();
        renderApp();
    }
};

// Reset All Data (New Month)
document.getElementById("reset-btn").addEventListener("click", () => {
    if (!confirm("Start a new month? This will erase all spending.")) {
        return;
    }

    // Reset budgets to default (or empty if you prefer)
    budgets = [
        { id: 1, name: "Food", budget: 500, spent: 0 },
        { id: 2, name: "Rent", budget: 1000, spent: 0 },
        { id: 3, name: "Fun", budget: 200, spent: 0 }
    ];
    
    // Optional: Clear history too? Uncomment next line if you want to clear history on reset
    expenses = []; 

    saveData();
    renderApp();
});

// --- 8. INITIAL START ---
renderApp();