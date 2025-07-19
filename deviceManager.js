// deviceManager.js

import { getDatabase, ref, get, set, remove, update, onValue } from "firebase/database"; import { getAuth } from "firebase/auth";

// Generate or retrieve a unique device ID export function getDeviceId() { let deviceId = localStorage.getItem('deviceId'); if (!deviceId) { deviceId = crypto.randomUUID(); localStorage.setItem('deviceId', deviceId); } return deviceId; }

// Register the device, auto-remove oldest if over limit export async function registerDevice() { const auth = getAuth(); const user = auth.currentUser; const db = getDatabase(); const deviceId = getDeviceId(); const now = Date.now();

const devicesRef = ref(db, users/${user.uid}/devices); const snapshot = await get(devicesRef);

if (snapshot.exists()) { const devices = snapshot.val(); const deviceCount = Object.keys(devices).length;

if (devices[deviceId]) {
  // Already registered, just update timestamp
  await update(ref(db, `users/${user.uid}/devices/${deviceId}`), {
    lastSeen: now,
  });
  return;
}

if (deviceCount >= 2) {
  // Remove the least recently used device
  const sorted = Object.entries(devices).sort((a, b) => a[1].lastSeen - b[1].lastSeen);
  const oldestDeviceId = sorted[0][0];
  await remove(ref(db, `users/${user.uid}/devices/${oldestDeviceId}`));
}

}

// Register new device await set(ref(db, users/${user.uid}/devices/${deviceId}), { lastSeen: now, platform: navigator.userAgent, }); }

// Optional: Monitor if device is removed export function watchDeviceRemoval() { const auth = getAuth(); const db = getDatabase(); const deviceId = getDeviceId();

const deviceRef = ref(db, users/${auth.currentUser.uid}/devices/${deviceId});

onValue(deviceRef, (snapshot) => { if (!snapshot.exists()) { alert("You have been logged out because your account exceeded the 2-device limit."); auth.signOut(); localStorage.removeItem('deviceId'); window.location.reload(); } }); }

  
