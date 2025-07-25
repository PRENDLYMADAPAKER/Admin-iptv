// Firebase initialization
const firebaseConfig = {
  apiKey: "AIzaSyA0TjMoFSYBIs0VQ9shUilOuDGb1uXHjKI",
  authDomain: "iptv-log-in.firebaseapp.com",
  databaseURL: "https://iptv-log-in-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iptv-log-in",
  storageBucket: "iptv-log-in.appspot.com",
  messagingSenderId: "820026131349",
  appId: "1:820026131349:web:417abd6ad9057c55a92c9c"
};

firebase.initializeApp(firebaseConfig);
const functions = firebase.functions();
const auth = firebase.auth();
const db = firebase.database();

const adminEmail = "admin@nzmiptv.com"; // Only allow this email to log in

// 🔐 Admin Login
async function adminLogin() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    if (result.user.email !== adminEmail) {
      alert("Unauthorized admin.");
      auth.signOut();
    } else {
      alert("✅ Welcome admin!");
      document.getElementById("loginForm").style.display = "none";
      document.getElementById("adminPanel").style.display = "block";
      loadUserList();
    }
  } catch (error) {
    alert("❌ Login failed: " + error.message);
  }
}

// 📋 Load user list
async function loadUserList() {
  const listUsers = functions.httpsCallable('listUsers');
  const result = await listUsers();

  const table = document.getElementById("userTable");
  table.innerHTML = ""; // clear previous

  result.data.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.email}</td>
      <td>${user.uid}</td>
      <td>
        <button onclick="forceLogout('${user.uid}')">🚫 Force Logout</button>
      </td>
    `;
    table.appendChild(row);
  });
}

// ❌ Force Logout
async function forceLogout(uid) {
  try {
    const deviceSessions = await db.ref(`sessions/${uid}`).once("value");
    const sessions = deviceSessions.val();
    if (!sessions) {
      alert("No active sessions found.");
      return;
    }

    const deviceIds = Object.keys(sessions);
    for (const deviceId of deviceIds) {
      await functions.httpsCallable("forceLogout")({ uid, deviceId });
    }

    alert("✅ Forced logout on all devices.");
  } catch (err) {
    alert("❌ Error forcing logout: " + err.message);
  }
}

// ➕ Create New IPTV User
async function createNewUser() {
  const email = document.getElementById("newUserEmail").value;
  const password = document.getElementById("newUserPassword").value;

  if (!email || !password) return alert("Enter email and password.");

  try {
    const result = await functions.httpsCallable("createUser")({ email, password });
    alert("✅ User created! UID: " + result.data.uid);
    document.getElementById("newUserEmail").value = "";
    document.getElementById("newUserPassword").value = "";
    loadUserList();
  } catch (err) {
    alert("❌ Failed to create user: " + err.message);
  }
}
