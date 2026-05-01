// ⚡ Diambil dari Word: Session & Global State
export const session = { user: null, role: null, userData: null };
export const examState = {
    ujian: null, soalList: [], currentQ: 0,
    answers: {}, flagged: new Set(),
    timer: null, timeLeft: 0,
    violations: 0, maxViolations: 3
};
export let selectedRole = 'admin';
export const pwVisible = {};
export const notifTimers = [];
export let currentUjianId = null;
export let uploadTargetSoalId = null;
export let soalRows = [];
export let bsCounter = {};
