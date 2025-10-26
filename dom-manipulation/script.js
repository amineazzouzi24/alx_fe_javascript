let quotes = [];
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
function showRandomQuote() {
  const container = document.getElementById("quote-container");
  container.innerHTML = "";
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  const p = document.createElement("p");
  p.textContent = `"${random.text}"`;
  p.classList.add("quote-text");
  const span = document.createElement("span");
  span.textContent = `— ${random.category}`;
  span.classList.add("quote-category");
  container.appendChild(p);
  container.appendChild(span);
  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}
function createAddQuoteForm() {
  const container = document.getElementById("form-container");
  container.innerHTML = "";
  const form = document.createElement("form");
  const textInput = document.createElement("input");
  textInput.placeholder = "Enter quote text";
  textInput.required = true;
  const categoryInput = document.createElement("input");
  categoryInput.placeholder = "Enter quote category";
  categoryInput.required = true;
  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.type = "submit";
  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(btn);
  form.addEventListener("submit", e => {
    e.preventDefault();
    quotes.push({ text: textInput.value.trim(), category: categoryInput.value.trim() });
    saveQuotes();
    alert("Quote added successfully!");
    form.reset();
  });
  container.appendChild(form);
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
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  showRandomQuote();

  document.getElementById("random-btn").addEventListener("click", showRandomQuote);
  document.getElementById("add-btn").addEventListener("click", createAddQuoteForm);
  document.getElementById("export-btn").addEventListener("click", exportToJsonFile);
});
