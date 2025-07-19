// iptv.js

let channels = [];
let filteredChannels = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const video = document.getElementById("video-player");
const searchInput = document.getElementById("search-bar");
const categoryFilter = document.getElementById("category-filter");
const channelGrid = document.getElementById("channel-grid");
const nowPlayingName = document.getElementById("channel-name");
const nowPlayingIcon = document.getElementById("channel-icon");
const logoutBtn = document.getElementById("logout-btn");
const carousel = document.getElementById("channel-carousel");

const M3U_URL = "https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/refs/heads/main/IPTVPREMIUM.m3u";

logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
});

searchInput.addEventListener("input", () => filterChannels());
categoryFilter.addEventListener("change", () => filterChannels());

function loadM3U(url) {
  fetch(url)
    .then(res => res.text())
    .then(data => {
      channels = parseM3U(data);
      filteredChannels = [...channels];
      renderChannels();
      renderCarousel();
      playChannel(filteredChannels[0]);
    });
}

function parseM3U(data) {
  const lines = data.split("\n");
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const name = lines[i].split(",").pop().trim();
      const logo = lines[i].match(/tvg-logo="(.*?)"/);
      const group = lines[i].match(/group-title="(.*?)"/);
      const url = lines[i + 1];

      result.push({
        name,
        url,
        logo: logo ? logo[1] : "",
        group: group ? group[1] : "Uncategorized",
      });
    }
  }
  return result;
}

function renderChannels() {
  channelGrid.innerHTML = "";
  const toRender = filteredChannels;

  toRender.forEach(channel => {
    const card = document.createElement("div");
    card.className = "channel-card";
    card.innerHTML = `
      <img src="${channel.logo}" alt="${channel.name}" />
      <div>${channel.name}</div>
      <div class="favorite" onclick="toggleFavorite(event, '${channel.name}')">
        ${favorites.includes(channel.name) ? '★' : '☆'}
      </div>
    `;
    card.onclick = () => playChannel(channel);
    channelGrid.appendChild(card);
  });
}

function renderCarousel() {
  carousel.innerHTML = "";
  filteredChannels.forEach((channel, idx) => {
    const item = document.createElement("div");
    item.className = "carousel-item";
    item.innerHTML = `
      <img src="${channel.logo}" alt="${channel.name}" />
      <div>${channel.name}</div>
    `;
    item.onclick = () => playChannel(channel);
    carousel.appendChild(item);
  });
}

function playChannel(channel) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(channel.url);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = channel.url;
  }

  nowPlayingName.textContent = channel.name;
  nowPlayingIcon.src = channel.logo || "";
}

function filterChannels() {
  const keyword = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  filteredChannels = channels.filter(ch => {
    const matchesKeyword = ch.name.toLowerCase().includes(keyword);
    const matchesCategory = category === "All" ||
      (category === "Favorites" && favorites.includes(ch.name)) ||
      ch.group === category;
    return matchesKeyword && matchesCategory;
  });

  renderChannels();
  renderCarousel();
}

function toggleFavorite(event, name) {
  event.stopPropagation();
  if (favorites.includes(name)) {
    favorites = favorites.filter(fav => fav !== name);
  } else {
    favorites.push(name);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderChannels();
}

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    loadM3U(M3U_URL);
  }
});
