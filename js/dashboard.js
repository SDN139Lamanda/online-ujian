// js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard siap digunakan!");

  // Contoh data statistik (bisa diganti dengan API/Firebase)
  const stats = {
    siswa: 120,
    guru: 15,
    ujian: 8
  };

  // Render stat cards
  document.querySelectorAll(".stat-card").forEach(card => {
    if (card.classList.contains("blue")) {
      card.querySelector(".stat-value").textContent = stats.siswa;
    } else if (card.classList.contains("green")) {
      card.querySelector(".stat-value").textContent = stats.guru;
    } else if (card.classList.contains("yellow")) {
      card.querySelector(".stat-value").textContent = stats.ujian;
    }
  });

  // Navigasi sidebar
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      console.log(`Navigasi ke: ${item.textContent}`);
    });
  });

  // Logout
  const logoutBtn = document.querySelector(".btn-danger");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});
