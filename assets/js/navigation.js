(() => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.getElementById(toggle?.getAttribute("aria-controls"));

  if (!toggle || !menu) {
    return;
  }

  function closeMenu({ returnFocus = false } = {}) {
    menu.classList.add("hidden");
    toggle.setAttribute("aria-expanded", "false");

    if (returnFocus) {
      toggle.focus();
    }
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeMenu();
      return;
    }

    menu.classList.remove("hidden");
    toggle.setAttribute("aria-expanded", "true");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu({ returnFocus: true });
    }
  });

  const desktopViewport = window.matchMedia("(min-width: 768px)");
  const resetMenuAtDesktop = (event) => {
    if (event.matches) {
      closeMenu();
    }
  };

  if (typeof desktopViewport.addEventListener === "function") {
    desktopViewport.addEventListener("change", resetMenuAtDesktop);
  } else {
    desktopViewport.addListener(resetMenuAtDesktop);
  }
})();
