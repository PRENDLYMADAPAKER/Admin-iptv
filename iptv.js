const m3uUrl = "https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/refs/heads/main/IPTVPREMIUM.m3u";

let channels = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentIndex = 0;

const videoPlayer = document.getElementById("video-player");
const channelGrid = document.getElementById("channel-grid");
const searchBar = document.getElementById("search-bar");
const categoryFilter = document.getElementById("category-filter");
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
