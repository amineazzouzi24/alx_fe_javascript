// ============================
// Data Setup & Storage
// ============================

let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
  { text: "Two things are infinite: the universe and human stupidity.", category: "Humor" }
];

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// ============================
// DOM Manipulation Functions
// ============================

// Show a random quote based on current filter
function showRandomQuote() {
  const filter = document.getElementById('categoryFilter').value || "all";
  const filtered = filter === "all" ? quotes : quotes.filter(q => q.category === filter);

  const display = document.getElementById('quoteDisplay');
  if (filtered.length === 0) {
    display.textContent = "No quotes available in this category.";
  } else {
    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    display.textContent = `"${quote.text}" - [${quote.category}]`;
    sessionStorage.setItem('lastQuote', JSON.stringify(quote));
  }
}

// Populate categories dynamically in dropdown
function populateCategories() {
  const select = document.getElementById('categoryFilter');
  select.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  select.appendChild(allOption);

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Restore last selected category
  const lastCategory = localStorage.getItem('lastCategory') || "all";
  select.value = lastCategory;
}

// Filter quotes by selected category
function filterQuotes() {
  const select = document.getElementById('categoryFilter');
  const selected = select.value;
  localStorage.setItem('lastCategory', selected);
  showRandomQuote();
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please provide both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showNotification("Quote added successfully!");
  textInput.value = "";
  categoryInput.value = "";
  filterQuotes();
}

// Show a temporary notification
function showNotification(msg) {
  const notif = document.getElementById("notifications");
  notif.textContent = msg;
  setTimeout(() => { notif.textContent = ""; }, 3000);
}

// ============================
// JSON Import/Export
// ============================

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(evt) {
    const importedQuotes = JSON.parse(evt.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    showNotification("Quotes imported successfully!");
    filterQuotes();
  };
  fileReader.readAsText(event.target.files[0]);
}

// ============================
// Server Sync Simulation
// ============================

async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    // Map server data to our format (simulate)
    const serverQuotes = data.slice(0, 5).map(d => ({ text: d.title, category: "Server" }));
    mergeServerData(serverQuotes);
  } catch (err) {
    console.error("Server fetch failed:", err);
  }
}

function mergeServerData(serverQuotes) {
  let updated = false;
  serverQuotes.forEach(sq => {
    if (!quotes.some(q => q.text === sq.text)) {
      quotes.push(sq);
      updated = true;
    }
  });
  if (updated) {
    saveQuotes();
    populateCategories();
    showNotification("Quotes synced with server!");
    filterQuotes();
  }
}

// Periodic sync every 30s
setInterval(fetchQuotesFromServer, 30000);

// ============================
// Event Listeners
// ============================

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
document.getElementById("exportBtn").addEventListener("click", exportToJson);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

// ============================
// Initialization
// ============================

populateCategories();
showRandomQuote();
