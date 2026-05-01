import { DB } from '../core/db.js';
import { notifTimers } from '../core/state.js';
import { showToast } from './toast.js';

// ⚡ Diambil dari Word: NOTIFIKASI UJIAN
export function requestNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') showToast('Notifikasi ujian diaktifkan! ✅', 'success');
        });
    }
}

export function jadwalkanNotifikasiUjian() {
    notifTimers.forEach(t => clearTimeout(t));
    notifTimers.length = 0;
    if (Notification.permission !== 'granted') return;

    DB.ujian.filter(u => u.status === 'aktif').forEach(ujian => {
        if (!ujian.mulai) return;
        const mulaiMs = new Date(ujian.mulai).getTime();
        const now = Date.now();

        const t30 = mulaiMs - 30 * 60000;
        if (t30 > now) {
            notifTimers.push(setTimeout(() => {
                new Notification('⏰ Ujian akan segera dimulai!', { body: `${ujian.nama} dimulai 30 menit lagi.`, icon: '🛡️' });
            }, t30 - now));
        }
        if (mulaiMs > now) {
            notifTimers.push(setTimeout(() => {
                new Notification('🚨 Ujian Dimulai Sekarang!', { body: `${ujian.nama} telah dimulai. Token: ${ujian.token}`, icon: '🛡️' });
            }, mulaiMs - now));
        }
    });
}
