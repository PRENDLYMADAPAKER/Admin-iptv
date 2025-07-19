import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Check if user is logged in
onAuthStateChanged(auth, user => {
  if (!user) window.location.href = 'login.html';
  else loadChannels();
});

// Sample M3U channel loader (basic)
function loadChannels() {
  const video = document.getElementById('videoPlayer');
  const channelList = document.getElementById('channelList');
  const m3uUrl = "https://raw.githubusercontent.com/PRENDLYMADAPAKER/ANG-KALAT-MO/refs/heads/main/IPTVPREMIUM.m3u";

  fetch(m3uUrl)
    .then(res => res.text())
    .then(text => {
      const lines = text.split('\n');
      const channels = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXTINF")) {
          const name = lines[i].split(",")[1];
          const url = lines[i + 1];
          channels.push({ name, url });
        }
      }
      channels.forEach(c => {
        const btn = document.createElement("button");
        btn.textContent = c.name;
        btn.onclick = () => video.src = c.url;
        channelList.appendChild(btn);
      });
    });
}

// Logout function
window.logout = () => {
  signOut(auth).then(() => window.location.href = 'login.html');
};