let currentPage = 1;
let currentQuery = "";
let currentLang = "";

const RESULTS_PER_PAGE = 10;

// Main search function
async function searchWiki(page = 1) {
    const queryInput = document.getElementById("query").value.trim();
    const langInput = document.getElementById("lang").value;

    // Save state so pagination works
    if (page === 1) {
        currentQuery = queryInput;
        currentLang = langInput;
    }

    const q = currentQuery;
    const lang = currentLang;

    if (!q) return;

    const offset = (page - 1) * RESULTS_PER_PAGE;

    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=${RESULTS_PER_PAGE}&sroffset=${offset}&format=json&origin=*`;

    const res = await fetch(url);
    const data = await res.json();

    currentPage = page;

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `<h2>Results (Page ${currentPage})</h2>`;

    data.query.search.forEach(item => {
        const div = document.createElement("div");
        div.className = "result-item";
        div.innerHTML = `<strong>${item.title}</strong><br>${item.snippet}...`;
        div.onclick = () => loadArticle(item.title, lang);
        resultsDiv.appendChild(div);
    });

    // Add pagination buttons
    addPaginationButtons();
}

// Load article summary
async function loadArticle(title, lang) {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

    const res = await fetch(url);
    const data = await res.json();

    document.getElementById("article").innerHTML = `
        <h2>${data.title}</h2>
        <p>${data.extract}</p>
        ${data.thumbnail ? `<img src="${data.thumbnail.source}" width="200">` : ""}
        <p><a href="https://${lang}.wikipedia.org/wiki/${encodeURIComponent(data.title)}" target="_blank">Read more on Wikipedia</a></p>
    `;
}

// Pagination UI
function addPaginationButtons() {
    const resultsDiv = document.getElementById("results");

    const nav = document.createElement("div");
    nav.style.marginTop = "20px";

    // Previous button
    if (currentPage > 1) {
        const prev = document.createElement("button");
        prev.textContent = "⬅ Previous";
        prev.onclick = () => searchWiki(currentPage - 1);
        nav.appendChild(prev);
    }

    // Next button
    const next = document.createElement("button");
    next.textContent = "Next ➡";
    next.style.marginLeft = "10px";
    next.onclick = () => searchWiki(currentPage + 1);
    nav.appendChild(next);

    resultsDiv.appendChild(nav);
}

// Press Enter to search
document.getElementById("query").addEventListener("keydown", function(e) {
    if (e.key === "Enter") searchWiki(1);
});