/**
 * SOMOY SONDHAN — theme controller
 * ---------------------------------------------------------------
 * Runs synchronously in <head> so the correct theme is applied
 * before first paint (no flash). Dark is the default look; a saved
 * choice always wins, otherwise the OS preference is honoured.
 */
(function () {
  var STORAGE_KEY = "ss-theme";

  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function resolve() {
    var stored = readStored();
    if (stored === "dark" || stored === "light") return stored;
    // Dark-first: only go light when the OS explicitly asks for light.
    return systemPrefersDark() ? "dark" : "light";
  }

  function apply(theme) {
    var root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0c0f15" : "#ffffff");
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("title", theme === "dark" ? "Light theme" : "Dark theme");
    }
  }

  // Apply immediately (script is placed in <head>).
  apply(resolve());

  window.SSTheme = {
    current: function () {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    },
    set: function (theme) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        /* storage unavailable — theme still applies for this page */
      }
      apply(theme);
      window.dispatchEvent(new CustomEvent("ss:themechange", { detail: { theme: theme } }));
    },
    toggle: function () {
      this.set(this.current() === "dark" ? "light" : "dark");
    },
    /** Clear the saved choice and follow the OS again. */
    reset: function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      apply(resolve());
    },
  };
})();
