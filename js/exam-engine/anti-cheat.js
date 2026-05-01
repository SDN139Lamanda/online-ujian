import { examState } from '../core/state.js';
import { showToast } from '../utils/toast.js';

// ⚡ Diambil dari Word: ANTI-CHEAT SYSTEM
export function setupAntiCheat(opts) {
    if (opts.tabDetect) {
        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('blur', handleBlur);
    }
    if (opts.noCopy) {
        document.addEventListener('copy', preventAction);
        document.addEventListener('cut', preventAction);
        document.addEventListener('paste', preventAction);
        document.addEventListener('keydown', preventDevTools);
    }
    if (opts.noRightClick) {
        document.addEventListener('contextmenu', preventAction);
    }
}

export function removeAntiCheat() {
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('blur', handleBlur);
    document.removeEventListener('copy', preventAction);
    document.removeEventListener('cut', preventAction);
    document.removeEventListener('paste', preventAction);
    document.removeEventListener('keydown', preventDevTools);
    document.removeEventListener('contextmenu', preventAction);
}

function handleVisibility() {
    if (document.hidden && document.getElementById('page-exam').classList.contains('active')) {
        triggerViolation('Anda berpindah tab atau meminimize browser!');
    }
}

function handleBlur() {
    if (document.getElementById('page-exam').classList.contains('active')) {
        triggerViolation('Browser kehilangan fokus — kemungkinan Anda membuka aplikasi lain!');
    }
}

function preventAction(e) {
    if (document.getElementById('page-exam').classList.contains('active')) {
        e.preventDefault();
        showToast('⛔ Aksi ini dinonaktifkan selama ujian.', 'warn');
    }
}

function preventDevTools(e) {
    if (document.getElementById('page-exam').classList.contains('active')) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) || (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            triggerViolation('Percobaan membuka DevTools terdeteksi!');
        }
    }
}

export function triggerViolation(msg) {
    examState.violations++;
    document.getElementById('cheat-warning-msg').textContent = msg + ` (Pelanggaran ke-${examState.violations})`;
    document.getElementById('violation-count').textContent = examState.violations;
    document.getElementById('cheat-warning').classList.remove('hidden');
    showToast(`⚠️ Pelanggaran #${examState.violations} dicatat`, 'error');

    if (examState.violations >= examState.maxViolations) {
        document.getElementById('cheat-warning').innerHTML = `
        <div style="font-size:56px">🚫</div>
        <h2>UJIAN DIHENTIKAN</h2>
        <p>Anda telah melakukan ${examState.violations} kali pelanggaran. Ujian dikumpulkan secara otomatis.</p>
        <button class="btn btn-lg" style="background:#fff;color:#ef4444;" onclick="window.forceSubmit()">OK, Kumpulkan Ujian</button>`;
    }
}

export function forceSubmit() {
    document.getElementById('cheat-warning').classList.add('hidden');
    if (window.submitExam) window.submitExam();
}

export function enterFullscreen() {
    document.documentElement.requestFullscreen().catch(() => {});
    document.getElementById('fullscreen-prompt').classList.add('hidden');
}

export function exitFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}
