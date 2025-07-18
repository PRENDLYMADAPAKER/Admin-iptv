import React, { useEffect, useState, useRef } from 'react';
import Hls from 'hls.js';
import { useSwipeable } from 'react-swipeable';

const M3U_URL = "https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/main/IPTVPREMIUM.m3u";

function App() {
  const videoRef = useRef(null);
  const [channels, setChannels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetch(M3U_URL)
      .then(res => res.text())
      .then(parseM3U);
  }, []);

  useEffect(() => {
    if (channels.length > 0) playChannel(currentIndex);
  }, [channels, currentIndex]);

  const parseM3U = (data) => {
    const lines = data.split('
');
    const parsed = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('#EXTINF')) {
        const name = lines[i].split(',')[1];
        const logo = lines[i].match(/tvg-logo="(.*?)"/)?.[1] || '';
        const group = lines[i].match(/group-title="(.*?)"/)?.[1] || 'Other';
        const url = lines[i + 1];
        parsed.push({ name, url, logo, group });
      }
    }
    setChannels(parsed);
  };

  const playChannel = (index) => {
    const video = videoRef.current;
    const channel = filteredChannels[index];
    if (!channel) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(channel.url);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url;
    }
    video.play();
  };

  const toggleFavorite = (channel) => {
    const updated = favorites.some(f => f.url === channel.url)
      ? favorites.filter(f => f.url !== channel.url)
      : [...favorites, channel];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const filteredChannels = channels.filter(c =>
    (categoryFilter === 'All' || c.group === categoryFilter || (categoryFilter === 'Favorites' && favorites.some(f => f.url === c.url))) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ['All', ...new Set(channels.map(c => c.group)), 'Favorites'];

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((currentIndex + 1) % filteredChannels.length),
    onSwipedRight: () => setCurrentIndex((currentIndex - 1 + filteredChannels.length) % filteredChannels.length),
    trackMouse: true
  });

  const currentChannel = filteredChannels[currentIndex] || {};

  return (
    <div className="text-white bg-black min-h-screen" {...swipeHandlers}>
      <div className="sticky top-0 z-10 bg-black">
        <video ref={videoRef} controls className="w-full h-64 bg-black" />
        <div className="p-2 flex items-center space-x-2">
          {currentChannel.logo && <img src={currentChannel.logo} alt="logo" className="h-6 w-6" />}
          <span className="text-lg font-semibold">{currentChannel.name}</span>
        </div>
      </div>

      <div className="p-2">
        <input
          type="text"
          placeholder="Search channels..."
          className="w-full p-2 mb-2 text-black rounded"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex overflow-x-auto mb-2 space-x-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded ${categoryFilter === cat ? 'bg-orange-500' : 'bg-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {filteredChannels.map((channel, idx) => (
            <div key={channel.url} className="bg-gray-800 p-2 rounded">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentIndex(idx)}>
                {channel.logo && <img src={channel.logo} alt="logo" className="h-6 w-6" />}
                <span>{channel.name}</span>
              </div>
              <button
                onClick={() => toggleFavorite(channel)}
                className="text-xs mt-1 text-yellow-400"
              >
                {favorites.some(f => f.url === channel.url) ? '★ Favorite' : '☆ Add to Favorite'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
