const moodContent = {
  discover: [
    "<strong>Bugünün küçük kaçamağı:</strong> Şehrinin hiç gitmediğin bir semtinde yürüyüş rotası çıkar.",
    "<strong>Keşif fikri:</strong> Sevdiğin bir şarkının ilk kez duyulduğu yılın filmlerini araştır.",
    "<strong>Rastlantıya yer aç:</strong> Kitaplığından gözün kapalı bir kitap seç, ilk sayfasını oku.",
  ],
  quick: [
    "<strong>Beş dakikalık reset:</strong> Masandaki tek bir alanı sadeleştir, gerisini sonra düşün.",
    "<strong>Hızlı bir iyi fikir:</strong> Bir arkadaşına hiç beklemediği samimi bir mesaj at.",
    "<strong>Küçük mola:</strong> Üç derin nefes al ve şu an duyduğun üç sesi fark et.",
  ],
  informed: [
    "<strong>Gündeme akıllı bir giriş:</strong> Bugün bir başlığı iki farklı kaynaktan karşılaştır.",
    "<strong>Bağlamı yakala:</strong> Merak ettiğin bir haberin ‘neden şimdi?’ sorusunu araştır.",
    "<strong>Bilgi filtresi:</strong> Bir iddiayı paylaşmadan önce ilk kaynağını bulmayı dene.",
  ],
  grow: [
    "<strong>Bugünün yatırımı:</strong> Gelecekteki kendine bir cümlelik cesaret notu bırak.",
    "<strong>Küçük adım:</strong> Öğrenmek istediğin konuyla ilgili tek bir güvenilir kaynak kaydet.",
    "<strong>Yönünü belirle:</strong> Bu hafta bitirmek istediğin tek işi yaz ve ilk beş dakikasını başlat.",
  ],
};

let activeMood = "discover";
let promptIndex = 0;
let savedIds = JSON.parse(localStorage.getItem("kesif-saved") || "[]");

const cardContainer = document.querySelector("#discovery-cards");
const emptyState = document.querySelector("#empty-state");
const savedList = document.querySelector("#saved-list");
const savedCount = document.querySelector(".saved-count");
const prompt = document.querySelector("#mood-prompt p");
const dialog = document.querySelector("#detail-dialog");
const dialogContent = document.querySelector("#dialog-content");
const search = document.querySelector("#search");

function visibleDiscoveries() {
  const term = search.value.trim().toLocaleLowerCase("tr-TR");
  const suited = discoveries.filter((item) => item.modes.includes(activeMood));
  const filtered = suited.filter((item) => `${item.title} ${item.description} ${item.type}`.toLocaleLowerCase("tr-TR").includes(term));
  return filtered.slice(0, 3);
}

function renderCards() {
  const items = visibleDiscoveries();
  cardContainer.innerHTML = items.map((item, index) => `
    <article class="discovery-card" data-id="${item.id}">
      <span class="card-number">0${index + 1}</span>
      <div>
        <span class="card-type">${item.type}</span>
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
  if (!items.length) {
    savedList.innerHTML = '<p class="saved-empty">Beğendiğin bir keşfi kaydet; sonra tam burada bulursun.</p>';
    return;
  }
  savedList.innerHTML = items.map((item) => `
    <article class="saved-item">
      <div><strong>${item.title}</strong><span>${item.type} · ${item.time}</span></div>
      <button type="button" data-id="${item.id}" class="remove-button">Kaldır</button>
    </article>
  `).join("");
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
    <p class="dialog-type">${item.type} · ${item.time}</p>
    <h3>${item.title}</h3>
    <p>${item.description} Bu, KEŞİF'in ilk sürümündeki yönlendirici içerik kartlarından biri. Bir sonraki adımda bu alan; kaynaklara, etkinliklere ve kişisel önerilere bağlanacak.</p>
  `;
  dialog.showModal();
}

function setMood(mood) {
  activeMood = mood;
  promptIndex = 0;
  prompt.innerHTML = moodContent[mood][promptIndex];
  document.querySelectorAll(".mood-pill").forEach((button) => button.classList.toggle("active", button.dataset.mood === mood));
  renderCards();
}

document.querySelector(".mood-picker").addEventListener("click", (event) => {
  const button = event.target.closest(".mood-pill");
  if (button) setMood(button.dataset.mood);
});

document.querySelector("#refresh-prompt").addEventListener("click", () => {
  promptIndex = (promptIndex + 1) % moodContent[activeMood].length;
  prompt.innerHTML = moodContent[activeMood][promptIndex];
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
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

search.addEventListener("input", renderCards);

document.querySelector("#focus-button").addEventListener("click", (event) => {
  const focusText = document.querySelector("#focus-text");
  event.currentTarget.disabled = true;
  event.currentTarget.textContent = "25 dakika başladı";
  focusText.textContent = "Harika. Bildirimleri sustur, yalnızca ilk adıma odaklan.";
});

renderCards();
renderSaved();
