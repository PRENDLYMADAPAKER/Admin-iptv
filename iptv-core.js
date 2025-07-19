// iptv-core.js — Fully working IPTV logic for IPTV Premium

const DEFAULT_M3U = "https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/main/IPTVPREMIUM.m3u";
const DEFAULT_EPG = "https://tinyurl.com/DrewLive002-epg";

let channels = [];
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let lastWatched = localStorage.getItem("lastWatched") || null;
let currentPage = 0;
let filteredChannels = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("import-btn").addEventListener("click", importM3U);
  document.getElementById("prev-btn").addEventListener("click", () => changePage(-1));
  document.getElementById("next-btn").addEventListener("click", () => changePage(1));
  document.getElementById("search").addEventListener("input", filterChannels);
  document.getElementById("category").addEventListener("change", filterChannels);
  document.getElementById("video-player").addEventListener("waiting", () => showBuffer(true));
  document.getElementById("video-player").addEventListener("playing", () => showBuffer(false));
  loadClock();
  loadChannels(DEFAULT_M3U);
});

function loadClock() {
  const clock = document.getElementById("clock");
  setInterval(() => {
    const d = new Date();
    clock.textContent = d.toLocaleTimeString();
  }, 1000);
}

async function loadChannels(url) {
  try {
    const res = await fetch(url);
    const m3u = await res.text();
    channels = parseM3U(m3u);
    populateCategories();
    filterChannels();
    if (lastWatched) playChannelByUrl(lastWatched);
  } catch (err) {
    console.error("Failed to load M3U", err);
  }
}

function importM3U() {
  const url = prompt("Enter M3U URL:");
  if (url) {
    localStorage.setItem("customM3U", url);
    loadChannels(url);
  }
}

function parseM3U(data) {
  const lines = data.split(/\r?\n/);
  const parsed = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const info = lines[i];
      const url = lines[i + 1];
      const name = info.split(",").pop().trim();
      const logo = /tvg-logo="(.*?)"/.exec(info)?.[1] || "";
      const group = /group-title="(.*?)"/.exec(info)?.[1] || "Uncategorized";
      parsed.push({ name, url, logo, group });
    }
  }
  return parsed;
}

function populateCategories() {
  const select = document.getElementById("category");
  const groups = Array.from(new Set(channels.map(c => c.group)));
  select.innerHTML = `<option value="all">All</option><option value="favorites">Favorites</option>` +
                     groups.map(g => `<option value="${g}">${g}</option>`).join("");
}

function filterChannels() {
  const keyword = document.getElementById("search").value.toLowerCase();
  const category = document.getElementById("category").value;

  filteredChannels = channels.filter(ch => {
    const matchName = ch.name.toLowerCase().includes(keyword);
    const matchGroup = category === "all" || (category === "favorites"
      ? favorites.includes(ch.url)
      : ch.group === category);
    return matchName && matchGroup;
  });

  currentPage = 0;
  renderPage();
}

function renderPage() {
  const grid = document.getElementById("channel-grid");
  grid.innerHTML = "";

  const start = currentPage * 2;
  const pageChannels = filteredChannels.slice(start, start + 2);

  for (let i = 0; i < 2; i++) {
    const ch = pageChannels[i];
    const slot = document.createElement("div");
    slot.className = "channel-slot";
    if (ch) {
      slot.innerHTML = `
        <div class="channel-card" onclick="playChannelByUrl('${ch.url}')">
          <img src="${ch.logo}" onerror="this.src='fallback.png'" />
          <h4>${ch.name}</h4>
          <button onclick="event.stopPropagation(); toggleFavorite('${ch.url}')">
            ${favorites.includes(ch.url) ? "★" : "☆"}
          </button>
        </div>`;
    }
    grid.appendChild(slot);
  }

  document.getElementById("page-info").textContent =
    `Page ${currentPage + 1} / ${Math.ceil(filteredChannels.length / 2)}`;
}

function changePage(dir) {
  const max = Math.ceil(filteredChannels.length / 2);
  currentPage = (currentPage + dir + max) % max;
  renderPage();
}

function playChannelByUrl(url) {
  const player = document.getElementById("video-player");
  const ch = channels.find(c => c.url === url);
  if (!ch) return;

  player.src = ch.url;
  player.play();
  localStorage.setItem("lastWatched", ch.url);

  document.getElementById("now-playing").textContent = ch.name;
  document.getElementById("channel-icon").src = ch.logo;

  showEPG(ch.name);
}

function toggleFavorite(url) {
  const i = favorites.indexOf(url);
  if (i >= 0) favorites.splice(i, 1);
  else favorites.push(url);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderPage();
}

function showEPG(channelName) {
  fetch(DEFAULT_EPG)
    .then(res => res.json())
    .then(data => {
      const entry = data.find(e => e.name?.toLowerCase() === channelName.toLowerCase());
      if (entry && entry.now) {
        document.getElementById("epg-now").textContent = entry.now;
      } else {
        document.getElementById("epg-now").textContent = "";
      }
    })
    .catch(() => {
      document.getElementById("epg-now").textContent = "";
    });
}

function showBuffer(show) {
  const buf = document.getElementById("buffering");
  if (buf) buf.style.display = show ? "flex" : "none";
    }
