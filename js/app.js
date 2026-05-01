// js/app.js — Entry Point (Stabil & Conflict-Free)
import { DB } from './core/db.js';
import { session, examState, pwVisible, notifTimers } from './core/state.js';
import { showPage, buildApp, navigateTo, renderView } from './core/router.js';

// js/app.js — Tambahkan di bagian import
import { FirebaseService } from './services/firebase.js';
import { DataAdapter } from './services/dataAdapter.js';

// ... (import lainnya tetap sama) ...

// Modules
import { doLogin, doLogout, gantiPassword, gantiPasswordGuru, selectRole } from './modules/auth.js';
import { saveGuru, saveSiswa, resetPasswordGuru, resetPasswordSiswa, hapusUser, filterSiswaKombinasi, openImportSiswa, openImportGuru, prosesImportGuruFile, prosesImportSiswaFile, renderDataGuru, renderDataSiswa } from './modules/users.js';
import { saveUjian, hapusUjian, toggleUjianStatus, bukaTokenModal, validateToken, renderDataUjian, renderUjianTersedia, renderHasilSiswa, exportNilai, downloadExcelGuru, downloadExcelSiswa, lihatDetailHasil, printHasil, renderTabelHasil, renderRekapNilai, filterHasil } from './modules/exams.js';
import { saveSoalBatch, saveSoal, renderBankSoalAdmin, renderBankSoalGuru, hapusSoalGuru, toggleFolderSoal, toggleDropdownUjian, buatUjianDariBankSoal, previewGambarSoalRow, hapusGambarRow, previewGambarOpsi, hapusGambarOpsi, uploadGambarSoal, prosesUploadGambar, lihatGambarSoal, tambahSoalRow, renderAllSoalRows, updateOpsiRows, toggleEssayOption } from './modules/questions.js';
import { exportToExcel, downloadTemplateSiswa, downloadTemplateGuru, downloadTemplateSoal, openImportSoalModal, prosesImportSoal, cetakPdfNilai } from './modules/import-export.js';
import { renderMonitoring, renderLogAktivitas } from './modules/monitoring.js';

// Exam Engine
import { startExamTimer, stopExamTimer, confirmSubmit, autoSubmitExam } from './exam-engine/timer.js';
import { renderQuestion, gotoQuestion, updateNav, toggleFlag, updateProgress, buildQuestionNav } from './exam-engine/renderer.js';
import { selectAnswer, togglePGK, pilihBS, saveEssay } from './exam-engine/answer.js';
import { setupAntiCheat, removeAntiCheat, triggerViolation, forceSubmit, enterFullscreen, exitFullscreen } from './exam-engine/anti-cheat.js';

// Utils
import { showToast } from './utils/toast.js';
import { openModal, closeModal } from './utils/modal.js';
import { requestNotificationPermission, jadwalkanNotifikasiUjian } from './utils/notifications.js';
import { initApp } from './utils/init.js';
import { getKelasOptions, refreshAllKelasSelects, togglePwField, togglePw, generatePassword, generateToken, syncGuruUsername, syncSiswaFromNISN } from './utils/helpers.js';

// ================================================================
// GLOBAL BINDING (Agar onclick="..." di HTML tetap berjalan)
// ================================================================
window.DB = DB; window.session = session; window.examState = examState; window.pwVisible = pwVisible;
window.showPage = showPage; window.buildApp = buildApp; window.navigateTo = navigateTo; window.renderView = renderView;

window.doLogin = doLogin; window.doLogout = doLogout; window.selectRole = selectRole; window.gantiPassword = gantiPassword; window.gantiPasswordGuru = gantiPasswordGuru;
window.saveGuru = saveGuru; window.saveSiswa = saveSiswa; window.hapusUser = hapusUser; window.resetPasswordGuru = resetPasswordGuru; window.resetPasswordSiswa = resetPasswordSiswa; window.filterSiswaKombinasi = filterSiswaKombinasi;

window.saveUjian = saveUjian; window.hapusUjian = hapusUjian; window.toggleUjianStatus = toggleUjianStatus; window.bukaTokenModal = bukaTokenModal; window.validateToken = validateToken;
window.exportNilai = exportNilai; window.downloadExcelGuru = downloadExcelGuru; window.downloadExcelSiswa = downloadExcelSiswa; window.lihatDetailHasil = lihatDetailHasil; window.printHasil = printHasil;
window.renderTabelHasil = renderTabelHasil; window.filterHasil = filterHasil;

window.saveSoalBatch = saveSoalBatch; window.saveSoal = saveSoal; window.hapusSoalGuru = hapusSoalGuru; window.toggleFolderSoal = toggleFolderSoal; window.buatUjianDariBankSoal = buatUjianDariBankSoal;
window.previewGambarSoalRow = previewGambarSoalRow; window.hapusGambarRow = hapusGambarRow; window.previewGambarOpsi = previewGambarOpsi; window.hapusGambarOpsi = hapusGambarOpsi;
window.uploadGambarSoal = uploadGambarSoal; window.prosesUploadGambar = prosesUploadGambar; window.lihatGambarSoal = lihatGambarSoal;
window.tambahSoalRow = tambahSoalRow; window.renderAllSoalRows = renderAllSoalRows; window.updateOpsiRows = updateOpsiRows; window.toggleEssayOption = toggleEssayOption;

window.exportToExcel = exportToExcel; window.downloadTemplateSiswa = downloadTemplateSiswa; window.downloadTemplateGuru = downloadTemplateGuru; window.downloadTemplateSoal = downloadTemplateSoal;
window.openImportSoalModal = openImportSoalModal; window.prosesImportSoal = prosesImportSoal; window.cetakPdfNilai = cetakPdfNilai;

window.openModal = openModal; window.closeModal = closeModal; window.showToast = showToast;
window.startExamTimer = startExamTimer; window.stopExamTimer = stopExamTimer; window.confirmSubmit = confirmSubmit; window.autoSubmitExam = autoSubmitExam;
window.renderQuestion = renderQuestion; window.gotoQuestion = gotoQuestion; window.updateNav = updateNav; window.toggleFlag = toggleFlag; window.updateProgress = updateProgress; window.buildQuestionNav = buildQuestionNav;
window.selectAnswer = selectAnswer; window.togglePGK = togglePGK; window.pilihBS = pilihBS; window.saveEssay = saveEssay;
window.setupAntiCheat = setupAntiCheat; window.removeAntiCheat = removeAntiCheat; window.triggerViolation = triggerViolation; window.forceSubmit = forceSubmit; window.enterFullscreen = enterFullscreen; window.exitFullscreen = exitFullscreen;
window.getKelasOptions = getKelasOptions; window.refreshAllKelasSelects = refreshAllKelasSelects; window.togglePwField = togglePwField; window.togglePw = togglePw; window.generatePassword = generatePassword; window.generateToken = generateToken; window.syncGuruUsername = syncGuruUsername; window.syncSiswaFromNISN = syncSiswaFromNISN;
window.requestNotificationPermission = requestNotificationPermission; window.jadwalkanNotifikasiUjian = jadwalkanNotifikasiUjian;

// Render Functions (Mapping ke window agar router bisa panggil)
window.renderDataGuru = renderDataGuru; window.renderDataSiswa = renderDataSiswa; window.renderDataUjian = renderDataUjian; window.renderUjianTersedia = renderUjianTersedia; window.renderHasilSiswa = renderHasilSiswa;
window.renderBankSoalAdmin = renderBankSoalAdmin; window.renderBankSoalGuru = renderBankSoalGuru; window.renderMonitoring = renderMonitoring; window.renderLogAktivitas = renderLogAktivitas;
window.renderRekapNilai = renderRekapNilai;
window.openImportSiswa = openImportSiswa; window.openImportGuru = openImportGuru; window.prosesImportGuruFile = prosesImportGuruFile; window.prosesImportSiswaFile = prosesImportSiswaFile;
window.toggleDropdownUjian = toggleDropdownUjian;

// Init
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    document.getElementById('btn-return-exam')?.addEventListener('click', () => {
        document.getElementById('cheat-warning').classList.add('hidden');
        if (examState.ujian?.opsiAntiCurang?.fullscreen) enterFullscreen();
    });
});
// ================================================================
// FIREBASE INIT
// ================================================================
let firebaseReady = false;

try {
  // Cek apakah rtdb tersedia dari config
  if (FirebaseService?.db) {
    firebaseReady = true;
    console.log('🔥 Firebase Connected:', FirebaseService.db.toString());
  } else {
    console.warn('⚠️ Firebase RTDB not initialized - Using Local DB');
  }
} catch (e) {
  console.error('❌ Firebase init error:', e);
}


console.log('✅ ExamShield Modules Loaded Successfully — All functions bound.');
