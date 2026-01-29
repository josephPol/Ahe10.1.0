// ===== MENÚ HAMBURGUESA =====
const burger = document.querySelector(".burger");
const mobileMenu = document.querySelector(".mobileMenu");

if (burger && mobileMenu) {
  burger.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
}

// ===== TEMA CLARO / OSCURO (SWITCH) =====
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  if (themeToggle) themeToggle.checked = theme === "dark";
}

if (themeToggle) {
  // 1) aplicar tema guardado al cargar
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);

  // 2) cambiar tema cuando cambias el switch
  themeToggle.addEventListener("change", () => {
    const newTheme = themeToggle.checked ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  });
} else {
  // si esta página no tiene switch, aplica el tema guardado igualmente
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
}
