import { examState } from '../core/state.js';
import { showToast } from '../utils/toast.js';

// ⚡ Diambil dari Word: TIMER UJIAN
export function startExamTimer() {
    stopExamTimer();
    examState.timer = setInterval(() => {
        examState.timeLeft--;
        updateTimerDisplay();
        if (examState.timeLeft <= 0) {
            stopExamTimer();
            showToast('⏰ Waktu habis! Ujian dikumpulkan otomatis.', 'warn');
            if (window.autoSubmitExam) window.autoSubmitExam();
        }
    }, 1000);
}

export function stopExamTimer() {
    if (examState.timer) { clearInterval(examState.timer); examState.timer = null; }
}

export function updateTimerDisplay() {
    const t = examState.timeLeft;
    const m = String(Math.floor(t / 60)).padStart(2, '0');
    const s = String(t % 60).padStart(2, '0');
    const el = document.getElementById('exam-timer');
    if (el) {
        el.textContent = `${m}:${s}`;
        el.className = `exam-timer ${t < 300 ? 'warning' : ''}`;
    }
}

export function confirmSubmit() {
    const answered = Object.keys(examState.answers).length;
    const total = examState.soalList.length;
    const belum = total - answered;
    if (belum > 0) {
        if (!confirm(`Masih ada ${belum} soal belum dijawab. Yakin ingin mengumpulkan?`)) return;
    }
    if (window.submitExam) window.submitExam();
}

export function autoSubmitExam() {
    if (window.submitExam) window.submitExam();
}
