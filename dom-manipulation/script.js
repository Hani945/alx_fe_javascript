let quotes = [];
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Simulated server

// Load quotes from localStorage or use defaults
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "Believe in yourself!", category: "Motivation" },
      { text: "Why did the chicken cross the road? To get to the other side!", category: "Humor" },
      { text: "Learning never exhausts the mind.", category: "Education" }
    ];
    saveQuotes();
  }
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    filterQuotes();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("New quote added!");
  } else {
    alert("Please enter both quote and category.");
  }
}

// Show a random quote + save in sessionStorage
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  document.getElementById("quoteDisplay").textContent =
    `"${quote.text}" — (${quote.category})`;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Display multiple quotes
function displayQuotes(list) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (list.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  list.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" — (${q.category})`;
    quoteDisplay.appendChild(p);
  });
}

// Populate category dropdown
function populateCategories() {
  const categorySet = new Set(quotes.map(q => q.category));
  const filter = document.getElementById("categoryFilter");
  const saved = localStorage.getItem("selectedCategory") || "all";

  filter.innerHTML = '<option value="all">All Categories</option>';
  categorySet.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    if (cat === saved) opt.selected = true;
    filter.appendChild(opt);
  });
}

// Filter based on selected category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  displayQuotes(filtered);
}

// Export quotes to JSON file
function exportToJson() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from a file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Sync quotes to simulated server
async function syncToServer() {
  try {
    await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotes)
    });
    console.log("✅ Quotes synced to server.");
  } catch (err) {
    console.error("❌ Sync failed:", err);
  }
}

// Fetch quotes from simulated server
async function fetchFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    // Simulate quotes returned by server
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    handleConflict(serverQuotes);
  } catch (err) {
    console.error("❌ Fetch failed:", err);
  }
}

// Handle merging quotes and resolving conflicts
function handleConflict(serverQuotes) {
  let updated = [...quotes];

  serverQuotes.forEach(sq => {
    const exists = updated.some(q => q.text === sq.text && q.category === sq.category);
    if (!exists) updated.push(sq);
  });

  if (updated.length !== quotes.length) {
    alert("🔄 Quotes updated from server (conflicts resolved)");
  }

  quotes = updated;
  saveQuotes();
  populateCategories();
  filterQuotes();
}

// Initialize
loadQuotes();
populateCategories();
filterQuotes();
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Optional: sync every 30 seconds
setInterval(() => {
  fetchFromServer();
  syncToServer();
}, 30000);
