import { closeModal } from './modal.js';

// ⚡ Diambil dari Word: INIT & KEYBOARD SHORTCUTS
export function initApp() {
    document.getElementById('login-user').value = 'admin';
    document.getElementById('login-pass').value = '123456';

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    });

    document.addEventListener('keydown', e => {
        if (document.getElementById('page-login').classList.contains('active') && e.key === 'Enter') {
            window.doLogin?.();
        }
    });
}
