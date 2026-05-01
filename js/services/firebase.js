// js/services/firebase.js
// ⚡ Firebase Service Layer - Modular SDK v9 + Import dari firebase-config.js

// Import dari firebase-config.js (path: js/services/ → root = ../../)
import { rtdb } from '../../firebase-config.js';
import { ref, set, push, onValue, remove, query, orderByChild, equalTo, get } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

export const FirebaseService = {
  // Database reference sudah di-import dari config
  db: rtdb,

  // ── UTILS ──
  generateId() {
    return push(ref(this.db, '_temp')).key;
  },

  timestamp() {
    // Server timestamp untuk Realtime Database
    return { '.sv': 'timestamp' };
  },

  // ── READ (Once) ──
  async get(path) {
    try {
      const snapshot = await get(ref(this.db, path));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (e) {
      console.error(`❌ Get error [${path}]:`, e);
      return null;
    }
  },

  // ── READ (Realtime Listener) ──
  onValue(path, callback, errorCb) {
    const dbRef = ref(this.db, path);
    const unsubscribe = onValue(dbRef, 
      (snapshot) => callback(snapshot.val()),
      (error) => {
        console.error(`❌ Listener error [${path}]:`, error);
        if (errorCb) errorCb(error);
      }
    );
    return unsubscribe; // Return function to unsubscribe
  },

  // ── WRITE ──
  async set(path, data) {
    try {
      await set(ref(this.db, path), data);
      return true;
    } catch (e) {
      console.error(`❌ Set error [${path}]:`, e);
      return false;
    }
  },

  // ── UPDATE (merge) ──
  async update(path, data) {
    try {
      await set(ref(this.db, path), data); // Realtime DB: set() juga bisa untuk update
      return true;
    } catch (e) {
      console.error(`❌ Update error [${path}]:`, e);
      return false;
    }
  },

  // ── PUSH (auto-id) ──
  async push(path, data) {
    try {
      const newRef = push(ref(this.db, path), data);
      return newRef.key;
    } catch (e) {
      console.error(`❌ Push error [${path}]:`, e);
      return null;
    }
  },

  // ── DELETE ──
  async remove(path) {
    try {
      await remove(ref(this.db, path));
      return true;
    } catch (e) {
      console.error(`❌ Remove error [${path}]:`, e);
      return false;
    }
  },

  // ── QUERY ──
  async query(path, orderByField, equalToValue) {
    try {
      let dbRef = ref(this.db, path);
      if (orderByField && equalToValue !== undefined) {
        dbRef = query(dbRef, orderByChild(orderByField), equalTo(equalToValue));
      }
      const snapshot = await get(dbRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (e) {
      console.error(`❌ Query error [${path}]:`, e);
      return null;
    }
  }
};

export default FirebaseService;
