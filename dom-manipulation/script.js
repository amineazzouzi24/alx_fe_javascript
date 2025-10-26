let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Learning never exhausts the mind.", category: "Education" }
];

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
      alert("Quote added successfully!");
      form.reset();
    } else {
      alert("Please fill in all fields.");
    }
  });
  formContainer.appendChild(form);
}
document.addEventListener("DOMContentLoaded", function () {
  showRandomQuote();
  document.getElementById("random-btn").addEventListener("click", showRandomQuote);
  document.getElementById("add-btn").addEventListener("click", createAddQuoteForm);
});
