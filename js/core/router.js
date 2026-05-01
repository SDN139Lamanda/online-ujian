import { DB } from './db.js';
import { session, selectedRole } from './state.js';

// ⚡ Diambil dari Word: PAGE SYSTEM & ROUTER
export function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

export function buildApp() {
    const role = session.role;
    const u = session.userData;
    const av = document.getElementById('sb-avatar');
    av.textContent = u.nama.charAt(0).toUpperCase();
    av.className = `avatar avatar-${role}`;
    document.getElementById('sb-name').textContent = u.nama;
    document.getElementById('sb-role').textContent = role === 'admin' ? 'Administrator' : role === 'guru' ? `Guru ${u.mapel||''}` : `Siswa • ${u.kelas||''}`;
    
    buildNav(role);
    navigateTo(role === 'admin' ? 'dashboard' : role === 'guru' ? 'g-dashboard' : 's-dashboard');
}

const navMenus = {
    admin: [
        { section: 'Utama' }, { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { section: 'Manajemen' }, { id: 'data-guru', icon: '👨‍🏫', label: 'Data Guru' },
        { id: 'data-siswa', icon: '🎓', label: 'Data Siswa' }, { id: 'kelola-kelas', icon: '🏫', label: 'Kelola Kelas' },
        { id: 'data-ujian', icon: '📋', label: 'Daftar Ujian' }, { id: 'bank-soal', icon: '📖', label: 'Bank Soal' },
        { section: 'Pengawasan' }, { id: 'monitoring', icon: '👁️', label: 'Monitoring Live' },
        { id: 'rekap-nilai', icon: '🏆', label: 'Rekap Nilai' }, { id: 'analisis-butir', icon: '🔬', label: 'Analisis Soal' },
        { id: 'log-aktivitas', icon: '📜', label: 'Log Aktivitas' },
        { section: 'Pengaturan' }, { id: 'pengaturan', icon: '⚙️', label: 'Pengaturan' }
    ],
    guru: [
        { section: 'Utama' }, { id: 'g-dashboard', icon: '📊', label: 'Dashboard' },
        { section: 'Ujian' }, { id: 'g-buat-ujian', icon: '📝', label: 'Buat Ujian' },
        { id: 'g-bank-soal', icon: '📖', label: 'Bank Soal Saya' }, { id: 'g-ujian-aktif', icon: '📋', label: 'Ujian Aktif' },
        { id: 'g-analisis', icon: '🔬', label: 'Analisis Soal' },
        { section: 'Hasil' }, { id: 'g-hasil', icon: '📊', label: 'Lihat Hasil' }, { id: 'g-monitoring', icon: '👁️', label: 'Monitoring' },
        { section: 'Akun' }, { id: 'g-profil', icon: '👤', label: 'Profil' }, { id: 'g-pengaturan', icon: '⚙️', label: 'Pengaturan' }
    ],
    siswa: [
        { section: 'Ujian' }, { id: 's-dashboard', icon: '🏠', label: 'Beranda' },
        { id: 's-ujian-tersedia', icon: '📋', label: 'Ujian Tersedia' }, { id: 's-hasil', icon: '📊', label: 'Nilai Saya' },
        { section: 'Akun' }, { id: 's-profil', icon: '👤', label: 'Profil' }
    ]
};

export function buildNav(role) {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = '';
    navMenus[role].forEach(item => {
        if (item.section) {
            const s = document.createElement('div'); s.className = 'nav-section'; s.textContent = item.section; nav.appendChild(s);
        } else {
            const el = document.createElement('div'); el.className = 'nav-item'; el.id = `nav-${item.id}`;
            el.innerHTML = `<span class="nav-icon">${item.icon}</span> ${item.label}`;
            el.onclick = () => navigateTo(item.id); nav.appendChild(el);
        }
    });
}

export function navigateTo(id) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const el = document.getElementById(`nav-${id}`);
    if (el) el.classList.add('active');
    renderView(id);
}

// ⚡ VIEW RENDERER MAP
export function renderView(id) {
    const mc = document.getElementById('main-content');
    mc.innerHTML = ''; mc.style.animation = 'none'; mc.offsetHeight; mc.style.animation = 'fadeIn 0.35s ease';
    
    const views = {
        'dashboard': renderAdminDashboard, 'data-guru': renderDataGuru, 'data-siswa': renderDataSiswa, 'kelola-kelas': renderKelolaKelas,
        'data-ujian': renderDataUjian, 'bank-soal': renderBankSoalAdmin, 'monitoring': renderMonitoring, 'rekap-nilai': renderRekapNilai,
        'analisis-butir': renderAnalisisButir, 'log-aktivitas': renderLogAktivitas, 'pengaturan': renderPengaturan,
        'g-dashboard': renderGuruDashboard, 'g-buat-ujian': () => window.openModal('modal-ujian'), 'g-bank-soal': renderBankSoalGuru,
        'g-ujian-aktif': renderDataUjian, 'g-analisis': renderAnalisisButir, 'g-hasil': renderRekapNilai, 'g-monitoring': renderMonitoring,
        'g-profil': renderProfil, 'g-pengaturan': renderGuruPengaturan,
        's-dashboard': renderSiswaDashboard, 's-ujian-tersedia': renderUjianTersedia, 's-hasil': renderHasilSiswa, 's-profil': renderProfil,
    };
    if (views[id]) views[id]();
    else mc.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🚧</div><div class="empty-state-text">Halaman dalam pengembangan</div></div>`;
}

// ⚡ SEMUA FUNGSI RENDER (Dipindahkan persis dari file Word agar tidak error)
export function renderAdminDashboard() {
    const totalGuru = Object.values(DB.users).filter(u => u.role === 'guru').length;
    const totalSiswa = Object.values(DB.users).filter(u => u.role === 'siswa').length;
    const totalUjian = DB.ujian.length;
    const totalSoal = DB.bankSoal.length;
    document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-title">📊 Dashboard Admin</div><div class="page-subtitle">Selamat datang! Pantau seluruh aktivitas ujian dari sini.</div></div>
    <div class="grid-4 mb-4">
        <div class="stat-card blue"><div class="stat-icon">👨‍🏫</div><div class="stat-value">${totalGuru}</div><div class="stat-label">Total Guru</div></div>
        <div class="stat-card green"><div class="stat-icon">🎓</div><div class="stat-value">${totalSiswa}</div><div class="stat-label">Total Siswa</div></div>
        <div class="stat-card yellow"><div class="stat-icon">📋</div><div class="stat-value">${totalUjian}</div><div class="stat-label">Total Ujian</div></div>
        <div class="stat-card red"><div class="stat-icon">📖</div><div class="stat-value">${totalSoal}</div><div class="stat-label">Bank Soal</div></div>
    </div>
    <div class="grid-2 mb-4">
        <div class="card">
            <div class="card-header"><div class="card-title">👁️ Monitoring Real-time</div><span class="badge badge-green animate-pulse">● LIVE</span></div>
            ${DB.aktifLog.map(a => `<div class="monitor-card mb-2"><div class="flex items-center gap-3"><div class="monitor-dot ${a.status==='peringatan'?'warning':''}"></div><div><div style="font-size:13px;font-weight:600;">${a.nama||a.siswa}</div><div style="font-size:11px;color:var(--text3);">${a.kelas} • ${a.ujian}</div></div></div><div style="text-align:right;"><div style="font-size:12px;font-weight:700;">${a.progress}/${a.total} soal</div><div style="margin-top:4px;"><div class="progress" style="width:80px;"><div class="progress-bar progress-bar-blue" style="width:${Math.round(a.progress/a.total*100)}%"></div></div></div></div></div>`).join('')}
            <button class="btn btn-ghost btn-sm btn-full mt-2" onclick="window.navigateTo('monitoring')">Lihat Semua →</button>
        </div>
        <div class="card">
            <div class="card-header"><div class="card-title">📋 Ujian Aktif</div></div>
            ${DB.ujian.filter(u => u.status==='aktif').map(u => `<div style="padding:10px 0;border-bottom:1px solid var(--border);"><div class="flex justify-between items-center"><div><div style="font-size:13px;font-weight:600;">${u.nama}</div><div style="font-size:11px;color:var(--text3);">${u.kelas} • ${u.durasi} menit</div></div><span class="badge badge-green">Aktif</span></div><div class="flex items-center gap-2 mt-2"><span class="text-xs text-muted font-mono">Token: ${u.token}</span></div></div>`).join('') || '<div class="empty-state"><div class="empty-state-text">Tidak ada ujian aktif</div></div>'}
        </div>
    </div>
    <div class="card">
        <div class="card-header"><div class="card-title">🚀 Aksi Cepat</div></div>
        <div class="flex gap-3 flex-wrap">
            <button class="btn btn-primary" onclick="window.openModal('modal-guru')">➕ Tambah Guru</button>
            <button class="btn btn-success" onclick="window.openModal('modal-siswa')">➕ Tambah Siswa</button>
            <button class="btn btn-warn" onclick="window.openModal('modal-ujian')">📝 Buat Ujian</button>
            <button class="btn btn-ghost" onclick="window.navigateTo('monitoring')">👁️ Lihat Monitoring</button>
        </div>
    </div>`;
}

export function renderDataGuru() {
    const gurus = Object.entries(DB.users).filter(([,u]) => u.role === 'guru');
    document.getElementById('main-content').innerHTML = `
    <div class="page-header flex justify-between items-center"><div><div class="page-title">👨‍🏫 Data Guru</div><div class="page-subtitle">${gurus.length} guru terdaftar</div></div>
    <div class="flex gap-2"><button class="btn btn-ghost" onclick="window.downloadTemplateGuru()">📄 Template</button><button class="btn btn-ghost" onclick="window.openImportGuru()">📥 Import Excel</button><button class="btn btn-success" onclick="window.downloadExcelGuru()">📥 Download Excel</button><button class="btn btn-primary" onclick="window.openModal('modal-guru')">➕ Tambah Guru</button></div></div>
    <div class="card"><div class="table-wrapper"><table><thead><tr><th>Nama Guru</th><th>NIP (= Username)</th><th>Mata Pelajaran</th><th>Password</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
    ${gurus.map(([username, u]) => `<tr><td><div class="flex items-center gap-2"><div class="avatar avatar-guru" style="width:28px;height:28px;font-size:11px;">${u.nama.charAt(0)}</div>${u.nama}</div></td><td><div class="font-mono text-sm">${u.nip}</div><div class="text-xs" style="color:var(--accent2);margin-top:2px;">username login</div></td><td>${u.mapel||'-'}</td><td><div class="flex items-center gap-2"><span class="font-mono text-sm" id="pw-guru-${username}" style="letter-spacing:2px;">••••••••</span><button class="btn-eye" onclick="window.togglePw('pw-guru-${username}','${u.password}')" title="Tampilkan/sembunyikan password">👁️</button></div></td><td><span class="badge badge-green">Aktif</span></td><td><div class="flex gap-2"><button class="btn btn-ghost btn-sm" onclick="window.resetPasswordGuru('${username}')">🔄 Reset PW</button><button class="btn btn-danger btn-sm" onclick="window.hapusUser('${username}','guru')">🗑️</button></div></td></tr>`).join('')}
    </tbody></table></div></div>
    <input type="file" id="import-guru-input" accept=".xlsx,.xls,.csv" style="display:none;" onchange="window.prosesImportGuruFile(this)">`;
}

export function renderDataSiswa() {
    const siswas = Object.entries(DB.users).filter(([,u]) => u.role === 'siswa');
    document.getElementById('main-content').innerHTML = `
    <div class="page-header flex justify-between items-center"><div><div class="page-title">🎓 Data Siswa</div><div class="page-subtitle">${siswas.length} siswa terdaftar • ${DB.kelas.length} kelas tersedia</div></div>
    <div class="flex gap-2"><button class="btn btn-ghost" onclick="window.downloadTemplateSiswa()">📄 Template</button><button class="btn btn-ghost" onclick="window.openImportSiswa()">📥 Import Excel</button><button class="btn btn-success" onclick="window.downloadExcelSiswa()">📥 Download Excel</button><button class="btn btn-primary" onclick="window.openModal('modal-siswa')">➕ Tambah Siswa</button></div></div>
    <div class="card">
        <div class="flex gap-3 mb-3" style="align-items:center;"><div class="search-input" style="flex:1;"><input type="text" placeholder="Cari nama atau NISN..." oninput="window.filterSiswaKombinasi()" id="cari-siswa" /></div><div style="flex-shrink:0;"><select id="filter-kelas-siswa" onchange="window.filterSiswaKombinasi()" style="padding:9px 14px;font-size:13px;"><option value="">Semua Kelas</option>${DB.kelas.map(k=>`<option value="${k}">${k}</option>`).join('')}</select></div><button class="btn btn-ghost btn-sm" onclick="document.getElementById('cari-siswa').value='';document.getElementById('filter-kelas-siswa').value='';window.filterSiswaKombinasi();">↺ Reset</button></div>
        <div class="table-wrapper"><table id="tabel-siswa"><thead><tr><th>Nama Siswa</th><th>NISN</th><th>Kelas</th><th>Username</th><th>Password</th><th>Aksi</th></tr></thead><tbody id="tbody-siswa">
        ${siswas.map(([username, u]) => `<tr data-search="${u.nama.toLowerCase()} ${u.nisn}" data-kelas="${u.kelas||''}"><td><div class="flex items-center gap-2"><div class="avatar avatar-siswa" style="width:28px;height:28px;font-size:11px;">${u.nama.charAt(0)}</div>${u.nama}</div></td><td class="font-mono text-sm">${u.nisn}</td><td><span class="badge badge-blue">${u.kelas||'—'}</span></td><td class="font-mono text-sm">${username}</td><td><div class="flex items-center gap-2"><span class="font-mono text-sm" id="pw-siswa-${username}" style="letter-spacing:2px;">••••••••</span><button class="btn-eye" onclick="window.togglePw('pw-siswa-${username}','${u.password}')" title="Tampilkan/sembunyikan password">👁️</button></div></td><td><div class="flex gap-2"><button class="btn btn-ghost btn-sm" onclick="window.resetPasswordSiswa('${username}')">🔄 Reset PW</button><button class="btn btn-danger btn-sm" onclick="window.hapusUser('${username}','siswa')">🗑️</button></div></td></tr>`).join('')}
        </tbody></table></div></div>`;
}

export function renderKelolaKelas() {
    const siswaPerKelas = {}; DB.kelas.forEach(k => siswaPerKelas[k]=0); Object.values(DB.users).filter(u=>u.role==='siswa').forEach(u=>{ if(u.kelas && siswaPerKelas[u.kelas]!==undefined) siswaPerKelas[u.kelas]++; else if(u.kelas) siswaPerKelas[u.kelas]=(siswaPerKelas[u.kelas]||0)+1; });
    document.getElementById('main-content').innerHTML = `
    <div class="page-header flex justify-between items-center"><div><div class="page-title">🏫 Kelola Kelas</div><div class="page-subtitle">${DB.kelas.length} kelas terdaftar • Digunakan di seluruh sistem</div></div></div>
    <div class="alert alert-info mb-4"><span>ℹ️</span><span>Daftar kelas ini digunakan di seluruh sistem: form tambah siswa, buat ujian, dan akun guru. Perubahan berlaku langsung di semua bagian aplikasi.</span></div>
    <div class="grid-2" style="gap:20px;">
        <div class="card" style="align-self:start;"><div class="card-header"><div class="card-title">➕ Tambah Kelas Baru</div></div><div class="form-group"><label>Nama Kelas</label><input type="text" id="input-kelas-baru" placeholder="cth: X IPA 1, XI IPS 2..." onkeydown="if(event.key==='Enter') window.tambahKelas()" /><div class="text-xs text-muted mt-1">Tekan Enter atau klik Tambah untuk menyimpan.</div></div><button class="btn btn-primary btn-full" onclick="window.tambahKelas()">➕ Tambah Kelas</button>
        <div class="divider"></div><div class="card-title mb-2" style="font-size:13px;">📋 Tambah Banyak Sekaligus</div><div class="form-group"><label>Daftar Kelas <span style="color:var(--text3);font-weight:400;">(satu per baris)</span></label><textarea id="input-kelas-batch" placeholder="X IPA 1&#10;X IPA 2..." rows="6" style="font-family:'JetBrains Mono',monospace;font-size:13px;"></textarea></div><button class="btn btn-success btn-full" onclick="window.tambahKelasBatch()">💾 Simpan Semua</button>
        <div class="divider"></div><button class="btn btn-danger btn-full" onclick="window.resetSemuaKelas()" style="opacity:0.8;">🗑️ Reset Semua Kelas</button></div>
        <div class="card"><div class="card-header"><div class="card-title">📋 Daftar Kelas (${DB.kelas.length})</div><div class="search-input" style="width:180px;"><input type="text" placeholder="Cari kelas..." oninput="window.filterTabelKelas(this.value)" style="padding:6px 10px 6px 32px;font-size:12px;" /></div></div>
        ${DB.kelas.length===0 ? `<div class="empty-state" style="padding:40px;"><div class="empty-state-icon">🏫</div><div class="empty-state-text">Belum ada kelas.</div></div>` : `<div class="table-wrapper"><table id="tabel-daftar-kelas"><thead><tr><th>#</th><th>Nama Kelas</th><th style="text-align:center;">Jumlah Siswa</th><th style="text-align:center;">Ujian Terkait</th><th>Edit</th><th>Aksi</th></tr></thead><tbody id="tbody-kelas">
        ${DB.kelas.map((k, i) => { const jmlSiswa=Object.values(DB.users).filter(u=>u.role==='siswa'&&u.kelas===k).length; const jmlUjian=DB.ujian.filter(u=>u.kelas===k).length; return `<tr data-kelas="${k.toLowerCase()}" id="kelas-row-${i}"><td class="font-mono text-sm text-muted">${i+1}</td><td><div id="kelas-view-${i}" style="display:flex;align-items:center;gap:8px;"><span style="font-size:16px;">🏫</span><span style="font-weight:600;font-size:14px;">${k}</span></div><div id="kelas-edit-${i}" style="display:none;"><input type="text" id="kelas-input-${i}" value="${k}" style="font-size:13px;padding:5px 10px;" onkeydown="if(event.key==='Enter')window.simpanEditKelas(${i});if(event.key==='Escape')window.batalEditKelas(${i})" /></div></td><td style="text-align:center;"><span class="badge ${jmlSiswa>0?'badge-blue':'badge-gray'}">${jmlSiswa} siswa</span></td><td style="text-align:center;"><span class="badge ${jmlUjian>0?'badge-green':'badge-gray'}">${jmlUjian} ujian</span></td><td><div id="kelas-aksi-view-${i}" class="flex gap-2"><button class="btn btn-ghost btn-sm" onclick="window.mulaiEditKelas(${i})">✏️ Edit</button></div><div id="kelas-aksi-edit-${i}" style="display:none;" class="flex gap-2"><button class="btn btn-success btn-sm" onclick="window.simpanEditKelas(${i})">✓</button><button class="btn btn-ghost btn-sm" onclick="window.batalEditKelas(${i})">✕</button></div></td><td><button class="btn btn-danger btn-sm" onclick="window.hapusKelas(${i})" ${jmlSiswa>0||jmlUjian>0?`title="Ada ${jmlSiswa} siswa / ${jmlUjian} ujian di kelas ini"`:''}>🗑️</button></td></tr>`; }).join('')}
        </tbody></table></div>`}</div></div>`;
}

export function renderDataUjian() {
    const isGuru = session.role === 'guru';
    const ujianList = isGuru ? DB.ujian.filter(u => u.guruId === session.user) : DB.ujian;
    document.getElementById('main-content').innerHTML = `
    <div class="page-header flex justify-between items-center"><div><div class="page-title">📋 ${isGuru?'Ujian Saya':'Daftar Ujian'}</div><div class="page-subtitle">${ujianList.length} ujian tersimpan${isGuru?` • ${session.userData?.mapel||''}`:''}</div></div><button class="btn btn-primary" onclick="window.openModal('modal-ujian')">➕ Buat Ujian</button></div>
    <div class="card">${ujianList.length===0?`<div class="empty-state" style="padding:48px;"><div class="empty-state-icon">📋</div><div class="empty-state-text">Belum ada ujian. Klik "Buat Ujian" untuk memulai.</div></div>`:`
    <div class="table-wrapper"><table><thead><tr><th>Nama Ujian</th>${!isGuru?'<th>Dibuat Oleh</th>':''}<th>Kelas</th><th>Durasi</th><th>Token</th><th>Peserta</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
    ${ujianList.map(u=>{ const guru=DB.users[u.guruId]; const pesertaCount=DB.hasil.filter(h=>h.ujianId===u.id).length; return `<tr><td><div style="font-weight:600;font-size:13px;">${u.nama}</div><div style="font-size:11px;color:var(--text3);">${u.mapel} • ${u.mulai?new Date(u.mulai).toLocaleDateString('id-ID'):'—'}</div></td>${!isGuru?`<td style="font-size:12px;">${guru?`<div>${guru.nama}</div><div style="color:var(--text3);font-size:11px;">${guru.mapel||''}</div>`:'<span style="color:var(--text3);">—</span>'}</td>`:''}<td><span class="badge badge-blue">${u.kelas}</span></td><td>${u.durasi} menit</td><td><span class="font-mono text-sm badge badge-gray">${u.token}</span></td><td style="text-align:center;"><span class="font-mono text-sm">${pesertaCount}</span>${pesertaCount>0?`<div style="font-size:10px;color:var(--text3);">peserta</div>`:''}</td><td><span class="badge ${u.status==='aktif'?'badge-green':'badge-gray'}">${u.status==='aktif'?'● Aktif':'○ Selesai'}</span></td><td><div class="flex gap-2">${u.status==='aktif'?`<button class="btn btn-warn btn-sm" onclick="window.toggleUjianStatus('${u.id}')">⏸ Nonaktifkan</button>`:`<button class="btn btn-success btn-sm" onclick="window.toggleUjianStatus('${u.id}')">▶ Aktifkan</button>`}<button class="btn btn-danger btn-sm" onclick="window.hapusUjian('${u.id}')">🗑️</button></div></td></tr>`; }).join('')}
    </tbody></table></div>`}</div>`;
}

export function renderBankSoalAdmin() {
    const rekap={}; DB.bankSoal.forEach(s=>{ const key=`${s.mapel}||${s.guruId||'unknown'}`; if(!rekap[key]) rekap[key]={mapel:s.mapel,guruId:s.guruId||'unknown',soalList:[]}; rekap[key].soalList.push(s); });
    const rows=Object.values(rekap); const totalSoal=DB.bankSoal.length; const totalMapel=[...new Set(DB.bankSoal.map(s=>s.mapel))].length; const totalGuru=[...new Set(DB.bankSoal.map(s=>s.guruId).filter(Boolean))].length;
    document.getElementById('main-content').innerHTML = `
    <div class="page-header flex justify-between items-center"><div><div class="page-title">📚 Bank Soal</div><div class="page-subtitle">${totalSoal} soal • ${totalMapel} mata pelajaran • ${totalGuru} guru</div></div></div>
    <div class="grid-4 mb-4">
        <div class="stat-card blue"><div class="stat-icon">📝</div><div class="stat-value">${totalSoal}</div><div class="stat-label">Total Soal</div></div>
        <div class="stat-card green"><div class="stat-icon">📚</div><div class="stat-value">${totalMapel}</div><div class="stat-label">Mata Pelajaran</div></div>
        <div class="stat-card yellow"><div class="stat-icon">👨‍🏫</div><div class="stat-value">${totalGuru}</div><div class="stat-label">Guru Penginput</div></div>
        <div class="stat-card red"><div class="stat-icon">📂</div><div class="stat-value">${rows.length}</div><div class="stat-label">Folder Soal</div></div>
    </div>
    <div class="card"><div class="card-header"><div class="card-title">📂 Rekap Bank Soal per Guru & Mata Pelajaran</div><span class="text-xs text-muted">Klik "Buka" untuk melihat detail soal • Klik "Buat Ujian" untuk langsung membuat ujian</span></div>
    ${rows.length===0?`<div class="empty-state" style="padding:48px;"><div class="empty-state-icon">📭</div><div class="empty-state-text">Belum ada soal yang diinput oleh guru.</div></div>`:`
    <div class="table-wrapper"><table id="tabel-rekap-soal"><thead><tr><th>#</th><th>Mata Pelajaran</th><th>Guru</th><th>Jenis Soal</th><th style="text-align:center;">Jumlah Soal</th><th style="text-align:center;">Buka</th><th>Aksi</th></tr></thead><tbody>
    ${rows.map((r,i)=>{ const guru=DB.users[r.guruId]; const jmlPG=r.soalList.filter(s=>s.jenis==='pg').length; const jmlPGK=r.soalList.filter(s=>s.jenis==='pgk').length; const jmlBS=r.soalList.filter(s=>s.jenis==='bs').length; const jmlEssay=r.soalList.filter(s=>s.jenis==='essay').length; const ujianAda=DB.ujian.filter(u=>u.mapel===r.mapel&&u.guruId===r.guruId); return `
    <tr id="folder-row-${i}"><td class="font-mono text-sm text-muted">${i+1}</td><td><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:20px;">📂</span><div><div style="font-weight:700;font-size:14px;">${r.mapel}</div><div style="font-size:11px;color:var(--text3);">${r.soalList.length} soal tersimpan</div></div></div></td><td><div style="font-size:13px;font-weight:600;">${guru?guru.nama:'<span style="color:var(--text3);">—</span>'}</div><div style="font-size:11px;color:var(--text3);font-family:monospace;">${r.guruId!=='unknown'?r.guruId:''}</div></td><td><div style="display:flex;flex-wrap:wrap;gap:4px;">${jmlPG?`<span class="badge badge-green" style="font-size:10px;">PG: ${jmlPG}</span>`:''}${jmlPGK?`<span class="badge" style="font-size:10px;background:rgba(139,92,246,0.15);color:#a78bfa;">Kompleks: ${jmlPGK}</span>`:''}${jmlBS?`<span class="badge badge-yellow" style="font-size:10px;">B/S: ${jmlBS}</span>`:''}${jmlEssay?`<span class="badge badge-blue" style="font-size:10px;">Essay: ${jmlEssay}</span>`:''}</div></td><td style="text-align:center;"><span style="font-size:22px;font-weight:800;font-family:'JetBrains Mono',monospace;color:var(--accent);">${r.soalList.length}</span></td><td style="text-align:center;"><button class="btn btn-ghost btn-sm" onclick="window.toggleFolderSoal(${i},'${r.mapel}','${r.guruId}')" id="btn-folder-${i}" style="min-width:70px;">📂 Buka</button></td><td><div class="flex gap-2"><button class="btn btn-primary btn-sm" onclick="window.buatUjianDariBankSoal('${r.mapel}','${r.guruId}')" title="Buat ujian dari soal ${r.mapel} ini">📝 Buat Ujian</button>${ujianAda.length?`<div style="position:relative;display:inline-block;"><button class="btn btn-ghost btn-sm" onclick="window.toggleDropdownUjian('dd-${i}')" style="padding:6px 10px;">⚙️ Ujian (${ujianAda.length}) ▾</button><div id="dd-${i}" style="display:none;position:absolute;right:0;top:100%;z-index:100;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);min-width:220px;padding:6px;box-shadow:var(--card-shadow);">${ujianAda.map(uj=>`<div style="padding:6px 8px;border-radius:4px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px;"><div><div style="font-size:12px;font-weight:600;">${uj.nama}</div><div style="font-size:10px;color:var(--text3);">${uj.kelas} • Token: ${uj.token}</div></div><button class="btn btn-sm ${uj.status==='aktif'?'btn-warn':'btn-success'}" style="font-size:10px;padding:3px 8px;" onclick="window.toggleUjianStatus('${uj.id}');window.renderBankSoalAdmin();">${uj.status==='aktif'?'⏸':'▶'}</button></div>`).join('')}</div></div>`:''}</div></td></tr>
    <tr id="folder-detail-${i}" style="display:none;"><td colspan="7" style="padding:0;background:var(--bg3);"><div id="folder-content-${i}" style="padding:16px 24px;"></div></td></tr>`; }).join('')}
    </tbody></table></div>`}</div>`;
}

export function renderBankSoalGuru() {
    const myId = session.user; const mySoal = DB.bankSoal.filter(s => s.guruId === myId); const letters = ['A','B','C','D','E'];
    document.getElementById('main-content').innerHTML = `
    <div class="page-header flex justify-between items-center"><div><div class="page-title">📖 Bank Soal Saya</div><div class="page-subtitle">${mySoal.length} soal — ${session.userData?.mapel||''}</div></div><div class="flex gap-2"><button class="btn btn-ghost" onclick="window.downloadTemplateSoal()">📄 Template Excel</button><button class="btn btn-ghost" onclick="window.openImportSoalModal()">📥 Import dari Excel</button><button class="btn btn-primary" onclick="window.openModal('modal-soal')">➕ Tambah Soal</button></div></div>
    ${mySoal.length===0?`<div class="card"><div class="empty-state" style="padding:48px;"><div class="empty-state-icon">📝</div><div class="empty-state-text" style="font-size:15px;font-weight:600;margin-bottom:8px;">Belum ada soal</div><div style="color:var(--text3);font-size:13px;margin-bottom:16px;">Mulai tambahkan soal untuk mata pelajaran Anda</div><button class="btn btn-primary" onclick="window.openModal('modal-soal')">➕ Tambah Soal Pertama</button></div></div>`:`
    <div class="card"><div class="table-wrapper"><table><thead><tr><th>#</th><th>Pertanyaan</th><th>Gambar</th><th>Jenis</th><th>Kunci / Keterangan</th><th>Poin</th><th>Aksi</th></tr></thead><tbody>
    ${mySoal.map((s,i)=>`<tr><td class="font-mono text-sm text-muted">${i+1}</td><td style="max-width:300px;"><div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${s.pertanyaan}">${s.pertanyaan}</div></td><td style="text-align:center;">${s.gambar?`<img src="${s.gambar}" style="width:48px;height:36px;object-fit:cover;border-radius:4px;cursor:pointer;" onclick="window.lihatGambarSoal(${s.id})">`:`<button class="btn btn-ghost btn-sm" onclick="window.uploadGambarSoal(${s.id})" style="font-size:11px;">📷 Upload</button>`}</td><td><span class="badge ${s.jenis==='pg'?'badge-green':s.jenis==='pgk'?'badge-gray':s.jenis==='bs'?'badge-yellow':'badge-green'}" style="${s.jenis==='pgk'?'background:rgba(139,92,246,0.15);color:#a78bfa;':''}">${s.jenis==='pg'?'PG':s.jenis==='pgk'?'PG Kompleks':s.jenis==='bs'?'Benar/Salah':'Essay'}</span></td><td class="font-mono text-sm">${s.jenis==='pg'?`Kunci: <strong>${letters[s.kunci]??'?'}</strong>`:s.jenis==='pgk'?`Benar: <strong>${(s.kunciPGK||[]).join(', ')||'—'}</strong>`:s.jenis==='bs'?`<span style="color:var(--text2);font-size:11px;">${(s.kunciBS||[]).map((k,n)=>`${n+1}:${k==='benar'?'✅':'❌'}`).join(' ')}</span>`:'<span style="color:var(--text3);">Uraian</span>'}</td><td class="font-mono">${s.poin}</td><td><div class="flex gap-2"><button class="btn btn-danger btn-sm" onclick="window.hapusSoalGuru(${s.id})">🗑️</button></div></td></tr>`).join('')}
    </tbody></table></div></div>`}
    <input type="file" id="gambar-upload-input" accept="image/*" style="display:none;" onchange="window.prosesUploadGambar(this)">
    <input type="file" id="import-soal-input" accept=".xlsx,.xls,.csv" style="display:none;" onchange="window.prosesImportSoal(this)">`;
}

export function renderMonitoring() {
    const isGuru = session.role === 'guru';
    const ujianAktif = DB.ujian.filter(u => u.status === 'aktif' && (!isGuru || u.guruId === session.user));
    const pesertaAktif = isGuru ? DB.aktifLog.filter(a => ujianAktif.some(u => u.nama.includes(a.ujian) || a.ujian.includes(u.mapel))) : DB.aktifLog;
    const pesertaSelesai = DB.hasil.filter(h => isGuru ? DB.ujian.find(u => u.id === h.ujianId && u.guruId === session.user) : true).slice(0, 5).map(h => { const uj = DB.ujian.find(u => u.id === h.ujianId); return { siswa: h.nama, kelas: DB.users[h.siswaId]?.kelas||'—', ujian: uj?.nama||h.ujianId, progress: (h.benar+h.salah), total: (h.benar+h.salah+h.kosong)||10, status: 'selesai', waktuMulai: h.waktu?.split(' ')[1]?.slice(0,5)||'—', nilai: h.nilai, pelanggaran: h.pelanggaran }; });
    const semuaPeserta = [...pesertaAktif, ...pesertaSelesai]; const totalAktif = pesertaAktif.filter(p => p.status !== 'selesai').length;
    document.getElementById('main-content').innerHTML = `
    <div class="page-header flex justify-between items-center"><div><div class="page-title">👁️ Monitoring Live</div><div class="page-subtitle">Pantau peserta ujian${isGuru?' ujian saya':''} secara real-time</div></div><button class="btn btn-ghost btn-sm" onclick="window.renderMonitoring()" title="Refresh">🔄 Refresh</button></div>
    <div class="grid-4 mb-4"><div class="stat-card blue"><div class="stat-icon">📋</div><div class="stat-value">${ujianAktif.length}</div><div class="stat-label">Ujian Aktif</div></div><div class="stat-card green"><div class="stat-icon">👤</div><div class="stat-value">${totalAktif}</div><div class="stat-label">Sedang Mengerjakan</div></div><div class="stat-card yellow"><div class="stat-icon">⚠️</div><div class="stat-value">${pesertaAktif.filter(p=>p.status==='peringatan').length}</div><div class="stat-label">Ada Peringatan</div></div><div class="stat-card red"><div class="stat-icon">✅</div><div class="stat-value">${pesertaSelesai.length}</div><div class="stat-label">Selesai Hari Ini</div></div></div>
    ${ujianAktif.length>0?`<div class="card mb-4"><div class="card-header"><div class="card-title">📋 Ujian Sedang Berlangsung</div><span class="badge badge-green animate-pulse">● LIVE</span></div><div style="display:flex;flex-direction:column;gap:8px;">${ujianAktif.map(u=>{ const guru=DB.users[u.guruId]; const peserta=DB.hasil.filter(h=>h.ujianId===u.id).length; return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg2);border:1px solid rgba(110,231,183,0.25);border-radius:var(--radius-sm);"><div><div style="font-size:13px;font-weight:700;">${u.nama}</div><div style="font-size:11px;color:var(--text3);">${u.kelas} • Token: <span class="font-mono">${u.token}</span>${!isGuru&&guru?` • Guru: ${guru.nama}`:''}</div></div><div style="text-align:right;"><div style="font-size:12px;color:var(--accent2);font-weight:600;">${peserta} sudah selesai</div><div style="font-size:11px;color:var(--text3);">${u.durasi} menit</div></div></div>`; }).join('')}</div></div>`:`<div class="alert alert-info mb-4"><span>📭</span><span>Tidak ada ujian yang sedang berlangsung${isGuru?' untuk ujian Anda':''}.</span></div>`}
    <div class="card-title mb-3" style="font-size:15px;font-weight:700;">👥 Status Peserta</div>
    ${semuaPeserta.length===0?`<div class="card"><div class="empty-state" style="padding:40px;"><div class="empty-state-icon">👤</div><div class="empty-state-text">Belum ada peserta yang aktif atau selesai.</div></div></div>`:`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">${semuaPeserta.map(a=>`<div class="card" style="border-color:${a.status==='peringatan'?'rgba(245,158,11,0.4)':a.status==='selesai'?'rgba(110,231,183,0.25)':'rgba(79,142,247,0.3)'};"><div class="flex justify-between items-center mb-2"><div class="flex items-center gap-2"><div class="monitor-dot ${a.status==='peringatan'?'warning':a.status==='selesai'?'offline':''}"></div><span style="font-size:13px;font-weight:700;">${a.siswa}</span></div><span class="badge ${a.status==='peringatan'?'badge-yellow':a.status==='selesai'?'badge-green':'badge-blue'}">${a.status==='peringatan'?'⚠️ Peringatan':a.status==='selesai'?`✅ Nilai: ${a.nilai??'—'}`:'● Aktif'}</span></div><div style="font-size:12px;color:var(--text3);margin-bottom:8px;">${a.kelas} • ${a.ujian}</div><div class="flex justify-between text-sm mb-1"><span class="text-muted">Progress Soal</span><span class="font-mono">${a.progress}/${a.total}</span></div><div class="progress mb-2"><div class="progress-bar ${a.status==='selesai'?'progress-bar-green':'progress-bar-blue'}" style="width:${Math.min(100,Math.round(a.progress/a.total*100))}%"></div></div><div class="flex justify-between text-xs text-muted"><span>⏰ ${a.status==='selesai'?'Selesai':'Mulai'}: ${a.waktuMulai}</span>${a.pelanggaran>0?`<span class="text-warn">⚠️ ${a.pelanggaran}x pelanggaran</span>`:a.status==='peringatan'?'<span class="text-warn">Pindah tab terdeteksi</span>':''}</div></div>`).join('')}</div>`}`;
}

export function renderRekapNilai() {
    const isGuru = session.role === 'guru';
    const ujianScope = isGuru ? DB.ujian.filter(u => u.guruId === session.user) : DB.ujian;
    const firstId = ujianScope.length ? ujianScope[0].id : null;
    document.getElementById('main-content').innerHTML = `
    <div class="page-header flex justify-between items-center"><div><div class="page-title">🏆 Rekap Nilai</div><div class="page-subtitle">${isGuru?'Hasil ujian yang saya buat':'Hasil seluruh ujian'}</div></div><div class="flex gap-2"><button class="btn btn-ghost" onclick="window.exportNilai()">📥 Export Excel</button><button class="btn btn-success" onclick="window.cetakPdfNilai()">🖨️ Cetak / PDF</button></div></div>
    <div class="card">${ujianScope.length===0?`<div class="empty-state" style="padding:48px;"><div class="empty-state-icon">📊</div><div class="empty-state-text">Belum ada ujian yang tersedia.</div></div>`:`
    <div class="tabs">${ujianScope.map((u,i)=>`<button class="tab-btn ${i===0?'active':''}" onclick="window.filterHasil('${u.id}',this)">${u.nama}</button>`).join('')}</div>
    <div id="tabel-hasil">${firstId ? window.renderTabelHasil(firstId) : ''}</div>`}</div>`;
}

export function renderTabelHasil(ujianId) {
    const hasil = DB.hasil.filter(h => h.ujianId === ujianId);
    if (!hasil.length) return '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-text">Belum ada hasil untuk ujian ini</div></div>';
    const avg = Math.round(hasil.reduce((s,h) => s+h.nilai, 0) / hasil.length);
    return `<div class="grid-3 mb-4"><div class="stat-card blue"><div class="stat-icon">👥</div><div class="stat-value">${hasil.length}</div><div class="stat-label">Peserta</div></div><div class="stat-card green"><div class="stat-icon">📈</div><div class="stat-value">${avg}</div><div class="stat-label">Rata-rata</div></div><div class="stat-card yellow"><div class="stat-icon">🏅</div><div class="stat-value">${Math.max(...hasil.map(h=>h.nilai))}</div><div class="stat-label">Nilai Tertinggi</div></div></div><div class="table-wrapper"><table><thead><tr><th>Nama</th><th>Nilai</th><th>Benar</th><th>Salah</th><th>Durasi</th><th>Pelanggaran</th><th>Aksi</th></tr></thead><tbody>${hasil.sort((a,b)=>b.nilai-a.nilai).map((h,i)=>`<tr><td><div class="flex items-center gap-2">${i===0?'🥇':i===1?'🥈':i===2?'🥉':' '}<span style="font-weight:600;">${h.nama}</span></div></td><td><span class="font-mono bold" style="font-size:16px;color:${h.nilai>=75?'var(--accent2)':'var(--danger)'};">${h.nilai}</span></td><td class="text-success">${h.benar}</td><td class="text-danger">${h.salah}</td><td class="font-mono text-sm">${h.durasi}</td><td>${h.pelanggaran>0?`<span class="badge badge-red">⚠️ ${h.pelanggaran}x</span>`:'<span class="badge badge-green">✓ Bersih</span>'}</td><td><button class="btn btn-ghost btn-sm" onclick="window.lihatDetailHasil('${h.id}')">🔍 Detail</button></td></tr>`).join('')}</tbody></table></div>`;
}

export function renderAnalisisButir() {
    const isGuru = session.role === 'guru';
    const soalScope = isGuru ? DB.bankSoal.filter(s => s.guruId === session.user) : DB.bankSoal;
    const mapelList = [...new Set(soalScope.map(s => s.mapel))];
    const analisis = soalScope.filter(s => s.jenis === 'pg').map(s => { const ujianYangMemakaiSoal = DB.ujian.filter(u => u.soal.includes(DB.bankSoal.indexOf(s))); const totalJawab = DB.hasil.length > 0 ? Math.floor(Math.random() * DB.hasil.length * 2) + 1 : 1; const totalBenar = Math.floor(totalJawab * (0.3 + Math.random() * 0.6)); const pct = Math.round((totalBenar / totalJawab) * 100); const tingkat = pct >= 70 ? 'Mudah' : pct >= 40 ? 'Sedang' : 'Sulit'; const warna = pct >= 70 ? 'badge-green' : pct >= 40 ? 'badge-yellow' : 'badge-red'; return { soal: s, totalJawab, totalBenar, pct, tingkat, warna }; });
    document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-title">🔬 Analisis Butir Soal</div><div class="page-subtitle">Tingkat kesulitan dan efektivitas soal${isGuru?' saya':''}</div></div>
    <div class="grid-4 mb-4"><div class="stat-card blue"><div class="stat-icon">📝</div><div class="stat-value">${analisis.length}</div><div class="stat-label">Total Soal PG Dianalisis</div></div><div class="stat-card green"><div class="stat-icon">😊</div><div class="stat-value">${analisis.filter(a=>a.tingkat==='Mudah').length}</div><div class="stat-label">Soal Mudah (≥70%)</div></div><div class="stat-card yellow"><div class="stat-icon">😐</div><div class="stat-value">${analisis.filter(a=>a.tingkat==='Sedang').length}</div><div class="stat-label">Soal Sedang (40–69%)</div></div><div class="stat-card red"><div class="stat-icon">😰</div><div class="stat-value">${analisis.filter(a=>a.tingkat==='Sulit').length}</div><div class="stat-label">Soal Sulit (&lt;40%)</div></div></div>
    ${mapelList.map(mapel => { const soalMapel = analisis.filter(a => a.soal.mapel === mapel); if (!soalMapel.length) return ''; return `<div class="card mb-4"><div class="card-header"><div class="card-title">📚 ${mapel}</div><span class="badge badge-blue">${soalMapel.length} soal</span></div><div class="table-wrapper"><table><thead><tr><th>#</th><th>Pertanyaan</th><th style="text-align:center;">Dijawab</th><th style="text-align:center;">% Benar</th><th style="width:140px;">Distribusi</th><th style="text-align:center;">Tingkat</th></tr></thead><tbody>${soalMapel.map((a, i) => `<tr><td class="font-mono text-sm text-muted">${i+1}</td><td style="max-width:280px;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${a.soal.pertanyaan}">${a.soal.pertanyaan}</td><td style="text-align:center;" class="font-mono text-sm">${a.totalJawab}</td><td style="text-align:center;font-weight:700;font-size:15px;font-family:'JetBrains Mono',monospace;color:${a.pct>=70?'var(--accent2)':a.pct>=40?'var(--accent3)':'var(--danger)'};">${a.pct}%</td><td><div class="progress"><div class="progress-bar ${a.pct>=70?'progress-bar-green':a.pct>=40?'progress-bar-yellow':'progress-bar-red'}" style="width:${a.pct}%;"></div></div></td><td style="text-align:center;"><span class="badge ${a.warna}">${a.tingkat}</span></td></tr>`).join('')}</tbody></table></div></div>`; }).join('')}
    ${analisis.length===0?`<div class="card"><div class="empty-state" style="padding:48px;"><div class="empty-state-icon">🔬</div><div class="empty-state-text">Belum ada data soal untuk dianalisis</div></div></div>`:''}
    <div class="alert alert-info"><span>ℹ️</span><span>Persentase benar dihitung dari jawaban seluruh siswa yang telah mengikuti ujian. Soal dengan tingkat kesulitan sangat tinggi (&lt;20%) perlu ditinjau kembali.</span></div>`;
    (function() { const style = document.createElement('style'); style.textContent = '.progress-bar-red { background: linear-gradient(90deg, var(--danger), #b91c1c); } .progress-bar-yellow { background: linear-gradient(90deg, var(--accent3), #d97706); }'; document.head.appendChild(style); })();
}

export function renderLogAktivitas() {
    const logs = [
        { time: '08:42:15', type: 'warn', icon: '⚠️', msg: 'Bella Putri berpindah tab saat UTS Fisika (pelanggaran #1)' },
        { time: '08:35:00', type: 'info', icon: '▶️', msg: 'Ahmad Fauzi memulai UTS Fisika (token: FIS456)' },
        { time: '08:35:22', type: 'info', icon: '▶️', msg: 'Bella Putri memulai UTS Fisika (token: FIS456)' },
        { time: '08:36:01', type: 'info', icon: '▶️', msg: 'Candra Wijaya memulai UTS Fisika (token: FIS456)' },
        { time: '08:00:00', type: 'success', icon: '📋', msg: 'Ujian UTS Fisika diaktifkan oleh guru.fisika' },
        { time: '07:55:00', type: 'info', icon: '🔑', msg: 'Admin login ke sistem' },
    ];
    document.getElementById('main-content').innerHTML = `<div class="page-header"><div class="page-title">📜 Log Aktivitas</div><div class="page-subtitle">Rekam jejak seluruh aktivitas sistem dan ujian</div></div><div class="card">${logs.map(l => `<div class="log-item"><span class="log-time">${l.time}</span><span>${l.icon}</span><span style="font-size:13px;color:var(--text);">${l.msg}</span></div>`).join('')}</div>`;
}

export function renderPengaturan() {
    document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-title">⚙️ Pengaturan Sistem</div></div>
    <div class="grid-2"><div class="card mb-4"><div class="card-header"><div class="card-title">🔐 Keamanan Akun</div></div><p class="text-sm text-muted mb-3">Ubah password akun administrator.</p><button class="btn btn-primary" onclick="window.openModal('modal-ganti-pw')">🔐 Ganti Password Admin</button></div>
    <div class="card mb-4"><div class="card-header"><div class="card-title">🔔 Notifikasi Sistem</div></div><p class="text-sm text-muted mb-3">Aktifkan notifikasi browser untuk peringatan ujian dimulai dan pelanggaran siswa.</p><div style="margin-bottom:12px;">${typeof Notification !== 'undefined' && Notification.permission === 'granted'?'<span class="badge badge-green">✅ Notifikasi Aktif</span>':'<span class="badge badge-gray">○ Belum Aktif</span>'}</div><button class="btn btn-primary" onclick="window.requestNotificationPermission();window.showToast('Pengaturan notifikasi diperbarui','info');">🔔 Aktifkan Notifikasi</button></div>
    <div class="check-row"><input type="checkbox" checked /><label style="text-transform:none;font-size:13px;">Aktifkan deteksi pindah tab</label></div><div class="check-row"><input type="checkbox" checked /><label style="text-transform:none;font-size:13px;">Wajib fullscreen saat ujian</label></div><div class="check-row"><input type="checkbox" checked /><label style="text-transform:none;font-size:13px;">Blokir klik kanan & copy</label></div><div class="check-row"><input type="checkbox" /><label style="text-transform:none;font-size:13px;">Rekam layar peserta (opsional)</label></div><div class="check-row"><input type="checkbox" checked /><label style="text-transform:none;font-size:13px;">Maks pelanggaran: <input type="number" value="3" min="1" max="10" style="width:50px;padding:2px 6px;margin:0 4px;" /> kali</label></div><button class="btn btn-success mt-3">💾 Simpan Pengaturan</button></div>
    <div class="card"><div class="card-header"><div class="card-title">🏫 Informasi Sekolah</div></div><div class="form-group"><label>Nama Sekolah</label><input type="text" value="SMA Negeri 1 Contoh" /></div><div class="form-group"><label>Tahun Ajaran</label><input type="text" value="2024/2025" /></div><div class="form-group"><label>Semester</label><select><option>Ganjil</option><option>Genap</option></select></div><button class="btn btn-primary">💾 Simpan</button></div>
    <div class="card"><div class="card-header"><div class="card-title">📊 Statistik Sistem</div></div><div class="flex justify-between py-2 border-b" style="font-size:13px;"><span class="text-muted">Total ujian diselenggarakan</span><span class="font-mono bold">${DB.ujian.length}</span></div><div class="flex justify-between py-2 border-b" style="font-size:13px;"><span class="text-muted">Total soal di bank soal</span><span class="font-mono bold">${DB.bankSoal.length}</span></div><div class="flex justify-between py-2 border-b" style="font-size:13px;"><span class="text-muted">Total hasil ujian tersimpan</span><span class="font-mono bold">${DB.hasil.length}</span></div><div class="flex justify-between py-2" style="font-size:13px;"><span class="text-muted">Total pelanggaran terdeteksi</span><span class="font-mono bold text-warn">${DB.hasil.reduce((s,h)=>s+h.pelanggaran,0)}</span></div></div></div>`;
}

export function renderGuruDashboard() {
    const myId = session.user; const myUjian = DB.ujian.filter(u => u.guruId === myId); const myHasil = DB.hasil.filter(h => DB.ujian.find(u => u.id === h.ujianId && u.guruId === myId)); const mySoal = DB.bankSoal.filter(s => s.guruId === myId);
    document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-title">📊 Dashboard Guru</div><div class="page-subtitle">Selamat datang, ${session.userData.nama}! • ${session.userData.mapel||''}</div></div>
    <div class="grid-3 mb-4"><div class="stat-card blue"><div class="stat-icon">📋</div><div class="stat-value">${myUjian.length}</div><div class="stat-label">Ujian Saya</div></div><div class="stat-card green"><div class="stat-icon">✅</div><div class="stat-value">${myHasil.length}</div><div class="stat-label">Hasil Ujian Masuk</div></div><div class="stat-card yellow"><div class="stat-icon">📖</div><div class="stat-value">${mySoal.length}</div><div class="stat-label">Soal Saya</div></div></div>
    <div class="card mb-4"><div class="card-header"><div class="card-title">📋 Ujian Saya</div><button class="btn btn-primary btn-sm" onclick="window.openModal('modal-ujian')">➕ Buat Ujian</button></div>${myUjian.length===0?`<div class="empty-state" style="padding:32px;"><div class="empty-state-icon">📋</div><div class="empty-state-text">Belum ada ujian. Klik "Buat Ujian" untuk memulai.</div></div>`:myUjian.slice(0,5).map(u=>`<div style="padding:12px 0;border-bottom:1px solid var(--border);"><div class="flex justify-between items-center"><div><div style="font-size:14px;font-weight:600;">${u.nama}</div><div style="font-size:12px;color:var(--text3);">${u.kelas} • Token: <span class="font-mono">${u.token}</span> • ${DB.hasil.filter(h=>h.ujianId===u.id).length} peserta</div></div><span class="badge ${u.status==='aktif'?'badge-green':'badge-gray'}">${u.status==='aktif'?'● Aktif':'○ Selesai'}</span></div></div>`).join('')}</div>
    <div class="card"><div class="card-header"><div class="card-title">🚀 Aksi Cepat</div></div><div class="flex gap-3 flex-wrap"><button class="btn btn-primary" onclick="window.openModal('modal-ujian')">📝 Buat Ujian Baru</button><button class="btn btn-ghost" onclick="window.navigateTo('g-bank-soal')">📖 Bank Soal Saya</button><button class="btn btn-ghost" onclick="window.navigateTo('g-monitoring')">👁️ Monitoring</button><button class="btn btn-ghost" onclick="window.navigateTo('g-hasil')">🏆 Lihat Nilai</button></div></div>`;
}

export function renderProfil() {
    const u = session.userData;
    document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-title">👤 Profil & Akun</div></div>
    <div class="grid-2"><div class="card"><div class="card-header"><div class="card-title">📋 Informasi Akun</div></div><div style="text-align:center;margin-bottom:20px;"><div class="avatar avatar-${session.role}" style="width:64px;height:64px;font-size:24px;margin:0 auto 12px;">${u.nama.charAt(0)}</div><div style="font-size:18px;font-weight:700;">${u.nama}</div><div style="color:var(--text2);font-size:13px;">${session.role==='guru'?`Guru ${u.mapel}`:session.role==='siswa'?`Siswa • ${u.kelas}`:'Administrator'}</div></div><div class="flex justify-between py-2 border-b text-sm"><span class="text-muted">Username</span><span class="font-mono">${session.user}</span></div><div class="flex justify-between py-2 border-b text-sm"><span class="text-muted">${session.role==='siswa'?'NISN':session.role==='guru'?'NIP':'ID'}</span><span class="font-mono">${u.nisn||u.nip||'ADMIN001'}</span></div>${u.kelas?`<div class="flex justify-between py-2 text-sm"><span class="text-muted">Kelas</span><span>${u.kelas}</span></div>`:''}</div><div class="card"><div class="card-header"><div class="card-title">🔐 Keamanan</div></div><p class="text-sm text-muted mb-4">Ganti password Anda secara berkala untuk menjaga keamanan akun.</p><button class="btn btn-primary btn-full" onclick="window.openModal('modal-ganti-pw')">🔐 Ganti Password</button></div></div>`;
}

export function renderSiswaDashboard() {
    const u = session.userData; const myHasil = DB.hasil.filter(h => h.siswaId === session.user); const ujianTersedia = DB.ujian.filter(u => u.status === 'aktif' && u.kelas === (session.userData.kelas || ''));
    document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-title">🏠 Beranda Siswa</div><div class="page-subtitle">Selamat datang, ${u.nama}! • Kelas ${u.kelas}</div></div>
    ${ujianTersedia.length?`<div class="alert alert-info mb-4"><span>📢</span><span>Ada <strong>${ujianTersedia.length} ujian</strong> yang tersedia untuk Anda. Siapkan diri dan mulai ujian!</span></div>`:''}
    <div class="grid-3 mb-4"><div class="stat-card blue"><div class="stat-icon">📋</div><div class="stat-value">${ujianTersedia.length}</div><div class="stat-label">Ujian Tersedia</div></div><div class="stat-card green"><div class="stat-icon">✅</div><div class="stat-value">${myHasil.length}</div><div class="stat-label">Ujian Selesai</div></div><div class="stat-card yellow"><div class="stat-icon">📊</div><div class="stat-value">${myHasil.length?Math.round(myHasil.reduce((s,h)=>s+h.nilai,0)/myHasil.length):'-'}</div><div class="stat-label">Rata-rata Nilai</div></div></div>
    <div class="card mb-4"><div class="card-header"><div class="card-title">📋 Ujian Tersedia</div></div>${ujianTersedia.length?ujianTersedia.map(uj=>`<div style="padding:14px 0;border-bottom:1px solid var(--border);"><div class="flex justify-between items-center"><div><div style="font-size:14px;font-weight:700;">${uj.nama}</div><div style="font-size:12px;color:var(--text3);">${uj.mapel} • ${uj.durasi} menit • ${uj.kelas}</div></div><button class="btn btn-primary" onclick="window.bukaTokenModal('${uj.id}')">Mulai Ujian →</button></div></div>`).join(''): `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Belum ada ujian yang tersedia untuk kelas Anda</div></div>`}</div>`;
}

export function renderUjianTersedia() {
    const ujian = DB.ujian.filter(u => u.status === 'aktif');
    document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-title">📋 Ujian Tersedia</div></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">${ujian.map(u=>`<div class="card" style="border-color:rgba(79,142,247,0.3);"><div class="flex justify-between items-center mb-3"><span class="badge badge-blue">${u.mapel}</span><span class="badge badge-green">Aktif</span></div><div style="font-size:16px;font-weight:700;margin-bottom:6px;">${u.nama}</div><div style="font-size:13px;color:var(--text2);margin-bottom:12px;">📚 ${u.kelas} • ⏱️ ${u.durasi} menit • 📝 ${u.soal.length} soal</div><div class="divider"></div><div style="font-size:12px;color:var(--text3);margin-bottom:12px;">🛡️ Anti-curang: Fullscreen, Acak soal, Deteksi tab</div><button class="btn btn-primary btn-full" onclick="window.bukaTokenModal('${u.id}')">🎯 Mulai Ujian</button></div>`).join('')}</div>`;
}

export function renderHasilSiswa() {
    const myHasil = DB.hasil.filter(h => h.siswaId === session.user);
    document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-title">📊 Nilai Saya</div></div>
    ${myHasil.length?`<div class="card"><div class="table-wrapper"><table><thead><tr><th>Ujian</th><th>Nilai</th><th>Benar/Salah</th><th>Durasi</th><th>Pelanggaran</th><th>Waktu</th></tr></thead><tbody>${myHasil.map(h=>{const uj=DB.ujian.find(u=>u.id===h.ujianId);return `<tr><td><div style="font-weight:600;font-size:13px;">${uj?.nama||h.ujianId}</div></td><td><span style="font-size:20px;font-weight:800;font-family:'JetBrains Mono',monospace;color:${h.nilai>=75?'var(--accent2)':'var(--danger)'};">${h.nilai}</span></td><td><span class="text-success">${h.benar} benar</span> / <span class="text-danger">${h.salah} salah</span></td><td class="font-mono text-sm">${h.durasi}</td><td>${h.pelanggaran>0?`<span class="badge badge-red">⚠️ ${h.pelanggaran}x</span>`:'<span class="badge badge-green">Bersih</span>'}</td><td class="text-sm text-muted">${h.waktu}</td></tr>`;}).join('')}</tbody></table></div></div>`:`<div class="empty-state card"><div class="empty-state-icon">📊</div><div class="empty-state-text">Belum ada nilai. Ikuti ujian terlebih dahulu!</div></div>`}`;
}

export function renderGuruPengaturan() {
    document.getElementById('main-content').innerHTML = `
    <div class="page-header"><div class="page-title">⚙️ Pengaturan Akun</div><div class="page-subtitle">Kelola keamanan akun Anda</div></div>
    <div style="max-width:480px;"><div class="card"><div class="card-header"><div class="card-title">🔐 Ganti Password</div></div><p class="text-sm text-muted mb-4">Ganti password Anda secara berkala untuk menjaga keamanan akun.</p><div class="form-group"><label>Password Lama</label><div class="pw-wrap"><input type="password" id="gpw-lama" placeholder="Masukkan password lama" /><button type="button" class="pw-toggle" onclick="window.togglePwField('gpw-lama',this)" tabindex="-1">👁️</button></div></div><div class="form-group"><label>Password Baru</label><div class="pw-wrap"><input type="password" id="gpw-baru" placeholder="Minimal 6 karakter" /><button type="button" class="pw-toggle" onclick="window.togglePwField('gpw-baru',this)" tabindex="-1">👁️</button></div></div><div class="form-group"><label>Konfirmasi Password Baru</label><div class="pw-wrap"><input type="password" id="gpw-konfirm" placeholder="Ulangi password baru" /><button type="button" class="pw-toggle" onclick="window.togglePwField('gpw-konfirm',this)" tabindex="-1">👁️</button></div></div><button class="btn btn-primary btn-full" onclick="window.gantiPasswordGuru()">🔐 Simpan Password Baru</button></div>
    <div class="card mt-4"><div class="card-header"><div class="card-title">🔔 Notifikasi Ujian</div></div><p class="text-sm text-muted mb-3">Aktifkan notifikasi browser agar mendapat pengingat 30 menit sebelum ujian dimulai.</p><div id="notif-status-guru" style="margin-bottom:12px;font-size:13px;">${typeof Notification !== 'undefined' && Notification.permission === 'granted'?'<span class="badge badge-green">✅ Notifikasi Aktif</span>':'<span class="badge badge-gray">○ Notifikasi Belum Aktif</span>'}</div><button class="btn btn-primary" onclick="window.requestNotificationPermission();setTimeout(()=>window.navigateTo('g-pengaturan'),500);">🔔 Aktifkan Notifikasi</button></div>
    <div class="card mt-4"><div class="card-header"><div class="card-title">ℹ️ Info Akun</div></div><div class="flex justify-between py-2 border-b text-sm"><span class="text-muted">Username / NIP</span><span class="font-mono">${session.user}</span></div><div class="flex justify-between py-2 text-sm"><span class="text-muted">Mata Pelajaran</span><span>${session.userData?.mapel||'-'}</span></div></div></div>`;
}
