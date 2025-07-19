const m3uUrl = "https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/refs/heads/main/IPTVPREMIUM.m3u";

let channels = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentIndex = 0;

const videoPlayer = document.getElementById("video-player");
const channelGrid = document.getElementById("channel-grid");
const searchBar = document.getElementById("search-bar");
const // iptv.js

const m3uUrl = "https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/refs/heads/main/IPTVPREMIUM.m3u";
let channels = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const videoPlayer = document.getElementById("video-player");
const channelGrid = document.getElementById("channel-grid");
const searchBar = document.getElementById("search-bar");
const categoryFilter = document.getElementById("category-filter");
const channelName = document.getElementById("channel-name");
const channelIcon = document.getElementById("channel-icon");
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.onclick = () => {
  firebase.auth().signOut().then(() => window.location.href = "login.html");
};

function parseM3U(data) {
  const lines = data.split("\n");
  let current = {};
  let list = [];

  for (let line of lines) {
    if (line.startsWith("#EXTINF")) {
      const name = line.match(/,(.*)/)?.[1]?.trim();
      const logo = line.match(/tvg-logo="(.*?)"/)?.[1] || "";
      const group = line.match(/group-title="(.*?)"/)?.[1] || "Other";
      current = { name, logo, group };
    } else if (line.startsWith("http")) {
      current.url = line.trim();
      list.push(current);
      current = {};
    }
  }
  return list;
}

function loadVideo(channel) {
  videoPlayer.src = channel.url;
  channelName.textContent = channel.name;
  channelIcon.src = channel.logo || "";
}

function renderChannels(filtered) {
  channelGrid.innerHTML = "";
  filtered.forEach((channel) => {
    const card = document.createElement("div");
    card.className = "channel-card";

    const img = document.createElement("img");
    img.src = channel.logo || "";
    card.appendChild(img);

    const title = document.createElement("p");
    title.textContent = channel.name;
    card.appendChild(title);

    const fav = document.createElement("span");
    fav.innerHTML = favorites.includes(channel.url) ? "★" : "☆";
    fav.className = "favorite";
    fav.onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(channel.url);
      renderChannels(getFilteredChannels());
    };
    card.appendChild(fav);

    card.onclick = () => loadVideo(channel);
    channelGrid.appendChild(card);
  });
}

function getFilteredChannels() {
  const search = searchBar.value.toLowerCase();
  const category = categoryFilter.value;

  return channels.filter((c) => {
    const matchesCategory = category === "All" || c.group === category || (category === "Favorites" && favorites.includes(c.url));
    const matchesSearch = c.name.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });
}

function populateCategories() {
  const categories = [...new Set(channels.map(c => c.group))];
  categoryFilter.innerHTML = "<option>All</option><option>Favorites</option>" +
    categories.map(c => `<option>${c}</option>`).join("");
}

function toggleFavorite(url) {
  if (favorites.includes(url)) {
    favorites = favorites.filter(f => f !== url);
  } else {
    favorites.push(url);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

searchBar.addEventListener("input", () => renderChannels(getFilteredChannels()));
categoryFilter.addEventListener("change", () => renderChannels(getFilteredChannels()));

fetch(m3uUrl)
  .then(res => res.text())
  .then(data => {
    channels = parseM3U(data);
    populateCategories();
    renderChannels(channels);
    if (channels.length > 0) loadVideo(channels[0]);
  });
 = document.getElementById("category-filter");
const channelName = document.getElementById("channel-name");
const channelIcon = document.getElementById("channel-icon");
const carousel = document.getElementById("channel-carousel");
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.onclick = () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
};

function parseM3U(data) {
  const lines = data.split('\n');
  const result = [];
  let temp = {};
  lines.forEach((line) => {
    if (line.startsWith("#EXTINF")) {
      const nameMatch = line.match(/,(.*)/);
      const logoMatch = line.match(/tvg-logo="(.*?)"/);
      temp.name = nameMatch ? nameMatch[1].trim() : "Unknown";
      temp.logo = logoMatch ? logoMatch[1] : "";
    } else if (line && !line.startsWith("#")) {
      temp.url = line.trim();
      result.push({...temp});
    }
  });
  return result;
}

function loadVideo(url) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(videoPlayer);
  } else if (videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {
    videoPlayer.src = url;
  }
}

function updateNowPlaying(channel) {
  channelName.textContent = channel.name;
  channelIcon.src = channel.logo || "default-icon.png";
}

function renderChannels(list) {
  channelGrid.innerHTML = "";
  list.forEach((channel, index) => {
    const card = document.createElement("div");
    card.className = "channel-card";
    card.innerHTML = `
      <img src="${channel.logo || "default-icon.png"}" />
      <span>${channel.name}</span>
      <div class="star">${favorites.includes(channel.url) ? '⭐' : ''}</div>
    `;
    card.onclick = () => {
      currentIndex = index;
      loadVideo(channel.url);
      updateNowPlaying(channel);
    };
    channelGrid.appendChild(card);
  });
}

function renderCarousel() {
  carousel.innerHTML = "";
  channels.slice(0, 10).forEach((channel, index) => {
    const thumb = document.createElement("div");
    thumb.className = "channel-card";
    thumb.innerHTML = `
      <img src="${channel.logo || "default-icon.png"}" />
      <span>${channel.name}</span>
    `;
    thumb.onclick = () => {
      currentIndex = index;
      loadVideo(channel.url);
      updateNowPlaying(channel);
    };
    carousel.appendChild(thumb);
  });
}

function applyFilters() {
  const search = searchBar.value.toLowerCase();
  const category = categoryFilter.value;
  const filtered = channels.filter(c =>
    (c.name.toLowerCase().includes(search)) &&
    (category === "All" || (category === "Favorites" && favorites.includes(c.url)))
  );
  renderChannels(filtered);
}

searchBar.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

fetch(m3uUrl)
  .then(res => res.text())
  .then(text => {
    channels = parseM3U(text);
    renderChannels(channels);
    renderCarousel();
    if (channels.length > 0) {
      loadVideo(channels[0].url);
      updateNowPlaying(channels[0]);
    }
  });
