// Import SDK Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

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
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
