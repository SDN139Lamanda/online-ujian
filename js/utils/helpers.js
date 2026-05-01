import { DB } from '../core/db.js';
import { pwVisible } from '../core/state.js';

// ⚡ Diambil dari Word: HELPER & UTILS
export function getKelasOptions(selectedVal = '') {
    return DB.kelas.map(k => `<option value="${k}" ${k === selectedVal ? 'selected' : ''}>${k}</option>`).join('');
}

export function refreshAllKelasSelects() {
    ['siswa-kelas', 'ujian-kelas'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { const cur = el.value; el.innerHTML = getKelasOptions(cur); }
    });
}

export function togglePwField(fieldId, btn) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? '🙈' : '👁️';
    btn.style.color = isHidden ? 'var(--accent2)' : '';
}

export function togglePw(elId, plainText) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (pwVisible[elId]) {
        el.textContent = '••••••••';
        el.style.letterSpacing = '2px';
        pwVisible[elId] = false;
    } else {
        el.textContent = plainText;
        el.style.letterSpacing = '0.5px';
        pwVisible[elId] = true;
    }
}

export function generatePassword(fieldId) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
    let pw = '';
    for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    document.getElementById(fieldId).value = pw;
}

export function generateToken() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let token = '';
    for (let i = 0; i < 6; i++) token += chars[Math.floor(Math.random() * chars.length)];
    document.getElementById('ujian-token').value = token;
}

export function syncGuruUsername() {
    const nip = document.getElementById('guru-nip').value.trim();
    document.getElementById('guru-username').value = nip;
}

export function syncSiswaFromNISN() {
    const nisn = document.getElementById('siswa-nisn')?.value.trim() || '';
    const usernameEl = document.getElementById('siswa-username');
    const passwordEl = document.getElementById('siswa-password');
    if (usernameEl) usernameEl.value = nisn;
    if (passwordEl) passwordEl.value = nisn;
}
