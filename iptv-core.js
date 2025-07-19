// iptv-core.js
// Handles all IPTV logic: M3U parsing, EPG, favorites, swipe grid, etc.

const m3uDefault = "https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/main/IPTVPREMIUM.m3u";
const epgURL = "https://tinyurl.com/DrewLive002-epg";

let channels = [], favorites = [], currentChannel = null;
let epgData = {}, filteredChannels = [], currentPage = 0;

// Load channels
async function loadChannels(m3uUrl = m3uDefault) {
  showLoader(true);
  const res = await fetch(m3uUrl);
  const text = await res.text();
  parseM3U(text);
  await loadEPG();
  filteredChannels = channels;
  renderChannelGrid();
  restoreLastWatched();
  showLoader(false);
}

function parseM3U(data) {
  channels = [];
  const lines = data.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const nameMatch = lines[i].match(/tvg-name=\"(.*?)\"/);
      const logoMatch = lines[i].match(/tvg-logo=\"(.*?)\"/);
      const groupMatch = lines[i].match(/group-title=\"(.*?)\"/);
      const title = lines[i].split(",").pop();
      const streamUrl = lines[i + 1];
      channels.push({
        name: nameMatch?.[1] || title,
        logo: logoMatch?.[1] || '',
        group: groupMatch?.[1] || 'Other',
        url: streamUrl
      });
    }
  }
  updateCategoryOptions();
}

function updateCategoryOptions() {
  const select = document.getElementById("category");
  const groups = [...new Set(channels.map(c => c.group))];
  select.innerHTML = '<option value="All">All</option>' +
    groups.map(g => `<option value="${g}">${g}</option>`).join("");
}

// EPG
async function loadEPG() {
  const res = await fetch(epgURL);
  const xml = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  epgData = {};
  const programs = doc.querySelectorAll("programme");
  programs.forEach(p => {
    const channelId = p.getAttribute("channel");
    if (!epgData[channelId]) epgData[channelId] = [];
    epgData[channelId].push({
      title: p.querySelector("title")?.textContent || "",
      start: p.getAttribute("start")
    });
  });
}

function getNowProgram(channelName) {
  const list = epgData[channelName];
  if (!list) return "";
  const now = new Date();
  return list.find(p => {
    const startTime = parseEPGTime(p.start);
    const next = list.find(x => parseEPGTime(x.start) > startTime);
    const endTime = next ? parseEPGTime(next.start) : new Date(now.getTime() + 3600000);
    return now >= startTime && now <= endTime;
  })?.title || "";
}

function parseEPGTime(str) {
  return new Date(
    str.replace(/([0-9]{4})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/,
      "$1-$2-$3T$4:$5:00")
  );
}

function renderChannelGrid() {
  const grid = document.getElementById("channel-grid");
  grid.innerHTML = "";
  const start = currentPage * 2;
  const paginated = filteredChannels.slice(start, start + 2);
  paginated.forEach((ch, index) => {
    const isFav = favorites.includes(ch.name);
    const div = document.createElement("div");
    div.className = "channel-card";
    div.innerHTML = `
      <img src="${ch.logo}" class="channel-logo">
      <span class="channel-name">${ch.name}</span>
      <button class="fav-btn" onclick="toggleFavorite('${ch.name}')">${isFav ? '★' : '☆'}</button>
    `;
    div.onclick = () => playChannel(ch);
    grid.appendChild(div);
  });
  document.getElementById("prevBtn").disabled = currentPage === 0;
  document.getElementById("nextBtn").disabled = (currentPage + 1) * 2 >= filteredChannels.length;
}

function playChannel(ch) {
  currentChannel = ch;
  const video = document.getElementById("player");
  video.src = ch.url;
  document.getElementById("now-title").innerText = ch.name;
  document.getElementById("now-epg").innerText = getNowProgram(ch.name);
  localStorage.setItem("lastChannel", JSON.stringify(ch));
}

function restoreLastWatched() {
  const last = localStorage.getItem("lastChannel");
  if (last) {
    const ch = JSON.parse(last);
    playChannel(ch);
  }
}

function toggleFavorite(name) {
  if (favorites.includes(name)) {
    favorites = favorites.filter(f => f !== name);
  } else {
    favorites.push(name);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderChannelGrid();
}

function showFavoritesOnly() {
  if (document.getElementById("category").value === "Favorites") {
    filteredChannels = channels.filter(c => favorites.includes(c.name));
  } else {
    const group = document.getElementById("category").value;
    filteredChannels = group === "All" ? channels : channels.filter(c => c.group === group);
  }
  const search = document.getElementById("search").value.toLowerCase();
  if (search) {
    filteredChannels = filteredChannels.filter(c => c.name.toLowerCase().includes(search));
  }
  currentPage = 0;
  renderChannelGrid();
}

function showLoader(state) {
  document.getElementById("loader").style.display = state ? "flex" : "none";
}

function handleSearchChange() {
  showFavoritesOnly();
}

function importM3UFromURL() {
  const url = prompt("Enter M3U playlist URL:");
  if (url) loadChannels(url);
}

function setupClock() {
  setInterval(() => {
    const d = new Date();
    document.getElementById("clock").innerText = d.toLocaleTimeString();
  }, 1000);
}

function autoRefreshEPG() {
  setInterval(() => {
    loadEPG();
    renderChannelGrid();
  }, 5 * 60 * 1000);
}

function goPrevPage() {
  if (currentPage > 0) {
    currentPage--;
    renderChannelGrid();
  }
}

function goNextPage() {
  if ((currentPage + 1) * 2 < filteredChannels.length) {
    currentPage++;
    renderChannelGrid();
  }
}

window.onload = () => {
  favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  setupClock();
  autoRefreshEPG();
  loadChannels();
  document.getElementById("search").addEventListener("input", handleSearchChange);
  document.getElementById("category").addEventListener("change", showFavoritesOnly);
};
                   
