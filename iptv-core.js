<!DOCTYPE html>
<html>
<head>
  <title>IPTV Premium</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto&display=swap">
  <style>
    body { margin: 0; background: #111; font-family: 'Roboto', sans-serif; color: white; }
    header {
      background: #1c1c1c;
      padding: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #logo { font-size: 24px; color: #ff5722; font-weight: bold; }
    #clock { font-size: 14px; }
    #videoPlayer { width: 100%; height: 220px; background: black; }
    #nowPlaying {
      background: #222;
      padding: 10px;
      display: flex;
      align-items: center;
    }
    #nowPlaying img {
      height: 40px;
      margin-right: 10px;
    }
    #epgNow { font-weight: bold; color: #ccc; }
    #search, #categorySelect {
      width: 48%; padding: 8px; font-size: 16px;
      margin: 10px 1%; border-radius: 6px; border: none;
    }
    #gridContainer {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    .channelCard {
      width: 45%; margin: 10px;
      background: #1a1a1a; border-radius: 12px;
      padding: 10px; text-align: center; box-shadow: 0 2px 8px #000;
    }
    .channelCard img {
      width: 100%; height: 100px; object-fit: contain; border-radius: 8px;
    }
    .favoriteBtn {
      background: transparent; border: none; color: #ffcc00; font-size: 20px; margin-top: 4px;
    }
    #settingsBtn, #logoutBtn {
      position: fixed;
      bottom: 20px;
      width: 40px; height: 40px;
      background: #ff5722;
      border-radius: 50%; text-align: center; line-height: 40px;
      color: white; font-size: 20px;
    }
    #settingsBtn { right: 20px; }
    #logoutBtn { left: 20px; }
    #buffering {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8); padding: 20px;
      border-radius: 10px; display: none;
    }
  </style>
</head>
<body>
  <header>
    <div id="logo">IPTV Premium</div>
    <div id="clock"></div>
  </header>
  <video id="videoPlayer" controls autoplay></video>

  <div id="nowPlaying">
    <img id="nowIcon" src="" alt="Icon">
    <div>
      <div id="nowTitle">Now Playing</div>
      <div id="epgNow"></div>
    </div>
  </div>

  <div style="padding: 10px; display: flex; justify-content: space-between;">
    <input type="text" id="search" placeholder="Search channels...">
    <select id="categorySelect"></select>
  </div>

  <div id="gridContainer"></div>

  <div id="buffering">Buffering...</div>
  <button id="settingsBtn">⚙️</button>
  <button id="logoutBtn">🚪</button>

  <script src="iptv-core.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.5.0/firebase-auth-compat.js"></script>
  <script>
    // Firebase Config
    firebase.initializeApp({
      apiKey: "AIzaSyA0TjMoFSYBIs0VQ9shUilOuDGb1uXHjKI",
      authDomain: "iptv-log-in.firebaseapp.com",
      projectId: "iptv-log-in",
      appId: "1:820026131349:web:417abd6ad9057c55a92c9c"
    });

    firebase.auth().onAuthStateChanged(user => {
      if (!user) window.location.href = "index.html";
    });

    document.getElementById("logoutBtn").onclick = () => {
      firebase.auth().signOut().then(() => window.location.href = "index.html");
    }

    // Live clock
    setInterval(() => {
      document.getElementById("clock").textContent = new Date().toLocaleTimeString();
    }, 1000);
  </script>
</body>
</html>
