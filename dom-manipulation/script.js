// ======= Quotes Array & Initialization =======
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Motivation" },
];

let selectedCategory = localStorage.getItem('selectedCategory') || 'all';

// ======= DOM Elements =======
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');

// ======= Display a Random Quote =======
function showRandomQuote() {
  const filteredQuotes = quotes.filter(q => selectedCategory === 'all' || q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = 'No quotes available for this category.';
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

// ======= Populate Categories Dropdown =======
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = selectedCategory;
}

// ======= Filter Quotes Based on Selected Category =======
function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);
  showRandomQuote();
}

// ======= Add a New Quote =======
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
}

// ======= Save Quotes to Local Storage =======
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// ======= Export Quotes to JSON File =======
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ======= Import Quotes from JSON File =======
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid JSON format");
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      notifyUser('Quotes imported successfully!');
    } catch (err) {
      alert('Failed to import quotes: ' + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ======= Mock Server Sync =======
function syncQuotes() {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quotes)
  })
  .then(res => res.json())
  .then(data => notifyUser('Quotes synced with server!'))
  .catch(err => console.error('Sync failed:', err));
}

// ======= Periodic Server Fetch Simulation =======
function fetchServerQuotes() {
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(res => res.json())
    .then(serverData => {
      // Simple conflict resolution: server data overrides local
      if (serverData.length > 0) {
        quotes = serverData.map(d => ({ text: d.title || "Server quote", category: "Server" }));
        saveQuotes();
        populateCategories();
        showRandomQuote();
        notifyUser('Local quotes updated from server!');
      }
    })
    .catch(err => console.error('Fetch server quotes failed:', err));
}

setInterval(fetchServerQuotes, 30000); // every 30 seconds

// ======= User Notification =======
function notifyUser(message) {
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.background = '#ffd700';
    notification.style.padding = '10px';
    notification.style.border = '1px solid #333';
    document.body.appendChild(notification);
  }
  notification.textContent = message;
  setTimeout(() => { notification.textContent = ''; }, 5000);
}

// ======= Event Listeners =======
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);

// ======= Initial Setup =======
populateCategories();
showRandomQuote();
