import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, get, set, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0TjMoFSYBIs0VQ9shUilOuDGb1uXHjKI",
  authDomain: "iptv-log-in.firebaseapp.com",
  projectId: "iptv-log-in",
  storageBucket: "iptv-log-in.appspot.com",
  messagingSenderId: "820026131349",
  appId: "1:820026131349:web:417abd6ad9057c55a92c9c",
  databaseURL: "https://iptv-log-in-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.textContent = type === "password" ? "👁️" : "🙈";
  });

  document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!email || !password) return alert("Please enter both fields.");

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;
      const deviceId = window.localStorage.getItem("deviceId") || crypto.randomUUID();
      window.localStorage.setItem("deviceId", deviceId);

      const devicesRef = ref(db, "users/" + uid + "/devices");
      const snapshot = await get(devicesRef);
      const devices = snapshot.exists() ? Object.values(snapshot.val()) : [];

      if (!devices.includes(deviceId)) {
        if (devices.length >= 2) {
          alert("Maximum 2 devices allowed.");
          return;
        }
        await set(push(devicesRef), deviceId);
      }

      window.location.href = "index.html";
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });
});
