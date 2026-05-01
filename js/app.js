// js/app.js

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const roleTabs = document.querySelectorAll(".role-tab");

  let selectedRole = "Admin";

  // Ganti role saat tab diklik
  roleTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      roleTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      selectedRole = tab.textContent;
    });
  });

  // Proses login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username && password) {
      console.log(`Login sebagai ${selectedRole}: ${username}`);
      // Redirect sesuai role
      if (selectedRole === "Admin" || selectedRole === "Guru") {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = "exam.html";
      }
    } else {
      alert("Isi username dan password terlebih dahulu!");
    }
  });
});
