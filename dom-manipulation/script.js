// Populate categories dynamically using appendChild
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  // Clear existing options
  select.innerHTML = "";

  // Always include "All Categories"
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  select.appendChild(allOption);

  // Extract unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Populate dropdown
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Restore last selected category
  const lastCategory = localStorage.getItem("lastCategory") || "all";
  select.value = lastCategory;
}

// Filter quotes based on selected category and update display
function filterQuotes() {
  const select = document.getElementById("categoryFilter");
  const selectedCategory = select.value;
  localStorage.setItem("lastCategory", selectedCategory); // save selection

  // Filter quotes
  const filtered = selectedCategory === "all" 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  // Update displayed quote (choose random)
  const display = document.getElementById("quoteDisplay");
  if (filtered.length === 0) {
    display.textContent = "No quotes available in this category.";
  } else {
    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    display.textContent = `"${quote.text}" - [${quote.category}]`;
  }

  // Optionally save last viewed quote in session storage
  if (filtered.length > 0) {
    sessionStorage.setItem("lastQuote", JSON.stringify(filtered[0]));
  }
}

// Event listener for category filter dropdown
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
