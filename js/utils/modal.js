import { getKelasOptions, generateToken, generatePassword } from './helpers.js';

// ⚡ Diambil dari Word: MODAL HELPERS
export function openModal(id) {
    document.getElementById(id).classList.remove('hidden');

    if (id === 'modal-siswa') {
        const el = document.getElementById('siswa-kelas');
        if (el) el.innerHTML = getKelasOptions();
        ['siswa-nama','siswa-nisn','siswa-username','siswa-password'].forEach(fid => {
            const f = document.getElementById(fid); if (f) f.value = '';
        });
        const pwField = document.getElementById('siswa-password');
        if (pwField) pwField.type = 'password';
    }
    if (id === 'modal-ujian') {
        generateToken();
        const now = new Date();
        const pad = n => String(n).padStart(2,'0');
        const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        document.getElementById('ujian-mulai').value = fmt(now);
        const end = new Date(now.getTime() + 90*60000);
        document.getElementById('ujian-selesai').value = fmt(end);
        const elKelas = document.getElementById('ujian-kelas');
        if (elKelas) elKelas.innerHTML = getKelasOptions();
    }
    if (id === 'modal-guru') generatePassword('guru-password');

    if (id === 'modal-soal') {
        setTimeout(() => {
            const container = document.getElementById('soal-list-container');
            if (container && container.children.length === 0) {
                // Fungsi appendSoalRow & updateSoalCount akan di-bind via app.js nanti
                if (window.appendSoalRow) window.appendSoalRow(0);
                if (window.updateSoalCount) window.updateSoalCount();
            }
        }, 50);
    }
}

export function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    if (id === 'modal-soal') {
        const container = document.getElementById('soal-list-container');
        if (container) container.innerHTML = '';
    }
}
