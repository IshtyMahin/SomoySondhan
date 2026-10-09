/**
 * SOMOY SONDHAN — Tailwind configuration
 * ---------------------------------------------------------------
 * Dark mode is class-based: `theme.js` puts `class="dark"` on <html>
 * before first paint, so there is no flash of the wrong theme.
 * The palette below mirrors the CSS custom properties in
 * `styles.css` — change a brand colour in both places.
 */
(function (tailwind) {
  if (!tailwind) {
    // The Tailwind CDN is unavailable (offline or blocked). The site's own
    // design system in assets/css/styles.css still renders every component.
    return;
  }
  tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f2",
          100: "#ffe0e2",
          200: "#ffc6cb",
          300: "#ff9ea7",
          400: "#fd6673",
          500: "#f5333f",
          600: "#e11d2b",
          700: "#bd1421",
          800: "#9c141f",
          900: "#811821",
          950: "#47070c",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae2",
          300: "#b0bac9",
          400: "#8593a9",
          500: "#66758e",
          600: "#515e75",
          700: "#424c5f",
          800: "#2b3342",
          900: "#1b2130",
          950: "#0e1219",
        },
      },
      fontFamily: {
        display: ["Georgia", '"Times New Roman"', "Cambria", '"Noto Serif Bengali"', "serif"],
        sans: ["system-ui", "-apple-system", '"Segoe UI"', "Roboto", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
      },
      maxWidth: {
        shell: "80rem",
        prose: "68ch",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(14,18,25,.04), 0 8px 24px -12px rgba(14,18,25,.18)",
        lift: "0 2px 4px rgba(14,18,25,.05), 0 24px 48px -24px rgba(14,18,25,.35)",
        glow: "0 0 0 1px rgba(245,51,63,.35), 0 12px 40px -12px rgba(245,51,63,.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s cubic-bezier(.22,1,.36,1) both",
        "fade-in": "fade-in .4s ease both",
        "scale-in": "scale-in .25s cubic-bezier(.22,1,.36,1) both",
        shimmer: "shimmer 1.6s infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  };
})(window.tailwind);
