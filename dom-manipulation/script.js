let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal.", category: "Motivation" }
];

let lastCategory = localStorage.getItem("lastCategory") || "all";

// Display a random quote
function showRandomQuote() {
  const filtered = getFilteredQuotes();
  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available in this category.";
    return;
  }
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteDisplay").textContent = `"${quote.text}" - [${quote.category}]`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Add quote form
function createAddQuoteForm() {
  const formDiv = document.getElementById("addQuoteForm");
  formDiv.innerHTML = `
    <input id="newQuoteText" placeholder="Quote text" />
    <input id="newQuoteCategory" placeholder="Category" />
    <button onclick="addQuote()">Add</button>
  `;
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Please enter both text and category.");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  document.getElementById("addQuoteForm").innerHTML = "";
  showRandomQuote();

  // Post the new quote to server
  postQuoteToServer(newQuote);
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories dynamically
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = Array.from(new Set(quotes.map(q => q.category)));
  select.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => select.innerHTML += `<option value="${cat}">${cat}</option>`);
  select.value = lastCategory;
}

// Filter quotes based on category
function getFilteredQuotes() {
  const category = document.getElementById("categoryFilter").value;
  lastCategory = category;
  localStorage.setItem("lastCategory", category);
  if (category === "all") return quotes;
  return quotes.filter(q => q.category === category);
}

function filterQuotes() {
  showRandomQuote();
}

// JSON Export
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// JSON Import
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// =====================
// Server Sync Simulation
// =====================
async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
  const data = await response.json();
  return data.map(post => ({ text: post.title, category: "Server" }));
}

// Post new quote to server
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    showSyncStatus("Quote posted to server!", "green");
  } catch {
    showSyncStatus("Failed to post quote to server.", "red");
  }
}

// Show sync status
function showSyncStatus(message, color) {
  const status = document.getElementById("sync-status");
  status.textContent = message;
  status.style.color = color;
}

// Sync quotes with server
async function syncQuotes() {
  showSyncStatus("Syncing with server...", "blue");
  try {
    const serverQuotes = await fetchQuotesFromServer();

    // Conflict resolution: overwrite local "Server" quotes
    quotes = quotes.filter(q => q.category !== "Server").concat(serverQuotes);
    saveQuotes();
    populateCategories();
    showSyncStatus("Quotes synced with server!", "green");
  } catch {
    showSyncStatus("Failed to sync quotes with server.", "red");
  }
}

// Initial setup
populateCategories();
showRandomQuote();

// Periodic server sync every 60 seconds
setInterval(syncQuotes, 60000);
