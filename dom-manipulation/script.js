let quotes = [];

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
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
      { text: "Learning never exhausts the mind.", category: "Education" }
    ];
    saveQuotes();
  }
}

// ===== Populate Categories =====
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
  if (lastFilter && categories.includes(lastFilter)) {
    categorySelect.value = lastFilter;
    filterQuotes(); // عرض الاقتباسات بناءً عليها
  }
}

// ===== Filter Quotes =====
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const quoteContainer = document.getElementById("quote-container");
  quoteContainer.innerHTML = "";

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteContainer.textContent = "No quotes found for this category.";
    return;
  }

  filteredQuotes.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}"`;
    p.classList.add("quote-text");

    const span = document.createElement("span");
    span.textContent = `— ${q.category}`;
    span.classList.add("quote-category");

    quoteContainer.appendChild(p);
    quoteContainer.appendChild(span);
    quoteContainer.appendChild(document.createElement("br"));
  });
}

// ===== Show Random Quote =====
function showRandomQuote() {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  const container = document.getElementById("quote-container");
  container.innerHTML = `<p class="quote-text">"${random.text}"</p><span class="quote-category">— ${random.category}</span>`;

  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}

// ===== Add New Quote =====
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
    const newQuote = { text: textInput.value.trim(), category: categoryInput.value.trim() };
    if (!newQuote.text || !newQuote.category) return alert("Please fill in all fields.");

    quotes.push(newQuote);
    saveQuotes();
    populateCategories(); 
    alert("Quote added successfully!");
    form.reset();
  });

  formContainer.appendChild(form);
}

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

document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("add-btn").addEventListener("click", createAddQuoteForm);
  document.getElementById("export-btn").addEventListener("click", exportToJsonFile);
});

