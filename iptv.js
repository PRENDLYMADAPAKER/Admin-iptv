// IPTV.js

const video = document.getElementById('video-player');
const searchInput = document.getElementById('search-bar');
const categoryFilter = document.getElementById('category-filter');
const channelGrid = document.getElementById('channel-grid');
const logoutBtn = document.getElementById('logout-btn');
const channelIcon = document.getElementById('channel-icon');
const channelName = document.getElementById('channel-name');

const m3uUrl = 'https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/refs/heads/main/IPTVPREMIUM.m3u';
const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

let allChannels = [];
let currentCategory = 'All';

// Logout button
logoutBtn.addEventListener('click', () => {
  firebase.auth().signOut().then(() => {
    window.location.href = 'index.html';
  });
});

// Parse M3U Playlist
async function loadChannels() {
  const res = await fetch(m3uUrl);
  const text = await res.text();
  const lines = text.split('\n');
  let channels = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXTINF')) {
      const nameMatch = lines[i].match(/tvg-name="(.*?)"/);
      const logoMatch = lines[i].match(/tvg-logo="(.*?)"/);
      const groupMatch = lines[i].match(/group-title="(.*?)"/);

      channels.push({
        name: nameMatch ? nameMatch[1] : 'Unknown',
        logo: logoMatch ? logoMatch[1] : '',
        group: groupMatch ? groupMatch[1] : 'Others',
        url: lines[i + 1],
      });
    }
  }

  allChannels = channels;
  populateCategoryFilter();
  displayChannels();
  if (channels.length > 0) playChannel(channels[0]);
}

// Display channels based on filter
function displayChannels() {
  const keyword = searchInput.value.toLowerCase();
  channelGrid.innerHTML = '';

  let filtered = allChannels.filter(ch =>
    (currentCategory === 'All' || ch.group === currentCategory || (currentCategory === 'Favorites' && favorites.includes(ch.url))) &&
    ch.name.toLowerCase().includes(keyword)
  );

  filtered.forEach(ch => {
    const card = document.createElement('div');
    card.className = 'channel-card';

    card.innerHTML = `
      <img src="${ch.logo}" alt="${ch.name}" />
      <div class="channel-name">${ch.name}</div>
      <div class="favorite-star">${favorites.includes(ch.url) ? '★' : '☆'}</div>
    `;

    card.onclick = () => {
      playChannel(ch);
    };

    card.querySelector('.favorite-star').onclick = e => {
      e.stopPropagation();
      toggleFavorite(ch.url);
      displayChannels();
    };

    channelGrid.appendChild(card);
  });
}

function playChannel(channel) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(channel.url);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = channel.url;
  } else {
    alert('Your browser does not support HLS');
  }

  channelIcon.src = channel.logo;
  channelName.textContent = channel.name;
}

function toggleFavorite(url) {
  if (favorites.includes(url)) {
    favorites.splice(favorites.indexOf(url), 1);
  } else {
    favorites.push(url);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function populateCategoryFilter() {
  const categories = [...new Set(allChannels.map(ch => ch.group))];
  categoryFilter.innerHTML = '<option value="All">All</option><option value="Favorites">Favorites</option>';

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

searchInput.addEventListener('input', displayChannels);
categoryFilter.addEventListener('change', e => {
  currentCategory = e.target.value;
  displayChannels();
});

loadChannels();
