
const base64Url = "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1BSRU5ETFlNQURBUEFLL0FORy1LQUxBVC1NTy9yZWZzL2hlYWRzL21haW4vSVBUVlBSRU1JVU0ubTMu";
const m3uUrl = atob(base64Url);
const player = videojs("videoPlayer");
const categoryList = document.getElementById("categoryList");
const channelList = document.getElementById("channelList");
const searchInput = document.getElementById("searchInput");

let allChannels = [];
let categorized = {};
let currentCategory = "";



function detectType(url) {
  if (url.endsWith(".m3u8")) return "application/x-mpegURL";
  if (url.endsWith(".mpd")) return "application/dash+xml";
  return "video/mp4";
}

fetch(m3uUrl)
  .then((res) => res.text())
  .then((data) => {
    const lines = data.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXTINF")) {
        const name = lines[i].split(",")[1]?.trim() || "Unnamed";
        const group = lines[i].match(/group-title="(.*?)"/)?.[1] || "Uncategorized";
        const logo = lines[i].match(/tvg-logo="(.*?)"/)?.[1] || "https://via.placeholder.com/40x30?text=TV";
        const url = lines[i + 1];

        if (!categorized[group]) categorized[group] = [];
        const channel = { name, url, group, logo };
        categorized[group].push(channel);
        allChannels.push(channel);
      }
    }

    for (const group in categorized) {
      const option = document.createElement("option");
      option.value = group;
      option.textContent = group;
      categoryList.appendChild(option);
    }

    categoryList.addEventListener("change", updateChannelList);
    channelList.addEventListener("change", playSelectedChannel);
    searchInput.addEventListener("input", filterChannels);
    document.getElementById("themeToggle").addEventListener("click", toggleTheme);

    const last = localStorage.getItem("lastChannel");
    categoryList.value = Object.keys(categorized)[0];
    updateChannelList();

    if (last) {
      const found = allChannels.find(c => c.name === last);
      if (found) playChannel(found);
    } else {
      playChannel(categorized[categoryList.value][0]);
    }
  });

function updateChannelList() {
  currentCategory = categoryList.value;
  const channels = categorized[currentCategory];
  channelList.innerHTML = "";
  channels.forEach((ch, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = ch.name;
    channelList.appendChild(option);
  });
  channelList.selectedIndex = 0;
}

function filterChannels() {
  const keyword = searchInput.value.toLowerCase();
  const channels = categorized[currentCategory] || [];
  channelList.innerHTML = "";
  channels.filter(ch => ch.name.toLowerCase().includes(keyword)).forEach((ch, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = ch.name;
    channelList.appendChild(option);
  });
}

function playSelectedChannel() {
  const ch = categorized[categoryList.value][channelList.value];
  playChannel(ch);
}

function playChannel(channel) {
  player.src({ src: channel.url, type: detectType(channel.url) });
  player.play();
  localStorage.setItem("lastChannel", channel.name);
}

function toggleTheme() {
  document.body.classList.toggle("light");
  document.body.classList.toggle("dark");
}
