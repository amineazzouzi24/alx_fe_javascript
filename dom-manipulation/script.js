// Mock server URL (you can replace with a real endpoint)
const MOCK_API_URL = "https://mockapi.io/projects/YOUR_PROJECT_ID/quotes";

// Initialize quotes array
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
];

// Load last selected category
let selectedCategory = localStorage.getItem('selectedCategory') || 'all';

// UI notifications
function showNotification(message) {
  alert(message); // Simple alert; you can replace with fancier UI
}

// -------------------------
// QUOTE DISPLAY & FILTER
// -------------------------
function showRandomQuote() {
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').textContent = 'No quotes in this category.';
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  document.getElementById('quoteDisplay').textContent = randomQuote.text;
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
  const filter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))];
  filter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });
  filter.value = selectedCategory;
}

function filterQuotes() {
  const filter = document.getElementById('categoryFilter');
  selectedCategory = filter.value;
  localStorage.setItem('selectedCategory', selectedCategory);
  showRandomQuote();
}

// -------------------------
// ADD QUOTE
// -------------------------
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert('Please enter both quote text and category.');
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  showRandomQuote();

  textInput.value = '';
  categoryInput.value = '';

  // Post to server
  postQuoteToServer(newQuote);
}

function createAddQuoteForm() {
  const container = document.getElementById('addQuoteFormContainer');
  container.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

// -------------------------
// IMPORT / EXPORT JSON
// -------------------------
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      showNotification('Quotes imported successfully!');
    } catch (err) {
      alert('Invalid JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// -------------------------
// SERVER SYNC
// -------------------------

// Fetch all quotes from server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(MOCK_API_URL);
    if (!res.ok) throw new Error('Failed to fetch quotes');
    const serverQuotes = await res.json();
    return serverQuotes;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Post a new quote to server
async function postQuoteToServer(quote) {
  try {
    const res = await fetch(MOCK_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote)
    });
    if (!res.ok) throw new Error('Failed to post quote');
    showNotification('Quote synced to server!');
  } catch (err) {
    console.error(err);
    showNotification('Failed to sync quote to server.');
  }
}

// Sync local quotes with server periodically
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  // Merge server quotes with local quotes
  let newQuotesCount = 0;
  serverQuotes.forEach(sq => {
    const exists = quotes.some(lq => lq.text === sq.text && lq.category === sq.category);
    if (!exists) {
      quotes.push(sq);
      newQuotesCount++;
    }
  });

  if (newQuotesCount > 0) {
    saveQuotes();
    populateCategories();
    showRandomQuote();
    showNotification(`${newQuotesCount} new quote(s) fetched from server.`);
  }
}

// Start periodic sync every 60 seconds
setInterval(syncQuotes, 60000);

// -------------------------
// INITIALIZE APP
// -------------------------
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
createAddQuoteForm();
populateCategories();
showRandomQuote();
