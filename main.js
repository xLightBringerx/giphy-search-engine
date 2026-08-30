// ---------- Setup ----------
// Replace this with your own Giphy API key
const API_KEY = "zQpctxZ6kRDDqQMDdQjbdn3QzgAXHaDn";
const PAGE_SIZE = 24;

const searchBtn = document.getElementById("searchBtn");
const trendingBtn = document.getElementById("trendingBtn");
const searchInput = document.getElementById("searchInput");
const resultsEl = document.getElementById("results");

// ---------- State ----------
// Tracks what's currently on screen so infinite scroll knows what to fetch next.
let currentMode = "trending"; // "trending" or "search"
let currentQuery = "";
let currentOffset = 0;
let isLoading = false;
let hasMore = true;

// ---------- Rendering ----------
function renderGifs(gifs, append = false) {
  if (!append) {
    resultsEl.innerHTML = "";
  }

  if (gifs.length === 0 && !append) {
    renderMessage("No GIFs found. Try a different search.");
    return;
  }

  gifs.forEach(gif => {
    const img = document.createElement("img");
    img.src = gif.images.fixed_height.url;
    img.alt = gif.title || "GIF";
    resultsEl.appendChild(img);
  });
}

function renderSpinner(append = false) {
  if (append) {
    // Add a small spinner below existing results instead of wiping them out
    const spinner = document.createElement("div");
    spinner.className = "spinner spinner-inline";
    spinner.id = "loadMoreSpinner";
    resultsEl.appendChild(spinner);
  } else {
    resultsEl.innerHTML = `<div class="spinner"></div>`;
  }
}

function removeInlineSpinner() {
  const spinner = document.getElementById("loadMoreSpinner");
  if (spinner) spinner.remove();
}

function renderMessage(message) {
  resultsEl.innerHTML = `<p class="status-message">${message}</p>`;
}

function renderError(message, append = false) {
  if (append) {
    removeInlineSpinner();
    const errorEl = document.createElement("p");
    errorEl.className = "status-message error";
    errorEl.textContent = message;
    resultsEl.appendChild(errorEl);
  } else {
    resultsEl.innerHTML = `<p class="status-message error">${message}</p>`;
  }
}

// ---------- API calls ----------
// Single shared function for both search and trending, since Giphy's two
// endpoints return the same shape of data and only differ by URL + query param.
async function fetchGifs({ append = false } = {}) {
  if (isLoading || (!hasMore && append)) return;
  isLoading = true;

  if (append) {
    renderSpinner(true);
  } else {
    renderSpinner(false);
  }

  try {
    const endpoint = currentMode === "search"
      ? `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(currentQuery)}&limit=${PAGE_SIZE}&offset=${currentOffset}&rating=g`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=${PAGE_SIZE}&offset=${currentOffset}&rating=g`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Giphy API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(data); // Inspect the raw response shape here if needed

    if (append) removeInlineSpinner();

    renderGifs(data.data, append);

    // Giphy tells us the total result count via pagination.total_count.
    // Once our offset reaches that, there's nothing left to load.
    currentOffset += data.data.length;
    hasMore = data.data.length > 0 && currentOffset < data.pagination.total_count;

  } catch (err) {
    console.error(err);
    const message = currentMode === "search"
      ? "Something went wrong fetching your search. Check the console for details."
      : "Something went wrong loading trending GIFs. Check the console for details.";
    renderError(message, append);

  } finally {
    isLoading = false;
  }
}

function searchGifs(query) {
  currentMode = "search";
  currentQuery = query;
  currentOffset = 0;
  hasMore = true;
  fetchGifs({ append: false });
}

function loadTrending() {
  currentMode = "trending";
  currentQuery = "";
  currentOffset = 0;
  hasMore = true;
  fetchGifs({ append: false });
}

function loadMore() {
  fetchGifs({ append: true });
}

// ---------- Event handling ----------
function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  searchGifs(query);
}

searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

// Debounced search-as-you-type: waits until the user pauses for 500ms
// before firing a request, instead of searching on every keystroke.
let debounceTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const query = searchInput.value.trim();
    if (!query) {
      loadTrending();
    } else {
      handleSearch();
    }
  }, 500);
});

trendingBtn.addEventListener("click", loadTrending);

// ---------- Infinite scroll ----------
// When the user scrolls within 300px of the bottom of the page, load the next batch.
window.addEventListener("scroll", () => {
  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

  if (nearBottom) {
    loadMore();
  }
});

// ---------- Load trending GIFs as soon as the page opens ----------
loadTrending();