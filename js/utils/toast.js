// ⚡ Diambil dari Word: TOAST NOTIFICATIONS
export function showToast(msg, type = 'info') {
    const icons = { success: '✅', error: '❌', warn: '⚠️', info: 'ℹ️' };
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type === 'warn' ? 'warn' : type}`;
    toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}
