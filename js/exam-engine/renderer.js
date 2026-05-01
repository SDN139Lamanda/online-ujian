import { DB } from '../core/db.js';
import { examState } from '../core/state.js';

// ⚡ Diambil dari Word: RENDERER SOAL & NAVIGASI
export function buildQuestionNav() {
    const nav = document.getElementById('question-nums');
    if (!nav) return;
    nav.innerHTML = '';
    examState.soalList.forEach((_, i) => {
        const el = document.createElement('div');
        el.className = `q-num ${i === 0 ? 'current' : ''}`;
        el.textContent = i + 1;
        el.onclick = () => window.gotoQuestion(i);
        nav.appendChild(el);
    });
    window.updateProgress?.();
}

export function gotoQuestion(idx) {
    if (idx < 0 || idx >= examState.soalList.length) return;
    examState.currentQ = idx;
    window.updateNav?.(idx);
    renderQuestion(idx);
}

export function updateNav(currentIdx) {
    document.querySelectorAll('.q-num').forEach((el, i) => {
        el.className = 'q-num';
        if (i === currentIdx) el.classList.add('current');
        else if (examState.flagged.has(i)) el.classList.add('flagged');
        else if (examState.answers[i] !== undefined) el.classList.add('answered');
    });
}

export function toggleFlag() {
    const idx = examState.currentQ;
    if (examState.flagged.has(idx)) examState.flagged.delete(idx);
    else examState.flagged.add(idx);
    window.updateNav?.(idx);
    renderQuestion(idx);
}

export function updateProgress() {
    const answered = Object.keys(examState.answers).length;
    const total = examState.soalList.length;
    const el = document.getElementById('exam-progress-text');
    if (el) el.textContent = `${answered} / ${total}`;
}

export function renderQuestion(idx) {
    const soal = examState.soalList[idx];
    if (!soal) return;
    const totalSoal = examState.soalList.length;
    const letters = ['A', 'B', 'C', 'D', 'E'];
    let optionsHtml = '';

    // ── PG biasa ──
    if (soal.jenis === 'pg') {
        let opts = soal.opsi.map((o, i) => ({ text: o, origIdx: i }));
        if (examState.ujian?.opsiAntiCurang?.acakOpsi) opts = opts.sort(() => Math.random() - 0.5);
        optionsHtml = `<ul class="options-list">${opts.map((o, i) => {
            const letter = letters[i];
            const isSelected = examState.answers[idx]?.origIdx === o.origIdx;
            const gambarOpsi = soal.opsiGambar?.[letters[o.origIdx]] || null;
            return `<li class="option-item ${isSelected ? 'selected' : ''}" onclick="window.selectAnswer(${idx}, ${o.origIdx}, this)">
                <div class="option-letter">${letter}</div>
                <div class="option-text" style="flex:1;">
                    ${o.text ? `<div>${o.text}</div>` : ''}
                    ${gambarOpsi ? `<img src="${gambarOpsi}" style="max-height:120px;max-width:100%;border-radius:6px;margin-top:6px;object-fit:contain;border:1px solid var(--border);">` : ''}
                </div>
            </li>`;
        }).join('')}</ul>`;
    } 
    // ── PG Kompleks ──
    else if (soal.jenis === 'pgk') {
        const savedPGK = examState.answers[idx]?.selected || [];
        optionsHtml = `
        <div class="alert alert-info mb-3" style="font-size:12px;"><span>ℹ️</span><span>Pilih <strong>semua pernyataan yang BENAR</strong>. Boleh memilih lebih dari satu.</span></div>
        <div style="display:flex;flex-direction:column;gap:8px;">${(soal.pernyataan || []).map((p, pi) => {
            const letter = letters[pi];
            const isChecked = savedPGK.includes(letter);
            return `<label style="display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border:1px solid ${isChecked ? 'var(--accent)' : 'var(--border)'};border-radius:var(--radius-sm);cursor:pointer;background:${isChecked ? 'rgba(79,142,247,0.1)' : 'var(--bg2)'};transition:all .2s;" onclick="window.togglePGK(${idx},'${letter}',this)">
                <div style="width:26px;height:26px;border-radius:6px;background:${isChecked ? 'var(--accent)' : 'var(--border)'};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;color:${isChecked ? '#fff' : 'inherit'};">${letter}</div>
                <div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--text2);margin-bottom:2px;">Pernyataan ${letter}</div><div style="font-size:14px;">${p}</div></div>
            </label>`;
        }).join('')}</div>`;
    } 
    // ── Benar / Salah ──
    else if (soal.jenis === 'bs') {
        const savedBS = examState.answers[idx]?.jawaban || {};
        optionsHtml = `
        <div class="alert alert-info mb-3" style="font-size:12px;"><span>ℹ️</span><span>Tentukan apakah setiap pernyataan berikut <strong>Benar</strong> atau <strong>Salah</strong>.</span></div>
        <div style="display:flex;flex-direction:column;gap:8px;">${(soal.pernyataan || []).map((p, pi) => {
            const jawabanSiswa = savedBS[pi];
            return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px 16px;">
                <div style="font-size:14px;margin-bottom:10px;line-height:1.5;">${pi + 1}. ${p}</div>
                <div style="display:flex;gap:10px;">
                    <button onclick="window.pilihBS(${idx},${pi},'benar',this)" style="flex:1;padding:8px;border-radius:6px;border:2px solid ${jawabanSiswa === 'benar' ? 'var(--accent2)' : 'var(--border)'};background:${jawabanSiswa === 'benar' ? 'rgba(110,231,183,0.15)' : 'transparent'};color:${jawabanSiswa === 'benar' ? 'var(--accent2)' : 'var(--text2)'};font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;">✅ Benar</button>
                    <button onclick="window.pilihBS(${idx},${pi},'salah',this)" style="flex:1;padding:8px;border-radius:6px;border:2px solid ${jawabanSiswa === 'salah' ? 'var(--danger)' : 'var(--border)'};background:${jawabanSiswa === 'salah' ? 'rgba(239,68,68,0.15)' : 'transparent'};color:${jawabanSiswa === 'salah' ? 'var(--danger)' : 'var(--text2)'};font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;">❌ Salah</button>
                </div>
            </div>`;
        }).join('')}</div>`;
    } 
    // ── Essay ──
    else {
        optionsHtml = `<textarea class="essay-area" placeholder="Tuliskan jawaban Anda di sini..." onchange="window.saveEssay(${idx}, this.value)">${examState.answers[idx]?.text || ''}</textarea>`;
    }

    const jenisBadge = { pg: 'PG', pgk: 'PG Kompleks', bs: 'Benar/Salah', essay: 'Essay' }[soal.jenis] || soal.jenis;
    const jenisBadgeColor = { pg: 'badge-blue', pgk: 'badge-gray', bs: 'badge-yellow', essay: 'badge-green' }[soal.jenis] || 'badge-blue';

    document.getElementById('exam-main').innerHTML = `
        <div class="question-card">
            <div class="question-header">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span class="question-num-badge">Soal ${idx + 1} dari ${totalSoal}</span>
                    <span class="badge ${jenisBadgeColor}" style="font-size:10px;">${jenisBadge}</span>
                </div>
                <span class="badge ${examState.flagged.has(idx) ? 'badge-yellow' : 'badge-gray'}">${examState.flagged.has(idx) ? '🚩 Ditandai' : 'Tandai'}</span>
            </div>
            ${soal.gambar ? `<img src="${soal.gambar}" style="max-width:100%;max-height:220px;object-fit:contain;border-radius:8px;margin-bottom:14px;border:1px solid var(--border);">` : ''}
            <div class="question-text">${soal.pertanyaan || ''}</div>
            ${optionsHtml}
            <div class="exam-actions">
                <button class="btn btn-ghost" onclick="window.gotoQuestion(${idx - 1})" ${idx === 0 ? 'disabled' : ''}>← Sebelumnya</button>
                <div class="flex gap-2">
                    <button class="btn btn-warn btn-sm" onclick="window.toggleFlag()">🚩</button>
                    ${idx === totalSoal - 1 ? `<button class="btn btn-success" onclick="window.confirmSubmit()">✅ Kumpulkan Ujian</button>` : `<button class="btn btn-primary" onclick="window.gotoQuestion(${idx + 1})">Selanjutnya →</button>`}
                </div>
            </div>
        </div>`;
}
