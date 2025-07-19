// iptv-core.js (Fixed + Enhanced for M3U parsing and rendering)

const M3U_URL = "https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/main/IPTVPREMIUM.m3u"; const EPG_URL = "https://tinyurl.com/DrewLive002-epg";

let channels = []; let favorites = JSON.parse(localStorage.getItem("favorites") || "[]"); let lastWatched = localStorage.getItem("lastWatched") || null; let currentIndex = 0;

async function fetchM3U() { try { const res = await fetch(M3U_URL); const text = await res.text(); parseM3U(text); renderChannels(); if (lastWatched) playChannel(lastWatched); } catch (e) { console.error("Failed to load M3U:", e); } }

function parseM3U(data) { const lines = data.split(/\r?\n/); for (let i = 0; i < lines.length; i++) { if (lines[i].startsWith("#EXTINF")) { const infoLine = lines[i]; const url = lines[i + 1]; const nameMatch = infoLine.match(/,(.)$/); const logoMatch = infoLine.match(/tvg-logo="(.?)"/); const groupMatch = infoLine.match(/group-title="(.*?)"/); channels.push({ name: nameMatch ? nameMatch[1] : "Unnamed", logo: logoMatch ? logoMatch[1] : "", group: groupMatch ? groupMatch[1] : "Uncategorized", url }); } } }

function renderChannels() { const grid = document.getElementById("channel-grid"); if (!grid) return; grid.innerHTML = "";

channels.forEach((ch, idx) => { const card = document.createElement("div"); card.className = "channel-card"; card.innerHTML = <img src="${ch.logo}" onerror="this.src='fallback.png'"> <span>${ch.name}</span> <button onclick="toggleFavorite(${idx})"> ${favorites.includes(ch.url) ? "★" : "☆"} </button>; card.onclick = () => playChannel(ch.url, idx); grid.appendChild(card); }); }

function playChannel(url, idx) { const player = document.getElementById("video-player"); const banner = document.getElementById("now-playing"); const icon = document.getElementById("channel-icon");

const channel = channels.find(c => c.url === url); if (!channel || !player) return;

player.src = channel.url; player.play(); localStorage.setItem("lastWatched", channel.url);

if (banner) banner.textContent = channel.name; if (icon && channel.logo) icon.src = channel.logo;

showEPGNow(channel.name); }

function toggleFavorite(index) { const url = channels[index].url; const i = favorites.indexOf(url); if (i >= 0) favorites.splice(i, 1); else favorites.push(url); localStorage.setItem("favorites", JSON.stringify(favorites)); renderChannels(); }

function showEPGNow(channelName) { fetch(EPG_URL) .then(res => res.json()) .then(data => { const match = data.find(epg => epg.name?.toLowerCase() === channelName.toLowerCase()); if (match && match.now) { const now = document.getElementById("epg-now"); if (now) now.textContent = match.now; } }) .catch(console.error); }

document.addEventListener("DOMContentLoaded", fetchM3U);

