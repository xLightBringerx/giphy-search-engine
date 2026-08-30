// ---------- Setup ----------
// Replace this with your own Giphy API key
const API_KEY = "zQpctxZ6kRDDqQMDdQjbdn3QzgAXHaDn";

const searchBtn = document.getElementById("searchBtn");
const trendingBtn = document.getElementById("trendingBtn");
const searchInput = document.getElementById("searchInput");
const resultsEl = document.getElementById("results");

// ---------- Rendering ----------
function renderGifs(gifs) {
  resultsEl.innerHTML = "";

  if (gifs.length === 0) {
    resultsEl.innerHTML = "<p>No GIFs found. Try a different search.</p>";
    return;
  }

  gifs.forEach(gif => {
    const img = document.createElement("img");
    img.src = gif.images.fixed_height.url;
    img.alt = gif.title || "GIF";
    resultsEl.appendChild(img);
  });
}

function renderError(message) {
  resultsEl.innerHTML = `<p>${message}</p>`;
}

// ---------- API calls ----------
async function searchGifs(query) {
  resultsEl.innerHTML = "<p>Searching...</p>";

  try {
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=24&rating=g`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Giphy API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(data); // Inspect the raw response shape here if needed
    renderGifs(data.data);

  } catch (err) {
    console.error(err);
    renderError("Something went wrong fetching your search. Check the console for details.");
  }
}

async function loadTrending() {
  resultsEl.innerHTML = "<p>Loading trending GIFs...</p>";

  try {
    const url = `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=24&rating=g`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Giphy API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    renderGifs(data.data);

  } catch (err) {
    console.error(err);
    renderError("Something went wrong loading trending GIFs. Check the console for details.");
  }
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

trendingBtn.addEventListener("click", loadTrending);

// ---------- Load trending GIFs as soon as the page opens ----------
loadTrending();