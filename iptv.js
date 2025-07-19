const m3uUrl = "https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/refs/heads/main/IPTVPREMIUM.m3u";

let channels = [];
let currentChannelIndex = 0;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const videoPlayer = document.getElementById("video-player");
const channelGrid = document.getElementById("channel-grid");
const searchBar = document.getElementById("search-bar");
const categoryFilter = document.getElementById("category-filter");
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
});

searchBar.addEventListener("input", () => renderChannels());
categoryFilter.addEventListener("change", () => renderChannels());

function parseM3U(content) {
  const lines = content.split("\n");
  const result = [];
  let current = {};
  for (let line of lines) {
    if (line.startsWith("#EXTINF")) {
      const nameMatch = line.match(/,(.*)/);
      const tvgLogoMatch = line.match(/tvg-logo="(.*?)"/);
      const groupMatch = line.match(/group-title="(.*?)"/);
      current = {
        name: nameMatch ? nameMatch[1] : "",
        logo: tvgLogoMatch ? tvgLogoMatch[1] : "",
        group: groupMatch ? groupMatch[1] : "",
      };
    } else if (line && !line.startsWith("#")) {
      current.url = line;
      result.push(current);
    }
  }
  return result;
}

function setVideo(channel) {
  videoPlayer.src = channel.url;
  document.getElementById("now-playing-name").innerText = channel.name;
  document.getElementById("now-playing-icon").src = channel.logo;
  currentChannelIndex = channels.indexOf(channel);
}

function renderChannels() {
  const query = searchBar.value.toLowerCase();
  const selectedGroup = categoryFilter.value;
  channelGrid.innerHTML = "";
  channels
    .filter((c) =>
      c.name.toLowerCase().includes(query) &&
      (selectedGroup === "All" || c.group === selectedGroup)
    )
    .forEach((channel) => {
      const div = document.createElement("div");
      div.className = "channel-card";
      div.innerHTML = `
        <img src="${channel.logo}" alt="" />
        <p>${channel.name}</p>
        <button class="fav-btn">${favorites.includes(channel.url) ? "★" : "☆"}</button>
      `;
      div.onclick = () => setVideo(channel);
      div.querySelector(".fav-btn").onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(channel.url);
        renderChannels();
      };
      channelGrid.appendChild(div);
    });
}

function toggleFavorite(url) {
  if (favorites.includes(url)) {
    favorites = favorites.filter((fav) => fav !== url);
  } else {
    favorites.push(url);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function loadCategories() {
  const categories = ["All", ...new Set(channels.map((c) => c.group))];
  categoryFilter.innerHTML = categories.map(
    (cat) => `<option value="${cat}">${cat}</option>`
  ).join("");
}

function setupSwipe() {
  let startX = 0;
  videoPlayer.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });
  videoPlayer.addEventListener("touchend", (e) => {
    const diffX = e.changedTouches[0].clientX - startX;
    if (diffX > 50) {
      switchChannel(-1);
    } else if (diffX < -50) {
      switchChannel(1);
    }
  });
}

function switchChannel(offset) {
  let newIndex = currentChannelIndex + offset;
  if (newIndex < 0) newIndex = channels.length - 1;
  if (newIndex >= channels.length) newIndex = 0;
  setVideo(channels[newIndex]);
}

fetch(m3uUrl)
  .then((res) => res.text())
  .then((text) => {
    channels = parseM3U(text);
    loadCategories();
    renderChannels();
    setVideo(channels[0]);
    setupSwipe();
  });
