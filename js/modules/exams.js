// js/modules/exams.js
// ⚡ CRUD Ujian & Hasil — Terintegrasi Firebase via DataAdapter

import { DB } from '../core/db.js';
import { session, examState } from '../core/state.js';
import { DataAdapter } from '../services/dataAdapter.js'; // ← Adapter untuk Firebase
import { showToast } from '../utils/toast.js';
import { closeModal, openModal } from '../utils/modal.js';
import { navigateTo, renderView } from '../core/router.js';
import { generateToken } from '../utils/helpers.js';

let currentUjianId = null;

// ⚡ Diambil dari Word: CRUD UJIAN & SISWA UI

export async function saveUjian() {
    const nama = document.getElementById('ujian-nama')?.value.trim() || '';
    const mapel = document.getElementById('ujian-mapel')?.value.trim() || '';
    const kelas = document.getElementById('ujian-kelas')?.value || '';
    const durasi = parseInt(document.getElementById('ujian-durasi')?.value) || 90;
    const token = document.getElementById('ujian-token')?.value.trim() || '';
    
    if (!nama || !mapel || !token) { showToast('Lengkapi semua field!', 'warn'); return; }

    // Get soal sesuai mapel — guru hanya bisa pakai soal miliknya
    const soalMapel = await DataAdapter.getBankSoal(session.role === 'guru' ? session.user : null);
    const filtered = soalMapel.filter(s => s.mapel.toLowerCase() === mapel.toLowerCase());
    
    const jmlSoal = Math.min(parseInt(document.getElementById('ujian-jml-soal')?.value)||5, filtered.length);
    const soalPilih = filtered.sort(()=>Math.random()-0.5).slice(0, jmlSoal).map(s => s.id);

    const ujianBaru = {
        id: 'UJ' + Date.now(), 
        guruId: session.user, 
        nama, mapel, kelas, durasi, token,
        status: 'aktif', 
        mulai: document.getElementById('ujian-mulai')?.value, 
        selesai: document.getElementById('ujian-selesai')?.value,
        soal: soalPilih,
        opsiAntiCurang: { 
            acakSoal: document.getElementById('opt-acak-soal')?.checked, 
            acakOpsi: document.getElementById('opt-acak-opsi')?.checked, 
            fullscreen: document.getElementById('opt-fullscreen')?.checked, 
            noCopy: document.getElementById('opt-no-copy')?.checked, 
            tabDetect: document.getElementById('opt-tab-detect')?.checked, 
            noRightClick: document.getElementById('opt-no-rightclick')?.checked, 
            satuSesi: document.getElementById('opt-satu-sesi')?.checked, 
            kamera: document.getElementById('opt-kamera')?.checked 
        },
        createdAt: Date.now()
    };
    
    const success = await DataAdapter.saveUjian(ujianBaru);
    
    if (success) {
        closeModal('modal-ujian');
        showToast(`Ujian "${nama}" berhasil dibuat! Token: ${token}`, 'success');
        navigateTo(session.role === 'admin' ? 'data-ujian' : 'g-ujian-aktif');
    } else {
        showToast('Gagal menyimpan ujian ke Firebase', 'error');
    }
}

export async function hapusUjian(id) { 
    if (!confirm('Hapus ujian ini?')) return; 
    const success = await DataAdapter.deleteUjian(id);
    if (success) {
        showToast('Ujian berhasil dihapus.', 'success'); 
        if (window.renderDataUjian) window.renderDataUjian(); 
    } else {
        showToast('Gagal menghapus ujian', 'error');
    }
}

export async function toggleUjianStatus(id) { 
    const u = (await DataAdapter.getUjian()).find(u => u.id === id);
    if (u) {
        const newStatus = u.status === 'aktif' ? 'selesai' : 'aktif';
        const success = await DataAdapter.updateUjianStatus(id, newStatus);
        if (success) {
            showToast(`Status ujian diubah menjadi: ${newStatus}`, 'info'); 
            if (window.renderDataUjian) window.renderDataUjian(); 
        } else {
            showToast('Gagal mengubah status ujian', 'error');
        }
    }
}

export function bukaTokenModal(ujianId) { 
    currentUjianId = ujianId; 
    openModal('modal-token'); 
}

export async function validateToken() {
    const token = document.getElementById('input-token')?.value.trim().toUpperCase() || '';
    const semuaUjian = await DataAdapter.getUjian();
    const ujian = semuaUjian.find(u => u.id === currentUjianId);
    
    if (!ujian) { showToast('Ujian tidak ditemukan!', 'error'); return; }
    if (token !== ujian.token.toUpperCase()) { 
        showToast('Token salah! Periksa kode dari guru Anda.', 'error'); 
        return; 
    }
    closeModal('modal-token');
    if (window.startExam) window.startExam(ujian);
}

export async function renderDataUjian() {
    const isGuru = session.role === 'guru';
    const semuaUjian = await DataAdapter.getUjian(isGuru ? session.user : null);
    
    document.getElementById('main-content').innerHTML = `
    <div class="page-header flex justify-between items-center"><div><div class="page-title">📋 ${isGuru?'Ujian Saya':'Daftar Ujian'}</div><div class="page-subtitle">${semuaUjian.length} ujian tersimpan${isGuru?` • ${session.userData?.mapel||''}`:''}</div></div><button class="btn btn-primary" onclick="window.openModal('modal-ujian')">➕ Buat Ujian</button></div>
    <div class="card">${semuaUjian.length===0?`<div class="empty-state" style="padding:48px;"><div class="empty-state-icon">📋</div><div class="empty-state-text">Belum ada ujian. Klik "Buat Ujian" untuk memulai.</div></div>`:`
    <div class="table-wrapper"><table><thead><tr><th>Nama Ujian</th>${!isGuru?'<th>Dibuat Oleh</th>':''}<th>Kelas</th><th>Durasi</th><th>Token</th><th>Peserta</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
    ${semuaUjian.map(u=>{ const guru=DB.users[u.guruId]; const pesertaCount=DB.hasil.filter(h=>h.ujianId===u.id).length; return `<tr><td><div style="font-weight:600;font-size:13px;">${u.nama}</div><div style="font-size:11px;color:var(--text3);">${u.mapel} • ${u.mulai?new Date(u.mulai).toLocaleDateString('id-ID'):'—'}</div></td>${!isGuru?`<td style="font-size:12px;">${guru?`<div>${guru.nama}</div><div style="color:var(--text3);font-size:11px;">${guru.mapel||''}</div>`:'<span style="color:var(--text3);">—</span>'}</td>`:''}<td><span class="badge badge-blue">${u.kelas}</span></td><td>${u.durasi} menit</td><td><span class="font-mono text-sm badge badge-gray">${u.token}</span></td><td style="text-align:center;"><span class="font-mono text-sm">${pesertaCount}</span>${pesertaCount>0?`<div style="font-size:10px;color:var(--text3);">peserta</div>`:''}</td><td><span class="badge ${u.status==='aktif'?'badge-green':'badge-gray'}">${u.status==='aktif'?'● Aktif':'○ Selesai'}</span></td><td><div class="flex gap-2">${u.status==='aktif'?`<button class="btn btn-warn btn-sm" onclick="window.toggleUjianStatus('${u.id}')">⏸ Nonaktifkan</button>`:`<button class="btn btn-success btn-sm" onclick="window.toggleUjianStatus('${u.id}')">▶ Aktifkan</button>`}<button class="btn btn-danger btn-sm" onclick="window.hapusUjian('${u.id}')">🗑️</button></div></td></tr>`; }).join('')}
    </tbody></table></div>`}</div>`;
}

export async function renderUjianTersedia() {
    const semuaUjian = await DataAdapter.getUjian();
    const ujian = semuaUjian.filter(u => u.status === 'aktif');
    
    document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-title">📋 Ujian Tersedia</div></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">${ujian.map(u=>`<div class="card" style="border-color:rgba(79,142,247,0.3);"><div class="flex justify-between items-center mb-3"><span class="badge badge-blue">${u.mapel}</span><span class="badge badge-green">Aktif</span></div><div style="font-size:16px;font-weight:700;margin-bottom:6px;">${u.nama}</div><div style="font-size:13px;color:var(--text2);margin-bottom:12px;">📚 ${u.kelas} • ⏱️ ${u.durasi} menit • 📝 ${u.soal?.length||0} soal</div><div class="divider"></div><div style="font-size:12px;color:var(--text3);margin-bottom:12px;">🛡️ Anti-curang: Fullscreen, Acak soal, Deteksi tab</div><button class="btn btn-primary btn-full" onclick="window.bukaTokenModal('${u.id}')">🎯 Mulai Ujian</button></div>`).join('')}</div>`;
}

export async function renderHasilSiswa() {
    const semuaHasil = await DataAdapter.getHasilByUjian(); // Get all results, filter client-side
    const myHasil = semuaHasil.filter(h => h.siswaId === session.user);
    
    document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-title">📊 Nilai Saya</div></div>
    ${myHasil.length?`<div class="card"><div class="table-wrapper"><table><thead><tr><th>Ujian</th><th>Nilai</th><th>Benar/Salah</th><th>Durasi</th><th>Pelanggaran</th><th>Waktu</th></tr></thead><tbody>${myHasil.map(h=>{const uj=DB.ujian.find(u=>u.id===h.ujianId);return `<tr><td><div style="font-weight:600;font-size:13px;">${uj?.nama||h.ujianId}</div></td><td><span style="font-size:20px;font-weight:800;font-family:'JetBrains Mono',monospace;color:${h.nilai>=75?'var(--accent2)':'var(--danger)'};">${h.nilai}</span></td><td><span class="text-success">${h.benar} benar</span> / <span class="text-danger">${h.salah} salah</span></td><td class="font-mono text-sm">${h.durasi}</td><td>${h.pelanggaran>0?`<span class="badge badge-red">⚠️ ${h.pelanggaran}x</span>`:'<span class="badge badge-green">Bersih</span>'}</td><td class="text-sm text-muted">${h.waktu}</td></tr>`;}).join('')}</tbody></table></div></div>`:`<div class="empty-state card"><div class="empty-state-icon">📊</div><div class="empty-state-text">Belum ada nilai. Ikuti ujian terlebih dahulu!</div></div>`}`;
}

export function renderTabelHasil(ujianId) {
    // Note: This is called from renderRekapNilai which already has data
    // For Firebase integration, this should be async in practice
    const hasil = DB.hasil.filter(h => h.ujianId === ujianId);
    if (!hasil.length) return '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Belum ada hasil untuk ujian ini</div></div>';
    const avg = Math.round(hasil.reduce((s,h) => s+h.nilai, 0) / hasil.length);
    return `<div class="grid-3 mb-4"><div class="stat-card blue"><div class="stat-icon">👥</div><div class="stat-value">${hasil.length}</div><div class="stat-label">Peserta</div></div><div class="stat-card green"><div class="stat-icon">📈</div><div class="stat-value">${avg}</div><div class="stat-label">Rata-rata</div></div><div class="stat-card yellow"><div class="stat-icon">🏅</div><div class="stat-value">${Math.max(...hasil.map(h=>h.nilai))}</div><div class="stat-label">Nilai Tertinggi</div></div></div><div class="table-wrapper"><table><thead><tr><th>Nama</th><th>Nilai</th><th>Benar</th><th>Salah</th><th>Durasi</th><th>Pelanggaran</th><th>Aksi</th></tr></thead><tbody>${hasil.sort((a,b)=>b.nilai-a.nilai).map((h,i)=>`<tr><td><div class="flex items-center gap-2">${i===0?'🥇':i===1?'🥈':i===2?'🥉':' '}<span style="font-weight:600;">${h.nama}</span></div></td><td><span class="font-mono bold" style="font-size:16px;color:${h.nilai>=75?'var(--accent2)':'var(--danger)'};">${h.nilai}</span></td><td class="text-success">${h.benar}</td><td class="text-danger">${h.salah}</td><td class="font-mono text-sm">${h.durasi}</td><td>${h.pelanggaran>0?`<span class="badge badge-red">⚠️ ${h.pelanggaran}x</span>`:'<span class="badge badge-green">✓ Bersih</span>'}</td><td><button class="btn btn-ghost btn-sm" onclick="window.lihatDetailHasil('${h.id}')">🔍 Detail</button></td></tr>`).join('')}</tbody></table></div>`;
}

export async function renderRekapNilai() {
    const isGuru = session.role === 'guru';
    const ujianScope = await DataAdapter.getUjian(isGuru ? session.user : null);
    const firstId = ujianScope.length ? ujianScope[0].id : null;
    
    document.getElementById('main-content').innerHTML = `
    <div class="page-header flex justify-between items-center"><div><div class="page-title">🏆 Rekap Nilai</div><div class="page-subtitle">${isGuru?'Hasil ujian yang saya buat':'Hasil seluruh ujian'}</div></div><div class="flex gap-2"><button class="btn btn-ghost" onclick="window.exportNilai()">📥 Export Excel</button><button class="btn btn-success" onclick="window.cetakPdfNilai()">🖨️ Cetak / PDF</button></div></div>
    <div class="card">${ujianScope.length===0?`<div class="empty-state" style="padding:48px;"><div class="empty-state-icon">📊</div><div class="empty-state-text">Belum ada ujian yang tersedia.</div></div>`:`
    <div class="tabs">${ujianScope.map((u,i)=>`<button class="tab-btn ${i===0?'active':''}" onclick="window.filterHasil('${u.id}',this)">${u.nama}</button>`).join('')}</div>
    <div id="tabel-hasil">${firstId ? window.renderTabelHasil(firstId) : ''}</div>`}</div>`;
}

export function filterHasil(ujianId, el) { 
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active')); 
    el.classList.add('active'); 
    document.getElementById('tabel-hasil').innerHTML = window.renderTabelHasil(ujianId); 
}

export function exportNilai() {
    const hasilData = DB.hasil.map((h, i) => { 
        const uj = DB.ujian.find(u => u.id === h.ujianId); 
        return { 
            'No': i + 1, 
            'Nama Siswa': h.nama, 
            'Ujian': uj ? uj.nama : h.ujianId, 
            'Mata Pelajaran': uj ? uj.mapel : '-', 
            'Nilai': h.nilai, 
            'Jumlah Benar': h.benar, 
            'Jumlah Salah': h.salah, 
            'Soal Kosong': h.kosong, 
            'Durasi Pengerjaan': h.durasi, 
            'Pelanggaran': h.pelanggaran, 
            'Status': h.nilai >= 75 ? 'LULUS' : 'TIDAK LULUS', 
            'Waktu Kumpul': h.waktu 
        }; 
    });
    if (window.exportToExcel) window.exportToExcel([{ name: 'Rekap Nilai', data: hasilData }], 'Rekap_Nilai_Ujian');
}

export function downloadExcelGuru() { 
    const gurus = Object.entries(DB.users).filter(([, u]) => u.role === 'guru'); 
    const data = gurus.map(([ , u], i) => ({ 
        'No': i + 1, 
        'Nama Guru': u.nama, 
        'NIP': u.nip, 
        'Mata Pelajaran': u.mapel || '-', 
        'Username Login': u.nip, 
        'Password': u.password, 
        'Status': 'Aktif', 
        'Keterangan': 'Username login menggunakan NIP' 
    })); 
    if (window.exportToExcel) window.exportToExcel([{ name: 'Data Guru', data }], 'Data_Guru_ExamShield'); 
    showToast('File Excel data guru berhasil diunduh!', 'success'); 
}

export function downloadExcelSiswa() { 
    const siswas = Object.entries(DB.users).filter(([, u]) => u.role === 'siswa'); 
    const data = siswas.map(([username, u], i) => ({ 
        'No': i + 1, 
        'Nama Siswa': u.nama, 
        'NISN': u.nisn, 
        'Kelas': u.kelas, 
        'Username Login': username, 
        'Password': u.password, 
        'Status': 'Aktif' 
    })); 
    if (window.exportToExcel) window.exportToExcel([{ name: 'Data Siswa', data }], 'Data_Siswa_ExamShield'); 
    showToast('File Excel data siswa berhasil diunduh!', 'success'); 
}

export function lihatDetailHasil(id) { 
    const h = DB.hasil.find(r => r.id === id); 
    if (!h) return; 
    document.getElementById('modal-hasil-body').innerHTML = `<div class="grid-2 mb-4"><div><div class="text-sm text-muted">Nama</div><div class="bold">${h.nama}</div></div><div><div class="text-sm text-muted">Nilai</div><div class="bold font-mono" style="font-size:24px;color:${h.nilai>=75?'var(--accent2)':'var(--danger)'};">${h.nilai}</div></div><div><div class="text-sm text-muted">Benar</div><div class="bold text-success">${h.benar} soal</div></div><div><div class="text-sm text-muted">Salah</div><div class="bold text-danger">${h.salah} soal</div></div><div><div class="text-sm text-muted">Durasi</div><div class="bold font-mono">${h.durasi}</div></div><div><div class="text-sm text-muted">Pelanggaran</div><div class="bold ${h.pelanggaran>0?'text-warn':'text-success'}">${h.pelanggaran} kali</div></div></div><div class="alert ${h.nilai>=75?'alert-info':'alert-danger'}"><span>${h.nilai>=75?'✅':'❌'}</span><span>${h.nilai>=75?'Lulus':'Belum memenuhi KKM (75)'} • Dikumpulkan: ${h.waktu}</span></div>`; 
    openModal('modal-hasil'); 
}

export function printHasil() { 
    window.print(); 
}
