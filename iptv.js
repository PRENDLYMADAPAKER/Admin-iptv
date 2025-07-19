const m3uUrl = "https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/refs/heads/main/IPTVPREMIUM.m3u";
let channels = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentChannel = null;

const videoPlayer = document.getElementById("video-player");
const channelGrid = document.getElementById("channel-grid");
const channelCarousel = document.getElementById("channel-carousel");
const searchBar = document.getElementById("search-bar");
const categoryFilter = document.getElementById("category-filter");
const channelName = document.getElementById("channel-name");
const channelIcon = document.getElementById("channel-icon");
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});

searchBar.addEventListener("input", renderChannels);
categoryFilter.addEventListener("change", renderChannels);

function parseM3U(data) {
  const lines = data.split("\n");
  let parsed = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const nameMatch = lines[i].match(/tvg-name="([^"]+)"/);
      const logoMatch = lines[i].match(/tvg-logo="([^"]+)"/);
      const groupMatch = lines[i].match(/group-title="([^"]+)"/);

      const name = nameMatch ? nameMatch[1] : "Unknown";
      const logo = logoMatch ? logoMatch[1] : "https://via.placeholder.com/100x60?text=Logo";
      const group = groupMatch ? groupMatch[1] : "Others";
      const url = lines[i + 1]?.trim();

      if (url && url.startsWith("http")) {
        parsed.push({ name, logo, group, url });
      }
    }
  }
  return parsed;
}

async function loadM3U() {
  try {
    const res = await fetch(m3uUrl);
    const data = await res.text();
    channels = parseM3U(data);
    populateCategories();
    renderChannels();
    renderCarousel();
    if (channels.length > 0) loadVideo(channels[0]);
  } catch (err) {
    console.error("Failed to load M3U:", err);
  }
}

function populateCategories() {
  const groups = [...new Set(channels.map(c => c.group))].sort();
  groups.forEach(group => {
    const option = document.createElement("option");
    option.textContent = group;
    categoryFilter.appendChild(option);
  });
}

function renderChannels() {
  const query = searchBar.value.toLowerCase();
  const category = categoryFilter.value;

  let filtered = channels.filter(c =>
    (category === "All" || c.group === category || category === "Favorites" && favorites.includes(c.name)) &&
    c.name.toLowerCase().includes(query)
  );

  // Remove current playing channel from list
  filtered = filtered.filter(c => c.url !== currentChannel?.url);

  channelGrid.innerHTML = "";
  filtered.forEach(channel => {
    const card = document.createElement("div");
    card.className = "channel-card";

    card.innerHTML = `
      <img src="${channel.logo}" alt="${channel.name}" />
      <p>${channel.name}</p>
      <span class="fav-star ${favorites.includes(channel.name) ? 'active' : ''}">&#9733;</span>
    `;

    card.querySelector("img, p").addEventListener("click", () => loadVideo(channel));

    card.querySelector(".fav-star").addEventListener("click", e => {
      e.stopPropagation();
      toggleFavorite(channel.name);
      renderChannels();
    });

    channelGrid.appendChild(card);
  });
}

function toggleFavorite(name) {
  if (favorites.includes(name)) {
    favorites = favorites.filter(f => f !== name);
  } else {
    favorites.push(name);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function loadVideo(channel) {
  currentChannel = channel;
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(channel.url);
    hls.attachMedia(videoPlayer);
  } else {
    videoPlayer.src = channel.url;
  }
  channelName.textContent = channel.name;
  channelIcon.src = channel.logo;

  renderChannels(); // Re-render to hide currently playing
}

function renderCarousel() {
  channelCarousel.innerHTML = "";
  channels.slice(0, 10).forEach(channel => {
    const item = document.createElement("div");
    item.className = "carousel-item";
    item.innerHTML = `
      <img src="${channel.logo}" alt="${channel.name}" />
      <p>${channel.name}</p>
    `;
    item.addEventListener("click", () => loadVideo(channel));
    channelCarousel.appendChild(item);
  });

  // Swipe functionality (basic horizontal scroll)
  let isDown = false, startX, scrollLeft;

  channelCarousel.addEventListener("mousedown", e => {
    isDown = true;
    startX = e.pageX - channelCarousel.offsetLeft;
    scrollLeft = channelCarousel.scrollLeft;
  });
  channelCarousel.addEventListener("mouseleave", () => isDown = false);
  channelCarousel.addEventListener("mouseup", () => isDown = false);
  channelCarousel.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - channelCarousel.offsetLeft;
    const walk = (x - startX) * 2;
    channelCarousel.scrollLeft = scrollLeft - walk;
  });
}

loadM3U();
