function toggleScheme() {
  let theme = localStorage.getItem("theme") || "light";
  if (theme === "dark") {
    theme = "light";
  } else {
    theme = "dark";
  }
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem('theme', theme);
}
document.documentElement.setAttribute("data-theme", localStorage.getItem("theme") || "light");
