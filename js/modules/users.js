import { DB } from '../core/db.js';
import { session } from '../core/state.js';
import { showToast } from '../utils/toast.js';
import { closeModal } from '../utils/modal.js';
import { getKelasOptions, generatePassword } from '../utils/helpers.js';

// ⚡ Diambil dari Word: CRUD GURU & SISWA
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

export function saveGuru() {
    const nama = document.getElementById('guru-nama').value.trim();
    const nip = document.getElementById('guru-nip').value.trim();
    const mapel = document.getElementById('guru-mapel').value.trim();
    const password = document.getElementById('guru-password').value.trim();
    if (!nama || !nip || !password) { showToast('Lengkapi semua field!', 'warn'); return; }
    if (DB.users[nip]) { showToast(`NIP "${nip}" sudah terdaftar!`, 'error'); return; }
    DB.users[nip] = { password, role: 'guru', nama, nip, mapel };
    closeModal('modal-guru');
    showToast(`Guru ${nama} berhasil ditambahkan! Username: ${nip} | Password: ${password}`, 'success');
    if (window.renderDataGuru) window.renderDataGuru();
}

export function saveSiswa() {
    const nama = document.getElementById('siswa-nama').value.trim();
    const nisn = document.getElementById('siswa-nisn').value.trim();
    const kelas = document.getElementById('siswa-kelas').value;
    const username = document.getElementById('siswa-username').value.trim();
    const password = document.getElementById('siswa-password').value.trim();
    if (!nama || !username || !password) { showToast('Lengkapi semua field!', 'warn'); return; }
    if (DB.users[username]) { showToast('Username sudah digunakan!', 'error'); return; }
    DB.users[username] = { password, role: 'siswa', nama, nisn, kelas };
    closeModal('modal-siswa');
    showToast(`Siswa ${nama} berhasil ditambahkan!`, 'success');
    if (window.renderDataSiswa) window.renderDataSiswa();
}

export function resetPasswordGuru(username) {
    generatePassword('_tmp');
    const newPw = document.getElementById('_tmp')?.value || 'Reset@123';
    DB.users[username].password = newPw;
    showToast(`Password ${username} direset. Password baru: ${newPw}`, 'info');
    if (window.renderDataGuru) window.renderDataGuru();
}

export function resetPasswordSiswa(username) {
    const newPw = Math.random().toString(36).slice(-6).toUpperCase();
    DB.users[username].password = newPw;
    showToast(`Password ${username} direset. Password baru: ${newPw}`, 'info');
    if (window.renderDataSiswa) window.renderDataSiswa();
}

export function hapusUser(username, role) {
    if (!confirm(`Hapus ${role} "${username}"?`)) return;
    delete DB.users[username];
    showToast(`${role} berhasil dihapus.`, 'success');
    if (role === 'guru' && window.renderDataGuru) window.renderDataGuru();
    else if (window.renderDataSiswa) window.renderDataSiswa();
}

export function filterSiswa(val) {
    document.querySelectorAll('#tbody-siswa tr').forEach(tr => {
        tr.style.display = (tr.dataset.search || '').includes(val.toLowerCase()) ? '' : 'none';
    });
}

export function filterSiswaKombinasi() {
    const cari = (document.getElementById('cari-siswa')?.value || '').toLowerCase();
    const kelas = document.getElementById('filter-kelas-siswa')?.value || '';
    document.querySelectorAll('#tbody-siswa tr').forEach(tr => {
        const matchCari = !cari || (tr.dataset.search || '').includes(cari);
        const matchKelas = !kelas || (tr.dataset.kelas || '') === kelas;
        tr.style.display = (matchCari && matchKelas) ? '' : 'none';
    });
}

export function openImportSiswa() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.xlsx,.xls,.csv';
    input.onchange = e => window.prosesImportSiswaFile?.(e.target.files[0]);
    input.click();
}

export function openImportGuru() {
    const input = document.getElementById('import-guru-input');
    if (input) { input.click(); return; }
    const tmp = document.createElement('input');
    tmp.type = 'file'; tmp.accept = '.xlsx,.xls,.csv';
    tmp.onchange = e => window.prosesImportGuruFile?.(e.target);
    tmp.click();
}

export function prosesImportGuruFile(inputEl) {
    const file = inputEl.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const wb = XLSX.read(e.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
            let added = 0, skipped = 0, duplikat = 0;
            rows.forEach(row => {
                const nama = String(row['Nama'] || row['nama'] || '').trim();
                const nip = String(row['NIP'] || row['nip'] || '').trim();
                const mapel = String(row['Mata Pelajaran'] || row['mata_pelajaran'] || row['Mapel'] || '').trim();
                const password = String(row['Password'] || row['password'] || '').trim() || 'Guru@' + nip.slice(-4);
                if (!nama || !nip) { skipped++; return; }
                if (DB.users[nip]) { duplikat++; return; }
                DB.users[nip] = { password, role: 'guru', nama, nip, mapel };
                added++;
            });
            let msg = `✅ ${added} guru berhasil diimport`;
            if (duplikat) msg += `, ${duplikat} NIP sudah terdaftar`;
            if (skipped) msg += `, ${skipped} baris tidak lengkap`;
            showToast(msg, added > 0 ? 'success' : 'warn');
            if (window.renderDataGuru) window.renderDataGuru();
        } catch (err) { showToast('Gagal membaca file. Pastikan format Excel sesuai.', 'error'); }
    };
    reader.readAsBinaryString(file); inputEl.value = '';
}

export function prosesImportSiswaFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const wb = XLSX.read(e.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
            let added = 0, skipped = 0;
            rows.forEach(row => {
                const nama = String(row['Nama'] || row['nama'] || '').trim();
                const nisn = String(row['NISN'] || row['nisn'] || '').trim();
                const kelas = String(row['Kelas'] || row['kelas'] || '').trim();
                const username = String(row['Username'] || row['username'] || nisn).trim();
                const password = String(row['Password'] || row['password'] || nisn.slice(-6) || 'Siswa123').trim();
                if (!nama || !username) { skipped++; return; }
                if (DB.users[username]) { skipped++; return; }
                DB.users[username] = { password, role: 'siswa', nama, nisn, kelas };
                added++;
            });
            showToast(`✅ ${added} siswa berhasil diimport${skipped ? `, ${skipped} baris dilewati` : ''}!`, 'success');
            if (window.renderDataSiswa) window.renderDataSiswa();
        } catch (err) { showToast('Gagal membaca file. Pastikan format Excel sesuai.', 'error'); }
    };
    reader.readAsBinaryString(file);
}

export function renderDataGuru() {
    const gurus = Object.entries(DB.users).filter(([,u]) => u.role === 'guru');
    document.getElementById('main-content').innerHTML = `
    <div class="page-header flex justify-between items-center"><div><div class="page-title">👨‍🏫 Data Guru</div><div class="page-subtitle">${gurus.length} guru terdaftar</div></div>
    <div class="flex gap-2"><button class="btn btn-ghost" onclick="window.downloadTemplateGuru()">📄 Template</button><button class="btn btn-ghost" onclick="window.openImportGuru()">📥 Import Excel</button><button class="btn btn-success" onclick="window.downloadExcelGuru()">📥 Download Excel</button><button class="btn btn-primary" onclick="window.openModal('modal-guru')">➕ Tambah Guru</button></div></div>
    <div class="card"><div class="table-wrapper"><table><thead><tr><th>Nama Guru</th><th>NIP (= Username)</th><th>Mata Pelajaran</th><th>Password</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
    ${gurus.map(([username, u]) => `<tr><td><div class="flex items-center gap-2"><div class="avatar avatar-guru" style="width:28px;height:28px;font-size:11px;">${u.nama.charAt(0)}</div>${u.nama}</div></td><td><div class="font-mono text-sm">${u.nip}</div><div class="text-xs" style="color:var(--accent2);margin-top:2px;">username login</div></td><td>${u.mapel||'-'}</td><td><div class="flex items-center gap-2"><span class="font-mono text-sm" id="pw-guru-${username}" style="letter-spacing:2px;">••••••••</span><button class="btn-eye" onclick="window.togglePw('pw-guru-${username}','${u.password}')" title="Tampilkan/sembunyikan password">👁️</button></div></td><td><span class="badge badge-green">Aktif</span></td><td><div class="flex gap-2"><button class="btn btn-ghost btn-sm" onclick="window.resetPasswordGuru('${username}')">🔄 Reset PW</button><button class="btn btn-danger btn-sm" onclick="window.hapusUser('${username}','guru')">🗑️</button></div></td></tr>`).join('')}
    </tbody></table></div></div><input type="file" id="import-guru-input" accept=".xlsx,.xls,.csv" style="display:none;" onchange="window.prosesImportGuruFile(this)">`;
}

export function renderDataSiswa() {
    const siswas = Object.entries(DB.users).filter(([,u]) => u.role === 'siswa');
    document.getElementById('main-content').innerHTML = `
    <div class="page-header flex justify-between items-center"><div><div class="page-title">🎓 Data Siswa</div><div class="page-subtitle">${siswas.length} siswa terdaftar • ${DB.kelas.length} kelas tersedia</div></div>
    <div class="flex gap-2"><button class="btn btn-ghost" onclick="window.downloadTemplateSiswa()">📄 Template</button><button class="btn btn-ghost" onclick="window.openImportSiswa()">📥 Import Excel</button><button class="btn btn-success" onclick="window.downloadExcelSiswa()">📥 Download Excel</button><button class="btn btn-primary" onclick="window.openModal('modal-siswa')">➕ Tambah Siswa</button></div></div>
    <div class="card"><div class="flex gap-3 mb-3" style="align-items:center;"><div class="search-input" style="flex:1;"><input type="text" placeholder="Cari nama atau NISN..." oninput="window.filterSiswaKombinasi()" id="cari-siswa" /></div><div style="flex-shrink:0;"><select id="filter-kelas-siswa" onchange="window.filterSiswaKombinasi()" style="padding:9px 14px;font-size:13px;"><option value="">Semua Kelas</option>${DB.kelas.map(k=>`<option value="${k}">${k}</option>`).join('')}</select></div><button class="btn btn-ghost btn-sm" onclick="document.getElementById('cari-siswa').value='';document.getElementById('filter-kelas-siswa').value='';window.filterSiswaKombinasi();">↺ Reset</button></div>
    <div class="table-wrapper"><table id="tabel-siswa"><thead><tr><th>Nama Siswa</th><th>NISN</th><th>Kelas</th><th>Username</th><th>Password</th><th>Aksi</th></tr></thead><tbody id="tbody-siswa">
    ${siswas.map(([username, u]) => `<tr data-search="${u.nama.toLowerCase()} ${u.nisn}" data-kelas="${u.kelas||''}"><td><div class="flex items-center gap-2"><div class="avatar avatar-siswa" style="width:28px;height:28px;font-size:11px;">${u.nama.charAt(0)}</div>${u.nama}</div></td><td class="font-mono text-sm">${u.nisn}</td><td><span class="badge badge-blue">${u.kelas||'—'}</span></td><td class="font-mono text-sm">${username}</td><td><div class="flex items-center gap-2"><span class="font-mono text-sm" id="pw-siswa-${username}" style="letter-spacing:2px;">••••••••</span><button class="btn-eye" onclick="window.togglePw('pw-siswa-${username}','${u.password}')" title="Tampilkan/sembunyikan password">👁️</button></div></td><td><div class="flex gap-2"><button class="btn btn-ghost btn-sm" onclick="window.resetPasswordSiswa('${username}')">🔄 Reset PW</button><button class="btn btn-danger btn-sm" onclick="window.hapusUser('${username}','siswa')">🗑️</button></div></td></tr>`).join('')}
    </tbody></table></div></div>`;
}
