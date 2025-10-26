// ===============================
// Dynamic Quote Generator with Server Sync & Conflict Handling
// ===============================

let quotes = [];
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock API simulation

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
    filterQuote();
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
        filterQuote();
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

// ===== Server Interaction =====

// Fetch quotes from server (mock API)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error("Network response not ok");
    const data = await response.json();

    // Convert mock data format to our quote format
    return data.slice(0, 5).map(item => ({
      id: item.id,
      text: item.title,
      category: "Server",
      updatedAt: Date.now()
    }));
  } catch (error) {
    console.error("Failed to fetch from server:", error);
    return [];
  }
}

// Post local quotes to server (mock)
async function postQuotesToServer(newQuotes) {
  try {
    // In a real app, you'd POST to your API.
    // Here we simulate with JSONPlaceholder POST request.
    const responses = await Promise.all(newQuotes.map(q => 
      fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      })
    ));
    return responses.every(res => res.ok);
  } catch (error) {
    console.error("Failed to post to server:", error);
    return false;
  }
}

// Sync local quotes with server
async function syncQuotes() {
  const status = document.getElementById("sync-status");
  status.textContent = "Syncing with server...";
  status.style.color = "blue";

  try {
    // Step 1: Fetch server quotes
    const serverQuotes = await fetchQuotesFromServer();

    // Step 2: Resolve conflicts - server takes precedence
    // We'll merge quotes by ID:
    // - If server quote exists, overwrite local.
    // - Add new server quotes not in local.
    // - Keep local quotes not on server as-is.

    const mergedQuotesMap = new Map();

    // Add local quotes first
    quotes.forEach(q => mergedQuotesMap.set(q.id, q));

    // Overwrite or add server quotes
    serverQuotes.forEach(sq => mergedQuotesMap.set(sq.id, sq));

    // Create merged array
    const mergedQuotes = Array.from(mergedQuotesMap.values());

    // Step 3: Find new local quotes (not on server) and POST them
    const serverIds = new Set(serverQuotes.map(q => q.id));
    const newLocalQuotes = quotes.filter(q => !serverIds.has(q.id));

    if (newLocalQuotes.length > 0) {
      const postSuccess = await postQuotesToServer(newLocalQuotes);
      if (!postSuccess) {
        status.textContent = "Sync partial: failed to upload local changes";
        status.style.color = "orange";
      }
    }

    // Step 4: Save merged data locally and update UI
    quotes = mergedQuotes;
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
  document.getElementById("sync-btn").addEventListener("click", syncQuotes);

  // Auto sync every 60 seconds
  setInterval(syncQuotes, 60000);
});
