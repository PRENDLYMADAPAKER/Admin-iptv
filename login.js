// login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { registerDevice, watchDeviceRemoval } from "./deviceManager.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA0TjMoFSYBIs0VQ9shUilOuDGb1uXHjKI",
  authDomain: "iptv-log-in.firebaseapp.com",
  projectId: "iptv-log-in",
  storageBucket: "iptv-log-in.firebasestorage.app",
  messagingSenderId: "820026131349",
  appId: "1:820026131349:web:417abd6ad9057c55a92c9c",
  measurementId: "G-4Y8T6J595Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get elements
const loginForm = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");
const spinner = document.getElementById("spinner");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

// Toggle show/hide password
togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.textContent = isHidden ? "Hide" : "Show";
});

// Handle login form submit
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.email.value.trim();
  const password = loginForm.password.value.trim();

  errorMsg.textContent = "";
  spinner.style.display = "inline-block";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // wait for onAuthStateChanged to redirect
  } catch (error) {
    spinner.style.display = "none";
    errorMsg.textContent = error.message;
  }
});

// When user is logged in
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      await registerDevice();
      watchDeviceRemoval();
      window.location.href = "index.html";
    } catch (err) {
      errorMsg.textContent = "Device registration failed.";
      spinner.style.display = "none";
    }
  }
});
