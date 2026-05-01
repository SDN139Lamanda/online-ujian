// js/exam.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("Exam page siap!");

  const timerElement = document.getElementById("exam-timer");
  let duration = 90 * 60; // 90 menit dalam detik

  // Timer countdown
  const updateTimer = () => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    if (duration <= 0) {
      clearInterval(timerInterval);
      alert("Waktu ujian habis! Jawaban otomatis dikumpulkan.");
      // TODO: submit otomatis
    }
    duration--;
  };

  const timerInterval = setInterval(updateTimer, 1000);
  updateTimer();

  // Navigasi soal
  const qNums = document.querySelectorAll(".q-num");
  qNums.forEach(num => {
    num.addEventListener("click", () => {
      qNums.forEach(n => n.classList.remove("current"));
      num.classList.add("current");
      console.log(`Pindah ke soal nomor ${num.textContent}`);
    });
  });

  // Tombol aksi
  const saveBtn = document.querySelector(".btn-success");
  const flagBtn = document.querySelector(".btn-warn");
  const submitBtn = document.querySelector(".btn-danger");

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      console.log("Jawaban disimpan sementara.");
      alert("Jawaban disimpan!");
    });
  }

  if (flagBtn) {
    flagBtn.addEventListener("click", () => {
      const current = document.querySelector(".q-num.current");
      if (current) {
        current.classList.add("flagged");
        console.log(`Soal ${current.textContent} ditandai.`);
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      clearInterval(timerInterval);
      alert("Ujian dikumpulkan!");
      window.location.href = "dashboard.html";
    });
  }
});
