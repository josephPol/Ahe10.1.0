// ===== MENÚ HAMBURGUESA =====
const burger = document.querySelector(".burger");
const mobileMenu = document.querySelector(".mobileMenu");

if (burger && mobileMenu) {
  burger.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
}

// ===== TEMA CLARO / OSCURO =====
const themeBtn = document.querySelector(".themeBtn");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    // cambiar icono
    themeBtn.textContent = 
      document.body.classList.contains("dark") ? "☀️" : "🌙";
  });
}
