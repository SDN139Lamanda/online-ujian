import { DB } from '../core/db.js';
import { session, selectedRole } from '../core/state.js';
import { showPage, buildApp, navigateTo } from '../core/router.js';
import { showToast } from '../utils/toast.js';
import { closeModal, openModal } from '../utils/modal.js';
import { generatePassword } from '../utils/helpers.js';

// ⚡ Diambil dari Word: AUTH & SESSION
export function selectRole(role, el) {
    selectedRole = role;
    document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

export function doLogin() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errEl = document.getElementById('login-error');
    errEl.classList.add('hidden');

    if (!user || !pass) { showToast('Isi username dan password!', 'warn'); return; }

    const userData = DB.users[user];
    if (!userData || userData.password !== pass || userData.role !== selectedRole) {
        errEl.classList.remove('hidden');
        document.getElementById('login-form').classList.add('animate-shake');
        setTimeout(() => document.getElementById('login-form').classList.remove('animate-shake'), 400);
        return;
    }

    session.user = user;
    session.role = userData.role;
    session.userData = userData;

    showPage('page-app');
    buildApp();
    showToast(`Selamat datang, ${userData.nama}! 👋`, 'success');

    setTimeout(() => {
        if (window.requestNotificationPermission) window.requestNotificationPermission();
        if (window.jadwalkanNotifikasiUjian) window.jadwalkanNotifikasiUjian();
    }, 1500);
}

export function doLogout() {
    session.user = null; session.role = null; session.userData = null;
    if (window.stopExamTimer) window.stopExamTimer();
    showPage('page-login');
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
}

export function gantiPassword() {
    const lama = document.getElementById('pw-lama').value;
    const baru = document.getElementById('pw-baru').value;
    const konfirm = document.getElementById('pw-konfirm').value;
    if (DB.users[session.user].password !== lama) { showToast('Password lama salah!', 'error'); return; }
    if (baru.length < 6) { showToast('Password baru minimal 6 karakter!', 'warn'); return; }
    if (baru !== konfirm) { showToast('Konfirmasi password tidak cocok!', 'error'); return; }
    DB.users[session.user].password = baru;
    closeModal('modal-ganti-pw');
    showToast('Password berhasil diubah!', 'success');
}

export function gantiPasswordGuru() {
    const lama = document.getElementById('gpw-lama')?.value;
    const baru = document.getElementById('gpw-baru')?.value;
    const konfirm = document.getElementById('gpw-konfirm')?.value;
    if (DB.users[session.user].password !== lama) { showToast('Password lama salah!', 'error'); return; }
    if (!baru || baru.length < 6) { showToast('Password baru minimal 6 karakter!', 'warn'); return; }
    if (baru !== konfirm) { showToast('Konfirmasi password tidak cocok!', 'error'); return; }
    DB.users[session.user].password = baru;
    document.getElementById('gpw-lama').value = '';
    document.getElementById('gpw-baru').value = '';
    document.getElementById('gpw-konfirm').value = '';
    showToast('✅ Password berhasil diubah!', 'success');
}
