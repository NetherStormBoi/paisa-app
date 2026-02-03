// --- 1. THE STATE (Our Data) ---

/*
let budgets = [
    { id: 1, name: "Food", budget: 500, spent: 0 },
    { id: 2, name: "Rent", budget: 1000, spent: 0 },
    { id: 3, name: "Fun", budget: 200, spent: 0 }
];
*/

// Try to get data from browser storage
const savedData = localStorage.getItem("paisaData");

// If saved data exists, parse it. If not, use the default list.
let budgets = savedData ? JSON.parse(savedData) : [
    { id: 1, name: "Food", budget: 500, spent: 0 },
    { id: 2, name: "Rent", budget: 1000, spent: 0 },
    { id: 3, name: "Fun", budget: 200, spent: 0 }
];

// --- 2. THE ELEMENTS (HTML hooks) ---
const newCatName = document.getElementById("new-cat-name");
const newCatBudget = document.getElementById("new-cat-budget");
const createBtn = document.getElementById("create-btn");
const dashboard = document.getElementById("dashboard");
const categorySelect = document.getElementById("category-select");
const addBtn = document.getElementById("add-btn");
const amountInput = document.getElementById("amount-input");

// --- 3. THE RENDER (The Artist) ---
function renderApp() {
    // A. Reset the HTML (Wipe the canvas). We set it to an empty string, because every time we update the data (e.g., spent $5), we are going to redraw everything from scratch. If we didn't wipe it first, we would end up with double lists (Food, Rent, Fun, Food, Rent, Fun...).
    dashboard.innerHTML = "";
    categorySelect.innerHTML = "";

    // 2. NEW: Calculate Totals
    // .reduce(accumulator, currentItem)
    const totalBudget = budgets.reduce((sum, item) => sum + item.budget, 0); //sum: This is like a calculator's running total. It starts at 0 (the last number in the code). item: This is the current envelope the loop is holding. The Action: It adds the item.budget to the sum and passes it to the next item in the list. By the end of the loop, totalBudget holds the final sum of every single envelope.
    const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
    const totalPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // 3. NEW: Update the Total Summary UI
    document.getElementById("total-math").innerText = `$${totalSpent} / $${totalBudget}`;
    document.getElementById("total-fill").style.width = `${totalPercent}%`;

    // B. Loop through data to create cards
    budgets.forEach(category => {
        // Calculate the math
        const remaining = category.budget - category.spent;
        const percentage = (category.spent / category.budget) * 100;
        
        // Create the HTML Card
        /*
        const card = `
            <div class="card">
                <div class="card-header">
                    <span>${category.name}</span>
                    <span>$${category.spent} / $${category.budget}</span>
                </div>
                <div class="progress-bar">
                    <div class="fill" style="width: ${percentage}%"></div>
                </div>
                <small>Left: $${remaining}</small>
            </div>
        `;
        */

        // (Updated with Delete Button)
        const card = `
            <div class="card">
                <div class="card-header">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        ${category.name}
                        <button onclick="deleteCategory(${category.id})" style="background:none; color:red; border:none; padding:0; font-size:1.2rem; cursor:pointer;">&times;</button>
                    </span>
                    <span>$${category.spent} / $${category.budget}</span>
                </div>
                <div class="progress-bar">
                    <div class="fill" style="width: ${percentage}%"></div>
                </div>
                <small>Left: $${remaining}</small>
            </div>
        `;
        // (backtick ` (the one on ~ key) enables string interpolation (using ${variable}) and multi-line strings). in this case, we use ${...} to swap the variable category.name with the actual text eg "Food".
        dashboard.innerHTML += card;

        // Add option to the dropdown menu
        const option = document.createElement("option"); //Creates a fresh <option></option> tag in memory.
        option.value = category.id;
        option.innerText = category.name;
        categorySelect.appendChild(option); //Physically inserts this option into the <select> dropdown box.
    });
}

// Initial draw
renderApp();

// --- 4. THE LOGIC (Handling clicks) ---
addBtn.addEventListener("click", () => {
    // A. Get values from the inputs
    const amount = Number(amountInput.value);
    const selectedId = Number(categorySelect.value);

    // B. Validation (Don't track empty inputs)
    if (amount <= 0 || amountInput.value === "") {
        alert("Please enter a valid amount!");
        return; // Stop the function here
    }

    // C. Find the correct envelope
    // We look through the 'budgets' list to find the one matching the ID
    const category = budgets.find(item => item.id === selectedId);

    // D. Update the Data (The State)
    if (category) {
        category.spent += amount; 

        // --- NEW LINE: SAVE THE SNAPSHOT ---
        localStorage.setItem("paisaData", JSON.stringify(budgets));
    }

    // E. Re-draw the screen to show changes
    renderApp();

    // F. Clear the input box so it's ready for next time
    amountInput.value = "";
});


// --- 6. CREATE NEW BUDGET ---
createBtn.addEventListener("click", () => {
    const name = newCatName.value;
    const limit = Number(newCatBudget.value);

    // Validation
    if (name === "" || limit <= 0) {
        alert("Please enter a name and a limit!");
        return;
    }

    // Create the New Object
    const newCategory = {
        id: Date.now(), // Unique ID based on time
        name: name,
        budget: limit,
        spent: 0
    };

    // Add to our State
    budgets.push(newCategory);

    // Save & Render
    localStorage.setItem("paisaData", JSON.stringify(budgets));
    renderApp();

    // Clear Inputs
    newCatName.value = "";
    newCatBudget.value = "";
});

// --- 5. RESET DATA (New Month) ---
const resetBtn = document.getElementById("reset-btn");

resetBtn.addEventListener("click", () => {
    // 1. Confirm with the user (Good UX)
    if (!confirm("Start a new month? This will erase all spending.")) {
        return; // Stop if they clicked Cancel
    }

    // 2. Reset the data in memory
    budgets = [
        { id: 1, name: "Food", budget: 500, spent: 0 },
        { id: 2, name: "Rent", budget: 1000, spent: 0 },
        { id: 3, name: "Fun", budget: 200, spent: 0 }
    ];

    // 3. Update the storage to match
    localStorage.setItem("paisaData", JSON.stringify(budgets));

    // 4. Re-draw the screen
    renderApp();
});

// --- 7. DELETE CATEGORY ---
window.deleteCategory = (id) => {
    if (confirm("Delete this category permanently?")) {
        // Filter out the item with the matching ID
        budgets = budgets.filter(item => item.id !== id);
        
        // Save & Render
        localStorage.setItem("paisaData", JSON.stringify(budgets));
        renderApp();
    }
};