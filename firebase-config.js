// firebase-config.js — Modular SDK v9 via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpaHYyuR74rYAXjkpuzXyJcaVH9Ni_UYc",
  authDomain: "ujianberat-2a101.firebaseapp.com",
  projectId: "ujianberat-2a101",
  storageBucket: "ujianberat-2a101.firebasestorage.app",
  messagingSenderId: "100632361604",
  appId: "1:100632361604:web:57f2e62a9c339887b6e0d1",
  databaseURL: "https://ujianberat-2a101-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export { app };
