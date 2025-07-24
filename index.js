// index.js in functions directory
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Allow admin to create user
exports.createUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  }
  const user = await admin.auth().createUser({
    email: data.email,
    password: data.password
  });
  return { uid: user.uid };
});

// Allow admin to list users
exports.listUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  }
  const list = await admin.auth().listUsers(1000);
  return { users: list.users.map(u => ({ uid: u.uid, email: u.email })) };
});

// Allow admin to delete user
exports.deleteUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  }
  await admin.auth().deleteUser(data.uid);
  return { success: true };
});
