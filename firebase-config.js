// firebase-config.js
// ⚡ Firebase Config - Menggunakan CDN URLs agar kompatibel dengan browser ES Modules

// Import Firebase SDK v9 Modular via CDN (dengan version pinning)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Konfigurasi dari Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDpaHYyuR74rYAXjkpuzXyJcaVH9Ni_UYc",
  authDomain: "ujianberat-2a101.firebaseapp.com",
  projectId: "ujianberat-2a101",
  storageBucket: "ujianberat-2a101.firebasestorage.app",
  messagingSenderId: "100632361604",
  appId: "1:100632361604:web:57f2e62a9c339887b6e0d1",
  databaseURL: "https://ujianberat-2a101-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Export modul yang dibutuhkan
export const auth = getAuth(app);
export const db = getFirestore(app);      // Firestore (jika dipakai nanti)
export const rtdb = getDatabase(app);     // Realtime Database (yang kita pakai sekarang)

// Export app juga untuk keperluan lain
export { app };
