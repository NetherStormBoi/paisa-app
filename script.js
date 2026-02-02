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
const dashboard = document.getElementById("dashboard");
const categorySelect = document.getElementById("category-select");
const addBtn = document.getElementById("add-btn");
const amountInput = document.getElementById("amount-input");

// --- 3. THE RENDER (The Artist) ---
function renderApp() {
    // A. Reset the HTML (Wipe the canvas). We set it to an empty string, because every time we update the data (e.g., spent $5), we are going to redraw everything from scratch. If we didn't wipe it first, we would end up with double lists (Food, Rent, Fun, Food, Rent, Fun...).
    dashboard.innerHTML = "";
    categorySelect.innerHTML = "";

    // B. Loop through data to create cards
    budgets.forEach(category => {
        // Calculate the math
        const remaining = category.budget - category.spent;
        const percentage = (category.spent / category.budget) * 100;
        
        // Create the HTML Card
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
        `; // (backtick ` (the one on ~ key) enables string interpolation (using ${variable}) and multi-line strings). in this case, we use ${...} to swap the variable category.name with the actual text eg "Food".
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