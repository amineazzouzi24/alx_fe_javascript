let quotes = [];
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
      { text: "Learning never exhausts the mind.", category: "Education" }
    ];
    saveQuotes();
  }
}
function showRandomQuote() {
  const quoteContainer = document.getElementById("quote-container");
  quoteContainer.innerHTML = "";
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${randomQuote.text}"`;
  quoteText.classList.add("quote-text");
  const quoteCategory = document.createElement("span");
  quoteCategory.textContent = `— ${randomQuote.category}`;
  quoteCategory.classList.add("quote-category");
  quoteContainer.appendChild(quoteText);
  quoteContainer.appendChild(quoteCategory);
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}
function createAddQuoteForm() {
  const formContainer = document.getElementById("form-container");
  formContainer.innerHTML = "";
  const form = document.createElement("form");
  form.id = "addQuoteForm";
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Enter quote text";
  textInput.required = true;
  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.required = true;
  const addButton = document.createElement("button");
  addButton.type = "submit";
  addButton.textContent = "Add Quote";
  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(addButton);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const newQuote = {
      text: textInput.value.trim(),
      category: categoryInput.value.trim()
    };
    if (newQuote.text && newQuote.category) {
      quotes.push(newQuote);
      saveQuotes();
      alert("Quote added successfully!");
      form.reset();
    } else {
      alert("Please fill in all fields.");
    }
  });
  formContainer.appendChild(form);
}
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
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format!");
      }
    } catch (error) {
      alert("Error reading JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}
document.addEventListener("DOMContentLoaded", function () {
  loadQuotes();
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const parsed = JSON.parse(lastQuote);
    const quoteContainer = document.getElementById("quote-container");
    quoteContainer.innerHTML = `<p class="quote-text">"${parsed.text}"</p><span class="quote-category">— ${parsed.category}</span>`;
  } else {
    showRandomQuote();
  }
  document.getElementById("random-btn").addEventListener("click", showRandomQuote);
  document.getElementById("add-btn").addEventListener("click", createAddQuoteForm);
  document.getElementById("export-btn").addEventListener("click", exportToJsonFile);
});
