const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// 🔐 Create new user (from admin panel)
exports.createUser = functions.https.onCall(async (data, context) => {
  const { email, password } = data;
  if (!email || !password) {
    throw new functions.https.HttpsError("invalid-argument", "Missing email or password.");
  }

  const user = await admin.auth().createUser({ email, password });
  return { uid: user.uid };
});

// 📋 List all users (UID + Email + Ban Status)
exports.listUsers = functions.https.onCall(async () => {
  const users = [];
  let nextPageToken;

  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    result.users.forEach(userRecord => {
      users.push({
        uid: userRecord.uid,
        email: userRecord.email || "No Email",
        disabled: userRecord.disabled || false
      });
    });
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  return users;
});

// 🚫 Ban/disable a user
exports.disableUser = functions.https.onCall(async (data) => {
  const { uid } = data;
  if (!uid) throw new functions.https.HttpsError("invalid-argument", "Missing UID");

  await admin.auth().updateUser(uid, { disabled: true });
  return { success: true };
});

// ✅ Unban/enable a user
exports.enableUser = functions.https.onCall(async (data) => {
  const { uid } = data;
  if (!uid) throw new functions.https.HttpsError("invalid-argument", "Missing UID");

  await admin.auth().updateUser(uid, { disabled: false });
  return { success: true };
});

// ❌ Force logout (remove device session from Realtime DB)
exports.forceLogout = functions.https.onCall(async (data) => {
  const { uid, deviceId } = data;
  if (!uid || !deviceId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing UID or Device ID.");
  }

  const sessionRef = admin.database().ref(`sessions/${uid}/${deviceId}`);
  await sessionRef.remove();
  return { success: true };
});
