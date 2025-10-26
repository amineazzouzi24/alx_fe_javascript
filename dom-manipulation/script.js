// ===============================
// Dynamic Quote Generator v6
// With Server Sync & Conflict Handling
// ===============================

let quotes = [];
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock API for simulation

// ===== Local Storage =====
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation", updatedAt: Date.now() },
      { id: 2, text: "In the middle of every difficulty lies opportunity.", category: "Inspiration", updatedAt: Date.now() },
      { id: 3, text: "Learning never exhausts the mind.", category: "Education", updatedAt: Date.now() }
    ];
    saveQuotes();
  }
}

// ===== Category Filter =====
function populateCategories() {
  const categorySelect = document.getElementById("categoryFilter");
  categorySelect.innerHTML = '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter && (lastFilter === "all" || categories.includes(lastFilter))) {
    categorySelect.value = lastFilter;
    filterQuote();
  }
}

function filterQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const filtered =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  filtered.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}"`;
    p.classList.add("quote-text");

    const span = document.createElement("span");
    span.textContent = `— ${q.category}`;
    span.classList.add("quote-category");

    quoteDisplay.appendChild(p);
    quoteDisplay.appendChild(span);
    quoteDisplay.appendChild(document.createElement("br"));
  });
}

// ===== Random Quote =====
function showRandomQuote() {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p class="quote-text">"${random.text}"</p><span class="quote-category">— ${random.category}</span>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}

// ===== Add Quote =====
function createAddQuoteForm() {
  const formContainer = document.getElementById("form-container");
  formContainer.innerHTML = "";

  const form = document.createElement("form");
  const textInput = document.createElement("input");
  textInput.placeholder = "Enter quote text";
  textInput.required = true;

  const categoryInput = document.createElement("input");
  categoryInput.placeholder = "Enter quote category";
  categoryInput.required = true;

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.textContent = "Add Quote";

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(btn);

  form.addEventListener("submit", e => {
    e.preventDefault();
    const newQuote = {
      id: Date.now(),
      text: textInput.value.trim(),
      category: categoryInput.value.trim(),
      updatedAt: Date.now()
    };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    alert("Quote added successfully!");
    form.reset();
  });

  formContainer.appendChild(form);
}

// ===== Export / Import =====
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON file.");
      }
    } catch {
      alert("Error reading JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ===== Server Sync Simulation =====
async function syncWithServer() {
  const status = document.getElementById("sync-status");
  status.textContent = "Syncing with server...";
  status.style.color = "blue";

  try {
    // Simulate fetch from server
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Convert mock data into compatible quotes
    const serverQuotes = serverData.slice(0, 5).map(item => ({
      id: item.id,
      text: item.title,
      category: "Server",
      updatedAt: Date.now()
    }));

    // Conflict resolution: Server takes precedence
    const merged = [...quotes];
    serverQuotes.forEach(sq => {
      const index = merged.findIndex(q => q.id === sq.id);
      if (index === -1) merged.push(sq);
      else merged[index] = sq; // server overrides
    });

    quotes = merged;
    saveQuotes();
    populateCategories();
    filterQuote();

    status.textContent = `Last sync: ${new Date().toLocaleTimeString()}`;
    status.style.color = "green";
  } catch (error) {
    status.textContent = "Sync failed!";
    status.style.color = "red";
    console.error("Sync error:", error);
  }
}

// ===== Initialization =====
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  filterQuote();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("add-btn").addEventListener("click", createAddQuoteForm);
  document.getElementById("export-btn").addEventListener("click", exportToJsonFile);
  document.getElementById("sync-btn").addEventListener("click", syncWithServer);

  // Auto sync every 60 seconds
  setInterval(syncWithServer, 60000);
});
