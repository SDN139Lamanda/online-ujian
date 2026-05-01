// js/services/dataAdapter.js
// ⚡ Data Adapter - Switch antara Local DB dan Firebase Realtime Database

import { DB } from '../core/db.js';
import { FirebaseService } from './firebase.js';

export const DataAdapter = {
  // Deteksi apakah Firebase siap digunakan
  useFirebase: typeof FirebaseService?.db !== 'undefined',

  // ── USERS ──
  async getUsers() {
    if (this.useFirebase) {
      const data = await FirebaseService.get('users');
      return data || {};
    }
    return DB.users;
  },

  async saveUser(username, userData) {
    const dataToSave = { ...userData, updatedAt: Date.now() };
    if (this.useFirebase) {
      return await FirebaseService.set(`users/${username}`, dataToSave);
    }
    DB.users[username] = dataToSave;
    return true;
  },

  async deleteUser(username) {
    if (this.useFirebase) {
      return await FirebaseService.remove(`users/${username}`);
    }
    delete DB.users[username];
    return true;
  },

  // ── KELAS ──
  async getKelas() {
    if (this.useFirebase) {
      const data = await FirebaseService.get('kelas');
      return Array.isArray(data) ? data : [];
    }
    return DB.kelas;
  },

  async saveKelas(kelasList) {
    if (this.useFirebase) {
      return await FirebaseService.set('kelas', kelasList);
    }
    DB.kelas = kelasList;
    return true;
  },

  // ── BANK SOAL ──
  async getBankSoal(guruId = null) {
    if (this.useFirebase) {
      let data;
      if (guruId) {
        data = await FirebaseService.query('bankSoal', 'guruId', guruId);
      } else {
        data = await FirebaseService.get('bankSoal');
      }
      // Realtime DB returns object with keys, convert to array
      if (data && typeof data === 'object') {
        return Object.values(data);
      }
      return [];
    }
    let soal = DB.bankSoal;
    if (guruId) soal = soal.filter(s => s.guruId === guruId);
    return soal;
  },

  async saveSoal(soalData) {
    const dataToSave = { ...soalData, updatedAt: Date.now() };
    if (this.useFirebase) {
      const id = soalData.id || FirebaseService.generateId();
      return await FirebaseService.set(`bankSoal/${id}`, { ...dataToSave, id });
    }
    if (!soalData.id) soalData.id = DB.bankSoal.length + 1;
    DB.bankSoal.push(dataToSave);
    return true;
  },

  async deleteSoal(soalId) {
    if (this.useFirebase) {
      return await FirebaseService.remove(`bankSoal/${soalId}`);
    }
    const idx = DB.bankSoal.findIndex(s => s.id === soalId);
    if (idx !== -1) DB.bankSoal.splice(idx, 1);
    return true;
  },

  // ── UJIAN ──
  async getUjian(guruId = null) {
    if (this.useFirebase) {
      let data = await FirebaseService.get('ujian');
      let list = [];
      if (data && typeof data === 'object') {
        list = Object.values(data);
      }
      if (guruId) list = list.filter(u => u.guruId === guruId);
      return list;
    }
    let list = DB.ujian;
    if (guruId) list = list.filter(u => u.guruId === guruId);
    return list;
  },

  async saveUjian(ujianData) {
    const dataToSave = { ...ujianData, updatedAt: Date.now() };
    if (this.useFirebase) {
      const id = ujianData.id || FirebaseService.generateId();
      return await FirebaseService.set(`ujian/${id}`, { ...dataToSave, id });
    }
    if (!ujianData.id) ujianData.id = 'UJ' + Date.now();
    DB.ujian.push(dataToSave);
    return true;
  },

  async updateUjianStatus(ujianId, status) {
    if (this.useFirebase) {
      return await FirebaseService.update(`ujian/${ujianId}`, { 
        status, 
        updatedAt: Date.now() 
      });
    }
    const u = DB.ujian.find(u => u.id === ujianId);
    if (u) u.status = status;
    return true;
  },

  async deleteUjian(ujianId) {
    if (this.useFirebase) {
      return await FirebaseService.remove(`ujian/${ujianId}`);
    }
    const idx = DB.ujian.findIndex(u => u.id === ujianId);
    if (idx !== -1) DB.ujian.splice(idx, 1);
    return true;
  },

  // ── HASIL UJIAN ──
  async saveHasil(hasilData) {
    const dataToSave = { 
      ...hasilData, 
      timestamp: FirebaseService.timestamp(),
      updatedAt: Date.now()
    };
    if (this.useFirebase) {
      const id = hasilData.id || FirebaseService.generateId();
      return await FirebaseService.set(`hasil/${id}`, { ...dataToSave, id });
    }
    if (!hasilData.id) hasilData.id = 'H' + Date.now();
    DB.hasil.push(dataToSave);
    return true;
  },

  async getHasilByUjian(ujianId) {
    if (this.useFirebase) {
      const data = await FirebaseService.query('hasil', 'ujianId', ujianId);
      if (data && typeof data === 'object') {
        return Object.values(data);
      }
      return [];
    }
    return DB.hasil.filter(h => h.ujianId === ujianId);
  },

  // ── REALTIME LISTENERS (untuk monitoring) ──
  listenUjian(callback) {
    if (this.useFirebase) {
      return FirebaseService.onValue('ujian', (data) => {
        const list = data && typeof data === 'object' ? Object.values(data) : [];
        callback(list);
      });
    }
    // Fallback: polling setiap 10 detik
    const interval = setInterval(() => callback(DB.ujian), 10000);
    return () => clearInterval(interval);
  },

  listenHasil(ujianId, callback) {
    if (this.useFirebase) {
      return FirebaseService.onValue('hasil', (data) => {
        const list = data && typeof data === 'object' ? Object.values(data) : [];
        const filtered = list.filter(h => h.ujianId === ujianId);
        callback(filtered);
      });
    }
    const interval = setInterval(() => {
      callback(DB.hasil.filter(h => h.ujianId === ujianId));
    }, 10000);
    return () => clearInterval(interval);
  }
};

// ── UJIAN ──
async getUjian(guruId = null) {
    if (this.useFirebase) {
        let data = await FirebaseService.get('ujian');
        let list = [];
        if (data && typeof data === 'object') {
            list = Object.values(data);
        }
        if (guruId) list = list.filter(u => u.guruId === guruId);
        return list;
    }
    let list = DB.ujian;
    if (guruId) list = list.filter(u => u.guruId === guruId);
    return list;
},

async saveUjian(ujianData) {
    const dataToSave = { ...ujianData, updatedAt: Date.now() };
    if (this.useFirebase) {
        const id = ujianData.id || FirebaseService.generateId();
        return await FirebaseService.set(`ujian/${id}`, { ...dataToSave, id });
    }
    if (!ujianData.id) ujianData.id = 'UJ' + Date.now();
    DB.ujian.push(dataToSave);
    return true;
},

async updateUjianStatus(ujianId, status) {
    if (this.useFirebase) {
        return await FirebaseService.update(`ujian/${ujianId}`, { 
            status, 
            updatedAt: Date.now() 
        });
    }
    const u = DB.ujian.find(u => u.id === ujianId);
    if (u) u.status = status;
    return true;
},

async deleteUjian(ujianId) {
    if (this.useFirebase) {
        return await FirebaseService.remove(`ujian/${ujianId}`);
    }
    const idx = DB.ujian.findIndex(u => u.id === ujianId);
    if (idx !== -1) DB.ujian.splice(idx, 1);
    return true;
},

// ── HASIL UJIAN ──
async saveHasil(hasilData) {
    const dataToSave = { 
        ...hasilData, 
        timestamp: FirebaseService.timestamp(),
        updatedAt: Date.now()
    };
    if (this.useFirebase) {
        const id = hasilData.id || FirebaseService.generateId();
        return await FirebaseService.set(`hasil/${id}`, { ...dataToSave, id });
    }
    if (!hasilData.id) hasilData.id = 'H' + Date.now();
    DB.hasil.push(dataToSave);
    return true;
},

async getHasilByUjian(ujianId = null) {
    if (this.useFirebase) {
        let data = await FirebaseService.get('hasil');
        let list = [];
        if (data && typeof data === 'object') {
            list = Object.values(data);
        }
        if (ujianId) list = list.filter(h => h.ujianId === ujianId);
        return list;
    }
    let list = DB.hasil;
    if (ujianId) list = list.filter(h => h.ujianId === ujianId);
    return list;
},
export default DataAdapter;
