
const m3uUrl = "https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/refs/heads/main/IPTVPREMIUM.m3u";

const player = videojs("videoPlayer");
const categoryList = document.getElementById("categoryList");
const channelList = document.getElementById("channelList");

let allChannels = [];
let categorized = {};

fetch(m3uUrl)
  .then((res) => res.text())
  .then((data) => {
    const lines = data.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXTINF")) {
        const nameMatch = lines[i].match(/,(.*)/);
        const name = nameMatch ? nameMatch[1].trim() : "Unnamed";
        const groupMatch = lines[i].match(/group-title="(.*?)"/);
        const group = groupMatch ? groupMatch[1] : "Uncategorized";
        const url = lines[i + 1];

        if (!categorized[group]) categorized[group] = [];
        categorized[group].push({ name, url });
        allChannels.push({ name, group, url });
      }
    }

    // Fill categories
    for (const group in categorized) {
      const option = document.createElement("option");
      option.value = group;
      option.textContent = group;
      categoryList.appendChild(option);
    }

    categoryList.addEventListener("change", updateChannelList);
    channelList.addEventListener("change", playSelectedChannel);

    categoryList.value = Object.keys(categorized)[0];
    updateChannelList();
  });

function updateChannelList() {
  const group = categoryList.value;
  const channels = categorized[group];

  channelList.innerHTML = "";
  channels.forEach((channel, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = channel.name;
    channelList.appendChild(option);
  });

  channelList.selectedIndex = 0;
  playChannel(categorized[group][0]);
}

function playSelectedChannel() {
  const group = categoryList.value;
  const channel = categorized[group][channelList.value];
  playChannel(channel);
}

function playChannel(channel) {
  const type = detectType(channel.url);
  player.src({ src: channel.url, type });
  player.play();
}

function detectType(url) {
  if (url.endsWith(".m3u8")) return "application/x-mpegURL";
  if (url.endsWith(".mpd")) return "application/dash+xml";
  return "video/mp4";
}
