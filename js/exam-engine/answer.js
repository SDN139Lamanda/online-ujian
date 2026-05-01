import { examState } from '../core/state.js';
import { renderQuestion, updateNav, updateProgress } from './renderer.js';

// ⚡ Diambil dari Word: JAWABAN SISWA
export function selectAnswer(qIdx, origIdx, el) {
    examState.answers[qIdx] = { origIdx, type: 'pg' };
    document.querySelectorAll('.option-item').forEach(o => {
        o.classList.remove('selected');
        const letterEl = o.querySelector('.option-letter');
        if (letterEl) { letterEl.style.background = ''; letterEl.style.color = ''; }
    });
    el.classList.add('selected');
    const letterEl = el.querySelector('.option-letter');
    if (letterEl) { letterEl.style.background = 'var(--accent)'; letterEl.style.color = '#fff'; }
    updateNav(qIdx);
    updateProgress();
}

export function togglePGK(qIdx, letter, el) {
    if (!examState.answers[qIdx]) examState.answers[qIdx] = { selected: [], type: 'pgk' };
    const sel = examState.answers[qIdx].selected;
    const pos = sel.indexOf(letter);
    if (pos >= 0) sel.splice(pos, 1);
    else sel.push(letter);
    renderQuestion(qIdx);
    updateNav(qIdx);
    updateProgress();
}

export function pilihBS(qIdx, pernyataanIdx, nilai, btn) {
    if (!examState.answers[qIdx]) examState.answers[qIdx] = { jawaban: {}, type: 'bs' };
    examState.answers[qIdx].jawaban[pernyataanIdx] = nilai;
    renderQuestion(qIdx);
    updateNav(qIdx);
    updateProgress();
}

export function saveEssay(idx, text) {
    examState.answers[idx] = { text, type: 'essay' };
    updateNav(idx);
    updateProgress();
}
