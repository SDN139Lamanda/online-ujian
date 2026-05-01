import { DB } from './core/db.js';
import { session, selectedRole, examState, pwVisible, notifTimers, currentUjianId, uploadTargetSoalId, soalRows, bsCounter } from './core/state.js';
import { showPage, buildApp, buildNav, navigateTo, renderView, renderTabelHasil, filterHasil } from './core/router.js';
import { showToast } from './utils/toast.js';
import { openModal, closeModal } from './utils/modal.js';
import { getKelasOptions, refreshAllKelasSelects, togglePwField, togglePw, generatePassword, generateToken, syncGuruUsername, syncSiswaFromNISN } from './utils/helpers.js';
import { requestNotificationPermission, jadwalkanNotifikasiUjian } from './utils/notifications.js';
import { initApp } from './utils/init.js';

// ⚡ EXPOSURE TO GLOBAL SCOPE (Agar onclick="..." di index.html tetap berjalan)
window.session = session; window.selectedRole = selectedRole; window.examState = examState; window.pwVisible = pwVisible; window.notifTimers = notifTimers; window.currentUjianId = currentUjianId; window.uploadTargetSoalId = uploadTargetSoalId; window.soalRows = soalRows; window.bsCounter = bsCounter; window.DB = DB;
window.showPage = showPage; window.buildApp = buildApp; window.buildNav = buildNav; window.navigateTo = navigateTo; window.renderView = renderView; window.renderTabelHasil = renderTabelHasil; window.filterHasil = filterHasil;
window.showToast = showToast; window.openModal = openModal; window.closeModal = closeModal;
window.getKelasOptions = getKelasOptions; window.refreshAllKelasSelects = refreshAllKelasSelects; window.togglePwField = togglePwField; window.togglePw = togglePw; window.generatePassword = generatePassword; window.generateToken = generateToken; window.syncGuruUsername = syncGuruUsername; window.syncSiswaFromNISN = syncSiswaFromNISN;
window.requestNotificationPermission = requestNotificationPermission; window.jadwalkanNotifikasiUjian = jadwalkanNotifikasiUjian;

// ⚡ AUTO-INIT SAAT DOM READY
document.addEventListener('DOMContentLoaded', initApp);

console.log('✅ ExamShield Modules Loaded Successfully.');
