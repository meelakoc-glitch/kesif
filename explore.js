let activeCategory = "all";
let savedIds = JSON.parse(localStorage.getItem("kesif-saved") || "[]");

const cardContainer = document.querySelector("#explore-cards");
const emptyState = document.querySelector("#explore-empty");
const savedList = document.querySelector("#saved-list");
const savedCount = document.querySelector(".saved-count");
const search = document.querySelector("#explore-search");
const duration = document.querySelector("#duration-filter");
const dialog = document.querySelector("#detail-dialog");
const dialogContent = document.querySelector("#dialog-content");

function matchingDiscoveries() {
  const term = search.value.trim().toLocaleLowerCase("tr-TR");
  return discoveries.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesTerm = `${item.title} ${item.description} ${item.category} ${item.type}`.toLocaleLowerCase("tr-TR").includes(term);
    const matchesDuration = duration.value === "all"
      || (duration.value === "long" ? item.minutes > 10 : item.minutes <= Number(duration.value));
    return matchesCategory && matchesTerm && matchesDuration;
  });
}

function renderCards() {
  const items = matchingDiscoveries();
  document.querySelector("#result-summary").textContent = `${items.length} keşif bulundu`;
  cardContainer.innerHTML = items.map((item, index) => `
    <article class="discovery-card" data-id="${item.id}">
      <span class="card-number">${String(index + 1).padStart(2, "0")}</span>
      <div>
        <span class="card-type">${item.category} · ${item.type}</span>
        <h3>${item.title}</h3>
        <p class="card-description">${item.description}</p>
      </div>
      <div class="card-footer">
        <span class="card-meta">${item.time}</span>
        <div class="card-buttons">
          <button class="card-button detail-button" type="button" data-id="${item.id}" aria-label="${item.title} ayrıntıları">→</button>
          <button class="card-button save-button" type="button" data-id="${item.id}" aria-label="${item.title} kaydet" aria-pressed="${savedIds.includes(item.id)}">${savedIds.includes(item.id) ? "✓" : "+"}</button>
        </div>
      </div>
    </article>
  `).join("");
  emptyState.hidden = items.length !== 0;
}

function renderSaved() {
  const items = discoveries.filter((item) => savedIds.includes(item.id));
  savedCount.textContent = savedIds.length;
  savedList.innerHTML = items.length ? items.map((item) => `
    <article class="saved-item">
      <div><strong>${item.title}</strong><span>${item.category} · ${item.time}</span></div>
      <button type="button" data-id="${item.id}" class="remove-button">Kaldır</button>
    </article>
  `).join("") : '<p class="saved-empty">Beğendiğin bir keşfi kaydet; sonra tam burada bulursun.</p>';
}

function toggleSave(id) {
  savedIds = savedIds.includes(id) ? savedIds.filter((savedId) => savedId !== id) : [...savedIds, id];
  localStorage.setItem("kesif-saved", JSON.stringify(savedIds));
  renderCards();
  renderSaved();
}

function showDetail(id) {
  const item = discoveries.find((discovery) => discovery.id === id);
  dialogContent.innerHTML = `
    <p class="dialog-type">${item.category.toLocaleUpperCase("tr-TR")} · ${item.type} · ${item.time}</p>
    <h3>${item.title}</h3>
    <p>${item.description} Bu ilk sürümdeki her kart, ihtiyacın olan anda küçük bir başlangıç noktası olmak için tasarlandı.</p>
  `;
  dialog.showModal();
}

document.querySelector(".category-filters").addEventListener("click", (event) => {
  const button = event.target.closest(".filter-chip");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("active", chip === button));
  renderCards();
});

cardContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.classList.contains("save-button")) toggleSave(button.dataset.id);
  if (button.classList.contains("detail-button")) showDetail(button.dataset.id);
});

savedList.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-button");
  if (button) toggleSave(button.dataset.id);
});

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
search.addEventListener("input", renderCards);
duration.addEventListener("change", renderCards);

renderCards();
renderSaved();
